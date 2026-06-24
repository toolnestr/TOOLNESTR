// ─────────────────────────────────────────────────────────────
//  Unified SEO Analyzer — Cloudflare Worker
//  Single endpoint:  GET /api/full-audit?url=https://example.com
//  ES Modules format — No external dependencies
// ─────────────────────────────────────────────────────────────

export default {
  async fetch(request) {
    // CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
        },
      });
    }

    try {
      const url = new URL(request.url);
      if (url.pathname.replace(/\/+$/, '') !== '/api/full-audit' || request.method !== 'GET') {
        return new Response('Not Found', {
          status: 404,
          headers: { 'Access-Control-Allow-Origin': '*' },
        });
      }

      let targetUrl = url.searchParams.get('url');
      if (!targetUrl) {
        return jsonResponse({ error: 'Missing URL parameter' }, 400);
      }

      targetUrl = targetUrl.trim();
      if (!targetUrl.startsWith('http://') && !targetUrl.startsWith('https://')) {
        targetUrl = 'https://' + targetUrl;
      }

      try {
        new URL(targetUrl);
      } catch (e) {
        return jsonResponse({ error: 'Invalid URL: ' + targetUrl }, 400);
      }

      // CRITICAL: Initialize ALL variables at the start
      let html = '';
      let finalUrl = targetUrl;
      let wordCount = 0;
      let textRatio = 0;
      let isThin = false;
      const redirectChain = [];
      const keywords = [];
      const entities = [];
      const recommendations = { critical: [], high: [], medium: [], low: [] };
      let scores = { overall: 0, content: 0, technical: 0, performance: 0, accessibility: 0 };
      let headings = { h1: 0, h2: 0, h3: 0, h4: 0, h5: 0, h6: 0 };
      let readability = { fleschKincaid: 0, gunningFog: 0, gradeLevel: 'Unknown' };
      let eeat = { score: 0, hasAuthor: false, hasDate: false, hasCitations: false };
      let snippets = { score: 0, hasLists: false, hasFAQ: false };
      let schema = { typesFound: [], isValid: false, errors: [] };
      let canonical = { url: '', isValid: false };
      let securityHeaders = { hsts: false, xFrame: false, csp: false };
      let perf = { renderBlocking: 0, domSize: 0, imagesWithoutDimensions: 0, cwvRisks: [] };
      let images = { total: 0, missingAlt: 0, outdatedFormats: 0, notLazyLoaded: 0 };
      let links = { internal: 0, external: 0, poorAnchorText: [] };
      let social = { ogTitle: '', ogImage: '', missing: [] };

      // Fetch with redirect tracking
      let currentUrl = finalUrl;
      let response;
      for (let i = 0; i < 10; i++) {
        response = await fetch(currentUrl, {
          method: 'GET',
          redirect: 'manual',
          headers: {
            'User-Agent': 'Mozilla/5.0 (compatible; SEOAnalyzer/1.0; +https://toolnestr.com)',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.5',
          },
        });
        const status = response.status;
        const location = response.headers.get('Location');
        redirectChain.push({ url: currentUrl, status });
        if (status >= 300 && status < 400 && location) {
          currentUrl = new URL(location, currentUrl).href;
          continue;
        }
        break;
      }

      finalUrl = currentUrl;
      html = response ? await response.text() : '';

      if (html) {
        // Run analysis
        wordCount = countWords(extractText(stripNoise(html)));
        textRatio = html.length > 0 ? Math.round((extractText(stripNoise(html)).length / html.length) * 100) : 0;
        isThin = wordCount < 300 && textRatio < 15;
        headings = extractHeadings(html);
        readability = calculateReadability(extractText(stripNoise(html)));
        readability.gradeLevel = getGradeLevel(readability.fleschKincaid);
        snippets = { score: calculateSnippetScore(html), hasLists: (html.match(/<(ol|ul)[^>]*>[\s\S]*?<\/(ol|ul)>/gi) || []).length > 0, hasFAQ: /faqpage/i.test(html) };
        const eeaScore = calculateEEAT(html, stripNoise(html));
        eeat = { score: eeaScore, hasAuthor: eeaScore >= 20, hasDate: calculateFreshness(html, {}) >= 15, hasCitations: false };

        const schemaResult = analyzeSchema(html);
        schema = { typesFound: schemaResult.types || [], isValid: (schemaResult.errors || []).length === 0, errors: schemaResult.errors || [] };
        canonical = { url: extractCanonical(html), isValid: extractCanonical(html) ? extractCanonical(html).replace(/\/$/, '') === finalUrl.replace(/\/$/, '') : false };
        securityHeaders = { hsts: false, xFrame: false, csp: false };

        const imgResult = analyzeImages(html);
        images = { total: imgResult.total || 0, missingAlt: imgResult.missingAlt || 0, outdatedFormats: imgResult.outdatedFormats || 0, notLazyLoaded: imgResult.notLazyLoaded || 0 };

        const linkResult = analyzeLinks(html, finalUrl);
        links = { internal: linkResult.internal || 0, external: linkResult.external || 0, poorAnchorText: (linkResult.anchorTextDistribution || []).filter(function (a) { return /click\s*here|read\s*more|learn\s*more/i.test(a.text); }).map(function (a) { return a.text; }) };

        const perfResult = analyzePerformance(html);
        perf = { renderBlocking: perfResult.renderBlockingResources || 0, domSize: perfResult.totalDOMElements || 0, imagesWithoutDimensions: imgResult.missingDimensions || 0, cwvRisks: perfResult.predictedCWVIssues || [] };

        social = { ogTitle: extractOG(html, 'og:title'), ogImage: extractOG(html, 'og:image'), missing: getMissingOG(html) };

        const kwResult = analyzeKeywords(html);
        keywords.push.apply(keywords, (kwResult || []).slice(0, 15));

        const entityResult = analyzeEntities(html);
        entities.push.apply(entities, (entityResult || []).map(function (e) { return e.name; }).slice(0, 10));

        scores = calculateScoresRaw(wordCount, textRatio, isThin, headings, readability.fleschKincaid, eeaScore, snippets.score, schema, canonical, securityHeaders, perf, images, html);
        const recs = generateRecommendationsRaw(wordCount, textRatio, isThin, headings, readability, eeaScore, snippets.score, images, links, social, perf, schema, canonical, securityHeaders);
        recommendations.critical = recs.critical || [];
        recommendations.high = recs.high || [];
        recommendations.medium = recs.medium || [];
        recommendations.low = recs.low || [];
      }

      return jsonResponse({
        url: finalUrl,
        redirectChain: redirectChain,
        scores: scores,
        content: {
          wordCount: wordCount,
          textRatio: textRatio,
          isThin: isThin,
          headings: headings,
          readability: readability,
          eeat: eeat,
          snippets: snippets,
          entities: entities,
        },
        technical: {
          schema: schema,
          canonical: canonical,
          securityHeaders: securityHeaders,
        },
        performance: perf,
        images: images,
        links: links,
        social: social,
        keywords: keywords,
        recommendations: recommendations,
      });

    } catch (error) {
      console.error('Worker error:', error.message);
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json',
        },
      });
    }
  },
};

