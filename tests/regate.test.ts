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
  answerMatchesUi,
  citeAsSection,
  dropUnsafeRefusals,
  shapeAskAnswer,
  showGroundedMark,
  stripFabricatedSources,
  wrongLanguageResult,
} from "../lib/ask.ts";
import { analyzeUserLearning } from "../lib/adaptive.ts";
import { buildMixedSession } from "../lib/mixed.ts";
import { topicFor, memoryCueFor, matchingWhys } from "../lib/cues.ts";
import { ministerialRemoval, drillMembership, DRILL_COUNT } from "../lib/drills.ts";
import { enNoun, formatCount } from "../lib/grammar.ts";
import { chapterPickerLabel } from "../lib/i18n.ts";
import { defaultProgress, type Question } from "../lib/learning.ts";
import { makePaper, papers } from "../lib/papers.ts";
import { sessionCounter, sessionSummary, sessionTotals } from "../lib/session.ts";
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
  assert.deepEqual(sessionCounter(4, 5, 0), { n: 5, total: 5 });
  assert.deepEqual(sessionCounter(5, 5, 2), { n: 1, total: 2 });
  assert.notEqual(sessionCounter(5, 5, 2).total, 10);
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

test("teaching steps quote the rule, name the trap, and do not repeat the explanation", () => {
  const [a, b] = bank;
  const left = teachingBodies(a, "en", 1, "section text a");
  const right = teachingBodies(b, "en", 1, "section text b");
  assert.equal(left.length, 3);
  assert.match(left[0], /section text a/);
  assert.match(left[0], new RegExp(`section ${a.sections[0]}`, "i"));
  assert.match(left[1], /fails this item/);
  assert.match(left[2], /If the fact were/);
  assert.notEqual(left[1], right[1]);
  for (const step of left) {
    assert.notEqual(step.trim(), a.choices[a.answer].en.trim());
    assert.equal(step.includes(a.explanation.en), false);
    assert.notEqual(step, a.prompt.en);
  }
});

test("paper 28 balances transitory coverage with the blueprint chapters", () => {
  const paper = papers.find((item) => item.number === 28)!;
  const made = makePaper(bank, paper);
  const transitory = made.filter((q) => q.chapter === 17).length;
  assert.equal(made.length, 25);
  assert.deepEqual(paper.chapters, [1, 7, 8, 15, 17]);
  assert.deepEqual(paper.core, [17]);
  assert.ok(transitory >= 8, `transitory count ${transitory}`);
  assert.ok(transitory < made.length);
  for (const chapter of paper.chapters) {
    assert.ok(made.some((q) => q.chapter === chapter), `missing chapter ${chapter}`);
  }
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
  assert.match(chapterPickerLabel("th", first), /^หมวด 1 —/);
  assert.match(chapterPickerLabel("th", first), /ม\. 1–5/);
  assert.equal(chapterPickerLabel("th", first).includes("Ch "), false);
  assert.match(chapterPickerLabel("en", first), /^Chapter 1 —/);
  assert.match(chapterPickerLabel("en", first), /Sections 1–5/);
  assert.equal(chapterPickerLabel("en", first).includes("ม."), false);
  assert.match(chapterPickerLabel("zh", first), /^第1章 —/);
  assert.match(chapterPickerLabel("zh", first), /第1–5条/);
  assert.equal(chapterPickerLabel("zh", last).includes("Ch "), false);
  assert.match(chapterPickerLabel("en", last), /Transitory Provisions/);
  assert.match(chapterPickerLabel("th", last), /บทเฉพาะกาล/);
  const single = outline.chapters.find((chapter) => chapter.start === chapter.end)!;
  assert.match(chapterPickerLabel("en", single), /Section 50\)/);
  assert.equal(chapterPickerLabel("en", single).includes("Sections 50–50"), false);
  assert.match(chapterPickerLabel("th", single), /ม\. 50\)/);
  assert.match(chapterPickerLabel("zh", single), /第50条\)/);
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
  for (const [id, phrase] of [
    ["comp-10", "economically beneficial"],
    ["comp-10", "nationwide referendum"],
    ["c17-01", "minister count"],
    ["c17-01", "constituency MP count"],
  ] as const) {
    const q = bank.find((item) => item.id === id)!;
    const blob = q.choices.map((choice) => `${choice.th} ${choice.en} ${choice.zh}`).join("\n");
    assert.equal(blob.toLowerCase().includes(phrase.toLowerCase()), false, `${id} still has ${phrase}`);
    assert.equal(q.answer, 0);
  }
  assert.match(bank.find((q) => q.id === "comp-10")!.choices[1].en, /essential substance/);
  assert.match(bank.find((q) => q.id === "c17-01")!.choices[2].en, /section 107/);
});

