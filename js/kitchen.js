/**
 * F&B Master - Kitchen Display System
 * Author: Google DeepMind / Antigravity Team
 * Description: Real-time kitchen order management, status tracking, and notifications.
 */

const KitchenDisplay = {
    orders: [],
    refreshInterval: null,
    audioContext: null,

    async init() {
        await this.loadOrders();

        // Auto-refresh every 30 seconds
        this.startAutoRefresh();

        // Subscribe to realtime if available
        this.subscribeToRealtime();
    },

    startAutoRefresh() {
        if (this.refreshInterval) clearInterval(this.refreshInterval);
        this.refreshInterval = setInterval(() => this.loadOrders(), 30000);
    },

    async loadOrders() {
        // Try Supabase first
        if (this.isSupabaseAvailable()) {
            try {
                const result = await SupabaseService.getOrders();
                if (!result.error && result.data) {
                    // Sync to localStorage for other components (counters, ready list)
                    const convertedOrders = result.data.map(o => this._convertOrder(o));
                    localStorage.setItem('fb_orders', JSON.stringify(convertedOrders));

                    this.orders = this.processOrders(result.data, true);
                    this.log('log', 'ðŸ³ Kitchen loaded orders:', this.orders.length);
                    this.render();

                    // Trigger counter update on page
                    if (typeof KitchenPage !== 'undefined' && KitchenPage.updateCounters) {
                        KitchenPage.updateCounters();
                    }
                    return;
                }
            } catch (err) {
                this.log('warn', 'Kitchen: Failed to load from Supabase, using localStorage');
            }
        }

        // Fallback to localStorage
        const allOrders = JSON.parse(localStorage.getItem('fb_orders') || '[]');
        this.orders = this.processOrders(allOrders, false);
        this.render();
    },

    processOrders(orders, isSupabase) {
        // Kitchen shows: new orders (pending/new), confirmed (received), preparing
        const kitchenStatuses = ['pending', 'preparing', 'new', 'received', 'confirmed'];
        return orders
            .filter(o => kitchenStatuses.includes(o.status))
            .map(o => isSupabase ? this._convertOrder(o) : o)
            .sort((a, b) => new Date(a.time) - new Date(b.time));
    },

    isSupabaseAvailable() {
        return typeof SupabaseService !== 'undefined' && window.isSupabaseConfigured?.();
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
            table: supabaseOrder.table_number || (supabaseOrder.order_type === 'delivery' ? 'Giao hÃ ng' : 'Mang Ä‘i'),
            time: new Date(supabaseOrder.created_at).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
            status: supabaseOrder.status,
            items: items.map(i => `${i.icon || ''} ${i.name} x${i.qty ?? i.quantity ?? i.count ?? 1}`).join(', '),
            itemsDetail: items,
            customer: supabaseOrder.customer_name,
            total: supabaseOrder.total
        };
    },

    // Subscribe to realtime order updates
    subscribeToRealtime() {
        if (this.isSupabaseAvailable()) {
            SupabaseService.subscribeToOrders((payload) => {
                if (payload.eventType === 'INSERT') {
                    // New order! Reload and notify
                    this.loadOrders();
                    this.playNotificationSound();

                    // Show notification
                    const order = payload.new;
                    if (typeof Toast !== 'undefined') {
                        Toast.show(`ðŸ”” ÄÆ¡n má»›i: ${order.order_number || order.id}`, 'warning');
                    }
                } else if (payload.eventType === 'UPDATE' || payload.eventType === 'DELETE') {
                    this.loadOrders();
                }
            }, 'KitchenDisplay'); // Named listener
            this.log('info', 'KitchenDisplay subscribed to realtime orders');
        }
    },

    render() {
        const container = document.getElementById('kitchenOrdersGrid');
        if (!container) return;

        if (this.orders.length === 0) {
            container.innerHTML = this.getEmptyStateHTML();
            return;
        }

        container.innerHTML = this.orders.map(order => this.getOrderCardHTML(order)).join('');

        // Update counter
        const counter = document.getElementById('kitchenOrderCount');
        if (counter) counter.textContent = this.orders.length;
    },

    getEmptyStateHTML() {
        return `
            <div class="kitchen-empty">
                <span class="empty-icon">ðŸ‘¨â€ðŸ³</span>
                <p>KhÃ´ng cÃ³ Ä‘Æ¡n hÃ ng Ä‘ang chá»</p>
            </div>
        `;
    },

    getOrderCardHTML(order) {
        const itemsHtml = this.getOrderItemsHTML(order);
        const actionButton = order.status === 'pending'
            ? `
                <md-filled-tonal-button class="btn-kitchen start" onclick="KitchenDisplay.startPreparing('${order.id}')">
                    <md-icon slot="icon">skillet</md-icon>
                    Báº¯t Ä‘áº§u lÃ m
                </md-filled-tonal-button>
            `
            : `
                <md-filled-button class="btn-kitchen complete" onclick="KitchenDisplay.markReady('${order.id}')">
                    <md-icon slot="icon">check</md-icon>
                    HoÃ n thÃ nh
                </md-filled-button>
            `;

        return `
            <div class="kitchen-order-card ${order.status}">
                <div class="kitchen-order-header">
                    <span class="order-id">${order.id}</span>
                    <span class="order-table">${order.table || 'Mang Ä‘i'}</span>
                    <span class="order-time">${order.time}</span>
                </div>
                <div class="kitchen-order-items">
                    ${itemsHtml}
                </div>
                <div class="kitchen-order-actions">
                    ${actionButton}
                </div>
            </div>
        `;
    },

    getOrderItemsHTML(order) {
        if (order.itemsDetail && order.itemsDetail.length > 0) {
            return order.itemsDetail.map(item => `
                <div class="kitchen-item">
                    <span class="item-icon">${item.icon || 'ðŸ½ï¸'}</span>
                    <span class="item-name">${item.name}</span>
                    <span class="item-qty">x${item.qty ?? item.quantity ?? item.count ?? 1}</span>
                </div>
            `).join('');
        }

        // Fallback for string items
        return order.items.split(', ').map(item => `
            <div class="kitchen-item">
                <span class="item-name">${item}</span>
            </div>
        `).join('');
    },

    async startPreparing(orderId) {
        this.log('log', 'ðŸ³ startPreparing called with:', orderId);

        const order = this.orders.find(o => o.id === orderId);
        if (!order) {
            this.log('error', 'âŒ Order not found:', orderId);
            if (typeof Toast !== 'undefined') Toast.show(`KhÃ´ng tÃ¬m tháº¥y Ä‘Æ¡n hÃ ng ${orderId}`, 'error');
            return;
        }

        // Optimistic update
        order.status = 'preparing';
        this.render();

        if (typeof Toast !== 'undefined') Toast.show(`ðŸ‘¨â€ðŸ³ Báº¯t Ä‘áº§u lÃ m Ä‘Æ¡n ${orderId}`, 'info');

        // Call API to sync with server
        if (typeof APIService !== 'undefined') {
            try {
                const targetId = order.supabaseId || orderId;
                const result = await APIService.orders.updateStatus(targetId, 'preparing');

                if (!result.success) {
                    this.log('error', 'âŒ Failed to update status:', result.error);
                } else {
                    this.log('log', 'âœ… Status updated successfully in DB');
                }
            } catch (e) {
                this.log('error', 'âŒ API Error:', e);
            }
        }
    },

    async markReady(orderId) {
        const order = this.orders.find(o => o.id === orderId);
        if (order) {
            // Optimistic update
            order.status = 'ready';
            order.readyAt = new Date().toISOString();
            this.render();

            // Play sound
            this.playNotificationSound();

            // Notify staff locally (visual)
            this.notifyStaff(order);

            // Update counter
            this.updateReadyCounter();

            if (typeof Toast !== 'undefined') Toast.show(`âœ… ÄÆ¡n ${orderId} Ä‘Ã£ sáºµn sÃ ng phá»¥c vá»¥!`, 'success');

            // Call API
            if (typeof APIService !== 'undefined') {
                await APIService.orders.updateStatus(order.supabaseId || orderId, 'ready');
            }
        }
    },

    getAudioContext() {
        if (!this.audioContext) {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            if (AudioContext) {
                this.audioContext = new AudioContext();
            }
        }
        if (this.audioContext && this.audioContext.state === 'suspended') {
            this.audioContext.resume().catch(e => this.log('warn', 'Could not resume audio context:', e));
        }
        return this.audioContext;
    },

    playNotificationSound() {
        try {
            const ctx = this.getAudioContext();
            if (!ctx) return;

            const playTone = (freq, startTime) => {
                const oscillator = ctx.createOscillator();
                const gainNode = ctx.createGain();

                oscillator.connect(gainNode);
                gainNode.connect(ctx.destination);

                oscillator.frequency.value = freq;
                oscillator.type = 'sine';
                gainNode.gain.value = 0.3;

                oscillator.start(startTime);
                oscillator.stop(startTime + 0.3);
            };

            const now = ctx.currentTime;
            playTone(800, now);
            playTone(1000, now + 0.2); // Second beep
        } catch (e) {
            this.log('log', 'Audio not supported');
        }
    },

    notifyStaff(order) {
        // Remove existing notification if any
        document.getElementById('kitchenNotification')?.remove();

        // Create notification overlay
        const notification = document.createElement('div');
        notification.id = 'kitchenNotification';

        // Use class if possible, but inline styles for now as we don't edit CSS
        Object.assign(notification.style, {
            position: 'fixed',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            background: 'linear-gradient(135deg, #10b981, #059669)',
            color: 'white',
            padding: '2rem 3rem',
            borderRadius: '16px',
            boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
            zIndex: '10000',
            textAlign: 'center',
            animation: 'pulse 0.5s ease'
        });

        notification.innerHTML = `
            <div style="font-size: 4rem; margin-bottom: 1rem;">ðŸ””</div>
            <h2 style="font-size: 1.5rem; margin-bottom: 0.5rem;">ÄÆ N HÃ€NG Sáº´N SÃ€NG!</h2>
            <p style="font-size: 2rem; font-weight: bold; margin-bottom: 0.5rem;">${order.id}</p>
            <p style="font-size: 1.2rem; opacity: 0.9;">${order.table}</p>
            <p style="font-size: 1rem; margin-top: 1rem; opacity: 0.8;">${order.items}</p>
            <button id="kitchenNotificationClose" style="
                margin-top: 1.5rem;
                padding: 0.75rem 2rem;
                background: white;
                color: #059669;
                border: none;
                border-radius: 8px;
                font-size: 1rem;
                font-weight: bold;
                cursor: pointer;
            ">âœ… ÄÃ£ nháº­n</button>
        `;

        document.body.appendChild(notification);

        // Add event listener to button
        document.getElementById('kitchenNotificationClose').addEventListener('click', () => notification.remove());

        // Auto dismiss after 10 seconds
        setTimeout(() => {
            if (document.body.contains(notification)) {
                notification.remove();
            }
        }, 10000);
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
            if (typeof modal !== 'undefined') {
                modal.open('ðŸ”” ÄÆ¡n Sáºµn SÃ ng', `
                    <div style="text-align: center; padding: 2rem;">
                        <div style="font-size: 3rem;">âœ…</div>
                        <p style="margin-top: 1rem;">KhÃ´ng cÃ³ Ä‘Æ¡n hÃ ng sáºµn sÃ ng!</p>
                    </div>
                `, `<button class="btn-primary" onclick="modal.close()">ÄÃ³ng</button>`);
            }
            return;
        }

        const ordersHtml = readyOrders.map(o => `
            <div style="display: flex; justify-content: space-between; align-items: center; padding: 1rem; margin-bottom: 0.5rem; background: var(--bg-input); border-radius: 8px;">
                <div>
                    <strong>${o.id}</strong> - ${o.table}<br>
                    <small style="color: var(--text-muted);">${o.items}</small>
                </div>
                <button class="btn-success md-ripple md-focus-ring" onclick="KitchenDisplay.markServed('${o.id}')">ðŸ½ï¸ ÄÃ£ phá»¥c vá»¥</button>
            </div>
        `).join('');

        if (typeof modal !== 'undefined') {
            modal.open(`ðŸ”” ÄÆ¡n Sáºµn SÃ ng (${readyOrders.length})`, `
                <div style="max-height: 400px; overflow-y: auto;">
                    ${ordersHtml}
                </div>
            `, `<button class="btn-secondary" onclick="modal.close()">ÄÃ³ng</button>`);
        }
    },

    async markServed(orderId) {
        // Optimistic update from ready orders list
        if (typeof APIService !== 'undefined') {
            await APIService.orders.updateStatus(orderId, 'served');
        }

        // We also need to update localStorage for getReadyOrders to work correctly if it relies on it?
        // But getReadyOrders reads from localStorage 'fb_orders'.
        // The original code didn't seem to update 'fb_orders' in localStorage explicitly in markServed,
        // relying on APIService to update backend and then maybe a reload?
        // But APIService usually syncs.
        // For safety, let's update localStorage if it's there.
        const orders = JSON.parse(localStorage.getItem('fb_orders') || '[]');
        const updatedOrders = orders.map(o => o.id === orderId ? { ...o, status: 'served' } : o);
        localStorage.setItem('fb_orders', JSON.stringify(updatedOrders));

        this.updateReadyCounter();

        if (typeof modal !== 'undefined') modal.close();
        if (typeof Toast !== 'undefined') Toast.show(`ðŸ½ï¸ ÄÆ¡n ${orderId} Ä‘Ã£ Ä‘Æ°á»£c phá»¥c vá»¥!`, 'success');

        // Reload to sync
        this.loadOrders();
    },

    log(level, ...args) {
        if (window.Debug) {
            // Access console via bracket notation to be safe, though console is global
            const consoleObj = console;
            if (consoleObj && typeof consoleObj[level] === 'function') {
                consoleObj[level](...args);
            } else {
                console.log(...args);
            }
        }
    }
};

window.KitchenDisplay = KitchenDisplay;

