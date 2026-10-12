import test from "node:test";
import assert from "node:assert/strict";
import { civicQueue, civicRooms, roomIds, resumedRoom } from "../lib/civic.ts";
import { defaultProgress, recordAnswer } from "../lib/learning.ts";
import { readFileSync } from "node:fs";
test("civic rooms include sixteen unique source-backed questions in the existing review bank", () => {
  const bank = JSON.parse(
    readFileSync(new URL("../data/questions.json", import.meta.url), "utf8"),
  );
  const ids = civicRooms.flatMap(roomIds);
  assert.equal(new Set(ids).size, 16);
  for (const r of civicRooms)
    for (const id of roomIds(r)) {
      const q = bank.find((q: { id: string }) => q.id === id);
      assert.ok(q);
      assert.ok(q.sections.every((n: number) => r.sections.includes(n)));
      for (const lang of ["th", "en", "zh"]) assert.ok(q.hook[lang]);
    }
});
test("civic practice prioritises due questions and errors without altering review intervals", () => {
  let p = defaultProgress();
  p = recordAnswer(p, { id: "known" }, true, 1000);
  p = recordAnswer(p, { id: "error" }, false, 1000);
  p.questions.due = { correct: true, level: 1, due: 1000 };
  assert.deepEqual(civicQueue(["known", "fresh", "error", "due"], p, 2000), [
    "due",
    "error",
    "fresh",
    "known",
  ]);
  assert.equal(p.questions.error.due, 601000);
  assert.equal(p.questions.known.due, 86401000);
});
test("room cookie only accepts fixed room ids, not arbitrary navigation", () => {
  assert.equal(
    resumedRoom("other=yes; constitution-civic-room=square"),
    "square",
  );
  assert.equal(
    resumedRoom("constitution-civic-room=https://evil.example"),
    null,
  );
  assert.equal(resumedRoom("constitution-civic-room=constructor"), null);
  assert.equal(resumedRoom(""), null);
});
