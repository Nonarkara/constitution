import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import vm from "node:vm";
import ts from "typescript";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { CITATION_PENDING } from "../lib/pokklong.ts";
import {
  buildPokklongQueue,
  emptyPokklong,
  POKKLONG_KEY,
  parsePokklong,
  recordPokklong,
  stepAccuracy,
  textOf,
  type PokklongBank,
  type PokklongQuestion,
} from "../lib/pokklong.ts";

const bank = JSON.parse(
  readFileSync(new URL("../data/pokklong/questions.json", import.meta.url), "utf8"),
) as PokklongBank;
const questions = bank.questions;
const langs = ["th", "en", "zh"] as const;

function assertText(value: unknown, where: string) {
  assert.equal(typeof value, "object", where);
  assert.ok(value && !Array.isArray(value), where);
  const text = value as Record<string, unknown>;
  for (const lang of langs) {
    assert.equal(typeof text[lang], "string", `${where}.${lang}`);
    assert.ok((text[lang] as string).trim().length > 0, `${where}.${lang}`);
  }
}

test("pokklong questions.json matches the ladder contract", () => {
  assert.equal(questions.length, 284);
  assert.equal(Object.keys(bank.meta.steps).length, 12);
  assertText(bank.meta.title, "title");
  assert.equal(typeof bank.meta.credit, "string");
  assert.match(bank.meta.credit, /ประพันธ์ เวารัมย์/);
  const ids = new Set<string>();
  const counts = [0, 0, 0, 0];
  const byStep: Record<number, number> = {};
  let unverified = 0;
  for (const question of questions) {
    assert.equal(ids.has(question.id), false, question.id);
    ids.add(question.id);
    assert.equal(question.options.length, 4, question.id);
    assert.ok(Number.isInteger(question.answer) && question.answer >= 0 && question.answer <= 3, question.id);
    counts[question.answer] += 1;
    byStep[question.step] = (byStep[question.step] ?? 0) + 1;
    assertText(question.prompt, question.id);
    assertText(question.why, `${question.id}.why`);
    assertText(question.logic_so_far, `${question.id}.logic`);
    assertText(question.step_name, `${question.id}.step`);
    assertText(question.source.act, `${question.id}.act`);
    assert.equal(typeof question.source.section, "string", question.id);
    assert.equal(typeof question.source.verified, "boolean", question.id);
    for (const option of question.options) assertText(option, question.id);
    if (question.mnemonic !== null) assertText(question.mnemonic, `${question.id}.mnemonic`);
    if (!question.source.verified) {
      unverified += 1;
      assert.equal(typeof question.source.note, "string", question.id);
      assert.ok(question.source.note!.trim().length > 0, question.id);
    }
  }
  assert.equal(unverified, 14);
  assert.deepEqual(byStep, {
    1: 20, 2: 38, 3: 15, 4: 14, 5: 9, 6: 17, 7: 35, 8: 26, 9: 35, 10: 32, 11: 18, 12: 25,
  });
  for (const count of counts) {
    assert.ok(Math.abs(count / questions.length - 0.25) <= 0.03, String(count));
  }
});

test("the ladder stays in step order and a later start does not gate earlier steps out of reach", () => {
  const fromStart = buildPokklongQueue(questions, 1, () => 0);
  assert.equal(fromStart.length, 284);
  let previous = 1;
  for (const question of fromStart) {
    assert.ok(question.step >= previous);
    previous = question.step;
  }
  const fromFive = buildPokklongQueue(questions, 5, () => 0);
  assert.ok(fromFive.every((question) => question.step >= 5));
  assert.equal(fromFive[0].step, 5);
  const back = buildPokklongQueue(questions, 3, () => 0);
  assert.equal(back[0].step, 3);
  const stepTwo = questions.filter((question) => question.step === 2).map((question) => question.id).sort();
  const queued = fromStart.filter((question) => question.step === 2).map((question) => question.id).sort();
  assert.deepEqual(queued, stepTwo);
});

test("pokklong progress is its own namespace and blank text falls back to Thai", () => {
  assert.equal(POKKLONG_KEY, "pokklong-progress");
  assert.notEqual(POKKLONG_KEY, "constitution-progress");
  const saved = recordPokklong(emptyPokklong(), "PK-S1-001", false);
  assert.equal(saved.answers["PK-S1-001"], false);
  assert.equal("xp" in saved, false);
  assert.deepEqual(parsePokklong({ answers: { "PK-S1-001": true, other: true } }).answers, { "PK-S1-001": true });
  const accuracy = stepAccuracy(questions, saved, 1);
  assert.equal(accuracy.total, 20);
  assert.equal(accuracy.answered, 1);
  assert.equal(accuracy.correct, 0);
  assert.equal(textOf({ th: "ไทย", en: "", zh: "中" }, "en"), "ไทย");
  assert.equal(textOf({ th: "ไทย", en: "English", zh: "中" }, "zh"), "中");
});

