// Sanity sweep (post-fix regression check) — Windows edition.
// Drives the real installed Chrome via Playwright (channel:'chrome') against the LIVE
// production site (https://toolnestr.com). Two layers per tool:
//   1. Crash detection  — console errors / failed requests / blank render (as before).
//   2. Correctness check — if audit/sanity-sweep/sweep-checks.json has an assertion for
//      the slug, fill known inputs and verify a known expected output. Closes the
//      documented "only checks for crashes, not whether the value is correct" gap.
//
// Usage:  node audit/sanity-sweep/sweep.cjs <category>
//   category = converters | finance | health | math | engineering | everyday
//
// Paths are relative to this file's dir, so cwd doesn't matter (the shell tool resets it).

const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const HERE = __dirname;
const toolsByCat = JSON.parse(fs.readFileSync(path.join(HERE, 'sweep-tools.json'), 'utf8'));
const CHECKS = JSON.parse(fs.readFileSync(path.join(HERE, 'sweep-checks.json'), 'utf8'));

const category = process.argv[2];
const slugs = toolsByCat[category];
if (!slugs) { console.error('unknown category', category); process.exit(1); }

// Override with BASE_URL=http://localhost:4321 to sweep a local `astro preview` build
// before deploying; defaults to live production.
const BASE_URL = process.env.BASE_URL || 'https://toolnestr.com';

const ACTION_WORDS = /calculate|convert|generate|compute|submit|encode|decode|encrypt|decrypt|format|analyze|check|search|create|build|apply|run|go|beautify|minify|validate|resize|compress/i;
const PLACEHOLDERS = new Set(['', '-', '—', '0', '$0', 'nan', 'null', 'undefined']);

function assertExpect(expect, actual) {
  // All provided keys (computes / contains / notContains) must hold.
  const val = (actual == null ? '' : String(actual)).trim();
  if (expect.computes) {
    const norm = val.toLowerCase().replace(/[\s,]/g, '');
    if (PLACEHOLDERS.has(norm) || norm === '') return { ok: false, why: `still placeholder ("${val}")` };
  }
  if (expect.contains != null) {
    const needles = Array.isArray(expect.contains) ? expect.contains : [expect.contains];
    const missing = needles.filter(n => !val.includes(n));
    if (missing.length) return { ok: false, why: `expected to contain ${JSON.stringify(missing)}, got "${val.slice(0, 120)}"` };
  }
  if (expect.notContains != null) {
    const banned = Array.isArray(expect.notContains) ? expect.notContains : [expect.notContains];
    const present = banned.filter(n => val.includes(n));
    if (present.length) return { ok: false, why: `expected NOT to contain ${JSON.stringify(present)}, got "${val.slice(0, 120)}"` };
  }
  return { ok: true };
}

async function runCheck(page, spec) {
  // click something BEFORE filling (e.g. switch to a mode/tab whose inputs then appear)
  if (spec.preClick) {
    await page.click(spec.preClick, { timeout: 5000 });
    await page.waitForTimeout(200);
  }
  // fill text/number/textarea inputs
  if (spec.fill) {
    for (const [sel, v] of Object.entries(spec.fill)) {
      await page.fill(sel, v, { timeout: 5000 });
    }
  }
  // select dropdowns (fires change)
  if (spec.select) {
    for (const [sel, v] of Object.entries(spec.select)) {
      await page.selectOption(sel, v, { timeout: 5000 });
    }
  }
  // click an action button
  if (spec.click) {
    await page.click(spec.click, { timeout: 5000 });
  }
  await page.waitForTimeout(500);
  const actual = spec.readValue
    ? await page.inputValue(spec.read, { timeout: 5000 })
    : await page.textContent(spec.read, { timeout: 5000 });
  return { ...assertExpect(spec.expect, actual), actual: (actual == null ? '' : String(actual)).slice(0, 160) };
}

