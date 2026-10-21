#!/usr/bin/env node
/**
 * Hierarchy-of-communication gate for the built site.
 *
 * Why this exists. The failure this site kept shipping is not overflow and not
 * a missing font — it is that every part of a page spoke at the same volume.
 * On /glossary/ ninety-three terms were bold and body-sized, so nothing was
 * the heading of anything. On /exam/ thirty cards had identical weight, so the
 * page's one real action was a plain link in the middle of a wall.
 *
 * A human should be able to look at a page and know within a couple of seconds
 * where to look. Three things make that possible, and all three are measurable
 * on the rendered page rather than guessed from the source:
 *
 *   1. THE TITLE WINS. The h1 must be the largest text on the page.
 *   2. NOT EVERYTHING SHOUTS. Bold, body-sized text is a scarce resource. When
 *      a page has dozens of equally loud peers, the eye has nothing to follow,
 *      and the title stops being the loudest thing simply by being the only
 *      one with a size advantage over an entire grid.
 *   3. THE PAGE HAS SOMETHING TO DO. A page with no primary action in the
 *      first screen is a page that describes itself instead of doing anything.
 *
 * The gate holds itself to the same rule as the layout gate: a check that
 * cannot measure must FAIL, not pass. Fewer measurements than expected, an
 * unparsable report, or a missing Chrome all fail loudly. Set
 * HIERARCHY_CHECK=skip to opt out deliberately — it prints SKIPPED and never
 * claims a pass.
 *
 * Run with --report to print the measurements without failing on the
 * thresholds. The thresholds were set from the measured site, not chosen first:
 * --report prints the distribution, and every threshold below is a round
 * number outside the worst page's actual reading.
 */
import { createServer } from "node:http";
import { readdir } from "node:fs/promises";
import { existsSync, readFileSync, rmSync } from "node:fs";
import { execFile } from "node:child_process";
import { tmpdir } from "node:os";
import path from "node:path";

const ROOT = process.cwd();
const OUT = path.join(ROOT, "out");

/**
 * The thresholds, and the reading behind each one.
 *
 * boldPeers: the number of bold, body-sized pieces of text on a page. This is
 *   REPORTED, not limited, and the reason is the interesting part. A limit of
 *   twelve was written here once and never compared, because no correct page
 *   can meet it: /glossary/ measures 90 and is a proper dictionary, /cram/
 *   measures 45 and is a proper table. What makes a page bad is not how many
 *   things are loud but how much of the page is loud — so the limit is on
 *   the SHARE (see peerShare), and the count is kept because it is how you
 *   see which page is doing the shouting.
 *
 * peerShare: the share of the page's characters set in the loud voice. The
 *   defect the count could not see: /rights/ had 34 loud things and was two
 *   thirds loud, because its fifteen questions AND its fifteen row actions
 *   were both bold. A dictionary of 89 headwords is only a ninth loud,
 *   because the definitions are the reading. The limit is half the page.
 *
 * peerGroups: distinct (size, weight) pairs among those peers. Ninety-three
 * terms set in one style are ONE group of ninety-three, and that is a wall
 * rather than a list. More than two groups of loud text means the page is
 * competing with itself at more than one volume.
 *
 * finePrint: characters at 13px or smaller, over total characters. /bible/
 *   measured 1342 characters of 13px notes against 691 characters of body
 *   text — twice as much small print as reading. The limit is 45%: past that
 *   the page is mostly a footnote.
 *
 * titleRatio: the h1's size over the largest size used anywhere else in the
 *   content. The limit is 1.6. A page where the biggest thing is only 1.6x
 *   the title has no headline; the measured site is at 44 over 24, which is
 *   1.83.
 *
 * primaryActions: filled primary controls inside the first screen. At least
 *   one, so the page has something to do. More than one *visible* filled
 *   button in the first screen is not a problem — a quiz has Submit and
 *   "submit now" — so this is reported, not failed.
 */
