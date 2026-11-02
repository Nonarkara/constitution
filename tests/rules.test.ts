import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { rules, ruleById, ruleFor, statesNumber } from "../lib/rules.ts";
import { memoryCueFor } from "../lib/cues.ts";

const read = (p: string) => JSON.parse(readFileSync(new URL("../data/" + p, import.meta.url), "utf8"));
const questions = read("questions.json");
const topics = read("exam-topics.json");

const allText = (q: { prompt?: Record<string, string> }) =>
  `${q.prompt?.th ?? ""} ${q.prompt?.en ?? ""} ${q.prompt?.zh ?? ""}`;
const answerText = (q: { choices?: { en?: string }[]; answer?: number }) =>
  q.choices?.[q.answer ?? -1]?.en ?? "";

type Question = (typeof questions)[number];
type Topic = (typeof topics)[number];

/** The questions whose answer states a number — the ones the exam traps on. */
function countQuestions(bank: Question[]) {
  const bareCitation = (q: Question) =>
    /^section\s+\d+\s*\.?$/i.test((q.choices[q.answer]?.en ?? "").trim());
  return bank.filter(
    (q) => q.choices?.[q.answer] && /\d/.test(q.choices[q.answer].en ?? "") && !bareCitation(q),
  );
}

const LANGS = ["th", "en", "zh"] as const;

test("the wait after final approval is not the wait before the third reading", () => {
  const q = questions.find((q: Question) => q.id === "civic-06");
  assert.ok(q);
  assert.notEqual(ruleFor(q.sections, allText(q), answerText(q))?.id, "t-amend-wait");
  assert.equal(memoryCueFor(q), null);
  assert.equal(ruleFor([256], "How long after the second reading before the third reading?", "15 days")?.id, "t-amend-wait");
});

test("every rule in the catalogue carries a handle in all three languages", () => {
  assert.ok(rules.length >= 80, `only ${rules.length} rules in the catalogue`);
  for (const rule of rules) {
    for (const lang of LANGS) {
      assert.ok(rule.meaning?.[lang], `${rule.id} meaning.${lang}`);
      assert.ok(rule.joke?.[lang], `${rule.id} joke.${lang}`);
      assert.ok(rule.label?.[lang], `${rule.id} label.${lang}`);
    }
  }
});

test("every rule's number is proved by the statute, and its room is a real room", () => {
  const corpus = read("constitution.json");
  const oaccp = read("sources/oaccp.json");
  for (const rule of rules) {
    if (rule.kind === "trap") continue;
    assert.ok(rule.proof, `${rule.id} has no proof`);
    if (rule.chapter >= 1 && rule.chapter <= 17) {
      const text = corpus.sections[rule.sections[0] - 1]?.th ?? "";
      const fromAct = rule.sections[0] === 213 ? oaccp.sections["48(1)"]?.th ?? "" : "";
      assert.ok(
        text.includes(rule.proof) || fromAct.includes(rule.proof),
        `${rule.id}: "${rule.proof}" is not in section ${rule.sections[0]}`,
      );
    }
    assert.ok(rule.chapter >= 1 && rule.chapter <= 17, `${rule.id} is in no chapter`);
    assert.equal(rule.hasRoom, rule.chapter >= 1 && rule.chapter <= 16);
  }
});

test("no cue is shown unless the answer states that rule's number", () => {
  // The house's one hard rule: a picture of one rule must never stand beside
  // a question about another. Every cue the app would show is checked here
  // against the question it would be shown next to.
  let cued = 0;
  for (const q of questions) {
    const cue = memoryCueFor({
      id: q.id,
      chapter: q.chapter,
      sections: q.sections,
      prompt: q.prompt,
      choices: q.choices,
      answer: q.answer,
    });
    if (!cue || !cue.topic.startsWith("rule-")) continue;
    cued += 1;
    const rule = ruleById(cue.topic.slice("rule-".length));
    assert.ok(rule, `${q.id}: cue names an unknown rule ${cue.topic}`);
    assert.ok(
      rule!.sections.some((s) => q.sections.includes(s)),
      `${q.id}: ${rule!.id} governs ${rule!.sections} but the question cites ${q.sections}`,
    );
    assert.ok(
      statesNumber(rule!, answerText(q)),
      `${q.id}: the cue is ${rule!.id} but the answer does not state its number`,
    );
  }
  assert.ok(cued >= 60, `only ${cued} questions reach a rule cue`);
});

