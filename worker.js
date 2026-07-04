// ─────────────────────────────────────────────────────────────
//  Unified ToolNestr Worker — SEO Analyzer + Networking Tools
//  ES Modules format — No external dependencies
// ─────────────────────────────────────────────────────────────

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

function jsonResponse(data, status) {
  return new Response(JSON.stringify(data), {
    status: status || 200,
    headers: Object.assign({}, corsHeaders, { 'Content-Type': 'application/json' }),
  });
}

// ── IP validation — block SSRF, only accept clean IPv4/IPv6 ──
const IP_V4_REGEX = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/;
const IP_V6_REGEX = /^[0-9a-fA-F:]+$/;

function isValidPublicIp(str) {
  if (IP_V4_REGEX.test(str)) {
    const octets = str.split('.').map(Number);
    if (octets.some(function (o) { return o > 255; })) return false;
    // Reject private/reserved ranges
    if (octets[0] === 10) return false;
    if (octets[0] === 127) return false;
    if (octets[0] === 169 && octets[1] === 254) return false;
    if (octets[0] === 172 && octets[1] >= 16 && octets[1] <= 31) return false;
    if (octets[0] === 192 && octets[1] === 168) return false;
    if (octets[0] === 0) return false;
    if (octets[0] >= 224) return false;
    return true;
  }
  if (IP_V6_REGEX.test(str)) {
    if (str === '::1' || str.toLowerCase() === '::ffff:127.0.0.1') return false;
    return str.length >= 2 && str.length <= 39;
  }
  return false;
}

// ── DoH (DNS-over-HTTPS) helpers ──
async function dohQuery(domain, type, resolver) {
  // Quad9 only supports RFC 8484 wire-format DoH, not the simplified JSON
  // GET style — AdGuard DNS supports the same JSON format as Cloudflare/Google
  // and serves the same "independent third resolver" purpose for propagation checks.
  const endpoints = {
    cloudflare: 'https://1.1.1.1/dns-query?name=' + encodeURIComponent(domain) + '&type=' + type,
    google: 'https://dns.google/resolve?name=' + encodeURIComponent(domain) + '&type=' + type,
    adguard: 'https://dns.adguard-dns.com/resolve?name=' + encodeURIComponent(domain) + '&type=' + type,
  };
  const url = endpoints[resolver] || endpoints.cloudflare;
  const res = await fetch(url, { headers: { 'Accept': 'application/dns-json' } });
  return res.json();
}

function reverseIp(ip) {
  if (IP_V4_REGEX.test(ip)) {
    return ip.split('.').reverse().join('.') + '.in-addr.arpa';
  }
  // IPv6 reverse (simplified for common cases)
  const expanded = ip.replace(/(^|:)0+/g, '$1').replace(/::/, ':' + '0:'.repeat(8 - ip.split(':').length));
  return expanded.replace(/:/g, '').split('').reverse().join('.') + '.ip6.arpa';
}

// DoH resolvers wrap each TXT character-string in double quotes; a multi-string
// TXT record comes back as "part1" "part2" and must be concatenated with no
// separator. Non-TXT records (IPs, hostnames) never start with a quote, so the
// guard makes this a safe no-op for them.
function unquoteTxt(s) {
  if (typeof s !== 'string') return s;
  if (s.charAt(0) === '"' && s.charAt(s.length - 1) === '"') {
    return s.slice(1, -1).replace(/" "/g, '');
  }
  return s;
}

