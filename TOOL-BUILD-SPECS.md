# Tool Build Specs — MAXIMUM Detail (for AI-assisted building)

> ⚠️ THIS FILE = **NEW TOOLS ONLY** (tools not yet on the site).
> Some specs below duplicate tools you ALREADY built — IGNORE these here; their
> detailing lives in `TOOL-DETAILING-EXISTING.md` instead:
> **#8 Compound Interest · #10 Inflation · #12 Discount · #15 Tip & Split ·
> #29 Roman Numerals · #35 Ideal Weight · #41 Base64.**
> Partial overlaps to treat as enhancements, not rebuilds: #11/#17 (salary),
> #14/#18 (tax), #31 (TDEE vs existing BMR/calorie).

Each tool is a COMPLETE blueprint. An AI (or you) can build the page directly
from it with no guesswork. Every spec follows the same structure so the site
stays consistent. Depth target = CalculatorPlaza (long, genuinely helpful pages).

## The standard structure every tool page must have
1. **H1 + one-line promise**
2. **The tool UI** — exact field labels, placeholder text, button text, result layout
3. **Edge cases / validation** — what to do with bad or empty input
4. **"What is this?" intro** — 2–3 short plain-language paragraphs
5. **"How it works" + formula** — the real math/logic written out
6. **Worked example(s)** — real numbers, step by step
7. **Use cases / who it's for**
8. **Tips & common mistakes**
9. **FAQ** — 5–8 questions WITH full written answers (SEO + snippets)
10. **Related tools** — internal links
11. **SEO meta** — title tag + meta description

> Build note for the AI builder: keep all changeable numbers (prices, rates,
> constants) in ONE config object at the top of each component, and show a
> visible "Last updated: [date]" line so they're easy to maintain.

---
---

# CATEGORY: AI / NEW-TREND
---

# SPEC #1 — AI API Cost Calculator (GPT & Claude)
**Target keyword:** "openai api cost calculator", "claude api cost calculator", "llm api price calculator"
**RPM:** $$$ · **Comp:** Low · **Slug:** `/ai-api-cost-calculator`

## 1. H1 + promise
**H1:** AI API Cost Calculator (GPT & Claude)
**Promise:** Estimate exactly what an OpenAI or Anthropic API call costs — by input and output tokens — before you spend a cent.

## 2. Tool UI (exact labels)
| Field | Label shown | Control | Placeholder / default |
|-------|-------------|---------|-----------------------|
| Model | "Model" | dropdown | default "GPT-4o" |
| Input tokens | "Input tokens (your prompt)" | number | placeholder `e.g. 1500` |
| Output tokens | "Output tokens (the reply)" | number | placeholder `e.g. 500` |
| Calls | "Number of calls" | number | default `1` |
**Button:** `Calculate cost`
**Result block shows:**
- Big number: **Cost per call** (USD, 4 decimals)
- **Total for N calls**
- Small breakdown line: "Input: $X · Output: $Y"
- "Cost per 1,000 calls: $Z"
**Config object (editable):** `MODELS = [{ name, inputPricePerM, outputPricePerM }]` in USD per 1,000,000 tokens. Show "Prices last updated: [date]" under the tool.

## 3. Edge cases / validation
- Empty or non-numeric token field → treat as 0, don't crash.
- Negative numbers → clamp to 0, show hint "Tokens can't be negative."
- Calls < 1 → default to 1.
- Very large numbers → format with commas; never show `NaN` or `Infinity`.

## 4. Intro (page copy)
The AI API Cost Calculator tells you what a single request to OpenAI or Anthropic
will cost based on how many tokens go in (your prompt) and come out (the reply).
Because providers bill per token — not per request — costs are invisible until
you do the math. This tool does it instantly and lets you scale it to thousands
of calls so you can budget a feature before building it.

## 5. Formula (show on page)
```
inputCost  = (inputTokens  / 1,000,000) × inputPricePerM
outputCost = (outputTokens / 1,000,000) × outputPricePerM
costPerCall = inputCost + outputCost
totalCost   = costPerCall × numberOfCalls
```

## 6. Worked example
> GPT-4o at $2.50 input / $10.00 output per 1M tokens.
> Input 1,500, Output 500, Calls 1,000.
> inputCost = (1,500/1,000,000)×$2.50 = $0.00375
> outputCost = (500/1,000,000)×$10.00 = $0.005
> costPerCall = $0.00875 → ×1,000 = **$8.75 total**

## 7. Use cases
- Developers budgeting an AI feature before launch
- Comparing GPT vs Claude cost for the same workload
- Turning "calls per day" into a monthly bill estimate
- Founders pricing an AI product's margins

## 8. Tips & common mistakes
- Output usually costs 3–5× input — long replies dominate the bill.
- Tokens ≠ words (~1 token ≈ 0.75 English words). Link the token tools.
- This is standard list pricing; batch/cached rates differ.

## 9. FAQ (with answers)
**Q: How many tokens is 1,000 words?** ~1,333 tokens in English (roughly word count ÷ 0.75).
**Q: Why does output cost more than input?** Generating text is more compute-intensive than reading it, so providers price output higher — often 3–5× the input rate.
**Q: Do these prices include tax?** No. They're the provider's list price per token; your invoice may add local taxes.
**Q: How do I count the tokens in my actual prompt?** Use our Prompt Token Counter — paste the text and it estimates tokens precisely.
**Q: Which is cheaper for high volume, GPT-4o-mini or Claude Haiku?** It depends on the input/output mix; enter the same token counts for each model and compare the "cost per 1,000 calls" figure.
**Q: How do I estimate my monthly cost?** Multiply cost-per-call × calls-per-day × 30.

## 10. Related tools
Tokens-to-Words Calculator · Prompt Token Counter · Context Window Checker · Reading Time Calculator

## 11. SEO meta
- **Title:** AI API Cost Calculator — GPT & Claude Token Pricing (2026)
- **Description:** Free calculator to estimate OpenAI and Anthropic API costs by input/output tokens. Compare GPT and Claude pricing per call or per 1,000 calls.

---

# SPEC #2 — Tokens to Words Calculator
**Target keyword:** "tokens to words calculator", "words to tokens"
**RPM:** $$$ · **Comp:** Low · **Slug:** `/tokens-to-words`

## 1. H1 + promise
**H1:** Tokens to Words Calculator
**Promise:** Convert between AI tokens and English words instantly — both directions.

## 2. Tool UI
| Field | Label | Control | Default |
|-------|-------|---------|---------|
| Amount | "Enter amount" | number | placeholder `e.g. 1000` |
| Direction | toggle "Tokens → Words" / "Words → Tokens" | switch | Tokens → Words |
**Result:** converted value (rounded), plus "≈ X characters" line. Updates live as you type.

## 3. Edge cases
- Empty input → show 0 / blank, no error.
- Decimals allowed; round result to nearest whole.
- Negative → clamp to 0.

## 4. Intro
AI models don't read words — they read tokens, small chunks of text. Roughly one
token equals 0.75 English words. This calculator converts either way so you can
estimate response length, check if text fits a model's context window, and
predict API cost.

## 5. Formula
```
words  = tokens × 0.75
tokens = words / 0.75   (≈ words × 1.333)
chars  ≈ tokens × 4
```

## 6. Worked example
> 1,000 tokens × 0.75 = **750 words**. · 500 words ÷ 0.75 = **~667 tokens**.

## 7. Use cases
- Estimating how long an AI reply will be
- Checking text fits a context window
- Budgeting cost (pairs with AI API Cost Calculator)

## 8. Tips & mistakes
- Ratio shifts: code = more tokens/word; common words = fewer.
- Non-English text often uses 2–3× more tokens.

## 9. FAQ (with answers)
**Q: How many words is 1,000 tokens?** About 750 English words.
**Q: How many tokens in a typical page?** A page (~500 words) ≈ 667 tokens.
**Q: Is the ratio identical across models?** Very close, but each model's tokenizer differs slightly — treat this as an estimate.
**Q: Why do other languages use more tokens?** Their characters and word structures don't map as efficiently to English-trained tokenizers, so the same meaning costs more tokens.
**Q: How accurate is this?** It's an approximation; for exact counts use the Prompt Token Counter.

## 10. Related tools
AI API Cost Calculator · Prompt Token Counter · Reading Time Calculator

## 11. SEO meta
- **Title:** Tokens to Words Calculator — Convert AI Tokens ↔ Words
- **Description:** Instantly convert between AI tokens and English words in both directions. Estimate reply length and context-window fit for GPT and Claude.

---

# SPEC #3 — Prompt Token Counter
**Target keyword:** "token counter", "prompt token counter", "gpt token counter"
**RPM:** $$ · **Comp:** Low · **Slug:** `/token-counter`

## 1. H1 + promise
**H1:** Prompt Token Counter
**Promise:** Paste any prompt to estimate its token count, word count, and characters.

## 2. Tool UI
- Large textarea, label "Paste your text or prompt", placeholder `Paste text here…`.
- Live counters below: **Tokens (est.)**, **Words**, **Characters**.
- Optional small note: "Estimate based on ~4 characters per token."
**No button needed — count live as the user types.**

## 3. Edge cases
- Empty → all counters show 0.
- Handle very long text without lag (debounce the counting).
- Count Unicode/emoji safely (use array spread, not `.length` for chars where possible).

## 4. Intro
Before sending a prompt to an AI model, you often need to know its token size —
to stay within a context window or to estimate cost. This counter gives a fast
estimate of tokens, plus exact word and character counts, all in your browser.

## 5. Formula / logic
```
characters = text length
words      = number of whitespace-separated words
tokens ≈ characters / 4   (English approximation)
```
Note on page: true tokenization varies by model; this is an estimate.

## 6. Worked example
> A 400-character prompt ≈ 100 tokens, and if it's ~60 words that's consistent (~1.33 tokens/word).

## 7. Use cases
- Staying under a model's context limit
- Estimating cost (feed the token number into the cost calculator)
- Trimming prompts to save money

## 8. Tips & mistakes
- The 4-chars-per-token rule is English-only; code and other languages differ.
- For billing-critical work, verify with the provider's official tokenizer.

## 9. FAQ (with answers)
**Q: Is this exact?** It's a close estimate using ~4 characters per token; real tokenizers vary slightly by model.
**Q: Is my text uploaded anywhere?** No — counting runs entirely in your browser; nothing is sent or stored.
**Q: Why does my count differ from OpenAI's?** Different tokenizers split text differently, especially for code, punctuation, and non-English text.
**Q: What's a context window?** The maximum tokens (prompt + reply) a model can handle at once — check yours with the Context Window Checker.

## 10. Related tools
Tokens-to-Words Calculator · AI API Cost Calculator · Context Window Checker

## 11. SEO meta
- **Title:** Prompt Token Counter — Estimate Tokens, Words & Characters
- **Description:** Paste any prompt to instantly estimate tokens, plus word and character counts. Runs in your browser — nothing is stored. Great for GPT and Claude.

---

# SPEC #4 — Context Window Checker
**Target keyword:** "context window calculator", "does my text fit context window"
**RPM:** $$ · **Comp:** Low · **Slug:** `/context-window-checker`

## 1. H1 + promise
**H1:** AI Context Window Checker
**Promise:** See whether your prompt fits a model's context window — and how much room is left.

## 2. Tool UI
| Field | Label | Control |
|-------|-------|---------|
| Model | "Model" | dropdown (each holds its `contextLimit` in tokens) |
| Tokens | "Your prompt tokens" | number, placeholder `e.g. 8000` |
**Button:** `Check fit`
**Result:** ✅/❌ "Fits / Doesn't fit", "Used X of Y tokens (Z% full)", and a progress bar. If over: "Trim ~N tokens."
**Config:** `MODELS = [{ name, contextLimit }]`, with "Limits last updated: [date]".

## 3. Edge cases
- Tokens > limit → red ❌, show overflow amount.
- Empty/0 → neutral state, no error.
- Remind that reply tokens also consume the window (show "leave room for the reply").

## 4. Intro
Every AI model can only "see" a limited amount of text at once — its context
window, measured in tokens. If your prompt plus the expected reply exceeds it,
the request fails or truncates. This checker compares your token count to the
selected model's limit and tells you the headroom.

## 5. Formula
```
percentUsed = (yourTokens / contextLimit) × 100
fits        = yourTokens < contextLimit
overflow    = max(0, yourTokens − contextLimit)
```

## 6. Worked example
> 8,000 tokens against a 128,000-token window = 6.25% used — plenty of room.

## 7. Use cases
- Pasting long documents into an AI and checking they fit
- Choosing a model with a big enough window
- Debugging "input too long" errors

## 8. Tips & mistakes
- The window is shared by prompt AND reply — don't fill it 100%.
- Long chat histories add up; older turns still count.

## 9. FAQ (with answers)
**Q: What is a context window?** The maximum number of tokens (input + output) a model can process in one request.
**Q: Does the reply count toward the limit?** Yes — reserve space for the model's output, or it may get cut off.
**Q: What happens if I exceed it?** The API returns an error or silently truncates your input — either way you lose information.
**Q: How do I find my token count?** Use the Prompt Token Counter, then enter the number here.

## 10. Related tools
Prompt Token Counter · Tokens-to-Words Calculator · AI API Cost Calculator

## 11. SEO meta
- **Title:** AI Context Window Checker — Does Your Prompt Fit?
- **Description:** Check whether your prompt fits a model's context window and see how many tokens are left. Supports GPT, Claude, and other LLMs.

---

# SPEC #5 — Reading Time Calculator
**Target keyword:** "reading time calculator", "how long to read"
**RPM:** $$ · **Comp:** Med · **Slug:** `/reading-time-calculator`

## 1. H1 + promise
**H1:** Reading Time Calculator
**Promise:** Paste any text to see how long it takes to read — and to speak aloud.

