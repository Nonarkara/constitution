/**
 * The illustrations are the files their masters derive: transparent, without
 * holes, and drawn at the shape the file has.
 *
 * Why this gate exists
 * --------------------
 * Every drawing in this repository used to be a flat rectangle of paper with a
 * scene on it. On a page that is also paper, the rectangle reads as a pasted-on
 * patch: the drawing has an edge the page does not have. The drawings were
 * rebuilt with their ground lifted off — real alpha, cropped to the drawing —
 * and nothing in the build would have noticed if one of them were later
 * re-exported flat.
 *
 * What this gate proves
 * ---------------------
 *   1. Every plate has an alpha channel, read out of the WebP container
 *      itself (a "VP8X" chunk with the alpha flag, a "VP8L" chunk with the
 *      alpha bit, or an "ALPH" chunk) — not a claim in a manifest.
 *   2. A deterministic sample of the plates — at least eight, spread across
 *      the set, and always the two that are known to leak — is *re-derived
 *      from its master* by the same code that builds the plates, and the
 *      bytes are compared byte for byte. This is the check that an edited
 *      manifest cannot survive: the manifest can say whatever it likes, but
 *      the master still derives the transparent plate, and a flat rectangle
 *      is not those bytes.
 *   3. Every plate really is transparent, measured from the pixels of the
 *      file that ships, and the measurement agrees with the number the build
 *      recorded. A flat, fully opaque rectangle measures zero transparency
 *      and fails. This one covers every plate, not only the sample.
 *   4. No plate has an interior hole — transparency enclosed by ink. A hole
 *      is the ground flood eating the drawing (the white page of an open
 *      notebook), and it shows as a hole punched through the picture on a
 *      dark page. This one covers every plate, not only the sample.
 *   5. Every plate's master is the one the manifest names, checked by hash,
 *      so a manifest that points at the wrong master fails even for the
 *      plates that are not re-derived.
 *   6. The proportions in the code match the files on disk, so a plate is
 *      never drawn at a shape the file does not have.
 *   7. The stylesheet does not paint a frame or a ground behind any image.
 *      The ground was taken out of the files, so a border or a background in
 *      the CSS puts it back; the pixels cannot see that, and it is exactly
 *      what makes a drawing look pasted on.
 *
 * The five panoramic civic scenes keep their own ground — they are pictures of
 * places, not marginal plates — so the transparency checks do not apply to
 * them. Their bytes are still checked against what was recorded, and their
 * canvas size is read out of the container.
 *
 * What this gate does not prove
 * -----------------------------
 *   * It does not re-derive every plate, only the sample. The other plates
 *     are measured for real transparency and have their master's hash
 *     checked, but nobody has compared their bytes with a fresh derivation;
 *     re-encoding all of them on every run costs minutes for no extra
 *     finding. The sample is deterministic, and the gate prints how many
 *     plates were re-derived so the coverage is never a surprise.
 *   * It does not prove the masters are the original artwork. The masters are
 *     the source of truth here; what is checked is that the plates follow
 *     from them.
 *   * The pixels are read with python3 and Pillow, the same library that
 *     wrote the files, because that is the only way to read a WebP's pixels
 *     without an image library in Node. If Python, Pillow or NumPy is missing the
 *     gate FAILS and says so — it does not quietly check less.
 *   * It proves the plates follow from the masters *under the current build
 *     code*. Changing the build code and the plates together is a question
 *     for review, not for a machine.
 *
 * No image library in Node: the WebP container is a documented RIFF file, and
 * reading its header is a hundred lines of arithmetic.
 */
