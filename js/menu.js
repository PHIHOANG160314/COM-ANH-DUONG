/**
 * F&B Master - Menu Management
 * Author: Google DeepMind / Antigravity Team
 * Description: Master menu CRUD, daily menu planning, and Excel import/export.
 */

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

        // Sync to Supabase Realtime for customer pages
        if (typeof DailyMenuService !== 'undefined' && DailyMenuService.saveConfig) {
            const activeItemIds = this.dailyMenu
                .filter(item => item.available)
                .map(item => item.id);

            DailyMenuService.saveConfig(activeItemIds)
                .then(result => {
                    if (window.Debug && result.success) {
                        Debug.info('📡 Daily menu synced to realtime:', activeItemIds.length, 'items');
                    }
                })
                .catch(err => {
                    if (window.Debug) Debug.warn('Daily menu sync failed:', err);
                });
        }
    },

    setupEventListeners() {
        // Tab switching
        const tabs = document.querySelector('.menu-tabs');
        if (tabs) {
            tabs.addEventListener('change', (e) => {
                // md-tabs dispatches 'change' event when tab selection changes
                const tab = e.target.activeTab; // or look at e.target.selected depending on implementation version
                // The md-tabs component usually handles the selection state internally.
                // We need to find which tab is active.
                // The event target is the md-tabs element.
                // e.target.activeTabIndex is available

                // Let's rely on click events on the tabs themselves if propagation works,
                // OR check the tabs property.
                // Actually, the original code used buttons. Now we use md-primary-tab.
                // We can just listen to the tabs container.

                // Let's use the 'change' event on the tabs container.
                const activeTab = e.target.activeTab;
                if (activeTab) {
                    const type = activeTab.dataset.menuType;
                    document.querySelectorAll('.menu-section').forEach(s => s.classList.remove('active'));
                    document.getElementById(type === 'master' ? 'masterMenuSection' : 'dailyMenuSection').classList.add('active');
                }
            });

            // Fallback/Alternative: Attach click to tabs directly if 'change' isn't sufficient or complex
            document.querySelectorAll('.menu-tab').forEach(tab => {
                tab.addEventListener('click', (e) => {
                    // e.currentTarget is the md-primary-tab
                    // logic handled by change event usually, but just in case
                });
            });
        }

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
                    <md-icon-button onclick="MenuManagement.editItem('${item.id}')" title="Sửa"><md-icon>edit</md-icon></md-icon-button>
                    <md-icon-button onclick="MenuManagement.toggleActive('${item.id}')" title="${item.active ? 'Tạm ngưng' : 'Bật lại'}">
                        <md-icon>${item.active ? 'pause' : 'play_arrow'}</md-icon>
                    </md-icon-button>
                    <md-icon-button class="delete-btn" onclick="MenuManagement.deleteItem('${item.id}')" title="Xóa" style="color: var(--danger);">
                        <md-icon>delete</md-icon>
                    </md-icon-button>
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
                    <md-icon-button class="toggle-btn ${item.available ? 'on' : 'off'}" onclick="MenuManagement.toggleDailyAvailable('${item.id}')">
                        <md-icon>${item.available ? 'check_circle' : 'cancel'}</md-icon>
                    </md-icon-button>
                    <md-icon-button class="remove-btn" onclick="MenuManagement.removeFromDaily('${item.id}')">
                         <md-icon>delete</md-icon>
                    </md-icon-button>
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
            <div class="form-group"><md-outlined-text-field label="Tên món *" id="newItemName" placeholder="VD: Phở Bò"></md-outlined-text-field></div>
            <div class="form-group">
                <md-outlined-select id="newItemCategory" label="Loại">
                    <md-select-option value="food"><div slot="headline">Món chính</div></md-select-option>
                    <md-select-option value="drinks"><div slot="headline">Đồ uống</div></md-select-option>
                    <md-select-option value="dessert"><div slot="headline">Tráng miệng</div></md-select-option>
                </md-outlined-select>
            </div>
            <div class="form-group"><md-outlined-text-field label="Icon" id="newItemIcon" value="🍽️" maxlength="4"></md-outlined-text-field></div>
            <div class="form-group"><md-outlined-text-field label="Giá bán *" type="number" id="newItemPrice" placeholder="50000" min="0"></md-outlined-text-field></div>
            <div class="form-group"><md-outlined-text-field label="Giá vốn" type="number" id="newItemCost" placeholder="15000" min="0"></md-outlined-text-field></div>
        `, `
            <md-outlined-button onclick="modal.close()">Hủy</md-outlined-button>
            <md-filled-button onclick="MenuManagement.createItem()">Thêm món</md-filled-button>
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
            <div class="form-group"><md-outlined-text-field label="Tên món" id="editItemName" value="${item.name}"></md-outlined-text-field></div>
            <div class="form-group">
                <md-outlined-select id="editItemCategory" label="Loại">
                    <md-select-option value="food" ${item.category === 'food' ? 'selected' : ''}><div slot="headline">Món chính</div></md-select-option>
                    <md-select-option value="drinks" ${item.category === 'drinks' ? 'selected' : ''}><div slot="headline">Đồ uống</div></md-select-option>
                    <md-select-option value="dessert" ${item.category === 'dessert' ? 'selected' : ''}><div slot="headline">Tráng miệng</div></md-select-option>
                </md-outlined-select>
            </div>
            <div class="form-group"><md-outlined-text-field label="Icon" id="editItemIcon" value="${item.icon}" maxlength="4"></md-outlined-text-field></div>
            <div class="form-group"><md-outlined-text-field label="Giá bán" type="number" id="editItemPrice" value="${item.price}" min="0"></md-outlined-text-field></div>
            <div class="form-group"><md-outlined-text-field label="Giá vốn" type="number" id="editItemCost" value="${item.cost}" min="0"></md-outlined-text-field></div>
        `, `
            <md-outlined-button onclick="modal.close()">Hủy</md-outlined-button>
            <md-filled-button onclick="MenuManagement.saveItem('${itemId}')">Lưu</md-filled-button>
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
                <p style="color: var(--error); font-size: 0.85rem; margin-top: 1rem;">⚠️ Hành động này không thể hoàn tác!</p>
            </div>
        `, `
            <md-outlined-button onclick="modal.close()">Hủy</md-outlined-button>
            <md-filled-button style="--md-sys-color-primary: var(--error);" onclick="MenuManagement.confirmDelete('${itemId}')">🗑️ Xóa món</md-filled-button>
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
                <div style="margin-top: 1.5rem; background: var(--surface-container); padding: 1rem; border-radius: 8px;">
                    <p style="font-weight: 600; margin-bottom: 0.75rem;">📋 Ánh xạ cột (Column Mapping):</p>
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem;">
                        <div class="form-group" style="margin:0;">
                            <md-outlined-select label="Tên món" id="mapName">${columns.map(c => `<md-select-option value="${c}" ${c.toLowerCase().includes('tên') || c.toLowerCase().includes('name') ? 'selected' : ''}><div slot="headline">${c}</div></md-select-option>`).join('')}</md-outlined-select>
                        </div>
                        <div class="form-group" style="margin:0;">
                            <md-outlined-select label="Giá bán" id="mapPrice">${columns.map(c => `<md-select-option value="${c}" ${c.toLowerCase().includes('giá') || c.toLowerCase().includes('price') ? 'selected' : ''}><div slot="headline">${c}</div></md-select-option>`).join('')}</md-outlined-select>
                        </div>
                        <div class="form-group" style="margin:0;">
                            <md-outlined-select label="Giá vốn (tuỳ chọn)" id="mapCost"><md-select-option value=""><div slot="headline">-- Không --</div></md-select-option>${columns.map(c => `<md-select-option value="${c}" ${c.toLowerCase().includes('vốn') || c.toLowerCase().includes('cost') ? 'selected' : ''}><div slot="headline">${c}</div></md-select-option>`).join('')}</md-outlined-select>
                        </div>
                        <div class="form-group" style="margin:0;">
                            <md-outlined-select label="Loại (tuỳ chọn)" id="mapCategory"><md-select-option value=""><div slot="headline">-- Mặc định: Món chính --</div></md-select-option>${columns.map(c => `<md-select-option value="${c}" ${c.toLowerCase().includes('loại') || c.toLowerCase().includes('category') ? 'selected' : ''}><div slot="headline">${c}</div></md-select-option>`).join('')}</md-outlined-select>
                        </div>
                    </div>
                </div>
            </div>
        `, `
            <md-outlined-button onclick="modal.close()">Hủy</md-outlined-button>
            <md-filled-button onclick="MenuManagement.processExcelImport(${JSON.stringify(data).replace(/"/g, '&quot;')})">✅ Import ${data.length} món</md-filled-button>
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
    },

    // Download Template with Instructions
    downloadTemplate() {
        const wb = XLSX.utils.book_new();

        // Sheet 1: Data Template
        const templateData = [
            { 'Tên món': 'Cà Phê Đen Đá', 'Loại': 'Đồ uống', 'Giá bán': 20000, 'Giá vốn': 4000 },
            { 'Tên món': 'Cà Phê Sữa Đá', 'Loại': 'Đồ uống', 'Giá bán': 25000, 'Giá vốn': 6000 },
            { 'Tên món': 'Cơm Tấm Sườn', 'Loại': 'Món chính', 'Giá bán': 45000, 'Giá vốn': 15000 },
            { 'Tên món': 'Phở Bò', 'Loại': 'Món chính', 'Giá bán': 55000, 'Giá vốn': 18000 },
            { 'Tên món': 'Chè Thái', 'Loại': 'Tráng miệng', 'Giá bán': 25000, 'Giá vốn': 8000 }
        ];
        const wsData = XLSX.utils.json_to_sheet(templateData);
        wsData['!cols'] = [{ wch: 25 }, { wch: 15 }, { wch: 12 }, { wch: 12 }];
        XLSX.utils.book_append_sheet(wb, wsData, 'Menu Mau');

        // Sheet 2: Instructions
        const instructions = [
            ['📋 HƯỚNG DẪN IMPORT MENU'],
            [''],
            ['Bước 1: Chuẩn bị dữ liệu'],
            ['- Điền thông tin món ăn vào sheet "Menu Mau"'],
            ['- Bắt buộc: Cột "Tên món" và "Giá bán"'],
            ['- Tùy chọn: Cột "Loại" và "Giá vốn"'],
            [''],
            ['Bước 2: Kiểu dữ liệu'],
            ['- Tên món: Văn bản (VD: Cơm Tấm Sườn Bì Chả)'],
            ['- Loại: Một trong các giá trị: "Món chính", "Đồ uống", "Tráng miệng"'],
            ['- Giá bán: Số nguyên, chỉ nhập số (VD: 45000)'],
            ['- Giá vốn: Số nguyên, chỉ nhập số (VD: 15000)'],
            [''],
            ['Bước 3: Import'],
            ['- Vào Admin → Menu → Menu Tổng'],
            ['- Nhấn nút "📥 Import"'],
            ['- Chọn file Excel đã điền dữ liệu'],
            ['- Xác nhận ánh xạ cột (tự động nhận diện)'],
            ['- Nhấn "Import" để hoàn tất'],
            [''],
            ['⚠️ LƯU Ý:'],
            ['- Dữ liệu import sẽ THÊM VÀO menu hiện tại'],
            ['- Không ghi đè dữ liệu cũ'],
            ['- Kiểm tra kỹ trước khi import'],
            [''],
            ['✅ Liên hệ hỗ trợ: 0389 017 360']
        ];
        const wsInstructions = XLSX.utils.aoa_to_sheet(instructions);
        wsInstructions['!cols'] = [{ wch: 60 }];
        XLSX.utils.book_append_sheet(wb, wsInstructions, 'Huong Dan');

        XLSX.writeFile(wb, 'menu_template_huong_dan.xlsx');
        toast.success('📥 Đã tải file mẫu có hướng dẫn!');
    }
};

window.MenuManagement = MenuManagement;
