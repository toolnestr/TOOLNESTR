# ToolNestr — 100-Tool Expansion Plan (A→Z, hand this file to the building AI)

Audit date: 2026-06-25. Current site: 188 live tools across 17 categories (networking 30,
engineering 20, everyday 19, automotive 15, seo 11, finance 10, images 10, text 10,
converters 10, time-date 10, health 8, developers 8, charts 8, security 7, math 6,
creators 5, pdf 4).

This plan adds **100 tools**: **33 already fully specced and ready to build** (zero new
research needed — just execute) + **67 new tools** researched below to fill the thinnest
categories and capture high-RPM/low-competition search demand. Do NOT duplicate any slug
already live — check `src/data/tools.js` before creating a page.

---

## GLOBAL RULES — apply to every one of the 100 tools, no exceptions

1. **Page content must be 700+ words minimum** of real, unique prose (intro + how-it-works +
   worked example + use cases + tips + FAQ). Word count excludes the tool's UI labels/buttons.
   Follow the structure already used in `TOOL-DETAILING-EXISTING.md` and the per-tool specs in
   `TOOL-BUILD-SPECS.md` (Intro → How it works/Formula → Worked example → Use cases → Tips &
   mistakes → FAQ with full written answers → Related tools → SEO meta), but expand each section
   with more detail/examples than those files show, since those were written as compact briefs,
   not final copy.
2. **Every tool page needs one relevant SVG diagram or illustration** placed near the top
   (after the intro, before or beside the formula/how-it-works section). It must be a genuine
   explanatory diagram (e.g. an annotated formula breakdown, a labelled before/after, a flow
   diagram, a chart shape) — never decorative clip-art. Build it as inline `<svg>` (no external
   image requests, keeps pages fast) with `role="img"` and a descriptive `aria-label`. Each tool
   spec below includes a "SVG diagram" line describing exactly what to draw.
