# Construction Tools — Session Handoff

Paste this into a fresh Claude Code session to continue building. Repo: `C:\Users\ADNAN\Desktop\TOOLNESTR` (Astro + Tailwind, light theme, ~592 tools live, deploys to toolnestr.com via git push → Cloudflare Pages).

## Read these first (in order)
1. `docs/construction-tools/construction-tools-spec.md` — keyword strategy, credibility/sourcing standard, curated ~75-tool list (renamed titles + keyword angle + engineering-standard source per tool), roadmap, and the category-hub UX (Section 5).
2. `docs/subject-tools/TOOL-CREATION-RULES.md` — the shared technical build rules (Astro/`SubjectToolPage`/`window.STK`, no slider-driven 3D, mobile rules, no-parallel-agents, validate JS via `new Function()`, hand-verify formulas, full `npm run build` before done).
3. `docs/subject-tools/toolnestr-progress-tracker.md` — precedent for how the Physics/Chemistry/Biology batches were built/audited.

## What's already DONE (verified in browser, not yet committed)
- **Category hub page redesigned** — `src/pages/tools/[category].astro` now has: gradient hero banner, live search input, icon-labeled subcategory pill tabs (client-side filter, no reload), per-category accent theming (amber/orange for construction, indigo for all others via the `accents` map + `accentName`). Tabs only appear when a category has ≥2 subcategories AND >12 tools, so Physics/Chem/Bio stay on the plain grid.
- **Compact card redesign** — `src/components/ToolCard.astro` rewritten as a compact horizontal card (emoji tile + title + 1-line desc + hover chevron, ~92px tall vs old ~180px). Takes an `accent` prop ('amber'|'indigo'). Only used on category pages; homepage has its own card markup and is untouched.
- **20 existing construction tools tagged** with a `sub` field in `src/data/tools.js` (values: Cement & Concrete, Materials, Home & Garden, Roofing, Converters, Water & Vessels). Category already exists: `{ id: 'construction', name: 'Construction & Home Improvement', emoji: '🏠' }`. SEO copy already in `src/category-content.js`; homepage icon already in `index.astro` catIcons.

**First action in new session:** `git status` + `git fetch` to sync (local was recently hard-reset to origin/main). Then commit the above work-in-progress if not already committed.

## What's NEXT — build the tools
- The construction category currently has ~20 basic tools. The spec lists ~75 curated tools. Build the missing ones (and enhance thin existing ones) per the spec.
- **Cadence:** batches of ~10, sequentially by hand, NO parallel agents (standing instruction).
- **Build order (spec Section 4/roadmap):** demand-first, liability-last → Cement & Concrete → Materials → Home & Garden → Roofing → Driveway → Water/Vessels → Converters → Practical/Layout → **Structural specs LAST** (beam span, header size, box fill — highest real-world risk, extra credibility review).
- **Per tool:** unique emoji within category, correct `sub` tag, formula traceable to the cited standard (ACI/NDS/AISC/NEC/ACCA/ASCE per the spec table), 2 worked examples hand-verified, keyword-angle title (NOT Omni's exact titles), then `npm run build` clean + 0 duplicate slugs.

## Open decisions to confirm with user before mass build
1. Run the ~75-tool shortlist through a real keyword tool (Ahrefs/Ubersuggest) — I have no keyword-volume data; the angles are intent-logic only.
2. Confirm construction accent stays amber/orange + 🏗️/🏠 emoji.
3. Liability-disclaimer wording for structural tools (stronger than the standard subject-tools disclaimer).
4. Are new construction tools flagship-depth (3D + charts like Physics/Chem/Bio) or lighter calculator pages? The 20 existing ones are simple calculators, not flagship — decide the depth tier for construction.

## Key gotchas
- No parallel agents. Build sequentially by hand.
- Tailwind JIT: write full class strings, never interpolate class fragments.
- Verify in the real browser (preview_* tools), check console for 0 errors, test mobile.
- Nothing auto-deploys until `git push` to origin/main.
