// ─────────────────────────────────────────────────────────────
//  AirShare — IP rate limiting for room joins (Fix D)
//  Fixed-window counter of FAILED joins per IP, stored in KV.
//  Legitimate users (correct PIN / existing room) are never counted,
//  so this throttles brute-force guessing without blocking real use.
// ─────────────────────────────────────────────────────────────

import type { Env, RateLimitRecord } from './types';
import { kvKey } from './types';
import { nowSec } from './util';

export interface RateLimitConfig {
  maxFails: number;
  windowSeconds: number;
}

/**
 * Returns true when the IP has already exceeded its failed-join budget for
 * the current window. Pure read — does not record anything.
 */
export async function isRateLimited(
  env: Env,
  ip: string,
  cfg: RateLimitConfig
): Promise<boolean> {
  const rec = await env.AIRSHARE_KV.get<RateLimitRecord>(kvKey.rateLimit(ip), 'json');
  if (!rec) return false;
  const now = nowSec();
  // Window elapsed → the old count no longer applies.
  if (now - rec.window_start >= cfg.windowSeconds) return false;
  return rec.fails >= cfg.maxFails;
}

/**
 * Record one failed join attempt for this IP, opening a fresh window if the
 * previous one has elapsed. Returns the updated fail count.
 */
export async function recordFailure(
  env: Env,
  ip: string,
  cfg: RateLimitConfig
): Promise<number> {
  const now = nowSec();
  const key = kvKey.rateLimit(ip);
  const existing = await env.AIRSHARE_KV.get<RateLimitRecord>(key, 'json');

  let rec: RateLimitRecord;
  if (!existing || now - existing.window_start >= cfg.windowSeconds) {
    rec = { fails: 1, window_start: now, expires_at: now + cfg.windowSeconds };
  } else {
    rec = {
      fails: existing.fails + 1,
      window_start: existing.window_start,
      expires_at: existing.window_start + cfg.windowSeconds,
    };
  }

  // Native TTL here is safe: rate-limit records have no R2 linkage (Fix A only
  // constrains records that own an R2 object). expirationTtl min is 60s, so we
  // floor it to keep KV happy for very short windows.
  await env.AIRSHARE_KV.put(key, JSON.stringify(rec), {
    expirationTtl: Math.max(60, cfg.windowSeconds),
  });
  return rec.fails;
}
