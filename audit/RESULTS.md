# Tool Correctness Audit — Results Log

Verdicts: **PASS** · **WRONG** (false number) · **IMPRECISE** (rounding/edge) · **UX** · **MISSING**

---

## Phase 1 — Converters (69 tools) — ✅ audited

**Method:** the 48 factor/table converters funnel through two shared components
(`FactorConverter`, `MultiUnitConverter`) whose engine logic is correct, so correctness
reduced to verifying the `factor` / `toBase` constants each page passes. All were checked
against NIST/SI values. The remaining 21 are special-case (encoding, format, algorithmic).

### Findings

| slug | verdict | note |
|------|---------|------|
| **inches-to-fraction-calculator** | **WRONG → FIXED** | Whole-number not incremented when fraction rounds up to a full unit (`whole + …` no-op + `const`). `2.97" @1/16` showed `2 in` instead of `3 in`. Fixed: `let whole` + `whole += …`. Verified. |
| scientific-notation-converter | IMPRECISE (edge) | Input `0` → `Math.log10(0)` = -Infinity → NaN coefficient. Needs a `v === 0` guard. Low priority. |
| feet-and-inches-calculator | IMPRECISE (edge) | Negative results (e.g. subtracting a larger length) decompose wrongly via `Math.floor`/`%` (`-14 in` → `-2 ft -2 in`). Multiply mode is dimensionally odd (in × in shown as ft/in). Low priority. |
| tons-to-kg | VERIFY | factor `1000` = **metric tonne**; confirm the page copy doesn't call it US short ton (907 kg) or UK long ton (1016 kg). |

### Verified correct (PASS)
- **39 single-direction factor converters** — all constants match NIST/SI (length, weight,
  volume, speed, pressure, temperature CF/FC/CK/KC formulas). Reverse pairs are consistent.
- **9 multi-unit converters** — length, weight, area (squared factors ✓), volume, speed,
  pressure, energy, power, angle. All `toBase` values correct, incl. metric-hp vs mechanical-hp,
  thermochemical calorie, IT-BTU.
- **fuel-economy-converter** — correct **inverse** formulas (235.215/mpg US, 282.481/mpg UK, 100/kmpl).
- **data-storage-converter / data-transfer-rate-converter** — correctly separate SI (1000) vs IEC (1024).
- **decimal-to-fraction, fraction-to-decimal, gsm-to-mm, number-to-words** — algorithms correct.

### Lighter check pending (format/encoding — low numeric risk)
binary/hex/ascii/morse/url/html-entity/regex-escaper, csv-to-json, json-to-yaml, json-to-xml,
words-to-numbers — round-trip encoding checks to be added to the harness.

**Phase 1 verdict:** category is in good shape. **1 real bug found & fixed**, 2 minor edge cases logged, 1 label to confirm.

---

## Phase 2 — Finance (39 tools; 36 live, 3 disabled placeholders) — ✅ audited

**Headline:** no calculation bugs found. The financial math is solid. The one real risk is
**tax-bracket data currency** (which tax year the hardcoded brackets reflect) — a maintenance
issue, not an algorithm error.

### Findings

| slug | verdict | note |
|------|---------|------|
| compound-interest | PASS (by design) | Earlier flag withdrawn: contribution field is explicitly "Monthly contribution", so the monthly-annuity treatment is correct (matches investor.gov). Minor note: principal compounds at chosen frequency while contributions compound monthly — a defensible, standard mixed convention. |
| income-tax-calculator-us | PASS | 2025 federal brackets correct; marginal math correct; input is *taxable income* (standard deduction handled via FAQ guidance, by design). |
| uk-take-home-pay-calculator | VERIFY (data) | Math correct; personal allowance £12,570 + >£100k taper correct. **Scottish bands look a tax-year behind** (5 bands, top 47%) vs current 6-band/48% structure. rUK path (20/40/45 at £50,270/£125,140) current. Confirm target tax year. |
| canada / australia / netherlands / pakistan / freelancer tax | VERIFY (data) | Not line-verified against authoritative current-year brackets — confirm each reflects the intended tax year. |

### Verified correct (PASS) — math checked
- **Core TVM:** npv (correct discounting + PI), irr (Newton-Raphson), wacc, present-future-value
  (periodic-rate + EAR), roi (with annualization), investment (monthly annuity), savings-goal (iterative).
