import { liveTools } from '../data/tools.js';

// Static search index for the header's site-wide search bar. Prerendered at
// build time (this site is fully static), served as a cacheable JSON asset,
// and fetched lazily on the client only when the user opens search — so it
// never bloats the initial page load.
export function GET() {
  const data = liveTools.map((t) => ({
    s: t.slug,
    t: t.title,
    c: t.category,
    e: t.emoji,
    d: t.short,
  }));
  return new Response(JSON.stringify(data), {
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'public, max-age=3600',
    },
  });
}
