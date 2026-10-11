import test from "node:test";
import assert from "node:assert/strict";
import vm from "node:vm";
import { readFileSync } from "node:fs";
const source = readFileSync(
  new URL("../public/sw.js", import.meta.url),
  "utf8",
);
function worker() {
  const listeners: Record<string, (event: any) => void> = {},
    storage = new Map<string, Map<string, Response>>();
  let online = true;
  const assets = [
    "/section/",
    "/_next/app.js",
    "/_next/app.css",
    "/fonts/font.ttf",
  ];
  const context = {
    URL,
    Response,
    Promise,
    Number,
    Error,
    self: {
      location: { origin: "https://study.test" },
      addEventListener: (type: string, fn: (event: any) => void) =>
        (listeners[type] = fn),
      skipWaiting: async () => {},
      clients: { claim: async () => {} },
    },
    caches: {
      open: async (name: string) => {
        if (!storage.has(name)) storage.set(name, new Map());
        const bucket = storage.get(name)!;
        return {
          addAll: async (urls: string[]) => {
            for (const url of urls)
              bucket.set(url, new Response("cached " + url));
          },
          match: async (request: Request | string) =>
            bucket
              .get(
                typeof request === "string"
                  ? request
                  : new URL(request.url).pathname,
              )
              ?.clone(),
          put: async (request: Request | string, response: Response) =>
            bucket.set(
              typeof request === "string"
                ? request
                : new URL(request.url).pathname,
              response,
            ),
        };
      },
      keys: async () => [...storage.keys()],
      delete: async (name: string) => storage.delete(name),
    },
    fetch: async () => {
      if (!online) throw Error("offline");
      return new Response("online");
    },
  };
  vm.runInNewContext(
    source
      .replace("__BUILD_VERSION__", "test")
      .replace("__AUDIO_VERSION__", "current")
      .replace(/\/\*__PRECACHE__\*\/[\s\S]*?;/, JSON.stringify(assets) + ";"),
    context,
  );
  async function install() {
    let task: Promise<unknown> | undefined;
    listeners.install({
      waitUntil: (promise: Promise<unknown>) => (task = promise),
    });
    await task;
  }
  async function get(path: string, range?: string) {
    let task: Promise<Response> | undefined;
    listeners.fetch({
      request: new Request("https://study.test" + path, {
        headers: range ? { Range: range } : {},
      }),
      respondWith: (promise: Promise<Response>) => (task = promise),
      waitUntil: () => {},
    });
    return await task!;
  }
  async function activate() {
    let task;
    listeners.activate({ waitUntil: (promise: Promise<unknown>) => (task = promise) });
    await task;
  }
  return { install, activate, get, offline: () => (online = false), storage };
}
test("a first installation caches HTML and its JS/CSS/font dependencies before offline reload", async () => {
  const w = worker();
  await w.install();
  w.offline();
  for (const path of [
    "/section/?n=27",
    "/_next/app.js",
    "/_next/app.css",
    "/fonts/font.ttf",
  ]) {
    const response = await w.get(path);
    assert.equal(response.status, 200);
    assert.match(await response.text(), /cached/);
  }
  assert.equal((await w.get("/never-downloaded")).status, 503);
});
test("saved audio remains seekable offline and invalid ranges are rejected", async () => {
  const w = worker();
  await w.install();
  w.storage.set(
    "constitution-audio-current",
    new Map([
      [
        "/audio/th/027.mp3",
        new Response(new Uint8Array([1, 2, 3, 4, 5]), {
          headers: { "Content-Type": "audio/mpeg" },
        }),
      ],
    ]),
  );
  w.offline();
  let response = await w.get("/audio/th/027.mp3", "bytes=1-3");
  assert.equal(response.status, 206);
  assert.equal(response.headers.get("Content-Range"), "bytes 1-3/5");
  assert.deepEqual(
    [...new Uint8Array(await response.arrayBuffer())],
    [2, 3, 4],
  );
  response = await w.get("/audio/th/027.mp3", "bytes=-2");
  assert.deepEqual([...new Uint8Array(await response.arrayBuffer())], [4, 5]);
  assert.equal((await w.get("/audio/th/027.mp3", "bytes=99-100")).status, 416);
});

test("a corrected recording revision evicts old audio while retaining current downloads", async () => {
  const w = worker();
  w.storage.set("constitution-audio-old", new Map([["/audio/en/027.mp3", new Response("old wording")]]));
  w.storage.set("constitution-audio-current", new Map([["/audio/en/028.mp3", new Response("current wording")]]));
  await w.install();
  await w.activate();
  assert.equal(w.storage.has("constitution-audio-old"), false);
  w.offline();
  assert.equal((await w.get("/audio/en/027.mp3")).status, 503);
  assert.equal(await (await w.get("/audio/en/028.mp3")).text(), "current wording");
});
