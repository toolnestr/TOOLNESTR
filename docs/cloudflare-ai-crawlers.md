# Unblocking AI search crawlers at the Cloudflare edge

## Why this matters (the #1 GEO issue)

An SEO/GEO/AEO audit (2026-07-08) found that **every automated request to
`https://toolnestr.com` returned HTTP `403 Forbidden`** to AI crawlers, and the
**live** `robots.txt` served a Cloudflare-managed policy of `ai-train=no` that
disallows `ClaudeBot`, `GPTBot`, `CCBot`, `Google-Extended` and ~9 other AI user
agents.

This is **not** in this repo — our `public/robots.txt` is fully permissive. The
block is injected at the **Cloudflare edge**. The effect: AI answer engines
(Perplexity, ChatGPT Search, Google AI Overviews, Gemini, Apple Intelligence)
**cannot read or cite the site at all**, which caps the GEO score no matter how
good the on-page content is.

> Note the distinction: **AI _search_ crawlers cite you live in answers**, while
> **AI _training_ crawlers ingest content to train models**. You can allow the
> first while still blocking the second. Blocking search crawlers is what hurts
> GEO.

## What to change in the Cloudflare dashboard

The block is one (or more) of these three features. Check each:

### 1. Bot Fight Mode / Super Bot Fight Mode
`Security → Bots`
- If **"Block AI bots / AI Scrapers and Crawlers"** is set to **Block**, switch it
  to **Allow** (or **Managed Challenge** only for *training* bots if you want to
  keep training opted-out).
- If **Bot Fight Mode** is On, it can 403 legitimate crawlers — prefer
  **Super Bot Fight Mode** with granular rules, or turn it off for this zone.

### 2. AI Content Signals / managed robots.txt
`Manage Account → Content Signals Policy` (or the zone-level robots.txt toggle)
- This is what injects `ai-train=no` and the AI `Disallow` list into the served
  `robots.txt`. Disable the managed policy so **our own** `public/robots.txt`
  (which explicitly welcomes AI search bots) is served instead.

### 3. WAF custom rules
`Security → WAF → Custom rules`
- Look for any rule matching `cf.client.bot`, `User-Agent` contains
  `GPTBot`/`ClaudeBot`/`Perplexity`, or an "AI crawlers" managed rule set to
  **Block**. Change the action to **Skip / Allow** for the search crawlers.

## How to verify it worked

From a machine (not behind the same account), run:

```bash
curl -sI -A "PerplexityBot" https://toolnestr.com/            # expect HTTP/2 200
curl -sI -A "OAI-SearchBot"  https://toolnestr.com/           # expect HTTP/2 200
curl -s  -A "PerplexityBot"  https://toolnestr.com/robots.txt # expect OUR file, no ai-train=no
```

All three should return `200` and the served `robots.txt` should match
`public/robots.txt` (no Cloudflare `ai-train=no` block).

Then re-run the audit, or check Google Search Console + `pagespeed.web.dev` for
live rendering and Core Web Vitals (out of scope for a source-level audit).

## Our repo-side stance

`public/robots.txt` now explicitly **Allows** the AI search/retrieval crawlers
(`OAI-SearchBot`, `ChatGPT-User`, `PerplexityBot`, `Perplexity-User`,
`Google-Extended`, `Claude-SearchBot`, `Claude-User`, `Applebot-Extended`) and
leaves commented opt-out lines for the training crawlers (`GPTBot`, `CCBot`,
`ClaudeBot`) so the training decision stays explicit and easy to flip.
