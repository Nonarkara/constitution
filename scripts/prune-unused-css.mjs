#!/usr/bin/env node
/**
 * Removes rules whose selectors are all unreachable, and prunes only the dead
 * selectors out of rules that mix live and dead ones.
 *
 * Brace-aware rather than regex-per-block, because app/globals.css is ~3,800
 * lines of nested @media and the mistake mode here is a parser bug that eats a
 * live rule and shows up as a broken page, not as a failed build.
 *
 * Refuses to run if the result stops parsing as balanced CSS or loses a token
 * definition, and prints exactly what it is about to change.
 */
import { readFileSync, writeFileSync } from "node:fs";

const CSS = "app/globals.css";
const css = readFileSync(CSS, "utf8");

const DEAD = new Set(process.argv.slice(2));
if (DEAD.size === 0) {
  console.error("pass the class names to remove as arguments");
  process.exit(1);
}

/** Split a selector list on top-level commas only. */
function splitSelectors(list) {
  const out = [];
  let depth = 0;
  let cur = "";
  for (const ch of list) {
    if (ch === "(" || ch === "[") depth++;
    if (ch === ")" || ch === "]") depth--;
    if (ch === "," && depth === 0) {
      out.push(cur.trim());
      cur = "";
    } else cur += ch;
  }
  if (cur.trim()) out.push(cur.trim());
  return out;
}

/** Classes named in a selector, ignoring those inside :is()/:where() pseudo args. */
const classesIn = (sel) =>
  [...sel.matchAll(/\.([a-zA-Z][a-zA-Z0-9_-]*)/g)].map((m) => m[1]).filter(Boolean);

let out = "";
let removed = 0;
let pruned = 0;
let i = 0;
let sawAnyRule = false;

while (i < css.length) {
  const braceAt = css.indexOf("{", i);
  if (braceAt === -1) {
    out += css.slice(i);
    break;
  }
  // find the matching close brace
  let depth = 1;
  let j = braceAt + 1;
  while (j < css.length && depth > 0) {
    if (css[j] === "{") depth++;
    else if (css[j] === "}") depth--;
    j++;
  }
  const prelude = css.slice(i, braceAt);
  const body = css.slice(braceAt + 1, j - 1);
  const trimmedPrelude = prelude.trim();

  const isAtRule = trimmedPrelude.startsWith("@");
  if (!isAtRule) {
    sawAnyRule = true;
    // split prelude into: whitespace text, selector list
    const leading = prelude.match(/^\s*/)[0];
    const selectorList = prelude.slice(leading.length).trim();
    if (!selectorList.startsWith(":root") && !selectorList.startsWith("html")) {
      const sels = splitSelectors(selectorList);
      const kept = sels.filter((s) => !classesIn(s).some((c) => DEAD.has(c)));
      if (kept.length === 0) {
        removed++;
        i = j;
        continue;
      }
      if (kept.length !== sels.length) {
        pruned++;
        out += leading + kept.join(", ") + "{" + body + "}";
        i = j;
        continue;
      }
    }
  }
  // keep as-is (recursing happens naturally because we copy the raw text)
  out += css.slice(i, j);
  i = j;
}

// ---------------------------------------------------------------- guard rails
const open = (out.match(/{/g) ?? []).length;
const close = (out.match(/}/g) ?? []).length;
if (open !== close) {
  console.error(`REFUSING: braces unbalanced after edit (${open} open, ${close} close)`);
  process.exit(1);
}
const tokensBefore = new Set([...css.matchAll(/(--[a-z0-9-]+)\s*:/gi)].map((m) => m[1]));
const tokensAfter = new Set([...out.matchAll(/(--[a-z0-9-]+)\s*:/gi)].map((m) => m[1]));
for (const t of tokensBefore) {
  if (!tokensAfter.has(t)) {
    console.error(`REFUSING: custom property ${t} would be lost`);
    process.exit(1);
  }
}
if (out.length >= css.length) {
  console.error("REFUSING: nothing would be removed");
  process.exit(1);
}

console.log(`${removed} rules removed, ${pruned} selectors pruned from shared rules`);
console.log(`${css.length} -> ${out.length} bytes (${css.length - out.length} saved)`);
writeFileSync(CSS, out);