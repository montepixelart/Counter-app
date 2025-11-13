
const CACHE_NAME = 'tap-counter-cache-v3';
const urlsToCache = [
  './',
  './index.html',
  './manifest.json',
  './index.tsx',
  './App.tsx',
  './components/icons.tsx'
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
    // We only want to cache GET requests.
    if (event.request.method !== 'GET') {
        return;
    }
    event.respondWith(
        fetch(event.request)
            .then(networkResponse => {
                // If we received a response from the network, cache it and return it.
                return caches.open(CACHE_NAME).then(cache => {
                    // Only cache successful responses to avoid caching errors.
                    // Also, don't cache Chrome extension requests.
                    if (networkResponse && networkResponse.status === 200 && !event.request.url.startsWith('chrome-extension://')) {
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