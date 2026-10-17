#!/usr/bin/env node
/**
 * Horizontal-overflow gate for the built site.
 *
 * Why this exists: on /practice/ the phone layout scrolled sideways by 89px.
 * The cause was not a stray fixed width. The mobile collapse rule said
 *
 *     .practice-grid { grid-template-columns: 1fr }
 *
 * and a bare `1fr` is `minmax(auto, 1fr)` — the `auto` minimum resolves to the
 * item's *min-content* width. The chapter-drill <select> carries a 50-character
 * <option>; `min-width: 0` shrinks the select's used size but does nothing to
 * its intrinsic min-content width. The track therefore measured 461px inside a
 * 354px column and dragged the whole document to 479px on a 390px phone.
 *
 * That class of bug is invisible to a CSS linter and easy to miss in a
 * screenshot you only glance at. So this gate measures the real thing: load
 * every built route in a real Chrome at phone / tablet / desktop widths and fail
 * if the document scrolls sideways.
 *
 * Two rules this gate holds itself to, both learned the hard way:
 *
 *   1. A gate that cannot measure must FAIL, not pass. No Chrome, no harness,
 *      fewer measurements than expected — all failures. A check that reports
 *      clean because it ran nothing is worse than no check, because it gets
 *      believed. Set LAYOUT_CHECK=skip to opt out deliberately; it then prints
 *      SKIPPED loudly and never claims a pass.
 *   2. No hand-picked route list. It walks `out/` and measures everything it
 *      finds, so a new route cannot quietly escape the gate.
 *
 * KNOWN LIMIT, stated rather than hidden: this detects overflow, not broken
 * composition. A page can measure perfectly while looking wrong — a starved
 * text column is `over = 0`. It also cannot see content clipped by an
 * intermediate `overflow-x: hidden` wrapper, because a scroll container between
 * root and content hides the overflow from documentElement.scrollWidth
 * (root-level clipping does not, which is the common case). Neither is
 * something a release gate can decide; both need eyes on the render.
 */
import { createServer } from "node:http";
import { readdir } from "node:fs/promises";
import { existsSync, readFileSync, rmSync } from "node:fs";
import { execFile } from "node:child_process";
import { tmpdir } from "node:os";
import path from "node:path";

const ROOT = process.cwd();
const OUT = path.join(ROOT, "out");

// 721 and 860 are here on purpose. They are the two widths where this
// stylesheet flips from its phone layout to its rail layout, and where a
// 200px plate used to starve the text column to 209px. A gate that only tests
// 390/768/1440 walks straight past the discontinuity: 768 and 1024 both looked
// acceptable, so the composition broke in the gap between them without anyone
// noticing. Round breakpoints are not where a layout breaks.
const WIDTHS = [
  { w: 390, h: 900, label: "phone" },
  { w: 721, h: 900, label: "rail-start" },
  { w: 860, h: 900, label: "mid-rail" },
  { w: 1024, h: 1000, label: "tablet" },
  { w: 1440, h: 1000, label: "desktop" },
];

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

// ------------------------------------------------------------------ exit paths
const skip = process.env.LAYOUT_CHECK === "skip";
if (skip) {
  console.error(
    "\n  !! LAYOUT CHECK SKIPPED (LAYOUT_CHECK=skip) — no overflow measurement was made.\n" +
      "     This is NOT a pass. Do not report this run as layout-clean.\n",
  );
  process.exit(0);
}
if (!CHROME) {
  console.error(
    "\nFAIL — layout gate could not measure.\n" +
      "  No Chrome binary found. Tried:\n" +
      CHROME_CANDIDATES.map((c) => `    ${c}`).join("\n") +
      "\n  Set CHROME_PATH=/path/to/chrome, or LAYOUT_CHECK=skip to opt out deliberately.\n",
  );
  process.exit(1);
}

// ---------------------------------------------------------------- static server
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
};

