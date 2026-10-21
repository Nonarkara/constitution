#!/usr/bin/env node
/**
 * THE SPATIAL GATE — the portable half of the spatial law.
 *
 * WHAT THIS IS FOR
 * ----------------
 * An interface invents a reason for things to occupy space when it arranges
 * itself around a grid instead of around how people read, choose and act.
 * The six modes are: unjustified gaps, orphan elements, scattered actions,
 * false hierarchy, accidental wrapping, spatially expensive information.
 *
 * The recurring question is "Why is this here, why this size, and why this
 * far from that?" — and the answer must never be "because the grid put it
 * there."
 *
 * HOW THIS TOOL ENFORCES THAT
 * ----------------------------
 * Not with thresholds. A threshold that is wrong for one page is wrong for a
 * thousand, and a gate that cries wolf is worse than a gate that stays quiet.
 * (That is not a theory here — it is what happened to a sibling gate in this
 * same project: a limit of "at most 12 bold things per page" was written,
 * never compared, and turned out to be unmeetable by correct design, because
 * a dictionary of 89 headwords is supposed to have 89 headwords.)
 *
 * Instead: GEOMETRY BECOMES A FACT THAT CANNOT CHANGE SILENTLY.
 *
 *   - Every hole, orphan, scattered pair, wrap and clipped row is MEASURED.
 *   - Every measurement is written into a per-project BASELINE, together with
 *     a written reason. A finding with no reason is a failure, because "no
 *     reason" is exactly what "the grid put it there" sounds like when you
 *     write it down.
 *   - When a page changes, its geometry changes, the baseline diff changes,
 *     and the change is visible in a review. A new hole has no reason yet, so
 *     it fails the gate until somebody writes one.
 *
 * So the law is not a limit. It is a receipt.
 *
 * THE THREE RULES THAT ARE ABSOLUTE
 * ---------------------------------
 * Three things fail regardless of any baseline, because no reading of them
 * makes them acceptable in any project:
 *
 *   - the page scrolls sideways at some width;
 *   - a row breaks and leaves one orphan alone on the last row;
 *   - the instrument failed to measure (a missing route, an unreadable page,
 *     a missing browser). A gate that measures less than it promised fails;
 *     it never passes quietly.
 *
 * USAGE
 * -----
 *   node spatial-check.mjs --dir out --baseline design/spatial-baseline.json
 *   node spatial-check.mjs --dir out --update     # refresh the baseline
 *   node spatial-check.mjs --dir out --report     # print, do not fail
 *   node spatial-check.mjs --base https://host/   # measure a deployed site
 *
 *   --dir <path>       the built site to measure (default: out)
 *   --baseline <path>  the project's baseline file (default: design/spatial-baseline.json)
 *   --routes a,b,c     measure only these routes (default: every built route)
 *   --widths a,b,c     the widths to sweep (default: 360,480,768,1024,1440,1920)
 *   --base <url>       measure a running site instead of a directory
 *   --update           write the measurements into the baseline
 *   --report           print the measurements without failing
 *   --json <path>      also write the raw measurements to a file
 */
import { createServer } from "node:http";
import { readdir } from "node:fs/promises";
import { existsSync, readFileSync, writeFileSync, mkdirSync, statSync, rmSync, readdirSync } from "node:fs";
import { execFileSync, spawn } from "node:child_process";
import { tmpdir, homedir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const HERE = path.dirname(fileURLToPath(import.meta.url));

// ---------------------------------------------------------------- arguments
const argv = process.argv.slice(2);
function arg(name, fallback) {
  const i = argv.indexOf("--" + name);
  if (i === -1) return fallback;
  const v = argv[i + 1];
  return v && !v.startsWith("--") ? v : true;
}
const DIR = arg("dir", "out");
const BASELINE = arg("baseline", path.join("design", "spatial-baseline.json"));
const ROUTES_ARG = arg("routes", null);
const WIDTHS_ARG = arg("widths", null);
const BASE = arg("base", null);
const UPDATE = argv.includes("--update");
const REPORT = argv.includes("--report");
const JSON_OUT = arg("json", null);

const DEFAULT_WIDTHS = [360, 480, 768, 1024, 1440, 1920];
const DEFAULT_LIMITS = {
  // A hole must be at least this tall to be a hole (px).
  deadGap: 72,
  // A cell filling less than this fraction of its row is stranded.
  orphanFill: 0.5,
  // Two loud controls further apart than this fraction of the container are
  // scattered.
  scatteredApart: 0.55,
  // How much a known finding may grow before the growth itself is the defect.
  grownTolerance: 24,
  // How much the first action may move before the move is the defect (px).
  firstActionTolerance: 120,
  // Optional absolute limits. Off by default; a project turns them on with
  // the numbers it has measured for itself.
  firstAction: null,
  titleRatio: null,
  peerShare: null,
  // The type sizes this project is allowed to set text at. null = any.
  allowedSizes: null,
};

// The metric of each finding kind is compared with its own tolerance: px for
// space, percentage points for distance, and "no change" for structure.
const KIND_TOLERANCE = {
  dead: "grownTolerance",
  orphan: "grownTolerance",
  scattered: 6,
  wrap: 0,
  clip: 8,
  overflow: 0,
};

// ---------------------------------------------------------------- chrome
const CHROME_CANDIDATES = [
  process.env.CHROME_PATH,
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  "/Applications/Chromium.app/Contents/MacOS/Chromium",
  "/usr/bin/google-chrome",
  "/usr/bin/chromium",
  "/usr/bin/chromium-browser",
  "C:/Program Files/Google/Chrome/Application/chrome.exe",
].filter(Boolean);
const CHROME = CHROME_CANDIDATES.find((c) => existsSync(c));

if (!CHROME) {
  console.error(
    "\nFAIL — the spatial gate could not measure.\n" +
      "  No Chrome binary found. Tried:\n" +
      CHROME_CANDIDATES.map((c) => `    ${c}\n`).join("") +
      "  Set CHROME_PATH=/path/to/chrome.\n",
  );
  process.exit(1);
}

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".txt": "text/plain; charset=utf-8",
  ".webp": "image/webp",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".woff2": "font/woff2",
  ".woff": "font/woff",
  ".mp3": "audio/mpeg",
  ".mp4": "video/mp4",
};

const PROBE_SRC = readFileSync(path.join(HERE, "spatial-probe.js"), "utf8");

