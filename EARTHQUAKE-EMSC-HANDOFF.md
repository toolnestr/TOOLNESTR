# Earthquake Tracker — Session Handoff (EMSC integration next)

> Continue here on the other PC. Read fully, then start at **§4 NEXT TASK**.
> File: `src/pages/tools/earthquake-tracker.astro` (single self-contained page, `<script is:inline>`, dark "EarthPulse" theme, uses **BaseLayout** directly — not ToolLayout).

---

## 1. Repo / workflow basics
- Project root: `C:\Users\ADNAN\Desktop\TOOLNESTR`. Branch `main`. **Frontend auto-deploys on `git push origin main`** (Cloudflare Pages). No manual step for the frontend.
- Build/validate locally: `npx astro build` (≈35s, 620 pages). Always build before committing.
- **DO NOT use the browser preview tool** for this project — it's been unreliable here. Validate via `npx astro build` + `curl` against live APIs + code review, and let the USER test on real devices.
- Commit style ends with: `Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>`.

## 2. What the earthquake tracker is
- Live map (Leaflet from unpkg) + list, data from **USGS** GeoJSON feeds. Auto-refresh every 60s.
- Key JS functions: `eqFetchQuakes()` (fetch + normalize), `eqGetFilters()` (reads mobile vs desktop controls by `window.innerWidth <= 680`), `eqUpdateStats()`, `eqRenderList()`, `eqRenderMarkers()`, `eqSelectQuake()`, `eqRefreshData()`, `eqInitApp()` (boot after Leaflet loads), `eqTimeAgo()`, `eqShowToast(icon,title,sub,duration)`.
- Global state: `let eqAllQuakes = [], eqMarkers = [], eqSelectedId = null, eqHeatMode = false;` plus `eqLastFetchTime`.
- USGS feed URLs (in `eqFetchQuakes`): `.../summary/all_hour|all_day|all_week|all_month.geojson`.
- USGS feature shape the whole UI depends on:
  - `q.id`
  - `q.properties.mag`, `.place`, `.time` (epoch **ms**), `.type`, `.felt`, `.url`
  - `q.geometry.coordinates` = `[lon, lat, depthKm]`

## 3. What was fixed THIS session (all pushed to main)
- `17d43f2` default Min-Mag 2.5→**M1+** (desktop+mobile sliders/labels), list cap 200→**300** with honest count (`Showing 300 of 512 · M1+`), map bounded (`minZoom:2`, `maxBounds ±85`, `worldCopyJump`) to kill black edges.
- `8fe1eaa` **Refresh no longer blanks the list** (removed `eqAllQuakes=[]` + empty render in `eqRefreshData`; now just re-fetches and lets success replace data). **Removed the "Updated Ns ago" header text** (`eqUpdatedText` span + all refs gone; LIVE pill remains; fetch/map-load failures now go to `eqShowToast`). Hardened `eqTimeAgo` (clock skew / future timestamps → "just now" instead of negative like `-16877s`).
- Earlier this session (context): removed P2P from Dropspot, added zip download + capacity bar, fixed responsive illustration SVGs sitewide, fixed `<sup>/<sub>/<br>` inside SVG `<text>` (breakout bug) on 4 tools, GPA + Grade calculator mobile row overflow, added Dropspot "How it works" SEO section.

### Root cause of "Pakistan quake never shows" (verified via curl)
USGS is US-centric: outside dense US networks it only reliably reports **~M4+**. The USGS week feed had only **12** Pakistan/Afghanistan/Tajikistan events, all **M4.1–4.9**; all sub-M2 events were in Nevada/California. So a smaller Pakistan quake is **genuinely absent from USGS** — no filter can show it. **User chose: add EMSC alongside USGS** to fill the gap.

---

## 4. NEXT TASK — Add EMSC alongside USGS (merge + dedup)

