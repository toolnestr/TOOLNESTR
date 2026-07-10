// ─────────────────────────────────────────────────────────────
//  AirShare / Dropspot — Type definitions
//
//  State lives in a per-room Durable Object (RoomDO): SQLite holds the room
//  row + items + file metadata, live WebSockets provide presence, and R2 holds
//  the file blobs. There is NO KV — presence is connection-based (zero writes)
//  and rooms are strongly consistent (no read-after-write lag to work around).
// ─────────────────────────────────────────────────────────────

import type { RoomDO } from './room-do';

/**
 * Worker + Durable Object runtime bindings (see wrangler-airshare.jsonc).
 * `ROOM`         → the RoomDO namespace (one instance per room code).
 * `AIRSHARE_R2`  → file blobs (≤ 50 MB each, 100 MB per room).
 */
export interface Env {
  ROOM: DurableObjectNamespace<RoomDO>;
  AIRSHARE_R2: R2Bucket;

  // String-typed vars (Cloudflare passes all `vars` as strings).
  MAX_FILE_BYTES: string;
  RATE_LIMIT_MAX_FAILS: string;
  RATE_LIMIT_WINDOW_SECONDS: string;
}

/** Every persisted record carries an absolute expiry (Unix epoch seconds). */
export interface Expirable {
  expires_at: number;
}

// ── Rooms ──────────────────────────────────────────────────────

/** The authoritative room descriptor (one row in the DO's SQLite `room` table). */
export interface RoomRecord extends Expirable {
  code: string;
  created_at: number;
  /** SHA-256 hex of the optional join PIN, or null when the room is open. */
  pin_hash: string | null;
  /** Hard cap on simultaneously-present devices; 0 = unlimited. */
  max_devices: number;
  /** Default expiry window (seconds) applied to new items posted here. */
  default_ttl_seconds: number;
}

/** Config passed from the router to RoomDO.initRoom() when creating a room. */
export interface RoomConfig {
  code: string;
  pin?: string | null;
  ttl_seconds?: number;
  default_ttl_seconds?: number;
  max_devices?: number;
}

/** Public room shape returned to clients (never leaks the PIN hash). */
export interface PublicRoom {
  code: string;
  created_at: number;
  expires_at: number;
  max_devices: number;
  default_ttl_seconds: number;
  has_pin: boolean;
}

// ── Presence (derived from live WebSocket attachments) ─────────

export interface PresenceRecord {
  device_id: string;
  label: string;
  /** Unix epoch seconds of the snapshot (all live sockets are "now"). */
  last_seen: number;
  /** True while the peer's tab is foregrounded (Page Visibility API). */
  foreground: boolean;
}

/** Per-socket attachment stored via ws.serializeAttachment() (hibernation-safe). */
export interface SocketAttachment {
  device_id: string;
  label: string;
  foreground: boolean;
}

// ── Content items (text / links) ───────────────────────────────

export type ItemKind = 'text' | 'link';

export interface ItemRecord extends Expirable {
  id: string;
  kind: ItemKind;
  /** Raw user content — rendered client-side via textContent only (no HTML). */
  content: string;
  created_at: number;
  /** device_id of the author, for attribution in the UI. */
  author: string;
}

// ── Files (metadata in the DO; blob in R2) ─────────────────────

export interface FileRecord extends Expirable {
  id: string;
  filename: string;
  content_type: string;
  size: number;
  /** R2 object key — MUST follow buildR2Key(). */
  r2_key: string;
  created_at: number;
  uploader: string;
}

/** File shape returned to clients — omits the internal R2 key. */
export type PublicFile = Omit<FileRecord, 'r2_key'>;

// ── Constants & key builders ───────────────────────────────────

export const ROOM_CODE_ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
export const ROOM_CODE_LENGTH = 6;

/**
 * R2 object key: `rooms/{room_code}/{expires_at}/{file_id}`.
 * Embedding `expires_at` lets any sweep parse expiry straight from the key.
 */
export function buildR2Key(roomCode: string, expiresAt: number, fileId: string): string {
  return `rooms/${roomCode}/${expiresAt}/${fileId}`;
}

/** Inverse of buildR2Key. */
export function parseR2Key(
  key: string
): { roomCode: string; expiresAt: number; fileId: string } | null {
  const m = /^rooms\/([^/]+)\/(\d+)\/([^/]+)$/.exec(key);
  if (!m || !m[1] || !m[2] || !m[3]) return null;
  return { roomCode: m[1], expiresAt: Number(m[2]), fileId: m[3] };
}