- **Business:** profit-margin (margin ÷price vs markup ÷cost — correctly distinct), break-even
  (contribution-margin), roas (ROAS + ACoS), crypto-profit (fees both sides), inflation (nominal ×, buying-power ÷).
- **Retirement/payroll:** 401k (annuity + employer match), roth-ira (Roth vs taxable-drag),
  overtime (× multiplier), salary (all pay-period conversions), emergency-fund, net-worth.

### Not individually line-verified (simple/low-risk, spot-trusted)
sales-tax, property-tax, vat-gst-calculator (same add/remove pattern as the already-verified
tax-calculator), paycheck-calculator (FICA), severance, tip-pooling, invoice-late-fee,
currency-converter (user-entered rate), invoice-generator (document, not a calc).

**Phase 2 verdict:** strong. **0 code bugs.** Main action = decide a target tax year and
verify/update the country tax brackets (esp. UK Scotland).

### Phase 2 follow-up (planned) — Tax credibility upgrade
Decision: **no live tax API** (none free/reliable for income tax; paid ones add cost + backend
dependency). Instead:
1. **Versioned bracket datasets** — `src/data/tax/<country>-<year>.js`, each citing official source + year.
2. **User-selectable tax year** on each tax tool (loads the matching dataset).
3. **Dated source disclaimer** per tool — "Brackets for tax year 20XX, from <official source>,
   verified <date>. Estimate only — not tax advice." (Finance category already auto-shows a
   general 'not financial/tax advice' disclaimer via ToolLayout; add the year/source line.)
Sources to cite: IRS (US), HMRC (UK), CRA (Canada), ATO (Australia), Belastingdienst (NL), FBR (Pakistan).
Status: **IN PROGRESS** — US reference implementation DONE (see below); other countries pending.

