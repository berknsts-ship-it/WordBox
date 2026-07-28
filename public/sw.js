const CACHE_NAME = "wordbox-v1";
const OFFLINE_URL = "/offline";

const PRECACHE_URLS = [
  OFFLINE_URL,
  "/manifest.webmanifest",
  "/icon-192.png",
  "/icon-512.png",
  "/favicon.svg",
  "/favicon.ico",
];

self.addEventListener("install", event => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache =>
      Promise.all(
        PRECACHE_URLS.map(url => cache.add(url).catch(() => {}))
      )
    )
  );
});

self.addEventListener("activate", event => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)));
      await self.clients.claim();
    })()
  );
});

function isStaticAsset(url) {
  return (
    url.pathname.startsWith("/_next/static/") ||
    url.pathname.startsWith("/icon-") ||
    url.pathname === "/favicon.ico" ||
    url.pathname === "/favicon.svg" ||
    url.pathname === "/apple-touch-icon.png" ||
    url.pathname === "/manifest.webmanifest"
  );
}

async function staleWhileRevalidate(request) {
  const cache = await caches.open(CACHE_NAME);
  const cached = await cache.match(request);
  const networkPromise = fetch(request)
    .then(response => {
      if (response && response.ok) cache.put(request, response.clone());
      return response;
    })
    .catch(() => undefined);
  return cached || (await networkPromise) || Response.error();
}

async function networkFirstNavigate(request) {
  try {
    return await fetch(request);
  } catch {
    const cache = await caches.open(CACHE_NAME);
    return (await cache.match(OFFLINE_URL)) || Response.error();
  }
}

// Only static, non-personalized assets are cached. Authenticated pages
// (tutor/student routes, API/RSC data) always go to the network so one
// user's session never leaks into another's cached response — offline
// navigation falls back to a generic offline page instead.
self.addEventListener("fetch", event => {
  const { request } = event;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  if (isStaticAsset(url)) {
    event.respondWith(staleWhileRevalidate(request));
    return;
  }

  if (request.mode === "navigate") {
    event.respondWith(networkFirstNavigate(request));
  }
});

self.addEventListener("push", event => {
  const data = event.data ? event.data.json() : {};
  event.waitUntil(
    self.registration.showNotification(data.title ?? "T-Kit", {
      body:  data.body  ?? "",
      icon:  data.icon  ?? "/icon-192.png",
      badge: data.badge ?? "/icon-192.png",
      data:  data.url   ? { url: data.url } : {},
      tag:   data.tag   ?? "tkit",
      renotify: true,
    })
  );
});

self.addEventListener("notificationclick", event => {
  event.notification.close();
  const url = event.notification.data?.url ?? "/";
  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then(list => {
      for (const client of list) {
        if (client.url.includes(self.location.origin) && "focus" in client)
          return client.focus();
      }
      return clients.openWindow(url);
    })
  );
});
