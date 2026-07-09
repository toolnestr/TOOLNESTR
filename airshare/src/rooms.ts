// ─────────────────────────────────────────────────────────────
//  AirShare — Rooms, Presence & Items
//
//  KV free-plan limits `KV.list` to 1,000 ops/day, so the hot path must
//  NEVER list. Instead:
//   • items + file metadata live INLINE in the room record (`room:{code}`)
//     → reading a room is one `get`.
//   • presence is a single map at `room:{code}:presence` → one `get`.
//   • signals stay as `room:{code}:signal:{to}` (get/put, no list).
//  Reads (100k/day) and writes (1k/day) are the budgets; lists are avoided.
// ─────────────────────────────────────────────────────────────

import type {
  Env,
  RoomRecord,
  PresenceRecord,
  PresenceMap,
  ItemRecord,
  ItemKind,
  FileRecord,
} from './types';
import { kvKey } from './types';
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

/** Load + normalize a room record (guarantees items/files arrays exist). */
async function loadRoom(env: Env, code: string): Promise<RoomRecord | null> {
  const room = await env.AIRSHARE_KV.get<RoomRecord>(kvKey.room(code), 'json');
  if (!room) return null;
  if (!Array.isArray(room.items)) room.items = [];
  if (!Array.isArray(room.files)) room.files = [];
  return room;
}

/**
 * Load a room and verify the caller may access it (valid code, exists, not
 * expired, correct PIN), with a per-IP brute-force throttle. A wrong PIN counts
 * as a failure; a plain "not found" does NOT (so legitimate joins that race KV
 * propagation aren't penalised — the 6-char code space makes enumeration moot).
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
    return { ok: false, response: errorResponse('room_not_found', 404) };
  }

  const room = await loadRoom(env, code);
  if (!room || isExpired(room)) {
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

// ── Presence (single map key, no list) ─────────────────────────

async function getPresence(env: Env, code: string): Promise<PresenceMap> {
  return (await env.AIRSHARE_KV.get<PresenceMap>(kvKey.presence(code), 'json')) || {};
}
function activePresence(map: PresenceMap, ttl: number, now: number): PresenceRecord[] {
  return Object.values(map)
    .filter((p) => now - p.last_seen <= ttl)
    .sort((a, b) => a.last_seen - b.last_seen);
}

/** Strip the PIN hash + inline arrays before returning room meta to clients. */
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

/** Append a file record to a room doc (used by the R2 upload handler). */
export async function appendFileToRoom(env: Env, room: RoomRecord, file: FileRecord): Promise<void> {
  const now = nowSec();
  const files = (room.files || []).filter((f) => !isExpired(f, now));
  files.push(file);
  const updated: RoomRecord = {
    ...room,
    files,
    expires_at: Math.max(room.expires_at, file.expires_at),
  };
  await env.AIRSHARE_KV.put(kvKey.room(room.code), JSON.stringify(updated));
}
export { loadRoom };

// ── POST /api/room — create a room ─────────────────────────────

interface CreateRoomBody {
  pin?: string;
  code?: string;
  max_devices?: number;
  ttl_seconds?: number;
  default_ttl_seconds?: number;
}

export async function createRoom(request: Request, env: Env): Promise<Response> {
  const body = (await readJson<CreateRoomBody>(request)) || {};
  const now = nowSec();

  const ttl = clamp(envInt(body.ttl_seconds as unknown as string, LIMITS.ROOM_TTL_DEFAULT), 60, LIMITS.ROOM_TTL_MAX);
  const defaultItemTtl = clamp(envInt(body.default_ttl_seconds as unknown as string, LIMITS.ITEM_TTL_DEFAULT), 60, LIMITS.ITEM_TTL_MAX);
  const maxDevices = clamp(envInt(body.max_devices as unknown as string, LIMITS.MAX_DEVICES_DEFAULT), 0, 100);

  let code: string;
  if (body.code != null && body.code !== '') {
    const custom = String(body.code).toUpperCase();
    if (!isValidRoomCode(custom)) {
      return errorResponse('invalid_code', 400, 'Codes are 6–12 uppercase alphanumeric chars.');
    }
    if (await env.AIRSHARE_KV.get(kvKey.room(custom))) return errorResponse('code_taken', 409);
    code = custom;
  } else {
    code = '';
    for (let attempt = 0; attempt < LIMITS.CODE_UNIQUE_RETRIES; attempt++) {
      const candidate = generateRoomCode();
      if (!(await env.AIRSHARE_KV.get(kvKey.room(candidate)))) { code = candidate; break; }
    }
    if (!code) return errorResponse('code_generation_failed', 503);
  }

  const pinHash = body.pin ? await sha256Hex(String(body.pin).slice(0, LIMITS.CUSTOM_PIN_MAX)) : null;

  const room: RoomRecord = {
    code,
    created_at: now,
    expires_at: now + ttl,
    pin_hash: pinHash,
    max_devices: maxDevices,
    default_ttl_seconds: defaultItemTtl,
    items: [],
    files: [],
  };

  await env.AIRSHARE_KV.put(kvKey.room(code), JSON.stringify(room));
  return json({ room: publicRoom(room) }, 201);
}

