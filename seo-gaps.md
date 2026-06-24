# ToolNestr SEO Gap Report — Fix Tasks

Audit date: 2026-06-25. Site: toolnestr.com (Astro + Cloudflare Pages, ~177 indexed pages).
Scope: gaps found against Google's published SEO/search-quality guidelines. Technical SEO
(crawling, indexing, canonical, sitemap, headings, schema, content uniqueness) is already solid —
do NOT touch those. Only the items below need work.

---

## 1. Missing Content-Security-Policy header

**File:** `public/_headers`

Every other security header is set (HSTS, X-Frame-Options, X-Content-Type-Options,
Referrer-Policy, Permissions-Policy) but `Content-Security-Policy` is absent.

**Task:** Add a `Content-Security-Policy` line to the `/*` block in `public/_headers`.
Audit the actual external resources the site loads (fonts, analytics, CDNs like Chart.js /
Font Awesome used by `seo-analyzer.astro`) and build a policy that allows only those origins
plus `'self'`. Do not use `unsafe-inline` for scripts if avoidable; if inline `<script is:inline>`
blocks in `BaseLayout.astro` are required (theme toggle), either hash them or move to nonce-based
CSP via Cloudflare. Test every page type (homepage, tool page, category page) after deploying to
confirm nothing breaks (fonts/icons/charts still render).

---

## 2. No outbound citations on tool pages (E-E-A-T)

**Files:** all `src/pages/tools/*.astro` pages, especially health/finance calculators
(`bmi-calculator.astro`, `bmr-calculator.astro`, `body-fat.astro`, `calorie-calculator.astro`,
`tax-calculator.astro`, `salary-calculator.astro`, `compound-interest.astro`,
`investment-calculator.astro`, `inflation-calculator.astro`, etc.)

Checked live: zero outbound links to authoritative sources (`.gov`, `.edu`, WHO, CDC, IRS, etc.)
on any tool page sampled. This is a direct E-E-A-T weakness — the site's own
`worker.js` SEO-analyzer engine flags exactly this (`hasCitations` in the EEAT score), and the
live site fails its own check.

**Task:** For each tool page, in the existing explanatory content (the H2 sections), add 1-3
contextual outbound links to genuinely authoritative primary sources relevant to that tool's
topic. Examples:
- BMI calculator → CDC (`cdc.gov`) or WHO BMI page
- Tax calculator → IRS (`irs.gov`) or relevant national tax authority
- Compound interest / investment calculators → SEC investor.gov or similar
- BMR/calorie calculators → NIH/CDC nutrition guidance

Rules:
- Links must be genuinely relevant and add value, not link-stuffing.
- Use `rel="noopener"` (and `nofollow` only if linking to a non-authoritative/UGC source —
  authoritative citation links should NOT be nofollowed, since their value is in being treated as
  real citations).
- Do this for the health/finance tools first (highest YMYL relevance), then expand to the rest.

---

## 3. No author/byline markup (E-E-A-T)

**Files:** `src/layouts/ToolLayout.astro` (or wherever tool page content is rendered), possibly
`src/data/site.js`

No `rel="author"`, `<meta name="author">`, or byline class anywhere on tool pages. The site's
own SEO-analyzer worker checks for this exact signal and the live site doesn't pass it.

**Task:**
1. Add a short "Reviewed by the ToolNestr Team" (or similar) byline block to the tool page
   template, visible in the rendered HTML — not just in the footer.
2. Link it to an `/about/` page (already exists at `src/pages/about.astro`) that explains who
   maintains the tools and the methodology/review process.
3. Add corresponding structured data: include an `author` field in the existing
   `SoftwareApplication` JSON-LD on tool pages (e.g. `"author": {"@type": "Organization", "name": "ToolNestr"}`).
4. Optionally add `<meta name="author" content="ToolNestr">` in `BaseLayout.astro`.

---

## 4. No BreadcrumbList structured data

**Files:** `src/layouts/ToolLayout.astro`, `src/pages/tools/[category].astro`

Pages are nested under `/tools/` and category pages exist, but there's no `BreadcrumbList`
JSON-LD anywhere, so Google can't show breadcrumb rich results or fully understand the hierarchy.

**Task:** Add a `BreadcrumbList` JSON-LD block to tool pages and category pages, e.g.:
```json
{
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    {"@type": "ListItem", "position": 1, "name": "Home", "item": "https://toolnestr.com/"},
    {"@type": "ListItem", "position": 2, "name": "Tools", "item": "https://toolnestr.com/tools/"},
    {"@type": "ListItem", "position": 3, "name": "BMI Calculator", "item": "https://toolnestr.com/tools/bmi-calculator/"}
  ]
}
```
Generate this dynamically per page (category name + tool name) and merge it into the existing
`@graph` JSON-LD already emitted by `BaseLayout.astro`/`ToolLayout.astro`, rather than adding a
second `<script type="application/ld+json">` block.

---

## 5. No images on tool pages

**Files:** `src/pages/tools/*.astro`

Calculator/converter tool pages are pure text + UI, no illustrative images, so there's no
image-search visibility and less visual engagement.

**Task:** Where it adds genuine value (not decoration), add one relevant diagram/illustration per
tool page (e.g. a BMI category chart, a tip-calculator example breakdown) with descriptive,
keyword-relevant `alt` text — not generic alt text like "image" or "chart". Use `width`/`height`
attributes and lazy-load (`loading="lazy"`) for any image below the fold, per the site's own
performance checks in `worker.js`. Skip this for tools where an image wouldn't add real value —
don't add filler images just to check a box.

---

## Priority order
1. E-E-A-T fixes (#2 citations, #3 author byline) — biggest current weakness, start with
   health/finance tools.
2. BreadcrumbList schema (#4) — cheap, mechanical, low risk.
3. CSP header (#1) — needs careful testing of third-party resources before shipping.
4. Images (#5) — lowest priority, do opportunistically per tool.