import { createHash } from "node:crypto";
import { readFile, readdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import { spawn } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = process.cwd();
const ILLUSTRATIONS = path.join(ROOT, "public", "illustrations");
const MANIFEST = path.join(ROOT, "design", "illustrations", "alpha-manifest.json");
const RATIOS = path.join(ROOT, "lib", "illustration-ratios.ts");

// How far the measured transparency of a served file may sit from the number
// the build recorded. The alpha plane is stored losslessly, so this is a
// rounding allowance — and far too small to let a flat rectangle through.
const TRANSPARENCY_TOLERANCE = 0.01;

/**
 * Read a WebP file's container: the chunks, whether it carries alpha, and
 * the canvas size.
 */
export function readWebp(buffer) {
  if (buffer.length < 16) throw new Error("too short to be a WebP");
  if (buffer.toString("ascii", 0, 4) !== "RIFF") throw new Error("no RIFF header");
  if (buffer.toString("ascii", 8, 12) !== "WEBP") throw new Error("not a WebP file");
  let offset = 12;
  let alpha = false;
  let canvas = null;
  const chunks = [];
  while (offset + 8 <= buffer.length) {
    const fourcc = buffer.toString("ascii", offset, offset + 4);
    const size = buffer.readUInt32LE(offset + 4);
    const body = buffer.subarray(offset + 8, offset + 8 + size);
    chunks.push(fourcc);
    if (fourcc === "VP8X") {
      // the extended header carries the canvas size and the feature flags;
      // bit 4 of the first byte is ALPHA. The canvas is stored minus one.
      const flags = body[0];
      alpha = alpha || Boolean(flags & 0x10);
      canvas = [
        (body[4] | (body[5] << 8) | (body[6] << 16)) + 1,
        (body[7] | (body[8] << 8) | (body[9] << 16)) + 1,
      ];
    } else if (fourcc === "VP8L") {
      // signature byte, then 14 bits width-1, 14 bits height-1, 1 alpha bit
      const bits = body.readUInt32LE(1);
      alpha = alpha || Boolean((bits >> 28) & 1);
      if (!canvas) {
        canvas = [(bits & 0x3fff) + 1, ((bits >> 14) & 0x3fff) + 1];
      }
    } else if (fourcc === "ALPH") {
      alpha = true;
    } else if (fourcc === "VP8 ") {
      // lossy: three bytes of frame tag, the sync code, then 14 bits of
      // width and 14 bits of height in two separate fields. Unlike VP8X and
      // VP8L, the lossy frame header stores the size itself, not size-1.
      if (!canvas) {
        canvas = [
          body.readUInt16LE(6) & 0x3fff,
          body.readUInt16LE(8) & 0x3fff,
        ];
      }
    }
    offset += 8 + size + (size % 2);
  }
  const [width, height] = canvas || [0, 0];
  return { alpha, width, height, chunks };
}

function sha256(buffer) {
  return createHash("sha256").update(buffer).digest("hex");
}

/**
 * The manifest's "kept" entries: the civic scenes that keep their own ground.
 */
function keptEntries(manifest) {
  return (manifest.kept || []).map((entry) =>
    typeof entry === "string" ? { name: entry } : entry,
  );
}

/**
 * Run the illustration toolchain over a tree and read what it measures.
 *
 * This is the part the gate cannot fake: the tool measures the pixels of the
 * files that ship and re-derives every plate from its master, so the numbers
 * come from the artwork rather than from the manifest.
 */
/** Prefer the declared project toolchain; honour an explicit Python override. */
export function illustrationPython() {
  if (process.env.PYTHON) return process.env.PYTHON;
  const local = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", ".venv",
    process.platform === "win32" ? "Scripts/python.exe" : "bin/python");
  return existsSync(local) ? local : "python3";
}

function runAudit(root) {
  const py = illustrationPython();
  const script = path.join(
    path.dirname(fileURLToPath(import.meta.url)),
    "illustrations",
    "build_illustrations.py",
  );
  return new Promise((resolve, reject) => {
    const child = spawn(py, [script, "--audit", "--root", root], { cwd: root });
    let stdout = "";
    let stderr = "";
    child.stdout.on("data", (d) => {
      stdout += d;
    });
    child.stderr.on("data", (d) => {
      stderr += d;
    });
    child.on("error", (e) => reject(new Error(`could not run ${py}: ${e.message}`)));
    child.on("close", (code) => {
      if (code !== 0) {
        reject(new Error(`${py} exited ${code}: ${(stderr || stdout).trim()}`));
        return;
      }
      try {
        resolve(JSON.parse(stdout));
      } catch (e) {
        reject(new Error(`the audit did not print JSON: ${e.message}`));
      }
    });
  });
}