// ---------------------------------------------------------------- the harness
// One page, one iframe per measurement. The iframe is same-origin with the
// harness, so the probe can be injected into it and read its geometry.
const HARNESS = `<!doctype html><html><head><meta charset="utf-8"><title>spatial probe</title>
<style>html,body{margin:0;padding:0;background:#111;color:#eee}
iframe{border:0;display:block;background:#fff}
pre{font:11px/1.35 ui-monospace,Menlo,monospace;white-space:pre-wrap;word-break:break-all;padding:8px;margin:0}</style>
</head><body>
<iframe id="f" title="probe target"></iframe><pre id="out"></pre>
<script>
var WIDTHS = __WIDTHS__;
var ROUTES = __ROUTES__;
var PROBE = __PROBE__;
var f = document.getElementById('f');
var out = document.getElementById('out');
var TAG_OK = 'RESULT' + 'S:';
var TAG_ERR = 'RESULT' + 'S:ERROR:';
window.onerror = function (msg, src, line, col, err) {
  out.textContent = TAG_ERR + (err && err.stack ? err.stack : msg) +
    ' @' + line + ':' + col + ' src=' + String(src).slice(0, 80);
  return true;
};
function installProbe(d) {
  var s = d.createElement('script');
  s.textContent = PROBE;
  (d.head || d.documentElement).appendChild(s);
}
var TOKEN = 0;
var CROSS = __CROSS__;

// The probe belongs to the page, not to the harness.
function installProbe(d) {
  var s = d.createElement('script');
  s.textContent = PROBE;
  (d.head || d.documentElement).appendChild(s);
}

// A page has finished re-laying-out when its shape stops changing. The
// signature is deliberately cheap and deliberately blind to what the reader
// sees: the document's own scroll size, how many elements it holds, the
// rendered width of every SVG (the one thing a ResizeObserver re-draws),
// and how much TEXT the page holds.
//
// The text matters because a page can change what it SAYS without changing
// what it LOOKS like: a status line that says "saving…" and then says
// "ready" is two different pages with the same geometry. Measuring one of
// them at one moment and the other at another is how two measurements of
// "the same page" stop agreeing.
function signature(d) {
  var doc = d.documentElement;
  var svgs = d.getElementsByTagName('svg');
  var sw = 0;
  for (var i = 0; i < svgs.length; i++) sw += Math.round(svgs[i].getBoundingClientRect().width);
  var main = d.querySelector("main#content") || d.querySelector("main") || d.body;
  var text = main ? main.textContent.length : 0;
  return doc.scrollWidth + '|' + doc.scrollHeight + '|' +
    d.getElementsByTagName('*').length + '|' + sw + '|' + text;
}

// Wait for the page to stop moving: three identical readings in a row and at
// least a quarter of a second gone by, or the deadline — never an unbounded
// wait, because a wait that never ends is a measurement that never arrives.
//
// The window is short on purpose. A long window costs a long time on every
// one of a thousand measurements, and a gate that takes half an hour is a
// gate that gets skipped.
function settle(d, cb) {
  var tries = 0, last = null, stable = 0, start = Date.now();
  function step() {
    var elapsed = Date.now() - start;
    if (tries++ > 400 || elapsed > 5000) return cb();
    var s;
    try { s = signature(d); } catch (e) { return cb(); }
    if (s === last) { stable++; if (stable >= 3 && elapsed >= 250) return cb(); }
    else { stable = 0; last = s; }
    setTimeout(step, 25);
  }
  setTimeout(step, 25);
}

function measureDoc(d, route, w, cb) {
  if (!d.__spatialInstalled) { d.__spatialInstalled = true; installProbe(d); }
  var wv = d.defaultView;
  if (!wv || typeof wv.__SPATIAL_MEASURE__ !== 'function') {
    return cb({ route: route, w: w, error: 'probe missing' });
  }
  // A reader arrives at the top of the page. A measurement taken half way
  // down would be of a page nobody sees.
  try { wv.scrollTo(0, 0); } catch (e) { /* nothing to scroll */ }
  cb(wv.__SPATIAL_MEASURE__(route, w, d));
}

// A FRESH NAVIGATION — the only way to be sure the page is what a reader
// would get. Slow, so it is used once per route, plus the cross-check.
//
// Two guards, both learned the hard way.
//
// TOKEN: the iframe fires load for about:blank as well as for the real
// page, so one navigation can start twice. A stale run must never call
// back — after the iframe navigates, the captured window forwards to the
// new document, the probe it installed is gone, and calling it throws
// "is not a function".
//
// done: exactly one result per navigation. Two loops racing on the same
// iframe would report the same page twice, and the gate would then claim
// to have measured more than it promised.
function loadPage(route, w, h, cb) {
  var token = ++TOKEN;
  var done = false;
  function finish(rec) {
    if (done) return;
    done = true;
    cb(rec);
  }
  f.style.width = w + 'px';
  f.style.height = h + 'px';
  // The query string stops the browser from answering with a page it has
  // already laid out at another width.
  f.src = route + (route.indexOf('?') >= 0 ? '&' : '?') + '__spatial=' + token;
  f.onload = function () {
    if (token !== TOKEN) return;
    var tries = 0;
    (function wait() {
      if (token !== TOKEN) return;
      var d;
      try { d = f.contentDocument; } catch (e) { return finish({ route: route, w: w, error: 'cross-origin' }); }
      if (!d) return finish({ route: route, w: w, error: 'no document' });
      if (tries++ > 400) return finish({ route: route, w: w, error: 'timed out waiting for the page' });
      var mainEl = d && (d.querySelector('main#content') || d.querySelector('main') || d.body);
      if (d.readyState === 'complete' && mainEl) {
        if (!d.__spatialInstalled) { d.__spatialInstalled = true; installProbe(d); }
        var wv = d.defaultView;
        if (wv && typeof wv.__SPATIAL_MEASURE__ === 'function') {
          return settle(d, function () {
            if (token !== TOKEN) return;
            // The page may have navigated while we settled. If it did, the
            // window we captured now belongs to a different document, and the
            // probe is not there any more.
            //
            // The window proxy is REUSED across a same-origin navigation, so
            // comparing defaultView cannot tell the two documents apart —
            // the probe's presence is the only honest test.
            if (typeof wv.__SPATIAL_MEASURE__ !== 'function') return wait();
            measureDoc(d, route, w, finish);
          });
        }
      }
      setTimeout(wait, 50);
    })();
  };
}

// RESIZING A LOADED PAGE.
//
// The layout of a site is CSS: the same document re-lays-out when the frame
// changes width. Measuring a page once per width instead of once per
// (route, width) turns thousands of page loads into a few dozen.
//
// That is an ASSUMPTION, and this gate does not get to make it quietly. So
// every route is measured again from a FRESH load at a handful of widths and
// the two sets of numbers are compared; a disagreement is a failure of the
// instrument, not a note about the design.
function resizePage(w, h, cb) {
  f.style.width = w + 'px';
  f.style.height = h + 'px';
  var d;
  try { d = f.contentDocument; } catch (e) { return cb({ error: 'cross-origin' }); }
  if (!d) return cb({ error: 'no document' });
  settle(d, function () {
    measureDoc(d, null, w, cb);
  });
}
function heightFor(w) { return w <= 480 ? 844 : 1000; }
function run() {
  var results = [];
  var cross = [];
  var i = 0;
  function step() {
    if (i >= ROUTES.length) {
      out.textContent = TAG_OK + JSON.stringify({ measurements: results, cross: cross });
      return;
    }
    var route = ROUTES[i];
    // One fresh load per route — what a reader actually gets.
    loadPage(route, WIDTHS[0], heightFor(WIDTHS[0]), function (rec) {
      if (rec.error) { rec.route = route; rec.w = WIDTHS[0]; results.push(rec); i++; return step(); }
      results.push(rec);
      // Every other width, measured on the same page.
      var k = 1;
      (function nextWidth() {
        if (k >= WIDTHS.length) return crossRoute(route);
        var W = WIDTHS[k++];
        resizePage(W, heightFor(W), function (r2) {
          r2.route = route; r2.w = W;
          results.push(r2);
          nextWidth();
        });
      })();
    });
  }
  // The CROSS-CHECK: the same route at the same width, loaded fresh. A
  // resized page and a freshly loaded page must agree, or the gate is
  // measuring something a reader never sees.
  function crossRoute(route) {
    if (!CROSS.length) { i++; return step(); }
    var c = 0;
    (function nextCross() {
      if (c >= CROSS.length) { i++; return step(); }
      var W = CROSS[c++];
      loadPage(route, W, heightFor(W), function (rec) {
        rec.route = route; rec.w = W;
        cross.push(rec);
        nextCross();
      });
    })();
  }
  document.documentElement.style.overflow = 'hidden';
  document.body.style.overflow = 'hidden';
  step();
}
run();
</script></body></html>`;

function harnessHtml(widths, routes, cross) {
  return HARNESS.replace("__WIDTHS__", JSON.stringify(widths))
    .replace("__ROUTES__", JSON.stringify(routes))
    .replace("__CROSS__", JSON.stringify(cross))
    .replace("__PROBE__", JSON.stringify(PROBE_SRC));
}

// ---------------------------------------------------------------- the server
let server = null;
let port = 0;