function jsonResponse(data, status) {
  return new Response(JSON.stringify(data), {
    status: status || 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Content-Type': 'application/json',
    },
  });
}

// ─────────────────────────────────────────────────────────────
//  HELPER: Strip noise from HTML
// ─────────────────────────────────────────────────────────────

function stripNoise(html) {
  if (!html) return '';
  return html
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/<nav[^>]*>[\s\S]*?<\/nav>/gi, '')
    .replace(/<header[^>]*>[\s\S]*?<\/header>/gi, '')
    .replace(/<footer[^>]*>[\s\S]*?<\/footer>/gi, '')
    .replace(/<noscript[^>]*>[\s\S]*?<\/noscript>/gi, '')
    .replace(/<iframe[^>]*>[\s\S]*?<\/iframe>/gi, '');
}

function extractText(html) {
  if (!html) return '';
  return html
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#\d+;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function countWords(text) {
  if (!text) return 0;
  return text.split(/\s+/).filter(Boolean).length;
}

function extractHeadings(html) {
  if (!html) return { h1: 0, h2: 0, h3: 0, h4: 0, h5: 0, h6: 0 };
  return {
    h1: (html.match(/<h1[^>]*>/gi) || []).length,
    h2: (html.match(/<h2[^>]*>/gi) || []).length,
    h3: (html.match(/<h3[^>]*>/gi) || []).length,
    h4: (html.match(/<h4[^>]*>/gi) || []).length,
    h5: (html.match(/<h5[^>]*>/gi) || []).length,
    h6: (html.match(/<h6[^>]*>/gi) || []).length,
  };
}

function getGradeLevel(fkScore) {
  if (fkScore >= 90) return '5th Grade';
  if (fkScore >= 80) return '6th Grade';
  if (fkScore >= 70) return '7th Grade';
  if (fkScore >= 60) return '8th-9th Grade';
  if (fkScore >= 50) return '10th-12th Grade';
  if (fkScore >= 30) return 'College';
  return 'College Graduate';
}

// ─────────────────────────────────────────────────────────────
//  READABILITY
// ─────────────────────────────────────────────────────────────

function calculateReadability(text) {
  if (!text) return { fleschKincaid: 0, gunningFog: 0, complexSentences: 0, passiveVoiceCount: 0 };
  const words = text.split(/\s+/).filter(Boolean);
  const sentences = text.split(/[.!?]+/).filter(Boolean);
  const wordCount = words.length;
  const sentenceCount = sentences.length || 1;
  const syllableCount = words.reduce(function (sum, w) { return sum + countSyllables(w); }, 0);
  const fk = 206.835 - 1.015 * (wordCount / sentenceCount) - 84.6 * (syllableCount / wordCount);
  const complexWords = words.filter(function (w) { return countSyllables(w) >= 3; }).length;
  const gf = 0.4 * (wordCount / sentenceCount + 100 * (complexWords / wordCount));
  const complexSentences = sentences.filter(function (s) { return s.split(/\s+/).filter(Boolean).length > 25; }).length;
  const passiveMatches = text.match(/\b(is|was|were|been|being|are|be)\s+\w+ed\b/gi);
  return {
    fleschKincaid: Math.round(Math.max(0, Math.min(100, fk))),
    gunningFog: Math.round(Math.max(0, Math.min(30, gf))),
    complexSentences: complexSentences,
    passiveVoiceCount: passiveMatches ? passiveMatches.length : 0,
  };
}