const compiled = ts.transpileModule(
  readFileSync(new URL("../components/GuessFirstCard.tsx", import.meta.url), "utf8"),
  {
    compilerOptions: {
      jsx: ts.JsxEmit.React,
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2022,
      esModuleInterop: true,
    },
  },
).outputText;
const cardModule = { exports: {} as { GuessFirstCard: (props: Record<string, unknown>) => React.ReactElement } };
vm.runInNewContext(compiled, {
  React,
  module: cardModule,
  exports: cardModule.exports,
  require: (name: string) => {
    if (name === "react") return React;
    if (name === "@/lib/pokklong") return { CITATION_PENDING };
    throw new Error(name);
  },
});
const { GuessFirstCard } = cardModule.exports;

function card(question: PokklongQuestion, revealed: boolean, selected: number | null) {
  const markup = renderToStaticMarkup(
    React.createElement(GuessFirstCard, {
      prompt: question.prompt.en,
      options: question.options.map((option) => option.en),
      letters: ["A", "B", "C", "D"],
      answer: question.answer,
      selected,
      revealed,
      why: question.why.en,
      stepName: question.step_name.en,
      logic: question.logic_so_far.en,
      mnemonic: question.mnemonic?.en ?? null,
      sourceAct: question.source.act.en,
      sourceSection: question.source.section,
      verified: question.source.verified,
      note: question.source.note,
      whyLabel: "Why",
      logicLabel: "The logic so far",
      mnemonicLabel: "Mnemonic",
      sourceLabel: "Source",
      correctLabel: "Correct",
      wrongLabel: "Wrong",
      nextLabel: "Next",
      optionsLabel: "Options",
      onChoose: () => {},
      onNext: () => {},
    }),
  );
  return markup;
}

function nextTag(markup: string) {
  const tag = markup.match(/<button[^>]*data-testid="next"[^>]*>/);
  assert.ok(tag, markup);
  return tag[0];
}

test("the reveal stays hidden until a guess, then shows why, logic, mnemonic and source", () => {
  const question = questions.find((item) => {
    if (!item.mnemonic || !item.source.verified || item.source.section.length < 3) return false;
    const visible = [item.prompt.en, ...item.options.map((option) => option.en)].join("\n");
    return !visible.includes(item.mnemonic.en) && !visible.includes(item.source.section);
  });
  assert.ok(question);
  const before = card(question, false, null);
  assert.equal(before.includes('data-testid="reveal"'), false);
  assert.equal(before.includes('data-reveal='), false);
  assert.equal(before.includes(question.mnemonic!.en), false);
  assert.equal(before.includes(question.source.section), false);
  assert.equal(before.includes(CITATION_PENDING), false);
  assert.match(nextTag(before), /disabled/);
  assert.match(nextTag(before), /hidden/);

  const wrong = question.answer === 0 ? 1 : 0;
  const after = card(question, true, wrong);
  assert.match(after, /data-testid="reveal"/);
  const why = after.indexOf('data-reveal="why"');
  const logic = after.indexOf('data-reveal="logic"');
  const mnemonic = after.indexOf('data-reveal="mnemonic"');
  const source = after.indexOf('data-reveal="source"');
  assert.ok(why >= 0 && why < logic && logic < mnemonic && mnemonic < source);
  assert.match(after, /Wrong/);
  assert.match(after, /Correct/);
  assert.equal(nextTag(after).includes("disabled"), false);
  assert.equal(nextTag(after).includes("hidden"), false);
  assert.match(after, />A</);
  assert.match(after, /<button/);
});

test("an unverified citation shows the confirmation marker only after the guess", () => {
  const question = questions.find((item) => !item.source.verified);
  assert.ok(question);
  assert.equal(card(question, false, null).includes(CITATION_PENDING), false);
  const after = card(question, true, question.answer === 0 ? 1 : 0);
  const marker = after.indexOf(CITATION_PENDING);
  const source = after.indexOf('data-reveal="source"');
  assert.ok(source >= 0 && marker > source);
  assert.match(after, new RegExp(question.source.note!.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
});
