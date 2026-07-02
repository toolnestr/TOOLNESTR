# Toolnestr.com — Subject Tools Project Specification

**Project:** Interactive, education-first calculator/tool pages for students, covering Physics, Chemistry, and Biology.
**Prototype built:** Projectile Motion Calculator (Physics) — used as the reference template for every tool that follows.
**Status:** Prototype approved on both desktop and mobile. Ready to use as the base template for the full tool library.

---

## 1. Project Goal

Build a library of subject-specific tools for students on Toolnestr.com that go far beyond a simple calculator. Each tool page must feel like a **complete learning experience**: a working calculator, a visual/3D explanation of the concept, and thorough educational material — not just a number-in, number-out utility.

Core requirement, stated directly: *"not a simple description but a to Z plan having beautiful professional tool pages where students feel good to use."*

---

## 2. Required Page Anatomy (the template every tool page must follow)

Every tool page is built from these sections, in this order:

1. **Hero section** — tool name, one-line purpose, subject badge (Physics / Chemistry / Biology), a "why this matters" hook.
2. **The calculator** — clean inputs, live results, unit toggle (metric/imperial where relevant), a reset/example button so first-time users see it working instantly.
3. **3D / animated visualization tied to the calculator** — runs alongside the calculator, updates live as inputs change. This is what separates a "calculator" from a "simulator."
4. **"How it works" explainer** — the underlying formula/concept broken into plain-English steps, each variable explained individually, not just symbols.
5. **Real-world context / purpose** — why the concept matters, where it's used professionally, 2–3 real examples with actual explanatory paragraphs (not just short label cards).
6. **Worked example(s)** — at least one fully solved problem with real numbers; a second example is required if the tool has an important edge case (e.g. asymmetric launch height) so students see both the standard case and the exception.
7. **Related tools** — cross-links to adjacent calculators in the same subject, to keep students on-site.
8. **FAQ** — 3–5 common student questions, also useful for SEO.

### Content depth requirement
- Educational content (excluding the calculator/UI itself) must be **1000+ words** of real, substantive explanation — not filler.
- Must include a **comparison misconceptions section** addressing common student misunderstandings about the topic.
- Must include a **data/comparison table** where relevant (e.g. angle vs. range vs. time).

### Visualization requirements (minimums, confirmed in chat)
- **Minimum 3 graphs/charts** per tool page. On the Projectile Motion prototype these are:
  1. Height vs. Time (live, tied to calculator inputs)
  2. Velocity Components vs. Time (live, tied to calculator inputs)
  3. A conceptual comparison chart independent of the calculator (e.g. Range vs. Angle)
- **Minimum 2 additional 3D diagrams in the education section, separate from the interactive calculator.** These illustrate a concept on their own (auto-rotating, not user-dependent) and do NOT change based on calculator input. On the prototype these are:
  1. Velocity vector decomposition diagram (splitting launch velocity into horizontal/vertical components)
  2. Family-of-trajectories diagram (same speed, five different angles, showing range symmetry)
- Total on the prototype: **1 interactive 3D calculator scene + 2 educational 3D diagrams + 3 charts.**

---

## 3. Design Direction

### Theming instruction (important — applies to every future tool)
> The visual design should **not be identical** to the prototype's exact color palette. When integrated into Toolnestr.com, each tool page should be **touched to match the website's actual theme** — but should keep the same structural DNA (layout, sections, interactivity pattern, content depth) that was validated in this prototype.

In other words:
- **Keep:** page structure, section order, interactivity patterns, content depth/rules, chart/3D minimums, mobile behavior patterns.
- **Adapt:** exact colors, fonts, and decorative details to match Toolnestr.com's existing site theme once that theme is shared/confirmed.

### Prototype design tokens (reference only — subject to being restyled to match the live site)
- **Palette:** deep navy background (`#0B1120`), raised panel (`#111a2e`), cyan accent (`#4FD1FF`), amber accent (`#FFB86B`), green accent (`#34D399`), dimmed text (`#94A3B8`).
- **Type:** Space Grotesk (display/headings), Inter (body), JetBrains Mono (data, formulas, labels).
- **Subject color-coding concept:** blue = Physics, green = Chemistry, purple = Biology (badge in nav indicates subject) — this pattern should carry over even if exact hues change to match the site theme.

---

## 4. Technical Stack

