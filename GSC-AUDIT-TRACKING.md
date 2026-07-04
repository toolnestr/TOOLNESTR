# Google Search Console — Index Audit & Fix Tracking

**Property:** `sc-domain:toolnestr.com`
**Audit date:** 2026-07-04
**Site age in Google's eyes:** ~3 days (first detected 2026-07-01)
**Baseline:** Indexed **409** | Not indexed **625**

---

## Baseline snapshot (2026-07-04, from GSC "Why pages aren't indexed")

| Reason | Source | Pages | Verdict |
|--------|--------|-------|---------|
| Discovered – currently not indexed | Google systems | 366 | Real non-www pages, never crawled (crawl-budget starvation) |
| Crawled – currently not indexed | Google systems | 223 | www duplicate URLs dropped as duplicates |
| Page with redirect | Website | 17 | ✅ Benign (slash / http→https redirects) |
| Alternate page with proper canonical tag | Website | 16 | ✅ Healthy (correctly consolidated) |
| Not found (404) | Website | 3 | ⚠️ Genuine broken links |

**Sitemap:** `sitemap-0.xml` — 514 URLs, Status Success, 0 errors.

## Root cause (verified via live HTTP checks)

`www.toolnestr.com` served the full site with **HTTP 200** instead of redirecting to
canonical `toolnestr.com`. Both hosts are custom domains on the same Cloudflare Pages
project. Result: on a brand-new site with tiny crawl budget, Google burned its budget
crawling www duplicates (→ 223 "Crawled – not indexed") instead of the real non-www
pages (→ 366 "Discovered – not indexed", Last crawled: N/A).

**Confirmed healthy (not touched):** canonical tags (all → non-www), trailing-slash
normalization (no-slash 308→slash), http→https 301, robots meta `index,follow`,
sitemap, robots.txt.

---

## Fix log

| # | Fix | Status | Date | Notes |
|---|-----|--------|------|-------|
| 1 | www → non-www 301 redirect | ✅ **Done & verified** | 2026-07-04 | Implemented as a **Cloudflare Redirect Rule** (zone toolnestr.com): `https://www.*` → `https://${1}`, 301, preserve query string. Verified live: www root, tool pages (slash & no-slash), and query strings all 301 → apex; apex stays 200. First attempted via `_redirects` but Pages only matches on path, not host — that approach was abandoned. |
| 2 | Fix 3 broken 404 links (`/tools/tools`, `/tools/slope-calculator`, `/hr`) | ✅ **Done** | 2026-07-04 | `/tools/slope-calculator` was a real broken related-tool link in `linear-equation-calculator.astro` → replaced with existing Ratio & Proportion Calculator (verified 200). `/tools/tools` & `/hr` have NO source reference — stale/phantom URLs from an earlier crawl; a genuine 404 is correct SEO behaviour and they will drop from GSC on re-crawl. No code change needed for those two. |
| 3 | Accelerate 366 Discovered pages (internal linking / URL Inspection API) | ⬜ Pending | — | After www fix lands |
| 4 | Validate fixes in GSC ("Validate Fix" buttons) | ⬜ Pending | — | After deploy propagates |

---

## Verification checklist (post-deploy)

- [x] `curl -I https://www.toolnestr.com/` returns 301 → `https://toolnestr.com/` ✅ 2026-07-04
- [x] `curl -I https://www.toolnestr.com/tools/password-strength-tester/` returns 301 → apex ✅ 2026-07-04
- [ ] GSC: "Crawled – currently not indexed" count trending down
- [ ] GSC: "Discovered – currently not indexed" count trending down (pages getting crawled)
- [ ] GSC: 404 count → 0
- [ ] Indexed count trending up from 409

## Progress log

- **2026-07-04** — Connected GSC via service-account API (Cloudflare Worker `GSC_CREDENTIALS` secret). Completed full index audit through GSC UI + live HTTP checks. Identified www duplication as root cause.
- **2026-07-04** — Fix #1 DONE: deployed Cloudflare Redirect Rule `www.* → apex` (301). Verified live. (Note: `_redirects` approach failed because Pages matches path-only, not host — cleaned up that dead line.)
- **2026-07-04** — Fix #2 DONE: replaced broken `/tools/slope-calculator` related-link in `linear-equation-calculator.astro` with Ratio & Proportion Calculator. `/tools/tools` & `/hr` are phantom URLs with no source link — left as correct 404s.
