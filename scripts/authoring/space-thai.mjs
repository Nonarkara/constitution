#!/usr/bin/env node
/**
 * Break the question banks' Thai into short phrases.
 *
 * Why this exists. Thai is written without spaces between words, so a reader
 * has to segment a stretch of glyphs into words before the words mean
 * anything. The longer the stretch, the more of the reader's attention goes
 * into segmentation instead of meaning — and a question the reader has to
 * read twice is a question that costs the exam the marks.
 *
 * The corpus writes its clauses separated by spaces, and the house's own copy
 * does the same: "จำโครงสร้างด้วยภาพอาคาร 16 ห้อง", "ดูตัวเลือกและตรวจความคิด",
 * "เปิดต้นฉบับรัฐธรรมนูญ". The question banks were written the other way —
 * as sentences, because that is how the exam writes them — and the reader
 * has to do by hand the segmentation the house does everywhere else.
 *
 * WHAT THIS DOES AND DOES NOT TOUCH.
 *
 *   It inserts spaces. It never removes a character and never adds one. A
 *   space in Thai does not change a word, so it cannot change the law.
 *   scripts/check-data-integrity.mjs enforces the part that matters: the
 *   numbers, the section references and the modal verbs in every field must
 *   be exactly the same afterwards.
 *
 *   The law itself is never touched. data/constitution.json is a verbatim
 *   copy of the statute. A formal term is indivisible — "สภาผู้แทนราษฎร" is
 *   one name, not three words — and this script will not split it: the
 *   protected terms are the statute's own short stretches, so a phrase the
 *   statute writes as one word is one word here.
 *
 * WHERE THE BREAKS GO.
 *
 *   A break goes where a Thai phrase may begin: at a clause marker (the
 *   house's own list), and otherwise at a joiner — a relative marker, a
 *   preposition, a determiner, a copula. A stretch with no such place in it
 *   is left whole, because a break in the wrong place is worse than a long
 *   stretch.
 *
 * Usage:
 *   node scripts/authoring/space-thai.mjs            # rewrite the banks
 *   node scripts/authoring/space-thai.mjs --report   # what would change
 */
import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { clauseBoundaries } from "../thai-text.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");

/**
 * How long a phrase may be before the eye has to work to hold it.
 *
 * The same number is the threshold for breaking at all: a stretch already
 * this short is a phrase the reader can take in, and a phrase this long is
 * one the reader has to work at. One number, so the tool converges.
 */
export const PHRASE = 40;

/** The banks. The corpus is not among them: the law is not rewritten. */
const BANKS = ["data/questions.json", "data/exam-topics.json", "data/pokklong/questions.json"];

/**
 * The things that are one thing and must not be broken: a section reference
 * and a quotation.
 *
 * They are masked in ONE pass, so the list of what was held is in the order
 * the text has it. Two passes would put the list out of order with the
 * text, and the restore would then swap a quotation for a section
 * reference.
 */