## 2. Tool UI
- Textarea, label "Paste your text", placeholder `Paste an article, post, or script…`.
- Dropdown "Reading speed" (Slow 150 / Average 200 / Fast 250 wpm), default Average.
- Live results: **Words**, **Reading time** (mm:ss), **Speaking time** (mm:ss @130 wpm).

## 3. Edge cases
- Empty → 0 words, 0:00.
- Round seconds; never show "1:7" — pad to "1:07".
- Huge text → debounce counting.

## 4. Intro
The Reading Time Calculator estimates how long a piece of text takes to read
silently and to speak aloud. Bloggers use it for "X min read" labels; speakers
use it to time a talk. Paste your text and adjust the words-per-minute to match
your audience.

## 5. Formula
```
words        = whitespace-separated word count
readingMins  = words / readingWPM   (default 200)
speakingMins = words / 130
```
Convert decimal minutes → mm:ss.

## 6. Worked example
> 1,200 words ÷ 200 wpm = 6:00 reading; ÷ 130 wpm ≈ 9:14 speaking.

## 7. Use cases
- Blog "min read" badges
- Timing speeches, presentations, podcasts
- Estimating video/voiceover script length

## 8. Tips & mistakes
- Average adult reads 200–250 wpm; technical text is slower.
- Use the speaking figure (not reading) for talks — people speak slower than they read.

## 9. FAQ (with answers)
**Q: What's the average reading speed?** Most adults read 200–250 words per minute for general text.
**Q: How many words is a 5-minute speech?** About 650 words at a comfortable 130 wpm speaking pace.
**Q: Does it update as I type?** Yes — word count and times recalculate live.
**Q: Is my text stored?** No — everything runs in your browser.

## 10. Related tools
Tokens-to-Words Calculator · Prompt Token Counter · Word Counter

## 11. SEO meta
- **Title:** Reading Time Calculator — How Long to Read or Speak Any Text
- **Description:** Paste text to get word count, reading time, and speaking time instantly. Adjustable words-per-minute for blogs, speeches, and scripts.

---

# SPEC #6 — Aspect Ratio Calculator
**Target keyword:** "aspect ratio calculator", "resolution aspect ratio"
**RPM:** $$ · **Comp:** Med · **Slug:** `/aspect-ratio-calculator`

## 1. H1 + promise
**H1:** Aspect Ratio Calculator
**Promise:** Resize width or height while keeping the same aspect ratio — and find the ratio of any dimensions.

## 2. Tool UI
- Two linked rows: "Original width / height" and "New width / height".
- Type any 3 of the 4 boxes → the 4th auto-fills to keep the ratio.
- Show the simplified ratio (e.g. "16:9") prominently.
- Optional preset buttons: 16:9, 4:3, 1:1, 21:9, 9:16.

## 3. Edge cases
- Zero or empty in a needed field → don't divide by zero; show hint.
- Non-integers allowed; round computed pixel to nearest whole.
- Simplify ratio using greatest common divisor.

## 4. Intro
An aspect ratio is the proportional relationship between width and height. This
calculator keeps that proportion fixed: enter a new width and it finds the
matching height (or vice-versa), and it tells you the simplified ratio of any
two dimensions — handy for images, video, and screens.

## 5. Formula
```
ratio       = width : height  (simplified by GCD)
newHeight   = newWidth × (origHeight / origWidth)
newWidth    = newHeight × (origWidth / origHeight)
```

## 6. Worked example
> Original 1920×1080 (16:9). New width 1280 → newHeight = 1280 × (1080/1920) = **720**. So 1280×720, still 16:9.

## 7. Use cases
- Resizing images/videos without distortion
- Finding a screen or video's ratio
- Designing thumbnails and social posts to spec

## 8. Tips & mistakes
- Common ratios: 16:9 video, 1:1 square, 9:16 vertical/Reels, 4:3 legacy.
- Keep one original dimension fixed when scaling to avoid rounding drift.

## 9. FAQ (with answers)
**Q: What does 16:9 mean?** For every 16 units of width there are 9 of height — the standard widescreen video shape.
**Q: How do I keep an image from stretching?** Scale width and height by the same ratio — this tool does that automatically.
**Q: What ratio is 1920×1080?** 16:9.
**Q: What's best for Instagram Reels/TikTok?** 9:16 (vertical).

## 10. Related tools
PPI/DPI Calculator · Image Size Converter · Pixel Density Tool

## 11. SEO meta
- **Title:** Aspect Ratio Calculator — Resize Width & Height Proportionally
- **Description:** Calculate aspect ratios and resize dimensions without distortion. Find the ratio of any width × height and scale to 16:9, 4:3, 1:1, 9:16 and more.

---
---
END OF CATEGORY: AI / NEW-TREND (6 tools).

---
---

# CATEGORY: FINANCE (NON-LOAN)
---

# SPEC #7 — Invoice Late Fee Calculator
**Target keyword:** "invoice late fee calculator", "late payment fee calculator"
**RPM:** $$$ · **Comp:** Low · **Slug:** `/invoice-late-fee-calculator`

## 1. H1 + promise
**H1:** Invoice Late Fee Calculator
**Promise:** Work out the late fee and total now owed on an overdue invoice.

## 2. Tool UI
| Field | Label | Control | Placeholder/default |
|-------|-------|---------|---------------------|
| Amount | "Invoice amount" | number | `e.g. 1000` |
| Fee type | "Late fee type" | toggle "Percentage" / "Flat fee" | Percentage |
| Rate | "Late fee rate (%)" or "Flat fee amount" | number | `e.g. 1.5` |
| Period | "Charged" | dropdown: one-time / per month / per day | per month |
| Days late | "Days overdue" | number | `e.g. 30` |
**Button:** `Calculate late fee`
**Result:** **Late fee**, **Total now due** (invoice + fee), and a one-line breakdown.

## 3. Edge cases
- Days late = 0 → fee 0, total = invoice amount.
- Percentage > 100 allowed but warn "That's unusually high."
- Per-day with large days → cap displayed decimals to 2.
- Flat fee ignores days unless "per day" chosen.

## 4. Intro
When a client pays late, many businesses add a late fee — either a flat charge or
a percentage of the invoice, sometimes compounding per month or per day. This
calculator applies your chosen rule and shows the fee plus the new total owed, so
your reminder email has an exact figure.

## 5. Formula
```
Percentage, per month: fee = amount × (rate/100) × (daysLate / 30)
Percentage, per day:   fee = amount × (rate/100) × daysLate
Percentage, one-time:  fee = amount × (rate/100)
Flat, one-time:        fee = flatAmount
Flat, per day:         fee = flatAmount × daysLate
total = amount + fee
```

## 6. Worked example
> $1,000 invoice, 1.5% per month, 30 days late → fee = 1000 × 0.015 × (30/30) = **$15**. Total due = **$1,015**.

## 7. Use cases
- Freelancers/agencies chasing overdue invoices
- Small businesses setting payment-terms policy
- Verifying a late fee a vendor charged you

## 8. Tips & mistakes
- Many regions cap legal late-fee rates — check local law before charging.
- State your late-fee policy on the invoice up front, or it may be unenforceable.

## 9. FAQ (with answers)
**Q: What's a typical late fee?** Commonly 1–2% of the invoice per month, or a small flat fee — but it must be agreed in your terms.
**Q: Is a late fee legal?** Usually yes if stated in your contract/invoice, but many jurisdictions cap the rate — check local rules.
**Q: Does the fee compound?** This tool charges simple interest on the original amount; it doesn't compound the fee on the fee.
**Q: Should I charge per day or per month?** Per month is more common and feels fairer; per day adds up faster for long delays.

## 10. Related tools
Discount Calculator · Compound Interest Calculator · Hourly to Salary Converter

## 11. SEO meta
- **Title:** Invoice Late Fee Calculator — Overdue Payment Charges
- **Description:** Calculate the late fee and total due on an overdue invoice using a percentage or flat fee, per day or per month. Free and instant.

---

# SPEC #8 — Compound Interest Calculator
**Target keyword:** "compound interest calculator"
**RPM:** $$$ · **Comp:** Med · **Slug:** `/compound-interest-calculator`

## 1. H1 + promise
**H1:** Compound Interest Calculator
**Promise:** See how savings or investments grow over time with compounding — including regular contributions.

## 2. Tool UI
| Field | Label | Control | Default |
|-------|-------|---------|---------|
| Principal | "Starting amount" | number | `e.g. 1000` |
| Rate | "Annual interest rate (%)" | number | `e.g. 7` |
| Years | "Years" | number | `e.g. 10` |
| Frequency | "Compounded" | dropdown: yearly/quarterly/monthly/daily | monthly |
| Contribution | "Monthly contribution (optional)" | number | `0` |
**Button:** `Calculate growth`
**Result:** **Final balance**, **Total contributed**, **Total interest earned**, and a small year-by-year table.

## 3. Edge cases
- Rate 0 → balance = principal + contributions, interest 0.
- Years 0 → balance = principal.
- Negative inputs → clamp to 0.

## 4. Intro
Compound interest is interest earned on both your original money and the interest
it has already earned — the engine behind long-term saving and investing. This
calculator projects your balance over time, optionally adding a fixed monthly
contribution, and splits the result into what you put in versus what growth added.

## 5. Formula
```
n = compounds per year
Base:  A = P × (1 + r/n)^(n×t)
With monthly contribution PMT (added each period m = 12×t):
  A = P × (1 + i)^m + PMT × [((1 + i)^m − 1) / i],  where i = r/12
interestEarned = A − P − totalContributions
```

## 6. Worked example
> $1,000 at 7%/yr, 10 years, compounded monthly, no contributions:
> A = 1000 × (1 + 0.07/12)^(120) ≈ **$2,009.66**. Interest ≈ **$1,009.66**.

## 7. Use cases
- Projecting retirement or savings growth
- Comparing accounts with different compounding
- Showing the value of starting early

## 8. Tips & mistakes
- More frequent compounding = slightly more growth.
- Inflation reduces real returns — pair with the Inflation Calculator.

## 9. FAQ (with answers)
**Q: What's the difference between simple and compound interest?** Simple interest is paid only on the principal; compound interest is paid on principal plus accumulated interest, so it grows faster.
**Q: How often should interest compound?** More often is better for you when saving; monthly or daily are common for bank accounts.
**Q: Does this account for taxes or inflation?** No — it shows gross growth. Use the Inflation Calculator to see real (inflation-adjusted) value.
**Q: What's a realistic interest rate?** Savings accounts vary by country and year; long-term stock-market averages are often cited around 7% after inflation — not guaranteed.

## 10. Related tools
Savings Goal Calculator · Inflation Calculator · Invoice Late Fee Calculator

## 11. SEO meta
- **Title:** Compound Interest Calculator — Savings & Investment Growth
- **Description:** Project how your money grows with compound interest and optional monthly contributions. See final balance, total invested, and interest earned.

---

# SPEC #9 — Savings Goal Calculator
**Target keyword:** "how long to save calculator", "savings goal calculator"
**RPM:** $$$ · **Comp:** Low · **Slug:** `/savings-goal-calculator`

## 1. H1 + promise
**H1:** Savings Goal Calculator
**Promise:** Find out how long it takes to reach a savings goal — or how much to save each month to hit a deadline.

## 2. Tool UI
- Mode toggle: "How long will it take?" / "How much per month?"
| Field | Label |
|-------|-------|
| Goal | "Savings goal" (e.g. 10000) |
| Current | "Amount saved so far" (default 0) |
| Monthly | "Monthly saving" (mode 1) |
| Deadline | "Months to reach goal" (mode 2) |
| Rate | "Annual interest (%) optional" (default 0) |
**Button:** `Calculate`
**Result mode 1:** "You'll reach $X in **N months** (~Y years)."
**Result mode 2:** "Save **$X/month** to reach your goal in N months."

## 3. Edge cases
- Monthly saving 0 and no interest → "You won't reach the goal; increase your monthly amount."
- Current ≥ goal → "Goal already reached!"
- Negative → clamp 0.

## 4. Intro
Whether you're saving for a deposit, a trip, or an emergency fund, this calculator
answers the two questions that matter: how long your current pace will take, or
how much you need to set aside each month to hit a date. Add an optional interest
rate to include growth.

## 5. Formula
```
No interest, mode 1: months = (goal − current) / monthly
No interest, mode 2: monthly = (goal − current) / months
With interest (i = annualRate/12): use future-value of a series, solving for
  months (logarithm) or for monthly payment (annuity formula).
```

## 6. Worked example
> Goal $10,000, saved $2,000, saving $400/month, 0% interest →
> (10,000 − 2,000) / 400 = **20 months**.

## 7. Use cases
- Planning a house deposit or wedding
- Building an emergency fund
- Reverse-planning a monthly budget from a deadline

## 8. Tips & mistakes
- Automate the monthly transfer so the plan actually happens.
- Even a small interest rate shortens the timeline a little.

## 9. FAQ (with answers)
**Q: Does it include interest?** Optionally — leave the rate at 0 for plain saving, or add a rate to include growth.
**Q: What if I can't save a fixed amount?** Use the average you expect; re-run it when your situation changes.
**Q: Should my emergency fund earn interest?** Ideally keep it accessible (e.g. a high-yield savings account) rather than locked away.

## 10. Related tools
Compound Interest Calculator · Inflation Calculator · Discount Calculator

## 11. SEO meta
- **Title:** Savings Goal Calculator — How Long & How Much to Save
- **Description:** Find how long to reach a savings goal at your current pace, or how much to save monthly to hit a deadline. Optional interest included.

---

# SPEC #10 — Inflation Calculator
**Target keyword:** "inflation calculator", "value of money over time"
**RPM:** $$$ · **Comp:** Low · **Slug:** `/inflation-calculator`

## 1. H1 + promise
**H1:** Inflation Calculator
**Promise:** See what an amount of money is worth after inflation over any number of years.

