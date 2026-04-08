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
  "/endgame/index.html",
  "/endgame/style.css",
  "/endgame/script.js",
  "/submit/index.html",
  "/submit/style.css",
  "/submit/script.js",
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
});

// public/sw.js
// public/sw.js
// public/sw.js
self.addEventListener("fetch", (event) => {
  if (event.request.mode === "navigate") {
    event.respondWith(
      caches.match(event.request).then((response) => {
        return response;
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
  // This tells the SW to take control of all open pages (tabs) right now
  event.waitUntil(self.clients.claim());
});
caches.open("v1").then((cache) => {
  cache.keys().then((keys) => {
    console.log("CACHED URLS:");
    keys.forEach((req) => console.log(req.url));
  });
});
