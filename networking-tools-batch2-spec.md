# MASTER SPECIFICATION: Networking & IP Tools — Batch 2 (10 More Tools)

**Target AI:** DeepSeek / Cursor / Copilot / Claude Code
**Architecture:** Same as Batch 1 — Cloudflare Workers (vanilla JS, the existing `worker.js`) + Astro/Cloudflare Pages, `ToolLayout.astro` for every page.
**Prerequisite:** Batch 1 (20 tools, `networking-ip-tracker-spec.md`) must already be deployed — these 10 extend the same `networking` category and reuse the same Worker, `dohQuery()` helper, and IANA-bootstrap pattern already built and proven working in production.

---

## 0. LESSON FROM BATCH 1 — READ BEFORE BUILDING ANY OF THIS

Batch 1 shipped with 6 of 20 tools silently broken in production, and the root cause was the same every time: **any "free, no-key" API that is itself fronted by Cloudflare will rate-limit or WAF-block requests coming from Cloudflare Worker egress IPs**, because those IPs are shared across every Workers customer and get flagged for abuse by other tenants' traffic. This bit `ipwho.is`, `freeipapi.com`, `rdap.org`, and Quad9's DoH endpoint (different bug, but same "didn't actually test it" root cause) all at once.

**Before wiring any external API into this batch, verify two things:**
1. Curl the API directly and confirm it isn't itself served by Cloudflare (check the `server:` response header — if it says `cloudflare`, be suspicious and test from a real Worker before trusting it).
2. Actually deploy and test the Worker route, not just curl the API from a normal machine — a normal residential/dev IP getting a clean response proves nothing about how Cloudflare's shared egress ranges will be treated.

This is why every tool below is designed to need either **zero external dependency**, or to reuse **Cloudflare's own DoH** (`1.1.1.1/dns-query`) and **direct RIR/registry queries** (ARIN/RIPE/APNIC/etc., none of which are Cloudflare-fronted) — both already proven reliable in Batch 1 after the fixes.

---

## 1. THE 10 TOOLS

