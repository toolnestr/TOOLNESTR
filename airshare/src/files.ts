// ─────────────────────────────────────────────────────────────
//  AirShare — File handling & R2 fallback (Phase 3)
//
//  Upload path (no peer online): the client POSTs raw bytes; we stream
//  them straight into R2 without buffering the whole file in Worker
//  memory. KV metadata is written ONLY after the R2 put succeeds, so an
//  aborted/oversized upload never leaves orphaned metadata (Fix A, and
//  the "sender closes tab mid-upload" edge case from the final audit).
//
//  R2 key = rooms/{code}/{expires_at}/{file_id}  (Fix A: the Cron reaper
//  parses expires_at straight from the key).
// ─────────────────────────────────────────────────────────────

import type { Env, FileRecord, RoomRecord } from './types';
import { buildR2Key } from './types';
import { json, errorResponse, nowSec, isExpired, envInt, generateId, clamp, LIMITS } from './util';
import { verifyAccess, appendFileToRoom, loadRoom } from './rooms';

// ── POST /api/room/:code/file — stream upload to R2 ────────────
//
// Query: ?filename=<url-encoded>&ttl=<seconds>&device_id=<id>
// Body:  raw file bytes; request Content-Type is stored as the file's MIME.
//
// The cap is enforced from Content-Length up front (413), then request.body is
// streamed straight to R2 — it has a known length, so nothing is buffered in
// Worker memory. The Workers runtime guarantees the body matches Content-Length,
// so a client cannot smuggle more bytes than it declared.
export async function uploadFile(request: Request, env: Env, code: string): Promise<Response> {
  const access = await verifyAccess(request, env, code);
  if (!access.ok) return access.response;
  const room: RoomRecord = access.room;

  const url = new URL(request.url);
  const filename = (url.searchParams.get('filename') || '').slice(0, 255).trim();
  if (!filename) return errorResponse('filename_required', 400);
  if (!request.body) return errorResponse('empty_body', 400);

  const maxBytes = envInt(env.MAX_FILE_BYTES, 52_428_800); // 50 MB per-file cap

  // R2 needs a known length; require Content-Length and enforce the cap on it.
  const declared = Number(request.headers.get('Content-Length'));
  if (!Number.isFinite(declared) || declared <= 0) {
    return errorResponse('length_required', 411);
  }
  if (declared > maxBytes) return errorResponse('file_too_large', 413);

  const now = nowSec();

  // Per-room storage guard: bound how much any single room can hold so no room
  // (or abuser) can eat the shared R2 free-tier budget. Checked against the
  // declared length BEFORE the R2 put, so we never store then reject.
  const liveFiles = (room.files || []).filter((f) => !isExpired(f, now));
  if (liveFiles.length >= LIMITS.ROOM_FILE_COUNT_MAX) {
    return errorResponse('room_file_limit', 409, `A room can hold at most ${LIMITS.ROOM_FILE_COUNT_MAX} files at once.`);
  }
  const usedBytes = liveFiles.reduce((sum, f) => sum + (f.size || 0), 0);
  if (usedBytes + declared > LIMITS.ROOM_BYTES_MAX) {
    return errorResponse('room_storage_full', 409, 'This room is out of storage — delete a file or send this one directly.');
  }

  // Stored files are transient transfer artifacts: cap their lifetime SHORT and
  // independent of the room TTL, so concurrent R2 usage tracks the hourly upload
  // rate rather than a whole day of accumulation (keeps well within R2's 10 GB).
  const ttl = clamp(
    envInt(url.searchParams.get('ttl') || undefined, LIMITS.FILE_TTL_DEFAULT),
    60,
    LIMITS.FILE_TTL_MAX
  );
  const expiresAt = now + ttl;
  const fileId = generateId();
  const r2Key = buildR2Key(code, expiresAt, fileId);
  const contentType = request.headers.get('Content-Type') || 'application/octet-stream';

  let actualSize = declared;
  try {
    const obj = await env.AIRSHARE_R2.put(r2Key, request.body, {
      httpMetadata: { contentType },
      customMetadata: { room: code, fileId, filename },
    });
    // R2 reports the authoritative stored size.
    if (obj && typeof obj.size === 'number') actualSize = obj.size;
  } catch (err) {
    // Aborted mid-stream → ensure no partial object lingers (no-orphan).
    await env.AIRSHARE_R2.delete(r2Key).catch(() => {});
    console.error('airshare_upload_failed', err);
    return errorResponse('upload_failed', 500);
  }

  // Only now — after a successful put — record metadata in the room doc
  // (no orphans; also extends the room to outlive the file).
  const record: FileRecord = {
    id: fileId,
    filename,
    content_type: contentType,
    size: actualSize,
    r2_key: r2Key,
    created_at: now,
    expires_at: expiresAt,
    uploader: (url.searchParams.get('device_id') || 'anon').slice(0, 64),
  };
  await appendFileToRoom(env, room, record);

  return json({ file: record }, 201);
}

// ── GET /api/room/:code/file/:id — stream download from R2 ──────
export async function downloadFile(
  request: Request,
  env: Env,
  code: string,
  id: string
): Promise<Response> {
  const access = await verifyAccess(request, env, code);
  if (!access.ok) return access.response;

  const room = access.room.code === code ? access.room : await loadRoom(env, code);
  const record = room && (room.files || []).find((f) => f.id === id);
  if (!record || isExpired(record)) return errorResponse('file_not_found', 404);

  const obj = await env.AIRSHARE_R2.get(record.r2_key);
  if (!obj) return errorResponse('file_gone', 404);

  // RFC 5987: ASCII fallback + UTF-8 filename* so non-ASCII names survive.
  const asciiName = record.filename.replace(/[^\x20-\x7E]/g, '_').replace(/["\\]/g, '_');
  const utf8Name = encodeURIComponent(record.filename);
  const disposition = `attachment; filename="${asciiName}"; filename*=UTF-8''${utf8Name}`;

  return new Response(obj.body, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Content-Type': record.content_type || 'application/octet-stream',
      'Content-Length': String(record.size),
      'Content-Disposition': disposition,
      'Cache-Control': 'no-store',
    },
  });
}