async function startServer(routes, widths, cross) {
  if (BASE) {
    // Measure a running site. Everything is proxied through one local
    // origin so the iframe stays same-origin with the harness and its
    // geometry can be read.
    const base = String(BASE).replace(/\/+$/, "");
    server = createServer(async (req, res) => {
      const raw = decodeURIComponent((req.url || "/").split("?")[0]);
      if (raw === "/__spatial-harness") {
        res.writeHead(200, { "content-type": MIME[".html"] });
        return res.end(harnessHtml(widths, routes, cross));
      }
      try {
        const target = new URL(raw, base + "/");
        const upstream = await fetch(target, {
          method: req.method === "HEAD" ? "HEAD" : "GET",
          headers: { "user-agent": "spatial-law-probe", accept: "text/html,*/*" },
          redirect: "follow",
        });
        const ct = upstream.headers.get("content-type") || "application/octet-stream";
        const body = Buffer.from(await upstream.arrayBuffer());
        // The proxy keeps every path, so the page's own relative URLs —
        // its scripts, its stylesheets, its images — resolve to the same
        // paths here as they do there.
        //
        // It used to inject a <base href> instead. That broke every
        // absolute asset path on the page: the app's chunks failed to load,
        // the app router gave up and rendered its global-error page, and
        // the gate measured the ERROR PAGE while labelling it with the
        // route it was asked to measure. A deployed site that renders its
        // error page on every route measured zero findings and passed.
        res.writeHead(upstream.status, { "content-type": ct });
        res.end(body);
      } catch (e) {
        res.writeHead(502, { "content-type": "text/plain" });
        res.end("proxy error: " + e.message);
      }
    });
  } else {
    const root = path.resolve(String(DIR));
    server = createServer((req, res) => {
      const raw = decodeURIComponent((req.url || "/").split("?")[0]);
      if (raw === "/__spatial-harness") {
        res.writeHead(200, { "content-type": MIME[".html"] });
        return res.end(harnessHtml(widths, routes, cross));
      }
      const url = path.posix.normalize(raw).replace(/\/+$/, "") || "/";
      if (url.includes("..")) {
        res.writeHead(400);
        return res.end("bad path");
      }
      for (const c of [
        path.join(root, url),
        path.join(root, url, "index.html"),
        path.join(root, url + ".html"),
      ]) {
        try {
          if (existsSync(c) && statSync(c).isFile()) {
            res.writeHead(200, { "content-type": MIME[path.extname(c)] || "application/octet-stream" });
            return res.end(readFileSync(c));
          }
        } catch {
          /* not a file — try the next candidate */
        }
      }
      res.writeHead(404);
      res.end("not found");
    });
  }
  port = await new Promise((resolve) => server.listen(0, "127.0.0.1", () => resolve(server.address().port)));
}

