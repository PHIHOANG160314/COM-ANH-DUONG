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
            pos: false,
            reports: false,
            staff: false,
            checkin: true,
            updateOrder: true
        },
        'Bếp': {
            dashboard: true,
            dashboardRevenue: false,
            kitchen: true,
            orders: true,  // Changed: All roles can view orders
            pos: false,
            reports: false,
            staff: false,
            checkin: true,
            updateOrder: true
        }
    },

    // Demo staff data (in production, this would come from backend)
    staffList: [
        { id: 'S001', name: 'Nguyễn Văn A', pin: '1234', role: 'Phục vụ' },
        { id: 'S002', name: 'Trần Thị B', pin: '2345', role: 'Thu ngân' },
        { id: 'S003', name: 'Lê Văn C', pin: '3456', role: 'Bếp' },
        { id: 'S004', name: 'Admin', pin: '0000', role: 'Quản lý' }
    ],

    // Check if current user has permission for a feature
    hasPermission(feature) {
        if (!this.currentStaff) return false;
        const role = this.currentStaff.role;
        return this.rolePermissions[role]?.[feature] ?? false;
    },

    init() {
        if (window.Debug) Debug.info('Staff Portal initializing...');
        this.updateDate();
        this.checkSession();
        this.loadOrders();
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
            const session = JSON.parse(saved);
            this.currentStaff = session.staff;
            this.isCheckedIn = session.isCheckedIn;
            this.checkinTime = session.checkinTime;
            this.onLoginSuccess();
        }
    },

    // ========================================
    // AUTHENTICATION
    // ========================================
    login() {
        const pinInput = document.getElementById('pinInput');
        const pin = pinInput?.value;

        if (!pin || pin.length !== 4) {
            this.showToast('Vui lòng nhập mã PIN 4 số', 'error');
            return;
        }

        const staff = this.staffList.find(s => s.pin === pin);
        if (staff) {
            this.currentStaff = staff;
            this.saveSession();
            this.onLoginSuccess();
            this.showToast(`Xin chào, ${staff.name}!`);
        } else {
            this.showToast('Mã PIN không đúng', 'error');
            pinInput.value = '';
        }
    },

    onLoginSuccess() {
        document.getElementById('staffName').textContent = this.currentStaff.name;
        document.getElementById('bottomNav').classList.add('show');

        // Apply role-based permissions to UI
        this.applyRolePermissions();

        this.showSection('dashboard');
        this.updateDashboard();
        this.updateCheckinUI();
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
            checkinTime: this.checkinTime
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
            <div class="order-card" onclick="StaffApp.viewOrder('${order.id}')">
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
                            <div class="kitchen-order-item">${item.icon || '🍽️'} ${item.name} x${item.qty}</div>
                        `).join('') || 'Không có món'}
                    </div>
                    <div class="kitchen-order-actions">
                        ${order.status === 'pending'
                    ? `<button class="btn-kitchen start" onclick="StaffApp.updateOrderStatus('${order.id}', 'preparing')">🔥 Bắt đầu làm</button>`
                    : `<button class="btn-kitchen complete" onclick="StaffApp.updateOrderStatus('${order.id}', 'completed')">✅ Hoàn thành</button>`
                }
                    </div>
                </div>
            `;
        }).join('');
    },

    // ========================================
    // ORDERS
    // ========================================
    loadOrders() {
        this.initOrdersPagination();
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
            <div class="order-card">
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
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.classList.toggle('active', btn.textContent.toLowerCase().includes(status === 'all' ? 'tất' :
                status === 'pending' ? 'chờ' : status === 'preparing' ? 'đang' : 'xong'));
        });

        // Refresh pagination with new filter
        if (typeof Pagination !== 'undefined') {
            Pagination.refresh('allOrdersList');
        } else {
            this.renderAllOrdersFallback();
        }
    },

    updateOrderStatus(orderId, newStatus) {
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

            localStorage.setItem('customer_orders', JSON.stringify(orders));
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
        }
    },

    // ========================================
    // UTILITIES
    // ========================================
    formatPrice(amount) {
        return new Intl.NumberFormat('vi-VN').format(amount || 0) + 'đ';
    },

    formatTime(dateStr) {
        return new Date(dateStr).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
    },

    getWaitTime(dateStr) {
        const start = new Date(dateStr);
        const now = new Date();
        return Math.floor((now - start) / 1000 / 60);
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
document.addEventListener('DOMContentLoaded', () => StaffApp.init());

window.StaffApp = StaffApp;