## 2. Tool UI
| Field | Label | Default |
|-------|-------|---------|
| Amount | "Amount" | `e.g. 1000` |
| Rate | "Average annual inflation (%)" | `e.g. 3` |
| Years | "Number of years" | `e.g. 10` |
| Direction | toggle "Future value" / "Past value (what it was worth)" | Future value |
**Button:** `Calculate`
**Result:** adjusted amount + plain sentence ("$1,000 today ≈ $X in 10 years at 3% inflation").

## 3. Edge cases
- Rate 0 → amount unchanged.
- Years 0 → amount unchanged.
- Allow decimals for rate.

## 4. Intro
Inflation slowly erodes the buying power of money — what costs $1,000 today will
cost more in the future, and the same $1,000 bought more in the past. This
calculator applies an average annual inflation rate to show the equivalent value
across time, in either direction.

## 5. Formula
```
Future buying power needed: FV = amount × (1 + rate/100)^years
Past equivalent value:      PV = amount / (1 + rate/100)^years
```

## 6. Worked example
> $1,000 at 3% inflation over 10 years → 1000 × 1.03^10 ≈ **$1,343.92** needed to buy the same goods.

## 7. Use cases
- Understanding why prices rise
- Setting salary/savings targets that keep pace
- Comparing historical prices to today

## 8. Tips & mistakes
- Real inflation varies year to year; this uses a fixed average.
- For investments, compare returns to inflation to see real growth.

## 9. FAQ (with answers)
**Q: What inflation rate should I use?** Many economies target ~2–3% long-term; use your country's historical average for accuracy.
**Q: Is this the same as cost of living?** Closely related — inflation measures general price rises, which drive cost-of-living changes.
**Q: Why does my money lose value?** As prices rise, each unit of currency buys less, so idle cash loses purchasing power over time.

## 10. Related tools
Compound Interest Calculator · Savings Goal Calculator · Hourly to Salary Converter

## 11. SEO meta
- **Title:** Inflation Calculator — Value of Money Over Time
- **Description:** See how inflation changes the buying power of money over any period. Calculate future cost or past value using an average annual inflation rate.

---

# SPEC #11 — Hourly to Salary Converter
**Target keyword:** "hourly to yearly salary calculator", "hourly to salary"
**RPM:** $$$ · **Comp:** Med · **Slug:** `/hourly-to-salary`

## 1. H1 + promise
**H1:** Hourly to Salary Calculator
**Promise:** Convert an hourly wage to weekly, monthly, and yearly pay — and back.

## 2. Tool UI
| Field | Label | Default |
|-------|-------|---------|
| Direction | toggle "Hourly → Salary" / "Salary → Hourly" | Hourly → Salary |
| Wage | "Hourly rate" or "Annual salary" | `e.g. 20` |
| Hours | "Hours per week" | `40` |
| Weeks | "Weeks worked per year" | `52` |
**Button:** `Convert`
**Result:** a table — Hourly, Daily, Weekly, Monthly, Yearly.

## 3. Edge cases
- Hours or weeks 0 → avoid divide-by-zero; show hint.
- Allow decimals (e.g. 37.5 hours).

## 4. Intro
Job offers quote pay in different units — an hourly rate, a monthly figure, or an
annual salary — making them hard to compare. This converter translates any hourly
wage into weekly, monthly, and yearly pay (and the reverse), using your real hours
and weeks worked.

## 5. Formula
```
yearly  = hourly × hoursPerWeek × weeksPerYear
monthly = yearly / 12
weekly  = hourly × hoursPerWeek
daily   = hourly × (hoursPerWeek / 5)
Reverse: hourly = yearly / (hoursPerWeek × weeksPerYear)
```

## 6. Worked example
> $20/hr × 40 hrs × 52 wks = **$41,600/yr** (~$3,467/month).

## 7. Use cases
- Comparing hourly vs salaried job offers
- Freelancers setting an hourly rate from a target income
- Budgeting from an hourly wage

## 8. Tips & mistakes
- This is gross pay — taxes and deductions reduce take-home.
- Use real weeks worked (subtract unpaid leave) for accuracy.

## 9. FAQ (with answers)
**Q: How do I convert hourly to annual quickly?** Roughly: hourly × 2,080 (40 hrs × 52 wks) gives annual gross.
**Q: Is this before or after tax?** Before tax (gross). Net pay depends on your country's tax and deductions.
**Q: What if I work part-time?** Enter your actual hours per week and weeks per year — the result adjusts automatically.

## 10. Related tools
Inflation Calculator · Savings Goal Calculator · Tip & Split Bill Calculator

## 11. SEO meta
- **Title:** Hourly to Salary Calculator — Wage to Yearly, Monthly, Weekly
- **Description:** Convert an hourly wage to yearly, monthly, weekly, and daily pay (or the reverse) using your real hours and weeks worked. Free and instant.

---

# SPEC #12 — Discount / Sale Price Calculator
**Target keyword:** "discount calculator", "sale price calculator"
**RPM:** $$ · **Comp:** Med · **Slug:** `/discount-calculator`

## 1. H1 + promise
**H1:** Discount Calculator
**Promise:** Find the sale price and how much you save from any percentage discount.

## 2. Tool UI
| Field | Label | Default |
|-------|-------|---------|
| Price | "Original price" | `e.g. 80` |
| Discount | "Discount (%)" | `e.g. 25` |
| Extra | "Second discount (%) optional" | `0` |
**Button:** `Calculate`
**Result:** **Final price**, **You save $X**, and "(Y% off total)" if two discounts stack.

## 3. Edge cases
- Discount > 100 → clamp to 100 (price 0).
- Two stacked discounts apply sequentially, not added.
- Negative → clamp 0.

## 4. Intro
Stores advertise "25% off" or "extra 10% at checkout," but the final price isn't
always obvious — especially when discounts stack. This calculator shows exactly
what you'll pay and how much you save, including a second sequential discount.

## 5. Formula
```
afterFirst  = price × (1 − d1/100)
finalPrice  = afterFirst × (1 − d2/100)
saved       = price − finalPrice
effectiveOff = (saved / price) × 100
```

## 6. Worked example
> $80, 25% off → $60. Plus extra 10% → 60 × 0.90 = **$54**. Saved **$26** (32.5% off, not 35%).

## 7. Use cases
- Checking real shop/online prices
- Comparing "stacked" coupon deals
- Pricing your own products' sales

## 8. Tips & mistakes
- Stacked discounts don't add (25% + 10% ≠ 35%) — they multiply.
- Tax may apply after the discount, depending on region.

## 9. FAQ (with answers)
**Q: Do two discounts add together?** No — they apply one after another, so 25% then 10% is about 32.5% off, not 35%.
**Q: How do I find the original price from a sale price?** Divide the sale price by (1 − discount/100).
**Q: Is tax included?** No — tax rules vary; this shows the pre-tax discounted price.

## 10. Related tools
Hourly to Salary Calculator · Tip & Split Bill Calculator · Cost-per-Unit Calculator

## 11. SEO meta
- **Title:** Discount Calculator — Sale Price & Savings (Stacked Discounts)
- **Description:** Calculate the final sale price and how much you save from one or two stacked percentage discounts. See the true effective discount instantly.

---

# SPEC #13 — Crypto Profit Calculator
**Target keyword:** "crypto profit calculator", "bitcoin profit calculator"
**RPM:** $$$ · **Comp:** Med · **Slug:** `/crypto-profit-calculator`

## 1. H1 + promise
**H1:** Crypto Profit Calculator
**Promise:** Calculate profit or loss on a crypto trade, including fees, in money and percent.

## 2. Tool UI
| Field | Label | Placeholder |
|-------|-------|-------------|
| Buy price | "Buy price (per coin)" | `e.g. 25000` |
| Sell price | "Sell price (per coin)" | `e.g. 32000` |
| Quantity | "Amount of coins" | `e.g. 0.5` |
| Fee | "Trading fee (%) optional" | `e.g. 0.1` |
**Button:** `Calculate profit`
**Result:** **Profit/Loss ($)**, **Return (%)**, **Total invested**, **Total received**, color-coded green/red.

## 3. Edge cases
- Sell < buy → negative profit, show red "Loss."
- Fee applied on both buy and sell sides.
- Quantity 0 → result 0.

## 4. Intro
Crypto trades involve a buy price, a sell price, a quantity, and exchange fees on
each side — so the real profit isn't just "sell minus buy." This calculator nets
out the fees and shows your actual gain or loss in both currency and percentage.

## 5. Formula
```
invested   = buyPrice × qty × (1 + fee/100)
received   = sellPrice × qty × (1 − fee/100)
profit     = received − invested
returnPct  = (profit / invested) × 100
```

## 6. Worked example
> Buy $25,000, sell $32,000, qty 0.5, fee 0.1%:
> invested ≈ 12,512.50; received ≈ 15,984.00; profit ≈ **$3,471.50** (~27.7%).

## 7. Use cases
- Checking a trade's real profit after fees
- Planning a target sell price for a desired return
- Comparing exchanges with different fees

## 8. Tips & mistakes
- Fees apply twice (buy + sell) — easy to forget.
- This ignores taxes on gains, which many countries charge.

## 9. FAQ (with answers)
**Q: Does it include exchange fees?** Yes — the optional fee is applied to both the buy and the sell side.
**Q: Does it handle taxes?** No — capital-gains tax varies by country; this shows pre-tax profit.
**Q: Can I use it for stocks?** Yes — the math is identical for any buy/sell-with-fees trade.

## 10. Related tools
Compound Interest Calculator · Discount Calculator · Inflation Calculator

## 11. SEO meta
- **Title:** Crypto Profit Calculator — Trade Gain/Loss With Fees
- **Description:** Calculate crypto profit or loss including trading fees, in dollars and percent. Works for Bitcoin and any coin or stock trade.

---

# SPEC #14 — Freelancer Tax Estimator
**Target keyword:** "freelancer tax calculator [country]", "self employed tax estimator"
**RPM:** $$$$ · **Comp:** Low · **Slug:** `/freelancer-tax-calculator`

## 1. H1 + promise
**H1:** Freelancer Tax Estimator
**Promise:** Estimate how much of your freelance income to set aside for tax.

## 2. Tool UI
| Field | Label | Notes |
|-------|-------|-------|
| Income | "Gross freelance income" | for chosen period |
| Period | "Period" | dropdown year/month |
| Expenses | "Business expenses" | deducted before tax |
| Tax rate | "Estimated tax rate (%)" | user enters their bracket; config holds optional presets |
| Set-aside | "Extra set-aside (%) optional" | safety buffer |
**Button:** `Estimate tax`
**Result:** **Taxable income**, **Estimated tax**, **Suggested set-aside**, **Income after tax**.

## 3. Edge cases
- Expenses > income → taxable 0, tax 0.
- Rate is user-supplied (don't hardcode a country's law) — label clearly "estimate only."
- Show disclaimer: "Not tax advice — confirm with a professional."

## 4. Intro
Freelancers don't have tax withheld automatically, so a chunk of every payment
must be saved for the tax bill. This estimator subtracts your business expenses,
applies your estimated tax rate, and suggests how much to set aside — so you're
not caught short at filing time.

## 5. Formula
```
taxable   = max(0, income − expenses)
tax       = taxable × (rate/100)
setAside  = tax + taxable × (buffer/100)
afterTax  = income − tax
```

## 6. Worked example
> $50,000 income, $8,000 expenses, 22% rate:
> taxable = 42,000; tax = **$9,240**; after-tax ≈ **$40,760**.

## 7. Use cases
- Setting aside tax money each month
- Quarterly estimated-tax planning
- Pricing rates that survive after tax

## 8. Tips & mistakes
- Real tax is usually tiered (brackets), not one flat rate — this is a planning estimate.
- Keep expense receipts; they legitimately lower taxable income.

## 9. FAQ (with answers)
**Q: Is this accurate for my country?** It uses a flat rate you supply, so it's an estimate — real systems use brackets and credits. Confirm with a local accountant.
**Q: What expenses can I deduct?** Generally costs wholly for your business (software, equipment, home-office share) — rules vary by country.
**Q: How much should I set aside?** Many freelancers reserve 25–30% of income as a safe default until they know their exact rate.

## 10. Related tools
Hourly to Salary Calculator · Invoice Late Fee Calculator · Compound Interest Calculator

## 11. SEO meta
- **Title:** Freelancer Tax Estimator — How Much to Set Aside
- **Description:** Estimate self-employed tax from your freelance income and expenses, and see how much to set aside. A quick planning tool — not tax advice.

---

# SPEC #15 — Tip & Split Bill Calculator
**Target keyword:** "tip calculator split bill", "tip calculator"
**RPM:** $$ · **Comp:** Med · **Slug:** `/tip-calculator`

## 1. H1 + promise
**H1:** Tip & Split Bill Calculator
**Promise:** Add a tip and split the bill evenly between any number of people.

## 2. Tool UI
| Field | Label | Default |
|-------|-------|---------|
| Bill | "Bill amount" | `e.g. 60` |
| Tip | "Tip (%)" | preset buttons 10/15/18/20 + custom; default 15 |
| People | "Split between" | `1` |
**Button:** live (no button needed)
**Result:** **Tip amount**, **Total with tip**, **Per person**.

## 3. Edge cases
- People < 1 → set to 1.
- Round per-person up to nearest cent so total is covered.
- Bill 0 → all zeros.

## 4. Intro
At a restaurant you often need two answers fast: how much to tip, and what each
person owes. This calculator adds your chosen tip percentage and divides the
total evenly, with quick preset tip buttons for common amounts.

## 5. Formula
```
tip       = bill × (tipPct/100)
total     = bill + tip
perPerson = total / people
```

## 6. Worked example
> $60 bill, 18% tip, 3 people → tip $10.80, total $70.80, **$23.60 each**.

## 7. Use cases
- Splitting a restaurant bill with friends
- Calculating a fair tip quickly
- Group travel/shared expenses