// ---------------------------------------------------------------- the routes
async function discoverRoutes() {
  if (ROUTES_ARG && typeof ROUTES_ARG === "string") {
    return ROUTES_ARG.split(",").map((r) => r.trim()).filter(Boolean);
  }
  if (BASE) {
    // A deployed site has no directory to walk. Measure the same set the
    // project ships by reading its sitemap if there is one, else fall back
    // to the links on the home page.
    const base = String(BASE).replace(/\/+$/, "");
    const routes = new Set(["/"]);
    try {
      const sm = await (await fetch(base + "/sitemap.xml")).text();
      for (const m of sm.matchAll(/<loc>([^<]+)<\/loc>/g)) {
        const u = new URL(m[1]);
        if (u.origin === new URL(base).origin) routes.add(u.pathname);
      }
    } catch {
      /* no sitemap — fall through to the home page links */
    }
    if (routes.size === 1) {
      try {
        const home = await (await fetch(base + "/")).text();
        for (const m of home.matchAll(/href="(\/[^"#?]*)/g)) {
          const p = m[1];
          if (p.startsWith("/_") || p.startsWith("/api")) continue;
          routes.add(p.endsWith("/") || p.includes(".") ? p : p + "/");
        }
      } catch {
        /* nothing else to try */
      }
    }
    return [...routes].sort();
  }
  const root = path.resolve(String(DIR));
  if (!existsSync(root)) {
    console.error(`\nFAIL — nothing to measure: ${root} does not exist.\n`);
    process.exit(1);
  }
  const routes = [];
  if (existsSync(path.join(root, "index.html"))) routes.push("/");
  for (const e of await readdir(root, { withFileTypes: true })) {
    if (!e.isDirectory()) continue;
    if (e.name.startsWith("_") || e.name.startsWith(".") || e.name === "404") continue;
    if (existsSync(path.join(root, e.name, "index.html"))) routes.push(`/${e.name}/`);
  }
  routes.sort();
  return routes;
}

// ---------------------------------------------------------------- the baseline
function loadBaseline() {
  const p = path.resolve(String(BASELINE));
  if (!existsSync(p)) return null;
  try {
    return JSON.parse(readFileSync(p, "utf8"));
  } catch (e) {
    console.error(`\nFAIL — the baseline at ${p} is not readable JSON: ${e.message}\n`);
    process.exit(1);
  }
}

function limitsOf(base) {
  return { ...DEFAULT_LIMITS, ...((base && base.limits) || {}) };
}

function keyOf(f) {
  return `${f.kind}|${f.sel}`;
}

/** Does this decision have a written reason in the baseline? */
function hasReasonKey(k) {
  const why = reasons[k];
  return !!(why && String(why).trim() && String(why).trim() !== "UNREVIEWED");
}
function hasReason(f) {
  return hasReasonKey(keyOf(f));
}

// ---------------------------------------------------------------- the widths
//
// A layout is checked at the widths where it CHANGES, not only at the widths
// a habit suggested. A breakpoint at 560px means the page is a different page
// at 560 than at 561, so both are measured — and so is every breakpoint the
// project's own CSS declares.
//
// This is not a theory. In the project that first adopted this instrument,
// the fixes were written at breakpoints of 520, 560, 720, 900 and 1100 while
// the gate swept 360, 480, 768, 1024, 1440 and 1920 — and not one of those
// widths was on either side of a single breakpoint. Three of the fixes were
// broken exactly there, and a fourth was jumbled by the same cause, and the
// gate was green the whole time. A gate that cannot see where the layout
// changes is a gate that cannot see the defect it was written to catch.
//
// Where the stylesheet could not be found, the sweep falls back to the
// project's own widths — and says so, because a silent fallback is the
// blindness this function exists to remove.
let cssNotFound = null;

/**
 * The stylesheet's own cliffs.
 *
 *   viewport  — the widths a MEDIA query changes the layout at. These are
 *               swept as viewport widths.
 *   container — the widths a CONTAINER query changes the layout at. These
 *               are NOT viewport widths: the layout changes when the
 *               CONTAINER changes size, which happens at some viewport
 *               width nobody can read off the stylesheet. They are swept as
 *               viewport widths too (so the sweep passes near them), and
 *               the gate separately checks that the sweep actually landed
 *               on them.
 */
function scanStylesheets(text, into) {
  for (const q of text.matchAll(/@(media|container)([^{]*)\{/g)) {
    const kind = q[1];
    const body = q[2];
    const target = kind === "media" ? into.viewport : into.container;
    // A container query may NAME the container it applies to. A named query
    // can be matched to the container it belongs to, so the gate knows which
    // element's cliff it is looking at. An anonymous query cannot, and the
    // gate says so rather than guessing.
    let cname = null;
    if (kind === "container") {
      const nm = /^\s*([a-zA-Z_-][\w-]*)/.exec(body);
      cname = nm ? nm[1] : null;
    }
    // Every media query is matched first, and every width feature INSIDE it
    // is then read. Matching the features directly would find only the first
    // one in a compound query — `(min-width:721px) and (max-width:1000px)`
    // would contribute 721 and lose 1000, and the 1000px cliff would go
    // unswept in exactly the way this function exists to prevent.
    for (const m of body.matchAll(/\((?:min|max)-width:\s*([\d.]+)(px|rem|em)\)/g)) {
      const n = parseFloat(m[1]);
      if (!Number.isFinite(n) || n <= 0) continue;
      const px = m[2] === "px" ? n : n * 16;
      const bp = Math.round(px);
      // A cliff is a cliff: measure the width just below it, the width
      // itself, and the width just above it.
      for (const w of [bp - 1, bp, bp + 1]) if (w > 0) target.add(w);
      // A container cliff is also worth passing near as a viewport width,
      // because that is the only way a viewport sweep can come near it.
      if (kind === "container") {
        for (const w of [bp - 1, bp, bp + 1]) if (w > 0) into.viewport.add(w);
        into.cliffs.add(bp);
        const key = cname || "";
        if (!into.namedCliffs.has(key)) into.namedCliffs.set(key, new Set());
        into.namedCliffs.get(key).add(bp);
      }
    }
  }
}

function cssBreakpoints(root) {
  const into = { viewport: new Set(), container: new Set(), cliffs: new Set(), namedCliffs: new Map() };
  const dir = path.join(root, "_next", "static", "css");
  let files = [];
  try {
    files = readdirSync(dir).filter((f) => f.endsWith(".css"));
  } catch {
    // The stylesheet was not where this instrument expected it. The sweep
    // would silently fall back to the project's own widths — the exact
    // blindness this function exists to remove — so it is reported.
    cssNotFound = dir;
    return into;
  }
  for (const f of files) {
    let text = "";
    try {
      text = readFileSync(path.join(dir, f), "utf8");
    } catch {
      continue;
    }
    scanStylesheets(text, into);
  }
  return into;
}

/**
 * The same scan, but for a site that is already running somewhere else.
 * The stylesheets are fetched, because a deployed site changes its layout
 * at ITS breakpoints, not at the ones this machine happens to have.
 */
async function remoteBreakpoints(base) {
  const into = { viewport: new Set(), container: new Set(), cliffs: new Set(), namedCliffs: new Map() };
  let html = "";
  try {
    const r = await fetch(base + "/", { headers: { "user-agent": "spatial-law-probe" } });
    html = await r.text();
  } catch {
    return into;
  }
  const hrefs = [...html.matchAll(/<link[^>]+rel=["']?stylesheet["']?[^>]*>/gi)]
    .map((m) => /href=["']([^"']+)["']/i.exec(m[0]))
    .filter(Boolean)
    .map((m) => m[1]);
  for (const href of hrefs) {
    let url;
    try {
      url = new URL(href, base + "/").toString();
    } catch {
      continue;
    }
    try {
      const r = await fetch(url, { headers: { "user-agent": "spatial-law-probe" } });
      scanStylesheets(await r.text(), into);
    } catch {
      /* a stylesheet that cannot be read is a stylesheet we cannot sweep */
    }
  }
  return into;
}

// ---------------------------------------------------------------- measure
const baseline = loadBaseline();
const projectWidths =
  baseline && Array.isArray(baseline.widths) && baseline.widths.length
    ? baseline.widths.map(Number).filter(Boolean)
    : DEFAULT_WIDTHS;
const cssScan = BASE
  ? await remoteBreakpoints(String(BASE).replace(/\/+$/, ""))
  : cssBreakpoints(path.resolve(String(DIR)));
const cssWidths = cssScan.viewport;
const widths = WIDTHS_ARG
  ? String(WIDTHS_ARG).split(",").map((w) => parseInt(w.trim(), 10)).filter(Boolean)
  : [...new Set([...projectWidths, ...cssWidths])].sort((a, b) => a - b);

const routes = await discoverRoutes();
if (!routes.length) {
  console.error("\nFAIL — the spatial gate found no routes to measure. Nothing was verified.\n");
  process.exit(1);
}

// ---------------------------------------------------------------- the cross-check
//
// The sweep measures most widths by RESIZING a page that is already loaded.
// That is only honest if a resized page and a freshly loaded page agree —
// so the gate proves it, on every run, instead of assuming it.
//
// The widths that get a fresh load are the project's own: the ones a person
// would actually open the page at. The first measured width is left out,
// because it is already measured from a fresh load and comparing a fresh
// load with a fresh load proves nothing about resizing.
const CROSS_MAX = 6;
const crossWidths = (() => {
  const wanted = new Set(projectWidths);
  const out = [];
  for (const w of widths) {
    if (w === widths[0]) continue;
    if (wanted.has(w)) out.push(w);
  }
  return out.slice(0, CROSS_MAX);
})();

await startServer(routes, widths, crossWidths);

const prof = `${tmpdir()}/spatial-law-${process.pid}-${Date.now()}`;
let cleaned = false;
function cleanup() {
  if (cleaned) return;
  cleaned = true;
  try {
    // The profile is this process's own scratch directory. The trash helper
    // belongs to the runtime and is not in the same place on every machine,
    // so a shared instrument asks the environment first and falls back to the
    // standard location — it never carries one person's home directory.
    const trash = process.env.MAVIS_TRASH || path.join(homedir(), ".minimax", "bin", "mavis-trash");
    if (existsSync(trash)) execFileSync(trash, ["--", prof]);
    else rmSync(prof, { recursive: true, force: true });
  } catch {
    /* best effort */
  }
}
process.on("exit", cleanup);
for (const sig of ["SIGINT", "SIGTERM"]) process.on(sig, () => { cleanup(); process.exit(130); });

let dom = "";
let chromeError = null;
for (let attempt = 1; attempt <= 3; attempt++) {
  // A FRESH profile per attempt: a browser that was killed leaves a dirty
  // profile behind, and the next attempt would fail for the wrong reason.
  const attemptProf = attempt === 1 ? prof : `${prof}-${attempt}`;
  const run = await new Promise((resolve) => {
    const child = spawn(
      CHROME,
      [
        "--headless=new",
        "--disable-gpu",
        "--hide-scrollbars",
        "--no-sandbox",
        "--disable-dev-shm-usage",
        "--no-first-run",
        "--no-default-browser-check",
        "--disable-extensions",
        `--user-data-dir=${attemptProf}`,
        // The virtual time budget has to cover the WHOLE sweep. A fixed
        // budget was fine when a sweep was a few hundred measurements and
        // stopped being fine the moment the gate learned to sweep every
        // breakpoint: Chrome ran out of virtual time, dumped a half-finished
        // page, and exited successfully with no measurement in it. The budget
        // is therefore worked out from the number of measurements — and from
        // the number of PAGE LOADS, which are far slower than a resize.
        `--virtual-time-budget=${Math.max(
          240000,
          routes.length * widths.length * 1200 + routes.length * (1 + crossWidths.length) * 4000,
        )}`,
        "--dump-dom",
        `http://127.0.0.1:${port}/__spatial-harness`,
      ],
      { stdio: ["ignore", "pipe", "pipe"] },
    );
    let out = "";
    let err = "";
    child.stdout.on("data", (d) => {
      out += d;
      if (out.length > 256 * 1024 * 1024) child.kill("SIGKILL");
    });
    child.stderr.on("data", (d) => {
      err += d;
    });
    // The wall-clock watchdog. It has to be LONGER than the job that runs
    // this gate, or the browser is taken down mid-sweep and the gate reports
    // a failure that is really a timeout — the measurement was fine.
    const killer = setTimeout(() => child.kill("SIGKILL"), 1800000);
    child.on("close", (code) => {
      clearTimeout(killer);
      resolve({ out, err, code });
    });
  });
  // The exit code is not the verdict. A browser that was taken down by the
  // teardown watchdog AFTER it dumped the DOM still measured the page, and
  // throwing that measurement away would be exactly the kind of false
  // negative this tool exists to avoid. The measurement is the results in
  // the output, not the browser's exit status.
  if (/RESULTS:/.test(run.out)) {
    dom = run.out;
    chromeError = null;
    break;
  }
  chromeError = new Error(`Chrome exited with code ${run.code}`);
  console.error(
    `  · Chrome attempt ${attempt}/3 produced no measurement (exit ${run.code}) — retrying`,
  );
  try {
    rmSync(attemptProf, { recursive: true, force: true });
  } catch {
    /* best effort */
  }
  await new Promise((r) => setTimeout(r, 3000));
}
if (chromeError) {
  server.close();
  cleanup();
  console.error(`\nFAIL — the spatial gate could not measure: ${chromeError.message}\n`);
  process.exit(1);
}
server.close();
cleanup();

const m = /RESULTS:(\{[\s\S]*\})(?:<\/pre>|$)/.exec(dom);
const harnessError = /RESULTS:ERROR:([\s\S]*?)(?:<\/pre>|$)/.exec(dom);
if (harnessError) {
  console.error(`\nFAIL — the spatial harness threw. Nothing was verified.\n${harnessError[1].trim()}\n`);
  process.exit(1);
}
if (!m) {
  console.error("\nFAIL — the spatial gate could not measure: the probe never reported results.\n  Nothing was verified.\n");
  process.exit(1);
}
let payload;
try {
  payload = JSON.parse(
    m[1].replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"'),
  );
} catch (e) {
  console.error(`\nFAIL — the spatial gate could not parse its own results: ${e.message}\n`);
  process.exit(1);
}
const results = Array.isArray(payload.measurements) ? payload.measurements : [];
const crossResults = Array.isArray(payload.cross) ? payload.cross : [];

const expected = routes.length * widths.length;
// The gate must have measured every ROUTE at every WIDTH. Counting the
// measurements is not enough: one page measured twice is the same count as
// one page never measured, and the count would not notice.
const seenPairs = new Set(results.map((r) => `${r.route}@${r.w}`));
const missingPairs = [];
for (const rt of routes) {
  for (const w of widths) {
    if (!seenPairs.has(`${rt}@${w}`)) missingPairs.push(`${rt} @${w}px`);
  }
}
const duplicatePairs = [];
{
  const counts = new Map();
  for (const r of results) {
    const k = `${r.route}@${r.w}`;
    counts.set(k, (counts.get(k) || 0) + 1);
  }
  for (const [k, n] of counts) if (n > 1) duplicatePairs.push(`${k} measured ${n} times`);
}
if (results.length !== expected || missingPairs.length || duplicatePairs.length) {
  console.error(
    `\nFAIL — the spatial gate is under-measuring.\n` +
      `  Expected ${expected} measurements (${routes.length} routes x ${widths.length} widths), got ${results.length}.\n`,
  );
  if (missingPairs.length) {
    console.error(`  Missing ${missingPairs.length} measurement(s):`);
    for (const p of missingPairs.slice(0, 20)) console.error(`    · ${p}`);
  }
  if (duplicatePairs.length) {
    console.error(`  Measured twice: ${duplicatePairs.slice(0, 20).join(", ")}`);
  }
  console.error(`  A page measured twice is the same count as a page never measured.\n`);
  process.exit(1);
}
const errored = results.filter((r) => r.error);
if (errored.length) {
  console.error(`\nFAIL — the spatial gate could not read ${errored.length} page measurement(s):`);
  for (const e of errored.slice(0, 10)) console.error(`  ✗ ${e.route} @${e.w}px — ${e.error}`);
  process.exit(1);
}
const crossErrored = crossResults.filter((r) => r.error);
if (crossErrored.length) {
  console.error(`\nFAIL — the spatial gate could not read ${crossErrored.length} cross-check measurement(s):`);
  for (const e of crossErrored.slice(0, 10)) console.error(`  ✗ ${e.route} @${e.w}px — ${e.error}`);
  process.exit(1);
}

// The notes are printed at the end of the run. They are declared here
// because the cross-check below adds to them before the policy block reads
// them.
const notes = [];

// ---------------------------------------------------------------- the cross-check
//
// Two measurements of the same page at the same width must agree: the one
// taken by resizing the loaded page, and the one taken by loading it afresh.
// If they disagree about GEOMETRY, the gate is reporting a layout a reader
// would never see — and a gate that reports layouts nobody sees is worse
// than no gate.
//
// So this is a FAILURE of the instrument, not a note about the design.
//
// PROSE is a different matter. A page can say different words on two loads
// and look exactly the same: a settings page that says "saving…" and then
// says "ready", a notes page that counts the highlights you have saved. The
// law is about geometry — where things are, how big they are, how far apart
// — so a difference in words is recorded as a note, and a difference in
// geometry is a failure. Both are reported; neither is hidden.
//
// GEOMETRY (strict):
//   the findings themselves, the title's size against the page's largest
//   other size, and where the first thing you can DO is.
function compareGeometry(a, b) {
  const diffs = [];
  const fa = new Map((a.findings || []).map((f) => [`${f.kind}|${f.sel}`, f]));
  const fb = new Map((b.findings || []).map((f) => [`${f.kind}|${f.sel}`, f]));
  for (const [k, x] of fa) {
    const y = fb.get(k);
    if (!y) {
      diffs.push(`${k} — the resized page measured ${x.metric}, the fresh load did not measure it at all`);
      continue;
    }
    if (Math.abs(x.metric - y.metric) > 1) {
      diffs.push(`${k} — the resized page measured ${x.metric}, the fresh load measured ${y.metric}`);
    }
  }
  for (const [k, y] of fb) {
    if (!fa.has(k)) {
      diffs.push(`${k} — the fresh load measured ${y.metric}, the resized page did not measure it at all`);
    }
  }
  const ha = a.hierarchy || {};
  const hb = b.hierarchy || {};
  for (const key of ["h1", "h1Count", "largest", "ratio"]) {
    const x = ha[key];
    const y = hb[key];
    if (x === undefined && y === undefined) continue;
    if (x !== y) diffs.push(`hierarchy.${key} — resized ${x}, fresh load ${y}`);
  }
  const aa = a.firstAction || {};
  const ab = b.firstAction || {};
  if ((aa.y ?? null) !== (ab.y ?? null)) {
    if (aa.y == null || ab.y == null || Math.abs(aa.y - ab.y) > 1) {
      diffs.push(`firstAction — resized ${aa.y ?? "none"}, fresh load ${ab.y ?? "none"}`);
    }
  }
  if ((aa.sel ?? null) !== (ab.sel ?? null)) {
    diffs.push(`firstAction.sel — resized ${aa.sel ?? "none"}, fresh load ${ab.sel ?? "none"}`);
  }
  return diffs;
}

/** Prose: what the page SAYS. Recorded, never fatal. */
function compareProse(a, b) {
  const diffs = [];
  if ((a.chars ?? 0) !== (b.chars ?? 0)) {
    diffs.push(`the page says ${b.chars ?? 0} characters on a fresh load and ${a.chars ?? 0} on a resized page`);
  }
  const ra = (a.hierarchy && a.hierarchy.ramp) || {};
  const rb = (b.hierarchy && b.hierarchy.ramp) || {};
  for (const key of new Set([...Object.keys(ra), ...Object.keys(rb)])) {
    if ((ra[key] ?? 0) !== (rb[key] ?? 0)) {
      diffs.push(`${key}px text: ${ra[key] ?? 0} characters on a resized page, ${rb[key] ?? 0} on a fresh load`);
    }
  }
  const ha = a.hierarchy || {};
  const hb = b.hierarchy || {};
  if ((ha.peers ?? 0) !== (hb.peers ?? 0)) {
    diffs.push(`${ha.peers ?? 0} loud peers on a resized page, ${hb.peers ?? 0} on a fresh load`);
  }
  return diffs;
}

const crossProblems = [];
const crossProse = [];
let crossChecked = 0;
{
  const byKey = new Map(crossResults.map((c) => [`${c.route}@${c.w}`, c]));
  for (const r of results) {
    const c = byKey.get(`${r.route}@${r.w}`);
    if (!c) continue;
    crossChecked++;
    const diffs = compareGeometry(r, c);
    if (diffs.length) crossProblems.push({ route: r.route, w: r.w, diffs });
    const prose = compareProse(r, c);
    if (prose.length) crossProse.push({ route: r.route, w: r.w, diffs: prose });
  }
  if (crossChecked !== crossResults.length) {
    console.error(
      `\nFAIL — the spatial gate's cross-check is broken.\n` +
        `  ${crossResults.length} fresh-load measurements were taken but only ${crossChecked} found a resized measurement to compare against.\n`,
    );
    process.exit(1);
  }
  if (crossProblems.length) {
    console.error(
      `\nFAIL — the spatial gate is measuring two different layouts.\n` +
        `  A resized page and a freshly loaded page gave different GEOMETRY at ${crossProblems.length} of ${crossChecked} cross-checked widths.\n` +
        `  The sweep resizes a loaded page instead of loading it again, and the two must agree.\n`,
    );
    for (const p of crossProblems.slice(0, 10)) {
      console.error(`  ✗ ${p.route} @${p.w}px`);
      for (const d of p.diffs.slice(0, 6)) console.error(`      ${d}`);
    }
    process.exit(1);
  }
  if (crossProse.length) {
    notes.push(
      `${crossProse.length} of ${crossChecked} cross-checked widths measured different PROSE — the page says different words ` +
        `on a fresh load than on a resized page (saved state, a status line). The geometry is the same, so this is recorded, not failed. ` +
        `First: ${crossProse[0].route} @${crossProse[0].w}px — ${crossProse[0].diffs[0]}`,
    );
  }
}

if (JSON_OUT) {
  mkdirSync(path.dirname(path.resolve(String(JSON_OUT))), { recursive: true });
  writeFileSync(
    path.resolve(String(JSON_OUT)),
    JSON.stringify({ measurements: results, cross: crossResults }, null, 2),
  );
}

// ---------------------------------------------------------------- policy
const limits = limitsOf(baseline);
const baselineRoutes = (baseline && baseline.routes) || {};
// A REASON belongs to a design DECISION, not to a page. The same decision —
// "the footer's engine links stack below 480px" — shows up on many routes,
// and it is one promise, not many. So reasons are keyed by signature
// (kind|selector) and the per-page numbers stay in `routes`.
const reasons = (baseline && baseline.reasons) || {};

const failures = [];
if (cssNotFound) {
  notes.push(
    `the stylesheet was not found at ${cssNotFound} — the sweep fell back to the project's own widths, ` +
      `so the CSS breakpoints were NOT measured. A layout checked only at the widths somebody listed is ` +
      `checked at the widths where nothing changes.`,
  );
}
const unexplained = [];
const unrecorded = [];
const grownFindings = [];
const shrunkFindings = [];
const goneFindings = [];
const staleReasons = [];
const staleExempts = [];

function baselineFor(route, w) {
  const r = baselineRoutes[route];
  if (!r) return null;
  return r[String(w)] || null;
}

for (const r of results) {
  const label = `${r.route} @${r.w}px`;
  const base = baselineFor(r.route, r.w);

  // --- absolute: the page scrolls sideways -------------------------------
  for (const f of r.findings) {
    if (f.kind === "overflow") {
      failures.push(`${label} — ${f.detail} (${f.sel})`);
    }
  }

  if (!base) {
    // A route or width with no recorded numbers yet. The decision still has
    // to be justified; the numbers simply have nothing to compare against.
    for (const f of r.findings) {
      if (f.kind === "overflow") continue;
      if (!hasReason(f)) unexplained.push({ ...f, route: r.route, w: r.w });
      else unrecorded.push({ ...f, route: r.route, w: r.w, why: "the baseline records no numbers for this route and width" });
    }
    if (!r.findings.length) {
      notes.push(`${label} — no baseline entry for this route/width`);
    }
  } else {
    const prior = new Map((base.findings || []).map((p) => [keyOf(p), p]));
    const seen = new Set();
    for (const f of r.findings) {
      const k = keyOf(f);
      seen.add(k);
      const p = prior.get(k);
      // A decision nobody has justified. Whether the finding is new or old,
      // the reason is what makes it allowed to exist.
      if (!hasReason(f)) {
        if (f.kind !== "overflow") unexplained.push({ ...f, route: r.route, w: r.w });
        continue;
      }
      if (!p) {
        // The decision is justified, but the baseline does not record the
        // numbers for it, so nothing would notice if that space grew. A gate
        // that cannot check what it says it checks must fail rather than
        // pass on a check it never ran.
        unrecorded.push({ ...f, route: r.route, w: r.w, why: "the baseline records no numbers for this decision" });
        continue;
      }
      const tolKey = KIND_TOLERANCE[f.kind];
      const tol = typeof tolKey === "number" ? tolKey : limits.grownTolerance;
      const delta = f.metric - (p.metric || 0);
      if (delta > tol) {
        grownFindings.push({ ...f, route: r.route, w: r.w, was: p.metric, delta, why: reasons[keyOf(f)] });
      } else if (delta < -tol) {
        // A hole that SHRANK changed the geometry just as much as one that
        // grew. The receipt is a record of what the page looks like, so a
        // change in either direction has to be seen: a baseline that still
        // says 300px when the page now says 100px is a receipt that lies.
        shrunkFindings.push({ ...f, route: r.route, w: r.w, was: p.metric, delta, why: reasons[keyOf(f)] });
      }
    }
    for (const p of base.findings || []) {
      if (!seen.has(keyOf(p))) {
        goneFindings.push({ ...p, route: r.route, w: r.w });
      }
    }

    // --- spatially expensive: the first action moved ---------------------
    const fa = base.firstAction;
    if (fa && fa.y !== null && r.firstAction && r.firstAction.y !== null) {
      const drift = r.firstAction.y - fa.y;
      if (Math.abs(drift) > limits.firstActionTolerance) {
        failures.push(
          `${label} — the first thing you can do moved ${drift > 0 ? "down" : "up"} ${Math.abs(drift)}px ` +
            `(now ${r.firstAction.y}, was ${fa.y}); a decision that used to cost ${fa.y}px of scrolling now costs ${r.firstAction.y}px`,
        );
      }
    }
  }

  // The ABSOLUTE limits apply to every measurement, whether or not the
  // baseline has ever seen this route. A limit that only holds for pages
  // somebody already reviewed is not a limit — it is a note, and a new page
  // with a 2000px scroll before its first action would sail past it.
  //
  // An EXEMPTION is a written exception to an absolute limit. It is not a
  // quiet pass: it names the page, the check, and the reason, and it lives
  // in the baseline where a reviewer can see it and argue with it.
  const exempts = (baseline && baseline.exempt) || [];
  function exempted(check) {
    for (const e of exempts) {
      if (e.check !== check) continue;
      if (e.route && e.route !== r.route) continue;
      if (e.w !== undefined && e.w !== null) {
        // An exemption may name one width or a list of them. A decision that
        // holds at several widths is still ONE decision, and the exemption
        // should be able to say so in one place.
        const ws = (Array.isArray(e.w) ? e.w : [e.w]).map(Number);
        if (!ws.includes(Number(r.w))) continue;
      }
      return e;
    }
    return null;
  }
  {
    const label = `${r.route} @${r.w}px`;

    // An exemption applies to EVERY absolute limit, not only the first one.
    // If one check could be excused and another could not, the excuse would
    // live in the wrong place — and the place a reviewer reads is the
    // baseline, never the body of the check.
    function absolute(check, message, summary) {
      const ex = exempted(check);
      if (ex) {
        notes.push(`${label} — ${summary || check}, exempted: ${ex.why}`);
      } else {
        failures.push(message);
      }
    }

    if (limits.firstAction !== null && r.firstAction && r.firstAction.y !== null && r.firstAction.y > limits.firstAction) {
      absolute(
        "firstAction",
        `${label} — the first thing you can do is ${r.firstAction.y}px down the page (limit ${limits.firstAction}px)`,
        `first action at ${r.firstAction.y}px exceeds ${limits.firstAction}px`,
      );
    }

    // --- false hierarchy --------------------------------------------------
    const h = r.hierarchy || {};
    if (limits.titleRatio !== null && h.ratio !== null && h.ratio < limits.titleRatio) {
      absolute(
        "titleRatio",
        `${label} — the title is only ${h.ratio}x the next largest text (limit ${limits.titleRatio})`,
        `the title is only ${h.ratio}x the next largest text (limit ${limits.titleRatio})`,
      );
    }
    if (limits.peerShare !== null && h.share !== undefined && h.share > limits.peerShare) {
      absolute(
        "peerShare",
        `${label} — ${Math.round(h.share * 100)}% of the page is set in the loud voice (limit ${Math.round(limits.peerShare * 100)}%)`,
        `${Math.round(h.share * 100)}% of the page is set in the loud voice (limit ${Math.round(limits.peerShare * 100)}%)`,
      );
    }
    if (limits.allowedSizes) {
      const allowed = new Set(limits.allowedSizes.map(Number));
      const off = Object.keys(h.ramp || {})
        .map(Number)
        .filter((s) => !allowed.has(s))
        .sort((a, b) => a - b);
      if (off.length) {
        absolute(
          "allowedSizes",
          `${label} — text is set in ${off.join("px, ")}px, off the house ramp (${limits.allowedSizes.join(" / ")})`,
          `text is set in ${off.join("px, ")}px, off the house ramp (${limits.allowedSizes.join(" / ")})`,
        );
      }
    }
  }
}

for (const f of unrecorded) {
  failures.push(
    `${f.route} @${f.w}px — ${f.kind}: ${f.sel} is measured but ${f.why}, so a change in it would not be ` +
      `noticed. Re-run the gate with --update and read the diff before you read the reason as still true.`,
  );
}
for (const f of unexplained) {
  failures.push(
    `${f.route} @${f.w}px — ${f.kind}: ${f.sel} has no written reason in the baseline. "${f.detail}" ` +
      `needs to be justified, not just recorded.`,
  );
}
for (const f of grownFindings) {
  failures.push(`${f.route} @${f.w}px — ${f.kind} GREW: ${f.sel} went from ${f.was} to ${f.metric} (+${f.delta}). The space that made sense at ${f.was} does not make sense at ${f.metric}.`);
}
for (const f of shrunkFindings) {
  failures.push(
    `${f.route} @${f.w}px — ${f.kind} SHRANK: ${f.sel} went from ${f.was} to ${f.metric} (${f.delta}). ` +
      `That is a change to the page, and the receipt still says ${f.was}. Update the baseline so the receipt matches what the page does.`,
  );
}
for (const f of goneFindings) {
  failures.push(
    `${f.route} @${f.w}px — ${f.kind} GONE: ${f.sel} is no longer measured here, but the receipt still records it at ${f.metric}. ` +
      `Update the baseline so the receipt matches what the page does.`,
  );
}

// ---- a reason with nothing under it ----------------------------------------
// A reason is written for a decision. When the decision is gone — the hole
// was closed, the plate moved — the reason stays in the baseline for ever,
// and the worst thing about it is that it is still a BLESSING: if a decision
// of the same shape ever comes back, the stale reason silently excuses it,
// and nobody re-reads why the first one was allowed.
//
// So a reason that no longer matches any measured decision is a failure. The
// fix is to delete it from the baseline, by hand, so that the deletion is a
// thing a person did and can be read in the diff.
const measuredKeys = new Set();
for (const r of results) {
  for (const f of r.findings) {
    if (f.kind === "overflow") continue;
    measuredKeys.add(keyOf(f));
  }
}
const measuredRoutes = new Set(results.map((r) => r.route));
const measuredWidths = new Set(results.map((r) => Number(r.w)));

// ---- the container cliffs --------------------------------------------------
//
// A CONTAINER query changes the layout when the container changes size, not
// when the window does. A viewport sweep can walk straight past one. So the
// gate asks a question the sweep can answer: did the sweep ever put a
// container within a hair of the cliff it declares?
//
// If the answer is no, but the container's width crossed the cliff somewhere
// in the sweep, then the layout on one side of that cliff was never
// measured — and a gate that did not measure it must say so.
//
// A NAMED query (`@container settings-card (min-width: 640px)`) can be
// matched to the container it belongs to, so the answer is exact. An
// ANONYMOUS query cannot be matched to anything, so the gate says that
// instead of blaming a container that may have nothing to do with it.
const namedCliffs = cssScan.namedCliffs || new Map();
if (namedCliffs.size) {
  // The check is only binding when the sweep actually covered the CSS's own
  // cliffs. A narrowed sweep — a quick look, a project that has not yet
  // adopted the CSS-derived widths — is a partial sweep, and a partial sweep
  // records the cliff instead of failing on it.
  const cssComplete = [...cssScan.viewport].every((w) => measuredWidths.has(Number(w)));
  const byContainer = new Map();
  for (const r of results) {
    for (const c of r.containers || []) {
      const names = String(c.name || "")
        .split(/\s+/)
        .filter(Boolean);
      for (const nm of names) {
        if (!byContainer.has(nm)) byContainer.set(nm, new Map());
        const perSel = byContainer.get(nm);
        if (!perSel.has(c.sel)) perSel.set(c.sel, new Map());
        perSel.get(c.sel).set(Number(r.w), c.w);
      }
    }
  }
  for (const [name, cliffs] of namedCliffs) {
    for (const cliff of [...cliffs].sort((a, b) => a - b)) {
      if (!name) {
        notes.push(
          `the container cliff at ${cliff}px belongs to an ANONYMOUS container query — the gate cannot tell which container it applies to, so it cannot say whether it was swept. Name the query (@container name (min-width: ${cliff}px)) and the gate will check it.`,
        );
        continue;
      }
      const perSel = byContainer.get(name);
      if (!perSel || !perSel.size) {
        notes.push(
          `the container cliff at ${cliff}px belongs to "${name}", which no measured page contains — there was nothing to sweep.`,
        );
        continue;
      }
      let landed = null;
      let straddled = null;
      for (const [sel, pairs] of perSel) {
        const list = [...pairs.entries()].sort((a, b) => a[1] - b[1]);
        const near = list.find(([, w]) => Math.abs(w - cliff) <= 2);
        if (near) {
          landed = { sel, w: near[1], v: near[0] };
          break;
        }
        const below = [...list].reverse().find(([, w]) => w < cliff);
        const above = list.find(([, w]) => w > cliff);
        if (below && above) {
          straddled = { sel, below, above };
          break;
        }
      }
      if (landed) {
        notes.push(
          `the container cliff at ${cliff}px was measured — the container "${name}" was ${landed.w}px wide at viewport ${landed.v}px`,
        );
      } else if (straddled) {
        const [v1, w1] = straddled.below;
        const [v2, w2] = straddled.above;
        // Where would the container land exactly on the cliff? Between the
        // two measurements that bracket it, the container's width moves with
        // the viewport, so the width that puts it on the cliff can be read
        // off. Naming it turns "add a width" into one number.
        const guess =
          w2 > w1 ? Math.round(v1 + ((cliff - w1) * (v2 - v1)) / (w2 - w1)) : Math.round((v1 + v2) / 2);
        const where = `the container is ${w1}px wide at viewport ${v1}px and ${w2}px wide at viewport ${v2}px`;
        if (cssComplete) {
          failures.push(
            `unswept container cliff — the layout changes when the container "${name}" is ${cliff}px wide, ` +
              `but the sweep never put it there (${where}). The layout on one side of that cliff was never measured. ` +
              `Add a viewport width of about ${guess}px to the project's widths — that is where the container lands on the cliff.`,
          );
        } else {
          notes.push(
            `the container cliff at ${cliff}px was crossed but not measured (${where}) — this sweep did not cover every cliff the CSS declares, so it is recorded, not failed.`,
          );
        }
      } else {
        notes.push(
          `the container cliff at ${cliff}px was never crossed — the container "${name}" never reached it at any swept width, so there was nothing to measure`,
        );
      }
    }
  }
}

// A route the BASELINE knows and the BUILD does not have is a page that has
// vanished from the receipt. It used to be enough to leave one route out of
// the build to switch the stale-reason rule off for the whole project —
// the gate then passed while judging nothing. So a missing page is a
// failure in its own right, not a reason to stop judging.
//
// A run that was told which routes to measure is a deliberate narrowing and
// is not a failure; it is a note.
const baselineRouteList = Object.keys(baselineRoutes);
const vanishedRoutes = baselineRouteList.filter((rt) => !measuredRoutes.has(rt));
if (!ROUTES_ARG) {
  for (const rt of vanishedRoutes) {
    failures.push(
      `missing page — the baseline records "${rt}" but this build has no such page. ` +
        `A page that was reviewed and is no longer built must be removed from the baseline, ` +
        `and until somebody does that, the receipt is claiming a page that does not exist.`,
    );
  }
}

// A stale reason can only be judged when the sweep was COMPLETE — and
// "complete" means both axes. A run over a few routes has not seen the
// routes the reason belongs to, and calling that reason stale would be the
// instrument inventing a defect. The same is true of a run over a few
// widths: a decision can be alive at 721px and absent at 360px, and a
// narrowed width list cannot tell the two apart.
const baselineWidthList = (baseline && baseline.measuredWidths) || [];
const widthsComplete = baselineWidthList.every((w) => measuredWidths.has(Number(w)));
const fullSweep =
  !ROUTES_ARG && !vanishedRoutes.length && widthsComplete && !!baselineWidthList.length;
if (fullSweep) {
  for (const k of Object.keys(reasons)) {
    if (measuredKeys.has(k)) continue;
    staleReasons.push(k);
    failures.push(
      `stale reason — the baseline justifies "${k}" but no measured decision is that shape any more. ` +
        `A reason that blesses nothing will bless the next thing that looks like it, without anybody re-reading it. ` +
        `Delete it from the baseline.`,
    );
  }
  for (const e of (baseline && baseline.exempt) || []) {
    if (!e.route) continue;
    if (measuredRoutes.has(e.route)) continue;
    staleExempts.push(e);
    failures.push(
      `stale exemption — the baseline excuses ${e.check} on ${e.route}, which is not a route this build measures. ` +
        `Delete it from the baseline.`,
    );
  }
} else {
  const why = [];
  if (ROUTES_ARG) why.push("the run was told which routes to measure");
  if (!ROUTES_ARG && vanishedRoutes.length) why.push(`the build has no ${vanishedRoutes[0]}`);
  if (!widthsComplete) why.push("the run did not sweep every width the baseline recorded");
  notes.push(`stale reasons were not checked — ${why.join("; ")}`);
}
// A NOTE is something the gate saw and did not fail on. It used to be
// collected and never printed, which meant a page the baseline had never
// seen was reviewed in silence. Silence is not a result.
function printNotes() {
  if (!notes.length) return;
  console.log(`\nNOTES (${notes.length}) — seen, recorded, and not a failure:`);
  for (const n of notes.slice(0, 40)) console.log(`  · ${n}`);
  if (notes.length > 40) console.log(`  · ... and ${notes.length - 40} more`);
}

// ---------------------------------------------------------------- update
if (UPDATE) {  // A reason for a decision that is no longer there is not recorded again.
  // It is dropped, loudly, so the deletion shows up in the diff of the
  // baseline instead of hiding inside a tool.
  const keptReasons = { ...reasons };
  for (const k of staleReasons) delete keptReasons[k];
  const keptExempts = ((baseline && baseline.exempt) || []).filter((e) => !staleExempts.includes(e));
  const next = {
    version: 2,
    tool: "spatial-law",
    // The widths the project chose, kept as chosen. The widths the CSS
    // declares are worked out from the build on every run, so a breakpoint
    // that is removed stops being measured without anybody editing this.
    widths: projectWidths,
    // The receipt of what was actually swept this time.
    measuredWidths: widths,
    limits: limits,
    // The reasons of decisions that were already justified. A reason is kept
    // because the DECISION is kept; a decision whose geometry changed is
    // caught by the GROWN check, not by losing its reason.
    reasons: keptReasons,
    // Written exceptions to the absolute limits, kept for the same reason:
    // an exception is a decision, and a decision is written down.
    exempt: keptExempts,
    routes: {},
  };
  const signatureDetail = new Map();
  for (const r of results) {
    for (const f of r.findings) {
      if (f.kind === "overflow") continue;
      const k = keyOf(f);
      if (!signatureDetail.has(k)) signatureDetail.set(k, { kind: f.kind, sel: f.sel, detail: f.detail, at: `${r.route} @${r.w}px` });
    }
  }
  for (const r of results) {
    const findings = r.findings.map((f) => ({
      kind: f.kind,
      sel: f.sel,
      metric: f.metric,
      detail: f.detail,
    }));
    next.routes[r.route] = next.routes[r.route] || {};
    next.routes[r.route][String(r.w)] = {
      findings,
      firstAction: r.firstAction,
      hierarchy: r.hierarchy
        ? {
            h1: r.hierarchy.h1,
            largest: r.hierarchy.largest,
            ratio: r.hierarchy.ratio,
            peers: r.hierarchy.peers,
            share: r.hierarchy.share,
          }
        : null,
    };
  }
  const target = path.resolve(String(BASELINE));
  mkdirSync(path.dirname(target), { recursive: true });
  writeFileSync(target, JSON.stringify(next, null, 2) + "\n");

  // Every decision that has no reason yet.
  const needReason = [...signatureDetail.entries()].filter(([k]) => !hasReasonKey(k));
  console.log(`  · baseline written: ${target}`);
  console.log(`  · ${signatureDetail.size} distinct decision(s) measured; ${signatureDetail.size - needReason.length} already justified.`);
  if (staleReasons.length || staleExempts.length) {
    console.log(
      `  · ${staleReasons.length} stale reason(s) and ${staleExempts.length} stale exemption(s) dropped — ` +
        `they described a decision that is no longer there:`,
    );
    for (const k of staleReasons) console.log(`      - ${k}`);
    for (const e of staleExempts) console.log(`      - ${e.check} on ${e.route}`);
  }
  if (needReason.length) {
    console.error(
      `\nFAIL — ${needReason.length} decision(s) have no reason.\n` +
        `  A hole with no reason is a hole nobody chose. Write why each one is there —\n` +
        `  "the section break before the guide" is a reason; "the grid put it there" is\n` +
        `  not — in the "reasons" block of the baseline, and run the gate again.\n`,
    );
    for (const [k, v] of needReason) {
      console.error(`  ✗ ${v.kind} ${v.sel} — ${v.detail}  (first seen at ${v.at})`);
    }
    process.exit(1);
  }
  console.log("  · every decision in the baseline carries a reason.");
  process.exit(0);
}

// ---------------------------------------------------------------- report
if (REPORT) {
  console.log(
    "route".padEnd(22) + "w".padEnd(6) + "find".padEnd(6) + "dead".padEnd(6) + "orph".padEnd(6) +
    "wrap".padEnd(6) + "clip".padEnd(6) + "scat".padEnd(6) + "act-y".padEnd(8) + "h1".padEnd(6) +
    "ratio".padEnd(7) + "share",
  );
  for (const r of results) {
    const count = (k) => r.findings.filter((f) => f.kind === k).length;
    const h = r.hierarchy || {};
    console.log(
      String(r.route).padEnd(22) + String(r.w).padEnd(6) + String(r.findings.length).padEnd(6) +
      String(count("dead")).padEnd(6) + String(count("orphan")).padEnd(6) + String(count("wrap")).padEnd(6) +
      String(count("clip")).padEnd(6) + String(count("scattered")).padEnd(6) +
      String(r.firstAction ? r.firstAction.y : "-").padEnd(8) + String(h.h1 || "-").padEnd(6) +
      String(h.ratio === null || h.ratio === undefined ? "-" : h.ratio).padEnd(7) + String(h.share ?? "-"),
    );
  }
  console.log(`\n${results.length} measurements across ${routes.length} routes and ${widths.length} widths.`);
  console.log(
    `  · ${crossChecked} of them were measured a second time from a FRESH page load ` +
      `(widths ${crossWidths.join(", ") || "none"}) and agreed to within 1px — ` +
      `so resizing a loaded page and loading it again give the same geometry.`,
  );

  // The decisions, not the findings. One decision can show up on many pages
  // at many widths; it is still one promise, and it needs one reason.
  const decisions = new Map();
  for (const r of results) {
    for (const f of r.findings) {
      if (f.kind === "overflow") continue;
      const k = keyOf(f);
      if (!decisions.has(k)) decisions.set(k, { kind: f.kind, sel: f.sel, detail: f.detail, seen: 0, where: [] });
      const d = decisions.get(k);
      d.seen++;
      if (d.where.length < 4) d.where.push(`${r.route} @${r.w}px`);
    }
  }
  console.log(`\n${decisions.size} distinct decision(s) measured:`);
  for (const [k, d] of decisions) {
    const why = reasons[k];
    const mark = hasReasonKey(k) ? "✓" : "?";
    console.log(
      `  ${mark} ${d.kind.padEnd(10)} ${d.sel.padEnd(44)} seen ${String(d.seen).padStart(3)}x  ${d.detail.slice(0, 70)}`,
    );
    if (!hasReasonKey(k)) console.log(`      ↳ NO REASON YET — ${d.where.join(", ")}`);
  }
  if (unrecorded.length) {
    console.log(`\nUNRECORDED findings (${unrecorded.length}) — the baseline has no numbers for them:`);
    for (const f of unrecorded.slice(0, 40)) console.log(`  · ${f.route} @${f.w}px ${f.kind} ${f.sel} — ${f.why}`);
  }
  if (unexplained.length) {
    console.log(`\nUNEXPLAINED findings (${unexplained.length}):`);
    for (const f of unexplained.slice(0, 40)) console.log(`  · ${f.route} @${f.w}px ${f.kind} ${f.sel} — ${f.detail}`);
  }
  if (grownFindings.length) {
    console.log(`\nGROWN findings (${grownFindings.length}):`);
    for (const f of grownFindings.slice(0, 40)) console.log(`  · ${f.route} @${f.w}px ${f.kind} ${f.sel} — ${f.was} → ${f.metric} (+${f.delta})`);
  }
  if (goneFindings.length) {
    console.log(`\nGONE findings (${goneFindings.length}) — the baseline is stale here:`);
    for (const f of goneFindings.slice(0, 40)) console.log(`  · ${f.route} @${f.w}px ${f.kind} ${f.sel}`);
  }
  if (staleReasons.length) {
    console.log(`\nSTALE reasons (${staleReasons.length}) — a reason with nothing under it:`);
    for (const k of staleReasons) console.log(`  · ${k}`);
  }
  printNotes();
  process.exit(0);
}

// ---------------------------------------------------------------- verdict
if (!baseline) {
  console.error(
    `\nFAIL — there is no spatial baseline at ${path.resolve(String(BASELINE))}.\n` +
      `  Nothing has been reviewed, so nothing is known to be deliberate.\n` +
      `  Run with --update to record what is there, then give every finding a reason.\n`,
  );
  process.exit(1);
}

if (failures.length) {
  console.error(`\nFAIL — ${failures.length} spatial problem(s):\n`);
  for (const f of failures) console.error(`  ✗ ${f}`);
  console.error(
    "\n  Whitespace is intentional when it separates meaningful groups, supports reading,\n" +
      "  or establishes emphasis. It is a hallucination when it asks the reader to supply\n" +
      "  an intention nobody had. Give every finding a reason, or remove it.\n",
  );
  printNotes();
  process.exit(1);
}

printNotes();
console.log(
  `  · spatial: ${results.length} measurements across ${routes.length} routes and ${widths.length} widths — ` +
    `every hole, orphan, scattered pair and wrap is either fixed or written down`,
  `  · spatial: ${crossChecked} measurements were taken a second time from a FRESH page load ` +
    `(widths ${crossWidths.join(", ") || "none"}) and agreed to within 1px — ` +
    `so resizing a loaded page and loading it again give the same geometry`,
);
