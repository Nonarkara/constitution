/**
 * Measuring Thai.
 *
 * Thai has no sentence-final punctuation. This corpus writes clauses separated
 * by spaces, so there is no way to tell a sentence boundary from a clause
 * boundary without guessing — and a metric built on guessed boundaries is a
 * metric nobody can trust.
 *
 * So the gate does not measure Thai *sentences*. It measures something that is
 * unambiguous and that a reader actually feels: the unbroken stretch, i.e. the
 * longest run of characters between spaces. A 146-character stretch with no
 * anchor in the middle is what "a long sentence with a lot of complex ideas"
 * looks like on the page.
 *
 * Two rules, and the reason for each:
 *
 *   1. SOFT (60 characters). A stretch longer than this is a violation only if
 *      it also contains a clause boundary — a conjunction or an enumerated list
 *      marker. That means it is genuinely compound: several ideas with no
 *      anchor between them. Splitting it costs nothing and the reader wins.
 *
 *   2. HARD (130 characters). A stretch this long is a violation whatever it
 *      contains, because at this length the reader has lost the thread. The
 *      cap is set above the longest formal term in the corpus (the longest
 *      indivisible stretch measured is 115 characters), so it never asks for a
 *      word to be broken that should stay whole.
 *
 * The rule that was deliberately NOT written: "every stretch under N
 * characters". That rule fires on long formal terms — "ตามประเพณีการปกครอง
 * ประเทศไทยในระบอบประชาธิปไตยอันมีพระมหากษัตริย์ทรงเป็นประมุข" — and
 * the only way to satisfy it would be to damage the law.
 */

/** Words that begin a clause in Thai. A space before one of these is correct Thai. */
export const CLAUSE_STARTERS = [
  "จึง",
  "ดังนั้น",
  "แต่",
  "และ",
  "หรือ",
  "โดย",
  "ซึ่ง",
  "หาก",
  "ถ้า",
  "เมื่อ",
  "ทั้งนี้",
  "ก่อนที่",
  "หลังจาก",
  "เพราะ",
  "ให้",
  "ต้อง",
  "ย่อม",
  "เพื่อ",
  "รวมทั้ง",
  "นอกจากนี้",
  "ต่อมา",
  "ในกรณีที่",
  "ขณะที่",
  "อย่างไรก็ตาม",
  "เว้นแต่",
  "โดยการ",
  "โดยที่",
  "ในการ",
  "ในส่วน",
  "ส่วน",
  "นับแต่",
  "เมื่อไม่",
  "และให้",
  "และต้อง",
  "หากแต่",
];

/** Enumerated list markers: (๑) (๒) … and 1) 2) … */
const LIST_MARKER = /[()]*[๐-๙0-9][)๐-๙\]]/g;

/**
 * Words in which a clause marker is really part of a longer word.
 *
 * "แต่งตั้ง" contains "แต่"; "ถูกต้อง" contains "ต้อง"; "มหากษัตริย์" contains
 * "หาก". A detector that treats those as clause boundaries will ask for a word
 * to be cut in half, and the only way to satisfy it is to damage the law.
 * These are masked out before the markers are looked for.
 *
 * "ตั้งแต่" is in this list for a different, sharper reason: it is one word
 * meaning "since", and splitting it at the marker turns it into "ตั้ง" (to
 * set up) plus "แต่" (but) — which inverts the sense of the sentence. It
 * appears 29 times in the corpus, so the detector reaches it constantly.
 *
 * The list is deliberately short. A marker that merely STARTS a compound is
 * still a boundary — "โดยการเกิด" splits before "โดย" — so only markers that
 * sit INSIDE a word are trapped.
 *
 * Words that are NOT trapped, and why: "มีแต่" (there is only) and
 * "เพียงแต่" (only) also contain "แต่", but in those the "แต่" really is the
 * conjunction, and splitting them reads correctly — "มี" | "แต่ประมวลกฎหมาย"
 * is "there is" | "only the law-processing". Trapping them would remove a
 * legitimate split point, so they stay untrapped.
 */
const COMPOUND_TRAPS = [
  "มหากษัตริย์",
  "แต่งตั้ง",
  "ความต้องการ",
  "ถูกต้อง",
  "ตั้งแต่",
];

export const TH_SOFT = 60;
export const TH_HARD = 130;

/** Split Thai text into its unbroken stretches (the corpus separates clauses by spaces). */
export const thaiRuns = (text) =>
  String(text || "")
    .split(/\s+/)
    .map((s) => s.trim())
    .filter(Boolean);

