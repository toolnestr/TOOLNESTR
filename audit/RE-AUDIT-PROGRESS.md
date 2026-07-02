# Tool Re-Audit Progress (Session Continuity Log)

**Why this file exists:** the original `docs/10-tool-correctness-audit.md` / `audit/RESULTS.md`
claimed most categories were "0 bugs" — but that audit never actually ran the tools (no live
testing, no browser verification). When we finally tested Networking for real, we found 15 bugs
it had missed. This file tracks the **real, re-verified** re-audit: every category is being
re-tested with golden vectors, authoritative-source cross-checks, and real-browser verification
(via Playwright driving the system's Chrome) before being marked done. Trust this file over the
older audit docs for anything listed below.

**Method per tool:** read the actual `<script>` logic → port to Node.js → test against known/
textbook/authoritative values → fix confirmed bugs → rebuild → verify fix in a real browser
(Playwright + system Chrome, since the Claude-in-Chrome extension isn't connected in this
environment) → commit → push → deploy → verify live on production.

**Deployment mechanism (important, easy to forget):**
- Static site: `npm run build` then `npx wrangler pages deploy dist --project-name=toolnestr --commit-dirty=true`
- API backend (`worker.js`) is a **separate** Cloudflare Worker at `toolnestr.toolnestr.workers.dev`,
  deployed independently via `npx wrangler deploy --config wrangler-worker.jsonc` (config file
  already exists in repo root). Pages deploy does NOT touch this worker.
- Wrangler is logged in via OAuth in this environment already (`npx wrangler whoami` to confirm).
- After any deploy, **verify on the live domain directly** (`curl -sL https://toolnestr.com/tools/<slug>/ | grep ...`)
  rather than trusting wrangler's "0 files uploaded" message, which can be misleadingly reassuring
  when content-hash dedup kicks in — it doesn't mean the deploy failed, but always spot-check.

**Environment gotchas discovered this session (worth knowing up front):**
- The Bash/PowerShell tool's working directory **resets to the `payroll` project root after every
  single call** in this environment — it does NOT persist between calls despite what the tool
  description says. Every command must `cd "/c/Users/PDC/OneDrive/Desktop/Tool Nestr" && ...`
  (or `Set-Location` in PowerShell) in the *same* invocation as whatever it's chained to. Don't
  waste time re-discovering this.
- No Playwright install existed in this environment. `npx playwright --version` works (downloads
  a throwaway copy), but driving a real page needs the actual module: run
  `npm install --no-save playwright` inside the Tool Nestr project (safe — `node_modules` is
  gitignored, `--no-save` keeps `package.json`/lockfile untouched), then in a Node script:
  `require('C:/Users/PDC/OneDrive/Desktop/Tool Nestr/node_modules/playwright')` and
  `chromium.launch({ channel: 'chrome', headless: true })` to drive the real installed Chrome
  (found at `C:\Program Files\Google\Chrome\Application\chrome.exe`). For timezone-sensitive
  bugs, `browser.newContext({ timezoneId: 'America/Los_Angeles' })` is essential — several real
  bugs (see Everyday below) only reproduce in specific timezones, not the sandbox's default one.
  For local (pre-deploy) verification, run `npx astro preview --port 4321` in the background
  after `npm run build` and point Playwright at `http://localhost:4321/tools/<slug>/`.

---

## Categories DONE (real bugs found, fixed, verified live, committed & pushed)

### Networking (35 tools) — commits: `b806c67`, `663c717`, `aa3921c`, `2835ca0`, `97d35be` + worker deploys
15 real bugs fixed. Highlights: blacklist-checker always said "Clean" (array/object shape
mismatch), DNS Lookup always said "No records found" for every domain, uptime-checker always
said "Down", ip-distance-calculator never worked at all, VLSM calculator returned `/0` for every
input, MAC lookup's entire OUI table was scrambled (every vendor wrong), SPF/DMARC checkers
couldn't find records that existed (DoH quote-wrapping bug), reverse-DNS showed the query string
instead of the resolved hostname, WHOIS registrar always blank. Full details in git log.
Also: search-index.json.js + Header.astro site-wide search bar added (commits `77b958b`,
`2835ca0`, `97d35be`) — command-palette style, Ctrl+K, gradient icon badge matching logo.

### Converters (69 tools) — commit `4f4317b`
6 bugs. text-to-binary silently corrupted/dropped emoji (charCodeAt vs UTF-8 bytes).
ascii-code-converter showed "?" for codes 128-255 instead of the real Latin-1 char.
html-entity-converter double-decoded (`&amp;lt;` → `<` instead of `&lt;`).
feet-and-inches-calculator: multiply mode mislabeled an AREA as a length; negative results
showed a bare unitless number. json-to-yaml: any array of objects completely corrupted on
decode (this is the tool's own advertised Kubernetes/Docker use case!) — rewrote the parser.
json-to-xml: top-level arrays produced invalid XML with multiple roots.

### Finance (36 live tools) — commits `8c8c43a` (+ `tax.js` shared data)
4 bugs. compound-interest: contributions hard-coded to monthly compounding regardless of
selected frequency (the exact issue the OLD audit flagged but never fixed). savings-goal-
calculator: "time to reach goal" search loop only ever counted upward, couldn't correct
downward when interest made the true answer smaller — 25%+ overestimates. paycheck-calculator:
standard deduction hardcoded to single filer's $15k for EVERY status — married/HOH filers
overcharged $1,650-1,800/yr in phantom tax. uk-take-home-pay-calculator: student loan
thresholds frozen, disconnected from the year selector, ~2-3 years stale.

### Health & Fitness (30 tools) — commit `5799a70`
2 bugs. weight-loss-goal-calculator: Imperial mode produced ZERO result ever (weight fields
read only in the metric branch, but are always-visible/always-kg in the HTML). vo2-max-
calculator: erroneous extra ×0.85 scaling on every female Cooper-test estimate (formula is
sex-neutral by design; verified via WebSearch against multiple authoritative sources) — deflated
every female result 15%.

### Math (23 tools) — commit `8306134`
4 bugs, one severe. **fraction-calculator was COMPLETELY BROKEN**: `gcd()` was defined only in
the Astro frontmatter (server-only build code, never shipped to the browser) — threw an
unguarded ReferenceError on every single calculation since page load. square-root-calculator:
(1) `Math.pow(negative, fraction)` is NaN in JS even for real odd roots — cube root of -8 showed
NaN instead of -2; (2) stale DOM reference — once one valid result showed, the tool froze on
that number forever, never updating for subsequent invalid inputs. polynomial-calculator: page's
own title/description/FAQ promised "add, subtract, multiply polynomials" but only evaluation was
implemented — built the missing feature, verified against the page's own worked examples.

### Engineering & Science (44 tools) — commit `ea53842`
7 bugs, all fixed and verified live in a real Chromium browser (Playwright). resistor-color-code-
calculator: 6-band reverse mode's TCR swatch color and "TCR: X ppm/K" text came from two
independent `Math.random()` calls, so they could mismatch — now drawn once and reused.
wire-gauge-calculator: voltage-drop/power-loss calc was missing the round-trip ×2 factor its
sibling voltage-drop-calculator correctly applies, understating real-world drop/loss by exactly
2x — field also relabeled "One-way length (m)" for clarity. capacitor-code-calculator:
encodeValue()'s sub-10pF EIA-198 branches were dead code (unreachable `exp === -1/-2` checks) and
lacked zero-padding, so e.g. 4.7pF encoded to a malformed 2-character code that failed to
round-trip — rewrote the sub-10pF branch and added `padStart(2,'0')`. frequency-converter: ITU
band table had a gap (300–1000 Hz fell through to "Beyond SHF" instead of ULF) and a wrong VLF
lower bound — added the missing ULF band (300–3000 Hz), corrected VLF to 3000–30000, and
relabeled 30–300 Hz from "VF" to the correct "SLF". conduit-fill-calculator: the entire THHN
wireAreas table was wrong per NEC Chapter 9 Table 5 (inflated 19–65% across gauges) — replaced
with correct values. smd-resistor-code-calculator: 3-digit leading-R notation (e.g. "R47")
divided by 1000 instead of 100 (10x too small); EIA-96 mode was missing the `X`/`S`/`H` letter
codes and had `R` wrong (0.1 instead of the correct 0.01) — both fixed. atomic-mass-calculator:
crashed with a TypeError on any formula with parentheses/brackets (e.g. `Mg(OH)2`, `Ca3(PO4)2`,
hydrates like `CuSO4·5H2O`) due to an array/object type-confusion bug in the token-based parser —
replaced with a recursive-descent parser, verified against `H2O, Mg(OH)2, Ca3(PO4)2, Al2(SO4)3,
CuSO4.5H2O, C6H12O6, NaCl, Fe2(SO4)3, (NH4)2SO4`. All other 37 tools in this category checked
against authoritative references and confirmed correct — no bugs.

### Everyday (27 tools) — commit `1dccaab`
5 bugs, two severe. **prayer-times**: the "currently active" prayer and the live countdown
compared the browser's own local clock against the searched city's local prayer times with
no timezone conversion at all — checking prayer times for any city other than your own
timezone (the tool's entire "worldwide" value proposition) showed a completely wrong current
prayer. Verified live: browser in America/Los_Angeles checking the default city (Rawalpindi,
UTC+5, ~12h apart) correctly now shows Asr active with a 2h countdown to Maghrib, matching
Rawalpindi's real local time — the old code would've compared against LA's clock instead.
**age-calculator + date-difference**: date-only strings parse as UTC midnight but the day-math
read them back with local getters, shifting the calendar day by one for any timezone behind
UTC near month/year boundaries; the default "today" field used `toISOString()` (UTC) instead
of local date, showing tomorrow's date for a large part of each day across the whole Western
hemisphere. Fixed by using UTC getters/constructor consistently. Also replaced the single-borrow
day-subtraction with a proper calendar-anchor algorithm — the old one produced impossible
negative day counts (e.g. "26 years, 1 months, -2 days") whenever the start day-of-month didn't
exist a month later (31 Jan → 1 Mar). word-counter: sentence counter silently dropped a
trailing sentence lacking terminal punctuation instead of counting it, contradicting the tool's
own documented behavior. Several worked-example numbers in page copy (word-counter,
age-calculator, german-grade-calculator) didn't match what the tools actually compute — corrected
to real output.

---

### Everyday follow-up — prayer-times (2 new bugs found during re-verification pass, commits `44c6eba`, `30fd923`)
Found while re-verifying the Everyday category's earlier fixes were still holding live (they were —
these are new, distinct bugs, not regressions):
1. **Active prayer went blank every night between midnight and Fajr**, everywhere. `ppGetCurrentAndNext()`
   only checked whether today's prayers had already passed; before Fajr none had, so `current` stayed
   `null` even though yesterday's Isha was still actually active. Fixed: falls back to the last prayer
   in the order (Isha) when none of today's have passed yet. Verified live at 00:30 Asia/Karachi → shows
   "Isha 9:05 PM" active, next "Fajr at 3:19 AM".
2. **Qibla direction wrong for every city-search lookup** (only "Use My Location" was ever correct).
   Root cause: Aladhan's `timingsByCity`/`calendarByCity` endpoints currently echo a broken placeholder
   coordinate (`~8.8888888, 7.7777777`) in `meta.latitude/longitude` **regardless of the city
   requested** — confirmed via direct API calls for 6 different cities, all returned the identical
   placeholder. The prayer *times* are still computed correctly server-side (verified distinct correct
   timezones/times per city), only the echoed geocode is broken. Our Qibla bearing blindly trusted that
   field. Fixed by geocoding the city independently via Open-Meteo's free geocoding API
   (`geocoding-api.open-meteo.com`, no key required) and falling back to an honest "unavailable" state
   (not a fabricated wrong bearing) if geocoding fails. **Also required a `public/_headers` CSP
   `connect-src` allowlist update** for the new domain — first deploy silently failed in production
   (worked fine in local `astro preview` since that doesn't enforce the `_headers` file) until this was
   caught by testing the live site with Playwright, not just localhost. Verified live: Rawalpindi city
   search now shows Qibla 256.0° (previously 64.2°, derived from the bogus placeholder location),
   matching the geolocation-based value for the same real coordinates.
**Lesson for future sessions:** always do the final browser verification pass against the deployed
production URL, not just `astro preview` locally — CSP and other header-dependent behavior can differ.

**Follow-up (user decision, commit `fe5fe15`):** the static Qibla compass on prayer-times was still
considered unsatisfactory by the site owner (not a live/rotating compass, and dependent on Aladhan's
city geocoding). Removed the whole widget from prayer-times and replaced it with a card linking to
`/tools/qibla-direction-finder/`, which already has a proper live device-orientation compass and takes
manual lat/lng or GPS directly (no city-name geocoding dependency at all). Kept the independent
Open-Meteo geocoding on prayer-times only for the "Lat/Lng" method-info display line. Verified live:
button correctly links to and lands on the Qibla Direction Finder tool.

**Follow-up 2 (user decision, commit `bb7e9ad`):** on the Qibla Direction Finder tool itself, the user
reported the "Use my location" and "Enable live compass" buttons gave inconsistent/confusing results
depending on which was clicked, and wanted it to just work by default with no buttons. Removed both:
now auto-requests geolocation and computes the bearing on page load (falls back to manual lat/lng entry
on denial), then auto-attaches the device-orientation listener so the live compass turns on immediately
with no click — except iOS 13+ Safari, which only grants motion-sensor permission inside a user-gesture
handler (an OS-level restriction, not something that can be bypassed); a small "tap to enable" prompt
appears only in that case. Verified live: no buttons present, bearing auto-computes correctly (256.0°
for Rawalpindi coords), compass auto-enables ("Live compass on") with zero clicks.

**Follow-up 3 (user decision, commit `ae8e8a3`):** removed the standard Islamic-category disclaimer
from qibla-direction-finder specifically (a deterministic great-circle bearing calc), without touching
it on the other 15 Islamic tools where it's more clearly warranted (Zakat, inheritance, prayer times,
etc.). Added a `hideDisclaimer` prop on `ToolLayout` for this kind of per-tool override. Verified live:
disclaimer gone on qibla-direction-finder, still present on zakat-calculator.

### Construction (21) + Automotive (26) + Cooking (9) — done 2026-07-02 (Windows machine)
Full re-audit of all 56 tools: read each tool's compute logic, verified formulas/constants against
known references, ran the crash+correctness sweep, fixed bugs, verified live. **4 real bugs, two of
them hard page-crashes caught instantly by the sweep:**
- **insulation-calculator** (crash): declared `let location = 'attic'` at inline-script global scope,
  colliding with the read-only `window.location` global → `SyntaxError: Identifier 'location' has
  already been declared`, whole script dead. Renamed the var to `insLoc`.
- **stair-calculator** (crash): a stray extra `)` on the `r-stringer` assignment line →
  `SyntaxError: Unexpected token ')'`, whole script dead. Removed the extra paren.
- **roofing-calculator** (2x over-estimate): `roofArea = footprint * mult * 2` — the two gable planes'
  horizontal projections already sum to the full footprint, so the `* 2` doubled every result
  (shingle bundles, squares). The tool's OWN FAQ says a 2,000 sq ft home needs ~20-25 squares; the
  buggy code gave ~45. Removed the `* 2` → `footprint * mult`. Verified: 40x30 @ 6/12 → 1341.6 sq ft.
- **ev-co2-savings** (1000x over-estimate): `trees = savings / 0.022` divided a **kg** CO2 value by
  0.022 (that per-tree figure is in **metric tons**, ~22 kg), inflating the "equivalent trees" 1000x
  (~124,000 instead of ~124). Fixed to `savings / 21.77` (kg/tree/yr, EPA). Verified: 10k mi, 3.5
  mi/kWh, 25 mpg → 2.70 tons saved = 124 trees.
The other 52 tools checked out: construction geometry (concrete cf/27, brick 144/unit-area, tile,
paver, drywall, deck, fence, paint 350 sqft/gal, pool 7.48 gal/cuft), all 26 automotive incl. the EV
math (mi/kWh handling, home-charger I=P/V + NEC 125%, 3-phase √3, gear-ratio 336 constant, tire
sidewall, KE=½mv² regen, compression/displacement), and all 9 cooking converters (236.588 ml/cup,
oven fan -20°C, yeast ratios). Regression guards for roofing/insulation/stair added to
`sweep-checks.json`. **sweep.cjs now honors `BASE_URL`** (e.g. `http://localhost:4321`) so a build can
be swept against local `astro preview` before deploying.

## Categories NOT YET re-audited (still only have the UNRELIABLE old "0 bugs" claim)

Given what turned up in every category actually tested above, **do not trust "0 bugs" for these
until they get the same treatment**:

## Environment notes for THIS machine (new PC — different from the PDC/Windows one above)

This session ran on a **fresh WSL2/Ubuntu Linux environment** (a different machine than the
Windows/PowerShell/OneDrive one the notes above describe — none of that machine-specific stuff
applies here). Set up from scratch this session:

- **No sudo** (no passwordless sudo, and no TTY for password prompts) — could not `apt install`
  anything. Installed both Node.js and GitHub CLI as portable no-sudo binaries instead:
  - Node: downloaded official `node-v22.23.1-linux-x64.tar.xz` from nodejs.org, extracted to
    `~/.local/node`, added `~/.local/node/bin` to `PATH` via `~/.bashrc`.
  - `gh` CLI: downloaded release tarball from GitHub releases, binary placed at `~/.local/bin/gh`.
  - Both already on `PATH` (`~/.local/bin` and `~/.local/node/bin`), confirmed working.
- **gh auth**: logged in as `toolnestr` (matches the repo's GitHub account). `gh auth status`
  confirms scopes `gist, read:org, repo, workflow`.
- **wrangler auth**: also fresh on this machine (the old "already logged in via OAuth" note does
  NOT carry over between machines). Ran `npx wrangler login` — OAuth flow works fine here (prints
  the auth URL, browser completes it, localhost callback works through WSL2's port forwarding).
  Confirmed via `npx wrangler whoami` → logged in as `toolnestr@gmail.com`, account ID
  `9f4f4523ee138a462092708c7e4d7a54`. **Re-verify with `npx wrangler whoami` before deploying** —
  don't assume it's still valid in a new session/machine.
- **Repo location**: cloned fresh to `~/TOOLNESTR` (i.e. `/home/toolnestr/TOOLNESTR`) via
  `git clone https://github.com/toolnestr/TOOLNESTR.git` — NOT the `/mnt/c/Users/ADNAN/Desktop/
  TOOLNESTR-main` folder, which is just an unzipped copy with no `.git`/`node_modules` (leave that
  one alone; it's unrelated to this work).
- **npm install**: done, works fine once Node is on PATH.
- **Playwright**: `npm install --no-save playwright` completed, but `npx playwright install
  chromium` (the actual browser binary download) was **not completed** — the step was declined
  mid-session. Browser-based verification for this category has **not** happened yet; re-run
  `npx playwright install chromium` (or ask the user first, since it was explicitly skipped once)
  before doing the Playwright-driven verification step. There is no real Chrome install to target
  via `channel: 'chrome'` on this Linux box (unlike the old Windows machine) — use Playwright's
  bundled Chromium instead.
- **Bash tool cwd**: does NOT reliably persist between calls in this environment either (same
  gotcha as the original Windows notes, different cause) — always `cd` and set `PATH` in the same
  invocation as whatever command follows it.

- [x] **Construction + Automotive + Cooking** (56 tools) — DONE 2026-07-02, 4 bugs fixed (see above)
- [ ] **Time & Date** (15 tools)
- [ ] **Islamic** (16 tools) — has external API dependencies (prayer times), verify those too
- [ ] **Security + Developers** (40 tools) — old audit found/fixed 2 crypto bugs (MD5, HMAC-MD5)
      already; rest of the 40 unverified
- [ ] **Charts + Images + Text + Creators + SEO + PDF** (72 tools) — old audit explicitly did
      only a "light review" here, lowest confidence of all

## Sanity sweep (post-fix regression check) — DONE (all 6 categories), 2 real bugs found & fixed

**What this is:** a *separate, lighter* pass re-checking the categories already fixed above
(Converters, Finance, Health & Fitness, Math, Engineering & Science, Everyday — ~226 live tools)
for **regressions** since their fixes shipped. This is not the same as the "NOT YET re-audited"
list below (those have never been touched at all).

**Completed 2026-07-02 on the Windows machine (PDC / OneDrive).** The methodology gap below was
closed first: `sweep.cjs` now runs a targeted **correctness assertion** (known input → expected
output) for each tool that has one in `audit/sanity-sweep/sweep-checks.json`, on top of the
crash/console/blank-render detection. 44 correctness assertions total — one for every previously
fixed bug (regression guard) plus golden-vector spot checks across the FactorConverter family and
each category. Slugs without an assertion still get crash-detection only.

**How it runs now (Windows, NOT the Linux box):** `node audit/sanity-sweep/sweep.cjs <category>`
(`converters finance health math engineering everyday`). Reads `sweep-tools.json` (slug lists) and
`sweep-checks.json` (assertions), both from `audit/sanity-sweep/` via paths relative to the script
(cwd-independent). Drives the **real installed Chrome** via Playwright `channel:'chrome'`
(`C:\Program Files\Google\Chrome\Application\chrome.exe`) against live `https://toolnestr.com` —
**none of the Linux `LD_LIBRARY_PATH` / `libnspr4.so` / `playwright-deps` gymnastics apply here.**
Setup on this machine: `npm install` then `npm install --no-save playwright` with
`PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1` (system Chrome, no chromium download). Note: a full
`npm install` prunes the `--no-save` playwright, so reinstall it after any `npm install`. Results
written to `sweep-results-<category>.json`. Final per-tool status folds correctness in: a wrong
answer → `FAIL`, console/network errors without a crash → `FLAG`.

**Results — all six categories swept, correctness-checked:**
- **Converters: 69/69 pass, 26/26 correctness checks pass** (incl. all 6 fixed-bug regressions:
  text-to-binary emoji, ascii Latin-1, html-entity double-decode, feet-and-inches multiply-area,
  json-to-yaml array-of-objects, json-to-xml).
- **Finance: 33 pass, 1 flag → FIXED (two layers).** `currency-converter`'s live FX call failed.
  The sweep first surfaced a **CSP** block; allowlisting `api.frankfurter.app` in `public/_headers`
  cleared the CSP error but revealed the real problem underneath: **`api.frankfurter.app` is
  deprecated — it now 301-redirects and sends NO `Access-Control-Allow-Origin` header, so the
  browser fetch dies with a CORS error** (server-to-server curl still works, which is why it looked
  fine outside a browser — always verify FX/3rd-party calls in an actual browser). The maintained
  host `https://api.frankfurter.dev/v1/latest` returns 200 with `access-control-allow-origin: *`
  and an identical `{amount,base,date,rates}` body. Final fix: switched the tool's fetch to
  `api.frankfurter.dev/v1/latest` and changed the `connect-src` entry from `.app` to `.dev`.
  Verified live: 1 USD → €0.8785, no error banner. Single endpoint, no fallback in the tool.
- **Health: 30/30 pass, 3/3 checks pass** (bmi golden vector; weight-loss-goal imperial-mode
  regression; vo2-max female Cooper regression).
- **Math: 22 pass, 1 FAIL → FIXED.** **`matrix-calculator` was completely non-functional in
  production** — `readMatrix()` derived the rows/cols `<select>` id via
  `containerId.replace('-grid','-rows')`, turning `'matrix-a-grid'` into `'matrix-a-rows'`, but the
  selects are `a-rows`/`a-cols` (no `matrix-` prefix). `$('matrix-a-rows')` was `null`, so
  `.value` threw on every `calculate()` — including the one at load (line ~450). The page threw
  `Cannot read properties of null (reading 'value')` on load and produced no result on any op.
  Fixed by deriving the prefix correctly (`containerId.replace('matrix-','').replace('-grid','')`
  → `'a'`/`'b'`). Verified locally via `astro preview` + Playwright: ADD `[[1,2],[3,4]]+[[5,6],[7,8]]`
  → `6 8 10 12`, MUL → `19 22 43 50`, DET → `-2`, zero page errors. **Needs deploy to go live.**
  (This is exactly the kind of "runs but wrong / broken" defect the correctness dimension was added
  to catch; the old crash-only sweep would also have flagged it via the pageerror, but it had never
  been run against Math before.)
- **Engineering: 44/44 pass, 3/3 checks pass** (ohms-law; frequency-converter ULF-band regression;
  atomic-mass `Mg(OH)2` parentheses-parser regression — the one that used to crash).
- **Everyday: 26/26 pass, 3/3 checks pass** (word-counter trailing-sentence regression;
  age-calculator month-anchor / no-negative-days regression; date-difference UTC day-count golden
  vector). prayer-times relies on crash-detection only in the sweep (its correctness is
  timezone-dependent and was verified in prior sessions).

**Both production fixes DEPLOYED & verified live 2026-07-02** (user approved deploy+push):
(1) `currency-converter` → `api.frankfurter.dev/v1/latest` + `connect-src` `.dev` (live: 1 USD → €0.8785),
(2) `matrix-calculator` readMatrix id fix (live: ADD → `6 8 10 12`, 0 page errors). Deploy cmd used:
`npx wrangler pages deploy dist --project-name=toolnestr --commit-dirty=true`.

**Methodology gap — CLOSED.** The sweep no longer only checks for crashes. See `sweep-checks.json`
for the assertion format (`fill` / `select` / `preClick` / `click` / `read` / `readValue` and
`expect.contains` | `expect.notContains` | `expect.computes`). To extend coverage, add more slugs
there — the runner falls back to crash-detection for any slug without an entry.

## How to resume (full re-audit — categories never yet touched)

**Immediate next step (after the sanity sweep above is caught up):** Engineering & Science is done
(see commit above). Pick the next category from the "NOT YET re-audited" list — **Construction +
Automotive + Cooking (56 tools)** is next in line. Tell Claude: *"continue the tool audit,
category-wise, starting with Construction + Automotive + Cooking"* (or whichever category). Point
it at this file (`audit/RE-AUDIT-PROGRESS.md`) for full context — it explains the method,
deployment steps, and exactly what's done vs pending. Update this file's category list as each one
completes, same format as above (tools count, commit hash, bug list).

**Playwright on a no-sudo Linux box — libnspr4.so missing:** `npx playwright install chromium`
downloads the browser binary fine, but the bundled `chromium_headless_shell` fails to launch with
`error while loading shared libraries: libnspr4.so: cannot open shared object file`, and there's
no sudo to `apt install`/`playwright install-deps`. Fix without root: `apt-get download` (not
`install` — this doesn't need root) the missing `.deb`s — `libnspr4 libnss3 libatk1.0-0t64
libatk-bridge2.0-0t64 libcups2t64 libxkbcommon0 libatspi2.0-0t64 libxcomposite1 libxdamage1
libxfixes3 libxrandr2 libgbm1 libpango-1.0-0 libcairo2 libasound2t64` — then `dpkg-deb -x <file>
extracted/` each one (extraction doesn't need root either) into a scratch dir, and set
`LD_LIBRARY_PATH=<scratch>/extracted/usr/lib/x86_64-linux-gnu` before launching Playwright/node.
Confirmed working this session. Worth doing once and keeping the extracted libs around for the
rest of the audit rather than re-downloading every session.

There's also `audit/NETWORKING-BROWSER-VERIFICATION.md` — a manual click-through checklist for
all 35 networking tools with exact test inputs/expected outputs, if you want to spot-check the
Networking fixes yourself in a real browser at any point.