export async function checkIllustrations(root = ROOT) {
  const failures = [];
  const manifest = JSON.parse(
    await readFile(path.join(root, "design", "illustrations", "alpha-manifest.json"), "utf8"),
  );
  const ratios = await readFile(path.join(root, "lib", "illustration-ratios.ts"), "utf8");

  const onDisk = (await readdir(path.join(root, "public", "illustrations")))
    .filter((f) => f.endsWith(".webp"))
    .sort();
  const manifestNames = manifest.plates
    .map((p) => path.basename(p.served))
    .sort();
  const kept = keptEntries(manifest);
  const keptNames = kept.map((k) => k.name).sort();

  for (const name of onDisk) {
    if (!manifestNames.includes(name) && !keptNames.includes(name)) {
      failures.push(`${name} is served but not in the illustration manifest`);
    }
  }
  for (const name of manifestNames) {
    if (!onDisk.includes(name)) failures.push(`${name} is in the manifest but not served`);
  }
  for (const name of keptNames) {
    if (!onDisk.includes(name)) failures.push(`${name} (kept) is not served`);
  }

  /* THE PAGE MUST NOT PAINT THE GROUND BACK IN.
   *
   * The ground was lifted off the files themselves, so every drawing arrives
   * with real alpha. A border in the stylesheet draws a rectangle around a
   * drawing that has no edge, and a background paints the paper back in
   * behind the ink. Either one puts the drawing on a patch again — the
   * cut-and-paste the house law forbids — and neither of them shows up in the
   * pixels of the file, so every check above walks straight past them.
   *
   * The rule is narrow on purpose: it is about images, and about the two
   * declarations that paint a ground or a frame. A border-radius is not a
   * frame; a focus outline is not a frame. */
  const css = await readFile(path.join(root, "app", "globals.css"), "utf8");
  const rule = /([^{}]+)\{([^{}]*)\}/g;
  let matched;
  while ((matched = rule.exec(css))) {
    const selector = matched[1].trim();
    const body = matched[2];
    if (!/\bimg\b/.test(selector)) continue;
    const border = /(^|;)\s*border(?:-(?!radius|image)[a-z-]+)?\s*:\s*([^;]+)/.exec(body);
    if (border && !/^(0|none)\b/.test(border[2].trim())) {
      failures.push(
        `the stylesheet draws a frame around a drawing: \`${selector}\` sets ${border[0].trim()}`,
      );
    }
    const ground = /(^|;)\s*background(?:-[a-z-]+)?\s*:\s*([^;]+)/.exec(body);
    if (ground && !/^(none|transparent)\b/.test(ground[2].trim())) {
      failures.push(
        `the stylesheet paints a ground behind a drawing: \`${selector}\` sets ${ground[0].trim()}`,
      );
    }
  }

  // The pixels. Everything above this line is bookkeeping; everything below
  // it is read out of the artwork.
  let audit = null;
  try {
    audit = await runAudit(root);
  } catch (e) {
    failures.push(
      `the pixel-level audit could not run, so nothing about the pixels was checked: ${e.message}`,
    );
  }
  for (const err of audit?.errors ?? []) failures.push(err);

  for (const plate of manifest.plates) {
    const name = path.basename(plate.served);
    const file = path.join(root, "public", "illustrations", name);
    let buffer;
    try {
      buffer = await readFile(file);
    } catch {
      failures.push(`${name} could not be read`);
      continue;
    }
    let head;
    try {
      head = readWebp(buffer);
    } catch (e) {
      failures.push(`${name} is not a readable WebP: ${e.message}`);
      continue;
    }
    if (!head.alpha) {
      failures.push(
        `${name} has no alpha channel — the paper ground is back; the plate must be transparent`,
      );
    }
    const [w, h] = plate.output_size;
    if (head.width !== w || head.height !== h) {
      failures.push(`${name} is ${head.width}x${head.height}, the manifest says ${w}x${h}`);
    }
    const servedHash = sha256(buffer);
    if (servedHash !== plate.sha256) {
      failures.push(
        `${name} is not the file the build produced — rebuild the illustrations instead of hand-editing them`,
      );
    }
    // the code must draw the plate at the shape the file has
    const key = "/" + plate.served.split("public/").pop();
    const wanted = `{ width: ${w}, height: ${h}, ratio: "${w} / ${h}" }`;
    if (!ratios.includes(`"${key}": ${wanted}`)) {
      failures.push(`${name} is not drawn at its own proportions in lib/illustration-ratios.ts`);
    }

    if (!audit) continue;
    const served = audit.served[name];
    const derived = audit.derived[name];
    if (!served) {
      failures.push(`${name} was not measured`);
    } else {
      if (served.transparent_fraction <= 0) {
        failures.push(
          `${name} is fully opaque — the paper ground is back; the plate must be transparent`,
        );
      }
      if (typeof plate.transparent_fraction !== "number") {
        failures.push(`${name} has no recorded transparency to check against`);
      } else if (
        Math.abs(served.transparent_fraction - plate.transparent_fraction) >
        TRANSPARENCY_TOLERANCE
      ) {
        failures.push(
          `${name} measures ${served.transparent_fraction} transparent, the manifest recorded ${plate.transparent_fraction}`,
        );
      }
      if (served.interior_holes > 0) {
        failures.push(
          `${name} has ${served.interior_holes}px of transparency enclosed by ink — the ground flood ate the drawing; rebuild it`,
        );
      }
    }
    if (!derived) {
      failures.push(`${name} could not be re-derived from its master`);
    } else {
      // `sha256` is present only for the plates in the re-derivation sample.
      // The others were measured and their master was hashed, but re-encoding
      // every plate on every run is not worth the minutes it costs.
      if (typeof derived.sha256 === "string") {
        if (derived.sha256 !== servedHash) {
          failures.push(
            `${name} does not match its master’s encoded bytes — use the pinned illustration requirements to reproduce the toolchain, or review and rebuild the plates`,
          );
        }
        if (derived.sha256 !== plate.sha256) {
          failures.push(`${name} does not match the hash recorded in the manifest`);
        }
      }
      if (plate.master_sha256 && derived.master_sha256 !== plate.master_sha256) {
        failures.push(
          `${name} names a master whose bytes are not the ones the manifest recorded`,
        );
      }
    }
  }

  // The scenes that keep their own ground: their bytes are recorded, and
  // their canvas size is read out of the container.
  for (const entry of kept) {
    const name = entry.name;
    const file = path.join(root, "public", "illustrations", name);
    let buffer;
    try {
      buffer = await readFile(file);
    } catch {
      continue;
    }
    let head;
    try {
      head = readWebp(buffer);
    } catch (e) {
      failures.push(`${name} (kept) is not a readable WebP: ${e.message}`);
      continue;
    }
    if (entry.output_size) {
      const [w, h] = entry.output_size;
      if (head.width !== w || head.height !== h) {
        failures.push(
          `${name} (kept) is ${head.width}x${head.height}, the manifest says ${w}x${h}`,
        );
      }
    }
    if (entry.sha256 && sha256(buffer) !== entry.sha256) {
      failures.push(`${name} (kept) is not the file that was recorded`);
    }
    if (audit?.kept?.[name] && audit.kept[name].sha256 !== sha256(buffer)) {
      failures.push(`${name} (kept) does not match the bytes on disk`);
    }
  }

  return {
    failures,
    plates: manifest.plates.length,
    kept: keptNames.length,
    rederived: audit?.rederived?.length ?? 0,
    measured: audit ? Object.keys(audit.served).length : 0,
    // what the pixels actually are, and what the masters actually derive —
    // handed back so a test can look at them rather than trust the verdict
    transparency: audit?.served ?? {},
    derivation: audit?.derived ?? {},
  };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const { failures, plates, kept, rederived, measured } = await checkIllustrations();
  if (failures.length) {
    console.error(`illustrations: ${failures.length} failure(s)`);
    for (const f of failures) console.error(`  - ${f}`);
    process.exit(1);
  }
  console.log(
    `illustrations: ${plates} plates — ${measured} measured for real transparency, ${rederived} re-derived from their masters byte for byte, no interior holes, no frame painted behind them; ${kept} scenes keep their own ground`,
  );
}
