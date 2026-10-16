#!/usr/bin/env node
/**
 * Release gate for the built site. Runs after `next build` and fails loudly.
 *
 * Four checks, all deterministic and all aimed at what a learner actually
 * trips over rather than at tidiness:
 *
 *   1. Balanced CSS comments  A single unterminated /* turns every following
 *      rule into a comment. The build stays green; the page just loses its
 *      layout. Found once already, 950 lines at a time.
 *   2. CSS custom properties  Every var(--x) must be defined in at least one
 *      theme block. `var(--x, #555)` silently falls back when --x is missing,
 *      and that is how the cram source tags ended up at 2.47:1 in dark mode:
 *      readable-looking CSS, unreadable text.
 *   3. Theme contrast          Each theme's text-on-surface pairs must clear
 *      WCAG AA for their size.
 *   4. Built link integrity    Every internal href in every built page must
 *      resolve to a file that exists, and every sitemap URL must be real.
 */
import { readFile, readdir } from "node:fs/promises";
import { existsSync, statSync, readFileSync } from "node:fs";
import path from "node:path";

const CSS = "app/globals.css";
const OUT = "out";
const failures = [];
const notes = [];

// ---------------------------------------------------------------- colour maths
const hex = (v) => {
  const m = /^#?([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(v.trim());
  if (!m) return null;
  let h = m[1];
  if (h.length === 3) h = h.split("").map((c) => c + c).join("");
  return [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16));
};
const lum = ([r, g, b]) => {
  const f = (c) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
};
const ratio = (a, b) => {
  const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p);
  return (x + 0.05) / (y + 0.05);
};

// ------------------------------------------------- 1. CSS comment integrity
// The dead-CSS sweep in 6779a49 deleted the two rules above a comment and then
// merged that comment with the selector beneath it, leaving one line:
//   /* Ways to practise read as a ruled list, like the chapter route: one row{
// Because CSS comments do not nest, the next */ anywhere below — 39 lines
// later, on an unrelated /* Active Quiz Container */ heading — closed it. The
// result was valid CSS by every parser: build green, gate green, `.mode-card`
// and the whole chapter dropdown simply gone. A balance check would not have
// caught it, because nothing was unbalanced.
//
// The tell is that a comment body containing a brace is not a comment, it is a
// swallowed rule. No real comment in this stylesheet has one.
const css = await readFile(CSS, "utf8");
{
  const lineOf = (idx) => css.slice(0, idx).split("\n").length;
  let p = 0;
  while (p < css.length) {
    const open = css.indexOf("/*", p);
    const close = css.indexOf("*/", p);
    if (close !== -1 && (open === -1 || close < open)) {
      failures.push(`CSS: stray "*/" on line ${lineOf(close)} with no opening "/*" above it`);
      p = close + 2;
      continue;
    }
    if (open === -1) break;
    const end = css.indexOf("*/", open + 2);
    if (end === -1) {
      const start = lineOf(open);
      const total = css.split("\n").length;
      failures.push(
        `CSS: comment opened on line ${start} is never closed — lines ${start}–${total} ` +
          `(${total - start + 1} lines) are dead`,
      );
      break;
    }
    const body = css.slice(open + 2, end);
    if (/[{}]/.test(body)) {
      const start = lineOf(open);
      const stop = lineOf(end);
      failures.push(
        `CSS: the comment on line ${start} contains a brace, so lines ${start + 1}–${stop - 1} ` +
          `(${stop - start - 1} lines of CSS) are dead, not commented: "${body.slice(0, 70).replace(/\s+/g, " ")}"`,
      );
    }
    p = end + 2;
  }
}

// ------------------------------------------------------------ 2. undefined vars
const defined = new Set([...css.matchAll(/(--[a-z0-9-]+)\s*:/gi)].map((m) => m[1]));
const used = [...css.matchAll(/var\(\s*(--[a-z0-9-]+)\s*(,)?/gi)];
const withFallback = new Map();
const bare = new Set();
for (const m of used) {
  if (m[2]) withFallback.set(m[1], (withFallback.get(m[1]) ?? 0) + 1);
  else bare.add(m[1]);
}
for (const name of [...bare, ...withFallback.keys()]) {
  if (!defined.has(name)) {
    const how = withFallback.has(name)
      ? `falls back silently (${withFallback.get(name)}×)`
      : "no fallback at all";
    failures.push(`CSS: var(${name}) is never defined in any theme — ${how}`);
  }
}

// -------------------------------------------------------------- 2. theme pairs
const themeRe = /(?:^|\n)(:root,\s*\n)?\[data-theme="(\w+)"\]\s*\{([^}]*)\}/g;
const themes = [];
for (const m of css.matchAll(themeRe)) {
  const body = m[3];
  if (!/--paper\s*:/.test(body)) continue;
  const t = {};
  for (const d of body.matchAll(/(--[a-z0-9-]+)\s*:\s*([^;]+);/gi)) t[d[1]] = d[2].trim();
  themes.push({ name: m[2] ?? "light", tokens: t });
}
// `:root, [data-theme="light"]` is one block; label it light.
if (themes.length && themes[0].name === "light") {
  // already labelled
} else if (themes.length) {
  themes[0].name = "light";
}

