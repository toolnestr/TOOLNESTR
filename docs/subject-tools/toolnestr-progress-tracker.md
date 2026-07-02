# Toolnestr.com — Progress Tracker

**Companion file to:** `toolnestr-subject-tools-project-spec.md`
**Location in repo:** `docs/subject-tools/` (both this tracker and the spec live here so any session can resume).
**Purpose:** Live status log. Read this file first when resuming work on this project. The spec file holds the rules; this file holds where things currently stand.
**Last updated:** 2026-07-02

> **⚠️ IMPORTANT REALITY RECONCILIATION (2026-07-02):** The spec was written against a *chat prototype* and assumes standalone single-file HTML tools with a dark navy theme + Three.js/Chart.js. The actual project is the **Astro site in this repo** (`micro-tools`, ~400 existing `.astro` tool pages using a shared `ToolLayout` + Tailwind **light** theme). Production decisions below override the spec wherever they conflict. Read the "Reconciliation Decisions" section before building anything.

---

## Current Phase

**Phase 1 — Template validation.** Complete (chat prototype). Reference only.
**Phase 1.25 — Repo reconciliation + single pilot tool.** **In progress (started 2026-07-02).** Instead of jumping straight to the 20-tool batch, we build ONE pilot tool end-to-end inside the Astro repo, restyled to the real site theme, at full spec depth. User reviews it, then we scale. Pilot chosen: rebuild **Projectile Motion** (`src/pages/tools/projectile-motion-calculator.astro`, which already exists as a basic page) up to full spec depth.
**Phase 1.5 — First production batch: 10 Chemistry + 10 Physics.** Not started. Begins only after the pilot is approved. Extract shared component/pattern kit from the pilot, then build the rest on top of it.
**Phase 2 — Remaining batches (continuing 10+10 ratio) + Biology (cadence TBD).** Not started.

---

## Reconciliation Decisions (2026-07-02 — these OVERRIDE the spec where they conflict)

| Topic | Spec said | Decision now | Why |
|---|---|---|---|
| **Build format** | Standalone single-file HTML, dark navy theme, Three.js r128 + Chart.js 4.4 | **Build as `.astro` pages in this repo** using existing `ToolLayout` + Tailwind light theme. Adapt the spec's *structure* (deep content, charts, 3D/visualization, worked examples, FAQ schema) into the real site, not its exact styling/stack. | The spec's stack was a chat-prototype choice; production is the Astro site. Structural DNA is kept, styling matches the live site (spec §3 explicitly allows this). |
| **Existing tools** | Treated all 150 as "Not started"; Projectile Motion = chat prototype to rebuild | **Enhance existing basic pages in place; create new pages only for tools that don't exist yet.** Many spec tools already exist as basic Astro pages (projectile-motion, molarity, ph, free-fall, ideal-gas-law, half-life, ohms-law, kinetic-energy, momentum, force, work, power, density, atomic-mass, gas-laws, dilution, etc.). | Existing calculation logic is preserved and layered on top of, not thrown away. |
| **Scope of this session** | First batch = 20 tools | **One pilot tool first**, then review, then scale. | De-risks touching production before the pattern is proven in-repo. |
| **Real site theme** | Open blocker ("not yet provided") | **RESOLVED from the repo** — light theme, Tailwind, white cards / slate text / indigo accent, shared `ToolLayout.astro` + `global.css`. | No longer an open question. |

**Impact on the rest of the site:** Only the ~150 subject tools are in scope, and in this phase only the single pilot page is touched. The other ~380 tools and all existing calculation logic are left untouched. Enhancements are additive (visualization + deeper content) on top of the existing, working calculators. Nothing is auto-published — changes stay local until an explicit build/deploy.

---

## Decisions Made So Far

