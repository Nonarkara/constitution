import type { Text } from "./i18n.ts";
import factsData from "../data/facts.json" with { type: "json" };
import cramData from "../data/cram.json" with { type: "json" };
import handlesData from "../data/handles.json" with { type: "json" };
import outlineData from "../data/outline.json" with { type: "json" };

/**
 * The rule catalogue: every number the app teaches, the sections it lives in,
 * and the handle that makes it memorable.
 *
 * The app used to keep two halves that never met. The cram sheet listed the
 * numbers the exam asks about; the memory palace held sixteen rooms, one per
 * chapter, each with a scene and a joke. A learner could see a picture of a
 * chapter and a list of numbers, but nothing joined the two — so the house
 * taught no number at all, and its picture reached one question in ten.
 *
 * This module is the join. A RULE is a number plus the sections it governs
 * plus a handle; a room is the place in the house where the rule lives.
 */
export type RuleKind = "fact" | "time" | "vote" | "trap";

export type Rule = {
  id: string;
  kind: RuleKind;
  /** The sections this rule governs. A rule may span several. */
  sections: number[];
  /** The number itself, in every language. A trap states no number. */
  number: Text | null;
  /** What the rule is about. */
  label: Text;
  /** The rule the number decides. */
  meaning: Text;
  /** The handle: one concrete image to picture the number by. */
  joke: Text;
  /** The words that prove the number, taken from the statute. */
  proof: string;
  /** The room in the house that hosts this rule. */
  chapter: number;
  /** Whether that room has a picture. Chapter 17 is transitional and has none. */
  hasRoom: boolean;
  /** The numbers this rule states, with the units they carry. */
  facts: NumberFact[];
  /** Fractions and word thresholds, which are not numbers on their own. */
  patterns: string[];
};

type Handle = { meaning: Text; joke: Text; match?: string[] };
type Entry = {
  id: string;
  section: number;
  proof: string;
  label: Text;
  value?: Text;
  text?: Text;
};

const handles = handlesData as unknown as Record<string, Handle>;
const outline = outlineData as unknown as {
  chapters: { number: number; start: number; end: number }[];
};

/** The chapter a section belongs to. */
export function chapterOf(section: number): number {
  const found = outline.chapters.find((c) => section >= c.start && section <= c.end);
  return found ? found.number : 0;
}

/**
 * A number that is part of a reference is not a count.
 *
 * "Chapter 15" is a chapter, not fifteen days, and an answer that lists the
 * chapters an amendment must touch must not be read as stating the
 * fifteen-day wait between the second and third readings.
 */
const REFERENCE_LATIN = /\b(chapter|section|article|part|schedule|annex)\s*\d+/gi;
// Thai and Chinese do not separate words with spaces, so a word boundary
// would never match there. "หมวด 15" is a chapter; so is "第15章".
const REFERENCE_LOCAL = /(มาตรา|บท|ตอน|หมวด|ภาค|เอกสาร|第)\s*\d+/g;

const WORD_VALUE: Record<string, number> = {
  one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8,
  nine: 9, ten: 10, eleven: 11, twelve: 12, thirteen: 13, fourteen: 14,
  fifteen: 15, sixteen: 16, seventeen: 17, eighteen: 18, nineteen: 19,
  twenty: 20, thirty: 30, forty: 40, fifty: 50, sixty: 60, seventy: 70,
  eighty: 80, ninety: 90, hundred: 100, thousand: 1000,
};

/**
 * The nouns a number can carry.
 *
 * A number without its unit is ambiguous: five is five percent of the House,
 * or five years, or five judges. A rule about five percent must not fire on
 * an answer that says "five years".
 */
const UNIT: Record<string, string> = {
  "%": "percent",
  percent: "percent",
  day: "days",
  days: "days",
  year: "years",
  years: "years",
  hour: "hours",
  hours: "hours",
  minute: "minutes",
  minutes: "minutes",
  member: "members",
  members: "members",
  mp: "members",
  mps: "members",
  vote: "votes",
  votes: "votes",
  person: "people",
  persons: "people",
  people: "people",
  judge: "judges",
  judges: "judges",
  seat: "seats",
  seats: "seats",
  chamber: "chambers",
  chambers: "chambers",
  time: "times",
  times: "times",
};