// Pairs are grouped by what WCAG actually asks of them, because one bar for
// everything produces false failures on decoration and misses real text.
//   text     4.5:1  WCAG 1.4.3 normal text
//   ui       3.0:1  WCAG 1.4.11 component boundary / meaningful graphic
//   deco     none   hairlines and fills; reported, never failed on
const PAIRS = [
  ["--ink", "--paper", "text", "body text on the page"],
  ["--muted", "--paper", "text", "muted text on the page"],
  ["--edge", "--paper", "ui", "input and button boundary on the page"],
  ["--ink", "--wash", "text", "body text on a wash panel"],
  ["--muted", "--wash", "text", "muted text on a wash panel"],
  ["--accent-deep", "--paper", "text", "accent link text on the page"],
  ["--accent-deep", "--wash", "text", "accent link text on a wash panel"],
  ["--accent-ink", "--accent", "text", "button label on the accent fill"],
  ["--ok", "--ok-wash", "text", "success text on its wash"],
  ["--bad", "--bad-wash", "text", "error text on its wash"],
  ["--focus", "--paper", "ui", "focus ring against the page"],
  ["--edge", "--wash", "ui", "input boundary on a wash panel"],
  ["--line", "--paper", "deco", "hairline rule (decorative)"],
  ["--line", "--wash", "deco", "hairline rule on a wash panel (decorative)"],
];
const MIN = { text: 4.5, ui: 3, deco: 0 };

const worst = [];
for (const { name, tokens } of themes) {
  for (const [fg, bg, kind, what] of PAIRS) {
    const a = hex(tokens[fg] ?? "");
    const b = hex(tokens[bg] ?? "");
    if (!a || !b) {
      failures.push(`contrast: theme "${name}" has no ${a ? bg : fg} token`);
      continue;
    }
    const r = ratio(a, b);
    worst.push({ theme: name, pair: `${fg} on ${bg}`, r, kind, min: MIN[kind], what });
    if (r < MIN[kind]) {
      failures.push(
        `contrast: theme "${name}" ${fg} on ${bg} is ${r.toFixed(2)}:1, needs ${MIN[kind]}:1 (${kind}) — ${what}`,
      );
    }
  }
}

// ------------------------------------------------------- 3. built link integrity
async function walk(dir) {
  const out = [];
  for (const e of await readdir(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) out.push(...(await walk(p)));
    else out.push(p);
  }
  return out;
}