// Served from the same origin as the pages it measures, so the iframe is
// same-origin and its layout is readable. Never written into out/, so a failed
// run leaves no debris in the build directory.
const HARNESS = `<!doctype html><meta charset="utf-8"><title>layout probe</title>
<style>html,body{margin:0;padding:0;background:#000}iframe{border:0;display:block}</style>
<iframe id="f"></iframe><pre id="out"></pre>
<script>
var WIDTHS = __WIDTHS__;
const f = document.getElementById('f');
var out = document.getElementById('out');
// Surface our own faults instead of dying silently. A harness that throws
// looks exactly like a harness that timed out, and that ambiguity is how a
// gate ends up reporting "clean" when it actually measured nothing.
// Sentinels are assembled at runtime. --dump-dom serialises this <script> into
// the DOM we later regex, so a literal 'RESULTS:' written here would match its
// own source and be mistaken for a result. Split the string; it never appears
// verbatim in the markup.
var TAG_OK = 'RESULT' + 'S:';
var TAG_ERR = 'RESULT' + 'S:ERROR:';

window.onerror = function (msg, src, line, col, err) {
  out.textContent = TAG_ERR + (err && err.stack ? err.stack : msg) +
    ' @' + line + ':' + col + ' src=' + String(src).slice(0, 80);
  return true;
};

function measureOne(route, w, h, cb) {
  var setSrc = function () {
    f.style.width = w + 'px'; f.style.height = h + 'px';
    f.src = route;
    f.onload = function () {
      var tries = 0;
      (function wait() {
        var d;
        try { d = f.contentDocument; } catch (e) { return cb({ route: route, w: w, error: 'cross-origin' }); }
        if (tries++ > 80) return cb(measure(route, w, d));
        if (d && d.readyState === 'complete' && d.querySelector('body')) return setTimeout(function () { cb(measure(route, w, d)); }, 200);
        setTimeout(wait, 60);
      })();
    };
  };
  setSrc();
}

function measure(route, w, d) {
  var win = d.defaultView;
  var vw = d.documentElement.clientWidth;
  var sw = d.documentElement.scrollWidth;
  var rec = { route: route, w: w, label: labelOf(w), clientWidth: vw, scrollWidth: sw, over: sw - vw, culprits: [] };
  if (vw === 0) { rec.error = 'clientWidth 0 — page did not lay out'; return rec; }
  if (sw > vw + 1) {
    var all = d.querySelectorAll('*'), found = [];
    for (var k = 0; k < all.length; k++) {
      var el = all[k], r = el.getBoundingClientRect();
      if (!(r.width && r.right > vw + 1)) continue;
      var kidBad = false;
      for (var c = 0; c < el.children.length; c++) {
        var kr = el.children[c].getBoundingClientRect();
        if (kr.width && kr.right > vw + 1) { kidBad = true; break; }
      }
      if (kidBad) continue;
      found.push({
        tag: el.tagName.toLowerCase(),
        cls: String(el.className || '').slice(0, 48),
        w: Math.round(r.width),
        right: Math.round(r.right),
        text: (el.textContent || '').trim().replace(/\\s+/g, ' ').slice(0, 36)
      });
    }
    found.sort(function (a, b) { return b.right - a.right; });
    rec.culprits = found.slice(0, 4);
  }
  return rec;
}

function labelOf(w) {
  for (var i = 0; i < WIDTHS.length; i++) if (WIDTHS[i].w === w) return WIDTHS[i].label;
  return String(w);
}

function run() {
  var routes = JSON.parse(decodeURIComponent(location.search.slice(1).split('=')[1] || '[]'));
  var results = [];
  var i = 0, j = 0;
  function step() {
    if (i >= routes.length) {
      out.textContent = TAG_OK + JSON.stringify(results);
      return;
    }
    var W = WIDTHS[j];
    measureOne(routes[i], W.w, W.h, function (rec) {
      results.push(rec);
      j++;
      if (j >= WIDTHS.length) { i++; j = 0; }
      setTimeout(step, 30);
    });
  }
  // Keep the document itself from ever being the thing that scrolls.
  document.documentElement.style.overflow = 'hidden';
  document.body.style.overflow = 'hidden';
  step();
}
run();
</script>`;

const server = createServer((req, res) => {
  // Normalise before touching the filesystem. `path.join` collapses "..", so
  // an un-normalised url let /../package.json read outside out/.
  const raw = decodeURIComponent((req.url || "/").split("?")[0]);
  const url = path.posix.normalize(raw).replace(/\/+$/, "") || "/";
  if (url.includes("..")) {
    res.writeHead(400);
    return res.end("bad path");
  }
  if (url === "/_layout-probe") {
    res.writeHead(200, { "content-type": MIME[".html"] });
    return res.end(HARNESS.replace("__WIDTHS__", JSON.stringify(WIDTHS)));
  }
  for (const c of [
    path.join(OUT, url),
    path.join(OUT, url, "index.html"),
    path.join(OUT, url + ".html"),
  ]) {
    try {
      if (existsSync(c) && readFileSync(c)) {
        res.writeHead(200, { "content-type": MIME[path.extname(c)] || "application/octet-stream" });
        return res.end(readFileSync(c));
      }
    } catch {
      /* not a file — try the next candidate */
    }
  }
  const nf = path.join(OUT, "404.html");
  if (existsSync(nf)) {
    res.writeHead(404, { "content-type": MIME[".html"] });
    return res.end(readFileSync(nf));
  }
  res.writeHead(404);
  res.end("not found");
});

const routes = [];
if (existsSync(path.join(OUT, "index.html"))) routes.push("/");
for (const e of await readdir(OUT, { withFileTypes: true })) {
  if (!e.isDirectory()) continue;
  if (e.name.startsWith("_") || e.name.startsWith(".") || e.name === "404") continue;
  if (existsSync(path.join(OUT, e.name, "index.html"))) routes.push(`/${e.name}/`);
}
routes.sort();
if (routes.length === 0) {
  console.error("\nFAIL — layout gate found no built routes in out/. Nothing was measured.\n");
  process.exit(1);
}

