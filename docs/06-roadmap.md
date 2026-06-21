# 06 — Roadmap (the step-by-step build plan)

This is the "what we actually do" file. We go phase by phase. **Don't build everything at
once.** Finish a phase, check the boxes, then start the next. When you're ready, tell Claude
e.g. *"start Phase 1"* and Claude gives you exact commands + code to paste.

---

## Phase 0 — Setup & branding (½ day)
Goal: a working local project and a domain.

- [ ] Brainstorm 5–10 site names; pick one and **buy the domain** (~$10/yr, Namecheap/Cloudflare).
- [ ] Install **Node.js (LTS)**, **VS Code**, **Git** (Claude gives links + checks versions).
- [ ] Create a free **GitHub** account and a free **Cloudflare** account.
- [ ] Claude scaffolds the Astro project; you run `npm install` and `npm run dev` and see a
      blank site at `localhost:4321`.

**Exit check:** the starter site opens in your browser locally.

---

## Phase 1 — Skeleton + first 3 tools (2–3 days)
Goal: real site shape + prove the full pipeline (build → preview → deploy → live on your domain).

- [ ] Decide color palette + site name/logo + favicon.
- [ ] Build shared **Header, Footer, ToolLayout** (with SEO meta + structured data baked in).
- [ ] Build the **homepage** (tool grid + search + categories) using `data/tools.js`.
- [ ] Build 3 tools: **Word Counter**, **Case Converter**, **JSON Formatter** (full pages:
      tool + intro + how-to + FAQ + related).
- [ ] Add `robots.txt` + sitemap integration.
- [ ] Connect GitHub → **Cloudflare Pages** → point your domain → site is **live on HTTPS**.
- [ ] Add site to **Google Search Console** and submit the sitemap.
- [ ] Run Lighthouse → confirm **SEO 90%+** (fix anything flagged).

**Exit check:** 3 tools live on your real domain, SEO score 90%+, Google can see the sitemap.

---

**Note added:** from Phase 1, every tool page includes a **feature-flag check** (reads a
config; "off" → "temporarily unavailable"). Flags default to "on" from static config until the
backend lands in Phase 2.5 — this is what later lets you start/stop tools instantly.

---

## Phase 2 — More tools + trust pages + content (3–5 days)
Goal: enough pages and trust signals to prepare for AdSense.

- [ ] Build tools: **Age Calculator, Date Difference, Discount Calculator, Fancy Text Generator**.
- [ ] Build first **PDF tools**: **Merge PDF, JPG→PDF, PDF→JPG** (all in-browser).
- [ ] Write **About, Privacy Policy, Contact** pages.
- [ ] Add **dark-mode toggle** and polish mobile layout.
- [ ] Write 2–3 short **guide articles** linked to tools (for content depth).
- [ ] Add light analytics (Cloudflare Web Analytics — free).
- [ ] Internal-link all tools to each other (related tools sections).

**Exit check:** ~11 tools (incl. 3 PDF) + 3 trust pages + 2–3 articles live; everything mobile-clean.

---

## Phase 2.5 — Backend & Admin Dashboard (3–6 days)
Goal: your private control room. See [08-backend-admin.md](08-backend-admin.md).

- [ ] Set up **Cloudflare KV** (feature flags) + **D1** (database) + **Pages Functions** (API).
- [ ] Build secure **/admin** login (Cloudflare Access — free).
- [ ] **Tools manager:** on/off toggle per tool, reorder, edit title/description, New/Beta badge.
- [ ] **Analytics overview:** pull key stats (visitors, top tools, countries) into the dashboard.
- [ ] **Maintenance mode**, **announcement banner**, **ads on/off** controls.
- [ ] **Contact/feedback inbox** (messages stored in D1).
- [ ] Wire all tool pages to read live flags from KV.

**Exit check:** you can log in to /admin, see analytics, and switch any tool on/off instantly.

---

## Phase 3 — Scale to ~15 tools + apply for AdSense (1–2 weeks)
Goal: cross the AdSense threshold and apply.

- [ ] Build tools: **GST/Tax, Tip, Loan/EMI, IG Bio, Hashtag, Base64, URL Encoder, QR Code**.
- [ ] Re-check SEO on every page; confirm all indexed in Search Console.
- [ ] Final pre-AdSense audit (trust pages, no broken links, original content, mobile).
- [ ] **Apply for Google AdSense.**
- [ ] While waiting: keep adding tools + articles, share a few tools on Reddit/Pinterest.

**Exit check:** 15+ tools live, AdSense application submitted.

---

## Phase 4 — Finish all 30 + monetize + grow (ongoing)
Goal: complete the toolset, turn on ads, push toward 50k/mo.

- [ ] Build the remaining everyday/creator/dev tools (Percentage, Unit Converter, Fuel Cost,
      Decision Wheel, Caption Gen, YouTube Tags, Engagement Rate, YouTube Money, Char Counter,
      Emoji Picker, UUID, Hash, Color Converter, Password Gen, Timestamp) + Batch 2 winners.
- [ ] Build the rest of the **in-browser PDF suite** (Split, Compress, Organize, Watermark,
      Page Numbers, Rotate, Crop, Sign, Protect/Unlock, OCR, etc. — see 07-pdf-suite.md).
- [ ] **Decide on Office PDF conversions** (Word/Excel/PPT): skip, or add a paid conversion API
      routed through the backend, based on demand + ad revenue.
- [ ] Once AdSense approved: add `ads.txt`, place 2–3 lazy-loaded ad units per page.
- [ ] Add programmatic long-tail pages for the best performers (e.g. discount %, GST per
      country, hex-to-rgb variants).
- [ ] Publish 1 guide article/week; build backlinks; monitor Search Console for winners and
      double down on those categories.
- [ ] Optional: add the "expansion bench" tools (image compressor, etc.) where demand shows.

**Exit check:** 30 tools live, ads earning, traffic climbing month over month.

---

## How we work each session
1. You tell Claude which phase/step we're on.
2. Claude gives **exact commands** and **full file contents** to paste — explained simply.
3. You run/preview locally, then deploy.
4. Paste any error to Claude; we fix and continue.

## Definition of done (project)
- 30 working, mobile-friendly tools on your domain.
- 90%+ SEO score across pages.
- AdSense approved and ads live.
- Traffic trending toward 50k/month with a repeatable add-tool + add-article growth loop.
