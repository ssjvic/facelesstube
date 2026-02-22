// FacelessTube Service Worker
// Handles caching and offline support

const CACHE_NAME = 'facelesstube-v1'
const STATIC_ASSETS = [
    '/',
    '/index.html',
    '/manifest.json'
]

// Install event - cache static assets
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('Caching static assets')
                return cache.addAll(STATIC_ASSETS)
            })
            .then(() => self.skipWaiting())
    )
})

// Activate event - clean old caches
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys()
            .then((cacheNames) => {
                return Promise.all(
                    cacheNames
                        .filter((name) => name !== CACHE_NAME)
                        .map((name) => caches.delete(name))
                )
            })
            .then(() => self.clients.claim())
    )
})

// Fetch event - network first, fallback to cache
self.addEventListener('fetch', (event) => {
    // Skip non-GET requests
    if (event.request.method !== 'GET') return

    // Skip API requests and external resources
    const url = new URL(event.request.url)
    if (
        url.origin !== location.origin ||
        url.pathname.startsWith('/api') ||
        url.pathname.includes('googleapis') ||
        url.pathname.includes('pexels')
    ) {
        return
    }

    event.respondWith(
        fetch(event.request)
            .then((response) => {
                // Clone and cache successful responses
                if (response.ok) {
                    const responseClone = response.clone()
                    caches.open(CACHE_NAME)
                        .then((cache) => cache.put(event.request, responseClone))
                }
                return response
            })
            .catch(() => {
                // Fallback to cache
                return caches.match(event.request)
                    .then((cached) => {
                        if (cached) return cached

                        // For navigation, return index.html
                        if (event.request.mode === 'navigate') {
                            return caches.match('/')
                        }

                        return new Response('Offline', { status: 503 })
                    })
            })
    )
})

// Handle background sync for uploads
self.addEventListener('sync', (event) => {
    if (event.tag === 'video-upload') {
        event.waitUntil(
            // Handle pending uploads when back online
            console.log('Background sync: video-upload')
        )
    }
})

// Push notifications (future feature)
self.addEventListener('push', (event) => {
    if (event.data) {
        const data = event.data.json()

        event.waitUntil(
            self.registration.showNotification(data.title, {
                body: data.body,
                icon: '/icons/icon-192x192.png',
                badge: '/icons/icon-72x72.png',
                data: data.url
            })
        )
    }
})

// Handle notification click
self.addEventListener('notificationclick', (event) => {
    event.notification.close()

    event.waitUntil(
        clients.openWindow(event.notification.data || '/')
    )
})
