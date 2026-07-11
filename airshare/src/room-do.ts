// ─────────────────────────────────────────────────────────────
//  Dropspot — RoomDO (Durable Object, one instance per room code)
//
//  Replaces the old KV + polling design. State lives here:
//   • SQLite tables `room`, `items`, `files` (metadata) — strongly consistent.
//   • Hibernatable WebSockets ARE the presence list — a live socket = a device
//     in the room. No heartbeat writes; connect/disconnect drive presence.
//   • R2 still stores file blobs; only their metadata rows live in SQLite.
//   • A single alarm handles expiry: it prunes expired items/files (+ their R2
//     blobs) and tears the room down when it finally expires (replaces Cron).
//
//  On every mutation we broadcast a full room snapshot (`state`) to all joined
//  sockets. Rooms are tiny (a handful of items/devices), so full snapshots keep
//  the client trivial — it just re-renders whatever it last received.
// ─────────────────────────────────────────────────────────────

import { DurableObject } from 'cloudflare:workers';
import type {
  Env,
  RoomConfig,
  PublicRoom,
  PublicFile,
  PresenceRecord,
  SocketAttachment,
} from './types';
import { buildR2Key } from './types';
import {
  nowSec,
  errorResponse,
  json,
  envInt,
  clamp,
  generateId,
  sha256Hex,
  timingSafeEqual,
  LIMITS,
} from './util';

// ── SQLite row shapes (index signature required by SqlStorage.exec<T>) ──
type Row = Record<string, SqlStorageValue>;
interface RoomRow extends Row {
  code: string;
  created_at: number;
  expires_at: number;
  pin_hash: string | null;
  max_devices: number;
  default_ttl_seconds: number;
}
interface ItemRow extends Row {
  id: string;
  kind: string;
  content: string;
  created_at: number;
  expires_at: number;
  author: string;
}
interface FileRow extends Row {
  id: string;
  filename: string;
  content_type: string;
  size: number;
  r2_key: string;
  created_at: number;
  expires_at: number;
  uploader: string;
}

export type InitResult =
  | { ok: true; room: PublicRoom }
  | { ok: false; error: string };

export class RoomDO extends DurableObject<Env> {
  // Per-room PIN brute-force throttle (in-memory; resets on eviction — fine,
  // a fresh window is no worse than the old KV window expiring).
  private failWindowStart = 0;
  private failCount = 0;

  constructor(ctx: DurableObjectState, env: Env) {
    super(ctx, env);
    ctx.blockConcurrencyWhile(async () => {
      const sql = this.ctx.storage.sql;
      sql.exec(
        `CREATE TABLE IF NOT EXISTS room (
          code TEXT PRIMARY KEY, created_at INTEGER NOT NULL, expires_at INTEGER NOT NULL,
          pin_hash TEXT, max_devices INTEGER NOT NULL, default_ttl_seconds INTEGER NOT NULL
        )`
      );
      sql.exec(
        `CREATE TABLE IF NOT EXISTS items (
          id TEXT PRIMARY KEY, kind TEXT NOT NULL, content TEXT NOT NULL,
          created_at INTEGER NOT NULL, expires_at INTEGER NOT NULL, author TEXT NOT NULL
        )`
      );
      sql.exec(
        `CREATE TABLE IF NOT EXISTS files (
          id TEXT PRIMARY KEY, filename TEXT NOT NULL, content_type TEXT NOT NULL,
          size INTEGER NOT NULL, r2_key TEXT NOT NULL, created_at INTEGER NOT NULL,
          expires_at INTEGER NOT NULL, uploader TEXT NOT NULL
        )`
      );
    });
  }

  // ── SQLite helpers ───────────────────────────────────────────
  private get sql() {
    return this.ctx.storage.sql;
  }
  private roomRow(): RoomRow | null {
    return this.sql.exec<RoomRow>('SELECT * FROM room LIMIT 1').toArray()[0] ?? null;
  }
  private liveItems(now: number): ItemRow[] {
    return this.sql
      .exec<ItemRow>('SELECT * FROM items WHERE expires_at > ? ORDER BY created_at DESC', now)
      .toArray();
  }
  private liveFiles(now: number): FileRow[] {
    return this.sql
      .exec<FileRow>('SELECT * FROM files WHERE expires_at > ? ORDER BY created_at DESC', now)
      .toArray();
  }
  private publicRoom(r: RoomRow): PublicRoom {
    return {
      code: r.code,
      created_at: r.created_at,
      expires_at: r.expires_at,
      max_devices: r.max_devices,
      default_ttl_seconds: r.default_ttl_seconds,
      has_pin: r.pin_hash !== null,
    };
  }
  private publicFile(f: FileRow): PublicFile {
    return {
      id: f.id,
      filename: f.filename,
      content_type: f.content_type,
      size: f.size,
      created_at: f.created_at,
      expires_at: f.expires_at,
      uploader: f.uploader,
    };
  }