/**
 * Thai script, and the CJK block it must not be mixed with.
 *
 * A run is a Thai run only if it contains Thai AND no Chinese ideographs.
 * Presence of Thai alone is not enough: a Chinese explanation that quotes one
 * Thai term (ทบวงการเมือง) would otherwise be measured as one enormous Thai
 * stretch, and the Chinese measurement would be skipped entirely.
 */
const HAS_THAI = /[\u0E00-\u0E7F]/;
const HAS_CJK = /[\u3400-\u9FFF\uF900-\uFAFF]/;
const isThaiRun = (s) => HAS_THAI.test(s) && !HAS_CJK.test(s);

/** Is this stretch Thai text, rather than Chinese or English that merely quotes a Thai term? */
export { isThaiRun };

/** Blank out compound traps, keeping every index the same. */
function maskTraps(run) {
  let masked = run;
  for (const trap of COMPOUND_TRAPS) {
    let i = masked.indexOf(trap);
    while (i >= 0) {
      // A same-length placeholder, so every later index still points at the
      // same character of the original run. Deleting the characters instead
      // would shift every boundary after it.
      masked =
        masked.slice(0, i) + "_".repeat(trap.length) + masked.slice(i + trap.length);
      i = masked.indexOf(trap, i + trap.length);
    }
  }
  return masked;
}

/**
 * Positions inside a stretch where a clause begins. 0 is excluded: a marker at
 * the very start is the start of the stretch, not a boundary inside it.
 *
 * Longest marker wins. "นับแต่" is a connector; the "แต่" inside it is not a
 * second boundary. Where a longer marker matches, any shorter marker found
 * inside its span is dropped.
 */
export function clauseBoundaries(run) {
  const masked = maskTraps(run);
  /** @type {{pos:number, len:number}[]} */
  const hits = [];
  for (const w of CLAUSE_STARTERS) {
    let i = masked.indexOf(w);
    while (i > 0) {
      hits.push({ pos: i, len: w.length });
      i = masked.indexOf(w, i + 1);
    }
  }
  hits.sort((a, b) => b.len - a.len || a.pos - b.pos);
  const kept = [];
  for (const h of hits) {
    const covered = kept.some(
      (k) => h.pos >= k.pos && h.pos + h.len <= k.pos + k.len,
    );
    if (!covered) kept.push(h);
  }
  const marks = kept.map((k) => k.pos);
  for (const m of run.matchAll(LIST_MARKER)) {
    if (m.index > 0) marks.push(m.index);
  }
  return [...new Set(marks)].sort((a, b) => a - b);
}

/** Split a stretch into its clauses at every boundary. */
export function splitAtClauses(run) {
  const marks = clauseBoundaries(run);
  if (!marks.length) return [run];
  const out = [];
  let start = 0;
  for (const m of marks) {
    if (m > start) out.push(run.slice(start, m));
    start = m;
  }
  out.push(run.slice(start));
  return out.filter(Boolean);
}

/**
 * Is this stretch a violation?
 *   - compound and over-long (more than one clause, over the soft limit), or
 *   - over the hard limit, whatever it contains.
 */
export function isViolation(run) {
  if (run.length > TH_HARD) return { why: "hard", clauses: splitAtClauses(run).length };
  if (run.length <= TH_SOFT) return null;
  const clauses = splitAtClauses(run).length;
  if (clauses > 1) return { why: "compound", clauses };
  return null;
}

/** Every violating stretch in a Thai passage. */
export function thaiViolations(text) {
  const out = [];
  for (const run of thaiRuns(text)) {
    // Chinese and English text can be passed here by mistake — a Chinese
    // explanation with no spaces is one enormous "run" and would be measured
    // as a Thai one. Only a run that is actually Thai is a Thai run.
    if (!isThaiRun(run)) continue;
    const v = isViolation(run);
    if (v) out.push({ run, ...v });
  }
  return out;
}

/**
 * Compound words that have been broken by a space.
 *
 * The rewriting is meant to insert spaces at CLAUSE boundaries. A space in the
 * middle of a word is not a shorter sentence — it is a typo. This is the exact
 * opposite of the trap list above: a trap must never be treated as a
 * boundary, and a word that contains a trap must never be split.
 *
 * Detected exactly: the word appears in the passage with its spaces removed,
 * but no single stretch contains it. If it was cut, it was cut.
 */
export function thaiBrokenWords(text) {
  const runs = thaiRuns(text);
  const flat = runs.join("");
  const broken = [];
  for (const trap of COMPOUND_TRAPS) {
    if (!flat.includes(trap)) continue;
    if (runs.some((r) => r.includes(trap))) continue;
    broken.push(trap);
  }
  return broken;
}
