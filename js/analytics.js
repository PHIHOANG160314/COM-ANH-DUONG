// ========================================
// F&B MASTER - ANALYTICS MODULE
// Enhanced with Supabase Integration
// ========================================

const SalesAnalytics = {
    salesData: [],
    currentFilter: 'today',
    dateFrom: null,
    dateTo: null,
    useSupabase: false, // Will be set based on configuration

    async init() {
        this.useSupabase = typeof isSupabaseConfigured === 'function' && isSupabaseConfigured();
        await this.loadSalesData();
        this.setupEventListeners();
        this.setupRealtimeUpdates();
        this.renderAll();
    },

    async loadSalesData() {
        // Apply filter first to set dateFrom/dateTo
        if (!this.dateFrom || !this.dateTo) {
            this.applyQuickFilter();
        }

        // Try Supabase first
        if (this.useSupabase && typeof SupabaseService !== 'undefined') {
            try {
                const result = await SupabaseService.getRangeReport(this.dateFrom, this.dateTo);
                if (result.success && result.data) {
                    // Transform Supabase data to local format
                    this.salesData = this.transformSupabaseData(result.data);
                    if (window.Debug) Debug.info('📊 Analytics loaded from Supabase');
                    return;
                }
            } catch (error) {
                if (window.Debug) Debug.warn('Supabase analytics failed, using local data');
            }
        }

        // Fallback to localStorage
        const saved = storage.get('sales_history');
        if (saved && saved.length > 0) {
            this.salesData = saved;
        } else {
            // Generate sample data for demo
            this.salesData = this.generateSampleData();
            this.saveSalesData();
        }
    },

    // Transform Supabase report data to local format
    transformSupabaseData(reportData) {
        const data = [];
        if (reportData.dailyBreakdown) {
            reportData.dailyBreakdown.forEach(day => {
                data.push({
                    date: day.sale_date,
                    orders: day.orders,
                    total: day.revenue
                });
            });
        }
        return data;
    },

    // Setup real-time updates from Supabase
    setupRealtimeUpdates() {
        if (this.useSupabase && typeof SupabaseService !== 'undefined') {
            SupabaseService.subscribeToStats(async (stats) => {
                if (window.Debug) Debug.info('📊 Real-time analytics update');
                await this.loadSalesData();
                this.renderAll();
            });
        }
    },

    saveSalesData() {
        storage.set('sales_history', this.salesData);
    },

    generateSampleData() {
        const samples = [];
        const categories = ['drinks', 'food', 'dessert'];
        const channels = ['dine_in', 'delivery'];
        const itemNames = {
            drinks: ['Cà Phê Sữa', 'Trà Đào', 'Sinh Tố Bơ', 'Nước Cam'],
            food: ['Phở Bò', 'Bún Bò Huế', 'Cơm Tấm', 'Bánh Mì'],
            dessert: ['Chè Thái', 'Bánh Flan', 'Kem Dừa']
        };

        // Generate last 30 days of data
        for (let i = 0; i < 30; i++) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            const dateStr = date.toISOString().split('T')[0];

            // 3-8 orders per day
            const ordersCount = Math.floor(Math.random() * 6) + 3;
            for (let j = 0; j < ordersCount; j++) {
                const category = categories[Math.floor(Math.random() * categories.length)];
                const channel = channels[Math.floor(Math.random() * channels.length)];
                const items = itemNames[category];
                const itemName = items[Math.floor(Math.random() * items.length)];
                const qty = Math.floor(Math.random() * 3) + 1;
                const price = (Math.floor(Math.random() * 8) + 2) * 10000;

                samples.push({
                    id: `ORD${Date.now()}${i}${j}`,
                    date: dateStr,
                    type: channel,
                    items: [{ name: itemName, qty, price, category }],
                    total: price * qty
                });
            }
        }
        return samples;
    },

    setupEventListeners() {
        // Quick filter buttons
        document.querySelectorAll('.quick-filter-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.quick-filter-btn').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                this.currentFilter = e.target.dataset.filter;
                this.applyQuickFilter();
                this.renderAll();
            });
        });

        // Date inputs
        const fromInput = document.getElementById('analyticsDateFrom');
        const toInput = document.getElementById('analyticsDateTo');
        if (fromInput) fromInput.addEventListener('change', () => this.applyCustomFilter());
        if (toInput) toInput.addEventListener('change', () => this.applyCustomFilter());
    },

    applyQuickFilter() {
        const now = new Date();
        const today = now.toISOString().split('T')[0];

        switch (this.currentFilter) {
            case 'today':
                this.dateFrom = today;
                this.dateTo = today;
                break;
            case 'week':
                const weekAgo = new Date(now);
                weekAgo.setDate(weekAgo.getDate() - 7);
                this.dateFrom = weekAgo.toISOString().split('T')[0];
                this.dateTo = today;
                break;
            case 'month':
                const monthAgo = new Date(now);
                monthAgo.setMonth(monthAgo.getMonth() - 1);
                this.dateFrom = monthAgo.toISOString().split('T')[0];
                this.dateTo = today;
                break;
            case 'year':
                const yearStart = new Date(now.getFullYear(), 0, 1);
                this.dateFrom = yearStart.toISOString().split('T')[0];
                this.dateTo = today;
                break;
        }
    },

    applyCustomFilter() {
        const fromInput = document.getElementById('analyticsDateFrom');
        const toInput = document.getElementById('analyticsDateTo');
        if (fromInput && toInput && fromInput.value && toInput.value) {
            this.dateFrom = fromInput.value;
            this.dateTo = toInput.value;
            document.querySelectorAll('.quick-filter-btn').forEach(b => b.classList.remove('active'));
            this.renderAll();
        }
    },

    getFilteredData() {
        if (!this.dateFrom || !this.dateTo) {
            this.applyQuickFilter();
        }
        return this.salesData.filter(order => {
            return order.date >= this.dateFrom && order.date <= this.dateTo;
        });
    },

    renderAll() {
        this.renderSummary();
        this.renderCategoryChart();
        this.renderChannelChart();
        this.renderItemsTable();
    },

    renderSummary() {
        const data = this.getFilteredData();
        const totalRevenue = data.reduce((sum, order) => sum + order.total, 0);
        const orderCount = data.length;
        const avgOrder = orderCount > 0 ? Math.round(totalRevenue / orderCount) : 0;

        const revenueEl = document.getElementById('analyticsTotalRevenue');
        const ordersEl = document.getElementById('analyticsOrderCount');
        const avgEl = document.getElementById('analyticsAvgOrder');

        if (revenueEl) revenueEl.textContent = formatCurrency(totalRevenue);
        if (ordersEl) ordersEl.textContent = formatNumber(orderCount);
        if (avgEl) avgEl.textContent = formatCurrency(avgOrder);
    },

    renderCategoryChart() {
        const data = this.getFilteredData();
        const categoryTotals = { drinks: 0, food: 0, dessert: 0 };

        data.forEach(order => {
            order.items.forEach(item => {
                if (categoryTotals.hasOwnProperty(item.category)) {
                    categoryTotals[item.category] += item.price * item.qty;
                }
            });
        });

        const total = Object.values(categoryTotals).reduce((a, b) => a + b, 0);
        const container = document.getElementById('categoryChartContainer');
        if (!container) return;

        const categoryNames = { drinks: 'Đồ uống', food: 'Món chính', dessert: 'Tráng miệng' };
        const colors = { drinks: '#6366f1', food: '#10b981', dessert: '#f59e0b' };

        container.innerHTML = Object.entries(categoryTotals).map(([cat, value]) => {
            const percent = total > 0 ? Math.round((value / total) * 100) : 0;
            return `
                <div class="chart-bar-item">
                    <div class="bar-label">${categoryNames[cat]}</div>
                    <div class="bar-track">
                        <div class="bar-fill" style="width: ${percent}%; background: ${colors[cat]};"></div>
                    </div>
                    <div class="bar-value">${percent}%</div>
                </div>
            `;
        }).join('');
    },

    renderChannelChart() {
        const data = this.getFilteredData();
        const channelTotals = { dine_in: 0, delivery: 0 };

        data.forEach(order => {
            if (order.type === 'dine_in') {
                channelTotals.dine_in += order.total;
            } else {
                channelTotals.delivery += order.total;
            }
        });

        const total = channelTotals.dine_in + channelTotals.delivery;
        const container = document.getElementById('channelChartContainer');
        if (!container) return;

        const dineInPercent = total > 0 ? Math.round((channelTotals.dine_in / total) * 100) : 0;
        const deliveryPercent = 100 - dineInPercent;

        container.innerHTML = `
            <div class="channel-pie">
                <div class="pie-chart" style="background: conic-gradient(#6366f1 0% ${dineInPercent}%, #10b981 ${dineInPercent}% 100%);"></div>
                <div class="pie-legend">
                    <div class="legend-item">
                        <span class="legend-color" style="background: #6366f1;"></span>
                        <span>Tại chỗ: ${dineInPercent}%</span>
                        <span class="legend-value">${formatCurrency(channelTotals.dine_in)}</span>
                    </div>
                    <div class="legend-item">
                        <span class="legend-color" style="background: #10b981;"></span>
                        <span>Online: ${deliveryPercent}%</span>
                        <span class="legend-value">${formatCurrency(channelTotals.delivery)}</span>
                    </div>
                </div>
            </div>
        `;
    },

    renderItemsTable() {
        const data = this.getFilteredData();
        const itemStats = {};

        data.forEach(order => {
            order.items.forEach(item => {
                if (!itemStats[item.name]) {
                    itemStats[item.name] = { name: item.name, qty: 0, revenue: 0 };
                }
                itemStats[item.name].qty += item.qty;
                itemStats[item.name].revenue += item.price * item.qty;
            });
        });

        const sortedItems = Object.values(itemStats).sort((a, b) => b.revenue - a.revenue);
        const container = document.getElementById('analyticsItemsBody');
        if (!container) return;

        container.innerHTML = sortedItems.slice(0, 10).map((item, idx) => `
            <tr>
                <td><span class="rank-badge">${idx + 1}</span></td>
                <td>${item.name}</td>
                <td>${item.qty}</td>
                <td><strong>${formatCurrency(item.revenue)}</strong></td>
            </tr>
        `).join('');

        if (sortedItems.length === 0) {
            container.innerHTML = '<tr><td colspan="4" style="text-align:center;color:var(--text-muted);">Không có dữ liệu</td></tr>';
        }
    },

    // Add new sale from POS
    addSale(order) {
        this.salesData.push({
            id: order.id,
            date: new Date().toISOString().split('T')[0],
            type: order.type || 'dine_in',
            items: order.items.map(i => ({
                name: i.name,
                qty: i.qty,
                price: i.price,
                category: i.category || 'food'
            })),
            total: order.total
        });
        this.saveSalesData();
    }
};

window.SalesAnalytics = SalesAnalytics;
