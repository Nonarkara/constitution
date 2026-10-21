#!/usr/bin/env node
/**
 * Keep this project's copy of the spatial instrument identical to the
 * canonical one.
 *
 * The instrument is shared across every project, so each project carries a
 * copy of it. A copy that drifts is a copy that measures something else, and
 * a number that means one thing in one project and another thing in the next
 * is worse than no number at all — it is a false guarantee.
 *
 * So the copy is checked two ways:
 *
 *   1. against the canonical files, when the canonical instrument is
 *      reachable (it lives outside every repo, so this is a local check);
 *   2. against a manifest of hashes committed in this repo, which is what
 *      CI can verify.
 *
 * Usage:
 *   node scripts/spatial-sync.mjs --check    # fail if the copy drifted
 *   node scripts/spatial-sync.mjs --sync     # copy the canonical files in
 */
import { createHash } from "node:crypto";
import { existsSync, readFileSync, writeFileSync, readdirSync } from "node:fs";
import { homedir } from "node:os";
import path from "node:path";

const ROOT = process.cwd();
const VENDORED = path.join(ROOT, "scripts", "spatial");
const MANIFEST = path.join(VENDORED, "manifest.json");

function canonicalDir() {
  if (process.env.SPATIAL_LAW_HOME) return path.join(process.env.SPATIAL_LAW_HOME, "bin");
  return path.join(homedir(), ".minimax", "skills", "spatial-law", "bin");
}

function sha256(text) {
  return createHash("sha256").update(text).digest("hex");
}

function toolFiles() {
  if (!existsSync(VENDORED)) return [];
  return readdirSync(VENDORED).filter((f) => f.endsWith(".js") || f.endsWith(".mjs")).sort();
}

const CHECK = process.argv.includes("--check");
const SYNC = process.argv.includes("--sync");

if (!existsSync(VENDORED)) {
  console.error(`\nFAIL — the vendored spatial instrument is missing from ${VENDORED}.\n`);
  process.exit(1);
}

const files = toolFiles();
if (!files.length && !SYNC) {
  console.error(`\nFAIL — ${VENDORED} holds no instrument files.\n`);
  process.exit(1);
}

const canonical = canonicalDir();

if (SYNC) {
  if (!existsSync(canonical)) {
    console.error(`\nFAIL — the canonical instrument is not at ${canonical}.\n  Set SPATIAL_LAW_HOME to its directory.\n`);
    process.exit(1);
  }
  // The canonical directory is the list of truth: everything in it is
  // vendored, and nothing else may sit in the vendored copy.
  const canonicalFiles = readdirSync(canonical).filter((f) => f.endsWith(".js") || f.endsWith(".mjs")).sort();
  if (!canonicalFiles.length) {
    console.error(`\nFAIL — the canonical instrument at ${canonical} holds no files.\n`);
    process.exit(1);
  }
  const manifest = { source: "spatial-law", version: 1, files: {} };
  for (const f of canonicalFiles) {
    const src = path.join(canonical, f);
    const text = readFileSync(src, "utf8");
    writeFileSync(path.join(VENDORED, f), text);
    manifest.files[f] = sha256(text);
  }
  // A file left behind in the vendored copy would be a second instrument
  // running against the same pages.
  for (const f of toolFiles()) {
    if (!canonicalFiles.includes(f)) {
      console.error(`\nFAIL — ${f} is in the vendored copy but not in the canonical instrument.\n`);
      process.exit(1);
    }
  }
  writeFileSync(MANIFEST, JSON.stringify(manifest, null, 2) + "\n");
  console.log(`  · spatial instrument synced from ${canonical} (${canonicalFiles.length} files)`);
  process.exit(0);
}

// ---- check
const problems = [];

if (existsSync(MANIFEST)) {
  const manifest = JSON.parse(readFileSync(MANIFEST, "utf8"));
  for (const f of files) {
    const want = manifest.files[f];
    if (!want) {
      problems.push(`${f} is not in the manifest — the vendored copy has grown a file that was never reviewed`);
      continue;
    }
    const got = sha256(readFileSync(path.join(VENDORED, f), "utf8"));
    if (got !== want) {
      problems.push(`${f} does not match the manifest hash — the vendored copy was edited in place`);
    }
  }
  for (const f of Object.keys(manifest.files)) {
    if (!files.includes(f)) problems.push(`${f} is in the manifest but missing from the vendored copy`);
  }
} else {
  problems.push("scripts/spatial/manifest.json is missing — the copy cannot be verified");
}

let canonicalChecked = false;
if (existsSync(canonical)) {
  canonicalChecked = true;
  for (const f of files) {
    const src = path.join(canonical, f);
    if (!existsSync(src)) {
      problems.push(`${f} has no canonical counterpart at ${src}`);
      continue;
    }
    const a = sha256(readFileSync(path.join(VENDORED, f), "utf8"));
    const b = sha256(readFileSync(src, "utf8"));
    if (a !== b) problems.push(`${f} has drifted from the canonical instrument`);
  }
}

if (problems.length) {
  console.error(`\nFAIL — the vendored spatial instrument is not in sync:\n`);
  for (const p of problems) console.error(`  ✗ ${p}`);
  console.error(
    `\n  Run: node scripts/spatial-sync.mjs --sync\n` +
      `  (with SPATIAL_LAW_HOME pointing at the canonical instrument)\n`,
  );
  process.exit(1);
}

console.log(
  `  · spatial instrument: ${files.length} file(s) verified` +
    (canonicalChecked ? ` against the canonical copy and the manifest` : ` against the manifest`),
);
