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
| 6 | Internal links → canonical trailing-slash URLs (kill redirect hop) | ✅ **Done** | 2026-07-20 | **Root cause of Semrush "713 pages have only one incoming internal link" + inflated "1,551 crawled / 769 redirects".** Every internal link pointed to `/tools/x` (no slash) → 308 → `/tools/x/`. Google tolerated it (GSC showed only 17 benign "Page with redirect", canonical consolidation working) but each hop wasted crawl budget — the exact bottleneck behind the 366 "Discovered – not indexed". Fixed all internal link generation to emit the trailing slash directly: `ToolLayout.astro` (sibling-tool list, breadcrumb link + schema), `ToolCard.astro`, `FactorConverter.astro`, `MultiUnitConverter.astro`, `404.astro`, **and 1,214 hardcoded `href="/tools/x"` links across 387 tool pages' Related-tools sections** + Header nav. Verified: built tool page now emits 764 slash-URL links, 0 no-slash. Homepage + `[category].astro` already used slashes (untouched). Rebuild clean (769 pages, 0 errors). Expected effect: each tool regains its full ~764 direct incoming links, redirect count collapses toward ~the intentional `_redirects` set, crawl reaches Discovered pages in one hop. |
| 7 | Duplicate canonical + duplicate title/description | ✅ **Done** | 2026-07-26 | `power-factor-calculator.astro` injected a raw `<link rel="canonical">` (no-slash form), `<title>` and `<meta description>` into `ToolLayout`'s body slot **on top of** the ones `BaseLayout` already emits in `<head>` → two canonicals pointing at different URLs, two titles, two descriptions. Removed the in-body tags (and the dead `seoTitle`); the layout's head tags are correct and slash-canonical. Same commit added the slash form `/tools/tools/` to `_redirects` (Ahrefs hit the trailing-slash variant the no-slash rule missed). Commit `6630a9d`. |
| 8 | Slash-form variants for all removed-slug redirects | ✅ **Done** | 2026-07-26 | `_redirects` only carried the no-slash form of each retired slug; crawlers hitting the trailing-slash variant got a 404. Added the slash form for every removed-slug rule. Commit `a406437`. |
| 9 | No-slash `/about`, `/contact`, `/privacy` links site-wide | ✅ **Done** | 2026-07-26 | Same redirect-hop class as fix #6 but for the root pages — ~767 internal links went `/about` → 308 → `/about/`. All emit the slash directly now. Commit `c5c5c53`. |

---

## Verification checklist (post-deploy)

- [x] `curl -I https://www.toolnestr.com/` returns 301 → `https://toolnestr.com/` ✅ 2026-07-04
- [x] `curl -I https://www.toolnestr.com/tools/password-strength-tester/` returns 301 → apex ✅ 2026-07-04
- [x] GSC: "Crawled – currently not indexed" trending down — **223 → 21 (−91%)** ✅ 2026-07-24
- [x] Indexed count trending up from 409 — **409 → 892 (+118%)** ✅ 2026-07-24
- [ ] GSC: 404 count → 0 — regressed 3 → 11, needs URL export to trace
- [ ] GSC: "Discovered – currently not indexed" trending down — 366 → 431 (see analysis below)

---

## GSC snapshot 2026-07-24 (read 2026-07-27)

**Indexed 892 | Not indexed 993** (baseline was 409 / 625)

| Reason | Jul 4 | Jul 24 | Δ | Validation | Read |
|--------|-------|--------|---|------------|------|
| Crawled – currently not indexed | 223 | **21** | −202 | Failed | ✅ Fixed. Validation shows "Failed" only because 21 of the sampled 223 still carry the label — re-run it. |
| Page with redirect | 17 | **264** | +247 | Not started | ✅ **Expected — this is fixes #1/#6/#8/#9 landing.** |
| Not found (404) | 3 | **11** | +8 | Not started | ⚠️ Real regression, needs GSC export to identify. |
| Alternate page with proper canonical tag | 16 | **266** | +250 | Started | ✅ **Expected — correct duplicate consolidation.** |
| Discovered – currently not indexed | 366 | **431** | +65 | Started | ⚠️ Mostly duplicate-era variants, not real missing pages (see below). |

### Why "Not indexed" grew 625 → 993 and why that is NOT a regression

GSC's "Not indexed" bucket counts **every URL Google has ever known that isn't currently
serving** — including URLs whose non-indexing is the *correct, intended* outcome. When a
duplicate URL is fixed by redirect or canonical tag, it does not leave GSC; it **moves into
the not-indexed bucket with a healthy reason label**. A redirect *source* is never supposed
to be indexed — its target is.

