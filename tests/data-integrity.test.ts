import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, writeFileSync, mkdtempSync, cpSync, rmSync, mkdirSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { checkDataIntegrity, factSignature } from "../scripts/check-data-integrity.mjs";

/**
 * The data-integrity gate, and proof that it bites.
 *
 * A gate that has never failed proves nothing. This test copies the repo's
 * data into a scratch directory, changes a section number and a modal verb in
 * it, and requires the gate to catch both — and to name the field it caught
 * them in. The real bank stays untouched, and must still pass afterwards.
 */

const repo = process.cwd();
const BANK = path.join(repo, "data", "questions.json");

test("a fact signature is the numbers, the sections and the modals", () => {
  const th = factSignature("มาตรา 172 ต้องโอนหุ้นและอาจ ss.65", "th");
  assert.deepEqual(th.numbers, ["172", "65"]);
  assert.deepEqual(th.sections, ["ss.65", "มาตรา172"]);
  // A Thai modal is glued to the verb that follows it, so it can only be
  // found as a substring. A word-boundary match would miss every one.
  assert.deepEqual(th.modals, ["อาจ", "ต้อง"].sort());
  const en = factSignature("The State must act, and may not refuse.", "en");
  assert.deepEqual(en.modals, ["may", "must"].sort());
  const zh = factSignature("国家必须作为，国家不得拒绝。", "zh");
  assert.deepEqual(zh.modals, ["不得", "必须"].sort());
});

test("the real data passes the gate right now", () => {
  const { failures } = checkDataIntegrity(repo);
  assert.deepEqual(failures, [], "the committed data must satisfy its own baseline");
});

test("the gate catches a moved section number and a weakened modal", () => {
  const scratch = mkdtempSync(path.join(tmpdir(), "dataint-"));
  const original = readFileSync(BANK, "utf8");
  try {
    mkdirSync(path.join(scratch, "data"));
    for (const name of ["fact-baseline.json", "questions.json", "exam-topics.json"])
      cpSync(path.join(repo, "data", name), path.join(scratch, "data", name));
    const data = JSON.parse(original);
    const q = data.find((x: { id: string }) => x.id === "c08-05");
    assert.ok(q, "the sample question must exist");
    q.explanation.th = q.explanation.th.replace("มาตรา 172", "มาตรา 173");
    q.explanation.en = q.explanation.en.replace("must be convened", "may be convened");
    writeFileSync(path.join(scratch, "data", "questions.json"), JSON.stringify(data, null, 2) + "\n");

    const { failures } = checkDataIntegrity(scratch);
    assert.ok(failures.length >= 2, `the gate must catch both edits, it caught ${failures.length}`);
    const joined = failures.join("\n");
    assert.match(joined, /c08-05#explanation\.th/, "the Thai field must be named");
    assert.match(joined, /c08-05#explanation\.en/, "the English field must be named");
    assert.match(joined, /sections? (lost|added)/i, "a section reference moved");
    assert.match(joined, /modals? (lost|added)/i, "a modal verb moved");
  } finally {
    rmSync(scratch, { recursive: true, force: true });
  }
  // The working bank stayed untouched throughout.
  const { failures } = checkDataIntegrity(repo);
  assert.equal(readFileSync(BANK, "utf8"), original, "the falsifier never rewrites the working question bank");
  assert.deepEqual(failures, [], "the working data must still satisfy the gate");
});

test("the gate is wired into the release chain and into CI", () => {
  const pkg = JSON.parse(readFileSync(path.join(repo, "package.json"), "utf8"));
  assert.match(pkg.scripts.release, /check:data/, "the release chain must run the data gate");
  const ci = readFileSync(path.join(repo, ".github", "workflows", "verify.yml"), "utf8");
  assert.match(ci, /npm run check:data/, "CI must run the data gate");
});

test("the rewrite ledger accounts for every genuinely rewritten field", () => {
  const ledger = JSON.parse(readFileSync(path.join(repo, "data", "rewrite-ledger.json"), "utf8"));
  assert.ok(ledger.fields.length > 0);
  for (const f of ledger.fields) {
    assert.ok(f.id && f.field && f.reason, "every ledger entry names the field and the reason");
  }
  // The five Thai rewrites are the ones that touched the statute text, so
  // each one has to name the section it was checked against.
  const thai = ledger.fields.filter((f: { field: string }) => f.field.endsWith(".th"));
  assert.equal(thai.length, 5, "the ledger must record exactly the five Thai rewrites");
  for (const f of thai) {
    assert.match(f.reason, /มาตรา \d+/, `${f.id} must name the section it was checked against`);
  }
});
