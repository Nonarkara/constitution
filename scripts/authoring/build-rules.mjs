#!/usr/bin/env node
/**
 * Build the rule catalogue: the numbers the app teaches, and the handle that
 * makes each one memorable.
 *
 * The app had two halves that never met. The cram sheet listed forty-one
 * numbers the exam asks about; the memory palace held sixteen rooms, one per
 * chapter, each with a scene and a joke. A learner could see a picture of a
 * chapter and a list of numbers, but nothing joined the two — so the house
 * taught no number at all, and the picture reached one question in ten.
 *
 * This script is the join. `data/handles.json` gives every rule a meaning
 * (the rule the number decides) and a joke (one concrete image to picture it
 * by), and `data/facts.json` gains the count-rules the exam traps on and the
 * app never registered.
 *
 * Every number carries the Thai words that prove it, taken verbatim from its
 * own section, so the statute checks the data rather than a human's memory.
 *
 *   node scripts/authoring/build-rules.mjs          # write
 *   node scripts/authoring/build-rules.mjs --check  # fail if the data drifted
 */
import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { NEW_FACTS } from "./new-facts.mjs";
import { HANDLES } from "./handles.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const read = (p) => JSON.parse(readFileSync(path.join(ROOT, p), "utf8"));
const write = (p, value) => writeFileSync(path.join(ROOT, p), `${JSON.stringify(value, null, 2)}\n`);

const corpus = read("data/constitution.json");
const facts = read("data/facts.json");
const cram = read("data/cram.json");

// ── The rules, in one catalogue ─────────────────────────────────────────────
// A rule is a number the app teaches, the sections it lives in, and the
// handle that makes it stick. The cram sheet's own groups (people, time
// limits, votes) become kinds of the same catalogue rather than three
// separate lists that could drift apart.
const handles = { ...HANDLES };
for (const fact of NEW_FACTS) {
  handles[fact.id] = { meaning: fact.meaning, joke: fact.joke, match: fact.match };
}

const merged = [...facts.filter((f) => !NEW_FACTS.some((n) => n.id === f.id))];
for (const fact of NEW_FACTS) {
  const { meaning, joke, match, ...rest } = fact;
  merged.push(rest);
}

// ── Check the statute, not the author ───────────────────────────────────────
// The same rule the data test uses: an entry that names the Organic Act is
// proved against that Act, everything else against the Constitution.
const problems = [];
const oaccp = read("data/sources/oaccp.json");
const prove = (entry) => {
  if (entry.source === "oaccp") {
    const sec = entry.actKey && oaccp.sections[entry.actKey];
    if (!sec) {
      problems.push(`${entry.id}: oaccp section ${entry.actKey} not found`);
      return;
    }
    if (!sec.th.includes(entry.proof)) {
      problems.push(`${entry.id}: "${entry.proof}" is not in the Organic Act §${entry.actKey}`);
    }
    return;
  }
  const text = corpus.sections[entry.section - 1]?.th ?? "";
  if (!text.includes(entry.proof)) {
    problems.push(`${entry.id}: "${entry.proof}" is not in section ${entry.section}`);
  }
};
for (const fact of merged) prove(fact);
for (const group of [cram.time, cram.votes, cram.traps]) for (const entry of group) prove(entry);

// A trap states its rule in `text`; that text IS its meaning. The handle
// only adds the image.
for (const trap of cram.traps) {
  if (!handles[trap.id]) continue;
  handles[trap.id].meaning = { ...trap.text };
}

// Every registered rule must have a handle, and every handle must name a rule
// that exists. A rule with no handle is a number the learner cannot remember;
// a handle for a rule that does not exist is a picture of nothing.
const registered = new Set([
  ...merged.map((f) => f.id),
  ...cram.time.map((f) => f.id),
  ...cram.votes.map((f) => f.id),
  ...cram.traps.map((f) => f.id),
]);
for (const id of registered) {
  if (!handles[id]) problems.push(`${id} has no handle`);
  else {
    for (const lang of ["th", "en", "zh"]) {
      if (!handles[id].meaning?.[lang]) problems.push(`${id} meaning.${lang} is empty`);
      if (!handles[id].joke?.[lang]) problems.push(`${id} joke.${lang} is empty`);
    }
  }
}
for (const id of Object.keys(handles)) {
  if (!registered.has(id)) problems.push(`handle "${id}" names a rule that does not exist`);
}

// A handle must be a handle: short enough to picture, and different from the
// rule it explains. Two rules sharing a joke means the learner has one
// picture for two numbers, which is the failure this whole catalogue exists
// to remove.
const jokes = new Map();
for (const [id, handle] of Object.entries(handles)) {
  const key = handle.joke?.en?.trim();
  if (!key) continue;
  if (jokes.has(key)) problems.push(`handles "${jokes.get(key)}" and "${id}" share one joke`);
  else jokes.set(key, id);
}

if (problems.length) {
  console.error(`\nFAIL — the rule catalogue has ${problems.length} problem(s):\n`);
  for (const p of problems) console.error(`  ✗ ${p}`);
  console.error("");
  process.exit(1);
}

// ── Write, or check ────────────────────────────────────────────────────────
const factsOut = merged;
const handlesOut = Object.fromEntries(
  Object.keys(handles)
    .sort()
    .map((id) => [
      id,
      {
        meaning: {
          th: handles[id].meaning.th,
          en: handles[id].meaning.en,
          zh: handles[id].meaning.zh,
        },
        joke: { th: handles[id].joke.th, en: handles[id].joke.en, zh: handles[id].joke.zh },
        ...(handles[id].match ? { match: handles[id].match } : {}),
      },
    ]),
);

if (process.argv.includes("--check")) {
  const drift = [];
  const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);
  if (!same(facts, factsOut)) drift.push("data/facts.json");
  if (!same(read("data/handles.json"), handlesOut)) drift.push("data/handles.json");
  if (drift.length) {
    console.error(`\nFAIL — the rule catalogue is out of date:\n`);
    for (const f of drift) console.error(`  ✗ ${f}`);
    console.error("\nRun `npm run build:rules` and commit the result.\n");
    process.exit(1);
  }
  console.log(`  · rule catalogue current: ${registered.size} rules, ${merged.length} facts`);
  process.exit(0);
}

write("data/facts.json", factsOut);
write("data/handles.json", handlesOut);
console.log(
  `  · rule catalogue built: ${registered.size} rules (${merged.length} facts, ${cram.time.length} time limits, ${cram.votes.length} votes, ${cram.traps.length} traps)`,
);
