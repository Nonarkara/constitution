// Every section of the constitution has practice; every question is complete,
// trilingual, has four distinct choices and cites only sections it is about.
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
const arabic = (t) => t.replace(/[๐-๙]/g, (d) => "๐๑๒๓๔๕๖๗๘๙".indexOf(d));
export function checkQuestions(bank, corpus) {
  const errors = [], ids = new Set(), covered = new Set();
  for (const q of bank) {
    const at = q.id;
    if (typeof q.id !== "string" || ids.has(q.id)) errors.push(`${at}: missing or duplicate id`);
    ids.add(q.id);
    if (!Array.isArray(q.sections) || !q.sections.length) errors.push(`${at}: no sections`);
    for (const n of q.sections ?? []) {
      if (!corpus.sections[n - 1]) errors.push(`${at}: no section ${n}`);
      covered.add(n);
    }
    if (!corpus.chapters.some((c) => c.number === q.chapter)) errors.push(`${at}: bad chapter`);
    if (q.choices?.length !== 4) errors.push(`${at}: needs 4 choices`);
    if (!Number.isInteger(q.answer) || q.answer < 0 || q.answer > 3) errors.push(`${at}: answer 0-3`);
    for (const l of ["th", "en", "zh"]) {
      if (!q.prompt?.[l]?.trim() || !q.explanation?.[l]?.trim()) errors.push(`${at}: missing ${l}`);
      if (new Set((q.choices ?? []).map((c) => c?.[l]?.trim())).size !== 4) errors.push(`${at}: ${l} choices not distinct`);
      for (const m of arabic(q.explanation?.[l] ?? "").matchAll(/มาตรา\s*(\d+)|section\s+(\d+)|第(\d+)条/gi)) {
        const n = +(m[1] ?? m[2] ?? m[3]);
        if (!q.sections.includes(n)) errors.push(`${at}: ${l} explanation cites uncited ${n}`);
      }
    }
  }
  for (const s of corpus.sections) if (!covered.has(s.number)) errors.push(`section ${s.number} has no question`);
  return errors;
}
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const read = async (p) => JSON.parse(await readFile(p, "utf8"));
  const bank = await read("data/questions.json");
  const errors = checkQuestions(bank, await read("data/constitution.json"));
  if (errors.length) {
    console.error(errors.slice(0, 40).join("\n") + (errors.length > 40 ? `\n… ${errors.length - 40} more` : ""));
    process.exit(1);
  }
  console.log(`Questions: ${bank.length}, every section 1–279 covered.`);
}
