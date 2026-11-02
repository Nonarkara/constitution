import { readdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";

/** Include nested study-guide pages, not just the top-level route folders. */
export async function builtRoutes(root) {
  const routes = [];
  async function walk(dir, prefix) {
    if (existsSync(path.join(dir, "index.html"))) routes.push(`${prefix}/`);
    for (const entry of await readdir(dir, { withFileTypes: true })) {
      if (!entry.isDirectory() || entry.name.startsWith("_") || entry.name.startsWith(".") || entry.name === "404") continue;
      await walk(path.join(dir, entry.name), `${prefix}/${entry.name}`);
    }
  }
  await walk(root, "");
  return routes.sort();
}
