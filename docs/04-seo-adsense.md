# 04 — SEO (90%+) & AdSense Plan

Two goals: (1) score **90%+ on SEO/Lighthouse**, (2) get **AdSense approved**, then earn.

## Part 1 — How we hit 90%+ SEO score

Lighthouse SEO + performance is mostly a checklist. With Astro most of it is automatic; the
rest we bake into the shared layout once so **every** tool page passes.

### On every page (built into ToolLayout once)
- [ ] Unique `<title>` (50–60 chars) with the main keyword.
- [ ] Unique meta description (140–160 chars).
- [ ] One `<h1>` matching the tool's main keyword.
- [ ] Canonical URL tag.
- [ ] Open Graph + Twitter card tags (nice social previews).
- [ ] JSON-LD structured data: `SoftwareApplication` + a `FAQPage` for the Q&A section.
- [ ] `lang="en"`, proper viewport meta (mobile), readable font sizes, tap targets.
- [ ] Fast: near-zero JS (Astro), compressed images, system/lazy fonts.

### Sitewide
- [ ] `sitemap.xml` (Astro sitemap integration) + reference it in `robots.txt`.
- [ ] `robots.txt` allowing crawl.
- [ ] HTTPS (free via Cloudflare).
- [ ] Clean URLs: `/tools/<tool-name>`.
- [ ] Internal links: homepage → every tool; each tool → 3–4 related tools.
- [ ] Breadcrumbs (Home › Tools › Word Counter) with breadcrumb structured data.
- [ ] Submit sitemap to **Google Search Console** (we do this in Phase 1).

### Per-tool content recipe (this is what actually ranks)
Each tool page is **not** just the tool. It also has, below the tool:
1. A 100–200 word intro explaining what it does and who it's for (keyword-rich, natural).
2. "How to use" steps (3–5 bullets).
3. A short FAQ (3–5 Q&As) → also powers the FAQ structured data.
4. "Related tools" links.

This turns a thin tool page into a genuinely useful, rankable page (and AdSense-friendly).

## Part 2 — Keyword research (free, repeatable)

Before building each tool, we pick its target keywords:
1. Type the tool idea into **Google** → read autocomplete + "People also ask" + "Related
   searches" at the bottom. These are real queries = free keyword goldmine.
2. Use **Google Keyword Planner** (free) and **Google Trends** to sanity-check volume/interest.
3. Optionally **Ahrefs free keyword generator** / **Backlinko free tool** for difficulty.
4. Pick: 1 main keyword (the URL + H1 + title) + 3–5 long-tail variants (used in headings,
   FAQ, and intro text).

We'll record chosen keywords per tool in each tool page's plan as we build.

## Part 3 — AdSense approval plan

### Requirements we must satisfy (2026)
- [ ] ~20–30 quality pages (our tools + a few guide articles cover this).
- [ ] **About**, **Privacy Policy**, **Contact** pages (Privacy Policy is mandatory).
- [ ] HTTPS (have it via Cloudflare).
- [ ] Mobile-friendly (Astro + our design).
- [ ] Original, useful content (our tools + original write-ups, not copied).
- [ ] Clean navigation, working links, no broken pages.
- [ ] Custom domain (you're buying one — better than a subdomain for trust).
- [ ] Site age helps but isn't required; we'll likely apply 3–6 weeks after launch.

### When we apply (Phase 3)
Apply once we have **~15+ finished tool pages** + the 3 trust pages + 2–3 guide articles,
and Search Console shows Google has indexed the site.

### After approval
- Add `ads.txt` to `public/`.
- Place **2–3 ad units max** per page (top of content, mid-content, sidebar/footer) — never
  on top of the tool's buttons, never so many it hurts speed or usability.
- Keep Core Web Vitals green: use AdSense lazy-loading so ads don't tank our SEO scores.

### Trust pages content (we'll generate these in Phase 2)
- **Privacy Policy:** state that tools run in-browser, what little data we collect
  (analytics + AdSense cookies), and link Google's policies. (We'll use a standard,
  compliant template — not legal advice.)
- **About:** who we are, why the site exists.
- **Contact:** an email or simple form.

## Part 4 — Growth after launch (to reach 50k/mo)
- Add tools steadily (more pages = more entry points from Google).
- Write 1 short guide article per week tied to a tool ("How to count words in an essay", etc.).
- Share launches of viral-friendly tools (fancy text, decision wheel) on Reddit/forums/Pinterest.
- Build internal links between related tools.
- Track everything in **Google Search Console** + a privacy-light analytics tool (e.g.
  Cloudflare Web Analytics — free, no cookie banner needed).
