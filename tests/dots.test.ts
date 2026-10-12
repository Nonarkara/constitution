import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { clusters, connected, crossReferences, mostCited, neighbours, nextDots, threadLines } from "../lib/dots.ts";
import { knowSummary, markRead, parseRead, sectionSignals, stateOf, SECTION_COUNT } from "../lib/knowledge.ts";

const corpus = JSON.parse(readFileSync(new URL("../data/constitution.json", import.meta.url), "utf8"));
const graph = JSON.parse(readFileSync(new URL("../data/graph.json", import.meta.url), "utf8"));
const index = JSON.parse(readFileSync(new URL("../data/question-index.json", import.meta.url), "utf8"));
const arabic = (t: string) => t.replace(/[๐-๙]/g, (d) => String("๐๑๒๓๔๕๖๗๘๙".indexOf(d)));

test("every cross-reference is written in the cited section's Thai text", () => {
  assert.ok(crossReferences.length >= 200);
  for (const [from, to] of crossReferences) {
    assert.notEqual(from, to);
    const text = arabic(corpus.sections[from - 1].th);
    assert.match(text, new RegExp(`มาตรา\\s*${to}(?!\\d)`), `${from} → ${to}`);
  }
});

test("every grouping comes from a real topic, term or question", () => {
  const ids = {
    topic: new Set(JSON.parse(readFileSync(new URL("../data/topics.json", import.meta.url), "utf8")).map((t: { id: string }) => t.id)),
    term: new Set(JSON.parse(readFileSync(new URL("../data/glossary.json", import.meta.url), "utf8")).map((t: { id: string }) => t.id)),
    question: new Set(index.map((q: { id: string }) => q.id)),
  };
  for (const [kind, id, , sections] of graph.groups) {
    assert.ok(ids[kind as keyof typeof ids].has(id), `${kind} ${id}`);
    for (const n of sections) assert.ok(n >= 1 && n <= SECTION_COUNT);
  }
});

test("neighbours put the text's own citations first and are symmetric", () => {
  const near = neighbours(26);
  assert.ok(near.length > 0);
  for (let i = 1; i < near.length; i++) assert.ok(near[i - 1].weight >= near[i].weight);
  for (const { n } of near) assert.ok(connected(n, 26), `${n} ↔ 26`);
  const [from, to] = crossReferences[0];
  assert.ok(neighbours(to).find((x) => x.n === from)?.reasons.some((r) => r.kind === "cited-by"));
});

test("clusters only join sections that really connect, and thread lines name a real link", () => {
  const [from, to] = crossReferences[0];
  const lonely = [1, 2, 3, 4, 5, 6].find((n) => neighbours(n).every((x) => x.n !== from && x.n !== to));
  const groups = clusters([from, to, ...(lonely ? [lonely] : [])]);
  assert.deepEqual(groups[0], [from, to].sort((a, b) => a - b));
  for (const line of threadLines(groups[0])) assert.ok(connected(line.a, line.b));
  if (lonely) assert.ok(!groups.flat().includes(lonely));
});

test("next dots are unread and linked to her sections", () => {
  const mine = [26, 27, 77];
  for (const dot of nextDots(mine)) {
    assert.ok(!mine.includes(dot.n));
    for (const v of dot.via) assert.ok(connected(dot.n, v));
  }
  assert.ok(mostCited(3)[0].times >= mostCited(3)[2].times);
});

test("every section is in exactly one learning state, so the counts add to 279", () => {
  const now = Date.now();
  const q = index[0];
  const signals = sectionSignals({
    progress: {
      questions: { [q.id]: { correct: true, level: 2, due: now + 1e9 }, [index[5].id]: { correct: false, level: 0, due: now - 1 } },
      xp: 0, streak: 0, lastStudyDay: null, energy: 12, energyDay: "",
    } as never,
    marks: { marks: [{ id: "m", section: 40, lang: "th", start: 0, end: 4, quote: "x", createdAt: 1 }], bookmarks: [41] },
    annotations: { 42: { section: 42, highlight: "amber", updatedAt: 1 } } as never,
    read: markRead(markRead({}, 50, 1), 50, 2),
    questions: index,
    now,
  });
  assert.equal(signals.length, SECTION_COUNT);
  const tally = new Map<string, number>();
  for (const s of signals) tally.set(stateOf(s), (tally.get(stateOf(s)) ?? 0) + 1);
  assert.equal([...tally.values()].reduce((a, b) => a + b, 0), SECTION_COUNT);
  assert.equal(stateOf(signals[49]), "read");
  assert.equal(stateOf(signals[39]), "read");
  assert.ok(signals[40].marked && signals[41].marked);
  assert.equal(stateOf(signals[index[5].sections[0] - 1]), "due");
  assert.equal(knowSummary(signals).marked, 3);
  assert.deepEqual(parseRead({ 3: 5, 0: 1, 300: 1, x: 2, 4: "no" }), { 3: 5 });
});
