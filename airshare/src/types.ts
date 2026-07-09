// ─────────────────────────────────────────────────────────────
//  AirShare — Type definitions for KV values, R2 metadata & Env
//  Phase 1: Infrastructure & Configuration
// ─────────────────────────────────────────────────────────────

/**
 * Worker runtime bindings, declared in wrangler-airshare.jsonc.
 * `AIRSHARE_KV`  → room metadata, text/links, presence, WebRTC signaling.
 * `AIRSHARE_R2`  → fallback file blobs (≤ 25 MB) when no peer is online.
 */
export interface Env {
  AIRSHARE_KV: KVNamespace;
  AIRSHARE_R2: R2Bucket;

  // String-typed vars (Cloudflare passes all `vars` as strings).
  MAX_FILE_BYTES: string;
  PRESENCE_TTL_SECONDS: string;
  RATE_LIMIT_MAX_FAILS: string;
  RATE_LIMIT_WINDOW_SECONDS: string;
}

/** Every persisted value carries an absolute expiry (Fix A: no native KV TTL). */
export interface Expirable {
  /** Unix epoch **seconds** after which this record is considered dead. */
  expires_at: number;
}

// ── Rooms ──────────────────────────────────────────────────────

/**
 * KV key: `room:{code}` — the authoritative room descriptor.
 * Codes are 6+ uppercase alphanumeric chars (Fix D).
 */
export interface RoomRecord extends Expirable {
  code: string;
  /** Unix epoch seconds the room was created. */
  created_at: number;
  /** SHA-256 hex of the optional join PIN, or null when the room is open. */
  pin_hash: string | null;
  /** Hard cap on simultaneously-present devices; 0 = unlimited. */
  max_devices: number;
  /** Default expiry window (seconds) applied to new items posted here. */
  default_ttl_seconds: number;
  /**
   * Text/link items and file metadata live INLINE in the room record — a
   * single KV `get` reads the whole room, so hot-path reads never call
   * `KV.list` (which is capped at 1,000/day on the free plan). Presence is the
   * only sub-key (`room:{code}:presence`), a single map, also read via `get`.
   */
  items: ItemRecord[];
  files: FileRecord[];
}

/** KV key `room:{code}:presence` — one map of device_id → presence. */
export type PresenceMap = Record<string, PresenceRecord>;

// ── Presence ───────────────────────────────────────────────────

/**
 * KV key: `room:{code}:presence:{device_id}`.
 * Written on every 5-second heartbeat; considered stale once
 * `now - last_seen > PRESENCE_TTL_SECONDS`.
 */
export interface PresenceRecord {
  device_id: string;
  /** Human-friendly label shown in the live device list. */
  label: string;
  /** Unix epoch seconds of the most recent heartbeat. */
  last_seen: number;
  /** True while the tab is foregrounded (Page Visibility API). */
  foreground: boolean;
}

// ── Content items (text / links) ───────────────────────────────

export type ItemKind = 'text' | 'link';

/**
 * KV key: `room:{code}:item:{id}`.
 * User-generated text or a link, persisted with an absolute expiry.
 */
export interface ItemRecord extends Expirable {
  id: string;
  kind: ItemKind;
  /** Raw user content — rendered client-side via textContent only (no HTML). */
  content: string;
  created_at: number;
  /** device_id of the author, for attribution in the UI. */
  author: string;
}

// ── Files (R2 fallback path) ───────────────────────────────────

/**
 * KV key: `room:{code}:file:{id}` — metadata only; the blob lives in R2.
 * The KV record is written **after** the R2 upload completes, so an aborted
 * upload never leaves orphaned metadata (Final Audit edge case).
 */
export interface FileRecord extends Expirable {
  id: string;
  filename: string;
  /** MIME type reported by the client, used for Content-Disposition on download. */
  content_type: string;
  /** Byte length; enforced ≤ MAX_FILE_BYTES. */
  size: number;
  /** R2 object key — MUST follow buildR2Key() (Fix A). */
  r2_key: string;
  created_at: number;
  /** device_id of the uploader. */
  uploader: string;
}

// ── WebRTC signaling (non-trickle ICE) ─────────────────────────

export type SignalKind = 'offer' | 'answer';

/**
 * KV key: `room:{code}:signal:{to_device}`.
 * Holds a single complete SDP blob (ICE already gathered — Fix B), so the
 * whole exchange is 2 KV writes + 2 KV reads, never per-candidate polling.
 */
export interface SignalRecord extends Expirable {
  kind: SignalKind;
  /** device_id of the sender. */
  from: string;
  /** device_id of the intended recipient. */
  to: string;
  /** Complete SDP with all ICE candidates already embedded. */
  sdp: string;
  created_at: number;
}

// ── Rate limiting (Fix D: brute-force protection) ──────────────

/**
 * KV key: `ratelimit:{ip}` — sliding-ish window of failed join attempts.
 * Uses an absolute `expires_at` rather than native TTL for consistency.
 */
export interface RateLimitRecord extends Expirable {
  /** Count of failed join attempts inside the current window. */
  fails: number;
  /** Unix epoch seconds when the current window started. */
  window_start: number;
}

// ── Constants & key builders ───────────────────────────────────

export const ROOM_CODE_ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
export const ROOM_CODE_LENGTH = 6;

/** Namespaced KV key builders — single source of truth for the key scheme. */
export const kvKey = {
  room: (code: string): string => `room:${code}`,
  presence: (code: string): string => `room:${code}:presence`,
  signal: (code: string, toDevice: string): string => `room:${code}:signal:${toDevice}`,
  rateLimit: (ip: string): string => `ratelimit:${ip}`,
} as const;

/**
 * R2 object key (Fix A): `rooms/{room_code}/{expires_at}/{file_id}`.
 * Embedding `expires_at` lets the Cron reaper list objects and delete the
 * expired ones by parsing the key — without reading KV first.
 */
export function buildR2Key(roomCode: string, expiresAt: number, fileId: string): string {
  return `rooms/${roomCode}/${expiresAt}/${fileId}`;
}

/** Inverse of buildR2Key — parses an R2 key back into its parts (Cron reaper). */
export function parseR2Key(
  key: string
): { roomCode: string; expiresAt: number; fileId: string } | null {
  const m = /^rooms\/([^/]+)\/(\d+)\/([^/]+)$/.exec(key);
  if (!m || !m[1] || !m[2] || !m[3]) return null;
  return { roomCode: m[1], expiresAt: Number(m[2]), fileId: m[3] };
}
