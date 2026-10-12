import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import {
  askRequest,
  consentCopy,
  friendlyAskError,
  groundedLabel,
  presentAnswer,
  readGrounded,
  showGroundedMark,
  studyDisclaimer,
} from "../lib/ask.ts";
import { quoteFrame, quoteStartsClean } from "../lib/quotes.ts";
import { NON_RIGHTS, groupedRights } from "../lib/rights.ts";
import { chapterPuzzles } from "../lib/puzzles.ts";
import { choiceLetter, fisherYates, mixedPracticeQueue } from "../lib/shuffle.ts";
import { sessionSummary } from "../lib/session.ts";
import { formatDuration } from "../lib/playback.ts";

const read = (path: string) =>
  JSON.parse(readFileSync(new URL("../data/" + path, import.meta.url), "utf8"));
const cases = read("cases.json") as {
  id: string;
  chapter: number;
  quotes: { section: number; th: string; en: string; zh: string }[];
  why: { th: string; en: string; zh: string };
}[];
const questions = read("questions.json") as {
  id: string;
  hook?: { th: string; en: string; zh: string };
}[];
const corpusRaw = readFileSync(new URL("../data/constitution.json", import.meta.url), "utf8");
const corpus = JSON.parse(corpusRaw);
const diagram = readFileSync(new URL("../components/RuleDiagram.tsx", import.meta.url), "utf8");

test("ask sends a plain tone and never the direct voice", () => {
  const body = askRequest("ตำรวจค้นบ้านได้ไหม", "th", [33, 36]);
  assert.equal(body.tone, "plain");
  assert.equal("intensity" in body, false);
  assert.equal(body.language, "th");
  assert.deepEqual(body.constitution, [33, 36]);
  assert.match(consentCopy("en"), /Saved forever for study by Non-Laws/);
  assert.match(consentCopy("th"), /บันทึกไว้เพื่อการศึกษาโดย Non-Laws/);
  assert.match(studyDisclaimer("zh"), /并非法律意见/);
  assert.equal(groundedLabel("th"), "อ้างอิงได้");
  assert.equal(groundedLabel("en"), "SOLID");
});

test("provider failures stay in the learner's language", () => {
  const kinds = [
    "offline",
    "unreachable",
    "rate",
    "refused",
    "unavailable",
    "invalid",
    "server",
    "lost",
    "timeout",
  ] as const;
  for (const kind of kinds)
    for (const lang of ["th", "en", "zh"] as const) {
      const text = friendlyAskError(kind, lang);
      assert.doesNotMatch(text, /429|openrouter|rate-limit|gemma|groq|gpt-oss/i);
      assert.ok(text.trim().length > 8);
    }
});

test("SOLID appears only when the answer is grounded, and bare markers are stripped", () => {
  assert.equal(showGroundedMark({ grounded: true }), true);
  assert.equal(showGroundedMark({ grounded: false }), false);
  assert.equal(showGroundedMark({}), false);
  assert.equal(showGroundedMark(null), false);
  assert.equal(readGrounded({ final: { grounded: true } }), true);
  assert.equal(readGrounded({ grounded: false, final: { grounded: false } }), false);
  const bare = presentAnswer("The house is closed [1]. See also [2].", []);
  assert.equal(bare.sources.length, 0);
  assert.doesNotMatch(bare.text, /\[\d+\]/);
  const cited = presentAnswer("The house is closed [1].", [
    { title: "Constitution s.33", url: "https://example.test/33" },
  ]);
  assert.match(cited.text, /\[1\]/);
  assert.deepEqual(cited.sources, [
    { n: 1, title: "Constitution s.33", url: "https://example.test/33" },
  ]);
});

test("choice order is an unbiased shuffle and letters follow the language", () => {
  const picks = [0.5, 0];
  let i = 0;
  assert.deepEqual(
    fisherYates([0, 1, 2], () => picks[i++]),
    [2, 0, 1],
  );
  const counts = new Map<string, number>();
  for (let a = 0; a < 3; a++) {
    for (let b = 0; b < 2; b++) {
      const steps = [a / 3 + 1e-6, b / 2 + 1e-6];
      let k = 0;
      const out = fisherYates(["x", "y", "z"], () => steps[k++]);
      counts.set(out.join(""), (counts.get(out.join("")) ?? 0) + 1);
    }
  }
  assert.equal(counts.size, 6);
  for (const n of counts.values()) assert.equal(n, 1);
  assert.deepEqual(
    ["th", "en", "zh"].map((lang) => [0, 1, 2, 3].map((n) => choiceLetter(lang as "th", n))),
    [
      ["ก", "ข", "ค", "ง"],
      ["A", "B", "C", "D"],
      ["1", "2", "3", "4"],
    ],
  );
  const mixed = mixedPracticeQueue([1, 2, 3, 4], 2, () => 0);
  assert.equal(mixed.length, 2);
  assert.ok(mixed.every((n) => [1, 2, 3, 4].includes(n)));
});

