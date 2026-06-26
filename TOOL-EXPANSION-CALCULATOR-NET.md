# ToolNestr — Calculator.net Gap-Fill Expansion Plan (hand this file to the building AI)

Audit date: 2026-06-25. Source: the full calculator.net tool directory (~280 tools across
10 categories) supplied by the site owner. This file lists what's worth building **after**
removing two groups:

1. **All interest/loan/credit/debt-related tools** — per standing site policy (see
   `TOOL-IDEAS-LOW-COMPETITION.md`: "Loan/mortgage/credit/debt tools intentionally excluded").
   Removed: Mortgage, Mortgage Refinance, Mortgage Payoff, Amortization, Auto Loan, Auto Lease,
   Compound Interest, Simple Interest, Personal Loan, Home Equity Loan, HELOC (+ Payment),
   Student Loan (+ Payoff), Credit Card (+ Payoff/Min Payment/Balance Transfer), Debt Payoff,
   Debt Consolidation, Debt-to-Income Ratio, Loan (+ Payment/Comparison), APR, Interest Rate,
   Down Payment, Rent vs Buy, FHA Loan, VA Mortgage, PMI, Business Loan, Commercial Loan,
   Annuity (+ Payout), House/Car Affordability, CD Calculator, CD Ladder Calculator.
2. **Every tool that's an exact or near-exact duplicate of something already live** on
   toolnestr.com (checked against the current 287-entry `src/data/tools.js`, not guessed).

What's left is organized below, grouped to match (and extend) the site's existing category
scheme. Two new categories are proposed (**Construction & Home Improvement**, **Cooking &
Baking**) since the site currently has ~0 coverage there and calculator.net shows real search
demand for both.

---

## GLOBAL RULES — identical to `TOOL-EXPANSION-100.md`, apply to every tool below

1. **700+ words minimum** of real prose per page (intro, how-it-works/formula, worked example,
   use cases, tips, FAQ with full written answers) — same structure as
   `TOOL-DETAILING-EXISTING.md` / `TOOL-BUILD-SPECS.md`, expanded further.
2. **One inline SVG diagram** per page (not decorative — an explanatory formula/flow/comparison
   diagram), `role="img"` + `aria-label`, placed after the intro. Each entry below specifies what
   to draw.
3. **Use `ToolLayout.astro`** for every page — don't hand-roll layout/schema.
4. **1–3 outbound citation links** to authoritative sources for YMYL tools (health, finance,
   chemistry/safety topics like BAC, pH, gas laws where a standards body is relevant).
5. **3+ Related tools links**, both directions.
6. **Meta description 120–155 characters.**
7. Before building anything in this file, **grep `src/data/tools.js` for the slug** to confirm
   it's still not live (this list was deduped against the site as of 2026-06-25, but if time has
   passed, re-check).

---

## PART 1 — Finance (non-loan, non-interest) — 14 tools

