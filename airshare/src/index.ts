// ─────────────────────────────────────────────────────────────
//  AirShare Worker — entry point & router
//  Phase 2: rooms, presence, items. File upload/download (Phase 3),
//  WebRTC signaling (Phase 4) and the Cron reaper (Phase 4) land next.
// ─────────────────────────────────────────────────────────────

import type { Env } from './types';
import { CORS_HEADERS, errorResponse } from './util';
import { createRoom, getRoom, heartbeat, addItem, deleteItem } from './rooms';
import { uploadFile, downloadFile } from './files';
import { runReaper } from './reaper';

/** Split a normalized pathname into segments (no leading/trailing slash). */
function segments(pathname: string): string[] {
  return pathname.replace(/^\/+|\/+$/g, '').split('/').filter(Boolean);
}

async function route(request: Request, env: Env): Promise<Response> {
  const url = new URL(request.url);
  const seg = segments(url.pathname);
  const method = request.method;

  // All routes live under /api/…
  if (seg[0] !== 'api') return errorResponse('not_found', 404);

  // POST /api/room
  if (seg.length === 2 && seg[1] === 'room' && method === 'POST') {
    return createRoom(request, env);
  }

  // /api/room/:code…
  if (seg.length >= 3 && seg[1] === 'room') {
    const code = decodeURIComponent(seg[2]!).toUpperCase();

    // GET /api/room/:code
    if (seg.length === 3 && method === 'GET') {
      return getRoom(request, env, code);
    }

    // POST /api/room/:code/heartbeat
    if (seg.length === 4 && seg[3] === 'heartbeat' && method === 'POST') {
      return heartbeat(request, env, code);
    }

    // POST /api/room/:code/item
    if (seg.length === 4 && seg[3] === 'item' && method === 'POST') {
      return addItem(request, env, code);
    }

    // DELETE /api/room/:code/item/:id
    if (seg.length === 5 && seg[3] === 'item' && method === 'DELETE') {
      return deleteItem(request, env, code, decodeURIComponent(seg[4]!));
    }

    // POST /api/room/:code/file  (stream upload → R2)
    if (seg.length === 4 && seg[3] === 'file' && method === 'POST') {
      return uploadFile(request, env, code);
    }

    // GET /api/room/:code/file/:id  (stream download ← R2)
    if (seg.length === 5 && seg[3] === 'file' && method === 'GET') {
      return downloadFile(request, env, code, decodeURIComponent(seg[4]!));
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
      // Never leak internals; log for observability.
      console.error('airshare_error', err);
      return errorResponse('internal_error', 500);
    }
  },

  async scheduled(_event: ScheduledController, env: Env, ctx: ExecutionContext): Promise<void> {
    // Every 15 minutes: reap expired R2 blobs + KV records (Fix A).
    ctx.waitUntil(runReaper(env));
  },
} satisfies ExportedHandler<Env>;
