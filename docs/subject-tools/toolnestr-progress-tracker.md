# Toolnestr.com — Progress Tracker

**Companion file to:** `toolnestr-subject-tools-project-spec.md`
**Location in repo:** `docs/subject-tools/` (both this tracker and the spec live here so any session can resume).
**Purpose:** Live status log. Read this file first when resuming work on this project. The spec file holds the rules; this file holds where things currently stand.
**Last updated:** 2026-07-07 (110/150 tools built — 45 Physics + 45 Chemistry + 20 Biology)

## Batch-7 — Biology category launched, 20 tools complete (2026-07-07, commit `b75173f`)

**First Biology tools built** — resolves the long-open "Biology deferred until its first tool
exists" question from 2026-07-02. Built sequentially by hand, no parallel agents (standing
instruction). Git sync verified before starting.

**Category setup (new, one-time):** added `biology` to the `categories` array in `tools.js`
(🧬 emoji), a DNA-helix homepage icon in `index.astro`'s `catIcons`, and a full SEO
intro/highlights entry in `category-content.js` — following the exact pattern used when Physics
and Chemistry were split out of `engineering` on 2026-07-02. The `biology` disclaimer text in
`ToolLayout.astro` already existed from that same date, so no layout change was needed there.

**20 tools built, picked from spec §8's 50-item Biology list to span every sub-discipline** rather
than clustering in one area — deliberately avoided the UI-heavy "Simulator"/"Builder"/"Identifier"
items (Genetic Drift Simulator, Pedigree Chart Analyzer, Interactive Periodic Table-style Mitosis
Stage Identifier, Simple Phylogenetic Tree Builder) for this first batch in favor of tools with a
well-defined single calculation, same selection bias as Chemistry's "Interactive Periodic Table"
deferral.

- **Genetics (8):** Punnett Square (monohybrid), Dihybrid Cross, Hardy-Weinberg Allele Frequency,
  Codominance, Incomplete Dominance, Chi-Square Goodness of Fit, Recombination Frequency,
  Sex-Linked Trait Punnett.
- **Molecular Biology (6):** DNA→mRNA Transcription, mRNA→Protein Translation (full 64-codon
  standard genetic code table implemented in JS), GC Content, DNA Melting Temperature (Wallace
  rule), Reverse Complement (+ palindrome detection for restriction sites), PCR Primer Annealing
  Temperature.
- **Cell Biology (1):** Surface Area-to-Volume Ratio (cube model, SA:V=6/s).
- **Ecology (4):** Exponential Population Growth, Logistic Growth/Carrying Capacity, Population
  Density, Shannon Diversity Index.
- **Biochemistry (1):** Michaelis-Menten Enzyme Kinetics.

**Slug collision found and resolved:** `exponential-growth-calculator` already existed as a
general Math-category tool (growth/decay/compounding) — the Biology tool was built at
`exponential-population-growth-calculator` instead to avoid overwriting it. Checked all other
planned slugs before writing; no other collisions found.

Post-build audit (code-only, no live browser per user instruction): full `npm run build` = 583
pages, 0 errors (562→583: +20 tool pages +1 new `/tools/biology` category page). 0 duplicate slugs
across all tools. 0 emoji collisions within the new biology category specifically (verified via a
node script scanning `tools.js` for repeated `category: 'biology'` emoji). Independently
re-derived every formula/worked-example outside the pages' own text: Hardy-Weinberg (q²=0.09 →
q=0.3, p=0.7, 2pq=42%, p²=49%), Mendel's classic dihybrid chi-square (χ²=0.4700, matching the
historically famous low value), recombination frequency (60/1000=6%), GC content (ATGCGCATCG=60%),
Wallace-rule Tm (GCGCATGCAT=32°C), reverse complement (ATGCGT→ACGCAT, and confirmed GAATTC is a
true palindrome/EcoRI site), SA:V ratio (s=1→6.0, s=3→2.0), exponential growth (N(10)=271.83,
doubling time=6.93), logistic growth (N(20)≈802.96≈803), Shannon diversity (H'=1.0889,
evenness=0.9912), Michaelis-Menten (v at [S]=Km → 50, at [S]=20mM → 80). All matched exactly.

