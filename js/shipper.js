/**
 * F&B Master - Shipper Portal
 * Author: Google DeepMind / Antigravity Team
 * Description: Delivery management, order pickup, and location tracking for shippers.
 */

const ShipperApp = {
    currentShipper: null,
    orders: [],
    deliveries: [],
    currentFilter: 'all',
    realtimeChannel: null,
    locationWatchId: null,
    locationUpdateInterval: null,

    // ==================== INITIALIZATION ====================

    // Check if Supabase is configured and ready
    isSupabaseReady() {
        return typeof SupabaseService !== 'undefined' &&
            typeof isSupabaseConfigured === 'function' &&
            isSupabaseConfigured();
    },

    // Initialize the app
    init() {
        if (window.Debug) Debug.info('🛵 Shipper Portal v2.0 initializing...');

        // Clear old legacy sessions (force re-login with new secure auth)
        localStorage.removeItem('shipper_session');

        // Check existing login from ShipperAuth ONLY
        if (typeof ShipperAuth !== 'undefined') {
            const session = ShipperAuth.getSession();
            if (session) {
                this.currentShipper = session;
                this.onLoginSuccess();
            }
        }
        // No fallback - must use ShipperAuth

        // Setup PIN inputs
        this.setupLoginForm();

        if (window.Debug) Debug.info('🛵 Shipper Portal ready!');
    },

    // Setup login form events
    setupLoginForm() {
        const phoneInput = document.getElementById('shipperPhone');
        const pinInput = document.getElementById('shipperPin');

        if (phoneInput) {
            phoneInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    pinInput?.focus();
                }
            });
        }

        if (pinInput) {
            pinInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') this.login();
            });
        }
    },

    // ==================== AUTHENTICATION ====================

    // Login with phone + PIN
    async login() {
        const phone = document.getElementById('shipperPhone')?.value?.trim();
        const pin = document.getElementById('shipperPin')?.value?.trim();

        if (!phone || phone.length < 10) {
            this.showToast('Vui lòng nhập số điện thoại hợp lệ', 'error');
            return;
        }

        if (!pin || pin.length < 4) {
            this.showToast('Vui lòng nhập mã PIN 4 số', 'error');
            return;
        }

        // Show loading
        const loginBtn = document.querySelector('.btn-login');
        if (loginBtn) {
            loginBtn.disabled = true;
            loginBtn.textContent = 'Đang đăng nhập...';
        }

        try {
            // Use ShipperAuth service with device lock and working hours
            if (typeof ShipperAuth !== 'undefined' && this.isSupabaseReady()) {
                const result = await ShipperAuth.login(phone, pin);

                if (result.success) {
                    this.currentShipper = result.shipper;
                    this.onLoginSuccess();
                } else {
                    this.showToast(result.error || 'Đăng nhập thất bại', 'error');
                }
            } else if (!this.isSupabaseReady()) {
                // Demo mode - use hardcoded shippers (for development only)
                const demoShippers = {
                    '0901234567': { id: 'demo1', name: 'Shipper Demo', phone: '0901234567', pin: '1234', status: 'online', rating: 4.8, total_deliveries: 125, commission_rate: 15000 },
                    '0909876543': { id: 'demo2', name: 'Nguyễn Văn Shipper', phone: '0909876543', pin: '5678', status: 'online', rating: 4.5, total_deliveries: 89, commission_rate: 15000 }
                };

                const shipper = demoShippers[phone];
                if (shipper && shipper.pin === pin) {
                    this.currentShipper = shipper;
                    localStorage.setItem('shipper_session', JSON.stringify(shipper));
                    this.onLoginSuccess();
                } else {
                    this.showToast('Số điện thoại hoặc mã PIN không đúng', 'error');
                }
            } else {
                this.showToast('Lỗi kết nối, vui lòng thử lại', 'error');
            }
        } catch (err) {
            console.error('Login error:', err);
            this.showToast('Lỗi đăng nhập, vui lòng thử lại', 'error');
        } finally {
            if (loginBtn) {
                loginBtn.disabled = false;
                loginBtn.textContent = 'Đăng nhập';
            }
            document.getElementById('shipperPin').value = '';
        }
    },

    // After successful login
    async onLoginSuccess() {
        this.showToast(`Chào mừng ${this.currentShipper.name}!`, 'success');
        this.showSection('dashboard');
        this.updateHeader();
        this.loadOrders();
        this.loadMyDeliveries();
        this.subscribeToUpdates();
        this.startLocationTracking();
        this.loadEarnings();

        // Set status to online
        if (this.isSupabaseReady() && this.currentShipper?.id) {
            await SupabaseService.updateShipperStatus(this.currentShipper.id, 'online');
            this.currentShipper.status = 'online';
            this.updateStatusToggle();
        }
    },

    // Logout
    async logout() {
        // Set status to offline before logout
        if (this.isSupabaseReady() && this.currentShipper?.id) {
            await SupabaseService.updateShipperStatus(this.currentShipper.id, 'offline');
        }

        this.stopLocationTracking();
        this.currentShipper = null;

        // Clear both auth systems
        if (typeof ShipperAuth !== 'undefined') {
            ShipperAuth.logout();
        }
        localStorage.removeItem('shipper_session');

        // Unsubscribe from realtime
        if (this.realtimeChannel) {
            this.realtimeChannel.unsubscribe();
        }

        this.showSection('login');
        this.showToast('Đã đăng xuất');
    },

    // ==================== STATUS MANAGEMENT ====================

    // Toggle online/offline status
    async toggleStatus() {
        if (!this.currentShipper) return;

        const newStatus = this.currentShipper.status === 'online' ? 'offline' : 'online';

        if (this.isSupabaseReady() && this.currentShipper?.id) {
            const result = await SupabaseService.updateShipperStatus(this.currentShipper.id, newStatus);
            if (!result.error) {
                this.currentShipper.status = newStatus;
                this.updateStatusToggle();
                this.showToast(newStatus === 'online' ? '🟢 Đang nhận đơn' : '⚪ Đã tắt nhận đơn');
            }
        } else {
            // Demo mode
            this.currentShipper.status = newStatus;
            this.updateStatusToggle();
            this.showToast(newStatus === 'online' ? '🟢 Đang nhận đơn' : '⚪ Đã tắt nhận đơn');
        }

        // Update location tracking based on status
        if (newStatus === 'online') {
            this.startLocationTracking();
        } else {
            this.stopLocationTracking();
        }
    },

    // Update status toggle UI
    updateStatusToggle() {
        const statusEl = document.getElementById('shipperStatus');
        const statusToggle = document.getElementById('statusToggle');

        if (statusEl) {
            const status = this.currentShipper?.status || 'offline';
            const statusMap = {
                'online': '🟢 Online',
                'offline': '⚪ Offline',
                'busy': '🟡 Đang giao'
            };
            statusEl.textContent = statusMap[status] || status;
            statusEl.className = `shipper-status ${status}`;
        }

        if (statusToggle) {
            // Support both md-switch (selected) and native input (checked)
            const isOnline = this.currentShipper?.status === 'online';
            if ('selected' in statusToggle) {
                statusToggle.selected = isOnline;
            } else {
                statusToggle.checked = isOnline;
            }
        }
    },

    // ==================== LOCATION TRACKING ====================

    // Start GPS location tracking
    startLocationTracking() {
        if (!navigator.geolocation) {
            console.warn('Geolocation not supported');
            return;
        }

        // Watch position changes
        this.locationWatchId = navigator.geolocation.watchPosition(
            (position) => this.onLocationUpdate(position),
            (error) => console.warn('Location error:', error.message),
            {
                enableHighAccuracy: true,
                timeout: 30000,
                maximumAge: 10000
            }
        );

        // Also update location every 30 seconds
        this.locationUpdateInterval = setInterval(() => {
            navigator.geolocation.getCurrentPosition(
                (position) => this.onLocationUpdate(position),
                (error) => console.warn('Location update error:', error.message)
            );
        }, 30000);

        console.log('📍 Location tracking started');
    },

    // Handle location update
    async onLocationUpdate(position) {
        const { latitude, longitude } = position.coords;

        if (this.isSupabaseReady() && this.currentShipper?.id) {
            await SupabaseService.updateShipperLocation(this.currentShipper.id, latitude, longitude);
        }

        // Update local cache
        this.currentShipper.current_location = {
            lat: latitude,
            lng: longitude,
            updated_at: new Date().toISOString()
        };
    },

    // Stop location tracking
    stopLocationTracking() {
        if (this.locationWatchId) {
            navigator.geolocation.clearWatch(this.locationWatchId);
            this.locationWatchId = null;
        }

        if (this.locationUpdateInterval) {
            clearInterval(this.locationUpdateInterval);
            this.locationUpdateInterval = null;
        }

        console.log('📍 Location tracking stopped');
    },

    // ==================== ORDERS & DELIVERIES ====================

    // Load available orders from Supabase
    async loadOrders() {
        const container = document.getElementById('ordersList');

        try {
            console.log('🛵 Loading orders...');

            if (!this.isSupabaseReady()) {
                this.orders = this.getDemoOrders();
                this.renderOrders();
                this.updateStats();
                return;
            }

            // Get pending delivery orders
            const result = await SupabaseService.getPendingDeliveryOrders();
            if (result.error) {
                console.error('Failed to load orders', result.error);
                this.orders = [];
                if (container) {
                    container.innerHTML = '<p class="no-orders">⚠️ Lỗi tải đơn hàng. Kéo xuống để thử lại.</p>';
                }
                this.updateStats();
                return;
            }

            this.orders = result.data || [];
            console.log('🛵 Loaded', this.orders.length, 'available orders');
            this.renderOrders();
            this.updateStats();

        } catch (err) {
            console.error('Error loading orders', err);
            this.orders = [];
            if (container) {
                container.innerHTML = '<p class="no-orders">⚠️ Không thể tải đơn hàng</p>';
            }
            this.updateStats();
        }
    },

    // Load shipper's own deliveries
    async loadMyDeliveries() {
        if (!this.isSupabaseReady() || !this.currentShipper?.id) {
            this.deliveries = [];
            return;
        }

        try {
            const result = await SupabaseService.getShipperDeliveries(
                this.currentShipper.id,
                ['assigned', 'picked_up', 'delivering']
            );

            if (!result.error) {
                this.deliveries = result.data || [];
                this.renderMyDeliveries();
            }
        } catch (err) {
            console.error('Error loading deliveries', err);
        }
    },

    // Subscribe to realtime order updates
    subscribeToUpdates() {
        if (!this.isSupabaseReady()) {
            console.log('🛵 Cannot subscribe - Supabase not ready');
            return;
        }

        // Subscribe to order changes
        SupabaseService.subscribeToOrders((payload) => {
            console.log('🛵 Order update:', payload.eventType);
            if (payload.new?.order_type === 'delivery') {
                this.loadOrders();

                if (payload.eventType === 'INSERT') {
                    this.showToast('🆕 Có đơn giao mới!', 'success');
                    this.playNotificationSound();
                }
            }
        }, 'ShipperPortal');

        // Subscribe to my assignments
        if (this.currentShipper?.id) {
            SupabaseService.subscribeToShipperAssignments(this.currentShipper.id, (payload) => {
                console.log('🛵 My assignment update:', payload.eventType);
                this.loadMyDeliveries();
                this.loadEarnings();
            });
        }

        console.log('🛵 Subscribed to realtime updates');
    },

    // ==================== RENDERING ====================

    // Update header with shipper info
    updateHeader() {
        const nameEl = document.getElementById('shipperName');
        const ratingEl = document.getElementById('shipperRating');

        if (nameEl) nameEl.textContent = this.currentShipper?.name || 'Shipper';
        if (ratingEl) ratingEl.innerHTML = `<md-icon style="font-size: 16px; color: #FFC107;">star</md-icon> ${this.currentShipper?.rating?.toFixed(1) || '5.0'}`;

        this.updateStatusToggle();
    },

    // Render available orders list
    renderOrders() {
        const container = document.getElementById('ordersList');
        if (!container) return;

        let filteredOrders = this.orders;

        // Apply filter
        if (this.currentFilter === 'pending') {
            filteredOrders = this.orders.filter(o => ['pending', 'confirmed', 'preparing', 'ready'].includes(o.status));
        } else if (this.currentFilter === 'delivering') {
            filteredOrders = this.deliveries.map(d => d.order);
        }

        if (filteredOrders.length === 0) {
            container.innerHTML = '<p class="no-orders">Không có đơn hàng mới</p>';
            return;
        }

        container.innerHTML = filteredOrders.map(order => this.renderOrderCard(order)).join('');
    },

    // Render my active deliveries
    renderMyDeliveries() {
        const container = document.getElementById('myDeliveriesList');
        if (!container) return;

        if (this.deliveries.length === 0) {
            container.innerHTML = '<p class="no-orders">Không có đơn đang giao</p>';
            return;
        }

        container.innerHTML = this.deliveries.map(delivery =>
            this.renderDeliveryCard(delivery)
        ).join('');
    },

    // Render single order card
    renderOrderCard(order) {
        const statusLabels = {
            'pending': '⏳ Chờ xác nhận',
            'confirmed': '✅ Đã xác nhận',
            'preparing': '👨‍🍳 Đang chuẩn bị',
            'ready': '📦 Sẵn sàng giao'
        };

        let items = [];
        try {
            items = typeof order.items === 'string' ? JSON.parse(order.items) : order.items;
        } catch (e) {
            items = [];
        }

        const itemsText = items.map(item => `${item.name} x${item.qty || item.quantity || 1}`).join(', ') || 'Không có thông tin';
        const address = order.notes || order.address || 'Không có địa chỉ';

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
                    <md-filled-button class="btn-action" onclick="ShipperApp.pickupOrder('${order.id}')">
                        <md-icon slot="icon">inventory_2</md-icon>
                        Nhận đơn
                    </md-filled-button>
                    <md-outlined-button class="btn-action" href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}" target="_blank">
                        <md-icon slot="icon">map</md-icon>
                        Chỉ đường
                    </md-outlined-button>
                </div>
            </div>
        `;
    },

    // Render delivery card (my active delivery)
    renderDeliveryCard(delivery) {
        const order = delivery.order || {};
        const statusLabels = {
            'assigned': '📌 Đã nhận',
            'picked_up': '🏃 Đã lấy hàng',
            'delivering': '🚀 Đang giao'
        };

        let items = [];
        try {
            items = typeof order.items === 'string' ? JSON.parse(order.items) : order.items;
        } catch (e) {
            items = [];
        }

        const itemsText = items.map(item => `${item.name} x${item.qty || item.quantity || 1}`).join(', ');
        const address = order.notes || order.address || 'Không có địa chỉ';

        let actionsHtml = '';
        if (delivery.status === 'assigned') {
            actionsHtml = `
                <md-filled-button class="btn-action" onclick="ShipperApp.updateDelivery('${delivery.id}', 'picked_up')">
                    <md-icon slot="icon">directions_run</md-icon>
                    Đã lấy hàng
                </md-filled-button>
            `;
        } else if (delivery.status === 'picked_up' || delivery.status === 'delivering') {
            actionsHtml = `
                <md-filled-button class="btn-action" onclick="ShipperApp.completeDelivery('${delivery.id}')" style="--md-filled-button-container-color: var(--ad-color-success); --md-filled-button-label-text-color: var(--ad-color-on-success);">
                    <md-icon slot="icon">check</md-icon>
                    Đã giao xong
                </md-filled-button>
            `;
        }

        return `
            <div class="order-card delivery-card ${delivery.status}" data-delivery-id="${delivery.id}">
                <div class="delivery-badge">${statusLabels[delivery.status] || delivery.status}</div>

                <div class="order-card-header">
                    <div>
                        <div class="order-id">#${order.order_number || order.id?.substring(0, 8)}</div>
                        <div class="order-time">${this.formatTime(delivery.assigned_at)}</div>
                    </div>
                    <span class="commission-badge">+${this.formatPrice(delivery.commission || this.currentShipper?.commission_rate || 15000)}</span>
                </div>

                <div class="order-customer">
                    <div class="customer-name" style="display: flex; align-items: center; gap: 4px;">
                        <md-icon style="font-size: 18px;">person</md-icon>
                        ${order.customer_name || 'Khách hàng'}
                    </div>
                    <div class="customer-phone" style="display: flex; align-items: center; gap: 4px;">
                        <md-icon style="font-size: 16px;">call</md-icon>
                        <a href="tel:${order.customer_phone}">${order.customer_phone || 'Không có SĐT'}</a>
                    </div>
                </div>

                <div class="order-address">
                    <div class="address-label" style="display: flex; align-items: center; gap: 4px;">
                        <md-icon style="font-size: 14px;">location_on</md-icon>
                        Địa chỉ giao hàng
                    </div>
                    <div class="address-text">${address}</div>
                </div>

                <div class="order-items">
                    <div class="order-items-title" style="display: flex; align-items: center; gap: 4px;">
                        <md-icon style="font-size: 14px;">restaurant</md-icon>
                        ${itemsText}
                    </div>
                </div>

                <div class="order-total">
                    <span class="total-label">Thu hộ:</span>
                    <span class="total-value">${this.formatPrice(order.total)}</span>
                </div>

                <div class="order-actions">
                    ${actionsHtml}
                    <md-outlined-button class="btn-action" href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}" target="_blank">
                        <md-icon slot="icon">map</md-icon>
                        Chỉ đường
                    </md-outlined-button>
                    <md-outlined-button class="btn-action" href="tel:${order.customer_phone}">
                        <md-icon slot="icon">call</md-icon>
                        Gọi
                    </md-outlined-button>
                </div>
            </div>
        `;
    },

    // ==================== DELIVERY ACTIONS ====================

    // Pickup/accept an order
    async pickupOrder(orderId) {
        if (!this.currentShipper) {
            this.showToast('Vui lòng đăng nhập', 'error');
            return;
        }

        try {
            if (!this.isSupabaseReady()) {
                // Demo mode
                const order = this.orders.find(o => o.id === orderId);
                if (order) {
                    order.status = 'delivering';
                    this.deliveries.push({
                        id: 'demo-' + Date.now(),
                        order_id: orderId,
                        order: order,
                        status: 'assigned',
                        assigned_at: new Date().toISOString(),
                        commission: 15000
                    });
                    this.orders = this.orders.filter(o => o.id !== orderId);
                    this.renderOrders();
                    this.renderMyDeliveries();
                    this.updateStats();
                    this.showToast('Đã nhận đơn!', 'success');
                }
                return;
            }

            // Real assignment
            const result = await SupabaseService.assignShipperToDelivery(orderId, this.currentShipper.id);
            if (result.error) {
                this.showToast('Lỗi nhận đơn: ' + result.error, 'error');
            } else {
                // Update order status to delivering
                await SupabaseService.updateOrderStatus(orderId, 'delivering');
                this.showToast('Đã nhận đơn!', 'success');
                this.loadOrders();
                this.loadMyDeliveries();
            }
        } catch (err) {
            console.error('Error picking up order', err);
            this.showToast('Lỗi nhận đơn', 'error');
        }
    },

    // Update delivery status
    async updateDelivery(assignmentId, newStatus) {
        try {
            if (!this.isSupabaseReady()) {
                // Demo mode
                const delivery = this.deliveries.find(d => d.id === assignmentId);
                if (delivery) {
                    delivery.status = newStatus;
                    this.renderMyDeliveries();
                    this.showToast('Đã cập nhật trạng thái!', 'success');
                }
                return;
            }

            const result = await SupabaseService.updateDeliveryStatus(assignmentId, newStatus);
            if (result.error) {
                this.showToast('Lỗi cập nhật: ' + result.error, 'error');
            } else {
                this.showToast('Đã cập nhật!', 'success');
                this.loadMyDeliveries();
            }
        } catch (err) {
            console.error('Error updating delivery', err);
            this.showToast('Lỗi cập nhật', 'error');
        }
    },

    // Complete delivery
    async completeDelivery(assignmentId) {
        if (!confirm('Xác nhận đã giao hàng thành công?')) return;

        try {
            if (!this.isSupabaseReady()) {
                // Demo mode
                this.deliveries = this.deliveries.filter(d => d.id !== assignmentId);
                this.renderMyDeliveries();
                this.updateStats();
                this.loadEarnings();
                this.showToast('✅ Giao hàng thành công!', 'success');
                this.playSuccessSound();
                return;
            }

            // Real completion
            const result = await SupabaseService.completeDelivery(assignmentId);
            if (result.error) {
                this.showToast('Lỗi hoàn thành: ' + result.error, 'error');
            } else {
                // Update order status
                if (result.data?.order_id) {
                    await SupabaseService.updateOrderStatus(result.data.order_id, 'completed');
                }
                this.showToast('✅ Giao hàng thành công!', 'success');
                this.playSuccessSound();
                this.loadMyDeliveries();
                this.loadEarnings();
                this.refreshShipperData();
            }
        } catch (err) {
            console.error('Error completing delivery', err);
            this.showToast('Lỗi hoàn thành', 'error');
        }
    },

    // Refresh shipper data from server
    async refreshShipperData() {
        if (!this.isSupabaseReady() || !this.currentShipper?.id) return;

        const result = await SupabaseService.getShipperById(this.currentShipper.id);
        if (!result.error && result.data) {
            this.currentShipper = { ...this.currentShipper, ...result.data };
            localStorage.setItem('shipper_session', JSON.stringify(this.currentShipper));
            this.updateHeader();
            this.updateStats();
        }
    },

    // ==================== EARNINGS ====================

    // Load earnings data
    async loadEarnings() {
        const todayEarningsEl = document.getElementById('todayEarnings');
        const weekEarningsEl = document.getElementById('weekEarnings');
        const monthEarningsEl = document.getElementById('monthEarnings');

        if (!this.isSupabaseReady() || !this.currentShipper?.id) {
            // Demo earnings
            if (todayEarningsEl) todayEarningsEl.textContent = this.formatPrice(45000);
            if (weekEarningsEl) weekEarningsEl.textContent = this.formatPrice(315000);
            if (monthEarningsEl) monthEarningsEl.textContent = this.formatPrice(1250000);
            return;
        }

        const today = new Date().toISOString().split('T')[0];
        const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
        const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0];

        try {
            // Today earnings
            const todayResult = await SupabaseService.getShipperEarnings(this.currentShipper.id, today, today);
            if (!todayResult.error && todayEarningsEl) {
                todayEarningsEl.textContent = this.formatPrice(todayResult.data.totalEarnings);
            }

            // Week earnings
            const weekResult = await SupabaseService.getShipperEarnings(this.currentShipper.id, weekAgo, today);
            if (!weekResult.error && weekEarningsEl) {
                weekEarningsEl.textContent = this.formatPrice(weekResult.data.totalEarnings);
            }

            // Month earnings
            const monthResult = await SupabaseService.getShipperEarnings(this.currentShipper.id, monthStart, today);
            if (!monthResult.error && monthEarningsEl) {
                monthEarningsEl.textContent = this.formatPrice(monthResult.data.totalEarnings);
            }
        } catch (err) {
            console.error('Error loading earnings', err);
        }
    },

    // ==================== STATS & UI ====================

    // Update dashboard stats
    updateStats() {
        const pendingCount = this.orders.length;
        const deliveringCount = this.deliveries.length;
        const completedCount = this.currentShipper?.total_deliveries || 0;

        const pendingEl = document.getElementById('pendingCount');
        const deliveringEl = document.getElementById('deliveringCount');
        const completedEl = document.getElementById('completedCount');

        if (pendingEl) pendingEl.textContent = pendingCount;
        if (deliveringEl) deliveringEl.textContent = deliveringCount;
        if (completedEl) completedEl.textContent = completedCount;

        // Update badges
        const pendingBadge = document.getElementById('navPendingBadge');
        const deliveringBadge = document.getElementById('navDeliveringBadge');

        if (pendingBadge) {
            pendingBadge.textContent = pendingCount;
            pendingBadge.style.display = pendingCount > 0 ? 'block' : 'none';
        }
        if (deliveringBadge) {
            deliveringBadge.textContent = deliveringCount;
            deliveringBadge.style.display = deliveringCount > 0 ? 'block' : 'none';
        }
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

        // Toggle header elements
        const logoutBtn = document.getElementById('logoutBtn');
        const statusToggleWrap = document.getElementById('statusToggleWrap');
        if (logoutBtn) logoutBtn.style.display = sectionId === 'login' ? 'none' : 'block';
        if (statusToggleWrap) statusToggleWrap.style.display = sectionId === 'login' ? 'none' : 'flex';
    },

    // Filter orders
    filterOrders(filter) {
        this.currentFilter = filter;

        if (filter === 'delivering') {
            this.loadMyDeliveries();
        } else {
            this.loadOrders();
        }

        // Update nav
        document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
        const navItem = document.querySelector(`.nav-item[data-section="${filter}"]`) ||
            document.querySelector('.nav-item[data-section="dashboard"]');
        if (navItem) navItem.classList.add('active');
    },

    // Show history
    showHistory() {
        this.showSection('history');
        this.loadHistory();
    },

    // Load history
    async loadHistory() {
        const container = document.getElementById('historyList');
        if (!container) return;

        container.innerHTML = '<p class="loading">Đang tải lịch sử...</p>';

        try {
            if (!this.isSupabaseReady() || !this.currentShipper?.id) {
                container.innerHTML = '<p class="no-orders">Đăng nhập để xem lịch sử</p>';
                return;
            }

            const result = await SupabaseService.getShipperDeliveries(this.currentShipper.id, 'completed');
            if (result.error) {
                container.innerHTML = '<p class="no-orders">Lỗi tải lịch sử</p>';
                return;
            }

            const deliveries = (result.data || []).slice(0, 20);
            if (deliveries.length === 0) {
                container.innerHTML = '<p class="no-orders">Chưa có đơn nào hoàn thành</p>';
                return;
            }

            container.innerHTML = deliveries.map(d => this.renderHistoryCard(d)).join('');
        } catch (err) {
            console.error('Error loading history', err);
            container.innerHTML = '<p class="no-orders">Lỗi tải lịch sử</p>';
        }
    },

    // Render history card
    renderHistoryCard(delivery) {
        const order = delivery.order || {};
        return `
            <div class="history-card">
                <div class="history-header">
                    <span class="history-id">#${order.order_number || order.id?.substring(0, 8)}</span>
                    <span class="history-date">${this.formatDate(delivery.delivered_at)}</span>
                </div>
                <div class="history-details">
                    <div class="history-customer" style="display: flex; align-items: center; gap: 4px;">
                        <md-icon style="font-size: 16px;">person</md-icon>
                        ${order.customer_name || 'Khách hàng'}
                    </div>
                    <span class="history-total">${this.formatPrice(order.total)}</span>
                </div>
                <div class="history-commission">
                    <div style="display: flex; align-items: center; gap: 4px;">
                        <md-icon style="font-size: 16px; color: var(--shipper-accent);">monetization_on</md-icon>
                        Hoa hồng: <strong>${this.formatPrice(delivery.commission || 15000)}</strong>
                    </div>
                    ${delivery.customer_rating ? `
                    <div class="history-rating" style="display: flex; align-items: center; gap: 2px;">
                        <md-icon style="font-size: 14px; color: #FFC107;">star</md-icon>
                        ${delivery.customer_rating}
                    </div>` : ''}
                </div>
            </div>
        `;
    },

    // Refresh orders
    refreshOrders() {
        this.showToast('Đang làm mới...');
        this.loadOrders();
        this.loadMyDeliveries();
    },

    // ==================== DEMO DATA ====================

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
                status: 'ready',
                order_type: 'delivery',
                created_at: new Date(Date.now() - 600000).toISOString()
            }
        ];
    },

    // ==================== UTILITIES ====================
    // Use centralized utils.js functions with fallback

    formatTime(dateString) {
        return window.utils ? window.utils.getCurrentTime(new Date(dateString)) : new Date(dateString).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
    },

    formatDate(dateString) {
        return window.utils ? window.utils.getCurrentDate(new Date(dateString)) : new Date(dateString).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
    },

    formatPrice(amount) {
        return window.utils ? window.utils.formatPrice(amount) : new Intl.NumberFormat('vi-VN').format(amount || 0) + 'đ';
    },

    showToast(message, type = 'info') {
        if (window.utils && window.utils.toast) {
            window.utils.toast.show(message, type);
            return;
        }
        // Fallback
        const container = document.getElementById('toastContainer');
        if (!container) return;
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.textContent = message;
        container.appendChild(toast);
        setTimeout(() => toast.remove(), 3000);
    },

    playNotificationSound() {
        try {
            const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2OteVE4PnmSl4Z4a11bZ3p+dmNUTVFcbXh3bGVjbnh9d29mYl9kbm9qaGNhY2ZoZmFdW1tdXl1XU09RU1NRTUpISkxMSUdFREVFRkRDQkJCQkJBQD8/Pz8/Pj09PT09PDw7Ozs7Ojo5OTk5OTg4Nzc3NzY2NjU1NTU0NDQzMzMzMjIyMTExMTAwMC8vLy8uLi4tLS0sLCwrKysrKiopKSkoKCgnJycnJiYmJSUlJCQkJCMjIyIiIiEhISEgICAf');
            audio.volume = 0.5;
            audio.play().catch(() => { });
        } catch (e) { }
    },

    playSuccessSound() {
        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();

            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);

            oscillator.frequency.value = 600;
            oscillator.type = 'sine';
            gainNode.gain.value = 0.3;

            oscillator.start();
            setTimeout(() => {
                oscillator.frequency.value = 800;
            }, 150);
            oscillator.stop(audioContext.currentTime + 0.3);
        } catch (e) { }
    }
};

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', () => {
    ShipperApp.init();
});