function countSyllables(word) {
  if (!word) return 0;
  word = word.toLowerCase().replace(/[^a-z]/g, '');
  if (word.length <= 3) return 1;
  word = word.replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/, '');
  word = word.replace(/^y/, '');
  var syl = word.match(/[aeiouy]{1,2}/g);
  return syl ? syl.length : 1;
}

// ─────────────────────────────────────────────────────────────
//  E-E-A-T
// ─────────────────────────────────────────────────────────────

function calculateEEAT(html, cleaned) {
  if (!html) return 0;
  var score = 0;
  var hasSchemaAuthor = /"@type"\s*:\s*"Person"[\s\S]*?"name"\s*:\s*"/i.test(html);
  var hasMetaAuthor = /<meta\s+[^>]*name=["']author["'][^>]*>/i.test(html);
  var hasByline = /by\s+[A-Z][a-z]+(?:\s+[A-Z][a-z]+)?(?:\s*<\/|,\s|<)/.test(cleaned);
  if (hasSchemaAuthor || hasMetaAuthor || hasByline) score += 20;
  if (/datePublished|article:published_time|<time\s+datetime=/i.test(html)) score += 15;
  if (/dateModified|article:modified_time/i.test(html)) score += 10;
  if (/about/i.test(html)) score += 10;
  var citationDomains = html.match(/https?:\/\/(?:www\.)?([^\/"'\s]+)/gi) || [];
  citationDomains = citationDomains.filter(function(d) { return d.indexOf('schema.org') === -1 && d.indexOf('example.com') === -1; });
  var nofollowDomains = html.match(/<a[^>]*rel=["']nofollow["'][^>]*href=["'](https?:\/\/(?:www\.)?[^\/"'\s]+)/gi) || [];
  var nofollowSet = {};
  nofollowDomains.forEach(function(m) {
    var d = m.replace(/.*href=["']https?:\/\/(?:www\.)?([^\/"'\s]+).*/i, '$1').toLowerCase();
    nofollowSet[d] = true;
  });
  var authoritative = citationDomains.filter(function (d) {
    var domain = d.toLowerCase().replace(/^(https?:\/\/)?(www\.)?/, '').replace(/\/.*$/, '');
    return /\.(gov|edu|org|wikipedia|who\.int|nih\.gov|webmd|mayoclinic)(\.[a-z]{2,})?$/i.test(domain) && !nofollowSet[domain];
  });
  if (authoritative.length > 0) score += Math.min(15, authoritative.length * 5);
  if (/author-bio|about-the-author|writer\s*bio/i.test(html)) score += 10;
  var words = cleaned.replace(/<[^>]+>/g, ' ').split(/\s+/).filter(Boolean).length;
  if (words >= 1500) score += 15; else if (words >= 600) score += 10; else if (words >= 300) score += 5;
  if (/schema\.org\/(Person|Organization)/i.test(html)) score += 5;
  if (/<article[^>]*>/i.test(html)) score += 5;
  return Math.min(100, score);
}

function calculateFreshness(html, headers) {
  if (!html) return 0;
  var score = 0;
  var currentYear = new Date().getFullYear();
  var lastYear = currentYear - 1;
  var yearRegex = new RegExp('\\b(' + currentYear + '|' + lastYear + ')\\b', 'g');
  var yearMatches = html.match(yearRegex);
  if (yearMatches) score += Math.min(30, yearMatches.length * 5);
  if (/dateModified|article:modified_time|<time\s+datetime=/i.test(html)) score += 20;
  if (/\b(20\d{2})\/(0[1-9]|1[0-2])\/(0[1-9]|[12]\d|3[01])\b/.test(html)) score += 10;
  return Math.min(100, score);
}

// ─────────────────────────────────────────────────────────────
//  SNIPPET SCORE
// ─────────────────────────────────────────────────────────────

function calculateSnippetScore(html) {
  if (!html) return 0;
  var score = 0;
  if (/faqpage|FAQPage/i.test(html)) score += 25;
  var sentences = html.match(/[A-Z][^.!?]*\?/g);
  if (sentences) score += Math.min(25, sentences.length * 5);
  var lists = (html.match(/<ol[^>]*>[\s\S]*?<\/ol>/gi) || []).length + (html.match(/<ul[^>]*>[\s\S]*?<\/ul>/gi) || []).length;
  if (lists > 0) score += Math.min(20, lists * 5);
  var definitions = html.match(/<dt[^>]*>/gi) || [];
  if (definitions.length > 0) score += 15;
  if (/how\s+to|steps?\s*:|\d+\.\s+[A-Z]/i.test(html)) score += 15;
  return Math.min(100, score);
}

// ─────────────────────────────────────────────────────────────
//  IMAGES
// ─────────────────────────────────────────────────────────────

function analyzeImages(html) {
  if (!html) return { total: 0, missingAlt: 0, missingDimensions: 0, outdatedFormats: 0, notLazyLoaded: 0 };
  var images = html.match(/<img[^>]*>/gi) || [];
  var missingAlt = 0, missingDimensions = 0, outdatedFormats = 0, notLazyLoaded = 0;
  for (var i = 0; i < images.length; i++) {
    var img = images[i];
    if (!/alt\s*=/i.test(img)) missingAlt++;
    if (!/width\s*=/i.test(img) || !/height\s*=/i.test(img)) missingDimensions++;
    if (/\.(jpg|jpeg|png|gif)(["'\s?>]|$)/i.test(img)) outdatedFormats++;
    if (!/loading\s*=\s*["']lazy["']/i.test(img)) notLazyLoaded++;
  }
  return { total: images.length, missingAlt: missingAlt, missingDimensions: missingDimensions, outdatedFormats: outdatedFormats, notLazyLoaded: notLazyLoaded };
}

// ─────────────────────────────────────────────────────────────
//  LINKS
// ─────────────────────────────────────────────────────────────

function analyzeLinks(html, baseUrl) {
  if (!html) return { internal: 0, external: 0, orphanParagraphs: 0, anchorTextDistribution: [] };
  var internal = 0, external = 0;
  var anchorTexts = {};
  var baseHost = baseUrl ? new URL(baseUrl).hostname.replace(/^www\./, '') : '';
  var linkRegex = /<a\s+[^>]*href\s*=\s*["']([^"']*)["'][^>]*>([\s\S]*?)<\/a>/gi;
  var match;
  while ((match = linkRegex.exec(html)) !== null) {
    var href = match[1].trim();
    var anchorText = extractText(match[2]).trim();
    if (!href || href.startsWith('#') || href.startsWith('javascript:')) continue;
    if (anchorText) {
      var lower = anchorText.toLowerCase();
      anchorTexts[lower] = (anchorTexts[lower] || 0) + 1;
    }
    try {
      var linkHost = new URL(href, baseUrl).hostname.replace(/^www\./, '');
      if (linkHost === baseHost) internal++; else external++;
    } catch (e) { internal++; }
  }
  var anchorTextDistribution = Object.keys(anchorTexts).filter(function (t) { return t.length > 0; }).map(function (text) { return { text: text, count: anchorTexts[text] }; }).sort(function (a, b) { return b.count - a.count; }).slice(0, 10);
  return { internal: internal, external: external, orphanParagraphs: 0, anchorTextDistribution: anchorTextDistribution };
}

// ─────────────────────────────────────────────────────────────
//  SCHEMA
// ─────────────────────────────────────────────────────────────

function analyzeSchema(html) {
  if (!html) return { types: [], errors: [] };
  var types = [];
  var errors = [];
  var jsonldRegex = /<script\s+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
  var match;
  while ((match = jsonldRegex.exec(html)) !== null) {
    try {
      var data = JSON.parse(match[1].trim());
      var extractTypes = function (obj) {
        if (obj && obj['@type']) {
          if (Array.isArray(obj['@type'])) obj['@type'].forEach(function (t) { types.push(t); });
          else types.push(obj['@type']);
        }
        if (obj && obj['@graph']) obj['@graph'].forEach(function (item) { extractTypes(item); });
      };
      extractTypes(data);
    } catch (e) { errors.push('Invalid JSON-LD syntax found'); }
  }
  var microdataItems = html.match(/itemtype\s*=\s*["']([^"']+)["']/gi) || [];
  for (var i = 0; i < microdataItems.length; i++) {
    var type = microdataItems[i].replace(/itemtype\s*=\s*/i, '').replace(/["']/g, '');
    if (type && types.indexOf(type) === -1) types.push(type);
  }
  return { types: types.map(function (t) { return t.includes('/') ? t.split('/').pop() : t; }), errors: errors };
}

// ─────────────────────────────────────────────────────────────
//  CANONICAL EXTRACTION
// ─────────────────────────────────────────────────────────────

function extractCanonical(html) {
  if (!html) return '';
  var m = html.match(/<link\s+[^>]*rel=["']canonical["'][^>]*href=["']([^"']*)["'][^>]*\/?>/i);
  return m ? m[1] : '';
}

// ─────────────────────────────────────────────────────────────
//  PERFORMANCE
// ─────────────────────────────────────────────────────────────

function analyzePerformance(html) {
  if (!html) return { renderBlockingResources: 0, totalDOMElements: 0, predictedCWVIssues: [], jsRenderingRisks: [] };
  var issues = [];
  var headMatch = html.match(/<head[^>]*>[\s\S]*?<\/head>/i);
  var headContent = headMatch ? headMatch[0] : '';
  var scriptsInHead = headContent.match(/<script[^>]*src=["']([^"']*)["'][^>]*>/gi) || [];
  var renderBlockingResources = scriptsInHead.filter(function (s) { return !/async|defer/i.test(s) && !/type=["']application\/ld\+json["']/i.test(s); }).length;
  if (renderBlockingResources > 0) issues.push(renderBlockingResources + ' render-blocking script(s) in <head> without async/defer');
  var totalDOMElements = (html.match(/<[a-zA-Z_][^>]*>/g) || []).length;
  if (totalDOMElements > 1500) issues.push('Large DOM size (' + totalDOMElements + ' elements) — may impact rendering performance');
  var imagesWithoutDimensions = (html.match(/<img\s+(?![^>]*\b(width|height)\s*=)/gi) || []).length;
  if (imagesWithoutDimensions > 0) issues.push('CLS risk: ' + imagesWithoutDimensions + ' image(s) missing width/height dimensions');
  if (!/font-display:\s*swap/i.test(html)) issues.push('No font-display: swap detected — may cause invisible text during font load');
  return { renderBlockingResources: renderBlockingResources, totalDOMElements: totalDOMElements, predictedCWVIssues: issues, jsRenderingRisks: [] };
}

// ─────────────────────────────────────────────────────────────
//  SOCIAL / OG
// ─────────────────────────────────────────────────────────────

function extractOG(html, prop) {
  if (!html) return '';
  var regex = new RegExp('<meta\\s+[^>]*(?:property|name)\\s*=\\s*["\']' + prop + '["\'][^>]*content\\s*=\\s*["\']([^"\']*)["\']', 'i');
  var m = html.match(regex);
  return m ? m[1] : '';
}

function getMissingOG(html) {
  if (!html) return [];
  var missing = [];
  if (!extractOG(html, 'og:title')) missing.push('og:title');
  if (!extractOG(html, 'og:description')) missing.push('og:description');
  if (!extractOG(html, 'og:image')) missing.push('og:image');
  if (!extractOG(html, 'og:url')) missing.push('og:url');
  return missing;
}

// ─────────────────────────────────────────────────────────────
//  KEYWORDS
// ─────────────────────────────────────────────────────────────

function analyzeKeywords(html) {
  if (!html) return [];
  var text = extractText(stripNoise(html)).toLowerCase();
  var stopWords = 'a,an,the,and,or,but,in,on,at,to,for,of,by,with,from,as,is,was,were,be,been,being,have,has,had,do,does,did,will,would,can,could,shall,should,may,might,must,about,into,through,during,before,after,above,below,between,out,off,over,under,again,further,then,once,here,there,when,where,why,how,all,each,every,both,few,more,most,other,some,such,no,nor,not,only,own,same,so,than,too,very,just,because,it,its,this,that,these,those,which,who,whom,what'.split(',');
  var stopSet = {};
  for (var i = 0; i < stopWords.length; i++) stopSet[stopWords[i]] = true;
  var words = text.split(/\s+/).filter(function (w) { return w.length > 2 && !stopSet[w]; });
  var total = words.length;
  var freq = {};
  for (var j = 0; j < words.length; j++) freq[words[j]] = (freq[words[j]] || 0) + 1;
  return Object.keys(freq).filter(function (w) { return freq[w] > 1; }).map(function (word) { return { word: word, count: freq[word], density: total > 0 ? ((freq[word] / total) * 100).toFixed(2) + '%' : '0%' }; }).sort(function (a, b) { return b.count - a.count; });
}

// ─────────────────────────────────────────────────────────────
//  ENTITIES
// ─────────────────────────────────────────────────────────────

function analyzeEntities(html) {
  if (!html) return [];
  var text = extractText(stripNoise(html));
  var capitalPhrases = text.match(/\b[A-Z][a-z]+(?:\s+[A-Z][a-z]+){0,3}\b/g) || [];
  var commonWords = 'The,This,That,These,Those,First,Last,Next,Previous,About,Contact,Home,Search,Menu,More,Read,Click,Here,Monday,Tuesday,Wednesday,Thursday,Friday,Saturday,Sunday,January,February,March,April,May,June,July,August,September,October,November,December'.split(',');
  var commonSet = {};
  for (var i = 0; i < commonWords.length; i++) commonSet[commonWords[i]] = true;
  var freq = {};
  for (var j = 0; j < capitalPhrases.length; j++) {
    var phrase = capitalPhrases[j];
    var words = phrase.split(/\s+/);
    if (words.length >= 2 || (words.length === 1 && phrase.length > 3 && !commonSet[phrase])) {
      freq[phrase] = (freq[phrase] || 0) + 1;
    }
  }
  var orgIndicator = /(Inc|Corp|LLC|Ltd|Group|Company|University|Institute|Agency|Association|Foundation|Organization|Corporation)/i;
  var personPattern = /^[A-Z][a-z]+\s[A-Z][a-z]+$/;
  return Object.keys(freq).filter(function (name) { return freq[name] > 1; }).map(function (name) {
    var type = 'Unknown';
    if (orgIndicator.test(name)) type = 'Organization';
    else if (personPattern.test(name)) type = 'Person';
    else if (/\b(New|Los|San|Las|Port|Mount|Fort|North|South|East|West)\s[A-Z]/.test(name)) type = 'Location';
    return { name: name, type: type, mentions: freq[name] };
  }).sort(function (a, b) { return b.mentions - a.mentions; }).slice(0, 30);
}

// ─────────────────────────────────────────────────────────────
//  SCORE CALCULATION (simplified, no external deps)
// ─────────────────────────────────────────────────────────────

function calculateScoresRaw(wordCount, textRatio, isThin, headings, fleschKincaid, eeaScore, snippetScore, schema, canonical, securityHeaders, perf, images, html) {
  var contentScore = 0;
  if (!isThin) contentScore += 20;
  contentScore += Math.min(20, wordCount / 100);
  contentScore += eeaScore * 0.15;
  contentScore += snippetScore * 0.1;
  contentScore += fleschKincaid * 0.1;
  if (headings.h1 === 1) contentScore += 5;
  contentScore += Math.min(10, headings.h2 * 2);
  contentScore = Math.min(100, Math.round(contentScore));

  var technicalScore = 0;
  if (securityHeaders.hsts) technicalScore += 10;
  if (securityHeaders.xFrame) technicalScore += 10;
  if (securityHeaders.csp) technicalScore += 10;
  if (canonical.isValid) technicalScore += 15;
  else if (canonical.url) technicalScore += 5;
  if (schema.typesFound.length > 0) technicalScore += Math.min(15, schema.typesFound.length * 5);
  if (schema.errors.length === 0) technicalScore += 5;
  technicalScore = Math.min(100, Math.round(technicalScore));

  var performanceScore = 70;
  performanceScore -= perf.renderBlocking * 5;
  performanceScore -= perf.imagesWithoutDimensions * 3;
  if (perf.domSize > 1500) performanceScore -= 10;
  performanceScore = Math.max(0, Math.min(100, performanceScore));

  var accessibilityScore = calculateAccessibility(html);

  return {
    overall: Math.round(contentScore * 0.35 + technicalScore * 0.25 + performanceScore * 0.2 + accessibilityScore * 0.2),
    content: contentScore,
    technical: technicalScore,
    performance: performanceScore,
    accessibility: accessibilityScore,
  };
}

function calculateAccessibility(html) {
  if (!html) return 0;
  var score = 0;
  var issues = [];
  if (/<article[^>]*>/i.test(html)) score += 10;
  if (/<section[^>]*>/i.test(html)) score += 10;
  if (/<aside[^>]*>/i.test(html)) score += 10;
  if (/<main[^>]*>/i.test(html)) score += 10;
  var ariaLabels = (html.match(/aria-label\s*=\s*["']/gi) || []).length;
  var ariaLabelledby = (html.match(/aria-labelledby\s*=\s*["']/gi) || []).length;
  if (ariaLabels + ariaLabelledby > 0) score += Math.min(20, (ariaLabels + ariaLabelledby) * 5);
  if (/skip\s*(to\s*content|navigation|nav|main)/i.test(html)) score += 10;
  if (/lang\s*=\s*["']/i.test(html)) score += 5;
  var h1Count = (html.match(/<h1[^>]*>/gi) || []).length;
  if (h1Count === 1) score += 5;
  var images = html.match(/<img[^>]*>/gi) || [];
  var altImages = images.filter(function (img) { return /alt\s*=/i.test(img); }).length;
  var missingAlt = images.length - altImages;
  score -= missingAlt * 5;
  return Math.max(0, Math.min(100, score));
}

// ─────────────────────────────────────────────────────────────
//  RECOMMENDATIONS
// ─────────────────────────────────────────────────────────────

function generateRecommendationsRaw(wordCount, textRatio, isThin, headings, readability, eeaScore, snippetScore, images, links, social, perf, schema, canonical, securityHeaders) {
  var critical = [], high = [], medium = [], low = [];

  if (isThin) critical.push({ issue: 'Thin Content Detected', impact: 'Pages with fewer than 300 words and a text-to-HTML ratio below 15% lack sufficient substance to rank well in search results. Expanding your content is critical for visibility.', solution: 'Expand your content to at least 600 words. Add detailed paragraphs, examples, data, and visuals. Ensure the text-to-HTML ratio is above 20%.', codeExample: '<article>\n  <h1>Complete Guide to On-Page SEO for Small Businesses</h1>\n  <p>On-page SEO is the practice of optimizing individual web pages to rank higher in search engines and earn more relevant traffic. Unlike off-page SEO which focuses on backlinks, on-page SEO gives you full control over every element on your site. This guide covers the essential factors every small business owner needs to know to improve their search visibility and attract more customers through organic traffic.</p>\n  <h2>Why Title Tags Matter for Search Rankings</h2>\n  <p>The title tag is the first thing users see in search results. It should include your primary keyword near the beginning, stay under 60 characters to avoid truncation, and provide a clear reason to click. For example, a local bakery might use "Fresh Artisan Bread in Portland | Portland Bakery" rather than just "Home". A compelling title tag can improve click-through rate by up to 30% compared to a generic title.</p>\n  <h2>How to Write Meta Descriptions That Drive Clicks</h2>\n  <p>Meta descriptions are the short snippets beneath your title in search results. While they are not a direct ranking factor, they significantly impact click-through rate. A well-crafted meta description of 150-160 characters should summarize the page value, include a call to action, and naturally incorporate the target keyword. Pages with optimized meta descriptions see 5-10% higher CTR on average according to industry studies. Write unique descriptions for every page rather than using boilerplate text.</p>\n  <h2>Heading Structure and Content Organization</h2>\n  <p>Search engines use heading tags to understand the hierarchy of your content. The H1 should contain your primary keyword and match the page topic. H2 tags divide the content into major sections, while H3 tags break those sections into subtopics. Studies show that pages with clear heading hierarchies rank better because they signal comprehensive topic coverage to search engines. Avoid skipping heading levels such as jumping from H2 directly to H4, as this creates confusion for both users and crawlers.</p>\n  <p>Each section of your content should address a specific aspect of the topic. Use short paragraphs of 2-4 sentences to maintain readability, especially on mobile devices where users tend to scan rather than read in depth. Including bulleted or numbered lists where appropriate can improve user engagement and increase the chances of earning a featured snippet.</p>\n  <h2>Internal Linking and Site Architecture</h2>\n  <p>Internal linking is one of the most overlooked on-page SEO factors. Link to related pages on your site using descriptive anchor text to help search engines understand your site structure and distribute link equity across your pages. A well-linked site allows crawlers to discover all your important content and helps users navigate to relevant information. Aim for 3-5 internal links per page, linking to cornerstone content that covers your most important topics in depth.</p>\n  <h2>Optimizing Images for Search and Speed</h2>\n  <p>Images can enhance user engagement but must be optimized for both search engines and page speed. Use descriptive file names and fill in alt text that accurately describes the image content. Compress images to reduce file size without sacrificing quality, and use modern formats like WebP for better compression. Add width and height attributes to prevent layout shifts, which affect Core Web Vitals scores. A well-optimized image can load in under one second while still looking crisp on retina displays. Google considers page speed a direct ranking factor, and slow image loading is one of the most common causes of poor Core Web Vitals scores across small business websites. Tools like Lighthouse and PageSpeed Insights can help you identify which images need optimization and by how much. Lazy loading below-the-fold images with the loading attribute ensures that only visible images load on page start, improving initial load performance significantly.</p>\n</article>', timeToFix: '30-60 minutes', estimatedImpact: '+40% ranking potential' });
  if (headings.h1 === 0) critical.push({ issue: 'Missing H1 Tag', impact: 'Search engines cannot determine the primary topic of the page without an H1 tag.', solution: 'Add exactly one H1 tag at the top of your main content area containing your primary keyword.', codeExample: '<h1>Your Primary Keyword Here | Brand Name</h1>', timeToFix: '2 minutes', estimatedImpact: '+10% ranking potential' });
  else if (headings.h1 > 1) critical.push({ issue: 'Multiple H1 Tags Found', impact: 'Having more than one H1 tag dilutes the topical focus of the page and confuses search engines.', solution: 'Keep exactly one H1 tag. Convert additional H1 tags to H2 or H3 as appropriate.', codeExample: '<h1>Primary Topic</h1>\n<h2>Sub-topic 1</h2>\n<h2>Sub-topic 2</h2>', timeToFix: '5 minutes', estimatedImpact: '+8% ranking potential' });
  if (!schema.typesFound || schema.typesFound.length === 0) critical.push({ issue: 'No Schema Markup Found', impact: 'Pages without schema markup miss out on rich snippets in search results, which can improve CTR by up to 30%.', solution: 'Add JSON-LD structured data appropriate for your content type (Article, Product, LocalBusiness, etc.).', codeExample: '<script type="application/ld+json">\n{\n  "@context": "https://schema.org",\n  "@type": "Article",\n  "headline": "Page Title",\n  "author": { "@type": "Person", "name": "Author Name" },\n  "datePublished": "2025-01-01"\n}\n</script>', timeToFix: '15 minutes', estimatedImpact: '+25% CTR potential' });

  if (wordCount < 600) high.push({ issue: 'Low Word Count', impact: 'Pages with fewer than 600 words often lack the depth needed to rank competitively for most queries.', solution: 'Expand your content to 600-1500 words. Cover the topic comprehensively with subheadings, examples, and supporting data.', codeExample: 'Aim for:\n- Introduction: 50-100 words\n- 3-5 sections: 100-200 words each\n- Conclusion: 50-100 words', timeToFix: '20-40 minutes', estimatedImpact: '+20% ranking potential' });
  if (eeaScore < 30) high.push({ issue: 'Weak E-E-A-T Signals', impact: 'Google prioritizes content that demonstrates Experience, Expertise, Authoritativeness, and Trustworthiness. Low E-E-A-T signals can hurt rankings, especially for YMYL topics.', solution: 'Add structured author data with schema.org JSON-LD, visible publication dates, semantic HTML5 time tags, author bios, and citations from authoritative sources (.gov, .edu, .org). Avoid nofollow on citations to preserve authority flow.', codeExample: '<script type="application/ld+json">\n{\n  "@context": "https://schema.org",\n  "@type": "Article",\n  "headline": "Page Title",\n  "author": {\n    "@type": "Person",\n    "name": "Dr. Jane Smith",\n    "url": "https://example.com/authors/jane-smith"\n  },\n  "datePublished": "2025-01-15",\n  "dateModified": "2025-06-01"\n}\n</script>\n<article>\n  <p>By <a href="/authors/jane-smith">Dr. Jane Smith</a> | <time datetime="2025-01-15">January 15, 2025</time></p>\n  <p>According to <a href="https://example.edu/research">University Research</a>, the findings confirm...</p>\n</article>', timeToFix: '30 minutes', estimatedImpact: '+15% ranking potential' });
  if (images.missingAlt > 0) high.push({ issue: 'Images Missing Alt Text', impact: 'Screen readers cannot describe images without alt text, hurting accessibility. Google also uses alt text to understand image content.', solution: 'Add descriptive alt text to every image that conveys information. Use empty alt="" for decorative images.', codeExample: '<img src="chart.png" alt="Bar chart showing 40% revenue growth in Q3 2025">\n<img src="decoration.png" alt="">', timeToFix: '10 minutes', estimatedImpact: '+5% image search visibility' });
  if (social.missing && social.missing.length > 0) high.push({ issue: 'Missing Social Media Meta Tags', impact: 'Without Open Graph and Twitter Card tags, your page will not render properly when shared on social media platforms.', solution: 'Add og:title, og:description, og:image, and twitter:card meta tags to the page head.', codeExample: '<meta property="og:title" content="Your Page Title">\n<meta property="og:description" content="Compelling description">\n<meta property="og:image" content="https://example.com/image.jpg">\n<meta name="twitter:card" content="summary_large_image">', timeToFix: '10 minutes', estimatedImpact: '+12% social engagement' });
  if (perf.renderBlocking > 0) high.push({ issue: 'Render-Blocking Resources Detected', impact: 'Scripts and stylesheets in the <head> without async/defer delay page rendering, increasing Largest Contentful Paint (LCP) time.', solution: 'Add async or defer attributes to non-critical scripts. Move non-critical CSS to load after the initial render.', codeExample: '<script src="analytics.js" defer></script>\n<script src="widget.js" async></script>\n<link rel="preload" href="critical.css" as="style" onload="this.onload=null;this.rel=\'stylesheet\'">', timeToFix: '15 minutes', estimatedImpact: '+8% LCP improvement' });

  if (readability.fleschKincaid < 50) medium.push({ issue: 'Low Readability Score', impact: 'Content that is difficult to read (Flesch-Kincaid below 50) may frustrate visitors and increase bounce rates.', solution: 'Use shorter sentences, simpler words, and more paragraph breaks. Aim for a Flesch-Kincaid score above 60.', codeExample: 'Before:\n"The implementation of strategic SEO methodologies requires comprehensive analysis of multiple ranking factors."\n\nAfter:\n"Good SEO requires analyzing many ranking factors. Start with the basics and build up."', timeToFix: '20 minutes', estimatedImpact: '+7% engagement' });
  if (!canonical.isValid && canonical.url) medium.push({ issue: 'Canonical URL Mismatch', impact: 'A mismatched or missing canonical URL can cause duplicate content issues and dilute ranking signals.', solution: 'Set the canonical URL to point to the preferred version of the page. Ensure it matches the page URL exactly.', codeExample: '<link rel="canonical" href="https://example.com/current-page-url/">', timeToFix: '5 minutes', estimatedImpact: '+5% ranking stability' });
  if (images.outdatedFormats > 0) medium.push({ issue: 'Outdated Image Formats Detected', impact: 'JPEG, PNG, and GIF images are larger than modern WebP and AVIF formats, slowing page load times.', solution: 'Convert images to modern WebP or AVIF formats for better compression and faster loading.', codeExample: '<!-- Convert with: cwebp -q 80 input.jpg -o output.webp -->\n<img src="image.webp" alt="Description" width="800" height="600">', timeToFix: '15 minutes', estimatedImpact: '+6% page speed' });
  if (images.notLazyLoaded > 5) medium.push({ issue: 'Images Not Lazy Loaded', impact: 'Loading all images upfront increases initial page weight and delays the Largest Contentful Paint.', solution: 'Add loading="lazy" to all below-the-fold images to defer their loading until needed.', codeExample: '<img src="hero.jpg" alt="Hero" loading="eager">\n<img src="gallery-1.jpg" alt="Gallery" loading="lazy">\n<img src="gallery-2.jpg" alt="Gallery" loading="lazy">', timeToFix: '10 minutes', estimatedImpact: '+5% LCP improvement' });
  if (links.poorAnchorText && links.poorAnchorText.length > 0) medium.push({ issue: 'Poor Anchor Text Detected', impact: 'Generic anchor text like "click here" or "read more" provides no context to search engines about the linked page.', solution: 'Replace generic anchor text with descriptive, keyword-rich phrases that describe the destination.', codeExample: 'Bad: <a href="/guide">Click here</a> to read our guide.\nGood: <a href="/guide">Read our comprehensive SEO guide</a>.', timeToFix: '10 minutes', estimatedImpact: '+4% link equity' });
  if (snippetScore < 40) medium.push({ issue: 'Low Featured Snippet Optimization', impact: 'Your page is not optimized for featured snippets, missing the opportunity to appear in position zero.', solution: 'Add structured lists, FAQ schema, and clear definition patterns. Answer common questions directly with concise paragraphs.', codeExample: '<h2>What is featured snippet optimization?</h2>\n<p>Featured snippet optimization is the practice of structuring content...</p>\n<ul>\n  <li>Use clear headings that match question phrases</li>\n  <li>Provide direct answers in the first paragraph</li>\n  <li>Include ordered and unordered lists</li>\n</ul>', timeToFix: '30 minutes', estimatedImpact: '+10% organic visibility' });
  if (perf.domSize > 1500) medium.push({ issue: 'Large DOM Size', impact: 'A DOM with more than 1,500 elements can slow down page rendering and interactivity, affecting INP scores.', solution: 'Simplify the HTML structure. Remove unnecessary wrapper elements, consolidate repeated patterns, and use semantic HTML efficiently.', codeExample: '// Before: deeply nested wrappers\n<div><div><div><p>Text</p></div></div></div>\n\n// After: minimal structure\n<p>Text</p>', timeToFix: '20 minutes', estimatedImpact: '+4% INP improvement' });

  if (!securityHeaders.hsts) low.push({ issue: 'Missing HSTS Header', impact: 'Without Strict-Transport-Security, the page may be served over unencrypted HTTP if the user types http://.', solution: 'Add the Strict-Transport-Security header with a minimum age of 1 year to force HTTPS connections.', codeExample: 'Strict-Transport-Security: max-age=31536000; includeSubDomains; preload', timeToFix: '5 minutes', estimatedImpact: '+3% security score' });
  if (!securityHeaders.xFrame) low.push({ issue: 'Missing X-Frame-Options Header', impact: 'Without X-Frame-Options, your page can be embedded in iframes on other domains (clickjacking risk).', solution: 'Add X-Frame-Options: SAMEORIGIN or DENY to prevent clickjacking attacks.', codeExample: 'X-Frame-Options: SAMEORIGIN', timeToFix: '2 minutes', estimatedImpact: '+2% security score' });

  return { critical: critical, high: high, medium: medium, low: low };
}
