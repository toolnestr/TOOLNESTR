#!/usr/bin/env node
import { writeFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { categories, tools } from '../src/data/tools.js';
import { site } from '../src/data/site.js';

const BASE_URL = site.url || 'https://toolnestr.com';
const SITEMAPS_DIR = 'public/sitemaps';

mkdirSync(SITEMAPS_DIR, { recursive: true });

const liveTools = tools.filter((t) => t.enabled && t.status === 'live');

function buildUrlSet(urls) {
  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
  xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';
  for (const item of urls) {
    xml += '  <url>\n';
    xml += `    <loc>${item.loc}</loc>\n`;
    if (item.priority) xml += `    <priority>${item.priority}</priority>\n`;
    if (item.changefreq) xml += `    <changefreq>${item.changefreq}</changefreq>\n`;
    xml += '  </url>\n';
  }
  xml += '</urlset>\n';
  return xml;
}

const sitemapEntries = [];

// 1. Generate Main Sitemap (Core pages)
const mainUrls = [
  { loc: `${BASE_URL}/`, priority: '1.0', changefreq: 'daily' },
  { loc: `${BASE_URL}/tools/all/`, priority: '0.9', changefreq: 'daily' },
  { loc: `${BASE_URL}/about/`, priority: '0.6', changefreq: 'monthly' },
  { loc: `${BASE_URL}/privacy/`, priority: '0.3', changefreq: 'yearly' },
  { loc: `${BASE_URL}/contact/`, priority: '0.5', changefreq: 'monthly' },
];

const mainXml = buildUrlSet(mainUrls);
writeFileSync(join(SITEMAPS_DIR, 'sitemap-main.xml'), mainXml, 'utf8');
sitemapEntries.push(`${BASE_URL}/sitemaps/sitemap-main.xml`);
console.log(`[sitemap] Generated sitemap-main.xml with ${mainUrls.length} URLs`);

// 2. Generate per-category sitemaps
for (const cat of categories) {
  const catTools = liveTools.filter((t) => t.category === cat.id);
  if (catTools.length === 0) continue;

  const catUrls = [
    { loc: `${BASE_URL}/tools/${cat.id}/`, priority: '0.8', changefreq: 'weekly' },
  ];

  for (const t of catTools) {
    catUrls.push({
      loc: `${BASE_URL}/tools/${t.slug}/`,
      priority: '0.7',
      changefreq: 'monthly',
    });
  }

  const catXml = buildUrlSet(catUrls);
  const fileName = `sitemap-${cat.id}.xml`;
  writeFileSync(join(SITEMAPS_DIR, fileName), catXml, 'utf8');
  sitemapEntries.push(`${BASE_URL}/sitemaps/${fileName}`);
  console.log(`[sitemap] Generated ${fileName} (${cat.name}): ${catUrls.length} URLs`);
}

// 3. Generate Master Category Sitemap Index
let indexXml = '<?xml version="1.0" encoding="UTF-8"?>\n';
indexXml += '<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';
for (const sm of sitemapEntries) {
  indexXml += '  <sitemap>\n';
  indexXml += `    <loc>${sm}</loc>\n`;
  indexXml += '  </sitemap>\n';
}
indexXml += '</sitemapindex>\n';

writeFileSync(join(SITEMAPS_DIR, 'sitemap-categories-index.xml'), indexXml, 'utf8');
console.log(`[sitemap] Generated sitemap-categories-index.xml with ${sitemapEntries.length} sitemaps!`);
