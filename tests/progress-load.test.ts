import test from "node:test";
import assert from "node:assert/strict";
import { defaultProgress } from "../lib/learning.ts";
import { parseProgress } from "../lib/progress.ts";

test("saved progress survives a revised question bank; import stays strict", () => {
  const saved = { ...defaultProgress(), xp: 30, questions: { "retired-1": { correct: true, level: 2, due: 1 }, "c01-01": { correct: false, level: 0, due: 1 } } };
  assert.equal(parseProgress(saved)?.xp, 30);
  assert.equal(parseProgress(saved, new Set(["c01-01"])), null);
});
