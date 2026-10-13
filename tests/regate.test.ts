import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import {
  ASK_RETRIES,
  ATTEMPT_BUDGET_MS,
  askRequest,
  confidenceLabel,
  keepStatutoryExceptions,
  notebookFallback,
  pollSteps,
  quotesInAnswerLanguage,
  readConfidence,
  shapeAskAnswer,
  showGroundedMark,
  stripFabricatedSources,
} from "../lib/ask.ts";
import { analyzeUserLearning } from "../lib/adaptive.ts";
import { topicFor, memoryCueFor, matchingWhys } from "../lib/cues.ts";
import { ministerialRemoval, drillMembership, DRILL_COUNT } from "../lib/drills.ts";
import { enNoun, formatCount } from "../lib/grammar.ts";
import { chapterPickerLabel } from "../lib/i18n.ts";
import { defaultProgress, type Question } from "../lib/learning.ts";
import { makePaper, papers } from "../lib/papers.ts";
import { sessionSummary, sessionTotals } from "../lib/session.ts";
import { teachingBodies } from "../lib/teaching.ts";

const bank = JSON.parse(
  readFileSync(new URL("../data/questions.json", import.meta.url), "utf8"),
) as Question[];
const cases = JSON.parse(
  readFileSync(new URL("../data/cases.json", import.meta.url), "utf8"),
) as { id: string; sections: number[]; why?: { th: string; en: string; zh: string } }[];
const outline = JSON.parse(
  readFileSync(new URL("../data/outline.json", import.meta.url), "utf8"),
) as { chapters: { number: number; title: { th: string; en: string; zh: string }; start: number; end: number }[] };

test("MIXED confidence is not rendered as SOLID", () => {
  const job = { grounded: true, confidence: "MIXED: some rows only" };
  assert.equal(readConfidence(job), "MIXED");
  assert.equal(showGroundedMark(job), false);
  assert.equal(confidenceLabel("MIXED", "en"), "MIXED");
  assert.equal(confidenceLabel("MIXED", "zh"), "依据不全");
  assert.equal(confidenceLabel("MIXED", "th"), "อ้างอิงปน");
  assert.notEqual(confidenceLabel("MIXED", "en"), confidenceLabel("SOLID", "en"));
  assert.notEqual(confidenceLabel("MIXED", "zh"), "有依据");
});

