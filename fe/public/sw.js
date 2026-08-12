importScripts(
  "https://storage.googleapis.com/workbox-cdn/releases/6.5.4/workbox-sw.js",
);

if (!self.workbox) {
  console.error("[SW] Workbox failed to load");
  self.addEventListener("activate", () => self.clients.claim());
  return;
}

// Bump versi saat aturan caching berubah agar cache lama ikut dibersihkan
// saat activate (termasuk cache lama yang mungkin menyimpan data auth).
const CACHE_VERSION = "v2";

const { clientsClaim } = workbox.core;
const { registerRoute } = workbox.routing;
const { CacheFirst, NetworkFirst, StaleWhileRevalidate } = workbox.strategies;
const { ExpirationPlugin } = workbox.expiration;

clientsClaim();

console.log("[SW] Service Worker Starting...");

// Navigasi halaman: NetworkFirst + fallback cache offline.
registerRoute(
  ({ request }) => request.mode === "navigate",
  new NetworkFirst({
    cacheName: `html-cache-${CACHE_VERSION}`,
    plugins: [
      new ExpirationPlugin({
        maxEntries: 32,
        maxAgeSeconds: 24 * 60 * 60,
      }),
    ],
  }),
);

// API caching — KEAMANAN TOKEN:
// - HANYA method GET yang dicache. POST/PUT/PATCH/DELETE TIDAK PERNAH dicache
//   (termasuk login, refresh-token, logout — responsnya memuat token/kredensial).
// - Endpoint auth (/api/auth/*) dilewati total (network-only) meskipun GET.
// - Hanya respons sukses (2xx) yang masuk cache — 401/4xx/5xx TIDAK dicache,
//   sehingga alur refresh-token di client-http tetap berjalan normal.
// - Service worker TIDAK bisa membaca/menulis document.cookie (tanpa DOM),
//   jadi penulisan token ke cookie ditangani halaman (client-http / auth-refresh).
registerRoute(
  ({ url, request }) =>
    url.pathname.startsWith("/api/") &&
    !url.pathname.startsWith("/api/auth/") &&
    request.method === "GET",
  new NetworkFirst({
    cacheName: `api-cache-${CACHE_VERSION}`,
    networkTimeoutSeconds: 10,
    plugins: [
      new ExpirationPlugin({
        maxEntries: 50,
        maxAgeSeconds: 5 * 60,
      }),
      {
        cacheWillUpdate: async ({ response }) => {
          return response && response.ok ? response : null;
        },
      },
    ],
  }),
);

// Static assets: script & style (StaleWhileRevalidate).
registerRoute(
  ({ request }) =>
    request.destination === "script" || request.destination === "style",
  new StaleWhileRevalidate({
    cacheName: `static-cache-${CACHE_VERSION}`,
    plugins: [
      new ExpirationPlugin({
        maxEntries: 100,
        maxAgeSeconds: 30 * 24 * 60 * 60,
      }),
    ],
  }),
);

// Gambar (CacheFirst, kecuali favicon).
registerRoute(
  ({ request, url }) =>
    request.destination === "image" && !url.pathname.startsWith("/favicon"),
  new CacheFirst({
    cacheName: `image-cache-${CACHE_VERSION}`,
    plugins: [
      new ExpirationPlugin({
        maxEntries: 100,
        maxAgeSeconds: 60 * 24 * 60 * 60,
      }),
    ],
  }),
);

// Font (CacheFirst, jangka panjang).
registerRoute(
  ({ request }) => request.destination === "font",
  new CacheFirst({
    cacheName: `font-cache-${CACHE_VERSION}`,
    plugins: [
      new ExpirationPlugin({
        maxEntries: 50,
        maxAgeSeconds: 365 * 24 * 60 * 60,
      }),
    ],
  }),
);

self.addEventListener("install", () => {
  console.log("[SW] Installing");
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  console.log("[SW] Activating");

  const validCaches = [
    `html-cache-${CACHE_VERSION}`,
    `api-cache-${CACHE_VERSION}`,
    `static-cache-${CACHE_VERSION}`,
    `image-cache-${CACHE_VERSION}`,
    `font-cache-${CACHE_VERSION}`,
  ];

  event.waitUntil(
    caches
      .keys()
      .then((names) =>
        Promise.all(
          names
            .filter((name) => !validCaches.includes(name))
            .map((name) => caches.delete(name)),
        ),
      ),
  );
});

self.addEventListener("message", (event) => {
  if (event.data?.type === "SKIP_WAITING") {
    console.log("[SW] SKIP_WAITING received");
    self.skipWaiting();
  }
});

workbox.core.skipWaiting();
workbox.core.clientsClaim();

console.log("[SW] Service Worker Ready");
