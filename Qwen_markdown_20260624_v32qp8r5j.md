# Project Specification: COMPLETE Advanced Unified SEO Analyzer
**Target AI:** DeepSeek Flash (via Antigravity)
**Deployment:** Cloudflare Workers (Backend) + Cloudflare Pages via GitHub (Frontend)
**Status:** FINAL VERSION - ALL FEATURES MERGED

## 1. Project Overview
I am building a completely free, serverless SEO analysis tool that provides a **comprehensive, unified SEO report** with ALL features (basic + advanced) that rival and exceed paid tools like Ahrefs for single-page analysis. The user enters one URL and gets an instant, professional-grade audit covering everything from thin content to E-E-A-T signals.

## 2. STRICT RULES FOR THE AI AGENT
- **NO External Dependencies:** Use only Vanilla JavaScript. No `cheerio`, `jsdom`, or npm packages. Use native Web APIs and Regex/String manipulation.
- **Single Unified Endpoint:** ONE route (`/api/full-audit`) that does ALL analysis in a single fetch.
- **CORS Handling:** Handle `OPTIONS` preflight requests, return `Access-Control-Allow-Origin: *`.
- **Full Automation:** Handle deployment and GitHub push automatically via terminal.
- **Performance:** All analysis must complete in under 5 seconds.
- **Safety:** This is an ADD-ON. Do not modify or delete any existing files except the 3 files we're creating.

---

## 3. Backend Requirements: Cloudflare Worker (`worker.js`)

Create a single `worker.js` file with ONE endpoint: `/api/full-audit?url=https://example.com`

### COMPLETE Analysis Logic (ALL Features in One Pass):

#### PHASE 1: Fetch & Technical Foundation
1. **Fetch with Redirect Tracking:** 
   - Fetch URL with `redirect: 'manual'`
   - Track full redirect chain (status codes, Location headers)
   - Capture final HTML and final URL
   - Handle errors gracefully

2. **HTTP Headers Analysis:**
   - Security: `Strict-Transport-Security`, `X-Content-Type-Options`, `X-Frame-Options`, `Content-Security-Policy`, `Referrer-Policy`
   - SEO: `X-Robots-Tag`, `Link` (preload/preconnect hints)
   - Caching: `Cache-Control`, `Last-Modified`, `ETag`
   - Performance: `Content-Encoding`, `Server-Timing`

#### PHASE 2: Content Deep Analysis
3. **HTML Cleanup:** Strip `<script>`, `<style>`, `<nav>`, `<header>`, `<footer>`, `<noscript>`, `<iframe>` tags

4. **Thin Content Metrics:**
   - Word count (cleaned text only)
   - Text-to-HTML ratio
   - Heading hierarchy (H1-H6 counts, proper nesting check)
   - Paragraph analysis (count, average words per paragraph)
   - Sentence analysis (average words per sentence)
   - `isThinContent` flag (true if <300 words OR <15% text ratio)

5. **E-E-A-T Signals Detection** (CRITICAL ADVANCED FEATURE):
   - Author information (rel="author", author meta tags, byline patterns)
   - Publication date (`datePublished`, `article:published_time`)
   - Modification date (`dateModified`, `article:modified_time`)
   - "About" page links in header/footer
   - Citation links (outbound links to authoritative domains)
   - Author bio sections
   - Calculate `eeaScore` (0-100)

6. **Content Freshness Score:**
   - Check `Last-Modified` header
   - Check `dateModified` in schema/meta
   - Check for year mentions in content (e.g., "2026", "2025")
   - Calculate freshness score (0-100)

7. **Readability Analysis:**
   - Flesch-Kincaid Reading Ease score
   - Gunning Fog Index
   - Identify complex sentences (over 25 words)
   - Identify passive voice patterns (heuristic: "is/was/were + past participle")

8. **Featured Snippet Optimization:**
   - FAQ schema markup presence
   - Question patterns (sentences ending with "?")
   - List structures (ol/ul tags with 3+ items)
   - Definition patterns ("X is..." or "X means...")
   - Calculate snippet-readiness score (0-100)

9. **Entity Recognition** (Basic NLP):
   - Identify capitalized phrases (potential entities)
   - Look for patterns like "John Smith", "New York", "Microsoft"
   - Count unique entities detected
   - Check if entities are linked to Wikipedia/knowledge graphs

#### PHASE 3: Technical SEO Analysis
10. **Image Analysis:**
    - Find all `<img>` tags
    - Check for missing `alt` attributes
    - Check for missing `width` and `height` (CLS issues)
    - Identify outdated formats (.jpg, .png, .gif) vs modern (.webp, .avif)
    - Check for lazy loading (`loading="lazy"`)
    - Calculate total image count and issues