## 8. Tips & mistakes
- Some bills already include service/gratuity — check before adding more.
- Tip on the pre-tax amount if you prefer (toggle optional).

## 9. FAQ (with answers)
**Q: What's a standard tip?** It varies by country — 15–20% is common in the US; many countries tip little or nothing.
**Q: Should I tip on tax?** Optional — many people tip on the pre-tax subtotal; this tool tips on the entered amount.
**Q: How do I split unevenly?** This splits evenly; for uneven splits, divide each person's items first.

## 10. Related tools
Discount Calculator · Hourly to Salary Calculator · Cost-per-Unit Calculator

## 11. SEO meta
- **Title:** Tip Calculator & Bill Splitter — Tip and Split Evenly
- **Description:** Add a tip and split any bill between friends instantly. Quick 15/18/20% presets and per-person totals. Free tip and bill-splitting calculator.

---

# SPEC #16 — Cost-per-Unit Calculator
**Target keyword:** "cost per unit calculator", "unit price comparison"
**RPM:** $$ · **Comp:** Low · **Slug:** `/cost-per-unit-calculator`

## 1. H1 + promise
**H1:** Cost-per-Unit Calculator
**Promise:** Compare two products by price per unit to find the better deal.

## 2. Tool UI
- Two product columns, each: "Price", "Quantity/size", "Unit (g/ml/each)".
**Button:** `Compare`
**Result:** unit price for each, and a banner "Product A is cheaper per unit by X%."

## 3. Edge cases
- Quantity 0 → skip, show hint.
- Different units between A and B → warn "Compare like units."
- Tie → "Same price per unit."

## 4. Intro
Bigger packs aren't always cheaper. This calculator divides each product's price
by its size to give a true price-per-unit, then tells you which is the better
value and by how much — the math supermarkets hope you skip.

## 5. Formula
```
unitPriceA = priceA / quantityA
unitPriceB = priceB / quantityB
cheaper    = lower unit price
diffPct    = (|unitPriceA − unitPriceB| / higher) × 100
```

## 6. Worked example
> A: $3.00 for 500g → $0.006/g. B: $5.00 for 1,000g → $0.005/g. **B is ~17% cheaper per gram.**

## 7. Use cases
- Grocery shopping value comparisons
- Bulk-buy decisions
- Comparing different package sizes

## 8. Tips & mistakes
- Compare the same unit (g vs g, ml vs ml).
- Watch for "per 100g" labels that hide the real pack price.

## 9. FAQ (with answers)
**Q: Is the bigger pack always cheaper?** No — sometimes the smaller pack has a lower unit price, especially on promotions.
**Q: Can I compare different units?** Convert to the same unit first (e.g. kg → g); comparing g to ml is meaningless.
**Q: What about quality differences?** Unit price only measures cost — judge quality separately.

## 10. Related tools
Discount Calculator · Tip & Split Calculator · GSM to mm Calculator

## 11. SEO meta
- **Title:** Cost-per-Unit Calculator — Compare Price Per Unit
- **Description:** Compare two products by price per gram, millilitre, or item to find the better deal. Instantly see which is cheaper and by how much.

---
---
END OF CATEGORY: FINANCE NON-LOAN (10 tools, specs 7–16).

---
---

# CATEGORY: COUNTRY-SPECIFIC (templated — use [country] / [rate] placeholders)

> Build note: these share one pattern. Keep each country's numbers in a config
> object: `COUNTRY = { name, brackets:[...], currency, year }`. Always show
> "Rates for tax year [year] — verify with the official source" and a "not
> official advice" disclaimer. Build one country per page (e.g.
> `/net-salary-calculator-[country]`) so each ranks for that country's search.

---

# SPEC #17 — Net Salary / Take-Home Pay Calculator
**Target keyword:** "[country] net salary calculator [year]", "take home pay [country]"
**RPM:** $$$$ · **Comp:** Low · **Slug:** `/net-salary-calculator-[country]`

## 1. H1 + promise
**H1:** [Country] Net Salary Calculator [Year]
**Promise:** Turn your gross salary into take-home pay after tax and deductions.

## 2. Tool UI
| Field | Label |
|-------|-------|
| Gross | "Gross salary" |
| Period | "Period" (annual/monthly) |
| Extras | optional: pension %, other deductions |
**Button:** `Calculate take-home`
**Result:** **Net pay** (monthly + yearly), plus breakdown: income tax, social/insurance, pension, net.

## 3. Edge cases
- Income below tax-free threshold → tax 0.
- Apply brackets progressively (not a single flat rate).
- Cap any contribution at its legal ceiling (config value).

## 4. Intro
Your gross salary isn't what lands in your bank account — income tax, social
contributions, and pension come out first. This calculator applies [country]'s
[year] tax bands to show your real monthly and yearly take-home pay, with a
line-by-line breakdown of every deduction.

## 5. Formula (templated)
```
tax = progressive over brackets:
  for each band: taxable_in_band × band_rate, summed
social = gross × socialRate (capped at ceiling)
pension = gross × pensionRate
net = gross − tax − social − pension
```

## 6. Worked example (fill per country)
> Gross [X]/year → tax [A], social [B], pension [C] → net **[X−A−B−C]** (~[net/12]/month).

## 7. Use cases
- Comparing a job offer's real value
- Budgeting from take-home pay
- Checking a payslip's deductions

## 8. Tips & mistakes
- Tax is progressive — only income above each threshold is taxed at the higher rate.
- Allowances/credits can raise your tax-free amount; this is a standard estimate.

## 9. FAQ (with answers)
**Q: Is this my exact take-home?** It's a close estimate using [year] standard rates; personal allowances and credits can change it.
**Q: Does it include social security/insurance?** Yes — the breakdown lists each statutory deduction for [country].
**Q: Why is more tax taken on a raise?** Only the portion above the next threshold is taxed higher, not your whole salary.

## 10. Related tools
[Country] Income Tax Calculator · Hourly to Salary Calculator · Overtime Calculator

## 11. SEO meta
- **Title:** [Country] Net Salary Calculator [Year] — Take-Home Pay
- **Description:** Convert your gross salary to net take-home pay in [country] for [year], with a full breakdown of income tax, social contributions, and pension.

---

# SPEC #18 — Income Tax Calculator
**Target keyword:** "[country] income tax calculator [year]"
**RPM:** $$$$ · **Comp:** Low · **Slug:** `/income-tax-calculator-[country]`

## 1. H1 + promise
**H1:** [Country] Income Tax Calculator [Year]
**Promise:** Estimate your income tax for the [year] tax year.

## 2. Tool UI
- "Taxable income" + period toggle. Optional "deductions/allowances".
**Result:** **Total tax**, **effective rate %**, **marginal rate %**, bracket-by-bracket table.

## 3. Edge cases
- Below threshold → 0 tax.
- Show both effective and marginal rate (users confuse them).
- Progressive bracket loop from config.

## 4. Intro
Income tax in [country] is charged in bands: each slice of income is taxed at its
own rate. This calculator runs your income through the [year] bands and shows the
total tax, your effective rate (overall %), and marginal rate (the rate on your
next dollar).

## 5. Formula
```
for each bracket: min(income, bandTop) − bandFloor, × bandRate, while income > bandFloor
effectiveRate = totalTax / income × 100
marginalRate  = rate of the highest band reached
```

## 6. Worked example (fill per country)
> Income [X] → tax [total], effective [eff%], marginal [marg%].

## 7. Use cases
- Estimating a tax bill
- Understanding marginal vs effective rate
- Planning deductions

## 8. Tips & mistakes
- Effective rate (overall) is lower than your marginal (top-band) rate.
- Allowances reduce taxable income before brackets apply.

## 9. FAQ (with answers)
**Q: What's the difference between effective and marginal rate?** Marginal is the rate on your last dollar earned; effective is total tax ÷ total income — always lower.
**Q: Does a raise ever lower my take-home?** No — only the income above a threshold is taxed at the higher rate, so you always keep more overall.
**Q: Are deductions included?** Enter them in the optional field; they reduce taxable income before tax is computed.

## 10. Related tools
[Country] Net Salary Calculator · Freelancer Tax Estimator · Hourly to Salary

## 11. SEO meta
- **Title:** [Country] Income Tax Calculator [Year] — Estimate Your Tax
- **Description:** Estimate [country] income tax for [year] with a bracket-by-bracket breakdown, plus your effective and marginal tax rates. Fast and free.

---

# SPEC #19 — VAT / GST Calculator
**Target keyword:** "[country] VAT calculator", "GST calculator [country]"
**RPM:** $$$ · **Comp:** Low · **Slug:** `/vat-calculator-[country]`

## 1. H1 + promise
**H1:** [Country] VAT / GST Calculator
**Promise:** Add or remove VAT/GST from any amount at [country]'s rate.

## 2. Tool UI
| Field | Label | Default |
|-------|-------|---------|
| Amount | "Amount" | `e.g. 100` |
| Rate | "VAT/GST rate (%)" | config default for [country] |
| Mode | toggle "Add VAT" / "Remove VAT" | Add VAT |
**Result:** **Net**, **VAT amount**, **Gross** — all three shown.

## 3. Edge cases
- Remove-VAT divides by (1+rate/100), not subtracts.
- Multiple rates possible (standard/reduced) — offer presets.
- 0 → all zeros.

## 4. Intro
VAT (or GST) is added to most goods and services. Sometimes you need to add it to
a net price, other times to extract it from a gross (tax-inclusive) price. This
calculator does both at [country]'s rate and shows net, tax, and gross together.

## 5. Formula
```
Add:    vat = amount × rate/100;     gross = amount + vat
Remove: net = amount / (1 + rate/100); vat = amount − net
```

## 6. Worked example
> $100 + 20% VAT → VAT $20, gross **$120**. Remove 20% from $120 → net **$100**.

## 7. Use cases
- Pricing products with tax included/excluded
- Reclaiming VAT from receipts
- Issuing compliant invoices

## 8. Tips & mistakes
- To remove VAT you divide, not subtract — a common error.
- Some items have reduced or zero rates — use the right preset.

## 9. FAQ (with answers)
**Q: How do I remove VAT from a total?** Divide the gross by (1 + rate/100); the difference is the VAT.
**Q: Is VAT the same as sales tax?** Similar idea, but VAT is charged at each stage of supply; the consumer-facing result is comparable.
**Q: Which rate applies to my product?** Most goods use the standard rate; some (food, books) may be reduced or zero — check local rules.

## 10. Related tools
Discount Calculator · [Country] Income Tax Calculator · Cost-per-Unit Calculator

## 11. SEO meta
- **Title:** [Country] VAT / GST Calculator — Add or Remove Tax
- **Description:** Add or remove VAT/GST at [country]'s rate. Instantly see the net amount, tax, and gross total for any price. Free VAT calculator.

---

# SPEC #20 — Overtime Pay Calculator
**Target keyword:** "[country] overtime calculator", "overtime pay calculator"
**RPM:** $$$ · **Comp:** Low · **Slug:** `/overtime-calculator-[country]`

## 1. H1 + promise
**H1:** Overtime Pay Calculator
**Promise:** Calculate overtime pay and total wages from your hourly rate and extra hours.

## 2. Tool UI
| Field | Label | Default |
|-------|-------|---------|
| Rate | "Hourly rate" | |
| Regular hours | "Regular hours" | `40` |
| OT hours | "Overtime hours" | |
| OT multiplier | "Overtime rate (×)" | `1.5` |
**Result:** **Regular pay**, **Overtime pay**, **Total pay**.

## 3. Edge cases
- OT hours 0 → total = regular pay.
- Allow double-time (×2) preset.
- Negative → clamp 0.

## 4. Intro
Overtime is usually paid at a higher rate — often 1.5× ("time and a half") or 2×.
This calculator separates your regular and overtime pay and adds them for your
total, using whatever multiplier your job applies.

## 5. Formula
```
regularPay = rate × regularHours
otPay      = rate × multiplier × otHours
total      = regularPay + otPay
```

## 6. Worked example
> $20/hr, 40 regular + 5 OT at 1.5× → regular $800, OT $150, total **$950**.

## 7. Use cases
- Checking a paycheck's overtime
- Estimating earnings before extra shifts
- Verifying employer calculations

## 8. Tips & mistakes
- Overtime rules and thresholds vary by country/contract.
- Some roles are exempt from overtime — check your status.

## 9. FAQ (with answers)
**Q: What is time-and-a-half?** Overtime paid at 1.5× your normal hourly rate.
**Q: When does overtime start?** Commonly after 40 hours/week, but it depends on local law and your contract.
**Q: Is overtime taxed more?** No special rate — it's taxed as normal income; it may just push you into a higher bracket for that portion.

## 10. Related tools
Hourly to Salary Calculator · [Country] Net Salary Calculator · Severance Calculator

## 11. SEO meta
- **Title:** Overtime Pay Calculator — Time-and-a-Half & Double Time
- **Description:** Calculate overtime pay from your hourly rate, regular hours, and overtime multiplier. See regular pay, overtime pay, and total wages instantly.

---

# SPEC #21 — Severance / Notice Pay Calculator
**Target keyword:** "[country] severance pay calculator", "redundancy pay calculator"
**RPM:** $$$ · **Comp:** Low · **Slug:** `/severance-calculator-[country]`

## 1. H1 + promise
**H1:** Severance Pay Calculator
**Promise:** Estimate severance/redundancy pay from your salary and years of service.

## 2. Tool UI
| Field | Label |
|-------|-------|
| Salary | "Monthly (or weekly) salary" |
| Years | "Years of service" |
| Formula | "Entitlement" e.g. "X weeks per year" (config per country) |
**Result:** **Estimated severance**, with the rule used shown.

## 3. Edge cases
- Years < minimum qualifying period → may be 0 (note it).
- Cap on weekly pay / max years (config).
- Round to currency.

## 4. Intro
Severance (or redundancy) pay is often based on your length of service and salary
— for example, a number of weeks' pay per year worked. This calculator applies
[country]'s rule to estimate your entitlement when employment ends.