test("a perfect round does not ask the learner to try again", () => {
  for (const lang of ["th", "en", "zh"] as const) {
    assert.doesNotMatch(sessionSummary(3, 3, lang), /try again|ลองใหม่|再试/i);
    assert.match(sessionSummary(3, 3, lang), /3/);
  }
  assert.match(sessionSummary(2, 3, "en"), /Read the explanations/);
});

test("audio length stays blank until the file reports a real duration", () => {
  assert.equal(formatDuration(0), null);
  assert.equal(formatDuration(Number.NaN), null);
  assert.equal(formatDuration(-1), null);
  assert.equal(formatDuration(65), "1:05");
});

test("quotes are whole clauses, with the rule itself, and a translation beside Thai", () => {
  const byId = new Map(cases.map((item) => [item.id, item]));
  const take = (id: string) => {
    const item = byId.get(id);
    if (!item) throw new Error(id);
    return item;
  };
  const home = take("home-search").quotes[0].th;
  assert.match(home, /จะกระทำมิได้ เว้นแต่มีคำสั่งหรือหมายของศาล/);
  const school = take("free-schooling").quotes[0].th;
  assert.match(school, /โดยไม่เก็บค่าใช้จ่าย/);
  assert.match(school, /ตั้งแต่ก่อนวัยเรียน/);
  const supreme = take("supreme-law").quotes[0].th;
  assert.match(supreme, /ขัดหรือแย้ง/);
  assert.match(supreme, /ใช้บังคับมิได้/);
  assert.match(take("unamendable-core").quotes[0].th, /^การแก้ไขเพิ่มเติม/);
  assert.match(take("equal-treatment").quotes[1].th, /^มาตรการที่รัฐกำหนดขึ้น/);
  assert.match(take("phone-messages").quotes[0].th, /^การตรวจ/);
  assert.match(take("independent-prosecutors").quotes[1].th, /มาตรการดังกล่าวต้องกำหนดให้ชัดแจ้ง/);
  assert.match(take("senate-pm-window").quotes[0].th, /การให้ความเห็นชอบ/);
  assert.doesNotMatch(take("independent-judges").why.th, /258|๒๕๘/);
  assert.doesNotMatch(take("independent-judges").why.en, /258/);
  for (const item of cases) {
    assert.match(diagram, new RegExp(`(?:${item.id}|["']${item.id}["'])\\s*:`));
    for (const quote of item.quotes) {
      const full = corpus.sections[quote.section - 1].th as string;
      assert.ok(full.includes(quote.th), item.id);
      assert.equal(quoteStartsClean(quote.th), true, item.id + " " + quote.th.slice(0, 24));
      assert.ok(quote.en.trim().length > 8, item.id);
      assert.ok(quote.zh.trim().length > 4, item.id);
      assert.match(quoteFrame(full, quote.th), /^…?“/);
      assert.match(quoteFrame(full, quote.th), /”…?$/);
    }
  }
});

test("the rights shelf is a life index, and every puzzle is still on the path", () => {
  const groups = groupedRights(cases);
  const shelf = groups.flatMap((group) => group.items.map((row) => row.item.id));
  assert.deepEqual(
    groups.flatMap((group) => group.items.map((row) => row.n)),
    shelf.map((_, i) => i + 1),
  );
  for (const id of NON_RIGHTS) assert.equal(shelf.includes(id), false);
  const ids = cases.map((item) => item.id);
  for (const id of ids)
    assert.equal(shelf.includes(id) || (NON_RIGHTS as readonly string[]).includes(id), true);
  const seen = new Set<string>();
  for (const chapter of new Set(cases.map((item) => item.chapter))) {
    for (const item of chapterPuzzles(cases, chapter)) {
      assert.equal(seen.has(item.id), false);
      seen.add(item.id);
    }
  }
  assert.equal(seen.size, cases.length);
});

test("memorisation traps have a hook, and joke answers are gone", () => {
  const jokes = [
    "Yes, only on holidays",
    "Sell a vote if nobody sees",
    "By inheritance",
    "Colonial expansion",
    "Yes, but only on Sundays",
  ];
  const blob = JSON.stringify(questions);
  for (const joke of jokes) assert.equal(blob.includes(joke), false);
  for (const id of ["c05-01", "c07-02", "c08-02", "c11-04", "c15-02", "c17-02"]) {
    const item = questions.find((q) => q.id === id);
    assert.ok(item?.hook?.th && item.hook.en && item.hook.zh, id);
  }
  const spaced = [
    "แบบบัญชี รายชื่อ",
    "จำนวน ห้าร้อยคน",
    "ตั้งแต่ ก่อนวัยเรียน",
    "การให้ ความเห็นชอบ",
    "ใช้บังคับ มิได้",
  ];
  for (const phrase of spaced) assert.equal(corpusRaw.includes(phrase), false, phrase);
});
