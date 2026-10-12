/* Build fills these constants with the exact static shell and its revision. */
const CACHE = "constitution-__BUILD_VERSION__";
const AUDIO_CACHE = "constitution-audio-__AUDIO_VERSION__";
const PRECACHE = /*__PRECACHE__*/ [
  "/",
  "/learn/",
  "/rights/",
  "/cheatsheet/",
  "/section/",
  "/review/",
  "/sources/",
  "/settings/",
  "/icon.svg",
  "/manifest.webmanifest",
];
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE).then(async (cache) => {
      await cache.addAll(PRECACHE);
      await self.skipWaiting();
    }),
  );
});
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter(
              (key) =>
                key.startsWith("constitution-") &&
                key !== CACHE &&
                key !== AUDIO_CACHE,
            )
            .map((key) => caches.delete(key)),
        ),
      )
      .then(() => self.clients.claim()),
  );
});
async function cachedResponse(request) {
  const url = new URL(request.url),
    cache = await caches.open(
      url.pathname.startsWith("/audio/") ? AUDIO_CACHE : CACHE,
    );
  const response = await cache.match(request, { ignoreSearch: true });
  if (!response) return null;
  const range = request.headers.get("Range");
  if (!range) return response;
  const match = /^bytes=(\d*)-(\d*)$/.exec(range);
  if (!match) return new Response(null, { status: 416 });
  const data = await response.arrayBuffer(),
    length = data.byteLength;
  let start = match[1]
      ? Number(match[1])
      : Math.max(0, length - Number(match[2])),
    end = match[1] ? (match[2] ? Number(match[2]) : length - 1) : length - 1;
  if (
    !Number.isSafeInteger(start) ||
    !Number.isSafeInteger(end) ||
    start > end ||
    start >= length ||
    end < 0
  )
    return new Response(null, {
      status: 416,
      headers: { "Content-Range": `bytes */${length}` },
    });
  end = Math.min(end, length - 1);
  return new Response(data.slice(start, end + 1), {
    status: 206,
    headers: {
      "Content-Type": response.headers.get("Content-Type") || "audio/mpeg",
      "Content-Range": `bytes ${start}-${end}/${length}`,
      "Content-Length": String(end - start + 1),
      "Accept-Ranges": "bytes",
    },
  });
}
self.addEventListener("fetch", (event) => {
  const request = event.request,
    url = new URL(request.url);
  if (request.method !== "GET" || url.origin !== self.location.origin) return;
  event.respondWith(
    fetch(request)
      .then((response) => {
        if (
          response.status === 200 &&
          response.type === "basic" &&
          !request.headers.has("Range") &&
          !url.pathname.startsWith("/audio/")
        ) {
          const copy = response.clone();
          event.waitUntil(
            caches
              .open(CACHE)
              .then((cache) => cache.put(request, copy))
              .catch(() => {}),
          );
        }
        return response;
      })
      .catch(
        async () =>
          (await cachedResponse(request)) ||
          new Response("Offline: reconnect to download this content.", {
            status: 503,
            headers: { "Content-Type": "text/plain; charset=utf-8" },
          }),
      ),
  );
});
self.addEventListener("message", (event) => {
  const port = event.ports?.[0];
  if (event.data?.type === "OFFLINE_STATUS") {
    event.waitUntil(
      caches
        .open(CACHE)
        .then(async (cache) => {
          const matches = await Promise.all(
            PRECACHE.map((url) => cache.match(url)),
          );
          port?.postMessage({ ready: matches.every(Boolean), version: CACHE });
        })
        .catch(() => port?.postMessage({ ready: false })),
    );
  }
  if (["SAVE_AUDIO", "AUDIO_STATUS"].includes(event.data?.type)) {
    let url;
    try {
      url = new URL(event.data.url, self.location.origin);
    } catch {
      port?.postMessage({ ok: false, cached: false });
      return;
    }
    if (
      url.origin !== self.location.origin ||
      !/^\/audio\/(th|en|zh)\/\d{3}\.mp3$/.test(url.pathname)
    ) {
      port?.postMessage({ ok: false, cached: false });
      return;
    }
    event.waitUntil(
      (async () => {
        const cache = await caches.open(AUDIO_CACHE);
        const cached = await cache.match(url.pathname);
        if (event.data.type === "AUDIO_STATUS") {
          port?.postMessage({ cached: Boolean(cached) });
          return;
        }
        if (!cached) {
          const response = await fetch(url.href);
          if (response.status !== 200) throw new Error("Audio download failed");
          await cache.put(url.pathname, response);
        }
        port?.postMessage({ ok: true });
      })().catch(() => port?.postMessage({ ok: false, cached: false })),
    );
  }
});