## 5. Formula (templated)
```
severance = weeksPerYear × yearsOfService × weeklyPay
(apply caps from config; respect qualifying minimum)
```

## 6. Worked example (fill per country)
> [weekly pay] × [weeks/year] × [years] = **[severance]**.

## 7. Use cases
- Understanding redundancy entitlement
- Negotiating an exit package
- Checking an employer's offer

## 8. Tips & mistakes
- Statutory minimum vs contractual severance can differ — contracts may pay more.
- Caps on weekly pay and years often apply.

## 9. FAQ (with answers)
**Q: Is severance taxed?** Often partly tax-free up to a limit, then taxed — rules vary by country.
**Q: Do I qualify?** Usually you need a minimum service period; below that, statutory severance may be zero.
**Q: Is this the legal minimum?** It estimates the statutory formula; your contract may entitle you to more.

## 10. Related tools
Overtime Calculator · [Country] Net Salary Calculator · Hourly to Salary

## 11. SEO meta
- **Title:** Severance Pay Calculator — Redundancy Entitlement Estimate
- **Description:** Estimate severance or redundancy pay from your salary and years of service using [country]'s formula. Quick, free estimate.

---

# SPEC #22 — Fuel Cost (Trip) Calculator
**Target keyword:** "fuel cost calculator [country]", "trip fuel cost"
**RPM:** $$ · **Comp:** Low · **Slug:** `/fuel-cost-calculator`

## 1. H1 + promise
**H1:** Fuel Cost Calculator
**Promise:** Estimate the fuel cost of any trip from distance, efficiency, and fuel price.

## 2. Tool UI
| Field | Label | Units |
|-------|-------|-------|
| Distance | "Trip distance" | km or miles toggle |
| Efficiency | "Fuel efficiency" | L/100km, km/L, or mpg |
| Price | "Fuel price" | per litre/gallon |
| People | "Split between (optional)" | for cost per person |
**Result:** **Fuel needed**, **Total cost**, **Cost per person**.

## 3. Edge cases
- Handle all unit combinations consistently (convert internally to one base).
- Efficiency 0 → hint, avoid divide-by-zero.
- Round fuel to 2 decimals.

## 4. Intro
Planning a road trip or commute cost? This calculator combines your distance,
your vehicle's fuel efficiency, and the current fuel price to estimate how much
fuel you'll use and what it'll cost — and splits it between passengers.

## 5. Formula
```
(L/100km):  litres = distanceKm / 100 × consumption
cost = litres × pricePerLitre
perPerson = cost / people
```

## 6. Worked example
> 300 km, 7 L/100km, $1.80/L → 21 L × $1.80 = **$37.80** (~$12.60 each for 3 people).

## 7. Use cases
- Budgeting a road trip
- Splitting fuel with carpoolers
- Comparing driving vs other transport

## 8. Tips & mistakes
- Real-world efficiency is worse than the brochure figure — pad it ~10%.
- City driving uses more fuel than highway.

## 9. FAQ (with answers)
**Q: Where do I find my car's efficiency?** The manual or onboard computer; or track litres used over a known distance.
**Q: Does it work in mpg?** Yes — switch the efficiency unit and it converts internally.
**Q: Does it include tolls/parking?** No — fuel only; add those separately.

## 10. Related tools
Cost-per-Unit Calculator · Tip & Split Calculator · Aspect Ratio Calculator

## 11. SEO meta
- **Title:** Fuel Cost Calculator — Trip Fuel & Cost Per Person
- **Description:** Estimate the fuel cost of any trip from distance, fuel efficiency, and price. Supports km/miles, L/100km, km/L, and mpg, and splits cost between passengers.

---
---
END OF CATEGORY: COUNTRY-SPECIFIC (6 tools, specs 17–22).

---
---

# CATEGORY: OBSCURE CONVERTERS

> Build note: each is a simple two-way converter. Keep conversion constants in a
> config object. Default to live conversion (no button). Always show the formula
> on the page — these searchers want to understand, not just convert.

---

# SPEC #23 — GSM to mm (Paper Thickness) Calculator
**Target keyword:** "gsm to mm calculator", "paper thickness calculator"
**RPM:** $$ · **Comp:** Low · **Slug:** `/gsm-to-mm-calculator`

## 1. H1 + promise
**H1:** GSM to mm Calculator (Paper Thickness)
**Promise:** Estimate paper thickness in mm/microns from its GSM weight.

## 2. Tool UI
| Field | Label | Default |
|-------|-------|---------|
| GSM | "Paper weight (GSM)" | `e.g. 300` |
| Density | "Paper density (g/cm³)" | `0.8` (typical) with note it varies |
| Direction | toggle GSM→mm / mm→GSM | GSM→mm |
**Result:** thickness in **mm** and **microns (µm)**.

## 3. Edge cases
- Density is an estimate — make it editable, warn results are approximate.
- 0 → 0, no error.

## 4. Intro
GSM (grams per square metre) measures paper *weight*, not *thickness* — but for a
given paper density you can estimate thickness. This calculator converts between
GSM and millimetres/microns, useful for print, packaging, and card stock.

## 5. Formula
```
thickness_mm = GSM / (density_g_cm3 × 1000)
microns      = thickness_mm × 1000
Reverse:     GSM = thickness_mm × density × 1000
```

## 6. Worked example
> 300 GSM at 0.8 g/cm³ → 300 / 800 = **0.375 mm** (375 µm).

## 7. Use cases
- Choosing card/paper stock for print jobs
- Packaging and business-card specs
- Comparing papers across weight and caliper

## 8. Tips & mistakes
- Thickness depends on density (bulk), which differs by paper type — this is an estimate.
- For exact caliper, use the manufacturer's spec sheet.

## 9. FAQ (with answers)
**Q: Is GSM the same as thickness?** No — GSM is weight per area; thickness also depends on the paper's density/bulk.
**Q: What density should I use?** Around 0.8 g/cm³ is typical for office paper; coated or specialty papers differ.
**Q: What's 300 GSM in mm?** Roughly 0.375 mm at standard density — common for business cards.

## 10. Related tools
PPI/DPI Calculator · Aspect Ratio Calculator · Cost-per-Unit Calculator

## 11. SEO meta
- **Title:** GSM to mm Calculator — Paper Thickness from Weight
- **Description:** Convert paper GSM to millimetres and microns (and back) using paper density. Estimate card and paper thickness for print and packaging.

---

# SPEC #24 — Lumens to Lux Calculator
**Target keyword:** "lumens to lux calculator", "lux to lumens"
**RPM:** $$ · **Comp:** Low · **Slug:** `/lumens-to-lux-calculator`

## 1. H1 + promise
**H1:** Lumens to Lux Calculator
**Promise:** Convert light output (lumens) to illuminance (lux) over an area — and back.

## 2. Tool UI
| Field | Label |
|-------|-------|
| Lumens | "Luminous flux (lumens)" |
| Area | "Area" — with shape options (m², or length×width) |
| Direction | lumens→lux / lux→lumens |
**Result:** **lux** (lm/m²), or required lumens.

## 3. Edge cases
- Area 0 → hint, avoid divide-by-zero.
- Offer area via direct m² OR width×length inputs.

## 4. Intro
Lumens measure total light a source emits; lux measures how much of that light
lands on a surface (lumens per square metre). This converter relates the two over
a given area — handy for planning room or workspace lighting.

## 5. Formula
```
lux    = lumens / area_m2
lumens = lux × area_m2
```

## 6. Worked example
> 2,000 lumens over a 10 m² room → **200 lux**.

## 7. Use cases
- Planning room/office lighting levels
- Checking a bulb meets a lux requirement
- Photography/video lighting setups

## 8. Tips & mistakes
- Lux drops with distance and spread — this assumes even coverage over the area.
- Recommended lux varies by task (offices ~300–500 lux).

## 9. FAQ (with answers)
**Q: What's the difference between lumens and lux?** Lumens = total light emitted; lux = light per square metre on a surface.
**Q: How many lux for an office?** Commonly 300–500 lux for general office work.
**Q: Does distance matter?** Yes — the same lumens spread over a larger area gives fewer lux.

## 10. Related tools
BTU to Tons Calculator · kVA to kW Calculator · Aspect Ratio Calculator

## 11. SEO meta
- **Title:** Lumens to Lux Calculator — Light Output to Illuminance
- **Description:** Convert lumens to lux over any area, or find the lumens needed for a target lux. Plan room, office, and studio lighting accurately.

---

# SPEC #25 — BTU to Tons (HVAC) Calculator
**Target keyword:** "btu to tons calculator", "ac tonnage calculator"
**RPM:** $$$ · **Comp:** Low · **Slug:** `/btu-to-tons-calculator`

## 1. H1 + promise
**H1:** BTU to Tons Calculator (HVAC)
**Promise:** Convert air-conditioner cooling capacity between BTU/hr and tons.

## 2. Tool UI
- Input + direction toggle BTU/hr ↔ tons. Optional kW output too.
**Result:** value in tons, BTU/hr, and kW.

## 3. Edge cases
- 0 → 0.
- Show 3 units together for convenience.

## 4. Intro
Air-conditioner capacity is quoted in BTU/hr or in "tons" of cooling (a legacy
unit). One ton of cooling equals 12,000 BTU/hr. This converter swaps between BTU,
tons, and kW so you can size or compare units.

## 5. Formula
```
tons   = BTU_per_hr / 12,000
BTU    = tons × 12,000
kW     = BTU_per_hr × 0.000293071
```

## 6. Worked example
> 24,000 BTU/hr → 24,000 / 12,000 = **2 tons** (~7.03 kW).

## 7. Use cases
- Sizing an AC unit for a room
- Comparing units quoted in different units
- HVAC quotes and specs

## 8. Tips & mistakes
- "Ton" here is cooling power, not weight.
- Room sizing also depends on insulation, climate, and sun exposure.

## 9. FAQ (with answers)
**Q: How many BTU is 1 ton?** Exactly 12,000 BTU per hour.
**Q: What size AC do I need?** Rough rule ~20 BTU per sq ft, but get a proper load calculation for accuracy.
**Q: What's a ton in kW?** About 3.52 kW of cooling per ton.

## 10. Related tools
kVA to kW Calculator · Lumens to Lux Calculator · Fuel Cost Calculator

## 11. SEO meta
- **Title:** BTU to Tons Calculator — AC Cooling Capacity Converter
- **Description:** Convert HVAC cooling capacity between BTU/hr, tons, and kW. Quickly size or compare air-conditioner units. Free and instant.

---

# SPEC #26 — kVA to kW Calculator
**Target keyword:** "kva to kw calculator", "kva to amps"
**RPM:** $$$ · **Comp:** Low · **Slug:** `/kva-to-kw-calculator`

## 1. H1 + promise
**H1:** kVA to kW Calculator
**Promise:** Convert between kVA and kW using power factor — for generators and UPS.

## 2. Tool UI
| Field | Label | Default |
|-------|-------|---------|
| Value | "Apparent power (kVA)" or "Real power (kW)" | |
| PF | "Power factor" | `0.8` |
| Direction | kVA→kW / kW→kVA | kVA→kW |
**Result:** converted value; optional amps if voltage entered.

## 3. Edge cases
- PF between 0 and 1; reject 0.
- Default PF 0.8 with note "typical; check your equipment."

## 4. Intro
kVA (apparent power) and kW (real power) differ by the power factor — the fraction
of supplied power that does useful work. Generators and UPS units are often rated
in kVA, while appliances are rated in kW. This converter relates them using the
power factor.

## 5. Formula
```
kW  = kVA × powerFactor
kVA = kW / powerFactor
amps (3-phase) = kVA × 1000 / (√3 × voltage)
```

## 6. Worked example
> 100 kVA at PF 0.8 → 100 × 0.8 = **80 kW**.

## 7. Use cases
- Sizing a generator or UPS
- Matching equipment ratings
- Electrical load planning

## 8. Tips & mistakes
- Power factor varies by load; 0.8 is a common default, not universal.
- Don't confuse kVA (apparent) with kW (real) when sizing.

## 9. FAQ (with answers)
**Q: What is power factor?** The ratio of real power (kW) to apparent power (kVA); it reflects how efficiently current is converted to useful work.
**Q: Why are generators rated in kVA?** Because their output depends on the load's power factor, which the manufacturer can't know in advance.
**Q: What PF should I use?** 0.8 is a common assumption; check your specific equipment for the real value.

## 10. Related tools
BTU to Tons Calculator · AWG to mm Calculator · Lumens to Lux Calculator

## 11. SEO meta
- **Title:** kVA to kW Calculator — Convert With Power Factor
- **Description:** Convert kVA to kW (and back) using power factor, plus optional amps. Size generators, UPS units, and electrical loads quickly.

---

# SPEC #27 — AWG to mm Calculator (Wire Gauge)
**Target keyword:** "awg to mm calculator", "wire gauge to mm"
**RPM:** $$ · **Comp:** Low · **Slug:** `/awg-to-mm-calculator`

## 1. H1 + promise
**H1:** AWG to mm Calculator (Wire Gauge)
**Promise:** Convert American Wire Gauge to diameter (mm) and cross-section (mm²).

## 2. Tool UI
- Input AWG number + direction toggle (AWG→mm / mm→AWG).
**Result:** **diameter (mm)**, **cross-sectional area (mm²)**.

## 3. Edge cases
- AWG can be 0, 00 (2/0), etc. — support the standard range.
- mm→AWG picks the nearest standard gauge.

## 4. Intro
American Wire Gauge (AWG) is a numbering system where larger numbers mean thinner
wire. Engineers and electricians often need the metric diameter or cross-section
instead. This converter translates AWG to mm and mm² (and back to the nearest
gauge).

## 5. Formula
```
diameter_mm = 0.127 × 92^((36 − AWG) / 39)
area_mm2    = π × (diameter_mm / 2)^2
```

