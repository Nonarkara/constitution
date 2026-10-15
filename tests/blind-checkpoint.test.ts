import { test } from "node:test";
import assert from "node:assert/strict";
import { readCheckpoint, writeCheckpoint } from "../lib/blind-checkpoint.ts";
import { startSitting, submitBlind, submitRetry, type Sitting } from "../lib/blind.ts";
type Stored = { sitting: Sitting; phase: string; earnedId: string | null };
const text = { th: "ก", en: "a", zh: "甲" };
const bank = ["a", "b"].map(id => ({ id, choices: [text, text, text, text], answer: 0 }));
function saved(sitting = submitBlind(startSitting(["a", "b"]), "a", 1, false)) {
  let raw = "";
  writeCheckpoint({ setItem: (_k, value) => { raw = value; }, removeItem: () => {} }, { sitting, phase: "sit", earnedId: null }, bank);
  return raw;
}
test("checkpoint restores partial sitting, rejects malformed and changed content", () => {
  const raw = saved();
  assert.equal(readCheckpoint(raw, bank)?.sitting?.at, 1);
  assert.equal(readCheckpoint("{", bank), null);
  assert.equal(readCheckpoint(raw, bank.map(q => ({ ...q, answer: 2 }))), null);
  for (const mutate of [
    (x: Stored) => { x.sitting.order = ["a", "a"]; },
    (x: Stored) => { x.sitting.at = 2; },
    (x: Stored) => { x.sitting.owed = []; },
    (x: Stored) => { x.sitting.firstTry.a = 9; },
    (x: Stored) => { x.phase = "handoff"; },
    (x: Stored) => { x.earnedId = "a"; },
  ]) {
    const corrupt = JSON.parse(raw);
    mutate(corrupt);
    assert.equal(readCheckpoint(JSON.stringify(corrupt), bank), null);
  }
});
test("review checkpoint keeps misses and earned interstitial independently of first score", () => {
  let s = submitBlind(startSitting(["a", "b"]), "a", 1, false);
  s = submitBlind(s, "b", 0, true);
  s = submitRetry(s, "a", 2, false);
  s = submitRetry(s, "a", 0, true);
  let raw = "";
  writeCheckpoint({ setItem: (_k, value) => { raw = value; }, removeItem: () => {} }, { sitting: s, phase: "answers", earnedId: "a" }, bank);
  const restored = readCheckpoint(raw, bank);
  assert.deepEqual(restored?.sitting, s);
  assert.equal(restored?.earnedId, "a");
  assert.equal(restored?.sitting?.firstTry.a, 1);
});
test("state transitions reject out-of-order, invalid choices and early retries", () => {
  const initial = startSitting(["a", "b"]);
  assert.equal(submitBlind(initial, "b", 0, true), initial);
  assert.equal(submitBlind(initial, "a", -1, false), initial);
  const partial = submitBlind(initial, "a", 1, false);
  assert.equal(submitRetry(partial, "a", 0, true), partial);
});
