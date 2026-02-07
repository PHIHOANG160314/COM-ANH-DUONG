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
        if (window.Debug) Debug.info('ðŸ›µ Shipper Portal v2.0 initializing...');

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

        if (window.Debug) Debug.info('ðŸ›µ Shipper Portal ready!');
    },

    // Setup login form events
    setupLoginForm() {
        const phoneInput = document.getElementById('shipperPhone');
        const pinInput = document.getElementById('shipperPin');
        const statusToggle = document.getElementById('statusToggle');

        if (statusToggle) {
            statusToggle.addEventListener('change', () => {
                this.toggleStatus();
            });
        }

        if (phoneInput) {
            phoneInput.addEventListener('input', () => {
                phoneInput.error = false;
                phoneInput.errorText = '';
            });
            phoneInput.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    pinInput?.focus();
                }
            });
        }

        if (pinInput) {
            pinInput.addEventListener('input', () => {
                pinInput.error = false;
                pinInput.errorText = '';
            });
            pinInput.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    this.login();
                }
            });
        }
    },

    // ==================== AUTHENTICATION ====================

    // Login with phone + PIN
    async login() {
        const phoneInput = document.getElementById('shipperPhone');
        const pinInput = document.getElementById('shipperPin');

        const phone = phoneInput?.value?.trim();
        const pin = pinInput?.value?.trim();

        // Reset errors
        if (phoneInput) { phoneInput.error = false; phoneInput.errorText = ''; }
        if (pinInput) { pinInput.error = false; pinInput.errorText = ''; }

        if (!phone || phone.length < 10) {
            if (phoneInput) {
                phoneInput.error = true;
                phoneInput.errorText = 'SÄT khÃ´ng há»£p lá»‡';
            } else {
                this.showToast('Vui lÃ²ng nháº­p sá»‘ Ä‘iá»‡n thoáº¡i há»£p lá»‡', 'error');
            }
            return;
        }

        if (!pin || pin.length < 4) {
            if (pinInput) {
                pinInput.error = true;
                pinInput.errorText = 'PIN pháº£i cÃ³ 4-6 sá»‘';
            } else {
                this.showToast('Vui lÃ²ng nháº­p mÃ£ PIN há»£p lá»‡', 'error');
            }
            return;
        }

        // Show loading
        const loginBtn = document.querySelector('.btn-login');
        if (loginBtn) {
            loginBtn.disabled = true;
            loginBtn.textContent = 'Äang Ä‘Äƒng nháº­p...';
        }

        try {
            // Use ShipperAuth service with device lock and working hours
            if (typeof ShipperAuth !== 'undefined' && this.isSupabaseReady()) {
                const result = await ShipperAuth.login(phone, pin);

                if (result.success) {
                    this.currentShipper = result.shipper;
                    this.onLoginSuccess();
                } else {
                    this.showToast(result.error || 'ÄÄƒng nháº­p tháº¥t báº¡i', 'error');
                }
            } else if (!this.isSupabaseReady()) {
                // Demo mode - use hardcoded shippers (for development only)
                const demoShippers = {
                    '0901234567': { id: 'demo1', name: 'Shipper Demo', phone: '0901234567', pin: '1234', status: 'online', rating: 4.8, total_deliveries: 125, commission_rate: 15000 },
                    '0909876543': { id: 'demo2', name: 'Nguyá»…n VÄƒn Shipper', phone: '0909876543', pin: '5678', status: 'online', rating: 4.5, total_deliveries: 89, commission_rate: 15000 }
                };

                const shipper = demoShippers[phone];
                if (shipper && shipper.pin === pin) {
                    this.currentShipper = shipper;
                    localStorage.setItem('shipper_session', JSON.stringify(shipper));
                    this.onLoginSuccess();
                } else {
                    this.showToast('Sá»‘ Ä‘iá»‡n thoáº¡i hoáº·c mÃ£ PIN khÃ´ng Ä‘Ãºng', 'error');
                }
            } else {
                this.showToast('Lá»—i káº¿t ná»‘i, vui lÃ²ng thá»­ láº¡i', 'error');
            }
        } catch (err) {
            console.error('Login error:', err);
            this.showToast('Lá»—i Ä‘Äƒng nháº­p, vui lÃ²ng thá»­ láº¡i', 'error');
        } finally {
            if (loginBtn) {
                loginBtn.disabled = false;
                // loginBtn.textContent = 'ÄÄƒng nháº­p'; // md-filled-button doesn't use textContent directly for label usually, but it has slot.
                // However, M3 button text is in the default slot. textContent works if it has no icon.
                // Let's safe check.
                loginBtn.textContent = 'ÄÄƒng nháº­p';
            }
            if (pinInput) pinInput.value = '';
        }
    },

    // After successful login
    async onLoginSuccess() {
        this.showToast(`ChÃ o má»«ng ${this.currentShipper.name}!`, 'success');
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
        this.showToast('ÄÃ£ Ä‘Äƒng xuáº¥t');
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
                this.showToast(newStatus === 'online' ? 'ðŸŸ¢ Äang nháº­n Ä‘Æ¡n' : 'âšª ÄÃ£ táº¯t nháº­n Ä‘Æ¡n');
            }
        } else {
            // Demo mode
            this.currentShipper.status = newStatus;
            this.updateStatusToggle();
            this.showToast(newStatus === 'online' ? 'ðŸŸ¢ Äang nháº­n Ä‘Æ¡n' : 'âšª ÄÃ£ táº¯t nháº­n Ä‘Æ¡n');
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
                'online': 'ðŸŸ¢ Online',
                'offline': 'âšª Offline',
                'busy': 'ðŸŸ¡ Äang giao'
            };
            statusEl.textContent = statusMap[status] || status;
            statusEl.className = `shipper-status ${status}`;
        }

        if (statusToggle) {
            statusToggle.selected = this.currentShipper?.status === 'online';
        }
    },

    // ==================== LOCATION TRACKING ====================

    // Start GPS location tracking
    startLocationTracking() {
        if (!navigator.geolocation) {
            if (window.Debug) Debug.warn('Geolocation not supported');
            return;
        }

        // Watch position changes
        this.locationWatchId = navigator.geolocation.watchPosition(
            (position) => this.onLocationUpdate(position),
            (error) => if (window.Debug) Debug.warn('Location error:', error.message),
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
                (error) => if (window.Debug) Debug.warn('Location update error:', error.message)
            );
        }, 30000);

        if (window.Debug) Debug.log('ðŸ“ Location tracking started');
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

        if (window.Debug) Debug.log('ðŸ“ Location tracking stopped');
    },

    // ==================== ORDERS & DELIVERIES ====================

    // Load available orders from Supabase
    async loadOrders() {
        const container = document.getElementById('ordersList');

        try {
            if (window.Debug) Debug.log('ðŸ›µ Loading orders...');

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
                    container.innerHTML = '<p class="no-orders">âš ï¸ Lá»—i táº£i Ä‘Æ¡n hÃ ng. KÃ©o xuá»‘ng Ä‘á»ƒ thá»­ láº¡i.</p>';
                }
                this.updateStats();
                return;
            }

            this.orders = result.data || [];
            if (window.Debug) Debug.log('ðŸ›µ Loaded', this.orders.length, 'available orders');
            this.renderOrders();
            this.updateStats();

        } catch (err) {
            console.error('Error loading orders', err);
            this.orders = [];
            if (container) {
                container.innerHTML = '<p class="no-orders">âš ï¸ KhÃ´ng thá»ƒ táº£i Ä‘Æ¡n hÃ ng</p>';
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
            if (window.Debug) Debug.log('ðŸ›µ Cannot subscribe - Supabase not ready');
            return;
        }

        // Subscribe to order changes
        SupabaseService.subscribeToOrders((payload) => {
            if (window.Debug) Debug.log('ðŸ›µ Order update:', payload.eventType);
            if (payload.new?.order_type === 'delivery') {
                this.loadOrders();

                if (payload.eventType === 'INSERT') {
                    this.showToast('ðŸ†• CÃ³ Ä‘Æ¡n giao má»›i!', 'success');
                    this.playNotificationSound();
                }
            }
        }, 'ShipperPortal');

        // Subscribe to my assignments
        if (this.currentShipper?.id) {
            SupabaseService.subscribeToShipperAssignments(this.currentShipper.id, (payload) => {
                if (window.Debug) Debug.log('ðŸ›µ My assignment update:', payload.eventType);
                this.loadMyDeliveries();
                this.loadEarnings();
            });
        }

        if (window.Debug) Debug.log('ðŸ›µ Subscribed to realtime updates');
    },

    // ==================== RENDERING ====================

    // Update header with shipper info
    updateHeader() {
        const nameEl = document.getElementById('shipperName');
        const ratingEl = document.getElementById('shipperRating');

        if (nameEl) nameEl.textContent = this.currentShipper?.name || 'Shipper';
        if (ratingEl) ratingEl.textContent = `â­ ${this.currentShipper?.rating?.toFixed(1) || '5.0'}`;

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
            container.innerHTML = '<p class="no-orders">KhÃ´ng cÃ³ Ä‘Æ¡n hÃ ng má»›i</p>';
            return;
        }

        container.innerHTML = filteredOrders.map(order => this.renderOrderCard(order)).join('');
    },

    // Render my active deliveries
    renderMyDeliveries() {
        const container = document.getElementById('myDeliveriesList');
        if (!container) return;

        if (this.deliveries.length === 0) {
            container.innerHTML = '<p class="no-orders">KhÃ´ng cÃ³ Ä‘Æ¡n Ä‘ang giao</p>';
            return;
        }

        container.innerHTML = this.deliveries.map(delivery =>
            this.renderDeliveryCard(delivery)
        ).join('');
    },

    // Render single order card
    renderOrderCard(order) {
        const statusLabels = {
            'pending': 'â³ Chá» xÃ¡c nháº­n',
            'confirmed': 'âœ… ÄÃ£ xÃ¡c nháº­n',
            'preparing': 'ðŸ‘¨â€ðŸ³ Äang chuáº©n bá»‹',
            'ready': 'ðŸ“¦ Sáºµn sÃ ng giao'
        };

        let items = [];
        try {
            items = typeof order.items === 'string' ? JSON.parse(order.items) : order.items;
        } catch (e) {
            items = [];
        }

        const itemsText = items.map(item => `${item.name} x${item.qty || item.quantity || 1}`).join(', ') || 'KhÃ´ng cÃ³ thÃ´ng tin';
        const address = order.notes || order.address || 'KhÃ´ng cÃ³ Ä‘á»‹a chá»‰';

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
                    <div class="customer-name">ðŸ‘¤ ${order.customer_name || 'KhÃ¡ch hÃ ng'}</div>
                    <div class="customer-phone">
                        ðŸ“ž <a href="tel:${order.customer_phone}">${order.customer_phone || 'KhÃ´ng cÃ³ SÄT'}</a>
                    </div>
                </div>
                
                <div class="order-address">
                    <div class="address-label">ðŸ“ Äá»‹a chá»‰ giao hÃ ng</div>
                    <div class="address-text">${address}</div>
                </div>
                
                <div class="order-items">
                    <div class="order-items-title">ðŸ½ï¸ MÃ³n Äƒn</div>
                    <div class="order-items-list">${itemsText}</div>
                </div>
                
                <div class="order-total">
                    <span class="total-label">Tá»•ng tiá»n:</span>
                    <span class="total-value">${this.formatPrice(order.total)}</span>
                </div>
                
                <div class="order-actions">
                    <md-filled-button class="btn-action" onclick="ShipperApp.pickupOrder('${order.id}')">
                        ðŸ“¦ Nháº­n Ä‘Æ¡n
                    </md-filled-button>
                    <md-outlined-button class="btn-action" href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}" target="_blank"
                        onclick="window.open(this.href, '_blank'); return false;">
                        ðŸ—ºï¸ Chá»‰ Ä‘Æ°á»ng
                    </md-outlined-button>
                </div>
            </div>
        `;
    },

    // Render delivery card (my active delivery)
    renderDeliveryCard(delivery) {
        const order = delivery.order || {};
        const statusLabels = {
            'assigned': 'ðŸ“Œ ÄÃ£ nháº­n',
            'picked_up': 'ðŸƒ ÄÃ£ láº¥y hÃ ng',
            'delivering': 'ðŸš€ Äang giao'
        };

        let items = [];
        try {
            items = typeof order.items === 'string' ? JSON.parse(order.items) : order.items;
        } catch (e) {
            items = [];
        }

        const itemsText = items.map(item => `${item.name} x${item.qty || item.quantity || 1}`).join(', ');
        const address = order.notes || order.address || 'KhÃ´ng cÃ³ Ä‘á»‹a chá»‰';

        let actionsHtml = '';
        if (delivery.status === 'assigned') {
            actionsHtml = `
                <md-filled-button onclick="ShipperApp.updateDelivery('${delivery.id}', 'picked_up')">
                    ðŸƒ ÄÃ£ láº¥y hÃ ng
                </md-filled-button>
            `;
        } else if (delivery.status === 'picked_up' || delivery.status === 'delivering') {
            actionsHtml = `
                <md-filled-button class="btn-success" style="--md-sys-color-primary: var(--shipper-success);" onclick="ShipperApp.completeDelivery('${delivery.id}')">
                    âœ… ÄÃ£ giao xong
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
                    <div class="customer-name">ðŸ‘¤ ${order.customer_name || 'KhÃ¡ch hÃ ng'}</div>
                    <div class="customer-phone">
                        ðŸ“ž <a href="tel:${order.customer_phone}">${order.customer_phone || 'KhÃ´ng cÃ³ SÄT'}</a>
                    </div>
                </div>

                <div class="order-address">
                    <div class="address-label">ðŸ“ Äá»‹a chá»‰ giao hÃ ng</div>
                    <div class="address-text">${address}</div>
                </div>

                <div class="order-items">
                    <div class="order-items-title">ðŸ½ï¸ ${itemsText}</div>
                </div>

                <div class="order-total">
                    <span class="total-label">Thu há»™:</span>
                    <span class="total-value">${this.formatPrice(order.total)}</span>
                </div>

                <div class="order-actions" style="flex-wrap: wrap; gap: 8px;">
                    ${actionsHtml}
                    <md-outlined-button href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}" target="_blank"
                        onclick="window.open(this.href, '_blank'); return false;">
                        ðŸ—ºï¸ Chá»‰ Ä‘Æ°á»ng
                    </md-outlined-button>
                    <md-outlined-button href="tel:${order.customer_phone}" onclick="window.location.href=this.href; return false;">
                        ðŸ“ž Gá»i
                    </md-outlined-button>
                </div>
            </div>
        `;
    },

    // ==================== DELIVERY ACTIONS ====================

    // Pickup/accept an order
    async pickupOrder(orderId) {
        if (!this.currentShipper) {
            this.showToast('Vui lÃ²ng Ä‘Äƒng nháº­p', 'error');
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
                    this.showToast('ÄÃ£ nháº­n Ä‘Æ¡n!', 'success');
                }
                return;
            }

            // Real assignment
            const result = await SupabaseService.assignShipperToDelivery(orderId, this.currentShipper.id);
            if (result.error) {
                this.showToast('Lá»—i nháº­n Ä‘Æ¡n: ' + result.error, 'error');
            } else {
                // Update order status to delivering
                await SupabaseService.updateOrderStatus(orderId, 'delivering');
                this.showToast('ÄÃ£ nháº­n Ä‘Æ¡n!', 'success');
                this.loadOrders();
                this.loadMyDeliveries();
            }
        } catch (err) {
            console.error('Error picking up order', err);
            this.showToast('Lá»—i nháº­n Ä‘Æ¡n', 'error');
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
                    this.showToast('ÄÃ£ cáº­p nháº­t tráº¡ng thÃ¡i!', 'success');
                }
                return;
            }

            const result = await SupabaseService.updateDeliveryStatus(assignmentId, newStatus);
            if (result.error) {
                this.showToast('Lá»—i cáº­p nháº­t: ' + result.error, 'error');
            } else {
                this.showToast('ÄÃ£ cáº­p nháº­t!', 'success');
                this.loadMyDeliveries();
            }
        } catch (err) {
            console.error('Error updating delivery', err);
            this.showToast('Lá»—i cáº­p nháº­t', 'error');
        }
    },

    // Complete delivery
    async completeDelivery(assignmentId) {
        if (!confirm('XÃ¡c nháº­n Ä‘Ã£ giao hÃ ng thÃ nh cÃ´ng?')) return;

        try {
            if (!this.isSupabaseReady()) {
                // Demo mode
                this.deliveries = this.deliveries.filter(d => d.id !== assignmentId);
                this.renderMyDeliveries();
                this.updateStats();
                this.loadEarnings();
                this.showToast('âœ… Giao hÃ ng thÃ nh cÃ´ng!', 'success');
                this.playSuccessSound();
                return;
            }

            // Real completion
            const result = await SupabaseService.completeDelivery(assignmentId);
            if (result.error) {
                this.showToast('Lá»—i hoÃ n thÃ nh: ' + result.error, 'error');
            } else {
                // Update order status
                if (result.data?.order_id) {
                    await SupabaseService.updateOrderStatus(result.data.order_id, 'completed');
                }
                this.showToast('âœ… Giao hÃ ng thÃ nh cÃ´ng!', 'success');
                this.playSuccessSound();
                this.loadMyDeliveries();
                this.loadEarnings();
                this.refreshShipperData();
            }
        } catch (err) {
            console.error('Error completing delivery', err);
            this.showToast('Lá»—i hoÃ n thÃ nh', 'error');
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

        container.innerHTML = '<p class="loading">Äang táº£i lá»‹ch sá»­...</p>';

        try {
            if (!this.isSupabaseReady() || !this.currentShipper?.id) {
                container.innerHTML = '<p class="no-orders">ÄÄƒng nháº­p Ä‘á»ƒ xem lá»‹ch sá»­</p>';
                return;
            }

            const result = await SupabaseService.getShipperDeliveries(this.currentShipper.id, 'completed');
            if (result.error) {
                container.innerHTML = '<p class="no-orders">Lá»—i táº£i lá»‹ch sá»­</p>';
                return;
            }

            const deliveries = (result.data || []).slice(0, 20);
            if (deliveries.length === 0) {
                container.innerHTML = '<p class="no-orders">ChÆ°a cÃ³ Ä‘Æ¡n nÃ o hoÃ n thÃ nh</p>';
                return;
            }

            container.innerHTML = deliveries.map(d => this.renderHistoryCard(d)).join('');
        } catch (err) {
            console.error('Error loading history', err);
            container.innerHTML = '<p class="no-orders">Lá»—i táº£i lá»‹ch sá»­</p>';
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
                    <span class="history-customer">ðŸ‘¤ ${order.customer_name || 'KhÃ¡ch hÃ ng'}</span>
                    <span class="history-total">${this.formatPrice(order.total)}</span>
                </div>
                <div class="history-commission">
                    ðŸ’° Hoa há»“ng: <strong>${this.formatPrice(delivery.commission || 15000)}</strong>
                    ${delivery.customer_rating ? `<span class="history-rating">â­ ${delivery.customer_rating}</span>` : ''}
                </div>
            </div>
        `;
    },

    // Refresh orders
    refreshOrders() {
        this.showToast('Äang lÃ m má»›i...');
        this.loadOrders();
        this.loadMyDeliveries();
    },

    // ==================== DEMO DATA ====================

    getDemoOrders() {
        return [
            {
                id: 'demo1',
                order_number: 'AD260110-0001',
                customer_name: 'Nguyá»…n VÄƒn KhÃ¡ch',
                customer_phone: '0901234567',
                notes: '123 Nguyá»…n Huá»‡, Q1, TP.HCM',
                items: JSON.stringify([
                    { name: 'CÆ¡m táº¥m', qty: 2 },
                    { name: 'TrÃ  Ä‘Ã¡', qty: 2 }
                ]),
                total: 85000,
                status: 'ready',
                order_type: 'delivery',
                created_at: new Date().toISOString()
            },
            {
                id: 'demo2',
                order_number: 'AD260110-0002',
                customer_name: 'Tráº§n Thá»‹ Mai',
                customer_phone: '0909876543',
                notes: '456 LÃª Lá»£i, Q3, TP.HCM',
                items: JSON.stringify([
                    { name: 'Phá»Ÿ bÃ²', qty: 1 }
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
        return window.utils ? window.utils.formatPrice(amount) : new Intl.NumberFormat('vi-VN').format(amount || 0) + 'Ä‘';
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

