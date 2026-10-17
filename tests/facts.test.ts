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

test("all canonical system counts and claims stay synchronized with underlying data", async () => {
  const { GUIDE } = await import("../lib/nav.ts");
  const { RIGHT_GROUPS } = await import("../lib/rights.ts");
  const { palace } = await import("../lib/palace.ts");
  const { papers } = await import("../lib/papers.ts");
  const corpus = read("constitution.json");
  const facts = read("facts.json");
  const cram = read("cram.json");
  const examTopics = read("exam-topics.json");
  const questions = read("questions.json");

  assert.equal(corpus.sections.length, 279, "constitution sections");
  assert.equal(GUIDE.length, 13, "guide chapters");
  const rightsCount = RIGHT_GROUPS.reduce((n: number, g: { ids: string[] }) => n + g.ids.length, 0);
  assert.equal(rightsCount, 15, "civic rights catalog");
  assert.equal(palace.length, 16, "memory palace rooms");
  const cramNumbersCount = facts.length + cram.time.length + cram.votes.length;
  assert.equal(cramNumbersCount, 41, "cram numbers count");
  assert.equal(cram.traps.length, 7, "cram traps count");
  assert.equal(papers.length, 30, "timed mock papers");
  assert.equal(examTopics.length, 90, "district exam topics");
  assert.equal(questions.length, 470, "authored questions bank");

  // Verify that components/Home.tsx does not reintroduce stale literals
  const homeSrc = readFileSync(new URL("../components/Home.tsx", import.meta.url), "utf8");
  assert.ok(!homeSrc.includes("10 บท"), "Home.tsx must not contain stale '10 บท'");
  assert.ok(!homeSrc.includes("22 ด้าน"), "Home.tsx must not contain stale '22 ด้าน'");
  assert.ok(!homeSrc.includes("10-chapter"), "Home.tsx must not contain stale '10-chapter'");
  assert.ok(!homeSrc.includes("22 civic rights"), "Home.tsx must not contain stale '22 civic rights'");
  assert.ok(homeSrc.includes("GUIDE_CHAPTERS"), "Home.tsx derives GUIDE_CHAPTERS from GUIDE");
  assert.ok(homeSrc.includes("RIGHTS_COUNT"), "Home.tsx derives RIGHTS_COUNT from RIGHT_GROUPS");
});