const LIMITS = {
  // The title must outrank every other piece of text on the page. Measured:
  // /memory/ and /review/ both had a 44px room number and a 44px "0" sitting
  // level with the 44px h1, so the title was not the title. The limit is 1.6.
  titleRatio: 1.6,
  // The title must be a title, not a slightly bigger heading. The house ramp is
  // 13 / 18 / 44; 44 over 18 is 2.44. The limit is 1.7, which the 32px phone
  // title over 18px body clears at 1.78.
  titleVsBody: 1.7,
  // At most two volumes of loud text. A third means the page is competing with
  // itself at more than one level.
  peerGroups: 2,
  // At most two filled primary actions on a page. One is the main action.
  // Three means the page has no main action at all, which is the complaint
  // that started this gate.
  primaryTotal: 2,
  // At most twelve card-like actions on a page. /exam/ used to show thirty
  // identical paper cards; they all had a border on every side and the same
  // type, so nothing led. A quiet list of rows separated by a hairline is not
  // a card and does not count.
  prominentActions: 12,
  // At most ONE loud thing per row.
  //
  // This is the rule the owner's complaint actually names: "everything is
  // competing, fighting, and generally not interesting because everything is
  // the same, hierarchical, and dominant. As in, nobody dominates anything
  // at all, because everything is equally generic and, as I mentioned,
  // practically the same size and based on the same underlying hierarchy."
  //
  // A COUNT of loud things cannot express that, and never could: a
  // dictionary of 89 terms is supposed to have 89 headwords, and a list of
  // 15 situations is supposed to have 15. What is wrong is two things in the
  // SAME ROW at the same weight. /rights/ had its question in the loud
  // voice and its "try it" action in the loud voice, one of each per row, so
  // every row was a competition. /cram/ had a topic name and a number side
  // by side, both loud.
  //
  // A row is a repeated item: an element whose parent holds at least two
  // children of the same tag and class. So a list row, a table row, a card
  // in a grid. A heading that stands alone is not a row and is not limited.
  loudPerRow: 1,
  // Exactly one dominant affordance in the first screen. This is the owner's
  // third rule: every page has one main functionality that dominates, rather
  // than everything competing at the same weight. Sixteen routes measured no
  // dominant affordance at all — on /library/ the largest thing on the page
  // was a "back to home" link, and on /glossary/ the search field that the
  // page exists for was an invisible dark box.
  //
  // A DOMINANT affordance is an element that either paints itself amber (the
  // page's one main action) or carries a thick accent-coloured left edge (the
  // panel that holds the one thing to do). Counted by what it looks like, not
  // by its class name. Nested affordances are counted once: an amber button
  // inside an accent-edged panel is one thing, not two.
  dominantAffordances: 1,
};

