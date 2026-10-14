import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";
const read = (p: string) => JSON.parse(readFileSync(new URL("../data/" + p, import.meta.url), "utf8"));

const OACCP_PATH = new URL("../data/sources/oaccp.json", import.meta.url);
const oaccp = existsSync(OACCP_PATH) ? read("sources/oaccp.json") : null;

const prove = (entry: { id: string; proof: string; section: number; source?: string; actKey?: string }) => {
  if (entry.source === "oaccp") {
    assert.ok(oaccp, `oaccp corpus missing for ${entry.id}`);
    const sec = entry.actKey && oaccp!.sections[entry.actKey];
    assert.ok(sec, `${entry.id}: oaccp section ${entry.actKey} not found`);
    assert.ok(sec.th.includes(entry.proof), `${entry.id}: "${entry.proof}" not in oaccp §${entry.actKey}`);
    return;
  }
  // default: constitution
  const corpus = read("constitution.json");
  assert.ok(corpus.sections[entry.section - 1].th.includes(entry.proof), `${entry.id}: "${entry.proof}" not in section ${entry.section}`);
};

test("every number in the games is proved by the Thai text of its section", () => {
  const facts = read("facts.json");
  assert.equal(new Set(facts.map((f: { id: string }) => f.id)).size, facts.length);
  for (const f of facts) {
    prove(f);
    for (const l of ["th", "en", "zh"]) assert.ok(f.label[l] && f.value[l], `${f.id} ${l}`);
  }
});

test("every cram-sheet number and trap is proved by the Thai text of its source", () => {
  const cram = read("cram.json");
  const items = [...cram.time, ...cram.votes, ...cram.traps];
  assert.equal(new Set(items.map((f: { id: string }) => f.id)).size, items.length);
  for (const f of items) prove(f);
});
