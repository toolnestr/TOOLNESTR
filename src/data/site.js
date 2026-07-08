// ───────────────────────────────────────────────────────────────
// Your site's identity lives here. Change the name/tagline anytime —
// it updates everywhere on the site automatically.
// ───────────────────────────────────────────────────────────────
export const site = {
  name: 'ToolNestr',
  tagline: 'Free, fast & private online tools',
  // Kept to ~155 chars — Google/Bing truncate meta descriptions past ~160.
  description:
    'Free online calculators, converters, text, image and PDF tools. ' +
    'Fast, private, no sign-up — everything runs right in your browser.',
  url: 'https://toolnestr.com',
  // Change this to a real inbox you can check (used on the Contact + Privacy pages).
  email: 'hello@toolnestr.com',
  // Real launch date (first commit), used in Organization schema — keep accurate.
  foundingDate: '2026-06-21',
  // Brand logo used in Organization schema (absolute URL is built in BaseLayout).
  logo: '/og-image.png',
  // Social / brand profiles for the Organization schema `sameAs`. This strengthens
  // entity recognition in Google and AI search engines. Add REAL URLs as you create
  // them, e.g. 'https://x.com/toolnestr', 'https://github.com/toolnestr',
  // 'https://www.linkedin.com/company/toolnestr'. Empty is fine — sameAs is only
  // emitted when this array has entries, so no broken/placeholder links ship.
  sameAs: [],
};
