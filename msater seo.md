# MASTER SPECIFICATION: Premium Flagship SEO Analyzer (Complete & Exhaustive)

**Target AI:** DeepSeek Flash / Cursor / Copilot
**Architecture:** Cloudflare Workers (Backend API) + Astro/Cloudflare Pages (Frontend UI)
**Objective:** Build a $99/month SaaS-equivalent SEO tool. 100% free, serverless, single-URL input, massive detailed output with actionable code-level solutions.

---

## 1. STRICT ARCHITECTURAL RULES
1. **NO Backend Frameworks:** Worker must be pure Vanilla JS using native `fetch` and `HTMLRewriter` or Regex.
2. **NO Frontend Frameworks (for logic):** Use Vanilla JS inside the Astro page. Use CDNs for Chart.js, Font Awesome, and html2pdf.js.
3. **Single Endpoint:** The Worker must expose ONLY `/api/full-audit?url=<target>`.
4. **CORS is Mandatory:** Every response (including OPTIONS preflight) MUST include `Access-Control-Allow-Origin: *`.
5. **No Hallucinations:** Do not use placeholder logic. Write the actual Regex, the actual math formulas, and the actual DOM parsing logic.

---

## 2. BACKEND LOGIC: `worker.js` (The 21-Phase Engine)

The Worker must execute these 21 phases sequentially on the fetched HTML.

### Phase 1-2: Fetch & Headers
- Fetch with `redirect: 'manual'`. Track up to 5 hops.
- Extract headers: `Strict-Transport-Security`, `X-Frame-Options`, `X-Content-Type-Options`, `Content-Security-Policy`, `Referrer-Policy`, `X-Robots-Tag`, `Cache-Control`, `Last-Modified`.

### Phase 3: HTML Sanitization
- Strip: `<script>`, `<style>`, `<nav>`, `<header>`, `<footer>`, `<noscript>`, `<iframe>`, `<svg>`, `<path>`.
- Isolate `<main>` or `<article>` if present, otherwise use `<body>`.

### Phase 4: Thin Content & Structure
- **Word Count:** Split sanitized text by whitespace.
- **Text-to-HTML Ratio:** `(sanitized_text.length / raw_html.length) * 100`.
- **Headings:** Count `<h1>` to `<h6>`. Flag if H1 != 1. Flag if H2-H6 hierarchy is broken (e.g., H1 -> H3).
- **Paragraphs:** Count `<p>`, calculate average words per paragraph.

### Phase 5: E-E-A-T Signals (The Ahrefs-Beater)
- **Author:** Regex search for `rel="author"`, `<meta name="author"`, class names containing `author` or `byline`.
- **Dates:** Extract `datetime` attributes from `<time>` tags. Check meta tags for `article:published_time` and `article:modified_time`.
- **Citations:** Count outbound `<a>` tags pointing to high-authority domains (`.edu`, `.gov`, `.org`, or known wikis).
- **Score:** Calculate `eeaScore` (0-100) based on presence of these 4 elements.

### Phase 6: Readability Math (Exact Formulas)
- Count sentences (split by `.`, `!`, `?`).
- Count syllables (Regex: `/[aeiouy]+/gi`).
- **Flesch-Kincaid:** `206.835 - 1.015 * (words/sentences) - 84.6 * (syllables/words)`.
- **Gunning Fog:** `0.4 * ((words/sentences) + 100 * (complex_words/words))`. (Complex words = 3+ syllables).

### Phase 7: Featured Snippet & Entities
- **Snippets:** Count `<ol>`, `<ul>` with 3+ `<li>`. Count `<h2>`/`<h3>` followed immediately by `<p>` (definition pattern). Count FAQ schema.
- **Entities:** Regex extract capitalized 2-3 word phrases (e.g., "New York", "John Doe") excluding start of sentences.

### Phase 8-9: Images & Links
- **Images:** Check `<img>` for `alt`, `width`, `height`, `loading="lazy"`. Check `src` extension (`.webp`/`.avif` = good, `.jpg`/`.png` = bad).
- **Links:** Separate internal (same hostname) vs external. Extract anchor text. Flag "click here" or "read more" as poor anchor text.

### Phase 10-12: Schema, CWV, Accessibility
- **Schema:** Extract `<script type="application/ld+json">`. Parse JSON. Check for `@type`. Validate required fields (e.g., if Article, needs `headline`, `author`, `datePublished`).
- **CWV Risks:** Count `<link rel="stylesheet">` and `<script>` in `<head>` without `async`/`defer` (Render Blocking). Count total DOM nodes (flag if > 1500).
- **A11y:** Check for `<main>`, `<article>`, `aria-label`, `role`, and skip-navigation links.

