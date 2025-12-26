// ========================================
// F&B MASTER - TABLE MANAGEMENT MODULE
// ========================================

const TableManagement = {
    tables: [],

    init() {
        this.loadTables();
        this.render();
        this.setupEventListeners();
    },

    loadTables() {
        const saved = localStorage.getItem('fb_tables');
        if (saved) {
            this.tables = JSON.parse(saved);
        } else {
            // Default 12 tables
            this.tables = Array.from({ length: 12 }, (_, i) => ({
                id: i + 1,
                name: `Bàn ${i + 1}`,
                seats: i < 4 ? 2 : i < 8 ? 4 : 6,
                status: 'available', // available, occupied, reserved, cleaning
                order: null,
                customerName: ''
            }));
            this.saveTables();
        }
    },

    saveTables() {
        localStorage.setItem('fb_tables', JSON.stringify(this.tables));
    },

    render() {
        const container = document.getElementById('tablesGrid');
        if (!container) return;

        container.innerHTML = this.tables.map(table => `
            <div class="table-card ${table.status}" onclick="TableManagement.selectTable(${table.id})">
                <div class="table-icon">${this.getTableIcon(table.seats)}</div>
                <div class="table-name">${table.name}</div>
                <div class="table-seats">${table.seats} chỗ</div>
                <div class="table-status">${this.getStatusText(table.status)}</div>
                ${table.customerName ? `<div class="table-customer">${table.customerName}</div>` : ''}
            </div>
        `).join('');

        // Update stats
        const stats = {
            total: this.tables.length,
            available: this.tables.filter(t => t.status === 'available').length,
            occupied: this.tables.filter(t => t.status === 'occupied').length,
            reserved: this.tables.filter(t => t.status === 'reserved').length
        };

        const statsEl = document.getElementById('tableStats');
        if (statsEl) {
            statsEl.innerHTML = `
                <span class="stat">Tổng: <strong>${stats.total}</strong></span>
                <span class="stat available">Trống: <strong>${stats.available}</strong></span>
                <span class="stat occupied">Đang dùng: <strong>${stats.occupied}</strong></span>
                <span class="stat reserved">Đặt trước: <strong>${stats.reserved}</strong></span>
            `;
        }
    },

    getTableIcon(seats) {
        if (seats <= 2) return '🪑';
        if (seats <= 4) return '🍽️';
        return '🛋️';
    },

    getStatusText(status) {
        const texts = {
            available: '✅ Trống',
            occupied: '🔴 Đang dùng',
            reserved: '📅 Đặt trước',
            cleaning: '🧹 Dọn dẹp'
        };
        return texts[status] || status;
    },

    setupEventListeners() {
        const addBtn = document.getElementById('addTableBtn');
        if (addBtn) addBtn.addEventListener('click', () => this.addTable());
    },

    selectTable(id) {
        const table = this.tables.find(t => t.id === id);
        if (!table) return;

        modal.open(`${table.name} - ${this.getStatusText(table.status)}`, `
            <div class="table-modal">
                <div class="table-modal-icon">${this.getTableIcon(table.seats)}</div>
                
                <div class="form-group">
                    <label>Tên bàn:</label>
                    <input type="text" id="tableNameEdit" value="${table.name}" placeholder="Bàn 1">
                </div>
                
                <div class="form-group">
                    <label>Số chỗ ngồi:</label>
                    <select id="tableSeatsEdit">
                        <option value="2" ${table.seats === 2 ? 'selected' : ''}>2 chỗ</option>
                        <option value="4" ${table.seats === 4 ? 'selected' : ''}>4 chỗ</option>
                        <option value="6" ${table.seats === 6 ? 'selected' : ''}>6 chỗ</option>
                        <option value="8" ${table.seats === 8 ? 'selected' : ''}>8 chỗ</option>
                        <option value="10" ${table.seats === 10 ? 'selected' : ''}>10 chỗ</option>
                    </select>
                </div>
                
                <div class="form-group">
                    <label>Trạng thái:</label>
                    <select id="tableStatusSelect">
                        <option value="available" ${table.status === 'available' ? 'selected' : ''}>✅ Trống</option>
                        <option value="occupied" ${table.status === 'occupied' ? 'selected' : ''}>🔴 Đang dùng</option>
                        <option value="reserved" ${table.status === 'reserved' ? 'selected' : ''}>📅 Đặt trước</option>
                        <option value="cleaning" ${table.status === 'cleaning' ? 'selected' : ''}>🧹 Dọn dẹp</option>
                    </select>
                </div>
                
                <div class="form-group">
                    <label>Tên khách (nếu có):</label>
                    <input type="text" id="tableCustomerName" value="${table.customerName || ''}" placeholder="Nhập tên khách...">
                </div>
            </div>
        `, `
            <button class="btn-danger" onclick="TableManagement.deleteTable(${id})" style="margin-right:auto;">🗑️ Xóa bàn</button>
            <button class="btn-secondary" onclick="modal.close()">Đóng</button>
            <button class="btn-primary" onclick="TableManagement.updateTable(${id})">💾 Lưu</button>
        `);
    },

    updateTable(id) {
        const table = this.tables.find(t => t.id === id);
        if (!table) return;

        table.name = document.getElementById('tableNameEdit').value.trim() || table.name;
        table.seats = parseInt(document.getElementById('tableSeatsEdit').value) || table.seats;
        table.status = document.getElementById('tableStatusSelect').value;
        table.customerName = document.getElementById('tableCustomerName').value.trim();

        this.saveTables();
        this.render();
        modal.close();
        toast.success(`Đã cập nhật ${table.name}`);
    },

    deleteTable(id) {
        const table = this.tables.find(t => t.id === id);
        if (!table) return;

        if (confirm(`Bạn có chắc muốn xóa "${table.name}"?`)) {
            this.tables = this.tables.filter(t => t.id !== id);
            this.saveTables();
            this.render();
            modal.close();
            toast.success(`Đã xóa ${table.name}`);
        }
    },

    addTable() {
        modal.open('➕ Thêm Bàn Mới', `
            <div class="form-group">
                <label>Tên bàn:</label>
                <input type="text" id="newTableName" placeholder="Bàn ${this.tables.length + 1}">
            </div>
            <div class="form-group">
                <label>Số chỗ ngồi:</label>
                <select id="newTableSeats">
                    <option value="2">2 chỗ</option>
                    <option value="4" selected>4 chỗ</option>
                    <option value="6">6 chỗ</option>
                    <option value="8">8 chỗ</option>
                    <option value="10">10 chỗ</option>
                </select>
            </div>
        `, `
            <button class="btn-secondary" onclick="modal.close()">Hủy</button>
            <button class="btn-primary" onclick="TableManagement.confirmAddTable()">✅ Thêm</button>
        `);
    },

    confirmAddTable() {
        const newId = Math.max(0, ...this.tables.map(t => t.id)) + 1;
        const name = document.getElementById('newTableName').value.trim() || `Bàn ${newId}`;
        const seats = parseInt(document.getElementById('newTableSeats').value) || 4;

        this.tables.push({
            id: newId,
            name: name,
            seats: seats,
            status: 'available',
            order: null,
            customerName: ''
        });
        this.saveTables();
        this.render();
        modal.close();
        toast.success(`Đã thêm ${name}`);
    }
};

window.TableManagement = TableManagement;
