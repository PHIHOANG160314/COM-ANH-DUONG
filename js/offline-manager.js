/**
 * F&B Master - Offline Manager
 * Author: Google DeepMind / Antigravity Team
 * Description: IndexedDB wrapper for offline data persistence and background sync.
 */

const OfflineManager = {
    DB_NAME: 'fb-master-offline',
    DB_VERSION: 2, // Increment version for schema change
    db: null,
    syncInProgress: false,

    // ========================================
    // INITIALIZATION
    // ========================================
    async init() {
        if (!window.indexedDB) {
            if (window.Debug) Debug.warn('IndexedDB not supported');
            return false;
        }

        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this.DB_NAME, this.DB_VERSION);

            request.onerror = () => {
                if (window.Debug) Debug.error('IndexedDB open failed');
                reject(request.error);
            };

            request.onsuccess = () => {
                this.db = request.result;
                if (window.Debug) Debug.info('IndexedDB connected');
                this.setupOnlineListener();
                resolve(true);
            };

            request.onupgradeneeded = (event) => {
                const db = event.target.result;

                // Store for cached menu items
                if (!db.objectStoreNames.contains('menu_cache')) {
                    db.createObjectStore('menu_cache', { keyPath: 'id' });
                }

                // Store for offline actions queue (Generic)
                if (!db.objectStoreNames.contains('offline_queue')) {
                    const queueStore = db.createObjectStore('offline_queue', { keyPath: 'id' });
                    queueStore.createIndex('timestamp', 'timestamp', { unique: false });
                }

                // Remove old pending_orders if exists (migration)
                if (db.objectStoreNames.contains('pending_orders')) {
                    db.deleteObjectStore('pending_orders');
                }

                if (window.Debug) Debug.info('IndexedDB schema updated');
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
            if (window.Debug) Debug.info('Online - syncing offline queue...');
            this.showStatus('online');
            this.syncQueue();
        });

        window.addEventListener('offline', () => {
            this.isOnline = false;
            if (window.Debug) Debug.info('Offline mode');
            this.showStatus('offline');
        });

        // Initial status
        this.showStatus(navigator.onLine ? 'online' : 'offline');
    },

    showStatus(status) {
        let indicator = document.getElementById('offlineIndicator');

        if (status === 'offline') {
            if (!indicator) {
                indicator = document.createElement('div');
                indicator.id = 'offlineIndicator';
                indicator.className = 'offline-indicator';
                indicator.innerHTML = `
                    <span class="offline-icon">📴</span>
                    <span class="offline-text">Chế độ Offline</span>
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
        try {
            const tx = this.db.transaction('menu_cache', 'readwrite');
            const store = tx.objectStore('menu_cache');
            await store.clear();
            for (const item of menuItems) {
                store.put(item);
            }
            if (window.Debug) Debug.info('Cached', menuItems.length, 'menu items');
        } catch (e) {
            console.error('Cache menu failed', e);
        }
    },

    async getCachedMenu() {
        if (!this.db) return [];
        return new Promise((resolve) => {
            const tx = this.db.transaction('menu_cache', 'readonly');
            const store = tx.objectStore('menu_cache');
            const request = store.getAll();
            request.onsuccess = () => resolve(request.result || []);
            request.onerror = () => resolve([]);
        });
    },

    // ========================================
    // QUEUE MANAGEMENT
    // ========================================

    // Add action to offline queue
    async enqueueAction(action, data) {
        if (!this.db) {
            console.warn('DB not ready, using localStorage fallback');
            // Simple fallback
            this.fallbackEnqueue(action, data);
            return;
        }

        const item = {
            id: Date.now() + '-' + Math.random().toString(36).substr(2, 9),
            action,
            data,
            timestamp: new Date().toISOString(),
            retries: 0
        };

        return new Promise((resolve, reject) => {
            const tx = this.db.transaction('offline_queue', 'readwrite');
            const store = tx.objectStore('offline_queue');
            const request = store.add(item);

            request.onsuccess = () => {
                if (window.Debug) Debug.info('📥 Queued offline action:', action);
                this.registerBackgroundSync();
                resolve(item);
            };

            request.onerror = () => reject(request.error);
        });
    },

    // Get all queued items
    async getQueue() {
        if (!this.db) return this.fallbackGetQueue();

        return new Promise((resolve) => {
            const tx = this.db.transaction('offline_queue', 'readonly');
            const store = tx.objectStore('offline_queue');
            const request = store.getAll();
            request.onsuccess = () => resolve(request.result || []);
            request.onerror = () => resolve([]);
        });
    },

    // Remove item from queue
    async dequeueItem(id) {
        if (!this.db) return;
        const tx = this.db.transaction('offline_queue', 'readwrite');
        const store = tx.objectStore('offline_queue');
        store.delete(id);
    },

    // ========================================
    // SYNC LOGIC
    // ========================================
    async syncQueue() {
        if (this.syncInProgress || !this.isOnline) return;

        const queue = await this.getQueue();
        if (queue.length === 0) return;

        this.syncInProgress = true;
        if (window.Debug) Debug.info('🔄 Syncing', queue.length, 'offline actions...');

        let successCount = 0;

        for (const item of queue) {
            try {
                const result = await this.executeAction(item);

                if (result.success || (result.error && !this.isRetryable(result.error))) {
                    // Success or fatal error -> remove from queue
                    await this.dequeueItem(item.id);
                    successCount++;
                    if (result.success && window.Debug) Debug.info('✅ Synced action:', item.action);
                } else {
                    // Retryable error -> keep in queue, maybe increment retry count
                    if (window.Debug) Debug.warn('⚠️ Sync failed, keeping in queue:', item.action);
                }
            } catch (e) {
                console.error('Sync execution error:', e);
            }
        }

        this.syncInProgress = false;

        if (successCount > 0) {
            this.showToast(`Đã đồng bộ ${successCount} dữ liệu offline`);
        }
    },

    async executeAction(item) {
        // Need SupabaseService
        if (typeof SupabaseService === 'undefined') return { success: false, error: 'SupabaseService not found' };

        switch (item.action) {
            case 'createOrder':
                return await SupabaseService.createOrder(item.data);
            case 'updateOrderStatus':
                return await SupabaseService.updateOrderStatus(item.data.orderId, item.data.status);
            case 'upsertCustomer':
                return await SupabaseService.upsertCustomer(item.data);
            default:
                console.warn('Unknown offline action:', item.action);
                return { success: false, error: 'Unknown action' };
        }
    },

    isRetryable(error) {
        // Simple check for network-related errors
        const msg = typeof error === 'string' ? error : error.message || '';
        return msg.includes('Network') || msg.includes('Failed to fetch') || msg.includes('connection');
    },

    // ========================================
    // BACKGROUND SYNC & UTILS
    // ========================================
    async registerBackgroundSync() {
        if ('serviceWorker' in navigator && 'SyncManager' in window) {
            try {
                const registration = await navigator.serviceWorker.ready;
                await registration.sync.register('sync-offline-queue');
            } catch (err) {
                // Ignore if not supported
            }
        }
    },

    fallbackEnqueue(action, data) {
        const queue = this.fallbackGetQueue();
        queue.push({
            id: Date.now(),
            action,
            data,
            timestamp: new Date().toISOString()
        });
        localStorage.setItem('offline_queue_backup', JSON.stringify(queue));
    },

    fallbackGetQueue() {
        return JSON.parse(localStorage.getItem('offline_queue_backup') || '[]');
    },

    showToast(message) {
        if (typeof Toast !== 'undefined') {
            Toast.show(message, 'success');
        } else {
            console.log(message);
        }
    },

    // Check pending count
    async getPendingCount() {
        const queue = await this.getQueue();
        return queue.length;
    }
};

// Auto-initialize
document.addEventListener('DOMContentLoaded', () => {
    OfflineManager.init().then(() => {
        if (window.Debug) Debug.info('Offline Manager ready (v2)');
    });
});

window.OfflineManager = OfflineManager;