if (!existsSync(OUT)) {
  failures.push("out/ does not exist — run `npm run build` first");
} else {
  const files = await walk(OUT);
  const exists = (rel) => {
    const clean = rel.split("#")[0].split("?")[0];
    if (clean === "" || clean === "/") return existsSync(path.join(OUT, "index.html"));
    const p = path.join(OUT, clean);
    if (existsSync(p) && statSync(p).isDirectory()) return existsSync(path.join(p, "index.html"));
    return (
      existsSync(p) ||
      existsSync(`${p}.html`) ||
      existsSync(path.join(p, "index.html"))
    );
  };
  const html = files.filter((f) => f.endsWith(".html"));
  const seen = new Map();
  const external = new Set();

  for (const f of html) {
    const rel = path.relative(OUT, f);
    const src = await readFile(f, "utf8");
    for (const m of src.matchAll(/href="([^"]+)"/g)) {
      const href = m[1];
      if (/^(https?:|mailto:|tel:|data:|#)/.test(href)) {
        if (/^https?:/.test(href)) external.add(href);
        continue;
      }
      if (!href.startsWith("/")) continue; // relative hrefs are not used here
      if (!exists(href)) {
        seen.set(`${rel} -> ${href}`, true);
      }
    }
  }
  for (const [k] of seen) failures.push(`link: ${k} does not resolve in out/`);

  // sitemap must only advertise pages that exist
  const smPath = path.join(OUT, "sitemap.xml");
  if (existsSync(smPath)) {
    const sm = await readFile(smPath, "utf8");
    const urls = [...sm.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
    const origin = "https://constitution.nonarkara.org";
    for (const u of urls) {
      if (!u.startsWith(origin)) {
        failures.push(`sitemap: foreign origin ${u}`);
        continue;
      }
      if (!exists(u.slice(origin.length))) failures.push(`sitemap: ${u} has no page in out/`);
    }
    notes.push(`sitemap: ${urls.length} urls, all resolve`);
  } else {
    failures.push("sitemap: out/sitemap.xml is missing");
  }

  // podcast feeds
  for (const lang of ["th", "en", "zh"]) {
    const p = path.join(OUT, "podcast", `${lang}.xml`);
    if (!existsSync(p)) {
      failures.push(`podcast: ${lang} feed missing`);
      continue;
    }
    const xml = await readFile(p, "utf8");
    const origin = "https://constitution.nonarkara.org";
    const links = [...xml.matchAll(/<link>([^<]+)<\/link>/g)].map((m) => m[1]);
    const channel = links[0];
    if (channel && !exists(channel.replace(origin, ""))) {
      failures.push(`podcast ${lang}: channel link ${channel} has no page in out/`);
    }
    for (const item of [...xml.matchAll(/<item>[\s\S]*?<link>([^<]+)<\/link>/g)]) {
      const href = item[1].replace(origin, "");
      if (!exists(href)) failures.push(`podcast ${lang}: episode link ${item[1]} does not resolve`);
    }
    notes.push(`podcast ${lang}: ${(xml.match(/<item>/g) ?? []).length} episodes, links resolve`);
  }

  // A stub passes every existence check and still is the wrong thing to advertise:
// /learn/ returned 200, its file existed, and link integrity was happy, while its
// entire <main> was the single word "Home" and the router swapped it for "/".
//
// This cannot be detected by measuring the built HTML. A client-rendered page
// such as /flashcards/ also ships an almost empty static <main>, so "short main"
// flags real pages too, and "looks for router.replace" fails because in a client
// component that call lives in the JS bundle. They are indistinguishable from the
// server's output. So the route owner declares them instead, in one place, and
// this check verifies the declaration is honoured rather than guessing.
const { REDIRECT_ROUTES: redirectRoutes } = await import("../lib/nav.ts");
  const isRedirectStub = (url) => {
    try {
      const path = new URL(url).pathname;
      return redirectRoutes.includes(path);
    } catch {
      return false;
    }
  };

  const advertised = new Set();
  const smPath2 = path.join(OUT, "sitemap.xml");
  if (existsSync(smPath2)) {
    const sm = readFileSync(smPath2, "utf8");
    const origin2 = "https://constitution.nonarkara.org";
    for (const u of [...sm.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1])) {
      if (isRedirectStub(u)) {
        failures.push(`sitemap: ${u} is a declared redirect stub, not a page — drop it from the sitemap`);
      }
      advertised.add(u.slice(origin2.length).replace(/^\/|\/$/g, ""));
    }
  }
  for (const lang of ["th", "en", "zh"]) {
    const p = path.join(OUT, "podcast", `${lang}.xml`);
    if (!existsSync(p)) continue;
    const xml = readFileSync(p, "utf8");
    const origin3 = "https://constitution.nonarkara.org";
    const channel = xml.match(/<channel>[\s\S]*?<link>([^<]+)<\/link>/)?.[1];
    if (channel && isRedirectStub(channel)) {
      failures.push(`podcast ${lang}: channel link ${channel} is a declared redirect stub — point it at a real page`);
    }
  }
  void advertised;

  notes.push(`pages: ${html.length} html files checked`);
}

// ---------------------------------------------------------------------- report
const scored = worst.filter((w) => w.min > 0);
scored.sort((a, b) => a.r / a.min - b.r / b.min);
const tightest = scored.slice(0, 5);
for (const n of notes) console.log(`  · ${n}`);
if (tightest.length) {
  console.log("\n  tightest contrast pairs:");
  for (const t of tightest) {
    console.log(`    ${t.r.toFixed(2)}:1 (needs ${t.min}) ${t.theme} — ${t.pair} — ${t.what}`);
  }
}
if (failures.length) {
  console.error(`\nFAIL — ${failures.length} problem(s):`);
  for (const f of failures) console.error(`  ✗ ${f}`);
  process.exit(1);
}
console.log(
  `\nPASS — CSS comment integrity, undefined vars, theme contrast and built links all clean.`,
);