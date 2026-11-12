#!/usr/bin/env node
import { spawnSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

// The shared instrument permits untitled pages. Every learner route in this
// project has a title; an untitled measurement is an incomplete render.
function verifyReceipt(file) {
  const { measurements } = JSON.parse(readFileSync(file, "utf8"));
  if (!Array.isArray(measurements) || !measurements.length) {
    throw new Error("the spatial receipt has no measurements");
  }
  const unfinished = measurements.filter((cell) => !cell.hierarchy?.h1Count);
  if (unfinished.length) {
    const examples = unfinished.slice(0, 12).map((cell) => `${cell.route} @${cell.w}px`).join(", ");
    throw new Error(`${unfinished.length} measurement(s) had no rendered title: ${examples}`);
  }
  console.log(`  · spatial readiness: all ${measurements.length} measurements contain a rendered title.`);
}

const args = process.argv.slice(2);
let scratch;
try {
  if (args[0] === "--receipt") {
    verifyReceipt(args[1]);
  } else {
    const given = args.indexOf("--json");
    if (given === -1) {
      scratch = mkdtempSync(join(tmpdir(), "constitution-spatial-receipt-"));
      args.push("--json", join(scratch, "measurements.json"));
    }
    const file = args[args.indexOf("--json") + 1];
    const instrument = fileURLToPath(new URL("./spatial/spatial-check.mjs", import.meta.url));
    const result = spawnSync(process.execPath, [instrument, ...args], { stdio: "inherit" });
    if (result.error) throw result.error;
    if (result.status === 0) verifyReceipt(file);
    else process.exitCode = result.status ?? 1;
  }
} catch (error) {
  console.error(`FAIL — spatial readiness: ${error.message}`);
  process.exitCode = 1;
} finally {
  if (scratch) rmSync(scratch, { recursive: true, force: true });
}