## 6. Worked example
> AWG 12 → diameter ≈ **2.05 mm**, area ≈ **3.31 mm²**.

## 7. Use cases
- Matching US wire specs to metric
- Choosing wire for a current rating
- Electronics and electrical projects

## 8. Tips & mistakes
- Bigger AWG number = thinner wire (counter-intuitive).
- Ampacity also depends on insulation and conditions, not just gauge.

## 9. FAQ (with answers)
**Q: Is a higher AWG thicker or thinner?** Thinner — AWG 10 is much thicker than AWG 20.
**Q: What's AWG 12 in mm?** About 2.05 mm diameter (~3.31 mm²).
**Q: How much current can a gauge carry?** It depends on length, insulation, and standards — use an ampacity chart, not gauge alone.

## 10. Related tools
kVA to kW Calculator · GSM to mm Calculator · BTU to Tons Calculator

## 11. SEO meta
- **Title:** AWG to mm Calculator — Wire Gauge to Diameter & mm²
- **Description:** Convert American Wire Gauge (AWG) to diameter in mm and cross-section in mm², or find the nearest gauge from a diameter. Free wire-gauge tool.

---

# SPEC #28 — PPI / DPI Calculator
**Target keyword:** "ppi calculator", "dpi calculator", "pixel density"
**RPM:** $$ · **Comp:** Med · **Slug:** `/ppi-calculator`

## 1. H1 + promise
**H1:** PPI / DPI Calculator
**Promise:** Find a screen's pixel density (PPI) from its resolution and size.

## 2. Tool UI
| Field | Label |
|-------|-------|
| Width px | "Horizontal resolution (px)" |
| Height px | "Vertical resolution (px)" |
| Diagonal | "Screen size (inches, diagonal)" |
**Result:** **PPI**, plus dot pitch (mm) and total megapixels.

## 3. Edge cases
- Diagonal 0 → hint.
- Round PPI to whole number.

## 4. Intro
Pixel density — pixels per inch (PPI) — determines how sharp a screen looks. It's
derived from the resolution and the physical diagonal size. This calculator
returns PPI, the dot pitch, and total megapixels for any display.

## 5. Formula
```
diagonalPx = √(widthPx² + heightPx²)
ppi        = diagonalPx / diagonalInches
dotPitch_mm = 25.4 / ppi
```

## 6. Worked example
> 1920×1080 on a 15.6" screen → diagonalPx ≈ 2202.9 → **≈141 PPI**.

## 7. Use cases
- Comparing screen sharpness
- Choosing a monitor or phone
- Design work needing target density

## 8. Tips & mistakes
- Higher PPI = sharper, but viewing distance matters too.
- DPI technically refers to printing; PPI to screens — often used interchangeably.

## 9. FAQ (with answers)
**Q: What's a good PPI?** Phones often exceed 400 PPI; monitors around 90–160 PPI look fine at desk distance.
**Q: Is DPI the same as PPI?** Strictly no — DPI is print dots per inch, PPI is screen pixels per inch — but they're commonly mixed up.
**Q: Does higher PPI always look better?** Up to a point; beyond what your eye resolves at your viewing distance, gains are marginal.

## 10. Related tools
Aspect Ratio Calculator · GSM to mm Calculator · AWG to mm Calculator

## 11. SEO meta
- **Title:** PPI / DPI Calculator — Screen Pixel Density
- **Description:** Calculate a display's pixels per inch (PPI) from its resolution and size, plus dot pitch and megapixels. Compare screen sharpness instantly.

---

# SPEC #29 — Roman Numeral Converter
**Target keyword:** "roman numeral converter", "number to roman numerals"
**RPM:** $ · **Comp:** Med · **Slug:** `/roman-numeral-converter`

## 1. H1 + promise
**H1:** Roman Numeral Converter
**Promise:** Convert numbers to Roman numerals and Roman numerals back to numbers.

## 2. Tool UI
- One input, auto-detects direction (digits → numeral, letters → number) OR a toggle.
**Result:** the converted value, large and copyable.

## 3. Edge cases
- Standard Roman numerals cover 1–3,999; note the limit (or support vinculum for larger).
- Invalid numerals (e.g. "IIII", "VV") → show "Invalid Roman numeral."
- 0 and negatives → "Romans had no zero/negatives."

## 4. Intro
Roman numerals use letters (I, V, X, L, C, D, M) to represent numbers. They still
appear on clocks, book chapters, movie credits, and event names. This converter
turns any number (1–3,999) into Roman numerals and decodes numerals back to
ordinary numbers.

## 5. Formula / logic
```
Use a value→symbol table [1000 M, 900 CM, 500 D, 400 CD, 100 C, 90 XC,
50 L, 40 XL, 10 X, 9 IX, 5 V, 4 IV, 1 I]; subtract greedily.
Reverse: sum symbol values, subtracting when a smaller precedes a larger.
```

## 6. Worked example
> 2026 → MMXXVI. · MCMXCIV → 1994.

## 7. Use cases
- Decoding dates in credits/monuments
- Naming chapters, events (Super Bowl LVIII)
- Homework and learning

## 8. Tips & mistakes
- You can't repeat a symbol more than 3 times (4 = IV, not IIII).
- Subtractive pairs only: IV, IX, XL, XC, CD, CM.

## 9. FAQ (with answers)
**Q: What is 2026 in Roman numerals?** MMXXVI.
**Q: Why is there no zero?** The Roman system had no symbol for zero; it wasn't needed for their counting.
**Q: What's the largest standard Roman numeral?** MMMCMXCIX = 3,999 without special notation (a bar over a letter multiplies by 1,000 for larger).

## 10. Related tools
Aspect Ratio Calculator · Reading Time Calculator · PPI Calculator

## 11. SEO meta
- **Title:** Roman Numeral Converter — Numbers ↔ Roman Numerals
- **Description:** Convert numbers to Roman numerals and Roman numerals to numbers instantly. Supports 1–3,999 with validation. Free Roman numeral converter.

---

# SPEC #30 — Color Contrast Checker (WCAG)
**Target keyword:** "color contrast checker", "wcag contrast ratio"
**RPM:** $$ · **Comp:** Med · **Slug:** `/color-contrast-checker`
*(Cross-listed: also useful in the Developer category.)*

## 1. H1 + promise
**H1:** Color Contrast Checker (WCAG)
**Promise:** Check if two colors meet WCAG accessibility contrast standards.

## 2. Tool UI
- Two color pickers (text + background) with hex inputs.
- Live preview text on the background.
**Result:** **Contrast ratio** (e.g. 4.6:1), plus pass/fail badges for AA/AAA, normal and large text.

