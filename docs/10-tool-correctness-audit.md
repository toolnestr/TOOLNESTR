# Tool Correctness Audit — A-to-Z Plan

**Goal:** verify that every live tool produces **correct answers**, category by category,
and fix the ones that don't. Wrong math quietly destroys user trust, rankings, and
AdSense standing — so this is treated as a first-class quality project, not a spot fix.

**Scope:** 462 live tools across 20 categories + the `worker.js` API (networking/SEO tools).

---

## 1. What "correct" means (the 6 failure classes we hunt)

Every tool is checked against these six defect types:

1. **Wrong formula** — the math itself is incorrect (e.g., wrong equation, wrong order of operations).
2. **Wrong constant / factor** — bad conversion factor, gravity, tax rate, calorie coefficient, etc.
3. **Unit / conversion bug** — metric↔imperial mishandled, cm vs m, lb vs kg, °F vs °C offset.
4. **Edge-case break** — divide-by-zero, negative/zero input, empty field, huge numbers, NaN shown to user.
5. **Rounding / precision** — result technically right but rounded misleadingly, or float error surfaced.
6. **Region / variant mismatch** — gender, country, standard, or scale variant applied wrong
   (e.g., US Navy vs BMI body-fat, CBSE vs custom CGPA, Asian BMI cut-offs).

Verdict per tool: **PASS** · **WRONG** (critical, user gets a false number) ·
**IMPRECISE** (rounding/edge only) · **UX** (input handling, not the math) · **MISSING** (no page).

---

## 2. Method (repeatable per tool)

For each tool:
1. **Extract** the inline `<script>` calculation logic from `src/pages/tools/<slug>.astro`.
2. **Identify** the formula + constants used.
3. **Cross-check** the formula against an authoritative reference (sources listed per category below).
4. **Define golden test vectors** — 3–5 known input→output pairs (normal + edge cases).
5. **Run** the ported formula in a Node harness and compare to expected.
6. **Classify + log** the result in the tracker (§5) with a fix recommendation.

### Automation harness (how we scale to 462)
- A script (`audit/harness.mjs`) extracts each tool's `<script>` block and the input/output element IDs.
- Each category gets a test file (`audit/<category>.test.mjs`) holding golden vectors and the ported
  formula, run with `node --test`.
- This makes the audit **repeatable** — re-run after any future edit to catch regressions.
- Tools that are purely visual/formatting (charts, image, PDF, text) get lighter output-shape checks
  instead of numeric vectors.

---

## 3. Priority order (risk × volume × traffic)

Ordered so the biggest trust/impact wins land first. Each phase is self-contained.

| Phase | Category | # Tools | Why here |
|------|----------|--------:|----------|
| **1** | Converters | 69 | Highest volume, purely deterministic (factor tables) → fastest, highest-yield checks. Wrong constants are the #1 risk. |
| **2** | Finance | 39 | High stakes (money). Complex formulas. **Already found a suspect (compound interest).** |
| **3** | Health & Fitness | 30 | High stakes (health). Well-defined formulas with authoritative sources (BMI/BMR/body-fat/calories). |
| **4** | Math | 23 | Deterministic and easy to verify exactly (factorial, gcd/lcm, permutations, fractions). |
| **5** | Everyday | 27 | Mixed: dates, %, grades, GPA/CGPA variants (region-sensitive). |
| **6** | Engineering & Science | 44 | Physics formulas, constant-heavy, unit-sensitive. |
| **7** | Construction + Automotive + Cooking | 21+26+9 | Practical formulas; wrong = wasted materials/fuel. |
| **8** | Time & Date | 15 | Calendar/timezone edge cases (leap year, DST, business days). |
| **9** | Islamic | 16 | Religiously sensitive (Hijri conversion, prayer/Sehri/Iftar, Qibla, Zakat). Verify carefully. |
| **10** | Security + Developers | 15+25 | Hash/encode correctness — verify against **published test vectors** (MD5/SHA/CRC32/base64/bcrypt). |
| **11** | Networking | 35 | Server-side via `worker.js` — test live API endpoints + validation/SSRF. |
| **12** | Charts + Images + Text + Creators + SEO + PDF | 11+13+15+12+11+10 | Output/formatting correctness; lower numeric risk → lighter checks. |

---

## 4. Per-category checklist & reference sources

**Converters** — verify each factor against SI/NIST. Chained conversions (A→base→B) must round-trip.
Watch temperature (offset, not just scale), fuel economy (MPG↔L/100km is *inverse*), data (1000 vs 1024).
*Ref: NIST SP 811, BIPM SI brochure.*

**Finance** — compound interest (frequency consistency for principal AND contributions; annuity timing),
loan/EMI amortization formula, tax add/remove, ROI/ROAS/margin vs markup, inflation.
*Ref: standard TVM formulas; verify against a known financial calculator.*

