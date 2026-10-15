import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { startSitting, submitBlind, submitRetry, outstanding, blindScore, earned } from "../lib/blind.ts";

const read = (f: string) => JSON.parse(readFileSync(new URL(`../data/${f}`, import.meta.url), "utf8"));
const bank = read("exam-topics.json");
const LANGS = ["th", "en", "zh"] as const;
const filled = (t: Record<string, string> | undefined) => LANGS.every((l) => typeof t?.[l] === "string" && t[l].trim().length > 0);

// ids in order, right/wrong answers keyed by index
const ids = ["a", "b", "c", "d"];
const rightOf: Record<string, number> = { a: 1, b: 2, c: 0, d: 3 };

function sitAll(picks: Record<string, number>) {
  let s = startSitting(ids);
  for (const id of ids) s = submitBlind(s, id, picks[id], picks[id] === rightOf[id]);
  return s;
}

test("the blind pass records every attempt and owes nothing when all are right", () => {
  const s = sitAll({ a: 1, b: 2, c: 0, d: 3 });
  assert.deepEqual(s.firstTry, { a: 1, b: 2, c: 0, d: 3 });
  assert.deepEqual(s.owed, []);
  assert.deepEqual(outstanding(s), []);
  assert.deepEqual(blindScore(s), { right: 4, wrong: 0, total: 4 });
});

test("a miss on the blind pass becomes a debt that survives the end of the pass", () => {
  const s = sitAll({ a: 0, b: 2, c: 0, d: 3 });
  assert.deepEqual(s.owed, ["a"]);
  assert.deepEqual(outstanding(s), ["a"]);
  assert.deepEqual(blindScore(s), { right: 3, wrong: 1, total: 4 });
  // answering wrongly again must not clear it
  const still = submitRetry(s, "a", 2, false);
  assert.deepEqual(outstanding(still), ["a"]);
  assert.equal(still.retries.a, 1);
  assert.deepEqual(still.owed, ["a"], "a retry must not duplicate the debt");
});

test("a debt clears only on a correct retry, and stays cleared", () => {
  const s = sitAll({ a: 0, b: 0, c: 0, d: 3 });
  assert.deepEqual(s.owed, ["a", "b"]);
  let t = submitRetry(s, "a", 1, true);
  assert.deepEqual(outstanding(t), ["b"]);
  assert.ok(earned(t, "a"));
  assert.ok(!earned(t, "b"));
  // answering an already-cleared item is inert
  const again = submitRetry(t, "a", 0, false);
  assert.deepEqual(outstanding(again), ["b"], "cleared stays cleared");
  assert.deepEqual(again.cleared, ["a"]);
});

test("retrying a question that was never missed does nothing", () => {
  // only d is wrong; a, b and c were right first time
  const s = sitAll({ a: 1, b: 2, c: 0, d: 0 });
  assert.deepEqual(outstanding(s), ["d"]);
  const t = submitRetry(s, "a", 0, false);
  assert.deepEqual(outstanding(t), ["d"], "a first-time right is not a debt");
  assert.deepEqual(t.cleared, [], "and it cannot be earned by retrying it");
});

test("the blind pass cannot be double-answered, and only advances once", () => {
  let s = startSitting(ids);
  s = submitBlind(s, "a", 0, false);
  assert.equal(s.at, 1);
  const dup = submitBlind(s, "a", 1, true);
  assert.equal(dup.at, 1, "re-submitting the same id must not advance");
  assert.deepEqual(dup.firstTry, { a: 0 }, "the first pick stands");
  assert.deepEqual(dup.owed, ["a"]);
});

test("every question carries a transferable rule in all three languages", () => {
  const missing: string[] = [];
  for (const q of bank) if (!filled(q.logic)) missing.push(q.id);
  assert.deepEqual(missing, [], `${missing.length} questions without a logic rule`);
});

test("a logic rule is a rule, not a copy of the answer", () => {
  for (const q of bank) {
    const right = q.choices[q.answer];
    for (const l of LANGS) {
      const rule = q.logic[l].trim();
      assert.ok(rule.length > 20, `${q.id} ${l}: rule too short to carry anything`);
      // Length is deliberately NOT compared against the answer: several answers are long
      // descriptive sentences and their rules are tight one-liners, so any length ratio
      // flags good content. Only identity is a real failure here.
      assert.notEqual(rule, right[l].trim(), `${q.id} ${l}: rule is the answer`);
    }
  }
});

test("no two questions share a rule, in any language", () => {
  for (const l of LANGS) {
    const seen = new Map<string, string[]>();
    for (const q of bank) {
      const key = q.logic[l].trim().toLowerCase();
      seen.set(key, [...(seen.get(key) ?? []), q.id]);
    }
    const dupes = [...seen.entries()].filter(([, ids]) => ids.length > 1);
    assert.deepEqual(dupes, [], `${l}: ${dupes.length} duplicated rules, e.g. ${dupes[0]?.[1].join(", ")}`);
  }
});

test("a rule is written in its own language, not left half in another", () => {
  // A stray Thai fragment once survived inside a Chinese rule; length checks cannot see it.
  const THAI = /[\u0E00-\u0E7F]/;
  const dirty: string[] = [];
  for (const q of bank) {
    if (THAI.test(q.logic.en)) dirty.push(`${q.id} en`);
    if (THAI.test(q.logic.zh)) dirty.push(`${q.id} zh`);
  }
  assert.deepEqual(dirty, [], `Thai left inside: ${dirty.join(", ")}`);
});
