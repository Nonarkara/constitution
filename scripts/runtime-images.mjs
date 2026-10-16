/**
 * Runtime image inventory.
 *
 * Link integrity only sees hrefs in built HTML. An illustration that the
 * browser asks for from a client component (`/illustrations/palace-${n}.webp`)
 * never appears there, so deleting it left every gate green: in testing, two of
 * three in-use illustrations were removed and nothing failed.
 *
 * This scans the source that ships to the browser for image paths:
 *   - a plain string literal ("/illustrations/hero.webp") must exist in public/;
 *   - a template literal must have a resolver below that lists every value it
 *     can take. An unknown template fails, so a new dynamic image cannot slip in
 *     unchecked.
 */
import { readFileSync, readdirSync, existsSync, statSync } from "node:fs";
import path from "node:path";

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
const SOURCE_DIRS = ["app", "components", "lib", "worker", "data"];
const SOURCE_EXT = /\.(tsx?|mjs|js|json|css)$/;
const IMAGE = "(?:png|jpe?g|webp|svg|avif|gif)";
const LITERAL = new RegExp(`["'(](\\/[A-Za-z0-9_./-]+\\.${IMAGE})["')]`, "g");
const TEMPLATE = new RegExp("`(\\/[^`]*\\$\\{[^`]*\\." + IMAGE + ")`", "g");

function walk(dir) {
  const out = [];
  if (!existsSync(dir)) return out;
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) out.push(...walk(p));
    else if (SOURCE_EXT.test(e.name)) out.push(p);
  }
  return out;
}

/** Values each dynamic image template can take, derived from the code itself. */
const RESOLVERS = {
  // components/StudyArt.tsx — the `scene` prop's union type is the full list.
  "/illustrations/${scene}-pastel.webp": (root) => {
    const src = readFileSync(path.join(root, "components/StudyArt.tsx"), "utf8");
    const union = src.match(/scene:\s*((?:"[a-z-]+"\s*\|?\s*)+)/)?.[1] ?? "";
    return [...union.matchAll(/"([a-z-]+)"/g)].map((m) => `/illustrations/${m[1]}-pastel.webp`);
  },
  // components/MemoryCue.tsx — every atlas number used in lib/palace.ts.
  "/illustrations/palace-${p.atlas}.webp": (root) => {
    const src = readFileSync(path.join(root, "lib/palace.ts"), "utf8");
    const nums = new Set([...src.matchAll(/atlas:\s*(\d+)/g)].map((m) => m[1]));
    return [...nums].map((n) => `/illustrations/palace-${n}.webp`);
  },
};

export function runtimeImages(root = ROOT) {
  const refs = new Map(); // url -> Set(files)
  const failures = [];
  const add = (url, file) => {
    if (!refs.has(url)) refs.set(url, new Set());
    refs.get(url).add(file);
  };
  for (const d of SOURCE_DIRS) {
    for (const f of walk(path.join(root, d))) {
      const rel = path.relative(root, f);
      const src = readFileSync(f, "utf8");
      for (const m of src.matchAll(TEMPLATE)) {
        const resolve = RESOLVERS[m[1]];
        if (!resolve) {
          failures.push(`image: ${rel} builds ${m[1]} at runtime and no resolver lists its values — add one to scripts/runtime-images.mjs`);
          continue;
        }
        const urls = resolve(root);
        if (!urls.length) failures.push(`image: resolver for ${m[1]} found no values`);
        for (const u of urls) add(u, rel);
      }
      for (const m of src.matchAll(LITERAL)) {
        if (m[1].includes("${")) continue;
        add(m[1], rel);
      }
    }
  }
  return { refs, failures };
}

/** Check every runtime image exists in public/ and, if built, in out/. */
export function checkRuntimeImages(root = ROOT, { out = "out" } = {}) {
  const { refs, failures } = runtimeImages(root);
  const outDir = path.join(root, out);
  const built = existsSync(outDir) && statSync(outDir).isDirectory();
  for (const [url, files] of refs) {
    const from = [...files].join(", ");
    if (!existsSync(path.join(root, "public", url))) {
      failures.push(`image: ${url} is used at runtime by ${from} but public${url} is missing`);
    } else if (built && !existsSync(path.join(outDir, url))) {
      failures.push(`image: ${url} is used at runtime by ${from} but out${url} is missing`);
    }
  }
  return { refs, failures };
}
