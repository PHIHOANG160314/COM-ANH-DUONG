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
        if (window.Debug) Debug.info('ðŸ“… DailyMenuManager initializing...');

        // Load master data from Supabase
        if (typeof DailyMenuService !== 'undefined') {
            if (window.Debug) Debug.log('ðŸ”„ Fetching Master Menu from Supabase...');
            const result = await DailyMenuService.getMenuItems();
            if (result.success && result.data && result.data.length > 0) {
                this.masterItems = result.data;
                if (window.Debug) Debug.log('âœ… Loaded', this.masterItems.length, 'master items from DB');
            } else {
                if (window.Debug) Debug.warn('âš ï¸ Could not load from DB, falling back to local data');
                this._loadLocalMasterData();
            }
        } else {
            this._loadLocalMasterData();
        }

        // Load current config (async)
        await this.loadConfig();

        // Setup Event Listeners
        this.setupEventListeners();

        // Initial Render
        this.renderMasterTable();
        this.renderDailyGrid();

        if (window.Debug) Debug.info('âœ… DailyMenuManager ready');
    },

    _loadLocalMasterData() {
        // Fallback to local static menuItems
        if (typeof menuItems !== 'undefined' && Array.isArray(menuItems)) {
            this.masterItems = menuItems.map((item, index) => ({
                id: item.id || index + 1,
                name: item.name,
                price: item.price,
                cost: item.cost || item.price * 0.4,
                icon: item.icon || 'ðŸ½ï¸',
                category: item.category || 'food',
                type: item.category || 'food',
                is_available: item.active !== false
            }));
        } else {
            this.masterItems = [];
        }
        if (window.Debug) Debug.log('âš ï¸ Loaded', this.masterItems.length, 'master items from local file');
    },

    async loadConfig() {
        if (window.Debug) Debug.log('ðŸ“… DailyMenuManager.loadConfig starting...');

        // Try to load from Supabase first, fallback to localStorage
        if (typeof DailyMenuService !== 'undefined') {
            try {
                if (window.Debug) Debug.log('ðŸ”„ Loading from DailyMenuService.getConfig()...');
                const result = await DailyMenuService.getConfig();
                if (window.Debug) Debug.log('ðŸ“¥ DailyMenuService.getConfig result:', result);

                if (result.success && result.data) {
                    const supabaseItems = result.data.active_items || [];
                    if (window.Debug) Debug.log('ðŸ“¥ Supabase returned:', supabaseItems.length, 'items');

                    // If Supabase has items, use them
                    if (supabaseItems.length > 0) {
                        this.config.activeItems = supabaseItems;
                        this.config.active = true;
                        if (window.Debug) Debug.log('âœ… Using Supabase data:', this.config.activeItems.length, 'items');
                        if (window.Debug) Debug.log('ðŸ“‹ Active Item IDs:', JSON.stringify(this.config.activeItems));
                        // Sync to localStorage
                        localStorage.setItem('daily_menu_config', JSON.stringify(this.config));
                    } else {
                        // Supabase empty - check localStorage
                        if (window.Debug) Debug.log('âš ï¸ Supabase empty, checking localStorage...');
                        const local = localStorage.getItem('daily_menu_config');
                        if (local) {
                            try {
                                const localConfig = JSON.parse(local);
                                if (localConfig.activeItems && localConfig.activeItems.length > 0) {
                                    if (window.Debug) Debug.log('âœ… Using localStorage:', localConfig.activeItems.length, 'items');
                                    this.config.activeItems = localConfig.activeItems;
                                    this.config.active = true;
                                    // SYNC localStorage data back to Supabase
                                    if (window.Debug) Debug.log('ðŸ”„ Syncing localStorage to Supabase...');
                                    DailyMenuService.saveConfig(this.config.activeItems);
                                } else {
                                    if (window.Debug) Debug.log('ðŸ“‹ Both Supabase and localStorage are empty');
                                    this.config.activeItems = [];
                                }
                            } catch (e) {
                                console.error('Error parsing localStorage', e);
                                this.config.activeItems = [];
                            }
                        } else {
                            if (window.Debug) Debug.log('ðŸ“‹ No localStorage data, using empty');
                            this.config.activeItems = [];
                        }
                    }
                    if (window.Debug) Debug.log('ðŸ“… Loaded daily menu:', this.config.activeItems.length, 'items');
                } else {
                    if (window.Debug) Debug.log('âš ï¸ Supabase returned no data, falling back to localStorage');
                    // Fallback to localStorage
                    this._loadFromLocalStorage();
                }
            } catch (e) {
                console.error('Error loading from Supabase, using localStorage', e);
                this._loadFromLocalStorage();
            }
        } else {
            if (window.Debug) Debug.log('âš ï¸ DailyMenuService not available, using localStorage');
            this._loadFromLocalStorage();
        }

        // Update UI date
        const dateEl = document.getElementById('todayDate');
        if (dateEl) {
            dateEl.textContent = new Date().toLocaleDateString('vi-VN', { weekday: 'long', day: 'numeric', month: 'numeric', year: 'numeric' });
        }

        if (window.Debug) Debug.log('ðŸ“… DailyMenuManager.loadConfig finished. activeItems:', this.config.activeItems.length);
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

    // Reliable collection from UI
    collectActiveItems() {
        // Only collect from Master checkboxes if Master tab section is currently active
        const masterSection = document.getElementById('masterMenuSection');
        const isOnMasterTab = masterSection && masterSection.classList.contains('active');

        if (isOnMasterTab) {
            const checkboxes = document.querySelectorAll('#masterMenuBody input[type="checkbox"]:checked');
            if (checkboxes.length > 0) {
                this.config.activeItems = Array.from(checkboxes).map(cb => parseInt(cb.value));
                if (window.Debug) Debug.log('ðŸ“‹ Collected active items from Master UI:', this.config.activeItems.length);
            } else {
                if (window.Debug) Debug.log('âš ï¸ Master tab active but no checkboxes checked - keeping existing:', this.config.activeItems.length);
            }
        } else {
            // Not on Master tab - keep current activeItems (set by toggleItemDaily)
            if (window.Debug) Debug.log('ðŸ“‹ Not on Master tab - using existing activeItems:', this.config.activeItems.length);
        }
        return this.config.activeItems;
    },

    async saveConfig(notify = true) {
        // FORCE COLLECT items from UI before saving
        this.collectActiveItems();

        // FORCE COLLECT active items from memory or UI to be sure
        if (window.Debug) Debug.log('ðŸ“… DailyMenuManager.saveConfig called');

        // Validation log
        if (window.Debug) Debug.log('ðŸ“‹ Current activeItems BEFORE save:', this.config.activeItems.length, JSON.stringify(this.config.activeItems));

        // Validate: Don't save if explicitly 0 items when we shouldn't
        if (this.config.activeItems.length === 0) {
            if (window.Debug) Debug.warn('âš ï¸ WARNING: Saving 0 items to daily menu!');
        }

        this.config.lastUpdated = new Date().toISOString();

        // Save to Supabase (also handles localStorage fallback internally)
        if (typeof DailyMenuService !== 'undefined') {
            try {
                if (window.Debug) Debug.log('ðŸ”„ Calling DailyMenuService.saveConfig with', this.config.activeItems.length, 'items');
                const result = await DailyMenuService.saveConfig(this.config.activeItems);
                if (window.Debug) Debug.log('ðŸ“¤ DailyMenuService.saveConfig result:', result);

                if (result && result.success) {
                    if (window.Debug) Debug.log('âœ… Synced to Supabase successfully');
                    // Always sync to localStorage to prevent stale cache
                    localStorage.setItem('daily_menu_config', JSON.stringify(this.config));
                } else {
                    if (window.Debug) Debug.warn('âš ï¸ Supabase sync returned:', result);
                }
            } catch (e) {
                console.error('âŒ Error saving to Supabase:', e);
                // Fallback to localStorage only
                localStorage.setItem('daily_menu_config', JSON.stringify(this.config));
                if (window.Debug) Debug.log('ðŸ’¾ Saved to localStorage as fallback');
            }
        } else {
            localStorage.setItem('daily_menu_config', JSON.stringify(this.config));
            if (window.Debug) Debug.log('ðŸ’¾ Saved to localStorage (no Supabase)');
        }

        if (notify) {
            if (window.AdminDashboard && window.AdminDashboard.showToast) {
                window.AdminDashboard.showToast('âœ… ÄÃ£ cáº­p nháº­t Menu HÃ´m Nay');
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
                            <span>${item.icon || 'ðŸ½ï¸'}</span>
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
                            ${isDaily ? 'Äang bÃ¡n' : 'áº¨n'}
                        </span>
                    </td>
                    <td>
                        <button class="btn-icon-sm" onclick="DailyMenuManager.toggleItemDaily(${item.id})">
                            ${isDaily ? 'âž–' : 'âž•'}
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
                    <div style="font-size:3rem; margin-bottom:10px;">ðŸ“­</div>
                    <p>Menu hÃ´m nay chÆ°a cÃ³ mÃ³n nÃ o.</p>
                    <button onclick="document.querySelector('[data-menu-type=master]').click()" 
                            style="margin-top:10px; padding:8px 16px; background:var(--primary); color:white; border:none; border-radius:8px; cursor:pointer;">
                        + Chá»n tá»« Menu Tá»•ng
                    </button>
                </div>
            `;
            return;
        }

        grid.innerHTML = activeItems.map(item => `
            <div class="daily-card" style="background:var(--bg-card); padding:12px; border-radius:12px; border:1px solid var(--border-color); display:flex; align-items:center; gap:12px; position:relative;">
                <div style="font-size:2rem;">${item.icon || 'ðŸ½ï¸'}</div>
                <div style="flex:1;">
                    <h4 style="margin:0; font-size:0.95rem;">${item.name}</h4>
                    <p style="margin:0; color:var(--text-secondary); font-size:0.85rem;">${this.formatPrice(item.price)}</p>
                </div>
                <button onclick="DailyMenuManager.removeFromDaily(${item.id})" 
                        style="width:32px; height:32px; border-radius:50%; border:none; background:rgba(239,68,68,0.1); color:#ef4444; cursor:pointer; display:flex; align-items:center; justify-content:center;">
                    âœ•
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
            alert('Vui lÃ²ng chá»n mÃ³n Ä‘á»ƒ thÃªm!');
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

        this.renderMasterTable(); // Update status tags
        this.saveConfig();

        // Auto switch to Daily tab to see result? No, stay here for bulk add
    },

    toggleItemDaily(id) {
        if (window.Debug) Debug.log('%cðŸ”„ toggleItemDaily called with id:', 'background: #2196F3; color: white;', id);
        if (window.Debug) Debug.log('ðŸ“‹ BEFORE: activeItems =', JSON.stringify(this.config.activeItems));

        const idStr = String(id);
        const currentIds = this.config.activeItems.map(String);
        const index = currentIds.indexOf(idStr);

        if (index > -1) {
            // Remove
            this.config.activeItems.splice(index, 1);
            if (window.Debug) Debug.log('âž– Removed item', id);
        } else {
            // Add
            this.config.activeItems.push(parseInt(id));
            if (window.Debug) Debug.log('âž• Added item', id);
        }

        if (window.Debug) Debug.log('ðŸ“‹ AFTER: activeItems =', JSON.stringify(this.config.activeItems));

        this.renderMasterTable(); // RENDER FIRST to update DOM checkboxes
        this.saveConfig();        // THEN SAVE (collectActiveItems will read fresh DOM)
    },

    removeFromDaily(id) {
        const idStr = String(id);
        const currentIds = this.config.activeItems.map(String);
        const index = currentIds.indexOf(idStr);

        if (index > -1) {
            this.config.activeItems.splice(index, 1);
            this.renderDailyGrid(); // RENDER FIRST
            this.saveConfig();      // THEN SAVE
        }
    },

    clearDailyMenu() {
        if (!confirm('Báº¡n cÃ³ cháº¯c muá»‘n xÃ³a táº¥t cáº£ mÃ³n trong menu hÃ´m nay?')) return;
        this.config.activeItems = [];
        this.renderDailyGrid();
        this.saveConfig();
    },

    copyYesterday() {
        // Since we don't have real "yesterday" history in localStorage in this simple version,
        // we'll just simulate by keeping the current ones or reloading default.
        // Or we could implement a history feature.
        // For now: Just active Top 20 items as a "Smart Suggestion"

        this.config.activeItems = this.masterItems.slice(0, 20).map(i => i.id);
        this.saveConfig();
        this.renderDailyGrid();
        alert('ÄÃ£ gá»£i Ã½ 20 mÃ³n phá»• biáº¿n nháº¥t!');
    },

    // ===================================
    // UTILS
    // ===================================
    formatPrice(amount) {
        return new Intl.NumberFormat('vi-VN').format(amount) + 'Ä‘';
    },

    getTypeLabel(type) {
        const map = { 'food': 'MÃ³n Äƒn', 'drink': 'Äá»“ uá»‘ng', 'dessert': 'TrÃ¡ng miá»‡ng' };
        return map[type] || type;
    }
};

// Initialize on load if page menu is active or when tab clicked
document.addEventListener('DOMContentLoaded', () => {
    DailyMenuManager.init();
});

