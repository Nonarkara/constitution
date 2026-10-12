import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";
import { palace } from "../lib/palace.ts";
test("each of sixteen chapters has a unique illustrated station and legal anchors", () => {
  const corpus = JSON.parse(
    readFileSync(new URL("../data/constitution.json", import.meta.url), "utf8"),
  );
  assert.deepEqual(
    palace.map((p) => p.chapter),
    Array.from({ length: 16 }, (_, i) => i + 1),
  );
  assert.equal(new Set(palace.map((p) => `${p.atlas}-${p.panel}`)).size, 16);
  for (const p of palace) {
    assert.ok(
      existsSync(
        new URL(
          `../public/illustrations/palace-${p.atlas}.webp`,
          import.meta.url,
        ),
      ),
    );
    assert.ok(
      p.sections.length > 0 &&
        p.sections.every((n) => corpus.sections[n - 1]?.chapter === p.chapter),
    );
    for (const l of ["th", "en", "zh"] as const) {
      assert.ok(p.meaning[l] && p.joke[l] && p.check[l]);
    }
  }
});
test("number cues preserve legal units and guard against misleading totals", () => {
  assert.equal(palace[4].number, "12");
  assert.ok(palace[4].meaning.en.includes("preschool"));
  assert.ok(palace[7].meaning.en.includes("other ministers"));
  assert.ok(palace[10].meaning.en.includes("one term only"));
  assert.ok(palace[11].meaning.en.includes("not five members"));
  assert.ok(
    palace[14].meaning.en.includes("not a 30-day completion guarantee"),
  );
  assert.ok(palace[15].meaning.en.includes("at least"));
});
