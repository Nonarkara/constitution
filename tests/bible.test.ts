import test from "node:test";
import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";

const dir = new URL("../data/bible/", import.meta.url);
const chapters = readdirSync(dir).filter((f) => f.endsWith(".json")).map((f) => ({ f, j: JSON.parse(readFileSync(new URL(f, dir), "utf8")) }));

test("every study-guide chapter is bilingual, links only real sections and ends with a self-check", () => {
  assert.ok(chapters.length >= 10);
  assert.equal(new Set(chapters.map((c) => c.j.order)).size, chapters.length);
  for (const { f, j } of chapters) {
    for (const l of ["th", "en"]) assert.ok(j.title[l] && j.lede[l], `${f} title/lede ${l}`);
    assert.ok(j.blocks.some((b: { kind: string }) => b.kind === "check"), `${f} has no self-check`);
    const all = JSON.stringify(j);
    for (const m of all.matchAll(/(?:มาตรา\s*|[Ss]ection\s+)(\d+)/g)) assert.ok(+m[1] >= 1 && +m[1] <= 279, `${f}: links section ${m[1]}`);
    for (const b of j.blocks) if (b.body) for (const l of ["th", "en"]) assert.ok(b.body[l]?.trim(), `${f}: empty ${l} body`);
  }
});
