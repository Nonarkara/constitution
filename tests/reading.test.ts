import test from "node:test";
import assert from "node:assert/strict";
import { readingTokens, type Term } from "../lib/reading.ts";

const term: Term = { id: "court", term: { th: "ศาล", en: "Court", zh: "法院" }, match: { th: ["ศาลรัฐธรรมนูญ", "ศาล"], en: ["Court"], zh: ["法院"] }, def: { th: "", en: "", zh: "" }, sections: [] };

test("cross-references link other sections in all three scripts, never the section itself", () => {
  const th = readingTokens("ตามมาตรา ๑๕๙ และมาตรา 160 แต่ไม่ใช่มาตรา ๑๕๘", "th", 158, []);
  assert.deepEqual(th.map((t) => t.kind === "xref" && t.section), [159, 160]);
  assert.equal(readingTokens("under section 159", "en", 1, [])[0].kind, "xref");
  assert.equal(readingTokens("依照第159条", "zh", 1, []).length, 1);
  assert.equal(readingTokens("มาตรา ๓๐๐", "th", 1, []).length, 0);
});

test("a glossary term is marked once, longest form first, without overlapping a reference", () => {
  const tokens = readingTokens("ศาลรัฐธรรมนูญ และศาล มาตรา ๒๑๓", "th", 1, [term]);
  assert.deepEqual(tokens.map((t) => [t.kind, t.end - t.start]), [["term", 13], ["xref", 9]]);
});
