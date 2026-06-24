// ─────────────────────────────────────────────────────────────
//  Unified SEO Analyzer — Cloudflare Worker
//  Single endpoint:  GET /api/full-audit?url=https://example.com
//  No external dependencies — Vanilla JS, Web APIs only
// ─────────────────────────────────────────────────────────────

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Max-Age': '86400',
};

addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // CORS preflight
  if (event.request.method === 'OPTIONS') {
    return event.respondWith(new Response(null, {
      status: 200,
      headers: CORS_HEADERS,
    }));
  }

  if (url.pathname.replace(/\/+$/, '') === '/api/full-audit' && event.request.method === 'GET') {
    return event.respondWith(handleAudit(event.request));
  }

  return event.respondWith(new Response('Not Found', {
    status: 404,
    headers: CORS_HEADERS,
  }));
});

async function handleAudit(request) {
  const url = new URL(request.url);
  const targetUrl = url.searchParams.get('url');
  if (!targetUrl) {
    return jsonResponse({ error: 'Missing ?url parameter' }, 400);
  }

  try {
    const result = await performFullAudit(targetUrl);
    return jsonResponse(result);
  } catch (err) {
    return jsonResponse({ error: err.message }, 500);
  }
}

// ─────────────────────────────────────────────────────────────
//  PHASE 1: Fetch & Technical Foundation
// ─────────────────────────────────────────────────────────────

async function performFullAudit(targetUrl) {
  // Normalize URL
  let finalUrl = targetUrl;
  if (!/^https?:\/\//i.test(finalUrl)) {
    finalUrl = 'https://' + finalUrl;
  }

  // Fetch with redirect tracking
  const redirectChain = [];
  let response;
  let currentUrl = finalUrl;

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
  const html = await response.text();
  const headers = {};

  response.headers.forEach((value, key) => {
    headers[key.toLowerCase()] = value;
  });

  // ───────────────────────────────────────────────────────────
  //  PHASE 2: Content Deep Analysis
  // ───────────────────────────────────────────────────────────

  const contentAnalysis = analyzeContent(html, finalUrl, headers);
  const technicalAnalysis = analyzeTechnical(html, finalUrl, headers);
  const performanceAnalysis = analyzePerformance(html);
  const imageAnalysis = analyzeImages(html);
  const linkAnalysis = analyzeLinks(html, finalUrl);
  const socialAnalysis = analyzeSocial(html);
  const keywordAnalysis = analyzeKeywords(html);
  const entityAnalysis = analyzeEntities(html);
  const accessibilityAnalysis = analyzeAccessibility(html);

  // ───────────────────────────────────────────────────────────
  //  PHASE 4: Calculate Final Scores
  // ───────────────────────────────────────────────────────────

  const scores = calculateScores({
    content: contentAnalysis,
    technical: technicalAnalysis,
    performance: performanceAnalysis,
    images: imageAnalysis,
    links: linkAnalysis,
    social: socialAnalysis,
    accessibility: accessibilityAnalysis,
  });

  return {
    url: finalUrl,
    redirectChain,
    scores,
    content: {
      wordCount: contentAnalysis.wordCount,
      textRatio: contentAnalysis.textRatio,
      headings: contentAnalysis.headings,
      isThin: contentAnalysis.isThin,
      verdict: contentAnalysis.verdict,
      readability: contentAnalysis.readability,
      eeaScore: contentAnalysis.eeaScore,
      freshnessScore: contentAnalysis.freshnessScore,
      snippetScore: contentAnalysis.snippetScore,
    },
    technical: {
      schema: technicalAnalysis.schema,
      canonical: technicalAnalysis.canonical,
      hreflang: technicalAnalysis.hreflang,
      securityHeaders: technicalAnalysis.securityHeaders,
      httpHeaders: technicalAnalysis.httpHeaders,
    },
    performance: {
      renderBlockingResources: performanceAnalysis.renderBlockingResources,
      imagesWithoutDimensions: imageAnalysis.missingDimensions,
      totalDOMElements: performanceAnalysis.totalDOMElements,
      predictedCWVIssues: performanceAnalysis.predictedCWVIssues,
      jsRenderingRisks: performanceAnalysis.jsRenderingRisks,
    },
    images: {
      total: imageAnalysis.total,
      missingAlt: imageAnalysis.missingAlt,
      missingDimensions: imageAnalysis.missingDimensions,
      outdatedFormats: imageAnalysis.outdatedFormats,
      notLazyLoaded: imageAnalysis.notLazyLoaded,
    },
    links: {
      internal: linkAnalysis.internal,
      external: linkAnalysis.external,
      orphanParagraphs: linkAnalysis.orphanParagraphs,
      anchorTextDistribution: linkAnalysis.anchorTextDistribution,
    },
    social: {
      ogTitle: socialAnalysis.ogTitle,
      ogDescription: socialAnalysis.ogDescription,
      ogImage: socialAnalysis.ogImage,
      twitterCard: socialAnalysis.twitterCard,
      missingTags: socialAnalysis.missingTags,
    },
    keywords: keywordAnalysis.slice(0, 15),
    entities: entityAnalysis.slice(0, 20),
    accessibility: {
      score: accessibilityAnalysis.score,
      issues: accessibilityAnalysis.issues,
    },
    jsRenderingRisks: performanceAnalysis.jsRenderingRisks,
  };
}