### Phase 13-15: Social, Keywords, Canonical
- **Social:** Extract `og:title`, `og:description`, `og:image`, `twitter:card`.
- **Keywords:** Convert text to lowercase. Remove these exact 50 stop words: `the, and, a, to, of, in, i, is, that, it, on, you, this, for, but, with, are, have, be, at, or, as, was, so, if, out, not, an, all, we, can, her, has, there, were, they, will, one, he, she, from, by, his, her, had, are, but, our, your`. Count top 15. Flag if top word > 5% density.
- **Canonical:** Check `<link rel="canonical">`. Verify it matches the final fetched URL.

### Phase 16-21: Scoring & Recommendations Engine
- Calculate 5 scores (0-100): Overall, Content, Technical, Performance, Accessibility.
- **Generate Recommendations Array:** For every failed check, generate an object:
  ```json
  {
    "priority": "critical|high|medium|low",
    "issue": "Missing H1 Tag",
    "impact": "Search engines cannot determine the primary topic of the page.",
    "solution": "Add exactly one H1 tag at the top of your main content area.",
    "codeExample": "<h1>Your Primary Keyword Here</h1>",
    "timeToFix": "2 minutes",
    "estimatedImpact": "+10% ranking potential"
  }
  ```

---

## 3. THE EXACT JSON RESPONSE SCHEMA

The Worker MUST return this exact, deeply nested JSON structure:

```json
{
  "url": "https://example.com",
  "redirectChain": [{"url": "http://example.com", "status": 301}],
  "scores": { "overall": 82, "content": 85, "technical": 78, "performance": 70, "accessibility": 90 },
  "content": {
    "wordCount": 1450, "textRatio": 22.5, "isThin": false,
    "headings": {"h1": 1, "h2": 4, "h3": 2, "hierarchyValid": true},
    "readability": {"fleschKincaid": 58.2, "gunningFog": 11.4, "gradeLevel": "10th Grade"},
    "eeat": {"score": 65, "hasAuthor": true, "hasDate": true, "hasCitations": false},
    "snippets": {"score": 40, "hasLists": true, "hasFAQ": false},
    "entities": ["Entity One", "Entity Two"]
  },
  "technical": {
    "schema": {"typesFound": ["Article"], "isValid": true, "errors": []},
    "canonical": {"url": "https://example.com", "isValid": true},
    "securityHeaders": {"hsts": true, "xFrame": false, "csp": false}
  },
  "performance": {
    "renderBlocking": 3, "domSize": 1240, "imagesWithoutDimensions": 4,
    "cwvRisks": ["4 images missing width/height (CLS risk)", "3 render-blocking scripts in head"]
  },
  "images": {"total": 12, "missingAlt": 2, "outdatedFormats": 5, "notLazyLoaded": 8},
  "links": {"internal": 14, "external": 6, "poorAnchorText": ["click here", "read more"]},
  "social": {"ogTitle": "Example", "ogImage": "img.jpg", "missing": ["twitter:card"]},
  "keywords": [{"word": "seo", "count": 24, "density": "1.65%"}],
  "recommendations": {
    "critical": [ { "issue": "...", "impact": "...", "solution": "...", "codeExample": "...", "timeToFix": "...", "estimatedImpact": "..." } ],
    "high": [], "medium": [], "low": []
  }
}
```

---

## 4. FRONTEND REQUIREMENTS: `seo-analyzer.astro`

### A. CDNs (Inject into `<head>`)
```html
<script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js"></script>
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
<script src="https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js"></script>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
```

### B. Exact CSS Variables & Styling
```css
:root {
  --primary: #6366f1; --primary-dark: #4f46e5; --success: #10b981;
  --warning: #f59e0b; --error: #ef4444; --info: #3b82f6;
  --bg-light: #f8fafc; --bg-dark: #0f172a; --card-bg: #ffffff;
  --text-main: #1e293b; --text-muted: #64748b;
  --gradient: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
}
body.dark-mode { --bg-light: #0f172a; --card-bg: #1e293b; --text-main: #f8fafc; }
body { font-family: 'Inter', sans-serif; background: var(--bg-light); color: var(--text-main); }
.card { background: var(--card-bg); border-radius: 16px; padding: 24px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1); transition: all 0.3s ease; }
.card:hover { transform: translateY(-4px); box-shadow: 0 20px 25px -5px rgba(0,0,0,0.1); }
.btn-gradient { background: var(--gradient); color: white; padding: 16px 32px; border-radius: 12px; font-weight: 700; border: none; cursor: pointer; }
.severity-critical { border-left: 6px solid var(--error); }
.severity-high { border-left: 6px solid var(--warning); }
```

