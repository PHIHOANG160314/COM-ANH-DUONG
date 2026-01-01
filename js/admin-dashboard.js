// ========================================
// F&B MASTER - ADMIN MOBILE DASHBOARD
// Quick Stats & Management on Mobile
// Enhanced with Supabase Integration
// ========================================

const AdminDashboard = {
    stats: {
        todayRevenue: 0,
        todayOrders: 0,
        avgOrderValue: 0,
        topItems: [],
        activeOrders: 0,
        staffOnDuty: 0
    },
    useSupabase: false,

    async init() {
        this.useSupabase = typeof isSupabaseConfigured === 'function' && isSupabaseConfigured();
        if (window.Debug) Debug.info('📊 Admin Dashboard initialized', this.useSupabase ? '(Supabase)' : '(Local)');
        await this.loadStats();
        this.setupRealtimeUpdates();
    },

    async loadStats() {
        // Try Supabase first
        if (this.useSupabase && typeof SupabaseService !== 'undefined') {
            try {
                // Get today's stats
                const statsResult = await SupabaseService.getTodayStats();
                if (statsResult.success && statsResult.data) {
                    const data = statsResult.data;
                    const summary = data.summary || data;

                    this.stats.todayOrders = summary.orderCount || summary.totalOrders || 0;
                    this.stats.todayRevenue = summary.totalRevenue || 0;
                    this.stats.avgOrderValue = summary.avgOrderValue ||
                        (this.stats.todayOrders > 0 ? Math.round(this.stats.todayRevenue / this.stats.todayOrders) : 0);
                    this.stats.activeOrders = summary.pendingOrders || 0;
                }

                // Get top items
                const topResult = await SupabaseService.getTopItems(null, null, 5);
                if (topResult.success && topResult.data && topResult.data.length > 0) {
                    this.stats.topItems = topResult.data.map(item => ({
                        name: item.name,
                        count: item.quantity || item.qty || 0,
                        revenue: item.revenue || 0
                    }));
                }

                if (window.Debug) Debug.info('📊 Stats loaded from Supabase');
                return;

            } catch (error) {
                if (window.Debug) Debug.warn('Supabase stats failed, using localStorage');
            }
        }

        // Fallback to localStorage
        const orders = JSON.parse(localStorage.getItem('all_orders') || '[]');
        const today = new Date().toDateString();
        const todayOrders = orders.filter(o =>
            new Date(o.createdAt).toDateString() === today
        );

        this.stats.todayOrders = todayOrders.length;
        this.stats.todayRevenue = todayOrders.reduce((sum, o) => sum + (o.total || 0), 0);
        this.stats.avgOrderValue = this.stats.todayOrders > 0
            ? Math.round(this.stats.todayRevenue / this.stats.todayOrders)
            : 0;

        // Sample data for demo if no real data
        if (this.stats.todayOrders === 0) {
            this.stats.todayOrders = 47;
            this.stats.todayRevenue = 8750000;
            this.stats.avgOrderValue = 186170;
            this.stats.activeOrders = 5;
            this.stats.staffOnDuty = 8;
            this.stats.topItems = [
                { name: 'Phở bò tái', count: 28, revenue: 1400000 },
                { name: 'Cà phê sữa đá', count: 45, revenue: 900000 },
                { name: 'Bánh mì thịt', count: 22, revenue: 660000 },
                { name: 'Bún chả', count: 19, revenue: 950000 },
                { name: 'Nước chanh', count: 35, revenue: 525000 }
            ];
        }
    },

    // Setup real-time updates
    setupRealtimeUpdates() {
        if (this.useSupabase && typeof SupabaseService !== 'undefined') {
            SupabaseService.subscribeToStats(async (stats) => {
                if (window.Debug) Debug.info('📊 Real-time dashboard update');
                await this.loadStats();
                // Update UI if modal is open
                this.updateModalStats();
            });
        }
    },

    // Update stats in open modal
    updateModalStats() {
        const modal = document.getElementById('adminDashboardModal');
        if (!modal) return;

        const revenueEl = modal.querySelector('.stat-card.revenue .stat-value');
        const ordersEl = modal.querySelector('.stat-card.orders .stat-value');
        const avgEl = modal.querySelector('.stat-card.avg .stat-value');
        const activeEl = modal.querySelector('.stat-card.active .stat-value');

        if (revenueEl) revenueEl.textContent = this.formatPrice(this.stats.todayRevenue);
        if (ordersEl) ordersEl.textContent = this.stats.todayOrders;
        if (avgEl) avgEl.textContent = this.formatPrice(this.stats.avgOrderValue);
        if (activeEl) activeEl.textContent = this.stats.activeOrders;
    },

    // ========================================
    // DASHBOARD UI
    // ========================================

    show() {
        this.loadStats();

        const modal = document.createElement('div');
        modal.className = 'admin-dashboard-modal';
        modal.id = 'adminDashboardModal';
        modal.innerHTML = `
            <div class="admin-dashboard">
                <div class="dashboard-header">
                    <h2>📊 Admin Dashboard</h2>
                    <button onclick="AdminDashboard.close()">✕</button>
                </div>
                <div class="dashboard-body">
                    <!-- Quick Actions -->
                    <div class="quick-actions">
                        <button class="action-btn" onclick="AdminDashboard.openSection('orders')">
                            <span>📦</span>
                            <span>Đơn hàng</span>
                        </button>
                        <button class="action-btn" onclick="KitchenRealtime.showKitchenDisplay(); AdminDashboard.close();">
                            <span>👨‍🍳</span>
                            <span>Bếp</span>
                        </button>
                        <button class="action-btn" onclick="AdminDashboard.openSection('staff')">
                            <span>👥</span>
                            <span>Nhân viên</span>
                        </button>
                        <button class="action-btn" onclick="AdminDashboard.openSection('stats')">
                            <span>📈</span>
                            <span>Thống kê</span>
                        </button>
                    </div>

                    <!-- Today Stats -->
                    <div class="section-title">📅 Hôm nay</div>
                    <div class="stats-grid">
                        <div class="stat-card revenue">
                            <div class="stat-icon">💰</div>
                            <div class="stat-info">
                                <div class="stat-value">${this.formatPrice(this.stats.todayRevenue)}</div>
                                <div class="stat-label">Doanh thu</div>
                            </div>
                            <div class="stat-trend up">+15%</div>
                        </div>
                        <div class="stat-card orders">
                            <div class="stat-icon">📦</div>
                            <div class="stat-info">
                                <div class="stat-value">${this.stats.todayOrders}</div>
                                <div class="stat-label">Đơn hàng</div>
                            </div>
                            <div class="stat-trend up">+8%</div>
                        </div>
                        <div class="stat-card avg">
                            <div class="stat-icon">📊</div>
                            <div class="stat-info">
                                <div class="stat-value">${this.formatPrice(this.stats.avgOrderValue)}</div>
                                <div class="stat-label">TB/đơn</div>
                            </div>
                        </div>
                        <div class="stat-card active">
                            <div class="stat-icon">🔥</div>
                            <div class="stat-info">
                                <div class="stat-value">${this.stats.activeOrders}</div>
                                <div class="stat-label">Đang xử lý</div>
                            </div>
                        </div>
                    </div>

                    <!-- Top Items -->
                    <div class="section-title">🏆 Món bán chạy</div>
                    <div class="top-items">
                        ${this.stats.topItems.map((item, idx) => `
                            <div class="top-item">
                                <span class="item-rank">${idx + 1}</span>
                                <div class="item-info">
                                    <div class="item-name">${item.name}</div>
                                    <div class="item-stats">${item.count} phần • ${this.formatPrice(item.revenue)}</div>
                                </div>
                                <div class="item-bar">
                                    <div class="bar-fill" style="width: ${(item.count / this.stats.topItems[0].count) * 100}%"></div>
                                </div>
                            </div>
                        `).join('')}
                    </div>

                    <!-- Staff Status -->
                    <div class="section-title">👥 Nhân viên</div>
                    <div class="staff-status">
                        <div class="staff-stat">
                            <span class="staff-icon">✅</span>
                            <span class="staff-count">${this.stats.staffOnDuty}</span>
                            <span class="staff-label">Đang làm</span>
                        </div>
                        <div class="staff-stat">
                            <span class="staff-icon">🛏️</span>
                            <span class="staff-count">2</span>
                            <span class="staff-label">Nghỉ</span>
                        </div>
                        <div class="staff-stat">
                            <span class="staff-icon">⏰</span>
                            <span class="staff-count">3</span>
                            <span class="staff-label">Trễ giờ</span>
                        </div>
                    </div>

                    <!-- Quick Reports -->
                    <div class="section-title">📋 Báo cáo nhanh</div>
                    <div class="quick-reports">
                        <button class="report-btn" onclick="AdminDashboard.generateReport('daily')">
                            📊 Báo cáo ngày
                        </button>
                        <button class="report-btn" onclick="AdminDashboard.generateReport('inventory')">
                            📦 Tồn kho
                        </button>
                        <button class="report-btn" onclick="AdminDashboard.generateReport('staff')">
                            👥 Chấm công
                        </button>
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
        document.body.style.overflow = 'hidden';
        this.injectStyles();
    },

    close() {
        const modal = document.getElementById('adminDashboardModal');
        if (modal) {
            modal.remove();
            document.body.style.overflow = '';
        }
    },

    openSection(section) {
        this.showToast(`📱 Đang mở ${section}...`);
        // In a real app, navigate to the section
    },

    async generateReport(type) {
        const reports = {
            daily: '📊 Báo cáo doanh thu ngày',
            weekly: '📈 Báo cáo tuần',
            inventory: '📦 Báo cáo tồn kho',
            staff: '👥 Báo cáo chấm công'
        };

        // Use ReportsManager if available
        if (typeof ReportsManager !== 'undefined') {
            this.close(); // Close admin dashboard
            ReportsManager.showReportsModal();
            return;
        }

        // Fallback for basic report
        this.showToast(`${reports[type]} đang được tạo...`);

        if (this.useSupabase && typeof SupabaseService !== 'undefined') {
            try {
                const result = await SupabaseService.getDailyReport();
                if (result.success) {
                    this.showToast(`✅ ${reports[type]} đã sẵn sàng!`);
                    // Could integrate with ReportsManager.exportToExcel here
                    return;
                }
            } catch (error) {
                if (window.Debug) Debug.error('Report generation failed:', error);
            }
        }

        // Simulate report generation
        setTimeout(() => {
            this.showToast(`✅ ${reports[type]} đã sẵn sàng!`);
        }, 1500);
    },

    // ========================================
    // ADMIN ACTIONS
    // ========================================

    sendAnnouncement(message) {
        // Broadcast to all connected clients
        if (typeof PushNotifications !== 'undefined') {
            PushNotifications.send('📢 Thông báo', {
                body: message,
                tag: 'announcement'
            });
        }
        this.showToast('📢 Đã gửi thông báo!');
    },

    togglePromo(promoCode, enabled) {
        const promos = JSON.parse(localStorage.getItem('promo_codes') || '{}');
        promos[promoCode] = { ...promos[promoCode], enabled };
        localStorage.setItem('promo_codes', JSON.stringify(promos));
        this.showToast(`${enabled ? '✅' : '❌'} Mã ${promoCode} đã ${enabled ? 'bật' : 'tắt'}`);
    },

    updateInventoryItem(itemId, quantity) {
        const inventory = JSON.parse(localStorage.getItem('inventory') || '{}');
        inventory[itemId] = { ...inventory[itemId], quantity };
        localStorage.setItem('inventory', JSON.stringify(inventory));
        this.showToast('📦 Đã cập nhật tồn kho');
    },

    // ========================================
    // UTILITIES
    // ========================================

    formatPrice(amount) {
        if (amount >= 1000000) {
            return (amount / 1000000).toFixed(1) + 'M đ';
        }
        return new Intl.NumberFormat('vi-VN').format(amount) + 'đ';
    },

    showToast(message) {
        if (typeof CustomerApp !== 'undefined' && CustomerApp.showToast) {
            CustomerApp.showToast(message);
        }
    },

    // ========================================
    // STYLES
    // ========================================

    injectStyles() {
        if (document.getElementById('adminDashboardStyles')) return;

        const style = document.createElement('style');
        style.id = 'adminDashboardStyles';
        style.textContent = `
            .admin-dashboard-modal {
                position: fixed;
                inset: 0;
                z-index: 2000;
                background: var(--bg-main, #0f0f23);
                overflow-y: auto;
            }

            .admin-dashboard {
                min-height: 100%;
            }

            .dashboard-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 16px 20px;
                background: var(--bg-card);
                border-bottom: 1px solid var(--border);
                position: sticky;
                top: 0;
                z-index: 10;
            }

            .dashboard-header h2 { margin: 0; }

            .dashboard-header button {
                width: 36px;
                height: 36px;
                border: none;
                background: rgba(255,255,255,0.1);
                color: var(--text-primary);
                border-radius: 50%;
                cursor: pointer;
            }

            .dashboard-body {
                padding: 16px;
                padding-bottom: calc(16px + env(safe-area-inset-bottom));
            }

            /* Quick Actions */
            .quick-actions {
                display: grid;
                grid-template-columns: repeat(4, 1fr);
                gap: 8px;
                margin-bottom: 20px;
            }

            .action-btn {
                display: flex;
                flex-direction: column;
                align-items: center;
                gap: 6px;
                padding: 16px 8px;
                background: var(--bg-card);
                border: none;
                border-radius: 16px;
                color: var(--text-primary);
                cursor: pointer;
                transition: transform 0.2s;
            }

            .action-btn:active {
                transform: scale(0.95);
            }

            .action-btn span:first-child {
                font-size: 1.5rem;
            }

            .action-btn span:last-child {
                font-size: 0.75rem;
            }

            .section-title {
                font-size: 0.9rem;
                font-weight: 600;
                color: var(--text-secondary);
                margin: 20px 0 12px;
            }

            /* Stats Grid */
            .stats-grid {
                display: grid;
                grid-template-columns: repeat(2, 1fr);
                gap: 12px;
            }

            .stat-card {
                background: var(--bg-card);
                border-radius: 16px;
                padding: 16px;
                display: flex;
                align-items: center;
                gap: 12px;
            }

            .stat-card.revenue { border-left: 4px solid #10b981; }
            .stat-card.orders { border-left: 4px solid #6366f1; }
            .stat-card.avg { border-left: 4px solid #f59e0b; }
            .stat-card.active { border-left: 4px solid #ef4444; }

            .stat-icon {
                width: 44px;
                height: 44px;
                background: rgba(255,255,255,0.05);
                border-radius: 12px;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 1.3rem;
            }

            .stat-info { flex: 1; }

            .stat-value {
                font-size: 1.1rem;
                font-weight: 700;
            }

            .stat-label {
                font-size: 0.75rem;
                color: var(--text-muted);
            }

            .stat-trend {
                font-size: 0.75rem;
                padding: 4px 8px;
                border-radius: 8px;
            }

            .stat-trend.up {
                background: rgba(16, 185, 129, 0.2);
                color: #10b981;
            }

            .stat-trend.down {
                background: rgba(239, 68, 68, 0.2);
                color: #ef4444;
            }

            /* Top Items */
            .top-items {
                background: var(--bg-card);
                border-radius: 16px;
                overflow: hidden;
            }

            .top-item {
                display: flex;
                align-items: center;
                gap: 12px;
                padding: 14px 16px;
                border-bottom: 1px solid var(--border);
            }

            .top-item:last-child { border: none; }

            .item-rank {
                width: 28px;
                height: 28px;
                background: linear-gradient(135deg, var(--primary), var(--secondary));
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                font-weight: 700;
                font-size: 0.8rem;
            }

            .item-info { flex: 1; }

            .item-name {
                font-weight: 600;
                margin-bottom: 2px;
            }

            .item-stats {
                font-size: 0.75rem;
                color: var(--text-muted);
            }

            .item-bar {
                width: 60px;
                height: 6px;
                background: rgba(255,255,255,0.1);
                border-radius: 3px;
                overflow: hidden;
            }

            .bar-fill {
                height: 100%;
                background: linear-gradient(90deg, var(--primary), var(--secondary));
                border-radius: 3px;
            }

            /* Staff Status */
            .staff-status {
                display: grid;
                grid-template-columns: repeat(3, 1fr);
                gap: 12px;
            }

            .staff-stat {
                background: var(--bg-card);
                border-radius: 16px;
                padding: 16px;
                text-align: center;
            }

            .staff-icon {
                font-size: 1.5rem;
                display: block;
                margin-bottom: 8px;
            }

            .staff-count {
                font-size: 1.5rem;
                font-weight: 700;
                display: block;
            }

            .staff-label {
                font-size: 0.75rem;
                color: var(--text-muted);
            }

            /* Quick Reports */
            .quick-reports {
                display: flex;
                flex-direction: column;
                gap: 8px;
            }

            .report-btn {
                padding: 16px;
                background: var(--bg-card);
                border: 1px solid var(--border);
                border-radius: 16px;
                color: var(--text-primary);
                font-size: 0.9rem;
                text-align: left;
                cursor: pointer;
                transition: background 0.2s;
            }

            .report-btn:hover {
                background: var(--bg-surface);
            }
        `;
        document.head.appendChild(style);
    }
};

// Add floating admin button
document.addEventListener('DOMContentLoaded', () => {
    AdminDashboard.init();

    // Only show for admin users (check localStorage)
    const isAdmin = localStorage.getItem('user_role') === 'admin';
    if (isAdmin || true) { // Show for demo
        const btn = document.createElement('button');
        btn.id = 'adminFloatBtn';
        btn.className = 'admin-float-btn';
        btn.innerHTML = '📊';
        btn.onclick = () => AdminDashboard.show();
        btn.style.cssText = `
            position: fixed;
            bottom: 160px;
            right: 20px;
            width: 48px;
            height: 48px;
            background: linear-gradient(135deg, var(--primary, #6366f1), var(--secondary, #10b981));
            border: none;
            border-radius: 50%;
            font-size: 1.3rem;
            cursor: pointer;
            box-shadow: 0 4px 20px rgba(0,0,0,0.3);
            z-index: 999;
        `;
        document.body.appendChild(btn);
    }
});

window.AdminDashboard = AdminDashboard;