- **Calculators:** vanilla JavaScript, no backend, instant client-side computation.
- **3D visualizations:** Three.js (r128, loaded from cdnjs).
- **Charts/graphs:** Chart.js (4.4.0, loaded from cdnjs).
- **Fonts:** Google Fonts (Space Grotesk / Inter / JetBrains Mono, subject to theme change).
- **Single-file architecture:** each tool page prototype is self-contained HTML/CSS/JS (no build step), making it easy to audit and drop into the site individually.

---

## 5. Mobile Requirements & Lessons Learned (critical — apply from day one on every future tool)

The prototype initially failed on mobile. Root causes and fixes, documented here so they are **not repeated** on future tools:

### Bug 1 — 3D canvas not rendering
**Cause:** container div used `min-height` instead of `height`; CSS `height:100%` on a child cannot resolve against a parent that only has `min-height`, so the canvas collapsed to zero size.
**Fix:** always give 3D scene containers an explicit `height` (fixed px value or fixed via media query), never rely on `min-height` alone for anything holding a canvas.

### Bug 2 — Launch button silently did nothing
**Cause:** JavaScript init order bug — `updateAll()` was called before `initThree()`, so code tried to move a 3D object that didn't exist yet. This threw an error and **halted the rest of the script**, including the code that attaches the Launch button's click listener.
**Fix:** strict init order — Three.js scene objects must exist before any function that touches them runs. Wrap init calls in `try/catch` per step so one failure can't silently break unrelated features (e.g. a chart failing should never take down the Launch button).

### Bug 3 — Charts squished/broken specifically on mobile
**Cause:** canvas elements had a fixed HTML `height` attribute AND a conflicting CSS-forced size — Chart.js's internal sizing logic got confused between the two, producing squished graphs, oversized legend swatches, and broken axis scaling (visually confirmed via screenshots on-device).
**Fix:** never set a `height` attribute on chart canvases. Wrap each canvas in a container div with an explicit CSS height, and always set `maintainAspectRatio:false` in Chart.js options so the chart fills its container exactly instead of computing its own conflicting ratio.

### Bug 4 — 3D scene not draggable/orbitable on mobile
**Cause:** orbit controls were built with `mousedown`/`mousemove`/`mouseup` only — these don't fire from touch input.
**Fix:** added parallel `touchstart`/`touchmove`/`touchend` handlers mirroring the mouse-drag logic, plus `touch-action: none` on the canvas so the browser doesn't intercept the gesture as a page-scroll.

### General mobile checklist for every future tool page
- [ ] Dedicated `@media (max-width: 640px)` breakpoint tightening: nav, hero, section padding, font sizes.
- [ ] 3D canvases: explicit height (smaller than desktop, e.g. ~220–300px), touch-drag support, touch-action:none on the canvas only (not the whole page).
- [ ] Charts: wrapped in fixed-height containers, `maintainAspectRatio:false`, no conflicting height attributes.
- [ ] Wide tables (comparison tables): wrapped in a horizontally scrollable container so they never break mobile layout.
- [ ] Grids (related tools, context cards): collapse from 3–4 columns → 2 → 1 as screen shrinks.
- [ ] Orientation-change handling: force a resize event on rotate so 3D/chart canvases don't stay stretched.
- [ ] Every init step wrapped defensively so a failure in one widget can't disable the rest of the page's interactivity.

---

## 6. Rollout Plan

1. **Template lock-in** — Projectile Motion (Physics) is the approved reference template for structure, content depth, chart/3D minimums, and mobile behavior.
2. **Theme adaptation** — once integrated with Toolnestr.com, apply the site's actual visual theme (colors/fonts) while preserving the structural template above.
3. **One tool at a time** — each new tool (Physics, then Chemistry, then Biology) is built individually against this spec.
4. **Audit before publishing** — each tool goes through a strict content/education-material audit before being added live to the site (accuracy of formulas, correctness of worked examples, no broken interactivity on desktop or mobile).
5. **Subject order** — Physics first (highest search demand for calculators), then Chemistry, then Biology, based on earlier discussion — subject to revision once the actual tool list is finalized.
6. **Tool selection** — the specific list of tools to build per subject is to be discussed and finalized next (see open item below).

---

## 7. Open Items / Next Steps

- [ ] Confirm Toolnestr.com's actual site theme (colors, fonts, existing UI patterns) so future tools can be restyled to match while keeping this structural template.
- [x] Finalize the list of specific tools to build per subject — see **Section 8: Full Tool List** below (50 tools per subject, 150 total, research-based).
- [ ] Set the audit checklist/process each tool must pass before going live.
- [ ] Decide subject color-coding hex values once tied to the real site theme.

---

