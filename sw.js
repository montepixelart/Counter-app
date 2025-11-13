
const CACHE_NAME = 'tap-counter-cache-v2';
const urlsToCache = [
  './',
  './index.html',
  './manifest.json',
];

// On install, cache the app shell.
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
  self.skipWaiting();
});

// Use a network-first fetching strategy.
self.addEventListener('fetch', event => {
    event.respondWith(
        fetch(event.request)
            .then(networkResponse => {
                // If we received a response from the network, cache it and return it.
                return caches.open(CACHE_NAME).then(cache => {
                    // Only cache successful GET requests to avoid caching errors.
                    if (event.request.method === 'GET' && networkResponse.status === 200) {
                       cache.put(event.request, networkResponse.clone());
                    }
                    return networkResponse;
                });
            })
            .catch(() => {
                // If the network request failed (e.g., offline), try to serve from the cache.
                return caches.match(event.request);
            })
    );
});


// On activation, remove old caches.
self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  return self.clients.claim();
});