**Done (US federal):** `src/data/tax.js` holds versioned brackets for 2024, 2025, 2026 (verified vs
IRS / Tax Foundation, each with sourceUrl + verified date). `income-tax-calculator-us.astro` now has a
**tax-year selector** (defaults to newest), shows the year's **standard deduction** helper note, and a
**dated source disclaimer** ("Brackets for the 20XX US federal tax year (IRS), verified 2026-07-01.
Estimate only — not tax advice."). Verified: 2026 single $75k→$11,212; 2025→$11,414; 2024→$11,553;
2025 married $200k→$33,828; top bracket (null→Infinity) OK.

**Done (UK):** `ukIncomeTax` added to `src/data/tax.js` for 2024/25, 2025/26, 2026/27 — verified vs
gov.scot / HMRC. **Fixed the flagged Scottish-bands bug**: was 5 bands with top 47% and stale
thresholds; now correct 6 bands (starter 19 / basic 20 / intermediate 21 / higher 42 / **advanced 45**
/ top **48**) with per-year thresholds. rUK bands frozen (20/40/45 at £50,270/£125,140), NI 8%/2%,
PA £12,570 with >£100k taper. `uk-take-home-pay-calculator` now has a **year selector** + dated source
disclaimer. Verified: 2025/26 England £50k→net £39,520; Scotland £50k→net £37,992; £150k taper→tax £51,189.

**Done (Australia) — REAL BUG FIXED:** the AU calculator had the new 2024-25 Stage-3 *thresholds*
($135k/$190k) but the OLD *rates* (19%/32.5%) — overtaxing e.g. a $90k earner by ~$1,929. Now correct
ATO rates: 2024-25 & 2025-26 = 16%/30%, 2026-27 = 15%/30% (legislated cut), 2023-24 = 19%/32.5% at
old thresholds. Added `auIncomeTax` (4 years, verified vs ATO) + year selector + disclaimer. Also fixed
the $1-per-boundary gap by moving to the cumulative-limit loop. Verified: 2024-25 $90k→$17,788;
$200k→$56,138 (both match ATO).

**Done (Pakistan) — stale slabs FIXED:** the tool used **2024-25** slabs (5/15/25/30/35) on a 2026 site,
overtaxing everyone (e.g. PKR 2M → 150,000 vs the correct 94,000). Added `pkIncomeTax` verified vs FBR:
2024-25, 2025-26 (June-2025 budget cut lower slabs to 1/11/23), and 2026-27 (June-2026 budget cut four
middle slabs + split top into 8 bands). Year selector (defaults to current 2026-27) + disclaimer;
breakdown table now generated from the selected year. Verified: 2025-26 2M→94,000; 2026-27 6M→1,104,000.

**REMOVED (user decision):** Canada and Netherlands net-salary calculators were **deleted** rather than
maintained — the per-province (13) and Dutch tax-credit data is too complex to keep accurate/verified.
Removed the two page files + their `tools.js` entries + related-links on the AU/UK pages, and added
`public/_redirects` (301 → /tools/finance/) so the previously-live URLs don't 404. Build 487 → 485 pages.

**Still optional (rate-based, math already correct):** sales-tax, property-tax, vat-gst, freelancer —
could add a "rates vary by location/year; verify locally" disclaimer, but no calculation issue.

### Tax rollout summary
Done with verified data + year selectors + dated disclaimers: **US, UK, Australia, Pakistan**.
Real tax bugs fixed: UK Scottish bands, AU rates, PK stale slabs. Canada + Netherlands removed.

---

## Phase 3 — Health & Fitness (30 tools) — ✅ audited

**Headline: 0 bugs.** Exemplary category — every tool uses the exact recognized clinical/scientific
formula. (Health disclaimer already auto-shown site-wide via ToolLayout.)

### Verified correct against authoritative formulas
| tool | formula verified |
|------|------------------|
| bmi-calculator | kg/m²; imperial ×703 (Phase-0 check) |
| bmr-calculator | **Mifflin-St Jeor**: 10·kg + 6.25·cm − 5·age + (5 M / −161 F) ✓ |
| body-fat | **US Navy** log10 equations (male & female) ✓ exact coefficients |
| bac-calculator | **Widmark**: r=0.68 M / 0.55 F, −0.015%/hr metabolism ✓ |
| lean-body-mass | **Boer** formula (M & F) ✓ |
| body-surface-area | **Mosteller, Du Bois, Haycock** — all three correct ✓ |
| heart-rate-zone | **Tanaka** (208 − 0.7·age) + **Karvonen** reserve ✓ |
| ideal-weight | **Devine**: 50/45.5 kg + 2.3·(in over 5ft) ✓ + BMI healthy range |
| tdee / calorie | BMR × activity multiplier ✓ |
| protein / macro | g/kg × bodyweight ✓ |
| calories-burned | **MET** × kg × hours ✓ |
| water-intake | ~33 mL/kg + exercise adjustment ✓ |
| pregnancy-due-date | **Naegele** (LMP + 280 days) ✓ |
| ovulation | −14 luteal phase, fertile window −5/+1 ✓ |
| waist-to-hip-ratio | waist ÷ hip ✓ |
| dog-age | 15 / +9 / +5-per-year model ✓ |
| vo2-max | age/sex reference-table classification ✓ |

**Phase 3 verdict:** best category so far. **0 bugs, nothing to fix.**

---

## Phase 4 — Math (23 tools) — ✅ audited — **0 bugs**
All deterministic and correct: factorial (170 overflow cap + Stirling), gcd/lcm (Euclidean + prime
factors), combination/permutation (multiplicative nCr to avoid overflow), quadratic (discriminant,
complex roots, simplified radicals, linear fallback), standard-deviation (population vs sample
correctly separated), prime-checker (√n trial division), triangle (Heron + law of cosines),
weighted-average, ratio-proportion (cross-multiply), logarithm (change of base), exponential-growth
(discrete + continuous + doubling/half-life), significant-figures. Nothing to fix.

## Phase 5 — Everyday (27 tools) — ✅ audited — **0 bugs**
Calc tools all correct: roman-numerals (subtractive map, 1–3999 range, round-trip validation rejects
malformed), percentage (% change with abs denominator), cgpa→% (CBSE ×9.5), cgpa→gpa (÷scale×4),
german-grade (Modified Bavarian: 1 + 3·(max−N)/(max−min)), discount (stacked multiply), cost-per-unit
(base-unit normalization), age & date-difference (correct y/m/d borrow incl. m<0→y−−), hours (overnight
wrap), gpa (Σpts·cred/Σcred), grade (weighted avg), tip. Non-calc utilities (word-counter, case-converter,
cps/typing/keyboard tests, dice, browser-profile, earthquake-tracker) = no numeric risk.
Note: **prayer-times** (astronomical) deferred to Phase 9 for careful review.

## Phase 6 — Engineering & Science (44 tools) — ✅ audited — **0 bugs**
Constants correct (G=6.67430e-11, gas R=0.082057 L·atm/mol·K, g=9.81) and formulas correct:
ohms-law (V=√PR), force (F=ma), kinetic (½mv²), potential (mgh), momentum (mv/impulse), work
(F·cosθ·d), gravitational, free-fall kinematics, projectile (initial-height discriminant), wavelength
(λ=v/f), half-life (2^(t/hl)), pH (−log₁₀c), ideal-gas (PV=nRT), molarity (n=MV), density (m/v),
btu→tons (÷12000), hp→kW (0.7457 mech/0.746 elec), lumens→lux (÷area), three-phase (√3), power-factor
(P/S), LC-resonance (1/(2π√LC)). Code-lookup tools (resistor/SMD/capacitor color codes, AWG, conduit
fill, PCB trace) = standard reference tables, spot-trusted.

## Phase 7 — Construction + Automotive + Cooking (56 tools) — ✅ audited — **0 bugs**
Construction: concrete (cf/27 yd³ + 1.95 t/yd³), brick (144/unit-area + waste %), gravel/sand,
board-foot (T·W·L/12), all area/volume with correct unit factors. Automotive: MPG↔L/100km (correct
gal-US 3.78541 / gal-UK 4.54609), gear-ratio (336 constant), compression (π·r²·stroke), engine
displacement, air-fuel (λ=AFR/14.7 stoich), tire diameter (2·sidewall/25.4 + rim), 15 EV tools
(energy/power/cost/range models). Cooking: correct mL factors, baking uses per-ingredient density
(correct), rice ratios, recipe scaling (new/orig).
Minor note: oven gas-mark uses linear approx `140+14·(n−1)` — close but not exact per mark (acceptable).

## Phase 8 — Time & Date (15 tools) — ✅ audited — **0 bugs**
Correct: business-days (weekend detection via getDay), ISO-8601 week number (proper Thursday
algorithm), Zeller's congruence (day-of-week), day-of-year, age-in-seconds, zodiac. Non-calc
(world-clock, stopwatch, countdown, meeting-planner) = UI utilities.

## Phase 9 — Islamic (16 tools) — ✅ audited — **0 bugs**
- zakat 2.5% (×0.025) ✓, khums 20% (×0.2) ✓, nisab ✓, zakat-on-gold/silver ✓
- **Hijri ↔ Gregorian: uses browser Umm al-Qura calendar** (`Intl islamic-umalqura`) — authoritative.
  Reverse converter refines a seed guess until the round-trip matches exactly. Accurate.
- qibla-direction: great-circle initial bearing to Kaaba (atan2) ✓
- **prayer-times & sehri-iftar**: fetch from external API (aladhan-style). Correct approach but a
  **network dependency** — note: if API is down/rate-limited, tool won't compute. Accuracy depends on
  selected calc method. NOTE (reliability, not a math bug).
- islamic-inheritance: simplified faraid shares (1/2,1/4,1/8,1/6,1/3,2/3). Full faraid (awl/radd/
  asaba edge cases) is beyond a web calc; already covered by the Islamic disclaimer. Verify complex
  cases with a scholar. NOTE (scope).

## Phase 10 — Security + Developers (40 tools) — ✅ audited — **2 crypto bugs FIXED**

| slug | verdict | note |
|------|---------|------|
| **md5-hash-generator** | **WRONG → FIXED** | Broken `hex()`: `(i & 0xFFFFFFFF).toString(16)` gave signed/negative hex AND no little-endian byte swap → **every MD5 was wrong**. Replaced with correct per-word nibble hex. Now passes official vectors: MD5("")=d41d8cd9…, MD5("abc")=90015098…, "message digest"=f96b697d…. |
| **hmac-generator (HMAC-MD5)** | **WRONG → FIXED** | Same broken `hex` + construction fed inner MD5's *hex string* into the outer hash instead of raw 16 bytes. Added `MD5.raw()` and fixed `H(opad‖H(ipad‖msg))`. Now passes RFC vectors incl. HMAC-MD5("Jefe","what do ya want…")=750c783e…. (HMAC-SHA-1/256/512 already correct via Web Crypto.) |

### Verified correct (PASS)
- sha256-hash-generator — **Web Crypto** `crypto.subtle.digest('SHA-256')` ✓
- crc32-checksum — standard 0xEDB88320 table, `>>>0` unsigned; CRC32("123456789")=cbf43926 ✓
- base64 (btoa/atob), number-base-converter (native radix), color-converter (HSL max/min/delta),
  password-entropy (length·log₂(pool)), uuid/token/password generators (randomness utilities),
  json-formatter, timestamp-converter, jwt-decoder, regex-tester, diff-checker, etc.

**Phase 10 verdict:** the audit's most important phase — **2 fundamental, trivially-verifiable crypto
tools (MD5, HMAC-MD5) were completely wrong**. Both now match official test vectors. High credibility impact.

## Phase 11 — Networking (35 tools) — ✅ audited — client math clean; **2 API-integration bugs later found & FIXED**

**Post-deploy live testing (domain-health-dashboard) found:**
1. **WRONG → FIXED:** dashboard read DNS results from `res.Answer` (Google-DoH shape) but the worker
   returns `res.answers` (lowercase). So EVERY DNS card (A/MX/NS/SPF/DMARC) showed "Not found" even for
   a healthy domain — health score stuck at 10/100. Fixed all 5 reads to `.answers`. (Dedicated
   spf-checker / dmarc-checker already used `.answers` correctly — bug was isolated to the dashboard.)
2. **UX → FIXED:** SSL card said "re-check in ~60s" but never auto-re-checked, so first-time SSL Labs
   scans (60–90s) left it stuck on "Scanning…" forever. Added auto-retry (every 45s, up to ~5 min).
Real finding for the site owner: **toolnestr.com has no DMARC record** (genuine — worth adding).

## Phase 11 (original) — Networking client-side — **0 bugs**
Client-side bit math correct: **cidr-calculator / subnet-calculator** (unsigned `>>>0`, `prefix===0`
guard avoids the `<<32` UB bug, correct network/broadcast/mask), ip-binary-hex, bandwidth (1000-based
bits/bytes with /8), mtu (−2 overhead). API tools (dns/whois/asn/blacklist/headers/ssl/ping/port/
propagation) proxy through `worker.js` → external services. `worker.js` has robust IP validation
(blocks private/reserved ranges = SSRF protection). **These need live end-to-end testing after the
worker is deployed** — can't verify external-data correctness statically. NOTE (deploy-time test).

## Phase 12 — Charts + Images + Text + Creators + SEO + PDF (72 tools) — ✅ audited (light) — **0 bugs found**
Output/format-oriented, low numeric risk. Verified where math exists: grammar-readability uses exact
**Flesch Reading Ease** coefficients (206.835 − 1.015·ASL − 84.6·ASW) ✓; histogram binning correct;
9 chart generators map data→SVG (axis scaling). Text tools are reversible transforms; PDF tools
(pdf-lib/pdf.js) are client-side merge/split/convert; image tools are client-side canvas ops.
Lighter review appropriate for the risk level; no numeric defects surfaced.

---

# FINAL SUMMARY — all 12 phases complete (462 live tools)

**Bugs found & fixed: 3 tools**
1. **inches-to-fraction-calculator** (WRONG) — whole number dropped when fraction rounds up. FIXED + verified.
2. **md5-hash-generator** (WRONG) — every hash wrong (broken hex). FIXED, passes official vectors.
3. **hmac-generator / HMAC-MD5** (WRONG) — broken hex + wrong construction. FIXED, passes RFC vectors.

**Open items (not code bugs):**
- Tax-bracket **data currency** (UK Scotland + non-US countries) — pick tax year, verify vs official sources; + build year selector & dated source disclaimer (Phase 2 follow-up).
- **tons-to-kg** — confirm metric-tonne labeling.
- Minor edges: scientific-notation `0` input → NaN; feet-and-inches negative results.
- Networking API tools — live end-to-end test after `worker.js` deploy.
- Islamic: prayer-times/sehri-iftar external-API dependency; inheritance simplified (disclaimed).

**Overall:** across 462 tools, only **3 real calculation bugs** — a genuinely high-quality codebase.
The 2 crypto bugs were the most important (trivially verifiable → high credibility risk); now correct.
