// ─────────────────────────────────────────────────────────────
//  AirShare — Cron reaper (Phase 4)
//
//  Runs every 5 minutes. Two sweeps:
//   1) R2: list objects, parse expires_at straight FROM THE KEY (Fix A — no KV
//      read needed to know expiry), delete expired blobs and their KV metadata.
//   2) KV: delete expired room/item/signal records and stale presence.
//
//  Both sweeps paginate, so >1000 R2 objects / KV keys are handled correctly.
// ─────────────────────────────────────────────────────────────

import type { Env, RoomRecord, SignalRecord } from './types';
import { parseR2Key } from './types';
import { nowSec } from './util';

export interface ReaperStats {
  r2_deleted: number;
  rooms_deleted: number;
  signals_deleted: number;
  presence_deleted: number;
  scanned_r2: number;
  scanned_kv: number;
}

/** Sweep expired R2 blobs by parsing expires_at from the key (Fix A). Paginated. */
async function sweepR2(env: Env, now: number, stats: ReaperStats): Promise<void> {
  let cursor: string | undefined;
  do {
    const listing = await env.AIRSHARE_R2.list({ limit: 1000, cursor });
    for (const obj of listing.objects) {
      stats.scanned_r2++;
      const parsed = parseR2Key(obj.key);
      if (parsed && parsed.expiresAt <= now) {
        await env.AIRSHARE_R2.delete(obj.key).catch(() => {});
        stats.r2_deleted++;
      }
    }
    cursor = listing.truncated ? listing.cursor : undefined;
  } while (cursor);
}

/**
 * Sweep the KV `room:` namespace. Keys are:
 *   room:{code}            → room doc (items/files inline)  → delete if expired
 *   room:{code}:presence   → presence map                  → delete if orphaned
 *   room:{code}:signal:{to}→ signal blob                   → delete if expired
 * Runs infrequently (cron), so the one `list` here is well within budget.
 */
async function sweepKv(env: Env, now: number, stats: ReaperStats): Promise<void> {
  let cursor: string | undefined;
  do {
    const listed = await env.AIRSHARE_KV.list({ prefix: 'room:', limit: 1000, cursor });
    for (const k of listed.keys) {
      stats.scanned_kv++;
      const name = k.name;
      const parts = name.split(':'); // ['room', CODE, ...]

      if (name.includes(':signal:')) {
        const rec = await env.AIRSHARE_KV.get<SignalRecord>(name, 'json');
        if (!rec || rec.expires_at <= now) { await env.AIRSHARE_KV.delete(name); stats.signals_deleted++; }
      } else if (parts.length === 3 && parts[2] === 'presence') {
        // Orphaned presence map (its room doc is gone/expired).
        const room = await env.AIRSHARE_KV.get<RoomRecord>(`room:${parts[1]}`, 'json');
        if (!room || room.expires_at <= now) { await env.AIRSHARE_KV.delete(name); stats.presence_deleted++; }
      } else if (parts.length === 2) {
        const rec = await env.AIRSHARE_KV.get<RoomRecord>(name, 'json');
        if (!rec || rec.expires_at <= now) {
          await env.AIRSHARE_KV.delete(name);
          await env.AIRSHARE_KV.delete(`${name}:presence`).catch(() => {});
          stats.rooms_deleted++;
        }
      }
    }
    cursor = listed.list_complete ? undefined : listed.cursor;
  } while (cursor);
}

/** Entry point invoked from the Worker's scheduled() handler. */
export async function runReaper(env: Env): Promise<ReaperStats> {
  const now = nowSec();
  const stats: ReaperStats = {
    r2_deleted: 0,
    rooms_deleted: 0,
    signals_deleted: 0,
    presence_deleted: 0,
    scanned_r2: 0,
    scanned_kv: 0,
  };
  await sweepR2(env, now, stats);
  await sweepKv(env, now, stats);
  console.log('airshare_reaper', JSON.stringify(stats));
  return stats;
}
