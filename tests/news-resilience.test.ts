import test from "node:test";
import assert from "node:assert/strict";
import worker, { type DB } from "../worker/index.ts";

const db: DB = {
  prepare() { return { bind() { return this; }, async run() {}, async all<T>() { return { results: [] as T[] }; } }; },
  async batch() {},
};
const env = { NEWS: db, ASSETS: { async fetch() { return new Response("asset"); } } };

async function withCache(cache: unknown, run: () => Promise<void>) {
  const prior = Object.getOwnPropertyDescriptor(globalThis, "caches");
  Object.defineProperty(globalThis, "caches", { configurable: true, value: { default: cache } });
  try { await run(); }
  finally { if (prior) Object.defineProperty(globalThis, "caches", prior); else Reflect.deleteProperty(globalThis, "caches"); }
}

test("news stays available when the optional edge cache cannot read", async () => {
  await withCache({ async match() { throw new Error("cache unavailable"); }, async put() {} }, async () => {
    const response = await worker.fetch(new Request("https://test/api/news"), env);
    assert.equal(response.status, 200);
    assert.deepEqual((await response.json() as { headlines: unknown[] }).headlines, []);
  });
});

test("cache write failure cannot turn a successful database read into a news outage", async () => {
  await withCache({ async match() { return undefined; }, async put() { throw new Error("cache capacity"); } }, async () => {
    for (const method of ["GET", "HEAD"]) {
      const response = await worker.fetch(new Request("https://test/api/news", { method }), env);
      assert.equal(response.status, 200, method);
      assert.equal(response.headers.get("Cache-Control"), "public, max-age=300");
      if (method === "HEAD") assert.equal(await response.text(), "");
    }
  });
});

test("database failure still returns an explicit uncached outage", async () => {
  await withCache({ async match() {}, async put() { throw new Error("should not cache an outage"); } }, async () => {
    const response = await worker.fetch(new Request("https://test/api/news"), { ...env, NEWS: { ...db, prepare() { throw new Error("db unavailable"); } } });
    assert.equal(response.status, 503);
    assert.equal(response.headers.get("Cache-Control"), null);
  });
});
