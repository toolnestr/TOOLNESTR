process.env.LD_LIBRARY_PATH = '/home/toolnestr/.local/share/playwright-deps' + (process.env.LD_LIBRARY_PATH ? ':' + process.env.LD_LIBRARY_PATH : '');
const { chromium } = require('playwright');
const fs = require('fs');

const toolsByCat = JSON.parse(fs.readFileSync('/home/toolnestr/TOOLNESTR/.sweep-tmp/sweep-tools.json', 'utf8'));
const category = process.argv[2];
const slugs = toolsByCat[category];
if (!slugs) { console.error('unknown category', category); process.exit(1); }

const ACTION_WORDS = /calculate|convert|generate|compute|submit|encode|decode|encrypt|decrypt|format|analyze|check|search|create|build|apply|run|go|format|beautify|minify|validate|resize|compress/i;

async function testTool(browser, slug) {
  const context = await browser.newContext();
  const page = await context.newPage();
  const errors = [];
  const failedRequests = [];
  page.on('console', msg => {
    if (msg.type() !== 'error') return;
    const text = msg.text();
    if (text.includes('cloudflareinsights.com/beacon.min.js')) return; // site-wide analytics CSP noise, not a per-tool regression
    errors.push(text.slice(0, 200));
  });
  page.on('pageerror', err => errors.push('pageerror: ' + err.message.slice(0, 200)));
  page.on('requestfailed', req => failedRequests.push(req.url()));

  const url = `https://toolnestr.com/tools/${slug}`;
  let result = { slug, url, status: 'PASS', errors: [], failedRequests: [], note: '' };
  try {
    const resp = await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 20000 });
    if (!resp || resp.status() >= 400) {
      result.status = 'FAIL';
      result.note = `HTTP ${resp ? resp.status() : 'no response'}`;
      await context.close();
      return result;
    }
    await page.waitForTimeout(600);
    const bodyText = await page.textContent('body').catch(() => '');
    if (!bodyText || bodyText.trim().length < 50) {
      result.status = 'FAIL';
      result.note = 'blank/near-empty page render';
      await context.close();
      return result;
    }

    // best-effort generic interaction
    try {
      const numberInputs = await page.locator('input[type="number"]:visible').all();
      const textInputs = await page.locator('input[type="text"]:visible, input:not([type]):visible').all();
      const textareas = await page.locator('textarea:visible').all();
      let filled = 0;
      for (const inp of numberInputs.slice(0, 3)) {
        await inp.fill('42').catch(() => {});
        filled++;
      }
      for (const inp of textInputs.slice(0, 2)) {
        await inp.fill('42').catch(() => {});
        filled++;
      }
      for (const inp of textareas.slice(0, 2)) {
        await inp.fill('Hello World 123').catch(() => {});
        filled++;
      }
      if (filled > 0) {
        const buttons = await page.locator('button:visible, input[type="submit"]:visible').all();
        for (const btn of buttons) {
          const txt = (await btn.textContent().catch(() => '')) || '';
          if (ACTION_WORDS.test(txt)) {
            await btn.click({ timeout: 3000 }).catch(() => {});
            break;
          }
        }
        await page.waitForTimeout(800);
      } else {
        result.note = 'no obvious input fields (textarea/select/range/upload-based tool) — not interacted';
      }
    } catch (e) {
      result.note = (result.note ? result.note + '; ' : '') + 'interaction error: ' + e.message.slice(0, 150);
    }

    await page.waitForTimeout(300);
  } catch (e) {
    result.status = 'FAIL';
    result.note = 'nav/timeout error: ' + e.message.slice(0, 200);
  }

  result.errors = errors.slice(0, 10);
  result.failedRequests = failedRequests.filter(u => !u.includes('google') && !u.includes('analytics') && !u.includes('cloudflareinsights.com')).slice(0, 10);
  if (result.status === 'PASS' && (result.errors.length > 0 || result.failedRequests.length > 0)) {
    result.status = 'FLAG';
  }
  await context.close();
  return result;
}

(async () => {
  const browser = await chromium.launch();
  const results = [];
  for (const slug of slugs) {
    const r = await testTool(browser, slug);
    results.push(r);
    console.log(`[${r.status}] ${slug}${r.note ? ' -- ' + r.note : ''}${r.errors.length ? ' | errors: ' + r.errors.join(' || ') : ''}`);
  }
  await browser.close();
  fs.writeFileSync(`/home/toolnestr/TOOLNESTR/.sweep-tmp/sweep-results-${category}.json`, JSON.stringify(results, null, 2));
  const pass = results.filter(r => r.status === 'PASS').length;
  const flag = results.filter(r => r.status === 'FLAG').length;
  const fail = results.filter(r => r.status === 'FAIL').length;
  console.log(`\nSUMMARY ${category}: ${results.length} total, ${pass} pass, ${flag} flagged, ${fail} fail`);
})();
