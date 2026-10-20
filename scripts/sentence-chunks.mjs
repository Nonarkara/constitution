#!/usr/bin/env node
/**
 * Split the remaining over-long sentences into collision-free chunks.
 *
 * Why chunks and not one worklist per file. Two agents editing the same JSON
 * file overwrite each other: the second write is made from a stale read, and
 * the first agent's work silently disappears. A chunk is a separate file with
 * a separate output path, so no two agents can ever collide, and merging is a
 * mechanical join that cannot lose a rewrite.
 *
 * Each chunk is a JSON array of:
 *   { file, index, id, lang, before, after }
 * The agent fills in `after` and writes the chunk to the given output path.
 * The merge step then applies every `after` onto the exact index in the exact
 * file, and refuses to apply one whose `before` no longer matches — so a
 * silent edit to the data is caught rather than accepted.
 *
 * Usage:
 *   node scripts/sentence-chunks.mjs list              # show chunk files
 *   node scripts/sentence-chunks.mjs build 4            # build 4 chunks
 *   node scripts/sentence-chunks.mjs merge              # apply all chunks
 */
import { readFile, writeFile, readdir, mkdir } from "node:fs/promises";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { thaiViolations, splitAtClauses } from "./thai-text.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const CHUNK_DIR = path.join(ROOT, "var", "sentence-chunks");
const EN_WORDS = 32;
const ZH_CHARS = 60;
const BANKS = ["data/questions.json", "data/exam-topics.json"];

const enSentences = (text) =>
  String(text).split(/(?<=[.!?])\s+/).map((s) => s.trim()).filter(Boolean);
const zhSentences = (text) =>
  String(text).split(/(?<=[。！？；])/).map((s) => s.trim()).filter(Boolean);
const enWords = (s) => s.split(/\s+/).filter(Boolean).length;
const zhChars = (s) => (s.match(/[㐀-鿿]/g) || []).length;

/** Find every over-long sentence in a bank, with its exact position. */
function findViolations(file) {
  const raw = readFileSync(path.join(ROOT, file), "utf8");
  const data = JSON.parse(raw);
  const out = [];
  for (let index = 0; index < data.length; index++) {
    const q = data[index];
    // The SAME field list the release gate measures. A chunker that scans a
    // different set leaves violations behind that no worker was ever asked
    // to fix — the gate then fails on sentences nobody has seen.
    //
    // prompt and choice hold a LANGUAGE OBJECT {th,en,zh}, not a string, so
    // each language is a separate field to check.
    const fields = [];
    const pushObject = (name, obj) => {
      if (!obj || typeof obj !== "object") return;
      for (const lang of ["en", "zh"]) {
        if (obj[lang]) fields.push([`${name}.${lang}`, obj[lang]]);
      }
      // Thai is measured per FIELD, not per sentence: Thai has no sentence
      // punctuation, so the unit that gets rewritten is the whole passage —
      // one entry, one before/after pair, one mechanical replace at merge
      // time. Splitting it per stretch would mean several entries touching
      // the same string, and the merge refuses any "before" that occurs more
      // than once.
      if (obj.th) {
        const violations = thaiViolations(obj.th);
        if (violations.length) {
          out.push({
            file,
            index,
            id: q.id,
            lang: "th",
            field: `${name}.th`,
            before: obj.th,
            after: "",
            count: violations.length,
            stretches: violations.map((v) => ({
              run: v.run,
              chars: v.run.length,
              clauses: v.clauses,
              why: v.why,
              suggested: splitAtClauses(v.run),
            })),
          });
        }
      }
    };
    pushObject("prompt", q.prompt);
    (q.choices || []).forEach((c, i) => pushObject(`choice${i}`, c));
    pushObject("question", q.question);
    pushObject("explanation", q.explanation);
    pushObject("hook", q.hook);
    for (const [field, value] of fields) {
      const lang = field.endsWith("en") ? "en" : field.endsWith("zh") ? "zh" : null;
      if (!lang) continue;
      const sents = lang === "en" ? enSentences(value) : zhSentences(value);
      for (const s of sents) {
        const n = lang === "en" ? enWords(s) : zhChars(s);
        if (lang === "en" ? n > EN_WORDS : n > ZH_CHARS) {
          out.push({ file, index, id: q.id, lang, field, before: s, count: n });
        }
      }
    }
  }
  return out;
}

