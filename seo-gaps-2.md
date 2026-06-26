# ToolNestr SEO Gap Report #2 — Fix Tasks

Audit date: 2026-06-25. Follow-up to `seo-gaps.md` (that file's items are either done or
already in progress — do not redo them). This file covers NEW gaps found in a second pass
over all 188 pages in `src/pages/tools/`. Confirmed via direct file inspection, not guesses.

Context already verified true (do not re-check, do not "fix" these — they're fine):
- Every tool page has 600–1,500+ words of unique body content, multiple `<h2>` sections, and a
  populated `faqs` array.
- `FAQPage`, `SoftwareApplication`, and `BreadcrumbList` JSON-LD are generated centrally in
  `src/layouts/ToolLayout.astro` from the `faqs`/`category`/`title` props — 185 of 188 tool pages
  use this layout and get these automatically. Don't add per-page JSON-LD duplicating this.
- Titles, canonical tags, OG/Twitter tags, robots meta are all present and unique across pages
  (verified no duplicate titles or descriptions exist).
- 404 page exists, `lang="en"` is set, no render-blocking third-party scripts in `BaseLayout.astro`.

---

## 1. Meta descriptions exceeding 160 characters (truncation risk in Google search results)

**Files:** `src/pages/tools/asn-lookup.astro`, `battery-runtime-calculator.astro`,
`email-header-analyzer.astro`, `ip-distance-calculator.astro`, `ip-tracker.astro`,
`ping-latency-test.astro`, `port-checker.astro`, `seo-analyzer.astro`,
`user-agent-parser.astro`, `voltage-drop-calculator.astro`

Each of these has a `description` value over 160 characters (one is 210 chars). Google
typically truncates snippets around 155–160 characters, which can cut off the value
proposition or end mid-sentence, hurting click-through rate.

**Task:** Find the `const description = "..."` (or `description="..."` prop) in each file and
rewrite it to be ≤155 characters while keeping it accurate, specific to the tool, and including
the primary keyword near the start. Don't just truncate the existing string — rewrite it so it
still reads naturally and ends on a complete thought.

---

## 2. Meta descriptions that are too thin (under 70 characters)

**Files:** `src/pages/tools/ip-list-sorter.astro` (55 chars), `password-strength-tester.astro` (60 chars)

These are shorter than necessary and leave SERP real estate unused — Google snippets can run up
to ~155 characters, so these descriptions are wasting an opportunity to add keywords and a
value proposition.

**Task:** Expand each to 120–155 characters. Describe what the tool does, the key benefit (e.g.
"free", "instant", "runs in your browser"), and a relevant secondary keyword — matching the
style of the other tool pages' descriptions for consistency.

---

## 3. Image preview `<img>` tags with no `alt` attribute at all

**Files:** `src/pages/tools/image-rotator.astro`, `image-flip.astro`, `image-to-jpg.astro`,
`image-to-png.astro`, `image-resizer.astro`, `image-compressor.astro`, `image-to-webp.astro`,
`image-to-base64.astro`, `image-to-avif.astro`

These pages have `<img id="...-preview" ...>` elements (populated via JS with a blob URL after
the user uploads a file) that have no `alt` attribute at all — not even an empty one. This is an
accessibility gap and will be flagged by Lighthouse/axe audits, which can indirectly affect
Core Web Vitals/SEO tooling scores.

**Task:** Add a static, descriptive `alt` attribute to each preview `<img>` tag (e.g.
`alt="Original image preview"` / `alt="Converted image preview"` depending on which preview it
is). Since the actual image content is user-uploaded and not crawlable (blob: URL), the alt text
just needs to describe the UI role for screen readers — don't try to dynamically generate alt
text from the uploaded filename.

---

## 4. Two pages bypass the shared `ToolLayout` and duplicate/miss its SEO scaffolding

**Files:** `src/pages/tools/ip-tracker.astro`, `src/pages/tools/seo-analyzer.astro`

Confirmed: these are the only 2 of 188 tool pages (excluding `[category].astro`) that don't use
`ToolLayout.astro`.
- `ip-tracker.astro` has no `BreadcrumbList` structured data at all.
- `seo-analyzer.astro` hand-rolls its own breadcrumb/JSON-LD instead of reusing the layout, which
  means it will silently drift out of sync if the shared schema format in `ToolLayout.astro` is
  ever updated.

**Task:**
1. For `ip-tracker.astro`: add a `BreadcrumbList` JSON-LD block matching the format used in
   `ToolLayout.astro` (Home → Tools → category → tool), or — better — refactor the page to use
   `ToolLayout` like every other tool page does, if its custom UI doesn't structurally require a
   fully separate layout.
2. For `seo-analyzer.astro`: same — prefer migrating it onto `ToolLayout` rather than maintaining
   a second copy of the breadcrumb/JSON-LD logic. If migration isn't feasible (e.g. layout
   conflicts with its custom UI), at minimum leave a comment pointing back to
   `ToolLayout.astro`'s schema shape so future edits stay in sync.

---

## Priority order
1. #1 and #2 (meta description lengths) — cheap, mechanical, no risk, directly affects
   click-through rate in search results.
2. #4 (ip-tracker / seo-analyzer layout drift) — moderate effort, fixes a real schema gap on
   `ip-tracker`.
3. #3 (image alt attributes) — lowest priority, accessibility/Lighthouse polish rather than a
   ranking factor.
