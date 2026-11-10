// Service Worker - caches the app shell so the app loads offline
const CACHE_NAME = 'mt-cadastral-v1';
const SHELL_URLS = [
  '/',
  '/mt-cadastral.html',
  '/sw.js',
  '/manifest.json',
  '/icon.svg'
];

// Install: cache the app shell
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(SHELL_URLS);
    })
  );
  self.skipWaiting();
});

// Activate: clean up old caches, take control of pages
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((names) => {
      return Promise.all(
        names.filter((n) => n !== CACHE_NAME).map((n) => caches.delete(n))
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch: serve app shell from cache, pass through for everything else
self.addEventListener('fetch', (event) => {
  // Only handle GET requests to our origin
  if (event.request.method !== 'GET' || !event.request.url.startsWith(self.location.origin)) {
    return;
  }
  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached;
      return fetch(event.request).catch(() => {
        // If offline and not cached, return the app shell
        if (event.request.destination === 'document') {
          return caches.match('/mt-cadastral.html');
        }
      });
    })
  );
});
