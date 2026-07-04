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
| 3 | Accelerate 366 Discovered pages | ✅ **Analysed** | 2026-07-04 | Internal linking verified HEALTHY (homepage → category hub → tool, 2-click; `[category].astro` links every live tool + ItemList schema). **No orphans.** The 366 = crawl-budget + new-site-age, primary lever (www fix) already applied. Cannot force-index via API (Indexing API = JobPosting/BroadcastEvent only; URL Inspection = read-only). Remaining levers: TIME + optional manual "Request Indexing" (~10–15/day) for priority pages. |
| 4 | Validate fixes in GSC | 🔄 **Started** | 2026-07-04 | "Validate Fix" **started** for **Crawled – currently not indexed (223)** — directly resolved by the www 301. HOLDING "Discovered (366)" validation ~3–5 days until Google re-crawls with freed budget (validating day-0 would fail prematurely). NOT validating "Not found 404" — those URLs stay 404 by design (fix was removing the broken link). |
| 5 | Sitemap `lastmod` = build date on every deploy | ✅ **Done** | 2026-07-04 | Removed the `serialize` override in `astro.config.mjs` that stamped today's date on all 514 URLs each build. Sitemap now omits lastmod → cleaner crawl signals. (User opted to skip manual "Request Indexing"; relying on www fix + time.) |

---

## Verification checklist (post-deploy)

- [x] `curl -I https://www.toolnestr.com/` returns 301 → `https://toolnestr.com/` ✅ 2026-07-04
- [x] `curl -I https://www.toolnestr.com/tools/password-strength-tester/` returns 301 → apex ✅ 2026-07-04
- [ ] GSC: "Crawled – currently not indexed" count trending down
- [ ] GSC: "Discovered – currently not indexed" count trending down (pages getting crawled)
- [ ] GSC: 404 count → 0
- [ ] Indexed count trending up from 409

## Monitoring plan (next steps, no code)

- **~3–5 days:** Re-check GSC. Expect "Crawled – not indexed" (223 www dupes) to fall as they convert to "Page with redirect"; then start the "Discovered (366)" validation once pages begin getting crawled.
- **1–2 weeks:** Expect Indexed count to climb above 409 as freed crawl budget reaches the 366 non-www pages.
- **Re-run:** `curl` checks in the verification checklist; sitemap "indexed" count via `/api/gsc-sitemaps`; spot URL inspections via `/api/gsc-inspect-url`.

## Progress log

- **2026-07-04** — Connected GSC via service-account API (Cloudflare Worker `GSC_CREDENTIALS` secret). Completed full index audit through GSC UI + live HTTP checks. Identified www duplication as root cause.
- **2026-07-04** — Fix #1 DONE: deployed Cloudflare Redirect Rule `www.* → apex` (301). Verified live. (Note: `_redirects` approach failed because Pages matches path-only, not host — cleaned up that dead line.)
- **2026-07-04** — Fix #2 DONE: replaced broken `/tools/slope-calculator` related-link in `linear-equation-calculator.astro` with Ratio & Proportion Calculator. `/tools/tools` & `/hr` are phantom URLs with no source link — left as correct 404s.
- **2026-07-04** — Fix #3 analysed: internal linking healthy, no orphans; 366 pages are crawl-budget/time-bound. Fix #5 DONE: removed artificial sitemap `lastmod` override (verified live — apex sitemap no longer emits lastmod). User chose to skip manual Request-Indexing.
- **2026-07-04** — Fix #4: started GSC "Validate Fix" on Crawled-not-indexed (223). All code fixes verified live on production. Now in monitoring phase.

---

## E-E-A-T audit (2026-07-04)

Ran PageSpeed Insights (mobile: Perf 93/Access 93/BP 92/SEO 100; desktop: Perf 100/Access 93/BP 92/SEO 100)
— technical SEO is not the bottleneck. Real gaps found by reading live pages/schema:

| # | Finding | Fix | Status |
|---|---------|-----|--------|
| 1 | No named human/team anywhere; no `/team` or `/author` page (404) | User opted for **brand persona, no personal name, no social links** (no fabrication) | Addressed via #2/#3 below within that constraint |
| 2 | About page had no methodology/verification story | Added "How we build and verify our tools" section: formulas sourced from public standards (IRS brackets, standard BMI/BMR, IEEE/NIST constants), reference-value testing, re-verification on standard changes. Also added real launch date (June 2026, from first git commit 2026-06-21) | ✅ Done |
| 3 | Organization schema was bare `{name, url}` only, duplicated per tool page | Added site-wide enriched `Organization` schema in `BaseLayout.astro` (`foundingDate`, `description`, `contactPoint`) referenced via `@id` from `ToolLayout.astro` and `about.astro` instead of duplicating | ✅ Done |
| 4 | YMYL categories (Finance, Health) have no citations to authoritative sources | Not yet done — real research per tool needed, separate pass | ⬜ Pending (deferred) |
| 5 | No social profiles (`sameAs`) | User has none yet — skipped, revisit if profiles are created | ⬜ Skipped by user choice |
| — | No logo image suitable for schema `logo` (need square, ≥112×112, raster) — only have `og-image.png` (1200×628) and an SVG favicon | Not added — flagged, needs a real square logo asset | ⬜ Pending |

**Not fabricated:** no founder name, no bio, no credentials, no social links, no logo — all skipped/deferred rather than invented, per user's explicit choice of "brand persona, no personal name."

**Deployed & verified live (2026-07-04):** `npm ci` + `astro build` clean (550 pages, 0 errors) before push.
Commit `d6209ce`, Cloudflare Pages deployment `14d1e958` Active. Confirmed on production:
- Homepage emits enriched Organization schema (`foundingDate`, `description`, `contactPoint`) ✅
- Tool pages reference it via `"author":{"@id":".../#organization"}` (no more duplicated bare object) ✅
- About page shows the new methodology section and launch date ✅