**Goal:** fetch both USGS and EMSC, normalize to the USGS-like shape (§2) so the rest of the UI is untouched, merge, de-duplicate (same physical event reported by both), and set `eqAllQuakes`. EMSC has far better Europe/Asia/Pakistan coverage incl. smaller magnitudes.

### 4a. EMSC endpoint (FDSN event web service, returns GeoJSON)
```
https://www.seismicportal.org/fdsnws/event/1/query?format=json&orderby=time&limit=1000&start=<ISO8601>
```
- `start` per range: hour → now−1h, day → now−24h, week → now−7d, month → now−30d (build ISO string, e.g. `new Date(Date.now()-86400000).toISOString()`).
- FIRST STEP on the new PC: **curl it and inspect the real schema** (env date is set to 2026 but the live feeds return real-world current data). Command:
  ```bash
  curl -s "https://www.seismicportal.org/fdsnws/event/1/query?format=json&limit=400&orderby=time" --max-time 30 | python -c "import sys,json;d=json.load(sys.stdin);f=d['features'];print(len(f));print(f[0]['geometry']);print(f[0]['properties'])"
  ```
- Expected EMSC feature (CONFIRM with the curl — property names differ from USGS):
  - `properties.mag`, `.magtype`, `.time` (ISO **string**, parse with `Date.parse()` → ms), `.flynn_region` (→ use as `place`), `.lat`, `.lon`, `.depth` (km), `.unid` (id), `.evtype`
  - `geometry.coordinates` = `[lon, lat, depth]` — **verify depth sign** (EMSC sometimes gives negative). Prefer `properties.depth`.

### 4b. Normalize EMSC → USGS-like feature
```js
function eqNormEmsc(x){
  const p = x.properties;
  return {
    id: 'emsc_' + (p.unid || x.id),
    properties: {
      mag: p.mag,
      place: p.flynn_region || 'Unknown region',
      time: Date.parse(p.time),          // ISO → epoch ms (USGS uses ms)
      type: p.evtype || 'earthquake',
      felt: null,
      url: 'https://www.seismicportal.org/#/eventdetails/' + (p.unid || ''),
      source: 'EMSC',
    },
    geometry: { coordinates: [p.lon, p.lat, p.depth] },
  };
}
```
Tag USGS features too: after fetching USGS, set `f.properties.source = 'USGS'` (used for the detail-panel report button label + dedup preference).

### 4c. Rewrite `eqFetchQuakes` to fetch both (resilient)
```js
async function eqFetchQuakes(){
  const { range } = eqGetFilters();
  const usgs = { hour:'...all_hour.geojson', day:'...all_day.geojson', week:'...all_week.geojson', month:'...all_month.geojson' }[range];
  const sinceMs = { hour:3600e3, day:86400e3, week:604800e3, month:2592000e3 }[range];
  const emsc = 'https://www.seismicportal.org/fdsnws/event/1/query?format=json&orderby=time&limit=1000&start=' + new Date(Date.now()-sinceMs).toISOString();

  const [uRes, eRes] = await Promise.allSettled([ fetch(usgs).then(r=>r.json()), fetch(emsc).then(r=>r.json()) ]);
  let merged = [];
  if (uRes.status==='fulfilled' && uRes.value.features) merged = uRes.value.features.filter(f=>f.properties.mag!==null).map(f=>(f.properties.source='USGS',f));
  let emscList = [];
  if (eRes.status==='fulfilled' && eRes.value.features) emscList = eRes.value.features.filter(f=>f.properties && f.properties.mag!==null).map(eqNormEmsc);

  // If BOTH failed, keep old data + retry (don't blank — see 8fe1eaa lesson).
  if (uRes.status!=='fulfilled' && eRes.status!=='fulfilled') { setTimeout(eqFetchQuakes, 5000); return; }

  // Dedup: drop EMSC events that match a USGS event (USGS authoritative on mag).
  merged = merged.concat(emscList.filter(e => !merged.some(u => eqSameEvent(u, e))));

  eqAllQuakes = merged;
  eqLastFetchTime = Date.now();
  eqHideLoading();
  eqUpdateStats(); eqRenderList(); eqRenderMarkers();
}
```