3. **Use `ToolLayout.astro`** for every new page (do not hand-roll layout/schema — see
   `seo-gaps-2.md` item #4 for why that causes drift).
4. **Add 1–3 outbound citation links** to genuinely authoritative sources for any YMYL tool
   (health, finance, legal, tax) — same rule as `seo-gaps.md` item #2. Pure utility/dev tools
   (encoders, formatters, generators) don't need this.
5. **Add 3+ "Related tools" internal links** per page, pointing both ways (new tool → existing
   tool, and add the new tool to the existing tool's "Related tools" list too).
6. **Meta description 120–155 characters** (see `seo-gaps-2.md` items #1–2 for the mistake to
   avoid — don't ship descriptions over 160 or under 70 chars).
7. Add each new tool to `categories`/`tools` in `src/data/tools.js` with `status: 'live'` only
   once the page is actually built and working.

---

## PART A — 33 tools already fully specced, zero new research needed (build first)

These already have complete build specs (exact UI labels, formulas, worked examples, edge
cases, FAQ, SEO meta) sitting unused in **`TOOL-BUILD-SPECS.md`**. Building these first is the
fastest path to 100 new tools because the thinking is already done — just add the SVG diagram
(per Global Rule #2) and expand prose to 700+ words (per Global Rule #1) on top of each spec.

| # | Tool | Suggested slug | Category | Spec location |
|---|------|----------------|----------|----------------|
| 1 | AI API Cost Calculator (GPT & Claude) | `ai-api-cost-calculator` | developers | TOOL-BUILD-SPECS.md SPEC #1 |
| 2 | Tokens to Words Calculator | `tokens-to-words` | developers | SPEC #2 |
| 3 | Prompt Token Counter | `token-counter` | developers | SPEC #3 |
| 4 | LLM Context Window Checker | `context-window-checker` | developers | SPEC #4 |
| 5 | Reading Time Calculator | `reading-time-calculator` | text | SPEC #5 |
| 6 | Aspect Ratio Calculator | `aspect-ratio-calculator` | images | SPEC #6 |
| 7 | Invoice Late Fee Calculator | `invoice-late-fee-calculator` | finance | SPEC #7 |
| 8 | Savings Goal / Time-to-Save Calculator | `savings-goal-calculator` | finance | SPEC #9 |
| 9 | Hourly to Salary Converter | `hourly-to-salary` | finance | SPEC #11 |
| 10 | Crypto Profit Calculator | `crypto-profit-calculator` | finance | SPEC #13 |
| 11 | Freelancer Tax Estimator | `freelancer-tax-estimator` | finance | SPEC #14 |
| 12 | Cost-per-Unit Calculator | `cost-per-unit-calculator` | finance | SPEC #16 |
| 13 | Net Salary / Take-Home Pay Calculator | `net-salary-calculator` | finance | SPEC #17 |
| 14 | Income Tax Calculator | `income-tax-calculator` | finance | SPEC #18 |
| 15 | VAT / GST Calculator | `vat-gst-calculator` | finance | SPEC #19 |
| 16 | Overtime Pay Calculator | `overtime-pay-calculator` | finance | SPEC #20 |
| 17 | Severance / Notice Pay Calculator | `severance-pay-calculator` | finance | SPEC #21 |
| 18 | Fuel Cost (Trip) Calculator | `fuel-cost-calculator` | automotive | SPEC #22 |
| 19 | GSM to mm (Paper Thickness) Calculator | `gsm-to-mm-calculator` | converters | SPEC #23 |
| 20 | Lumens to Lux Calculator | `lumens-to-lux-calculator` | engineering | SPEC #24 |
| 21 | BTU to Tons (HVAC) Calculator | `btu-to-tons-calculator` | engineering | SPEC #25 |
| 22 | AWG to mm Calculator (Wire Gauge) | `awg-to-mm-calculator` | engineering | SPEC #27 |
| 23 | PPI / DPI Calculator | `ppi-dpi-calculator` | images | SPEC #28 |
| 24 | Color Contrast Checker (WCAG) | `color-contrast-checker` | developers | SPEC #30 |
| 25 | TDEE Calculator (by Activity/Sport) | `tdee-calculator` | health | SPEC #31 |
| 26 | Calorie Deficit Calculator | `calorie-deficit-calculator` | health | SPEC #32 |
| 27 | Keto Macro Calculator | `keto-macro-calculator` | health | SPEC #33 |
| 28 | Water Intake Calculator | `water-intake-calculator` | health | SPEC #34 |
| 29 | Ovulation / Fertile Window Calculator | `ovulation-calculator` | health | SPEC #36 |
| 30 | IVF Due Date Calculator | `ivf-due-date-calculator` | health | SPEC #37 |
| 31 | Cron Expression Generator | `cron-expression-generator` | developers | SPEC #38 |
| 32 | Crontab to Human-Readable | `crontab-to-human` | developers | SPEC #39 |
| 33 | JWT Decoder | `jwt-decoder` | security | SPEC #40 |

(Note: SPEC #8, #10, #12, #15, #26, #29, #35, #41–44 in `TOOL-BUILD-SPECS.md` were skipped above
because a live equivalent already exists — e.g. compound-interest, discount-calculator,
inflation-calculator, roman-numerals, base64, uuid-generator, ideal-weight, kva-to-kw. Don't
rebuild those.)

---

## PART B — 67 new tools (researched to fill thin categories + high-RPM gaps)

Each entry: **slug · target keyword · RPM/competition · one-paragraph content brief · SVG
diagram spec.** Build each to the Global Rules above (700+ words, SVG diagram, ToolLayout,
citations where YMYL, related-tools links).

### B1. PDF Tools (currently only 4 — biggest gap relative to demand)

1. **`pdf-page-numbers`** — "add page numbers to pdf" ($$$ / Low). Lets users insert page
   numbers (position, start number, format like "Page X of Y") into any PDF, processed in-browser
   via pdf-lib (already a dependency). Use cases: reports, theses, manuscripts. FAQ: numbering
   start point, skipping a cover page, Roman vs Arabic numerals. SVG: a page outline with a
   numbered footer highlighted and an arrow showing the position options (bottom-center,
   bottom-right, top-right).
2. **`pdf-watermark`** — "add watermark to pdf online" ($$$ / Low). Adds text or image watermark
   (diagonal, opacity-adjustable) to every page. Use cases: drafts, confidential docs, copyright
   protection. SVG: a page with a diagonal "CONFIDENTIAL" watermark shown at 3 opacity levels
   side by side.
3. **`pdf-password-protect`** — "password protect pdf online free" ($$$$ / Low). Encrypts a PDF
   with a user-supplied password client-side (pdf-lib supports basic encryption; if not feasible
   client-side, scope to password *removal* instead — verify library capability before building).
   SVG: a lock icon over a document with a key.
4. **`pdf-rotate`** — "rotate pdf pages online" ($$ / Med). Rotate all or selected pages
   90/180/270°, download result. SVG: a page icon shown rotating through 4 orientations with
   arrows.
5. **`pdf-page-remover`** — "delete pages from pdf" ($$ / Med). Remove specific pages from a PDF
   and download the rest. SVG: a stack of pages with 2 highlighted/crossed-out pages being pulled
   out.
6. **`pdf-to-text`** — "extract text from pdf online" ($$$ / Med). Pulls all selectable text out
   of a PDF (using pdfjs-dist, already a dependency) into plain text/clipboard. SVG: a PDF icon
   with text lines flowing out of it into a plain text box.

### B2. Math (currently 6 — thin for a calculator-heavy site)

7. **`quadratic-equation-solver`** — "quadratic formula calculator" ($$ / Med). Solves
   ax²+bx+c=0, shows discriminant, real/complex roots, and the full formula substitution step by
   step. SVG: a parabola graph with the roots marked on the x-axis.
8. **`matrix-calculator`** — "matrix calculator add multiply" ($$ / Med). Add, subtract,
   multiply 2×2/3×3 matrices, determinant, transpose. SVG: two matrix grids with an arrow showing
   row×column multiplication.
9. **`prime-number-checker`** — "prime number checker" ($ / Low). Checks primality of a number
   and lists factors if composite; also generates primes up to N. SVG: a number line with prime
   numbers highlighted in a different color.
10. **`gcd-lcm-calculator`** — "gcd lcm calculator" ($ / Low). Finds GCD and LCM of a list of
    numbers via Euclidean algorithm, shown step by step. SVG: a Venn-diagram-style factor overlap
    showing shared/unique prime factors.
11. **`logarithm-calculator`** — "log calculator any base" ($ / Low). log base b of x, natural
    log, change-of-base formula shown. SVG: a log curve graph with the input/output point marked.
12. **`combination-permutation-calculator`** — "nCr nPr calculator" ($ / Low). Calculates
    combinations and permutations (with/without repetition) with the factorial formula shown.
    SVG: a small diagram of selecting r items from n, showing ordered vs unordered outcomes.

### B3. Security / Hash (currently 7)

13. **`aes-encrypt-decrypt`** — "aes encryption online" ($$$ / Med). Client-side AES-GCM
    encrypt/decrypt of text using the Web Crypto API with a user passphrase — nothing leaves the
    browser. SVG: plaintext → lock icon → ciphertext flow diagram.
14. **`bcrypt-generator`** — "bcrypt hash generator online" ($$ / Low). Generates and verifies
    bcrypt hashes for password storage testing/learning (note: real production hashing must
    happen server-side — say this explicitly). SVG: a password going through a "salt + hash
    rounds" pipeline diagram.
15. **`password-breach-checker-explainer`** — SKIP building an actual breach-check (requires a
    live leaked-password API/dataset, out of scope for a static client-side tool) — replace with
    **`password-entropy-calculator`** — "password entropy calculator" ($$ / Low). Calculates
    bits of entropy from charset + length and maps it to a crack-time estimate. SVG: a bar
    showing entropy bits with crack-time labels (seconds → years → centuries) at thresholds.
16. **`csr-decoder`** — "csr decoder online" ($$$ / Low). Decodes an X.509 Certificate Signing
    Request and shows subject, key size, SANs. SVG: a CSR document icon with labelled fields
    (CN, O, key size) pointing out from it.
17. **`x509-certificate-decoder`** — "decode ssl certificate online" ($$$ / Low). Pastes a PEM
    cert and shows issuer, validity dates, SANs, fingerprint. SVG: a certificate icon with a
    validity-period timeline bar.
18. **`hibp-style-pin-strength`** — replace with **`pin-code-strength-checker`** — "is my pin
    code secure" ($$ / Low). Checks a 4–6 digit PIN against the most commonly used PIN list
    (publicly documented patterns like 1234, birth years) and rates strength. SVG: a keypad
    graphic with the most-guessed PINs greyed out.

### B4. Chart Generators (currently 8)

19. **`scatter-plot-generator`** — "scatter plot maker online" ($$ / Med). Paste x,y data pairs,
    get a downloadable SVG/PNG scatter chart with optional trendline. SVG diagram requirement is
    inherently met (the tool itself produces the chart) — for the explanatory diagram, show a
    small annotated example scatter plot with axes labelled.
20. **`pie-chart-generator`** — "pie chart maker online" ($$ / Med). Enter labeled values, get a
    downloadable pie/donut chart (note: donut already exists — differentiate by supporting
    exploded/highlighted slices and percentage labels). SVG: an example pie chart with one slice
    pulled out, labelled.
21. **`radar-chart-generator`** — "radar chart maker" ($$ / Low). Multi-axis comparison chart
    (e.g. skill comparison, product specs). SVG: a 5-axis radar/spider chart example with two
    overlapping data series.
22. **`box-plot-generator`** — "box plot maker online" ($$ / Low). Generates a box-and-whisker
    plot from a data set, showing median/quartiles/outliers. SVG: an annotated box plot showing
    Q1, median, Q3, whiskers, and an outlier point.
23. **`line-chart-generator`** — "line chart maker online" ($$ / Med). Plot one or more series
    over labeled x-axis categories (time series, trends). SVG: an example multi-line chart with a
    legend.

### B5. Developers (currently 8, beyond Part A's dev tools)

24. **`regex-tester`** — "regex tester online" ($$$ / High, but huge volume — worth the
    competition). Live regex match highlighting, named groups, flags, common pattern library.
    SVG: a string with regex match spans highlighted and labelled (group 1, group 2).
25. **`yaml-validator`** — "yaml validator online" ($$ / Med). Validates YAML syntax and shows
    error line/column (complements existing json-to-yaml). SVG: a YAML indentation diagram
    showing correct vs incorrect nesting.
26. **`sql-formatter`** — "sql formatter online" ($$$ / Med). Beautifies/minifies SQL queries
    with keyword casing options. SVG: a messy one-line SQL query with an arrow into a clean
    indented version.
27. **`diff-checker`** — "text diff checker online" ($$$ / High). Side-by-side or inline diff
    between two text blocks, line-level highlighting. SVG: two text columns with added/removed
    lines color-coded (green/red) and connecting lines.
28. **`markdown-to-html`** — "markdown to html converter" ($$ / Med). Live markdown preview +
    HTML source output. SVG: a markdown snippet on the left, rendered HTML on the right, with an
    arrow between.
29. **`curl-command-generator`** — "curl command generator" ($$$ / Low). Builds a curl command
    from method/URL/headers/body inputs — popular with API developers. SVG: a request-builder
    flow diagram (method → headers → body → generated command).
30. **`http-status-code-lookup`** — "http status codes list" ($$ / Med). Searchable reference +
    explanation for every HTTP status code, with common causes. SVG: a status-code range chart
    (1xx–5xx) color-coded by category.

### B6. Engineering / Electrical (currently 20 — extend the site's strongest category)

31. **`ohms-law-calculator`** — "ohms law calculator" ($$$ / Med). Solve for V, I, R, or P given
    any two. SVG: the Ohm's law triangle (V over I×R) with the power wheel formulas around it.
32. **`resistor-color-code-calculator`** — "resistor color code calculator" ($$$ / Med). 4/5/6
    band resistor color → resistance + tolerance, and reverse. SVG: a resistor body with colored
    bands labelled with their digit/multiplier meaning.
33. **`capacitor-charge-time-calculator`** — "capacitor charging time calculator" ($$ / Low).
    RC time constant, charge/discharge curve, time to reach a % charge. SVG: an exponential
    charging curve graph with the τ (tau) point marked.
34. **`three-phase-power-calculator`** — "3 phase power calculator" ($$$ / Low). Calculates
    power, current, or voltage for 3-phase systems (line-to-line vs line-to-neutral). SVG: a
    3-phase waveform diagram (3 sine waves offset 120°).
35. **`transformer-calculator`** — "transformer turns ratio calculator" ($$$ / Low). Turns ratio,
    primary/secondary voltage and current from given values. SVG: a transformer schematic with
    primary/secondary coils and turns labelled N1/N2.
36. **`power-factor-calculator`** — "power factor correction calculator" ($$$ / Low). Real,
    reactive, apparent power and power factor from inputs; capacitor size needed for correction.
    SVG: the power triangle (real/reactive/apparent power as a right triangle).
37. **`solar-panel-output-calculator`** — "solar panel output calculator" ($$$$ / Med). Estimates
    daily/monthly kWh output from panel wattage, sun hours, and efficiency losses. SVG: a sun →
    panel → battery/grid energy-flow diagram with loss percentages labelled at each stage.

### B7. Automotive / EV (currently 15 — extend further, high-RPM niche)

38. **`tire-size-calculator`** — "tire size calculator" ($$$ / Med). Compares two tire sizes
    (e.g. 225/45R17 vs 235/40R18), shows diameter/circumference/speedometer error %. SVG: two
    tire cross-sections labelled with width/sidewall/rim diameter.
39. **`gear-ratio-calculator`** — "gear ratio calculator rpm" ($$ / Low). Calculates engine RPM
    at a given speed from gear ratio, final drive, and tire size (or solves for any variable).
    SVG: a gear train diagram with input/output teeth counts labelled.
40. **`car-depreciation-calculator`** — "car depreciation calculator" ($$$ / Low). Projects a
    vehicle's value over time using a standard depreciation curve. SVG: a declining value curve
    over 10 years with year-by-year value points marked.
41. **`towing-capacity-calculator`** — "towing capacity calculator" ($$$ / Low). Compares trailer
    weight + cargo against a vehicle's rated towing/payload capacity, flags if over limit. SVG: a
    truck-and-trailer side diagram with weight arrows (tongue weight, GVWR, GCWR) labelled.
42. **`ev-charging-cost-by-state`** — SKIP (too maintenance-heavy, electricity rates change) —
    replace with **`ev-vs-gas-break-even-calculator`** — "ev vs gas car break even calculator"
    ($$$$ / Low). How many months/miles until an EV's higher upfront cost is offset by fuel
    savings, given both vehicles' prices and running costs. SVG: two converging cost lines (EV
    starting higher, gas car catching up) crossing at the break-even point.

### B8. Networking (currently 30 — site's biggest category, a few high-value gaps remain)

43. **`mtu-calculator`** — "mtu calculator" ($$ / Low). Calculates max payload/overhead for a
    given MTU and encapsulation type (PPPoE, VLAN, GRE, IPsec). SVG: a packet diagram showing
    header overhead eating into the MTU budget, segmented by encapsulation layer.
44. **`bandwidth-vs-throughput-calculator`** — "bandwidth to throughput calculator" ($$ / Low).
    Estimates real achievable throughput from rated bandwidth, accounting for protocol overhead
    and latency (via a simplified model). SVG: a pipe diagram — wide pipe (rated bandwidth) with
    a narrower effective flow (real throughput) inside it.
45. **`dns-record-builder`** — "dns record generator" ($$$ / Low). Builds correctly-formatted
    A/AAAA/MX/TXT/SPF/DKIM zone-file lines from form inputs (complements the existing dns-lookup,
    spf-checker, dmarc-checker — this is the generation counterpart). SVG: a DNS zone file
    snippet with each field (name/type/TTL/value) labelled.
46. **`subnet-mask-cheat-sheet`** — "subnet cheat sheet calculator" ($$ / Med). Interactive
    CIDR/mask/hosts-per-subnet reference table you can filter/search (complements the existing
    subnet-calculator with a quick-lookup reference format). SVG: a CIDR-to-hosts scale bar
    (/24 → /16 → /8) shown proportionally.

### B9. Text & Writing (currently 10)

47. **`grammar-readability-checker`** — "readability score checker" ($$$ / Med). Computes
    Flesch-Kincaid / Flesch Reading Ease scores from pasted text, with a grade-level estimate.
    SVG: a readability scale (0–100) with grade-level bands marked and the text's score plotted.
48. **`text-to-slug-generator`** — "url slug generator" ($$ / Low). Converts a title into a
    clean URL slug (lowercase, hyphenated, stripped of stopwords/special chars). SVG: a title
    string with an arrow transforming it character-by-character into a slug.
49. **`acronym-generator`** — "acronym generator from phrase" ($ / Low). Builds an acronym from
    a phrase, or expands a known acronym. SVG: a phrase with the first letter of each word
    highlighted, collapsing into the acronym.
50. **`text-diff-word-counter`** — SKIP (overlaps #27 diff-checker) — replace with
    **`citation-generator`** — "apa mla citation generator" ($$$$ / Med). Generates APA/MLA/
    Chicago citations from title/author/year/source-type inputs. SVG: a labelled citation
    breaking down which input field maps to which part of the formatted citation.
51. **`paraphrasing-helper`** — SKIP (AI-paraphrasing is a different product category, not a
    calculator) — replace with **`pig-latin-translator`** — "pig latin translator" ($ / Low,
    high novelty search volume). Translates English text to/from Pig Latin. SVG: a word split
    into syllables with the "ay" suffix and consonant-shift rule illustrated.

### B10. Time & Date (currently 10)

52. **`working-days-between-dates-by-country`** — extend existing business-days-calculator with
    **`countdown-to-event-widget-generator`** — "countdown timer generator embed" ($$$ / Low).
    Builds an embeddable countdown to a specific date for launches/sales/events, with copyable
    embed code. SVG: a countdown display mockup (days:hours:minutes:seconds) with the target
    date marked on a mini timeline.
53. **`time-zone-meeting-converter`** — differentiate from existing meeting-time-planner with
    **`world-clock-comparator`** — "world clock multiple time zones" ($$$ / Med). Shows current
    time in up to 6 selected cities side by side, highlighting daytime/nighttime. SVG: a 24-hour
    horizontal timeline with day/night shading for each selected city's offset.
54. **`moon-phase-calculator`** — "moon phase calculator by date" ($$$ / Low). Shows the moon
    phase for any given date, plus next full/new moon dates. SVG: the 8 moon phases in a circular
    cycle diagram with the queried date's phase highlighted.
55. **`zodiac-sign-calculator`** — "zodiac sign calculator by date" ($$ / Med, very high volume).
    Returns zodiac sign, element, and date range from a birthdate. SVG: a 12-segment zodiac wheel
    with the matched sign's segment highlighted.

### B11. Creators (currently 5)

56. **`youtube-thumbnail-downloader`** — "youtube thumbnail downloader" ($$$ / High but huge
    volume). Extracts all available thumbnail resolutions from a YouTube URL via the public
    `img.youtube.com` predictable URL pattern (no API key, no scraping — just URL construction).
    SVG: a YouTube video frame with 4 resolution-size boxes (maxres/hq/mq/sd) overlaid for scale
    comparison.
57. **`instagram-bio-link-generator`** — replace with **`social-media-image-size-cheat-sheet`** —
    "social media image sizes 2026" ($$$$ / Low). Reference + visual cropper preview for the
    current recommended image dimensions per platform/placement (profile, post, story, cover).
    SVG: a grid of rectangles proportionally sized to each platform's aspect ratio, labelled with
    pixel dimensions.
58. **`color-palette-generator`** — "color palette generator from image" ($$$ / Med). Extracts a
    5-color palette from an uploaded image (client-side canvas pixel sampling) with hex codes.
    SVG: an example image thumbnail with 5 color swatches extracted below it and connecting lines
    to the sampled regions.
59. **`gradient-generator`** — "css gradient generator" ($$$ / Med). Visual linear/radial CSS
    gradient builder with copyable CSS code. SVG: a gradient bar with color-stop markers and
    their percentage positions labelled.
60. **`favicon-generator`** — "favicon generator from image" ($$ / Low). Converts an uploaded
    image into a multi-size favicon set (16/32/48/180px) + the HTML `<link>` tags to paste. SVG: a
    browser tab mockup showing the favicon at actual size next to a magnified version showing
    pixel detail.

### B12. Country-Specific Finance (high-RPM, low-comp by design — pick 2–3 countries to start)

61. **`uk-take-home-pay-calculator`** — "uk take home pay calculator 2026" ($$$$ / Low). UK
    income tax + National Insurance bands applied to gross salary. SVG: a stacked bar showing
    gross salary split into take-home/tax/NI portions.
62. **`pakistan-income-tax-calculator`** — "pakistan income tax calculator 2026" ($$$ / Low).
    FBR salary tax slabs applied to monthly/annual income. SVG: a tax-bracket staircase diagram
    showing which slab portions of income fall into.
63. **`canada-net-salary-calculator`** — "canada net salary calculator 2026" ($$$$ / Low).
    Federal + provincial tax (pick top 3 provinces) + CPP/EI deductions. SVG: same stacked-bar
    style as #61, adapted to federal/provincial/CPP/EI segments.
64. **`australia-tax-calculator`** — "australia income tax calculator 2026" ($$$$ / Low).
    ATO tax brackets + Medicare levy. SVG: stacked bar (take-home/tax/Medicare levy).
65. **`netherlands-net-salary-calculator`** — "netherlands net salary calculator 2026" ($$$$ /
    Low). Box 1 income tax bands + holiday allowance estimate. SVG: stacked bar with holiday
    allowance called out separately.

### B13. Miscellaneous high-value gaps

66. **`tip-pooling-calculator`** — "tip pooling calculator restaurant" ($$ / Low). Splits a tip
    pool among staff by hours worked or role-weighted points. SVG: a pie chart of the tip pool
    divided proportionally among 3 example roles.
67. **`paint-coverage-calculator`** — "how much paint do i need calculator" ($$$ / Med). Wall
    area minus doors/windows, divided by paint coverage rate and number of coats, rounded up to
    can sizes. SVG: a wall rectangle with door/window cutouts subtracted, and a paint can icon
    showing the rounded-up quantity.

---

## Build order recommendation

1. **Part A (33 tools)** — fastest wins, specs already exist, just add SVG + expand prose.
2. **B6/B7/B8 (Engineering/Automotive/Networking, ~17 tools)** — plays to the site's existing
   topical authority in these categories, easiest to rank since Google already associates the
   domain with this content.
3. **B12 (5 country-finance tools)** — highest RPM per the existing `TOOL-IDEAS-LOW-COMPETITION.md`
   strategy; low competition by design.
4. **B1/B3/B4/B5 (PDF/Security/Charts/Dev, ~25 tools)** — fills the thinnest categories.
5. **B9/B10/B11/B13 (Text/Time/Creators/Misc, ~17 tools)** — broadens reach, several
   high-search-volume novelty tools (`zodiac-sign-calculator`, `youtube-thumbnail-downloader`)
   for traffic even where RPM is lower.

Total: 33 + 67 = **100 tools**.
