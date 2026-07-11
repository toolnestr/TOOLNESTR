# Toolnestr.com — Clothing & Garment Tools: Keyword Strategy, Roadmap & Build Spec

**Companion pattern:** follows the same category-hub UX, build cadence, and technical rules as `docs/construction-tools/construction-tools-spec.md` and `docs/subject-tools/TOOL-CREATION-RULES.md`. Read those two first — this file only adds clothing-specific keyword/credibility rules and the curated tool list on top.

**Source of tool validation:** every tool below was confirmed live on a named competitor site via web research (2026-07-11) — Omni Calculator, SewCalcs, Ask Sewphie, Apparel.wiki, GarmentCalc, TREASURIE, plus dedicated size-converter and cost-per-wear sites. Nothing here is a guessed/invented tool name; anything that couldn't be found running elsewhere was dropped from the shortlist.

---

## 1. Category identity

- **Category id:** `clothing` · **Name:** "Clothing & Garment Tools" · **Emoji:** 👗
- **Accent theme:** rose/pink (`from-rose-500 via-pink-500 to-rose-600` hero gradient), distinct from construction's amber and the default indigo — registered in `src/pages/tools/[category].astro` (`accents.clothing`), `src/components/ToolCard.astro` (`rose` accent), `src/category-content.js`, and the homepage icon set in `src/pages/index.astro`.
- **Two audiences on one category — decide before mass build:** (A) consumers/hobbyists (size converters, fabric yardage, sewing math) and (E) B2B apparel-industry users (garment costing, container loading, AQL sampling). They share a hub page today; revisit whether E should split into its own category later if it grows past ~20 tools.

---

## 2. Content-depth override (differs from subject-tools default)

`docs/subject-tools/TOOL-CREATION-RULES.md` §4 sets a 1000+ word floor for Physics/Chemistry/Biology tools, which carry genuine learning intent. Clothing tools are utility calculators first — most don't need that depth to be useful.

**Clothing category rule: 700+ words minimum** (not 1000+), everything else in `TOOL-CREATION-RULES.md` §1–§9 applies unchanged (Astro + `SubjectToolPage` + `window.STK`, Chart.js + 2 static auto-rotating Three.js diagrams, mobile rules, input validation, FAQ/HowTo schema, formula-sourcing).

---

## 3. Credibility Standard

Lower liability risk than construction (nobody gets hurt from a wrong bra size), but wrong numbers still cost users money (wasted fabric, mispriced garments) or embarrassment (wrong size ordered). Every formula must trace to a real source, not "the internet's version."

