// ─────────────────────────────────────────────────────────────
//  AirShare — Rooms, Presence & Items (Phase 2)
//  All persistence goes through KV with an in-value `expires_at`
//  (Fix A: never native TTL for room/item/file records). Reads
//  filter out expired records so users never see stale data between
//  the 5-minute Cron sweeps.
// ─────────────────────────────────────────────────────────────

import type {
  Env,
  RoomRecord,
  PresenceRecord,
  ItemRecord,
  ItemKind,
  FileRecord,
} from './types';
import { kvKey, kvPrefix } from './types';
import {
  json,
  errorResponse,
  nowSec,
  isExpired,
  clientIp,
  envInt,
  generateRoomCode,
  generateId,
  isValidRoomCode,
  sha256Hex,
  timingSafeEqual,
  readJson,
  clamp,
  LIMITS,
} from './util';
import { isRateLimited, recordFailure, type RateLimitConfig } from './ratelimit';

// ── Access control ─────────────────────────────────────────────

export type AccessResult =
  | { ok: true; room: RoomRecord }
  | { ok: false; response: Response };

function rateCfg(env: Env): RateLimitConfig {
  return {
    maxFails: envInt(env.RATE_LIMIT_MAX_FAILS, 10),
    windowSeconds: envInt(env.RATE_LIMIT_WINDOW_SECONDS, 60),
  };
}

/**
 * Load a room and verify the caller may access it. Enforces:
 *  - valid code format,
 *  - room exists and is not expired,
 *  - correct PIN when the room is protected (Fix D),
 *  - per-IP brute-force throttle on failed attempts.
 * A wrong PIN or a guess at a non-existent code counts as a failure.
 */
export async function verifyAccess(
  request: Request,
  env: Env,
  code: string
): Promise<AccessResult> {
  const ip = clientIp(request);
  const cfg = rateCfg(env);

  if (await isRateLimited(env, ip, cfg)) {
    return { ok: false, response: errorResponse('rate_limited', 429) };
  }

  if (!isValidRoomCode(code)) {
    await recordFailure(env, ip, cfg);
    return { ok: false, response: errorResponse('room_not_found', 404) };
  }

  const room = await env.AIRSHARE_KV.get<RoomRecord>(kvKey.room(code), 'json');
  if (!room || isExpired(room)) {
    await recordFailure(env, ip, cfg);
    return { ok: false, response: errorResponse('room_not_found', 404) };
  }

  if (room.pin_hash) {
    const pin = request.headers.get('X-Room-Pin') || '';
    const attempt = pin ? await sha256Hex(pin) : '';
    if (!attempt || !timingSafeEqual(attempt, room.pin_hash)) {
      await recordFailure(env, ip, cfg);
      return { ok: false, response: errorResponse('pin_required', 401) };
    }
  }

  return { ok: true, room };
}

// ── Presence helpers ───────────────────────────────────────────

/** List presence records for a room that are still "online" (within TTL). */
async function activePresence(env: Env, code: string): Promise<PresenceRecord[]> {
  const ttl = envInt(env.PRESENCE_TTL_SECONDS, 15);
  const now = nowSec();
  const listed = await env.AIRSHARE_KV.list({ prefix: kvPrefix.presence(code) });
  const out: PresenceRecord[] = [];
  for (const k of listed.keys) {
    const rec = await env.AIRSHARE_KV.get<PresenceRecord>(k.name, 'json');
    if (rec && now - rec.last_seen <= ttl) out.push(rec);
  }
  return out.sort((a, b) => a.last_seen - b.last_seen);
}

/** List non-expired items for a room. */
async function activeItems(env: Env, code: string): Promise<ItemRecord[]> {
  const now = nowSec();
  const listed = await env.AIRSHARE_KV.list({ prefix: kvPrefix.item(code) });
  const out: ItemRecord[] = [];
  for (const k of listed.keys) {
    const rec = await env.AIRSHARE_KV.get<ItemRecord>(k.name, 'json');
    if (rec && !isExpired(rec, now)) out.push(rec);
  }
  return out.sort((a, b) => b.created_at - a.created_at);
}

