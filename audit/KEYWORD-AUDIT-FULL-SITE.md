# Keyword Audit — Full Site (all 24 categories, 742 live tools)

**Date:** 2026-07-16
**Scope:** every live tool page in `src/pages/tools/` across all 24 categories, plus the homepage grid data in `src/data/tools.js`.
**Method:** On-page keyword-alignment audit (judgment-based) + a deterministic truncation scan of all 743 page files.

## Why not data-driven?
The site's GSC integration (`worker.js` → `/api/gsc-search-analytics`, service-account JWT in the `GSC_CREDENTIALS` secret) **is live and does return real data** — but the site is ~1 month old, so query data is statistical noise (queries have 0 clicks and 1–3 impressions each). Ranking keywords on a single impression at position 74 would be worse than not ranking them. **Revisit a data-driven audit in ~3 months** once impression counts are meaningful. Until then this is an editorial keyword pass, not a volume-ranked one.

---

## Headline result

The site is **systematically well-optimized.** Titles lead with the primary search term, descriptions carry the right modifiers (US/UK/EU, cm, women's/men's, "free", "instantly", formula names), and search intent is correctly matched. Converters and unit-pairs are component-templated (`FactorConverter`), so they're uniform and correct by construction.

The audit found **two classes of real issues**: (1) a handful of factual title/description bugs — **all fixed**; (2) several cannibalization clusters that need a *product decision* (merge vs differentiate) — **flagged below, not auto-changed.**

---

## Changes applied (11 files: 10 pages + tools.js)

### Title / meta corrections
| Page | Issue | Fix |
|---|---|---|
| `html-sitemap-generator` (seo) | Title said "HTML Sitemap Generator" but the tool generates **XML** sitemaps (urlset schema, "Download XML", all FAQs) — title targeted a query the tool doesn't satisfy | Title → **XML Sitemap Generator** (+ grid label). *Slug/URL left unchanged — see recommendations.* |
| `garment-cost-sheet-calculator` (clothing) | Cannibalized `garment-costing-calculator` on "garment cost sheet" | Title *Quick Cost Sheet Calculator* → **Garment Cost Sheet Calculator** (+ grid label) |
| `garment-costing-calculator` (clothing) | Same cannibalization | Description re-pointed from "garment cost sheet" → "**full manufacturing cost of a garment**" |
| `apparel-shipping-cost-estimator` (clothing) | Title dropped "apparel" (slug targets "apparel shipping cost") | Title → **Apparel Packaging & Shipping Cost Estimator** (+ grid label) |

### Truncated descriptions (meta cut off mid-sentence — verified fixed in `dist/`)
| Page | Was | Now ends |
|---|---|---|
| `ping-latency-test` (networking) | "…for each target — useful for." | "…diagnosing slow connections and comparing server response times." |
| `ip-distance-calculator` (networking) | "…computes the great-circle." | "…great-circle distance between them in miles and kilometers." |
| `free-fall-calculator` (physics) | "…under gravity (no air." *(unclosed paren)* | "…(no air resistance), with worked examples." |
| `mole-ratio-calculator` (chemistry) | "…and moles of one to." | "…moles of one to find the moles of the other." |
| `floor-area-ratio-calculator` (construction) | "…floor area allowed under a." | "…allowed under a zoning FAR limit." |
| `floor-joist-span-calculator` (construction) | "…span table guidance for common." | "…guidance for common joist sizes." |

**Deterministic scan result:** all 743 page files were scanned for descriptions lacking terminal punctuation, ending in a dangling word, or with unbalanced parentheses. After the fixes above, **0 real truncations remain** (the 4 flagged residuals — "fall into.", "charge on.", "grow to.", "belongs to." — are grammatically complete sentences ending in a preposition).

---

## Cannibalization clusters — FLAGGED, need your decision (not auto-changed)

These are cases where 2–3 pages compete for the same phrase. Resolving each means either **merging** (301-redirect one into the other) or **deliberately differentiating** the target keyword — a product-intent call, and one that touches URLs, so I left them for you.

| # | Cluster | Overlap | Suggested resolution |
|---|---|---|---|
| 1 | `tax-calculator` (everyday) vs `vat-gst-calculator` + `sales-tax-calculator` (finance) | everyday tool titled "GST / VAT / Sales Tax Calculator" duplicates the exact terms of two dedicated finance pages | Narrow the everyday one to a generic "Tax Calculator" hub that links out, or merge |
| 2 | `ev-vs-gas-savings` + `ev-vs-gas-break-even-calculator` + `ev-payback-calculator` (automotive) | all three compute EV-vs-gas total cost / break-even; two titles share "EV vs Gas" | Merge break-even into savings, or clearly split: savings vs break-even-miles vs payback-years |
| 3 | `diff-checker` (developers) vs `text-diff-checker` (text) | near-identical: "compare two texts side by side… additions, deletions, changes" | Merge, or make one code-diff and one prose-diff |
| 4 | `hours-calculator` (everyday) vs `work-hours-calculator` (time-date) | both compute hours between two times with break deduction | Differentiate: generic duration vs timesheet/pay |
| 5 | `wavelength-frequency-calculator` vs `wave-speed-calculator` (physics) | both solve v = fλ for the same three variables | Strong merge candidate |
| 6 | `power-calculator` vs `electric-power-calculator` (physics) | both electrical power + energy-cost | Strong merge candidate |
| 7 | `capacitor-charge-time-calculator` vs `rc-time-constant-calculator` (engineering) | both compute RC time constant + charge/discharge time | Merge or differentiate |
| — | Minor (acceptable as-is): `kva-to-kw` vs `power-factor` (eng); `awg-to-mm` ⊂ `wire-gauge` (eng); `momentum` vs `impulse` (phys); `atom` vs `isotope`, gas-law combined vs Boyle/Charles (chem); `cubic-yardage` vs `square-feet-to-cubic-yards` (construction) | different primary keywords — monitor once indexed | — |

---

## Cosmetic recommendations (URL-level, not done)

- **Slug/URL mismatches** (titles are correct; slugs are misleading). Changing a slug changes the URL, so it needs a 301 redirect — deferred:
  - `html-sitemap-generator` now titled "XML Sitemap Generator" → ideal slug `xml-sitemap-generator`
  - `atomic-mass-calculator` is titled/functions as "Molar Mass Calculator"
  - `atomic-weight-calculator` is titled/functions as "Atomic Mass Calculator"
- **Security note (unrelated to keywords):** `/api/gsc-search-analytics` is a public, unauthenticated proxy to your Search Console data — anyone who knows the worker URL can pull your GSC query data. Consider adding an auth check or removing the public route.

---

## Per-category verdict

| Category | Tools | Verdict |
|---|---|---|
| clothing | 68 | 3 fixes (2 cannibalization + 1 slug/title) |
| seo | 11 | 1 fix (HTML→XML sitemap) |
| networking | 36 | 2 truncation fixes |
| physics | 50 | 1 truncation fix + 2 merge candidates |
| chemistry | 50 | 1 truncation fix |
| construction | 105 | 2 truncation fixes |
| finance / everyday / automotive / developers / text / engineering | — | clean; cannibalization clusters flagged above |
| pdf, converters, security, math, health, cooking, creators, images, time-date, charts, islamic, biology | 300+ | clean, no changes needed |

**Bottom line:** 11 files changed (all factual corrections, verified in build + `dist/`), 7 cannibalization clusters flagged for a merge/differentiate decision, and the site is otherwise in strong keyword shape. The single highest-leverage next step is **not** more editing — it's waiting ~3 months and re-running this data-driven off real GSC impressions.