export default {
  async fetch(request, env) {
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    try {
      const url = new URL(request.url);
      const path = url.pathname.replace(/\/+$/, '');
      const method = request.method;

      // ── Route: GSC — list verified sites ──
      if (path === '/api/gsc-sites' && method === 'GET') {
        return handleGscSites(env);
      }

      // ── Route: GSC — list/submit sitemaps ──
      if (path === '/api/gsc-sitemaps' && (method === 'GET' || method === 'POST')) {
        return handleGscSitemaps(url, env, method);
      }

      // ── Route: GSC — search analytics query ──
      if (path === '/api/gsc-search-analytics' && method === 'GET') {
        return handleGscSearchAnalytics(url, env);
      }

      // ── Route: GSC — URL inspection ──
      if (path === '/api/gsc-inspect-url' && method === 'GET') {
        return handleGscInspectUrl(url, env);
      }

      // ── Route: SEO Analyzer (existing) ──
      if (path === '/api/full-audit' && method === 'GET') {
        return handleSeoAudit(url);
      }

      // ── Route: IP Lookup ──
      if (path === '/api/ip-lookup' && method === 'GET') {
        return handleIpLookup(request, url);
      }

      // ── Route: DNS Lookup ──
      if (path === '/api/dns-lookup' && method === 'GET') {
        return handleDnsLookup(url);
      }

      // ── Route: Reverse DNS ──
      if (path === '/api/reverse-dns' && method === 'GET') {
        return handleReverseDns(url);
      }

      // ── Route: DNS Propagation ──
      if (path === '/api/dns-propagation' && method === 'GET') {
        return handleDnsPropagation(url);
      }

      // ── Route: Blacklist Check ──
      if (path === '/api/blacklist-check' && method === 'GET') {
        return handleBlacklistCheck(url);
      }

      // ── Route: WHOIS Lookup ──
      if (path === '/api/whois' && method === 'GET') {
        return handleWhois(url);
      }

      // ── Route: HTTP Headers ──
      if (path === '/api/headers' && method === 'GET') {
        return handleHttpHeaders(request);
      }

      // ── Route: ASN Lookup ──
      if (path === '/api/asn-lookup' && method === 'GET') {
        return handleAsnLookup(request, url);
      }

      // ── Route: Port Check ──
      if (path === '/api/port-check' && method === 'GET') {
        return handlePortCheck(url);
      }

      // ── Route: Redirect Trace ──
      if (path === '/api/redirect-trace' && method === 'GET') {
        return handleRedirectTrace(url);
      }

      // ── Route: Uptime Check ──
      if (path === '/api/uptime-check' && method === 'GET') {
        return handleUptimeCheck(url);
      }

      // ── Route: SSL Certificate Check ──
      if (path === '/api/ssl-check' && method === 'GET') {
        return handleSslCheck(url);
      }

      return new Response('Not Found', { status: 404, headers: corsHeaders });

    } catch (error) {
      console.error('Worker error:', error.message);
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: Object.assign({}, corsHeaders, { 'Content-Type': 'application/json' }),
      });
    }
  },
};

// ── IP Lookup Handler ──
async function handleIpLookup(request, url) {
  const targetIp = url.searchParams.get('ip') || url.searchParams.get('q') || '';
  if (!targetIp) {
    // Self-lookup from Cloudflare cf properties
    const cf = request.cf || {};
    return jsonResponse({
      ip: request.headers.get('CF-Connecting-IP') || '',
      country: cf.country || '',
      countryCode: cf.countryCode || '',
      region: cf.region || '',
      regionCode: cf.regionCode || '',
      city: cf.city || '',
      postalCode: cf.postalCode || '',
      latitude: cf.latitude || 0,
      longitude: cf.longitude || 0,
      timezone: cf.timezone || '',
      isp: cf.asOrganization || '',
      asn: cf.asn || 0,
      org: cf.asOrganization || '',
      currency: '',
      isSelf: true,
    });
  }
  if (!isValidPublicIp(targetIp)) {
    return jsonResponse({ error: 'Invalid IP address' }, 400);
  }

  // ip-api.com is the primary provider: it isn't fronted by Cloudflare, so it
  // doesn't lump Worker egress traffic in with the abuse it blocks. ipwho.is
  // and freeipapi.com are both Cloudflare-proxied and rate-limit/WAF-block
  // Worker traffic hard, so they're kept only as fallbacks.
  const result = await lookupViaIpApiCom(targetIp) || await lookupViaIpwhoIs(targetIp) || await lookupViaFreeIpApi(targetIp);
  if (!result) return jsonResponse({ error: 'Lookup failed — all providers unavailable' }, 502);
  return jsonResponse(result);
}

async function lookupViaIpApiCom(targetIp) {
  try {
    const res = await fetch('http://ip-api.com/json/' + encodeURIComponent(targetIp));
    if (!res.ok) return null;
    const data = await res.json();
    if (data.status !== 'success') return null;
    return {
      ip: data.query || targetIp,
      country: data.country || '',
      countryCode: data.countryCode || '',
      region: data.regionName || '',
      city: data.city || '',
      postalCode: data.zip || '',
      latitude: data.lat || 0,
      longitude: data.lon || 0,
      timezone: data.timezone || '',
      isp: data.isp || '',
      asn: data.as ? parseInt(String(data.as).replace(/^AS/, ''), 10) : 0,
      org: data.org || '',
      currency: '',
      isProxy: null,
      isSelf: false,
    };
  } catch (e) {
    return null;
  }
}