async function build(n) {
  await mkdir(CHUNK_DIR, { recursive: true });
  // Only the CHUNK files are reset. The out-*.json files are worker output:
  // wiping them destroys unmerged work that no other file can reconstruct.
  for (const f of await readdir(CHUNK_DIR)) {
    if (f.startsWith("chunk-") && f.endsWith(".json")) {
      await writeFile(path.join(CHUNK_DIR, f), "[]");
    }
  }
  const all = [];
  for (const f of BANKS) all.push(...findViolations(f));
  // Group by (file, index) so one question's sentences stay in one chunk and
  // an agent never half-rewrites a question in two different files.
  const byQuestion = new Map();
  for (const v of all) {
    const key = `${v.file}#${v.index}`;
    if (!byQuestion.has(key)) byQuestion.set(key, []);
    byQuestion.get(key).push(v);
  }
  const groups = [...byQuestion.values()];
  const per = Math.ceil(groups.length / n);
  const manifest = [];
  for (let i = 0; i < n; i++) {
    const slice = groups.slice(i * per, (i + 1) * per);
    // FLAT, not nested. A chunk file is an array of entries; the merge and
    // the worker's check both iterate it directly, and a nested array would
    // make the merge a silent no-op.
    const flat = slice.flat();
    const name = `chunk-${String(i + 1).padStart(2, "0")}.json`;
    await writeFile(path.join(CHUNK_DIR, name), JSON.stringify(flat, null, 2));
    manifest.push({
      file: name,
      out: `var/sentence-chunks/out-${String(i + 1).padStart(2, "0")}.json`,
      questions: slice.length,
      sentences: flat.length,
    });
  }
  await writeFile(path.join(CHUNK_DIR, "manifest.json"), JSON.stringify(manifest, null, 2));
  console.log(`${all.length} over-long sentences in ${groups.length} questions → ${n} chunks`);
  for (const m of manifest) console.log(`  ${m.file}  ${m.questions} questions  ${m.sentences} sentences`);
}

async function merge() {
  const manifest = JSON.parse(await readFile(path.join(CHUNK_DIR, "manifest.json"), "utf8"));
  const banks = new Map();
  for (const f of BANKS) banks.set(f, JSON.parse(await readFile(path.join(ROOT, f), "utf8")));
  let applied = 0;
  let skipped = 0;
  const problems = [];
  for (const entry of manifest) {
    const outPath = path.join(ROOT, entry.out);
    if (!existsSync(outPath)) {
      console.log(`  (no output for ${entry.file} — nothing merged from it)`);
      continue;
    }
    const items = JSON.parse(await readFile(outPath, "utf8"));
    for (const it of items) {
      if (!it.after || it.after === it.before) {
        skipped++;
        continue;
      }
      const bank = banks.get(it.file);
      if (!bank) {
        problems.push(`${it.file}: unknown bank`);
        continue;
      }
      const q = bank[it.index];
      if (!q || q.id !== it.id) {
        problems.push(`${it.file}[${it.index}]: id mismatch (expected ${it.id})`);
        continue;
      }
      // Resolve the field the same way the chunker found it: "choice2.zh" is
      // an index into the choices array plus a language, "explanation.en" is
      // a property of the explanation object, and "prompt.en" likewise.
      const parts = it.field.split(".");
      const lang = parts[parts.length - 1];
      const base = parts.slice(0, -1).join(".");
      let holder = q;
      let key = base;
      if (base.startsWith("choice")) {
        const i = Number(base.slice("choice".length));
        if (!Array.isArray(q.choices) || !q.choices[i]) {
          problems.push(`${it.file}[${it.index}] ${it.field}: choice ${i} missing`);
          continue;
        }
        // The choice is itself a {th,en,zh} object, so the language is read
        // from it directly rather than from the array.
        holder = q.choices[i];
      } else if (base === "explanation" || base === "hook") {
        holder = q[base];
      } else if (base === "question") {
        holder = q.question;
      } else if (base === "prompt") {
        holder = q.prompt;
      }
      if (!holder || typeof holder !== "object" || typeof holder[lang] !== "string") {
        problems.push(`${it.file}[${it.index}] ${it.field}: field not found`);
        continue;
      }
      const current = holder[lang];
      if (typeof current !== "string" || !current.includes(it.before)) {
        problems.push(`${it.file}[${it.index}] ${it.field}: "before" no longer present — skipped`);
        continue;
      }
      // The "before" sentence must appear exactly once. If an earlier rewrite
      // happened to re-introduce it, a blind replace would rewrite the wrong
      // occurrence and silently corrupt the field.
      const occurrences = current.split(it.before).length - 1;
      if (occurrences !== 1) {
        problems.push(`${it.file}[${it.index}] ${it.field}: "before" occurs ${occurrences}× — skipped`);
        continue;
      }
      holder[lang] = current.replace(it.before, it.after);
      applied++;
    }
  }
  for (const [file, data] of banks) {
    await writeFile(path.join(ROOT, file), JSON.stringify(data, null, 2) + "\n");
  }
  console.log(`merged ${applied} rewrite(s); ${skipped} unchanged`);
  if (problems.length) {
    console.log("\nPROBLEMS:");
    for (const p of problems) console.log("  " + p);
    process.exitCode = 1;
  }
}

const cmd = process.argv[2];
if (cmd === "build") await build(Number(process.argv[3]) || 4);
else if (cmd === "merge") await merge();
else {
  console.log("usage: sentence-chunks.mjs build <n> | merge");
  if (existsSync(path.join(CHUNK_DIR, "manifest.json"))) {
    console.log("\ncurrent chunks:");
    console.log(await readFile(path.join(CHUNK_DIR, "manifest.json"), "utf8"));
  }
}
