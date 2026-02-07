// ========================================
// F&B MASTER - INVENTORY MODULE
// ========================================

const Inventory = {
    data: [...inventoryData],

    init() {
        this.render();
        this.setupEventListeners();
    },

    setupEventListeners() {
        document.getElementById('inventoryCategory').addEventListener('change', () => this.filter());
        document.getElementById('inventoryStatus').addEventListener('change', () => this.filter());
        document.getElementById('addInventoryBtn').addEventListener('click', () => this.showAddModal());
        document.getElementById('exportInventoryBtn').addEventListener('click', () => this.exportData());
    },

    filter() {
        const category = document.getElementById('inventoryCategory').value;
        const status = document.getElementById('inventoryStatus').value;

        let filtered = [...inventoryData];

        if (category) {
            filtered = filtered.filter(item => item.category === category);
        }

        if (status) {
            filtered = filtered.filter(item => {
                const itemStatus = getInventoryStatus(item.stock, item.minStock);
                if (status === 'low') return itemStatus === 'low' || itemStatus === 'warning';
                return itemStatus === status;
            });
        }

        this.data = filtered;
        this.render();
    },

    render() {
        const tbody = document.getElementById('inventoryBody');
        tbody.innerHTML = '';

        this.data.forEach(item => {
            const status = getInventoryStatus(item.stock, item.minStock);
            const statusText = status === 'low' ? 'Sắp hết' :
                status === 'warning' ? 'Cần bổ sung' :
                    status === 'excess' ? 'Dư thừa' : 'Đủ dùng';

            const categoryNames = {
                meat: 'Thịt',
                seafood: 'Hải sản',
                vegetables: 'Rau củ',
                spices: 'Gia vị',
                drinks: 'Đồ uống'
            };

            const row = document.createElement('tr');
            row.innerHTML = `
                <td><strong>${item.id}</strong></td>
                <td>${item.name}</td>
                <td>${categoryNames[item.category] || item.category}</td>
                <td><strong>${formatNumber(item.stock)}</strong></td>
                <td>${item.unit}</td>
                <td>${formatNumber(item.minStock)}</td>
                <td>${getStatusBadge(status === 'warning' ? 'low' : status, statusText)}</td>
                <td>
                    <md-filled-tonal-button class="action-btn" onclick="Inventory.addStock('${item.id}')">+ Nhập</md-filled-tonal-button>
                    <md-outlined-button class="action-btn" onclick="Inventory.reduceStock('${item.id}')">- Xuất</md-outlined-button>
                </td>
            `;
            tbody.appendChild(row);
        });
    },

    showAddModal() {
        modal.open('Nhập kho', `
            <div class="form-group">
                <md-outlined-select label="Chọn nguyên liệu" id="modalItem">
                    ${inventoryData.map(item =>
            `<md-select-option value="${item.id}"><div slot="headline">${item.name} (${item.unit})</div></md-select-option>`
        ).join('')}
                </md-outlined-select>
            </div>
            <div class="form-group">
                <md-outlined-text-field label="Số lượng nhập" type="number" id="modalAmount" min="1" value="10"></md-outlined-text-field>
            </div>
            <div class="form-group">
                <md-outlined-text-field label="Ghi chú" id="modalNote" placeholder="VD: Nhập từ NCC ABC"></md-outlined-text-field>
            </div>
        `, `
            <md-outlined-button onclick="modal.close()">Hủy</md-outlined-button>
            <md-filled-button onclick="Inventory.confirmAddStock()">Xác nhận</md-filled-button>
        `);
    },

    confirmAddStock() {
        const itemId = document.getElementById('modalItem').value;
        const amount = parseInt(document.getElementById('modalAmount').value) || 0;

        if (amount <= 0) {
            toast.warning('Vui lòng nhập số lượng hợp lệ');
            return;
        }

        const item = inventoryData.find(i => i.id === itemId);
        if (item) {
            item.stock += amount;
            modal.close();
            this.filter();
            toast.success(`Đã nhập ${amount} ${item.unit} ${item.name}`);
            Dashboard.renderKPIs();
        }
    },

    addStock(itemId) {
        const item = inventoryData.find(i => i.id === itemId);
        if (item) {
            const amount = prompt(`Nhập số lượng ${item.name} (${item.unit}):`, '10');
            if (amount && !isNaN(amount) && parseInt(amount) > 0) {
                item.stock += parseInt(amount);
                this.filter();
                toast.success(`Đã nhập ${amount} ${item.unit} ${item.name}`);
                Dashboard.renderKPIs();
            }
        }
    },

    reduceStock(itemId) {
        const item = inventoryData.find(i => i.id === itemId);
        if (item) {
            const amount = prompt(`Xuất số lượng ${item.name} (${item.unit}):`, '5');
            if (amount && !isNaN(amount) && parseInt(amount) > 0) {
                const reduceAmount = parseInt(amount);
                if (reduceAmount > item.stock) {
                    toast.error('Số lượng xuất vượt quá tồn kho');
                    return;
                }
                item.stock -= reduceAmount;
                this.filter();
                toast.success(`Đã xuất ${amount} ${item.unit} ${item.name}`);
                Dashboard.renderKPIs();
            }
        }
    },

    exportData() {
        let csv = 'Mã NVL,Tên,Nhóm,Tồn kho,Đơn vị,Định mức tối thiểu,Đơn giá\n';
        inventoryData.forEach(item => {
            csv += `${item.id},${item.name},${item.category},${item.stock},${item.unit},${item.minStock},${item.price}\n`;
        });

        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `inventory_${new Date().toISOString().split('T')[0]}.csv`;
        link.click();

        toast.success('Đã xuất file CSV');
    }
};

window.Inventory = Inventory;
