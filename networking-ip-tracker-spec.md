# MASTER SPECIFICATION: Networking & IP Tools Category (Flagship: IP Tracker)

**Target AI:** DeepSeek / Cursor / Copilot / Claude Code
**Architecture:** Cloudflare Workers (backend, vanilla JS, no frameworks) + Astro/Cloudflare Pages (frontend, matches existing ToolNestr site)
**Objective:** Add a new "Networking & IP Tools" category with 20 tools to ToolNestr. The flagship tool is an **IP Address Tracker** (geolocation lookup), promoted in the main nav exactly like the existing "SEO Analyzer" button. All 20 tools must follow the site's existing conventions (Astro pages, Tailwind, BaseLayout/ToolLayout, JSON-LD, E-E-A-T content depth) — this is not a separate app, it's 20 new pages + 1 new Worker endpoint inside the current ToolNestr repo.

**HARD REQUIREMENT — applies to every single one of the 20 tool pages, no exceptions:** each page must ship with **600+ words of genuinely in-depth, tool-specific educational content** below the calculator/tool UI (not boilerplate, not padding — real explanatory depth, the same bar already met by every existing tool on the site such as `bmi-calculator.astro`). This is non-negotiable for every tool, including the simplest ones (e.g. User Agent Parser, IP/Binary Converter) — even "small utility" tools need a full 600+ word treatment covering what the tool does, why it matters, how the underlying concept works, common use cases, and a FAQ section. See §6 for the exact content checklist; do not ship any tool page that falls short of this word count.

---

## 0. WHY THESE 20 TOOLS (niche/clickable rationale — do not change the list without reason)

Picked for a mix of high search volume, low-to-medium competition, and genuine technical feasibility on Cloudflare Workers (no paid APIs required for any of them):

| # | Tool | Why it's worth building |
|---|------|--------------------------|
| 1 | **IP Address Tracker** (flagship) | Highest volume keyword in this niche ("ip tracker", "trace ip address"). Uses Cloudflare's own `request.cf` for the visitor's IP (free) + `ipwho.is` for arbitrary IP lookups (free, unlimited, no key). |
| 2 | What Is My IP Address | Massive, evergreen search volume. Zero external API — pure `request.cf`. Easiest, highest-traffic tool in the set. |
| 3 | IPv4 Subnet Calculator | Classic networking/IT-cert search term (CCNA/Network+ students). Pure math, no API. |
| 4 | CIDR / IP Range Calculator | Pairs with #3. Pure math. |
| 5 | IPv4 to IPv6 Converter | Steady niche volume, almost no competition doing it well. Pure math. |
| 6 | IP to Binary/Hex/Decimal Converter | Low competition, easy long-tail traffic, pure math. |
| 7 | Private vs Public IP Checker | Simple but frequently searched by non-technical users troubleshooting routers. Pure regex/math. |
| 8 | MAC Address Lookup (Vendor/OUI) | Decent volume ("mac address lookup"), no API needed — ship a static IEEE OUI prefix table. |
| 9 | DNS Lookup Tool (A/AAAA/MX/TXT/NS/CNAME) | High utility volume. Free via Cloudflare's own DoH endpoint — no third party. |
| 10 | Reverse DNS Lookup (PTR) | Pairs naturally with #9, same DoH endpoint. |
| 11 | WHOIS Lookup (domain + IP) | Huge evergreen search term. Free via RDAP bootstrap (IANA-maintained, no key). |
| 12 | DNS Propagation Checker | Popular with anyone who just changed DNS records. Query multiple public DoH resolvers in parallel (Cloudflare, Google, Quad9) — all free. |
| 13 | Blacklist / DNSBL Checker | Searched heavily by email senders. Implemented as DNS A-record lookups against public RBL zones via the same DoH endpoint — no paid blacklist API needed. |
| 14 | HTTP Headers Checker | Useful for devs/SEO people, ties into the existing SEO-tools audience. Pure Worker echo of `request.headers`. |
| 15 | User Agent Parser | Good long-tail volume, 100% client-side regex, no backend at all. |
| 16 | ASN Lookup | Networking-pro niche, low competition, low cost (`request.cf.asn` for self, `ipwho.is` for arbitrary IP). |
| 17 | HTTP Latency / Ping Test | "Ping test" has huge volume but real ICMP is impossible from a Worker — ship an **honest HTTP round-trip latency tester** and label it clearly as such (see §6 for required disclaimer copy). |
| 18 | Port Checker (common ports only) | Searched often, but Workers cannot open arbitrary raw TCP sockets on the free plan reliably — ship a **scoped-down version** that only checks reachability of a small allow-listed set of common ports (80/443/22/21/25) via Workers' TCP Socket API where available, with a clear "best-effort" disclaimer. Do not market this as a port scanner. |
| 19 | Email Header Analyzer | Paste raw email headers → extract route, originating IP, delays. Pure client-side text parsing, zero backend, decent niche volume (email deliverability audience). |
| 20 | IP Geolocation Distance Calculator | Novel/unique angle (distance between two IP-derived locations) — very low competition, good for picking up long-tail/featured-snippet traffic, reuses the same `ipwho.is` lookup as the flagship. |