## 8. Full Tool List (50 per subject — research-based, not guessed)

**Selection methodology:** every tool below already exists as a standalone tool on established calculator platforms (Omni Calculator, Calculator Academy, ChemCalc, Roboculator, etc.), which is direct evidence of real, ongoing student search demand. Tools that Google already answers directly in a featured snippet or instant-answer box (plain unit conversion, currency conversion, generic percentage/basic math) were deliberately excluded — those tools get zero click-through since the user's need is met on the Google results page itself, and were the "dumb, unusable" category flagged explicitly during this project. Every tool listed here requires a real interface, so a student has to land on the actual page to get their answer. Human biology / personal-health calculators (BMI, BMR, heart rate zones, etc.) are excluded per instruction.

### Physics (50)

**Mechanics & Kinematics**
1. Projectile Motion Calculator ✅ *(built — reference template)*
2. Free Fall Calculator
3. Uniform Circular Motion Calculator
4. Newton's Second Law (F=ma) Calculator
5. Momentum Calculator
6. Elastic Collision Calculator
7. Inelastic Collision Calculator
8. Impulse Calculator
9. Torque Calculator
10. Angular Acceleration Calculator
11. Moment of Inertia Calculator
12. Centripetal Force Calculator
13. Terminal Velocity Calculator
14. Escape Velocity Calculator
15. Average Velocity Calculator
16. Acceleration Calculator

**Energy & Work**
17. Kinetic Energy Calculator
18. Gravitational Potential Energy Calculator
19. Work Calculator (W=Fd)
20. Power Calculator
21. Work-Energy Theorem Calculator
22. Mechanical Efficiency Calculator

**Electricity & Magnetism**
23. Ohm's Law Calculator
24. Series Resistor Calculator
25. Parallel Resistor Calculator
26. Electric Power Calculator (P=VI)
27. Capacitance Calculator
28. Coulomb's Law Calculator
29. Electric Field Calculator
30. Magnetic Force Calculator

**Waves & Sound**
31. Wave Speed Calculator (v=fλ)
32. Doppler Effect Calculator
33. Simple Pendulum Period Calculator
34. Simple Harmonic Motion Calculator
35. Frequency Calculator
36. Wavelength Calculator
37. Sound Intensity Calculator

**Thermodynamics**
38. Heat Transfer Calculator (Q=mcΔT)
39. Thermal Expansion Calculator
40. Specific Heat Calculator

