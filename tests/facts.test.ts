import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
const read = (p: string) => JSON.parse(readFileSync(new URL("../data/" + p, import.meta.url), "utf8"));

test("every number in the games is proved by the Thai text of its section", () => {
  const corpus = read("constitution.json"), facts = read("facts.json");
  assert.equal(new Set(facts.map((f: { id: string }) => f.id)).size, facts.length);
  for (const f of facts) {
    assert.ok(corpus.sections[f.section - 1].th.includes(f.proof), `${f.id}: "${f.proof}" not in section ${f.section}`);
    for (const l of ["th", "en", "zh"]) assert.ok(f.label[l] && f.value[l], `${f.id} ${l}`);
  }
});

test("every cram-sheet number and trap is proved by the Thai text of its section", () => {
  const corpus = read("constitution.json"), cram = read("cram.json");
  const items = [...cram.time, ...cram.votes, ...cram.traps];
  assert.equal(new Set(items.map((f: { id: string }) => f.id)).size, items.length);
  for (const f of items) assert.ok(corpus.sections[f.section - 1].th.includes(f.proof), `${f.id}: "${f.proof}" not in section ${f.section}`);
});
