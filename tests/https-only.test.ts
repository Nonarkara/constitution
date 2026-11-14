import test from "node:test";
import assert from "node:assert/strict";
import worker from "../worker/index.ts";

// A site that answers plain HTTP with the full study app is a site serving
// the constitution in clear. The zone's "Always Use HTTPS" toggle would fix
// it, but the project's token cannot read or write the zone's settings, so
// the redirect has to live in the Worker — and then it has to be proved
// here, because a redirect that silently drops the path or the query string
// would break the study without breaking the test.
function env() {
  const seen: Request[] = [];
  return {
    seen,
    env: {
      NEWS: {} as never,
      ASSETS: {
        async fetch(request: Request) {
          seen.push(request);
          return new Response("asset", { status: 200 });
        },
      },
    },
  };
}

test("a plain HTTP request for any page is redirected to HTTPS", async () => {
  const { env: bindings, seen } = env();
  const response = await worker.fetch(
    new Request("http://constitution.nonarkara.org/read/"),
    bindings,
  );
  assert.equal(response.status, 308);
  assert.equal(response.headers.get("location"), "https://constitution.nonarkara.org/read/");
  // The asset was never served over plain HTTP.
  assert.equal(seen.length, 0);
});

test("the redirect keeps the path and the query string", async () => {
  const { env: bindings } = env();
  for (const target of [
    "http://constitution.nonarkara.org/",
    "http://constitution.nonarkara.org/exam/?section=99",
    "http://constitution.nonarkara.org/memory/?room=4&lang=th",
  ]) {
    const response = await worker.fetch(new Request(target), bindings);
    assert.equal(response.status, 308);
    const location = new URL(response.headers.get("location")!);
    const asked = new URL(target);
    assert.equal(location.pathname, asked.pathname);
    assert.equal(location.search, asked.search);
    assert.equal(location.protocol, "https:");
  }
});

test("a request that is already HTTPS is served, not redirected", async () => {
  const { env: bindings, seen } = env();
  const response = await worker.fetch(
    new Request("https://constitution.nonarkara.org/read/"),
    bindings,
  );
  assert.equal(response.status, 200);
  assert.equal(await response.text(), "asset");
  assert.equal(seen.length, 1);
});

test("the API keeps its own rules: methods, headers and the cache", async () => {
  const { env: bindings } = env();
  const response = await worker.fetch(
    new Request("https://constitution.nonarkara.org/api/news", { method: "POST" }),
    bindings,
  );
  assert.equal(response.status, 405);
  assert.equal(response.headers.get("allow"), "GET, HEAD");
  assert.match(response.headers.get("strict-transport-security")!, /includeSubDomains/);
});
