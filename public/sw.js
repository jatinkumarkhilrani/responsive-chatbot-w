const CACHE_NAME = 'sahaay-v2';
const isGitHubPages = location.hostname.includes('github.io');
const basePath = isGitHubPages ? '/sahaay-ai-messaging' : '';

const urlsToCache = [
  `${basePath}/`,
  `${basePath}/manifest.json`,
  `${basePath}/favicon.svg`,
  `${basePath}/favicon.ico`
];

self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(function(cache) {
        return cache.addAll(urlsToCache.filter(url => url));
      })
      .catch(err => console.warn('Cache install failed:', err))
  );
  self.skipWaiting();
});

self.addEventListener('activate', function(event) {
  event.waitUntil(
    caches.keys().then(function(cacheNames) {
      return Promise.all(
        cacheNames.map(function(cacheName) {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
          return Promise.resolve();
        })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', function(event) {
  // Skip non-GET requests and external resources
  if (event.request.method !== 'GET' || !event.request.url.startsWith(self.location.origin)) {
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then(function(response) {
        if (response) {
          return response;
        }
        
        return fetch(event.request)
          .then(function(response) {
            // Only cache successful responses
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            const responseToCache = response.clone();
            caches.open(CACHE_NAME)
              .then(function(cache) {
                cache.put(event.request, responseToCache);
              });

            return response;
          })
          .catch(function() {
            // Return a fallback for navigation requests
            if (event.request.mode === 'navigate') {
              return caches.match(`${basePath}/`);
            }
          });
      })
  );
});