async function lookupViaIpwhoIs(targetIp) {
  try {
    const res = await fetch('https://ipwho.is/' + encodeURIComponent(targetIp));
    if (!res.ok) return null;
    const data = await res.json();
    if (!data.success) return null;
    return {
      ip: data.ip || targetIp,
      country: data.country || '',
      countryCode: data.country_code || '',
      region: data.region || '',
      city: data.city || '',
      postalCode: data.postal || '',
      latitude: data.latitude || 0,
      longitude: data.longitude || 0,
      timezone: (data.timezone && data.timezone.id) || '',
      isp: (data.connection && data.connection.isp) || '',
      asn: (data.connection && data.connection.asn) || 0,
      org: (data.connection && data.connection.org) || '',
      currency: (data.currency && data.currency.code) || '',
      isProxy: null,
      isSelf: false,
    };
  } catch (e) {
    return null;
  }
}

async function lookupViaFreeIpApi(targetIp) {
  try {
    const res = await fetch('https://freeipapi.com/api/json/' + encodeURIComponent(targetIp));
    if (!res.ok) return null;
    const data = await res.json();
    if (!data || !data.ipAddress) return null;
    return {
      ip: data.ipAddress || targetIp,
      country: data.countryName || '',
      countryCode: data.countryCode || '',
      region: data.regionName || '',
      city: data.cityName || '',
      postalCode: data.zipCode || '',
      latitude: data.latitude || 0,
      longitude: data.longitude || 0,
      timezone: (data.timeZones && data.timeZones[0]) || '',
      isp: data.asnOrganization || '',
      asn: data.asn ? parseInt(data.asn, 10) : 0,
      org: data.asnOrganization || '',
      currency: (data.currencies && data.currencies[0]) || '',
      isProxy: typeof data.isProxy === 'boolean' ? data.isProxy : null,
      isSelf: false,
    };
  } catch (e) {
    return null;
  }
}

// ── DNS Lookup Handler ──
async function handleDnsLookup(url) {
  const domain = url.searchParams.get('domain') || '';
  const type = (url.searchParams.get('type') || 'A').toUpperCase();
  const validTypes = ['A', 'AAAA', 'MX', 'TXT', 'NS', 'CNAME', 'SOA', 'PTR'];
  if (!domain) return jsonResponse({ error: 'Missing domain parameter' }, 400);
  if (validTypes.indexOf(type) === -1) return jsonResponse({ error: 'Invalid DNS record type' }, 400);
  const data = await dohQuery(domain, type, 'cloudflare');
  return jsonResponse({
    domain: domain,
    type: type,
    answers: (data.Answer || []).map(function (a) {
      return { name: a.name, type: a.type, ttl: a.TTL, data: unquoteTxt(a.data) };
    }),
    authority: (data.Authority || []).map(function (a) {
      return { name: a.name, type: a.type, ttl: a.TTL, data: unquoteTxt(a.data) };
    }),
    status: data.Status || 0,
    rd: data.RD || false,
  });
}

// ── Reverse DNS Handler ──
async function handleReverseDns(url) {
  const ip = url.searchParams.get('ip') || '';
  if (!ip) return jsonResponse({ error: 'Missing ip parameter' }, 400);
  const ptr = reverseIp(ip);
  const data = await dohQuery(ptr, 'PTR', 'cloudflare');
  return jsonResponse({
    ip: ip,
    ptr: ptr,
    answers: (data.Answer || []).map(function (a) { return { name: a.name, type: a.type, ttl: a.TTL, data: a.data }; }),
    status: data.Status || 0,
  });
}