| # | Tool | Why it's worth adding | Backend dependency |
|---|------|------------------------|---------------------|
| 1 | **HTTP Status & Redirect Chain Tracer** | High utility volume ("check redirect chain", "301 vs 302 checker"), and it's the *only* zero-risk addition in this list — pure Worker `fetch()` with `redirect: 'manual'`, no third party at all. Strong crossover with your existing SEO-tools audience. | None — Worker only |
| 2 | **Website Uptime / "Is It Down" Checker** | Massive search volume ("is site down for everyone or just me"), and trivially cheap to build: Worker fetches the URL, reports status + latency. Must ship with an honest caveat (see §3) since it's a single-location check, not a multi-region monitor. | None — Worker only |
| 3 | **VLSM Subnet Calculator** | Distinct from the existing Subnet Calculator (Batch 1, #3) — VLSM (Variable Length Subnet Masking) splits one network into multiple differently-sized subnets, which is a separate and heavily-searched CCNA/Network+ exam topic. Pure math, zero backend. | None — client-side only |
| 4 | **IPv6 Subnet Calculator** | The Batch 1 Subnet Calculator explicitly excludes IPv6 ("does not handle IPv6 subnets"). This fills that gap directly — dedicated IPv6 prefix/subnet math (typically /48, /56, /64 boundaries). Pure math, zero backend. | None — client-side only |
| 5 | **IPv6 Address Compressor / Expander** | Companion to the existing IPv4→IPv6 Converter (Batch 1, #5) — takes a full IPv6 address and compresses it to `::` shorthand, or expands a compressed address back to all 8 groups. Distinct, low-competition long-tail. Pure string manipulation. | None — client-side only |
| 6 | **SPF Record Checker** | Pairs naturally with the existing Email Header Analyzer (Batch 1, #19) and the email-deliverability audience generally. Fetches the domain's TXT record (reuse the existing `/api/dns-lookup` route, `type=TXT`), parses the SPF mechanism syntax, and flags the common "too many DNS lookups" (>10) failure that breaks real-world SPF. | Reuses existing `/api/dns-lookup` — no new Worker code needed |
| 7 | **DMARC Record Checker** | Same family as #6 — fetches `_dmarc.<domain>` TXT record via the same `/api/dns-lookup` route, parses `p=`/`pct=`/`rua=` etc. and explains the policy in plain language. | Reuses existing `/api/dns-lookup` — no new Worker code needed |
| 8 | **SSL/TLS Certificate Checker** | Huge search volume ("ssl checker", "certificate expiry checker") but **the only tool here that needs real third-party-API caution** — Workers' `fetch()` doesn't expose TLS certificate metadata for arbitrary domains, so this needs an external cert-transparency lookup. Use `crt.sh`'s JSON output (`crt.sh/?q=<domain>&output=json`) — verify with the §0 checklist before trusting it; it is not Cloudflare-fronted at the time of writing, but confirm `server:` header isn't `cloudflare` before shipping. | External: `crt.sh` (verify per §0 before trusting) |
| 9 | **Bandwidth / Download Time Calculator** | Decent steady volume ("download time calculator", "mbps to mb/s"), zero competition risk, zero backend — converts file size + connection speed into estimated download/upload time, handles Mbps/MBps/GB unit confusion which is a common source of searches. | None — client-side only |
| 10 | **IP List Sorter & Deduplicator** | Sysadmin/network-engineer utility — paste a messy list of IPs (from logs, firewall rules, etc.), get them sorted numerically (not lexically — `10.0.0.2` before `10.0.0.10`), deduplicated, and optionally filtered to public-only or private-only. Low competition, genuinely useful, zero backend. | None — client-side only |

---

## 2. INTEGRATION — SAME PATTERN AS BATCH 1

Add all 10 to the `tools` array in `src/data/tools.js` with `category: 'networking'` (same category created in Batch 1 — do not create a second category). Slugs: `redirect-chain-checker`, `uptime-checker`, `vlsm-calculator`, `ipv6-subnet-calculator`, `ipv6-compressor-expander`, `spf-checker`, `dmarc-checker`, `ssl-certificate-checker`, `bandwidth-calculator`, `ip-list-sorter`.

All 10 use the existing `ToolLayout.astro` wrapper — none of these need the heavier custom-page treatment the IP Tracker flagship got in Batch 1.

**The 600+ word in-depth content requirement from Batch 1 applies identically here — no exceptions, including the simplest tools (#9, #10).** See Batch 1 spec §6 for the exact content checklist (what it does, underlying concept, worked example, use cases, limitations, FAQ) — apply it to every one of these 10 pages too.

---

## 3. IMPLEMENTATION NOTES PER TOOL

### 3.1 HTTP Status & Redirect Chain Tracer (Worker route: `/api/redirect-trace`)
```js
async function handleRedirectTrace(url) {
  let target = url.searchParams.get('url') || '';
  if (!target) return jsonResponse({ error: 'Missing url parameter' }, 400);
  if (!/^https?:\/\//i.test(target)) target = 'https://' + target;
  const chain = [];
  let current = target;
  for (let i = 0; i < 10; i++) {
    const start = Date.now();
    const res = await fetch(current, { redirect: 'manual' });
    chain.push({ url: current, status: res.status, ms: Date.now() - start });
    const location = res.headers.get('location');
    if (!location || res.status < 300 || res.status >= 400) break;
    current = new URL(location, current).href;
  }
  return jsonResponse({ chain, finalUrl: current, hops: chain.length - 1 });
}
```
Cap at 10 hops to avoid infinite redirect loops abusing the Worker.

### 3.2 Website Uptime / Is It Down Checker (Worker route: `/api/uptime-check`)
```js
async function handleUptimeCheck(url) {
  let target = url.searchParams.get('url') || '';
  if (!target) return jsonResponse({ error: 'Missing url parameter' }, 400);
  if (!/^https?:\/\//i.test(target)) target = 'https://' + target;
  const start = Date.now();
  try {
    const res = await fetch(target, { method: 'GET', signal: AbortSignal.timeout(8000) });
    return jsonResponse({ url: target, up: res.status < 500, status: res.status, ms: Date.now() - start });
  } catch (e) {
    return jsonResponse({ url: target, up: false, status: null, ms: Date.now() - start, error: 'Unreachable or timed out' });
  }
}
```
**Required disclaimer copy on the page:** "This checks reachability from Cloudflare's network at the moment you click — it is not a multi-region uptime monitor and cannot tell you if the site is down only for you specifically (for that, compare against another network/device)." Do not oversell this as more than it is.

### 3.3 VLSM Subnet Calculator (pure client-side)
Input: a base network (e.g. `192.168.1.0/24`) and a list of required host counts per subnet (e.g. `50, 25, 10, 2`). Algorithm: sort required sizes descending, for each compute the smallest prefix that fits (`hostsNeeded + 2 <= 2^(32-prefix)`), allocate sequentially from the base network, track the running offset. This is standard VLSM allocation — implement it directly, don't overcomplicate with a library.

### 3.4 IPv6 Subnet Calculator (pure client-side)
Input: an IPv6 address + prefix length (e.g. `2001:db8::/32`). Output: network address, the typical subnet boundaries an ISP/enterprise would use (`/48` for a site, `/56` or `/60` for subdelegation, `/64` for a single LAN segment — explain these in the content, don't just dump numbers), and total number of `/64` subnets available within the given prefix (`2^(64-prefix)` when prefix ≤ 64). Use `BigInt` for the address-space math since IPv6 host counts exceed `Number.MAX_SAFE_INTEGER` well before `/64`.

### 3.5 IPv6 Address Compressor/Expander (pure client-side)
Expand: split on `::`, pad each side with explicit `0000` groups to fill 8 groups total, left-pad each group to 4 hex digits.
Compress: find the longest run of consecutive `0000` groups, replace with `::` (only the longest run — RFC 5952 requires this, and only one `::` is valid per address), strip leading zeros from remaining groups.

### 3.6 SPF Record Checker
Call the existing `/api/dns-lookup?domain=<domain>&type=TXT`, find the record starting with `v=spf1`, parse mechanisms (`include:`, `ip4:`, `ip6:`, `a`, `mx`, `~all`/`-all`/`+all`). Count `include:` and `a`/`mx` mechanisms (each can trigger further DNS lookups) and flag if total approaches or exceeds 10 — this is the real-world SPF failure mode (RFC 7208's 10-lookup limit) that catches people out, and is the single most valuable thing this tool can flag.

### 3.7 DMARC Record Checker
Call `/api/dns-lookup?domain=_dmarc.<domain>&type=TXT`. Parse `p=` (none/quarantine/reject), `pct=`, `rua=`/`ruf=` (report addresses), `adkim=`/`aspf=` (alignment mode). Explain each value in plain language in the results — most people searching for this don't know what `p=quarantine` means, that's the value-add.

### 3.8 SSL/TLS Certificate Checker (Worker route: `/api/ssl-check`)
```js
async function handleSslCheck(url) {
  const domain = url.searchParams.get('domain') || '';
  if (!domain) return jsonResponse({ error: 'Missing domain parameter' }, 400);
  const res = await fetch('https://crt.sh/?q=' + encodeURIComponent(domain) + '&output=json');
  if (!res.ok) return jsonResponse({ error: 'Certificate lookup failed' }, 502);
  const data = await res.json();
  const latest = (data || []).sort((a, b) => new Date(b.not_before) - new Date(a.not_before))[0];
  if (!latest) return jsonResponse({ error: 'No certificates found' }, 404);
  return jsonResponse({
    domain, issuer: latest.issuer_name, notBefore: latest.not_before, notAfter: latest.not_after,
    daysUntilExpiry: Math.ceil((new Date(latest.not_after) - Date.now()) / 86400000),
  });
}
```
**Before shipping:** run the §0 checklist on `crt.sh` from inside a deployed Worker, not just from a dev machine — this is exactly the kind of dependency that broke silently in Batch 1.

### 3.9 Bandwidth / Download Time Calculator (pure client-side)
Inputs: file size (with unit selector: MB/GB/TB) and connection speed (with unit selector: Mbps/MBps/Gbps — handle the bit-vs-byte confusion explicitly, this is the #1 source of wrong answers people get manually). Output: estimated time, plus a table showing the same calculation at a few common speeds (25 Mbps, 100 Mbps, 1 Gbps) for comparison.

### 3.10 IP List Sorter & Deduplicator (pure client-side)
Textarea input (one IP per line, tolerate extra whitespace/blank lines). Parse each, convert to 32-bit integer for correct numeric sort (not string sort — `"10.0.0.10" < "10.0.0.2"` lexically, which is wrong), dedupe via a Set on the normalized string, offer optional filters using the same classification logic already built for the Private/Public IP Checker (Batch 1, #7) — reuse that function rather than re-deriving the RFC 1918 ranges.

---

## 4. DEPLOYMENT

```bash
# 1. Add the 3 new Worker routes (redirect-trace, uptime-check, ssl-check) to the existing worker.js
# 2. Test each route directly with curl AFTER deploying — not before
npx wrangler deploy worker.js
curl "https://toolnestr.toolnestr.workers.dev/api/redirect-trace?url=example.com"
curl "https://toolnestr.toolnestr.workers.dev/api/uptime-check?url=example.com"
curl "https://toolnestr.toolnestr.workers.dev/api/ssl-check?domain=example.com"

# 3. Build and verify locally
npm run build

# 4. CSP: none of these need new connect-src entries — all client-side tools call only
#    the existing toolnestr.toolnestr.workers.dev origin, already allowlisted.

# 5. Commit and push
git add worker.js src/data/tools.js src/pages/tools/<the-10-new-pages>.astro
git commit -m "Add 10 more Networking & IP Tools: redirect tracer, uptime checker, VLSM/IPv6 subnet calculators, SPF/DMARC/SSL checkers, bandwidth calculator, IP list sorter"
git push
```

**END OF MASTER SPECIFICATION.**
