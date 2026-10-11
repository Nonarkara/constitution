import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { defaultProgress } from "../lib/learning.ts";
import { parseProgress } from "../lib/progress.ts";
const read = (path: string) =>
  JSON.parse(readFileSync(new URL("../data/" + path, import.meta.url), "utf8"));
test("Chinese summaries and Senate episode ranges cover every legal section exactly once", () => {
  const zh = read("chinese.json"),
    audio = read("audio.json");
  assert.equal(Object.keys(zh).length, 279);
  for (let n = 1; n <= 279; n++) {
    assert.ok(zh[n].zh.trim().length > 0);
    assert.equal(zh[n].kind, "summary");
    assert.equal(
      audio.filter(
        (a: { from: number; to: number }) => n >= a.from && n <= a.to,
      ).length,
      1,
    );
  }
  assert.equal(audio.length, 29);
  assert.match(zh[83].zh, /400/);
  assert.match(zh[83].zh, /100/);
});
test("saved progress rejects malformed scheduling records and imports recover safe daily defaults", () => {
  assert.equal(parseProgress({}), null);
  assert.equal(
    parseProgress({ ...defaultProgress(), questions: { a: null } }),
    null,
  );
  assert.equal(
    parseProgress({
      ...defaultProgress(),
      questions: { a: { correct: true, level: 50, due: 1 } },
    }),
    null,
  );
  assert.equal(parseProgress({ ...defaultProgress(), xp: -1 }), null);
  assert.equal(
    parseProgress({ ...defaultProgress(), lastStudyDay: "tomorrow" }),
    null,
  );
  const saved = defaultProgress();
  saved.questions.a = { correct: false, level: 0, due: 600000 };
  assert.deepEqual(parseProgress(saved), saved);
  assert.equal(
    parseProgress({ ...saved, energy: "bad" } as unknown)?.energy,
    12,
  );
});