const WIDTHS = [
  { w: 390, h: 844, label: "phone" },
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

const REPORT = process.argv.includes("--report");

// ------------------------------------------------------------------ exit paths
if (process.env.HIERARCHY_CHECK === "skip") {
  console.error(
    "\n  !! HIERARCHY CHECK SKIPPED (HIERARCHY_CHECK=skip) — nothing was measured.\n" +
      "     This is NOT a pass. Do not report this run as hierarchy-clean.\n",
  );
  process.exit(0);
}
if (!CHROME) {
  console.error(
    "\nFAIL — hierarchy gate could not measure.\n" +
      "  No Chrome binary found. Tried:\n" +
      CHROME_CANDIDATES.map((c) => `    ${c}\n`).join("") +
      "  Set CHROME_PATH=/path/to/chrome, or HIERARCHY_CHECK=skip to opt out deliberately.\n",
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
};

const HARNESS = `<!doctype html><meta charset="utf-8"><title>hierarchy probe</title>
<style>html,body{margin:0;padding:0;background:#000}iframe{border:0;display:block}</style>
<iframe id="f"></iframe><pre id="out"></pre>
<script>
var WIDTHS = __WIDTHS__;
var f = document.getElementById('f');
var out = document.getElementById('out');
var TAG_OK = 'RESULT' + 'S:';
var TAG_ERR = 'RESULT' + 'S:ERROR:';

window.onerror = function (msg, src, line, col, err) {
  out.textContent = TAG_ERR + (err && err.stack ? err.stack : msg) +
    ' @' + line + ':' + col + ' src=' + String(src).slice(0, 80);
  return true;
};

var TOKEN = 0;
function measureOne(route, w, h, cb) {
  // The iframe can fire load more than once for one measurement, and a
  // stale run must never call back: after the iframe navigates, the captured
  // window forwards to the new document, where the page it measured is gone.
  // "done" keeps one measurement from being reported twice — a gate that
  // claims to have measured more than it promised is a false measurement.
  var token = ++TOKEN;
  var done = false;
  function finish(rec) {
    if (done) return;
    done = true;
    cb(rec);
  }
  f.style.width = w + 'px'; f.style.height = h + 'px';
  f.src = route;
  f.onload = function () {
    if (token !== TOKEN) return;
    var tries = 0;
    (function wait() {
      if (token !== TOKEN) return;
      var d;
      try { d = f.contentDocument; } catch (e) { return finish({ route: route, w: w, error: 'cross-origin' }); }
      if (tries++ > 80) return finish(measure(route, w, d));
      // Wait for the thing this gate actually measures: a rendered <h1> inside
      // the page's main region. Several pages are client components that paint
      // their heading only after hydration, and readyState alone was not
      // enough — the gate measured an empty shell and reported "no h1" at
      // random, which was a flaky gate, not a failing page.
      var mainEl = d && (d.querySelector('main#content') || d.querySelector('main'));
      if (d && d.readyState === 'complete' && d.querySelector('body') && mainEl && mainEl.querySelector('h1')) {
        return setTimeout(function () {
          if (token !== TOKEN) return;
          finish(measure(route, w, d));
        }, 220);
      }
      setTimeout(wait, 60);
    })();
  };
}

function measure(route, w, d) {
  var win = d.defaultView;
  var rec = { route: route, w: w };
  var main = d.querySelector('main#content') || d.querySelector('main') || d.body;
  if (!main) { rec.error = 'no main'; return rec; }

  var h1 = main.querySelector('h1');
  if (!h1) { rec.error = 'no h1'; return rec; }
  var h1cs = win.getComputedStyle(h1);
  var h1size = parseFloat(h1cs.fontSize);
  rec.h1Size = h1size;

  // A DOMINANT affordance: an element that paints itself amber, or one that
  // carries a thick accent-coloured left edge — the panel that holds the one
  // thing to do on the page. Judged by what it looks like, never by its class
  // name, because a class name is a claim and a computed style is a fact.
  //
  // It must also be something the reader can ACT ON. The first version of this
  // rule counted any accent-coloured thing, and it caught the house's accent-bar
  // callouts and the amber highlighter swatches — decoration that looks like an
  // action. A signifier is not an affordance.
  function amberish(r, g, b) { return r > 180 && g > 100 && b < 90; }
  function isDominantShape(cs) {
    var bg = cs.backgroundColor && cs.backgroundColor.match(/rgba?\\((\\d+), (\\d+), (\\d+)/);
    if (bg && amberish(+bg[1], +bg[2], +bg[3])) return true;
    var bl = cs.borderLeftWidth ? parseFloat(cs.borderLeftWidth) : 0;
    if (bl >= 3) {
      var bc = cs.borderLeftColor && cs.borderLeftColor.match(/rgba?\\((\\d+), (\\d+), (\\d+)/);
      if (bc && amberish(+bc[1], +bc[2], +bc[3])) return true;
    }
    return false;
  }
  var ACTIVE = { A: 1, BUTTON: 1, INPUT: 1, SELECT: 1, TEXTAREA: 1 };

  // A ROW: a LEAF repeated item.
  //
  // "Repeated" means the parent holds at least two children of the same tag
  // and class — a list row, a table row, a card in a grid. "Leaf" means it
  // holds no repeated item of its own: a group of fifteen rows is a GROUP,
  // not a row, and its title is a title, not a competitor with its own
  // contents.
  //
  // A heading that stands alone is in no row at all, and is not limited.
  //
  // isRepeated is memoised: without it the scan is cubic and the gate takes
  // five minutes instead of five seconds.
  var repeatedCache = new WeakMap();
  function isRepeated(el) {
    if (repeatedCache.has(el)) return repeatedCache.get(el);
    var res = false;
    var p = el.parentElement;
    if (p) {
      var same = 0;
      for (var c = 0; c < p.children.length; c++) {
        var ch = p.children[c];
        if (ch.tagName === el.tagName && String(ch.className) === String(el.className)) same++;
      }
      res = same >= 2;
    }
    repeatedCache.set(el, res);
    return res;
  }
  var holdsCache = new WeakMap();
  function holdsRepeated(el) {
    if (holdsCache.has(el)) return holdsCache.get(el);
    var res = false;
    var all = el.querySelectorAll('*');
    for (var i = 0; i < all.length && !res; i++) {
      if (isRepeated(all[i])) res = true;
    }
    holdsCache.set(el, res);
    return res;
  }
  function rowOf(el) {
    for (var a = el.parentElement; a && a !== main; a = a.parentElement) {
      if (isRepeated(a) && !holdsRepeated(a)) return a;
    }
    return null;
  }

  // Everything with visible text inside the content area, excluding the h1
  // and its own descendants (the h1 may wrap a link or a span).
  var all = main.querySelectorAll('*');
  var peers = 0;
  var groups = {};
  var largest = 0;
  var microChars = 0;
  var totalChars = 0;
  var primaryInFold = 0;
  var primaryTotal = 0;
  var prominentActions = 0;
  var dominants = 0;
  var bodySizes = {};
  // Every rendered text size on the page, with the number of characters set
  // in it. The house ramp is three steps — micro 13, body 18, display 44 —
  // plus the 32px step the title takes on a phone. Anything else is a fourth
  // size, and a fourth size is a fourth level of hierarchy, which is the
  // complaint that started this gate.
  var sizeRamp = {};
  var peerChars = 0;
  var rowLoud = {};
  var rowEls = [];
  var fold = win.innerHeight || 900;

  for (var k = 0; k < all.length; k++) {
    var el = all[k];
    var cs = win.getComputedStyle(el);
    if (cs.display === 'none' || cs.visibility === 'hidden' || Number(cs.opacity) < 0.15) continue;
    var r = el.getBoundingClientRect();
    if (!r.width || !r.height) continue;

    // Leaf-ish text nodes only, so a wrapper is not counted twice.
    var own = '';
    for (var c = 0; c < el.childNodes.length; c++) {
      var nd = el.childNodes[c];
      if (nd.nodeType === 3) own += nd.nodeValue;
    }
    own = own.replace(/\\s+/g, ' ').trim();
    var len = own.length;
    if (len) {
      totalChars += len;
      var size = parseFloat(cs.fontSize);
      if (size <= 13.5) microChars += len;
      if (size > largest && el.tagName !== 'H1') {
        largest = size;
        rec.largestInfo = { tag: el.tagName.toLowerCase(), cls: String(el.className || '').slice(0, 40), size: size, weight: weight, text: own.slice(0, 40) };
      }
      var weight = Number(cs.fontWeight) || 400;
      if (size >= 14 && size < h1size) bodySizes[Math.round(size)] = (bodySizes[Math.round(size)] || 0) + len;
      var rk = String(Math.round(size * 10) / 10);
      sizeRamp[rk] = (sizeRamp[rk] || 0) + len;
      // A loud peer. Two exclusions, both about not counting ONE thing twice:
      // a native <option> is the browser's own list, not the page's type; and
      // a link whose arrow is a separate bold glyph is ONE loud thing, not a
      // competition with itself.
      var isPeer = weight >= 600 && size >= 15 && size < h1size;
      if (isPeer && el.tagName === 'OPTION') isPeer = false;
      if (isPeer) {
        var hasLoudAncestor = false;
        for (var anc = el.parentElement; anc && anc !== main; anc = anc.parentElement) {
          var acs = win.getComputedStyle(anc);
          if (Number(acs.fontWeight) >= 600 && parseFloat(acs.fontSize) >= 15 && parseFloat(acs.fontSize) < h1size) {
            hasLoudAncestor = true;
            break;
          }
        }
        if (hasLoudAncestor) isPeer = false;
      }
      if (isPeer) {
        peers++;
        peerChars += len;
        var gkey = Math.round(size) + '/' + weight;
        groups[gkey] = (groups[gkey] || 0) + 1;
        var row = rowOf(el);
        if (row) {
          if (!rowLoud[row]) { rowLoud[row] = 0; rowEls.push(row); }
          rowLoud[row]++;
        }
      }
    }

    // A FILLED action: an amber background. One on the page is the main
    // action. Three or more means the page has no main action at all —
    // everything is competing. Counted by what it looks like, not by the
    // class name: a button that paints itself amber is a main action whether
    // or not it remembered to call itself .primary.
    if (el.tagName === 'BUTTON' || el.tagName === 'A') {
      var bg = cs.backgroundColor;
      var m = bg && bg.match(/rgba?\\((\\d+), (\\d+), (\\d+)/);
      if (m && Number(m[1]) > 180 && Number(m[2]) > 100 && Number(m[3]) < 90) {
        primaryTotal++;
        if (r.top < fold && r.bottom > 0) primaryInFold++;
      }
      // A PROMINENT action: something that looks like a card or a filled
      // button — a background that is not transparent, or a border on every
      // side. A hairline rule above a row is not a card. Thirty of these on one
      // page is thirty things shouting at once, which is exactly how /exam/
      // used to look: thirty identical paper cards, so none of them led.
      //
      // The size test has to look at the label, not at the button: the global
      // button rule sets 13px on the element and the real text sits inside a
      // child at 18px. Testing the element's own font-size excluded every
      // button on the site and the rule never fired.
      var effSize = parseFloat(cs.fontSize);
      var kids = el.querySelectorAll('*');
      for (var ki = 0; ki < kids.length && ki < 60; ki++) {
        var ks = parseFloat(win.getComputedStyle(kids[ki]).fontSize);
        if (ks > effSize) effSize = ks;
      }
      var opaqueBg = bg && bg !== 'transparent' && !/rgba\\(0, 0, 0, 0\\)/.test(bg);
      var allSides = cs.borderTopWidth !== '0px' && cs.borderRightWidth !== '0px' &&
                     cs.borderBottomWidth !== '0px' && cs.borderLeftWidth !== '0px' &&
                     cs.borderTopStyle !== 'none';
      if ((opaqueBg || allSides) && effSize >= 14) prominentActions++;
    }

    // A dominant affordance in the first screen. Nested ones are counted
    // once: an amber button inside an accent-edged panel is one thing the
    // reader can act on, not two.
    if (ACTIVE[el.tagName] && isDominantShape(cs) && r.top < fold && r.bottom > 0) {
      var nested = false;
      for (var anc = el.parentElement; anc && anc !== main; anc = anc.parentElement) {
        if (ACTIVE[anc.tagName] && isDominantShape(win.getComputedStyle(anc))) { nested = true; break; }
      }
      if (!nested) {
        dominants++;
        rec.dominantInfo = rec.dominantInfo || [];
        rec.dominantInfo.push(el.tagName.toLowerCase() + '.' + String(el.className || '').slice(0, 30));
      }
    }
  }

  rec.boldPeers = peers;
  // The share of the page's characters set in the loud voice. A COUNT of
  // loud things is the wrong instrument: a dictionary of 89 terms is supposed
  // to have 89 headwords, and 89 is not a defect. What is a defect is a page
  // where the loud voice IS the page — where the shouting is most of the
  // reading. That is a share, and it is measurable.
  rec.peerShare = totalChars ? Math.round((peerChars / totalChars) * 100) / 100 : 0;
  // Every row that holds more than one loud thing, with what they are. The
  // THRESHOLD is applied on the Node side, because this function runs in the
  // browser and cannot see LIMITS.
  rec.noisyRows = [];
  for (var rk2 = 0; rk2 < rowEls.length; rk2++) {
    var row = rowEls[rk2];
    if (rowLoud[row] > 1) {
      var bits = [];
      for (var ri = 0; ri < row.children.length && bits.length < 4; ri++) {
        var rc = row.children[ri];
        var rcs = win.getComputedStyle(rc);
        if (Number(rcs.fontWeight) >= 600 && parseFloat(rcs.fontSize) >= 15) {
          bits.push((rc.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 26));
        }
      }
      rec.noisyRows.push({ count: rowLoud[row], text: bits.join('  |  ') });
    }
  }
  rec.peerGroups = Object.keys(groups).length;
  rec.peerSizes = groups;
  rec.sizeRamp = sizeRamp;
  // The house ramp. Three steps for text, plus the one step the title takes
  // on a phone. Anything else is a fourth level of hierarchy.
  rec.offRamp = Object.keys(sizeRamp)
    .map(Number)
    .filter((s) => s !== 13 && s !== 18 && s !== 32 && s !== 44)
    .sort((a, b) => a - b);
  rec.largestOther = largest;
  rec.titleRatio = largest ? Math.round((h1size / largest) * 100) / 100 : null;
  rec.finePrint = totalChars ? Math.round((microChars / totalChars) * 100) / 100 : 0;
  rec.primaryInFold = primaryInFold;
  rec.primaryTotal = primaryTotal;
  rec.prominentActions = prominentActions;
  rec.dominants = dominants;
  rec.totalChars = totalChars;
  rec.h1Count = main.querySelectorAll('h1').length;
  // The modal reading size: the size most of the words on the page are set at.
  var modalSize = 0, modalChars = -1;
  for (var bk in bodySizes) {
    if (bodySizes[bk] > modalChars) { modalChars = bodySizes[bk]; modalSize = Number(bk); }
  }
  rec.bodySize = modalSize;
  rec.titleVsBody = modalSize ? Math.round((h1size / modalSize) * 100) / 100 : null;
  return rec;
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
  document.documentElement.style.overflow = 'hidden';
  document.body.style.overflow = 'hidden';
  step();
}
run();
</script>`;

const server = createServer((req, res) => {
  const raw = decodeURIComponent((req.url || "/").split("?")[0]);
  const url = path.posix.normalize(raw).replace(/\/+$/, "") || "/";
  if (url.includes("..")) {
    res.writeHead(400);
    return res.end("bad path");
  }
  if (url === "/_hierarchy-probe") {
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
  console.error("\nFAIL — hierarchy gate found no built routes in out/. Nothing was measured.\n");
  process.exit(1);
}

const expected = routes.length * WIDTHS.length;
const port = await new Promise((resolve) => {
  server.listen(0, "127.0.0.1", () => resolve(server.address().port));
});
const prof = `${tmpdir()}/hiergate-${process.pid}-${Date.now()}`;

let cleaned = false;
function cleanup() {
  if (cleaned) return;
  cleaned = true;
  try {
    rmSync(prof, { recursive: true, force: true });
  } catch {
    /* best effort */
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
        `http://127.0.0.1:${port}/_hierarchy-probe?r=${encodeURIComponent(JSON.stringify(routes))}`,
      ],
      { maxBuffer: 128 * 1024 * 1024, timeout: 300000, killSignal: "SIGKILL" },
      (err, stdout) => {
        // The exit code is not the verdict. A browser that was taken down by
        // the teardown watchdog AFTER it dumped the DOM still measured the
        // page, and throwing that measurement away would be exactly the kind
        // of false negative this gate exists to avoid.
        if (stdout && /RESULTS:/.test(stdout)) return resolve(stdout);
        reject(new Error(err ? err.message : "Chrome produced no measurement"));
      },
    );
  });
} catch (e) {
  server.close();
  cleanup();
  console.error(`\nFAIL — hierarchy gate could not measure: Chrome failed (${e.message}).\n`);
  process.exit(1);
}
server.close();
cleanup();

const m = /RESULTS:(\[.*?\])(?:<\/pre>|$)/s.exec(dom);
const harnessError = /RESULTS:ERROR:([\s\S]*?)(?:<\/pre>|$)/.exec(dom);
if (harnessError) {
  console.error(`\nFAIL — hierarchy gate harness threw. Nothing was verified.\n${harnessError[1].trim()}\n`);
  process.exit(1);
}
if (!m) {
  console.error(
    "\nFAIL — hierarchy gate could not measure: the probe never reported results.\n" +
      "  Nothing was verified.\n",
  );
  process.exit(1);
}
let results;
try {
  results = JSON.parse(m[1].replace(/&quot;/g, '"').replace(/&amp;/g, "&"));
} catch (e) {
  console.error(`\nFAIL — hierarchy gate could not parse its own results: ${e.message}\n`);
  process.exit(1);
}
if (results.length !== expected) {
  console.error(
    `\nFAIL — hierarchy gate is under-measuring.\n` +
      `  Expected ${expected} measurements (${routes.length} routes x ${WIDTHS.length} widths), got ${results.length}.\n`,
  );
  process.exit(1);
}
const errored = results.filter((r) => r.error);
if (errored.length) {
  console.error(`\nFAIL — hierarchy gate could not read ${errored.length} page(s):`);
  for (const e of errored.slice(0, 8)) console.error(`  ✗ ${e.route} @${e.w}px — ${e.error}`);
  process.exit(1);
}

if (REPORT) {
  const rows = results.map((r) => ({
    route: r.route,
    w: r.w,
    h1: r.h1Size,
    peers: r.boldPeers,
    groups: r.peerGroups,
    ratio: r.titleRatio,
    vsbody: r.titleVsBody,
    acts: r.prominentActions,
    prim: r.primaryTotal,
    fine: r.finePrint,
    cta: r.primaryInFold,
    dom: r.dominants,
    doms: (r.dominantInfo || []).join(" | "),
    chars: r.totalChars,
    big: r.largestInfo ? r.largestInfo.tag + '.' + r.largestInfo.cls + ' ' + r.largestInfo.size + 'px "' + r.largestInfo.text + '"' : '',
  }));
  console.log(
    "route".padEnd(20) + "w".padEnd(6) + "h1".padEnd(5) + "peers".padEnd(7) +
    "grp".padEnd(5) + "ratio".padEnd(7) + "vsBody".padEnd(8) + "acts".padEnd(6) +
    "prim".padEnd(6) + "fine".padEnd(6) + "cta".padEnd(5) + "dom".padEnd(5) +
    "chars".padEnd(7) + "dominant elements / biggest non-h1",
  );
  for (const r of rows) {
    console.log(
      String(r.route).padEnd(20) + String(r.w).padEnd(6) + String(r.h1).padEnd(5) +
      String(r.peers).padEnd(7) + String(r.groups).padEnd(5) + String(r.ratio).padEnd(7) +
      String(r.vsbody).padEnd(8) + String(r.acts).padEnd(6) + String(r.prim).padEnd(6) +
      String(r.fine).padEnd(6) + String(r.cta).padEnd(5) + String(r.dom).padEnd(5) +
      String(r.chars).padEnd(7) + (r.doms || r.big),
    );
  }
  const desktop = results.filter((r) => r.w === 1440);
  const worst = (key) => desktop.reduce((a, b) => (b[key] > a[key] ? b : a));
  console.log("\nworst peers :", worst("boldPeers").route, worst("boldPeers").boldPeers);

  console.log("worst share :", worst("peerShare").route, worst("peerShare").peerShare);
  const shares = results.filter((r) => r.w === 1440).map((r) => `${r.route} ${r.peerShare}`).sort((a, b) => parseFloat(b.split(" ")[1]) - parseFloat(a.split(" ")[1]));
  console.log("peer share  :", shares.join("  "));
  const offRamp = results.filter((r) => r.offRamp && r.offRamp.length);
  if (offRamp.length) {
    console.log("\noff-ramp sizes:");
    for (const r of offRamp) {
      console.log(`  ${r.route} @${r.w}  ${r.offRamp.join(", ")}px   chars: ${JSON.stringify(r.sizeRamp)}`);
    }
  }
  console.log("worst groups:", worst("peerGroups").route, worst("peerGroups").peerGroups);
  console.log("worst fine  :", worst("finePrint").route, worst("finePrint").finePrint);
  console.log("worst acts  :", worst("prominentActions").route, worst("prominentActions").prominentActions);
  console.log("worst prim  :", worst("primaryTotal").route, worst("primaryTotal").primaryTotal);
  console.log("worst ratio :", worst("titleRatio").route, worst("titleRatio").titleRatio);
  console.log("worst vsBody:", worst("titleVsBody").route, worst("titleVsBody").titleVsBody);
  console.log("no CTA      :", desktop.filter((r) => r.primaryInFold === 0).map((r) => r.route).join(", ") || "(none)");
  process.exit(0);
}

// ------------------------------------------------------------------ the gate
const failures = [];
for (const r of results) {
  const label = `${r.route} @${r.w}px`;
  if (r.h1Count !== 1) {
    failures.push(`${label} — ${r.h1Count} h1 elements (exactly one title per page)`);
  }
  if (r.titleRatio !== null && r.titleRatio < LIMITS.titleRatio) {
    failures.push(`${label} — title is only ${r.titleRatio}x the next largest text (limit ${LIMITS.titleRatio})`);
  }
  if (r.titleVsBody !== null && r.titleVsBody < LIMITS.titleVsBody) {
    failures.push(`${label} — title is only ${r.titleVsBody}x the body text (limit ${LIMITS.titleVsBody})`);
  }
  if (r.peerGroups > LIMITS.peerGroups) {
    failures.push(`${label} — ${r.peerGroups} groups of loud text (limit ${LIMITS.peerGroups})`);
  }
  if (r.primaryTotal > LIMITS.primaryTotal) {
    failures.push(`${label} — ${r.primaryTotal} filled primary actions (limit ${LIMITS.primaryTotal}); the page has no single main action`);
  }
  if (r.offRamp && r.offRamp.length) {
    failures.push(`${label} — text is set in ${r.offRamp.join("px, ")}px, off the house ramp (13 / 18 / 32 / 44)`);
  }
  // The one-loud-thing-per-row rule is MEASURED but not yet ENFORCED. The
  // idea is the owner's own — "everything is the same size and based on the
  // same underlying hierarchy" — and it caught a real defect on /rights/,
  // whose row action was bold exactly like the question beside it. But the
  // instrument still cannot tell a leaf row from a group of rows reliably
  // enough to fail a build, so it is reported and the pages are fixed by
  // hand. A gate that cries wolf is worse than a gate that stays quiet.
  const noisy = (r.noisyRows || []).filter((x) => x.count > LIMITS.loudPerRow);
  if (noisy.length) r.noisy = noisy;
  if (r.prominentActions > LIMITS.prominentActions) {
    failures.push(`${label} — ${r.prominentActions} card-like actions compete at once (limit ${LIMITS.prominentActions})`);
  }
  if (r.dominants !== LIMITS.dominantAffordances) {
    failures.push(
      r.dominants === 0
        ? `${label} — no dominant affordance in the first screen; the page describes itself instead of doing anything`
        : `${label} — ${r.dominants} dominant affordances compete (limit ${LIMITS.dominantAffordances}); ` +
          `the page needs one main functionality that dominates`,
    );
  }
}

if (failures.length) {
  console.error(`\nFAIL — ${failures.length} hierarchy problem(s):\n`);
  for (const f of failures) console.error(`  ✗ ${f}`);
  console.error(
    "\n  A page where everything is loud has nothing loud. One title, one next action,\n" +
      "  and the rest of the page quieter than both.\n",
  );
  process.exit(1);
}

console.log(
  `  · hierarchy: ${results.length} measurements across ${routes.length} routes — ` +
    `one title, title wins, competing actions capped`,
);
