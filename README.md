# Micro Tools Website — Master Plan

A free online micro-tools website (30 tools) built for **SEO, AdSense, and 50k+ monthly users**.
Everything is planned first, then built step by step. You don't need to know how to code —
Claude writes the code, you copy-paste, run the commands, and deploy.

## The goal (what "done" looks like)

| Goal | Target |
|------|--------|
| Number of tools | 30 (launch with 8–10, add the rest in phases) |
| Monthly visitors | 50,000+ within ~6–12 months |
| Lighthouse SEO score | 90%+ (Astro gets us 95–100) |
| Mobile friendly | Yes — mobile-first design |
| AdSense | Approved after Phase 3, then ads added |
| Monthly cost | ~$10–15/year domain + $0 hosting |

## How this works

We move in **phases**. Nothing is built all at once. Each phase has a checklist.
When you finish a phase, we move to the next.

1. **Read the docs in order** (below).
2. When you're ready to build, tell Claude: *"start Phase 1"*.
3. Claude gives you exact commands + code to paste. You run them.
4. We test, then deploy, then repeat.

## Read these in order

| # | File | What it covers |
|---|------|----------------|
| 1 | [docs/01-market-research.md](docs/01-market-research.md) | Why this works, real traffic data, the strategy |
| 2 | [docs/02-tool-list.md](docs/02-tool-list.md) | The 30 tools, competition & demand notes, build order |
| 3 | [docs/03-tech-stack.md](docs/03-tech-stack.md) | What we build with (Astro) and why — beginner friendly |
| 4 | [docs/04-seo-adsense.md](docs/04-seo-adsense.md) | How we hit 90%+ SEO and get AdSense approved |
| 5 | [docs/05-design-ux.md](docs/05-design-ux.md) | Beautiful, fast, mobile-first design rules |
| 6 | [docs/06-roadmap.md](docs/06-roadmap.md) | The step-by-step phase plan (do this) |
| 7 | [docs/07-pdf-suite.md](docs/07-pdf-suite.md) | Full iLovePDF-style PDF tools + what's buildable |
| 8 | [docs/08-backend-admin.md](docs/08-backend-admin.md) | Your private backend: analytics + tool on/off |
| 9 | [docs/09-global-tools.md](docs/09-global-tools.md) | Making every tool work in any country |

## Decisions already made

- **Audience:** mix of everyday users/students, content creators, and developers.
- **Tech:** Astro + Tailwind CSS (static site, near-zero JavaScript = top SEO scores).
- **Hosting:** Cloudflare Pages (free) + a custom domain you buy (~$10/yr).
- **Backend:** Cloudflare Pages Functions + KV + D1 (free) for a private admin dashboard —
  analytics + turn any tool/feature on/off. See [docs/08-backend-admin.md](docs/08-backend-admin.md).
- **PDF suite:** ~22 iLovePDF-style tools run fully in-browser; Office-format conversions
  (Word/Excel/PPT) deferred (need a server/paid API). See [docs/07-pdf-suite.md](docs/07-pdf-suite.md).
- **Global-first:** every tool works in any country (currency picker, user-entered rates,
  metric/imperial). See [docs/09-global-tools.md](docs/09-global-tools.md).
- **AI tools:** removed for now; revisit later only if needed.
- **Skill level:** no coding required — guided copy-paste, every command explained.

## Status

- [x] Market research done
- [x] Plan + docs written
- [x] Phase 0: project running locally (Astro + Tailwind, builds clean)
- [x] Phase 1 core: site skeleton + first 3 tools
  - [x] Shared layout, header, footer, tools data, homepage (search + grid)
  - [x] Tool 1/3: Word Counter (live)
  - [x] Tool 2/3: Case Converter (live)
  - [x] Tool 3/3: JSON Formatter (live)
  - [ ] Dark-mode toggle + final polish
  - [ ] Pick final brand name + buy domain (later) + deploy
- [ ] Phase 2: more tools + first PDF tools + trust pages — **in progress**
  - [x] Age Calculator, Date Difference, Discount Calculator (currency picker), Fancy Text
  - [x] Reusable ToolLayout (auto breadcrumb + FAQ + structured data)
  - [x] PDF tools: Merge, JPG→PDF, Split, PDF→JPG (pdf-lib + pdf.js, all in-browser)
  - [x] Dev tools: Base64, QR Code, Password Generator — **14 tools live**
  - [x] Trust pages: About / Privacy (with ad disclosure) / Contact
  - [x] +6 tools (Percentage, Tip, Roman, Color, Hashtag, Emoji) — 20 tools
  - [x] +6 tools (Unit, Tax/GST, EMI, Number Base, Timestamp, Text Repeater) — **26 tools, 30 pages**
  - [x] **DEPLOYED LIVE → https://testtool-8zf.pages.dev** (Cloudflare Pages, auto-deploy on push)
  - [ ] Search Console + custom domain + real email + dark mode
- [ ] Phase 2.5: backend + admin dashboard
- [ ] Phase 3: AdSense application
- [ ] Phase 4: remaining tools + growth
