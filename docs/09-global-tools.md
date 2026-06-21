# 09 — Global-First Tools (work in every country)

You're right: some tools (salary, tax) behave differently per country. **Rule: every tool must
work for a user anywhere in the world.** We never hardcode one country's rules.

## How we make money/locale tools global

The trick is simple: **don't bake in a country — let the user pick.**

| Tool | The country problem | Our global fix |
|------|---------------------|----------------|
| Salary Hourly ↔ Annual | Hours/week, weeks/year, currency differ | User enters hours/week + weeks/year; **currency picker** (symbol only — math is universal) |
| GST / VAT / Sales Tax | Rates differ per country/state | User **enters the tax rate** (with quick presets like 5/10/18/20%); works for any country |
| Loan / EMI | Currency differs, math is the same | Universal EMI formula + **currency picker** |
| Discount / Tip | Currency only | Currency picker; math is universal |
| Compound Interest / Savings | Currency only | Currency picker; universal formula |
| Currency Converter | Needs **live exchange rates** | Use a free rates API (e.g. exchangerate.host / open ER API); supports all currencies |

### The shared "currency picker" component
We build **one** small currency selector (USD, EUR, GBP, INR, PKR, AED, NGN, … + symbol) and
reuse it across all money tools. Default it from the visitor's browser locale, but always let
them change it. No country is assumed.

### Units: metric + imperial everywhere
Anything with measurements (pace, water intake, BMI, image sizes, cooking) offers **both
metric and imperial** with a toggle, defaulting from the visitor's locale.

### Dates: international format
Use clear, unambiguous date display (e.g. "21 Jun 2026") and let users input via a date picker,
so US (MM/DD) vs rest-of-world (DD/MM) confusion never happens.

### Language
Launch in **English** (largest global reach). Structure the site so we *can* add other
languages later (translations per page) if a region brings big traffic — not now.

## Tools that are already 100% global (no changes needed)
Word Counter, Case Converter, all PDF tools, all image tools, JSON/Base64/URL/QR/UUID/Hash/
Color/Password/Timestamp, Fancy Text, Hashtag, Emoji, Love Calculator, Coin Flip, Roman
Numerals, Regex, Cron, JWT, etc. — these don't depend on country at all.

## Tools to handle carefully (region-sensitive)
- **Take-home / income-tax calculators** (after-tax salary): true tax brackets are country- and
  year-specific and change often → **avoid** full take-home tax tools at launch (high
  maintenance, easy to be wrong). Stick to the **global, rate-entry** versions above.
- **Grade/CGPA**: grading scales differ → offer **multiple scale presets** (4.0, 10-point,
  percentage, UK/EU) the user can choose.

## Bottom line
We prioritize **globally workable tools**, and for the few money/locale ones we use a
currency picker + user-entered rates + metric/imperial toggles. That keeps every tool correct
for every visitor and maximizes worldwide traffic.