// ── GET /api/room/:code — room state (1 get room + 1 get presence) ──

export async function getRoom(request: Request, env: Env, code: string): Promise<Response> {
  const access = await verifyAccess(request, env, code);
  if (!access.ok) return access.response;
  const room = access.room;
  const now = nowSec();
  const ttl = envInt(env.PRESENCE_TTL_SECONDS, 15);

  const items = (room.items || []).filter((i) => !isExpired(i, now)).sort((a, b) => b.created_at - a.created_at);
  const files = (room.files || []).filter((f) => !isExpired(f, now)).sort((a, b) => b.created_at - a.created_at);
  const presence = activePresence(await getPresence(env, code), ttl, now);

  // Storage budget so the client can render an accurate capacity bar and know
  // the per-file / per-room limits without hardcoding them.
  const storage = {
    used: files.reduce((sum, f) => sum + (f.size || 0), 0),
    max: LIMITS.ROOM_BYTES_MAX,
    file_max: envInt(env.MAX_FILE_BYTES, 52_428_800),
    file_count: files.length,
    file_count_max: LIMITS.ROOM_FILE_COUNT_MAX,
  };

  return json({ room: publicRoom(room), items, files, presence, storage, server_time: now });
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
  const ttl = envInt(env.PRESENCE_TTL_SECONDS, 15);

  const map = await getPresence(env, code);
  // Prune long-dead entries so the map can't grow unbounded.
  for (const id of Object.keys(map)) {
    const p = map[id];
    if (!p || now - p.last_seen > ttl * 6) delete map[id];
  }

  // Device cap (a device already present may always re-ping).
  if (room.max_devices > 0) {
    const here = map[deviceId] && now - map[deviceId]!.last_seen <= ttl;
    const others = Object.values(map).filter((p) => p.device_id !== deviceId && now - p.last_seen <= ttl).length;
    if (!here && others >= room.max_devices) return errorResponse('room_full', 403);
  }

  map[deviceId] = {
    device_id: deviceId,
    label: (body.label || 'Device').slice(0, LIMITS.LABEL_MAX),
    last_seen: now,
    foreground: body.foreground !== false,
  };
  await env.AIRSHARE_KV.put(kvKey.presence(code), JSON.stringify(map));

  return json({ ok: true, presence: activePresence(map, ttl, now), server_time: now });
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
  const ttl = clamp(envInt(body.ttl_seconds as unknown as string, room.default_ttl_seconds), 60, LIMITS.ITEM_TTL_MAX);
  const item: ItemRecord = {
    id: generateId(),
    kind,
    content,
    created_at: now,
    expires_at: now + ttl,
    author: (body.device_id || 'anon').slice(0, 64),
  };

  // Append to the room doc (drop expired items while we're writing it).
  const items = (room.items || []).filter((i) => !isExpired(i, now));
  items.push(item);
  const updated: RoomRecord = { ...room, items, expires_at: Math.max(room.expires_at, item.expires_at) };
  await env.AIRSHARE_KV.put(kvKey.room(code), JSON.stringify(updated));

  return json({ item }, 201);
}

// ── DELETE /api/room/:code/item/:id — remove an item or file ───

export async function deleteItem(request: Request, env: Env, code: string, id: string): Promise<Response> {
  const access = await verifyAccess(request, env, code);
  if (!access.ok) return access.response;
  const room = access.room;

  const items = (room.items || []).filter((i) => i.id !== id);
  const files = (room.files || []).filter((f) => f.id !== id);
  const changed = items.length !== (room.items || []).length || files.length !== (room.files || []).length;

  if (changed) {
    const removedFile = (room.files || []).find((f) => f.id === id);
    if (removedFile) await env.AIRSHARE_R2.delete(removedFile.r2_key).catch(() => {});
    await env.AIRSHARE_KV.put(kvKey.room(code), JSON.stringify({ ...room, items, files }));
  }
  return json({ ok: true });
}