**Dropped on purpose:** real traceroute, full port scanning, SSL certificate deep inspection of third-party domains — all require either paid APIs or capabilities Workers don't have on the free tier. Don't add them unless the user explicitly wants to pay for a third-party API.

---

## 1. SITE INTEGRATION — DO NOT BUILD A SEPARATE APP

This must be added to the **existing** ToolNestr Astro repo, following its current conventions exactly.

### 1.1 New category
In `src/data/tools.js`, add to the `categories` array:
```js
{ id: 'networking', name: 'Networking & IP Tools', emoji: '🌐' },
```

### 1.2 New tools entries
Add all 20 tools to the `tools` array in `src/data/tools.js`, each with `category: 'networking'`, following the exact existing shape:
```js
{ slug: 'ip-tracker', title: 'IP Address Tracker', short: 'Trace any IP address — location, ISP, ASN and timezone.', category: 'networking', emoji: '🌐', enabled: true, status: 'live' },
```
Repeat for all 20 (see §0 table for titles/slugs — use kebab-case slugs matching the existing pattern, e.g. `subnet-calculator`, `cidr-calculator`, `ipv4-to-ipv6-converter`, `ip-binary-hex-converter`, `private-public-ip-checker`, `mac-address-lookup`, `dns-lookup`, `reverse-dns-lookup`, `whois-lookup`, `dns-propagation-checker`, `blacklist-checker`, `http-headers-checker`, `user-agent-parser`, `asn-lookup`, `ping-latency-test`, `port-checker`, `email-header-analyzer`, `ip-distance-calculator`, `what-is-my-ip`).

### 1.3 Nav highlight (mirrors the existing "SEO Analyzer" button)
In `src/components/Header.astro`, find the existing highlighted "SEO Analyzer" `<a>`/button (the `bg-indigo-600`-style pill button in the nav). Duplicate that exact pattern immediately next to it for the IP Tracker:
```html
<a href="/tools/ip-tracker/" class="inline-flex items-center gap-1.5 rounded-full bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700">
  🌐 IP Tracker
</a>
```
Both buttons should sit together at the front of the nav (SEO Analyzer + IP Tracker), same visual weight, same styling — they are the site's two flagship tools.

### 1.4 Page structure
- The flagship **IP Tracker** gets its own heavier page at `src/pages/tools/ip-tracker.astro`, following the same pattern as the existing `seo-analyzer.astro` (own CDN includes for the map library — see §3 — own `<script>` class, own results dashboard). It does **not** use `ToolLayout.astro`'s generic single-input/output layout because it needs a map and a richer dashboard.
- The other 19 tools use the **existing `ToolLayout.astro`** wrapper exactly like every other tool on the site (breadcrumbs, FAQ schema, author byline, SoftwareApplication JSON-LD — all already built into that layout, see prior SEO work). Do not reinvent this.

---

## 2. THE FLAGSHIP WORKER ENDPOINT: `/api/ip-lookup`