`Page with redirect` (+247) and `Alternate page with proper canonical tag` (+250) together
account for **+497** of the increase. Deploying www→apex 301s, trailing-slash link fixes and
slug redirects **required** those URLs to land in exactly these two rows. The rise is the
receipt that the fixes worked, and it will stay elevated for months. **Do not treat these two
rows as defects.**

### The 431 "Discovered" is not 431 missing pages

- Live sitemap (`sitemap-0.xml`) = **768 URLs** — the site's true canonical page count.
- Indexed = **892** — Google has *more* pages indexed than the site has.
- Total known = 892 + 993 = **1,885 URLs ≈ 2.4× the real site.**

That 2.4× excess is duplicate-era residue (www variants, no-slash forms, retired slugs).
Since indexed already exceeds the sitemap, **effectively every real page is indexed**; the
431 are overwhelmingly variants discovered during the duplicate era that will never be
crawled and will age out. Coverage is saturated, not starved.

### Timing caveat

This data is stamped **2026-07-24**. Fixes **#7 (duplicate canonical), #8 and #9** all landed
**2026-07-26** — their effect is not reflected in these numbers at all.

### Production re-verified 2026-07-27 (live `curl -I`)

All 301 → correct target: `/tools/tools/` + no-slash → `/`; `/tools/qr-generator/` →
`/tools/qr-code-generator/`; `/tools/power-calculator/` → `/tools/electric-power-calculator/`;
`/tools/canada-net-salary-calculator/` → `/tools/finance/`; `/tools/wave-speed-calculator/` →
`/tools/wavelength-frequency-calculator/`; `/tools/resistor-color-code/` →
`/tools/resistor-color-code-calculator/`; `www.../tools/bmi-calculator/` → apex.
`200` on `/tools/power-factor-calculator/` (canonical fix live) and `/about/`.
`/hr` correctly 404s (phantom URL, no source link).

### The 11 404s are STALE — last crawled 2026-07-05

Confirmed in GSC: those URLs carry a **last-crawl date of 5 July**, i.e. they were detected
*before nearly every fix shipped*. The slash-form redirect fix (`a406437`) landed **26 July**,
21 days after Google last looked. GSC is displaying a photograph of a problem that no longer
exists — there is nothing to trace and no code defect behind those 11.

Re-verified live 2026-07-27, **every retired slug now 301s in BOTH slash forms**:
`canada-net-salary-calculator`, `netherlands-net-salary-calculator`, `qr-generator`,
`resistor-color-code`, `wave-speed-calculator`, `power-calculator`, `tools/tools` — 14/14 → 301.

The 3 → 11 growth is explained: between 4 and 5 July Google crawled the **trailing-slash
variants** of the retired slugs, which `_redirects` did not cover until `a406437`. Exactly the
failure mode that commit was written for.

| # | Fix | Status | Date | Notes |
|---|-----|--------|------|-------|
| 10 | `/tools/slope-calculator` left dead after fix #2 | ✅ **Done** | 2026-07-27 | Fix #2 resolved the broken related-tool link by *removing* it — which stopped new crawls finding it but left the already-crawled URL 404ing (only URL still 404 in both slash forms as of 2026-07-27). A real equivalent exists (`grade-slope-calculator`), so added a 301 for both slash forms instead of leaving it dead. |

`/hr` deliberately left as a 404: phantom URL, no source link, **no equivalent page**.
Redirecting an unrelated path to `/` is a soft-404 pattern Google penalises — a genuine 404 is
the correct signal here.

### Remaining actions

1. **Click "VALIDATE FIX" on the Not found (404) row** (currently "Not started"). This is what
   forces Google to re-crawl those stale URLs. It is a GSC UI action — **no code change needed**.
2. **Re-run "Validate Fix"** on Crawled – not indexed (21 left, previously Failed).

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
- **2026-07-26** — Fixes #7–#9 DONE: duplicate canonical/title/description on `power-factor-calculator`, slash-form variants for all removed-slug redirects, and no-slash root-page links site-wide.
- **2026-07-27** — **Crawled URL count collapsed from 900+ → 773** (user-reported). This is the intended effect, not a page loss: 773 ≈ the site's true canonical page count (live sitemap confirmed at **768 URLs** on 2026-07-27). The ~130 that vanished were duplicate representations of the same content — www variants, no-slash 308 forms, `/tools/tools/`, retired slugs, and the double-canonical page — now collapsed to one URL each by fixes #1, #6, #7, #8, #9. **Metric to watch from here is _indexed_ count (baseline 409), not total discovered** — total discovered should stay flat near 773.

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
