// ========================================
// F&B MASTER - SERVICE WORKER
// PWA Offline Support (v5.0 - Complete)
// ========================================

const CACHE_VERSION = 'v5.0';
const CACHE_NAME = 'fb-master-' + CACHE_VERSION;
const STATIC_CACHE = 'fb-static-' + CACHE_VERSION;
const DYNAMIC_CACHE = 'fb-dynamic-' + CACHE_VERSION;

// Files to cache for offline
const STATIC_FILES = [
    '/',
    '/index.html',
    '/customer.html',
    '/staff-mobile.html',
    '/css/main.css',
    '/css/components.css',
    '/css/mobile.css',
    '/css/customer.css',
    '/css/staff-mobile.css',
    '/css/animations.css',
    '/css/customer-premium.css',
    '/js/app.js',
    '/js/data.js',
    '/js/utils.js',
    '/js/dashboard.js',
    '/js/pos.js',
    '/js/orders.js',
    '/js/menu.js',
    '/js/kitchen.js',
    '/js/tables.js',
    '/js/inventory.js',
    '/js/staff.js',
    '/js/customers.js',
    '/js/analytics.js',
    '/js/recipes.js',
    '/js/foodcost.js',
    '/js/sops.js',
    '/js/i18n.js',
    '/js/customer-app.js',
    '/js/staff-mobile.js',
    '/js/pwa-utils.js',
    '/js/confetti.js',
    '/js/mobile-ux.js',
    '/js/loyalty-game.js',
    '/js/social-share.js',
    '/js/table-reservation.js',
    '/js/push-notifications.js',
    '/js/theme-manager.js',
    '/js/payment-integration.js',
    '/js/kitchen-realtime.js',
    '/js/admin-dashboard.js',
    '/js/performance-optimizer.js',
    '/logo.jpg',
    '/manifest.json'
];

// Install event - cache static files
self.addEventListener('install', event => {
    console.log('🔧 Service Worker: Installing...');
    event.waitUntil(
        caches.open(STATIC_CACHE)
            .then(cache => {
                console.log('📦 Caching static files...');
                return cache.addAll(STATIC_FILES);
            })
            .then(() => self.skipWaiting())
            .catch(err => console.error('Cache failed:', err))
    );
});

// Activate event - clean old caches
self.addEventListener('activate', event => {
    console.log('✅ Service Worker: Activated');
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames
                    .filter(name => name !== STATIC_CACHE && name !== DYNAMIC_CACHE)
                    .map(name => caches.delete(name))
            );
        }).then(() => self.clients.claim())
    );
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', event => {
    const { request } = event;
    const url = new URL(request.url);

    // Skip non-GET requests
    if (request.method !== 'GET') return;

    // Skip external requests
    if (url.origin !== location.origin) return;

    event.respondWith(
        caches.match(request)
            .then(cachedResponse => {
                if (cachedResponse) {
                    // Return cached version
                    return cachedResponse;
                }

                // Fetch from network and cache
                return fetch(request)
                    .then(networkResponse => {
                        // Cache dynamic content
                        if (networkResponse.status === 200) {
                            const responseClone = networkResponse.clone();
                            caches.open(DYNAMIC_CACHE)
                                .then(cache => cache.put(request, responseClone));
                        }
                        return networkResponse;
                    })
                    .catch(() => {
                        // Offline fallback for HTML pages
                        if (request.headers.get('accept').includes('text/html')) {
                            return caches.match('/index.html');
                        }
                    });
            })
    );
});

// Background sync for offline orders
self.addEventListener('sync', event => {
    if (event.tag === 'sync-orders') {
        event.waitUntil(syncOrders());
    }
});

async function syncOrders() {
    const pendingOrders = await getPendingOrders();
    for (const order of pendingOrders) {
        try {
            // Send to server when online
            console.log('📤 Syncing order:', order.id);
        } catch (err) {
            console.error('Sync failed:', err);
        }
    }
}

async function getPendingOrders() {
    // Get orders from IndexedDB
    return [];
}

// Push notifications
self.addEventListener('push', event => {
    const data = event.data?.json() || {};
    const title = data.title || '🍽️ Ánh Dương';
    const options = {
        body: data.body || 'Có thông báo mới!',
        icon: '/icons/icon-192.png',
        badge: '/icons/icon-72.png',
        vibrate: [100, 50, 100],
        data: data.url || '/'
    };

    event.waitUntil(
        self.registration.showNotification(title, options)
    );
});

// Notification click
self.addEventListener('notificationclick', event => {
    event.notification.close();
    event.waitUntil(
        clients.openWindow(event.notification.data)
    );
});

console.log('🚀 F&B Master Service Worker loaded!');
