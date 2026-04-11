// public/sw.js
const CACHE_NAME = "v1";
const ASSETS_TO_CACHE = [
  "/",
  "/index.html",
  "/style.css",
  "/script.js",
  "/globalStyle.css",
  "/config.json",
  "/startingLocation/index.html",
  "/startingLocation/style.css",
  "/startingLocation/script.js",
  "/auto/index.html",
  "/auto/style.css",
  "/auto/script.js",
  "/teleop/index.html",
  "/teleop/style.css",
  "/teleop/script.js",
  "/name.js",
  "/endgame/style.css",
  "/endgame/script.js",
  "/submit/index.html",
  "/submit/style.css",
  "/qrcode.min.js",
  "/submit",
  "/teleop",
  "/auto",
  "/startingLocation/",
  "/endgame",
  "/startingLocation",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS_TO_CACHE)),
  );
  self.skipWaiting();
});

self.addEventListener("fetch", (event) => {
  if (event.request.mode === "navigate") {
    const url = new URL(event.request.url);
    if (url.pathname !== "/") {
      event.respondWith(fetch(event.request));
      return;
    }
    event.respondWith(
      caches.match(event.request).then((response) => {
        return response || fetch(event.request);
      }),
    );
    return;
  }

  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    }),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            console.log("Deleting old cache:", cache);
            return caches.delete(cache);
          }
        }),
      );
    }),
  );
});