### 4d. Dedup helper (same physical event)
```js
function eqSameEvent(a, b){
  const [alng,alat] = a.geometry.coordinates, [blng,blat] = b.geometry.coordinates;
  const dt = Math.abs(a.properties.time - b.properties.time);
  if (dt > 90000) return false;                 // > 90s apart → different events
  const dLat = (alat-blat)*111, dLng = (alng-blng)*111*Math.cos(alat*Math.PI/180);
  const km = Math.hypot(dLat, dLng);
  return km < 150;                              // within ~150km & 90s → same event
}
```
(USGS entries are added first, so USGS wins on any overlap.)

### 4e. CSP — REQUIRED (else EMSC is blocked in production)
Edit `public/_headers`, add to `connect-src`:
```
https://www.seismicportal.org
```
(Consider also `https://seismicportal.org` if any redirect occurs — confirm from the curl.) Keep everything else. After editing, `npx astro build` and grep the built CSS/headers if needed. The frontend deploys on push; `_headers` is a Pages file (auto-applied).

### 4f. Detail-panel / bottom-sheet "USGS Report" button
Buttons `eqDUsgs` / `eqSUsgs` open the report. They currently assume USGS. Make the label/href source-aware: use `q.properties.url` (works for both) and set label to `View USGS Report ↗` or `View EMSC Report ↗` based on `q.properties.source`. Find where these buttons' click/href are set inside `eqSelectQuake()` / the sheet renderer.

### 4g. Copy updates (accuracy)
- FAQ item "Where does the earthquake data come from?" (top of file, `faqs` array): change to say **USGS + EMSC (seismicportal.org)**, combined for better global/regional coverage.
- About section (`<section class="eq-about-section">`, "Data source and accuracy"): mention both sources and that EMSC improves coverage of smaller regional quakes (e.g. South/Central Asia).

### 4h. Validate
1. `npx astro build` passes.
2. curl both feeds; confirm EMSC returns Pakistan-region small quakes (M<4) that USGS lacks.
3. Push; user tests live: search "Pakistan" should now surface smaller events; no duplicate markers stacked on the same event (dedup working); refresh doesn't blank; no CSP errors in console for seismicportal.org.

### Risks / notes
- EMSC `limit` cap (~1000–2000). With min-mag default M1+, month range could be large; markers/list cap (300) already protects the list. Map markers could be many — if perf sags, raise min-mag default or cap markers.
- EMSC time is an ISO **string** (USGS is epoch ms) — the `Date.parse` in `eqNormEmsc` is essential; a raw string would break `eqTimeAgo` and sorting.
- Don't reintroduce the "blank on refresh" bug: never clear `eqAllQuakes` before a successful fetch.

---

## 5. Other outstanding (unrelated to earthquake)
- **Dropspot worker still needs a manual deploy** (does NOT auto-deploy) for the 50 MB file cap + room storage capacity bar. In the user's own PowerShell:
  ```powershell
  Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
  cd C:\Users\ADNAN\Desktop\TOOLNESTR
  $env:CLOUDFLARE_API_TOKEN = "<token>"
  npx wrangler deploy --config wrangler-airshare.jsonc
  ```
  See `DROPSPOT-HANDOFF.md` for full Dropspot context.

## 6. Latest commits (main)
```
8fe1eaa fix(earthquake-tracker): refresh no longer blanks list; drop "updated ago" text
17d43f2 fix(earthquake-tracker): show small quakes, honest list count, bounded map
57f28c1 content(dropspot): add "How Dropspot works" explainer section for SEO
54b6e9c fix(grade-calculator): stop assessment-row overflow on mobile
2b1b7de fix(gpa-calculator): stop course-row overflow on mobile
26f34e6 fix(tools): convert HTML sup/sub/br inside SVG text to tspan
a04f43b fix(tools): make inline illustration SVGs responsive on mobile
```
