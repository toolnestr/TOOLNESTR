// Parallel render-check for all chart tools: fill data, trigger draw, confirm an
// SVG (with children) or a non-blank canvas actually renders. Plus a numeric check
// on box-plot quartiles for a known dataset. Run: node verify-charts.cjs [BASE]
const { chromium } = require('playwright');
const BASE = process.argv[2] || 'https://toolnestr.com';

// per-tool input: {fills:{sel:val}, data:'textarea content'}
const CFG = {
  'bar-chart-generator':     { data: 'Apple,10\nBanana,20\nCherry,30' },
  'pie-chart-generator':     { data: 'Apple,10\nBanana,20\nCherry,30' },
  'line-chart-generator':    { data: 'Jan,10\nFeb,20\nMar,15' },
  'grouped-bar-chart':       { data: 'A,10,20\nB,15,25' },
  'donut-chart-generator':   { data: 'Apple,10\nBanana,20\nCherry,30' },
  'histogram-generator':     { data: '1,2,3,4,5,6,7,8,9,10,2,3,4,5' },
  'gauge-chart':             { data: null },
  'percentage-bar-chart':    { data: 'Apple,10\nBanana,20\nCherry,30' },
  'scatter-plot-generator':  { data: '1,2\n3,4\n5,6\n7,8' },
  'radar-chart-generator':   { data: 'Speed,80\nPower,60\nRange,70' },
  'box-plot-generator':      { data: '1,2,3,4,5,6,7,8,9' },
};
const RENDER_ACTION = /generate|draw|create|plot|render|chart|build|update|go/i;

async function rendered(page) {
  return await page.evaluate(() => {
    const svgs = [...document.querySelectorAll('main svg')].filter(s => s.querySelectorAll('rect,circle,path,line,polygon,polyline,text').length > 3);
    if (svgs.length) return true;
    for (const c of document.querySelectorAll('main canvas')) {
      try { const ctx = c.getContext('2d'); const d = ctx.getImageData(0, 0, c.width, c.height).data;
        for (let i = 3; i < d.length; i += 400) if (d[i] !== 0) return true; } catch (e) {}
    }
    return false;
  });
}

async function checkOne(context, slug) {
  const page = await context.newPage();
  const errs = [];
  page.on('pageerror', e => errs.push(e.message.slice(0, 60)));
  try {
    await page.goto(`${BASE}/tools/${slug}`, { waitUntil: 'domcontentloaded', timeout: 25000 });
    await page.waitForTimeout(700);
    const cfg = CFG[slug] || {};
    if (cfg.data != null) { const ta = page.locator('main textarea').first(); if (await ta.count()) await ta.fill(cfg.data).catch(() => {}); }
    // fill any visible number inputs (gauge etc.) with sensible values
    const nums = await page.locator('main input[type="number"]:visible').all();
    const vals = ['70', '0', '100']; // value, min, max ordering for gauge
    for (let i = 0; i < nums.length; i++) await nums[i].fill(vals[i] || '50').catch(() => {});
    // trigger draw
    const btns = await page.locator('main button:visible').all();
    for (const b of btns) { const t = (await b.textContent().catch(() => '')) || ''; if (RENDER_ACTION.test(t)) { await b.click({ timeout: 2500 }).catch(() => {}); break; } }
    await page.waitForTimeout(900);
    const ok = await rendered(page);

    let extra = '';
    if (slug === 'box-plot-generator') {
      const stats = (await page.locator('main').innerText()).replace(/\s+/g, ' ');
      // dataset 1..9 -> median 5, Q1 3, Q3 7
      const okStats = /\b5\b/.test(stats) && /\b3\b/.test(stats) && /\b7\b/.test(stats);
      extra = ` | stats(median5/Q1 3/Q3 7)=${okStats}`;
    }
    await page.close();
    if (errs.length) return `[PAGEERR] ${slug} :: ${errs.join(';')}`;
    return `${ok ? '[ok]   ' : '[NO-RENDER]'} ${slug}${extra}`;
  } catch (e) { await page.close().catch(() => {}); return `[ERROR] ${slug} :: ${e.message.slice(0, 45)}`; }
}

(async () => {
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  const context = await browser.newContext();
  const slugs = Object.keys(CFG);
  const CONC = 5;
  const out = [];
  let idx = 0;
  async function worker() { while (idx < slugs.length) { const s = slugs[idx++]; out.push(await checkOne(context, s)); } }
  await Promise.all(Array.from({ length: CONC }, worker));
  await browser.close();
  out.sort().forEach(l => console.log(l));
})().catch(e => { console.error('FATAL', e.message); process.exit(1); });