/** The words that turn a number into a fraction rather than a count. */
const FRACTION: Record<string, number> = {
  half: 2,
  halves: 2,
  third: 3,
  thirds: 3,
  quarter: 4,
  quarters: 4,
  fifth: 5,
  fifths: 5,
  tenth: 10,
  tenths: 10,
};

export type NumberFact = { value: number; unit: string };

/**
 * Every number a text states, with the unit it carries.
 *
 * "two hundred and fifty" is two hundred and fifty — not fifty. Getting
 * this wrong is how a rule about fifty ends up beside an answer about two
 * hundred and fifty, which is the exact failure the house is meant to avoid.
 *
 * A fraction is not a count. "one third" is not the number one and not the
 * number three, so the numerator is discarded and the fraction itself is
 * left to the rule's own phrase patterns.
 */
function numberFacts(text: string): NumberFact[] {
  const out: NumberFact[] = [];
  // A number that is part of a reference is not a count: "Chapter 15" is a
  // chapter, not fifteen days.
  const withoutReferences = text.replace(REFERENCE_LATIN, " ").replace(REFERENCE_LOCAL, " ");
  const withoutFractions = withoutReferences.replace(/(\d+)\s*\/\s*(\d+)/g, " fraction ");
  const tokens = withoutFractions.toLowerCase().match(/[a-z]+|\d[\d,]*|%/g) ?? [];
  let current = 0;
  let total = 0;
  let inRun = false;
  const flush = (unit: string, keep = true) => {
    if (inRun && keep && current + total > 0) out.push({ value: current + total, unit });
    current = 0;
    total = 0;
    inRun = false;
  };
  for (const token of tokens) {
    if (/^\d/.test(token)) {
      flush("");
      current = Number(token.replace(/,/g, ""));
      inRun = current > 0;
      continue;
    }
    if (token === "and") continue;
    const value = WORD_VALUE[token];
    if (value !== undefined) {
      inRun = true;
      if (value === 100) current = (current || 1) * 100;
      else if (value === 1000) {
        total += (current || 1) * 1000;
        current = 0;
      } else current += value;
      continue;
    }
    if (inRun) {
      // A fraction is not a count, so its numerator is dropped.
      if (FRACTION[token]) flush("", false);
      else flush(UNIT[token] ?? "");
      continue;
    }
  }
  flush("");
  return out;
}

/** The numbers a rule states, with the units they carry. */
function deriveFacts(value: Text | undefined): NumberFact[] {
  if (!value) return [];
  return numberFacts(value.en ?? "");
}

function toRule(entry: Entry, kind: RuleKind): Rule {
  const handle = handles[entry.id];
  const number = entry.value ?? null;
  const chapter = chapterOf(entry.section);
  return {
    id: entry.id,
    kind,
    sections: [entry.section],
    number,
    label: entry.label ?? entry.text ?? { th: "", en: "", zh: "" },
    meaning: handle?.meaning ?? entry.text ?? entry.label,
    joke: handle?.joke ?? entry.label,
    proof: entry.proof,
    chapter,
    hasRoom: chapter >= 1 && chapter <= 16,
    facts: deriveFacts(number ?? undefined),
    patterns: handle?.match ?? [],
  };
}

const facts = factsData as unknown as Entry[];
const cram = cramData as unknown as {
  time: Entry[];
  votes: Entry[];
  traps: Entry[];
};

export const rules: Rule[] = [
  ...facts.map((f) => toRule(f, "fact")),
  ...cram.time.map((f) => toRule(f, "time")),
  ...cram.votes.map((f) => toRule(f, "vote")),
  ...cram.traps.map((f) => toRule(f, "trap")),
];

const byId = new Map(rules.map((r) => [r.id, r]));

/** The rule with this id, if the catalogue knows it. */
export function ruleById(id: string): Rule | undefined {
  return byId.get(id);
}

/** The rules that live in one room of the house. */
export function rulesInChapter(chapter: number): Rule[] {
  return rules.filter((r) => r.chapter === chapter);
}

