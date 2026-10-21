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
function measureOne(route, w, h, cb) {
  // Two guards, both learned the hard way.
  //
  // TOKEN: the iframe fires load for about:blank as well as for the real
  // page, so one measurement can start twice. A stale run must never call
  // back — after the iframe navigates, the captured window forwards to the
  // new document, the probe it installed is gone, and calling it throws
  // "is not a function".
  //
  // done: exactly one result per measurement. Two loops racing on the same
  // iframe would report the same page twice, and the gate would then claim
  // to have measured more than it promised.
  var token = ++TOKEN;
  var done = false;
  function finish(rec) {
    if (done) return;
    done = true;
    cb(rec);
  }
  f.style.width = w + 'px';
  f.style.height = h + 'px';
  f.src = route;
  f.onload = function () {
    if (token !== TOKEN) return;
    var tries = 0;
    (function wait() {
      if (token !== TOKEN) return;
      var d;
      try { d = f.contentDocument; } catch (e) { return finish({ route: route, w: w, error: 'cross-origin' }); }
      if (!d) return finish({ route: route, w: w, error: 'no document' });
      if (tries++ > 140) return finish({ route: route, w: w, error: 'timed out waiting for the page' });
      var mainEl = d && (d.querySelector('main#content') || d.querySelector('main') || d.body);
      if (d.readyState === 'complete' && mainEl) {
        if (!d.__spatialInstalled) { d.__spatialInstalled = true; installProbe(d); }
        var wv = d.defaultView;
        if (wv && typeof wv.__SPATIAL_MEASURE__ === 'function') {
          return setTimeout(function () {
            if (token !== TOKEN) return;
            // The page may have navigated while we settled. If it did, the
            // window we captured now belongs to a different document, and the
            // probe is not there any more.
            //
            // The window proxy is REUSED across a same-origin navigation, so
            // comparing defaultView cannot tell the two documents apart —
            // the probe's presence is the only honest test.
            if (typeof wv.__SPATIAL_MEASURE__ !== 'function') return wait();
            finish(wv.__SPATIAL_MEASURE__(route, w, d));
          }, 220);
        }
      }
      setTimeout(wait, 50);
    })();
  };
}
function heightFor(w) { return w <= 480 ? 844 : 1000; }
function run() {
  var results = [];
  var i = 0, j = 0;
  function step() {
    if (i >= ROUTES.length) { out.textContent = TAG_OK + JSON.stringify(results); return; }
    var W = WIDTHS[j];
    measureOne(ROUTES[i], W, heightFor(W), function (rec) {
      rec.route = ROUTES[i];
      rec.w = W;
      results.push(rec);
      j++;
      if (j >= WIDTHS.length) { i++; j = 0; }
      setTimeout(step, 25);
    });
  }
  document.documentElement.style.overflow = 'hidden';
  document.body.style.overflow = 'hidden';
  step();
}
run();
</script></body></html>`;

function harnessHtml(widths, routes) {
  return HARNESS.replace("__WIDTHS__", JSON.stringify(widths))
    .replace("__ROUTES__", JSON.stringify(routes))
    .replace("__PROBE__", JSON.stringify(PROBE_SRC));
}

// ---------------------------------------------------------------- the server
let server = null;
let port = 0;

async function startServer(routes, widths) {
  if (BASE) {
    // Measure a running site. Everything is proxied through one local
    // origin so the iframe stays same-origin with the harness and its
    // geometry can be read.
    const base = String(BASE).replace(/\/+$/, "");
    server = createServer(async (req, res) => {
      const raw = decodeURIComponent((req.url || "/").split("?")[0]);
      if (raw === "/__spatial-harness") {
        res.writeHead(200, { "content-type": MIME[".html"] });
        return res.end(harnessHtml(widths, routes));
      }
      try {
        const target = new URL(raw, base + "/");
        const upstream = await fetch(target, {
          method: req.method === "HEAD" ? "HEAD" : "GET",
          headers: { "user-agent": "spatial-law-probe", accept: "text/html,*/*" },
          redirect: "follow",
        });
        const ct = upstream.headers.get("content-type") || "application/octet-stream";
        let body = Buffer.from(await upstream.arrayBuffer());
        if (/text\/html/.test(ct)) {
          let html = body.toString("utf8");
          const tag = `<base href="${base}/">`;
          html = /<head[^>]*>/i.test(html)
            ? html.replace(/<head[^>]*>/i, (m) => m + tag)
            : tag + html;
          body = Buffer.from(html, "utf8");
        }
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
        return res.end(harnessHtml(widths, routes));
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
function cssBreakpoints(root) {
  const found = new Set();
  const dir = path.join(root, "_next", "static", "css");
  let files = [];
  try {
    files = readdirSync(dir).filter((f) => f.endsWith(".css"));
  } catch {
    return found;
  }
  for (const f of files) {
    let text = "";
    try {
      text = readFileSync(path.join(dir, f), "utf8");
    } catch {
      continue;
    }
    for (const m of text.matchAll(/@media[^{]*?\((?:min|max)-width:\s*([\d.]+)(px|rem|em)\)/g)) {
      const n = parseFloat(m[1]);
      if (!Number.isFinite(n) || n <= 0) continue;
      const px = m[2] === "px" ? n : n * 16;
      const bp = Math.round(px);
      // A breakpoint is a cliff: measure the width just below it, the width
      // itself, and the width just above it.
      for (const w of [bp - 1, bp, bp + 1]) if (w > 0) found.add(w);
    }
  }
  return found;
}

// ---------------------------------------------------------------- measure
const baseline = loadBaseline();
const projectWidths =
  baseline && Array.isArray(baseline.widths) && baseline.widths.length
    ? baseline.widths.map(Number).filter(Boolean)
    : DEFAULT_WIDTHS;
const cssWidths = BASE ? new Set() : cssBreakpoints(path.resolve(String(DIR)));
const widths = WIDTHS_ARG
  ? String(WIDTHS_ARG).split(",").map((w) => parseInt(w.trim(), 10)).filter(Boolean)
  : [...new Set([...projectWidths, ...cssWidths])].sort((a, b) => a - b);

const routes = await discoverRoutes();
if (!routes.length) {
  console.error("\nFAIL — the spatial gate found no routes to measure. Nothing was verified.\n");
  process.exit(1);
}

await startServer(routes, widths);

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
        // is therefore worked out from the number of measurements.
        `--virtual-time-budget=${Math.max(180000, routes.length * widths.length * 800)}`,
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
    const killer = setTimeout(() => child.kill("SIGKILL"), 900000);
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

const m = /RESULTS:(\[.*?\])(?:<\/pre>|$)/s.exec(dom);
const harnessError = /RESULTS:ERROR:([\s\S]*?)(?:<\/pre>|$)/.exec(dom);
if (harnessError) {
  console.error(`\nFAIL — the spatial harness threw. Nothing was verified.\n${harnessError[1].trim()}\n`);
  process.exit(1);
}
if (!m) {
  console.error("\nFAIL — the spatial gate could not measure: the probe never reported results.\n  Nothing was verified.\n");
  process.exit(1);
}
let results;
try {
  results = JSON.parse(
    m[1].replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"'),
  );
} catch (e) {
  console.error(`\nFAIL — the spatial gate could not parse its own results: ${e.message}\n`);
  process.exit(1);
}

const expected = routes.length * widths.length;
if (results.length !== expected) {
  console.error(
    `\nFAIL — the spatial gate is under-measuring.\n` +
      `  Expected ${expected} measurements (${routes.length} routes x ${widths.length} widths), got ${results.length}.\n`,
  );
  process.exit(1);
}
const errored = results.filter((r) => r.error);
if (errored.length) {
  console.error(`\nFAIL — the spatial gate could not read ${errored.length} page measurement(s):`);
  for (const e of errored.slice(0, 10)) console.error(`  ✗ ${e.route} @${e.w}px — ${e.error}`);
  process.exit(1);
}

if (JSON_OUT) {
  mkdirSync(path.dirname(path.resolve(String(JSON_OUT))), { recursive: true });
  writeFileSync(path.resolve(String(JSON_OUT)), JSON.stringify(results, null, 2));
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
const notes = [];
const unexplained = [];
const unrecorded = [];
const grownFindings = [];
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

// A stale reason can only be judged when the sweep was COMPLETE. A run over
// a few routes has not seen the routes the reason belongs to, and calling
// that reason stale would be the instrument inventing a defect. So the check
// only runs when every route the baseline knows about was measured.
const fullSweep = !ROUTES_ARG && Object.keys(baselineRoutes).every((rt) => measuredRoutes.has(rt));
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
  notes.push("stale reasons were not checked — this run did not sweep every route the baseline knows about");
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
);