| Category | Primary source(s) to cite internally |
|---|---|
| Size conversion (clothing, shoe, bra, ring, hat, glove, sock) | ASTM D5585 / D6829 (US misses sizing), ISO 3635 / 8559 (international garment sizing), brand-published conversion charts (cross-checked across 2+ brands) |
| Fabric weight / GSM / denier | ASTM D3776 (fabric weight), ASTM D1907 (yarn number) |
| Body measurement / ease | Standard pattern-drafting ease tables (industry-standard wearing-ease ranges by garment type) |
| Sewing math (seam allowance, bias tape, elastic, zipper, thread consumption) | Standard sewing/pattern-drafting reference formulas (cross-checked against SewCalcs/Ask Sewphie's public methodology where formulas are shown) |
| Garment costing / CM / SAM | Standard apparel-costing methodology (SMV × cost-per-minute for CM; cost-sheet = fabric + trims + CM + overhead + margin) |
| Container/CBM/AQL | Standard freight CBM formula (L×W×H/1,000,000 per carton), ISO 2859-1 for AQL sampling levels |

**Practical audit step per tool (before publish):** hand-verify at least 2 worked examples per tool, same discipline as `docs/10-tool-correctness-audit.md`. Run the finished formula through that audit harness once the batch is live, not per-tool (see §5 build-process rules).

---

## 4. Tool List by Category (68 tools)

`sub` tag values below match the icons already registered in `[category].astro`'s `subIcons` map — use them exactly.

### A. Size Converters — `sub: 'Size Converters'` (10)
| Tool | Keyword angle |
|---|---|
| Clothing Size Converter (US/UK/EU/Asia) | "clothing size converter" |
| Shoe Size Converter | "shoe size conversion chart calculator" |
| Ring Size Calculator | "ring size calculator" |
| Hat Size Calculator | "hat size calculator" |
| Belt Size Calculator | "belt size calculator" |
| Glove Size Calculator | "glove size calculator" |
| Sock Size Calculator | "sock size calculator" |
| Sunglasses Size Calculator | "sunglasses size calculator" |
| Kids' Clothing Size by Age Calculator | "kids clothing size by age" |
| Bra Size Calculator | "bra size calculator" |

### B. Fit & Measurement — `sub: 'Fit & Measurement'` (5)
| Tool | Keyword angle |
|---|---|
| Dress Size Calculator | "dress size calculator" |
| Jacket/Suit Size Calculator | "suit jacket size calculator" |
| Body Shape Calculator | "body shape calculator" |
| Inseam Length Calculator | "inseam length calculator" |
| Ease Calculator (wearing/design ease) | "sewing ease calculator" |

### C. Fabric & Yardage — `sub: 'Fabric & Yardage'` (15)
| Tool | Keyword angle |
|---|---|
| Fabric Yardage Calculator | "fabric yardage calculator" |
| Fabric Cost Calculator | "fabric cost calculator" |
| GSM/Fabric Weight Calculator | "GSM to oz fabric weight calculator" |
| Fabric Shrinkage Calculator | "fabric shrinkage calculator" |
| Lining Fabric Calculator | "lining fabric requirement calculator" |
| Interfacing/Stabilizer Yardage Calculator | "interfacing yardage calculator" |
| Curtain Panel Calculator | "curtain fabric calculator" |
| Quilt Binding Calculator | "quilt binding calculator" |
| Fabric Unit Converter (yard/meter/inch/cm) | "convert yards to meters fabric" |
| Garment Fabric Estimator (per style) | "how much fabric for a dress calculator" |
| Denier/Tex/Dtex Yarn Converter | "denier to tex converter" |
| Yarn Count Converter (Ne ↔ Denier) | "yarn count converter" |
| Tablecloth Fabric Calculator | "tablecloth fabric calculator" |
| Pillow Cover / Box Cushion Fabric Calculator | "box cushion fabric calculator" |
| Roman Blind Fabric Calculator | "roman blind fabric calculator" |

### D. Pattern & Sewing — `sub: 'Pattern & Sewing'` (17)
| Tool | Keyword angle |
|---|---|
| Seam Allowance Calculator | "seam allowance calculator" |
| Bias Tape Calculator | "bias tape length calculator" |
| Elastic Length Calculator | "elastic length calculator" |
| Zipper Length Calculator | "zipper length calculator" |
| Pattern Grading Calculator | "pattern grading calculator" |
| Circle Skirt Calculator | "circle skirt calculator" |
| Pleated Skirt Calculator | "pleated skirt calculator" |
| Thread Consumption Calculator | "thread consumption calculator" |
| Stitch Length Calculator | "stitch length calculator" |
| Needle Size Calculator | "sewing needle size chart calculator" |
| Buttonhole Spacing Calculator | "buttonhole spacing calculator" |
| Buttonhole Length Calculator | "buttonhole length calculator" |
| Gathering Ratio Calculator | "gathering ratio calculator sewing" |
| Pleat Allowance Calculator | "pleat allowance calculator" |
| Knit Stretch % Test Calculator | "knit fabric stretch percentage calculator" |
| FBA/SBA Bust Adjustment Calculator | "full bust adjustment calculator" |
| Trim/Elastic Consumption Calculator (B2B, per-garment) | "trim consumption calculator garment" |

### E. Cost & Business — `sub: 'Cost & Business'` (16)
| Tool | Keyword angle |
|---|---|
| Cost-Per-Wear Calculator | "cost per wear calculator" |
| Garment Manufacturing/Costing Calculator | "garment costing calculator" |
| Clothing Markup & Retail Price Calculator | "clothing markup calculator" |
| Fabric Consumption-to-Cost Calculator | "fabric consumption cost calculator" |
| Wholesale-to-Retail Pricing Calculator | "wholesale to retail price calculator" |
| Custom Garment/Order Price Calculator | "custom clothing price calculator" |
| Tailoring/Alteration Cost Estimator | "alteration cost calculator" |
| Sourcing/CM (Cut-Make) Cost Calculator | "CM cost calculator garment" |
| Packaging & Shipping Cost Estimator | "apparel shipping cost calculator" |
| Fabric Bolt-to-Garment Yield Calculator | "fabric yield calculator" |
| Margin vs Markup Calculator | "margin vs markup calculator" |
| Quick Cost Sheet Calculator | "garment cost sheet calculator" |
| Fabric Waste & Overrun Calculator | "fabric waste percentage calculator" |
| Carton CBM & Container Loading Estimator | "CBM calculator container loading" |
| AQL Sampling & Lead Time Estimator | "AQL sampling calculator" |
| SAM (Standard Allowed Minute) / Line Efficiency Calculator | "SAM calculator garment production" |

### F. Care — `sub: 'Care'` (2)
| Tool | Keyword angle |
|---|---|
| Laundry Symbol Decoder | "laundry symbol decoder" |
| Fabric Care/Wash Temperature Guide Calculator | "wash temperature guide by fabric" |

### G. Accessories — `sub: 'Accessories'` (3)
| Tool | Keyword angle |
|---|---|
| Shoelace Length Calculator | "shoelace length calculator" |
| Cross-Stitch Calculator | "cross stitch fabric calculator" |
| Tote/Bag Size & Fabric Calculator | "tote bag fabric calculator" |

---

## 5. Build process rules (standing instructions for this category)

- **Build sequentially by hand, one tool at a time — no mechanical scaffold/codegen and no clone-from-reference-tool shortcuts.** Both were considered for token efficiency and explicitly rejected: a bug in a shared skeleton or a flawed reference tool would propagate silently across every tool built from it. Every tool gets its own full build and its own formula verification.
- Dispatch each tool as its own agent turn/session rather than one long growing conversation, to keep context (and cost) flat per tool — but pass the current `tools.js` state each time so slugs/emojis don't collide.
- 700+ words minimum per page (see §2), not 1000+.
- Unique emoji within the `clothing` category; correct `sub` tag from §4.
- Hand-verify 2 worked examples per tool against the sources in §3.
- Defer the numeric audit-harness pass to the end of each ~10-tool batch (matches `docs/10-tool-correctness-audit.md`'s existing structure), not per tool.
- Full `npm run build` clean, 0 duplicate slugs, before considering a batch done.
- Build order: **A (Size Converters) → B (Fit & Measurement) → C (Fabric & Yardage) → D (Pattern & Sewing) → F (Care) → G (Accessories) → E (Cost & Business) last.** Consumer-facing, higher-search-volume categories first; the B2B costing cluster (E) last since it's a smaller, more specialized audience and can be built once the consumer side is live and validated.

## 6. Open decisions to confirm with user before mass build

1. Whether category E (B2B apparel-industry tools) belongs on this same consumer-facing hub long-term, or should split into its own category once it grows.
2. Run the keyword list through a real keyword-volume tool before locking build order — the angles above are intent-logic only, same caveat as the construction spec.
