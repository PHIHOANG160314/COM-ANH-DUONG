// ========================================
// F&B MASTER - SERVICE WORKER
// PWA Offline Support (v6.0 - IndexedDB)
// ========================================

const CACHE_VERSION = 'v6.0';
const CACHE_NAME = 'fb-master-' + CACHE_VERSION;
const STATIC_CACHE = 'fb-static-' + CACHE_VERSION;
const DYNAMIC_CACHE = 'fb-dynamic-' + CACHE_VERSION;
const DB_NAME = 'fb-master-offline';
const DB_VERSION = 1;

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
    '/js/debug.js',
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
    '/js/offline-manager.js',
    '/js/supabase-client.js',
    '/logo.jpg',
    '/manifest.json'
];

// Install event - cache static files
self.addEventListener('install', event => {
    console.log('🔧 Service Worker v6.0: Installing...');
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
    console.log('✅ Service Worker v6.0: Activated');
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

    // Skip external requests (except CDNs we want to cache)
    if (url.origin !== location.origin) {
        // Allow caching of specific CDNs
        if (!url.href.includes('fonts.googleapis.com') &&
            !url.href.includes('fonts.gstatic.com')) {
            return;
        }
    }

    event.respondWith(
        caches.match(request)
            .then(cachedResponse => {
                if (cachedResponse) {
                    // Return cached version, update in background
                    fetch(request).then(response => {
                        if (response.status === 200) {
                            caches.open(DYNAMIC_CACHE).then(cache => {
                                cache.put(request, response);
                            });
                        }
                    }).catch(() => { });
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
                        if (request.headers.get('accept')?.includes('text/html')) {
                            return caches.match('/customer.html') || caches.match('/index.html');
                        }
                    });
            })
    );
});

// ========================================
// INDEXEDDB HELPER FOR SERVICE WORKER
// ========================================
function openDB() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION);

        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve(request.result);

        request.onupgradeneeded = (event) => {
            const db = event.target.result;
            if (!db.objectStoreNames.contains('pending_orders')) {
                const store = db.createObjectStore('pending_orders', { keyPath: 'id', autoIncrement: true });
                store.createIndex('status', 'status', { unique: false });
            }
        };
    });
}

async function getPendingOrders() {
    try {
        const db = await openDB();
        return new Promise((resolve) => {
            const tx = db.transaction('pending_orders', 'readonly');
            const store = tx.objectStore('pending_orders');
            const index = store.index('status');
            const request = index.getAll('pending_sync');

            request.onsuccess = () => resolve(request.result || []);
            request.onerror = () => resolve([]);
        });
    } catch (err) {
        console.error('Failed to get pending orders:', err);
        return [];
    }
}

async function markOrderSynced(orderId) {
    try {
        const db = await openDB();
        const tx = db.transaction('pending_orders', 'readwrite');
        const store = tx.objectStore('pending_orders');

        const request = store.get(orderId);
        request.onsuccess = () => {
            const order = request.result;
            if (order) {
                order.status = 'synced';
                store.put(order);
            }
        };
    } catch (err) {
        console.error('Failed to mark order synced:', err);
    }
}

// ========================================
// BACKGROUND SYNC
// ========================================
self.addEventListener('sync', event => {
    if (event.tag === 'sync-orders') {
        console.log('🔄 Background sync triggered');
        event.waitUntil(syncOrders());
    }
});

async function syncOrders() {
    const pendingOrders = await getPendingOrders();

    if (pendingOrders.length === 0) {
        console.log('✅ No pending orders to sync');
        return;
    }

    console.log('📤 Syncing', pendingOrders.length, 'pending orders...');

    for (const order of pendingOrders) {
        try {
            // Try to sync to Supabase or server
            const response = await fetch('/api/orders', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(order)
            });

            if (response.ok) {
                await markOrderSynced(order.id);
                console.log('✅ Synced order:', order.offlineId);

                // Notify client
                const clients = await self.clients.matchAll();
                clients.forEach(client => {
                    client.postMessage({
                        type: 'ORDER_SYNCED',
                        orderId: order.offlineId
                    });
                });
            }
        } catch (err) {
            console.log('⚠️ Failed to sync order:', order.offlineId, err.message);
        }
    }

    console.log('🔄 Sync completed');
}

// ========================================
// PUSH NOTIFICATIONS
// ========================================
self.addEventListener('push', event => {
    const data = event.data?.json() || {};
    const title = data.title || '🍽️ Ánh Dương';
    const options = {
        body: data.body || 'Có thông báo mới!',
        icon: '/icons/icon-192.png',
        badge: '/icons/icon-72.png',
        vibrate: [100, 50, 100],
        data: data.url || '/customer.html',
        actions: data.actions || []
    };

    event.waitUntil(
        self.registration.showNotification(title, options)
    );
});

// Notification click
self.addEventListener('notificationclick', event => {
    event.notification.close();

    const action = event.action;
    const url = action === 'view' ? event.notification.data : '/customer.html';

    event.waitUntil(
        clients.matchAll({ type: 'window' }).then(windowClients => {
            // Focus if already open
            for (const client of windowClients) {
                if (client.url === url && 'focus' in client) {
                    return client.focus();
                }
            }
            // Otherwise open new window
            if (clients.openWindow) {
                return clients.openWindow(url);
            }
        })
    );
});

// ========================================
// MESSAGE HANDLER
// ========================================
self.addEventListener('message', event => {
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }

    if (event.data && event.data.type === 'SYNC_NOW') {
        syncOrders();
    }
});

console.log('🚀 F&B Master Service Worker v6.0 loaded!');

