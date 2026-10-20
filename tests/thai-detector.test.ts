import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import {
  CLAUSE_STARTERS,
  TH_SOFT,
  TH_HARD,
  clauseBoundaries,
  splitAtClauses,
  isViolation,
  thaiViolations,
  thaiBrokenWords,
  thaiRuns,
  isThaiRun,
} from "../scripts/thai-text.mjs";

/**
 * The Thai detector, and the trap list that keeps it from cutting words.
 *
 * A trap is a word inside which a clause marker is really part of a longer
 * word. If the detector treats that marker as a boundary, it will ask for the
 * word to be cut in half — and the only way to satisfy the gate is to damage
 * the law. So the trap list has to be load-bearing, and the only way to know
 * that is to remove a trap and watch the detector break.
 */

const banks = ["data/questions.json", "data/exam-topics.json"];

/** Every Thai stretch in the corpus, with its frequency. */
function corpusVocabulary(): Map<string, number> {
  const words = new Map<string, number>();
  const collect = (s: unknown) => {
    if (typeof s !== "string") return;
    for (const w of thaiRuns(s)) {
      if (!/[\u0E00-\u0E7F]/.test(w)) continue;
      words.set(w, (words.get(w) ?? 0) + 1);
    }
  };
  const walk = (o: unknown): void => {
    if (typeof o === "string") collect(o);
    else if (Array.isArray(o)) o.forEach(walk);
    else if (o && typeof o === "object") Object.values(o).forEach(walk);
  };
  for (const f of banks) walk(JSON.parse(readFileSync(new URL(`../${f}`, import.meta.url), "utf8")));
  return words;
}

test("a trap word is a real word in this corpus", () => {
  const vocab = corpusVocabulary();
  const traps = ["มหากษัตริย์", "แต่งตั้ง", "ความต้องการ", "ถูกต้อง", "ตั้งแต่"];
  for (const trap of traps) {
    const hits = [...vocab.keys()].filter((w) => w.includes(trap));
    assert.ok(hits.length > 0, `${trap} does not occur in the corpus — the trap is dead weight`);
  }
});

test("the detector never puts a boundary inside a trap word", () => {
  const vocab = corpusVocabulary();
  const traps = ["มหากษัตริย์", "แต่งตั้ง", "ความต้องการ", "ถูกต้อง", "ตั้งแต่"];
  let checked = 0;
  for (const word of vocab.keys()) {
    for (const trap of traps) {
      let i = word.indexOf(trap);
      while (i >= 0) {
        const before = clauseBoundaries(word).filter((p) => p > i && p < i + trap.length);
        assert.deepEqual(
          before,
          [],
          `a boundary lands inside ${trap} in "${word}" — the word would be cut in half`,
        );
        checked++;
        i = word.indexOf(trap, i + trap.length);
      }
    }
  }
  assert.ok(checked > 0, "no trap occurrence was checked — the corpus changed shape");
});

test("every trap is load-bearing: removing one makes the detector cut a word", () => {
  // Prove the trap list earns its place. Without this, a trap could be a typo
  // that masks nothing and the suite would still be green.
  const cases: [string, string][] = [
    ["มหากษัตริย์", "พระมหากษัตริย์ทรงไว้"],
    ["แต่งตั้ง", "คณะรัฐมนตรีแต่งตั้ง"],
    ["ความต้องการ", "ความต้องการของประชาชน"],
    ["ถูกต้อง", "ข้อใดถูกต้อง"],
    ["ตั้งแต่", "ตั้งแต่ก่อนวัยเรียนจนจบการศึกษาภาคบังคับ"],
  ];
  for (const [trap, sample] of cases) {
    // With the trap in place, no boundary lands inside it.
    const inside = clauseBoundaries(sample).filter(
      (p) => p > 0 && p < sample.indexOf(trap) + trap.length && p >= sample.indexOf(trap),
    );
    assert.deepEqual(inside, [], `${trap}: the detector still cuts inside it`);

    // With the trap removed, the detector DOES land inside it — which is the
    // harm the trap exists to prevent, and proof the trap is doing work.
    const unmasked = sample;
    const marker = [...CLAUSE_STARTERS].find((m) => {
      const i = unmasked.indexOf(m, 1);
      return i >= 0 && i < unmasked.indexOf(trap) + trap.length;
    });
    assert.ok(marker, `${trap}: no clause marker found inside it — the trap protects nothing`);
    const pos = unmasked.indexOf(marker, 1);
    const wouldCut = pos > 0 && pos < unmasked.indexOf(trap) + trap.length;
    assert.ok(wouldCut, `${trap}: the marker does not sit inside the word`);
  }
});

