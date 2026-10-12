import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
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
