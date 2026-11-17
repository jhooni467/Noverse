const VERSION = "1.16";
const CACHE_NAME = `noverse-v${VERSION}`;
const OPTIONAL_FILES = [
  "./games/quasar/assets/music/Next_Round_Quasar.mp3"
];

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
  "./games/quasar.js?v=" + VERSION,
  "./games/quasar/index.html",
  "./images/experiences/quasar-logo.svg",
  "./images/experiences/quasar-1.webp",
  "./images/experiences/quasar-2.webp",
  "./images/experiences/quasar-4.webp",
  "./js/app.js?v=" + VERSION,
  "./js/store.js?v=" + VERSION,
  "./updates.json",
  "./css/store.css?v=" + VERSION
];

self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(async cache => {
        await cache.addAll(FILES);
        // Audio opcional: si el MP3 aún no está publicado, no debe bloquear
        // la instalación ni la actualización del service worker.
        await Promise.all(OPTIONAL_FILES.map(async file => {
          try { await cache.add(file); } catch (error) {
            console.warn("NOVERSE: recurso opcional aún no disponible:", file);
          }
        }));
      })
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

  // La navegación del juego embebido es un documento local independiente.
  // Se cachea con su propia URL y nunca se sustituye por la portada de NOVERSE.
  if (request.mode === "navigate" && url.pathname.endsWith("/games/quasar/index.html")) {
    event.respondWith((async () => {
      const cached = await caches.match(request);
      try {
        const response = await fetch(request, { cache: "no-store" });
        if (response && response.ok) {
          const copy = response.clone();
          const cache = await caches.open(CACHE_NAME);
          await cache.put(request, copy);
        }
        return response;
      } catch (error) {
        return cached || new Response("QUASAR no está disponible sin conexión.", {
          status: 503,
          headers: { "Content-Type": "text/plain; charset=utf-8" }
        });
      }
    })());
    return;
  }

  // Las navegaciones de NOVERSE siempre consultan primero la versión publicada.
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
