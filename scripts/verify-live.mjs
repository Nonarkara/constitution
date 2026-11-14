#!/usr/bin/env node
/**
 * PROVE THE DEPLOYED BYTES ARE THE ONES MEASURED.
 *
 * A deploy is not finished when `wrangler deploy` says it is finished. It is
 * finished when the bytes the public domain serves are the bytes the receipt
 * was measured on — because a receipt measured on one build and published on
 * another is a receipt about a site nobody is reading.
 *
 * So this compares the two, file by file:
 *
 *   1. every page body the build has, against the live domain;
 *   2. every asset the offline manifest lists, byte for byte;
 *   3. the site's own claim to be HTTPS-only, answered by asking it over
 *      plain HTTP — the one check that cannot be faked by a cache;
 *   4. the Thai text, which is the thing the whole re-spacing was for.
 *
 * Usage:
 *   node scripts/verify-live.mjs --out design/msh-evidence/2026-11-14/live-release.json
 *   node scripts/verify-live.mjs --base https://constitution.nonarkara.org
 */
import { createHash } from "node:crypto";
import { readFile, writeFile, mkdir } from "node:fs/promises";
import { existsSync, statSync } from "node:fs";
import { execFileSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const args = process.argv.slice(2);
const argOf = (name, fallback) => {
  const i = args.indexOf(name);
  return i === -1 ? fallback : args[i + 1];
};
const BASE = String(argOf("--base", "https://constitution.nonarkara.org")).replace(/\/+$/, "");
const OUT = argOf("--out", null);
const BUILD = path.join(ROOT, "out");

const sha256 = (buf) => createHash("sha256").update(buf).digest("hex");
const failures = [];
const note = (ok, message) => {
  if (!ok) failures.push(message);
  return ok;
};

async function get(url, method = "GET") {
  // A machine under load runs out of ephemeral ports, and the public domain
  // is asked for several hundred files. A release check that dies of a
  // socket error reports nothing about the release, so it is asked again:
  // three times, with a moment between, because the answer to "is this file
  // the one that ships" must be an answer and not a shrug.
  let lastError = null;
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const res = await fetch(url, { method, redirect: "manual" });
      const body = method === "HEAD" ? Buffer.alloc(0) : Buffer.from(await res.arrayBuffer());
      return { status: res.status, headers: res.headers, body };
    } catch (error) {
      lastError = error;
      await new Promise((r) => setTimeout(r, attempt * 750));
    }
  }
  throw lastError;
}

/**
 * The URL a path is actually served at.
 *
 * A build's file names can carry characters that are legal in a path and not
 * legal unencoded in a URL — Next.js writes `app/bible/[id]/page-*.js`, and
 * the export's text manifests carry `$`. Asked for as they are written, the
 * public domain answers 307 and the comparison measures the redirect instead
 * of the file. So the path is encoded, segment by segment, and the file is
 * asked for at the address it is served from.
 */
function servedUrl(base, asset) {
  const encoded = asset
    .split("/")
    .map((segment) => encodeURIComponent(segment))
    .join("/");
  return base + encoded;
}

const manifest = JSON.parse(await readFile(path.join(BUILD, "offline-manifest.json"), "utf8"));

// ---- 1. every page body the build has -------------------------------------
const pageRoutes = [];
async function walk(dir, prefix) {
  const { readdir } = await import("node:fs/promises");
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue;
    if (entry.name.startsWith("_") || entry.name.startsWith(".") || entry.name === "404") continue;
    const sub = path.join(dir, entry.name);
    if (existsSync(path.join(sub, "index.html"))) pageRoutes.push(`${prefix}/${entry.name}/`);
    await walk(sub, `${prefix}/${entry.name}`);
  }
}
if (existsSync(path.join(BUILD, "index.html"))) pageRoutes.push("/");
await walk(BUILD, "");
pageRoutes.sort();