test("section 36 grounding keeps the statutory exception and refuses an invented code", () => {
  for (const lang of ["th", "en", "zh"] as const) {
    const body = askRequest("ตำรวจค้นบ้านได้ไหม", lang, [36], [
      { number: 36, text: "court order or other grounds as provided by law" },
    ]).question;
    assert.match(body, /other grounds|หรือมีเหตุอย่างอื่น|其他理由/);
    assert.match(body, /Prosecutor's Code|ประมวลอัยการ|检察官法典/);
  }
  const invented = "You may refuse. See the Prosecutor's Code for the procedure.";
  assert.equal(stripFabricatedSources(invented).includes("Prosecutor"), false);
  const dropped = "No court order means you can refuse.";
  const restored = keepStatutoryExceptions(dropped, "en", [36]);
  assert.match(restored, /other grounds as provided by law/);
  assert.equal(keepStatutoryExceptions(restored, "en", [36]), restored);
  const quoted = quotesInAnswerLanguage("The clause says เว้นแต่มีคำสั่งหรือหมายของศาล.", "en", [
    "except by a court order or warrant, or where there are other grounds as provided by law",
  ]);
  assert.equal(/[\u0E00-\u0E7F]/.test(quoted), false);
  assert.match(quoted, /other grounds as provided by law/);
  const shaped = shapeAskAnswer(
    "ไม่มีหมายศาลจึงปฏิเสธได้ ตามประมวลอัยการ เว้นแต่ บุคคลย่อมมีเสรีภาพ",
    "en",
    [36],
    ["except by a court order or warrant, or where there are other grounds as provided by law"],
  );
  assert.match(shaped, /other grounds as provided by law/);
  assert.equal(shaped.includes("ประมวลอัยการ"), false);
  assert.equal(/[\u0E00-\u0E7F]/.test(shaped), false);
});

test("one Ask attempt stays inside 75 seconds and a retry stays inside three minutes", () => {
  const budget = pollSteps().reduce((sum, delay) => sum + delay, 0);
  assert.ok(budget <= ATTEMPT_BUDGET_MS);
  assert.ok(budget > 60_000);
  assert.equal(ASK_RETRIES, 1);
  assert.ok((ASK_RETRIES + 1) * ATTEMPT_BUDGET_MS < 180_000);
  const fallback = notebookFallback("zh", [{ number: 36, text: "或法律规定的其他理由" }]);
  assert.equal(fallback.confidence, "MIXED");
  assert.equal(fallback.grounded, false);
  assert.match(fallback.answer, /其他理由/);
  assert.equal(fallback.answer.includes("答案没有回来"), false);
});

test("mnemonics follow the question, not the chapter picture", () => {
  const term = { id: "pm-eight-years", sections: [158] };
  assert.equal(topicFor(term), "pm-term");
  const cue = memoryCueFor(term);
  assert.equal(cue?.image, false);
  assert.equal(cue?.number, "8");
  assert.equal(cue?.number.includes("35"), false);
  const unamendable = bank.find((q) => q.sections.length === 1 && q.sections[0] === 255);
  assert.ok(unamendable);
  assert.equal(topicFor(unamendable!), "unamendable");
  assert.equal(memoryCueFor(unamendable!)?.image, false);
  assert.notEqual(topicFor(unamendable!), "amendment-petition");
  const drill = { id: "drill-3807", sections: [158], prompt: { en: "ministers besides the PM" } };
  assert.equal(topicFor(drill), "cabinet-size");
  const whys = matchingWhys(cases, drill);
  assert.equal(whys.some((entry) => entry.id === "pm-eight-years"), false);
});

test("a re-queued session uses one total for the header and the summary", () => {
  assert.deepEqual(sessionTotals(3, 7), { correct: 3, total: 7 });
  assert.match(sessionSummary(3, 7, "en"), /3 of 7/);
  assert.equal(sessionSummary(3, 7, "en").includes("3 of 5"), false);
});

test("ministerial drills never answer 0 and neighbours are not +1 MP", () => {
  for (let seed = 0; seed < 423; seed++) {
    assert.ok(ministerialRemoval(seed).remove >= 1);
  }
  assert.ok(Math.abs(drillMembership(0).H - drillMembership(1).H) > 1);
  assert.equal(DRILL_COUNT, 4230);
});

test("a fresh profile does not invent a Parliament focus", () => {
  const fresh = analyzeUserLearning(bank, defaultProgress(), {});
  assert.deepEqual(fresh.weakestChapters, []);
  assert.equal(/Parliament|National Assembly|รัฐสภา|国会/.test(fresh.recommendation.en + fresh.recommendation.th + fresh.recommendation.zh), false);
  const progress = defaultProgress();
  const missed = bank.find((q) => q.chapter === 4)!;
  progress.questions[missed.id] = { correct: false, level: 0, due: 0 };
  const profile = analyzeUserLearning(bank, progress, {});
  assert.deepEqual(profile.weakestChapters, [4]);
  assert.match(profile.recommendation.en, /Chapter 4/);
});

test("teaching steps name the item and do not repeat the prompt", () => {
  const [a, b] = bank;
  const left = teachingBodies(a, "en", 1, "section text a");
  const right = teachingBodies(b, "en", 1, "section text b");
  assert.equal(left.length, 10);
  const rightChoice = a.choices[a.answer].en.replace(/[.*+?^${}()|[\]\\]/g, "\\$&").slice(0, 24);
  for (const index of [4, 6, 8, 9]) assert.notEqual(left[index], right[index]);
  assert.match(left[4], new RegExp(String(a.sections[0])));
  assert.match(left[4], /condition in this item/i);
  assert.notEqual(left[5], a.prompt.en);
  assert.match(left[5], /Applied to this item/);
  assert.match(left[5], new RegExp(rightChoice));
  assert.match(left[9], new RegExp(rightChoice));
});

test("paper 28 is filled from the transitory provisions", () => {
  const paper = papers.find((item) => item.number === 28)!;
  const made = makePaper(bank, paper);
  assert.equal(made.length, 25);
  assert.ok(made.filter((q) => q.chapter === 17).length >= 20);
  assert.equal(made.every((q) => q.chapter === 17), true);
});

test("explanations do not end with a doubled period", () => {
  for (const q of bank) {
    assert.equal(q.explanation.en.endsWith(".."), false, q.id);
    assert.equal(q.explanation.zh.endsWith("。。"), false, q.id);
    assert.equal(q.explanation.th.endsWith(".."), false, q.id);
  }
});

test("counts and English nouns agree", () => {
  assert.equal(enNoun(1, "person", "people"), "1 person");
  assert.equal(enNoun(1, "wrong answer", "wrong answers"), "1 wrong answer");
  assert.equal(enNoun(2, "person", "people"), "2 people");
  assert.equal(formatCount(40000), "40,000");
});

test("chapter labels stay in the selected language", () => {
  const first = outline.chapters[0];
  const last = outline.chapters.find((chapter) => chapter.number === 17)!;
  assert.match(chapterPickerLabel("th", first), /^หมวด 1:/);
  assert.match(chapterPickerLabel("th", first), /ม\. 1–5/);
  assert.equal(chapterPickerLabel("th", first).includes("Ch "), false);
  assert.match(chapterPickerLabel("en", first), /^Chapter 1:/);
  assert.match(chapterPickerLabel("en", first), /Sections 1–5/);
  assert.equal(chapterPickerLabel("en", first).includes("ม."), false);
  assert.match(chapterPickerLabel("zh", first), /^第1章:/);
  assert.match(chapterPickerLabel("zh", first), /第1–5条/);
  assert.equal(chapterPickerLabel("zh", last).includes("Ch "), false);
  assert.match(chapterPickerLabel("en", last), /Transitory Provisions/);
  assert.match(chapterPickerLabel("th", last), /บทเฉพาะกาล/);
});

test("the eleven implausible distractors are gone and the answer index is unchanged", () => {
  const banned = [
    ["c14-05", "จับสลาก"],
    ["c14-05", "Lottery"],
    ["c14-05", "Hereditary"],
    ["c16-05", "องค์กรเอกชนต่างชาติ"],
    ["c16-05", "foreign private"],
    ["s074-a", "เจ็ดสิบ"],
    ["s074-a", "seventy"],
    ["s260-b", "จับสลาก"],
    ["s260-b", "lottery"],
    ["c14-04", "ตลอดชีพ"],
    ["c14-04", "for life"],
    ["c03-04", "หกสิบปี"],
    ["c03-04", "sixty"],
    ["s112-a", "เพียงหนึ่งปี"],
    ["s112-a", "only one year"],
    ["s113-a", "ที่นั่งมากที่สุด"],
    ["s128-b", "คณะกรรมการการเลือกตั้ง"],
    ["s128-b", "Election Commission"],
    ["s154-a", "วุฒิสภาก่อน"],
    ["s154-a", "Senate's prior"],
    ["s195-b", "นายกรัฐมนตรีลงนาม"],
    ["s195-b", "Prime Minister signs"],
  ] as const;
  for (const [id, phrase] of banned) {
    const q = bank.find((item) => item.id === id)!;
    const blob = q.choices.map((choice) => `${choice.th} ${choice.en} ${choice.zh}`).join("\n");
    assert.equal(blob.toLowerCase().includes(phrase.toLowerCase()), false, `${id} still has ${phrase}`);
  }
  assert.equal(bank.find((q) => q.id === "c03-04")!.answer, 0);
  assert.equal(bank.find((q) => q.id === "s074-a")!.answer, 1);
  assert.equal(bank.find((q) => q.id === "s112-a")!.answer, 2);
  assert.equal(bank.find((q) => q.id === "s128-b")!.answer, 1);
  assert.equal(bank.find((q) => q.id === "s260-b")!.answer, 1);
});

test("mixed practice no longer uses a biased sort", () => {
  const source = readFileSync(new URL("../lib/adaptive.ts", import.meta.url), "utf8");
  assert.equal(source.includes("Math.random() - 0.5"), false);
  assert.match(source, /fisherYates/);
});