| Decision | Status |
|---|---|
| Page template structure (8 sections) | ✅ Locked — see spec Section 2 |
| Content depth rule (1000+ words) | ✅ Locked |
| Visualization minimums (3 charts + 2 standalone 3D diagrams + 1 interactive 3D calculator) | ✅ Locked |
| Tech stack (Three.js r128, Chart.js 4.4.0, vanilla JS) | ✅ Locked |
| Full 150-tool list (50 per subject) | ✅ Locked — see spec Section 8 |
| SEO → GEO strategy (schema, direct-answer formatting, E-E-A-T) | ✅ Locked — see spec Section 9 |
| Enhancements adopted (lazy-load, URL state, hub pages, a11y, print CSS, formula sourcing) | ✅ Logged as requirements, not yet implemented on any tool |
| Audit process (browser-first, iterative loop: browser → code → browser, until clean) | ✅ Locked — see spec Section 12 |
| Production batch ratio: 10 Chemistry + 10 Physics per batch | ✅ Locked — see spec Section 23 |
| Shared component library (one kit reused across all 150 tools) | ✅ Locked — see spec Section 13 — **BUILT 2026-07-02**: `public/subject-kit.js` (`window.STK`: `el`, `reduceMotion`, `fmt2`, `fmtSig`, `chartSetup`, `makeScene`, `arrow`, `mountResize`) + `src/components/SubjectToolLibs.astro` (emits Three.js + Chart.js CDN tags + kit). Both flagships refactored onto it; 487-page build clean. |
| Input validation & error-state rules | ✅ Locked — see spec Section 14 |
| QA test-input matrix (folded into audit loop's code step) | ✅ Locked — see spec Section 15 |
| Numeric formatting standard | ✅ Locked — see spec Section 16 |
| Content style guide | ✅ Locked — see spec Section 17 |
| Metadata & social sharing template | ✅ Locked — see spec Section 18 |
| Legal/educational disclaimer text | ✅ Locked — see spec Section 19 |
| Cross-subject linking rule | ✅ Locked — see spec Section 20 |
| Post-publish correction process | ✅ Locked — see spec Section 21 |
| Real Toolnestr.com site theme (colors/fonts) | ❌ Not yet provided — prototype theme is placeholder only |
| Tier system (flagship vs. lighter tools) vs. uniform depth across all 150 | ❌ Not yet decided — flagged as open question |
| Build order across 150 tools | ❌ Not yet decided |

---

## Tool Status Log

Status values: `Not started` / `In progress` / `Built, not audited` / `In audit loop (browser/code cycle)` / `Clean pass achieved (desktop + mobile confirmed)` / `Audited, not published` / `Live`

*(Audit process defined in spec Section 12 — browser-first, iterative loop via Claude Code's browser automation, until a fully clean pass on desktop + mobile.)*

### Physics
| # | Tool | Status | Notes |
|---|---|---|---|
| 1 | Projectile Motion (`src/pages/tools/projectile-motion-calculator.astro`) | **Clean pass achieved (desktop + mobile confirmed)** (2026-07-02) — pilot; awaiting user's final visual sign-off | Rebuilt in-repo to full spec depth: interactive Three.js 3D trajectory (mouse+touch orbit, live update, Launch animation) + 3 Chart.js graphs (height/time, velocity/time, range/angle) + 2 auto-rotating standalone 3D diagrams (vector decomposition, family of trajectories) + 1000+ word content, misconceptions, comparison table, 2 worked examples (level + height edge case), HowTo schema, metric/imperial toggle, URL state, reduced-motion support. All Section-5 mobile fixes applied. **Browser audit (spec §12) run via Astro dev + Preview automation — see audit note below.** |
| 2 | Free Fall (`src/pages/tools/free-fall-calculator.astro`) | **Built to flagship depth** (2026-07-02, commit `f41b5f1`) — on `window.STK` | Moved engineering→physics. 3D drop (t² ease) + 3 charts (distance/time, velocity/time, 1:3:5:7 per-second bars) + 2 diagrams (equal-fall two-ball, strobe odd-spacing) + deep content, Earth/Moon worked examples, misconceptions, assumptions, sources, gravity presets, metric/imperial, URL state. Preserves from-rest solve. Physics hand-verified; build clean. Live-preview audit skipped per user. |
| 5 | Momentum & Impulse (`src/pages/tools/momentum-calculator.astro`) | **Built to flagship depth** (2026-07-02, commit `f95da76`) — on `window.STK` | Moved engineering→physics. 3D momentum block (vol∝mass, arrow∝p) + 3 charts (p–v, F–Δt trade-off, log comparison) + 2 diagrams (collision conservation, impulse equal-area) + deep content, football/airbag worked examples, misconceptions, sources. Preserves two-mode p=mv / Δp=FΔt solve. Physics hand-verified; build clean. |
| 3,4,6–10 | (see spec Section 8 for full list) | Not started | Next: Uniform Circular Motion, Newton's 2nd Law (force-calculator, exists), Elastic/Inelastic Collision, Impulse (own page), Torque, Angular Acceleration. |

### Chemistry
| # | Tool | Status | Notes |
|---|---|---|---|
| 1 | Molarity (`src/pages/tools/molarity-calculator.astro`) | **Clean pass (desktop + mobile + dark confirmed)** (2026-07-02) — Chemistry reference tool | Rebuilt to full flagship depth, Chemistry green accent. Preserves original M=n/V + M₁V₁=M₂V₂ two-mode calc logic. Added: interactive 3D beaker (Three.js — liquid level = volume, red solute particle density ∝ concentration, mouse+touch orbit) + 3 Chart.js graphs (dilution curve, moles vs volume, everyday-solution comparison on log scale) + 2 standalone auto-rotating 3D diagrams (dilution two-beaker, molarity-as-particles-per-litre cubes) + deep content, 2 worked examples (mass→M, dilution), misconceptions, everyday-molarity table, OpenStax/Brown/Zumdahl sources, print CSS. Audited: calc correct (0.5 mol/0.5 L→1 M; 12 M→1 M dilution→0.0208 L=20.8 mL), zero console errors, zero mobile overflow, dark contrast fixed (`text-green-800`→`text-green-700`, same rule as indigo). |
| 2–50 | (see spec Section 8 for full list) | Not started | Shared component kit to be extracted from the two reference tools (Projectile + Molarity) next, per spec §23. |

### Biology
| # | Tool | Status | Notes |
|---|---|---|---|
| 1–50 | (see spec Section 8 for full list) | Not started | — |

---

## Open Questions Awaiting Answers

1. What are Toolnestr.com's actual theme colors/fonts?
2. Uniform build depth across all 150 tools, or a flagship-tier + lighter-tier split?
3. What's the intended build order — subject-by-subject (Physics → Chemistry → Biology) or highest-demand-first across all three?
4. Who performs the subject-matter accuracy audit before a tool goes live — the user, a subject teacher, or Claude-assisted review only?
5. Where does Biology fit into the batch cadence? The 10+10 ratio was specified only for Chemistry and Physics — Biology's batch size/timing (own 10-tool batches interleaved, or built after Chem/Physics finish) is undecided.

---

## Session Log

| Date | What happened |
|---|---|
| 2026-07-01 | Prototype built (Projectile Motion), fixed through several rounds of bugs (3D rendering, launch button, mobile charts, touch controls). Content deepened (1000+ words, 3 charts, 2 standalone 3D diagrams). Full spec file created. Researched and finalized 150-tool list. Added SEO→GEO strategy section. Added enhancement recommendations. Created this tracker file. |
| 2026-07-02 | Fresh clone of the TOOLNESTR repo pulled. Spec + tracker imported into repo at `docs/subject-tools/`. Discovered the spec/repo mismatch (spec = standalone HTML/Three.js/dark theme; repo = Astro/Tailwind/light theme with ~400 existing tools, many spec tools already built as basic pages). Logged Reconciliation Decisions with the user: build as Astro pages in-repo, enhance existing + create missing, one pilot tool first, theme resolved from repo. |
| 2026-07-02 | **Pilot built:** rebuilt `projectile-motion-calculator.astro` to full spec depth (3D Three.js scene + 3 charts + 2 standalone diagrams + deep content + schema + unit toggle + URL state). Existing calculation logic preserved. Fixed a self-review bug (gravity slider max 30 → 40 so imperial g=32.174 doesn't clamp). |
| 2026-07-02 | **Node.js installed** via winget (OpenJS.NodeJS.LTS, v24.18.0), `npm install` + `npm rebuild esbuild sharp` run. Created `.claude/launch.json` (points at `node.exe node_modules/astro/bin/astro.mjs dev --port 4321`). |
| 2026-07-02 | **Pilot revision (user feedback: "70% good", depth too light, mobile layout issues, credibility missing).** Fixed: (1) mobile comparison table clipped — rebuilt as `table-fixed` centered, all 4 cols fit at 375px (overflow now 0, verified in mobile+dark). (2) Depth added — full kinematic equation set (horizontal + vertical), level-ground range-formula derivation R=v₀²sin(2θ)/g, and an "Assumptions & where the model breaks down" section (drag, Magnus, non-uniform g, Coriolis). (3) Credibility/E-E-A-T (spec §9/§10) — added "Formula sources & further reading" citing OpenStax University Physics + Halliday/Resnick/Walker, Serway, Young/Freedman, plus standard-gravity note. (4) Print-friendly (§10) — `no-print` on interactive widgets + `@media print` stylesheet. Re-audited: zero console errors, zero horizontal overflow on mobile, dark mode confirmed working (site's class-based `.dark` overrides in global.css apply automatically), educational word count now ~well above the 1000 minimum. |
| 2026-07-02 | **New subject categories created (user request: don't reuse existing categories).** Chose 3-subject structure (Physics ⚛️, Chemistry 🧪, Biology 🧬). Added **Physics** and **Chemistry** categories now (each auto-generates `/tools/<id>` page + homepage card + nav); moved Projectile → `physics`, Molarity → `chemistry`. **Biology deferred** until its first tool exists (avoids publishing a live empty/thin category page — homepage lists all categories incl. empty ones). Wired: `tools.js` categories + tool reassignments, `index.astro` catIcons (custom atom SVG for physics, beaker SVG for chemistry), `category-content.js` SEO intro+highlights for both, `ToolLayout.astro` educational disclaimers (physics/chemistry/biology per spec §19), tool-page `category` props (+emoji). Verified in browser: /tools/physics + /tools/chemistry render with correct H1/cards/SEO, homepage shows both, breadcrumbs updated. Build = **487 pages, no errors**. Other basic engineering-science tools (free-fall, half-life, etc.) stay in `engineering` until rebuilt/migrated in later stages. |
| 2026-07-02 | **Batch 1 / stage 1 built + deployed.** Built Chemistry reference tool **Molarity** to full flagship depth (3D beaker + 3 charts + 2 diagrams + deep content + sources + print), audited clean (desktop+mobile+dark, zero console errors), fixed a `text-green-800` dark-contrast bug (→ `text-green-700`). Ran full production build = **485 pages, no errors**. Committed (`96ad8bd`) and **pushed to `origin/main`** → Cloudflare Pages should auto-deploy to live toolnestr.com. Worker (`worker.js`) untouched, no wrangler redeploy needed. **Batch-1 progress: 2 of 20 reference tools done (Projectile = Physics ref, Molarity = Chem ref). Next: extract shared kit from these two, then build the remaining 18 (9 Chem + 9 Physics) in audited stages.** |
| 2026-07-02 | **Dark-mode contrast fix (user feedback):** highlighted 45° table row used `text-indigo-800`, which `global.css` has NO `.dark` override for → dark-blue text on dark row, unreadable. Changed to `text-indigo-700` (has a dark override → #a5b4fc). Verified in dark mode (computed color rgb(165,180,252) on rgb(30,41,59) = good contrast). **NOTE for shared kit:** only `text-indigo-500/600/700` have dark overrides — never use `text-indigo-800/900` on tool pages. **Shared layout fixed (user approved):** `ToolLayout.astro` "All tool categories" accordion header `text-indigo-800` → `text-indigo-700`. Fixes the same low-contrast dark-mode bug on ALL ~400 tool pages. Verified: computed color now rgb(165,180,252) in dark mode. |
| 2026-07-02 | **Shared kit extracted (Phase 1.5 prep).** Pulled the ~120 lines duplicated verbatim across both flagships into `public/subject-kit.js` = `window.STK`: `el`, `reduceMotion`, two number formatters (`fmt2` fixed-2dp, `fmtSig` 4-sig/scientific), `chartSetup()` (Chart.js defaults + base options), `makeScene(container, camRadius, target, opts)` (Three.js orbit scene w/ mouse+touch, opts override light/azim/pol so each tool keeps its exact look), `arrow(from, to, color)`, and `mountResize(objects)`. New `src/components/SubjectToolLibs.astro` emits the Three.js + Chart.js CDN tags + `/subject-kit.js` (one import line replaces the copy-pasted `<script>` boilerplate). Loaded same-origin — CSP `script-src 'self'` already allows it. **Refactored BOTH flagships onto the kit** (projectile + molarity): removed their local `makeScene`/`fmt`/`arrow`/Chart.defaults/resize handlers, now destructure from `window.STK`. Build clean = **487 pages**, `dist/subject-kit.js` present, both pages reference it. Live-preview step skipped per user (logic-identical extraction; verified by build + grep that no local dupes remain). **Next: build the remaining 18 (9 Physics + 9 Chemistry) at uniform flagship depth on top of STK.** |
| 2026-07-02 | **Pilot audited (spec §12 browser loop) — CLEAN PASS.** Ran Astro dev server, loaded the page via Preview automation. Desktop: THREE+Chart loaded, all 3 canvases render, default calc correct (45°→40.77 m / 10.19 m / 2.88 s / 20.00 m/s), slider↔number sync OK, invalid input (speed 0) shows correct message, unit toggle converts (20 m/s→65.62 ft/s, g→32.17), reset + Launch OK, **zero console errors**. Mobile (375px): charts sized 317×214 (not squished, maintainAspectRatio working), 3D canvases render, comparison table has horizontal scroll, zero console errors. **Bug caught & fixed by the audit:** worked example 2 prose had wrong numbers (t 3.05→3.04 s, range 52.83→52.72 m, impact 24.9→**26.35 m/s**) — corrected to match the (correct) calculator output. Remaining note: 3D touch-drag orbit handlers are wired + code-verified but not exercised via synthetic touch events. Awaiting user's final visual sign-off to mark `Audited, not published`. |

---

## Batch 1 deploy set — 10 flagship tools complete (2026-07-02)

**5 Physics + 5 Chemistry, all on `window.STK`, all builds clean (491 pages), pushed to origin/main
(Cloudflare Pages auto-deploy — wrangler is NOT authed on this machine, so deploy goes via git push,
not `wrangler pages deploy`).** Live-preview audit skipped per user; formula/golden-vector checks kept
and hand-verified per tool.

| Subject | Tools (commit) |
|---|---|
| Physics | Projectile (ref), Free Fall `f41b5f1`, Momentum `f95da76`, Force/F=ma `e5607f0`, Uniform Circular Motion `5018c59` |
| Chemistry | Molarity (ref), Dilution `3b8bdd4`, Percent Concentration `f4e66e9`, PPM `20f912a`, Molality `ee0ed01` |

Kit: `7217f73`. New pages created: uniform-circular-motion, percent-concentration, ppm, molality.
Enhanced-in-place (moved to physics/chemistry category): free-fall, momentum, force, dilution.

**Remaining Batch-1 tools (not yet built), to continue next:** Physics — Elastic Collision,
Inelastic Collision, Impulse (own page), Torque, Angular Acceleration. Chemistry — Normality,
Molar Mass (enhance existing atomic-mass), Chemical Equation Balancer, Limiting Reagent, Percent Yield.
(Spec lists 10+10 per batch; the deploy set above is the first shippable half.)

## How to resume this project in a new session

Both files live in the repo at **`docs/subject-tools/`**.

1. Read `toolnestr-subject-tools-project-spec.md` for the rules/template/tool list (rarely changes).
2. Read this file (`toolnestr-progress-tracker.md`) for current status — **including the "Reconciliation Decisions" section, which overrides the spec where they conflict** (the spec's HTML/Three.js/dark-theme assumptions do NOT apply; build Astro pages in the repo).
3. Check the **Tool Status Log** above to see what's built vs. not.
4. Check **Open Questions** — resolve any that are blocking the next step.
5. Continue from there — no need to re-read the full chat history.