### C. Exact UI Layout Structure
1. **Hero:** Gradient background, `<h1>Enterprise SEO Analyzer</h1>`, large URL `<input>`, `.btn-gradient` "Analyze" button.
2. **Loading State:** Hidden by default. Contains an SVG circle progress ring (stroke-dasharray math) and 4 text steps that light up sequentially.
3. **Score Dashboard:** 
   - One massive Chart.js Doughnut for Overall Score (center text shows Grade A-F).
   - 4 smaller cards for Content, Technical, Performance, Accessibility (using CSS conic-gradients for circular progress).
4. **Tabbed Interface:** 5 Tabs (Content, Technical, Performance, Media/Links, Social/Keywords).
5. **Issue Cards (The Core Feature):** Loop through `data.recommendations.critical` and `.high`. Render cards with `.severity-critical` class. Inside each card:
   - `<h4><i class="fas fa-exclamation-triangle"></i> {issue}</h4>`
   - `<p><strong>Impact:</strong> {impact}</p>`
   - `<p><strong>Solution:</strong> {solution}</p>`
   - `<pre><code>{codeExample}</code></pre>` (Styled with dark background)
   - `<div class="meta"><span><i class="fas fa-clock"></i> {timeToFix}</span> <span><i class="fas fa-chart-line"></i> {estimatedImpact}</span></div>`
6. **Export Bar:** Sticky bottom bar with "Export PDF" and "Share" buttons.

### D. Exact JavaScript Class Structure
```javascript
class FlagshipSEOAnalyzer {
  constructor() {
    this.WORKER_URL = 'https://toolnestr.toolnestr.workers.dev';
    this.charts = {};
    this.init();
  }

  init() {
    document.getElementById('analyzeBtn').addEventListener('click', () => this.runAudit());
    document.getElementById('exportPdfBtn').addEventListener('click', () => this.exportPDF());
    document.getElementById('darkModeToggle').addEventListener('click', () => document.body.classList.toggle('dark-mode'));
  }

  async runAudit() {
    const url = document.getElementById('urlInput').value;
    if(!url) return;
    this.showLoading();
    try {
      const res = await fetch(`${this.WORKER_URL}/api/full-audit?url=${encodeURIComponent(url)}`);
      const data = await res.json();
      this.renderDashboard(data);
      this.initCharts(data.scores);
      this.renderRecommendations(data.recommendations);
    } catch (e) { this.showError(e); }
  }

  initCharts(scores) {
    // 1. Overall Doughnut
    new Chart(document.getElementById('overallChart'), {
      type: 'doughnut',
      data: { datasets: [{ data: [scores.overall, 100-scores.overall], backgroundColor: ['#6366f1', '#e2e8f0'], borderWidth: 0 }] },
      options: { cutout: '85%', plugins: { legend: { display: false } } }
    });
    // 2. Radar Chart for Categories vs Industry Avg
    // 3. Bar Chart for Keywords
  }

  renderRecommendations(recs) {
    const container = document.getElementById('recsContainer');
    container.innerHTML = '';
    ['critical', 'high', 'medium', 'low'].forEach(priority => {
      if(recs[priority].length > 0) {
        recs[priority].forEach(rec => {
          container.innerHTML += `
            <div class="card severity-${priority}">
              <h4>${rec.issue}</h4>
              <p><strong>Impact:</strong> ${rec.impact}</p>
              <p><strong>How to fix:</strong> ${rec.solution}</p>
              <pre><code>${this.escapeHtml(rec.codeExample || '')}</code></pre>
              <div class="meta">⏱️ ${rec.timeToFix} | 📈 ${rec.estimatedImpact}</div>
            </div>`;
        });
      }
    });
  }

  exportPDF() {
    const element = document.getElementById('dashboardContainer');
    html2pdf().set({ 
      margin: 10, filename: 'seo-audit.pdf', 
      html2canvas: { scale: 2, useCORS: true }, 
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' } 
    }).from(element).save();
  }
  
  escapeHtml(str) { return str.replace(/</g, "&lt;").replace(/>/g, "&gt;"); }
}
const app = new FlagshipSEOAnalyzer();
```

---

## 5. AUTOMATED DEPLOYMENT & EXECUTION COMMANDS

AI Agent, execute these exact terminal commands in order:

1. **Write Files:** Generate `worker.js`, `wrangler.toml`, and `src/pages/tools/seo-analyzer.astro` based on the exhaustive specs above.
2. **Deploy Worker:** 
   ```bash
   npx wrangler deploy worker.js
   ```
3. **Update Frontend:** Ensure `this.WORKER_URL` in the Astro file matches the deployed worker URL.
4. **Commit & Push:**
   ```bash
   git add worker.js wrangler.toml src/pages/tools/seo-analyzer.astro
   git commit -m "feat: deploy flagship premium SEO analyzer with full 21-phase engine"
   git push
   ```

**END OF MASTER SPECIFICATION. BEGIN CODING IMMEDIATELY.**