Add this to the **existing** `worker.js` (same Worker that already serves `/api/full-audit` for the SEO analyzer) as a new route. Do not create a second Worker — one Worker, multiple routes, keeps deployment simple.

### 2.1 Self-lookup (visitor's own IP) — FREE, no external call
Cloudflare populates `request.cf` automatically on every request. For `/api/ip-lookup` with no `?ip=` param, return the requester's own data directly from `request.cf` and `request.headers.get('CF-Connecting-IP')`:
```js
if (!targetIp) {
  const cf = request.cf || {};
  return json({
    ip: request.headers.get('CF-Connecting-IP'),
    country: cf.country, region: cf.region, city: cf.city,
    postalCode: cf.postalCode, timezone: cf.timezone,
    latitude: cf.latitude, longitude: cf.longitude,
    asn: cf.asn, asOrganization: cf.asOrganization,
    isSelf: true,
  });
}
```

### 2.2 Arbitrary IP lookup — free external fallback
When `?ip=<ip>` is provided (looking up someone else's IP), call `https://ipwho.is/<ip>` (free, unlimited, no API key, HTTPS, returns JSON with country/region/city/lat/lon/isp/connection/timezone/currency). Validate the IP format with a regex before forwarding (block SSRF — only allow valid public IPv4/IPv6 strings, reject private/reserved ranges and anything that isn't a clean IP literal):
```js
const IP_REGEX = /^(\d{1,3}\.){3}\d{1,3}$|^[0-9a-fA-F:]+$/;
if (!IP_REGEX.test(targetIp)) return json({ error: 'Invalid IP address' }, 400);

const res = await fetch(`https://ipwho.is/${targetIp}`);
const data = await res.json();
if (!data.success) return json({ error: 'Lookup failed' }, 502);

