import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { preparePracticeQuestion, practiceSessionScore } from "../lib/practice-session.ts";
import vm from "node:vm";
import ts from "typescript";
const adaptiveModule = { exports: {} as { buildPracticeQueue: (bank: any[], progress: ReturnType<typeof defaultProgress>, mode: "weak") => any[] } };
vm.runInNewContext(ts.transpileModule(readFileSync(new URL("../lib/adaptive.ts", import.meta.url), "utf8"), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
}).outputText, {
  module: adaptiveModule, exports: adaptiveModule.exports,
  require: (name: string) => {
    if (name === "./outline") return JSON.parse(readFileSync(new URL("../data/outline.json", import.meta.url), "utf8"));
    throw Error(name);
  },
});
const { buildPracticeQueue } = adaptiveModule.exports;
import { defaultProgress } from "../lib/learning.ts";
const bank = JSON.parse(readFileSync(new URL("../data/questions.json", import.meta.url), "utf8"));

test("every competition answer remains correct in all languages after shuffling and its position varies", () => {
  const originals = bank.filter((q: {id: string}) => q.id.startsWith("comp-"));
  assert.equal(originals.length, 30);
  for (const original of originals) {
    const before = JSON.stringify(original), positions = new Set<number>();
    for (let a = 0; a < 4; a++) for (let b = 0; b < 3; b++) for (let c = 0; c < 2; c++) {
      const draws = [(a + 0.1) / 4, (b + 0.1) / 3, (c + 0.1) / 2];
      const presented = preparePracticeQuestion(original, () => draws.shift()!);
      assert.equal(presented.id, original.id);
      for (const lang of ["th", "en", "zh"])
        assert.equal(presented.choices[presented.answer][lang], original.choices[original.answer][lang]);
      positions.add(presented.answer);
    }
    assert.equal(positions.size, 4);
    assert.equal(JSON.stringify(original), before);
  }
});

test("arena accuracy includes the just-submitted answer and never counts an unknown question", () => {
  const queue = [{id:"first",answer:2},{id:"second",answer:1}];
  assert.deepEqual(practiceSessionScore(queue, {}), {correct:0,answered:0,percentage:0});
  assert.deepEqual(practiceSessionScore(queue, {first:2}), {correct:1,answered:1,percentage:100});
  assert.deepEqual(practiceSessionScore(queue, {first:2,second:1}), {correct:2,answered:2,percentage:100});
  assert.deepEqual(practiceSessionScore(queue, {first:0,second:1,unknown:1}), {correct:1,answered:2,percentage:50});
});

test("fully mastered weak mode has no repair queue", () => {
  const progress = defaultProgress();
  for (const q of bank) progress.questions[q.id] = {correct:true,level:1,due:0};
  assert.equal(buildPracticeQueue(bank, progress, "weak").length, 0);
});
