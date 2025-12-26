// ========================================
// F&B MASTER - PWA UTILITIES
// Install prompts, offline queue, share API
// ========================================

const PWAUtils = {
    deferredPrompt: null,
    isOnline: navigator.onLine,

    init() {
        console.log('📱 PWA Utils initializing...');

        // Listen for install prompt
        window.addEventListener('beforeinstallprompt', (e) => {
            e.preventDefault();
            this.deferredPrompt = e;
            this.showInstallButton();
            console.log('📲 Install prompt ready');
        });

        // Listen for successful install
        window.addEventListener('appinstalled', () => {
            this.deferredPrompt = null;
            this.hideInstallButton();
            console.log('✅ App installed!');
        });

        // Online/Offline detection
        window.addEventListener('online', () => {
            this.isOnline = true;
            this.onOnline();
        });

        window.addEventListener('offline', () => {
            this.isOnline = false;
            this.onOffline();
        });

        // Service worker updates
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.ready.then(registration => {
                registration.addEventListener('updatefound', () => {
                    const newWorker = registration.installing;
                    newWorker.addEventListener('statechange', () => {
                        if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                            this.showUpdateAvailable();
                        }
                    });
                });
            });
        }

        this.createInstallUI();
        console.log('📱 PWA Utils ready!');
    },

    // ========================================
    // INSTALL PROMPT
    // ========================================
    createInstallUI() {
        // Create install banner if not exists
        if (!document.getElementById('installBanner')) {
            const banner = document.createElement('div');
            banner.id = 'installBanner';
            banner.className = 'install-banner';
            banner.innerHTML = `
                <div class="install-content">
                    <span class="install-icon">📲</span>
                    <div class="install-text">
                        <strong>Cài đặt ứng dụng</strong>
                        <p>Truy cập nhanh hơn từ màn hình chính</p>
                    </div>
                </div>
                <div class="install-actions">
                    <button class="btn-install" onclick="PWAUtils.installApp()">Cài đặt</button>
                    <button class="btn-dismiss" onclick="PWAUtils.dismissInstall()">×</button>
                </div>
            `;
            banner.style.cssText = `
                display: none;
                position: fixed;
                bottom: 80px;
                left: 16px;
                right: 16px;
                background: linear-gradient(135deg, #6366f1, #10b981);
                border-radius: 16px;
                padding: 16px;
                z-index: 500;
                box-shadow: 0 10px 40px rgba(0,0,0,0.3);
                animation: slideUp 0.3s ease;
            `;
            document.body.appendChild(banner);

            // Add animation style
            const style = document.createElement('style');
            style.textContent = `
                @keyframes slideUp {
                    from { transform: translateY(100%); opacity: 0; }
                    to { transform: translateY(0); opacity: 1; }
                }
                .install-banner .install-content {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    margin-bottom: 12px;
                }
                .install-banner .install-icon { font-size: 2rem; }
                .install-banner .install-text strong { color: white; }
                .install-banner .install-text p { font-size: 0.8rem; color: rgba(255,255,255,0.8); margin-top: 4px; }
                .install-banner .install-actions { display: flex; gap: 8px; }
                .install-banner .btn-install {
                    flex: 1;
                    padding: 12px;
                    background: white;
                    color: #6366f1;
                    border: none;
                    border-radius: 10px;
                    font-weight: 600;
                    cursor: pointer;
                }
                .install-banner .btn-dismiss {
                    width: 44px;
                    background: rgba(255,255,255,0.2);
                    color: white;
                    border: none;
                    border-radius: 10px;
                    font-size: 1.5rem;
                    cursor: pointer;
                }
                .offline-indicator {
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    background: #ef4444;
                    color: white;
                    text-align: center;
                    padding: 8px;
                    font-size: 0.85rem;
                    z-index: 1001;
                    display: none;
                }
                .update-banner {
                    position: fixed;
                    top: 16px;
                    left: 16px;
                    right: 16px;
                    background: #6366f1;
                    color: white;
                    padding: 16px;
                    border-radius: 12px;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    z-index: 1002;
                    box-shadow: 0 10px 40px rgba(0,0,0,0.3);
                }
                .update-banner button {
                    padding: 8px 16px;
                    background: white;
                    color: #6366f1;
                    border: none;
                    border-radius: 8px;
                    font-weight: 600;
                    cursor: pointer;
                }
            `;
            document.head.appendChild(style);
        }

        // Create offline indicator
        if (!document.getElementById('offlineIndicator')) {
            const offline = document.createElement('div');
            offline.id = 'offlineIndicator';
            offline.className = 'offline-indicator';
            offline.textContent = '📴 Bạn đang offline - Dữ liệu sẽ được đồng bộ khi có mạng';
            document.body.appendChild(offline);
        }
    },

    showInstallButton() {
        const dismissed = localStorage.getItem('install_dismissed');
        if (dismissed && Date.now() - parseInt(dismissed) < 86400000) return; // 24h cooldown

        const banner = document.getElementById('installBanner');
        if (banner) banner.style.display = 'block';
    },

    hideInstallButton() {
        const banner = document.getElementById('installBanner');
        if (banner) banner.style.display = 'none';
    },

    async installApp() {
        if (!this.deferredPrompt) return;

        this.deferredPrompt.prompt();
        const result = await this.deferredPrompt.userChoice;

        console.log('Install choice:', result.outcome);
        this.deferredPrompt = null;
        this.hideInstallButton();
    },

    dismissInstall() {
        this.hideInstallButton();
        localStorage.setItem('install_dismissed', Date.now().toString());
    },

    // ========================================
    // OFFLINE HANDLING
    // ========================================
    onOnline() {
        console.log('🌐 Back online!');
        const indicator = document.getElementById('offlineIndicator');
        if (indicator) indicator.style.display = 'none';

        this.syncOfflineOrders();
        this.showToast('🌐 Đã kết nối internet');
    },

    onOffline() {
        console.log('📴 Gone offline');
        const indicator = document.getElementById('offlineIndicator');
        if (indicator) indicator.style.display = 'block';

        this.showToast('📴 Không có kết nối mạng', 'error');
    },

    // ========================================
    // OFFLINE ORDER QUEUE
    // ========================================
    queueOfflineOrder(order) {
        const queue = JSON.parse(localStorage.getItem('offline_orders') || '[]');
        order.offlineQueued = true;
        order.queuedAt = new Date().toISOString();
        queue.push(order);
        localStorage.setItem('offline_orders', JSON.stringify(queue));
        console.log('📦 Order queued for sync:', order.id);
        return order;
    },

    async syncOfflineOrders() {
        const queue = JSON.parse(localStorage.getItem('offline_orders') || '[]');
        if (queue.length === 0) return;

        console.log('🔄 Syncing', queue.length, 'offline orders...');

        // In production, this would send to server
        // For now, just move from offline queue to regular orders
        const orders = JSON.parse(localStorage.getItem('customer_orders') || '[]');

        for (const order of queue) {
            order.offlineQueued = false;
            order.syncedAt = new Date().toISOString();

            // Check if order already exists
            const exists = orders.find(o => o.id === order.id);
            if (!exists) {
                orders.unshift(order);
            }
        }

        localStorage.setItem('customer_orders', JSON.stringify(orders));
        localStorage.setItem('offline_orders', '[]');

        console.log('✅ Synced all offline orders');
        this.showToast(`✅ Đã đồng bộ ${queue.length} đơn hàng`);
    },

    // ========================================
    // APP UPDATE
    // ========================================
    showUpdateAvailable() {
        const banner = document.createElement('div');
        banner.className = 'update-banner';
        banner.innerHTML = `
            <span>🔄 Có phiên bản mới!</span>
            <button onclick="PWAUtils.updateApp()">Cập nhật</button>
        `;
        document.body.appendChild(banner);
    },

    updateApp() {
        window.location.reload(true);
    },

    // ========================================
    // SHARE API
    // ========================================
    async shareItem(data) {
        if (navigator.share) {
            try {
                await navigator.share({
                    title: data.title || 'Ánh Dương',
                    text: data.text || '',
                    url: data.url || window.location.href
                });
                console.log('Shared successfully');
            } catch (err) {
                console.log('Share cancelled or failed:', err);
            }
        } else {
            // Fallback: copy to clipboard
            try {
                await navigator.clipboard.writeText(data.url || window.location.href);
                this.showToast('📋 Đã sao chép liên kết');
            } catch (err) {
                console.error('Clipboard failed:', err);
            }
        }
    },

    shareMenuItem(item) {
        this.shareItem({
            title: `${item.icon} ${item.name} - Ánh Dương`,
            text: `Thử món ${item.name} tại Ánh Dương! Giá chỉ ${new Intl.NumberFormat('vi-VN').format(item.price)}đ`,
            url: window.location.origin + '/customer.html?item=' + item.id
        });
    },

    // ========================================
    // UTILITIES
    // ========================================
    showToast(message, type = 'success') {
        const container = document.getElementById('toastContainer');
        if (!container) return;

        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.textContent = message;
        container.appendChild(toast);

        setTimeout(() => toast.remove(), 3000);
    }
};

// Initialize on load
document.addEventListener('DOMContentLoaded', () => PWAUtils.init());

window.PWAUtils = PWAUtils;
