import test from "node:test";
import assert from "node:assert/strict";
import {
  emptyCalibration,
  recordCalibration,
  explanationNote,
  nextReviewAt,
} from "../lib/coach.ts";
import { defaultProgress } from "../lib/learning.ts";
test("confidence tracks calibration without grading certainty as knowledge", () => {
  let c = recordCalibration(emptyCalibration(), "sure", false);
  c = recordCalibration(c, "sure", true);
  c = recordCalibration(c, "unsure", true);
  assert.deepEqual(c, { sure: 2, sureMissed: 1, uncertainCorrect: 1 });
  assert.deepEqual(recordCalibration(c, null, false), c);
});
test("explanation append preserves existing notes, highlights and unrelated sections", () => {
  const prior = {
    1: {
      section: 1,
      note: "Original",
      highlight: "mint" as const,
      updatedAt: 1,
    },
    2: { section: 2, note: "Other", updatedAt: 2 },
  };
  const next = explanationNote(prior, 1, "My explanation", 3)!;
  assert.equal(next[1].note, "Original\n\nMy explanation");
  assert.equal(next[1].highlight, "mint");
  assert.deepEqual(next[2], prior[2]);
  assert.equal(prior[1].note, "Original");
  assert.equal(explanationNote(prior, 1, "x".repeat(5000), 3), null);
  assert.equal(explanationNote(prior, 280, "text", 3), null);
});
test("next review reports the earliest attempted card, with overdue cards due now", () => {
  const p = defaultProgress();
  assert.equal(nextReviewAt(p, ["a"], 100), null);
  p.questions.a = { correct: true, level: 1, due: 200 };
  p.questions.b = { correct: false, level: 0, due: 50 };
  assert.equal(nextReviewAt(p, ["a"], 100), 200);
  assert.equal(nextReviewAt(p, ["a", "b"], 100), 100);
});