// ─────────────────────────────────────────────────────────────
//  CONTENT ANALYSIS
// ─────────────────────────────────────────────────────────────

function analyzeContent(html, url, headers) {
  const cleaned = stripNoise(html);
  const text = extractText(cleaned);
  const wordCount = countWords(text);
  const textLen = text.length;
  const htmlLen = html.length;
  const textRatio = htmlLen > 0 ? Math.round((textLen / htmlLen) * 100) : 0;

  // Headings
  const headings = extractHeadings(html);

  // Paragraph analysis
  const paraCount = (cleaned.match(/<p[^>]*>/gi) || []).length;
  const avgWordsPerPara = paraCount > 0 ? Math.round(wordCount / paraCount) : 0;

  // Sentence analysis
  const sentences = text.split(/[.!?]+/).filter(Boolean);
  const sentenceCount = sentences.length;
  const avgWordsPerSentence = sentenceCount > 0 ? Math.round(wordCount / sentenceCount) : 0;

  const isThin = wordCount < 300 || textRatio < 15;

  let verdict;
  if (isThin) {
    verdict = 'Content is thin. Add more substantial content (aim for 600+ words).';
  } else if (wordCount >= 1500 && headings.h1 >= 1 && headings.h2 >= 3) {
    verdict = 'Content is comprehensive and well-structured.';
  } else if (wordCount >= 600) {
    verdict = 'Content is adequate but could be improved with more structure and depth.';
  } else {
    verdict = 'Content is below average length. Consider expanding.';
  }

  // Readability
  const readability = calculateReadability(text);

  // E-E-A-T
  const eeaScore = calculateEEAT(html, cleaned);
  const freshnessScore = calculateFreshness(html, headers);
  const snippetScore = calculateSnippetScore(html);

  return {
    wordCount,
    textRatio,
    headings,
    isThin,
    verdict,
    readability,
    eeaScore,
    freshnessScore,
    snippetScore,
    paraCount,
    avgWordsPerPara,
    sentenceCount,
    avgWordsPerSentence,
  };
}

function stripNoise(html) {
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
  return text.split(/\s+/).filter(Boolean).length;
}

function extractHeadings(html) {
  const h1 = (html.match(/<h1[^>]*>/gi) || []).length;
  const h2 = (html.match(/<h2[^>]*>/gi) || []).length;
  const h3 = (html.match(/<h3[^>]*>/gi) || []).length;
  const h4 = (html.match(/<h4[^>]*>/gi) || []).length;
  const h5 = (html.match(/<h5[^>]*>/gi) || []).length;
  const h6 = (html.match(/<h6[^>]*>/gi) || []).length;
  return { h1, h2, h3, h4, h5, h6 };
}

// ─────────────────────────────────────────────────────────────
//  READABILITY
// ─────────────────────────────────────────────────────────────

