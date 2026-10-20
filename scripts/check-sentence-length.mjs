#!/usr/bin/env node
/**
 * Sentence-length gate for the question banks.
 *
 * The complaint this gate answers: some questions were written as one long
 * compound sentence carrying several ideas at once. "Section 26 requires a
 * rights-restricting law to follow the conditions set in the Constitution;
 * where none are set, it must not violate the rule of law, must not burden or
 * restrict rights beyond what is reasonable, must not affect human dignity,
 * must state the reasons for the restriction, and must apply generally, not to
 * a specific case or person." — fifty-nine words, five ideas, one breath.
 *
 * The reader is a person preparing for a civil service exam. A sentence that
 * carries five ideas at once is a sentence they have to hold in their head
 * before they can start answering. Splitting it into short sentences costs
 * nothing and makes it usable.
 *
 * THE LIMITS, stated rather than hidden:
 *
 *   1. English is measured in words and Chinese in characters, because that is
 *      what those two scripts give you. Thirty-two words is above the whole
 *      tail of normal legal prose and below the run-ons: of 4,399 English
 *      sentences, 3,655 are twenty words or fewer and 3,845 are twenty-six or
 *      fewer, and 155 exceed the limit. Chinese has no spaces, so it is
 *      measured in characters; sixty is above the bulk of the corpus and 55
 *      sentences exceed it.
 *
 *   2. Thai has no sentence-final punctuation, so a Thai *sentence* cannot be
 *      found without guessing. The gate therefore does not measure Thai
 *      sentences. It measures the unbroken stretch — the longest run of
 *      characters between spaces — which is unambiguous, and which is exactly
 *      what a reader feels as "one long sentence with a lot of complex ideas".
 *      A stretch is a violation when it is over sixty characters AND compound
 *      (more than one clause), or when it is over 130 characters outright. See
 *      scripts/thai-text.mjs for the boundary rules and the reason the
 *      single-clause case is exempt: breaking a long formal term would damage
 *      the law.
 *
 * A gate that cannot measure must fail, not pass.
 */
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { thaiViolations, TH_SOFT, TH_HARD } from "./thai-text.mjs";

const EN_WORDS = 32;
const ZH_CHARS = 60;

const BANKS = ["data/questions.json", "data/exam-topics.json"];

/** Split an English passage into sentences. */
const enSentences = (text) =>
  String(text)
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter(Boolean);

/** Split a Chinese passage into sentences. */
const zhSentences = (text) =>
  String(text)
    .split(/(?<=[。！？；])/)
    .map((s) => s.trim())
    .filter(Boolean);

const enWords = (s) => s.split(/\s+/).filter(Boolean).length;
const zhChars = (s) => (s.match(/[㐀-鿿]/g) || []).length;

export async function sentenceViolations(root = process.cwd()) {
  const failures = [];
  let measured = 0;
  for (const bank of BANKS) {
    let data;
    try {
      data = JSON.parse(await readFile(`${root}/${bank}`, "utf8"));
    } catch (e) {
      failures.push(`sentences: cannot read ${bank} — ${e.message}`);
      continue;
    }
    const list = Array.isArray(data) ? data : (data.questions || []);
    if (!list.length) {
      failures.push(`sentences: ${bank} has no questions`);
      continue;
    }
    for (const q of list) {
      const chunks = [];
      if (q.prompt) chunks.push(["prompt", q.prompt]);
      (q.choices || []).forEach((c, i) => chunks.push([`choice${i}`, c]));
      if (q.explanation) chunks.push(["explanation", q.explanation]);
      for (const [where, field] of chunks) {
        if (!field) continue;
        if (field.en) {
          for (const s of enSentences(field.en)) {
            measured++;
            const w = enWords(s);
            if (w > EN_WORDS) {
              failures.push(
                `${bank} ${q.id} [${where}/en] ${w} words (limit ${EN_WORDS}): ${s.slice(0, 110)}`,
              );
            }
          }
        }
        if (field.zh) {
          for (const s of zhSentences(field.zh)) {
            measured++;
            const n = zhChars(s);
            if (n > ZH_CHARS) {
              failures.push(
                `${bank} ${q.id} [${where}/zh] ${n} characters (limit ${ZH_CHARS}): ${s.slice(0, 60)}`,
              );
            }
          }
        }
        if (field.th) {
          for (const v of thaiViolations(field.th)) {
            measured++;
            failures.push(
              `${bank} ${q.id} [${where}/th] ${v.run.length} characters, ` +
                `${v.clauses} clause(s) (${v.why} limit): ${v.run.slice(0, 80)}`,
            );
          }
        }
      }
    }
  }
  return { failures, measured };
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const { failures, measured } = await sentenceViolations();
  if (!measured) {
    console.error("\nFAIL — the sentence gate measured nothing. Nothing was verified.\n");
    process.exit(1);
  }
  if (failures.length) {
    console.error(`\nFAIL — ${failures.length} over-long passage(s):\n`);
    for (const f of failures.slice(0, 40)) console.error(`  ✗ ${f}`);
    if (failures.length > 40) console.error(`  … ${failures.length - 40} more`);
    console.error(
      "\n  Chop it. One idea per sentence, and no sentence longer than " +
        `${EN_WORDS} words (${ZH_CHARS} Chinese characters, ` +
        `${TH_SOFT} characters per Thai clause group, ${TH_HARD} outright).\n`,
    );
    process.exit(1);
  }
  console.log(
    `  · sentences: ${measured} passages measured — every one under ${EN_WORDS} words ` +
      `(${ZH_CHARS} Chinese characters, ${TH_SOFT}-char Thai clause groups)`,
  );
}