// ── DNS Propagation Handler ──
async function handleDnsPropagation(url) {
  const domain = url.searchParams.get('domain') || '';
  const type = (url.searchParams.get('type') || 'A').toUpperCase();
  if (!domain) return jsonResponse({ error: 'Missing domain parameter' }, 400);
  const [cf, google, adguard] = await Promise.all([
    dohQuery(domain, type, 'cloudflare').then(function (d) { return d; }).catch(function () { return { error: 'Cloudflare resolver failed' }; }),
    dohQuery(domain, type, 'google').then(function (d) { return d; }).catch(function () { return { error: 'Google resolver failed' }; }),
    dohQuery(domain, type, 'adguard').then(function (d) { return d; }).catch(function () { return { error: 'AdGuard resolver failed' }; }),
  ]);
  return jsonResponse({
    domain: domain,
    type: type,
    results: {
      cloudflare: (cf.Answer || []).map(function (a) { return unquoteTxt(a.data); }),
      google: (google.Answer || []).map(function (a) { return unquoteTxt(a.data); }),
      adguard: (adguard.Answer || []).map(function (a) { return unquoteTxt(a.data); }),
    },
    resolved: {
      cloudflare: !cf.error && cf.Status === 0,
      google: !google.error && google.Status === 0,
      adguard: !adguard.error && adguard.Status === 0,
    },
  });
}

// ── Blacklist Check Handler ──
async function handleBlacklistCheck(url) {
  const ip = url.searchParams.get('ip') || '';
  if (!ip) return jsonResponse({ error: 'Missing ip parameter' }, 400);
  if (!isValidPublicIp(ip)) return jsonResponse({ error: 'Invalid IP address' }, 400);
  const reversed = ip.split('.').reverse().join('.');
  const rblZones = [
    { name: 'Spamhaus ZEN', zone: 'zen.spamhaus.org' },
    { name: 'Spamcop', zone: 'bl.spamcop.net' },
    { name: 'Barracuda BRBL', zone: 'b.barracudacentral.org' },
  ];
  const results = [];
  // Spamhaus (and most RBLs) reserve 127.255.255.252-255 as "querier blocked /
  // rate-limited" error codes, NOT "this IP is listed" — Cloudflare Workers'
  // shared egress IPs trip this often, so it must be excluded or every lookup
  // falsely reports as blacklisted.
  const RBL_ERROR_CODE = /^127\.255\.255\.(252|253|254|255)$/;
  for (const rbl of rblZones) {
    try {
      const query = reversed + '.' + rbl.zone;
      const data = await dohQuery(query, 'A', 'cloudflare');
      const returnCode = (data.Answer && data.Answer[0] && data.Answer[0].data) || null;
      if (returnCode && RBL_ERROR_CODE.test(returnCode)) {
        results.push({ name: rbl.name, listed: false, returnCode: null, error: 'Resolver rate-limited by this RBL, try again later' });
        continue;
      }
      results.push({
        name: rbl.name,
        listed: !!returnCode,
        returnCode: returnCode,
      });
    } catch (e) {
      results.push({ name: rbl.name, listed: false, error: 'Query failed' });
    }
  }
  return jsonResponse({
    ip: ip,
    blacklisted: results.some(function (r) { return r.listed; }),
    results: results,
  });
}

// rdap.org is Cloudflare-fronted and blocks Worker egress traffic (403), so we
// bypass it entirely: resolve domains via IANA's own bootstrap registry, and
// for IPs query the 5 regional registries directly (none are Cloudflare-fronted).
async function resolveDomainRdapEndpoint(domain) {
  const tld = domain.split('.').pop().toLowerCase();
  const res = await fetch('https://data.iana.org/rdap/dns.json');
  const data = await res.json();
  for (const service of data.services || []) {
    const tlds = service[0] || [];
    const urls = service[1] || [];
    if (tlds.some(function (t) { return t.toLowerCase() === tld; }) && urls[0]) {
      return urls[0].replace(/\/$/, '') + '/domain/' + encodeURIComponent(domain);
    }
  }
  return null;
}

async function fetchFirstSuccessfulRdap(urls) {
  const responses = await Promise.all(urls.map(function (u) {
    return fetch(u).then(function (r) { return r.ok ? r.json().then(function (d) { return { ok: true, data: d }; }) : { ok: false }; }).catch(function () { return { ok: false }; });
  }));
  const hit = responses.find(function (r) { return r.ok; });
  return hit ? hit.data : null;
}