function calculateReadability(text) {
  const words = text.split(/\s+/).filter(Boolean);
  const sentences = text.split(/[.!?]+/).filter(Boolean);
  const wordCount = words.length;
  const sentenceCount = sentences.length || 1;
  const syllableCount = words.reduce((sum, w) => sum + countSyllables(w), 0);

  // Flesch-Kincaid Reading Ease
  const fk = 206.835 - 1.015 * (wordCount / sentenceCount) - 84.6 * (syllableCount / wordCount);

  // Gunning Fog Index
  const complexWords = words.filter((w) => countSyllables(w) >= 3).length;
  const gf = 0.4 * (wordCount / sentenceCount + 100 * (complexWords / wordCount));

  // Complex sentences (over 25 words)
  const complexSentences = sentences.filter((s) => s.split(/\s+/).filter(Boolean).length > 25).length;

  // Passive voice heuristic
  const passivePattern = /\b(is|was|were|been|being|are|be)\s+\w+ed\b/gi;
  const passiveMatches = text.match(passivePattern);
  const passiveCount = passiveMatches ? passiveMatches.length : 0;

  return {
    fleschKincaid: Math.round(Math.max(0, Math.min(100, fk))),
    gunningFog: Math.round(Math.max(0, Math.min(30, gf))),
    complexSentences,
    passiveVoiceCount: passiveCount,
  };
}

function countSyllables(word) {
  word = word.toLowerCase().replace(/[^a-z]/g, '');
  if (word.length <= 3) return 1;
  word = word.replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/, '');
  word = word.replace(/^y/, '');
  const syl = word.match(/[aeiouy]{1,2}/g);
  return syl ? syl.length : 1;
}

// ─────────────────────────────────────────────────────────────
//  E-E-A-T SIGNALS
// ─────────────────────────────────────────────────────────────