return json({
  ip: data.ip, country: data.country, countryCode: data.country_code,
  region: data.region, city: data.city, postalCode: data.postal,
  latitude: data.latitude, longitude: data.longitude, timezone: data.timezone?.id,
  isp: data.connection?.isp, asn: data.connection?.asn, org: data.connection?.org,
  currency: data.currency?.code, isSelf: false,
});
```

### 2.3 CORS
Same as the existing `/api/full-audit` endpoint — `Access-Control-Allow-Origin: *` on every response including OPTIONS preflight. Reuse the existing CORS helper already in `worker.js`, don't duplicate it.

### 2.4 Response schema (exact)
```json
{
  "ip": "8.8.8.8",
  "country": "United States",
  "countryCode": "US",
  "region": "California",
  "city": "Mountain View",
  "postalCode": "94043",
  "latitude": 37.4056,
  "longitude": -122.0775,
  "timezone": "America/Los_Angeles",
  "isp": "Google LLC",
  "asn": 15169,
  "org": "Google LLC",
  "currency": "USD",
  "isSelf": false
}
```

---

## 3. FLAGSHIP FRONTEND: `src/pages/tools/ip-tracker.astro`

### 3.1 CDN (map only — keep it minimal, no Chart.js needed here)
```html
<link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
<script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
```
Leaflet + OpenStreetMap tiles are free and require no API key. Use `tile.openstreetmap.org` as the tile source.

### 3.2 Layout
1. **Hero:** On page load, auto-run a self-lookup (no button needed) and show the visitor's own IP/location immediately — this is the "wow" moment that drives shares.
2. **Search bar:** "Look up another IP or leave blank for yours" — input + "Track IP" button.
3. **Results dashboard:**
   - Left: a card with IP, country flag emoji, city/region, ISP, ASN, timezone, currency.
   - Right: a Leaflet map centered on `latitude`/`longitude` with a marker. If looking up your own IP, show a privacy note: "This is your approximate ISP-level location, not your exact address."
   - Copy-to-clipboard button for the IP.
4. **Below the fold:** the same long-form educational content pattern already used on every other tool page (see §6) — what is IP geolocation, how accurate it is, common use cases, FAQ.

### 3.3 JS class structure (same pattern as `FlagshipSEOAnalyzer` in `seo-analyzer.astro`)
```js
class IPTracker {
  constructor() {
    this.WORKER_URL = 'https://toolnestr.toolnestr.workers.dev';
    this.map = null;
    this.init();
  }
  async init() {
    document.getElementById('trackBtn').addEventListener('click', () => this.lookup());
    await this.lookup(); // auto-run for visitor's own IP on load
  }
  async lookup() {
    const ip = document.getElementById('ipInput').value.trim();
    const url = ip ? `${this.WORKER_URL}/api/ip-lookup?ip=${encodeURIComponent(ip)}` : `${this.WORKER_URL}/api/ip-lookup`;
    const res = await fetch(url);
    const data = await res.json();
    if (data.error) return this.showError(data.error);
    this.renderResult(data);
    this.renderMap(data.latitude, data.longitude);
  }
  renderMap(lat, lon) {
    if (this.map) this.map.remove();
    this.map = L.map('map').setView([lat, lon], 10);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(this.map);
    L.marker([lat, lon]).addTo(this.map);
  }
}
new IPTracker();
```

---

## 4. THE OTHER 19 TOOLS — IMPLEMENTATION NOTES

Build all of these inside `ToolLayout.astro` like every existing tool page. Most need **no backend at all**; only the DNS/WHOIS/ASN tools need the Worker.

### 4.1 Pure client-side (no Worker call) — tools #3,4,5,6,7,15,19,20
Subnet calculator, CIDR calculator, IPv4↔IPv6 converter, IP↔binary/hex converter, private/public IP checker, user agent parser, email header analyzer, IP distance calculator (Haversine formula on two looked-up IPs). All pure JS in an inline `<script>` on the page, exactly like the existing calculator tools (see `bmi-calculator.astro` for the established pattern of inline vanilla JS + reactive DOM updates).

### 4.2 Needs Worker — DNS via Cloudflare's own DoH (free, no third party)
Add routes to the same `worker.js`:
- `/api/dns-lookup?domain=X&type=A|AAAA|MX|TXT|NS|CNAME` → forward to `https://1.1.1.1/dns-query?name=${domain}&type=${type}` with header `Accept: application/dns-json`. This is Cloudflare's own public resolver — completely free, no rate-limit concerns at this scale.
- `/api/reverse-dns?ip=X` → query the DoH endpoint with the reversed-IP `.in-addr.arpa` PTR record.
- `/api/dns-propagation?domain=X&type=A` → fire the same DoH-style query against Cloudflare (`1.1.1.1`), Google (`8.8.8.8` DoH at `dns.google/resolve`), and Quad9 (`9.9.9.9` DoH at `dns9.quad9.net:5053/dns-query`) in parallel with `Promise.all`, return all three results side by side.
- `/api/blacklist-check?ip=X` → reverse the IP octets and query A records against `zen.spamhaus.org` and 2-3 other public RBL zones via the same DoH endpoint; a returned A record means listed, NXDOMAIN means clean.