  // ── RPC: create/initialise a room (called by the router) ─────
  async initRoom(cfg: RoomConfig): Promise<InitResult> {
    const now = nowSec();
    const existing = this.roomRow();
    if (existing && existing.expires_at > now) {
      return { ok: false, error: 'code_taken' };
    }
    // Clear any stale (expired) leftovers so a recycled code starts clean.
    this.sql.exec('DELETE FROM room');
    this.sql.exec('DELETE FROM items');
    this.sql.exec('DELETE FROM files');

    const ttl = clamp(envInt(cfg.ttl_seconds as unknown as string, LIMITS.ROOM_TTL_DEFAULT), 60, LIMITS.ROOM_TTL_MAX);
    const defTtl = clamp(envInt(cfg.default_ttl_seconds as unknown as string, LIMITS.ITEM_TTL_DEFAULT), 60, LIMITS.ITEM_TTL_MAX);
    const maxDev = clamp(envInt(cfg.max_devices as unknown as string, LIMITS.MAX_DEVICES_DEFAULT), 0, 100);
    const pinHash = cfg.pin ? await sha256Hex(String(cfg.pin).slice(0, LIMITS.CUSTOM_PIN_MAX)) : null;
    const expiresAt = now + ttl;

    this.sql.exec(
      'INSERT INTO room (code, created_at, expires_at, pin_hash, max_devices, default_ttl_seconds) VALUES (?, ?, ?, ?, ?, ?)',
      cfg.code,
      now,
      expiresAt,
      pinHash,
      maxDev,
      defTtl
    );
    await this.ctx.storage.setAlarm(expiresAt * 1000);
    return { ok: true, room: this.publicRoom(this.roomRow()!) };
  }