// ── WHOIS Lookup Handler ──
async function handleWhois(url) {
  const query = url.searchParams.get('query') || '';
  if (!query) return jsonResponse({ error: 'Missing query parameter' }, 400);

  let data;
  if (IP_V4_REGEX.test(query) || IP_V6_REGEX.test(query)) {
    data = await fetchFirstSuccessfulRdap([
      'https://rdap.arin.net/registry/ip/' + encodeURIComponent(query),
      'https://rdap.db.ripe.net/ip/' + encodeURIComponent(query),
      'https://rdap.apnic.net/ip/' + encodeURIComponent(query),
      'https://rdap.lacnic.net/rdap/ip/' + encodeURIComponent(query),
      'https://rdap.afrinic.net/rdap/ip/' + encodeURIComponent(query),
    ]);
  } else {
    const endpoint = await resolveDomainRdapEndpoint(query);
    if (!endpoint) return jsonResponse({ error: 'Unsupported or unknown TLD' }, 404);
    const res = await fetch(endpoint);
    if (res.ok) data = await res.json();
  }
  if (!data) return jsonResponse({ error: 'Not found in any RDAP registry' }, 404);
  const events = data.events || [];
  const entities = (data.entities || []).map(function (e) {
    const vcardProps = (e.vcardArray && e.vcardArray[1]) || [];
    const fnProp = vcardProps.find(function (p) { return p[0] === 'fn'; });
    return {
      handle: e.handle || '',
      role: (e.roles || []).join(', '),
      name: (fnProp && fnProp[3]) || '',
    };
  });
  // Flat convenience fields derived from the entities array so the frontend
  // doesn't have to dig through RDAP's nested role structure.
  const byRole = function (role) {
    const hit = entities.find(function (e) { return e.role.indexOf(role) !== -1; });
    return (hit && hit.name) || '';
  };
  return jsonResponse({
    query: query,
    handle: data.handle || '',
    name: data.name || data.ldhName || '',
    registrar: byRole('registrar'),
    registrant: byRole('registrant'),
    entities: entities,
    nameservers: (data.nameservers || []).map(function (n) { return n.ldhName || n.name; }),
    events: events.map(function (e) { return { action: e.eventAction, date: e.eventDate }; }),
    creationDate: (events.filter(function (e) { return e.eventAction === 'registration'; })[0] || {}).eventDate || '',
    expiryDate: (events.filter(function (e) { return e.eventAction === 'expiration'; })[0] || {}).eventDate || '',
    lastChangedDate: (events.filter(function (e) { return e.eventAction === 'last changed'; })[0] || {}).eventDate || '',
  });
}

// ── Port Check Handler ──
// Runs server-side (not in the browser) for two reasons: browsers enforce a
// hard-coded "unsafe ports" blocklist that includes several common ports
// regardless of CORS settings, and a strict CSP connect-src cannot allowlist
// an arbitrary user-supplied host in advance. Scoped to HTTP(S) reachability
// only, matching the rest of this Worker's fetch-only capabilities.
async function handlePortCheck(url) {
  const host = (url.searchParams.get('host') || '').trim();
  const port = parseInt(url.searchParams.get('port') || '', 10);
  if (!host) return jsonResponse({ error: 'Missing host parameter' }, 400);
  if (port !== 80 && port !== 443) {
    return jsonResponse({ error: 'Only ports 80 and 443 can be checked — other ports use non-HTTP protocols this tool cannot test.' }, 400);
  }
  const lowerHost = host.toLowerCase();
  if (lowerHost === 'localhost' || lowerHost === '127.0.0.1' || lowerHost === '::1') {
    return jsonResponse({ error: 'Local/internal hosts cannot be checked' }, 400);
  }
  if (IP_V4_REGEX.test(host) && !isValidPublicIp(host)) {
    return jsonResponse({ error: 'Private/internal IP addresses cannot be checked' }, 400);
  }
  const protocol = port === 443 ? 'https' : 'http';
  const target = protocol + '://' + host + ':' + port + '/';
  const start = Date.now();
  try {
    const res = await fetch(target, { method: 'GET', redirect: 'manual', signal: AbortSignal.timeout(6000) });
    return jsonResponse({ host: host, port: port, reachable: true, status: res.status, ms: Date.now() - start });
  } catch (e) {
    return jsonResponse({ host: host, port: port, reachable: false, ms: Date.now() - start, error: 'Connection failed or timed out' });
  }
}

