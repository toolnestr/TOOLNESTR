// Precise detector for the square-footage-class disaster: a tool that LOADS with
// its input fields hidden (user opens it, can't use it) OR throws a JS error on
// load. For every live tool, load with NO interaction and count total vs visible
// form controls. PARALLEL (worker pool) + retry-once on nav timeout => fast AND
// reliable. Run: node verify-loadstate.cjs [BASE_URL] [concurrency]
const { chromium } = require('playwright');
const path = require('path');
const { tools } = require(path.join(__dirname, '../../src/data/tools.js'));
const BASE = process.argv[2] || 'https://toolnestr.com';
const CONC = parseInt(process.argv[3] || '6', 10);
const live = tools.filter(t => t.enabled && t.status === 'live');

async function checkOne(context, t) {
  for (let attempt = 1; attempt <= 2; attempt++) {
    const page = await context.newPage();
    const errs = [];
    page.on('pageerror', e => errs.push(e.message.slice(0, 70)));
    try {
      await page.goto(`${BASE}/tools/${t.slug}`, { waitUntil: 'domcontentloaded', timeout: 20000 });
      await page.waitForTimeout(450);
      const c = await page.evaluate(() => {
        const all = [...document.querySelectorAll('main input, main select, main textarea')].filter(e => e.type !== 'hidden');
        const vis = all.filter(e => e.offsetParent !== null || (e.getClientRects && e.getClientRects().length > 0));
        return { total: all.length, visible: vis.length };
      });
      await page.close();
      if (errs.length) return `[PAGEERR] ${t.slug} (${t.category}) :: ${errs.join('; ')}`;
      if (c.total > 0 && c.visible === 0) return `[INPUTS-HIDDEN-ON-LOAD] ${t.slug} (${t.category}) :: ${c.total} inputs, 0 visible`;
      return null;
    } catch (e) {
      await page.close().catch(() => {});
      if (attempt === 2) return `[ERROR] ${t.slug} (${t.category}) :: ${e.message.slice(0, 55)}`;
      await new Promise(r => setTimeout(r, 800)); // brief backoff then retry
    }
  }
}

(async () => {
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  const context = await browser.newContext();
  const flags = [];
  let idx = 0, done = 0;
  async function worker() {
    while (idx < live.length) {
      const t = live[idx++];
      const r = await checkOne(context, t);
      if (r) flags.push(r);
      if (++done % 60 === 0) console.error(`  ...${done}/${live.length}`);
    }
  }
  await Promise.all(Array.from({ length: CONC }, worker));
  await browser.close();
  console.log(`\n=== scanned ${live.length} live tools (conc=${CONC}), ${flags.length} flagged ===`);
  flags.sort().forEach(f => console.log(f));
})().catch(e => { console.error('FATAL', e.message); process.exit(1); });