  // ── HTTP: WebSocket upgrade + file upload/download ───────────
  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);

    if ((request.headers.get('Upgrade') || '').toLowerCase() === 'websocket') {
      const pair = new WebSocketPair();
      const client = pair[0];
      const server = pair[1];
      // Hibernation API: the runtime can evict us between messages while the
      // socket stays open, so presence survives idle periods for free.
      this.ctx.acceptWebSocket(server);
      return new Response(null, { status: 101, webSocket: client });
    }

    const seg = url.pathname.replace(/^\/+|\/+$/g, '').split('/').filter(Boolean);
    // /api/room/:code/file  (POST upload)  •  /api/room/:code/file/:id  (GET download)
    if (seg[3] === 'file') {
      if (request.method === 'POST' && seg.length === 4) return this.uploadFile(request, url);
      if (request.method === 'GET' && seg.length === 5) return this.downloadFile(request, decodeURIComponent(seg[4]!));
    }
    return errorResponse('not_found', 404);
  }

  // ── WebSocket lifecycle (Hibernation API) ────────────────────
  async webSocketMessage(ws: WebSocket, raw: string | ArrayBuffer): Promise<void> {
    let msg: Record<string, unknown>;
    try {
      msg = JSON.parse(typeof raw === 'string' ? raw : new TextDecoder().decode(raw));
    } catch {
      return;
    }
    const type = String(msg.type || '');
    const now = nowSec();
    const room = this.roomRow();
    if (!room || room.expires_at <= now) {
      this.sendTo(ws, { type: 'error', code: 'room_not_found' });
      this.tryClose(ws, 4404, 'expired');
      return;
    }

    if (type === 'hello') {
      await this.handleHello(ws, msg, room);
      return;
    }

    // Every other message requires a socket that has already joined.
    const att = this.attachment(ws);
    if (!att) {
      this.sendTo(ws, { type: 'error', code: 'not_joined' });
      return;
    }

    if (type === 'foreground') {
      ws.serializeAttachment({ ...att, foreground: !!msg.on });
      this.broadcast();
      return;
    }
    if (type === 'item.add') {
      this.addItem(ws, msg, room, att, now);
      return;
    }
    if (type === 'delete') {
      await this.deleteById(String(msg.id || ''));
      return;
    }
  }

  async webSocketClose(ws: WebSocket): Promise<void> {
    // The socket is leaving; presence is recomputed from whoever remains.
    // NB: getWebSockets() can still include `ws` at this point, so we must
    // explicitly exclude it or the leaver would linger in the broadcast.
    this.tryClose(ws, 1000, 'bye');
    this.broadcast(ws);
  }
  async webSocketError(ws: WebSocket): Promise<void> {
    this.broadcast(ws);
  }

  private async handleHello(ws: WebSocket, msg: Record<string, unknown>, room: RoomRow): Promise<void> {
    if (room.pin_hash) {
      const pin = msg.pin ? String(msg.pin) : '';
      const attempt = pin ? await sha256Hex(pin) : '';
      if (!attempt || !timingSafeEqual(attempt, room.pin_hash)) {
        this.sendTo(ws, { type: 'error', code: this.throttle() ? 'rate_limited' : 'pin_required' });
        this.tryClose(ws, 4401, 'pin');
        return;
      }
    }
    const deviceId = (String(msg.device_id || '').slice(0, 64)) || 'anon';

    // Device cap: count DISTINCT joined devices other than this one.
    if (room.max_devices > 0) {
      const others = new Set<string>();
      for (const s of this.ctx.getWebSockets()) {
        if (s === ws) continue;
        const a = this.attachment(s);
        if (a && a.device_id) others.add(a.device_id);
      }
      if (!others.has(deviceId) && others.size >= room.max_devices) {
        this.sendTo(ws, { type: 'error', code: 'room_full' });
        this.tryClose(ws, 4403, 'full');
        return;
      }
    }

    ws.serializeAttachment({
      device_id: deviceId,
      label: String(msg.label || 'Device').slice(0, LIMITS.LABEL_MAX),
      foreground: msg.foreground !== false,
    } satisfies SocketAttachment);

    // Send this socket its snapshot, then let everyone else refresh presence.
    const st = this.buildState();
    if (st) this.sendTo(ws, { type: 'state', data: st });
    this.broadcast();
  }

  private addItem(
    ws: WebSocket,
    msg: Record<string, unknown>,
    room: RoomRow,
    att: SocketAttachment,
    now: number
  ): void {
    const kind = msg.kind === 'link' ? 'link' : 'text';
    const content = typeof msg.content === 'string' ? msg.content.trim() : '';
    if (!content) return;
    const max = kind === 'link' ? LIMITS.LINK_MAX : LIMITS.TEXT_MAX;
    if (content.length > max) {
      this.sendTo(ws, { type: 'error', code: 'content_too_long' });
      return;
    }
    if (kind === 'link' && !/^https?:\/\//i.test(content)) {
      this.sendTo(ws, { type: 'error', code: 'invalid_link' });
      return;
    }
    // The client may propose the id so its optimistic render reconciles cleanly.
    const proposed = typeof msg.id === 'string' && /^[a-z0-9]{8,64}$/i.test(msg.id) ? msg.id : generateId();

    // Items live for the room's lifetime — they carry the room's expiry, not
    // their own. The room timer is fixed at creation and never moves when
    // content is added; everything is deleted together when the room expires.
    this.sql.exec(
      'INSERT OR REPLACE INTO items (id, kind, content, created_at, expires_at, author) VALUES (?, ?, ?, ?, ?, ?)',
      proposed,
      kind,
      content,
      now,
      room.expires_at,
      att.device_id
    );
    this.broadcast();
  }

  // Removes a text/link item OR a stored file by id (deleting its R2 blob).
  private async deleteById(id: string): Promise<void> {
    if (!id) return;
    const file = this.sql.exec<FileRow>('SELECT * FROM files WHERE id = ?', id).toArray()[0];
    if (file) {
      await this.env.AIRSHARE_R2.delete(file.r2_key).catch(() => {});
      this.sql.exec('DELETE FROM files WHERE id = ?', id);
    }
    this.sql.exec('DELETE FROM items WHERE id = ?', id);
    this.broadcast();
  }

  // ── File upload/download (R2) ────────────────────────────────
  private async uploadFile(request: Request, url: URL): Promise<Response> {
    const denied = await this.accessError(request);
    if (denied) return denied;
    const room = this.roomRow()!;
    const now = nowSec();

    const filename = (url.searchParams.get('filename') || '').slice(0, 255).trim();
    if (!filename) return errorResponse('filename_required', 400);
    if (!request.body) return errorResponse('empty_body', 400);

    const maxBytes = envInt(this.env.MAX_FILE_BYTES, 52_428_800);
    const declared = Number(request.headers.get('Content-Length'));
    if (!Number.isFinite(declared) || declared <= 0) return errorResponse('length_required', 411);
    if (declared > maxBytes) return errorResponse('file_too_large', 413);

    const live = this.liveFiles(now);
    if (live.length >= LIMITS.ROOM_FILE_COUNT_MAX) {
      return errorResponse('room_file_limit', 409, `A room can hold at most ${LIMITS.ROOM_FILE_COUNT_MAX} files at once.`);
    }
    const used = live.reduce((sum, f) => sum + (f.size || 0), 0);
    if (used + declared > LIMITS.ROOM_BYTES_MAX) {
      return errorResponse('room_storage_full', 409, 'This room is out of storage — delete a file or send this one directly.');
    }

    // Files live for the room's lifetime — expiry tracks the room, not a
    // separate per-file timer. The room timer never moves on upload.
    const expiresAt = room.expires_at;
    const fileId = generateId();
    const r2Key = buildR2Key(room.code, expiresAt, fileId);
    const contentType = request.headers.get('Content-Type') || 'application/octet-stream';

    let actualSize = declared;
    try {
      const obj = await this.env.AIRSHARE_R2.put(r2Key, request.body, {
        httpMetadata: { contentType },
        customMetadata: { room: room.code, fileId, filename },
      });
      if (obj && typeof obj.size === 'number') actualSize = obj.size;
    } catch (err) {
      await this.env.AIRSHARE_R2.delete(r2Key).catch(() => {});
      console.error('dropspot_upload_failed', err);
      return errorResponse('upload_failed', 500);
    }

    const uploader = (url.searchParams.get('device_id') || 'anon').slice(0, 64);
    this.sql.exec(
      'INSERT INTO files (id, filename, content_type, size, r2_key, created_at, expires_at, uploader) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      fileId,
      filename,
      contentType,
      actualSize,
      r2Key,
      now,
      expiresAt,
      uploader
    );
    this.broadcast();

    const record: FileRow = {
      id: fileId,
      filename,
      content_type: contentType,
      size: actualSize,
      r2_key: r2Key,
      created_at: now,
      expires_at: expiresAt,
      uploader,
    };
    return json({ file: this.publicFile(record) }, 201);
  }

  private async downloadFile(request: Request, id: string): Promise<Response> {
    const denied = await this.accessError(request);
    if (denied) return denied;
    const now = nowSec();
    const rec = this.sql.exec<FileRow>('SELECT * FROM files WHERE id = ?', id).toArray()[0];
    if (!rec || rec.expires_at <= now) return errorResponse('file_not_found', 404);

    const obj = await this.env.AIRSHARE_R2.get(rec.r2_key);
    if (!obj) return errorResponse('file_gone', 404);

    const asciiName = rec.filename.replace(/[^\x20-\x7E]/g, '_').replace(/["\\]/g, '_');
    const utf8Name = encodeURIComponent(rec.filename);
    const disposition = `attachment; filename="${asciiName}"; filename*=UTF-8''${utf8Name}`;

    return new Response(obj.body, {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': rec.content_type || 'application/octet-stream',
        'Content-Length': String(rec.size),
        'Content-Disposition': disposition,
        'Cache-Control': 'no-store',
      },
    });
  }

  /** Verify the room exists, isn't expired, and the PIN (if any) matches. */
  private async accessError(request: Request): Promise<Response | null> {
    const now = nowSec();
    const r = this.roomRow();
    if (!r || r.expires_at <= now) return errorResponse('room_not_found', 404);
    if (r.pin_hash) {
      const pin = request.headers.get('X-Room-Pin') || '';
      const attempt = pin ? await sha256Hex(pin) : '';
      if (!attempt || !timingSafeEqual(attempt, r.pin_hash)) return errorResponse('pin_required', 401);
    }
    return null;
  }

  // ── Alarm: prune expired content, tear down on room expiry ───
  async alarm(): Promise<void> {
    const now = nowSec();
    const room = this.roomRow();

    if (!room || room.expires_at <= now) {
      // Room is gone: delete every blob, clear storage, close every socket.
      for (const f of this.sql.exec<FileRow>('SELECT * FROM files').toArray()) {
        await this.env.AIRSHARE_R2.delete(f.r2_key).catch(() => {});
      }
      const closed = JSON.stringify({ type: 'closed', reason: 'expired' });
      for (const ws of this.ctx.getWebSockets()) {
        this.rawSend(ws, closed);
        this.tryClose(ws, 4410, 'expired');
      }
      this.sql.exec('DELETE FROM room');
      this.sql.exec('DELETE FROM items');
      this.sql.exec('DELETE FROM files');
      await this.ctx.storage.deleteAlarm();
      console.log('dropspot_room_expired', JSON.stringify({ code: room ? room.code : null }));
      return;
    }

    // Prune only what has expired, then push the fresh snapshot.
    for (const f of this.sql.exec<FileRow>('SELECT * FROM files WHERE expires_at <= ?', now).toArray()) {
      await this.env.AIRSHARE_R2.delete(f.r2_key).catch(() => {});
    }
    this.sql.exec('DELETE FROM files WHERE expires_at <= ?', now);
    this.sql.exec('DELETE FROM items WHERE expires_at <= ?', now);
    this.broadcast();
    await this.scheduleAlarm();
  }

  /** (Re)schedule the alarm to the soonest future expiry (room / item / file). */
  private async scheduleAlarm(): Promise<void> {
    const now = nowSec();
    const r = this.roomRow();
    if (!r) return;
    let soonest = r.expires_at;
    const im = this.sql.exec<Row>('SELECT MIN(expires_at) AS e FROM items WHERE expires_at > ?', now).toArray()[0];
    const fm = this.sql.exec<Row>('SELECT MIN(expires_at) AS e FROM files WHERE expires_at > ?', now).toArray()[0];
    if (im && typeof im.e === 'number') soonest = Math.min(soonest, im.e);
    if (fm && typeof fm.e === 'number') soonest = Math.min(soonest, fm.e);
    await this.ctx.storage.setAlarm(Math.max(now + 1, soonest) * 1000);
  }

  // ── Presence + broadcast ─────────────────────────────────────
  private attachment(ws: WebSocket): SocketAttachment | null {
    try {
      return (ws.deserializeAttachment() as SocketAttachment | null) ?? null;
    } catch {
      return null;
    }
  }
  private presence(now: number, exclude?: WebSocket): PresenceRecord[] {
    const seen = new Map<string, PresenceRecord>();
    for (const ws of this.ctx.getWebSockets()) {
      if (ws === exclude) continue;
      const a = this.attachment(ws);
      if (!a || !a.device_id) continue;
      seen.set(a.device_id, { device_id: a.device_id, label: a.label, last_seen: now, foreground: a.foreground });
    }
    return [...seen.values()];
  }
  private buildState(exclude?: WebSocket) {
    const now = nowSec();
    const r = this.roomRow();
    if (!r) return null;
    const items = this.liveItems(now);
    const files = this.liveFiles(now);
    const storage = {
      used: files.reduce((sum, f) => sum + (f.size || 0), 0),
      max: LIMITS.ROOM_BYTES_MAX,
      file_max: envInt(this.env.MAX_FILE_BYTES, 52_428_800),
      file_count: files.length,
      file_count_max: LIMITS.ROOM_FILE_COUNT_MAX,
    };
    return {
      room: this.publicRoom(r),
      items,
      files: files.map((f) => this.publicFile(f)),
      presence: this.presence(now, exclude),
      storage,
      server_time: now,
    };
  }
  // `exclude` is the socket currently closing — it can still appear in
  // getWebSockets(), so we drop it from both the snapshot and the send list.
  private broadcast(exclude?: WebSocket): void {
    const st = this.buildState(exclude);
    if (!st) return;
    const payload = JSON.stringify({ type: 'state', data: st });
    for (const ws of this.ctx.getWebSockets()) {
      if (ws === exclude) continue;
      if (!this.attachment(ws)) continue; // skip sockets that haven't joined yet
      this.rawSend(ws, payload);
    }
  }

  // ── Small socket utilities ───────────────────────────────────
  private sendTo(ws: WebSocket, obj: unknown): void {
    this.rawSend(ws, JSON.stringify(obj));
  }
  private rawSend(ws: WebSocket, payload: string): void {
    try {
      ws.send(payload);
    } catch {
      /* socket already closing */
    }
  }
  private tryClose(ws: WebSocket, code: number, reason: string): void {
    try {
      ws.close(code, reason);
    } catch {
      /* already closed */
    }
  }

  /** Fixed-window failed-PIN counter for this room. Returns true once tripped. */
  private throttle(): boolean {
    const now = nowSec();
    const win = envInt(this.env.RATE_LIMIT_WINDOW_SECONDS, 60);
    const max = envInt(this.env.RATE_LIMIT_MAX_FAILS, 10);
    if (now - this.failWindowStart >= win) {
      this.failWindowStart = now;
      this.failCount = 0;
    }
    this.failCount++;
    return this.failCount > max;
  }
}
