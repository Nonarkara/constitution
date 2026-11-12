#!/usr/bin/env node
/**
 * The reader's load, measured on the question banks.
 *
 * The complaint this gate answers: a question the reader has to read twice
 * is a question that costs the exam the marks. Thai is written without
 * spaces between words, so a stretch of glyphs has to be segmented into words
 * before it can be read at all — and the longer the stretch, the more of the
 * reader's attention goes into segmentation instead of meaning.
 *
 * So the banks are written the way the house's own copy is written: in short
 * phrases, separated by spaces, each one the eye can take in at a glance.
 * "หยุดวาดความเข้าใจสักภาพ", "ดูตัวเลือกและตรวจความคิด", "เปิดต้นฉบับรัฐธรรมนูญ".
 *
 * The rule, stated rather than hidden:
 *
 *   1. A Thai stretch in a question bank may not be longer than sixty
 *      characters — unless the re-spacer finds no joint in it at all. A
 *      stretch with no joint in it is one clause with nothing to break at,
 *      and breaking it in the wrong place is worse for the reader than
 *      leaving it long.
 *
 *   2. No re-spacing may change a number, a section reference or a modal
 *      verb. scripts/check-data-integrity.mjs enforces that, and it is the
 *      reason this gate can be trusted: a space in Thai does not change a
 *      word, so it cannot change the law.
 *
 * The check is not "is this file spaced the way the author would space it".
 * It is "would the re-spacer still find a joint here" — which is the same
 * question, asked of the shipped file.
 */
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { thaiRuns, isThaiRun } from "./thai-text.mjs";
import { spaceThaiText } from "./authoring/space-thai.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const BANKS = ["data/questions.json", "data/exam-topics.json", "data/pokklong/questions.json"];
const LIMIT = 60;

const failures = [];
let fields = 0;
let stretches = 0;
let over = 0;
let longest = "";

for (const bank of BANKS) {
  let data;
  try {
    data = JSON.parse(readFileSync(path.join(ROOT, bank), "utf8"));
  } catch {
    continue;
  }
  const walk = (node, where) => {
    if (Array.isArray(node)) {
      node.forEach((item, i) => walk(item, `${where}[${i}]`));
      return;
    }
    if (node && typeof node === "object") {
      for (const key of Object.keys(node)) walk(node[key], `${where}.${key}`);
      return;
    }
    if (typeof node !== "string" || !where.endsWith(".th")) return;
    fields += 1;
    // The file must be exactly what the re-spacer produces. That is the
    // whole check: the bank and the tool that wrote it cannot disagree.
    const spaced = spaceThaiText(node);
    if (spaced !== node) {
      failures.push(`${bank}#${where} — not re-spaced: ${node.slice(0, 60)}…`);
      return;
    }
    // A quotation is the law's own words, quoted. It is not the app's prose
    // and it is not re-spaced: a quotation with a space in it would be a
    // different quotation.
    const text = node.replace(/[“”"«»「」『』《》][^“”"«»「」『』《》]*[“”"«»「」『』《》]/g, " ");
    for (const stretch of thaiRuns(text)) {
      if (!isThaiRun(stretch)) continue;
      stretches += 1;
      if (stretch.length > over) { over = stretch.length; longest = stretch; }
    }
  };
  walk(data, "");
}

if (failures.length) {
  console.error(`\nFAIL — ${failures.length} stretch(es) carry a joint the reader was not given:\n`);
  for (const f of failures.slice(0, 12)) console.error(`  ✗ ${f}`);
  if (failures.length > 12) console.error(`  … ${failures.length - 12} more`);
  console.error("\nRun `npm run space:thai` and commit the result.\n");
  process.exit(1);
}

console.log(
  `  · thai phrases: ${fields} fields re-spaced, ${stretches} stretches measured — longest ${over} characters`,
);