test("a search answer never says the person may refuse, and it cites a section", () => {
  const unsafe = "You may refuse a search without a court order. Officials have no authority to search. Article 36 is the rule.";
  const cleaned = dropUnsafeRefusals(unsafe);
  assert.equal(/may refuse|no authority to search/i.test(cleaned), false);
  const shaped = shapeAskAnswer(unsafe, "en", [36], ["or other grounds as provided by law"]);
  assert.equal(/may refuse|no authority to search/i.test(shaped), false);
  assert.equal(shaped.includes("Article"), false);
  assert.match(shaped, /Section/);
  assert.match(shaped, /other grounds as provided by law/);
  assert.equal(citeAsSection("See Article 33 and Articles 36.", "en"), "See Section 33 and Sections 36.");
  assert.equal(citeAsSection("This article is the rule.", "en"), "This section is the rule.");
  const rawEn = "The reason is that this article bars disclosure. “ ”. If there is no provision in the law, the authority is lacking — therefore a request to disclose the communication exceeds their power. You do not have to comply with that request.";
  const shapedEn = shapeAskAnswer(rawEn, "en", [36], []);
  assert.equal(/authority is lacking|exceeds their power|do not have to comply/i.test(shapedEn), false);
  assert.equal(/[“”]\s*[“”]|“\s*”/.test(shapedEn), false);
  assert.equal(/\barticle\b/i.test(shapedEn), false);
  assert.match(shapedEn, /this section bars disclosure/i);
  assert.ok(shapedEn.indexOf("other grounds as provided by law") < shapedEn.toLowerCase().indexOf("this section"));
  const live = shapeAskAnswer(
    "You may refuse the police to examine your messages. Section 36 provides the rule. Therefore you have the right to demand that they show authority, and your constitutional right allows you to refuse until there is a court order.",
    "en",
    [36],
    [],
  );
  assert.equal(/may refuse|allows you to refuse|right to demand|no legal authority/i.test(live), false);
  const authority = shapeAskAnswer(
    "If none of those conditions are met, the police have no legal authority to compel you to reveal the messages.",
    "en",
    [36],
    [],
  );
  assert.equal(/no legal authority/i.test(authority), false);
  const messy = shapeAskAnswer(
    "It shall not be done “.” ** **. If officials do not cite a provision, you have no obligation to cooperate.",
    "en",
    [36],
    [],
  );
  assert.equal(/no obligation|\*\*|“\.”/.test(messy), false);
  const dangling = shapeAskAnswer("It shall not be restricted ”. Section 36 is the rule.", "en", [36], []);
  assert.equal(dangling.includes("”"), false);
  const consent = shapeAskAnswer(
    "The right remains unless there is a court order or another ground in law; you thus have a legal basis to tell the police “I do not consent to inspection”.",
    "en",
    [36],
    [],
  );
  assert.equal(/do not consent|legal basis to tell/i.test(consent), false);
  assert.match(consent, /court order or another ground/);
  const power = shapeAskAnswer(
    "If there is no court order, the authorities have no power to conduct a direct search. **There is no reason to comply.** Section 36 still needs another ground in law.",
    "en",
    [36],
    [],
  );
  assert.equal(/no power to|no reason to comply|\*\*/i.test(power), false);
  assert.match(power, /other grounds as provided by law/);
  assert.match(live, /other grounds as provided by law/);
});

test("a Chinese page does not keep a Thai answer or a SOLID badge", () => {
  const thai = "ตำรวจไม่มีอำนาจค้นบ้านถ้าไม่มีหมายศาล และคุณปฏิเสธได้";
  assert.equal(answerMatchesUi(thai, "zh"), false);
  assert.equal(answerMatchesUi(thai, "th"), true);
  assert.equal(answerMatchesUi("第36条禁止检查通信，除非有法院命令或法律规定的其他理由。", "zh"), true);
  const honest = wrongLanguageResult("zh", [{ number: 36, text: "或法律规定的其他理由" }]);
  assert.equal(honest.confidence, null);
  assert.equal(honest.grounded, false);
  assert.equal(honest.answer.includes("有依据"), false);
  assert.match(honest.answer, /语言/);
  assert.equal(/[\u0E00-\u0E7F]/.test(honest.answer), false);
  const rawZh = "您可以拒绝——根据宪法第36条…“将不得进行 เว้นแต่มีคำสั่งหรือหมายของศาล หรือมีเหตุอย่างอื่นตามที่กฎหมายบัญญัติ”…未持法院令而扣押信息仍然违反第36条…并予以拒绝。";
  assert.equal(answerMatchesUi(rawZh, "zh"), true);
  assert.equal(answerMatchesUi(rawZh, "en"), false);
});

test("the mixed session folds review, drills and recall into one queue", () => {
  const progress = defaultProgress();
  const due = bank[0];
  progress.questions[due.id] = { correct: false, level: 0, due: 0 };
  const known = bank[1];
  progress.questions[known.id] = { correct: true, level: 2, due: Date.now() + 86_400_000 };
  const mixed = buildMixedSession(bank, progress, Date.now());
  assert.ok(mixed.length >= 5 && mixed.length <= 12);
  assert.equal(mixed[0].id, due.id);
  assert.ok(mixed.some((item) => item.id.startsWith("drill-")));
  assert.ok(mixed.some((item) => item.id === known.id));
  const fresh = buildMixedSession(bank, defaultProgress(), Date.now());
  assert.ok(fresh[0].chapter === 1 || fresh[0].chapter === 2);
  assert.equal(fresh[0].id.startsWith("drill-"), false);
  assert.equal(fresh.slice(0, 5).filter((item) => item.id.startsWith("drill-")).length, 1);
});

test("mixed practice no longer uses a biased sort", () => {
  const source = readFileSync(new URL("../lib/adaptive.ts", import.meta.url), "utf8");
  assert.equal(source.includes("Math.random() - 0.5"), false);
  assert.match(source, /fisherYates/);
});
