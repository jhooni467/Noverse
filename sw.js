const CACHE_NAME = "noverse-v0.2.0";

const FILES = [
  "./",
  "./index.html",
  "./manifest.json",
  "./css/styles.css",
  "./core/game-manager.js",
  "./js/app.js"
];

self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(FILES))
  );
  self.skipWaiting();
});

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(key => key.startsWith("noverse-") && key !== CACHE_NAME)
          .map(key => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", event => {
  if (event.request.method !== "GET") return;

  const requestURL = new URL(event.request.url);
  if (requestURL.origin !== self.location.origin) return;

  event.respondWith(
    caches.match(event.request).then(cached => {
      if (cached) return cached;

      return fetch(event.request).then(response => {
        if (response.ok) {
          const copy = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, copy));
        }
        return response;
      });
    }).catch(() => {
      if (event.request.mode === "navigate") {
        return caches.match("./index.html");
      }
      return new Response("", { status: 503, statusText: "Offline" });
    })
  );
});
