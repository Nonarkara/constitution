#!/usr/bin/env node
/**
 * Fails if a file the build regenerates no longer matches what is committed.
 *
 * data/outline.json, data/graph.json, data/question-index.json and
 * data/audio-recordings.json are build products that happen to live in the
 * repository so the site can import them directly. Nothing in a normal code
 * review shows whether they are current, so they silently drift: a question is
 * added, the author edits the source, forgets the build step, and the shipped
 * index does not know about it. Running this after a build turns that into a
 * loud failure instead of a wrong page.
 *
 * Uses git so it works identically on a laptop and in CI.
 */
import { execFileSync } from "node:child_process";

const GENERATED = [
  "data/outline.json",
  "data/graph.json",
  "data/question-index.json",
  "data/audio-recordings.json",
];

const git = (...args) =>
  execFileSync("git", args, { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] });

let dirty;
try {
  dirty = git("diff", "--name-only", "--", ...GENERATED).trim();
} catch (err) {
  console.error(`could not run git diff: ${err.message}`);
  process.exit(1);
}

if (dirty) {
  const files = dirty.split("\n").filter(Boolean);
  console.error(`\nFAIL — ${files.length} generated file(s) are out of date:`);
  for (const f of files) console.error(`  ✗ ${f}`);
  console.error(
    "\nRun `npm run build` and commit the result. These files are regenerated",
  );
  console.error("from the corpus and the question banks on every build.");
  process.exit(1);
}

console.log(`PASS — ${GENERATED.length} generated files match a fresh build.`);