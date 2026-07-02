/*
 * Subject Tools shared kit (window.STK)
 * ------------------------------------------------------------------
 * One reusable browser-side toolkit for the educational Physics /
 * Chemistry / Biology tools (see docs/subject-tools/). It holds the
 * pieces every flagship tool duplicated verbatim: a Three.js orbit
 * scene, an arrow helper, Chart.js defaults, number formatting and a
 * defensive resize mount.
 *
 * Loaded same-origin (CSP script-src 'self') AFTER the Three.js and
 * Chart.js CDN tags, so `window.THREE` / `window.Chart` are available.
 * Each tool page keeps its own <script is:inline> for its unique
 * calculator + widget wiring and calls into STK for the heavy lifting.
 *
 * Everything degrades gracefully: if THREE is missing, makeScene throws
 * and the caller's try/catch shows its fallback; charts and the plain
 * calculator keep working.
 */
(function () {
  'use strict';

  var el = function (id) { return document.getElementById(id); };
  var reduceMotion = !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);

  // ---- number formatting (spec Section 16) -------------------------------
  // fmt2  — fixed 2 decimals with thousands separators (kinematics-style).
  function fmt2(v) {
    if (!isFinite(v)) return '—';
    if (Math.abs(v) < 1e-9) v = 0;               // kill -0.00 / tiny artefacts
    return v.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }
  // fmtSig — 4 significant figures, switching to scientific for very
  // small / very large magnitudes (concentration-style).
  function fmtSig(v) {
    if (!isFinite(v)) return '—';
    if (v !== 0 && (Math.abs(v) < 1e-3 || Math.abs(v) >= 1e5)) return v.toExponential(2);
    if (Math.abs(v) < 1e-12) v = 0;
    return parseFloat(v.toPrecision(4)).toLocaleString(undefined, { maximumFractionDigits: 4 });
  }

  // ---- Chart.js shared defaults + base options ---------------------------
  // Call once before creating charts; returns the base options object every
  // tool spreads into its per-chart config.
  function chartSetup() {
    if (!window.Chart) return { responsive: true, maintainAspectRatio: false, animation: false };
    Chart.defaults.font.family = "'Inter', system-ui, sans-serif";
    Chart.defaults.color = '#64748b';
    return { responsive: true, maintainAspectRatio: false, animation: false };
  }

  // ---- Three.js orbit scene ----------------------------------------------
  // container : DOM element to render into (its clientWidth/Height set size)
  // camRadius : camera distance from target
  // target    : THREE.Vector3 look-at point (optional, defaults to origin)
  // opts      : { ambient, dirLight, azim, pol, polMin, polMax } overrides
  // Returns { scene, camera, renderer, resize, place, spin, setTarget,
  //           isDragging, THREE }.
  function makeScene(container, camRadius, target, opts) {
    if (!window.THREE) throw new Error('THREE not loaded');
    opts = opts || {};
    var THREE = window.THREE;
    var w = container.clientWidth, h = container.clientHeight || 240;
    var scene = new THREE.Scene();
    var camera = new THREE.PerspectiveCamera(50, w / h, 0.1, 5000);
    var renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(w, h);
    container.appendChild(renderer.domElement);
    renderer.domElement.style.touchAction = 'none';        // spec Section 5, bug 4
    scene.add(new THREE.AmbientLight(0xffffff, opts.ambient != null ? opts.ambient : 0.88));
    var dir = new THREE.DirectionalLight(0xffffff, opts.dirLight != null ? opts.dirLight : 0.52);
    dir.position.set(6, 12, 8); scene.add(dir);

    var azim = opts.azim != null ? opts.azim : 0.8;
    var pol = opts.pol != null ? opts.pol : 1.18;
    var polMin = opts.polMin != null ? opts.polMin : 0.28;
    var polMax = opts.polMax != null ? opts.polMax : Math.PI / 2 + 0.18;
    var radius = camRadius;
    var tgt = target || new THREE.Vector3(0, 0, 0);
    function place() {
      camera.position.set(
        tgt.x + radius * Math.sin(pol) * Math.sin(azim),
        tgt.y + radius * Math.cos(pol),
        tgt.z + radius * Math.sin(pol) * Math.cos(azim)
      );
      camera.lookAt(tgt);
    }
    place();

    // manual orbit — mouse + touch (spec Section 5, bug 4)
    var dragging = false, px = 0, py = 0;
    function down(x, y) { dragging = true; px = x; py = y; }
    function moveTo(x, y) {
      if (!dragging) return;
      azim -= (x - px) * 0.008; pol += (y - py) * 0.008;
      pol = Math.max(polMin, Math.min(polMax, pol));
      px = x; py = y; place();
    }
    function up() { dragging = false; }
    var cvs = renderer.domElement;
    cvs.addEventListener('mousedown', function (e) { down(e.clientX, e.clientY); });
    window.addEventListener('mousemove', function (e) { moveTo(e.clientX, e.clientY); });
    window.addEventListener('mouseup', up);
    cvs.addEventListener('touchstart', function (e) { var t = e.touches[0]; down(t.clientX, t.clientY); }, { passive: true });
    cvs.addEventListener('touchmove', function (e) { var t = e.touches[0]; moveTo(t.clientX, t.clientY); }, { passive: true });
    cvs.addEventListener('touchend', up);

    function resize() {
      var w2 = container.clientWidth, h2 = container.clientHeight || 240;
      camera.aspect = w2 / h2; camera.updateProjectionMatrix(); renderer.setSize(w2, h2);
    }
    return {
      scene: scene, camera: camera, renderer: renderer, resize: resize, place: place,
      setTarget: function (v) { tgt.copy(v); place(); },
      spin: function (d) { if (!dragging) { azim += d; place(); } },
      isDragging: function () { return dragging; },
      THREE: THREE,
    };
  }

  // ---- Three.js arrow helper (resultant / component vectors) -------------
  function arrow(from, to, color) {
    var THREE = window.THREE;
    var d = new THREE.Vector3().subVectors(to, from);
    var len = d.length();
    return new THREE.ArrowHelper(d.clone().normalize(), from, len, color, Math.min(0.6, len * 0.25), Math.min(0.35, len * 0.16));
  }

  // ---- defensive resize mount --------------------------------------------
  // Pass the objects returned by your init functions (each may expose a
  // .resize()); handles window resize + orientationchange, null-safe.
  function mountResize(objects) {
    function onResize() {
      objects.forEach(function (x) { try { if (x && x.resize) x.resize(); } catch (e) {} });
    }
    window.addEventListener('resize', onResize);
    window.addEventListener('orientationchange', function () { setTimeout(onResize, 300); });
    return onResize;
  }

  window.STK = {
    el: el,
    reduceMotion: reduceMotion,
    fmt2: fmt2,
    fmtSig: fmtSig,
    chartSetup: chartSetup,
    makeScene: makeScene,
    arrow: arrow,
    mountResize: mountResize,
  };
})();
