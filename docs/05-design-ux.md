# 05 — Design & UX (beautiful + mobile-first)

The site must look modern and clean, work perfectly on phones, and feel fast. Here are the
rules Claude will follow when building every page so the whole site looks consistent.

## Principles
1. **Mobile-first.** Most visitors are on phones. Design for a 360px-wide screen first, then
   let it grow on desktop.
2. **One clear job per page.** The tool is the hero — visible immediately, no scrolling needed
   to start using it on mobile.
3. **Fast and calm.** Lots of whitespace, no clutter, no popups, no autoplay.
4. **Consistent.** Same header, footer, spacing, and button style on every tool.
5. **Accessible.** Good color contrast, labels on inputs, big tap targets (min 44px), keyboard
   usable.

## Visual style
- **Look:** clean, rounded cards, soft shadows, a single accent color, generous spacing.
- **Light + dark mode** toggle (dark mode is expected in 2026 and helps dev-tool users).
- **Typography:** a system font stack (fast, no font download) or one Google font loaded
  efficiently. Large, readable body text (16–18px).
- **Color:** neutral background (white / near-black), one brand accent (e.g. indigo or teal)
  for buttons and links. Decide the exact palette in Phase 1.
- **Icons:** simple line icons (one small icon set) per tool category.

## Page layouts

### Homepage
- Top: site name/logo + short tagline ("Free, fast, private online tools").
- A search box to filter tools by name.
- Category tabs/sections: **Everyday · Creators · Developers**.
- A responsive **grid of tool cards** (1 column on mobile, 2–3 on tablet/desktop). Each card:
  icon + tool name + one-line description.
- Footer: links to About / Privacy / Contact + categories.

### Tool page
```
[ Header: logo + nav + dark-mode toggle ]
[ Breadcrumb: Home › Tools › Word Counter ]
[ H1: Word & Character Counter ]
[ THE TOOL — input + live result, big and obvious ]
[ (later) ad slot — unobtrusive ]
[ Short intro paragraph (keyword-rich) ]
[ How to use — 3–5 steps ]
[ FAQ — 3–5 Q&As ]
[ Related tools — 3–4 cards ]
[ Footer ]
```

### Trust pages (About/Privacy/Contact)
- Simple single-column readable text. Same header/footer.

## Tool UX details that matter
- **Instant feedback:** results update live as the user types/changes inputs.
- **Copy button** on any output (text, code, color, password) with a "Copied!" confirmation.
- **Sensible defaults** so the tool shows a useful result before the user does anything.
- **Clear/reset** button.
- **No sign-up, no limits, no "data sent anywhere"** — and we say so (privacy is a selling
  point and builds trust).
- **Shareable:** each tool has a clear URL; creator tools get a "copy result" / share button.

## Performance rules (protect the SEO score)
- No heavy libraries. Vanilla JS for tool logic; only pull a tiny library if truly needed
  (e.g. a small QR-code generator).
- Images: SVG icons; compress any raster images; set width/height to avoid layout shift.
- Defer/lazy-load anything non-essential (and later, ads).
- Keep each tool's JavaScript scoped to its own page (Astro does this naturally).

## Branding (decide in Phase 1)
- **Site name + domain:** short, brandable, hints at "tools" (e.g. something + "tools"/"kit").
  We'll brainstorm 5–10 options and check domain availability.
- **Logo:** simple wordmark + a small icon; we can make an SVG quickly.
- **Favicon:** generated from the logo.
