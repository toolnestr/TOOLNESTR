# ToolNestr — Full-Site SEO + E-E-A-T Audit

**Scope:** 750 URLs (745 tool pages + 5 root). Method: deterministic per-URL scan (`audit/seo-eeat-scan.json`) + 3 parallel qualitative deep-dives. **E-E-A-T treated as priority #1.**
**Date:** 2026-07-16

Page templates: `ToolLayout` (544), `SubjectToolPage` (140 science), `FactorConverter` (39), `MultiUnitConverter` (9), custom/other (13).

---

## PART 1 — E-E-A-T (priority)

### E1. No author/expertise entity anywhere — HIGHEST IMPACT (all 745 pages)
Every page says "Reviewed by the ToolNestr Team" but there is **no named author, no `Person` schema, no author bio, no credentials** anywhere. `SoftwareApplication.author` and the About page both point only to the Organization. For a site that is 195+ pages of YMYL calculators (finance, health, engineering, Islamic rulings), anonymous authorship is the single weakest E-E-A-T signal.
**Fix:**
1. Define real reviewer(s) with credentials in `src/data/site.js` (e.g. "civil engineer PE", "CPA", "qualified scholar"). If real names aren't possible, at least a named editorial persona with stated qualifications per YMYL domain.
2. Add `Person` JSON-LD and reference it as `reviewedBy` on the WebPage node in `ToolLayout.astro` (~L90-100).
3. Add author-bio page(s) under `src/pages/about/` with `ProfilePage` + `Person` schema; point the L118 "ToolNestr Team" link there.
4. Expand `about.astro` "How we build and verify" to name reviewers per domain.

### E2. Build-time review date = fabricated freshness — TRUST RISK (all 745)
`ToolLayout.astro` L118 stamps `new Date()` (current month at build) as the review date on every page; `about.astro` L30 does the same for `dateModified`. Any rebuild silently re-dates all 745 pages to "reviewed this month" with no human review. Backfires under manual review.
**Fix:** Use a real per-page `reviewed`/`updated` date (prop on ToolLayout, or per-tool in `tools.js`), or an honest site-wide "last audited" constant. Never derive review date from build time.

### E3. Empty `sameAs` — QUICK WIN (all pages)
`site.js` L24 `sameAs: []` → Organization ships with no social/entity corroboration. Plumbing already correct (conditional emit).
**Fix:** Add 2-3 real brand profiles (X, GitHub, LinkedIn) to `sameAs`. One-line change.

### E4. 195 uncited YMYL pages + ToolLayout has no citation mechanism — HIGH IMPACT
`ToolLayout.astro` accepts **no `sources` prop** — so all 544 ToolLayout pages structurally cannot cite sources. Only `SubjectToolPage` (science, 150 pages) can, and all of them do (gold standard). Uncited YMYL: **construction 104, automotive 26, engineering 25, finance 24, islamic 16, health 12**.
**Fix — 2 steps:**
- **A.** Add `sources = []` + `sourcesNote` props to `ToolLayout.astro` and render a "Sources & references" section (mirror `SubjectToolPage.astro` L194-203).
- **B.** Backfill each YMYL page's frontmatter with a `sources` array. Priority: structural/finance/islamic first, then automotive safety, then quantity estimators.

