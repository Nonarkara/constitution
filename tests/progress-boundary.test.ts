import test from "node:test";
import assert from "node:assert/strict";
import { parseProgress } from "../lib/progress.ts";
import { defaultProgress, recordAnswer } from "../lib/learning.ts";
test("imports reject contradictory review state, impossible dates and unknown/reserved question IDs", () => {
  const p = defaultProgress(),
    now = Date.parse("2026-10-12T00:00:00Z");
  for (const questions of [
    { a: { correct: false, level: 4, due: now } },
    { a: { correct: true, level: 0, due: now } },
    JSON.parse('{"__proto__":{"correct":true,"level":1,"due":1}}'),
  ])
    assert.equal(parseProgress({ ...p, questions }), null);
  assert.equal(parseProgress({ ...p, lastStudyDay: "2026-99-99" }), null);
  assert.equal(parseProgress({ ...p, lastStudyDay: "2026-02-30" }), null);
  assert.ok(parseProgress({ ...p, lastStudyDay: "2024-02-29" }));
  assert.equal(
    parseProgress(
      { ...p, questions: { unknown: { correct: true, level: 1, due: now } } },
      new Set(["known"]),
    ),
    null,
  );
  const malformed = {
    ...p,
    questions: { a: { correct: false, level: 4, due: now + 600000 } },
  };
  const repaired = recordAnswer(malformed, { id: "a" }, true, now);
  assert.equal(repaired.questions.a.level, 1);
  assert.equal(repaired.questions.a.due, now + 86400000);
});
