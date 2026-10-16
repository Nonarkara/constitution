#!/usr/bin/env node
/**
 * Reports CSS classes that nothing can reach.
 *
 * A plain text search is not enough and will happily recommend deleting live
 * styling: components build class names at runtime, e.g.
 *   `highlight-${h}`  and  `color-pill pill-${color}`
 * so `pill-amber`, `highlight-sky` and friends never appear as literals in any
 * source file while being rendered constantly. This script accounts for those
 * prefixes before it calls anything dead, and it only reports: removing a rule
 * is a human decision.
 */
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";

const CSS = "app/globals.css";
const SKIP = new Set(["node_modules", ".next", "out", ".git", "dist", ".openai", "public"]);

const walk = async (dir, acc = []) => {
  for (const e of await readdir(dir, { withFileTypes: true })) {
    if (SKIP.has(e.name)) continue;
    const p = path.join(dir, e.name);
    if (e.isDirectory()) await walk(p, acc);
    else if (/\.(tsx?|jsx?|html|css)$/.test(e.name)) acc.push(p);
  }
  return acc;
};

const css = await readFile(CSS, "utf8");
const files = await walk(".");
let src = "";
for (const f of files) src += (await readFile(f, "utf8")) + "\n";

const defined = new Set([...css.matchAll(/\.([a-zA-Z][a-zA-Z0-9_-]{2,})/g)].map((m) => m[1]));

// prefixes that are interpolated or concatenated into a class name at runtime.
// Scanned across the whole source rather than by matching whole template
// literals: a className expression spans several lines and contains nested
// braces from ternaries, which defeats any attempt to balance them here.
const dynamicPrefixes = new Set();
for (const m of src.matchAll(/([a-zA-Z][a-zA-Z0-9]*)\s*-\s*\$\{/g)) {
  dynamicPrefixes.add(m[1].toLowerCase());
}
for (const m of src.matchAll(/["'`]([a-zA-Z][a-zA-Z0-9]*)-["'`]\s*\+/g)) {
  dynamicPrefixes.add(m[1].toLowerCase());
}

// the stylesheet itself defines names it also uses; ignore it as a source
const srcNoCss = src.replaceAll(css, "");

const reachable = (cls) => {
  const esc = cls.replace(/[-]/g, "\\-");
  if (new RegExp(`["'\`\\s.{}(,>:+~]${esc}["'\`\\s.,;:)>{}\\]]`).test(srcNoCss)) return true;
  // dynamically built: does a runtime prefix match its leading segment?
  const parts = cls.split("-");
  for (let i = parts.length - 1; i > 0; i--) {
    const prefix = parts.slice(0, i).join("-").toLowerCase();
    if (dynamicPrefixes.has(prefix)) return true;
  }
  return false;
};

const dead = [...defined].filter((c) => !reachable(c)).sort();
console.log(`${defined.size} classes defined in ${CSS}; ${dead.length} unreachable.\n`);
for (const c of dead) console.log(`  ${c}`);

// how many bytes of rule text they account for
let bytes = 0;
for (const c of dead) {
  for (const m of css.matchAll(new RegExp(`^[^\\n{}]*\\.${c.replace(/[-]/g, "\\-")}[^{]*\\{[^}]*\\}`, "gm"))) {
    bytes += m[0].length;
  }
}
console.log(`\n~${bytes} bytes of rule text (before hand-checking shared selectors).`);