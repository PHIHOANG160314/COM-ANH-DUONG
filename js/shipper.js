/**
 * Shipper Portal Application
 * Handles shipper authentication, order management, and realtime updates
 */

const ShipperApp = {
    currentShipper: null,
    orders: [],
    currentFilter: 'all',
    realtimeChannel: null,

    // Check if Supabase is configured and ready
    isSupabaseReady() {
        return typeof SupabaseService !== 'undefined' &&
            typeof isSupabaseConfigured === 'function' &&
            isSupabaseConfigured();
    },

    // Initialize the app
    init() {
        console.log('🛵 Shipper Portal initializing...');

        // Check existing login
        const savedShipper = localStorage.getItem('shipper_session');
        if (savedShipper) {
            try {
                this.currentShipper = JSON.parse(savedShipper);
                this.showSection('dashboard');
                this.loadOrders();
                this.subscribeToOrders();
            } catch (e) {
                localStorage.removeItem('shipper_session');
            }
        }

        // Setup PIN input
        const pinInput = document.getElementById('shipperPin');
        if (pinInput) {
            pinInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') this.login();
            });
        }

        console.log('🛵 Shipper Portal ready!');
    },

    // Login with PIN
    async login() {
        const pin = document.getElementById('shipperPin')?.value;

        if (!pin || pin.length < 4) {
            this.showToast('Vui lòng nhập mã PIN 4 số', 'error');
            return;
        }

        // Check PIN against staff list (shippers have role = 'shipper')
        // For demo, accept PIN 1234 as default shipper
        const shippers = {
            '1234': { id: 'shipper1', name: 'Shipper Demo', phone: '0901234567' },
            '5678': { id: 'shipper2', name: 'Nguyễn Văn A', phone: '0909876543' }
        };

        if (shippers[pin]) {
            this.currentShipper = shippers[pin];
            localStorage.setItem('shipper_session', JSON.stringify(this.currentShipper));

            this.showToast(`Chào mừng ${this.currentShipper.name}!`, 'success');
            this.showSection('dashboard');
            this.loadOrders();
            this.subscribeToOrders();
        } else {
            this.showToast('Mã PIN không đúng', 'error');
            document.getElementById('shipperPin').value = '';
        }
    },

    // Logout
    logout() {
        this.currentShipper = null;
        localStorage.removeItem('shipper_session');

        // Unsubscribe from realtime
        if (this.realtimeChannel) {
            this.realtimeChannel.unsubscribe();
        }

        this.showSection('login');
        this.showToast('Đã đăng xuất');
    },

    // Show section
    showSection(sectionId) {
        document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
        const section = document.getElementById(`section-${sectionId}`);
        if (section) {
            section.classList.add('active');
        }

        // Update bottom nav
        document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
        const navItem = document.querySelector(`.nav-item[data-section="${sectionId}"]`);
        if (navItem) {
            navItem.classList.add('active');
        }

        // Toggle nav visibility
        const bottomNav = document.getElementById('bottomNav');
        if (bottomNav) {
            bottomNav.style.display = sectionId === 'login' ? 'none' : 'flex';
        }

        // Toggle header logout
        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            logoutBtn.style.display = sectionId === 'login' ? 'none' : 'block';
        }
    },

    // Load orders from Supabase
    async loadOrders() {
        try {
            console.log('🛵 Shipper: Checking Supabase...', this.isSupabaseReady());

            if (!this.isSupabaseReady()) {
                console.log('🛵 Shipper: Supabase not ready, using demo data');
                this.orders = this.getDemoOrders();
                this.renderOrders();
                this.updateStats();
                return;
            }

            const result = await SupabaseService.getOrders();
            if (result.error) {
                console.error('Shipper: Failed to load orders', result.error);
                this.showToast('Không tải được đơn hàng', 'error');
                return;
            }

            // Filter orders for delivery type with status pending/delivering
            this.orders = (result.data || []).filter(order =>
                order.order_type === 'delivery' &&
                ['pending', 'confirmed', 'preparing', 'ready', 'delivering'].includes(order.status)
            );

            console.log('🛵 Loaded', this.orders.length, 'delivery orders');
            this.renderOrders();
            this.updateStats();

        } catch (err) {
            console.error('Shipper: Error loading orders', err);
            this.showToast('Lỗi tải đơn hàng', 'error');
        }
    },

    // Subscribe to realtime order updates
    subscribeToOrders() {
        if (!this.isSupabaseReady()) {
            console.log('🛵 Shipper: Cannot subscribe - Supabase not ready');
            return;
        }

        SupabaseService.subscribeToOrders((payload) => {
            console.log('🛵 Realtime order update:', payload.eventType);

            if (payload.new?.order_type === 'delivery') {
                // Reload orders on any change
                this.loadOrders();

                // Show notification for new delivery orders
                if (payload.eventType === 'INSERT') {
                    this.showToast('🆕 Có đơn giao mới!', 'success');
                    this.playNotificationSound();
                }
            }
        }, 'ShipperPortal');

        console.log('🛵 Subscribed to realtime orders');
    },

    // Render orders list
    renderOrders() {
        const container = document.getElementById('ordersList');
        if (!container) return;

        let filteredOrders = this.orders;

        // Apply filter
        if (this.currentFilter === 'pending') {
            filteredOrders = this.orders.filter(o => ['pending', 'confirmed', 'preparing', 'ready'].includes(o.status));
        } else if (this.currentFilter === 'delivering') {
            filteredOrders = this.orders.filter(o => o.status === 'delivering');
        }

        if (filteredOrders.length === 0) {
            container.innerHTML = '<p class="no-orders">Không có đơn hàng</p>';
            return;
        }

        container.innerHTML = filteredOrders.map(order => this.renderOrderCard(order)).join('');
    },

    // Render single order card
    renderOrderCard(order) {
        const statusLabels = {
            'pending': '⏳ Chờ xác nhận',
            'confirmed': '✅ Đã xác nhận',
            'preparing': '👨‍🍳 Đang chuẩn bị',
            'ready': '📦 Sẵn sàng',
            'delivering': '🚀 Đang giao',
            'completed': '✅ Hoàn thành'
        };

        // Parse items
        let items = [];
        try {
            items = typeof order.items === 'string' ? JSON.parse(order.items) : order.items;
        } catch (e) {
            items = [];
        }

        const itemsText = items.map(item => `${item.name} x${item.qty}`).join(', ') || 'Không có thông tin';

        // Format address
        const address = order.notes || order.address || 'Không có địa chỉ';

        // Action buttons based on status
        let actionsHtml = '';

        if (['pending', 'confirmed', 'preparing', 'ready'].includes(order.status)) {
            actionsHtml = `
                <button class="btn-action primary" onclick="ShipperApp.pickupOrder('${order.id}')">
                    📦 Nhận đơn
                </button>
                <a class="btn-action navigate" href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}" target="_blank">
                    🗺️ Chỉ đường
                </a>
            `;
        } else if (order.status === 'delivering') {
            actionsHtml = `
                <button class="btn-action success" onclick="ShipperApp.completeOrder('${order.id}')">
                    ✅ Đã giao
                </button>
                <a class="btn-action navigate" href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}" target="_blank">
                    🗺️ Chỉ đường
                </a>
            `;
        }

        return `
            <div class="order-card" data-order-id="${order.id}">
                <div class="order-card-header">
                    <div>
                        <div class="order-id">#${order.order_number || order.id.substring(0, 8)}</div>
                        <div class="order-time">${this.formatTime(order.created_at)}</div>
                    </div>
                    <span class="order-status ${order.status}">${statusLabels[order.status] || order.status}</span>
                </div>
                
                <div class="order-customer">
                    <div class="customer-name">👤 ${order.customer_name || 'Khách hàng'}</div>
                    <div class="customer-phone">
                        📞 <a href="tel:${order.customer_phone}">${order.customer_phone || 'Không có SĐT'}</a>
                    </div>
                </div>
                
                <div class="order-address">
                    <div class="address-label">📍 Địa chỉ giao hàng</div>
                    <div class="address-text">${address}</div>
                </div>
                
                <div class="order-items">
                    <div class="order-items-title">🍽️ Món ăn</div>
                    <div class="order-items-list">${itemsText}</div>
                </div>
                
                <div class="order-total">
                    <span class="total-label">Tổng tiền:</span>
                    <span class="total-value">${this.formatPrice(order.total)}</span>
                </div>
                
                <div class="order-actions">
                    ${actionsHtml}
                </div>
            </div>
        `;
    },

    // Update order status
    async updateOrderStatus(orderId, newStatus) {
        try {
            if (!this.isSupabaseReady()) {
                // Demo mode - update locally
                const order = this.orders.find(o => o.id === orderId);
                if (order) {
                    order.status = newStatus;
                    this.renderOrders();
                    this.updateStats();
                    this.showToast(`Đơn hàng đã ${newStatus === 'delivering' ? 'nhận' : 'hoàn thành'}`, 'success');
                }
                return;
            }

            const result = await SupabaseService.updateOrderStatus(orderId, newStatus);
            if (result.error) {
                throw new Error(result.error);
            }

            this.showToast(`Cập nhật thành công`, 'success');
            this.loadOrders(); // Refresh

        } catch (err) {
            console.error('Shipper: Failed to update order', err);
            this.showToast('Lỗi cập nhật đơn hàng', 'error');
        }
    },

    // Pickup order
    pickupOrder(orderId) {
        this.updateOrderStatus(orderId, 'delivering');
    },

    // Complete order
    completeOrder(orderId) {
        if (confirm('Xác nhận đã giao hàng thành công?')) {
            this.updateOrderStatus(orderId, 'completed');
        }
    },

    // Filter orders
    filterOrders(filter) {
        this.currentFilter = filter;
        this.renderOrders();

        // Update nav
        document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
        const navItem = document.querySelector(`.nav-item[data-section="${filter}"]`) ||
            document.querySelector('.nav-item[data-section="dashboard"]');
        if (navItem) navItem.classList.add('active');
    },

    // Show history
    showHistory() {
        this.currentFilter = 'completed';
        // Load completed orders
        this.loadCompletedOrders();
    },

    // Load completed orders
    async loadCompletedOrders() {
        try {
            if (!this.isSupabaseReady()) {
                this.orders = this.getDemoOrders().filter(o => o.status === 'completed');
                this.renderOrders();
                return;
            }

            const result = await SupabaseService.getOrders();
            if (!result.error) {
                this.orders = (result.data || []).filter(order =>
                    order.order_type === 'delivery' && order.status === 'completed'
                ).slice(0, 20); // Last 20
                this.renderOrders();
            }
        } catch (err) {
            console.error('Shipper: Error loading history', err);
        }
    },

    // Update dashboard stats
    updateStats() {
        const pending = this.orders.filter(o => ['pending', 'confirmed', 'preparing', 'ready'].includes(o.status)).length;
        const delivering = this.orders.filter(o => o.status === 'delivering').length;
        const completed = this.orders.filter(o => o.status === 'completed').length;

        const pendingEl = document.getElementById('pendingCount');
        const deliveringEl = document.getElementById('deliveringCount');
        const completedEl = document.getElementById('completedCount');

        if (pendingEl) pendingEl.textContent = pending;
        if (deliveringEl) deliveringEl.textContent = delivering;
        if (completedEl) completedEl.textContent = completed;

        // Update badges
        const pendingBadge = document.getElementById('navPendingBadge');
        const deliveringBadge = document.getElementById('navDeliveringBadge');

        if (pendingBadge) {
            pendingBadge.textContent = pending;
            pendingBadge.style.display = pending > 0 ? 'block' : 'none';
        }
        if (deliveringBadge) {
            deliveringBadge.textContent = delivering;
            deliveringBadge.style.display = delivering > 0 ? 'block' : 'none';
        }

        // Calculate earnings (placeholder)
        const earnings = completed * 15000; // 15k per delivery
        const earningsEl = document.getElementById('todayEarnings');
        if (earningsEl) earningsEl.textContent = this.formatPrice(earnings);
    },

    // Refresh orders
    refreshOrders() {
        this.showToast('Đang làm mới...');
        this.loadOrders();
    },

    // Demo orders for testing
    getDemoOrders() {
        return [
            {
                id: 'demo1',
                order_number: 'AD260110-0001',
                customer_name: 'Nguyễn Văn Khách',
                customer_phone: '0901234567',
                notes: '123 Nguyễn Huệ, Q1, TP.HCM',
                items: JSON.stringify([
                    { name: 'Cơm tấm', qty: 2 },
                    { name: 'Trà đá', qty: 2 }
                ]),
                total: 85000,
                status: 'ready',
                order_type: 'delivery',
                created_at: new Date().toISOString()
            },
            {
                id: 'demo2',
                order_number: 'AD260110-0002',
                customer_name: 'Trần Thị Mai',
                customer_phone: '0909876543',
                notes: '456 Lê Lợi, Q3, TP.HCM',
                items: JSON.stringify([
                    { name: 'Phở bò', qty: 1 }
                ]),
                total: 55000,
                status: 'delivering',
                order_type: 'delivery',
                created_at: new Date(Date.now() - 600000).toISOString()
            }
        ];
    },

    // Utility: Format time
    formatTime(dateString) {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
    },

    // Utility: Format price
    formatPrice(amount) {
        if (!amount) return '0đ';
        return new Intl.NumberFormat('vi-VN').format(amount) + 'đ';
    },

    // Utility: Show toast
    showToast(message, type = 'info') {
        const container = document.getElementById('toastContainer');
        if (!container) return;

        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.textContent = message;

        container.appendChild(toast);

        setTimeout(() => {
            toast.remove();
        }, 3000);
    },

    // Play notification sound
    playNotificationSound() {
        try {
            const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2teleVE4PnmSl4Z4a11bZ3p+dmNUTVFcbXh3bGVjbnh9d29mYl9kbm9qaGNhY2ZoZmFdW1tdXl1XU09RU1NRTUpISkxMSUdFREVFRkRDQkJCQkJBQD8/Pz8/Pj09PT09PDw7Ozs7Ojo5OTk5OTg4Nzc3NzY2NjU1NTU0NDQzMzMzMjIyMTExMTAwMC8vLy8uLi4tLS0sLCwrKysrKiopKSkoKCgnJycnJiYmJSUlJCQkJCMjIyIiIiEhISEgICAf');
            audio.volume = 0.5;
            audio.play().catch(() => { });
        } catch (e) { }
    }
};

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', () => {
    ShipperApp.init();
});
