// ========================================
// F&B MASTER - STAFF MOBILE APP
// Mobile Staff Portal with Check-in, Kitchen, Orders
// ========================================

const StaffApp = {
    currentStaff: null,
    isCheckedIn: false,
    checkinTime: null,
    currentFilter: 'all',
    paginationInitialized: false,

    // Role permissions configuration
    rolePermissions: {
        'Quản lý': {
            dashboard: true,
            dashboardRevenue: true,
            kitchen: true,
            orders: true,
            pos: true,
            reports: true,
            staff: true,
            checkin: true,
            updateOrder: true
        },
        'Thu ngân': {
            dashboard: true,
            dashboardRevenue: true,
            kitchen: false,
            orders: true,
            pos: true,
            reports: false,
            staff: false,
            checkin: true,
            updateOrder: true
        },
        'Phục vụ': {
            dashboard: true,
            dashboardRevenue: false,
            kitchen: false,
            orders: true,
            pos: true,  // Phục vụ có thể truy cập POS
            reports: false,
            staff: false,
            checkin: true,
            updateOrder: true
        },
        'Bếp': {
            dashboard: true,
            dashboardRevenue: false,
            kitchen: true,
            orders: false,  // Bếp chỉ xem được màn hình bếp
            pos: false,
            reports: false,
            staff: false,
            checkin: true,
            updateOrder: true
        }
    },

    // Demo staff data REMOVED - Now using AdminCredentials module
    // See admin-credentials.js for centralized staff management

    // Check if current user has permission for a feature
    hasPermission(feature) {
        if (!this.currentStaff) return false;
        const role = this.currentStaff.role;
        return this.rolePermissions[role]?.[feature] ?? false;
    },

    async init() {
        if (window.Debug) Debug.info('Staff Portal initializing...');
        this.updateDate();
        this.checkSession();
        await this.loadOrders();
        setInterval(() => this.updateDate(), 60000);
        if (window.Debug) Debug.info('Staff Portal ready!');
    },

    updateDate() {
        const dateEl = document.getElementById('currentDate');
        if (dateEl) {
            const now = new Date();
            dateEl.textContent = now.toLocaleDateString('vi-VN', {
                weekday: 'long',
                day: 'numeric',
                month: 'long'
            });
        }
    },

    checkSession() {
        const saved = localStorage.getItem('staff_session');
        if (saved) {
            try {
                const session = JSON.parse(saved);

                // Integrate check for valid staff data
                if (!session.staff || !session.staff.name || session.staff.name === 'undefined') {
                    console.warn('⚠️ Invalid session data, clearing...');
                    localStorage.removeItem('staff_session');
                    return;
                }

                // Session timeout check (8 hours)
                const MAX_SESSION_AGE = 8 * 60 * 60 * 1000;
                const loginTime = new Date(session.loginTime || session.checkinTime).getTime();
                if (Date.now() - loginTime > MAX_SESSION_AGE) {
                    if (window.Debug) Debug.info('Session expired, logging out');
                    localStorage.removeItem('staff_session');
                    return;
                }

                this.currentStaff = session.staff;
                this.isCheckedIn = session.isCheckedIn;
                this.checkinTime = session.checkinTime;
                this.onLoginSuccess();
            } catch (e) {
                console.error('Session parse error:', e);
                localStorage.removeItem('staff_session');
            }
        }
    },

    async login() {
        const pinInput = document.getElementById('pinInput');
        const workCodeInput = document.getElementById('workCodeInput');
        const workCodeGroup = document.getElementById('workCodeGroup');

        const pin = pinInput?.value;

        if (!pin || pin.length !== 4) {
            this.showToast('Vui lòng nhập mã PIN 4 số', 'error');
            return;
        }

        // Get work code if visible
        const workCode = workCodeGroup?.style.display !== 'none' ?
            workCodeInput?.value.replace('-', '').toUpperCase() : null;

        // Use centralized AdminCredentials for authentication
        let staff = null;
        if (typeof AdminCredentials !== 'undefined') {
            staff = await AdminCredentials.authenticateByPin(pin, workCode);

            // Check if work code is required but not provided
            if (staff && staff.error === 'requires_code') {
                workCodeGroup.style.display = 'block';
                workCodeInput.focus();
                this.showToast('Nhập mã làm việc từ quản lý', 'info');
                return;
            }

            // Check if work code is invalid
            if (staff && staff.error === 'invalid_code') {
                this.showToast(staff.message, 'error');
                workCodeInput.value = '';
                workCodeInput.focus();
                return;
            }

            // Map role names for compatibility
            if (staff && !staff.error) {
                const roleMapping = {
                    'admin': 'Quản lý',
                    'manager': 'Thu ngân',
                    'waiter': 'Phục vụ',
                    'staff': 'Phục vụ'
                };
                staff = {
                    ...staff,
                    role: roleMapping[staff.role] || staff.role
                };
            }
        }

        if (staff && !staff.error) {
            // Validate staff object has required fields
            if (!staff.name || staff.name === 'undefined') {
                console.error('Login returned invalid staff object:', staff);
                this.showToast('Lỗi dữ liệu nhân viên. Vui lòng thử lại.', 'error');
                return;
            }

            this.currentStaff = staff;
            this.saveSession();
            this.onLoginSuccess();
            this.showToast(`Xin chào, ${staff.name}!`);

            // Hide work code input after successful login
            if (workCodeGroup) workCodeGroup.style.display = 'none';
        } else {
            this.showToast('Mã PIN không đúng', 'error');
            pinInput.value = '';
        }
    },

    async onLoginSuccess() {
        document.getElementById('staffName').textContent = this.currentStaff.name;
        document.getElementById('bottomNav').classList.add('show');

        // Apply role-based permissions to UI
        this.applyRolePermissions();

        // Create work session for admin
        const isAdmin = this.currentStaff.role === 'Quản lý';
        if (isAdmin && typeof WorkSessionService !== 'undefined') {
            await WorkSessionService.createSession(this.currentStaff);
        }

        // Show work code for admin/manager
        this.updateWorkCodeDisplay();

        this.showSection('dashboard');
        this.updateDashboard();
        this.updateCheckinUI();

        // Subscribe to realtime orders
        this.subscribeToOrders();
    },

    // Update work code display
    async updateWorkCodeDisplay() {
        const workCodeCard = document.getElementById('workCodeCard');
        const workCodeDisplay = document.getElementById('workCodeDisplay');

        // Only show for admins (who create work sessions)
        // Staff/waiters don't see the code card
        const isAdmin = this.currentStaff && this.currentStaff.role === 'Quản lý';

        if (isAdmin && workCodeCard && typeof WorkSessionService !== 'undefined') {
            workCodeCard.style.display = 'flex';
            const code = await WorkSessionService.getDisplayCode();
            if (code) {
                workCodeDisplay.textContent = code;
            } else {
                workCodeDisplay.textContent = '---';
            }
        } else if (workCodeCard) {
            workCodeCard.style.display = 'none';
        }
    },

    // Reset work code (admin only)
    resetWorkCode() {
        if (this.currentStaff && this.currentStaff.role === 'Quản lý' && typeof WorkSessionService !== 'undefined') {
            const session = WorkSessionService.resetSession(this.currentStaff);
            this.updateWorkCodeDisplay();
            this.showToast('✅ Đã tạo mã mới: ' + session.code.slice(0, 3) + '-' + session.code.slice(3), 'success');
        }
    },

    // Apply role-based UI visibility
    applyRolePermissions() {
        const role = this.currentStaff.role;
        const roleIcons = {
            'Quản lý': '👔',
            'Thu ngân': '💵',
            'Phục vụ': '🍽️',
            'Bếp': '👨\u200d🍳'
        };

        // Update staff name with role badge
        const staffNameEl = document.getElementById('staffName');
        if (staffNameEl) {
            staffNameEl.innerHTML = `${roleIcons[role] || '👤'} ${this.currentStaff.name}`;
        }

        // Kitchen button - only for Bếp and Quản lý
        const kitchenCard = document.querySelector('.action-card.kitchen');
        if (kitchenCard) {
            kitchenCard.style.display = this.hasPermission('kitchen') ? 'flex' : 'none';
        }

        // POS button - only for Thu ngân and Quản lý
        const posCard = document.querySelector('.action-card.pos');
        if (posCard) {
            posCard.style.display = this.hasPermission('pos') ? 'flex' : 'none';
        }

        // Orders button - hide for Bếp
        const ordersCard = document.querySelector('.action-card.orders');
        if (ordersCard) {
            ordersCard.style.display = this.hasPermission('orders') ? 'flex' : 'none';
        }

        // Revenue display - hide for Phục vụ and Bếp
        const revenueItem = document.getElementById('todayRevenue')?.closest('.summary-item');
        if (revenueItem) {
            revenueItem.style.display = this.hasPermission('dashboardRevenue') ? 'flex' : 'none';
        }

        // Kitchen nav button
        const kitchenNav = document.querySelector('[data-section="kitchen"]');
        if (kitchenNav) {
            kitchenNav.style.display = this.hasPermission('kitchen') ? 'flex' : 'none';
        }

        // Orders nav button
        const ordersNav = document.querySelector('[data-section="orders"]');
        if (ordersNav) {
            ordersNav.style.display = this.hasPermission('orders') ? 'flex' : 'none';
        }

        // Sync with central AccessControl if available
        if (window.AccessControl) {
            AccessControl.login({
                id: this.currentStaff.id,
                name: this.currentStaff.name,
                role: this.currentStaff.role === 'Quản lý' ? 'admin'
                    : this.currentStaff.role === 'Thu ngân' ? 'manager'
                        : 'staff'
            });
        }

        if (window.Debug) Debug.info('Applied permissions for role:', role);
    },

    logout() {
        if (this.isCheckedIn) {
            if (!confirm('Bạn đang check-in. Bạn có muốn check-out và đăng xuất?')) {
                return;
            }
            this.toggleCheckin();
        }

        this.currentStaff = null;
        localStorage.removeItem('staff_session');
        document.getElementById('bottomNav').classList.remove('show');
        document.getElementById('pinInput').value = '';
        this.showSection('login');
        this.showToast('Đã đăng xuất');
    },

    saveSession() {
        localStorage.setItem('staff_session', JSON.stringify({
            staff: this.currentStaff,
            isCheckedIn: this.isCheckedIn,
            checkinTime: this.checkinTime,
            loginTime: new Date().toISOString() // Add login time for session timeout
        }));
    },

    // ========================================
    // CHECK-IN/OUT
    // ========================================
    toggleCheckin() {
        if (this.isCheckedIn) {
            // Check-out
            this.isCheckedIn = false;
            const duration = this.getWorkDuration();
            this.logAttendance('checkout');
            this.showToast(`Check-out thành công! Thời gian làm: ${duration}`);
            this.checkinTime = null;
        } else {
            // Check-in
            this.isCheckedIn = true;
            this.checkinTime = new Date().toISOString();
            this.logAttendance('checkin');
            this.showToast('Check-in thành công! Chúc bạn ngày làm việc vui vẻ! 🌟');
        }

        this.saveSession();
        this.updateCheckinUI();
    },

    updateCheckinUI() {
        const btn = document.getElementById('checkinBtn');
        const timeEl = document.getElementById('checkinTime');

        if (this.isCheckedIn) {
            btn.classList.add('checked-in');
            btn.querySelector('.action-icon').textContent = '🔴';
            btn.querySelector('.action-label').textContent = 'Check-out';
            if (this.checkinTime) {
                const time = new Date(this.checkinTime);
                timeEl.textContent = time.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
            }
        } else {
            btn.classList.remove('checked-in');
            btn.querySelector('.action-icon').textContent = '🟢';
            btn.querySelector('.action-label').textContent = 'Check-in';
            timeEl.textContent = '--:--';
        }
    },

    getWorkDuration() {
        if (!this.checkinTime) return '0 phút';
        const start = new Date(this.checkinTime);
        const now = new Date();
        const diff = Math.floor((now - start) / 1000 / 60);
        const hours = Math.floor(diff / 60);
        const mins = diff % 60;
        return hours > 0 ? `${hours}h ${mins}p` : `${mins} phút`;
    },

    logAttendance(type) {
        const log = JSON.parse(localStorage.getItem('attendance_log') || '[]');
        log.push({
            staffId: this.currentStaff.id,
            staffName: this.currentStaff.name,
            type,
            time: new Date().toISOString()
        });
        localStorage.setItem('attendance_log', JSON.stringify(log));
    },

    // ========================================
    // DASHBOARD
    // ========================================
    updateDashboard() {
        const orders = this.getOrders();
        const today = new Date().toDateString();
        const todayOrders = orders.filter(o => new Date(o.createdAt).toDateString() === today);

        // Update counts
        document.getElementById('todayOrders').textContent = todayOrders.length;
        document.getElementById('todayRevenue').textContent = this.formatPrice(
            todayOrders.reduce((sum, o) => sum + (o.total || 0), 0)
        );
        document.getElementById('todayServed').textContent = todayOrders.filter(o => o.status === 'completed').length;

        // Update badges
        const pending = orders.filter(o => o.status === 'pending' || o.status === 'preparing');
        document.getElementById('kitchenOrderCount').textContent = pending.length;
        document.getElementById('orderCount').textContent = orders.length;

        // Render recent orders
        this.renderRecentOrders(todayOrders.slice(0, 5));
    },

    renderRecentOrders(orders) {
        const container = document.getElementById('recentOrdersList');
        if (!container) return;

        if (orders.length === 0) {
            container.innerHTML = '<p class="no-orders">Chưa có đơn hàng hôm nay</p>';
            return;
        }

        container.innerHTML = orders.map(order => `
            <div class="order-card md-ripple md-focus-ring" onclick="StaffApp.viewOrder('${order.id}')">
                <div class="order-card-header">
                    <span class="order-card-id">${order.id}</span>
                    <span class="order-card-status ${order.status}">${this.getStatusLabel(order.status)}</span>
                </div>
                <div class="order-card-info">
                    ${order.items?.length || 0} món • ${this.formatTime(order.createdAt)}
                </div>
                <div class="order-card-total">${this.formatPrice(order.total)}</div>
            </div>
        `).join('');
    },

    // ========================================
    // KITCHEN
    // ========================================
    loadKitchenOrders() {
        const orders = this.getOrders();
        const pending = orders.filter(o => o.status === 'pending' || o.status === 'preparing');
        this.renderKitchenOrders(pending);
    },

    renderKitchenOrders(orders) {
        const container = document.getElementById('kitchenOrders');
        if (!container) return;

        if (orders.length === 0) {
            container.innerHTML = '<p class="no-orders">Không có đơn đang chờ</p>';
            return;
        }

        container.innerHTML = orders.map(order => {
            const waitTime = this.getWaitTime(order.createdAt);
            const isUrgent = waitTime > 15;

            return `
                <div class="kitchen-order-card ${isUrgent ? 'urgent' : ''}">
                    <div class="kitchen-order-header">
                        <span class="kitchen-order-id">${order.id}</span>
                        <span class="kitchen-order-time">⏱️ ${waitTime} phút</span>
                    </div>
                    <div class="kitchen-order-items">
                        ${order.items?.map(item => `
                            <div class="kitchen-order-item">${item.icon || '🍽️'} ${item.name} x${item.qty ?? item.quantity ?? 1}</div>
                        `).join('') || 'Không có món'}
                    </div>
                    <div class="kitchen-order-actions">
                        ${order.status === 'pending'
                    ? `<md-filled-tonal-button class="btn-kitchen start" onclick="StaffApp.updateOrderStatus('${order.id}', 'preparing')">
                         <md-icon slot="icon">local_fire_department</md-icon>
                         Bắt đầu làm
                       </md-filled-tonal-button>`
                    : `<md-filled-button class="btn-kitchen complete" onclick="StaffApp.updateOrderStatus('${order.id}', 'completed')">
                         <md-icon slot="icon">check</md-icon>
                         Hoàn thành
                       </md-filled-button>`
                }
                    </div>
                </div>
            `;
        }).join('');
    },

    // ========================================
    // ORDERS
    // ========================================
    async loadOrders() {
        // Add refresh button if not exists
        const header = document.querySelector('#section-orders .section-header');
        if (header && !document.getElementById('forceRefreshBtn')) {
            const btn = document.createElement('button');
            btn.id = 'forceRefreshBtn';
            btn.className = 'btn-icon';
            btn.innerHTML = '🔄';
            btn.style.cssText = 'position:absolute; right:16px; top:16px; background:none; border:none; font-size:1.5rem; cursor:pointer; z-index:10;';
            btn.onclick = async (e) => {
                e.stopPropagation();
                btn.classList.add('spinning');
                await this.loadOrders();
                this.loadKitchenOrders();
                this.showToast('Đã làm mới dữ liệu');
                setTimeout(() => btn.classList.remove('spinning'), 1000);
            };
            header.style.position = 'relative';
            header.appendChild(btn);

            // Add spin animation
            if (!document.getElementById('spinStyle')) {
                const style = document.createElement('style');
                style.id = 'spinStyle';
                style.textContent = '@keyframes spin { 100% { transform: rotate(360deg); } } .spinning { animation: spin 1s linear infinite; }';
                document.head.appendChild(style);
            }
        }

        // Try fetch from API if online
        if (typeof APIService !== 'undefined' && APIService.isConfigured()) {
            const result = await APIService.orders.getAll();
            if (result.success && result.data) {
                // Map Supabase data to local format
                const mappedOrders = result.data.map(o => {
                    let items = [];
                    try {
                        items = typeof o.items === 'string' ? JSON.parse(o.items) : o.items;
                    } catch (e) { items = []; }

                    return {
                        id: o.order_number || o.id,
                        supabaseId: o.id,
                        status: o.status,
                        items: items,
                        total: o.total,
                        createdAt: o.created_at,
                        orderType: o.order_type || 'dinein',
                        table: o.table_number,
                        customerName: o.customer_name,
                        customerPhone: o.customer_phone
                    };
                });

                // Save to localStorage (single source of truth for UI)
                localStorage.setItem('customer_orders', JSON.stringify(mappedOrders));
                if (window.Debug) Debug.info('Synced', mappedOrders.length, 'orders from API');
            }
        }

        this.initOrdersPagination();
    },

    // Subscribe to realtime order updates
    subscribeToOrders() {
        if (typeof SupabaseService !== 'undefined' && window.isSupabaseConfigured?.()) {
            SupabaseService.subscribeToOrders(async (payload) => {
                if (window.Debug) Debug.info('🔔 Realtime update received:', payload.eventType);

                if (payload.eventType === 'INSERT') {
                    // New order!
                    this.showNewOrderNotification(payload.new);
                    await this.loadOrders();
                    this.loadKitchenOrders();
                    this.updateDashboard();
                } else if (payload.eventType === 'UPDATE') {
                    // Order status changed - refresh and notify
                    await this.loadOrders();
                    this.loadKitchenOrders();
                    this.updateDashboard();

                    // Force refresh Pagination UI
                    if (typeof Pagination !== 'undefined') {
                        Pagination.refresh('allOrdersList');
                    }

                    // Show quick toast for status change
                    const order = payload.new;
                    if (order.status === 'preparing') {
                        this.showToast(`🍳 Đơn ${order.order_number || order.id} đang được làm`, 'info');
                    } else if (order.status === 'ready') {
                        this.showToast(`✅ Đơn ${order.order_number || order.id} đã sẵn sàng!`, 'success');
                    }
                } else if (payload.eventType === 'DELETE') {
                    await this.loadOrders();
                    this.loadKitchenOrders();
                    this.updateDashboard();
                }
            });
            if (window.Debug) Debug.info('StaffApp subscribed to realtime orders');
        }
    },

    showNewOrderNotification(order) {
        // Play notification sound
        this.playNotificationSound();

        // Show toast
        this.showToast(`🔥 Đơn mới: ${order.order_number || order.id}`, 'warning');

        // Vibrate if on mobile
        if (navigator.vibrate) {
            navigator.vibrate([200, 100, 200]);
        }
    },

    playNotificationSound() {
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
        } catch (e) {
            if (window.Debug) Debug.log('Audio not supported');
        }
    },

    getOrders() {
        // Get orders from customer portal
        return JSON.parse(localStorage.getItem('customer_orders') || '[]');
    },

    initOrdersPagination() {
        const self = this;
        if (typeof Pagination !== 'undefined') {
            Pagination.init({
                containerId: 'allOrdersList',
                itemsPerPage: 10,
                infiniteScroll: true,
                emptyMessage: 'Không có đơn hàng',
                loadMoreText: 'Xem thêm đơn hàng',
                getData: () => {
                    let orders = self.getOrders();
                    if (self.currentFilter !== 'all') {
                        orders = orders.filter(o => o.status === self.currentFilter);
                    }
                    return orders;
                },
                renderItem: (order) => self.renderOrderCard(order)
            });
        } else {
            // Fallback without pagination
            this.renderAllOrdersFallback();
        }
    },

    renderOrderCard(order) {
        return `
            <div class="order-card md-ripple md-focus-ring">
                <div class="order-card-header">
                    <span class="order-card-id">${order.id}</span>
                    <span class="order-card-status ${order.status}">${this.getStatusLabel(order.status)}</span>
                </div>
                <div class="order-card-info">
                    ${order.items?.length || 0} món • ${order.orderType || 'dinein'} • ${this.formatTime(order.createdAt)}
                </div>
                <div class="order-card-total">${this.formatPrice(order.total)}</div>
            </div>
        `;
    },

    renderAllOrdersFallback() {
        const orders = this.getOrders();
        const container = document.getElementById('allOrdersList');
        if (!container) return;

        if (orders.length === 0) {
            container.innerHTML = '<p class="no-orders">Không có đơn hàng</p>';
            return;
        }

        container.innerHTML = orders.map(order => this.renderOrderCard(order)).join('');
    },

    filterOrders(status) {
        this.currentFilter = status;
        document.querySelectorAll('.order-filters md-filter-chip').forEach(chip => {
            chip.selected = chip.dataset.filter === status;
        });

        // Refresh pagination with new filter
        if (typeof Pagination !== 'undefined') {
            Pagination.refresh('allOrdersList');
        } else {
            this.renderAllOrdersFallback();
        }
    },

    async updateOrderStatus(orderId, newStatus) {
        const orders = this.getOrders();
        const order = orders.find(o => o.id === orderId);

        if (order) {
            order.status = newStatus;
            order.statusHistory = order.statusHistory || [];
            order.statusHistory.push({
                status: newStatus,
                time: new Date().toISOString(),
                by: this.currentStaff?.name || 'Staff'
            });

            // Cập nhật localStorage
            localStorage.setItem('customer_orders', JSON.stringify(orders));

            // Đồng bộ với Supabase qua APIService
            if (typeof APIService !== 'undefined' && APIService.isConfigured()) {
                const result = await APIService.orders.updateStatus(order.supabaseId || orderId, newStatus);
                if (result.success) {
                    if (window.Debug) Debug.info('✅ Đã đồng bộ trạng thái với Supabase:', orderId, newStatus);
                } else if (result.offline) {
                    if (window.Debug) Debug.info('📴 Đã lưu offline, sẽ đồng bộ sau');
                }
            }

            this.showToast(`Đã cập nhật: ${this.getStatusLabel(newStatus)}`);

            // Refresh views
            this.loadKitchenOrders();
            this.loadOrders();
            this.updateDashboard();
        }
    },

    viewOrder(orderId) {
        this.showSection('orders');
    },

    // ========================================
    // NAVIGATION
    // ========================================
    showSection(sectionId) {
        // Check permissions before allowing section access
        if (sectionId === 'kitchen' && !this.hasPermission('kitchen')) {
            this.showToast('⛔ Bạn không có quyền truy cập màn hình Bếp', 'error');
            return;
        }
        if (sectionId === 'orders' && !this.hasPermission('orders')) {
            this.showToast('⛔ Bạn không có quyền truy cập Đơn hàng', 'error');
            return;
        }
        if (sectionId === 'pos' && !this.hasPermission('pos')) {
            this.showToast('⛔ Bạn không có quyền truy cập Bán hàng', 'error');
            return;
        }

        document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
        document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));

        document.getElementById(`section-${sectionId}`)?.classList.add('active');
        document.querySelector(`[data-section="${sectionId}"]`)?.classList.add('active');

        // Load data based on section
        if (sectionId === 'kitchen') {
            this.loadKitchenOrders();
        } else if (sectionId === 'orders') {
            this.loadOrders();
        } else if (sectionId === 'dashboard') {
            this.updateDashboard();
        } else if (sectionId === 'pos') {
            this.initPOS();
        }
    },

    // ========================================
    // UTILITIES - Use centralized utils.js
    // ========================================
    formatPrice(amount) {
        return window.utils ? window.utils.formatPrice(amount) : new Intl.NumberFormat('vi-VN').format(amount || 0) + 'đ';
    },

    formatTime(dateStr) {
        return window.utils ? window.utils.getCurrentTime() : new Date(dateStr).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
    },

    getWaitTime(dateStr) {
        return Math.floor((new Date() - new Date(dateStr)) / 1000 / 60);
    },

    getStatusLabel(status) {
        const labels = {
            'pending': '⏳ Chờ',
            'confirmed': '✅ Xác nhận',
            'preparing': '🔥 Đang làm',
            'ready': '✨ Sẵn sàng',
            'delivering': '🛵 Giao hàng',
            'completed': '✅ Xong'
        };
        return labels[status] || status;
    },

    showToast(message, type = 'success') {
        if (window.utils && window.utils.toast) {
            window.utils.toast.show(message, type);
            return;
        }
        const container = document.getElementById('toastContainer');
        if (!container) return;
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.textContent = message;
        container.appendChild(toast);
        setTimeout(() => toast.remove(), 3000);
    },

    // ========================================
    // STAFF POS - BÁN HÀNG
    // ========================================
    staffCart: [],
    currentMenuCategory: 'all',

    initPOS() {
        this.setupPOSEventListeners();
        this.renderStaffMenu();
        this.updateStaffCart();
    },

    setupPOSEventListeners() {
        const chips = document.querySelectorAll('.pos-category-tab');
        chips.forEach(chip => {
            chip.addEventListener('click', (e) => {
                chips.forEach(c => c.selected = false);
                e.currentTarget.selected = true;
                this.currentMenuCategory = e.currentTarget.dataset.category;
                this.renderStaffMenu();
            });
        });
    },

    renderStaffMenu() {
        const grid = document.getElementById('staffMenuGrid');
        if (!grid) return;

        let items = window.menuItems || [];
        if (this.currentMenuCategory !== 'all') {
            items = items.filter(i => i.category === this.currentMenuCategory);
        }

        if (items.length === 0) {
            grid.innerHTML = '<p class="no-orders">Không có món trong danh mục này</p>';
            return;
        }

        grid.innerHTML = items.map(item => `
            <div class="menu-item-mobile" onclick="StaffApp.addToStaffCart(${item.id})">
                <md-ripple></md-ripple>
                <span class="item-icon">${item.icon || '🍽️'}</span>
                <span class="item-name">${item.name}</span>
                <span class="item-price">${this.formatPrice(item.price)}</span>
            </div>
        `).join('');
    },

    addToStaffCart(itemId) {
        const item = (window.menuItems || []).find(i => i.id === itemId);
        if (!item) return;

        const existing = this.staffCart.find(c => c.id === itemId);
        if (existing) {
            existing.quantity++;
        } else {
            this.staffCart.push({ ...item, quantity: 1 });
        }

        this.updateStaffCart();
        this.showToast(`✅ ${item.name}`);
    },

    removeFromStaffCart(itemId) {
        this.staffCart = this.staffCart.filter(c => c.id !== itemId);
        this.updateStaffCart();
    },

    updateStaffCartQty(itemId, delta) {
        const item = this.staffCart.find(c => c.id === itemId);
        if (item) {
            item.quantity += delta;
            if (item.quantity <= 0) {
                this.removeFromStaffCart(itemId);
            } else {
                this.updateStaffCart();
            }
        }
    },

    updateStaffCart() {
        const countEl = document.getElementById('staffCartCount');
        const totalEl = document.getElementById('staffCartTotal');

        const count = this.staffCart.reduce((s, i) => s + i.quantity, 0);
        const total = this.staffCart.reduce((s, i) => s + i.price * i.quantity, 0);

        if (countEl) countEl.textContent = `${count} món`;
        if (totalEl) totalEl.textContent = this.formatPrice(total);
    },

    async staffCheckout() {
        if (this.staffCart.length === 0) {
            this.showToast('Vui lòng chọn món', 'warning');
            return;
        }

        const tableSelect = document.getElementById('staffTableSelect');
        const table = tableSelect?.value;
        if (!table) {
            this.showToast('Vui lòng chọn bàn', 'warning');
            return;
        }

        const subtotal = this.staffCart.reduce((s, i) => s + i.price * i.quantity, 0);
        const vat = subtotal * 0.1;
        const total = subtotal + vat;

        // Create order ID
        const orderId = 'AD' + Date.now().toString().slice(-6) + '-' + Math.floor(Math.random() * 10000);

        const orderItems = this.staffCart.map(item => ({
            id: item.id,
            name: item.name,
            icon: item.icon || '🍽️',
            qty: item.quantity,
            price: item.price
        }));

        const newOrder = {
            id: orderId,
            table: table === 'takeaway' ? 'Mang đi' : 'Bàn ' + table,
            items: orderItems,
            total: total,
            status: 'pending',
            orderType: table === 'takeaway' ? 'takeaway' : 'dinein',
            createdAt: new Date().toISOString(),
            staffId: this.currentStaff?.id,
            staffName: this.currentStaff?.name
        };

        // Save to localStorage
        const orders = JSON.parse(localStorage.getItem('customer_orders') || '[]');
        orders.unshift(newOrder);
        localStorage.setItem('customer_orders', JSON.stringify(orders));

        // Sync to Supabase
        await this.syncStaffOrderToSupabase(newOrder);

        // Clear cart
        this.staffCart = [];
        this.updateStaffCart();
        if (tableSelect) tableSelect.value = '';

        this.showToast(`✅ Đã tạo đơn ${orderId}`, 'success');

        // Refresh dashboard and orders
        this.updateDashboard();
        this.loadOrders();
        this.loadKitchenOrders();

        // Go back to dashboard
        this.showSection('dashboard');
    },

    async syncStaffOrderToSupabase(order) {
        if (typeof SupabaseService === 'undefined' || !window.isSupabaseConfigured?.()) {
            if (window.Debug) Debug.warn('Supabase not configured, order saved locally only');
            return;
        }

        try {
            const result = await SupabaseService.createOrder({
                order_number: order.id,
                customer_name: 'Khách tại quán',
                customer_phone: '',
                table_number: order.table,
                items: JSON.stringify(order.items),
                subtotal: Math.round(order.total / 1.1),
                discount: 0,
                total: order.total,
                status: 'pending',
                order_type: order.orderType,
                notes: `Staff: ${order.staffName || 'Unknown'}`
            });

            if (result.error) {
                console.error('Failed to sync order:', result.error);
            } else {
                if (window.Debug) Debug.log('✅ Order synced to Supabase:', result.data?.id);
            }
        } catch (err) {
            console.error('Supabase sync error:', err);
        }
    }
};

// Initialize on load
document.addEventListener('DOMContentLoaded', () => StaffApp.init());

window.StaffApp = StaffApp;
