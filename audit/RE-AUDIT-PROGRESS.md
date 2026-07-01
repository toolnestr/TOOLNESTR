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

## Categories NOT YET re-audited (still only have the UNRELIABLE old "0 bugs" claim)

Given what turned up in every category actually tested above, **do not trust "0 bugs" for these
until they get the same treatment**:

- [ ] **Engineering & Science** (44 tools) — NEXT UP when resuming
- [ ] **Construction + Automotive + Cooking** (56 tools)
- [ ] **Time & Date** (15 tools)
- [ ] **Islamic** (16 tools) — has external API dependencies (prayer times), verify those too
- [ ] **Security + Developers** (40 tools) — old audit found/fixed 2 crypto bugs (MD5, HMAC-MD5)
      already; rest of the 40 unverified
- [ ] **Charts + Images + Text + Creators + SEO + PDF** (72 tools) — old audit explicitly did
      only a "light review" here, lowest confidence of all

## How to resume

Tell Claude: *"continue the tool audit, category-wise, starting with Engineering & Science"* (or whichever
category). Point it at this file (`audit/RE-AUDIT-PROGRESS.md`) for full context — it explains
the method, deployment steps, and exactly what's done vs pending. Update this file's category
list as each one completes, same format as above (tools count, commit hash, bug list).

There's also `audit/NETWORKING-BROWSER-VERIFICATION.md` — a manual click-through checklist for
all 35 networking tools with exact test inputs/expected outputs, if you want to spot-check the
Networking fixes yourself in a real browser at any point.