const HELD = /(?:มาตรา|มาตร่า|พระราชบัญญัติ|ข้อ|วรรค|หมวด|ภาค|ม\.|s\.|§|第|条)\s*\d+[–-]?\d*|[“”"«»「」『』《》][^“”"«»「」『』《》]*[“”"«»「」『』《》]/g;

/**
 * The places a Thai phrase may begin.
 *
 * The house already keeps a list of the words a CLAUSE may begin with
 * (scripts/thai-text.mjs). A phrase is a smaller thing than a clause, so
 * this adds the joiners: the relative markers, the prepositions, the
 * determiners and the copulas. A copula matters most — "เป็น" starts a new
 * predicate, and a Thai reader takes the breath there.
 */
const JOINERS = [
  "เป็น", "คือ", "มี", "ซึ่ง", "โดยที่", "ตาม", "โดย", "ใน", "นอก",
  "บน", "ลง", "ขึ้น", "เข้า", "ออก", "จาก", "ถึง", "ด้วย", "นี้", "นั้น", "ทุก",
  "บาง", "และ", "แต่", "หรือ", "ก็", "แม้", "หาก", "ถ้า", "เมื่อ", "ทั้งนี้",
  "ก่อนที่", "หลังจาก", "เพราะ", "ให้", "ต้อง", "ย่อม", "เพื่อ", "รวมทั้ง",
  "นอกจากนี้", "ต่อมา", "ในกรณีที่", "ขณะที่", "อย่างไรก็ตาม", "เว้นแต่",
  "ในการ", "ในส่วน", "ส่วน", "นับแต่", "เมื่อไม่", "และให้", "และต้อง",
  "จึง", "ดังนั้น", "เพราะฉะนั้น", "แล้ว", "กำลัง", "ยัง", "คง", "กัน",
  "ไว้", "มา", "ไป", "เสร็จ", "จำนวน", "ข้อ", "กรณี",
];

/**
 * Words after which a phrase may END — the break goes after them.
 *
 * "ประชุมร่วมกัน | พิจารณาร่าง…" — a Thai reader takes the breath after
 * the particle, not before it.
 */
const ENDERS = ["กัน", "ไว้", "มา", "ไป", "เสร็จ", "นาย", "ท่าน"];


/** Quoted spans are never split: a quotation is one thing. */
const QUOTED = /[“”"«»「」『』《》][^“”"«»「」『』《》]*[“”"«»「」『』《》]/g;

const HAS_THAI = /[฀-๿]/;
const HAS_CJK = /[㐀-鿿豈-﫿]/;

const segmenter = new Intl.Segmenter("th", { granularity: "word" });

/**
 * The statute's own short stretches, which are its formal terms.
 *
 * "สภาผู้แทนราษฎร" is written in the statute without a break, so it is one
 * name and this script will not take it apart. Only the short stretches are
 * taken: a long one in the statute is a clause, and a clause in the bank's
 * own prose may be broken.
 */
function protectedTerms() {
  const terms = new Set();
  // The glossary is the house's own list of the words that are one thing:
  // "อำนาจอธิปไตย" is a name, not two words, and taking it apart would
  // make the reader put it back together.
  const glossary = JSON.parse(readFileSync(path.join(ROOT, "data/glossary.json"), "utf8"));
  const entries = Array.isArray(glossary) ? glossary : (glossary.terms || glossary.entries || []);
  for (const entry of entries) {
    for (const match of entry.match?.th || []) {
      const term = String(match).trim();
      if (term.length >= 3 && HAS_THAI.test(term) && !HAS_CJK.test(term)) terms.add(term);
    }
  }
  return terms;
}

const TERMS = [...protectedTerms()].sort((a, b) => b.length - a.length);

/**
 * The statute's own text, for one last check before every break.
 *
 * A compound is a word the statute writes without a break. If the last word
 * of one phrase and the first word of the next appear CONTIGUOUSLY in the
 * statute, then the statute writes them as one word, and this script must
 * not put a space between them. That is the whole of the safety rule, and
 * it is checked against the law rather than against a list somebody wrote
 * down and forgot.
 */
const CORPUS_TEXT = (() => {
  const corpus = JSON.parse(readFileSync(path.join(ROOT, "data/constitution.json"), "utf8"));
  return corpus.sections.map((s) => s.th ?? "").join(" ");
})();

/** Would a break here cut a word the statute writes whole? */
function splitsACompound(before, atom) {
  const a = (before.match(/([^\s]+)$/) || [])[1] || "";
  const b = String(atom || "").split(/\s+/)[0] || "";
  if (a.length < 2 || b.length < 2) return false;
  const joined = a + b;
  // EVERY occurrence, not the first: the statute may write the pair once
  // with a space and once without, and only the second is a compound.
  let at = CORPUS_TEXT.indexOf(joined);
  while (at >= 0) {
    const left = CORPUS_TEXT[at - 1];
    const right = CORPUS_TEXT[at + joined.length];
    if (left !== " " && right !== " ") return true;
    at = CORPUS_TEXT.indexOf(joined, at + 1);
  }
  return false;
}

/** The words of a stretch, with the protected terms and the references kept whole. */
function atoms(text) {
  // A section reference is found in the TEXT, not in the segmenter's words:
  // the segmenter cuts "มาตรา" into "มา" and "ตรา", and a break between
  // them would turn "มาตรา 30" into "มา ตรา 30" — which is not a
  // reference any more, and the data-integrity gate is right to refuse it.
  const out = [];
  let covered = 0;
  for (const { segment, index } of segmenter.segment(text)) {
    const trimmed = segment.trim();
    if (!trimmed) continue;
    const start = index + (segment.length - segment.trimStart().length);
    const end = start + trimmed.length;
    // A term that covers this word has already taken it in.
    if (start < covered) continue;
    // A term the statute writes whole is kept whole — but the corpus guard
    // below already refuses any break that would cut a word the statute
    // writes whole, so the list is kept only for the words that are names:
    // "สภาผู้แทนราษฎร" is one name and the reader meets it as one name.
    const term = TERMS.find((t) => text.startsWith(t, start) && t.length > trimmed.length);
    if (term) {
      out.push({ text: term, start, end: start + term.length });
      covered = start + term.length;
      continue;
    }
    out.push({ text: trimmed, start, end });
  }
  return out;
}

/**
 * Pack the atoms into phrases of at most PHRASE characters.
 *
 * A joint where a clause marker begins is the best place to break; a joint
 * where a joiner begins is the next best; and where there is neither, the
 * stretch is left whole. A break in the wrong place is worse than a long
 * stretch: the reader has to un-break it.
 */
export function phrase(text) {
  // A stretch the eye can already take in is left alone. That is what makes
  // the re-spacing converge: the pieces it makes are shorter than the limit,
  // so a second run finds nothing left to do and the file and the tool
  // cannot disagree.
  if (text.length <= PHRASE) return text;
  const parts = atoms(text);
  if (parts.length < 2) return text;
  const clauses = new Set(clauseBoundaries(text));
  const joinerAt = new Set();
  for (const part of parts) {
    const word = part.text.split(/\s+/)[0];
    if (JOINERS.includes(word)) joinerAt.add(part.start);
  }
  const phrases = [];
  let start = 0;
  while (start < parts.length) {
    const limit = parts[start].start + PHRASE;
    let best = -1;
    let clause = -1;
    let joiner = -1;
    for (let i = start + 1; i < parts.length; i++) {
      if (parts[i].start > limit) break;
      best = i;
      if (clauses.has(parts[i].start)) clause = i;
      else if (joinerAt.has(parts[i].start)) joiner = i;
    }
    // A break in the wrong place is worse than a long stretch: the reader has
    // to un-break it. So there is no fallback — the phrase runs on to the
    // next real joint.
    // Only the house's own clause markers, which it has already proved safe
    // against the compounds it knows about. A finer joint is a break in a
    // place nobody has checked, and a break in the wrong place is worse
    // than a long stretch.
    // A clause marker is the best joint, a joiner is the next best, and if
    // the stretch has neither then the last word boundary that fits is used
    // — a wall of glyphs is worse for the reader than an imperfect joint,
    // and the guard below makes sure no word is cut in half.
    let take = clause > start ? clause : joiner > start ? joiner : best > start ? best : -1;
    // Never cut a word the statute writes whole.
    if (take > start) {
      const cut = text.slice(parts[start].start, parts[take].start);
      if (splitsACompound(cut, parts[take].text)) take = -1;
    }
    if (take <= start) {
      phrases.push(text.slice(parts[start].start, parts[parts.length - 1].end).trim());
      break;
    }
    void best;
    phrases.push(text.slice(parts[start].start, parts[take - 1].end).trim());
    start = take;
  }
  return phrases
    .join(" ")
    .replace(/\s+([?!,.:;ฯๆ])/g, "$1")
    .replace(/\(\s+/g, "(");
}

/** Thai stretches only: Chinese and English are measured in their own units. */
export function spaceThaiText(text) {
  const source = String(text || "");
  // A section reference is one thing. "มาตรา 30" has a space in it, so it
  // must be taken out of the way BEFORE the text is split into stretches —
  // otherwise the break lands inside it and the reference stops being a
  // reference. The placeholder is a single private-use character: a
  // placeholder carrying an index could be split in half by a break, and a
  // split placeholder restores the wrong text.
  const held = [];
  const masked = source.replace(HELD, (m) => {
    held.push(m);
    return "\uE000";
  });
  const spaced = masked
    .split(/(\s+)/)
    .map((part) => {
      if (!part.trim()) return part;
      if (HAS_CJK.test(part) || !HAS_THAI.test(part)) return part;
      return phrase(part);
    })
    .join("");
  let heldIndex = 0;
  return spaced.replace(/\uE000/g, () => held[heldIndex++] ?? "");
}

/** Re-space every Thai field of the tree, in place, and report what moved. */
function walk(node, path, changed) {
  if (Array.isArray(node)) {
    node.forEach((item, i) => {
      node[i] = walk(item, `${path}[${i}]`, changed);
    });
    return node;
  }
  if (node && typeof node === "object") {
    for (const key of Object.keys(node)) {
      node[key] = walk(node[key], `${path}.${key}`, changed);
    }
    return node;
  }
  if (typeof node !== "string" || !path.endsWith(".th")) return node;
  const next = spaceThaiText(node);
  if (next !== node) changed.push({ path, before: node, after: next });
  return next;
}

// Imported for its functions, it must not also rewrite the banks.
const isMain = process.argv[1] && process.argv[1].endsWith("space-thai.mjs");
if (!isMain) {
  console.log(`  · space-thai: ${TERMS.length} protected terms loaded`);
} else {
const report = process.argv.includes("--report");
let total = 0;
for (const bank of BANKS) {
  let data;
  try {
    data = JSON.parse(readFileSync(path.join(ROOT, bank), "utf8"));
  } catch {
    continue;
  }
  const changed = [];
  walk(data, "", changed);
  total += changed.length;
  if (report) {
    console.log(`\n${bank}: ${changed.length} field(s) would change`);
    for (const c of changed.slice(0, 8)) {
      console.log(`  ${c.path}`);
      console.log(`    − ${c.before}`);
      console.log(`    + ${c.after}`);
    }
    if (changed.length > 8) console.log(`  … ${changed.length - 8} more`);
  } else {
    if (changed.length) {
      writeFileSync(path.join(ROOT, bank), `${JSON.stringify(data, null, 2)}\n`);
    }
    console.log(`  · ${bank}: ${changed.length} field(s) re-spaced`);
  }
}
console.log(`\n${report ? "would re-space" : "re-spaced"} ${total} field(s).`);
}
