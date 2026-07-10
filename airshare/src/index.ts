// ─────────────────────────────────────────────────────────────
//  Dropspot Worker — thin router in front of the RoomDO
//
//  There is no KV and no Cron. The Worker only:
//   • POST /api/room            → pick a code, initialise a RoomDO (RPC)
//   • /api/room/:code/ws        → forward the WebSocket upgrade to that room's DO
//   • /api/room/:code/file[...] → forward file upload/download to the DO (R2)
//  All room state, presence and expiry live inside the Durable Object.
// ─────────────────────────────────────────────────────────────

import type { Env, RoomConfig } from './types';
import { RoomDO } from './room-do';
import {
  CORS_HEADERS,
  json,
  errorResponse,
  readJson,
  isValidRoomCode,
  generateRoomCode,
  LIMITS,
} from './util';

export { RoomDO };

/** Split a normalized pathname into segments (no leading/trailing slash). */
function segments(pathname: string): string[] {
  return pathname.replace(/^\/+|\/+$/g, '').split('/').filter(Boolean);
}

interface CreateRoomBody {
  pin?: string;
  code?: string;
  max_devices?: number;
  ttl_seconds?: number;
  default_ttl_seconds?: number;
}

// POST /api/room — pick a code and initialise its Durable Object.
async function createRoom(request: Request, env: Env): Promise<Response> {
  const body = (await readJson<CreateRoomBody>(request)) || {};
  const cfg: Omit<RoomConfig, 'code'> = {
    pin: body.pin || null,
    ttl_seconds: body.ttl_seconds,
    default_ttl_seconds: body.default_ttl_seconds,
    max_devices: body.max_devices,
  };

  // Custom code path.
  if (body.code != null && body.code !== '') {
    const custom = String(body.code).toUpperCase();
    if (!isValidRoomCode(custom)) {
      return errorResponse('invalid_code', 400, 'Codes are 6–12 uppercase alphanumeric chars.');
    }
    const res = await env.ROOM.getByName(custom).initRoom({ ...cfg, code: custom });
    if (!res.ok) return errorResponse(res.error, 409);
    return json({ room: res.room }, 201);
  }

  // Random code with a few collision retries (each code maps to its own DO,
  // and initRoom is atomic within that DO — so this is race-free).
  for (let attempt = 0; attempt < LIMITS.CODE_UNIQUE_RETRIES; attempt++) {
    const candidate = generateRoomCode();
    const res = await env.ROOM.getByName(candidate).initRoom({ ...cfg, code: candidate });
    if (res.ok) return json({ room: res.room }, 201);
  }
  return errorResponse('code_generation_failed', 503);
}

async function route(request: Request, env: Env): Promise<Response> {
  const url = new URL(request.url);
  const seg = segments(url.pathname);
  const method = request.method;

  if (seg[0] !== 'api') return errorResponse('not_found', 404);

  // POST /api/room
  if (seg.length === 2 && seg[1] === 'room' && method === 'POST') {
    return createRoom(request, env);
  }

  // /api/room/:code/…  → forward to the room's Durable Object.
  if (seg.length >= 4 && seg[1] === 'room') {
    const code = decodeURIComponent(seg[2]!).toUpperCase();
    if (!isValidRoomCode(code)) return errorResponse('room_not_found', 404);
    const tail = seg[3];
    // ws (upgrade), or file upload/download — the DO owns all of these.
    if (tail === 'ws' || tail === 'file') {
      return env.ROOM.getByName(code).fetch(request);
    }
  }

  return errorResponse('not_found', 404);
}

export default {
  async fetch(request: Request, env: Env, _ctx: ExecutionContext): Promise<Response> {
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: CORS_HEADERS });
    }
    try {
      return await route(request, env);
    } catch (err) {
      console.error('dropspot_error', err);
      return errorResponse('internal_error', 500);
    }
  },
} satisfies ExportedHandler<Env>;
