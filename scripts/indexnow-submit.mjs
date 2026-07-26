#!/usr/bin/env node
// Submit every URL in the live sitemap to IndexNow (Bing, Yandex, etc.).
//
// Usage:
//   node scripts/indexnow-submit.mjs                 # submit all sitemap URLs
//   node scripts/indexnow-submit.mjs https://toolnestr.com/tools/bmi-calculator/   # submit one or more specific URLs
//
// Requires Node 18+ (global fetch). No dependencies.

const HOST = 'toolnestr.com';
const KEY = 'c39ae86e80057550534d776d34c8e7e2';
const KEY_LOCATION = `https://${HOST}/${KEY}.txt`;
const SITEMAP_INDEX = `https://${HOST}/sitemap-index.xml`;
const ENDPOINT = 'https://api.indexnow.org/indexnow';

const locs = (xml) => [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1].trim());

async function collectSitemapUrls() {
  const idx = await (await fetch(SITEMAP_INDEX)).text();
  const children = locs(idx).filter((u) => u.endsWith('.xml'));
  const sources = children.length ? children : [SITEMAP_INDEX];
  const urls = new Set();
  for (const sm of sources) {
    const body = await (await fetch(sm)).text();
    for (const u of locs(body)) if (!u.endsWith('.xml')) urls.add(u);
  }
  return [...urls];
}

async function submit(urlList) {
  // IndexNow accepts up to 10,000 URLs per request.
  for (let i = 0; i < urlList.length; i += 10000) {
    const batch = urlList.slice(i, i + 10000);
    const res = await fetch(ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
      body: JSON.stringify({ host: HOST, key: KEY, keyLocation: KEY_LOCATION, urlList: batch }),
    });
    // 200 = accepted, 202 = accepted (pending). Anything else is a problem.
    console.log(`Submitted ${batch.length} URLs → HTTP ${res.status} ${res.statusText}`);
    if (res.status >= 400) console.log(await res.text());
  }
}

const args = process.argv.slice(2);
const urls = args.length ? args : await collectSitemapUrls();
console.log(`Submitting ${urls.length} URL(s) to IndexNow as ${HOST}…`);
await submit(urls);
console.log('Done.');
