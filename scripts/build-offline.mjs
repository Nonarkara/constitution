import { readdir, readFile, writeFile, rm } from "node:fs/promises";
import { join, relative } from "node:path";
import { createHash } from "node:crypto";
const root = "out";
async function walk(directory) {
  const files = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) files.push(...(await walk(path)));
    else files.push(path);
  }
  return files;
}

/**
 * The export carries no Finder metadata.
 *
 * macOS writes a .DS_Store into any folder a person opens in Finder, and the
 * export copies `public/` wholesale — so a folder that was merely LOOKED AT
 * put a file named `.DS_Store` into the site, where it was precached by the
 * offline shell and listed in the manifest. The release gate catches it, which
 * is why it was caught; but a gate that catches it after the build means
 * every build on a machine with a Finder open is a build that has to be
 * rebuilt somewhere else.
 *
 * So the export is cleaned here, where the export is made. A file that names
 * the operating system it came from is not part of a constitution.
 */
const FINDER_JUNK = /(^|\/)\._/;
for (const file of await walk(root)) {
  const name = file.slice(root.length);
  if (name.endsWith("/.DS_Store") || FINDER_JUNK.test(name)) {
    await rm(file, { force: true });
  }
}

const paths = (await walk(root))
  .map((path) => relative(root, path).replaceAll("\\", "/"))
  .filter(
    (path) =>
      !path.startsWith("audio/") &&
      !path.startsWith("podcast/") &&
      !path.startsWith(".openai/") &&
      path !== "sw.js" &&
      path !== "404.html" && // the host redirects it to /404/, which is precached
      // Host config, crawler files and share art: never needed to study offline.
      !["_headers", "robots.txt", "sitemap.xml", "podcast-cover.png"].includes(path) &&
      !path.startsWith("opengraph-image") &&

      path !== "offline-manifest.json",
  )
  .sort();
const hash = createHash("sha256");
for (const path of paths) {
  hash.update(path);
  hash.update(await readFile(join(root, path)));
}
const version = hash.digest("hex").slice(0, 16),
  urls = paths.map((path) =>
    path.endsWith("index.html") ? "/" + path.slice(0, -10) : "/" + path,
  );
// A wording or recording correction invalidates saved audio, while UI-only builds retain it.
const audioVersion = createHash("sha256")
  .update(await readFile("data/audio-recordings.json"))
  .digest("hex").slice(0, 16);
const source = (await readFile("public/sw.js", "utf8"))
  .replace("__BUILD_VERSION__", version)
  .replace("__AUDIO_VERSION__", audioVersion)
  .replace(
    /\/\*__PRECACHE__\*\/[\s\S]*?;/,
    JSON.stringify([...new Set(urls)]) + ";",
  );
await writeFile(join(root, "sw.js"), source);
await writeFile(
  join(root, "offline-manifest.json"),
  JSON.stringify({ version, audioVersion, assets: [...new Set(urls)] }, null, 2) + "\n",
);
console.log(
  `Offline shell: ${urls.length} assets, revision ${version}; audio saved only by user choice.`,
);
