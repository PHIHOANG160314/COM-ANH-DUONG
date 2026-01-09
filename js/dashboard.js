// ========================================
// F&B MASTER - DASHBOARD MODULE
// Enhanced with Supabase Realtime
// ========================================

const Dashboard = {
    orders: [],
    useSupabase: false,

    async init() {
        console.log('📊 Dashboard initializing...');

        // Check if Supabase is available
        this.useSupabase = typeof isSupabaseConfigured !== 'undefined' && isSupabaseConfigured();

        if (this.useSupabase) {
            await this.loadFromSupabase();
            this.subscribeToRealtime();
        } else {
            this.loadFromLocal();
        }

        this.renderKPIs();
        this.renderRecentOrders();
        console.log('📊 Dashboard ready!', this.useSupabase ? '(Supabase)' : '(Local)');
    },

    // ========================================
    // DATA LOADING
    // ========================================

    async loadFromSupabase() {
        try {
            const result = await SupabaseService.getOrders();
            if (!result.error && result.data) {
                this.orders = result.data.map(o => ({
                    id: o.order_number || o.id,
                    supabaseId: o.id,
                    table: o.table_number || (o.order_type === 'takeaway' ? 'Mang đi' : 'Tại quán'),
                    items: this.parseItems(o.items),
                    total: o.total || 0,
                    status: o.status || 'pending',
                    time: this.formatTime(o.created_at),
                    createdAt: o.created_at
                }));
                console.log('📊 Loaded', this.orders.length, 'orders from Supabase');
            }
        } catch (err) {
            console.error('Dashboard: Failed to load from Supabase:', err);
            this.loadFromLocal();
        }
    },

    loadFromLocal() {
        // Fallback to localStorage or sample data
        const saved = localStorage.getItem('fb_orders');
        if (saved) {
            try {
                this.orders = JSON.parse(saved);
            } catch (e) {
                this.orders = [];
            }
        }

        // Merge with sampleOrders if available
        if (typeof sampleOrders !== 'undefined' && sampleOrders.length > 0) {
            const existingIds = new Set(this.orders.map(o => o.id));
            sampleOrders.forEach(o => {
                if (!existingIds.has(o.id)) {
                    this.orders.push(o);
                }
            });
        }
    },

    parseItems(items) {
        if (!items) return '';
        if (typeof items === 'string') {
            try {
                const parsed = JSON.parse(items);
                if (Array.isArray(parsed)) {
                    return parsed.map(i => `${i.name || i.item}${i.qty ? ' x' + i.qty : ''}`).join(', ');
                }
            } catch (e) {
                return items;
            }
        }
        if (Array.isArray(items)) {
            return items.map(i => `${i.name || i.item}${i.qty ? ' x' + i.qty : ''}`).join(', ');
        }
        return String(items);
    },

    formatTime(dateStr) {
        if (!dateStr) return '--:--';
        const date = new Date(dateStr);
        return date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
    },

    // ========================================
    // REALTIME SUBSCRIPTION
    // ========================================

    subscribeToRealtime() {
        if (typeof SupabaseService === 'undefined') return;

        SupabaseService.subscribeToOrders((payload) => {
            console.log('📊 Dashboard realtime event:', payload.eventType);

            if (payload.eventType === 'INSERT') {
                // Add new order
                const newOrder = {
                    id: payload.new.order_number || payload.new.id,
                    supabaseId: payload.new.id,
                    table: payload.new.table_number || 'Tại quán',
                    items: this.parseItems(payload.new.items),
                    total: payload.new.total || 0,
                    status: payload.new.status || 'pending',
                    time: this.formatTime(payload.new.created_at),
                    createdAt: payload.new.created_at
                };
                this.orders.unshift(newOrder);
                this.refresh();

                // Show notification
                if (typeof toast !== 'undefined') {
                    toast.success(`🔔 Đơn mới: ${newOrder.id}`);
                }
            } else if (payload.eventType === 'UPDATE') {
                // Update existing order
                const index = this.orders.findIndex(o => o.supabaseId === payload.new.id);
                if (index !== -1) {
                    this.orders[index].status = payload.new.status;
                    this.orders[index].total = payload.new.total;
                    this.refresh();
                }
            } else if (payload.eventType === 'DELETE') {
                // Remove order
                this.orders = this.orders.filter(o => o.supabaseId !== payload.old?.id);
                this.refresh();
            }
        }, 'Dashboard');

        console.log('📊 Dashboard subscribed to realtime');
    },

    // ========================================
    // RENDER FUNCTIONS
    // ========================================

    renderKPIs() {
        // Calculate today's stats from orders
        const today = new Date().toDateString();
        const todayOrders = this.orders.filter(o => {
            if (!o.createdAt) return false;
            return new Date(o.createdAt).toDateString() === today;
        });

        const todayRevenue = todayOrders.reduce((sum, o) => sum + (o.total || 0), 0);
        const todayOrderCount = todayOrders.length;

        // Update KPI elements
        const revenueEl = document.getElementById('totalRevenue');
        const ordersEl = document.getElementById('totalOrders');
        const foodCostEl = document.getElementById('foodCostPercent');
        const lowStockEl = document.getElementById('lowStockItems');

        if (revenueEl) {
            revenueEl.textContent = formatCurrency(todayRevenue);
        }
        if (ordersEl) {
            ordersEl.textContent = todayOrderCount;
        }
        if (foodCostEl) {
            // Food cost from dashboardData or calculate
            const foodCost = typeof dashboardData !== 'undefined' ? dashboardData.foodCostPercent : 30;
            foodCostEl.textContent = foodCost + '%';
        }
        if (lowStockEl) {
            // Count low stock items from inventory
            let lowStockCount = 0;
            if (typeof inventoryData !== 'undefined') {
                lowStockCount = inventoryData.filter(item => item.stock <= item.minStock).length;
            }
            lowStockEl.textContent = lowStockCount;
        }
    },

    renderRecentOrders() {
        const tbody = document.getElementById('recentOrdersBody');
        if (!tbody) return;

        // Sort by createdAt and take top 5
        const recentOrders = [...this.orders]
            .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
            .slice(0, 5);

        if (recentOrders.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6" style="text-align: center; opacity: 0.6;">Chưa có đơn hàng</td></tr>';
            return;
        }

        tbody.innerHTML = recentOrders.map(order => {
            const statusText = this.getStatusText(order.status);
            const statusClass = order.status || 'pending';

            return `
                <tr>
                    <td><strong>${order.id || '--'}</strong></td>
                    <td>${order.table || '--'}</td>
                    <td>${order.items || '--'}</td>
                    <td>${formatCurrency(order.total || 0)}</td>
                    <td>${this.getStatusBadge(statusClass, statusText)}</td>
                    <td>${order.time || '--:--'}</td>
                </tr>
            `;
        }).join('');
    },

    getStatusText(status) {
        const texts = {
            'pending': 'Chờ xử lý',
            'confirmed': 'Đã xác nhận',
            'preparing': 'Đang làm',
            'ready': 'Sẵn sàng',
            'completed': 'Hoàn thành',
            'served': 'Đã phục vụ',
            'cancelled': 'Đã hủy'
        };
        return texts[status] || status || 'Chờ xử lý';
    },

    getStatusBadge(status, text) {
        // Use global function if available, else create inline
        if (typeof getStatusBadge === 'function') {
            return getStatusBadge(status, text);
        }
        const colors = {
            'pending': '#f59e0b',
            'confirmed': '#3b82f6',
            'preparing': '#8b5cf6',
            'ready': '#10b981',
            'completed': '#22c55e',
            'served': '#22c55e',
            'cancelled': '#ef4444'
        };
        const color = colors[status] || '#6b7280';
        return `<span style="padding: 4px 8px; border-radius: 12px; font-size: 0.75rem; font-weight: 500; background: ${color}22; color: ${color};">${text}</span>`;
    },

    // ========================================
    // REFRESH
    // ========================================

    async refresh() {
        if (this.useSupabase) {
            await this.loadFromSupabase();
        }
        this.renderKPIs();
        this.renderRecentOrders();
    }
};

window.Dashboard = Dashboard;