test("the house reaches the numbers the exam traps on", () => {
  const counts = countQuestions(questions);
  const reached = counts.filter((q) => {
    const rule = ruleFor(q.sections, allText(q), answerText(q));
    return Boolean(rule);
  });
  const share = reached.length / counts.length;
  // Before the rule catalogue, eight of these seventy-five had a picture.
  assert.ok(
    share >= 0.75,
    `only ${reached.length} of ${counts.length} count-answers reach a rule (${(share * 100).toFixed(1)}%)`,
  );
});

test("a number the rule does not teach is not read as the rule's number", () => {
  // "five years" must not satisfy a rule about five percent, and "Chapter 15"
  // must not satisfy a rule about a fifteen-day wait.
  const percent = ruleById("pm-nominate-5")!;
  assert.ok(!statesNumber(percent, "No; section 272 limited it to five years from the first Parliament"));
  const readings = ruleById("t-amend-wait")!;
  assert.ok(!statesNumber(readings, "Chapter 1, Chapter 2, Chapter 15, or independent organ qualifications"));
  const judges = ruleById("court-composition")!;
  assert.ok(!statesNumber(judges, "Two years"));
  // "two hundred and fifty" is two hundred and fifty, not fifty.
  const senate = ruleById("first-senate-250")!;
  const ncpo = ruleById("ncpo-50")!;
  const answer = "Two hundred and fifty persons (250 members)";
  assert.ok(statesNumber(senate, answer), "the 250 rule should match two hundred and fifty");
  assert.ok(!statesNumber(ncpo, answer), "the 50 rule must not match two hundred and fifty");
});

test("every number the cram sheet shows has a handle", () => {
  const facts = read("facts.json");
  const cram = read("cram.json");
  const listed = [...facts, ...cram.time, ...cram.votes];
  for (const entry of listed) {
    const rule = ruleById(entry.id);
    assert.ok(rule, `${entry.id} is on the cram sheet but has no rule`);
    for (const lang of LANGS) assert.ok(rule!.joke[lang], `${entry.id} joke.${lang}`);
  }
});

test("the rule catalogue is the build's output, not an edited copy", () => {
  // The catalogue is generated. A hand-edited copy is a catalogue that lies
  // about what the build would produce, which is worse than no catalogue.
  const built = read("handles.json");
  assert.equal(Object.keys(built).length, rules.length);
  for (const rule of rules) {
    assert.ok(built[rule.id], `${rule.id} is missing from the built handles`);
    assert.equal(built[rule.id].joke.en, rule.joke.en);
    assert.equal(built[rule.id].meaning.en, rule.meaning.en);
  }
});

test("the district exam topics still carry a rule where one applies", () => {
  // The ninety district topics are a second bank. They are mostly conceptual,
  // so few of them turn on a number — but the ones that do must not be missed.
  let cued = 0;
  for (const q of topics as Topic[]) {
    const rule = ruleFor(q.sections, allText(q), answerText(q));
    if (!rule) continue;
    cued += 1;
    assert.ok(
      rule.sections.some((s) => q.sections.includes(s)),
      `${q.id}: ${rule.id} governs ${rule.sections} but the question cites ${q.sections}`,
    );
    assert.ok(statesNumber(rule, answerText(q)), `${q.id}: the answer does not state ${rule.id}'s number`);
  }
  assert.ok(cued >= 1, "no district topic reaches a rule");
});
