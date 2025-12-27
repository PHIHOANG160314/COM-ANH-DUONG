// ========================================
// F&B MASTER - PUSH NOTIFICATIONS
// Order ready, Promos, Updates
// ========================================

const PushNotifications = {
    permission: null,
    vapidPublicKey: null, // Set this for real push notifications

    async init() {
        console.log('🔔 Push Notifications initializing...');

        // Check browser support
        if (!('Notification' in window)) {
            console.log('This browser does not support notifications');
            return;
        }

        // Check permission
        this.permission = Notification.permission;

        // Request if not determined
        if (this.permission === 'default') {
            await this.requestPermission();
        }

        // Setup service worker push if supported
        if ('serviceWorker' in navigator && 'PushManager' in window) {
            this.setupPushManager();
        }

        // Add notification bell UI
        this.addNotificationBell();
    },

    async requestPermission() {
        try {
            this.permission = await Notification.requestPermission();
            if (this.permission === 'granted') {
                this.showToast('🔔 Đã bật thông báo!');
            }
        } catch (err) {
            console.log('Notification permission error:', err);
        }
    },

    async setupPushManager() {
        try {
            const registration = await navigator.serviceWorker.ready;
            console.log('Service Worker ready for push');
        } catch (err) {
            console.log('Push setup error:', err);
        }
    },

    // ========================================
    // LOCAL NOTIFICATIONS
    // ========================================

    send(title, options = {}) {
        if (this.permission !== 'granted') {
            console.log('Notifications not permitted');
            return;
        }

        const notification = new Notification(title, {
            icon: '/logo.jpg',
            badge: '/icons/icon-72.png',
            vibrate: [200, 100, 200],
            ...options
        });

        notification.onclick = () => {
            window.focus();
            notification.close();
            if (options.onclick) options.onclick();
        };

        return notification;
    },

    // Preset notifications
    orderReady(orderId) {
        this.send('🍽️ Đơn hàng sẵn sàng!', {
            body: `Đơn #${orderId} đã sẵn sàng để lấy`,
            tag: 'order-ready',
            requireInteraction: true
        });

        // Also show in-app notification
        this.showInAppNotification({
            type: 'success',
            title: 'Đơn hàng sẵn sàng!',
            message: `Đơn #${orderId} đã sẵn sàng`,
            icon: '🍽️'
        });
    },

    orderConfirmed(orderId) {
        this.send('✅ Đặt hàng thành công!', {
            body: `Đơn #${orderId} đã được xác nhận`,
            tag: 'order-confirmed'
        });
    },

    promoAlert(promoCode, discount) {
        this.send('🎉 Ưu đãi đặc biệt!', {
            body: `Dùng mã ${promoCode} để giảm ${discount}`,
            tag: 'promo-alert'
        });
    },

    loyaltyReward(message) {
        this.send('🏆 Phần thưởng mới!', {
            body: message,
            tag: 'loyalty-reward'
        });
    },

    tableReady(tableId) {
        this.send('🪑 Bàn đã sẵn sàng!', {
            body: `Bàn ${tableId} của bạn đã sẵn sàng`,
            tag: 'table-ready'
        });
    },

    // ========================================
    // IN-APP NOTIFICATIONS
    // ========================================

    showInAppNotification({ type = 'info', title, message, icon, duration = 5000 }) {
        let container = document.getElementById('notificationContainer');
        if (!container) {
            container = document.createElement('div');
            container.id = 'notificationContainer';
            container.className = 'notification-container';
            document.body.appendChild(container);
            this.injectStyles();
        }

        const notification = document.createElement('div');
        notification.className = `in-app-notification ${type} animate-slideInRight`;
        notification.innerHTML = `
            <div class="notification-icon">${icon || this.getIcon(type)}</div>
            <div class="notification-content">
                <div class="notification-title">${title}</div>
                <div class="notification-message">${message}</div>
            </div>
            <button class="notification-close" onclick="this.parentElement.remove()">✕</button>
        `;

        container.appendChild(notification);

        // Auto remove
        setTimeout(() => {
            notification.classList.add('animate-fadeOut');
            setTimeout(() => notification.remove(), 300);
        }, duration);

        // Play sound
        this.playSound();
    },

    getIcon(type) {
        const icons = {
            success: '✅',
            error: '❌',
            warning: '⚠️',
            info: 'ℹ️'
        };
        return icons[type] || icons.info;
    },

    playSound() {
        try {
            const audio = new Audio('data:audio/mp3;base64,SUQzBAAAAAAAI1RTU0UAAAAPAAADTGF2ZjU4Ljc2LjMwMAAAAAAAAAAAAAAA//uQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWGluZwAAAA8AAAACAAABhgC7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7//////////////////////////////////////////////////////////////////8AAAAATGF2YzU4LjEzAAAAAAAAAAAAAAAAJAAAAAAAAAAAAYYMy3HSAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAP/7kGQAAANUAB1nAAADVAAHX4AAAaRmkGF3JwBcjNIMHubAAH//uQZAAAA1QAHW8AAANUAAdfgAABpGaQYXcnAFyM0gwe5sAA');
            audio.volume = 0.3;
            audio.play().catch(() => { });
        } catch (e) { }
    },

    // ========================================
    // NOTIFICATION BELL UI
    // ========================================

    addNotificationBell() {
        // Check if already exists
        if (document.getElementById('notificationBell')) return;

        const bell = document.createElement('button');
        bell.id = 'notificationBell';
        bell.className = 'notification-bell';
        bell.innerHTML = `
            <span class="bell-icon">🔔</span>
            <span class="notification-badge" id="notifBadge" style="display:none">0</span>
        `;
        bell.onclick = () => this.showNotificationCenter();
        document.body.appendChild(bell);

        // Load unread count
        this.updateBadge();
    },

    updateBadge() {
        const notifications = this.getStoredNotifications();
        const unread = notifications.filter(n => !n.read).length;
        const badge = document.getElementById('notifBadge');
        if (badge) {
            badge.textContent = unread;
            badge.style.display = unread > 0 ? 'flex' : 'none';
        }
    },

    getStoredNotifications() {
        return JSON.parse(localStorage.getItem('app_notifications') || '[]');
    },

    storeNotification(notification) {
        const notifications = this.getStoredNotifications();
        notifications.unshift({
            ...notification,
            id: Date.now(),
            timestamp: new Date().toISOString(),
            read: false
        });
        // Keep only last 50
        localStorage.setItem('app_notifications', JSON.stringify(notifications.slice(0, 50)));
        this.updateBadge();
    },

    showNotificationCenter() {
        const notifications = this.getStoredNotifications();

        const modal = document.createElement('div');
        modal.className = 'notification-center-modal';
        modal.id = 'notificationCenter';
        modal.innerHTML = `
            <div class="notification-center-overlay" onclick="PushNotifications.closeCenter()"></div>
            <div class="notification-center animate-slideInRight">
                <div class="notification-center-header">
                    <h3>🔔 Thông báo</h3>
                    <button onclick="PushNotifications.closeCenter()">✕</button>
                </div>
                <div class="notification-center-body">
                    ${notifications.length === 0 ? `
                        <div class="empty-notifications">
                            <span>📭</span>
                            <p>Không có thông báo mới</p>
                        </div>
                    ` : notifications.map(n => `
                        <div class="notification-item ${n.read ? '' : 'unread'}" onclick="PushNotifications.markRead(${n.id})">
                            <div class="notification-item-icon">${n.icon || '📌'}</div>
                            <div class="notification-item-content">
                                <div class="notification-item-title">${n.title}</div>
                                <div class="notification-item-message">${n.message}</div>
                                <div class="notification-item-time">${this.formatTime(n.timestamp)}</div>
                            </div>
                        </div>
                    `).join('')}
                </div>
                ${notifications.length > 0 ? `
                    <div class="notification-center-footer">
                        <button onclick="PushNotifications.clearAll()">Xóa tất cả</button>
                    </div>
                ` : ''}
            </div>
        `;
        document.body.appendChild(modal);
        document.body.style.overflow = 'hidden';

        // Mark all as read
        this.markAllRead();
    },

    closeCenter() {
        const modal = document.getElementById('notificationCenter');
        if (modal) {
            modal.remove();
            document.body.style.overflow = '';
        }
    },

    markRead(id) {
        const notifications = this.getStoredNotifications();
        const idx = notifications.findIndex(n => n.id === id);
        if (idx !== -1) {
            notifications[idx].read = true;
            localStorage.setItem('app_notifications', JSON.stringify(notifications));
            this.updateBadge();
        }
    },

    markAllRead() {
        const notifications = this.getStoredNotifications();
        notifications.forEach(n => n.read = true);
        localStorage.setItem('app_notifications', JSON.stringify(notifications));
        this.updateBadge();
    },

    clearAll() {
        localStorage.setItem('app_notifications', '[]');
        this.closeCenter();
        this.updateBadge();
    },

    formatTime(timestamp) {
        const date = new Date(timestamp);
        const now = new Date();
        const diff = now - date;

        if (diff < 60000) return 'Vừa xong';
        if (diff < 3600000) return `${Math.floor(diff / 60000)} phút trước`;
        if (diff < 86400000) return `${Math.floor(diff / 3600000)} giờ trước`;
        return date.toLocaleDateString('vi-VN');
    },

    showToast(message) {
        if (typeof CustomerApp !== 'undefined' && CustomerApp.showToast) {
            CustomerApp.showToast(message);
        }
    },

    // ========================================
    // STYLES
    // ========================================

    injectStyles() {
        if (document.getElementById('pushNotifStyles')) return;

        const style = document.createElement('style');
        style.id = 'pushNotifStyles';
        style.textContent = `
            .notification-container {
                position: fixed;
                top: 80px;
                right: 16px;
                z-index: 2500;
                display: flex;
                flex-direction: column;
                gap: 12px;
                max-width: 360px;
                pointer-events: none;
            }

            .in-app-notification {
                display: flex;
                align-items: flex-start;
                gap: 12px;
                padding: 16px;
                background: var(--bg-card, #1e1e3a);
                border-radius: 16px;
                box-shadow: 0 10px 40px rgba(0,0,0,0.3);
                pointer-events: auto;
                border-left: 4px solid;
            }

            .in-app-notification.success { border-color: var(--secondary, #10b981); }
            .in-app-notification.error { border-color: #ef4444; }
            .in-app-notification.warning { border-color: #f59e0b; }
            .in-app-notification.info { border-color: var(--primary, #6366f1); }

            .notification-icon { font-size: 1.5rem; }

            .notification-content { flex: 1; }

            .notification-title {
                font-weight: 600;
                margin-bottom: 4px;
            }

            .notification-message {
                font-size: 0.85rem;
                color: var(--text-secondary);
            }

            .notification-close {
                background: none;
                border: none;
                color: var(--text-muted);
                cursor: pointer;
                padding: 4px;
            }

            /* Notification Bell */
            .notification-bell {
                position: fixed;
                top: 20px;
                right: 20px;
                width: 48px;
                height: 48px;
                background: var(--bg-card, #1e1e3a);
                border: none;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                cursor: pointer;
                box-shadow: 0 4px 20px rgba(0,0,0,0.2);
                z-index: 1000;
            }

            .bell-icon { font-size: 1.3rem; }

            .notification-badge {
                position: absolute;
                top: -4px;
                right: -4px;
                min-width: 20px;
                height: 20px;
                background: #ef4444;
                color: white;
                border-radius: 10px;
                font-size: 0.7rem;
                font-weight: 700;
                display: flex;
                align-items: center;
                justify-content: center;
                padding: 0 6px;
            }

            /* Notification Center */
            .notification-center-modal {
                position: fixed;
                inset: 0;
                z-index: 2000;
            }

            .notification-center-overlay {
                position: absolute;
                inset: 0;
                background: rgba(0,0,0,0.5);
            }

            .notification-center {
                position: absolute;
                top: 0;
                right: 0;
                bottom: 0;
                width: 100%;
                max-width: 400px;
                background: var(--bg-main, #0f0f23);
                display: flex;
                flex-direction: column;
            }

            .notification-center-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 20px;
                border-bottom: 1px solid rgba(255,255,255,0.1);
            }

            .notification-center-header h3 { margin: 0; }

            .notification-center-header button {
                width: 36px;
                height: 36px;
                border: none;
                background: rgba(255,255,255,0.1);
                color: white;
                border-radius: 50%;
                cursor: pointer;
            }

            .notification-center-body {
                flex: 1;
                overflow-y: auto;
                padding: 16px;
            }

            .empty-notifications {
                text-align: center;
                padding: 60px 20px;
                color: var(--text-muted);
            }

            .empty-notifications span {
                font-size: 4rem;
                display: block;
                margin-bottom: 16px;
            }

            .notification-item {
                display: flex;
                gap: 12px;
                padding: 16px;
                background: rgba(255,255,255,0.02);
                border-radius: 12px;
                margin-bottom: 8px;
                cursor: pointer;
                transition: background 0.2s;
            }

            .notification-item:hover {
                background: rgba(255,255,255,0.05);
            }

            .notification-item.unread {
                background: rgba(99, 102, 241, 0.1);
                border-left: 3px solid var(--primary, #6366f1);
            }

            .notification-item-icon { font-size: 1.5rem; }

            .notification-item-content { flex: 1; }

            .notification-item-title {
                font-weight: 600;
                margin-bottom: 4px;
            }

            .notification-item-message {
                font-size: 0.85rem;
                color: var(--text-secondary);
                margin-bottom: 4px;
            }

            .notification-item-time {
                font-size: 0.75rem;
                color: var(--text-muted);
            }

            .notification-center-footer {
                padding: 16px;
                border-top: 1px solid rgba(255,255,255,0.1);
            }

            .notification-center-footer button {
                width: 100%;
                padding: 12px;
                background: rgba(239, 68, 68, 0.2);
                border: none;
                border-radius: 12px;
                color: #ef4444;
                cursor: pointer;
            }

            @keyframes slideInRight {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }

            .animate-slideInRight { animation: slideInRight 0.3s ease; }

            @keyframes fadeOut {
                to { opacity: 0; transform: translateX(20px); }
            }

            .animate-fadeOut { animation: fadeOut 0.3s ease forwards; }
        `;
        document.head.appendChild(style);
    }
};

// Initialize
document.addEventListener('DOMContentLoaded', () => PushNotifications.init());

window.PushNotifications = PushNotifications;