let bodiesMatched = 0;
const bodyMismatches = [];
for (const route of pageRoutes) {
  const local = await readFile(path.join(BUILD, route.replace(/^\//, ""), "index.html"));
  const live = await get(BASE + route);
  if (live.status === 200 && sha256(live.body) === sha256(local)) bodiesMatched++;
  else bodyMismatches.push({ route, live: live.status, liveBytes: live.body.length });
}
note(
  bodiesMatched === pageRoutes.length,
  `${pageRoutes.length - bodiesMatched} page body/bodies differ from the build`,
);

// ---- 2. every asset the manifest lists -------------------------------------
// The manifest lists PAGES as routes (a directory) and files as themselves.
// A route is read as the index.html inside it, which is the body the public
// domain answers with.
const assets = [...manifest.assets].filter((a) => a !== "/sw.js");
let assetsMatched = 0;
const assetMismatches = [];
for (const asset of assets) {
  let file = path.join(BUILD, asset.replace(/^\//, ""));
  try {
    if (statSync(file).isDirectory()) file = path.join(file, "index.html");
  } catch {
    assetMismatches.push({ asset, reason: "not in the build" });
    continue;
  }
  if (!existsSync(file)) {
    assetMismatches.push({ asset, reason: "not in the build" });
    continue;
  }
  const local = await readFile(file);
  const live = await get(servedUrl(BASE, asset));
  if (live.status === 200 && sha256(live.body) === sha256(local)) assetsMatched++;
  else assetMismatches.push({ asset, live: live.status, liveBytes: live.body.length });
}
note(
  assetsMatched === assets.length,
  `${assets.length - assetsMatched} asset(s) differ from the build`,
);

// ---- 3. the site must answer plain HTTP with a redirect to HTTPS ----------
const plain = await get(`http://${BASE.replace(/^https?:\/\//, "")}/read/?section=99`);
const location = plain.headers.get("location") || "";
note(
  plain.status >= 300 && plain.status < 400 && location.startsWith("https://"),
  `plain HTTP answered ${plain.status} instead of redirecting to HTTPS`,
);
note(
  location.includes("/read/?section=99"),
  `the redirect dropped the path or the query string: ${location}`,
);

// ---- 4. the Thai, which is what the re-spacing was for --------------------
const chunk = assets.find((a) => /chunks\/.*\.js$/.test(a) && a.includes("1897-")) || assets.find((a) => /chunks\/.*\.js$/.test(a));
let thai = { checked: null };
if (chunk) {
  const live = await get(BASE + chunk);
  const text = live.body.toString("utf8");
  const respaced = "หน่วยงานปฏิเสธบริการเพียง เพราะผู้ขอ เป็นผู้หญิง";
  const before = "หน่วยงานปฏิเสธบริการเพียงเพราะผู้ขอเป็นผู้หญิง";
  thai = {
    chunk,
    respacedPresent: text.includes(respaced),
    preSpacingPresent: text.includes(before),
  };
  note(thai.respacedPresent, "the re-spaced Thai is not in the served bundle");
  note(!thai.preSpacingPresent, "the pre-re-spacing Thai is still in the served bundle");
}

// ---- the worker version, if wrangler can tell us ---------------------------
let workerVersion = null;
try {
  const out = execFileSync("npx", ["wrangler", "deployments", "list"], {
    cwd: ROOT,
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
  });
  // The deployments table is OLDEST first — it was checked, because recording
  // the oldest deployment as the live one would be a receipt about a version
  // that stopped serving months ago. The LAST Version ID is the newest.
  const ids = out.match(/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/g);
  if (ids && ids.length) workerVersion = ids[ids.length - 1];
} catch {
  /* the deployment list is a courtesy; the bytes are the proof */
}

const record = {
  base: BASE,
  verifiedAt: new Date().toISOString(),
  sourceCommit: execFileSync("git", ["rev-parse", "HEAD"], { cwd: ROOT, encoding: "utf8" }).trim(),
  workerVersion,
  revision: manifest.version,
  exportSha256: sha256(await readFile(path.join(BUILD, "offline-manifest.json"))),
  pageBodies: { matched: bodiesMatched, of: pageRoutes.length, mismatches: bodyMismatches },
  assets: { matched: assetsMatched, of: assets.length, mismatches: assetMismatches.slice(0, 20) },
  httpsOnly: {
    plainHttpStatus: plain.status,
    plainHttpLocation: location,
    keptPathAndQuery: location.includes("/read/?section=99"),
  },
  thai,
  verdict: failures.length === 0 ? "PASS" : "FAIL",
  failures,
};

const text = JSON.stringify(record, null, 2) + "\n";
if (OUT) {
  const file = path.resolve(ROOT, OUT);
  await mkdir(path.dirname(file), { recursive: true });
  await writeFile(file, text, "utf8");
}
process.stdout.write(text);
process.exitCode = failures.length === 0 ? 0 : 1;