### 4.3 Needs Worker — WHOIS via RDAP (free, IANA-maintained, no key)
`/api/whois?query=X` → first hit `https://rdap.org/domain/${query}` (or `/ip/${query}` if it's an IP) — RDAP.org auto-bootstraps to the correct registry. Parse and surface registrar, creation/expiry dates, name servers, registrant org (if public).

### 4.4 Needs Worker — ASN lookup
Self: read `request.cf.asn` / `request.cf.asOrganization` directly (free). Arbitrary IP: reuse the same `ipwho.is` call already built for the flagship (`connection.asn`/`connection.org`).

### 4.5 MAC vendor lookup (#8) — static data, no API
Ship a curated JSON of the most common ~2,000 OUI prefixes (covers the vast majority of real-world lookups) bundled in `src/data/oui-vendors.json`. Do a prefix match client-side. Do not call a third-party API for this — keeps it instant and free forever.

### 4.6 HTTP headers checker (#14) — trivial Worker echo
`/api/headers` → return `Object.fromEntries(request.headers)` as JSON. No external calls.

### 4.7 Latency test (#17) and port checker (#18) — ship honest, scoped versions
- Latency: client-side `fetch()` timing against a small set of well-known public endpoints (Cloudflare, Google, Cloudflare's own `1.1.1.1`), reporting round-trip HTTP time. Label explicitly: "HTTP round-trip latency, not ICMP ping — browsers cannot send raw ICMP packets."
- Port checker: Worker-side `connect()` (Cloudflare TCP Sockets API, available on Workers paid/Workers Unbound — verify current plan supports it before shipping) against an allow-list of exactly 5 common ports (80, 443, 22, 21, 25) on a single user-supplied host. Label explicitly as "best-effort reachability check for common ports, not a port scanner," and rate-limit it harder than other endpoints to avoid abuse complaints.

---

## 5. CSP UPDATE REQUIRED

`public/_headers` already has a `Content-Security-Policy`. Adding Leaflet + OpenStreetMap tiles and the new external lookup targets requires:
```
script-src ... https://unpkg.com
style-src ... https://unpkg.com
img-src 'self' data: https://*.tile.openstreetmap.org
connect-src ... https://ipwho.is https://1.1.1.1 https://dns.google https://dns9.quad9.net https://rdap.org
```
Merge these into the existing directive — do not replace it. Test the IP tracker page in a real browser after deploying and check the console for CSP violations before considering this done (same mistake nearly happened with Font Awesome earlier — verify every new external host explicitly).

---

## 6. SEO / E-E-A-T CONTENT REQUIREMENTS (apply the site's existing standard, do not skip)

Every one of the 20 new tool pages must match the bar already set across the rest of ToolNestr:
- **600+ words minimum, in-depth and genuinely distinct, on every page — this is mandatory for all 20 tools, including the simplest converters/parsers.** Not templated — see how `bmi-calculator.astro` and `tip-calculator.astro` differ in actual H2 content, not just labels. For each tool, cover at minimum: what the tool does and who needs it, the underlying networking concept explained in plain language, a worked example, common real-world use cases, limitations/accuracy caveats, and how to use the tool. Treat the word count as a floor, not a target — pages that naturally run longer (e.g. the IP Tracker, Subnet Calculator, WHOIS Lookup) should not be artificially trimmed down to 600.
- One `<h1>`, logical H2 hierarchy, FAQ section with `FAQPage` JSON-LD (reuse `ToolLayout.astro`'s existing FAQ mechanism).
- `BreadcrumbList` JSON-LD (already built into `ToolLayout.astro` — automatic, nothing extra to do).
- Author byline + `SoftwareApplication` JSON-LD with `author` field (already built into `ToolLayout.astro` — automatic).
- **Outbound citations to genuinely authoritative sources** — this category has unusually good ones available and should use them:
  - IANA (iana.org) for IP allocation, special-use ranges, RDAP
  - IETF RFC documents (e.g. RFC 1918 for private IP ranges, RFC 4291 for IPv6) — link directly to `datatracker.ietf.org/doc/html/rfc1918` etc.
  - ARIN/RIPE/APNIC for regional registry context
  - Cloudflare's own public DNS docs (`developers.cloudflare.com/1.1.1.1/`) when explaining the DNS tools
- Add a one-line explicit privacy note on the IP tracker and self-IP tools: geolocation from IP is ISP-level (city/region), not precise GPS location — this is both accurate and protects against user complaints/mistrust.

---

## 7. DEPLOYMENT STEPS

```bash
# 1. Add new routes to existing worker.js, test locally
npx wrangler dev worker.js

# 2. Deploy the updated Worker (same one already serving /api/full-audit)
npx wrangler deploy worker.js

# 3. Build and verify the Astro site locally
npm run build

# 4. Update public/_headers CSP (see §5) BEFORE pushing — do not ship the map broken

# 5. Commit and push
git add worker.js public/_headers src/data/tools.js src/data/oui-vendors.json src/components/Header.astro src/pages/tools/ip-tracker.astro src/pages/tools/<other-19>.astro
git commit -m "Add Networking & IP Tools category: IP tracker flagship + 19 supporting tools"
git push
```

**END OF MASTER SPECIFICATION.**