**Batch-1 through Batch-7 combined: 110 flagship tools (45 Physics + 45 Chemistry + 20 Biology).**
Pushed to origin/main (`b75173f`) — Cloudflare Pages auto-deploy triggered. Remaining un-built:
Physics 5, Chemistry 5 (see Batch-6 entry below for the exact lists), Biology 30 (the rest of
spec §8's 50-item list, including the deliberately-deferred UI-heavy tools). Next: Batch-8, or
finish the last 5+5 Physics/Chemistry tools to complete all 100 non-Biology tools.

## Batch-6 — 10 tools complete (2026-07-07, commit `126f1c5`)

Built sequentially by hand, no parallel agents (same standing instruction as Batch-5). Git sync
verified before starting.

Physics (5, all migrated from basic `engineering`-category pages up to flagship depth, in place —
same slug, original calc logic preserved exactly): Kinetic Energy, Gravitational Potential Energy
(retitled from "Potential Energy Calculator"), Work, Power, Ohm's Law. Chemistry (3 migrated + 2
new): pH, Ideal Gas Law, Half-Life migrated `engineering`→`chemistry`; Boiling Point Elevation and
Freezing Point Depression built new.

Migrating existing pages surfaced 5 emoji collisions the moment they joined the physics/chemistry
category listings (kinetic-energy ⚡ clashed with coulombs-law; ohms-law ⚡ likewise; power 💡
clashed with electric-power; ideal-gas-law 🫧 clashed with neutralization-reaction; ph 🧪 clashed
with molarity, the category's own emoji). All 5 reassigned to unique emoji within their category
(🏃🎚️📶 physics; 💨🌈 chemistry) — verified via a node script that parses `tools.js` and flags any
same-category emoji repeated more than once. One collision found was pre-existing from before this
session (momentum-calculator vs projectile-motion-calculator, both 🎯) — left untouched as it
predates Batch-6.

Post-build audit (code-only, no live browser per user instruction): full `npm run build` = 562
pages, 0 errors (560→562, +2 for the two brand-new chemistry tools; the 8 migrations kept their
existing slugs so added no new pages). 0 duplicate slugs across all ~562 tools. Physics and
Chemistry both land at exactly 45 tools each. Independently re-derived every formula outside
migration: confirmed original two/three/four-of-N solve logic was copied verbatim into the new
template (kinetic energy, potential energy, work, power, Ohm's law, ideal gas law, half-life all
byte-for-byte identical calculation branches, just re-skinned). New tools hand-verified: boiling
point elevation (NaCl ΔTb=2.048°C, glucose ΔTb=1.024°C) and freezing point depression (NaCl
ΔTf=7.44°C, ethylene glycol ΔTf=5.58°C) both match standard colligative-property textbook values.

**Batch-1 through Batch-6 combined: 90 flagship tools (45 Physics + 45 Chemistry).** Pushed to
origin/main (`126f1c5`) — Cloudflare Pages auto-deploy triggered. Remaining un-built: Physics 5 left
(Frequency, Wavelength, Density, Mirror Equation, Newton's Law of Gravitation — see spec §8), Chemistry
5 left (Combined Gas Law, Interactive Periodic Table, Atomic Mass Calculator [single-element lookup],
Rate Constant, Vapor Pressure). Next: Batch-7 (final 5+5 to complete all 100 non-Biology tools),
or pivot to Biology's first tools per the open cadence question.

## Batch-5 — 10 tools complete (2026-07-07, commit `86d59f4`)

Built **sequentially by hand, no parallel agents** (explicit user instruction this round — a
prior attempt to dispatch 3 parallel agents for this batch was caught and aborted mid-flight
before any file was touched). Verified local and origin/main were at the same commit (`528ca6b`)
before starting. Live-browser preview/audit skipped per user instruction — validated via a full
production build only.

Physics: Magnetic Force, Simple Harmonic Motion, Sound Intensity, Thermal Expansion, Bernoulli's
Equation. Chemistry: Isotope Calculator, Atom Calculator, Electron Configuration Calculator, Cell
EMF Calculator, Faraday's Law of Electrolysis Calculator.

All built on `SubjectToolPage` + `window.STK`, 2 static auto-rotating 3D diagrams + 2 Chart.js
charts each, 1000+ words content, 2 worked examples, misconceptions, sources — same pattern as
Batch-1 through Batch-4. Every worked-example calculation hand-verified before writing (electron
config filling order for Iron double-checked for the 4s-before-3d Aufbau exception; chlorine
isotope weighted average ≈35.45 amu matches periodic table; Daniell cell E°cell=1.10V/ΔG°=−212.3
kJ/mol; Faraday's law copper 2.371g and silver 1.006g deposited). Post-build audit (code-only):
full `npm run build` = 560 pages, 0 errors; confirmed all 10 new `dist/tools/<slug>/index.html`
files exist; 0 duplicate slugs across `tools.js`. Emojis chosen to avoid collisions within the
physics/chemistry category listings specifically (🌀🎻🔊📏🛩️ physics; ☢️🔘🔷🔌🪫 chemistry).

**Batch-1 through Batch-5 combined: 80 flagship tools (40 Physics + 40 Chemistry).** Pushed to
origin/main (`86d59f4`) — Cloudflare Pages auto-deploy triggered.

Remaining un-built from spec §8 (10 each, verified against the full 50-item lists):
- **Physics (10):** Kinetic Energy(17), Gravitational PE(18), Work(19), Power(20), Ohm's Law(23),
  Frequency(35), Wavelength(36), Density(44), Mirror Equation(47), Newton's Law of Gravitation(49).
  All but Mirror Equation already exist as basic `engineering`-category pages and are
  migration-eligible (enhance in place + move category), matching the pattern used for Free Fall,
  Force, Momentum, Ohm's-Law-adjacent tools in earlier batches.
- **Chemistry (10):** pH(16), Ideal Gas Law(24), Combined Gas Law(25), Interactive Periodic
  Table(30), Atomic Mass Calculator(34, a simple single-element atomic-mass lookup — distinct
  from Molar Mass #7 and from the multi-isotope `isotope-calculator` built this batch), Half-Life
  (45, exists as `engineering`-category `half-life-calculator`, migration-eligible), Rate
  Constant(47), Boiling Point Elevation(48), Freezing Point Depression(49), Vapor Pressure(50).

Next: Batch-6 (10 more), continuing the 10+10 cadence.

## Batch-4 — 10 tools complete (2026-07-03, commit `0460387`)

Built via 2 parallel agents (5 tools each, per user's explicit "no more than 2 parallel agents"
constraint this round), all directly on the 2-static-diagram viz pattern from the start (no
slider-driven scene ever added).

Physics: Capacitance, Electric Field, Wave Speed, Doppler Effect, Orbital Velocity.
Chemistry: Dalton's Law, Gibbs Free Energy, Bond Energy, Nernst Equation, Arrhenius Equation.

Post-build audit (code-only): 0 duplicate slugs across 527 tools, physics and chemistry both at
exactly 35 tools each, all 10 files confirmed 0 sliders / 2 diagram containers / valid syntax via
`new Function()`. Independently re-derived every formula outside the agents' own reports:
capacitance (E=7.2mJ, Q=1.2mC for 100μF@12V), electric field (71,900 N/C at 0.5m from 2μC),
wave speed (λ=0.7795m at 440Hz/343m/s), Doppler effect (767.09Hz approaching, 643.70Hz receding),
orbital velocity (LEO≈7672.3 m/s at 400km altitude), Dalton's law (P_total=0.9997atm for
simulated-air composition), Gibbs free energy (ΔG=−33.19 kJ/mol, spontaneous at 298K), bond energy
(ΔH≈−802 kJ/mol for methane combustion via bond-energy approximation, close to but not identical
to the ΔHf°-based −890.3 kJ/mol from enthalpy-calculator, as expected), Nernst equation
(E_cell≈1.109V for a Daniell-cell-style example), Arrhenius equation (k≈0.713/s from A/Ea/T, and
Ea≈175.71 kJ/mol from two rate-constant/temperature points). All matched.

**Batch-1 + Batch-2 + Batch-3 + Batch-4 combined: 70 flagship tools (35 Physics + 35 Chemistry) on
the shared template, all built with the corrected 2-static-diagram viz pattern.** Pushed to
origin/main — Cloudflare Pages auto-deploy triggered.

## 3D visualization rule change (2026-07-03, commit `64d6f65` + follow-ups)

**RULE CHANGE — supersedes the 2026-07-02 "one interactive 3D scene" depth policy.** The single
input/slider-driven interactive Three.js scene used on every SubjectToolPage tool (Normality onward)
was reported broken/not rendering by the site owner. It has been removed from all 45 affected tools
and replaced with **two simple, non-interactive, auto-rotating standalone 3D diagrams** — the same
pattern the original 10 Batch-1 flagships (Projectile Motion, Molarity, etc.) already use successfully.
Each diagram: its own `makeScene()` call, static illustrative geometry (arrows, spheres, lines, bars —
no sliders, no live-updating inputs), `s.spin()` auto-rotation in a plain `requestAnimationFrame` loop,
wrapped in its own try/catch inside `boot()`. The 2 Chart.js charts on every tool are unaffected by this
change. This is now documented directly in `src/components/SubjectToolPage.astro`'s header comment —
**all new tools must be built with 2 static diagrams from the start, never a slider-driven 3D scene.**

The Batch-1 flagships were explicitly left untouched during this fix (confirmed via exact-path git diff).
The 45 affected tools were fixed via 12 parallel agents across several rounds; 3 files (Mole Ratio,
Empirical Formula, Henderson-Hasselbalch) were finished by hand after their agents hit a session usage
limit mid-task. Audited: all 45 files pass structural checks (calculator slot, viz slot, exactly 2 diagram
containers, 2 chart canvases) and syntax validation (Node `new Function()`).

## Batch-3 extension — 5 more tools, 10→15 (2026-07-02, commit `cb59c25`)

Extended Batch-3 from 10 to 15 tools per user request, via 5 more parallel agents: Physics — Electric
Power (kWh/cost companion to the existing power-calculator.astro), Snell's Law, Weight on Other
Planets. Chemistry — Charles's Law (standalone deep-dive companion to gas-laws-calculator.astro,
same pattern as Boyle's Law), Calorimetry.

Post-build audit (code-only): 0 duplicate slugs across 512 tools, 0 new emoji collisions. Validated
every inline `<script>`'s syntax via `new Function()`. Independently re-derived every formula: Snell's
law θ2≈22.08° (air→water at 30°) and critical angle≈41.81° (glass→air), all 10 planetary weight
values for a 70kg mass (Mercury 259.0N through Pluto 43.4N), Charles's law V2=2.41L and V2=3.91L
(both requiring careful °C→K conversion), calorimetry q_water=2719.6J / q_reaction=−2719.6J /
ΔH=−54,392 J/mol (sign convention correctly implemented), electric power costs ($0.056 and $0.06).
All matched.

## Batch-3 — 10 more tools complete (2026-07-02, commit `99cfb3c`)

Built via 10 parallel agents (one tool each, same technique as prior batches): Physics — Series
Resistor, Parallel Resistor, Coulomb's Law, Simple Pendulum Period, Heat Transfer. Chemistry —
Reaction Quotient (Q), Boyle's Law, Avogadro's Number, Enthalpy, Reaction Rate.

Post-build audit (code-only, no live browser per standing user instruction): confirmed 0 duplicate
slugs across 507 tools. Found and fixed one emoji collision — `parallel-resistor-calculator` and
`coulombs-law-calculator` both independently picked ⚡; changed parallel-resistor to 🔋. Validated
every inline `<script>`'s JS syntax via `new Function()`. Independently re-derived every core formula
outside the agents' own reports: series R_total=650Ω, parallel 100Ω‖300Ω=75Ω, Coulomb's law F=0.2157N
and F=5.617N, pendulum T=2.006s (L=1.0m) and L=0.994m (T=2.0s), heat transfer Q=502,320J and
Q=−33,637.5J, reaction quotient Q=1250 (vs Kc=0.500, correctly predicts reverse direction), Boyle's
law P2=8.00atm, Avogadro's number 3.011×10²³ particles, enthalpy ΔH=−890.3kJ (methane combustion,
matches the standard textbook value), reaction rate 7.5×10⁻⁴ M/s (correctly distinguishing raw vs
coefficient-normalized rate). All matched.

**Batch-1 + Batch-2 + Batch-3 combined: 50 flagship tools (25 Physics + 25 Chemistry) on the shared
template.** Pushed to origin/main — Cloudflare Pages auto-deploy triggered.

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

**Batch-1 completed (2026-07-02, commits `a742cfc`, `127e746`).** Built a shared page template
`src/components/SubjectToolPage.astro` (data-driven: formulas, worked examples, comparison table,
misconceptions, sources, how-to-use, related tools all render from props; each tool now only
supplies its calculator + one interactive 3D/charts `viz` slot). Depth policy updated: 1 interactive
3D scene + charts per tool (dropped the 2 standalone auto-rotating diagrams). Built the remaining
10 tools on this template using 5 parallel agents:

Physics: Elastic Collision, Inelastic Collision, Impulse, Torque, Angular Acceleration.
Chemistry: Normality, Molar Mass (rebuilt `atomic-mass-calculator.astro`, moved engineering→chemistry),
Chemical Equation Balancer, Limiting Reagent, Percent Yield.

Post-build audit (code-only, live-browser step skipped per user for this batch): verified every
file's `SubjectToolPage` slot/prop wiring, confirmed no duplicate Three.js/Chart.js imports, ran
each tool's inline `<script>` through Node's `Function` constructor to confirm valid JS, and
hand-verified core formulas (elastic/inelastic collision momentum+KE, torque, angular acceleration,
equation-balancer GCD-reduction correctness, limiting-reagent ratio logic) against known values —
all correct. Fixed one emoji collision in `tools.js` (Molar Mass's ⚗️ duplicated Normality's after
the category move; changed to 🔬).

**Batch-1 is fully built: 20 flagship tools (10 Physics + 10 Chemistry) on `window.STK` +
`SubjectToolPage`.** Pushed to origin/main (commits `a742cfc`, `127e746`, `5dcd3fa`) — Cloudflare
Pages auto-deploy triggered.

## Batch-2 — 12 more tools complete (2026-07-02, commit `25c01c5`)

Built via 7 parallel agents (same technique as Batch-1's tail): Physics — Moment of Inertia,
Centripetal Force, Terminal Velocity, Escape Velocity, Average Velocity, Acceleration. Chemistry —
Theoretical Yield, Actual Yield, Mole Ratio, Empirical Formula, Molecular Formula, pOH.

Post-build audit (code-only, no live browser per user instruction this round): confirmed 0 duplicate
slugs and 0 new emoji collisions across all 489 tools (Node ESM import check), validated every
inline `<script>`'s JS syntax via `new Function()`, and independently re-derived formulas outside
the agents' own reports — moment of inertia (disk I=0.25, rod-end/rod-center ratio=4), centripetal
force (car cornering Fc=9600N), terminal velocity (v_t≈53.48 m/s skydiver), escape velocity
(Earth≈11.19 km/s, Moon≈2.375 km/s — both match canonical reference values), pOH (pOH=3.00 from
[OH⁻]=1e-3, pOH=4.5 from pH=9.5), and theoretical yield (thermite 10g Al→20.7g Fe). All matched.

**Batch-2 completed to full parity with Batch-1 (2026-07-02, commits `580e42c`, `9eb1f9d`, `9513a11`).**
Finished the last 7 tools of Batch-2 in three follow-up rounds after the initial 12: Mechanical
Efficiency (solo build), Work-Energy Theorem + Henderson-Hasselbalch (2 parallel agents, committed as
WIP mid-session for cross-machine continuation), then Pressure, Buoyancy (Archimedes), Titration,
Equilibrium Constant (Keq), Neutralization Reaction (5 parallel agents, final round).

Post-build audit for the final round (code-only, no live browser per user instruction): confirmed 0
duplicate slugs across 497 tools and 0 new emoji collisions (physics/chemistry both landed at exactly
20 tools each, only the pre-existing momentum/projectile 🎯 dup remains from before this project).
Validated every inline `<script>`'s JS syntax via `new Function()`. Independently re-derived every
core formula outside the agents' own reports — buoyancy (ice submerged fraction 91.7%, matches the
canonical iceberg figure), pressure (scuba diver at 10m seawater ≈100.6 kPa gauge / ≈201.9 kPa
absolute), titration (0.0896 M and 0.120 M diprotic), equilibrium constant (Kc=2.963 for
N₂+3H₂⇌2NH₃), neutralization (0.0025 mol excess H⁺). All matched.

**Batch-1 + Batch-2 combined: 40 flagship tools (20 Physics + 20 Chemistry) on the shared template —
Batch-2 now matches Batch-1's size exactly, as requested.** Not yet pushed — awaiting user go-ahead.
Remaining un-built from spec §8's Physics/Chemistry lists: Physics 23-50 (electricity/magnetism,
waves/sound, thermodynamics beyond specific-heat basics, fluids beyond pressure/buoyancy, optics,
gravity/astrophysics beyond escape velocity), Chemistry 19/23-50 (Ka/Kb standalone, Reaction Quotient,
remaining gas laws, atomic/periodic section, thermochemistry, electrochemistry, kinetics/nuclear).
Next: Batch-3, or pivot to Biology's first tools per the open cadence question below.

## How to resume this project in a new session

Both files live in the repo at **`docs/subject-tools/`**.

1. Read `toolnestr-subject-tools-project-spec.md` for the rules/template/tool list (rarely changes).
2. Read this file (`toolnestr-progress-tracker.md`) for current status — **including the "Reconciliation Decisions" section, which overrides the spec where they conflict** (the spec's HTML/Three.js/dark-theme assumptions do NOT apply; build Astro pages in the repo).
3. Check the **Tool Status Log** above to see what's built vs. not.
4. Check **Open Questions** — resolve any that are blocking the next step.
5. Continue from there — no need to re-read the full chat history.
