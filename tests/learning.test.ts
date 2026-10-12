import test from "node:test";
import assert from "node:assert/strict";
import {
  bangkokDay,
  defaultProgress,
  recordAnswer,
  dueQuestions,
  chapterMastery,
  energyRemaining,
} from "../lib/learning.ts";
const now = Date.parse("2026-10-12T10:00:00Z");
const questions = Array.from({ length: 5 }, (_, i) => ({
  id: `q${i}`,
  chapter: 1,
}));
test("mastery counts distinct latest correct answers and requires 80%", () => {
  let p = defaultProgress();
  for (let i = 0; i < 10; i++) p = recordAnswer(p, questions[0], true, now);
  assert.equal(chapterMastery(questions, p, 1).correct, 1);
  assert.equal(chapterMastery(questions, p, 1).mastered, false);
  for (const q of questions.slice(1, 4)) p = recordAnswer(p, q, true, now);
  assert.equal(chapterMastery(questions, p, 1).mastered, true);
  p = recordAnswer(p, questions[0], false, now);
  assert.equal(chapterMastery(questions, p, 1).mastered, false);
  assert.equal(chapterMastery([], p, 2).mastered, false);
});
test("small chapter requires all three questions; duplicate IDs do not inflate mastery", () => {
  let p = recordAnswer(defaultProgress(), questions[0], true, now);
  p = recordAnswer(p, questions[1], true, now);
  assert.equal(chapterMastery(questions.slice(0, 3), p, 1).mastered, false);
  assert.equal(chapterMastery([questions[0], questions[0]], p, 1).total, 1);
});
test("spaced schedule is 10 minutes after error then 1, 3, 7, 14 days", () => {
  let p = recordAnswer(defaultProgress(), questions[0], false, now);
  assert.equal(p.questions.q0.due, now + 600_000);
  let time = p.questions.q0.due;
  for (const days of [1, 3, 7, 14, 14]) {
    p = recordAnswer(p, questions[0], true, time);
    assert.equal(p.questions.q0.due, time + days * 86_400_000);
    time = p.questions.q0.due;
  }
  p = recordAnswer(p, questions[0], false, time);
  assert.equal(p.questions.q0.level, 0);
});
test("early repeated correct answers cannot farm XP or interval", () => {
  const p = recordAnswer(defaultProgress(), questions[0], true, now);
  const repeated = recordAnswer(p, questions[0], true, now + 1);
  assert.equal(repeated.xp, p.xp);
  assert.deepEqual(repeated.questions.q0, p.questions.q0);
  assert.deepEqual(p.questions.q0, {
    correct: true,
    level: 1,
    due: now + 86_400_000,
  });
});
test("review includes only answered due cards, oldest first, at exact due time", () => {
  let p = recordAnswer(defaultProgress(), questions[0], false, now);
  p = recordAnswer(p, questions[1], false, now + 1);
  assert.deepEqual(
    dueQuestions(questions, p, now + 600_000).map((q) => q.id),
    ["q0"],
  );
  assert.deepEqual(
    dueQuestions(questions, p, now + 600_001).map((q) => q.id),
    ["q0", "q1"],
  );
});
test("Bangkok midnight resets energy and advances streak once per day", () => {
  const before = Date.parse("2026-10-12T16:59:59Z");
  const after = Date.parse("2026-10-12T17:00:00Z");
  assert.equal(bangkokDay(before), "2026-10-12");
  assert.equal(bangkokDay(after), "2026-10-13");
  let p = recordAnswer(defaultProgress(), questions[0], true, before);
  assert.equal(p.energy, 11);
  assert.equal(energyRemaining(p, after), 12);
  p = recordAnswer(p, questions[1], true, after);
  assert.equal(p.energy, 11);
  assert.equal(p.streak, 2);
  p = recordAnswer(p, questions[2], true, after + 1);
  assert.equal(p.streak, 2);
  p = recordAnswer(p, questions[3], true, after + 2 * 86_400_000);
  assert.equal(p.streak, 1);
});
test("state is immutable and energy never blocks another answer", () => {
  const original = defaultProgress();
  let p = original;
  for (let i = 0; i < 20; i++) p = recordAnswer(p, questions[0], true, now);
  assert.equal(p.energy, 0);
  assert.deepEqual(original, defaultProgress());
  assert.throws(() => recordAnswer(p, questions[0], true, NaN), RangeError);
});

test("quiz bank has 85 unique trilingual questions across every chapter and transitional provisions", async () => {
  const { readFile } = await import("node:fs/promises");
  const bank = JSON.parse(
    await readFile(new URL("../data/questions.json", import.meta.url), "utf8"),
  ) as import("../lib/learning.ts").Question[];
  assert.equal(bank.length, 85);
  assert.equal(new Set(bank.map((q) => q.id)).size, bank.length);
  for (let chapter = 1; chapter <= 17; chapter++)
    assert.equal(bank.filter((q) => q.chapter === chapter).length, 5);
  for (const q of bank) {
    assert.equal(q.choices.length, 4);
    assert.ok(Number.isInteger(q.answer) && q.answer >= 0 && q.answer < 4);
    assert.ok(
      q.sections.length > 0 &&
        q.sections.every((s) => Number.isInteger(s) && s >= 1 && s <= 279),
    );
    for (const language of ["th", "en", "zh"] as const) {
      assert.ok(q.prompt[language].trim());
      assert.ok(q.explanation[language].trim());
      assert.equal(new Set(q.choices.map((c) => c[language])).size, 4);
      for (const choice of q.choices) assert.ok(choice[language].trim());
    }
  }
  const amended = bank.find((q) => q.id === "c07-02")!;
  assert.match(amended.choices[amended.answer].th, /400.*100/);
  assert.match(amended.choices[amended.answer].en, /400.*100/);
  assert.match(amended.choices[amended.answer].zh, /400.*100/);
  const temporary = bank.find((q) => q.id === "c17-02")!;
  assert.match(temporary.explanation.en, /period has ended/);
});

test("a chapter lesson is short and puts due, then new, then missed questions first", async () => {
  const { lessonQueue } = await import("../lib/learning.ts");
  const bank = Array.from({ length: 30 }, (_, i) => ({ id: `q${i}`, chapter: 7 }));
  const now = 1_000_000;
  const p = defaultProgress();
  p.questions.q0 = { correct: true, level: 2, due: now + 5 };
  p.questions.q1 = { correct: true, level: 1, due: now - 5 };
  p.questions.q2 = { correct: false, level: 0, due: now + 600_000 };
  const lesson = lessonQueue(bank, p, 7, now);
  assert.equal(lesson.length, 10);
  assert.equal(lesson[0].id, "q1");
  assert.ok(!lesson.some((q) => q.id === "q0"));
  assert.equal(lessonQueue(bank, p, 3, now).length, 0);
});
