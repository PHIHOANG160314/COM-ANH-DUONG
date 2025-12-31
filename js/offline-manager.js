// ========================================
// F&B MASTER - OFFLINE MANAGER
// IndexedDB + Background Sync
// ========================================

const OfflineManager = {
    DB_NAME: 'fb-master-offline',
    DB_VERSION: 1,
    db: null,

    // ========================================
    // INITIALIZATION
    // ========================================
    async init() {
        if (!window.indexedDB) {
            console.warn('⚠️ IndexedDB not supported');
            return false;
        }

        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this.DB_NAME, this.DB_VERSION);

            request.onerror = () => {
                console.error('❌ IndexedDB open failed');
                reject(request.error);
            };

            request.onsuccess = () => {
                this.db = request.result;
                console.log('✅ IndexedDB connected');
                this.setupOnlineListener();
                resolve(true);
            };

            request.onupgradeneeded = (event) => {
                const db = event.target.result;

                // Store for cached menu items
                if (!db.objectStoreNames.contains('menu_cache')) {
                    db.createObjectStore('menu_cache', { keyPath: 'id' });
                }

                // Store for pending orders (offline orders)
                if (!db.objectStoreNames.contains('pending_orders')) {
                    const orderStore = db.createObjectStore('pending_orders', { keyPath: 'id', autoIncrement: true });
                    orderStore.createIndex('status', 'status', { unique: false });
                    orderStore.createIndex('createdAt', 'createdAt', { unique: false });
                }

                // Store for order history
                if (!db.objectStoreNames.contains('order_history')) {
                    const historyStore = db.createObjectStore('order_history', { keyPath: 'id' });
                    historyStore.createIndex('createdAt', 'createdAt', { unique: false });
                }

                console.log('📦 IndexedDB schema created');
            };
        });
    },

    // ========================================
    // ONLINE/OFFLINE DETECTION
    // ========================================
    isOnline: navigator.onLine,

    setupOnlineListener() {
        window.addEventListener('online', () => {
            this.isOnline = true;
            console.log('🌐 Online - syncing pending orders...');
            this.showStatus('online');
            this.syncPendingOrders();
        });

        window.addEventListener('offline', () => {
            this.isOnline = false;
            console.log('📴 Offline mode');
            this.showStatus('offline');
        });

        // Initial status
        this.showStatus(navigator.onLine ? 'online' : 'offline');
    },

    showStatus(status) {
        // Remove existing indicator
        let indicator = document.getElementById('offlineIndicator');

        if (status === 'offline') {
            if (!indicator) {
                indicator = document.createElement('div');
                indicator.id = 'offlineIndicator';
                indicator.className = 'offline-indicator';
                indicator.innerHTML = `
                    <span class="offline-icon">📴</span>
                    <span class="offline-text">Offline Mode</span>
                `;
                document.body.appendChild(indicator);
            }
            indicator.classList.add('show');
        } else {
            if (indicator) {
                indicator.classList.remove('show');
                setTimeout(() => indicator.remove(), 300);
            }
        }
    },

    // ========================================
    // MENU CACHE
    // ========================================
    async cacheMenu(menuItems) {
        if (!this.db) return;

        const tx = this.db.transaction('menu_cache', 'readwrite');
        const store = tx.objectStore('menu_cache');

        // Clear existing cache
        await store.clear();

        // Add all menu items
        for (const item of menuItems) {
            store.put(item);
        }

        console.log('💾 Cached', menuItems.length, 'menu items');
    },

    async getCachedMenu() {
        if (!this.db) return [];

        return new Promise((resolve) => {
            const tx = this.db.transaction('menu_cache', 'readonly');
            const store = tx.objectStore('menu_cache');
            const request = store.getAll();

            request.onsuccess = () => {
                resolve(request.result || []);
            };

            request.onerror = () => {
                resolve([]);
            };
        });
    },

    // ========================================
    // PENDING ORDERS (OFFLINE QUEUE)
    // ========================================
    async queueOrder(order) {
        if (!this.db) {
            // Fallback to localStorage
            const pending = JSON.parse(localStorage.getItem('pending_orders') || '[]');
            pending.push({ ...order, offlineId: 'OFF-' + Date.now(), status: 'pending_sync' });
            localStorage.setItem('pending_orders', JSON.stringify(pending));
            console.log('📝 Order queued to localStorage (fallback)');
            return;
        }

        return new Promise((resolve, reject) => {
            const tx = this.db.transaction('pending_orders', 'readwrite');
            const store = tx.objectStore('pending_orders');

            const orderData = {
                ...order,
                offlineId: 'OFF-' + Date.now(),
                status: 'pending_sync',
                createdAt: new Date().toISOString()
            };

            const request = store.add(orderData);

            request.onsuccess = () => {
                console.log('📝 Order queued offline:', orderData.offlineId);
                this.registerBackgroundSync();
                resolve(orderData);
            };

            request.onerror = () => {
                reject(request.error);
            };
        });
    },

    async getPendingOrders() {
        if (!this.db) {
            return JSON.parse(localStorage.getItem('pending_orders') || '[]');
        }

        return new Promise((resolve) => {
            const tx = this.db.transaction('pending_orders', 'readonly');
            const store = tx.objectStore('pending_orders');
            const index = store.index('status');
            const request = index.getAll('pending_sync');

            request.onsuccess = () => {
                resolve(request.result || []);
            };

            request.onerror = () => {
                resolve([]);
            };
        });
    },

    async markOrderSynced(orderId) {
        if (!this.db) return;

        const tx = this.db.transaction('pending_orders', 'readwrite');
        const store = tx.objectStore('pending_orders');

        const request = store.get(orderId);
        request.onsuccess = () => {
            const order = request.result;
            if (order) {
                order.status = 'synced';
                store.put(order);
                console.log('✅ Order synced:', orderId);
            }
        };
    },

    // ========================================
    // BACKGROUND SYNC
    // ========================================
    async registerBackgroundSync() {
        if ('serviceWorker' in navigator && 'SyncManager' in window) {
            try {
                const registration = await navigator.serviceWorker.ready;
                await registration.sync.register('sync-orders');
                console.log('🔄 Background sync registered');
            } catch (err) {
                console.log('⚠️ Background sync not available, will sync manually');
            }
        }
    },

    async syncPendingOrders() {
        const pendingOrders = await this.getPendingOrders();

        if (pendingOrders.length === 0) {
            console.log('✅ No pending orders to sync');
            return;
        }

        console.log('🔄 Syncing', pendingOrders.length, 'pending orders...');

        for (const order of pendingOrders) {
            try {
                // Check if Supabase is available
                if (typeof SupabaseService !== 'undefined' && window.isSupabaseConfigured?.()) {
                    const result = await SupabaseService.createOrder({
                        order_number: order.offlineId,
                        customer_name: order.customerName || 'Khách',
                        customer_phone: order.customerPhone || '',
                        items: JSON.stringify(order.items),
                        subtotal: order.subtotal,
                        discount: order.discount || 0,
                        total: order.total,
                        status: 'pending',
                        order_type: order.orderType || 'dinein',
                        notes: order.notes || ''
                    });

                    if (!result.error) {
                        await this.markOrderSynced(order.id);
                        this.showToast(`✅ Đã đồng bộ đơn ${order.offlineId}`);
                    }
                } else {
                    // Local sync - just move to order history
                    await this.saveToHistory(order);
                    await this.markOrderSynced(order.id);
                }
            } catch (err) {
                console.error('❌ Failed to sync order:', order.offlineId, err);
            }
        }

        console.log('✅ Sync completed');
    },

    // ========================================
    // ORDER HISTORY
    // ========================================
    async saveToHistory(order) {
        if (!this.db) {
            const history = JSON.parse(localStorage.getItem('order_history') || '[]');
            history.unshift(order);
            localStorage.setItem('order_history', JSON.stringify(history.slice(0, 50)));
            return;
        }

        const tx = this.db.transaction('order_history', 'readwrite');
        const store = tx.objectStore('order_history');
        store.put(order);
    },

    async getOrderHistory() {
        if (!this.db) {
            return JSON.parse(localStorage.getItem('order_history') || '[]');
        }

        return new Promise((resolve) => {
            const tx = this.db.transaction('order_history', 'readonly');
            const store = tx.objectStore('order_history');
            const request = store.getAll();

            request.onsuccess = () => {
                const orders = request.result || [];
                orders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
                resolve(orders.slice(0, 50));
            };

            request.onerror = () => {
                resolve([]);
            };
        });
    },

    // ========================================
    // UTILITIES
    // ========================================
    showToast(message, type = 'success') {
        if (typeof Toast !== 'undefined') {
            Toast.show(message, type);
        } else {
            console.log(message);
        }
    },

    // Get pending order count
    async getPendingCount() {
        const pending = await this.getPendingOrders();
        return pending.length;
    }
};

// Auto-initialize
document.addEventListener('DOMContentLoaded', () => {
    OfflineManager.init().then(() => {
        console.log('📴 Offline Manager ready');
    });
});

// Export
window.OfflineManager = OfflineManager;
