#!/usr/bin/env node
/**
 * The data-integrity gate: no legal fact may be lost when a question is edited.
 *
 * Why this exists. The round that chopped long questions into short ones
 * promised that "no legal fact, number, date or section reference can be
 * lost". The promise was made as a WHITESPACE-ONLY guarantee: the rewrite
 * could only insert spaces, so every character was still there. That
 * guarantee turned out to be false — 221 fields across the three languages
 * were genuinely rewritten, and 5 Thai fields were reworded. Two independent
 * reviewers found it. The rewrites were checked and none of them lost a
 * number, a date or a section reference, but a promise that cannot be
 * enforced is a promise that cannot be trusted.
 *
 * So this gate enforces the part of the promise that actually matters, and
 * enforces it forever, in every future edit:
 *
 *   For every field of every question, the multiset of
 *     - the numbers it contains,
 *     - the section references it contains (มาตรา N, s.65, 第N条), and
 *     - the modal verbs it contains (must, shall, may, should, cannot,
 *       ต้อง, อาจ, ควร, ห้าม)
 *   is the same as it was when this baseline was written.
 *
 * A fact is not a word, so paraphrasing a question is free. Changing "มาตรา
 * 172" to "มาตรา 173", or turning "must" into "may", fails the gate and names
 * the field. That is the whole point: the diff of the baseline is the review
 * surface. A pull request that changes a number has to change the baseline
 * too, and the reviewer sees exactly which fact moved.
 *
 * Fields with no numbers, no section references and no modal verbs have no
 * fact to protect, so they are not in the baseline. They are still measured
 * — a field that HAD facts and now has none fails, because the baseline has
 * an entry for it and the current signature is empty.
 *
 * Usage:
 *   node scripts/check-data-integrity.mjs            # check
 *   node scripts/check-data-integrity.mjs --update   # rewrite the baseline
 */
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { bankChunks } from "./bank-fields.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const BASELINE = path.join(ROOT, "data", "fact-baseline.json");
const BANKS = ["data/questions.json", "data/exam-topics.json"];

/**
 * The modal verbs of each language, and how to find them.
 *
 * English and Chinese are found by whole word / whole string, which is exact.
 *
 * Thai is different. JavaScript's `\b` is defined by `\w`, which is
 * [A-Za-z0-9_] — Thai characters are not word characters, so `\bต้อง\b`
 * cannot match "ต้อง" inside "ต้องโอนหุ้น", which is where a modal verb
 * almost always is. The detector therefore counts Thai modals as SUBSTRINGS
 * of the space-separated tokens.
 *
 * That over-counts on purpose. "รัฐอาจ" (a state project), "อาจารย์" (a
 * lecturer) and "สมควร" (reasonable) contain "อาจ" and "ควร" without being
 * modals. Over-counting is safe for a CHANGE gate: a false positive means a
 * stable count that stays stable, while a false negative — a real
 * obligation quietly weakened — is what the gate exists to catch.
 */
const MODALS = {
  en: /\b(?:must|shall|may|should|cannot|can't|need to|has to)\b/gi,
  zh: /必须|应当|不得|可以|須|须/g,
  th: /ต้อง|อาจ|ควร|ห้าม|ย่อม/g,
};

/** Numbers, section references and modal verbs — the things a fact is made of. */
export function factSignature(text, lang = "en") {
  const s = String(text || "");
  const numbers = (s.match(/\d+(?:[.,]\d+)*/g) || []).sort();
  const sections = (s.match(/(?:มาตรา|มาตร่า|ss?\.?|sections?\s*|第)\s*\d+(?:\s*[-–—]\s*\d+)?/g) || [])
    .map((x) => x.replace(/\s+/g, ""))
    .sort();
  const re = MODALS[lang];
  const modals = re ? (s.match(re) || []).map((x) => x.toLowerCase()).sort() : [];
  return { numbers, sections, modals };
}

const key = (file, index, id, field, lang) => `${file}#${index}#${id}#${field}.${lang}`;

/** Every field of every bank, with its fact signature. */
export function currentFacts() {
  const out = {};
  for (const file of BANKS) {
    const data = JSON.parse(readFileSync(path.join(ROOT, file), "utf8"));
    data.forEach((q, index) => {
      for (const [name, obj] of bankChunks(q)) {
        for (const lang of ["th", "en", "zh"]) {
          if (!obj[lang]) continue;
          const f = factSignature(obj[lang], lang);
          if (!f.numbers.length && !f.sections.length && !f.modals.length) continue;
          out[key(file, index, q.id, name, lang)] = {
            numbers: f.numbers,
            sections: f.sections,
            modals: f.modals,
          };
        }
      }
    });
  }
  return out;
}

function diff(a, b) {
  const lines = [];
  const lost = (x, y) => y.filter((v) => !x.includes(v));
  for (const k of ["numbers", "sections", "modals"]) {
    const gone = lost(a[k] || [], b[k] || []);
    const added = lost(b[k] || [], a[k] || []);
    if (gone.length) lines.push(`${k} lost: ${gone.join(", ")}`);
    if (added.length) lines.push(`${k} added: ${added.join(", ")}`);
  }
  return lines;
}

export function checkDataIntegrity(root = ROOT) {
  const baselinePath = path.join(root, "data", "fact-baseline.json");
  let baseline;
  try {
    baseline = JSON.parse(readFileSync(baselinePath, "utf8"));
  } catch (e) {
    return { failures: [`data-integrity: cannot read data/fact-baseline.json — ${e.message}`] };
  }
  const current = currentFacts();
  const failures = [];
  for (const [k, was] of Object.entries(baseline)) {
    const now = current[k];
    if (!now) {
      failures.push(`data-integrity: ${k} no longer has any fact to protect — it was ${JSON.stringify(was)}`);
      continue;
    }
    const d = diff(was, now);
    if (d.length) failures.push(`data-integrity: ${k} — ${d.join("; ")}`);
  }
  for (const k of Object.keys(current)) {
    if (!(k in baseline)) {
      failures.push(
        `data-integrity: ${k} is new and carries facts — add it to data/fact-baseline.json`,
      );
    }
  }
  return { failures, fields: Object.keys(baseline).length };
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  if (process.argv.includes("--update")) {
    const facts = currentFacts();
    const body = JSON.stringify(facts, null, 0).replace(/\},\{/g, "},\n{");
    writeFileSync(BASELINE, body + "\n");
    console.log(`  · data-integrity: baseline written — ${Object.keys(facts).length} fields carry a fact`);
  } else {
    const { failures, fields } = checkDataIntegrity();
    if (failures.length) {
      console.error(`\nFAIL — ${failures.length} fact change(s):\n`);
      for (const f of failures.slice(0, 30)) console.error(`  ✗ ${f}`);
      if (failures.length > 30) console.error(`  … ${failures.length - 30} more`);
      console.error(
        "\n  A number, a section reference or a modal verb moved. If that was deliberate,\n" +
          "  run: node scripts/check-data-integrity.mjs --update\n",
      );
      process.exit(1);
    }
    console.log(`  · data-integrity: ${fields} fields carry a fact — every number, section reference and modal verb unchanged`);
  }
}
