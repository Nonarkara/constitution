import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { SWATCH } from "../lib/theme.ts";

// Every theme is read from globals.css itself, so the test checks what ships.
const css = readFileSync(new URL("../app/globals.css", import.meta.url), "utf8");
function block(selector: string): Record<string, string> {
  const at = css.indexOf(selector);
  assert.ok(at >= 0, `missing ${selector}`);
  const body = css.slice(css.indexOf("{", at) + 1, css.indexOf("}", at));
  return Object.fromEntries([...body.matchAll(/--([\w-]+):\s*(#[0-9a-f]{3,6})/gi)].map((m) => [m[1], m[2]]));
}
const themes = {
  light: block('[data-theme="light"] {'),
  mild: block('[data-theme="mild"] {'),
  dark: block('[data-theme="dark"] {'),
  contrast: block('[data-theme="contrast"] {'),
};
function lum(hex: string) {
  const h = hex.length === 4 ? hex.slice(1).replace(/./g, (c) => c + c) : hex.slice(1);
  const [r, g, b] = [0, 2, 4].map((i) => {
    const c = parseInt(h.slice(i, i + 2), 16) / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}
const ratio = (a: string, b: string) => {
  const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p);
  return (x + 0.05) / (y + 0.05);
};
// [text, background, minimum]: 4.5 for reading text, 3 for rules, focus and fills.
const pairs: [string, string, number][] = [
  ["ink", "paper", 4.5], ["muted", "paper", 4.5], ["ink", "wash", 4.5], ["muted", "wash", 4.5],
  ["accent-ink", "accent", 4.5], ["accent-ink", "accent-hover", 4.5],
  ["accent-deep", "paper", 4.5], ["accent-deep", "accent-wash", 4.5],
  ["ink", "accent-wash", 4.5], ["ink", "accent-wash-strong", 4.5],
  ["ok", "paper", 4.5], ["ok", "ok-wash", 4.5], ["bad", "paper", 4.5], ["bad", "bad-wash", 4.5],
  ["paper", "ok", 4.5], ["paper", "bad", 4.5], ["ink", "org-wash", 4.5],
  ["edge", "paper", 3], ["focus", "paper", 3],
];

for (const [name, t] of Object.entries(themes))
  test(`theme ${name} keeps every text readable`, () => {
    for (const [fg, bg, min] of pairs) {
      assert.ok(t[fg] && t[bg], `${name}: --${fg} or --${bg} missing`);
      const r = ratio(t[fg], t[bg]);
      assert.ok(r >= min, `${name}: --${fg} on --${bg} is ${r.toFixed(2)}:1, needs ${min}`);
    }
  });

test("no-script dark fallback matches the dark theme exactly", () => {
  const auto = block(":root:not([data-theme]) {");
  assert.deepEqual(auto, Object.fromEntries(Object.entries(themes.dark).filter(([k]) => k in auto)));
  assert.equal(Object.keys(auto).length, Object.keys(themes.dark).length);
});

test("swatches and browser-bar colours match the stylesheet", () => {
  for (const [name, sw] of Object.entries(SWATCH)) {
    const t = themes[name as keyof typeof themes];
    const hex = (h: string) => (h.length === 4 ? "#" + h.slice(1).replace(/./g, (c) => c + c) : h).toLowerCase();
    assert.equal(hex(sw.paper), hex(t.paper), `${name} paper`);
    assert.equal(hex(sw.ink), hex(t.ink), `${name} ink`);
  }
});

test("the stylesheet's blocks all close (a merge once split a media query)", () => {
  const bare = css.replace(/\/\*[\s\S]*?\*\//g, "").replace(/"[^"]*"|'[^']*'/g, "");
  let depth = 0;
  for (const c of bare) {
    if (c === "{") depth++;
    if (c === "}") assert.ok(--depth >= 0, "a stray closing brace");
  }
  assert.equal(depth, 0, "an unclosed block");
});

test("each drawing appears in one place on the site, never two", () => {
  // A drawing is a cue for one page. A learner who sees the same picture on
  // the chapter list and on every chapter has been given a cue that points
  // nowhere, which is worse than no picture at all.
  //
  // The catalogue (components/StudyArt.tsx) is NOT a place. It is the table
  // that says which file backs which scene, so counting its entries as uses
  // made every scene whose file lacked the "tikki-" prefix look like it was
  // used twice. The catalogue is skipped; only placements are counted.
  const CATALOGUE = "StudyArt.tsx";
  const uses = new Map<string, string[]>();
  for (const f of readdirSync(new URL("../components/", import.meta.url))) {
    if (f === CATALOGUE) continue;
    const src = readFileSync(new URL(`../components/${f}`, import.meta.url), "utf8");
    for (const m of src.matchAll(/scene="(\w+)"|\/illustrations\/([\w-]+)-pastel\.webp/g)) {
      const scene = m[1] ?? m[2];
      uses.set(scene, [...(uses.get(scene) ?? []), f]);
    }
  }
  for (const [scene, places] of uses) {
    assert.equal(places.length, 1, `${scene} drawing appears in ${places.length} places: ${places.join(", ")}`);
  }
});

test("the catalogue is a table, not a place: no drawing is placed twice", () => {
  // The same rule stated the other way round, so that a future change which
  // puts a scene back into two components is caught even if the first test is
  // ever weakened. A drawing that is never placed at all is dead weight and
  // is reported here too.
  const CATALOGUE = "StudyArt.tsx";
  const catalogue = readFileSync(new URL(`../components/${CATALOGUE}`, import.meta.url), "utf8");
  const scenes = new Set(
    [...catalogue.matchAll(/^\s{2}(\w+):\s*"\/illustrations\//gm)].map((m) => m[1]),
  );
  const placed = new Map<string, number>();
  for (const f of readdirSync(new URL("../components/", import.meta.url))) {
    if (f === CATALOGUE) continue;
    const src = readFileSync(new URL(`../components/${f}`, import.meta.url), "utf8");
    for (const m of src.matchAll(/scene="(\w+)"/g)) {
      placed.set(m[1], (placed.get(m[1]) ?? 0) + 1);
    }
  }
  for (const [scene, n] of placed) {
    assert.equal(n, 1, `${scene} is placed ${n} times`);
  }
  // The scenes in the catalogue that are not rendered by scene name are the
  // ones a component reaches by file path instead (reading, listening). They
  // must still be placed exactly once somewhere.
  const byPath = new Map<string, number>();
  for (const f of readdirSync(new URL("../components/", import.meta.url))) {
    if (f === CATALOGUE) continue;
    const src = readFileSync(new URL(`../components/${f}`, import.meta.url), "utf8");
    for (const m of src.matchAll(/\/illustrations\/([\w-]+)-pastel\.webp/g)) {
      byPath.set(m[1], (byPath.get(m[1]) ?? 0) + 1);
    }
  }
  for (const scene of scenes) {
    if (placed.has(scene)) continue;
    const file = scene.replace(/^tikki-/, "");
    const n = byPath.get(file) ?? 0;
    assert.equal(n, 1, `${scene} is in the catalogue but placed ${n} times by path`);
  }
});
