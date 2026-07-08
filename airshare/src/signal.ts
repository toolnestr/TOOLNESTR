// ─────────────────────────────────────────────────────────────
//  AirShare — WebRTC signaling over KV (Phase 4)
//
//  Fix B: NON-TRICKLE ICE. The browser gathers ALL ICE candidates before
//  sending, so each side transmits exactly one complete SDP blob. That makes
//  the whole handshake 2 KV writes (offer+answer) + 2 KV reads — no
//  per-candidate polling that would burn through KV read limits.
//
//  We actively REJECT trickle-style payloads (a bare RTCIceCandidate) so a
//  mis-implemented client can't fall back to per-candidate signaling.
//
//  KV key: room:{code}:signal:{to_device} — one pending blob per recipient.
// ─────────────────────────────────────────────────────────────

import type { Env, SignalRecord, SignalKind } from './types';
import { kvKey } from './types';
import { json, errorResponse, nowSec, isExpired, readJson } from './util';
import { verifyAccess } from './rooms';

/** How long an unconsumed offer/answer stays valid. */
const SIGNAL_TTL_SECONDS = 120;

interface SignalBody {
  kind?: SignalKind;
  from?: string;
  to?: string;
  sdp?: string;
  // Trickle-ICE shapes we explicitly refuse:
  candidate?: unknown;
  sdpMid?: unknown;
  sdpMLineIndex?: unknown;
}

// ── POST /api/room/:code/signal — publish a complete offer/answer ──
export async function postSignal(request: Request, env: Env, code: string): Promise<Response> {
  const access = await verifyAccess(request, env, code);
  if (!access.ok) return access.response;

  const body = await readJson<SignalBody>(request);
  if (!body) return errorResponse('invalid_body', 400);

  // Fix B enforcement: a trickle candidate has candidate/sdpMid/sdpMLineIndex.
  if ('candidate' in body || 'sdpMid' in body || 'sdpMLineIndex' in body) {
    return errorResponse('trickle_ice_disabled', 400,
      'Gather all ICE candidates before sending; per-candidate signaling is not supported.');
  }

  if (body.kind !== 'offer' && body.kind !== 'answer') {
    return errorResponse('invalid_signal_kind', 400);
  }
  if (typeof body.sdp !== 'string' || body.sdp.trim() === '') {
    return errorResponse('sdp_required', 400);
  }
  if (!body.from || !body.to || typeof body.from !== 'string' || typeof body.to !== 'string') {
    return errorResponse('from_and_to_required', 400);
  }
  // A complete (non-trickle) SDP has its candidates inline. Warn-reject an SDP
  // that carries no media section at all — a sign of an empty/partial blob.
  if (!/m=/.test(body.sdp)) {
    return errorResponse('incomplete_sdp', 400);
  }

  const now = nowSec();
  const record: SignalRecord = {
    kind: body.kind,
    from: body.from.slice(0, 64),
    to: body.to.slice(0, 64),
    sdp: body.sdp,
    created_at: now,
    expires_at: now + SIGNAL_TTL_SECONDS,
  };

  // Native TTL is fine here: signals own no R2 object (Fix A only constrains
  // R2-linked records). Floor to the 60s KV minimum.
  await env.AIRSHARE_KV.put(kvKey.signal(code, record.to), JSON.stringify(record), {
    expirationTtl: Math.max(60, SIGNAL_TTL_SECONDS),
  });

  return json({ ok: true }, 201);
}

// ── GET /api/room/:code/signal?device_id=me — consume my pending signal ──
export async function getSignal(request: Request, env: Env, code: string): Promise<Response> {
  const access = await verifyAccess(request, env, code);
  if (!access.ok) return access.response;

  const me = new URL(request.url).searchParams.get('device_id');
  if (!me) return errorResponse('device_id_required', 400);

  const key = kvKey.signal(code, me.slice(0, 64));
  const rec = await env.AIRSHARE_KV.get<SignalRecord>(key, 'json');
  if (!rec || isExpired(rec)) return json({ signal: null });

  // One-shot: consume so the same offer/answer isn't re-processed on re-poll.
  await env.AIRSHARE_KV.delete(key);
  return json({ signal: rec });
}
