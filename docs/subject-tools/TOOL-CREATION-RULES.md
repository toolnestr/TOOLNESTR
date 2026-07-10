# Tool Creation Rules — Read Before Building Any New Subject Tool

**Purpose:** Single condensed checklist to follow every time a new Physics/Chemistry/Biology tool is created. Combines the fixed rules from `toolnestr-subject-tools-project-spec.md` with the overrides in `toolnestr-progress-tracker.md`'s "Reconciliation Decisions" table (the overrides win wherever the two conflict).

**Full detail lives in:**
- `docs/subject-tools/toolnestr-subject-tools-project-spec.md` — original rules, template, full 150-tool list
- `docs/subject-tools/toolnestr-progress-tracker.md` — live build status (check before building, so nothing gets rebuilt) + Reconciliation Decisions table (overrides)

---

## 0. Before writing any code

- [ ] Read the **Tool Status Log** in `toolnestr-progress-tracker.md` to confirm the tool isn't already built.
- [ ] Search `tools.js` for the intended slug to rule out a collision.
- [ ] If a basic version of the tool already exists in another category (e.g. `engineering`), **enhance it in place and move its category** rather than creating a near-duplicate page.

## 1. Format (overrides spec's original standalone-HTML assumption)

- Build as an **`.astro` page** in this repo using `ToolLayout` + the shared **`SubjectToolPage.astro`** component + the **`window.STK`** kit (`public/subject-kit.js`).
- Do **not** build standalone HTML files or use the prototype's dark-navy theme — match the site's real Tailwind light theme.
- 3D: **Three.js** via STK's `makeScene()`. Charts: **Chart.js** via STK's `chartSetup()`.

## 2. Required page anatomy (8 sections, in order)

1. Hero (name, one-line purpose, subject badge)
2. Calculator (clean inputs, live results, reset/example button)
3. Visualization tied to the calculator
4. "How it works" explainer (formula + each variable defined individually)
5. Real-world context (2-3 real examples, full paragraphs)
6. Worked example(s) — at least one, a second if there's a meaningful edge case
7. Related tools (same-subject links; 1-2 cross-subject links only where genuinely relevant)
8. FAQ (3-5 questions, `FAQPage` schema)

## 3. Visualization rule (current — supersedes an earlier interactive-slider approach)

- **2 static, auto-rotating 3D diagrams** (no sliders, no live-input binding) — each its own `makeScene()` call, `s.spin()` auto-rotation, wrapped in its own try/catch.
- **Charts** via Chart.js, `maintainAspectRatio:false`, wrapped in a fixed-height container div, no `height` attribute on the canvas.
- Do **not** build a slider-driven/live-updating interactive 3D scene — this pattern was removed project-wide after it broke on the live site.

## 4. Content depth requirements

- 1000+ words of real educational content (excludes calculator/UI).
- Misconceptions section: false statement in quotes, followed by the correction.
- Comparison/data table where relevant, wrapped in a horizontally-scrollable container for mobile.
- Formula introduction pattern: formula first, then every variable defined individually.
- Worked examples: state "given" values up front, solve step by step, final answer with units.
- Reading level: grade 9-10, direct sentences in explanatory steps.

## 5. Mobile requirements (hard-won bugs — do not reintroduce)

- [ ] 3D containers use explicit `height` (never `min-height` alone).
- [ ] Strict init order: Three.js objects created before anything references them; every init step wrapped in try/catch so one failure can't disable unrelated widgets.
- [ ] No `height` attribute on chart canvases + `maintainAspectRatio:false` always set.
- [ ] Touch handlers (`touchstart`/`touchmove`/`touchend`) alongside mouse handlers for any orbit/drag controls, `touch-action:none` on the canvas only.
- [ ] `@media (max-width: 640px)` breakpoint tightening nav/hero/padding/fonts.
- [ ] Grids collapse 3-4 cols → 2 → 1 as screen shrinks.

## 6. Input validation

- Every input has a hard min/max clamp to the physically valid range.
- Invalid combinations (div-by-zero, negative sqrt, etc.) show a plain-language inline message instead of `NaN`/`Infinity`/a broken chart.
- Default/example values are a known-good, verified-rendering combination.

## 7. GEO/SEO requirements

- `FAQPage`, `HowTo`, `SoftwareApplication` schema on every page.
- "How it works" opens with one direct, self-contained sentence stating the core formula/answer before elaborating.
- Claim → evidence → implication structure in explainer/worked-example sections.

## 8. Formatting & metadata standards

- Results round to 2 significant decimals; scientific notation past defined thresholds (very large/small chemistry values).
- Units always shown next to values.
- Clean up `-0.00` and floating-point artifacts before display.
- Title tag: `"{Tool Name} — Free {Subject} Calculator with 3D Visualization | Toolnestr"`.
- Standard disclaimer line (verbatim, in footer/small print):
  > "This tool is provided for educational purposes to support learning in Physics, Chemistry, and Biology. It is not a substitute for professional engineering, laboratory, or safety-critical calculations."

## 9. Build process rules (standing instructions across every batch)

- **Build sequentially by hand — no parallel agents** unless the user explicitly authorizes it for that round.
- Pick a **unique emoji** within the tool's subject category (check for collisions in `tools.js`).
- Validate every inline `<script>`'s JS syntax via Node's `new Function()` before considering it done.
- Hand re-derive and verify every formula/worked-example number against a standard reference.
- Check every `related` link resolves to a real, existing slug.
- Run a full `npm run build` and confirm 0 duplicate slugs, 0 errors.
- Log the work in `toolnestr-progress-tracker.md`'s Session Log / batch notes — not in the spec file.

## 10. What NOT to do

- Don't rebuild any tool already marked built in the Tool Status Log.
- Don't use the prototype's dark navy palette or standalone-HTML architecture.
- Don't add a slider-driven interactive 3D scene (removed project-wide).
- Don't skip mobile touch handlers, canvas height rules, or input validation.
- Don't edit the spec file for routine status updates — only for genuine rule changes; use the tracker for status.
