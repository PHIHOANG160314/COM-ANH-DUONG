/**
 * F&B Master - Reports Manager
 * Author: Google DeepMind / Antigravity Team
 * Description: Generates sales reports, visualizes data, and handles Excel exports.
 */

const ReportsManager = {
    // State
    currentReport: null,
    isLoading: false,
    autoRefreshInterval: null,

    // Report Types
    TYPES: {
        DAILY: 'daily',
        WEEKLY: 'weekly',
        MONTHLY: 'monthly',
        CUSTOM: 'custom'
    },

    // Role-based access
    ROLES: {
        ADMIN: 'admin',   // Can view all reports
        STAFF: 'staff'    // Can execute/create reports
    },

    // ==================== INITIALIZATION ====================

    init() {
        this.injectStyles();
        this.setupRealtimeUpdates();
        if (window.Debug) Debug.info('📊 ReportsManager initialized');
    },

    // Check user role
    getUserRole() {
        return localStorage.getItem('user_role') || 'staff';
    },

    // Check if user can view reports
    canViewReports() {
        const role = this.getUserRole();
        return role === 'admin' || role === 'staff';
    },

    // Check if user can export
    canExport() {
        return this.canViewReports(); // Both admin and staff can export
    },

    // ==================== REPORT GENERATION ====================

    async generateReport(type, params = {}) {
        if (!this.canViewReports()) {
            this.showToast('❌ Bạn không có quyền xem báo cáo', 'error');
            return null;
        }

        this.isLoading = true;
        this.showLoadingUI();

        try {
            let result;
            const today = new Date().toISOString().split('T')[0];

            switch (type) {
                case this.TYPES.DAILY:
                    result = await SupabaseService.getDailyReport(params.date || today);
                    break;

                case this.TYPES.WEEKLY:
                    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
                    result = await SupabaseService.getRangeReport(weekAgo, today);
                    break;

                case this.TYPES.MONTHLY:
                    const monthAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
                    result = await SupabaseService.getRangeReport(monthAgo, today);
                    break;

                case this.TYPES.CUSTOM:
                    if (!params.dateFrom || !params.dateTo) {
                        throw new Error('Vui lòng chọn khoảng thời gian');
                    }
                    result = await SupabaseService.getRangeReport(params.dateFrom, params.dateTo);
                    break;

                default:
                    result = await SupabaseService.getDailyReport(today);
            }

            if (result.success) {
                this.currentReport = {
                    type,
                    params,
                    data: result.data,
                    generatedAt: new Date()
                };
                this.renderReport(this.currentReport);
                this.showToast('✅ Báo cáo đã được tạo', 'success');
            } else {
                throw new Error(result.error);
            }

            return this.currentReport;

        } catch (error) {
            if (window.Debug) Debug.error('Report generation failed:', error);
            this.showToast(`❌ Lỗi: ${error.message}`, 'error');
            return null;
        } finally {
            this.isLoading = false;
            this.hideLoadingUI();
        }
    },

    // ==================== EXCEL EXPORT ====================

    async exportToExcel(reportData = null) {
        if (!this.canExport()) {
            this.showToast('❌ Bạn không có quyền xuất báo cáo', 'error');
            return;
        }

        const data = reportData || this.currentReport;
        if (!data) {
            this.showToast('⚠️ Chưa có dữ liệu để xuất', 'warning');
            return;
        }

        this.showToast('📊 Đang tạo file Excel...', 'info');

        try {
            // Check if XLSX library is available
            if (typeof XLSX === 'undefined') {
                throw new Error('Thư viện XLSX chưa được tải');
            }

            const workbook = XLSX.utils.book_new();

            // Sheet 1: Summary
            const summaryData = this.formatSummaryForExcel(data.data);
            const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
            XLSX.utils.book_append_sheet(workbook, summarySheet, 'Tóm Tắt');

            // Sheet 2: Top Items (if available)
            if (data.data.topItems && data.data.topItems.length > 0) {
                const itemsData = this.formatTopItemsForExcel(data.data.topItems);
                const itemsSheet = XLSX.utils.aoa_to_sheet(itemsData);
                XLSX.utils.book_append_sheet(workbook, itemsSheet, 'Top Món Bán');
            }

            // Sheet 3: Category Breakdown (if available)
            if (data.data.categoryBreakdown && data.data.categoryBreakdown.length > 0) {
                const catData = this.formatCategoryForExcel(data.data.categoryBreakdown);
                const catSheet = XLSX.utils.aoa_to_sheet(catData);
                XLSX.utils.book_append_sheet(workbook, catSheet, 'Theo Nhóm');
            }

            // Sheet 4: Daily Breakdown (if available)
            if (data.data.dailyBreakdown && data.data.dailyBreakdown.length > 0) {
                const dailyData = this.formatDailyForExcel(data.data.dailyBreakdown);
                const dailySheet = XLSX.utils.aoa_to_sheet(dailyData);
                XLSX.utils.book_append_sheet(workbook, dailySheet, 'Theo Ngày');
            }

            // Generate filename
            const timestamp = new Date().toISOString().slice(0, 10);
            const reportType = data.type || 'report';
            const filename = `BaoCao_AnhDuong_${reportType}_${timestamp}.xlsx`;

            // Download
            XLSX.writeFile(workbook, filename);

            this.showToast(`✅ Đã xuất: ${filename}`, 'success');
            if (window.Debug) Debug.info('Excel exported:', filename);

        } catch (error) {
            if (window.Debug) Debug.error('Excel export failed:', error);
            this.showToast(`❌ Lỗi xuất Excel: ${error.message}`, 'error');
        }
    },

    // Export orders list to Excel
    async exportOrdersToExcel(dateFrom, dateTo) {
        if (!this.canExport()) {
            this.showToast('❌ Bạn không có quyền xuất báo cáo', 'error');
            return;
        }

        this.showToast('📊 Đang tải dữ liệu đơn hàng...', 'info');

        try {
            const result = await SupabaseService.getOrdersForExport(dateFrom, dateTo);

            if (!result.success) {
                throw new Error(result.error);
            }

            const orders = result.data;
            if (!orders || orders.length === 0) {
                this.showToast('⚠️ Không có đơn hàng trong khoảng thời gian này', 'warning');
                return;
            }

            // Format orders for Excel
            const headers = [
                'Mã Đơn', 'Ngày', 'Giờ', 'Khách Hàng', 'SĐT',
                'Loại', 'Bàn', 'Tổng Tiền', 'Trạng Thái', 'Ghi Chú'
            ];

            const rows = orders.map(order => {
                const date = new Date(order.created_at);
                return [
                    order.order_number || order.id.slice(0, 8),
                    date.toLocaleDateString('vi-VN'),
                    date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
                    order.customer_name || 'Khách lẻ',
                    order.customer_phone || '',
                    this.getOrderTypeLabel(order.order_type),
                    order.table_number || '',
                    order.total,
                    this.getStatusLabel(order.status),
                    order.notes || ''
                ];
            });

            const workbook = XLSX.utils.book_new();
            const sheet = XLSX.utils.aoa_to_sheet([headers, ...rows]);

            // Set column widths
            sheet['!cols'] = [
                { wch: 15 }, { wch: 12 }, { wch: 8 }, { wch: 20 }, { wch: 12 },
                { wch: 12 }, { wch: 8 }, { wch: 15 }, { wch: 15 }, { wch: 30 }
            ];

            XLSX.utils.book_append_sheet(workbook, sheet, 'Đơn Hàng');

            const filename = `DonHang_AnhDuong_${dateFrom}_${dateTo}.xlsx`;
            XLSX.writeFile(workbook, filename);

            this.showToast(`✅ Đã xuất ${orders.length} đơn hàng`, 'success');

        } catch (error) {
            if (window.Debug) Debug.error('Orders export failed:', error);
            this.showToast(`❌ Lỗi: ${error.message}`, 'error');
        }
    },

    // Format helpers for Excel
    formatSummaryForExcel(data) {
        const summary = data.summary || data;
        return [
            ['BÁO CÁO DOANH THU - ÁNH DƯƠNG F&B'],
            ['Ngày tạo:', new Date().toLocaleString('vi-VN')],
            [''],
            ['TỔNG QUAN'],
            ['Số đơn hàng:', summary.orderCount || 0],
            ['Tổng doanh thu:', summary.totalRevenue || 0],
            ['Giá trị TB/đơn:', summary.avgOrderValue || 0],
            ['Đơn hoàn thành:', summary.completedOrders || 0],
            ['Đơn đang chờ:', summary.pendingOrders || 0],
            [''],
            ['DOANH THU THEO KÊNH'],
            ['Tại chỗ:', data.revenueByChannel?.dinein || 0],
            ['Delivery:', data.revenueByChannel?.delivery || 0],
            ['Mang đi:', data.revenueByChannel?.takeaway || 0]
        ];
    },

    formatTopItemsForExcel(items) {
        const headers = ['Hạng', 'Tên Món', 'Số Lượng', 'Doanh Thu'];
        const rows = items.map((item, idx) => [
            idx + 1,
            item.name,
            item.quantity || item.qty,
            item.revenue
        ]);
        return [headers, ...rows];
    },

    formatCategoryForExcel(categories) {
        const headers = ['Nhóm', 'Doanh Thu', 'Tỷ Lệ (%)'];
        const rows = categories.map(cat => [
            this.getCategoryLabel(cat.category),
            cat.revenue,
            cat.percentage
        ]);
        return [headers, ...rows];
    },

    formatDailyForExcel(daily) {
        const headers = ['Ngày', 'Số Đơn', 'Doanh Thu'];
        const rows = daily.map(d => [
            d.sale_date,
            d.orders,
            d.revenue
        ]);
        return [headers, ...rows];
    },

    // Label helpers
    getOrderTypeLabel(type) {
        const labels = {
            'dinein': 'Tại chỗ',
            'delivery': 'Giao hàng',
            'takeaway': 'Mang đi'
        };
        return labels[type] || type;
    },

    getStatusLabel(status) {
        const labels = {
            'pending': 'Chờ xử lý',
            'confirmed': 'Đã xác nhận',
            'preparing': 'Đang làm',
            'ready': 'Sẵn sàng',
            'completed': 'Hoàn thành',
            'cancelled': 'Đã hủy'
        };
        return labels[status] || status;
    },

    getCategoryLabel(category) {
        const labels = {
            'drinks': 'Đồ uống',
            'food': 'Thức ăn',
            'dessert': 'Tráng miệng',
            'coffee': 'Cà phê',
            'milk-tea': 'Trà sữa',
            'other': 'Khác'
        };
        return labels[category] || category;
    },

    // ==================== REAL-TIME UPDATES ====================

    setupRealtimeUpdates() {
        if (typeof SupabaseService !== 'undefined' && isSupabaseConfigured()) {
            SupabaseService.subscribeToStats((stats) => {
                if (window.Debug) Debug.info('📊 Real-time stats update received');
                this.onStatsUpdate(stats);
            });
        }
    },

    onStatsUpdate(stats) {
        // Update dashboard if visible
        if (document.getElementById('page-reports')?.classList.contains('active')) {
            this.updateDashboardStats(stats);
        }

        // Trigger custom event for other modules
        window.dispatchEvent(new CustomEvent('statsUpdated', { detail: stats }));
    },

    updateDashboardStats(stats) {
        const elements = {
            'reportTodayRevenue': stats.summary?.totalRevenue || stats.totalRevenue,
            'reportTodayOrders': stats.summary?.orderCount || stats.totalOrders,
            'reportAvgOrder': stats.summary?.avgOrderValue || Math.round((stats.totalRevenue || 0) / (stats.totalOrders || 1))
        };

        Object.entries(elements).forEach(([id, value]) => {
            const el = document.getElementById(id);
            if (el) {
                el.textContent = typeof value === 'number' && id.includes('Revenue')
                    ? this.formatCurrency(value)
                    : value;
            }
        });
    },

    // ==================== UI RENDERING ====================

    showReportsModal() {
        if (!this.canViewReports()) {
            this.showToast('❌ Bạn không có quyền xem báo cáo', 'error');
            return;
        }

        const modal = document.createElement('div');
        modal.id = 'reportsModal';
        modal.className = 'reports-modal-overlay';
        modal.innerHTML = `
            <div class="reports-modal">
                <div class="reports-modal-header">
                    <h2>📊 Báo Cáo Doanh Thu</h2>
                    <button class="reports-close-btn" onclick="ReportsManager.closeModal()">×</button>
                </div>
                
                <div class="reports-modal-body">
                    <!-- Quick Stats -->
                    <div class="reports-quick-stats">
                        <div class="stat-card">
                            <span class="stat-value" id="reportTodayRevenue">0đ</span>
                            <span class="stat-label">Doanh thu hôm nay</span>
                        </div>
                        <div class="stat-card">
                            <span class="stat-value" id="reportTodayOrders">0</span>
                            <span class="stat-label">Đơn hàng</span>
                        </div>
                        <div class="stat-card">
                            <span class="stat-value" id="reportAvgOrder">0đ</span>
                            <span class="stat-label">TB/đơn</span>
                        </div>
                    </div>

                    <!-- Report Type Selection -->
                    <div class="report-type-tabs">
                        <button class="report-tab active" data-type="daily">Hôm nay</button>
                        <button class="report-tab" data-type="weekly">7 ngày</button>
                        <button class="report-tab" data-type="monthly">30 ngày</button>
                        <button class="report-tab" data-type="custom">Tùy chọn</button>
                    </div>

                    <!-- Custom Date Range -->
                    <div class="custom-date-range" id="customDateRange" style="display:none;">
                        <input type="date" id="reportDateFrom">
                        <span>→</span>
                        <input type="date" id="reportDateTo">
                        <button class="btn-primary" onclick="ReportsManager.applyCustomRange()">Áp dụng</button>
                    </div>

                    <!-- Report Content -->
                    <div class="report-content" id="reportContent">
                        <div class="loading-placeholder">
                            Chọn loại báo cáo để xem...
                        </div>
                    </div>
                </div>

                <div class="reports-modal-footer">
                    <button class="btn-success" onclick="ReportsManager.exportToExcel()">
                        📊 Xuất Excel
                    </button>
                    <button class="btn-info" onclick="ReportsManager.exportOrdersModal()">
                        📋 Xuất Đơn Hàng
                    </button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
        this.setupModalListeners();
        this.generateReport(this.TYPES.DAILY);
    },

    setupModalListeners() {
        document.querySelectorAll('.report-tab').forEach(tab => {
            tab.addEventListener('click', (e) => {
                document.querySelectorAll('.report-tab').forEach(t => t.classList.remove('active'));
                e.target.classList.add('active');

                const type = e.target.dataset.type;
                const customRange = document.getElementById('customDateRange');

                if (type === 'custom') {
                    customRange.style.display = 'flex';
                } else {
                    customRange.style.display = 'none';
                    this.generateReport(type);
                }
            });
        });
    },

    applyCustomRange() {
        const dateFrom = document.getElementById('reportDateFrom').value;
        const dateTo = document.getElementById('reportDateTo').value;

        if (!dateFrom || !dateTo) {
            this.showToast('⚠️ Vui lòng chọn đầy đủ ngày', 'warning');
            return;
        }

        this.generateReport(this.TYPES.CUSTOM, { dateFrom, dateTo });
    },

    renderReport(report) {
        const container = document.getElementById('reportContent');
        if (!container || !report || !report.data) return;

        const data = report.data;
        const summary = data.summary || data;

        container.innerHTML = `
            <div class="report-summary-grid">
                <div class="summary-item">
                    <span class="summary-label">Tổng doanh thu</span>
                    <span class="summary-value highlight">${this.formatCurrency(summary.totalRevenue || 0)}</span>
                </div>
                <div class="summary-item">
                    <span class="summary-label">Số đơn hàng</span>
                    <span class="summary-value">${summary.orderCount || 0}</span>
                </div>
                <div class="summary-item">
                    <span class="summary-label">Giá trị TB</span>
                    <span class="summary-value">${this.formatCurrency(summary.avgOrderValue || 0)}</span>
                </div>
            </div>

            ${data.revenueByChannel ? `
            <div class="report-section">
                <h4>📊 Theo Kênh Bán</h4>
                <div class="channel-bars">
                    ${this.renderChannelBars(data.revenueByChannel)}
                </div>
            </div>
            ` : ''}

            ${data.topItems && data.topItems.length > 0 ? `
            <div class="report-section">
                <h4>🏆 Top Món Bán Chạy</h4>
                <div class="top-items-list">
                    ${data.topItems.slice(0, 5).map((item, idx) => `
                        <div class="top-item">
                            <span class="rank">#${idx + 1}</span>
                            <span class="name">${item.name}</span>
                            <span class="qty">${item.quantity || item.qty}x</span>
                            <span class="revenue">${this.formatCurrency(item.revenue)}</span>
                        </div>
                    `).join('')}
                </div>
            </div>
            ` : ''}

            <div class="report-footer">
                <small>Cập nhật: ${new Date().toLocaleString('vi-VN')}</small>
            </div>
        `;
    },

    renderChannelBars(channels) {
        const total = (channels.dinein || 0) + (channels.delivery || 0) + (channels.takeaway || 0);
        if (total === 0) return '<p class="no-data">Chưa có dữ liệu</p>';

        const items = [
            { label: 'Tại chỗ', value: channels.dinein || 0, color: '#6366f1' },
            { label: 'Delivery', value: channels.delivery || 0, color: '#10b981' },
            { label: 'Mang đi', value: channels.takeaway || 0, color: '#f59e0b' }
        ];

        return items.map(item => {
            const percent = Math.round((item.value / total) * 100);
            return `
                <div class="channel-bar-item">
                    <div class="bar-info">
                        <span class="bar-label">${item.label}</span>
                        <span class="bar-value">${this.formatCurrency(item.value)} (${percent}%)</span>
                    </div>
                    <div class="bar-track">
                        <div class="bar-fill" style="width: ${percent}%; background: ${item.color};"></div>
                    </div>
                </div>
            `;
        }).join('');
    },

    closeModal() {
        const modal = document.getElementById('reportsModal');
        if (modal) {
            modal.remove();
        }
    },

    exportOrdersModal() {
        const dateFrom = document.getElementById('reportDateFrom')?.value ||
            new Date().toISOString().split('T')[0];
        const dateTo = document.getElementById('reportDateTo')?.value ||
            new Date().toISOString().split('T')[0];

        this.exportOrdersToExcel(dateFrom, dateTo);
    },

    // ==================== UTILITIES ====================

    formatCurrency(amount) {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(amount || 0);
    },

    showLoadingUI() {
        const content = document.getElementById('reportContent');
        if (content) {
            content.innerHTML = `
                <div class="loading-placeholder">
                    <div class="loading-spinner"></div>
                    <p>Đang tải báo cáo...</p>
                </div>
            `;
        }
    },

    hideLoadingUI() {
        // Handled by renderReport
    },

    showToast(message, type = 'info') {
        if (typeof Toast !== 'undefined') {
            Toast.show(message, type);
        } else {
            if (window.Debug) Debug.log(`[${type.toUpperCase()}] ${message}`);
        }
    },

    // ==================== STYLES ====================

    injectStyles() {
        if (document.getElementById('reports-styles')) return;

        const styles = document.createElement('style');
        styles.id = 'reports-styles';
        styles.textContent = `
            .reports-modal-overlay {
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: rgba(0, 0, 0, 0.7);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 10000;
                backdrop-filter: blur(4px);
            }

            .reports-modal {
                background: var(--card-bg, #1e1e2e);
                border-radius: 16px;
                width: 95%;
                max-width: 600px;
                max-height: 90vh;
                overflow: hidden;
                display: flex;
                flex-direction: column;
                box-shadow: 0 20px 60px rgba(0, 0, 0, 0.4);
            }

            .reports-modal-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 1rem 1.5rem;
                background: linear-gradient(135deg, #6366f1, #8b5cf6);
                color: white;
            }

            .reports-modal-header h2 {
                margin: 0;
                font-size: 1.2rem;
            }

            .reports-close-btn {
                background: none;
                border: none;
                color: white;
                font-size: 1.5rem;
                cursor: pointer;
                padding: 0;
                line-height: 1;
            }

            .reports-modal-body {
                flex: 1;
                overflow-y: auto;
                padding: 1rem;
            }

            .reports-quick-stats {
                display: grid;
                grid-template-columns: repeat(3, 1fr);
                gap: 0.75rem;
                margin-bottom: 1rem;
            }

            .stat-card {
                background: var(--bg-secondary, #2a2a3d);
                border-radius: 12px;
                padding: 1rem;
                text-align: center;
            }

            .stat-value {
                display: block;
                font-size: 1.25rem;
                font-weight: 700;
                color: #6366f1;
            }

            .stat-label {
                font-size: 0.75rem;
                color: var(--text-muted, #888);
            }

            .report-type-tabs {
                display: flex;
                gap: 0.5rem;
                margin-bottom: 1rem;
                overflow-x: auto;
                padding-bottom: 0.5rem;
            }

            .report-tab {
                flex: 1;
                padding: 0.5rem 1rem;
                border: none;
                background: var(--bg-secondary, #2a2a3d);
                color: var(--text-primary, #fff);
                border-radius: 8px;
                cursor: pointer;
                font-size: 0.875rem;
                transition: all 0.2s;
                white-space: nowrap;
            }

            .report-tab.active {
                background: #6366f1;
                color: white;
            }

            .custom-date-range {
                display: flex;
                align-items: center;
                gap: 0.5rem;
                margin-bottom: 1rem;
                flex-wrap: wrap;
            }

            .custom-date-range input {
                flex: 1;
                min-width: 120px;
                padding: 0.5rem;
                border: 1px solid var(--border-color, #3a3a4d);
                border-radius: 8px;
                background: var(--bg-secondary, #2a2a3d);
                color: var(--text-primary, #fff);
            }

            .report-content {
                background: var(--bg-secondary, #2a2a3d);
                border-radius: 12px;
                padding: 1rem;
                min-height: 200px;
            }

            .report-summary-grid {
                display: grid;
                grid-template-columns: repeat(3, 1fr);
                gap: 0.75rem;
                margin-bottom: 1rem;
            }

            .summary-item {
                text-align: center;
                padding: 0.75rem;
                background: var(--card-bg, #1e1e2e);
                border-radius: 8px;
            }

            .summary-label {
                display: block;
                font-size: 0.75rem;
                color: var(--text-muted, #888);
                margin-bottom: 0.25rem;
            }

            .summary-value {
                font-size: 1rem;
                font-weight: 600;
            }

            .summary-value.highlight {
                color: #10b981;
                font-size: 1.125rem;
            }

            .report-section {
                margin-top: 1rem;
                padding-top: 1rem;
                border-top: 1px solid var(--border-color, #3a3a4d);
            }

            .report-section h4 {
                margin: 0 0 0.75rem 0;
                font-size: 0.875rem;
                color: var(--text-muted, #888);
            }

            .channel-bar-item {
                margin-bottom: 0.75rem;
            }

            .bar-info {
                display: flex;
                justify-content: space-between;
                font-size: 0.8rem;
                margin-bottom: 0.25rem;
            }

            .bar-track {
                height: 8px;
                background: var(--bg-primary, #1a1a2e);
                border-radius: 4px;
                overflow: hidden;
            }

            .bar-fill {
                height: 100%;
                border-radius: 4px;
                transition: width 0.3s ease;
            }

            .top-items-list {
                display: flex;
                flex-direction: column;
                gap: 0.5rem;
            }

            .top-item {
                display: flex;
                align-items: center;
                gap: 0.5rem;
                padding: 0.5rem;
                background: var(--card-bg, #1e1e2e);
                border-radius: 8px;
                font-size: 0.875rem;
            }

            .top-item .rank {
                width: 2rem;
                text-align: center;
                font-weight: 700;
                color: #f59e0b;
            }

            .top-item .name {
                flex: 1;
            }

            .top-item .qty {
                color: var(--text-muted, #888);
            }

            .top-item .revenue {
                font-weight: 600;
                color: #10b981;
            }

            .report-footer {
                margin-top: 1rem;
                padding-top: 0.75rem;
                border-top: 1px solid var(--border-color, #3a3a4d);
                text-align: center;
                color: var(--text-muted, #888);
            }

            .reports-modal-footer {
                display: flex;
                gap: 0.5rem;
                padding: 1rem;
                border-top: 1px solid var(--border-color, #3a3a4d);
            }

            .reports-modal-footer button {
                flex: 1;
                padding: 0.75rem;
                border: none;
                border-radius: 8px;
                cursor: pointer;
                font-weight: 600;
                transition: opacity 0.2s;
            }

            .reports-modal-footer button:hover {
                opacity: 0.9;
            }

            .btn-success {
                background: #10b981;
                color: white;
            }

            .btn-info {
                background: #6366f1;
                color: white;
            }

            .loading-placeholder {
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                padding: 2rem;
                color: var(--text-muted, #888);
            }

            .loading-spinner {
                width: 40px;
                height: 40px;
                border: 3px solid var(--border-color, #3a3a4d);
                border-top-color: #6366f1;
                border-radius: 50%;
                animation: spin 0.8s linear infinite;
                margin-bottom: 1rem;
            }

            @keyframes spin {
                to { transform: rotate(360deg); }
            }

            .no-data {
                text-align: center;
                color: var(--text-muted, #888);
                font-style: italic;
            }
        `;

        document.head.appendChild(styles);
    }
};

// Initialize on load
document.addEventListener('DOMContentLoaded', () => {
    ReportsManager.init();
});

// Export to window
window.ReportsManager = ReportsManager;
