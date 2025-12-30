// ========================================
// F&B MASTER - REAL-TIME KITCHEN
// Supabase Realtime + Fallback Simulation
// ========================================

const KitchenRealtime = {
    // Connection states
    connectionState: 'disconnected',
    reconnectAttempts: 0,
    maxReconnectAttempts: 5,
    reconnectDelay: 3000,
    useSupabase: false,
    supabaseChannel: null,

    // Order queue
    orders: [],
    listeners: [],

    // Preparation times (in seconds)
    prepTimes: {
        drink: { min: 60, max: 180 },      // 1-3 min
        appetizer: { min: 180, max: 300 }, // 3-5 min
        main: { min: 300, max: 600 },      // 5-10 min
        dessert: { min: 180, max: 300 }    // 3-5 min
    },

    async init() {
        if (window.Debug) Debug.info('Kitchen Realtime initializing...');
        this.loadOrders();

        // Try Supabase real-time first
        if (window.isSupabaseConfigured && isSupabaseConfigured()) {
            await this.connectSupabase();
        } else {
            this.connect(); // Fallback to simulation
        }

        this.startSimulation();
        if (window.Debug) Debug.info('Kitchen Realtime ready', this.useSupabase ? '(Supabase)' : '(Local)');
    },

    // ========================================
    // SUPABASE REAL-TIME CONNECTION
    // ========================================

    async connectSupabase() {
        try {
            const supabase = await window.getSupabase?.();
            if (!supabase) {
                this.connect();
                return;
            }

            // Subscribe to orders changes
            this.supabaseChannel = supabase.channel('kitchen-orders')
                .on('postgres_changes',
                    { event: '*', schema: 'public', table: 'orders' },
                    (payload) => {
                        this.handleRealtimeEvent(payload);
                    }
                )
                .subscribe((status) => {
                    if (status === 'SUBSCRIBED') {
                        this.connectionState = 'connected';
                        this.useSupabase = true;
                        this.updateConnectionUI();
                        this.emit('connected');
                        if (window.Debug) Debug.info('Kitchen connected to Supabase Realtime');
                    }
                });

        } catch (e) {
            if (window.Debug) Debug.warn('Supabase realtime failed, using simulation:', e.message);
            this.connect();
        }
    },

    handleRealtimeEvent(payload) {
        const { eventType, new: newRecord, old: oldRecord } = payload;

        if (eventType === 'INSERT') {
            this.emit('orderAdded', newRecord);
        } else if (eventType === 'UPDATE') {
            this.emit('orderUpdated', newRecord);
        } else if (eventType === 'DELETE') {
            this.emit('orderCompleted', oldRecord);
        }

        this.refreshDisplay();
    },


    // ========================================
    // CONNECTION MANAGEMENT
    // ========================================

    connect() {
        this.connectionState = 'connecting';
        this.updateConnectionUI();

        // Simulate connection delay
        setTimeout(() => {
            this.connectionState = 'connected';
            this.reconnectAttempts = 0;
            this.updateConnectionUI();
            this.emit('connected');
            if (window.Debug) Debug.info('Kitchen WebSocket connected (simulated)');
        }, 1000);
    },

    disconnect() {
        this.connectionState = 'disconnected';
        this.updateConnectionUI();
        this.emit('disconnected');
    },

    reconnect() {
        if (this.reconnectAttempts >= this.maxReconnectAttempts) {
            if (window.Debug) Debug.error('Max reconnect attempts reached');
            return;
        }

        this.reconnectAttempts++;
        this.connectionState = 'reconnecting';
        this.updateConnectionUI();

        setTimeout(() => {
            this.connect();
        }, this.reconnectDelay);
    },

    updateConnectionUI() {
        const indicator = document.getElementById('kitchenConnectionStatus');
        if (!indicator) return;

        const states = {
            connected: { color: '#10b981', text: '🟢 Kết nối' },
            connecting: { color: '#f59e0b', text: '🟡 Đang kết nối...' },
            reconnecting: { color: '#f59e0b', text: '🟡 Đang kết nối lại...' },
            disconnected: { color: '#ef4444', text: '🔴 Mất kết nối' }
        };

        const state = states[this.connectionState];
        indicator.style.color = state.color;
        indicator.textContent = state.text;
    },

    // ========================================
    // ORDER MANAGEMENT
    // ========================================

    loadOrders() {
        this.orders = JSON.parse(localStorage.getItem('kitchen_orders') || '[]');
    },

    saveOrders() {
        localStorage.setItem('kitchen_orders', JSON.stringify(this.orders));
    },

    addOrder(order) {
        const kitchenOrder = {
            id: order.id || 'ORD' + Date.now(),
            items: order.items,
            customer: order.customer || 'Khách hàng',
            table: order.table || null,
            status: 'pending',
            createdAt: new Date().toISOString(),
            estimatedTime: this.calculateEstimatedTime(order.items),
            progress: 0,
            notes: order.notes || ''
        };

        this.orders.push(kitchenOrder);
        this.saveOrders();
        this.emit('orderAdded', kitchenOrder);

        // Start preparation
        this.startPreparation(kitchenOrder.id);

        return kitchenOrder;
    },

    calculateEstimatedTime(items) {
        let maxTime = 0;
        items.forEach(item => {
            const category = item.category || 'main';
            const prep = this.prepTimes[category] || this.prepTimes.main;
            const itemTime = prep.min + Math.random() * (prep.max - prep.min);
            maxTime = Math.max(maxTime, itemTime);
        });
        return Math.ceil(maxTime);
    },

    startPreparation(orderId) {
        const order = this.orders.find(o => o.id === orderId);
        if (!order) return;

        order.status = 'preparing';
        order.startedAt = new Date().toISOString();
        this.saveOrders();
        this.emit('orderUpdated', order);

        // Notify customer
        if (typeof PushNotifications !== 'undefined') {
            PushNotifications.showInAppNotification({
                type: 'info',
                title: 'Bắt đầu chuẩn bị',
                message: `Đơn #${order.id} đang được chuẩn bị`,
                icon: '👨‍🍳'
            });
        }
    },

    updateOrderProgress(orderId, progress) {
        const order = this.orders.find(o => o.id === orderId);
        if (!order) return;

        order.progress = Math.min(100, progress);

        if (order.progress >= 100 && order.status === 'preparing') {
            order.status = 'ready';
            order.readyAt = new Date().toISOString();

            // Notify customer
            if (typeof PushNotifications !== 'undefined') {
                PushNotifications.orderReady(order.id);
            }

            // Celebration
            if (typeof Confetti !== 'undefined') {
                Confetti.starBurst();
            }
        }

        this.saveOrders();
        this.emit('orderUpdated', order);
    },

    completeOrder(orderId) {
        const order = this.orders.find(o => o.id === orderId);
        if (!order) return;

        order.status = 'completed';
        order.completedAt = new Date().toISOString();
        this.saveOrders();
        this.emit('orderCompleted', order);
    },

    // ========================================
    // SIMULATION ENGINE
    // ========================================

    startSimulation() {
        // Update orders every 2 seconds
        setInterval(() => {
            this.orders.forEach(order => {
                if (order.status === 'preparing') {
                    const elapsedTime = (Date.now() - new Date(order.startedAt).getTime()) / 1000;
                    const progress = Math.min(100, (elapsedTime / order.estimatedTime) * 100);
                    this.updateOrderProgress(order.id, progress);
                }
            });
        }, 2000);
    },

    // ========================================
    // EVENT SYSTEM
    // ========================================

    on(event, callback) {
        this.listeners.push({ event, callback });
    },

    off(event, callback) {
        this.listeners = this.listeners.filter(l =>
            l.event !== event || l.callback !== callback
        );
    },

    emit(event, data) {
        this.listeners
            .filter(l => l.event === event)
            .forEach(l => l.callback(data));
    },

    // ========================================
    // KITCHEN DISPLAY UI
    // ========================================

    showKitchenDisplay() {
        const modal = document.createElement('div');
        modal.className = 'kitchen-display-modal';
        modal.id = 'kitchenDisplayModal';
        modal.innerHTML = `
            <div class="kitchen-display">
                <div class="kitchen-header">
                    <h2>👨‍🍳 Kitchen Display</h2>
                    <div class="kitchen-header-right">
                        <span id="kitchenConnectionStatus">🟢 Kết nối</span>
                        <button onclick="KitchenRealtime.closeDisplay()">✕</button>
                    </div>
                </div>
                <div class="kitchen-stats">
                    <div class="stat">
                        <span class="stat-value" id="pendingCount">0</span>
                        <span class="stat-label">Chờ</span>
                    </div>
                    <div class="stat">
                        <span class="stat-value" id="preparingCount">0</span>
                        <span class="stat-label">Đang làm</span>
                    </div>
                    <div class="stat">
                        <span class="stat-value" id="readyCount">0</span>
                        <span class="stat-label">Sẵn sàng</span>
                    </div>
                </div>
                <div class="kitchen-orders" id="kitchenOrdersGrid">
                    ${this.renderOrders()}
                </div>
            </div>
        `;
        document.body.appendChild(modal);
        document.body.style.overflow = 'hidden';
        this.injectStyles();
        this.updateStats();

        // Listen for updates
        this.on('orderUpdated', () => {
            this.refreshDisplay();
        });
    },

    closeDisplay() {
        const modal = document.getElementById('kitchenDisplayModal');
        if (modal) {
            modal.remove();
            document.body.style.overflow = '';
        }
    },

    renderOrders() {
        const activeOrders = this.orders.filter(o =>
            ['pending', 'preparing', 'ready'].includes(o.status)
        );

        if (activeOrders.length === 0) {
            return `
                <div class="no-orders">
                    <span>🍳</span>
                    <p>Không có đơn hàng</p>
                </div>
            `;
        }

        return activeOrders.map(order => `
            <div class="kitchen-order-card status-${order.status}">
                <div class="order-header">
                    <span class="order-id">#${order.id.slice(-6)}</span>
                    <span class="order-time">${this.formatTime(order.createdAt)}</span>
                </div>
                <div class="order-items">
                    ${order.items.map(item => `
                        <div class="order-item">
                            <span>${item.icon || '🍽️'} ${item.name}</span>
                            <span>x${item.qty || 1}</span>
                        </div>
                    `).join('')}
                </div>
                ${order.notes ? `<div class="order-notes">📝 ${order.notes}</div>` : ''}
                ${order.status === 'preparing' ? `
                    <div class="order-progress">
                        <div class="progress-bar">
                            <div class="progress-fill" style="width: ${order.progress}%"></div>
                        </div>
                        <span>${Math.round(order.progress)}%</span>
                    </div>
                ` : ''}
                <div class="order-actions">
                    ${order.status === 'pending' ? `
                        <button onclick="KitchenRealtime.startPreparation('${order.id}')">
                            🍳 Bắt đầu
                        </button>
                    ` : ''}
                    ${order.status === 'preparing' ? `
                        <button onclick="KitchenRealtime.updateOrderProgress('${order.id}', 100)">
                            ✅ Xong
                        </button>
                    ` : ''}
                    ${order.status === 'ready' ? `
                        <button onclick="KitchenRealtime.completeOrder('${order.id}')">
                            📦 Giao
                        </button>
                    ` : ''}
                </div>
            </div>
        `).join('');
    },

    refreshDisplay() {
        const grid = document.getElementById('kitchenOrdersGrid');
        if (grid) {
            grid.innerHTML = this.renderOrders();
        }
        this.updateStats();
    },

    updateStats() {
        const pending = this.orders.filter(o => o.status === 'pending').length;
        const preparing = this.orders.filter(o => o.status === 'preparing').length;
        const ready = this.orders.filter(o => o.status === 'ready').length;

        const pendingEl = document.getElementById('pendingCount');
        const preparingEl = document.getElementById('preparingCount');
        const readyEl = document.getElementById('readyCount');

        if (pendingEl) pendingEl.textContent = pending;
        if (preparingEl) preparingEl.textContent = preparing;
        if (readyEl) readyEl.textContent = ready;
    },

    formatTime(timestamp) {
        const date = new Date(timestamp);
        return date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
    },

    // ========================================
    // STYLES
    // ========================================

    injectStyles() {
        if (document.getElementById('kitchenRealtimeStyles')) return;

        const style = document.createElement('style');
        style.id = 'kitchenRealtimeStyles';
        style.textContent = `
            .kitchen-display-modal {
                position: fixed;
                inset: 0;
                z-index: 2000;
                background: var(--bg-main, #0f0f23);
            }

            .kitchen-display {
                height: 100%;
                display: flex;
                flex-direction: column;
            }

            .kitchen-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 16px 20px;
                background: var(--bg-card);
                border-bottom: 1px solid var(--border);
            }

            .kitchen-header h2 { margin: 0; }

            .kitchen-header-right {
                display: flex;
                align-items: center;
                gap: 16px;
            }

            .kitchen-header button {
                width: 36px;
                height: 36px;
                border: none;
                background: rgba(255,255,255,0.1);
                color: var(--text-primary);
                border-radius: 50%;
                cursor: pointer;
            }

            .kitchen-stats {
                display: grid;
                grid-template-columns: repeat(3, 1fr);
                gap: 12px;
                padding: 16px 20px;
                background: var(--bg-card);
            }

            .kitchen-stats .stat {
                text-align: center;
                padding: 12px;
                background: rgba(255,255,255,0.05);
                border-radius: 12px;
            }

            .stat-value {
                display: block;
                font-size: 2rem;
                font-weight: 700;
            }

            .stat-label {
                font-size: 0.8rem;
                color: var(--text-muted);
            }

            .kitchen-orders {
                flex: 1;
                overflow-y: auto;
                padding: 16px;
                display: grid;
                grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
                gap: 16px;
                align-content: start;
            }

            .no-orders {
                grid-column: 1 / -1;
                text-align: center;
                padding: 60px 20px;
                color: var(--text-muted);
            }

            .no-orders span {
                font-size: 4rem;
                display: block;
                margin-bottom: 16px;
            }

            .kitchen-order-card {
                background: var(--bg-card);
                border-radius: 16px;
                padding: 16px;
                border-left: 4px solid;
            }

            .kitchen-order-card.status-pending {
                border-color: #f59e0b;
            }

            .kitchen-order-card.status-preparing {
                border-color: #3b82f6;
                animation: pulse 2s infinite;
            }

            .kitchen-order-card.status-ready {
                border-color: #10b981;
            }

            @keyframes pulse {
                0%, 100% { opacity: 1; }
                50% { opacity: 0.8; }
            }

            .order-header {
                display: flex;
                justify-content: space-between;
                margin-bottom: 12px;
            }

            .order-id {
                font-weight: 700;
                font-size: 1.1rem;
            }

            .order-time {
                color: var(--text-muted);
                font-size: 0.85rem;
            }

            .order-items {
                margin-bottom: 12px;
            }

            .order-item {
                display: flex;
                justify-content: space-between;
                padding: 8px 0;
                border-bottom: 1px solid var(--border);
            }

            .order-item:last-child { border: none; }

            .order-notes {
                padding: 8px 12px;
                background: rgba(251, 191, 36, 0.1);
                border-radius: 8px;
                font-size: 0.85rem;
                margin-bottom: 12px;
            }

            .order-progress {
                display: flex;
                align-items: center;
                gap: 12px;
                margin-bottom: 12px;
            }

            .progress-bar {
                flex: 1;
                height: 8px;
                background: rgba(255,255,255,0.1);
                border-radius: 4px;
                overflow: hidden;
            }

            .progress-fill {
                height: 100%;
                background: linear-gradient(90deg, var(--primary), var(--secondary));
                border-radius: 4px;
                transition: width 0.5s;
            }

            .order-actions button {
                width: 100%;
                padding: 12px;
                border: none;
                border-radius: 12px;
                font-size: 0.9rem;
                font-weight: 600;
                cursor: pointer;
                background: linear-gradient(135deg, var(--primary), var(--secondary));
                color: white;
            }
        `;
        document.head.appendChild(style);
    }
};

// Initialize
document.addEventListener('DOMContentLoaded', () => KitchenRealtime.init());

window.KitchenRealtime = KitchenRealtime;