async function testTool(browser, slug) {
  const context = await browser.newContext();
  const page = await context.newPage();
  const errors = [];
  const failedRequests = [];
  page.on('console', msg => {
    if (msg.type() !== 'error') return;
    const text = msg.text();
    if (text.includes('cloudflareinsights.com/beacon.min.js')) return; // site-wide analytics CSP noise
    errors.push(text.slice(0, 200));
  });
  page.on('pageerror', err => errors.push('pageerror: ' + err.message.slice(0, 200)));
  page.on('requestfailed', req => failedRequests.push(req.url()));

  const url = `${BASE_URL}/tools/${slug}`;
  let result = { slug, url, status: 'PASS', check: 'none', checkNote: '', errors: [], failedRequests: [], note: '' };
  try {
    const resp = await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 25000 });
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

    const spec = CHECKS[slug];
    if (spec && !slug.startsWith('_')) {
      // targeted correctness assertion
      try {
        const c = await runCheck(page, spec);
        result.check = c.ok ? 'PASS' : 'FAIL';
        result.checkNote = c.ok ? `ok: "${c.actual}"` : c.why;
      } catch (e) {
        result.check = 'FAIL';
        result.checkNote = 'check threw: ' + e.message.slice(0, 160);
      }
    } else {
      // generic best-effort interaction (crash detection only)
      try {
        const numberInputs = await page.locator('input[type="number"]:visible').all();
        const textInputs = await page.locator('input[type="text"]:visible, input:not([type]):visible').all();
        const textareas = await page.locator('textarea:visible').all();
        let filled = 0;
        for (const inp of numberInputs.slice(0, 3)) { await inp.fill('42').catch(() => {}); filled++; }
        for (const inp of textInputs.slice(0, 2)) { await inp.fill('42').catch(() => {}); filled++; }
        for (const inp of textareas.slice(0, 2)) { await inp.fill('Hello World 123').catch(() => {}); filled++; }
        if (filled > 0) {
          const buttons = await page.locator('button:visible, input[type="submit"]:visible').all();
          for (const btn of buttons) {
            const txt = (await btn.textContent().catch(() => '')) || '';
            if (ACTION_WORDS.test(txt)) { await btn.click({ timeout: 3000 }).catch(() => {}); break; }
          }
          await page.waitForTimeout(800);
        } else {
          result.note = 'no obvious input fields — not interacted';
        }
      } catch (e) {
        result.note = (result.note ? result.note + '; ' : '') + 'interaction error: ' + e.message.slice(0, 150);
      }
    }

    await page.waitForTimeout(300);
  } catch (e) {
    result.status = 'FAIL';
    result.note = 'nav/timeout error: ' + e.message.slice(0, 200);
  }

  result.errors = errors.slice(0, 10);
  result.failedRequests = failedRequests.filter(u => !u.includes('google') && !u.includes('analytics') && !u.includes('cloudflareinsights.com')).slice(0, 10);

  // Combine crash + correctness into one final status.
  if (result.check === 'FAIL') {
    result.status = 'FAIL';                 // wrong answer is the most serious outcome
  } else if (result.status === 'PASS' && (result.errors.length > 0 || result.failedRequests.length > 0)) {
    result.status = 'FLAG';                 // didn't crash the page but had console/network errors
  }
  await context.close();
  return result;
}

(async () => {
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  const results = [];
  for (const slug of slugs) {
    const r = await testTool(browser, slug);
    results.push(r);
    const checkStr = r.check === 'none' ? '' : ` {check:${r.check}${r.check === 'FAIL' ? ' — ' + r.checkNote : ''}}`;
    console.log(`[${r.status}] ${slug}${checkStr}${r.note ? ' -- ' + r.note : ''}${r.errors.length ? ' | errors: ' + r.errors.join(' || ') : ''}${r.failedRequests.length ? ' | failedReq: ' + r.failedRequests.join(', ') : ''}`);
  }
  await browser.close();
  fs.writeFileSync(path.join(HERE, `sweep-results-${category}.json`), JSON.stringify(results, null, 2));
  const pass = results.filter(r => r.status === 'PASS').length;
  const flag = results.filter(r => r.status === 'FLAG').length;
  const fail = results.filter(r => r.status === 'FAIL').length;
  const checked = results.filter(r => r.check !== 'none').length;
  const checkPass = results.filter(r => r.check === 'PASS').length;
  console.log(`\nSUMMARY ${category}: ${results.length} total, ${pass} pass, ${flag} flagged, ${fail} fail | correctness-checked: ${checkPass}/${checked} passed`);
})();