Per-category source templates (construction→ACI 318/IRC/APA, automotive→SAE/fueleconomy.gov/OEM, engineering→NEC/IPC-2221/NIST, islamic→Qur'an 4:11-12/Bukhari-Muslim/AAOIFI, finance→IRS/ATO/HMRC/FBR, health→NIH/CDC/ACOG) are in the deep-dive notes.

---

## PART 2 — On-Page SEO

### S1. 164 meta descriptions >160 chars — BIGGEST SERP ITEM
Truncated in Google (~155-160 cap). Breakdown: 121 SubjectToolPage, 31 ToolLayout, 12 other (0 FactorConverter — those auto-generate short). Root cause on science pages: a ~40-char boilerplate opener `"…with a live 3D X diagram and charts."` Recipe: drop the opener, lead with the formula/keyword, cap ≤155. 25 copy-paste rewrites provided in deep-dive; same recipe covers the other 139.

### S2. 4 titles >60 chars
`dropspot` (67→"Dropspot — Cross-Network File Sharing"), `tokens-to-words` (66→"Tokens to Words Calculator"), `ev-vs-gas-break-even-calculator` (64→"EV vs Gas Break-Even Calculator"), `surface-area-volume-ratio-calculator` (63→"Surface Area-to-Volume Calculator"). (Rendered title = prop + " — ToolNestr" [13 chars]; keep prop ≤47.)

### S3. 2 duplicate `<title>` slug pairs
`qr-code-generator` vs `qr-generator`; `resistor-color-code-calculator` vs `resistor-color-code`. Serve same tool at two URLs → split ranking signals. Fix: pick the keyword-complete slug, 301-redirect the duplicate.

### S4. ~8 genuinely thin pages (2 urgent)
Urgent (YMYL finance, <125 words, no sources): `uk-take-home-pay-calculator` (104w), `australia-tax-calculator` (122w) — add methodology + worked example + FAQs + cite HMRC/ATO. Others (200-250w, optional polish): decimal↔fraction, scientific-notation-converter, words-to-numbers, color-palette-generator, hijri-date-today, social-media-image-size-cheat-sheet.

### S5. False positives — NO ACTION
MISSING_TITLE (2) and MISSING_DESC (49) all resolve via layout/component fallbacks. 9 "0-word" THIN flags are rich pages the word-counter couldn't parse (content in slots).

---

## PART 3 — Schema & Structure

### C1. FAQ coverage — near complete
"50 no-FAQ" was 96% false positive: 48 are converters that auto-generate 4 FAQs in their wrappers. **Only 1 real gap:** `social-media-image-size-cheat-sheet.astro` (add `const faqs`). `[category].astro` is a hub route — correctly no FAQ.

### C2. HowTo schema on only 311/745 — TOP AEO WIN
Biggest ROI: **add a `howTo` object to `FactorConverter.astro` + `MultiUnitConverter.astro`** — 2 edits → HowTo schema on all 48 converters at once (steps already exist in prose). Then roll HowTo into high-intent ToolLayout calculators (finance/health) by category. SubjectToolPage already emits HowTo on all 140.

### C3. 12 NO_INTRO pages — low priority
All custom `BaseLayout`-direct pages with their own hero + hand-rolled schema. No schema defect; optional intro `<p>` for consistency.

### C4. JSON-LD architecture — sound
No malformed schema across all 4 wrappers. Minor: SoftwareApplication nodes aren't cross-linked by `@id` (legal); SubjectToolPage emits HowTo as a second script rather than in the @graph (valid). Speakable is FAQ-only — consider adding the intro `<p>` selector so AI answer engines can lift the definition sentence.

---

## Recommended execution order
1. **E3** populate `sameAs` (minutes, 1 file)
2. **E1** named reviewer + Person schema + bio page (highest E-E-A-T value)
3. **E2** honest review dates (remove fabricated-freshness liability)
4. **S1** fix 164 long meta descriptions (biggest SERP win; 25 done, recipe for rest)
5. **C2** add HowTo to the 2 converter wrappers (48 pages, AEO)
6. **E4** add `sources` prop to ToolLayout + backfill YMYL citations (structural/finance/islamic first)
7. **S3** consolidate duplicate slugs; **S2** shorten 4 titles; **S4** flesh out 2 finance thin pages

**Key files:** `src/data/site.js`, `src/layouts/BaseLayout.astro`, `src/layouts/ToolLayout.astro`, `src/components/SubjectToolPage.astro` (citation pattern to mirror), `src/components/FactorConverter.astro` + `MultiUnitConverter.astro` (HowTo), `src/pages/about.astro`.
