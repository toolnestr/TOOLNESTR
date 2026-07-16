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
  // TODO(E-E-A-T): create these profiles and paste the REAL URLs here — a quick,
  // high-value entity-trust win. Do NOT add placeholder/fake links.
  sameAs: [],

  // Honest, site-wide "last audited" date. Used for the review byline and the
  // About Article dateModified INSTEAD of build-time new Date(), which silently
  // re-dated every page on each rebuild (a fake-freshness signal). Bump this
  // only when you actually re-audit the tools. Pages may override via ToolLayout's
  // `reviewed` prop.
  lastReviewed: '2026-07-16',

  // Editorial / review identity for E-E-A-T. Reviews are attributed to a named
  // editorial team (an honest organizational sub-entity), not anonymous "Team".
  // As you bring on REAL named experts with REAL credentials, add them to
  // `reviewers` — each becomes a Person in the schema and can get a
  // /about/team/<bioSlug> page. NEVER invent fabricated humans or credentials.
  editorialTeam: {
    name: 'ToolNestr Editorial Team',
    description:
      'Tools and their formulas are built and checked against published standards and primary sources before release, and re-audited on a schedule.',
    // Shape: { name, jobTitle, knowsAbout: [], sameAs: [], bioSlug }
    reviewers: [],
  },
};
