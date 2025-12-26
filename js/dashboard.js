// ========================================
// F&B MASTER - DASHBOARD MODULE
// ========================================

const Dashboard = {
    init() {
        this.renderKPIs();
        this.renderRecentOrders();
    },

    renderKPIs() {
        document.getElementById('totalRevenue').textContent =
            formatCurrency(dashboardData.revenue.today);
        document.getElementById('totalOrders').textContent =
            dashboardData.orders.today;
        document.getElementById('foodCostPercent').textContent =
            dashboardData.foodCostPercent + '%';

        // Count low stock items
        const lowStockCount = inventoryData.filter(item =>
            item.stock <= item.minStock
        ).length;
        document.getElementById('lowStockItems').textContent = lowStockCount;
    },

    renderRecentOrders() {
        const tbody = document.getElementById('recentOrdersBody');
        if (!tbody) return;
        tbody.innerHTML = '';

        sampleOrders.slice(0, 5).forEach(order => {
            const statusText = order.status === 'completed' ? 'Hoàn thành' :
                order.status === 'pending' ? 'Đang xử lý' : 'Đã hủy';

            const row = document.createElement('tr');
            row.innerHTML = `
                <td><strong>${order.id}</strong></td>
                <td>${order.table}</td>
                <td>${order.items}</td>
                <td>${formatCurrency(order.total)}</td>
                <td>${getStatusBadge(order.status, statusText)}</td>
                <td>${order.time}</td>
            `;
            tbody.appendChild(row);
        });
    },

    refresh() {
        this.renderKPIs();
        this.renderRecentOrders();
    }
};

window.Dashboard = Dashboard;
