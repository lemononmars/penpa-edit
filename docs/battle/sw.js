const CACHE = "battle-shell-v1";
const SHELL = ["/battle/", "/battle/manifest.webmanifest", "/favicon.svg"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE)
      .then((c) => c.addAll(SHELL))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(
        keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))
      ))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);
  // Let Supabase API calls go straight to the network.
  if (url.hostname.endsWith(".supabase.co") || url.hostname.endsWith(".supabase.in")) return;
  // Cache-first only for the battle shell assets.
  if (SHELL.includes(url.pathname)) {
    event.respondWith(
      caches.match(event.request).then((r) => r || fetch(event.request))
    );
  }
});
