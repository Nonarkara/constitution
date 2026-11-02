import test from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, mkdir, writeFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { builtRoutes } from "../scripts/built-routes.mjs";

test("rendered gates include nested pages and exclude build internals", async () => {
  const root = await mkdtemp(path.join(tmpdir(), "constitution-routes-"));
  try {
    for (const route of ["", "bible", "bible/amendment/deeper", "_next/internal", ".hidden", "404", "assets"]) {
      const dir = path.join(root, route);
      await mkdir(dir, { recursive: true });
      if (route !== "assets") await writeFile(path.join(dir, "index.html"), "<h1>Fixture</h1>");
    }
    assert.deepEqual(await builtRoutes(root), ["/", "/bible/", "/bible/amendment/deeper/"]);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});
