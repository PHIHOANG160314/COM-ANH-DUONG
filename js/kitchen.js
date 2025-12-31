// ========================================
// F&B MASTER - KITCHEN DISPLAY MODULE
// ========================================

const KitchenDisplay = {
    orders: [],

    async init() {
        await this.loadOrders();
        this.render();
        // Auto-refresh every 30 seconds
        setInterval(() => this.loadOrders(), 30000);

        // Subscribe to realtime if available
        this.subscribeToRealtime();
    },

    async loadOrders() {
        // Try Supabase first
        if (typeof SupabaseService !== 'undefined' && window.isSupabaseConfigured?.()) {
            try {
                const result = await SupabaseService.getOrders();
                if (!result.error && result.data) {
                    this.orders = result.data
                        .filter(o => o.status === 'pending' || o.status === 'preparing')
                        .map(o => this._convertOrder(o))
                        .sort((a, b) => new Date(a.time) - new Date(b.time));
                    this.render();
                    return;
                }
            } catch (err) {
                if (window.Debug) Debug.warn('Kitchen: Failed to load from Supabase, using localStorage');
            }
        }

        // Fallback to localStorage
        const allOrders = JSON.parse(localStorage.getItem('fb_orders') || '[]');
        this.orders = allOrders.filter(o =>
            o.status === 'pending' || o.status === 'preparing'
        ).sort((a, b) => new Date(a.time) - new Date(b.time));
        this.render();
    },

    // Convert Supabase order format to display format
    _convertOrder(supabaseOrder) {
        let items = [];
        try {
            items = typeof supabaseOrder.items === 'string'
                ? JSON.parse(supabaseOrder.items)
                : supabaseOrder.items || [];
        } catch (e) {
            items = [];
        }

        return {
            id: supabaseOrder.order_number || supabaseOrder.id,
            supabaseId: supabaseOrder.id,
            table: supabaseOrder.table_number || (supabaseOrder.order_type === 'delivery' ? 'Giao hàng' : 'Mang đi'),
            time: new Date(supabaseOrder.created_at).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
            status: supabaseOrder.status,
            items: items.map(i => `${i.icon || ''} ${i.name} x${i.qty || 1}`).join(', '),
            itemsDetail: items,
            customer: supabaseOrder.customer_name,
            total: supabaseOrder.total
        };
    },

    // Subscribe to realtime order updates
    subscribeToRealtime() {
        if (typeof SupabaseService !== 'undefined' && window.isSupabaseConfigured?.()) {
            SupabaseService.subscribeToOrders((payload) => {
                if (payload.eventType === 'INSERT') {
                    // New order! Reload and notify
                    this.loadOrders();
                    this.playNotificationSound();

                    // Show notification
                    const order = payload.new;
                    if (typeof Toast !== 'undefined') {
                        Toast.show(`🔔 Đơn mới: ${order.order_number || order.id}`, 'warning');
                    }
                } else if (payload.eventType === 'UPDATE' || payload.eventType === 'DELETE') {
                    this.loadOrders();
                }
            });
            if (window.Debug) Debug.info('KitchenDisplay subscribed to realtime orders');
        }
    },

    render() {
        const container = document.getElementById('kitchenOrdersGrid');
        if (!container) return;

        if (this.orders.length === 0) {
            container.innerHTML = `
                <div class="kitchen-empty">
                    <span class="empty-icon">👨‍🍳</span>
                    <p>Không có đơn hàng đang chờ</p>
                </div>
            `;
            return;
        }

        container.innerHTML = this.orders.map(order => `
            <div class="kitchen-order-card ${order.status}">
                <div class="kitchen-order-header">
                    <span class="order-id">${order.id}</span>
                    <span class="order-table">${order.table || 'Mang đi'}</span>
                    <span class="order-time">${order.time}</span>
                </div>
                <div class="kitchen-order-items">
                    ${order.itemsDetail ? order.itemsDetail.map(item => `
                        <div class="kitchen-item">
                            <span class="item-icon">${item.icon || '🍽️'}</span>
                            <span class="item-name">${item.name}</span>
                            <span class="item-qty">x${item.quantity}</span>
                        </div>
                    `).join('') : order.items.split(', ').map(item => `
                        <div class="kitchen-item">
                            <span class="item-name">${item}</span>
                        </div>
                    `).join('')}
                </div>
                <div class="kitchen-order-actions">
                    ${order.status === 'pending' ? `
                        <button class="btn-warning" onclick="KitchenDisplay.startPreparing('${order.id}')">
                            🍳 Bắt đầu làm
                        </button>
                    ` : `
                        <button class="btn-success" onclick="KitchenDisplay.markReady('${order.id}')">
                            ✅ Hoàn thành
                        </button>
                    `}
                </div>
            </div>
        `).join('');

        // Update counter
        const counter = document.getElementById('kitchenOrderCount');
        if (counter) counter.textContent = this.orders.length;
    },

    startPreparing(orderId) {
        const orders = JSON.parse(localStorage.getItem('fb_orders') || '[]');
        const order = orders.find(o => o.id === orderId);
        if (order) {
            order.status = 'preparing';
            localStorage.setItem('fb_orders', JSON.stringify(orders));
            this.loadOrders();
            toast.info(`🍳 Đang chuẩn bị đơn ${orderId}`);
        }
    },

    markReady(orderId) {
        const orders = JSON.parse(localStorage.getItem('fb_orders') || '[]');
        const order = orders.find(o => o.id === orderId);
        if (order) {
            order.status = 'ready';
            order.readyAt = new Date().toISOString();
            localStorage.setItem('fb_orders', JSON.stringify(orders));
            this.loadOrders();

            // Play notification sound
            this.playNotificationSound();

            // Show big notification for staff
            this.notifyStaff(order);

            // Update ready counter
            this.updateReadyCounter();

            toast.success(`✅ Đơn ${orderId} đã sẵn sàng phục vụ!`);
        }
    },

    playNotificationSound() {
        // Create audio context for notification bell
        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();

            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);

            oscillator.frequency.value = 800;
            oscillator.type = 'sine';
            gainNode.gain.value = 0.3;

            oscillator.start();
            oscillator.stop(audioContext.currentTime + 0.3);

            // Second beep
            setTimeout(() => {
                const osc2 = audioContext.createOscillator();
                osc2.connect(gainNode);
                osc2.frequency.value = 1000;
                osc2.type = 'sine';
                osc2.start();
                osc2.stop(audioContext.currentTime + 0.3);
            }, 200);
        } catch (e) {
            if (window.Debug) Debug.log('Audio not supported');
        }
    },

    notifyStaff(order) {
        // Create notification overlay
        const notification = document.createElement('div');
        notification.id = 'kitchenNotification';
        notification.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: linear-gradient(135deg, #10b981, #059669);
            color: white;
            padding: 2rem 3rem;
            border-radius: 16px;
            box-shadow: 0 20px 60px rgba(0,0,0,0.5);
            z-index: 10000;
            text-align: center;
            animation: pulse 0.5s ease;
        `;
        notification.innerHTML = `
            <div style="font-size: 4rem; margin-bottom: 1rem;">🔔</div>
            <h2 style="font-size: 1.5rem; margin-bottom: 0.5rem;">ĐƠN HÀNG SẴN SÀNG!</h2>
            <p style="font-size: 2rem; font-weight: bold; margin-bottom: 0.5rem;">${order.id}</p>
            <p style="font-size: 1.2rem; opacity: 0.9;">${order.table}</p>
            <p style="font-size: 1rem; margin-top: 1rem; opacity: 0.8;">${order.items}</p>
            <button onclick="this.parentElement.remove()" style="
                margin-top: 1.5rem;
                padding: 0.75rem 2rem;
                background: white;
                color: #059669;
                border: none;
                border-radius: 8px;
                font-size: 1rem;
                font-weight: bold;
                cursor: pointer;
            ">✅ Đã nhận</button>
        `;

        // Remove existing notification if any
        document.getElementById('kitchenNotification')?.remove();
        document.body.appendChild(notification);

        // Auto dismiss after 10 seconds
        setTimeout(() => notification.remove(), 10000);
    },

    updateReadyCounter() {
        const orders = JSON.parse(localStorage.getItem('fb_orders') || '[]');
        const readyCount = orders.filter(o => o.status === 'ready').length;

        // Update notification badge in header
        const badge = document.getElementById('notificationBtn')?.querySelector('.badge');
        if (badge) {
            badge.textContent = readyCount || '0';
            badge.style.background = readyCount > 0 ? '#10b981' : '';
        }
    },

    getReadyOrders() {
        const orders = JSON.parse(localStorage.getItem('fb_orders') || '[]');
        return orders.filter(o => o.status === 'ready');
    },

    showReadyOrders() {
        const readyOrders = this.getReadyOrders();

        if (readyOrders.length === 0) {
            modal.open('🔔 Đơn Sẵn Sàng', `
                <div style="text-align: center; padding: 2rem;">
                    <div style="font-size: 3rem;">✅</div>
                    <p style="margin-top: 1rem;">Không có đơn hàng sẵn sàng!</p>
                </div>
            `, `<button class="btn-primary" onclick="modal.close()">Đóng</button>`);
            return;
        }

        modal.open(`🔔 Đơn Sẵn Sàng (${readyOrders.length})`, `
            <div style="max-height: 400px; overflow-y: auto;">
                ${readyOrders.map(o => `
                    <div style="display: flex; justify-content: space-between; align-items: center; padding: 1rem; margin-bottom: 0.5rem; background: var(--bg-input); border-radius: 8px;">
                        <div>
                            <strong>${o.id}</strong> - ${o.table}<br>
                            <small style="color: var(--text-muted);">${o.items}</small>
                        </div>
                        <button class="btn-success" onclick="KitchenDisplay.markServed('${o.id}')">🍽️ Đã phục vụ</button>
                    </div>
                `).join('')}
            </div>
        `, `<button class="btn-secondary" onclick="modal.close()">Đóng</button>`);
    },

    markServed(orderId) {
        const orders = JSON.parse(localStorage.getItem('fb_orders') || '[]');
        const order = orders.find(o => o.id === orderId);
        if (order) {
            order.status = 'served';
            order.servedAt = new Date().toISOString();
            localStorage.setItem('fb_orders', JSON.stringify(orders));
            this.updateReadyCounter();
            modal.close();
            toast.success(`🍽️ Đơn ${orderId} đã được phục vụ!`);
        }
    }
};

window.KitchenDisplay = KitchenDisplay;