/**
 * Whether the answer states this rule's number.
 *
 * Numbers are compared as numbers, so a rule about fifty is not satisfied by
 * an answer that says "two hundred and fifty". The unit must agree too: a
 * rule about five percent is not satisfied by "five years". An answer that
 * states the number without naming its unit — "at least 20,000" — is taken
 * at its word, because the section it comes from already narrows it. A rule
 * written without a unit accepts any unit, because it is the rule about the
 * count itself.
 *
 * Fractions and word thresholds — "half", "one third" — are matched as
 * phrases, because they are not numbers at all.
 */
export function statesNumber(rule: Rule, answerText: string): boolean {
  if (!rule.facts.length && !rule.patterns.length) return false;
  const facts = numberFacts(answerText);
  for (const fact of rule.facts) {
    for (const stated of facts) {
      if (stated.value !== fact.value) continue;
      if (!fact.unit || !stated.unit || stated.unit === fact.unit) return true;
    }
  }
  const lowered = answerText.toLowerCase();
  for (const pattern of rule.patterns) {
    if (lowered.includes(pattern.toLowerCase())) return true;
  }
  return false;
}

/** Words that distinguish one rule from another in the same section. */
const STOP = new Set([
  "the", "of", "a", "an", "at", "to", "in", "on", "for", "and", "or", "is", "are",
  "by", "with", "from", "as", "its", "it", "this", "that", "not", "no", "be",
  "first", "second", "third", "1st", "2nd", "3rd", "4th",
]);

/** The ordinals an answer may write in figures, spelled out for comparison. */
const ORDINALS: [RegExp, string][] = [
  [/\b1st\b/gi, "first"],
  [/\b2nd\b/gi, "second"],
  [/\b3rd\b/gi, "third"],
  [/\b4th\b/gi, "fourth"],
  [/\b5th\b/gi, "fifth"],
];

function keywords(text: Text): string[] {
  const words = `${text.en} ${text.th} ${text.zh}`.toLowerCase();
  return words
    .split(/[^\p{L}\p{N}]+/u)
    .filter((w) => w.length > 2 && !STOP.has(w));
}

/** How much of the rule's own vocabulary the question repeats. */
function affinity(rule: Rule, promptText: string): number {
  const lowered = promptText.toLowerCase();
  let hits = 0;
  for (const word of keywords(rule.label)) if (lowered.includes(word)) hits += 1;
  return hits;
}

/**
 * The rule a question turns on.
 *
 * Two tests, and both must pass:
 *
 *   1. The rule's section is among the question's sections. A rule about a
 *      60-day wait in section 136 is not the rule behind a 60-day wait in
 *      section 173.
 *   2. The answer states the rule's number. This is the honest test: a
 *      picture of one rule must never stand beside a question about another.
 *      The app shows its cues only after the learner has answered, so the
 *      answer is known by then.
 *
 * When several rules pass, the one whose own vocabulary the question repeats
 * wins. When none of them is distinguishable, no cue is shown: an absent cue
 * is a small loss, a cue for the wrong rule teaches the wrong thing.
 */
export function ruleFor(
  sections: number[],
  promptText: string,
  answerText: string,
): Rule | null {
  if (!sections.length || !answerText) return null;
  const candidates = rules.filter(
    (r) =>
      (r.facts.length > 0 || r.patterns.length > 0) &&
      r.sections.some((s) => sections.includes(s)) &&
      // Section 256 has TWO separate 15-day waits. This handle is only
      // about moving from the second reading to the third, not the wait
      // after final approval. A number and section cannot distinguish them.
      (r.id !== "t-amend-wait" ||
        /\bsecond\s+reading\b|\b2nd\s+reading\b|\bbefore\s+(?:the\s+)?third\s+reading\b/i.test(promptText)) &&
      statesNumber(r, answerText),
  );
  if (!candidates.length) return null;
  if (candidates.length === 1) return candidates[0];
  let prompt = promptText;
  for (const [pattern, word] of ORDINALS) prompt = prompt.replace(pattern, word);
  const scored = candidates
    .map((r) => ({ rule: r, score: affinity(r, `${prompt} ${answerText}`) }))
    .sort((a, b) => b.score - a.score);
  if (scored[0].score === scored[1].score) return null;
  return scored[0].rule;
}
