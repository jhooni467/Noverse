const VERSION = "1.10";
const CACHE_NAME = `noverse-v${VERSION}`;
const FILES = [
  "./?v=" + VERSION,
  "./index.html?v=" + VERSION,
  "./manifest.json?v=" + VERSION,
  "./css/styles.css?v=" + VERSION,
  "./icons/noverse-192.svg",
  "./icons/noverse-512.svg",
  "./icons/noverse-mark.svg",

  "./images/noverse-app-background.svg",
  "./core/ambient-audio.js?v=" + VERSION,
  "./core/game-manager.js?v=" + VERSION,
  "./games/registry.js?v=" + VERSION,
  "./games/star-catcher.js?v=" + VERSION,
  "./games/color-cascade.js?v=" + VERSION,
  "./games/cloud-hopper.js?v=" + VERSION,
  "./games/echo-six.js?v=" + VERSION,
  "./games/pasteluna.js?v=" + VERSION,
  "./js/app.js?v=" + VERSION,
  "./js/store.js?v=" + VERSION,
  "./css/store.css?v=" + VERSION
];

self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(FILES))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", event => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(
      keys.filter(key => key.startsWith("noverse-") && key !== CACHE_NAME)
        .map(key => caches.delete(key))
    );
    await self.clients.claim();
  })());
});

self.addEventListener("fetch", event => {
  const request = event.request;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  // Las navegaciones siempre consultan primero la versión publicada.
  if (request.mode === "navigate") {
    event.respondWith((async () => {
      try {
        const response = await fetch(request, { cache: "no-store" });
        if (response && response.ok) {
          const copy = response.clone();
          const cache = await caches.open(CACHE_NAME);
          await cache.put("./index.html?v=" + VERSION, copy);
        }
        return response;
      } catch (error) {
        return (await caches.match("./index.html?v=" + VERSION))
          || (await caches.match("./index.html"))
          || new Response("NOVERSE no está disponible sin conexión.", {
            status: 503,
            headers: { "Content-Type": "text/plain; charset=utf-8" }
          });
      }
    })());
    return;
  }

  // Los recursos versionados pueden servirse desde caché sin quedarse obsoletos.
  event.respondWith((async () => {
    const cached = await caches.match(request);
    if (cached) return cached;

    try {
      const response = await fetch(request);
      if (response && response.ok) {
        const copy = response.clone();
        const cache = await caches.open(CACHE_NAME);
        await cache.put(request, copy);
      }
      return response;
    } catch (error) {
      return new Response("", { status: 503, statusText: "Offline" });
    }
  })());
});
