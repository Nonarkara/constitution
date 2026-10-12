import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { checkCases } from "../scripts/validate-cases.mjs";
const read = (path: string) =>
  JSON.parse(readFileSync(new URL("../data/" + path, import.meta.url), "utf8"));
const corpus = read("constitution.json"),
  cases = read("cases.json");
const mutate = (edit: (c: any) => void) => {
  const copy = structuredClone(cases);
  edit(copy[0]);
  return checkCases(copy, corpus);
};

test("every life puzzle quotes the Thai law verbatim and every chapter has one", () => {
  assert.deepEqual(checkCases(cases, corpus), []);
});

test("a puzzle that drifts from the legal text is rejected", () => {
  assert.equal(mutate((c) => (c.quotes[0].th = c.quotes[0].th.slice(0, -1) + "ก")).length, 1);
  assert.equal(mutate((c) => c.sections.push(999)).length, 1);
  assert.equal(mutate((c) => (c.story.th += " ดูมาตรา ๓๓ ประกอบ")).length, 1);
  assert.equal(mutate((c) => delete c.why.zh).length, 1);
  assert.equal(mutate((c) => (c.story.th += " “กฎหมายนี้ไม่มีอยู่จริง”")).length, 1);
  assert.equal(mutate((c) => (c.answer = 9)).length, 1);
  const withoutChapterOne = cases.filter((c: { chapter: number }) => c.chapter !== 1);
  assert.deepEqual(checkCases(withoutChapterOne, corpus), ["chapter 1 has no case"]);
});
