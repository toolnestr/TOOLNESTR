#!/usr/bin/env node
// Submit URLs to IndexNow (Bing, Yandex, etc. share the feed).
//
// Usage:
//   node scripts/indexnow-submit.mjs                 # submit every URL in the live sitemap
//   node scripts/indexnow-submit.mjs <url> [url...]  # submit specific URLs
//   node scripts/indexnow-submit.mjs --auto          # build hook: runs ONLY on a
//                                                    # Cloudflare production deploy,
//                                                    # reads the freshly-built local
//                                                    # sitemap, and never fails the build
//
// Requires Node 18+ (global fetch). No dependencies.

import { readFileSync, existsSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const HOST = 'toolnestr.com';
const KEY = 'c39ae86e80057550534d776d34c8e7e2';
const KEY_LOCATION = `https://${HOST}/${KEY}.txt`;
const SITEMAP_INDEX = `https://${HOST}/sitemap-index.xml`;
const ENDPOINT = 'https://api.indexnow.org/indexnow';
const DIST = 'dist';

const args = process.argv.slice(2);
const AUTO = args.includes('--auto');
const urlArgs = args.filter((a) => !a.startsWith('--'));

const locs = (xml) => [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1].trim());

// In --auto mode, only submit on a genuine Cloudflare *production* deploy, so that
// local `npm run build` (and preview branches) never spam IndexNow. Cloudflare Pages
// sets CF_PAGES=1 and CF_PAGES_BRANCH; the production branch here is `main`.
function shouldAutoRun() {
  if (!process.env.CF_PAGES) { console.log('[indexnow] skip: not a Cloudflare Pages build.'); return false; }
  const branch = process.env.CF_PAGES_BRANCH || '';
  if (branch && branch !== 'main') { console.log(`[indexnow] skip: branch "${branch}" is not production.`); return false; }
  return true;
}

// Read the freshly-built sitemap from dist/ (auto mode) so we submit exactly what is
// being deployed. Falls back to fetching the live sitemap.
function readLocalSitemapUrls() {
  if (!existsSync(DIST)) return null;
  const files = readdirSync(DIST).filter((f) => /^sitemap.*\.xml$/.test(f));
  if (!files.length) return null;
  const urls = new Set();
  for (const f of files) {
    for (const u of locs(readFileSync(join(DIST, f), 'utf8'))) {
      if (!u.endsWith('.xml')) urls.add(u);
    }
  }
  return urls.size ? [...urls] : null;
}

async function fetchLiveSitemapUrls() {
  const idx = await (await fetch(SITEMAP_INDEX)).text();
  const children = locs(idx).filter((u) => u.endsWith('.xml'));
  const sources = children.length ? children : [SITEMAP_INDEX];
  const urls = new Set();
  for (const sm of sources) {
    for (const u of locs(await (await fetch(sm)).text())) if (!u.endsWith('.xml')) urls.add(u);
  }
  return [...urls];
}

async function submit(urlList) {
  let ok = true;
  for (let i = 0; i < urlList.length; i += 10000) {
    const batch = urlList.slice(i, i + 10000);
    const res = await fetch(ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
      body: JSON.stringify({ host: HOST, key: KEY, keyLocation: KEY_LOCATION, urlList: batch }),
    });
    console.log(`[indexnow] submitted ${batch.length} URLs → HTTP ${res.status} ${res.statusText}`);
    if (res.status >= 400) { ok = false; console.log('[indexnow] ' + (await res.text()).slice(0, 300)); }
  }
  return ok;
}

async function main() {
  if (AUTO && !shouldAutoRun()) return;

  let urls;
  if (urlArgs.length) urls = urlArgs;
  else if (AUTO) urls = readLocalSitemapUrls() || (await fetchLiveSitemapUrls());
  else urls = await fetchLiveSitemapUrls();

  if (!urls || !urls.length) { console.log('[indexnow] no URLs to submit.'); return; }
  console.log(`[indexnow] submitting ${urls.length} URL(s) as ${HOST}…`);
  await submit(urls);
  console.log('[indexnow] done.');
}

// Never fail the build: swallow any error in --auto mode.
main().catch((e) => {
  console.log('[indexnow] error: ' + (e?.message || e));
  if (!AUTO) process.exitCode = 1;
});
