#!/usr/bin/env node
/**
 * FALSIFY THE SPATIAL GATE.
 *
 * A gate that has never failed proves nothing. This injects one real defect
 * per mode of spatial hallucination into a COPY of the built site and checks
 * that the gate catches each one — and then checks that the clean copy
 * passes, so the gate is not simply always-failing.
 *
 * The defects are self-contained fixtures injected into the page's <main>.
 * They carry their own class names and their own styles, so the falsifier
 * needs to know nothing about the project it is testing. That is deliberate:
 * the instrument has to be portable, so its own proof cannot depend on a
 * project's CSS.
 *
 * Usage: node spatial-falsify.mjs [path-to-built-site]
 */
import { execFileSync, spawnSync } from "node:child_process";
import { existsSync, readFileSync, writeFileSync, readdirSync, mkdirSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const CHECK = path.join(HERE, "spatial-check.mjs");
const SITE = path.resolve(process.argv[2] || "out");

if (!existsSync(SITE)) {
  console.error(`\nFAIL — no built site at ${SITE}. Nothing was falsified.\n`);
  process.exit(1);
}

// A 1x1 transparent PNG. The size of the drawn image comes from the style
// attribute, so the intrinsic size does not matter.
const PIXEL =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==";

/**
 * One defect per mode. `at` is where the fixture goes: "bottom" keeps it out
 * of the reader's way so the OTHER checks stay quiet, which is what makes the
 * failure attributable to this fixture alone.
 */
const FIXTURES = [
  {
    name: "an unjustified gap opens between two blocks",
    mode: "unjustified gaps",
    at: "bottom",
    html: `<div class="sl-dead" style="display:flex;flex-direction:column">
<div class="sl-dead-a" style="height:24px;background:#d8d8d8"></div>
<div class="sl-dead-b" style="height:24px;background:#d8d8d8;margin-top:260px"></div>
</div>`,
    expect: "dead: div.sl-dead-a",
  },
  {
    name: "a picture is stranded beside an empty column",
    mode: "orphan elements",
    at: "bottom",
    html: `<div class="sl-orph" style="display:flex;align-items:flex-start">
<div class="sl-orph-cell" style="width:220px"><img class="sl-orph-img" src="${PIXEL}" alt="" style="display:block;width:220px;height:24px"></div>
<div class="sl-orph-tall" style="width:220px;height:420px"></div>
</div>`,
    expect: "orphan: div.sl-orph-cell",
  },
  {
    name: "two related actions are pushed to opposite edges",
    mode: "scattered actions",
    at: "bottom",
    html: `<div class="sl-scat" style="display:flex;justify-content:space-between;width:100%">
<a class="sl-scat-a" href="#sl" style="background:#f59e0b;color:#000;padding:14px 20px;border-radius:8px;text-decoration:none">A</a>
<a class="sl-scat-b" href="#sl" style="background:#f59e0b;color:#000;padding:14px 20px;border-radius:8px;text-decoration:none">B</a>
</div>`,
    expect: "scattered: div.sl-scat",
  },
  {
    name: "a row breaks and leaves one item alone on the last line",
    mode: "accidental wrapping",
    at: "bottom",
    html: `<nav class="sl-wrap" style="display:flex;flex-wrap:wrap;gap:10px;width:170px">
<a class="sl-wrap-a" href="#sl" style="flex:0 0 70px">One</a>
<a class="sl-wrap-b" href="#sl" style="flex:0 0 70px">Two</a>
<a class="sl-wrap-c" href="#sl" style="flex:0 0 70px">Three</a>
</nav>`,
    expect: "wrap: nav.sl-wrap",
  },
  {
    name: "the page scrolls sideways",
    mode: "accidental wrapping",
    at: "bottom",
    html: `<div class="sl-over" style="width:4000px;height:10px"></div>`,
    expect: "scrolls sideways",
  },
  {
    name: "the page makes you scroll before you can do anything",
    mode: "spatially expensive information",
    at: "top",
    html: `<div class="sl-tall" style="height:2400px"></div>`,
    expect: "the first thing you can do moved",
  },
];

const ROUTES = "/";
const WIDTHS = "390,768,1440";

// ---------------------------------------------------------------- the copy
const WORK = path.join(tmpdir(), `spatial-falsify-${process.pid}-${Date.now()}`);
const COPY = path.join(WORK, "site");
const BASELINE = path.join(WORK, "baseline.json");
mkdirSync(COPY, { recursive: true });
// SITE + "/." and NOT path.join(SITE, "."): path.join normalises the dot away,
// and `cp -R <dir> <existing-dir>` then copies the site INTO it as <dir>/out.
// The gate would serve a directory with no index.html and measure a 404.
execFileSync("cp", ["-R", `${SITE}/.`, COPY], { stdio: "ignore" });
if (!existsSync(path.join(COPY, "index.html"))) {
  console.error(`\nFAIL — the copy at ${COPY} has no index.html. Nothing was falsified.\n`);
  process.exit(1);
}

function cleanup() {
  try {
    const trash = "/Users/nonarkara/.minimax/bin/mavis-trash";
    if (existsSync(trash)) execFileSync(trash, ["--", WORK]);
  } catch {
    /* best effort */
  }
}
process.on("exit", cleanup);
for (const sig of ["SIGINT", "SIGTERM"]) process.on(sig, () => { cleanup(); process.exit(130); });

function runGate(args) {
  const res = spawnSync(
    process.execPath,
    [CHECK, "--dir", COPY, "--baseline", BASELINE, "--routes", ROUTES, "--widths", WIDTHS, ...args],
    { encoding: "utf8", timeout: 600000 },
  );
  return {
    pass: res.status === 0,
    out: `${res.stdout || ""}${res.stderr || ""}`,
  };
}

// ---------------------------------------------------------------- the baseline
// Generated from the clean copy, with a synthetic reason on every finding so
// the clean copy can pass. This baseline is a measuring device for the
// falsifier, not a review of the project.
const gen = runGate(["--update"]);
if (!existsSync(BASELINE)) {
  console.error(`\nFAIL — the gate could not write a baseline for the falsifier.\n${gen.out}\n`);
  process.exit(1);
}
const baseline = JSON.parse(readFileSync(BASELINE, "utf8"));
let blessed = 0;
// A reason belongs to a decision, so the falsifier gives every decision it
// finds a synthetic reason. This baseline is a measuring device for the
// falsifier, not a review of the project.
baseline.reasons = baseline.reasons || {};
for (const byWidth of Object.values(baseline.routes || {})) {
  for (const entry of Object.values(byWidth)) {
    for (const f of entry.findings || []) {
      const k = `${f.kind}|${f.sel}`;
      if (!baseline.reasons[k]) {
        baseline.reasons[k] = "synthetic baseline for falsification";
        blessed++;
      }
    }
  }
}
writeFileSync(BASELINE, JSON.stringify(baseline, null, 2) + "\n");

// ---------------------------------------------------------------- the clean run
const clean = runGate([]);
if (!clean.pass) {
  console.error("\nFAIL — the gate does not pass on the clean build. Fix that first.\n");
  console.error(clean.out);
  process.exit(1);
}
console.log(`  · clean build passes (${blessed} pre-existing finding(s) given synthetic reasons)`);

// ---------------------------------------------------------------- the fixtures
const PAGE = path.join(COPY, "index.html");
if (!existsSync(PAGE)) {
  console.error("\nFAIL — the copy has no index.html to inject into.\n");
  process.exit(1);
}
const ORIGINAL = readFileSync(PAGE, "utf8");

/**
 * The fixture is MOUNTED BY SCRIPT, not pasted into the markup.
 *
 * A modern app hydrates the page after the HTML is parsed, and hydration can
 * remove nodes the framework does not own. A fixture pasted into the
 * exported markup can therefore be gone before anything measures it — and a
 * gate that never sees the defect it was given is a gate that looks fine
 * because it looked at nothing. So the fixture mounts after load, and
 * re-mounts if anything removes it.
 */
const MOUNTER = `<script id="__sl_mounter__">
(function () {
  var HTML = __HTML__;
  var WHERE = __WHERE__;
  function mount() {
    var m = document.querySelector("main#content") || document.querySelector("main") || document.body;
    if (!m) return;
    var existing = document.getElementById("__sl_fixture__");
    if (existing && existing.parentElement === m) return;
    if (existing) existing.remove();
    var t = document.createElement("template");
    t.innerHTML = HTML;
    // The fixture is wrapped, so the wrapper's id never becomes the finding's
    // selector: the finding must name the element that actually misbehaves.
    var wrap = document.createElement("div");
    wrap.id = "__sl_fixture__";
    while (t.content.firstChild) wrap.appendChild(t.content.firstChild);
    if (WHERE === "top" && m.firstChild) m.insertBefore(wrap, m.firstChild);
    else m.appendChild(wrap);
  }
  function start() {
    mount();
    setTimeout(mount, 60);
    setTimeout(mount, 140);
    setTimeout(mount, 200);
  }
  if (document.readyState === "complete") setTimeout(start, 0);
  else addEventListener("load", function () { setTimeout(start, 0); });
})();
</script>`;

function inject(html, at) {
  const mounter = MOUNTER.replace("__HTML__", JSON.stringify(html)).replace("__WHERE__", JSON.stringify(at));
  const m2 = /<\/main\s*>/i.exec(ORIGINAL);
  if (m2) return ORIGINAL.slice(0, m2.index) + "\n" + mounter + "\n" + ORIGINAL.slice(m2.index);
  const m3 = /<\/body\s*>/i.exec(ORIGINAL);
  if (m3) return ORIGINAL.slice(0, m3.index) + "\n" + mounter + "\n" + ORIGINAL.slice(m3.index);
  return ORIGINAL + mounter;
}

let failures = 0;
for (const f of FIXTURES) {
  writeFileSync(PAGE, inject(f.html, f.at));
  const res = runGate([]);
  writeFileSync(PAGE, ORIGINAL);
  if (res.pass) {
    console.error(`  ✗ ${f.name} — the gate did NOT catch it. The rule is dead.`);
    failures++;
  } else if (!res.out.includes(f.expect)) {
    console.error(
      `  ✗ ${f.name} — the gate failed, but not for the expected reason.\n` +
        `      expected a message containing "${f.expect}", got:\n${res.out.trim().split("\n").slice(0, 8).join("\n")}`,
    );
    failures++;
  } else {
    console.log(`  · caught: ${f.name}  [${f.mode}]`);
  }
}

if (failures) {
  console.error(`\nFAIL — ${failures} rule(s) did not bite. The gate is not trustworthy.\n`);
  process.exit(1);
}

console.log(
  `\n  · spatial gate: ${FIXTURES.length} injected defects, all caught. ` +
    `Every mode has failed at least once.\n`,
);
