// sw.js
// This is your Service Worker file. It runs in the background.

// Listen for the 'install' event to cache static assets
self.addEventListener('install', (event) => {
    console.log('Service Worker: Installed');
    // You can cache your app shell here if you want offline capabilities
    // event.waitUntil(
    //     caches.open('static-v1').then((cache) => {
    //         return cache.addAll([
    //             '/',
    //             '/index.html',
    //             '/manifest.json',
    //             '/icons/icon-192x192.png',
    //             '/icons/icon-512x512.png'
    //         ]);
    //     })
    // );
});

// Listen for the 'activate' event to clean up old caches
self.addEventListener('activate', (event) => {
    console.log('Service Worker: Activated');
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    // Delete old caches if you change your cache name (e.g., 'static-v1' to 'static-v2')
                    // if (cacheName !== 'static-v1' && cacheName.startsWith('static-')) {
                    //     return caches.delete(cacheName);
                    // }
                    return Promise.resolve();
                })
            );
        })
    );
});

// Listen for 'fetch' events for offline capabilities (optional)
self.addEventListener('fetch', (event) => {
    // console.log('Service Worker: Fetching', event.request.url);
    // You can implement caching strategies here, e.g., cache-first, network-first
    // event.respondWith(
    //     caches.match(event.request).then((response) => {
    //         return response || fetch(event.request);
    //     })
    // );
});

// Listen for the 'push' event
self.addEventListener('push', (event) => {
    console.log('Service Worker: Push received!', event.data);
    const data = event.data.json();
    console.log('Push data:', data);

    const title = data.title || 'Train Alert!';
    const options = {
        body: data.body || 'A train update is available.',
        icon: data.icon || '/icons/icon-192x192.png', // Default icon if not provided
        badge: data.badge || '/icons/icon-192x192.png', // For Android/Windows
        image: data.image || undefined, // Optional image for notification
        data: {
            url: data.url || '/' // URL to open when clicking notification
        },
        // Actions allow buttons on the notification (e.g., 'View Details', 'Dismiss')
        // actions: [
        //     {
        //         action: 'view-details',
        //         title: 'View Details',
        //         icon: '/icons/view-icon.png'
        //     },
        //     {
        //         action: 'dismiss',
        //         title: 'Dismiss',
        //         icon: '/icons/dismiss-icon.png'
        //     }
        // ]
    };

    // Show the notification
    event.waitUntil(self.registration.showNotification(title, options));
});

// Listen for 'notificationclick' event
self.addEventListener('notificationclick', (event) => {
    console.log('Service Worker: Notification clicked!', event.notification);

    event.notification.close(); // Close the notification

    const urlToOpen = event.notification.data.url || '/';

    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true })
            .then((clientList) => {
                // If there's an open client for the URL, focus it
                for (let i = 0; i < clientList.length; i++) {
                    const client = clientList[i];
                    if (client.url.includes(urlToOpen) && 'focus' in client) {
                        return client.focus();
                    }
                }
                // Otherwise, open a new window
                if (clients.openWindow) {
                    return clients.openWindow(urlToOpen);
                }
                return Promise.resolve();
            })
    );
});