// ── HTTP Headers Handler ──
async function handleHttpHeaders(request) {
  const headers = {};
  for (const [key, value] of request.headers) {
    headers[key] = value;
  }
  return jsonResponse({ headers: headers });
}

// ── ASN Lookup Handler ──
async function handleAsnLookup(request, url) {
  const targetIp = url.searchParams.get('ip') || '';
  if (!targetIp) {
    const cf = request.cf || {};
    return jsonResponse({
      ip: request.headers.get('CF-Connecting-IP') || '',
      asn: cf.asn || 0,
      org: cf.asOrganization || '',
      country: cf.country || '',
      isSelf: true,
    });
  }
  if (!isValidPublicIp(targetIp)) return jsonResponse({ error: 'Invalid IP address' }, 400);
  const result = await lookupViaIpApiCom(targetIp) || await lookupViaIpwhoIs(targetIp) || await lookupViaFreeIpApi(targetIp);
  if (!result) return jsonResponse({ error: 'Lookup failed — all providers unavailable' }, 502);
  return jsonResponse({
    ip: result.ip || targetIp,
    asn: result.asn || 0,
    org: result.org || '',
    country: result.country || '',
    isSelf: false,
  });
}

// ── Redirect Trace Handler ──
async function handleRedirectTrace(url) {
  let target = url.searchParams.get('url') || '';
  if (!target) return jsonResponse({ error: 'Missing url parameter' }, 400);
  if (!/^https?:\/\//i.test(target)) target = 'https://' + target;
  try { new URL(target); } catch (e) { return jsonResponse({ error: 'Invalid URL' }, 400); }

  const chain = [];
  let current = target;
  for (let i = 0; i < 10; i++) {
    const start = Date.now();
    const res = await fetch(current, { method: 'GET', redirect: 'manual' });
    chain.push({ url: current, status: res.status, ms: Date.now() - start });
    const location = res.headers.get('location');
    if (!location || res.status < 300 || res.status >= 400) break;
    current = new URL(location, current).href;
  }
  return jsonResponse({ chain: chain, finalUrl: current, hops: chain.length - 1 });
}

// ── Uptime Check Handler ──
async function handleUptimeCheck(url) {
  let target = url.searchParams.get('url') || '';
  if (!target) return jsonResponse({ error: 'Missing url parameter' }, 400);
  if (!/^https?:\/\//i.test(target)) target = 'https://' + target;
  try { new URL(target); } catch (e) { return jsonResponse({ error: 'Invalid URL' }, 400); }

  const start = Date.now();
  try {
    const res = await fetch(target, { method: 'GET', signal: AbortSignal.timeout(8000) });
    return jsonResponse({ url: target, up: res.status < 500, status: res.status, ms: Date.now() - start });
  } catch (e) {
    return jsonResponse({ url: target, up: false, status: null, ms: Date.now() - start, error: 'Unreachable or timed out' });
  }
}

// ── SSL Certificate Check Handler ──
// crt.sh (certificate-transparency log search) was the original plan, but its
// free community-run Postgres backend is frequently overloaded and returns
// 502 even for plain, uninvolved requests — confirmed unreliable in testing,
// not a Cloudflare-egress-blocking issue this time, just a flaky dependency.
// Qualys SSL Labs' public API is far more reliably operated; query its cache
// first (instant for any previously-scanned domain) and only fall back to
// kicking off a fresh scan — which takes 60-90s — when nothing is cached yet.
async function handleSslCheck(url) {
  const domain = url.searchParams.get('domain') || '';
  if (!domain) return jsonResponse({ error: 'Missing domain parameter' }, 400);
  try {
    const cached = await fetchSslLabs(domain, true);
    if (cached && cached.status === 'READY') return jsonResponse(formatSslResult(domain, cached));
    if (cached && (cached.status === 'IN_PROGRESS' || cached.status === 'DNS')) {
      return jsonResponse({ scanning: true, message: 'No cached result yet — a fresh scan has started. This takes 60-90 seconds; please try again shortly.' }, 202);
    }
    // Nothing cached and no scan running yet — kick one off.
    await fetchSslLabs(domain, false);
    return jsonResponse({ scanning: true, message: 'Scan started for this domain. This takes 60-90 seconds on a first check; please try again shortly.' }, 202);
  } catch (e) {
    return jsonResponse({ error: 'Certificate lookup failed: ' + e.message }, 502);
  }
}

async function fetchSslLabs(domain, fromCache) {
  const qs = fromCache ? '&fromCache=on&maxAge=24' : '';
  const res = await fetch('https://api.ssllabs.com/api/v3/analyze?host=' + encodeURIComponent(domain) + qs + '&all=done', { signal: AbortSignal.timeout(15000) });
  if (!res.ok) return null;
  return res.json();
}

function formatSslResult(domain, data) {
  const endpoint = (data.endpoints || [])[0] || {};
  const cert = (data.certs || [])[0] || {};
  const notAfter = cert.notAfter ? new Date(cert.notAfter).toISOString() : '';
  return {
    domain: domain,
    grade: endpoint.grade || 'Unknown',
    issuer: cert.issuerSubject || 'Unknown',
    subject: cert.subject || '',
    notBefore: cert.notBefore ? new Date(cert.notBefore).toISOString() : '',
    notAfter: notAfter,
    daysUntilExpiry: cert.notAfter ? Math.ceil((cert.notAfter - Date.now()) / 86400000) : 0,
    keyAlg: cert.keyAlg || '',
    keySize: cert.keySize || 0,
    serialNumber: cert.serialNumber || '',
  };
}

// ─────────────────────────────────────────────────────────────
//  Legacy SEO Analyzer Handler (unchanged)
// ─────────────────────────────────────────────────────────────

async function handleSeoAudit(url) {
  try {
    let targetUrl = url.searchParams.get('url');
    if (!targetUrl) return jsonResponse({ error: 'Missing URL parameter' }, 400);

    targetUrl = targetUrl.trim();
    if (!targetUrl.startsWith('http://') && !targetUrl.startsWith('https://')) targetUrl = 'https://' + targetUrl;

    try { new URL(targetUrl); } catch (e) {
      return jsonResponse({ error: 'Invalid URL: ' + targetUrl }, 400);
    }

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

    let currentUrl = finalUrl;
    let response;
    for (let i = 0; i < 10; i++) {
      response = await fetch(currentUrl, {
        method: 'GET', redirect: 'manual',
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

    var hsts = response ? response.headers.get('Strict-Transport-Security') : null;
    var xFrame = response ? response.headers.get('X-Frame-Options') : null;
    var csp = response ? response.headers.get('Content-Security-Policy') : null;
    securityHeaders = { hsts: hsts !== null, xFrame: xFrame !== null, csp: csp !== null };

    html = response ? await response.text() : '';

    if (html) {
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
      url: finalUrl, redirectChain: redirectChain, scores: scores,
      content: { wordCount, textRatio, isThin, headings, readability, eeat, snippets, entities },
      technical: { schema, canonical, securityHeaders },
      performance: perf, images, links, social, keywords, recommendations,
    });
  } catch (error) {
    return jsonResponse({ error: error.message }, 500);
  }
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

// ── Google Search Console — auth + API handlers ──

function base64UrlEncode(bytes) {
  var bin = typeof bytes === 'string' ? bytes : String.fromCharCode.apply(null, new Uint8Array(bytes));
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function pemToArrayBuffer(pem) {
  var b64 = pem.replace(/-----BEGIN PRIVATE KEY-----/, '')
    .replace(/-----END PRIVATE KEY-----/, '')
    .replace(/\s/g, '');
  var bin = atob(b64);
  var buf = new ArrayBuffer(bin.length);
  var view = new Uint8Array(buf);
  for (var i = 0; i < bin.length; i++) view[i] = bin.charCodeAt(i);
  return buf;
}

var gscTokenCache = { token: null, expiresAt: 0 };

async function getGscAccessToken(env) {
  if (gscTokenCache.token && Date.now() < gscTokenCache.expiresAt) {
    return gscTokenCache.token;
  }
  if (!env || !env.GSC_CREDENTIALS) {
    throw new Error('GSC_CREDENTIALS secret is not configured');
  }
  var creds = JSON.parse(env.GSC_CREDENTIALS);
  var now = Math.floor(Date.now() / 1000);
  var header = { alg: 'RS256', typ: 'JWT' };
  var claimSet = {
    iss: creds.client_email,
    scope: 'https://www.googleapis.com/auth/webmasters',
    aud: creds.token_uri,
    iat: now,
    exp: now + 3600,
  };
  var unsigned = base64UrlEncode(JSON.stringify(header)) + '.' + base64UrlEncode(JSON.stringify(claimSet));

  var key = await crypto.subtle.importKey(
    'pkcs8',
    pemToArrayBuffer(creds.private_key),
    { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
    false,
    ['sign']
  );
  var signature = await crypto.subtle.sign('RSASSA-PKCS1-v1_5', key, new TextEncoder().encode(unsigned));
  var jwt = unsigned + '.' + base64UrlEncode(signature);

  var res = await fetch(creds.token_uri, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: 'grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion=' + encodeURIComponent(jwt),
  });
  var data = await res.json();
  if (!res.ok || !data.access_token) {
    throw new Error('Token exchange failed: ' + (data.error_description || data.error || res.status));
  }
  gscTokenCache = { token: data.access_token, expiresAt: Date.now() + (data.expires_in - 60) * 1000 };
  return data.access_token;
}

async function gscApiFetch(env, path, options) {
  var token = await getGscAccessToken(env);
  var res = await fetch('https://searchconsole.googleapis.com' + path, Object.assign({}, options, {
    headers: Object.assign({}, (options && options.headers) || {}, { Authorization: 'Bearer ' + token }),
  }));
  var data = await res.json();
  if (!res.ok) throw new Error(data.error && data.error.message ? data.error.message : 'GSC API error ' + res.status);
  return data;
}

async function handleGscSites(env) {
  try {
    var data = await gscApiFetch(env, '/webmasters/v3/sites', { method: 'GET' });
    return jsonResponse(data);
  } catch (error) {
    return jsonResponse({ error: error.message }, 502);
  }
}

async function handleGscSitemaps(url, env, method) {
  var siteUrl = url.searchParams.get('siteUrl');
  if (!siteUrl) return jsonResponse({ error: 'siteUrl parameter is required' }, 400);
  var encodedSite = encodeURIComponent(siteUrl);

  try {
    if (method === 'POST') {
      var feedpath = url.searchParams.get('feedpath');
      if (!feedpath) return jsonResponse({ error: 'feedpath parameter is required' }, 400);
      await gscApiFetch(env, '/webmasters/v3/sites/' + encodedSite + '/sitemaps/' + encodeURIComponent(feedpath), { method: 'PUT' });
      return jsonResponse({ submitted: feedpath });
    }
    var data = await gscApiFetch(env, '/webmasters/v3/sites/' + encodedSite + '/sitemaps', { method: 'GET' });
    return jsonResponse(data);
  } catch (error) {
    return jsonResponse({ error: error.message }, 502);
  }
}

async function handleGscSearchAnalytics(url, env) {
  var siteUrl = url.searchParams.get('siteUrl');
  if (!siteUrl) return jsonResponse({ error: 'siteUrl parameter is required' }, 400);
  var days = parseInt(url.searchParams.get('days') || '28', 10);
  var endDate = new Date();
  var startDate = new Date(endDate.getTime() - days * 86400000);
  var toIso = function (d) { return d.toISOString().slice(0, 10); };

  var body = {
    startDate: toIso(startDate),
    endDate: toIso(endDate),
    dimensions: (url.searchParams.get('dimensions') || 'query').split(','),
    rowLimit: parseInt(url.searchParams.get('rowLimit') || '25', 10),
  };

  try {
    var data = await gscApiFetch(env, '/webmasters/v3/sites/' + encodeURIComponent(siteUrl) + '/searchAnalytics/query', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    return jsonResponse(data);
  } catch (error) {
    return jsonResponse({ error: error.message }, 502);
  }
}

async function handleGscInspectUrl(url, env) {
  var siteUrl = url.searchParams.get('siteUrl');
  var inspectionUrl = url.searchParams.get('url');
  if (!siteUrl || !inspectionUrl) return jsonResponse({ error: 'siteUrl and url parameters are required' }, 400);

  try {
    var data = await gscApiFetch(env, '/v1/urlInspection/index:inspect', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ inspectionUrl: inspectionUrl, siteUrl: siteUrl }),
    });
    return jsonResponse(data);
  } catch (error) {
    return jsonResponse({ error: error.message }, 502);
  }
}
