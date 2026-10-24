const CACHE_NAME = "intalent-mobile-v2.4";
const ASSETS_TO_CACHE = [
  "/mobile.html",
  "/index.html",
  "/styles.css",
  "/i18n.js",
  "/assets/logos/logo-dark.png",
  "/assets/logos/logo-white-purple.png",
  "/assets/logos/logo-white-black.png"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS_TO_CACHE))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;
  event.respondWith(
    fetch(event.request).catch(() => caches.match(event.request))
  );
});