const expected = routes.length * WIDTHS.length;
const port = await new Promise((resolve) => {
  server.listen(0, "127.0.0.1", () => resolve(server.address().port));
});
const prof = `${tmpdir()}/layoutgate-${process.pid}-${Date.now()}`;

/**
 * Chrome is not reliably reaped by execFile: killing the direct child leaves its
 * helper processes behind, and a profile directory behind that. Repeated gate
 * runs then stack up — measured at 380 orphaned Chrome processes and a load
 * average above 100, which made later runs so slow they looked hung. Clean the
 * profile on every exit path.
 */
let cleaned = false;
function cleanup() {
  if (cleaned) return;
  cleaned = true;
  try {
    rmSync(prof, { recursive: true, force: true });
  } catch {
    /* best effort; a stray profile must never fail the gate */
  }
}
process.on("exit", cleanup);
for (const sig of ["SIGINT", "SIGTERM"]) process.on(sig, () => { cleanup(); process.exit(130); });

let dom = "";
try {
  dom = await new Promise((resolve, reject) => {
    execFile(
      CHROME,
      [
        "--headless=new",
        "--disable-gpu",
        "--hide-scrollbars",
        "--no-first-run",
        "--no-default-browser-check",
        "--disable-extensions",
        `--user-data-dir=${prof}`,
        "--virtual-time-budget=120000",
        "--dump-dom",
        `http://127.0.0.1:${port}/_layout-probe?r=${encodeURIComponent(JSON.stringify(routes))}`,
      ],
      { maxBuffer: 128 * 1024 * 1024, timeout: 300000, killSignal: "SIGKILL" },
      (err, stdout) => (err ? reject(new Error(err.message)) : resolve(stdout)),
    );
  });
} catch (e) {
  server.close();
  cleanup();
  console.error(`\nFAIL — layout gate could not measure: Chrome failed (${e.message}).\n`);
  process.exit(1);
}
server.close();
cleanup();

const m = /RESULTS:(\[.*?\])(?:<\/pre>|$)/s.exec(dom);
const harnessError = /RESULTS:ERROR:([\s\S]*?)(?:<\/pre>|$)/.exec(dom);
if (harnessError) {
  console.error(
    `\nFAIL — layout gate harness threw. Nothing was verified.\n${harnessError[1].trim()}\n`,
  );
  process.exit(1);
}
if (!m) {
  console.error(
    "\nFAIL — layout gate could not measure: the probe never reported results.\n" +
      "  The harness did not finish inside the virtual-time budget. Chrome may have\n" +
      "  failed to start, or the page count is too high. Nothing was verified.\n",
  );
  process.exit(1);
}

let results;
try {
  results = JSON.parse(m[1].replace(/&quot;/g, '"').replace(/&amp;/g, "&"));
} catch (e) {
  console.error(`\nFAIL — layout gate could not parse its own results: ${e.message}\n`);
  process.exit(1);
}

// The self-check that keeps this honest: prove we measured what we intended.
if (results.length !== expected) {
  console.error(
    `\nFAIL — layout gate is under-measuring.\n` +
      `  Expected ${expected} measurements (${routes.length} routes x ${WIDTHS.length} widths), got ${results.length}.\n` +
      `  A gate that silently measures fewer pages than it claims is not a gate.\n`,
  );
  process.exit(1);
}
const errored = results.filter((r) => r.error);
if (errored.length) {
  console.error(`\nFAIL — layout gate could not lay out ${errored.length} page(s):`);
  for (const e of errored.slice(0, 8)) console.error(`  ✗ ${e.route} @${e.w} — ${e.error}`);
  process.exit(1);
}

const overflow = results.filter((r) => r.over > 1);
if (overflow.length) {
  console.error(`\nFAIL — ${overflow.length} page/width combination(s) scroll sideways:\n`);
  for (const o of overflow) {
    console.error(`  ✗ ${o.route} @${o.w}px (${o.label}) — ${o.clientWidth}px wide, content reaches ${o.scrollWidth}px (+${o.over})`);
    for (const c of o.culprits) {
      console.error(`      <${c.tag} class="${c.cls}"> width ${c.w}px, right edge ${c.right}px  "${c.text}"`);
    }
  }
  console.error(
    "\n  Usual cause: a grid track written `1fr` (which is `minmax(auto,1fr)`) or a\n" +
      "  `nowrap` child. Use `minmax(0, 1fr)` so the track can shrink below content width.\n",
  );
  process.exit(1);
}

console.log(
  `  · layout: ${results.length} measurements across ${routes.length} routes at ` +
    `${WIDTHS.map((w) => w.w).join("/")}px — no horizontal overflow`,
);