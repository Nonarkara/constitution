import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const read = (f: string) => JSON.parse(readFileSync(new URL(`../data/${f}`, import.meta.url), "utf8"));
const corpus = read("constitution.json");
const bank = read("exam-topics.json");
const LANGS = ["th", "en", "zh"] as const;
const filled = (t: Record<string, string> | undefined) => LANGS.every((l) => typeof t?.[l] === "string" && t[l].trim().length > 0);

test("every exam question along the way is complete, trilingual and has one answer", () => {
  assert.ok(bank.length >= 60, `only ${bank.length} questions`);
  const ids = new Set<string>();
  for (const q of bank) {
    assert.match(q.id, /^x-\d{2}-[a-z0-9-]+$/, q.id);
    assert.ok(!ids.has(q.id), `duplicate ${q.id}`);
    ids.add(q.id);
    assert.ok(!("unverified" in q), `${q.id} is unverified`);
    assert.ok(q.topic >= 1 && q.topic <= 80, `${q.id} topic`);
    assert.ok(["constitution", "concept", "current"].includes(q.kind), `${q.id} kind`);
    assert.ok(filled(q.prompt) && filled(q.explanation), `${q.id} text`);
    assert.equal(q.choices.length, 4, `${q.id} choices`);
    q.choices.forEach((c: Record<string, string>) => assert.ok(filled(c), `${q.id} choice`));
    for (const l of LANGS) assert.equal(new Set(q.choices.map((c: Record<string, string>) => c[l].trim())).size, 4, `${q.id} repeats a choice in ${l}`);
    assert.ok(Number.isInteger(q.answer) && q.answer >= 0 && q.answer <= 3, `${q.id} answer`);
    assert.ok(q.chapters.length >= 1 && q.chapters.every((c: number) => c >= 1 && c <= 17), `${q.id} chapters`);
  }
});

test("constitution claims quote the Thai text; everything else names a dated source", () => {
  for (const q of bank) {
    for (const n of q.sections) assert.ok(n >= 1 && n <= 279, `${q.id} section ${n}`);
    if (q.sections.length) {
      assert.ok(typeof q.proof === "string" && q.proof.length >= 8, `${q.id} needs a proof quote`);
      assert.ok(
        q.sections.some((n: number) => corpus.sections[n - 1].th.includes(q.proof)),
        `${q.id}: "${q.proof}" is not in the Thai text of ${q.sections.join(", ")}`,
      );
    }
    if (q.kind !== "constitution") {
      assert.match(q.source?.url ?? "", /^https:\/\//, `${q.id} source url`);
      assert.ok(q.source.title?.trim(), `${q.id} source title`);
      assert.match(q.source.asOf ?? "", /^\d{4}(-\d{2}){0,2}$/, `${q.id} source date`);
    }
  }
});

test("every chapter lesson meets a question along the way, and it is a fresh one", async () => {
  const { pickSide } = await import("../lib/side.ts");
  for (let c = 1; c <= 17; c++) {
    const q = pickSide(c, []);
    assert.ok(q, `chapter ${c} has none`);
    // Tied questions name the chapter; a fallback is an honest outside-the-constitution topic.
    assert.ok(q!.chapters.includes(c) || q!.sections.length === 0, `chapter ${c} got an unrelated constitution question`);
    const seenAll = bank.filter((x: { chapters: number[] }) => x.chapters.includes(c)).map((x: { id: string }) => x.id);
    const again = pickSide(c, seenAll.slice(0, -1));
    if (seenAll.length > 1) assert.equal(again!.id, seenAll[seenAll.length - 1], `chapter ${c} repeats before showing the unseen one`);
  }
  const spread = new Set(bank.map((q: { answer: number }) => q.answer));
  assert.equal(spread.size, 4, "correct answers should not sit in one position");
});

// Choices are shuffled on screen, so "the first option" would point at the wrong one.
export const POSITIONAL = /(first|second|third|fourth|last) (option|choice|distractor)|option [1-4A-D]\b|ตัวเลือก(แรก|สุดท้าย|ที่สอง|ที่สาม)|ตัวลวงข้อ(แรก|ที่)|第[一二三四]个(选项|干扰项)|最后一个(选项|干扰项)/i;
test("explanations name a wrong choice by what it says, never by its position", () => {
  for (const q of bank) for (const l of LANGS) assert.ok(!POSITIONAL.test(q.explanation[l]), `${q.id} ${l} points at a choice by position`);
});