/** List non-expired file metadata records for a room (R2 fallback uploads). */
export async function activeFiles(env: Env, code: string): Promise<FileRecord[]> {
  const now = nowSec();
  const listed = await env.AIRSHARE_KV.list({ prefix: kvPrefix.file(code) });
  const out: FileRecord[] = [];
  for (const k of listed.keys) {
    const rec = await env.AIRSHARE_KV.get<FileRecord>(k.name, 'json');
    if (rec && !isExpired(rec, now)) out.push(rec);
  }
  return out.sort((a, b) => b.created_at - a.created_at);
}

/** Strip the PIN hash before returning a room to clients. */
function publicRoom(room: RoomRecord) {
  return {
    code: room.code,
    created_at: room.created_at,
    expires_at: room.expires_at,
    max_devices: room.max_devices,
    default_ttl_seconds: room.default_ttl_seconds,
    has_pin: room.pin_hash !== null,
  };
}

// ── POST /api/room — create a room ─────────────────────────────

interface CreateRoomBody {
  pin?: string;
  code?: string;
  max_devices?: number;
  ttl_seconds?: number; // room lifetime
  default_ttl_seconds?: number; // default expiry for items posted here
}

export async function createRoom(request: Request, env: Env): Promise<Response> {
  const body = (await readJson<CreateRoomBody>(request)) || {};
  const now = nowSec();

  const ttl = clamp(
    envInt(body.ttl_seconds as unknown as string, LIMITS.ROOM_TTL_DEFAULT),
    60,
    LIMITS.ROOM_TTL_MAX
  );
  const defaultItemTtl = clamp(
    envInt(body.default_ttl_seconds as unknown as string, LIMITS.ITEM_TTL_DEFAULT),
    60,
    LIMITS.ITEM_TTL_MAX
  );
  const maxDevices = clamp(
    envInt(body.max_devices as unknown as string, LIMITS.MAX_DEVICES_DEFAULT),
    0,
    100
  );

  // Optional custom code, else generate a guaranteed-unique one.
  let code: string;
  if (body.code != null && body.code !== '') {
    const custom = String(body.code).toUpperCase();
    if (!isValidRoomCode(custom)) {
      return errorResponse('invalid_code', 400, 'Codes are 6–12 uppercase alphanumeric chars.');
    }
    const existing = await env.AIRSHARE_KV.get(kvKey.room(custom));
    if (existing) return errorResponse('code_taken', 409);
    code = custom;
  } else {
    code = '';
    for (let attempt = 0; attempt < LIMITS.CODE_UNIQUE_RETRIES; attempt++) {
      const candidate = generateRoomCode();
      const existing = await env.AIRSHARE_KV.get(kvKey.room(candidate));
      if (!existing) {
        code = candidate;
        break;
      }
    }
    if (!code) return errorResponse('code_generation_failed', 503);
  }

  const pinHash = body.pin
    ? await sha256Hex(String(body.pin).slice(0, LIMITS.CUSTOM_PIN_MAX))
    : null;

  const room: RoomRecord = {
    code,
    created_at: now,
    expires_at: now + ttl,
    pin_hash: pinHash,
    max_devices: maxDevices,
    default_ttl_seconds: defaultItemTtl,
  };

  await env.AIRSHARE_KV.put(kvKey.room(code), JSON.stringify(room));
  return json({ room: publicRoom(room) }, 201);
}

// ── GET /api/room/:code — room state, items & presence ─────────

export async function getRoom(request: Request, env: Env, code: string): Promise<Response> {
  const access = await verifyAccess(request, env, code);
  if (!access.ok) return access.response;

  const [items, presence, files] = await Promise.all([
    activeItems(env, code),
    activePresence(env, code),
    activeFiles(env, code),
  ]);

  return json({
    room: publicRoom(access.room),
    items,
    presence,
    files,
    server_time: nowSec(),
  });
}