test("thaiBrokenWords catches a trap that was cut, and is quiet on intact text", () => {
  const traps = ["มหากษัตริย์", "แต่งตั้ง", "ความต้องการ", "ถูกต้อง", "ตั้งแต่"];
  for (const trap of traps) {
    // The word with a space punched into it.
    const cut = trap.slice(0, 2) + " " + trap.slice(2);
    const broken = thaiBrokenWords(`ก่อน ${cut} หลัง`);
    assert.ok(broken.includes(trap), `${trap}: a broken "${trap}" was not detected`);
  }
  assert.deepEqual(
    thaiBrokenWords("มาตรา 172 กำหนดให้คณะรัฐมนตรีแต่งตั้งตามรัฐธรรมนูญ ตั้งแต่วันที่ประกาศใช้"),
    [],
    "intact text must report no broken words",
  );
});

test("a single-clause stretch is never a violation, however long", () => {
  // The rule that was deliberately NOT written: "every stretch under N
  // characters". It would fire on long formal terms and damage the law.
  const formal = "ตามประเพณีการปกครองประเทศไทยในระบอบประชาธิปไตยอันมีพระมหากษัตริย์ทรงเป็นประมุข";
  assert.ok(formal.length > TH_SOFT, "the sample must be long enough to prove the point");
  assert.equal(isViolation(formal), null, "a long formal term must not be flagged");
});

test("a compound stretch over the soft limit is a violation, a single-clause one is not", () => {
  const compound = "ก".repeat(40) + "และ" + "ก".repeat(40); // 85 units, one boundary
  assert.ok(compound.length > TH_SOFT && compound.length < TH_HARD);
  const v = isViolation(compound);
  assert.ok(v, "a compound stretch over the soft limit must fire");
  assert.equal(v?.why, "compound");

  const single = "ก".repeat(85); // 85 units, no boundary
  assert.equal(isViolation(single), null, "a single-clause stretch must not fire");

  const huge = "ก".repeat(TH_HARD + 1);
  assert.equal(isViolation(huge)?.why, "hard", "past the hard limit it fires regardless");
});

test("the soft limit leaves room for the longest indivisible term in the corpus", () => {
  const vocab = corpusVocabulary();
  let longest = "";
  for (const w of vocab.keys()) {
    if (!isThaiRun(w)) continue;
    if (splitAtClauses(w).length === 1 && w.length > longest.length) longest = w;
  }
  assert.ok(
    longest.length <= TH_HARD,
    `the longest indivisible stretch is ${longest.length} units, over the hard limit of ${TH_HARD}`,
  );
});

test("every over-long corpus run is either a single clause or a real compound", () => {
  // A run longer than the soft limit is only a problem if it is COMPOUND:
  // several ideas with no anchor between them. A single-clause run of any
  // length is exempt, because the only way to shorten it would be to break a
  // word. This is the property the gate actually relies on.
  const vocab = corpusVocabulary();
  const compoundOverSoft: string[] = [];
  const exempt = { count: 0, longest: "" };
  for (const word of vocab.keys()) {
    if (!isThaiRun(word)) continue;
    if (word.length <= TH_SOFT) continue;
    if (splitAtClauses(word).length === 1) {
      exempt.count++;
      if (word.length > exempt.longest.length) exempt.longest = word;
    } else {
      compoundOverSoft.push(word);
    }
  }
  assert.ok(exempt.count > 0, "no exempt single-clause run was found — the corpus changed shape");
  assert.ok(
    exempt.longest.length <= TH_HARD,
    `the longest exempt run is ${exempt.longest.length} units, over the hard limit of ${TH_HARD}`,
  );
  // Every compound over the soft limit must be splittable into pieces that
  // are each under the limit, or be under the hard limit outright.
  for (const w of compoundOverSoft) {
    assert.ok(w.length <= TH_HARD, `a compound run is past the hard limit: ${w}`);
  }
});

test("the corpus has no Thai run past the hard limit", () => {
  const v: string[] = [];
  for (const f of banks) {
    const data = JSON.parse(readFileSync(new URL(`../${f}`, import.meta.url), "utf8"));
    const walk = (o: unknown): void => {
      if (typeof o === "string") {
        for (const x of thaiViolations(o)) if (x.why === "hard") v.push(`${f}: ${x.run}`);
      } else if (Array.isArray(o)) o.forEach(walk);
      else if (o && typeof o === "object") Object.values(o).forEach(walk);
    };
    walk(data);
  }
  assert.deepEqual(v, [], "a Thai stretch is past the hard limit");
});
