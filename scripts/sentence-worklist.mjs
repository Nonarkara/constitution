/**
 * Produce the rewriting work list for the sentence-length gate.
 *
 * For each question that trips the gate, list the exact fields and sentences
 * that are too long, in the three languages, so the rewriting is aimed at
 * named sentences rather than "the whole question".
 */
import { readFileSync, writeFileSync } from "node:fs";

const EN_WORDS = 32;
const ZH_CHARS = 60;

const enSentences = (t) =>
  String(t).split(/(?<=[.!?])\s+/).map((s) => s.trim()).filter(Boolean);
const zhSentences = (t) =>
  String(t).split(/(?<=[。！？；])/).map((s) => s.trim()).filter(Boolean);
const enWords = (s) => s.split(/\s+/).filter(Boolean).length;
const zhChars = (s) => (s.match(/[㐀-鿿]/g) || []).length;

for (const bank of ["data/questions.json", "data/exam-topics.json"]) {
  const data = JSON.parse(readFileSync(bank, "utf8"));
  const list = Array.isArray(data) ? data : (data.questions || []);
  const work = [];
  for (const q of list) {
    const chunks = [];
    if (q.prompt) chunks.push(["prompt", q.prompt]);
    (q.choices || []).forEach((c, i) => chunks.push([`choices[${i}]`, c]));
    if (q.explanation) chunks.push(["explanation", q.explanation]);
    const hits = [];
    for (const [where, field] of chunks) {
      if (!field) continue;
      if (field.en) {
        for (const s of enSentences(field.en)) {
          if (enWords(s) > EN_WORDS) hits.push({ where, lang: "en", words: enWords(s), sentence: s });
        }
      }
      if (field.zh) {
        for (const s of zhSentences(field.zh)) {
          if (zhChars(s) > ZH_CHARS) hits.push({ where, lang: "zh", chars: zhChars(s), sentence: s });
        }
      }
    }
    if (hits.length) {
      work.push({
        id: q.id,
        fields: [...new Set(hits.map((h) => h.where))],
        hits,
        current: Object.fromEntries(
          [...new Set(hits.map((h) => h.where))].map((w) => [
            w,
            Object.fromEntries(
              chunks
                .filter(([cw]) => cw === w)
                .map(([, f]) => [
                  ["th", "en", "zh"].map((l) => [l, f?.[l] ?? null]),
                ])[0],
            ),
          ]),
        ),
      });
    }
  }
  const out = `/tmp/sentence-work-${bank.split("/").pop().replace(".json", "")}.json`;
  writeFileSync(out, JSON.stringify({ bank, limits: { enWords: EN_WORDS, zhChars: ZH_CHARS }, work }, null, 1));
  console.log(`${out}: ${work.length} questions, ${work.reduce((n, w) => n + w.hits.length, 0)} sentences`);
}