| Slug | Tool | Keyword | RPM/Comp | Brief |
|------|------|---------|----------|-------|
| `roi-calculator` | ROI Calculator | "roi calculator" | $$$/Med | Return on investment % from cost and gain, plus annualized ROI if a time period is given. SVG: an investment-in → return-out flow arrow with the ROI % formula labelled. |
| `emergency-fund-calculator` | Emergency Fund Calculator | "emergency fund calculator" | $$$/Low | Recommended fund size (3–6 months expenses) from monthly costs, with a savings-timeline projection to reach it. SVG: a "shield" bar filling up from $0 to the 3–6 month target. |
| `income-tax-calculator-us` | US Income Tax Calculator (Federal) | "federal income tax calculator 2026" | $$$$/Med | Federal bracket-based estimate from filing status + taxable income (cite IRS brackets). SVG: tax-bracket staircase (same style as the country-specific ones in `TOOL-EXPANSION-100.md`). |
| `sales-tax-calculator` | Sales Tax Calculator | "sales tax calculator" | $$$/Med | Add or remove sales tax at any rate; include reverse mode (replaces the separate "decalculator" idea). SVG: price → +tax% → total, with a reverse arrow below showing total → ÷(1+rate) → price. |
| `property-tax-calculator` | Property Tax Calculator | "property tax calculator" | $$$$/Low | Estimated annual property tax from home value × local mill rate/assessment ratio (user-entered rate, since rates vary by county). SVG: home icon with assessed value → ×rate → tax bill breakdown. |
| `paycheck-calculator` | Paycheck Calculator | "paycheck calculator" | $$$$/Med | Net take-home pay per paycheck from gross pay, pay frequency, and standard deduction inputs (federal/state/FICA — flag as estimate). SVG: gross pay bar split into take-home/federal/FICA/state segments. |
| `wacc-calculator` | WACC Calculator | "wacc calculator" | $$$$/Low | Weighted average cost of capital from equity/debt weights and their costs. SVG: a weighted-pie split between cost of equity and after-tax cost of debt feeding into one WACC number. |
| `npv-calculator` | NPV Calculator | "npv calculator" | $$$$/Low | Net present value of a series of cash flows at a discount rate. SVG: a cash-flow timeline (year 0–5) with each flow discounted back, summed into NPV. |
| `irr-calculator` | IRR Calculator | "irr calculator" | $$$$/Low | Internal rate of return solved iteratively from a cash-flow series. SVG: same cash-flow timeline as NPV, with the IRR rate found where NPV = 0 marked on a curve. |
| `401k-calculator` | 401(k) Calculator | "401k calculator" | $$$$/Med | Projected 401(k) balance from contributions, employer match, and growth rate over time. SVG: a growing stacked bar (employee contribution + employer match + growth) across years. |
| `roth-ira-calculator` | Roth IRA Calculator | "roth ira calculator" | $$$$/Med | Projected Roth IRA balance from annual contribution and growth rate, contrasted with a taxable account (tax-free growth angle). SVG: two diverging growth curves (Roth vs taxable) showing the tax-free gap widening. |
| `social-security-calculator` | Social Security Estimate Calculator | "social security calculator" | $$$$/Med | Rough estimated monthly benefit from average indexed earnings and claiming age (clearly labelled as an estimate, cite ssa.gov). SVG: a claiming-age slider (62→70) with benefit amount rising along a curve. |
| `present-future-value-calculator` | Present & Future Value Calculator | "present value calculator" | $$$/Med | Solves PV from FV (discounting) or FV from PV (growing) at a given rate/time — two modes in one tool. SVG: a timeline with PV on the left, FV on the right, and a curved arrow labelled with the rate connecting them. |
| `net-worth-calculator` | Net Worth Calculator | "net worth calculator" | $$$/Med | Total assets minus total liabilities from a simple itemized list (home, savings, investments, vehicles minus any owed debt). SVG: a simple balance-scale with assets on one side, liabilities on the other, net worth as the tipping result. |

---

## PART 2 — Health & Fitness — 16 tools

