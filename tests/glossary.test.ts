import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
const read = (p: string) => JSON.parse(readFileSync(new URL("../data/" + p, import.meta.url), "utf8"));

test("glossary terms are found in the text they explain and the index points at real sections", () => {
  const corpus = read("constitution.json"), glossary = read("glossary.json"), topics = read("topics.json");
  const thai = corpus.sections.map((s: { th: string }) => s.th).join("\n");
  for (const t of glossary) {
    for (const m of t.match.th) assert.ok(thai.includes(m), `${t.id}: "${m}" not in the Thai text`);
    for (const l of ["th", "en", "zh"]) assert.ok(t.term[l] && t.def[l], `${t.id} ${l}`);
    assert.ok(t.sections.every((n: number) => n >= 1 && n <= 279));
  }
  for (const t of topics) assert.ok(t.sections.length && t.sections.every((n: number) => n >= 1 && n <= 279), t.id);
  assert.equal(new Set(topics.map((t: { id: string }) => t.id)).size, topics.length);
});
