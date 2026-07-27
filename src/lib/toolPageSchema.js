import { site } from '../data/site.js';
import { tools, categories } from '../data/tools.js';

/**
 * BreadcrumbList + WebPage schema for the flagship tool pages.
 *
 * The ~740 ordinary tool pages get this from ToolLayout. The flagship pages are
 * built directly on BaseLayout for their custom designs, and so were shipping
 * only FAQPage + HowTo — no breadcrumb markup and no WebPage/E-E-A-T signals, on
 * the site's highest-value pages. This is ToolLayout's exact schema, factored out
 * so those pages can emit it without giving up their layout.
 *
 * Category and title are looked up from `tools.js` by slug, so the breadcrumb can
 * never drift from the real category. Pass `title` to match the page's own H1
 * when it differs from the catalogue title.
 *
 * @param {string} slug        Tool slug, e.g. 'dropspot'.
 * @param {object} [opts]
 * @param {string} [opts.title]        Overrides the catalogue title.
 * @param {string} [opts.description]  Page meta description.
 * @param {string[]} [opts.speakable]  CSS selectors safe to read aloud.
 * @returns {object[]} Schema objects to spread into BaseLayout's `jsonLd` array.
 */
export function toolPageSchema(slug, { title, description, speakable } = {}) {
  const tool = tools.find((t) => t.slug === slug);
  // Fail the build rather than ship a breadcrumb pointing at the wrong category.
  if (!tool) throw new Error(`toolPageSchema: no tool with slug "${slug}" in tools.js`);
  const category = categories.find((c) => c.id === tool.category);
  if (!category) throw new Error(`toolPageSchema: unknown category "${tool.category}" for "${slug}"`);

  // The breadcrumb leaf always uses the short catalogue title, never the page's
  // long SEO <title>. Flagship titles run to "IP Address Tracker – Geolocation,
  // ISP, ASN & Map", which wrapped the visible trail onto three lines at 375px;
  // it also keeps these trails as short as the ~740 ToolLayout pages, which pass
  // short titles. WebPage.name still uses the page's own title.
  const breadcrumbLabel = tool.title;
  const pageName = title ?? tool.title;
  const pageUrl = `${site.url}/tools/${slug}/`;
  const team = site.editorialTeam;
  const reviewerPersons = (team?.reviewers ?? []).map((r) => ({
    '@type': 'Person',
    name: r.name,
    ...(r.jobTitle ? { jobTitle: r.jobTitle } : {}),
    ...(r.knowsAbout?.length ? { knowsAbout: r.knowsAbout } : {}),
    ...(r.sameAs?.length ? { sameAs: r.sameAs } : {}),
    ...(r.bioSlug ? { url: `${site.url}/about/team/${r.bioSlug}` } : {}),
  }));

  return [
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: site.url },
        { '@type': 'ListItem', position: 2, name: 'Tools', item: `${site.url}/tools/` },
        { '@type': 'ListItem', position: 3, name: category.name, item: `${site.url}/tools/${category.id}/` },
        { '@type': 'ListItem', position: 4, name: breadcrumbLabel, item: pageUrl },
      ],
    },
    {
      '@context': 'https://schema.org',
      '@type': 'WebPage',
      '@id': `${pageUrl}#webpage`,
      url: pageUrl,
      name: `${pageName} — ${site.name}`,
      ...(description ? { description } : {}),
      author: { '@id': `${site.url}/#organization` },
      isPartOf: { '@id': `${site.url}/#organization` },
      lastReviewed: site.lastReviewed,
      // Real credentialed reviewers when they exist, otherwise the named
      // editorial team — honest E-E-A-T, never fabricated individuals.
      reviewedBy: reviewerPersons.length
        ? reviewerPersons
        : {
            '@type': 'Organization',
            name: team?.name ?? site.name,
            ...(team?.description ? { description: team.description } : {}),
          },
      // Flagship pages have bespoke markup, so default to the H1 only rather than
      // ToolLayout's `.tool-intro`/`.faq-a` hooks, which do not exist here.
      speakable: {
        '@type': 'SpeakableSpecification',
        cssSelector: speakable ?? ['h1'],
      },
    },
  ];
}