function calculateEEAT(html, cleaned) {
  let score = 0;

  // Author information
  const hasRelAuthor = /rel=["']author["']/i.test(html);
  const hasAuthorMeta = /<meta\s+[^>]*name=["']author["'][^>]*>/i.test(html);
  const hasByline = /by\s+[A-Z][a-z]+(?:\s+[A-Z][a-z]+)?(?:\s*<\/|,\s|<)/.test(cleaned);
  if (hasRelAuthor || hasAuthorMeta || hasByline) score += 20;

  // Publication date
  const hasDatePublished = /datePublished|article:published_time/i.test(html);
  if (hasDatePublished) score += 15;

  // Modification date
  const hasDateModified = /dateModified|article:modified_time/i.test(html);
  if (hasDateModified) score += 10;

  // About page links
  if (/about/i.test(html)) score += 10;

  // Citation links (outbound to authoritative domains)
  const citationDomains = html.match(/https?:\/\/(?:www\.)?([^\/"'\s]+)/gi) || [];
  const authoritative = citationDomains.filter((d) =>
    /\.(gov|edu|org|wikipedia|who\.int|nih\.gov|webmd|mayoclinic)\./i.test(d)
  );
  if (authoritative.length > 0) score += Math.min(15, authoritative.length * 5);

  // Author bio sections
  if (/author-bio|about-the-author|writer\s*bio/i.test(html)) score += 10;

  // Word count signal
  const words = cleaned.replace(/<[^>]+>/g, ' ').split(/\s+/).filter(Boolean).length;
  if (words >= 1500) score += 15;
  else if (words >= 600) score += 10;
  else if (words >= 300) score += 5;

  // Schema.org Person/Organization
  if (/schema\.org\/(Person|Organization)/i.test(html)) score += 5;

  return Math.min(100, score);
}

// ─────────────────────────────────────────────────────────────
//  CONTENT FRESHNESS
// ─────────────────────────────────────────────────────────────

function calculateFreshness(html, headers) {
  let score = 0;

  // Last-Modified header
  const lastMod = headers['last-modified'];
  if (lastMod) {
    const daysSinceMod = (Date.now() - new Date(lastMod).getTime()) / 86400000;
    if (daysSinceMod < 30) score += 30;
    else if (daysSinceMod < 90) score += 20;
    else if (daysSinceMod < 365) score += 10;
  }

  // dateModified in schema/meta
  if (/dateModified|article:modified_time/i.test(html)) score += 20;

  // Year mentions
  const currentYear = new Date().getFullYear();
  const lastYear = currentYear - 1;
  const yearRegex = new RegExp(`\\b(${currentYear}|${lastYear})\\b`, 'g');
  const yearMatches = html.match(yearRegex);
  if (yearMatches) {
    score += Math.min(30, yearMatches.length * 5);
  }

  // Recent blog patterns
  if (/\b(20\d{2})\/(0[1-9]|1[0-2])\/(0[1-9]|[12]\d|3[01])\b/.test(html)) score += 10;

  // Published date in last 3 months
  const pubDateMatch = html.match(/(?:published|posted|updated|created)(?:\s*on)?:?\s*([A-Z][a-z]+)\s+(\d{1,2}),?\s+(\d{4})/i);
  if (pubDateMatch) {
    const pubDate = new Date(pubDateMatch[0]);
    const daysSincePub = (Date.now() - pubDate.getTime()) / 86400000;
    if (daysSincePub < 90) score += 10;
  }

  return Math.min(100, score);
}

// ─────────────────────────────────────────────────────────────
//  FEATURED SNIPPET OPTIMIZATION
// ─────────────────────────────────────────────────────────────

function calculateSnippetScore(html) {
  let score = 0;

  // FAQ schema
  if (/faqpage|FAQPage/i.test(html)) score += 25;

  // Question patterns
  const sentences = html.match(/[A-Z][^.!?]*\?/g);
  if (sentences) score += Math.min(25, sentences.length * 5);

  // List structures
  const lists = (html.match(/<ol[^>]*>[\s\S]*?<\/ol>/gi) || []).length +
                (html.match(/<ul[^>]*>[\s\S]*?<\/ul>/gi) || []).length;
  if (lists > 0) score += Math.min(20, lists * 5);

  // Definition patterns
  const definitions = html.match(/<dt[^>]*>/gi) || [];
  if (definitions.length > 0) score += 15;

  // How-to/step patterns
  if (/how\s+to|steps?\s*:|\d+\.\s+[A-Z]/i.test(html)) score += 15;

  return Math.min(100, score);
}

// ─────────────────────────────────────────────────────────────
//  IMAGE ANALYSIS
// ─────────────────────────────────────────────────────────────

function analyzeImages(html) {
  const imgRegex = /<img[^>]*>/gi;
  const images = html.match(imgRegex) || [];
  let missingAlt = 0;
  let missingDimensions = 0;
  let outdatedFormats = 0;
  let notLazyLoaded = 0;

  images.forEach((img) => {
    if (!/alt\s*=/i.test(img)) missingAlt++;
    if (!/width\s*=/i.test(img) || !/height\s*=/i.test(img)) missingDimensions++;
    if (/\.(jpg|jpeg|png|gif)(["'\s?>]|$)/i.test(img)) outdatedFormats++;
    if (!/loading\s*=\s*["']lazy["']/i.test(img)) notLazyLoaded++;
  });

  return {
    total: images.length,
    missingAlt,
    missingDimensions,
    outdatedFormats,
    notLazyLoaded,
  };
}

// ─────────────────────────────────────────────────────────────
//  LINK ANALYSIS
// ─────────────────────────────────────────────────────────────

function analyzeLinks(html, baseUrl) {
  const linkRegex = /<a\s+[^>]*href\s*=\s*["']([^"']*)["'][^>]*>([\s\S]*?)<\/a>/gi;
  let match;
  let internal = 0;
  let external = 0;
  const anchorTexts = {};
  const baseHost = new URL(baseUrl).hostname.replace(/^www\./, '');

  while ((match = linkRegex.exec(html)) !== null) {
    const href = match[1].trim();
    const anchorText = extractText(match[2]).trim();

    if (!href || href.startsWith('#') || href.startsWith('javascript:')) continue;

    if (anchorText) {
      const lower = anchorText.toLowerCase();
      anchorTexts[lower] = (anchorTexts[lower] || 0) + 1;
    }

    try {
      const linkHost = new URL(href, baseUrl).hostname.replace(/^www\./, '');
      if (linkHost === baseHost) {
        internal++;
      } else {
        external++;
      }
    } catch {
      internal++;
    }
  }

  // Orphan paragraphs
  const paragraphs = html.match(/<p[^>]*>[\s\S]*?<\/p>/gi) || [];
  let orphanParagraphs = 0;
  paragraphs.forEach((p) => {
    if (!/<a\s+/i.test(p)) orphanParagraphs++;
  });

  const anchorTextDistribution = Object.entries(anchorTexts)
    .filter(([text]) => text.length > 0)
    .map(([text, count]) => ({ text, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  return { internal, external, orphanParagraphs, anchorTextDistribution };
}

// ─────────────────────────────────────────────────────────────
//  SCHEMA MARKUP DEEP VALIDATION
// ─────────────────────────────────────────────────────────────

function analyzeSchema(html) {
  const types = [];
  const errors = [];

  // JSON-LD
  const jsonldRegex = /<script\s+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
  let match;
  while ((match = jsonldRegex.exec(html)) !== null) {
    try {
      const data = JSON.parse(match[1].trim());
      const extractTypes = (obj) => {
        if (obj['@type']) {
          if (Array.isArray(obj['@type'])) {
            obj['@type'].forEach((t) => types.push(t));
          } else {
            types.push(obj['@type']);
          }
        }
        if (obj['@graph']) {
          obj['@graph'].forEach((item) => extractTypes(item));
        }
      };
      extractTypes(data);
    } catch {
      errors.push('Invalid JSON-LD syntax found');
    }
  }

  // Microdata
  const microdataItems = html.match(/itemtype\s*=\s*["']([^"']+)["']/gi) || [];
  microdataItems.forEach((item) => {
    const type = item.replace(/itemtype\s*=\s*/i, '').replace(/["']/g, '');
    if (type && !types.includes(type)) types.push(type);
  });

  // Required properties check
  const typeChecks = {
    Article: ['headline', 'datePublished', 'author'],
    Product: ['name', 'offers'],
    Recipe: ['name', 'recipeIngredient'],
    LocalBusiness: ['name', 'address'],
    Event: ['name', 'startDate', 'location'],
    Organization: ['name'],
    Person: ['name'],
    BreadcrumbList: ['itemListElement'],
    FAQPage: ['mainEntity'],
    HowTo: ['name', 'step'],
    Review: ['itemReviewed', 'reviewRating'],
    SoftwareApplication: ['name', 'applicationCategory'],
  };

  types.forEach((type) => {
    const shortType = type.split('/').pop() || type;
    if (typeChecks[shortType]) {
      typeChecks[shortType].forEach((prop) => {
        if (!new RegExp(`"${prop}"\\s*:`).test(html) &&
            !new RegExp(`itemprop\\s*=\\s*["']${prop}["']`, 'i').test(html)) {
          errors.push(`${shortType}: missing required property "${prop}"`);
        }
      });
    }
  });

  return {
    types: [...new Set(types)].map((t) => (t.includes('/') ? t.split('/').pop() : t)),
    errors: [...new Set(errors)],
  };
}

// ─────────────────────────────────────────────────────────────
//  TECHNICAL SEO
// ─────────────────────────────────────────────────────────────

function analyzeTechnical(html, url, headers) {
  const schema = analyzeSchema(html);

  // Canonical
  const canonicalMatch = html.match(/<link\s+[^>]*rel=["']canonical["'][^>]*href=["']([^"']*)["'][^>]*\/?>/i);
  const canonicalUrl = canonicalMatch ? canonicalMatch[1] : null;
  const canonical = {
    url: canonicalUrl || 'Not set',
    isValid: canonicalUrl ? canonicalUrl.replace(/\/$/, '') === url.replace(/\/$/, '') : false,
    isSelfReferencing: canonicalUrl ? canonicalUrl.replace(/\/$/, '') === url.replace(/\/$/, '') : false,
  };

  // Hreflang
  const hreflangTags = html.match(/<link\s+[^>]*rel=["']alternate["'][^>]*hreflang=["']([^"']*)["'][^>]*href=["']([^"']*)["'][^>]*\/?>/gi) || [];
  const hreflang = {
    detected: hreflangTags.length > 0,
    errors: [],
  };
  if (hreflangTags.length > 0) {
    const langs = hreflangTags.map((t) => {
      const langMatch = t.match(/hreflang=["']([^"']*)["']/i);
      return langMatch ? langMatch[1] : null;
    }).filter(Boolean);
    if (!langs.includes('x-default')) {
      hreflang.errors.push('No x-default hreflang tag found');
    }
  }

  // Security headers
  const securityHeaders = {
    hasHSTS: !!headers['strict-transport-security'],
    hasXFrame: !!headers['x-frame-options'],
    hasXContentType: !!headers['x-content-type-options'],
    hasCSP: !!headers['content-security-policy'],
    hasReferrerPolicy: !!headers['referrer-policy'],
    hasXRobotsTag: !!headers['x-robots-tag'],
  };

  // HTTP headers summary
  const httpHeaders = {
    cacheControl: headers['cache-control'] || null,
    lastModified: headers['last-modified'] || null,
    eTag: headers['etag'] || null,
    contentEncoding: headers['content-encoding'] || null,
    serverTiming: headers['server-timing'] || null,
  };

  return { schema, canonical, hreflang, securityHeaders, httpHeaders };
}

// ─────────────────────────────────────────────────────────────
//  PERFORMANCE / CORE WEB VITALS ANALYSIS
// ─────────────────────────────────────────────────────────────

function analyzePerformance(html) {
  const issues = [];

  // Render-blocking resources
  const headScripts = html.match(/<head[^>]*>[\s\S]*?<\/head>/i);
  const headContent = headScripts ? headScripts[0] : '';
  const scriptsInHead = headContent.match(/<script[^>]*src=["']([^"']*)["'][^>]*>/gi) || [];
  const blockingScripts = scriptsInHead.filter((s) =>
    !/async|defer/i.test(s) && !/type=["']application\/ld\+json["']/i.test(s)
  );
  const renderBlockingResources = blockingScripts.length;

  if (renderBlockingResources > 0) {
    issues.push(`${renderBlockingResources} render-blocking script(s) in <head> without async/defer`);
  }

  // DOM size
  const totalDOMElements = (html.match(/<[a-zA-Z_][^>]*>/g) || []).length;
  if (totalDOMElements > 1500) {
    issues.push(`Large DOM size (${totalDOMElements} elements) — may impact rendering performance`);
  }

  // Layout shift risk
  const imagesWithoutDimensions = (html.match(/<img\s+(?![^>]*\b(width|height)\s*=)/gi) || []).length;
  if (imagesWithoutDimensions > 0) {
    issues.push(`CLS risk: ${imagesWithoutDimensions} image(s) missing width/height dimensions`);
  }

  // Font loading
  if (!/font-display:\s*swap/i.test(html)) {
    issues.push('No font-display: swap detected — may cause invisible text during font load');
  }

  return {
    renderBlockingResources,
    totalDOMElements,
    predictedCWVIssues: issues,
    jsRenderingRisks: [],
  };
}

// ─────────────────────────────────────────────────────────────
//  SEMANTIC HTML & ACCESSIBILITY
// ─────────────────────────────────────────────────────────────

function analyzeAccessibility(html) {
  let score = 0;
  const issues = [];

  // Semantic elements
  const hasArticle = /<article[^>]*>/i.test(html);
  const hasSection = /<section[^>]*>/i.test(html);
  const hasAside = /<aside[^>]*>/i.test(html);
  const hasMain = /<main[^>]*>/i.test(html);
  const semanticCount = [hasArticle, hasSection, hasAside, hasMain].filter(Boolean).length;
  score += semanticCount * 10;

  if (!hasMain) issues.push('No <main> landmark element found');
  if (!hasArticle && !hasSection) issues.push('No <article> or <section> elements for content structure');

  // ARIA labels
  const ariaLabels = (html.match(/aria-label\s*=\s*["']/gi) || []).length;
  const ariaLabelledby = (html.match(/aria-labelledby\s*=\s*["']/gi) || []).length;
  if (ariaLabels + ariaLabelledby > 0) score += Math.min(20, (ariaLabels + ariaLabelledby) * 5);

  // Form labels
  const inputs = (html.match(/<input[^>]*>/gi) || []).length;
  if (inputs > 0) {
    const labels = (html.match(/<label[^>]*>/gi) || []).length;
    const ariaLabelsOnInputs = (html.match(/<input[^>]+aria-label\s*=/gi) || []).length;
    if (labels + ariaLabelsOnInputs >= inputs) score += 15;
    else issues.push(`${inputs - labels - ariaLabelsOnInputs} input(s) missing associated label`);
  }

  // Alt text
  const images = html.match(/<img[^>]*>/gi) || [];
  const altImages = images.filter((img) => /alt\s*=/i.test(img)).length;
  const missingAlt = images.length - altImages;
  if (missingAlt > 0) {
    issues.push(`${missingAlt} image(s) missing alt text`);
    score -= missingAlt * 5;
  }

  // Skip navigation
  if (/skip\s*(to\s*content|navigation|nav|main)/i.test(html)) score += 10;
  else issues.push('No skip navigation link detected');

  // Heading hierarchy
  const h1Count = (html.match(/<h1[^>]*>/gi) || []).length;
  if (h1Count === 0) issues.push('No H1 heading found');
  else if (h1Count > 1) issues.push(`${h1Count} H1 headings found — should be exactly 1`);

  // Language attribute
  if (/lang\s*=\s*["']/i.test(html)) score += 5;
  else issues.push('No lang attribute on <html> element');

  score = Math.max(0, Math.min(100, score));

  return { score, issues };
}

// ─────────────────────────────────────────────────────────────
//  SOCIAL MEDIA OPTIMIZATION
// ─────────────────────────────────────────────────────────────

function analyzeSocial(html) {
  const getMetaContent = (prop) => {
    const regex = new RegExp(`<meta\\s+[^>]*(?:property|name)\\s*=\\s*["']${prop}["'][^>]*content\\s*=\\s*["']([^"']*)["']`, 'i');
    const match = html.match(regex);
    return match ? match[1] : null;
  };

  const ogTitle = getMetaContent('og:title');
  const ogDescription = getMetaContent('og:description');
  const ogImage = getMetaContent('og:image');
  const ogUrl = getMetaContent('og:url');
  const ogType = getMetaContent('og:type');
  const twitterCard = getMetaContent('twitter:card');

  const missingTags = [];
  if (!ogTitle) missingTags.push('og:title');
  if (!ogDescription) missingTags.push('og:description');
  if (!ogImage) missingTags.push('og:image');
  if (!ogUrl) missingTags.push('og:url');

  return {
    ogTitle: ogTitle || null,
    ogDescription: ogDescription || null,
    ogImage: ogImage || null,
    ogUrl: ogUrl || null,
    ogType: ogType || null,
    twitterCard: twitterCard || null,
    missingTags,
  };
}

// ─────────────────────────────────────────────────────────────
//  KEYWORD ANALYSIS
// ─────────────────────────────────────────────────────────────

function analyzeKeywords(html) {
  const text = extractText(stripNoise(html)).toLowerCase();
  const stopWords = new Set([
    'a', 'an', 'the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of',
    'by', 'with', 'from', 'as', 'is', 'was', 'were', 'be', 'been', 'being',
    'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'can', 'could',
    'shall', 'should', 'may', 'might', 'must', 'about', 'into', 'through',
    'during', 'before', 'after', 'above', 'below', 'between', 'out', 'off',
    'over', 'under', 'again', 'further', 'then', 'once', 'here', 'there',
    'when', 'where', 'why', 'how', 'all', 'each', 'every', 'both', 'few',
    'more', 'most', 'other', 'some', 'such', 'no', 'nor', 'not', 'only',
    'own', 'same', 'so', 'than', 'too', 'very', 'just', 'because', 'it',
    'its', 'this', 'that', 'these', 'those', 'which', 'who', 'whom', 'what',
  ]);

  const words = text.split(/\s+/).filter((w) => w.length > 2 && !stopWords.has(w));
  const total = words.length;
  const freq = {};

  words.forEach((w) => {
    freq[w] = (freq[w] || 0) + 1;
  });

  const sorted = Object.entries(freq)
    .filter(([, count]) => count > 1)
    .map(([word, count]) => ({
      word,
      count,
      density: total > 0 ? ((count / total) * 100).toFixed(2) + '%' : '0%',
    }))
    .sort((a, b) => b.count - a.count);

  return sorted;
}

// ─────────────────────────────────────────────────────────────
//  ENTITY RECOGNITION (Basic NLP)
// ─────────────────────────────────────────────────────────────

function analyzeEntities(html) {
  const text = extractText(stripNoise(html));
  const entities = [];

  // Find capitalized phrases (potential entities)
  const capitalPhrases = text.match(/\b[A-Z][a-z]+(?:\s+[A-Z][a-z]+){0,3}\b/g) || [];

  // Filter out common false positives
  const commonWords = new Set([
    'The', 'This', 'That', 'These', 'Those', 'First', 'Last', 'Next', 'Previous',
    'About', 'Contact', 'Home', 'Search', 'Menu', 'More', 'Read', 'Click', 'Here',
    'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday',
    'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August',
    'September', 'October', 'November', 'December',
  ]);

  const freq = {};
  capitalPhrases.forEach((phrase) => {
    const words = phrase.split(/\s+/);
    if (words.length >= 2 || (words.length === 1 && phrase.length > 3 && !commonWords.has(phrase))) {
      freq[phrase] = (freq[phrase] || 0) + 1;
    }
  });

  // Known entity types (heuristic)
  const orgIndicators = /(Inc|Corp|LLC|Ltd|Group|Company|University|Institute|Agency|Association|Foundation|Organization|Corporation)/i;
  const personPattern = /^[A-Z][a-z]+\s[A-Z][a-z]+$/;

  Object.entries(freq)
    .filter(([, count]) => count > 1)
    .forEach(([name, mentions]) => {
      let type = 'Unknown';
      if (orgIndicators.test(name)) type = 'Organization';
      else if (personPattern.test(name)) type = 'Person';
      else if (/\b(New|Los|San|Las|Port|Mount|Fort|North|South|East|West)\s[A-Z]/.test(name)) type = 'Location';
      entities.push({ name, type, mentions });
    });

  // Check for Wikipedia/knowledge graph links
  entities.forEach((e) => {
    const encoded = encodeURIComponent(e.name.replace(/\s+/g, '_'));
    if (new RegExp(`wikipedia\\.org/wiki/${encoded}`, 'i').test(html)) {
      e.linkedToKnowledgeGraph = true;
    }
  });

  return entities.sort((a, b) => b.mentions - a.mentions).slice(0, 30);
}

// ─────────────────────────────────────────────────────────────
//  SCORE CALCULATION
// ─────────────────────────────────────────────────────────────

function calculateScores(analysis) {
  const { content, technical, performance, images, links, accessibility } = analysis;

  // Content score (0-100)
  let contentScore = 0;
  if (!content.isThin) contentScore += 20;
  contentScore += Math.min(20, content.wordCount / 100);
  contentScore += content.eeaScore * 0.15;
  contentScore += content.freshnessScore * 0.1;
  contentScore += content.snippetScore * 0.1;
  contentScore += content.readability.fleschKincaid * 0.1;
  if (content.headings.h1 === 1) contentScore += 5;
  contentScore += Math.min(10, content.headings.h2 * 2);
  contentScore = Math.min(100, Math.round(contentScore));

  // Technical score (0-100)
  let technicalScore = 0;
  const sec = technical.securityHeaders;
  if (sec.hasHSTS) technicalScore += 10;
  if (sec.hasXFrame) technicalScore += 10;
  if (sec.hasXContentType) technicalScore += 10;
  if (sec.hasCSP) technicalScore += 10;
  if (sec.hasReferrerPolicy) technicalScore += 5;
  if (technical.canonical.isValid) technicalScore += 15;
  else if (technical.canonical.url !== 'Not set') technicalScore += 5;
  if (technical.schema.types.length > 0) technicalScore += Math.min(15, technical.schema.types.length * 5);
  if (technical.schema.errors.length === 0) technicalScore += 5;
  if (technical.hreflang.detected) technicalScore += 10;
  if (!sec.hasXRobotsTag) technicalScore += 5;
  technicalScore = Math.min(100, Math.round(technicalScore));

  // Performance score (0-100)
  let performanceScore = 70;
  performanceScore -= performance.renderBlockingResources * 5;
  performanceScore -= images.missingDimensions * 3;
  if (performance.totalDOMElements > 1500) performanceScore -= 10;
  performanceScore = Math.max(0, Math.min(100, performanceScore));

  // Accessibility score
  const accessibilityScore = accessibility.score;

  // Overall score
  const overall = Math.round(
    contentScore * 0.35 +
    technicalScore * 0.25 +
    performanceScore * 0.2 +
    accessibilityScore * 0.2
  );

  return {
    overall,
    content: contentScore,
    technical: technicalScore,
    performance: performanceScore,
    accessibility: accessibilityScore,
  };
}

// ─────────────────────────────────────────────────────────────
//  UTILITY
// ─────────────────────────────────────────────────────────────

function jsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      ...CORS_HEADERS,
      'Content-Type': 'application/json',
    },
  });
}
