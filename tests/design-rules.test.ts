import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
// @ts-ignore plain ESM helper shared with the release gate
import { designViolations, designCheck, parseRules } from "../scripts/design-laws.mjs";

const root = process.cwd();
const css = readFileSync(new URL("../app/globals.css", import.meta.url), "utf8");
const fontsCss = readFileSync(new URL("../public/fonts/fonts.css", import.meta.url), "utf8");

test("the stylesheet as it stands obeys every anti-slop law", () => {
  const { failures } = designCheck(root);
  assert.deepEqual(failures, [], failures.join("\n"));
});

test("the detector sees the whole stylesheet, not a sample of it", () => {
  // Guards the silent failure where the regex stops matching anything and the
  // suite passes because it found nothing to complain about.
  const { ruleCount } = designCheck(root);
  assert.ok(ruleCount > 500, `only parsed ${ruleCount} rules; the parser has stopped seeing the css`);
  assert.ok(parseRules(css).length === ruleCount, "parseRules and designCheck disagree");
});

// Each row below is a behaviour the detector must have, not a restatement of
// the current stylesheet. The previous version of this file asserted its own
// class names and font choices, so it could only ever prove that nothing had
// changed since the day it was written.
const MUST_FAIL = [
  ["descendant selector", "button { color: red }\n.quiz-bottom button { min-width: 240px; }"],
  ["bare element selector", "button { min-width: 160px; }"],
  ["class carrying btn", ".btn-next-q { min-width: 160px; }"],
  ["link inside a cta", ".hero-cta a { min-width: 220px; }"],
  ["looped Thai face", "body { font-family: Sarabun, sans-serif; }"],
  ["AI-slop face", "body { font-family: Inter, sans-serif; }"],
] as const;

const MUST_PASS = [
  // A chapter dropdown needs a floor or it collapses to an unreadable sliver.
  ["select keeps its minimum", ".jump-controls select { min-width: 140px; }"],
  ["a small minimum is not bloat", ".btn-tiny { min-width: 90px; }"],
  // Label left, question count right: a contents page, not a chasm.
  [
    "list row may use space-between",
    ".pokklong-steps button { width: 100%; justify-content: space-between; }",
  ],
] as const;

for (const [name, snippet] of MUST_FAIL) {
  test(`detects: ${name}`, () => {
    const { failures } = designViolations(`p { color: red }\n${snippet}`, { minRules: 0 });
    assert.ok(failures.length > 0, `slipped through: ${snippet.trim()}`);
  });
}

for (const [name, snippet] of MUST_PASS) {
  test(`allows: ${name}`, () => {
    const { failures } = designViolations(`p { color: red }\n${snippet}`, { minRules: 0 });
    assert.deepEqual(failures, [], `false positive on: ${snippet.trim()}`);
  });
}

test("an unreadable stylesheet fails instead of passing quietly", () => {
  const { failures } = designViolations("", { minRules: 25 });
  assert.ok(
    failures.some((f) => f.includes("stopped seeing the stylesheet")),
    "a detector that parsed nothing must not report clean",
  );
});

test("font faces are declared for the faces the design system uses", () => {
  assert.ok(fontsCss.includes("IBM Plex Sans Thai"), "the non-looped Thai face must be declared");
  assert.ok(/src:\s*url\(\/fonts\/jost\.woff2\)/.test(fontsCss), "Jost must be self-hosted, not CDN");
  assert.ok(!/fonts\.googleapis|fonts\.gstatic/.test(fontsCss), "no third-party font CDN");
});