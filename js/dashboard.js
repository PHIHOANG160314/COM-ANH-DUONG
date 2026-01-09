// ========================================
// F&B MASTER - DASHBOARD MODULE
// ========================================

const Dashboard = {
    async init() {
        console.log('📊 Dashboard initializing...');
        await this.loadData();
        this.subscribeRealtime();
    },

    async loadData() {
        if (typeof SupabaseService === 'undefined' || !isSupabaseConfigured()) {
            console.log('⚠️ Dashboard: Supabase not configured, using local data');
            this.renderKPIs();
            this.renderRecentOrders(window.sampleOrders || []);
            return;
        }

        try {
            // Fetch recent orders
            const { data: orders, error } = await SupabaseService.client
                .from('orders')
                .select('*')
                .order('created_at', { ascending: false })
                .limit(10);

            if (error) throw error;

            this.updateKPIsFromOrders(orders);
            this.renderRecentOrders(orders);

        } catch (err) {
            console.error('❌ Dashboard load data error:', err);
        }
    },

    subscribeRealtime() {
        if (typeof SupabaseService === 'undefined' || !isSupabaseConfigured()) return;

        console.log('📡 Dashboard: Subscribing to realtime updates...');
        SupabaseService.client
            .channel('dashboard_updates')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, (payload) => {
                console.log('🔄 Dashboard Update:', payload);
                this.loadData(); // Reload data on any change

                // Show toast notification
                if (payload.eventType === 'INSERT') {
                    toast.success(`🎉 Có đơn hàng mới: ${payload.new.order_number || 'New Order'}`);
                }
            })
            .subscribe();
    },

    updateKPIsFromOrders(orders) {
        // Calculate daily stats (simple approximation from recent orders for now, 
        // ideally should use a dedicated stats API)

        const today = new Date().toDateString();
        const todayOrders = orders.filter(o => new Date(o.created_at).toDateString() === today);

        const revenue = todayOrders.reduce((sum, o) => sum + (o.total || 0), 0);
        const count = todayOrders.length;

        // Update UI
        const revenueEl = document.getElementById('totalRevenue');
        const countEl = document.getElementById('totalOrders');

        if (revenueEl) revenueEl.textContent = formatCurrency(revenue);
        if (countEl) countEl.textContent = count;

        // Low stock (keep local for now as inventory is not fully on Supabase yet)
        if (typeof inventoryData !== 'undefined') {
            const lowStockCount = inventoryData.filter(item => item.stock <= item.minStock).length;
            const stockEl = document.getElementById('lowStockItems');
            if (stockEl) stockEl.textContent = lowStockCount;
        }
    },

    renderRecentOrders(orders) {
        const tbody = document.getElementById('recentOrdersBody');
        if (!tbody) return;
        tbody.innerHTML = '';

        orders.slice(0, 5).forEach(order => {
            // Map Supabase fields to display
            const id = order.order_number || order.id || 'N/A';
            const table = order.table_number ? `Bàn ${order.table_number}` : (order.order_type === 'takeaway' ? 'Mang đi' : order.address || 'N/A');
            const total = order.total || 0;
            const status = order.status || 'pending';
            const time = new Date(order.created_at).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });

            // Format items summary
            let itemsSummary = order.notes || '...';
            try {
                if (order.items) {
                    const items = typeof order.items === 'string' ? JSON.parse(order.items) : order.items;
                    if (Array.isArray(items)) {
                        itemsSummary = items.map(i => i.name).join(', ');
                    }
                }
            } catch (e) { }

            const statusTextMap = {
                'pending': 'Chờ xử lý',
                'confirmed': 'Đã nhận',
                'preparing': 'Đang nấu',
                'ready': 'Sẵn sàng',
                'completed': 'Hoàn thành',
                'cancelled': 'Đã hủy',
                'paid': 'Đã thanh toán'
            };
            const statusText = statusTextMap[status] || status;

            const row = document.createElement('tr');
            row.innerHTML = `
                <td><strong>${id}</strong></td>
                <td>${table}</td>
                <td><div style="max-width: 200px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;" title="${itemsSummary}">${itemsSummary}</div></td>
                <td>${formatCurrency(total)}</td>
                <td>${getStatusBadge(status, statusText)}</td>
                <td>${time}</td>
            `;
            tbody.appendChild(row);
        });
    },

    // Backward compatibility
    renderKPIs() {
        if (typeof dashboardData !== 'undefined') {
            document.getElementById('totalRevenue').textContent = formatCurrency(dashboardData.revenue.today);
            document.getElementById('totalOrders').textContent = dashboardData.orders.today;
        }
    },

    refresh() {
        this.loadData();
    }
};

window.Dashboard = Dashboard;