**Health** — BMI (kg/m²; imperial ×703), BMR (Mifflin-St Jeor vs Harris-Benedict — state which),
body fat (US Navy log formula), calories (BMR × activity factor), macros, BAC (Widmark).
*Ref: CDC, WHO, Mifflin-St Jeor 1990, US Navy method.*

**Math** — exact integer results (factorial, gcd/lcm, combinations/permutations nCr/nPr),
fraction reduction, decimal↔fraction, exponents, quadratic roots. *Cross-check with known values.*

**Everyday** — date diff (inclusive vs exclusive, leap years), percentage (of / change / increase),
GPA/CGPA/grade **scale variants** (label which standard), Roman numerals (edge: 4/9/40/3999).

**Engineering/Science** — check constants (g=9.80665, gas constant R, speed of light),
Ohm's law, force/energy/power, half-life, gas laws (unit consistency K not °C!).

**Construction** — area/volume × waste factor, concrete (yd³/m³), bricks/tiles per area, board-feet.

**Automotive** — fuel cost, EV cost/range/efficiency, gear ratio, engine displacement, compression ratio.

**Cooking** — cups↔ml↔grams are **ingredient-density-dependent** (flour ≠ sugar ≠ water) — verify densities.

**Time & Date** — leap years, business-days (weekends/holidays), age (month/day borrow),
timezone offsets, Unix timestamp direction.

**Islamic** — Hijri↔Gregorian (tabular vs astronomical — state method), prayer times (calc method:
MWL/ISNA/etc.), Qibla bearing (great-circle), Zakat nisab & 2.5%. **Round-trip Hijri conversions.**

**Security/Developers** — run **official test vectors**: MD5("")=d41d8cd98f00b204e9800998ecf8427e,
SHA-256("abc")=ba7816bf..., base64 round-trip, CRC32, HMAC, bcrypt verify, JSON/CSV integrity.

**Networking** — hit each `/api/*` endpoint in `worker.js` with valid + malformed input;
confirm IP validation blocks private/reserved ranges (SSRF), and results match a trusted lookup.

**Charts/Images/Text/PDF** — verify output *shape* (valid SVG, correct data mapping, axis scaling,
no data loss on PDF merge/split, text transforms reversible where claimed).

---

## 5. Tracker format

Results logged in `audit/RESULTS.md` (one row per tool):

```
| slug | category | verdict | issue (if any) | test vectors used | fix status |
```

Severity rollup kept at top: # WRONG / # IMPRECISE / # UX / # PASS per category.

---

## 6. Cadence & deliverables

- Work **one phase (category) at a time**; after each: a results summary + fixes applied + committed.
- **WRONG** (false-number) bugs fixed immediately in that phase.
- **IMPRECISE/UX** batched and fixed at phase end.
- Every fix gets a golden test in `audit/` so it can't silently regress.
- `git push` after each phase (auto-deploys to Cloudflare) once fixes are verified.

---

## 7. Known issues found during planning (seed list)

- ⚠️ **compound-interest** — principal compounds at selected frequency `n`, but recurring
  contributions are hard-coded to monthly compounding. Inconsistent; needs alignment + annuity-timing check.
- ℹ️ **emi-calculator, mortgage-calculator, auto-loan, retirement-calculator** — listed in `tools.js`
  but page files don't exist. All are `enabled:false`/`soon`, so not user-facing — decide: build or remove entries.
- ✅ **bmi-calculator**, **tax-calculator** — verified correct.

---

## 8. Status log

- [x] Phase 1 — Converters (69) — ✅ done: 1 bug fixed (inches-to-fraction), 2 minor edges logged. See `audit/RESULTS.md`.
- [x] Phase 2 — Finance (39) — ✅ done: 0 code bugs. Tax-bracket data currency to verify (esp. UK Scotland). See `audit/RESULTS.md`.
- [x] Phase 3 — Health (30) — ✅ done: 0 bugs. All exact authoritative formulas (Mifflin-St Jeor, US Navy, Widmark, Boer, Devine, MET, Naegele). See `audit/RESULTS.md`.
- [x] Phase 4 — Math (23) — ✅ 0 bugs
- [x] Phase 5 — Everyday (27) — ✅ 0 bugs
- [x] Phase 6 — Engineering (44) — ✅ 0 bugs
- [x] Phase 7 — Construction + Automotive + Cooking (56) — ✅ 0 bugs
- [x] Phase 8 — Time & Date (15) — ✅ 0 bugs
- [x] Phase 9 — Islamic (16) — ✅ 0 bugs (Umm al-Qura hijri; API notes)
- [x] Phase 10 — Security + Developers (40) — ✅ 2 crypto bugs FIXED (MD5, HMAC-MD5)
- [x] Phase 11 — Networking (35) — ✅ 0 client-side bugs (API tools need deploy test)
- [x] Phase 12 — Charts+Images+Text+Creators+SEO+PDF (72) — ✅ 0 bugs (light review)
