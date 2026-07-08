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

import type {
  Env,
  RoomRecord,
  ItemRecord,
  FileRecord,
  PresenceRecord,
  SignalRecord,
} from './types';
import { kvKey, parseR2Key } from './types';
import { nowSec, envInt } from './util';

export interface ReaperStats {
  r2_deleted: number;
  file_meta_deleted: number;
  rooms_deleted: number;
  items_deleted: number;
  signals_deleted: number;
  presence_deleted: number;
  scanned_r2: number;
  scanned_kv: number;
}

/** Sweep expired R2 blobs (and their KV file metadata). Paginated. */
async function sweepR2(env: Env, now: number, stats: ReaperStats): Promise<void> {
  let cursor: string | undefined;
  do {
    const listing = await env.AIRSHARE_R2.list({ limit: 1000, cursor });
    for (const obj of listing.objects) {
      stats.scanned_r2++;
      const parsed = parseR2Key(obj.key);
      // Unparseable keys are left alone; a valid, expired key gets reaped.
      if (parsed && parsed.expiresAt <= now) {
        await env.AIRSHARE_R2.delete(obj.key).catch(() => {});
        await env.AIRSHARE_KV.delete(kvKey.file(parsed.roomCode, parsed.fileId)).catch(() => {});
        stats.r2_deleted++;
        stats.file_meta_deleted++;
      }
    }
    cursor = listing.truncated ? listing.cursor : undefined;
  } while (cursor);
}

/** Sweep expired KV records under the room: namespace. Paginated. */
async function sweepKv(env: Env, now: number, stats: ReaperStats): Promise<void> {
  const presenceTtl = envInt(env.PRESENCE_TTL_SECONDS, 15);
  let cursor: string | undefined;

  do {
    const listed = await env.AIRSHARE_KV.list({ prefix: 'room:', limit: 1000, cursor });
    for (const k of listed.keys) {
      stats.scanned_kv++;
      const name = k.name;

      if (name.includes(':presence:')) {
        const rec = await env.AIRSHARE_KV.get<PresenceRecord>(name, 'json');
        if (!rec || now - rec.last_seen > presenceTtl) {
          await env.AIRSHARE_KV.delete(name);
          stats.presence_deleted++;
        }
      } else if (name.includes(':item:')) {
        const rec = await env.AIRSHARE_KV.get<ItemRecord>(name, 'json');
        if (!rec || rec.expires_at <= now) {
          await env.AIRSHARE_KV.delete(name);
          stats.items_deleted++;
        }
      } else if (name.includes(':signal:')) {
        const rec = await env.AIRSHARE_KV.get<SignalRecord>(name, 'json');
        if (!rec || rec.expires_at <= now) {
          await env.AIRSHARE_KV.delete(name);
          stats.signals_deleted++;
        }
      } else if (name.includes(':file:')) {
        // File metadata whose blob is already gone/expired (belt-and-suspenders
        // with sweepR2, which deletes meta by parsing the R2 key).
        const rec = await env.AIRSHARE_KV.get<FileRecord>(name, 'json');
        if (!rec || rec.expires_at <= now) {
          if (rec) await env.AIRSHARE_R2.delete(rec.r2_key).catch(() => {});
          await env.AIRSHARE_KV.delete(name);
          stats.file_meta_deleted++;
        }
      } else {
        // Bare `room:{code}` descriptor.
        const rec = await env.AIRSHARE_KV.get<RoomRecord>(name, 'json');
        if (!rec || rec.expires_at <= now) {
          await env.AIRSHARE_KV.delete(name);
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
    file_meta_deleted: 0,
    rooms_deleted: 0,
    items_deleted: 0,
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
