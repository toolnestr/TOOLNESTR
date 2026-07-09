// ─────────────────────────────────────────────────────────────
//  AirShare — shared helpers (responses, ids, hashing, env parsing)
// ─────────────────────────────────────────────────────────────

import { ROOM_CODE_ALPHABET, ROOM_CODE_LENGTH } from './types';

export const CORS_HEADERS: Record<string, string> = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, X-Room-Pin',
  'Access-Control-Max-Age': '86400',
};

/** JSON response with CORS headers applied. */
export function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
  });
}

/** Uniform error envelope: `{ error: <code> }` with optional detail. */
export function errorResponse(code: string, status: number, detail?: string): Response {
  return json(detail ? { error: code, detail } : { error: code }, status);
}

/** Current time as Unix epoch **seconds**. */
export function nowSec(): number {
  return Math.floor(Date.now() / 1000);
}

/** True once a record with an `expires_at` (seconds) has passed. */
export function isExpired(rec: { expires_at: number }, now: number = nowSec()): boolean {
  return rec.expires_at <= now;
}

/** Cloudflare gives the real client IP here; fall back to a stable sentinel. */
export function clientIp(request: Request): string {
  return request.headers.get('CF-Connecting-IP') || 'unknown';
}

/** Parse a numeric env var (Cloudflare passes vars as strings) with a fallback. */
export function envInt(value: string | undefined, fallback: number): number {
  const n = Number(value);
  return Number.isFinite(n) && n >= 0 ? n : fallback;
}

/**
 * Cryptographically-random room code (Fix D).
 * Uses rejection sampling so the 36-char alphabet is unbiased.
 */
export function generateRoomCode(length: number = ROOM_CODE_LENGTH): string {
  const bytes = new Uint8Array(length);
  crypto.getRandomValues(bytes);
  const n = ROOM_CODE_ALPHABET.length; // 36
  const limit = 256 - (256 % n); // largest multiple of n ≤ 256 → reject above
  let out = '';
  let i = 0;
  while (out.length < length) {
    if (i >= bytes.length) {
      crypto.getRandomValues(bytes);
      i = 0;
    }
    const b = bytes[i++]!;
    if (b < limit) out += ROOM_CODE_ALPHABET[b % n];
  }
  return out;
}

/** Random opaque id for items/files (URL-safe). */
export function generateId(): string {
  return crypto.randomUUID().replace(/-/g, '');
}

/** Validate a room code: 6+ chars, uppercase alphanumeric only (Fix D). */
export function isValidRoomCode(code: string): boolean {
  return typeof code === 'string' && /^[A-Z0-9]{6,12}$/.test(code);
}

/** SHA-256 hex digest — used to store PINs without keeping the plaintext. */
export async function sha256Hex(input: string): Promise<string> {
  const data = new TextEncoder().encode(input);
  const digest = await crypto.subtle.digest('SHA-256', data);
  return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

/** Constant-time-ish string compare for hashed secrets (both are hex of equal len). */
export function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

/** Safely parse a JSON request body; returns null on any failure. */
export async function readJson<T>(request: Request): Promise<T | null> {
  try {
    return (await request.json()) as T;
  } catch {
    return null;
  }
}

/** Clamp a number into [min, max]. */
export function clamp(n: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, n));
}

// ── Content limits (shared by validators) ─────────────────────
export const LIMITS = {
  TEXT_MAX: 10_000, // chars for a text item
  LINK_MAX: 2_048, // chars for a link item
  LABEL_MAX: 40, // chars for a device label
  ROOM_TTL_DEFAULT: 3_600, // 1h room lifetime
  ROOM_TTL_MAX: 28_800, // 8h hard cap
  ITEM_TTL_DEFAULT: 3_600, // 1h default item expiry
  ITEM_TTL_MAX: 28_800, // 8h hard cap (can't outlive the room cap)
  FILE_TTL_DEFAULT: 3_600, // 1h — stored files are transient transfer artifacts
  FILE_TTL_MAX: 7_200, // 2h hard cap on stored files (bounds R2 dwell time)
  ROOM_FILE_COUNT_MAX: 30, // max concurrent stored files per room
  ROOM_BYTES_MAX: 104_857_600, // 100 MB total stored per room
  MAX_DEVICES_DEFAULT: 0, // 0 = unlimited
  CODE_UNIQUE_RETRIES: 6, // attempts to find a free room code
  CUSTOM_PIN_MAX: 32,
} as const;
