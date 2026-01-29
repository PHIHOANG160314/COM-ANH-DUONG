/**
 * F&B Master - Daily Menu Manager
 * Author: Google DeepMind / Antigravity Team
 * Description: Management logic for daily menu selection and synchronization.
 */

const DailyMenuManager = {
    // Config state
    config: {
        active: true,
        activeItems: [], // List of Item IDs
        lastUpdated: null
    },

    // Cache
    masterItems: [],

    async init() {
        if (window.Debug) Debug.info('📅 DailyMenuManager initializing...');

        // Load master data
        if (typeof window.menuItems !== 'undefined') {
            this.masterItems = window.menuItems;
        } else if (typeof menuItems !== 'undefined') {
            this.masterItems = menuItems;
        }

        // Load current config (async)
        await this.loadConfig();

        // Setup Event Listeners
        this.setupEventListeners();

        // Initial Render
        this.renderMasterTable();
        this.renderDailyGrid();

        if (window.Debug) Debug.info('✅ DailyMenuManager ready');
    },

    async loadConfig() {
        // Try to load from Supabase first, fallback to localStorage
        if (typeof DailyMenuService !== 'undefined') {
            try {
                const result = await DailyMenuService.getConfig();
                if (result.success && result.data) {
                    this.config.activeItems = result.data.active_items || [];
                    this.config.active = true;
                    if (window.Debug) Debug.log('📅 Loaded daily menu from Supabase:', this.config.activeItems.length, 'items');
                } else {
                    // Fallback to localStorage
                    this._loadFromLocalStorage();
                }
            } catch (e) {
                console.error('Error loading from Supabase, using localStorage', e);
                this._loadFromLocalStorage();
            }
        } else {
            this._loadFromLocalStorage();
        }

        // Update UI date
        const dateEl = document.getElementById('todayDate');
        if (dateEl) {
            dateEl.textContent = new Date().toLocaleDateString('vi-VN', { weekday: 'long', day: 'numeric', month: 'numeric', year: 'numeric' });
        }
    },

    _loadFromLocalStorage() {
        const saved = localStorage.getItem('daily_menu_config');
        if (saved) {
            try {
                this.config = JSON.parse(saved);
            } catch (e) {
                console.error('Error parsing daily config', e);
            }
        } else {
            // Default: All items active to avoid empty menu on first load
            this.config.activeItems = this.masterItems.map(i => i.id);
            this.saveConfig(false);
        }
    },

    async saveConfig(notify = true) {
        console.log('📅 Saving daily menu:', this.config.activeItems.length, 'items');
        this.config.lastUpdated = new Date().toISOString();

        // Save to Supabase (also handles localStorage fallback internally)
        if (typeof DailyMenuService !== 'undefined') {
            try {
                const result = await DailyMenuService.saveConfig(this.config.activeItems);
                if (result && result.success) {
                    console.log('✅ Synced to Supabase successfully');
                } else {
                    console.warn('⚠️ Supabase sync returned:', result);
                }
            } catch (e) {
                console.error('❌ Error saving to Supabase:', e);
                // Fallback to localStorage only
                localStorage.setItem('daily_menu_config', JSON.stringify(this.config));
                console.log('💾 Saved to localStorage as fallback');
            }
        } else {
            localStorage.setItem('daily_menu_config', JSON.stringify(this.config));
            console.log('💾 Saved to localStorage (no Supabase)');
        }

        if (notify) {
            if (window.AdminDashboard && window.AdminDashboard.showToast) {
                window.AdminDashboard.showToast('✅ Đã cập nhật Menu Hôm Nay');
            }
        }
    },

    setupEventListeners() {
        // Tab switching (already handled by main.js or simple handler here)
        document.querySelectorAll('.menu-tab').forEach(btn => {
            btn.addEventListener('click', (e) => {
                // UI Toggle
                document.querySelectorAll('.menu-tab').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');

                const type = btn.dataset.menuType;
                document.querySelectorAll('.menu-section').forEach(s => s.classList.remove('active'));

                if (type === 'master') {
                    document.getElementById('masterMenuSection').classList.add('active');
                } else {
                    document.getElementById('dailyMenuSection').classList.add('active');
                    this.renderDailyGrid(); // Refresh
                }
            });
        });

        // Buttons
        document.getElementById('addToDailyBtn')?.addEventListener('click', () => this.addSelectedToDaily());
        document.getElementById('clearDailyBtn')?.addEventListener('click', () => this.clearDailyMenu());
        document.getElementById('copyYesterdayBtn')?.addEventListener('click', () => this.copyYesterday());
        document.getElementById('resetMenuBtn')?.addEventListener('click', () => location.reload()); // Simple reload for now

        // Checkbox Master
        document.addEventListener('change', (e) => {
            if (e.target.id === 'selectAllMaster') {
                const checked = e.target.checked;
                document.querySelectorAll('.master-item-checkbox').forEach(cb => cb.checked = checked);
            }
        });
    },

    // ===================================
    // MASTER MENU TABLE
    // ===================================
    renderMasterTable() {
        const tbody = document.getElementById('masterMenuBody');
        if (!tbody) return;

        tbody.innerHTML = this.masterItems.map(item => {
            const isDaily = this.config.activeItems.includes(item.id);
            return `
                <tr>
                    <td>
                        <input type="checkbox" class="master-item-checkbox" value="${item.id}">
                    </td>
                    <td>${item.id}</td>
                    <td>
                        <div style="display:flex; align-items:center; gap:8px;">
                            <span>${item.icon || '🍽️'}</span>
                            <div style="display:flex; flex-direction:column;">
                                <span style="font-weight:500;">${item.name}</span>
                                <small style="color:#888;">${item.category}</small>
                            </div>
                        </div>
                    </td>
                    <td>${this.getTypeLabel(item.type)}</td>
                    <td style="font-weight:600;">${this.formatPrice(item.price)}</td>
                    <td>${this.formatPrice(item.cost || item.price * 0.4)}</td>
                    <td>
                        <span class="status-tag ${isDaily ? 'active' : ''}">
                            ${isDaily ? 'Đang bán' : 'Ẩn'}
                        </span>
                    </td>
                    <td>
                        <button class="btn-icon-sm" onclick="DailyMenuManager.toggleItemDaily(${item.id})">
                            ${isDaily ? '➖' : '➕'}
                        </button>
                    </td>
                </tr>
            `;
        }).join('');
    },

    // ===================================
    // DAILY MENU GRID
    // ===================================
    renderDailyGrid() {
        const grid = document.getElementById('dailyMenuGrid');
        const countEl = document.getElementById('dailyMenuCount');
        if (!grid) return;

        // Filter items
        const rawIds = this.config.activeItems.map(String);
        const activeItems = this.masterItems.filter(i => rawIds.includes(String(i.id)));

        if (countEl) countEl.textContent = activeItems.length;

        if (activeItems.length === 0) {
            grid.innerHTML = `
                <div class="empty-state" style="grid-column:1/-1; text-align:center; padding:40px; color:#888;">
                    <div style="font-size:3rem; margin-bottom:10px;">📭</div>
                    <p>Menu hôm nay chưa có món nào.</p>
                    <button onclick="document.querySelector('[data-menu-type=master]').click()" 
                            style="margin-top:10px; padding:8px 16px; background:var(--primary); color:white; border:none; border-radius:8px; cursor:pointer;">
                        + Chọn từ Menu Tổng
                    </button>
                </div>
            `;
            return;
        }

        grid.innerHTML = activeItems.map(item => `
            <div class="daily-card" style="background:var(--bg-card); padding:12px; border-radius:12px; border:1px solid var(--border-color); display:flex; align-items:center; gap:12px; position:relative;">
                <div style="font-size:2rem;">${item.icon || '🍽️'}</div>
                <div style="flex:1;">
                    <h4 style="margin:0; font-size:0.95rem;">${item.name}</h4>
                    <p style="margin:0; color:var(--text-secondary); font-size:0.85rem;">${this.formatPrice(item.price)}</p>
                </div>
                <button onclick="DailyMenuManager.removeFromDaily(${item.id})" 
                        style="width:32px; height:32px; border-radius:50%; border:none; background:rgba(239,68,68,0.1); color:#ef4444; cursor:pointer; display:flex; align-items:center; justify-content:center;">
                    ✕
                </button>
            </div>
        `).join('');
    },

    // ===================================
    // ACTIONS
    // ===================================

    addSelectedToDaily() {
        const checked = document.querySelectorAll('.master-item-checkbox:checked');
        if (checked.length === 0) {
            alert('Vui lòng chọn món để thêm!');
            return;
        }

        let addedCount = 0;
        const currentIds = this.config.activeItems.map(String);

        checked.forEach(cb => {
            if (!currentIds.includes(cb.value)) {
                this.config.activeItems.push(parseInt(cb.value));
                addedCount++;
            }
            cb.checked = false; // Reset
        });

        if (document.getElementById('selectAllMaster')) {
            document.getElementById('selectAllMaster').checked = false;
        }

        this.saveConfig();
        this.renderMasterTable(); // Update status tags
        /* alert(`Đã thêm ${addedCount} món vào Menu Hôm Nay`); */

        // Auto switch to Daily tab to see result? No, stay here for bulk add
    },

    toggleItemDaily(id) {
        const idStr = String(id);
        const currentIds = this.config.activeItems.map(String);
        const index = currentIds.indexOf(idStr);

        if (index > -1) {
            // Remove
            this.config.activeItems.splice(index, 1);
        } else {
            // Add
            this.config.activeItems.push(parseInt(id));
        }

        this.saveConfig();
        this.renderMasterTable();
    },

    removeFromDaily(id) {
        const idStr = String(id);
        const currentIds = this.config.activeItems.map(String);
        const index = currentIds.indexOf(idStr);

        if (index > -1) {
            this.config.activeItems.splice(index, 1);
            this.saveConfig();
            this.renderDailyGrid();
        }
    },

    clearDailyMenu() {
        if (!confirm('Bạn có chắc muốn xóa tất cả món trong menu hôm nay?')) return;
        this.config.activeItems = [];
        this.saveConfig();
        this.renderDailyGrid();
    },

    copyYesterday() {
        // Since we don't have real "yesterday" history in localStorage in this simple version,
        // we'll just simulate by keeping the current ones or reloading default.
        // Or we could implement a history feature.
        // For now: Just active Top 20 items as a "Smart Suggestion"

        this.config.activeItems = this.masterItems.slice(0, 20).map(i => i.id);
        this.saveConfig();
        this.renderDailyGrid();
        alert('Đã gợi ý 20 món phổ biến nhất!');
    },

    // ===================================
    // UTILS
    // ===================================
    formatPrice(amount) {
        return new Intl.NumberFormat('vi-VN').format(amount) + 'đ';
    },

    getTypeLabel(type) {
        const map = { 'food': 'Món ăn', 'drink': 'Đồ uống', 'dessert': 'Tráng miệng' };
        return map[type] || type;
    }
};

// Initialize on load if page menu is active or when tab clicked
document.addEventListener('DOMContentLoaded', () => {
    DailyMenuManager.init();
});
