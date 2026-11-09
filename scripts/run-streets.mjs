/**
 * Run the street-scene builder with the interpreter the illustration gate
 * already uses.
 *
 * CI installs Pillow and NumPy into the setup-python interpreter and never
 * creates a project .venv. A script that calls `.venv/bin/python` exits 127
 * before the gate can measure a single picture, which is how `npm run verify`
 * went red on the commit that added the streets. The order is the one the
 * illustration toolchain already documents: `PYTHON` if set, otherwise the
 * project `.venv`, otherwise `python3` on PATH.
 */
import { spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { illustrationPython } from "./check-illustrations.mjs";

const script = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  "illustrations",
  "build_streets.py",
);
const py = illustrationPython();
const done = spawnSync(py, [script, ...process.argv.slice(2)], { stdio: "inherit" });
if (done.error) {
  console.error(`could not run ${py}: ${done.error.message}`);
  process.exit(1);
}
process.exit(done.status ?? 1);
