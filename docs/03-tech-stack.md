# 03 — Tech Stack (beginner friendly)

You don't need to code. This explains *what* we use and *why*, in plain terms. Claude writes
every file; you copy-paste and run a couple of commands.

## What we're building with

| Layer | Choice | Why (plain English) |
|-------|--------|---------------------|
| Site engine | **Astro** | Builds super-fast pages that send almost **no JavaScript** to the browser → Lighthouse SEO 95–100. Perfect for tool pages. |
| Styling | **Tailwind CSS** | Lets us make a clean, modern, mobile-first look quickly and consistently. |
| Tool logic | **Plain JavaScript** (tiny bits) | Each tool's "do the thing" code runs in the visitor's browser. No server needed. |
| Hosting | **Cloudflare Pages** (free) | Free, fast worldwide, free HTTPS, auto-deploy. |
| Backend | **Cloudflare Functions + KV + D1** (free) | Serverless API, feature-flag store, and database for the admin dashboard — same platform, no extra bill. See [08-backend-admin.md](08-backend-admin.md). |
| PDF/Image work | `pdf-lib`, `pdf.js`, `jsPDF`, browser canvas | Small libraries that do PDF/image tasks **in the browser** — files never upload. See [07-pdf-suite.md](07-pdf-suite.md). |
| Domain | **You buy one** (~$10/yr) | e.g. Namecheap/Cloudflare. Better AdSense trust + branding. |
| Code storage | **GitHub** (free) | Holds your code; Cloudflare auto-publishes when it changes. |

## Why Astro (the key decision)

Google ranks fast, mobile pages higher (Core Web Vitals). Astro ships near-zero JavaScript,
so pages load almost instantly and score 95–100 on Lighthouse with little effort. A typical
React/Next.js page ships much more code and scores lower without extra work. For a content +
tools site, **Astro is the clear winner for SEO** — which is exactly your goal.

Astro also lets us write the header, footer, and tool layout **once** and reuse it on all 30
pages. Without that, you'd copy-paste the same HTML 30 times and updates would be painful.

## What you'll install (one time)

1. **Node.js** (LTS version) — the toolbox Astro runs on.
2. **A code editor** — VS Code (free).
3. **Git** — to save code to GitHub.

Claude will give you the exact download links and the 3–4 commands to run. If anything errors,
paste the error to Claude and we fix it. (Fallback exists: if the Node setup ever blocks you,
we can switch to plain HTML files — uglier to maintain but zero build tools. We'll only do
that if needed.)

## Folder structure (what it'll look like)

```
micro-tools/
├── src/
│   ├── layouts/
│   │   └── ToolLayout.astro      # shared page shell (header, footer, SEO tags, ad slots)
│   ├── components/
│   │   ├── Header.astro
│   │   ├── Footer.astro
│   │   └── ToolCard.astro        # the box shown on the homepage grid
│   ├── pages/
│   │   ├── index.astro           # homepage (grid of all tools)
│   │   ├── about.astro
│   │   ├── privacy.astro
│   │   ├── contact.astro
│   │   └── tools/
│   │       ├── word-counter.astro
│   │       ├── case-converter.astro
│   │       └── ...               # one file per tool
│   └── data/
│       └── tools.js              # the master list of tools (title, desc, url, icon)
├── public/
│   ├── robots.txt
│   ├── favicon.svg
│   └── ads.txt                   # added when AdSense is approved
├── astro.config.mjs
└── package.json
```

## Key technical-SEO features we get "for free" or add once

- **Static HTML** for every tool → Google reads it instantly.
- **Auto sitemap.xml** (Astro sitemap integration) → tells Google all our pages.
- **One layout** with proper `<title>`, meta description, canonical, Open Graph, and
  **JSON-LD structured data** (`SoftwareApplication` / `FAQPage`) per tool.
- **robots.txt** + clean URLs like `/tools/word-counter`.
- **Lazy/zero JS** so mobile scores stay high.

## The "non-coder" workflow each time we add a tool

1. Claude gives you a new file's full contents.
2. You create the file in VS Code and paste it.
3. You run `npm run dev` to preview it locally in your browser.
4. Looks good → you run 2 git commands → it goes live automatically.

That's the whole loop. We'll script/alias it so it's basically copy-paste.
