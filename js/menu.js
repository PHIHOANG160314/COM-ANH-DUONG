// ========================================
// F&B MASTER - MENU MANAGEMENT MODULE
// ========================================

// Store original menu data ONCE at load time to prevent circular reference
const ORIGINAL_MENU_DATA = (typeof menuItems !== 'undefined') ? [...menuItems] : [];

const MenuManagement = {
    masterMenu: [],
    dailyMenu: [],
    selectedItems: [],

    init() {
        if (window.Debug) Debug.log('MenuManagement.init() called');
        this.loadData();
        this.render();
        this.setupEventListeners();
        this.updateTodayDate();
    },

    loadData() {
        if (window.Debug) Debug.log('Loading Menu Data...', 'Original items:', ORIGINAL_MENU_DATA.length);

        if (ORIGINAL_MENU_DATA.length === 0) {
            console.error('CRITICAL: No menu data found!');
            return;
        }

        // Load master menu from localStorage
        let savedMaster = storage.get('master_menu');

        // Integrity Check
        const isValid = (data) => Array.isArray(data) && data.length > 0 && data[0] && data[0].name;

        // Decide whether to reset
        if (!savedMaster || !isValid(savedMaster) || savedMaster.length < ORIGINAL_MENU_DATA.length) {
            if (window.Debug) Debug.log('Resetting menu data...');
            this.forceResetMenu();
        } else {
            this.masterMenu = savedMaster;
            if (window.Debug) Debug.info('Loaded', this.masterMenu.length, 'items from storage');
        }

        // Load daily menu
        const today = this.getTodayKey();
        const savedDaily = storage.get('daily_menu_' + today);
        if (savedDaily && isValid(savedDaily)) {
            this.dailyMenu = savedDaily;
        } else {
            this.dailyMenu = this.masterMenu.filter(item => item.active).map(item => ({
                ...item,
                available: true
            }));
            this.saveDailyMenu();
        }
    },

    // Force reset using ORIGINAL data (not window.menuItems which can be overwritten)
    forceResetMenu() {
        this.masterMenu = ORIGINAL_MENU_DATA.map((item, index) => ({
            id: 'M' + String(index + 1).padStart(3, '0'),
            name: item.name || 'Món',
            category: item.category || 'food',
            price: Number(item.price) || 0,
            cost: Number(item.cost) || 0,
            icon: item.icon || '🍽️',
            active: true
        }));
        this.saveMasterMenu();
        if (window.Debug) Debug.info('Force reset complete:', this.masterMenu.length, 'items');
    },

    getTodayKey() {
        return new Date().toISOString().split('T')[0];
    },

    getYesterdayKey() {
        const d = new Date();
        d.setDate(d.getDate() - 1);
        return d.toISOString().split('T')[0];
    },

    updateTodayDate() {
        const el = document.getElementById('todayDate');
        if (el) {
            const options = { weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric' };
            el.textContent = new Date().toLocaleDateString('vi-VN', options);
        }
    },

    saveMasterMenu() {
        if (!this.masterMenu || this.masterMenu.length === 0) return;
        storage.set('master_menu', this.masterMenu);
    },

    saveDailyMenu() {
        storage.set('daily_menu_' + this.getTodayKey(), this.dailyMenu);
    },

    setupEventListeners() {
        // Tab switching
        document.querySelectorAll('.menu-tab').forEach(tab => {
            tab.addEventListener('click', (e) => {
                document.querySelectorAll('.menu-tab').forEach(t => t.classList.remove('active'));
                e.target.classList.add('active');
                const type = e.target.dataset.menuType;
                document.querySelectorAll('.menu-section').forEach(s => s.classList.remove('active'));
                document.getElementById(type === 'master' ? 'masterMenuSection' : 'dailyMenuSection').classList.add('active');
            });
        });

        // Button listeners
        const addBtn = document.getElementById('addMenuItemBtn');
        if (addBtn) addBtn.addEventListener('click', () => this.showAddItemModal());

        const addToDailyBtn = document.getElementById('addToDailyBtn');
        if (addToDailyBtn) addToDailyBtn.addEventListener('click', () => this.addSelectedToDaily());

        const clearDailyBtn = document.getElementById('clearDailyBtn');
        if (clearDailyBtn) clearDailyBtn.addEventListener('click', () => this.clearDailyMenu());

        const copyBtn = document.getElementById('copyYesterdayBtn');
        if (copyBtn) copyBtn.addEventListener('click', () => this.copyFromYesterday());

        const resetBtn = document.getElementById('resetMenuBtn');
        if (resetBtn) resetBtn.addEventListener('click', () => this.resetMenuData());

        // Excel Import
        const importBtn = document.getElementById('importExcelBtn');
        const fileInput = document.getElementById('excelFileInput');
        if (importBtn && fileInput) {
            importBtn.addEventListener('click', () => fileInput.click());
            fileInput.addEventListener('change', (e) => this.handleExcelImport(e));
        }

        // Excel Export
        const exportBtn = document.getElementById('exportExcelBtn');
        if (exportBtn) exportBtn.addEventListener('click', () => this.exportToExcel());
    },

    render() {
        this.renderMasterMenu();
        this.renderDailyMenu();
    },

    renderMasterMenu() {
        const tbody = document.getElementById('masterMenuBody');
        if (!tbody) {
            console.error('masterMenuBody not found!');
            return;
        }
        tbody.innerHTML = '';

        const categoryNames = { food: 'Món chính', drinks: 'Đồ uống', dessert: 'Tráng miệng' };

        if (!this.masterMenu || this.masterMenu.length === 0) {
            tbody.innerHTML = '<tr><td colspan="8" style="text-align:center;padding:2rem;">Không có dữ liệu menu. Nhấn "Nạp Menu Mẫu".</td></tr>';
            return;
        }

        this.masterMenu.forEach(item => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td><input type="checkbox" class="menu-checkbox" data-id="${item.id}" ${this.selectedItems.includes(item.id) ? 'checked' : ''}></td>
                <td><strong>${item.id}</strong></td>
                <td>${item.icon || '🍽️'} ${item.name}</td>
                <td>${categoryNames[item.category] || item.category}</td>
                <td><strong>${formatCurrency(item.price || 0)}</strong></td>
                <td style="color:var(--text-muted);">${formatCurrency(item.cost || 0)}</td>
                <td>${item.active ? '<span class="status-badge ok">Đang bán</span>' : '<span class="status-badge low">Tạm ngưng</span>'}</td>
                <td>
                    <button class="action-btn" onclick="MenuManagement.editItem('${item.id}')" title="Sửa">✏️</button>
                    <button class="action-btn" onclick="MenuManagement.toggleActive('${item.id}')" title="${item.active ? 'Tạm ngưng' : 'Bật lại'}">${item.active ? '⏸️' : '▶️'}</button>
                    <button class="action-btn delete-btn" onclick="MenuManagement.deleteItem('${item.id}')" title="Xóa">🗑️</button>
                </td>
            `;
            row.querySelector('.menu-checkbox').addEventListener('change', (e) => {
                if (e.target.checked) {
                    this.selectedItems.push(item.id);
                } else {
                    this.selectedItems = this.selectedItems.filter(id => id !== item.id);
                }
            });
            tbody.appendChild(row);
        });
    },

    renderDailyMenu() {
        const grid = document.getElementById('dailyMenuGrid');
        if (!grid) return;
        grid.innerHTML = '';

        if (this.dailyMenu.length === 0) {
            grid.innerHTML = '<div class="empty-column" style="grid-column:1/-1;">Chưa có món nào trong menu hôm nay</div>';
            const countEl = document.getElementById('dailyMenuCount');
            if (countEl) countEl.textContent = '0';
            return;
        }

        this.dailyMenu.forEach(item => {
            const card = document.createElement('div');
            card.className = `daily-menu-card ${item.available ? '' : 'unavailable'}`;
            card.innerHTML = `
                <div class="daily-menu-icon">${item.icon}</div>
                <div class="daily-menu-info">
                    <div class="daily-menu-name">${item.name}</div>
                    <div class="daily-menu-price">${formatCurrency(item.price)}</div>
                </div>
                <div class="daily-menu-actions">
                    <button class="toggle-btn ${item.available ? 'on' : 'off'}" onclick="MenuManagement.toggleDailyAvailable('${item.id}')">${item.available ? '✓' : '✕'}</button>
                    <button class="remove-btn" onclick="MenuManagement.removeFromDaily('${item.id}')">🗑️</button>
                </div>
            `;
            grid.appendChild(card);
        });

        const countEl = document.getElementById('dailyMenuCount');
        if (countEl) countEl.textContent = this.dailyMenu.filter(i => i.available).length;
    },

    // User-triggered reset (with confirmation)
    resetMenuData() {
        if (confirm('Bạn có chắc chắn muốn KHÔI PHỤC menu mẫu không?')) {
            this.forceResetMenu();
            this.render();
            toast.success(`Đã khôi phục ${this.masterMenu.length} món mẫu!`);
        }
    },

    showAddItemModal() {
        modal.open('Thêm món mới', `
            <div class="form-group"><label>Tên món *</label><input type="text" id="newItemName" placeholder="VD: Phở Bò"></div>
            <div class="form-group"><label>Loại</label><select id="newItemCategory"><option value="food">Món chính</option><option value="drinks">Đồ uống</option><option value="dessert">Tráng miệng</option></select></div>
            <div class="form-group"><label>Icon</label><input type="text" id="newItemIcon" value="🍽️" maxlength="4"></div>
            <div class="form-group"><label>Giá bán *</label><input type="number" id="newItemPrice" placeholder="50000" min="0"></div>
            <div class="form-group"><label>Giá vốn</label><input type="number" id="newItemCost" placeholder="15000" min="0"></div>
        `, `
            <button class="btn-secondary" onclick="modal.close()">Hủy</button>
            <button class="btn-primary" onclick="MenuManagement.createItem()">Thêm món</button>
        `);
    },

    createItem() {
        const name = document.getElementById('newItemName').value.trim();
        const category = document.getElementById('newItemCategory').value;
        const icon = document.getElementById('newItemIcon').value || '🍽️';
        const price = parseInt(document.getElementById('newItemPrice').value) || 0;
        const cost = parseInt(document.getElementById('newItemCost').value) || 0;

        if (!name || !price) {
            toast.warning('Vui lòng nhập tên món và giá bán');
            return;
        }

        const newItem = {
            id: 'M' + String(this.masterMenu.length + 1).padStart(3, '0'),
            name, category, icon, price, cost, active: true
        };

        this.masterMenu.push(newItem);
        this.saveMasterMenu();
        this.render();
        modal.close();
        toast.success(`Đã thêm món "${name}"`);
    },

    editItem(itemId) {
        const item = this.masterMenu.find(i => i.id === itemId);
        if (!item) return;

        modal.open('Sửa món - ' + item.name, `
            <div class="form-group"><label>Tên món</label><input type="text" id="editItemName" value="${item.name}"></div>
            <div class="form-group"><label>Loại</label><select id="editItemCategory"><option value="food" ${item.category === 'food' ? 'selected' : ''}>Món chính</option><option value="drinks" ${item.category === 'drinks' ? 'selected' : ''}>Đồ uống</option><option value="dessert" ${item.category === 'dessert' ? 'selected' : ''}>Tráng miệng</option></select></div>
            <div class="form-group"><label>Icon</label><input type="text" id="editItemIcon" value="${item.icon}" maxlength="4"></div>
            <div class="form-group"><label>Giá bán</label><input type="number" id="editItemPrice" value="${item.price}" min="0"></div>
            <div class="form-group"><label>Giá vốn</label><input type="number" id="editItemCost" value="${item.cost}" min="0"></div>
        `, `
            <button class="btn-secondary" onclick="modal.close()">Hủy</button>
            <button class="btn-primary" onclick="MenuManagement.saveItem('${itemId}')">Lưu</button>
        `);
    },

    saveItem(itemId) {
        const item = this.masterMenu.find(i => i.id === itemId);
        if (!item) return;

        item.name = document.getElementById('editItemName').value.trim() || item.name;
        item.category = document.getElementById('editItemCategory').value;
        item.icon = document.getElementById('editItemIcon').value || item.icon;
        item.price = parseInt(document.getElementById('editItemPrice').value) || item.price;
        item.cost = parseInt(document.getElementById('editItemCost').value) || item.cost;

        this.saveMasterMenu();
        this.render();

        const dailyItem = this.dailyMenu.find(i => i.id === itemId);
        if (dailyItem) {
            Object.assign(dailyItem, item);
            this.saveDailyMenu();
        }

        modal.close();
        toast.success('Đã cập nhật món');
    },

    toggleActive(itemId) {
        const item = this.masterMenu.find(i => i.id === itemId);
        if (item) {
            item.active = !item.active;
            this.saveMasterMenu();
            this.render();
            toast.info(item.active ? `"${item.name}" đã bật bán` : `"${item.name}" đã tạm ngưng`);
        }
    },

    deleteItem(itemId) {
        const item = this.masterMenu.find(i => i.id === itemId);
        if (!item) return;

        modal.open('Xác nhận xóa', `
            <div style="text-align:center; padding: 1rem;">
                <p style="font-size: 3rem; margin-bottom: 1rem;">${item.icon}</p>
                <p style="font-size: 1.1rem; margin-bottom: 0.5rem;"><strong>${item.name}</strong></p>
                <p style="color: var(--text-muted);">Bạn có chắc muốn xóa món này khỏi menu?</p>
                <p style="color: var(--danger); font-size: 0.85rem; margin-top: 1rem;">⚠️ Hành động này không thể hoàn tác!</p>
            </div>
        `, `
            <button class="btn-secondary" onclick="modal.close()">Hủy</button>
            <button class="btn-danger" onclick="MenuManagement.confirmDelete('${itemId}')">🗑️ Xóa món</button>
        `);
    },

    confirmDelete(itemId) {
        const item = this.masterMenu.find(i => i.id === itemId);
        if (!item) return;

        const itemName = item.name;

        // Remove from master menu
        this.masterMenu = this.masterMenu.filter(i => i.id !== itemId);
        this.saveMasterMenu();

        // Also remove from daily menu if exists
        this.dailyMenu = this.dailyMenu.filter(i => i.id !== itemId);
        this.saveDailyMenu();

        // Remove from selected items
        this.selectedItems = this.selectedItems.filter(id => id !== itemId);

        this.render();
        modal.close();
        toast.success(`Đã xóa món "${itemName}" khỏi menu`);
    },

    addSelectedToDaily() {
        if (this.selectedItems.length === 0) {
            toast.warning('Vui lòng chọn món để thêm');
            return;
        }

        let addedCount = 0;
        this.selectedItems.forEach(itemId => {
            const item = this.masterMenu.find(i => i.id === itemId);
            if (item && !this.dailyMenu.find(d => d.id === itemId)) {
                this.dailyMenu.push({ ...item, available: true });
                addedCount++;
            }
        });

        this.saveDailyMenu();
        this.selectedItems = [];
        this.render();
        toast.success(addedCount > 0 ? `Đã thêm ${addedCount} món vào menu ngày` : 'Các món đã có trong menu ngày');
    },

    toggleDailyAvailable(itemId) {
        const item = this.dailyMenu.find(i => i.id === itemId);
        if (item) {
            item.available = !item.available;
            this.saveDailyMenu();
            this.renderDailyMenu();
        }
    },

    removeFromDaily(itemId) {
        this.dailyMenu = this.dailyMenu.filter(i => i.id !== itemId);
        this.saveDailyMenu();
        this.renderDailyMenu();
        toast.info('Đã xóa khỏi menu ngày');
    },

    clearDailyMenu() {
        if (confirm('Xóa tất cả món khỏi menu hôm nay?')) {
            this.dailyMenu = [];
            this.saveDailyMenu();
            this.renderDailyMenu();
            toast.info('Đã xóa menu ngày');
        }
    },

    copyFromYesterday() {
        const yesterdayMenu = storage.get('daily_menu_' + this.getYesterdayKey());
        if (yesterdayMenu && yesterdayMenu.length > 0) {
            this.dailyMenu = yesterdayMenu.map(item => ({ ...item, available: true }));
            this.saveDailyMenu();
            this.renderDailyMenu();
            toast.success(`Đã copy ${yesterdayMenu.length} món từ hôm qua`);
        } else {
            toast.warning('Không tìm thấy menu hôm qua');
        }
    },

    getDailyMenuItems() {
        return this.dailyMenu.filter(item => item.available);
    },

    // Excel Import Feature
    handleExcelImport(event) {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = new Uint8Array(e.target.result);
                const workbook = XLSX.read(data, { type: 'array' });
                const sheetName = workbook.SheetNames[0];
                const sheet = workbook.Sheets[sheetName];
                const jsonData = XLSX.utils.sheet_to_json(sheet);

                if (jsonData.length === 0) {
                    toast.error('File Excel không có dữ liệu!');
                    return;
                }

                // Show preview modal
                this.showImportPreview(jsonData);
            } catch (error) {
                console.error('Excel import error:', error);
                toast.error('Lỗi đọc file Excel!');
            }
        };
        reader.readAsArrayBuffer(file);
        event.target.value = ''; // Reset input
    },

    showImportPreview(data) {
        const columns = Object.keys(data[0]);
        const preview = data.slice(0, 5);

        modal.open('📥 Import Menu từ Excel', `
            <div style="max-height: 400px; overflow-y: auto;">
                <p style="margin-bottom: 1rem; color: var(--text-secondary);">
                    Tìm thấy <strong>${data.length}</strong> dòng dữ liệu. Xem trước 5 dòng đầu:
                </p>
                <table class="data-table" style="font-size: 0.8rem;">
                    <thead><tr>${columns.map(c => `<th>${c}</th>`).join('')}</tr></thead>
                    <tbody>
                        ${preview.map(row => `<tr>${columns.map(c => `<td>${row[c] || ''}</td>`).join('')}</tr>`).join('')}
                    </tbody>
                </table>
                <div style="margin-top: 1.5rem; background: var(--bg-input); padding: 1rem; border-radius: 8px;">
                    <p style="font-weight: 600; margin-bottom: 0.75rem;">📋 Ánh xạ cột (Column Mapping):</p>
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem;">
                        <div class="form-group" style="margin:0;">
                            <label style="font-size: 0.8rem;">Tên món</label>
                            <select id="mapName">${columns.map(c => `<option value="${c}" ${c.toLowerCase().includes('tên') || c.toLowerCase().includes('name') ? 'selected' : ''}>${c}</option>`).join('')}</select>
                        </div>
                        <div class="form-group" style="margin:0;">
                            <label style="font-size: 0.8rem;">Giá bán</label>
                            <select id="mapPrice">${columns.map(c => `<option value="${c}" ${c.toLowerCase().includes('giá') || c.toLowerCase().includes('price') ? 'selected' : ''}>${c}</option>`).join('')}</select>
                        </div>
                        <div class="form-group" style="margin:0;">
                            <label style="font-size: 0.8rem;">Giá vốn (tuỳ chọn)</label>
                            <select id="mapCost"><option value="">-- Không --</option>${columns.map(c => `<option value="${c}" ${c.toLowerCase().includes('vốn') || c.toLowerCase().includes('cost') ? 'selected' : ''}>${c}</option>`).join('')}</select>
                        </div>
                        <div class="form-group" style="margin:0;">
                            <label style="font-size: 0.8rem;">Loại (tuỳ chọn)</label>
                            <select id="mapCategory"><option value="">-- Mặc định: Món chính --</option>${columns.map(c => `<option value="${c}" ${c.toLowerCase().includes('loại') || c.toLowerCase().includes('category') ? 'selected' : ''}>${c}</option>`).join('')}</select>
                        </div>
                    </div>
                </div>
            </div>
        `, `
            <button class="btn-secondary" onclick="modal.close()">Hủy</button>
            <button class="btn-primary" onclick="MenuManagement.processExcelImport(${JSON.stringify(data).replace(/"/g, '&quot;')})">✅ Import ${data.length} món</button>
        `);
    },

    processExcelImport(data) {
        const nameCol = document.getElementById('mapName').value;
        const priceCol = document.getElementById('mapPrice').value;
        const costCol = document.getElementById('mapCost').value;
        const categoryCol = document.getElementById('mapCategory').value;

        const categoryMap = {
            'đồ uống': 'drinks', 'drink': 'drinks', 'drinks': 'drinks', 'nước': 'drinks',
            'tráng miệng': 'dessert', 'dessert': 'dessert', 'món tráng': 'dessert',
            'món chính': 'food', 'food': 'food', 'main': 'food'
        };

        let importedCount = 0;
        const startId = this.masterMenu.length + 1;

        data.forEach((row, index) => {
            const name = row[nameCol];
            if (!name) return;

            const price = parseInt(String(row[priceCol]).replace(/[^\d]/g, '')) || 0;
            const cost = costCol ? parseInt(String(row[costCol]).replace(/[^\d]/g, '')) || 0 : 0;

            let category = 'food';
            if (categoryCol && row[categoryCol]) {
                const cat = String(row[categoryCol]).toLowerCase().trim();
                category = categoryMap[cat] || 'food';
            }

            const newItem = {
                id: 'M' + String(startId + index).padStart(3, '0'),
                name: String(name).trim(),
                category,
                icon: category === 'drinks' ? '🥤' : category === 'dessert' ? '🍰' : '🍽️',
                price,
                cost,
                active: true
            };

            this.masterMenu.push(newItem);
            importedCount++;
        });

        this.saveMasterMenu();
        this.render();
        modal.close();
        toast.success(`✅ Đã import ${importedCount} món vào menu!`);
    },

    // Export to Excel
    exportToExcel() {
        if (this.masterMenu.length === 0) {
            toast.warning('Không có dữ liệu menu để xuất!');
            return;
        }

        const categoryNames = { food: 'Món chính', drinks: 'Đồ uống', dessert: 'Tráng miệng' };

        const data = this.masterMenu.map(item => ({
            'Mã': item.id,
            'Tên món': item.name,
            'Loại': categoryNames[item.category] || item.category,
            'Giá bán': item.price,
            'Giá vốn': item.cost || 0,
            'Trạng thái': item.active ? 'Đang bán' : 'Tạm ngưng'
        }));

        const ws = XLSX.utils.json_to_sheet(data);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Menu');

        // Set column widths
        ws['!cols'] = [
            { wch: 8 }, { wch: 30 }, { wch: 15 }, { wch: 12 }, { wch: 12 }, { wch: 12 }
        ];

        const today = new Date().toISOString().slice(0, 10);
        XLSX.writeFile(wb, `menu_${today}.xlsx`);
        toast.success(`📤 Đã xuất ${data.length} món ra file Excel!`);
    }
};

window.MenuManagement = MenuManagement;
