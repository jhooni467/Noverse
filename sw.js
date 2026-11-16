const CACHE_NAME = "noverse-v0.8.1";
const FILES = [
  "./", "./index.html", "./manifest.json", "./css/styles.css",
  "./icons/noverse-192.svg", "./icons/noverse-512.svg",
  "./core/game-manager.js", "./games/registry.js", "./games/star-catcher.js", "./games/color-cascade.js", "./games/cloud-hopper.js", "./js/app.js"
];
self.addEventListener("install", event => {
  event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(FILES)));
  self.skipWaiting();
});
self.addEventListener("activate", event => {
  event.waitUntil(caches.keys().then(keys =>
    Promise.all(keys.filter(key => key.startsWith("noverse-") && key !== CACHE_NAME).map(key => caches.delete(key)))
  ));
  self.clients.claim();
});
self.addEventListener("fetch", event => {
  if (event.request.method !== "GET") return;
  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin) return;
  event.respondWith(caches.match(event.request).then(cached => {
    if (cached) return cached;
    return fetch(event.request).then(response => {
      if (response.ok) { const copy = response.clone(); caches.open(CACHE_NAME).then(cache => cache.put(event.request, copy)); }
      return response;
    });
  }).catch(() => event.request.mode === "navigate"
    ? caches.match("./index.html")
    : new Response("", {status:503, statusText:"Offline"})));
});