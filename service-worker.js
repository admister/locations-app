'use strict';

const PRECACHE = 'precache-v1';
const RUNTIME = 'runtime';
const OFFLINE_URL = 'offline.html';

// A list of local resources we always want to be cached.
const PRECACHE_URLS = [
    'index.html',
    'offline.html',
    './', // Alias for index.html
    '/',
    '/assets/css/material-components-web.css',
    '/assets/js/material-components-web.js',
    '/assets/images/disconnect.png',
    '/manifest.json',
    'https://fonts.googleapis.com/css?family=Roboto:300,400,500,700,400italic',
    'https://fonts.googleapis.com/icon?family=Material+Icons',
    'https://unpkg.com/mdi@2.0.46/css/materialdesignicons.min.css'
];


self.addEventListener('install', event => {
    console.log('Install event occured');
    event.waitUntil(
        caches.open(PRECACHE)
        .then(cache => {
            cache.addAll(PRECACHE_URLS);
            console.log('[ServiceWorker] Caching app shell');
        })
        .then(self.skipWaiting())
    );
});
self.addEventListener('activate', event => {
    console.log('Activate event occured');
    const currentCaches = [PRECACHE, RUNTIME];
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return cacheNames.filter(cacheName => !currentCaches.includes(cacheName));
        }).then(cachesToDelete => {
            return Promise.all(cachesToDelete.map(cacheToDelete => {
                console.log('[ServiceWorker] Removing old cache', key);
                return caches.delete(cacheToDelete);
            }));
        }).then(() => self.clients.claim())
    );
});
self.addEventListener('fetch', event => {
    console.log('Fetch event occured', event.request.url);

    event.respondWith(
        caches.match(event.request).then(function (response) {
            if (response) {
                return response;
            }


            // IMPORTANT: Clone the request. A request is a stream and
            // can only be consumed once. Since we are consuming this
            // once by cache and once by the browser for fetch, we need
            // to clone the response.
            var fetchRequest = event.request.clone();

            return fetch(fetchRequest).then(response => {
                // Check if we received a valid response
                if (!response || response.status !== 200 || response.type !== 'basic') {
                    return response;
                }

                // IMPORTANT: Clone the response. A response is a stream
                // and because we want the browser to consume the response
                // as well as the cache consuming the response, we need
                // to clone it so we have two streams.

                var responseToCache = response.clone();
                caches.open(PRECACHE).then(cache => {
                    cache.put(event.request, responseToCache);
                });

                return response;

            }).catch(error => {
                console.log('Fetch failied: returning offline page instead', event.request);
                return caches.match(OFFLINE_URL);
            });
        })
    );

    // if(event.request.mode === 'navigate' || 
    // (event.request.method === 'GET' && 
    // event.request.headers.get('accept').includes('text/html'))){
    //     console.log('Handling fetch event for', event.request.url);
    //     event.respondWith(
    //         fetch(event.request).catch(error => {

    //             console.log('Fetch failied: returning offline page instead', error);
    //             // return caches.match(OFFLINE_URL);
    //             event.respondWith(
    //                 caches.match(event.request).then(response => {
    //                     console.log('from catch block');
    //                     return response || fetch(event.request);
    //                 })
    //             );

    //         })
    //     );
    // }else{
    //     event.respondWith(
    //         caches.match(event.request).then(response => {
    //             return response || fetch(event.request);
    //         })
    //     );
    // }
});