11. **Internal Link Architecture:**
    - Find all `<a>` tags
    - Categorize as internal (same domain) or external
    - Extract anchor text for each link
    - Identify orphan text (paragraphs with no links)
    - Calculate internal vs external link ratio
    - Detect link equity distribution issues

12. **Schema Markup Deep Validation:**
    - Extract all JSON-LD (`<script type="application/ld+json">`)
    - Extract microdata (itemscope, itemtype, itemprop)
    - Extract RDFa
    - Validate schema types against Google's supported types
    - Check for required properties
    - Return schema types found and validation errors

13. **Core Web Vitals Code Pattern Analysis:**
    - Check for render-blocking resources (scripts in `<head>` without async/defer)
    - Check for large images without dimensions
    - Check for layout shift risks
    - Check for font loading strategies (font-display: swap)
    - Check for excessive DOM size (count total HTML elements)
    - Predict potential LCP/CLS/INP issues

14. **Semantic HTML & Accessibility:**
    - Check for proper use of `<article>`, `<section>`, `<aside>`, `<main>`
    - Check for ARIA labels
    - Check for proper form labels
    - Check for skip navigation links
    - Calculate accessibility score (0-100)

15. **JavaScript Rendering Risk:**
    - Check if critical content is inside `<noscript>`
    - Check for content loaded via JavaScript patterns
    - Flag potential rendering risks

16. **Social Media Optimization:**
    - Extract OpenGraph tags (og:title, og:description, og:image, og:url, og:type)
    - Extract Twitter Card tags
    - Check for missing critical tags
    - Validate image dimensions if possible

17. **Keyword Analysis:**
    - Extract body text, convert to lowercase
    - Remove stop words (hardcode array of 50+ common words)
    - Count word frequency
    - Calculate keyword density
    - Return top 15 keywords with density percentages
    - Identify keyword stuffing (any word over 5% density)

18. **Hreflang & International SEO:**
    - Check for `<link rel="alternate" hreflang="...">` tags
    - Validate hreflang implementation
    - Check for x-default

19. **Canonical & Duplicate Content:**
    - Check for `<link rel="canonical">` tag
    - Verify canonical URL matches current URL
    - Check for self-referencing canonical
    - Flag potential duplicate content risks

#### PHASE 4: Calculate Overall Scores
20. **Calculate Final Scores:**
    - `overallSEOScore` (0-100): Weighted average of all categories
    - `contentScore` (0-100): Based on thin content, readability, E-E-A-T
    - `technicalScore` (0-100): Based on headers, schema, canonical, hreflang
    - `performanceScore` (0-100): Based on CWV patterns, image optimization
    - `accessibilityScore` (0-100): Based on semantic HTML, ARIA, alt tags

### Return JSON Structure:
```json
{
  "url": "final_url",
  "redirectChain": [{"url": "...", "status": 301}],
  "scores": {
    "overall": 85,
    "content": 90,
    "technical": 80,
    "performance": 75,
    "accessibility": 88
  },
  "content": {
    "wordCount": 1500,
    "textRatio": 25,
    "headings": {"h1": 1, "h2": 5, "h3": 3},
    "isThin": false,
    "verdict": "Content is comprehensive and well-structured",
    "readability": {"fleschKincaid": 60, "gunningFog": 12},
    "eeaScore": 75,
    "freshnessScore": 80,
    "snippetScore": 65
  },
  "technical": {
    "schema": {"types": ["Article", "BreadcrumbList"], "errors": []},
    "canonical": {"url": "...", "isValid": true},
    "hreflang": {"detected": false, "errors": []},
    "securityHeaders": {"hasHSTS": true, "hasXFrame": true, "hasXContentType": true}
  },
  "performance": {
    "renderBlockingResources": 2,
    "imagesWithoutDimensions": 3,
    "totalDOMElements": 1500,
    "predictedCWVIssues": ["CLS risk: 3 images missing dimensions"]
  },
  "images": {
    "total": 10,
    "missingAlt": 2,
    "missingDimensions": 3,
    "outdatedFormats": 4,
    "notLazyLoaded": 8
  },
  "links": {
    "internal": 15,
    "external": 5,
    "orphanParagraphs": 2,
    "anchorTextDistribution": [{"text": "click here", "count": 3}]
  },
  "social": {
    "ogTitle": "...",
    "ogDescription": "...",
    "ogImage": "...",
    "twitterCard": "summary_large_image",
    "missingTags": []
  },
  "keywords": [
    {"word": "seo", "count": 25, "density": "1.67%"}
  ],
  "entities": [
    {"name": "Google", "type": "Organization", "mentions": 5}
  ],
  "accessibility": {
    "score": 88,
    "issues": ["2 images missing alt text", "No skip navigation link"]
  },
  "jsRenderingRisks": ["Main content may require JavaScript to render"]
}