| Slug | Tool | Keyword | RPM/Comp | Brief |
|------|------|---------|----------|-------|
| `tdee-calculator` | TDEE Calculator | "tdee calculator" | $$$/Med | BMR × activity multiplier to estimate total daily energy expenditure (standalone from BMR, with an activity-level selector). SVG: BMR bar with activity multiplier "stacking" on top to form TDEE. |
| `macro-calculator` | Macro Calculator | "macro calculator" | $$$/Med | Protein/carb/fat gram targets from calorie goal and a chosen macro split (generic — differentiate from the existing Keto Macro Calculator which is low-carb specific). SVG: a 3-slice pie (protein/carb/fat) with grams labelled per slice. |
| `lean-body-mass-calculator` | Lean Body Mass Calculator | "lean body mass calculator" | $$/Low | Estimates fat-free mass using the Boer or James formula from height/weight/sex. SVG: a body silhouette split into a fat-mass portion and lean-mass portion, proportionally shaded. |
| `weight-loss-goal-calculator` | Weight Loss Goal Calculator | "weight loss calculator" | $$$/Med | Time-to-goal projection from current weight, target weight, and a chosen weekly-loss rate (ties to calorie deficit). SVG: a declining weight line from current → goal with the timeline in weeks on the x-axis. |
| `calories-burned-calculator` | Calories Burned Calculator | "calories burned calculator" | $$$/Med | Calories burned for an activity using MET values × weight × duration. SVG: a short MET-value bar chart comparing a few activities (walking/running/cycling) at the same duration. |
| `steps-to-calories-calculator` | Steps to Calories Calculator | "steps to calories calculator" | $$/Low | Estimated calories burned from step count, weight, and stride length. SVG: a footprint trail with a running calorie counter beside it. |
| `protein-calculator` | Protein Calculator | "protein intake calculator" | $$$/Med | Daily protein target from weight and activity/goal (sedentary vs strength training vs cutting). SVG: a bar comparing recommended g/kg across the 3 activity tiers. |
| `fat-intake-calculator` | Fat Intake Calculator | "fat intake calculator" | $$/Low | Daily fat gram target as a % of total calories (with healthy range guidance). SVG: a calorie pie with the fat slice highlighted and its gram-equivalent labelled. |
| `carbohydrate-calculator` | Carbohydrate Calculator | "carb calculator" | $$/Low | Daily carb gram target from calorie goal and chosen diet style (balanced/low-carb/high-carb). SVG: 3 pie charts side by side showing carb-slice size shrinking across diet styles. |
| `pregnancy-due-date-calculator` | Pregnancy Due Date Calculator | "pregnancy due date calculator" | $$$$/Med | Estimated due date from last menstrual period (Naegele's rule) or conception date, with trimester breakdown. SVG: a 40-week timeline with trimester bands and the due date marked. |
| `pregnancy-weight-gain-calculator` | Pregnancy Weight Gain Calculator | "pregnancy weight gain calculator" | $$$/Low | Recommended weight-gain range by pre-pregnancy BMI category and current week (cite ACOG/CDC). SVG: a weight-gain range band (low/normal/high BMI) plotted across the 40 weeks. |
| `heart-rate-zone-calculator` | Heart Rate Zone Calculator | "heart rate zone calculator" | $$$/Med | Max HR (220−age, or Tanaka formula) split into 5 training zones, plus target HR range for a chosen intensity. SVG: 5 concentric/stacked bands (zone 1–5) with bpm ranges labelled on each. |
| `bac-calculator` | Blood Alcohol Content Calculator | "bac calculator" | $$$$/Med | Estimated BAC using the Widmark formula from drinks, weight, sex, and time elapsed — with a prominent "not for determining fitness to drive" disclaimer and a citation to NHTSA/CDC. SVG: a rising-then-falling BAC curve over time with legal-limit threshold line marked. |
| `race-finish-time-calculator` | Race Finish Time Predictor | "marathon time predictor" | $$$/Low | Predicts finish time for a target race distance from a recent race result, using a standard exponent-based formula (e.g. Riegel). SVG: a pace-vs-distance curve with the known race point and predicted race point both marked. |
| `vo2-max-calculator` | VO2 Max Calculator | "vo2 max calculator" | $$/Low | Estimates VO2 max from a run-test (e.g. Cooper test distance) or resting/max heart rate ratio. SVG: a VO2 max scale with fitness-category bands (poor→excellent) and the result marked. |
| `body-surface-area-calculator` | Body Surface Area Calculator | "body surface area calculator" | $$$/Low | BSA from height/weight using the Mosteller or Du Bois formula (medical dosing context — cite that real dosing must be done by a clinician). SVG: a human silhouette with surface-area "wrapping" lines suggesting total skin area. |
| `waist-to-hip-ratio-calculator` | Waist-to-Hip Ratio Calculator | "waist to hip ratio calculator" | $$$/Low | WHR from waist/hip measurements with WHO risk-category bands by sex. SVG: a body outline with waist and hip measurement lines, and the ratio formula beside it. |

---

## PART 3 — Math — 11 tools

| Slug | Tool | Keyword | RPM/Comp | Brief |
|------|------|---------|----------|-------|
| `square-root-calculator` | Square Root Calculator | "square root calculator" | $$/High-volume | Square root (and nth root) of any number, with the simplified radical form for perfect-square factors shown. SVG: a square with side length √x and area x labelled, illustrating what a square root represents geometrically. |
| `exponent-calculator` | Exponent Calculator | "exponent calculator" | $$/Med | x^y for any base/exponent including negative and fractional exponents, with rules shown (negative → reciprocal, fractional → root). SVG: a small table of exponent rules (x⁰, x⁻¹, x^(1/2)) with worked results beside each. |
| `natural-log-calculator` | Natural Logarithm (ln) Calculator | "ln calculator" | $$/Low | ln(x) plus the change-of-base relationship to log₁₀, with e explained. SVG: the natural log curve graph with the queried point marked and asymptote at x=0 shown. |
| `factorial-calculator` | Factorial Calculator | "factorial calculator" | $$/Med | n! for any non-negative integer, with the step-by-step multiplication shown for smaller n. SVG: a cascading multiplication chain (5×4×3×2×1) collapsing into the factorial result. |
| `probability-calculator` | Probability Calculator | "probability calculator" | $$$/Med | Probability of single/combined (AND/OR) events from given individual probabilities. SVG: two overlapping circles (Venn-style) illustrating P(A AND B) vs P(A OR B). |
| `weighted-average-calculator` | Weighted Average Calculator | "weighted average calculator" | $$/Low | Average of values where each has a different weight (grades, portfolio allocations). SVG: a balance beam with different-sized weights at different positions, balancing at the weighted average point. |
| `ratio-proportion-calculator` | Ratio & Proportion Calculator | "ratio calculator" | $$/Med | Simplifies a ratio to lowest terms and solves "a:b = c:?" proportions. SVG: two scaled rectangles side by side showing an equivalent ratio (e.g. 2:3 and 4:6) at different sizes. |
| `polynomial-calculator` | Polynomial Calculator | "polynomial calculator" | $$/Low | Adds, subtracts, multiplies polynomials and evaluates at a given x. SVG: two polynomial expressions combining term-by-term with like terms highlighted in matching colors. |
| `linear-equation-calculator` | Linear Equation Calculator | "linear equation solver" | $$/Med | Solves for x in ax+b=c, or finds slope/intercept from two points and graphs the line. SVG: a line on an x-y grid with slope (rise/run) and y-intercept labelled. |
| `exponential-growth-calculator` | Exponential Growth/Decay Calculator | "exponential growth calculator" | $$/Low | Projects value over time given a growth/decay rate — generic version usable for population, bacteria, radioactive-style decay framing (non-financial; compound interest is excluded per policy). SVG: a growth curve vs a decay curve side by side, both starting from the same point. |
| `significant-figures-calculator` | Significant Figures Calculator | "sig fig calculator" | $$/Low | Rounds a number to N significant figures and shows which digits count as significant. SVG: a number with each digit color-coded (significant vs not) and an arrow to the rounded result. |

---

## PART 4 — Converters — 5 tools

(Generic length/weight/volume/temperature/speed/pressure/energy/force/torque/angle/density
converters were **excluded** — they'd cannibalize the existing `unit-converter` tool's content
rather than add anything new. Only genuinely distinct converters are listed.)

| Slug | Tool | Keyword | RPM/Comp | Brief |
|------|------|---------|----------|-------|
| `data-storage-converter` | Data Storage Converter | "gb to mb converter" | $$/Med | Converts between bit/byte/KB/MB/GB/TB/PB, clarifying the 1000 vs 1024 (decimal vs binary) distinction that causes most confusion. SVG: two side-by-side scale bars (decimal SI vs binary IEC) showing where 1GB lands differently in each. |
| `data-transfer-rate-converter` | Data Transfer Rate Converter | "mbps to mb/s converter" | $$/Low | Converts between bps/Kbps/Mbps/Gbps and the corresponding bytes-per-second units (the classic bits-vs-bytes mixup). SVG: a download-speed readout shown twice — "100 Mbps" and "12.5 MB/s" — with an equals sign and the ÷8 conversion labelled. |
| `fuel-economy-converter` | Fuel Economy Converter | "mpg to l/100km converter" | $$$/Low | Converts between MPG (US/UK), L/100km, and km/L — genuinely different scales (inverse relationship), a common source of error. SVG: a curve showing MPG vs L/100km isn't linear, with 2–3 example points marked. |
| `feet-and-inches-calculator` | Feet & Inches Calculator | "feet and inches calculator" | $$$/Med | Adds/subtracts/multiplies measurements given in feet+inches (e.g. 5'7" + 3'10"), common in construction/DIY. SVG: a tape-measure strip showing two measurements stacked and added. |
| `inches-to-fraction-calculator` | Inches to Fraction Calculator | "decimal to fraction inches calculator" | $$$/Low | Converts a decimal inch measurement to the nearest standard fraction (1/16", 1/32", etc.) used on tape measures. SVG: a ruler segment showing fraction tick marks with the decimal value mapped to the nearest one. |

---

## PART 5 — Everyday / Novelty — 5 tools

| Slug | Tool | Keyword | RPM/Comp | Brief |
|------|------|---------|----------|-------|
| `day-of-the-week-calculator` | Day of the Week Calculator | "what day of the week was i born" | $$/Med | Finds the day of the week for any date, past or future, using Zeller's congruence (shown as the method). SVG: a small calendar grid with the resulting weekday cell highlighted. |
| `random-color-generator` | Random Color Generator | "random color generator" | $$/Low | Generates random HEX/RGB/HSL colors one at a time or as a palette, with a copy button (differentiate from color-converter, which converts a given color rather than generating one). SVG: a row of 5 randomly generated color swatches with their hex codes. |
| `random-string-generator` | Random String Generator | "random string generator" | $$/Low | Generates random strings with a custom charset/length (differentiate from random-token-generator and password-generator by allowing arbitrary charsets, e.g. only letters, or a custom symbol set, for test-data use). SVG: a charset pool (a-z, 0-9, symbols) with characters being "drawn" into the output string. |
| `dice-coin-flip-generator` | Dice Roller & Coin Flip Generator | "dice roller online" | $$/Med | Rolls 1–10 dice (d4/d6/d8/d10/d12/d20) or flips 1–10 coins, with a running tally. SVG: a die showing 3 faces in a row mid-roll, plus a coin mid-flip beside it. |
| `numerology-calculator` | Numerology Calculator | "numerology calculator name and birthdate" | $$$/Med | Computes a Life Path number from birthdate and a Name/Destiny number from a full name using the standard Pythagorean letter-to-number mapping — framed clearly as entertainment, like the existing Love Calculator. SVG: the Pythagorean numerology letter-grid (1–9 mapped to A–Z) with the input name's letters highlighted. |

---

## PART 6 — Science & Engineering (extends the existing `engineering` category) — 17 tools

| Slug | Tool | Keyword | RPM/Comp | Brief |
|------|------|---------|----------|-------|
| `density-calculator` | Density Calculator | "density calculator" | $$/Med | Solves density, mass, or volume from the other two (ρ=m/V), with common material density reference table. SVG: a cube with mass and volume labelled, density = mass÷volume shown beside it. |
| `force-calculator` | Force Calculator | "force calculator f=ma" | $$/Med | F=ma — solves for force, mass, or acceleration. SVG: a block with an arrow (force) and an acceleration vector, F=ma labelled between them. |
| `work-calculator` | Work Calculator (Physics) | "work calculator physics" | $$/Low | W=F×d×cos(θ) — work done by a force over a distance at an angle. SVG: a block being pushed at an angle θ with the force vector and displacement vector both drawn. |
| `kinetic-energy-calculator` | Kinetic Energy Calculator | "kinetic energy calculator" | $$/Med | KE=½mv² — solves for any variable. SVG: a moving object with a speed label and an energy-bar that grows with v² (showing the squared relationship, not linear). |
| `potential-energy-calculator` | Potential Energy Calculator | "potential energy calculator" | $$/Low | PE=mgh — gravitational potential energy at a height. SVG: an object at height h above the ground with a dashed line to ground level and the PE formula labelled. |
| `momentum-calculator` | Momentum & Impulse Calculator | "momentum calculator" | $$/Low | p=mv, plus impulse (Δp = FΔt) in the same tool. SVG: two colliding objects with momentum vectors before/after, illustrating conservation of momentum. |
| `wavelength-frequency-calculator` | Wavelength Calculator | "wavelength calculator" | $$/Low | v=fλ — solves for wavelength, frequency, or wave speed (light or sound). SVG: a sine wave with wavelength (λ) and one cycle period labelled. |
| `half-life-calculator` | Half-Life Calculator | "half life calculator" | $$$/Med | Remaining quantity after N half-lives, or solves for half-life/elapsed time given start/end amounts — useful for chemistry, medicine dosing, and carbon dating contexts. SVG: a decay curve stepping down by half at each half-life interval, with 4 steps shown. |
| `atomic-mass-calculator` | Atomic/Molar Mass Calculator | "molar mass calculator" | $$$/Med | Calculates molar mass of a chemical formula by summing atomic masses (parse formula like H2O, C6H12O6). SVG: a molecule formula broken into its atoms with each atom's mass labelled, summing to the total. |
| `molarity-calculator` | Molarity Calculator | "molarity calculator" | $$$/Med | M = mol/L — solves for molarity, moles, or volume; includes a dilution mode (M1V1=M2V2). SVG: a beaker with solute dissolved, moles and volume labelled, concentration arrow pointing to the result. |
| `ideal-gas-law-calculator` | Ideal Gas Law Calculator | "ideal gas law calculator" | $$$/Low | PV=nRT — solves for any one variable given the other three. SVG: a gas-filled cylinder with P, V, T labelled and a piston, illustrating which variables interact. |
| `gas-laws-calculator` | Boyle's & Charles's Law Calculator | "boyles law calculator" | $$/Low | Combines Boyle's (P1V1=P2V2), Charles's (V1/T1=V2/T2), and the combined gas law in one tool with a mode switch. SVG: two side-by-side piston diagrams — one showing volume shrinking as pressure rises (Boyle's), one showing volume growing as temperature rises (Charles's). |
| `gravitational-force-calculator` | Gravitational Force Calculator | "gravitational force calculator" | $$/Low | Newton's law of gravitation, F=G(m1m2)/r², between two masses at a distance. SVG: two masses with a force arrow between them and the inverse-square relationship to distance shown. |
| `projectile-motion-calculator` | Projectile Motion Calculator | "projectile motion calculator" | $$$/Med | Range, max height, and time of flight from launch speed and angle. SVG: a parabolic trajectory arc with launch angle, max height, and range all labelled. |
| `free-fall-calculator` | Free Fall Calculator | "free fall calculator" | $$/Low | Time to fall, final velocity, or distance fallen under gravity (no air resistance). SVG: a falling object with a velocity vector growing longer as it descends, time markers along the path. |
| `ph-calculator` | pH Calculator | "ph calculator" | $$$/Med | pH from [H⁺] concentration, or reverse; includes a pH scale reference (acid/neutral/base) with common substance examples. SVG: the 0–14 pH scale with color gradient (red→green→purple) and the queried value marked. |
| `dilution-calculator` | Dilution Calculator | "dilution calculator c1v1=c2v2" | $$$/Low | C1V1=C2V2 — solves for any one variable, common in lab and cleaning-solution contexts. SVG: a concentrated stock solution being diluted with water into a larger final volume, concentrations labelled before/after. |

---

## PART 7 — NEW CATEGORY: Construction & Home Improvement — 20 tools

Currently ~0 coverage on the site (only `paint-coverage-calculator` exists, filed elsewhere).
Calculator.net shows this is one of its largest categories by tool count — real, sustained DIY
search demand. Recommend adding `construction` as a new category in `src/data/tools.js`.

| Slug | Tool | Keyword | RPM/Comp | Brief |
|------|------|---------|----------|-------|
| `square-footage-calculator` | Square Footage & Area Calculator | "square footage calculator" | $$$/Med | Area of a room/lot from length×width (rectangle), plus circle/triangle modes. SVG: a rectangle with length and width labelled, area = L×W shown inside. |
| `perimeter-calculator` | Perimeter Calculator | "perimeter calculator" | $$/Med | Perimeter of common shapes (rectangle, square, circle circumference, triangle). SVG: a rectangle with all 4 sides labelled and arrows summing around the border. |
| `concrete-calculator` | Concrete Calculator | "concrete calculator" | $$$$/Med | Cubic yards of concrete needed from length×width×depth, with bag-count conversion for small jobs. SVG: a slab cross-section showing length, width, depth, with the volume formula. |
| `concrete-slab-calculator` | Concrete Slab Calculator | "concrete slab calculator" | $$$/Low | Specifically scoped to flat slabs (patios, driveways, sidewalks) with thickness presets and waste-factor buffer. SVG: an overhead slab outline with a thickness cross-section inset. |
| `tile-calculator` | Tile Calculator | "tile calculator" | $$$$/Med | Tiles needed for a room from room area, tile size, and a waste-factor %. SVG: a floor grid of tiles with a few marked as "cut/waste" pieces at the edges. |
| `flooring-calculator` | Flooring Calculator | "flooring calculator" | $$$/Med | Boxes/sq ft of flooring material needed plus estimated material cost, generic across laminate/vinyl/hardwood. SVG: a room outline with plank rows laid across it and a box-count tally. |
| `brick-calculator` | Brick Calculator | "brick calculator" | $$$/Low | Bricks needed for a wall from wall dimensions, brick size, and mortar joint thickness. SVG: a wall elevation showing a brick courses pattern with joint lines. |
| `fence-calculator` | Fence Calculator | "fence calculator" | $$$$/Med | Posts, rails, and panels needed for a fence run from total length and post spacing. SVG: a fence-line top-down view with post markers spaced evenly and a count callout. |
| `deck-calculator` | Deck Calculator | "deck calculator" | $$$$/Med | Decking boards, joists, and fasteners needed from deck dimensions and board width/spacing. SVG: a deck framing plan (joists + decking boards laid perpendicular) from above. |
| `roofing-calculator` | Roofing Calculator | "roofing calculator" | $$$$/Med | Roofing squares needed from roof footprint and pitch (accounting for the pitch multiplier on true surface area), plus shingle bundle count. SVG: a roof cross-section showing pitch angle and the "true" sloped surface vs the flat footprint. |
| `gravel-sand-calculator` | Gravel & Sand Calculator | "gravel calculator" | $$$/Med | Cubic yards/tons of gravel or sand needed for a given area and depth, with a material-density toggle. SVG: a driveway cross-section with the gravel depth layer shaded. |
| `mulch-calculator` | Mulch Calculator | "mulch calculator" | $$$/Med | Cubic yards/bags of mulch needed for a garden bed area and desired depth. SVG: a garden bed cross-section with mulch depth layer shown over soil. |
| `board-foot-lumber-calculator` | Board Foot / Lumber Calculator | "board foot calculator" | $$$/Low | Board feet from lumber dimensions (thickness×width×length÷144), and total cost from price per board foot — woodworking/contractor audience. SVG: a lumber board with thickness/width/length labelled and the board-foot formula. |
| `pool-volume-calculator` | Pool Volume Calculator | "pool volume calculator" | $$$$/Low | Gallons/liters in a pool from shape (rectangular, round, oval) and average depth — useful for chemical dosing too (cross-link to a future pH/chlorine calculator). SVG: a pool cross-section (shallow to deep end) with average depth marked. |
| `cubic-yardage-calculator` | Cubic Yardage Calculator | "cubic yards calculator" | $$$/Med | General-purpose volume-to-cubic-yards converter for any material from L×W×D inputs (the calculation engine other material calculators above build on, but offered as its own quick-reference tool too). SVG: a 3D box with L/W/D labelled and the cubic-yard conversion factor shown. |
| `drywall-calculator` | Drywall Calculator | "drywall calculator" | $$$/Low | Drywall sheets needed for a room from wall/ceiling area and standard sheet size, with waste factor. SVG: a wall elevation with drywall sheet outlines tiled across it. |
| `insulation-calculator` | Insulation Calculator | "insulation calculator" | $$$$/Low | R-value coverage needed and rolls/bags required from area and target R-value. SVG: a wall cross-section with insulation batt thickness correlated to an R-value scale. |
| `sod-calculator` | Sod Calculator | "sod calculator" | $$$/Med | Sod rolls/pallets needed for a lawn area with waste factor. SVG: a lawn area divided into sod-roll-sized strips. |
| `paver-calculator` | Paver Calculator | "paver calculator" | $$$$/Med | Pavers needed for a patio/walkway from area, paver size, and joint gap. SVG: a patio area with a paver-laying pattern (running bond) overlaid. |
| `stair-calculator` | Stair Calculator | "stair calculator" | $$$/Low | Number of steps, rise, and run from total height and code-compliant rise/run ranges (cite IRC stair code ranges). SVG: a stair-section side view with rise and run labelled per step. |

---

## PART 8 — Automotive (extends existing `automotive` category) — 5 tools

| Slug | Tool | Keyword | RPM/Comp | Brief |
|------|------|---------|----------|-------|
| `mpg-calculator` | MPG / Gas Mileage Calculator | "mpg calculator" | $$$/Med | Miles per gallon from odometer readings and fuel added, plus cost-per-mile. SVG: a fuel gauge with a trip-distance odometer beside it, MPG = distance ÷ gallons. |
| `speed-distance-time-calculator` | Speed, Distance & Time Calculator | "speed distance time calculator" | $$$/Med | Classic d=s×t solved for any of the three. SVG: a car on a road with distance, speed, and a stopwatch labelled. |
| `engine-displacement-calculator` | Engine Displacement Calculator | "engine displacement calculator" | $$/Low | Total engine displacement (cc or L) from bore, stroke, and cylinder count. SVG: a cylinder cross-section with bore (diameter) and stroke (piston travel) labelled. |
| `air-fuel-ratio-calculator` | Air-Fuel Ratio Calculator | "air fuel ratio calculator" | $$$/Low | AFR from mass of air and fuel, with the 14.7:1 stoichiometric reference point for gasoline (tuning/enthusiast audience). SVG: an air-intake and fuel-line meeting at a combustion chamber with the AFR ratio labelled. |
| `compression-ratio-calculator` | Compression Ratio Calculator | "compression ratio calculator" | $$$/Low | Engine compression ratio from cylinder volume at BDC vs TDC. SVG: a cylinder/piston shown at both positions (bottom and top of stroke) with the swept + clearance volumes labelled. |

---

## PART 9 — NEW CATEGORY: Cooking & Baking — 9 tools

Currently 0 coverage. Calculator.net shows steady, evergreen household search demand here —
low competition relative to the recipe-blog-dominated SERP because these are pure utility
calculators, not recipes.

| Slug | Tool | Keyword | RPM/Comp | Brief |
|------|------|---------|----------|-------|
| `recipe-scaling-calculator` | Recipe Scaling Calculator | "recipe converter scale up" | $$$/Med | Scales every ingredient quantity in a recipe up or down by a target serving count or multiplier. SVG: a recipe card with ingredient amounts multiplying (×2 arrows) into a scaled card beside it. |
| `cooking-measurement-converter` | Cooking Measurement Converter | "cooking conversion calculator" | $$$$/Med | Converts between cups, tablespoons, teaspoons, fluid ounces, and milliliters for liquid/volume measurements. SVG: a measuring-cup ladder (cup → tbsp → tsp → ml) with equivalent markings. |
| `baking-conversion-calculator` | Baking Conversion Calculator (Weight ↔ Volume) | "baking conversion calculator" | $$$/Med | Converts common baking ingredients between volume (cups) and weight (grams/oz), since baking precision depends on weight, not volume. SVG: a cup of flour on one side of a scale, balanced against its gram-equivalent on the other. |
| `oven-temperature-converter` | Oven Temperature Converter | "oven temperature conversion" | $$$$/Med | Converts °F ↔ °C ↔ gas mark ↔ fan/convection oven adjustment. SVG: 4 parallel scales (F / C / Gas Mark / Fan) aligned at the same temperature point. |
| `baking-ingredient-converter` | Baking Ingredient Converter (Butter/Flour/Sugar) | "butter to grams converter" | $$$/Low | Converts butter sticks/cups, flour cups/grams, and sugar cups/grams — the three most-searched baking conversions in one tool. SVG: 3 small icon-labelled converters (butter stick, flour scoop, sugar scoop) each with a cup↔gram arrow. |
| `rice-water-ratio-calculator` | Rice to Water Ratio Calculator | "rice to water ratio calculator" | $$$/Low | Water amount needed from rice quantity and rice type (white/brown/jasmine/basmati each have different ratios). SVG: a measuring cup of rice next to a larger measuring cup of water with the ratio labelled. |
| `food-thawing-time-calculator` | Food Thawing Time Calculator | "how long to thaw a turkey calculator" | $$$/Low | Safe thawing time (fridge vs cold-water method) from food weight, citing USDA food-safety guidance. SVG: two thawing-method timelines (fridge, much longer vs cold water, shorter) side by side for the same weight. |
| `meat-roasting-time-calculator` | Meat Roasting Time Calculator | "turkey cooking time calculator" | $$$$/Med | Roasting time and target internal temperature from meat type and weight (cite USDA safe minimum internal temps). SVG: a roasting pan with a meat thermometer showing the target temp, and a time-per-pound scale beside it. |
| `yeast-converter` | Yeast Converter | "active dry yeast to instant yeast conversion" | $$/Low | Converts between active dry, instant, and fresh yeast quantities (each requires different amounts for the same rise). SVG: 3 yeast-type icons with conversion-ratio arrows between each pair. |

---

## Totals

| Part | Tools |
|------|-------|
| 1. Finance | 14 |
| 2. Health & Fitness | 16 |
| 3. Math | 11 |
| 4. Converters | 5 |
| 5. Everyday/Novelty | 5 |
| 6. Science & Engineering | 17 |
| 7. Construction & Home Improvement (new category) | 20 |
| 8. Automotive | 5 |
| 9. Cooking & Baking (new category) | 9 |
| **Total** | **102** |

## Build order recommendation
1. **Part 7 (Construction, 20 tools)** — brand-new category, zero internal competition, highest
   tool count opportunity, calculator.net proves the demand exists.
2. **Part 6 (Science & Engineering, 17)** — extends the site's existing strongest topical
   authority area.
3. **Part 1 (Finance, 14)** and **Part 2 (Health, 16)** — highest RPM, moderate effort.
4. **Part 9 (Cooking, 9)** — new category, very low competition, evergreen traffic.
5. **Part 3 (Math, 11)**, **Part 8 (Automotive, 5)**, **Part 4 (Converters, 5)**,
   **Part 5 (Everyday, 5)** — round out remaining categories.