**Fluids & Pressure**
41. Pressure Calculator
42. Buoyancy (Archimedes' Principle) Calculator
43. Bernoulli's Equation Calculator
44. Density Calculator

**Optics**
45. Snell's Law (Refraction) Calculator
46. Thin Lens Equation Calculator
47. Mirror Equation Calculator

**Gravity & Astrophysics**
48. Weight on Other Planets Calculator
49. Newton's Law of Gravitation Calculator
50. Orbital Velocity Calculator

### Chemistry (50)

**Solutions & Concentration**
1. Molarity Calculator
2. Dilution Calculator (M₁V₁=M₂V₂)
3. Percent Concentration Calculator
4. Molality Calculator
5. Normality Calculator
6. Parts Per Million (ppm) Calculator

**Stoichiometry**
7. Molar Mass Calculator
8. Chemical Equation Balancer
9. Limiting Reagent Calculator
10. Percent Yield Calculator
11. Theoretical Yield Calculator
12. Actual Yield Calculator
13. Mole Ratio Calculator
14. Empirical Formula Calculator
15. Molecular Formula Calculator

**Acid-Base & Equilibrium**
16. pH Calculator
17. pOH Calculator
18. Buffer / Henderson-Hasselbalch Calculator
19. Ka/Kb Equilibrium Constant Calculator
20. Titration Calculator
21. Equilibrium Constant (Keq) Calculator
22. Reaction Quotient (Q) Calculator
23. Neutralization Reaction Calculator

**Gas Laws**
24. Ideal Gas Law Calculator (PV=nRT)
25. Combined Gas Law Calculator
26. Boyle's Law Calculator
27. Charles's Law Calculator
28. Gay-Lussac's Law Calculator
29. Dalton's Law (Partial Pressure) Calculator

**Atomic & Periodic**
30. Interactive Periodic Table
31. Atom Calculator (protons/neutrons/electrons)
32. Electron Configuration Calculator
33. Avogadro's Number Calculator
34. Atomic Mass Calculator
35. Isotope Calculator

**Thermochemistry**
36. Enthalpy Calculator
37. Entropy Calculator
38. Gibbs Free Energy Calculator
39. Calorimetry Calculator
40. Bond Energy Calculator

**Electrochemistry**
41. Nernst Equation Calculator
42. Cell EMF Calculator
43. Faraday's Law of Electrolysis Calculator

**Kinetics & Nuclear**
44. Reaction Rate Calculator
45. Half-Life (Radioactive Decay) Calculator
46. Arrhenius Equation / Activation Energy Calculator
47. Rate Constant Calculator

**Solution Properties**
48. Boiling Point Elevation Calculator
49. Freezing Point Depression Calculator
50. Vapor Pressure Calculator

### Biology (50) — excludes human biology / personal health tools

**Genetics**
1. Punnett Square Calculator (monohybrid)
2. Dihybrid Cross Calculator
3. Trihybrid Cross Calculator
4. Hardy-Weinberg Allele Frequency Calculator
5. Genotype Frequency Calculator
6. Codominance Calculator
7. Incomplete Dominance Calculator
8. Chi-Square Goodness of Fit Calculator (genetics)
9. Genetic Drift Simulator
10. Recombination Frequency Calculator
11. Sex-Linked Trait Punnett Calculator
12. Pedigree Chart Analyzer

**Molecular Biology (DNA/RNA)**
13. DNA → mRNA Transcription Tool
14. mRNA → Protein Translation Tool (codon table)
15. DNA/RNA Base-Pairing Calculator
16. GC Content Calculator
17. DNA Melting Temperature (Tm) Calculator
18. Reverse Complement Sequence Tool
19. Codon Usage Calculator
20. Restriction Enzyme Cut-Site Finder
21. PCR Primer Annealing Temperature Calculator
22. DNA Concentration (A260) Calculator

**Cell Biology**
23. Microscope Magnification Calculator
24. Surface Area-to-Volume Ratio Calculator (cell)
25. Osmosis / Tonicity Predictor
26. Mitosis Stage Identifier (interactive diagram)
27. Cell Doubling Time Calculator

**Ecology**
28. Exponential Population Growth Calculator
29. Logistic Growth / Carrying Capacity Calculator
30. Population Density Calculator
31. Predator-Prey (Lotka-Volterra) Simulator
32. Shannon Diversity Index Calculator
33. Energy Pyramid / 10% Rule Calculator
34. Mark-Recapture Population Estimator
35. Biomass Calculator

**Microbiology**
36. Bacterial Growth Rate Calculator
37. Generation (Doubling) Time Calculator
38. Serial Dilution Calculator
39. CFU per mL Calculator
40. Microbial Growth Curve Plotter

**Evolution**
41. Natural Selection Simulator (allele frequency over generations)
42. Hardy-Weinberg Equilibrium Checker
43. Simple Phylogenetic Tree Builder
44. Speciation Rate Estimator

**Biochemistry**
45. Michaelis-Menten Enzyme Kinetics Calculator
46. Protein Molecular Weight Calculator
47. Amino Acid Sequence Analyzer
48. pH-Enzyme Activity Simulator

**Photosynthesis & Respiration**
49. Photosynthesis Rate Calculator (light intensity vs. O₂ output)
50. Cellular Respiration Equation Balancer

---

## 9. SEO → GEO Strategy (added — search landscape has shifted)

### What changed
Search discovery has shifted from pure SEO (ranking in a list of blue links) toward **GEO — Generative Engine Optimization** (also called AEO, Answer Engine Optimization, or "AI search optimization"). This is a real, current shift, not a minor trend:

- A large and growing share of Google searches now end **without a click at all** — the answer is generated directly on the results page via AI Overviews, and the user never visits any website.
- Beyond Google itself, users increasingly ask ChatGPT, Perplexity, Gemini, and Copilot directly instead of going to a search engine at all.
- **Critically: GEO does not replace SEO — it sits alongside it.** A large share of what shows up in AI Overviews is still pulled from content that already ranks well organically (top 10 / top 100 results). Traditional SEO fundamentals (site speed, mobile-friendliness, quality content, authority) remain the foundation GEO is built on top of.

### The core difference
- **SEO** optimizes to win a **ranking position** → earn a **click** → convert on-site.
- **GEO** optimizes to be **the source an AI trusts enough to cite, quote, or summarize** → the brand/content gets surfaced **inside the AI's answer itself**, often with zero click required.

An AI engine doesn't rank pages — it **selects what to cite**. That means a page can rank #1 on Google and still be completely absent from every AI-generated answer on the same topic. Ranking and AI-citation are two different, only loosely related outcomes.

### What actually earns citation in AI answers (the solution — apply to every tool page)

1. **Extractable, direct-answer formatting.** Every tool page should state its core answer/formula/definition in one clean, self-contained sentence before elaborating on it. AI systems lift clean discrete claims far more easily than they lift narrative paragraphs — structured, "direct answer first" content can start appearing in AI Overviews within roughly 2–4 weeks of publishing, depending on domain authority.
2. **Schema markup / structured data.** Add appropriate schema to every tool page so AI crawlers can parse exactly what the page is instead of inferring it from raw HTML:
   - `FAQPage` schema on the FAQ section (already part of the required template — Section 2).
   - `HowTo` schema on the "How it works" step-by-step section (already part of the required template).
   - `SoftwareApplication` / `WebApplication` schema for the calculator/tool itself.
   - `Article` / `EducationalOccupationalCredential`-adjacent schema for the educational content body where relevant.
3. **E-E-A-T signals (Experience, Expertise, Authoritativeness, Trustworthiness).** This is the single most repeated factor across current guidance for both SEO and GEO. Concretely, for Toolnestr, this means: correct, double-checked formulas; visible sourcing/credibility where relevant; the content-depth rules already locked into this spec (1000+ words, worked examples, misconceptions section) — these were already GEO-aligned decisions before this section was written, they just need schema layered on top now.
4. **Claim → evidence → implication structure.** Content that leads with a direct claim, backs it with a specific number/formula/data point, and closes with a clear takeaway is far more likely to be extracted into a generative answer than content written as a flowing narrative. Apply this specifically inside the "How it works" and "Worked example" sections of every tool page.
5. **FAQ sections are high-value GEO real estate.** The FAQ block already required in the template (Section 2, item 8) is one of the best-performing content shapes for AI citation, because it's already in question→answer form — the exact shape an AI engine wants to lift directly. No structural change needed here, just make sure `FAQPage` schema is always attached.

### Practical implication for this project
The page template already locked in (Section 2) — hero, calculator, "how it works" with clear variable-by-variable breakdown, worked examples with real numbers, misconceptions section, FAQ — is **already structurally aligned with GEO best practice**. The only additions needed going forward are:
- [ ] Add schema markup (`FAQPage`, `HowTo`, `SoftwareApplication`) to the page template as a standard, non-optional step in the build process for every tool.
- [ ] Ensure every "How it works" section opens with one direct, extractable sentence stating the core formula/answer before the fuller explanation.
- [ ] Keep pursuing traditional SEO fundamentals in parallel (site speed, mobile performance, clean URLs) — GEO is not a replacement for these, it's built on top of them.
- [ ] Treat this as a standing requirement for every future tool, not a one-time task — add it to the audit checklist referenced in Section 6, item 4.

---

## 10. Enhancements to Adopt (recommended additions to the core spec)

These strengthen the project beyond what was originally required — recommended for adoption before scaling to the full 150-tool build.

### Performance / Core Web Vitals
Every tool page currently loads Three.js + Chart.js in full on page load. Across 150 pages this is a real page-speed cost, and site speed remains a foundational ranking factor for both SEO and GEO.
- [ ] Lazy-load Three.js and Chart.js only when their respective sections scroll into view, rather than blocking initial page load.

### Progressive fallback (hardened beyond try/catch)
The mobile bugs found during the prototype (Section 5) showed that a single script failure can silently break unrelated features.
- [ ] Every tool must render a genuinely usable page even if Three.js/Chart.js fails to load entirely: the calculator and all text/educational content must work independently of the visualization layer, not merely avoid crashing.

### Shareable / deep-linkable calculator state
- [ ] Encode current calculator inputs into the URL query string (e.g. `?v=25&angle=40&h=0`) so students/teachers can bookmark or share an exact configuration. This also gives distinct input states their own indexable, shareable URL.

### Subject hub pages
Beyond the 150 individual tool pages, each subject needs a central landing page.
- [ ] Build one hub page per subject (Physics, Chemistry, Biology) linking to every tool in that subject. This supports both site navigation and GEO/SEO — search engines and AI crawlers reward clear topic clusters anchored by a central page, not just isolated leaf pages.

### Accessibility
- [ ] Respect `prefers-reduced-motion` — auto-rotating 3D educational diagrams must stop rotating when this OS-level setting is enabled.
- [ ] Confirm keyboard navigation works natively on all calculator sliders/inputs (include as an explicit audit check, not just an assumption).
- [ ] Run a WCAG AA contrast check once real site-theme colors are applied — dark themes in particular can fail contrast on secondary/dimmed text.

### Formula sourcing (hardens E-E-A-T / GEO trust signals)
- [ ] Every tool's core formula must be traceable to a standard reference (textbook-level source), documented internally during the audit step. Doesn't need to be shown on-page, but creates a paper trail if a formula is ever challenged and strengthens the trustworthiness signal referenced in Section 9.

### Print-friendly worked examples
- [ ] Add a simple print stylesheet so students can print or save the worked-example section for offline study.

---

## 11. Progress Tracking (companion file)

This spec file is the **fixed reference document** — the rules, template, tool list, and lessons learned don't change often. Build progress, however, changes constantly, so it's tracked separately.

**Instruction:** maintain a second file, `toolnestr-progress-tracker.md`, alongside this one. Every time work happens on this project (a tool gets built, audited, published, or a decision changes), update the tracker — not this spec file. This lets any future session pick up exactly where the last one left off without re-reading the entire conversation history:

- [ ] Whenever asked to "continue" or "pick up where we left off" on this project, read `toolnestr-progress-tracker.md` first to get current status before doing anything else.
- [ ] Log every tool as one of: Not started / In progress / Built, not audited / Audited, not published / Live.
- [ ] Log any decisions made outside this spec (e.g. real site theme colors once confirmed, tier system if adopted, order changes).
- [ ] Keep this spec file itself stable — only edit it if a core rule genuinely changes (e.g. the 3-chart/2-diagram minimum gets revised), not for routine status updates.

---

## 12. Audit Process (browser-first, iterative loop, performed by Claude before any tool is considered done)

Every one of the 150 tools goes through an **iterative audit loop** before being marked "Audited, not published" in the tracker. All of it is performed by Claude, not the user — the goal is that you only get involved for a final quick visual confirmation, not for finding bugs yourself the way earlier rounds of this conversation required.

**Order matters:** browser-based testing runs **first** — it catches real, user-facing failures directly, exactly the kind of bug that plain code-reading missed on the prototype (e.g. the Launch button silently failing). Source code review runs **second**, to trace the root cause of whatever the browser pass surfaced, and to catch anything not visible through interaction alone (formula correctness, content depth, schema markup). Browser testing then runs **again** to verify the fix actually worked. **This loop — browser → code → browser — repeats until a full pass comes back completely clean, not just once.**

### Step A — Browser-based test pass (first, real browser via Claude Code)
This project's `.md` files are used in **Claude Code**, which has real browser automation available — so this is a literal test, not a simulation.
- [ ] Launch the tool page in a real, automated browser session.
- [ ] **Desktop pass:** load at desktop viewport size, interact with every calculator input, trigger the Launch/interaction control, confirm the 3D calculator scene renders and responds, confirm all charts render correctly, confirm both standalone 3D educational diagrams render, check the browser console for JS errors.
- [ ] **Mobile pass:** load at mobile viewport size (and re-check after simulated orientation change), confirm touch-drag orbit works on the 3D calculator, confirm charts are not squished/broken, confirm the comparison table scrolls horizontally instead of breaking layout, confirm the Launch button and all interactive elements respond correctly, check the browser console for JS errors.
- [ ] Take a screenshot at each pass (desktop + mobile) as part of the audit record.
- [ ] Log every issue found, however small.

### Step B — Source code audit (second, root-cause fix)
- [ ] For each issue found in Step A, trace it to its root cause in the code and fix it — not just patch the symptom.
- [ ] **Known-bug checklist** — explicitly re-check against every root cause found in Section 5: no `min-height`-only containers for canvases, correct init order (Three.js objects created before anything references them), no conflicting canvas `height` attribute + CSS size, `maintainAspectRatio:false` set on every chart, touch handlers present alongside mouse handlers, every init step wrapped so one failure can't silently break the rest.
- [ ] **Template completeness** — confirm all 8 required sections from Section 2 are present, and the visualization minimums are met (3 charts, 2 standalone 3D diagrams, 1 interactive 3D calculator, or the reasoned exception discussed for numeric-only tools).
- [ ] **Content depth check** — word count ≥1000 on educational content, worked example(s) present, misconceptions section present, comparison table present where applicable.
- [ ] **Formula correctness** — manually verified against a standard reference (ties to the E-E-A-T requirement in Section 9/10).
- [ ] **Schema markup present** — `FAQPage`, `HowTo`, `SoftwareApplication` as required in Section 9.
- [ ] **QA test-input matrix** — run the edge-case input set defined in Section 15.

### Step C — Browser verification pass (repeat Step A to confirm the fix)
- [ ] Re-run the full Step A checklist (desktop + mobile) after every code fix.
- [ ] If any issue remains, or a new one appears, return to Step B. **Repeat Step B → Step C until a full pass comes back completely clean — zero console errors, zero visual issues, on both desktop and mobile.**
- [ ] Only once a fully clean browser pass is achieved is the tool marked as having passed the audit loop.

### Audit outcome states (used in the tracker)
`Built, not audited` → `In audit loop (browser/code cycle)` → `Clean pass achieved (desktop + mobile confirmed)` → `Audited, not published` → `Live` (after publishing to the site).

---

## 13. Shared Component Library (highest priority — prevents 150x duplicate maintenance)

Instead of each tool being one fully standalone file with its own copy of every UI pattern, all 150 tools share one common CSS/JS "kit," imported/reused rather than re-written per tool.

**Shared components:**
- Slider + label + live-value display (the pattern used for velocity/angle/height inputs)
- Result card grid (the 2x2 stat display pattern)
- Chart container wrapper (fixed-height div + `maintainAspectRatio:false` Chart.js defaults, pre-solved so the mobile squish bug from Section 5 can never recur)
- 3D scene container wrapper (fixed-height div + mouse+touch orbit controls, pre-built once instead of rewritten per tool)
- Nav bar + subject badge
- FAQ accordion
- Related-tools card grid
- Data/comparison table + horizontal-scroll wrapper for mobile
- Reset/example button
- Launch/interaction trigger button

**Rule:** any fix or design change made to a shared component (e.g. a future color-theme update, or a bug fix) is made **once**, in the shared kit, and every tool that uses it inherits the fix — no editing 150 files individually.

---

## 14. Input Validation & Error-State Rules

Every calculator input follows the same validation standard, so bad input never produces a broken/NaN result silently:
- [ ] Every slider has a hard min/max clamp matching the physically valid range for that variable (e.g. angle sliders clamp 0–90°, never allow values that produce a negative square root).
- [ ] Any input combination that would produce an invalid result (division by zero, negative square root, etc.) is caught before rendering, and replaced with a plain-language inline message (e.g. "This combination isn't physically possible — try a lower angle") instead of showing `NaN`, `Infinity`, or a broken chart/3D scene.
- [ ] Default/example values are always a known-good, valid combination (the "Reset to example" button always returns to a value that's been verified to render correctly).

---

## 15. QA Test-Input Matrix (folded into Step B of the audit loop)

Beyond "does the code run," Step B (Section 12) now includes running each tool's calculator through a fixed set of edge-case inputs before it's considered passed:
- [ ] Minimum allowed value on every input
- [ ] Maximum allowed value on every input
- [ ] Zero (where applicable and not already the minimum)
- [ ] A "normal" mid-range value (the example/default case)
- [ ] One deliberately invalid/edge combination, to confirm the Section 14 error-state message displays correctly instead of a broken result

This matrix gets logged per-tool in the tracker as part of the Step B result, not just a pass/fail flag.

---

## 16. Numeric Formatting Standard

One consistent rule applied across all 150 tools instead of being decided per tool:
- [ ] Results round to 2 significant decimal places by default (matches the prototype).
- [ ] Chemistry values that are very large or very small (e.g. Avogadro's number, molarity of dilute solutions) use scientific notation automatically past a defined threshold (e.g. below 0.001 or above 100,000) rather than showing a long string of zeros.
- [ ] Units are always shown next to the value, never assumed.
- [ ] Negative-zero and floating-point artifacts (e.g. `-0.00`, `3.0000000004`) are cleaned up before display.

---

## 17. Content Style Guide

Locked so all 150 tools' educational writing reads as if it came from one consistent source, not 150 separately-toned pages:
- [ ] **Reading level:** target roughly grade 9–10 (high-school accessible, not oversimplified, not textbook-dense).
- [ ] **Sentence structure:** prefer shorter, direct sentences in explanatory steps; longer sentences are acceptable in the "why it matters" real-world context section where a more narrative tone fits.
- [ ] **Formula introduction pattern:** every formula is introduced the same way — the formula itself first, then each variable defined individually (matches the prototype's `var-grid` pattern), never a formula dropped in without immediate variable definitions.
- [ ] **Worked examples:** always state the "given" values clearly up front, then solve step by step, arriving at the final answer with units — matches the prototype's `example-box` pattern exactly.
- [ ] **Misconceptions section:** always framed as a false statement in quotes, followed by the correction — matches the prototype's pattern.

---

## 18. Metadata & Social Sharing Standard

One template applied to every tool page instead of decided individually:
- [ ] **Title tag pattern:** `"{Tool Name} — Free {Subject} Calculator with 3D Visualization | Toolnestr"`
- [ ] **Meta description pattern:** one or two sentences stating what the tool calculates and its key differentiator (e.g. live 3D visualization), under ~155 characters.
- [ ] **Open Graph / social image:** a consistent template (subject-color-coded, tool name, a snapshot of the 3D scene or chart) rather than a custom image designed per tool.
- [ ] **Canonical URL pattern:** consistent slug structure across all tools (e.g. `/physics/projectile-motion`, `/chemistry/molarity-calculator`).

---

## 19. Legal / Educational Disclaimer

One standard disclaimer line, reused verbatim across all 150 tools rather than redrafted each time:

> *"This tool is provided for educational purposes to support learning in Physics, Chemistry, and Biology. It is not a substitute for professional engineering, laboratory, or safety-critical calculations."*

- [ ] Placed consistently (e.g. small print in the footer or just below the calculator) on every tool page.

---

## 20. Cross-Subject Linking Rule

In addition to the same-subject "Related tools" section already required in the template (Section 2, item 7):
- [ ] Each tool may optionally include 1–2 cross-subject links where a genuine conceptual connection exists (e.g. Kinetic Energy Calculator ↔ Thermochemistry/Calorimetry Calculator; GC Content Calculator ↔ DNA Melting Temperature Calculator).
- [ ] Cross-links are only added where the connection is real and useful to a student, not forced onto every page — this supports topic-cluster SEO/GEO signals (Section 9) without diluting relevance.

---

## 21. Post-Publish Correction Process

If a formula error or bug is found in a tool that's already live:
- [ ] Fix is made directly to the shared component or the specific tool file as needed.
- [ ] Tool is re-run through the full audit loop (Section 12) before being re-published.
- [ ] Correction is logged as one line in the tracker's Session Log (`toolnestr-progress-tracker.md`) — date, tool name, what was wrong, what was fixed. No separate approval ceremony needed for routine corrections; only flag to the user if the fix changes the tool's visible behavior or results in a way they'd want to know about.

---

## 22. Prototype File Reference

The working prototype for this spec is `projectile-motion.html` — a self-contained HTML/CSS/JS file implementing every requirement above, tested and confirmed working on both desktop and mobile (including touch-drag 3D interaction and live-updating charts).

**Important note:** this prototype was built in a chat session (not Claude Code), and served purely to **validate the template, rules, and requirements** in this spec — it is not a production tool. It does **not** count as "tool #1 built." When production work begins in Claude Code, this prototype must be **rebuilt from scratch** there, using the shared component library (Section 13) once that exists, rather than treated as a finished, reusable file. Its only role going forward is as a reference for what "done" should look like.

---

## 23. Recommended Build Order (before mass production starts)

**Production batch ratio (per your instruction):** tools are built in batches of **10 Chemistry + 10 Physics** at a time, rather than one tool at a time. This is now the standing cadence for production going forward, not a one-off.

Sequence:

1. **First batch = 10 Chemistry + 10 Physics (20 tools).** Within this first batch, the first 1–2 tools built (one from each subject) double as the reference tools used to extract the shared component library (Section 13) — sliders, result cards, chart wrappers, 3D scene wrappers, nav, FAQ accordion, related-tools grid, tables. The remaining 18 tools in the batch are then built on top of that shared kit once extracted, rather than as standalone files.
2. **Rebuild the original Projectile Motion prototype on top of the shared kit** in Claude Code as part of this same batch, so it becomes the actual production Physics tool #1, not a leftover standalone file (see note in Section 22).
3. Each tool in the batch goes through the full audit loop (Section 12) before being marked ready.
4. **Subsequent batches continue in the same 10+10 ratio** until all 50 Chemistry and 50 Physics tools are complete.

**Open question — Biology:** this instruction only specified Chemistry and Physics for the 10+10 ratio; Biology's place in the batch cadence hasn't been specified yet (e.g. its own 10-tool batches interleaved, or built after Chemistry/Physics are done). Logged in the tracker as an open question rather than assumed.

**Exception:** if a specific tool needs to go live urgently for a deadline (demo, launch date, etc.), it's acceptable to pull it out of batch order — but this should be a deliberate exception, not the default path.