## 3. Edge cases
- Accept hex (#fff / #ffffff), rgb.
- Update ratio + preview live.

## 4. Intro
Readable text needs enough contrast against its background. The WCAG accessibility
guidelines set minimum contrast ratios. This checker computes the ratio between
your text and background colors and shows whether it passes AA and AAA for normal
and large text.

## 5. Formula
```
relative luminance L = per WCAG sRGB formula for each color
contrast = (Llighter + 0.05) / (Ldarker + 0.05)
AA: ≥4.5 normal, ≥3 large · AAA: ≥7 normal, ≥4.5 large
```

## 6. Worked example
> #595959 text on #ffffff → contrast ≈ 7:1 → passes AA and AAA.

## 7. Use cases
- Designing accessible websites
- Checking brand colors for readability
- Meeting legal accessibility requirements

## 8. Tips & mistakes
- "Large text" = ~18pt+ or 14pt+ bold — lower threshold applies.
- Don't rely on color alone to convey meaning.

## 9. FAQ (with answers)
**Q: What ratio do I need?** WCAG AA needs 4.5:1 for normal text, 3:1 for large text; AAA needs 7:1 and 4.5:1.
**Q: What counts as large text?** Roughly 18pt (24px) or 14pt (18.66px) bold and larger.
**Q: Does this guarantee accessibility?** Contrast is one factor; full accessibility also covers structure, alt text, and keyboard use.

## 10. Related tools
PPI Calculator · Aspect Ratio Calculator · UUID Generator

## 11. SEO meta
- **Title:** Color Contrast Checker — WCAG AA & AAA Ratio
- **Description:** Check the contrast ratio between text and background colors against WCAG AA and AAA standards for normal and large text. Free accessibility tool.

---
---
END OF CATEGORY: OBSCURE CONVERTERS (8 tools, specs 23–30).

---
---

# CATEGORY: HEALTH / FITNESS (SPECIFIC)

> Build note: health tools need a visible disclaimer — "For general information
> only, not medical advice." Support both metric and imperial units. Keep
> formulas (BMR/TDEE etc.) in a config so they're auditable.

---

# SPEC #31 — TDEE Calculator (by Activity / Sport)
**Target keyword:** "tdee calculator", "tdee calculator runners"
**RPM:** $$$ · **Comp:** Med · **Slug:** `/tdee-calculator`

## 1. H1 + promise
**H1:** TDEE Calculator — Daily Calorie Needs
**Promise:** Estimate the calories you burn per day from your stats and activity level.

## 2. Tool UI
| Field | Label |
|-------|-------|
| Sex | "Sex" (male/female) |
| Age | "Age" |
| Height | "Height" (cm or ft/in) |
| Weight | "Weight" (kg or lb) |
| Activity | "Activity level" dropdown (sedentary → athlete) with sport presets |
**Result:** **BMR**, **TDEE**, plus calorie targets for maintain / lose / gain.

## 3. Edge cases
- Validate realistic ranges; warn on extremes.
- Unit toggles convert internally.
- Disclaimer always visible.

## 4. Intro
Your Total Daily Energy Expenditure (TDEE) is the calories you burn in a day —
your resting metabolism (BMR) multiplied by an activity factor. Knowing it is the
starting point for losing, maintaining, or gaining weight. This calculator
estimates both, with activity presets including specific sports.

## 5. Formula
```
Mifflin-St Jeor BMR:
  men:   10×kg + 6.25×cm − 5×age + 5
  women: 10×kg + 6.25×cm − 5×age − 161
TDEE = BMR × activityFactor (1.2 sedentary … 1.9 athlete)
lose = TDEE − 500 · gain = TDEE + 500
```

## 6. Worked example
> 30yo man, 180cm, 80kg, moderate (1.55):
> BMR = 10×80 + 6.25×180 − 5×30 + 5 = 1,780 → TDEE ≈ **2,759 cal/day**.

## 7. Use cases
- Setting a calorie target for a goal
- Planning nutrition around training
- Understanding maintenance calories

## 8. Tips & mistakes
- TDEE is an estimate; adjust based on real weight change over 2–3 weeks.
- Don't overestimate activity level — a common reason diets stall.

## 9. FAQ (with answers)
**Q: What's the difference between BMR and TDEE?** BMR is calories burned at complete rest; TDEE adds your daily activity and exercise.
**Q: How many calories to lose weight?** A deficit of ~500/day ≈ 0.5 kg (1 lb) per week, but adjust to your real results.
**Q: Which activity level should I pick?** Be honest — most people overestimate. "Moderate" suits 3–5 workouts a week.

## 10. Related tools
Calorie Deficit Calculator · Keto Macro Calculator · Ideal Weight Calculator

## 11. SEO meta
- **Title:** TDEE Calculator — Daily Calorie & Maintenance Needs
- **Description:** Estimate your BMR and TDEE (daily calorie burn) from age, sex, height, weight, and activity, with targets to lose, maintain, or gain weight.

---

# SPEC #32 — Calorie Deficit Calculator
**Target keyword:** "calorie deficit calculator", "weight loss calculator"
**RPM:** $$$ · **Comp:** Med · **Slug:** `/calorie-deficit-calculator`

## 1. H1 + promise
**H1:** Calorie Deficit Calculator
**Promise:** Find the daily calories and deficit needed to reach your goal weight by a date.

## 2. Tool UI
| Field | Label |
|-------|-------|
| TDEE | "Maintenance calories (TDEE)" or compute inline |
| Current/Goal | "Current weight" / "Goal weight" |
| Deadline | "Target date" or "weeks" |
**Result:** **Daily calorie target**, **deficit/day**, **expected weekly loss**, realistic-pace warning.

## 3. Edge cases
- Deficit > 1,000/day → warn "too aggressive / unsafe."
- Goal ≥ current → switch to surplus mode or note.

## 4. Intro
Weight loss comes down to a calorie deficit — eating fewer calories than you burn.
This calculator works out the daily intake and deficit needed to reach your goal
weight by your chosen date, and flags whether that pace is safe and realistic.

## 5. Formula
```
totalDeficit = (currentKg − goalKg) × 7700   (≈ calories per kg of fat)
dailyDeficit = totalDeficit / days
dailyIntake  = TDEE − dailyDeficit
weeklyLoss   = (dailyDeficit × 7) / 7700
```

## 6. Worked example
> Lose 5 kg in 10 weeks: total ≈ 38,500 cal → /70 days ≈ **550/day deficit**; eat TDEE − 550.

## 7. Use cases
- Planning a realistic cut
- Setting a daily calorie number
- Checking if a goal date is achievable

## 8. Tips & mistakes
- ~0.5–1% body weight/week is a sustainable pace.
- Very large deficits cost muscle and rarely last.

## 9. FAQ (with answers)
**Q: How big a deficit is safe?** Often 500–750 cal/day; going beyond ~1,000 risks muscle loss and is hard to sustain.
**Q: Why isn't the scale moving?** Water, food timing, and muscle gain mask fat loss — judge over 2–3 weeks.
**Q: Is 7,700 calories really 1 kg?** It's the common estimate for a kg of body fat; real results vary by person.

## 10. Related tools
TDEE Calculator · Keto Macro Calculator · Water Intake Calculator

## 11. SEO meta
- **Title:** Calorie Deficit Calculator — Daily Intake for Weight Loss
- **Description:** Calculate the daily calories and deficit needed to reach your goal weight by a target date, with a safe-pace check. Free weight-loss calculator.

---

# SPEC #33 — Keto Macro Calculator
**Target keyword:** "keto macro calculator", "keto calculator"
**RPM:** $$$ · **Comp:** Med · **Slug:** `/keto-macro-calculator`

## 1. H1 + promise
**H1:** Keto Macro Calculator
**Promise:** Get your daily fat, protein, and carb targets for a ketogenic diet.

## 2. Tool UI
- Reuse TDEE inputs (or accept a calorie target) + goal (lose/maintain/gain).
- Optional sliders: carb limit (g), protein per kg.
**Result:** grams + calories for **fat / protein / carbs**, as a pie chart.

## 3. Edge cases
- Keep carbs low (default 20–30 g); enforce sensible protein floor.
- Show macro % splits.

## 4. Intro
A ketogenic diet is high-fat, moderate-protein, and very low-carb. This calculator
takes your calorie target and splits it into daily grams of fat, protein, and
carbs that keep you in keto range — typically ~70% fat, ~25% protein, ~5% carbs.

## 5. Formula
```
carbs_g   = fixed low limit (e.g. 25 g) → ×4 cal
protein_g = proteinPerKg × leanOrBodyKg → ×4 cal
fat_cal   = totalCalories − carbCal − proteinCal
fat_g     = fat_cal / 9
```

## 6. Worked example
> 2,000 cal, 25g carbs (100 cal), 120g protein (480 cal) → fat = 1,420 cal → **~158 g fat**.

## 7. Use cases
- Starting a keto diet
- Recalculating macros after weight change
- Meal planning to hit targets

## 8. Tips & mistakes
- Too much protein can hinder ketosis for some — keep it moderate.
- Track net carbs; hidden carbs add up fast.

## 9. FAQ (with answers)
**Q: How many carbs on keto?** Commonly 20–50 g net carbs per day to maintain ketosis.
**Q: What's the macro split?** Roughly 70% fat, 25% protein, 5% carbs by calories — adjust to your needs.
**Q: Is keto safe for everyone?** Not necessarily — consult a doctor, especially with medical conditions.

## 10. Related tools
TDEE Calculator · Calorie Deficit Calculator · Water Intake Calculator

## 11. SEO meta
- **Title:** Keto Macro Calculator — Daily Fat, Protein & Carb Targets
- **Description:** Calculate your daily keto macros — fat, protein, and carbs in grams — from your calorie target and goal. Free ketogenic diet macro calculator.

---

# SPEC #34 — Water Intake Calculator
**Target keyword:** "daily water intake calculator", "how much water should i drink"
**RPM:** $$ · **Comp:** Med · **Slug:** `/water-intake-calculator`

## 1. H1 + promise
**H1:** Daily Water Intake Calculator
**Promise:** Estimate how much water to drink per day from your weight and activity.

## 2. Tool UI
| Field | Label |
|-------|-------|
| Weight | "Weight" (kg/lb) |
| Activity | "Exercise per day (minutes)" |
| Climate | "Climate" (normal/hot) optional |
**Result:** recommended **litres/day** (and cups/oz), with a note it's a guideline.

## 3. Edge cases
- Add water for exercise minutes and hot climate.
- Cap unrealistic outputs; show range.

## 4. Intro
Hydration needs depend mainly on body weight and activity. This calculator gives a
practical daily water target in litres (and cups), adding extra for exercise and
hot weather — a simple starting guideline, not a strict medical rule.

## 5. Formula
```
base_ml   = weightKg × 33      (≈ 30–35 ml/kg)
exercise  + 350 ml per 30 min activity
hot climate + ~500 ml
total_l = (base + additions) / 1000
```

## 6. Worked example
> 70 kg, 30 min exercise → 2,310 + 350 = 2,660 ml ≈ **2.7 L/day**.

## 7. Use cases
- Setting a daily hydration goal
- Adjusting intake for workouts/heat
- Building a hydration habit

## 8. Tips & mistakes
- Food and other drinks count toward fluid intake too.
- Thirst and urine color are good real-time guides.

## 9. FAQ (with answers)
**Q: Is it really 8 glasses a day?** That's a rough rule; actual needs scale with weight, activity, and climate.
**Q: Can I drink too much water?** Yes, rarely — excessive intake can dilute sodium; this tool targets normal ranges.
**Q: Do coffee and tea count?** They contribute to fluids despite mild diuretic effects; water is still best.

## 10. Related tools
TDEE Calculator · Calorie Deficit Calculator · Ideal Weight Calculator

## 11. SEO meta
- **Title:** Daily Water Intake Calculator — How Much Water to Drink
- **Description:** Estimate your daily water intake in litres and cups from your weight, exercise, and climate. A simple hydration guideline calculator.

---

# SPEC #35 — Ideal Weight Calculator (by Frame Size)
**Target keyword:** "ideal weight calculator", "ideal weight frame size"
**RPM:** $$ · **Comp:** Low · **Slug:** `/ideal-weight-calculator`

## 1. H1 + promise
**H1:** Ideal Weight Calculator (by Frame Size)
**Promise:** Estimate a healthy weight range based on height, sex, and frame size.

## 2. Tool UI
| Field | Label |
|-------|-------|
| Sex | "Sex" |
| Height | "Height" (cm/ft-in) |
| Frame | "Frame size" (small/medium/large) — explain wrist method |
**Result:** ideal weight **range** from multiple formulas (Devine, Hamwi, BMI range), adjusted for frame.

## 3. Edge cases
- Present a range, not a single number.
- Frame adjusts ±~10%.
- Disclaimer about athletes/muscle mass.

## 4. Intro
"Ideal weight" isn't one number — it's a range that depends on height, sex, and
build. This calculator combines established formulas and adjusts for your frame
size (small, medium, large) to give a healthy target range rather than a single
misleading figure.

## 5. Formula
```
Devine (men):   50 + 2.3 kg per inch over 5 ft
Devine (women): 45.5 + 2.3 kg per inch over 5 ft
Also show BMI-healthy range: 18.5–24.9 × height_m²
Frame: small −10%, large +10%
```

## 6. Worked example
> Man, 5'10" (178 cm): Devine ≈ 50 + 2.3×10 = **73 kg**; BMI-healthy ≈ 58–79 kg.

## 7. Use cases
- Setting a realistic weight goal
- Understanding healthy ranges
- Context for BMI

## 8. Tips & mistakes
- Muscular people may exceed "ideal" weight while being healthy.
- Use it as a guide alongside body composition, not a strict target.

## 9. FAQ (with answers)
**Q: How do I find my frame size?** Wrap your fingers around your wrist — overlap = small frame, just touch = medium, gap = large (rough method).
**Q: Is ideal weight the same as BMI?** Related — this tool also shows the BMI-healthy range, but combines formulas and frame.
**Q: Why a range, not one number?** Bodies differ; a healthy weight spans a range, and a single figure is misleading.

## 10. Related tools
TDEE Calculator · Calorie Deficit Calculator · Water Intake Calculator

## 11. SEO meta
- **Title:** Ideal Weight Calculator — Healthy Range by Frame Size
- **Description:** Estimate a healthy weight range from your height, sex, and frame size using multiple formulas plus the BMI-healthy range. Free ideal weight tool.

---

# SPEC #36 — Ovulation / Fertile Window Calculator
**Target keyword:** "ovulation calculator", "fertile window calculator"
**RPM:** $$$ · **Comp:** Med · **Slug:** `/ovulation-calculator`

## 1. H1 + promise
**H1:** Ovulation Calculator
**Promise:** Estimate your fertile window and ovulation day from your cycle.

## 2. Tool UI
| Field | Label |
|-------|-------|
| Last period | "First day of last period" (date) |
| Cycle length | "Average cycle length (days)" (default 28) |
**Result:** estimated **ovulation date**, **fertile window** (range), and next period date.

## 3. Edge cases
- Cycle length range ~21–35; warn outside.
- Show "estimate — cycles vary."
- Strong privacy note: dates not stored.

## 4. Intro
Ovulation usually occurs about 14 days before your next period, and the fertile
window spans the days around it. From your last period date and average cycle
length, this calculator estimates your ovulation day and most fertile days — a
planning guide, not a medical or contraceptive tool.

## 5. Formula
```
nextPeriod = lastPeriod + cycleLength
ovulation  = nextPeriod − 14
fertile    = ovulation − 5  to  ovulation + 1
```

## 6. Worked example
> Last period June 1, 28-day cycle → next ~June 29, ovulation ~**June 15**, fertile ~June 10–16.

## 7. Use cases
- Planning or tracking conception timing
- Understanding cycle phases
- Logging cycle patterns

## 8. Tips & mistakes
- Cycles vary month to month — this is an estimate, not a guarantee.
- Not a reliable method to prevent pregnancy.

## 9. FAQ (with answers)
**Q: When am I most fertile?** The few days before and on ovulation — roughly the 6-day fertile window this tool shows.
**Q: How accurate is this?** It's an estimate based on average timing; ovulation tests and tracking improve accuracy.
**Q: Can I use it as birth control?** No — it's not reliable for preventing pregnancy.

## 10. Related tools
IVF Due Date Calculator · Water Intake Calculator · Ideal Weight Calculator

## 11. SEO meta
- **Title:** Ovulation Calculator — Fertile Window & Ovulation Day
- **Description:** Estimate your ovulation day and fertile window from your last period and cycle length. A simple conception-planning guide — not medical advice.

---

# SPEC #37 — IVF Due Date Calculator
**Target keyword:** "ivf due date calculator", "ivf transfer due date"
**RPM:** $$$ · **Comp:** Low · **Slug:** `/ivf-due-date-calculator`

## 1. H1 + promise
**H1:** IVF Due Date Calculator
**Promise:** Estimate your due date from your IVF embryo transfer date.

## 2. Tool UI
| Field | Label |
|-------|-------|
| Transfer date | "Embryo transfer date" |
| Embryo age | "Embryo age at transfer" (Day 3 / Day 5) |
**Result:** **estimated due date**, plus current gestational age.

## 3. Edge cases
- Day 3 vs Day 5 changes the offset.
- Show gestational-age calculation method.

## 4. Intro
IVF due dates are calculated differently from natural conception because the exact
transfer date and embryo age are known. This calculator uses your embryo transfer
date and whether it was a Day 3 or Day 5 embryo to estimate your due date and
current gestational age.

## 5. Formula
```
Day 5 transfer: dueDate = transferDate + 261 days
Day 3 transfer: dueDate = transferDate + 263 days
(based on 266 days from conception, minus embryo age)
```

## 6. Worked example
> Day 5 transfer on June 1 → due date ≈ **Feb 17** next year (transfer + 261 days).

## 7. Use cases
- Planning around an IVF pregnancy
- Tracking gestational milestones
- Sharing an estimated date with your clinic

## 8. Tips & mistakes
- Your clinic's dating ultrasound is the authority — this is an estimate.
- Day 3 and Day 5 embryos use different offsets.

## 9. FAQ (with answers)
**Q: Why is IVF dating more precise?** The conception timing is known exactly from the transfer, unlike natural conception.
**Q: Day 3 vs Day 5 — does it matter?** Yes — the embryo's age at transfer shifts the due date by a couple of days.
**Q: Is this my official due date?** Treat it as an estimate; your clinic's ultrasound confirms it.

## 10. Related tools
Ovulation Calculator · Water Intake Calculator · TDEE Calculator

## 11. SEO meta
- **Title:** IVF Due Date Calculator — From Embryo Transfer Date
- **Description:** Estimate your due date and gestational age from your IVF embryo transfer date and embryo age (Day 3 or Day 5). Simple, free IVF pregnancy tool.

---
---
END OF CATEGORY: HEALTH / FITNESS (7 tools, specs 31–37).

---
---

# CATEGORY: DEVELOPER / PRO TOOLS

> Build note: these run entirely client-side — never send user input to a server
> (devs care about privacy). Add a visible "Runs in your browser — nothing is
> uploaded" note. Include a copy-to-clipboard button on every output.

---

# SPEC #38 — Cron Expression Generator
**Target keyword:** "cron expression generator", "crontab generator"
**RPM:** $$$ · **Comp:** Med · **Slug:** `/cron-expression-generator`

## 1. H1 + promise
**H1:** Cron Expression Generator
**Promise:** Build a cron schedule with dropdowns — no syntax memorizing.

## 2. Tool UI
- Dropdowns/inputs for minute, hour, day-of-month, month, day-of-week, with presets ("every 5 min", "daily at…", "weekdays").
**Result:** the **cron string** (copyable) + a plain-English description + "next 5 run times."

## 3. Edge cases
- Validate ranges (min 0–59, hour 0–23, etc.).
- Support `*`, `*/n`, ranges `1-5`, lists `1,3,5`.
- Warn on impossible combos (e.g. Feb 30).

## 4. Intro
Cron expressions schedule recurring jobs, but their five-field syntax is easy to
get wrong. This generator lets you pick the schedule from menus, then outputs the
correct cron string, explains it in plain English, and previews the next run
times so you can confirm before deploying.

## 5. Logic
```
Fields: minute hour day-of-month month day-of-week
"*/5 * * * *" = every 5 minutes
"0 9 * * 1-5" = 09:00 on weekdays
Parse fields to compute upcoming run timestamps.
```

## 6. Worked example
> "Every weekday at 9 AM" → `0 9 * * 1-5`.

## 7. Use cases
- Scheduling server cron jobs
- Setting up CI/automation timers
- Learning cron syntax

## 8. Tips & mistakes
- Day-of-month AND day-of-week both set can behave unexpectedly (OR logic in many crons).
- Times use the server's timezone — confirm it.

## 9. FAQ (with answers)
**Q: What do the five cron fields mean?** Minute, hour, day-of-month, month, and day-of-week, in that order.
**Q: How do I run something every 5 minutes?** Use `*/5 * * * *`.
**Q: What timezone does cron use?** Usually the server's local timezone — set or check `TZ`/`CRON_TZ` if needed.

## 10. Related tools
Crontab to Human-Readable · UUID Generator · Base64 Encoder/Decoder

## 11. SEO meta
- **Title:** Cron Expression Generator — Build & Preview Cron Schedules
- **Description:** Generate cron expressions with simple menus, see a plain-English description, and preview the next run times. Free crontab generator.

---

# SPEC #39 — Crontab to Human-Readable
**Target keyword:** "crontab readable", "cron expression explained"
**RPM:** $$ · **Comp:** Low · **Slug:** `/crontab-to-human`

## 1. H1 + promise
**H1:** Crontab to Human-Readable Translator
**Promise:** Paste a cron expression and read what it actually does in plain English.

## 2. Tool UI
- Single text input for the cron string.
**Result:** plain-English description + next 5 run times. Live as you type.

## 3. Edge cases
- Invalid expression → friendly "Couldn't parse — expected 5 fields."
- Support `*/n`, ranges, lists, names (JAN, MON).

## 4. Intro
Reverse of the generator: paste any cron expression and this tool tells you, in
plain English, when it runs — and shows the upcoming run times so you can verify
an existing job's schedule at a glance.

## 5. Logic
Parse the 5 fields and render: "At [minute] past [hour], on [days], in [months]."
Compute next occurrences.

## 6. Worked example
> `30 2 * * 0` → "At 02:30 every Sunday."

## 7. Use cases
- Auditing existing cron jobs
- Code review of scheduled tasks
- Learning what an inherited crontab does

## 8. Tips & mistakes
- Double-check day-of-month vs day-of-week interactions.
- Confirm the server timezone for the real wall-clock time.

## 9. FAQ (with answers)
**Q: What does `0 0 * * *` mean?** Every day at midnight.
**Q: What does `*/15` mean?** Every 15 units (e.g. every 15 minutes in the minute field).
**Q: Does it show the timezone?** It describes the schedule; actual time depends on your server's timezone.

## 10. Related tools
Cron Expression Generator · UUID Generator · Base64 Encoder/Decoder

## 11. SEO meta
- **Title:** Crontab to Human-Readable — Explain Any Cron Expression
- **Description:** Paste a cron expression to read what it does in plain English and preview the next run times. Free, instant cron translator.

---

# SPEC #40 — JWT Decoder
**Target keyword:** "jwt decoder", "decode jwt token"
**RPM:** $$$ · **Comp:** Med · **Slug:** `/jwt-decoder`

## 1. H1 + promise
**H1:** JWT Decoder
**Promise:** Decode a JSON Web Token to read its header and payload — in your browser.

## 2. Tool UI
- Textarea to paste the token.
**Result:** three panels — **Header**, **Payload** (pretty JSON), **Signature** (shown, not verified). Highlight `exp`/`iat` as human dates.

## 3. Edge cases
- Invalid/odd segments → "Not a valid JWT (expected 3 dot-separated parts)."
- Base64url decode (not standard base64).
- Big strong note: **does not verify the signature; never paste production secrets.**

## 4. Intro
A JSON Web Token (JWT) has three Base64url parts: header, payload, and signature.
This decoder splits and decodes the header and payload so you can inspect claims
like issuer, expiry, and user data. It runs entirely in your browser and does not
verify or store anything.

## 5. Logic
```
split on "."; base64url-decode parts [0] and [1]; JSON.parse each.
Convert exp/iat/nbf (unix seconds) to readable dates.
```

## 6. Worked example
> A token's payload reveals `{ "sub": "123", "exp": 1735689600 }` → expiry shown as a date.

## 7. Use cases
- Debugging auth tokens
- Checking token expiry/claims
- Learning JWT structure

## 8. Tips & mistakes
- Decoding ≠ verifying — anyone can read a JWT's payload; it's signed, not encrypted.
- Never share real tokens; they may grant access.

## 9. FAQ (with answers)
**Q: Is a JWT encrypted?** No — the payload is only Base64-encoded and readable by anyone; it's signed to prevent tampering, not to hide data.
**Q: Does this verify the signature?** No — it only decodes. Verification needs the secret/public key, done server-side.
**Q: Is my token uploaded?** No — decoding happens entirely in your browser.

## 10. Related tools
Base64 Encoder/Decoder · UUID Generator · Color Contrast Checker

## 11. SEO meta
- **Title:** JWT Decoder — Decode JSON Web Token Header & Payload
- **Description:** Paste a JWT to decode its header and payload and read claims like expiry and issuer. Runs in your browser — nothing is uploaded or verified.

---

# SPEC #41 — Base64 Encoder / Decoder
**Target keyword:** "base64 decode", "base64 encode"
**RPM:** $$ · **Comp:** High · **Slug:** `/base64-encode-decode`

## 1. H1 + promise
**H1:** Base64 Encoder / Decoder
**Promise:** Encode text to Base64 or decode Base64 back to text instantly.

## 2. Tool UI
- Textarea + toggle Encode / Decode. Copy button.
**Result:** converted output, live.

## 3. Edge cases
- Invalid Base64 on decode → "Invalid Base64 input."
- Handle UTF-8/Unicode correctly (encodeURIComponent trick or TextEncoder).
- Optional URL-safe Base64 toggle.

## 4. Intro
Base64 encodes binary or text data into a safe ASCII string for transport in
URLs, JSON, emails, and data URIs. This tool converts both ways — encode text to
Base64 or decode Base64 back to readable text — entirely in your browser.

## 5. Logic
```
encode: btoa(unescape(encodeURIComponent(text)))
decode: decodeURIComponent(escape(atob(b64)))
```

## 6. Worked example
> "Hello" → `SGVsbG8=` and back.

## 7. Use cases
- Decoding API/config values
- Building data URIs
- Debugging encoded payloads

## 8. Tips & mistakes
- Base64 is encoding, not encryption — it hides nothing.
- It increases size by ~33%.

## 9. FAQ (with answers)
**Q: Is Base64 secure?** No — it's reversible encoding, not encryption; anyone can decode it.
**Q: Why use it?** To safely carry binary or special characters through text-only channels like URLs and JSON.
**Q: What's URL-safe Base64?** A variant replacing `+` and `/` with `-` and `_` so it's safe in URLs.

## 10. Related tools
JWT Decoder · UUID Generator · Cron Expression Generator

## 11. SEO meta
- **Title:** Base64 Encoder / Decoder — Encode & Decode Online
- **Description:** Encode text to Base64 or decode Base64 to text instantly, with Unicode and URL-safe support. Runs in your browser — nothing is uploaded.

---

# SPEC #42 — UUID Generator
**Target keyword:** "uuid generator", "guid generator"
**RPM:** $$ · **Comp:** Med · **Slug:** `/uuid-generator`

## 1. H1 + promise
**H1:** UUID Generator
**Promise:** Generate one or many random UUIDs (v4) instantly.

## 2. Tool UI
- "How many" number + "Generate" button. Copy-all and copy-each.
- Optional: uppercase toggle, remove-dashes toggle.
**Result:** list of UUIDs.

## 3. Edge cases
- Cap count (e.g. 1,000) to avoid lag.
- Use `crypto.randomUUID()` where available; fallback to crypto.getRandomValues.

## 4. Intro
A UUID (Universally Unique Identifier) is a 128-bit value used as a practically
unique ID for database rows, files, and API objects. This generator produces
cryptographically random version-4 UUIDs — one or thousands at a time — right in
your browser.

## 5. Logic
```
Prefer crypto.randomUUID(). v4 format: xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx
where y ∈ [8,9,a,b].
```

## 6. Worked example
> e.g. `3f2504e0-4f89-41d3-9a0c-0305e82c3301`.

## 7. Use cases
- Seeding database IDs
- Generating test data
- Unique keys for files/objects

## 8. Tips & mistakes
- v4 UUIDs are random; collision risk is negligible but not literally zero.
- For sortable IDs, consider UUID v7/ULID instead.

## 9. FAQ (with answers)
**Q: Are these truly unique?** v4 UUIDs are random 122-bit values — collisions are astronomically unlikely.
**Q: Is a UUID the same as a GUID?** Yes — GUID is Microsoft's name for the same concept.
**Q: Are they generated locally?** Yes — entirely in your browser using the crypto API.

## 10. Related tools
Base64 Encoder/Decoder · JWT Decoder · Cron Expression Generator

## 11. SEO meta
- **Title:** UUID Generator — Random v4 UUIDs / GUIDs Online
- **Description:** Generate one or thousands of random version-4 UUIDs (GUIDs) instantly, with uppercase and no-dash options. Runs in your browser.

---

# SPEC #43 — .htaccess Redirect Generator
**Target keyword:** "htaccess redirect generator", "301 redirect generator"
**RPM:** $$$ · **Comp:** Low · **Slug:** `/htaccess-redirect-generator`

## 1. H1 + promise
**H1:** .htaccess Redirect Generator
**Promise:** Generate correct .htaccess redirect rules without learning the syntax.

## 2. Tool UI
- Redirect type dropdown: 301/302, single URL, whole domain, HTTP→HTTPS, www↔non-www, trailing slash.
- Inputs for old/new URLs as relevant.
**Result:** ready-to-paste `.htaccess` block (copyable) + a one-line explanation.

## 3. Edge cases
- Escape regex special chars in paths.
- Validate URLs.
- Note "place above other rules / in site root."

## 4. Intro
Apache's `.htaccess` redirects are powerful but the RewriteRule syntax is fiddly
and easy to break. This generator builds correct rules for common cases — 301
redirects, forcing HTTPS, www canonicalization — and outputs a block you can paste
straight into your `.htaccess`.

## 5. Logic
```
301 single: Redirect 301 /old-path https://site.com/new-path
Force HTTPS:
  RewriteEngine On
  RewriteCond %{HTTPS} off
  RewriteRule ^(.*)$ https://%{HTTP_HOST}/$1 [R=301,L]
```

## 6. Worked example
> Old `/blog` → new `/articles` (301) → `Redirect 301 /blog https://site.com/articles`.

## 7. Use cases
- Migrating URLs without losing SEO
- Forcing HTTPS or canonical www
- Fixing broken/old links

## 8. Tips & mistakes
- 301 = permanent (passes SEO value); 302 = temporary.
- Back up your `.htaccess` before editing; a typo can 500 the site.

## 9. FAQ (with answers)
**Q: 301 vs 302 — which should I use?** 301 (permanent) for real moves so search engines pass ranking; 302 only for temporary changes.
**Q: Where does this go?** In the `.htaccess` file in your site's root, usually near the top.
**Q: Will it hurt SEO?** A correct 301 preserves SEO value; broken rules or chains can harm it — test after applying.

## 10. Related tools
Open Graph / Meta Generator · Cron Expression Generator · UUID Generator

## 11. SEO meta
- **Title:** .htaccess Redirect Generator — 301/302 & HTTPS Rules
- **Description:** Generate correct .htaccess redirect rules for 301/302 redirects, HTTPS forcing, and www canonicalization. Copy-paste ready, no syntax needed.

---

# SPEC #44 — Open Graph / Meta Tag Generator
**Target keyword:** "open graph generator", "meta tag generator"
**RPM:** $$$ · **Comp:** Low · **Slug:** `/open-graph-generator`

## 1. H1 + promise
**H1:** Open Graph & Meta Tag Generator
**Promise:** Generate SEO and social-share meta tags with a live preview.

## 2. Tool UI
| Field | Label |
|-------|-------|
| Title | "Page title" |
| Description | "Meta description" |
| URL | "Page URL" |
| Image | "Share image URL" |
| Type/Twitter | optional og:type, twitter:card |
**Result:** copyable `<meta>` block + a **live social-card preview** (Facebook/Twitter style).

## 3. Edge cases
- Warn if title > ~60 chars or description > ~160 (SEO limits) with live counters.
- Escape quotes/HTML in values.

## 4. Intro
When a page is shared on social media or listed in search, meta tags control the
title, description, and preview image. This generator builds the full set —
standard SEO tags plus Open Graph and Twitter Card — and shows a live preview of
how the link will look when shared.

## 5. Logic
Output `<title>`, `<meta name="description">`, `og:title/description/url/image/type`,
and `twitter:card/title/description/image`. Live-bind a preview card.

## 6. Worked example
> Title "Free PDF Tools", desc "Merge, split…" → full meta block + preview card.

## 7. Use cases
- Improving search snippets
- Controlling social-share appearance
- Standardizing tags across pages

## 8. Tips & mistakes
- Keep title ≤ ~60 chars, description ≤ ~160 to avoid truncation.
- Use an image ~1200×630 for best social previews.

## 9. FAQ (with answers)
**Q: What are Open Graph tags?** Meta tags (og:*) that tell social platforms the title, description, and image to show when your link is shared.
**Q: Do meta tags improve SEO?** Title and description influence click-through in search; Open Graph mainly affects social sharing.
**Q: What image size for sharing?** About 1200×630 px (1.91:1) works across most platforms.

## 10. Related tools
.htaccess Redirect Generator · Color Contrast Checker · Aspect Ratio Calculator

## 11. SEO meta
- **Title:** Open Graph & Meta Tag Generator — With Live Preview
- **Description:** Generate SEO meta tags plus Open Graph and Twitter Card tags with a live social-share preview. Copy-paste ready. Free meta tag generator.

---
---
END OF CATEGORY: DEVELOPER / PRO (specs 38–44, plus Color Contrast #30).

============================================================
DOCUMENT COMPLETE — 44 tool specs across 6 categories:
- AI / New-Trend ......... #1–6   (6)
- Finance (non-loan) ..... #7–16  (10)
- Country-Specific ....... #17–22 (6)
- Obscure Converters ..... #23–30 (8)
- Health / Fitness ....... #31–37 (7)
- Developer / Pro ........ #38–44 (7, + #30 cross-listed)
============================================================
Next step suggestion: pick one spec and build it as a real Astro page.