// ── POST /api/room/:code/heartbeat — presence ping ─────────────

interface HeartbeatBody {
  device_id?: string;
  label?: string;
  foreground?: boolean;
}

export async function heartbeat(request: Request, env: Env, code: string): Promise<Response> {
  const access = await verifyAccess(request, env, code);
  if (!access.ok) return access.response;
  const room = access.room;

  const body = await readJson<HeartbeatBody>(request);
  if (!body || !body.device_id || typeof body.device_id !== 'string') {
    return errorResponse('device_id_required', 400);
  }
  const deviceId = body.device_id.slice(0, 64);
  const now = nowSec();

  // Enforce the device cap: count distinct active devices; a device that is
  // already present may always re-ping (it isn't a new join).
  if (room.max_devices > 0) {
    const active = await activePresence(env, code);
    const alreadyHere = active.some((p) => p.device_id === deviceId);
    if (!alreadyHere && active.length >= room.max_devices) {
      return errorResponse('room_full', 403);
    }
  }

  const presence: PresenceRecord = {
    device_id: deviceId,
    label: (body.label || 'Device').slice(0, LIMITS.LABEL_MAX),
    last_seen: now,
    foreground: body.foreground !== false,
  };
  await env.AIRSHARE_KV.put(kvKey.presence(code, deviceId), JSON.stringify(presence));

  const active = await activePresence(env, code);
  return json({ ok: true, presence: active, server_time: now });
}

// ── POST /api/room/:code/item — add text / link ────────────────

interface AddItemBody {
  kind?: ItemKind;
  content?: string;
  ttl_seconds?: number;
  device_id?: string;
}

export async function addItem(request: Request, env: Env, code: string): Promise<Response> {
  const access = await verifyAccess(request, env, code);
  if (!access.ok) return access.response;
  const room = access.room;

  const body = await readJson<AddItemBody>(request);
  if (!body) return errorResponse('invalid_body', 400);

  const kind: ItemKind = body.kind === 'link' ? 'link' : 'text';
  const content = typeof body.content === 'string' ? body.content.trim() : '';
  if (!content) return errorResponse('content_required', 400);

  const max = kind === 'link' ? LIMITS.LINK_MAX : LIMITS.TEXT_MAX;
  if (content.length > max) return errorResponse('content_too_long', 413);
  if (kind === 'link' && !/^https?:\/\//i.test(content)) {
    return errorResponse('invalid_link', 400, 'Links must start with http:// or https://');
  }

  const now = nowSec();
  const ttl = clamp(
    envInt(body.ttl_seconds as unknown as string, room.default_ttl_seconds),
    60,
    LIMITS.ITEM_TTL_MAX
  );
  const item: ItemRecord = {
    id: generateId(),
    kind,
    content,
    created_at: now,
    expires_at: now + ttl,
    author: (body.device_id || 'anon').slice(0, 64),
  };

  await env.AIRSHARE_KV.put(kvKey.item(code, item.id), JSON.stringify(item));

  // Keep the room alive at least as long as its longest-lived item so items
  // never outlive their room (and the Cron reaper has consistent state).
  if (item.expires_at > room.expires_at) {
    const extended: RoomRecord = { ...room, expires_at: item.expires_at };
    await env.AIRSHARE_KV.put(kvKey.room(code), JSON.stringify(extended));
  }

  return json({ item }, 201);
}

// ── DELETE /api/room/:code/item/:id — remove an item ───────────

export async function deleteItem(
  request: Request,
  env: Env,
  code: string,
  id: string
): Promise<Response> {
  const access = await verifyAccess(request, env, code);
  if (!access.ok) return access.response;

  // Any room member may delete (spec 4.4). Deleting a missing key is a no-op.
  await env.AIRSHARE_KV.delete(kvKey.item(code, id));
  return json({ ok: true });
}
