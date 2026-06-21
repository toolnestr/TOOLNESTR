# 08 — Backend & Admin Dashboard

You want a private backend where **you** can: see your site's analytics, turn any tool or
feature on/off, and manage the site. **Yes — this is fully doable, and it can stay free.**

## Can we do it? Yes. Here's the honest scope.

A backend adds real complexity (a login, a database, server code), but it fits cleanly on the
**same free Cloudflare platform** we're already using — no extra hosting bill. The only thing
that might cost money later is the optional PDF Office-conversion API (see
[07-pdf-suite.md](07-pdf-suite.md)).

## Architecture (all on Cloudflare's free tier)

```
Visitor ─▶ Astro static tool pages (fast, SEO)  ──┐
                                                  │ reads "is this tool on?"
                          Cloudflare KV (config) ◀┘   (feature flags, banners, ad on/off)
You (admin) ─▶ /admin  (password-protected)
                 │  toggles tools, reads stats, edits settings
                 ▼
        Cloudflare Pages Functions (serverless API)
                 │            │                 │
                 ▼            ▼                 ▼
         Cloudflare KV   Cloudflare D1     Analytics source
         (flags/config)  (SQLite DB:       (Cloudflare Web
                          messages, logs,   Analytics / Umami)
                          settings)
```

- **Cloudflare Pages** — hosts the static site (already chosen). Free.
- **Pages Functions** — serverless backend/API code (the `/admin` actions, feature-flag reads).
  Free tier ~100k requests/day. No separate server to manage.
- **Cloudflare KV** — instant key-value store for **feature flags** and small config (which
  tools are on/off, homepage banner text, "maintenance mode", ad slots on/off). Free tier is
  generous. Toggling is instant — **no site rebuild needed**.
- **Cloudflare D1** — a free SQLite database for things we want to store/query: contact-form
  messages, feedback, simple event counters, admin settings history.
- **Analytics** — we don't build a tracking system from scratch. We use a privacy-friendly
  analytics service and surface key numbers in the admin (see below).

## How "start/stop any tool" works (feature flags)
1. Every tool has a flag in KV, e.g. `tool:merge-pdf = on`.
2. The homepage tool-grid and each tool page check the flag.
   - If **off**, the tool is hidden from the grid and its page shows "🔧 This tool is
     temporarily unavailable" (page still exists, so SEO isn't lost).
3. In `/admin`, each tool has an on/off switch that writes the flag to KV. Change is live in
   seconds, no deploy.
4. Same pattern powers a **global kill switch** (maintenance mode) and **ad on/off** per page.

> SEO-safe detail: tool pages stay statically pre-rendered for Google; the on/off check is a
> tiny instant request at page load, so we keep top SEO scores AND instant toggling.

## The Admin Dashboard — features

### Must-have (what you asked for)
- 🔐 **Secure login** — protect `/admin` (Cloudflare Access or a password; Access is free & strong).
- 📊 **Analytics overview** — total visitors, pageviews, top tools, traffic by country, device,
  referrers, trend over time. (Data from our analytics provider's API, shown in your dashboard.)
- 🎚️ **Tools manager** — list every tool with: on/off toggle, "New"/"Beta" badge, reorder,
  edit title & description, edit category.
- 🚧 **Maintenance mode** — one switch to show a sitewide "back soon" notice.

### Recommended extras (I'd add these — all useful, low effort)
- 📣 **Announcement / banner manager** — show a message at the top of the site (e.g. "New tool!").
- 💰 **Ads control** — turn ad slots on/off per page or sitewide (handy before/after AdSense approval).
- 📨 **Contact/feedback inbox** — read messages submitted via the contact form (stored in D1).
- 📝 **SEO editor** — edit each tool's meta title/description without touching code.
- 🩺 **Health/usage counters** — simple per-tool "used N times today" counter (privacy-safe,
  no personal data) so you see which tools are popular even before search rankings build.
- 🗂️ **Tool request board** — visitors suggest tools; you review in admin (great for finding
  the next low-competition tool to build).

## Analytics — what to use
We need numbers in your dashboard without hurting privacy or page speed. Best options:

| Option | Cost | Dashboard | Notes |
|--------|------|-----------|-------|
| **Cloudflare Web Analytics** (recommended start) | Free | Cloudflare's own + we pull key stats | No cookies, no banner needed, privacy-friendly, zero speed cost |
| **Umami** (self-host on free tier) | Free | Its own + full API into our admin | Richer per-page data + clean API to embed in `/admin` |
| Plausible / Umami Cloud | Paid/limited free | Great | Easiest but may cost later |

**Recommendation:** start with **Cloudflare Web Analytics** (free, instant, no cookie banner).
If you later want deeper per-tool stats inside your own dashboard, add **Umami** and pull its
API into `/admin`. Either way, no impact on SEO/speed.

## Important trade-offs to know
- **More moving parts.** Static-only would be the simplest possible site; adding a backend means
  a login, a database, and server code to maintain. It's worth it for the control you want, and
  Cloudflare keeps it free — but it's more to build and test.
- **Build it at the right time.** We should **build the tools first** (so there's something to
  manage and analytics to see), then add the backend in its own phase. BUT we design the
  feature-flag check into the tool pages from early Phase 1, so toggling works the moment the
  backend lands. (Roadmap updated accordingly.)
- **Security.** Admin must be locked down (Cloudflare Access). We never store visitors' files or
  personal data — tools run in their browser; the backend only holds site config + your own data.

## Where this lands in the plan
- **Phase 1–2:** tools include the feature-flag check (off = "unavailable"), but flags default to
  "on" from a static config. No backend yet.
- **New Phase 2.5 / 3:** stand up Cloudflare KV + D1 + Functions, build `/admin` with login,
  tools manager, analytics overview, banner + ads control, contact inbox.
- **Later:** add usage counters, SEO editor, tool-request board, and (if we add Office PDF
  conversions) route those through the backend + a conversion API.
