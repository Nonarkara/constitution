import { readdir, readFile, writeFile } from "node:fs/promises";
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
const paths = (await walk(root))
  .map((path) => relative(root, path).replaceAll("\\", "/"))
  .filter(
    (path) =>
      !path.startsWith("audio/") &&
      !path.startsWith("podcast/") &&
      !path.startsWith(".openai/") &&
      path !== "sw.js" &&
      path !== "404.html" && // the host redirects it to /404/, which is precached

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
