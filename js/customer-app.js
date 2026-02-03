/**
 * F&B Master - Customer App
 * Author: Google DeepMind / Antigravity Team
 * Description: Client-facing ordering portal, digital menu, and loyalty tracking.
 */

const CustomerApp = {
    cart: [],
    orderType: 'delivery',
    currentMember: null,
    menuData: [],
    originalMenuData: [], // Back up for original data
    searchQuery: '',
    dailyMenuChannel: null, // BroadcastChannel for realtime sync

    // Filter menu based on "Daily Menu" config (Option B: empty = show message)
    filterDailyMenu() {
        console.log('%c🔥 filterDailyMenu EXECUTING', 'background: #FF5722; color: white; font-size: 14px; padding: 2px 6px;');

        const dailyConfig = localStorage.getItem('daily_menu_config');
        console.log('📦 Raw localStorage daily_menu_config:', dailyConfig);

        // No config? Show empty state (Option B)
        if (!dailyConfig) {
            this.menuData = [];
            console.log('%c❌ No daily config found - menu will be EMPTY', 'color: red; font-weight: bold;');
            return;
        }

        try {
            const config = JSON.parse(dailyConfig);
            console.log('📋 Parsed config:', JSON.stringify(config, null, 2));

            // Check if we have activeItems
            if (!config || !Array.isArray(config.activeItems) || config.activeItems.length === 0) {
                // Empty config = show empty state (Option B)
                this.menuData = [];
                console.log('%c❌ Daily menu activeItems is empty - menu will be EMPTY', 'color: red; font-weight: bold;');
                return;
            }

            // Reset to original before filtering
            console.log(`📊 Original menu count: ${this.originalMenuData.length}`);
            this.menuData = [...this.originalMenuData];

            // Filter to only show active items
            // FIX: Handle "M005" → 5 (strip M prefix AND leading zeros)
            const activeIds = config.activeItems.map(id => {
                const idStr = String(id);
                // Strip "M" prefix if present, then parse as integer to remove leading zeros
                const numericPart = idStr.startsWith('M') ? idStr.substring(1) : idStr;
                // parseInt removes leading zeros: "005" → 5
                return String(parseInt(numericPart, 10));
            });
            console.log('🎯 Active IDs to filter (normalized):', activeIds);

            this.menuData = this.menuData.filter(item => activeIds.includes(String(item.id)));
            console.log(`%c✅ FILTERED: ${this.menuData.length} items from ${activeIds.length} IDs`, 'color: green; font-weight: bold;');

            // Log which items will be displayed
            this.menuData.forEach(item => {
                console.log(`   → ID ${item.id}: ${item.name}`);
            });

        } catch (e) {
            console.error('❌ Error parsing daily menu config', e);
            this.menuData = [];
        }
    },

    // Show sync indicator when menu is updating
    showSyncIndicator() {
        let indicator = document.getElementById('menuSyncIndicator');
        if (!indicator) {
            indicator = document.createElement('div');
            indicator.id = 'menuSyncIndicator';
            indicator.className = 'menu-sync-indicator';
            indicator.innerHTML = '🔄 Đang cập nhật menu...';
            const grid = document.getElementById('customerMenuGrid');
            if (grid && grid.parentNode) {
                grid.parentNode.insertBefore(indicator, grid);
            } else {
                document.body.appendChild(indicator);
            }
        }
        indicator.classList.add('visible');
    },

    // Hide sync indicator
    hideSyncIndicator() {
        const indicator = document.getElementById('menuSyncIndicator');
        if (indicator) {
            setTimeout(() => indicator.classList.remove('visible'), 500);
        }
    },
    currentGroup: 'all',      // Level 1: Menu Group
    currentCategory: 'all',   // Level 2: Category  
    currentSubcategory: 'all', // Level 3: Subcategory
    appliedPromo: null,
    menuPaginationInit: false,

    // Available promo codes
    promoCodes: {
        'WELCOME10': { discount: 10, type: 'percent', minOrder: 50000, description: 'Giảm 10%' },
        'FREESHIP': { discount: 15000, type: 'fixed', minOrder: 100000, description: 'Miễn phí giao hàng' },
        'NEWYEAR': { discount: 20, type: 'percent', minOrder: 100000, description: 'Giảm 20%' },
        'VIP50K': { discount: 50000, type: 'fixed', minOrder: 200000, description: 'Giảm 50K' }
    },

    async init() {
        // ========== V1.0.2 - SUPABASE FIRST ==========
        console.log('%c🍽️ CUSTOMER APP v1.0.2 - 03/02/2026 10:00', 'background: #4CAF50; color: white; font-size: 16px; padding: 4px 8px; border-radius: 4px;');
        console.log('📋 Debug: SupabaseService available?', typeof SupabaseService !== 'undefined');
        // ============================================

        if (window.Debug) Debug.log('🍽️ Customer Portal initializing...');

        // ===== NEW: Load menu from Supabase FIRST =====
        let supabaseMenuLoaded = false;
        if (typeof SupabaseService !== 'undefined' && SupabaseService.getMenuItems) {
            console.log('🔄 Customer: Loading menu from Supabase...');
            try {
                const result = await SupabaseService.getMenuItems();
                if (result.success && result.data && result.data.length > 0) {
                    // Map Supabase columns to app format
                    this.menuData = result.data.map(item => ({
                        id: item.id,
                        name: item.name,
                        price: item.price,
                        category: item.category_id || 'food',
                        subcategory: item.subcategory_id || 'homemade',
                        icon: item.icon || '🍽️',
                        cost: item.cost || 0,
                        is_featured: item.is_featured || false,
                        image_url: item.image_url || null,
                        description: item.description || ''
                    }));
                    this.originalMenuData = [...this.menuData];
                    supabaseMenuLoaded = true;
                    console.log('%c✅ Loaded ' + this.menuData.length + ' items from Supabase!', 'color: green; font-weight: bold;');
                }
            } catch (e) {
                console.warn('⚠️ Failed to load from Supabase:', e.message);
            }
        }

        // Fallback to data.js if Supabase failed
        if (!supabaseMenuLoaded) {
            console.log('⚠️ Using data.js fallback...');
            if (typeof window.menuItems !== 'undefined' && window.menuItems.length > 0) {
                this.menuData = [...window.menuItems];
                this.originalMenuData = [...window.menuItems];
                if (window.Debug) Debug.log('✅ Loaded', this.menuData.length, 'menu items from data.js');
            } else if (typeof menuItems !== 'undefined' && menuItems.length > 0) {
                this.menuData = [...menuItems];
                this.originalMenuData = [...menuItems];
            } else {
                this.menuData = this.getSampleMenu();
                this.originalMenuData = [...this.menuData];
                if (window.Debug) Debug.warn('⚠️ Using sample menu data');
            }
        }

        // Load daily menu config from Supabase (if available)
        if (typeof DailyMenuService !== 'undefined') {
            console.log('🔄 Customer: Starting daily menu sync...');

            // FIX 2: Always clear old config to ensure fresh fetch
            localStorage.removeItem('daily_menu_config');
            console.log('Customer: Cleared old localStorage before fresh fetch');

            console.log('🔄 Customer: Fetching daily menu from Supabase...');
            try {
                // Ensure we wait for this to complete before filtering
                const result = await DailyMenuService.getConfig();
                console.log('✅ Customer: Daily menu loaded:', result);

                if (result.success && result.data) {
                    // Always sync to localStorage, even if empty
                    const activeItems = result.data.active_items || [];

                    // Save to localStorage for consistency
                    const localConfig = {
                        active: true,
                        activeItems: activeItems,
                        lastUpdated: new Date().toISOString()
                    };
                    console.log('💾 Customer: Overwriting localStorage with fresh Supabase data', { activeItemsCount: activeItems.length });
                    localStorage.setItem('daily_menu_config', JSON.stringify(localConfig));
                    console.log(`💾 Customer: Synced daily menu (Items: ${activeItems.length})`);
                }
            } catch (e) {
                console.warn('Customer: Could not load daily menu from Supabase:', e);
            }
        } else {
            console.log('⚠️ Customer: DailyMenuService not available, skipping sync');
        }

        // Apply "Daily Menu" filter if active - EXECUTE AFTER SUPABASE LOAD
        console.log('🔄 Customer: Applying daily menu filter...');
        this.filterDailyMenu();

        // Subscribe to DailyMenuService for cross-device realtime updates
        if (typeof DailyMenuService !== 'undefined') {
            DailyMenuService.subscribe((config) => {
                console.log('🔄 Daily menu updated from Supabase Realtime');
                this.showSyncIndicator(); // Show updating indicator
                // Update localStorage
                const localConfig = {
                    active: true,
                    activeItems: config.activeItems || [],
                    lastUpdated: new Date().toISOString()
                };
                localStorage.setItem('daily_menu_config', JSON.stringify(localConfig));
                // Refilter and rerender
                this.filterDailyMenu();
                this.renderMenu(this.currentCategory);
                this.loadFeaturedItems();
                this.hideSyncIndicator(); // Hide after render
            });
        }

        // Subscribe to FeaturedItemsService for realtime featured items updates
        if (typeof FeaturedItemsService !== 'undefined') {
            FeaturedItemsService.subscribe((config) => {
                console.log('🔥 Featured items updated from realtime');
                this.loadFeaturedItems();
            });
        }

        // Fallback: Listen for storage changes (Real-time updates from OTHER tabs)
        window.addEventListener('storage', (e) => {
            if (e.key === 'daily_menu_config') {
                console.log('🔄 Daily menu updated from admin (storage event)');
                this.showSyncIndicator();
                this.filterDailyMenu();
                this.renderMenu(this.currentCategory);
                this.loadFeaturedItems();
                this.hideSyncIndicator();
            }
            if (e.key === 'featured_items_config') {
                console.log('🔥 Featured items updated from admin (storage event)');
                this.loadFeaturedItems();
            }
        });

        this.loadCart();
        this.loadFeaturedItems(); // Use async featured items loader
        this.renderCategories(this.currentGroup);
        // this.renderSubcategoryTabs(); // Legacy
        this.renderMenu();
        this.updateCartUI();
        this.renderOrderHistory();
        this.populateDineinTables();
        this.listenForTableUpdates();

        // Initialize realtime order tracking
        this.initRealtimeOrderTracking();

        // Initialize Pull to Refresh
        this.initPullToRefresh();

        // =====================================================
        // FALLBACK POLLING - Sync menu every 30s nếu Realtime chưa bật
        // =====================================================
        this._lastMenuHash = '';
        this.startMenuPolling();

        if (window.Debug) Debug.log('🍽️ Customer Portal ready!');
    },

    // ========================================
    // PULL TO REFRESH
    // ========================================
    initPullToRefresh() {
        const grid = document.getElementById('customerMenuGrid');
        if (!grid) return;

        let startY = 0;
        let isPulling = false;
        const threshold = 120; // px to trigger refresh

        // Create refresh spinner if not exists
        let spinner = document.getElementById('ptr-spinner');
        if (!spinner) {
            spinner = document.createElement('div');
            spinner.id = 'ptr-spinner';
            spinner.style.cssText = `
                position: fixed;
                top: -60px;
                left: 50%;
                transform: translateX(-50%);
                z-index: 9999;
                transition: top 0.2s ease-out;
                background: var(--bg-card, white);
                padding: 12px;
                border-radius: 50%;
                box-shadow: 0 4px 15px rgba(0,0,0,0.15);
                display: flex;
                align-items: center;
                justify-content: center;
                width: 40px;
                height: 40px;
                pointer-events: none;
            `;
            spinner.innerHTML = '<span style="font-size: 20px; display: block;">⬇️</span>';
            document.body.appendChild(spinner);
        }

        // Add CSS animation for spinner
        if (!document.getElementById('ptr-style')) {
            const style = document.createElement('style');
            style.id = 'ptr-style';
            style.textContent = `
                @keyframes ptr-spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
                .ptr-spinning span { animation: ptr-spin 1s linear infinite; display: block; }
            `;
            document.head.appendChild(style);
        }

        // Helper to check if we are at top
        const isAtTop = () => window.scrollY <= 10;

        grid.addEventListener('touchstart', (e) => {
            if (isAtTop()) {
                startY = e.touches[0].clientY;
                isPulling = true;
            } else {
                isPulling = false;
            }
        }, { passive: true });

        grid.addEventListener('touchmove', (e) => {
            if (!isPulling) return;

            const currentY = e.touches[0].clientY;
            const diff = currentY - startY;

            // Only react to pull down when at top
            if (diff > 0 && isAtTop()) {
                // Add resistance/damping
                const move = Math.min(diff * 0.4, 150);

                spinner.style.top = `${move - 50}px`; // Start appearing

                const icon = spinner.querySelector('span');
                if (diff > threshold) {
                    icon.innerHTML = '🔄';
                    icon.style.transform = 'rotate(180deg)';
                } else {
                    icon.innerHTML = '⬇️';
                    icon.style.transform = `rotate(${diff}deg)`;
                }
            } else {
                // Scrolled down or pushing up
                spinner.style.top = '-60px';
                isPulling = false; // Cancel if we scroll down
            }
        }, { passive: true });

        grid.addEventListener('touchend', async (e) => {
            if (!isPulling) return;
            isPulling = false;

            const endY = e.changedTouches[0].clientY;
            const diff = endY - startY;

            if (diff >= threshold && isAtTop()) {
                // Trigger refresh
                spinner.style.top = '20px';
                spinner.classList.add('ptr-spinning');
                spinner.querySelector('span').innerHTML = '🔄';

                // Perform refresh
                await this.refreshData();

                // Hide after delay
                setTimeout(() => {
                    spinner.style.top = '-60px';
                    spinner.classList.remove('ptr-spinning');
                }, 800);
            } else {
                // Cancel
                spinner.style.top = '-60px';
            }
        });
    },

    async refreshData() {
        console.log('🔄 [Sync] Starting menu refresh...');
        this.showSyncIndicator();

        try {
            // 1. Fetch Daily Menu Config
            if (typeof DailyMenuService !== 'undefined') {
                console.log('🔄 [Sync] Fetching DailyMenuService.getConfig()...');
                const result = await DailyMenuService.getConfig();

                if (result.success && result.data) {
                    console.log('✅ [Sync] Daily config received:', result.data);

                    const activeItems = result.data.active_items || [];
                    const localConfig = {
                        active: true,
                        activeItems: activeItems,
                        lastUpdated: new Date().toISOString()
                    };

                    // 2. Update LocalStorage
                    localStorage.setItem('daily_menu_config', JSON.stringify(localConfig));
                    console.log('💾 [Sync] Updated daily_menu_config in localStorage');

                    // 3. Filter Daily Menu
                    this.filterDailyMenu();
                } else {
                    console.warn('⚠️ [Sync] Daily config fetch failed or empty:', result);
                }
            } else {
                console.warn('⚠️ [Sync] DailyMenuService not available');
            }

            // 4. Render Menu
            console.log('🎨 [Sync] Re-rendering menu...');
            this.renderMenu(this.currentCategory);

            // 5. Load Featured Items
            console.log('🔥 [Sync] Loading featured items...');
            await this.loadFeaturedItems();

            this.showToast('✅ Đã cập nhật menu mới nhất');
            console.log('✅ [Sync] Menu refresh completed');

        } catch (e) {
            console.error('❌ [Sync] Refresh failed:', e);
            this.showToast('⚠️ Cập nhật thất bại', 'error');
        } finally {
            this.hideSyncIndicator();
        }
    },

    // ========================================
    // FALLBACK POLLING - Sync menu mỗi 30s
    // ========================================
    startMenuPolling() {
        // Poll every 30 seconds
        const POLL_INTERVAL = 30000;

        setInterval(async () => {
            if (typeof DailyMenuService === 'undefined') return;

            try {
                const result = await DailyMenuService.getConfig();
                if (!result.success || !result.data) return;

                const newItems = result.data.active_items || [];
                const newHash = JSON.stringify(newItems.sort());

                // Only update if menu actually changed
                if (newHash !== this._lastMenuHash) {
                    console.log('🔄 [Polling] Menu changed! Old:', this._lastMenuHash.length, 'New:', newHash.length);
                    this._lastMenuHash = newHash;

                    // Update localStorage
                    const localConfig = {
                        active: true,
                        activeItems: newItems,
                        lastUpdated: new Date().toISOString()
                    };
                    localStorage.setItem('daily_menu_config', JSON.stringify(localConfig));

                    // Refresh UI
                    this.showSyncIndicator();
                    this.filterDailyMenu();
                    this.renderMenu(this.currentCategory);
                    this.loadFeaturedItems();
                    this.hideSyncIndicator();

                    console.log('✅ [Polling] Menu updated with', newItems.length, 'items');
                }
            } catch (e) {
                console.warn('⚠️ [Polling] Error:', e.message);
            }
        }, POLL_INTERVAL);

        // Set initial hash
        const local = localStorage.getItem('daily_menu_config');
        if (local) {
            try {
                const config = JSON.parse(local);
                this._lastMenuHash = JSON.stringify((config.activeItems || []).sort());
            } catch (e) { }
        }

        console.log('📡 [Polling] Started menu polling every', POLL_INTERVAL / 1000, 'seconds');
    },

    // ========================================
    // REALTIME ORDER TRACKING
    // ========================================
    async initRealtimeOrderTracking() {
        // Sync orders from Supabase
        await this.loadOrdersFromSupabase();

        // Subscribe to realtime updates for all customer orders
        this.subscribeToAllOrderUpdates();
    },

    async loadOrdersFromSupabase() {
        if (typeof SupabaseService === 'undefined' ||
            typeof isSupabaseConfigured === 'undefined' ||
            !isSupabaseConfigured()) {
            console.log('Customer: Supabase not configured, using local orders');
            return;
        }

        try {
            // Get local orders to match with Supabase
            const localOrders = JSON.parse(localStorage.getItem('customer_orders') || '[]');

            if (localOrders.length === 0) {
                console.log('Customer: No local orders to sync');
                return;
            }

            console.log('Customer: Syncing', localOrders.length, 'local orders...');
            console.log('Customer: Local order IDs:', localOrders.map(o => o.id));

            // Get all orders from Supabase
            const result = await SupabaseService.getOrders();
            if (result.error) {
                console.error('Customer: Failed to load orders from Supabase:', result.error);
                return;
            }

            console.log('Customer: Got', result.data?.length || 0, 'orders from Supabase');

            // Update local orders with Supabase status
            let updated = false;
            localOrders.forEach(localOrder => {
                // Match by order_number OR supabaseId
                const supabaseOrder = result.data?.find(o => {
                    const matchByOrderNumber = o.order_number === localOrder.id;
                    const matchBySupabaseId = localOrder.supabaseId && o.id === localOrder.supabaseId;
                    return matchByOrderNumber || matchBySupabaseId;
                });

                if (supabaseOrder) {
                    console.log('Customer: Found match for', localOrder.id, '- Supabase status:', supabaseOrder.status, 'Local status:', localOrder.status);

                    // Always update supabaseId if missing
                    if (!localOrder.supabaseId) {
                        localOrder.supabaseId = supabaseOrder.id;
                        updated = true;
                    }

                    // Update status if different
                    if (supabaseOrder.status !== localOrder.status) {
                        const oldStatus = localOrder.status;
                        localOrder.status = supabaseOrder.status;

                        // Add to status history
                        localOrder.statusHistory = localOrder.statusHistory || [];
                        localOrder.statusHistory.push({
                            status: supabaseOrder.status,
                            time: new Date().toISOString(),
                            label: this.getStatusLabel(supabaseOrder.status)
                        });

                        updated = true;
                        console.log('🔄 Customer: Order', localOrder.id, 'status updated from', oldStatus, 'to:', supabaseOrder.status);
                    }
                } else {
                    console.log('Customer: No Supabase match for local order:', localOrder.id);
                }
            });

            if (updated) {
                localStorage.setItem('customer_orders', JSON.stringify(localOrders));

                // Re-render order history
                this.renderOrderHistory();

                // Re-render current tracking if visible
                const trackingContainer = document.getElementById('currentOrderTracking');
                const trackingOrderId = document.getElementById('trackingOrderId')?.value;
                if (trackingContainer && trackingOrderId) {
                    const trackedOrder = localOrders.find(o => o.id === trackingOrderId);
                    if (trackedOrder) {
                        this.renderOrderStatus(trackedOrder, trackingContainer);
                        console.log('Customer: Updated tracking UI for order', trackingOrderId);
                    }
                }
            }

            console.log('✅ Customer: Synced orders from Supabase, updated:', updated);
        } catch (err) {
            console.error('Customer: Error syncing orders:', err);
        }
    },

    subscribeToAllOrderUpdates() {
        if (typeof SupabaseService === 'undefined' ||
            typeof isSupabaseConfigured === 'undefined' ||
            !isSupabaseConfigured()) {
            return;
        }

        // Subscribe to all order changes
        SupabaseService.subscribeToOrders((payload) => {
            console.log('🔔 Customer: Order update received:', payload.eventType, payload.new?.id);

            if (payload.eventType === 'UPDATE' && payload.new) {
                const localOrders = JSON.parse(localStorage.getItem('customer_orders') || '[]');

                // Try to match by supabaseId first, then by order_number
                const orderIndex = localOrders.findIndex(o => {
                    const matchBySupabaseId = o.supabaseId && o.supabaseId === payload.new.id;
                    const matchByOrderNumber = o.id === payload.new.order_number;
                    return matchBySupabaseId || matchByOrderNumber;
                });

                console.log('🔔 Customer: Looking for match - Supabase ID:', payload.new.id, 'Order Number:', payload.new.order_number);
                console.log('🔔 Customer: Found at index:', orderIndex);

                if (orderIndex !== -1) {
                    const oldStatus = localOrders[orderIndex].status;
                    const newStatus = payload.new.status;

                    console.log('🔔 Customer: Order', localOrders[orderIndex].id, 'status change:', oldStatus, '->', newStatus);

                    if (oldStatus !== newStatus) {
                        localOrders[orderIndex].status = newStatus;
                        localOrders[orderIndex].statusHistory = localOrders[orderIndex].statusHistory || [];
                        localOrders[orderIndex].statusHistory.push({
                            status: newStatus,
                            time: new Date().toISOString(),
                            label: this.getStatusLabel(newStatus)
                        });

                        localStorage.setItem('customer_orders', JSON.stringify(localOrders));

                        // Re-render tracking and history
                        this.renderOrderHistory();

                        // Update tracking section - check by order ID
                        const trackingContainer = document.getElementById('currentOrderTracking');
                        const trackingOrderId = document.getElementById('trackingOrderId')?.value;
                        if (trackingContainer && trackingOrderId === localOrders[orderIndex].id) {
                            this.renderOrderStatus(localOrders[orderIndex], trackingContainer);
                            console.log('✅ Customer: Updated tracking UI for', localOrders[orderIndex].id);
                        }

                        // Show notification
                        this.showToast(`Đơn ${localOrders[orderIndex].id}: ${this.getStatusLabel(newStatus)}`, 'success');
                        console.log('✅ Customer: Order', localOrders[orderIndex].id, 'updated to:', newStatus);
                    }
                } else {
                    console.log('⚠️ Customer: No local match for Supabase order', payload.new.id);
                }
            }
        }, 'CustomerPortal');

        console.log('📡 Customer: Subscribed to realtime order updates');
    },

    getStatusLabel(status) {
        const labels = {
            'pending': 'Chờ xác nhận',
            'confirmed': 'Đã xác nhận',
            'preparing': 'Đang chuẩn bị',
            'ready': 'Sẵn sàng giao',
            'delivering': 'Đang giao hàng',
            'completed': 'Hoàn thành',
            'served': 'Đã phục vụ',
            'cancelled': 'Đã hủy'
        };
        return labels[status] || status;
    },

    // Dynamically populate dine-in table dropdown from localStorage/TableManagement
    populateDineinTables() {
        const select = document.getElementById('dineinTable');
        if (!select) return;

        // Try to get tables from localStorage (saved by TableManagement)
        let tables = [];
        const saved = localStorage.getItem('fb_tables');
        if (saved) {
            try {
                tables = JSON.parse(saved);
            } catch (e) {
                tables = [];
            }
        }

        // Default tables if none exist
        if (tables.length === 0) {
            tables = [];
            for (let i = 1; i <= 12; i++) {
                tables.push({ id: i, name: `Bàn ${i}` });
            }
        }

        // Build options
        let optionsHTML = '<option value="">-- Chọn bàn --</option>';
        tables.forEach(table => {
            optionsHTML += `<option value="${table.id}">${table.name}</option>`;
        });

        select.innerHTML = optionsHTML;
        console.log('Customer: Populated', tables.length, 'tables');
    },

    // Listen for table updates from TableManagement
    listenForTableUpdates() {
        window.addEventListener('tables-updated', (e) => {
            this.populateDineinTables();
        });
    },


    // ========================================
    // LEVEL 1: FILTER BY GROUP
    // ========================================
    filterByGroup(group) {
        this.currentGroup = group;
        this.currentCategory = 'all';
        this.currentSubcategory = 'all';

        // Update active state
        document.querySelectorAll('#menuGroups md-filter-chip').forEach(chip => {
            chip.selected = chip.dataset.group === group;
        });

        // Render Level 2 categories
        this.renderCategories(group);

        // Clear Level 3
        const subcatContainer = document.getElementById('menuSubcategories');
        if (subcatContainer) subcatContainer.innerHTML = '';

        // Render menu based on group (unified for all including combo)
        this.renderMenu(group === 'all' ? 'all' : this.mapGroupToCategory(group));

        // Haptic feedback
        if (typeof MobilePagination !== 'undefined') {
            MobilePagination.triggerHaptic('light');
        }
    },

    // Map new groups to legacy categories
    mapGroupToCategory(group) {
        const mapping = {
            'beverages': 'drinks',
            'food': 'food',
            'dessert': 'dessert',
            'combo': 'combo'
        };
        return mapping[group] || group;
    },

    // ========================================
    // LEVEL 2: RENDER CATEGORIES
    // ========================================
    renderCategories(group) {
        const container = document.getElementById('menuCategories');
        if (!container) return;

        // Hide if 'all' group only - combo now shows its Level 2 categories
        if (group === 'all') {
            container.innerHTML = '';
            return;
        }

        // Get categories from MenuHierarchy
        let categories = [];
        if (typeof MenuHierarchy !== 'undefined') {
            categories = MenuHierarchy.getCategories(group);
        } else if (typeof menuSubcategories !== 'undefined') {
            // Fallback to legacy subcategories
            const legacyCat = this.mapGroupToCategory(group);
            categories = menuSubcategories[legacyCat] || [];
        }

        if (categories.length === 0) {
            container.innerHTML = '';
            return;
        }

        container.innerHTML = `
            <md-chip-set>
                <md-filter-chip label="Tất cả" data-cat="all" onclick="CustomerApp.filterCategory('all')" selected>
                    <md-icon slot="icon">grid_view</md-icon>
                </md-filter-chip>
                ${categories.map(cat => `
                    <md-filter-chip label="${cat.name}" data-cat="${cat.id}" onclick="CustomerApp.filterCategory('${cat.id}')">
                        <md-icon slot="icon">${this.getMaterialIcon(cat.icon)}</md-icon>
                    </md-filter-chip>
                `).join('')}
            </md-chip-set>
        `;
    },

    getMaterialIcon(emoji) {
        // Map emoji to material icon if possible, otherwise return generic
        // This is a simple helper since we are replacing emojis with icons where appropriate
        // For dynamic content from data.js which uses emojis, we might just keep using emojis
        // inside the chip but Material chips expect icons in slot="icon".
        // We can actually put the emoji in the label or try to map.
        // For now let's just use a generic icon if it's an emoji we can't easily map,
        // or just use the emoji as text if the component supports it.
        // Material Web chips slot="icon" expects an md-icon or svg.
        // We will just return a generic icon for categories to look clean
        return 'restaurant';
    },

    // ========================================
    // LEVEL 2: FILTER BY CATEGORY
    // ========================================
    filterCategory(category) {
        this.currentCategory = category;
        this.currentSubcategory = 'all';

        // Update active state
        document.querySelectorAll('#menuCategories md-filter-chip').forEach(chip => {
            chip.selected = chip.dataset.cat === category;
        });

        // Render Level 3 subcategories
        this.renderSubcategoriesLevel3(category);

        // Render menu
        this.renderMenu(this.mapGroupToCategory(this.currentGroup));

        // Haptic feedback
        if (typeof MobilePagination !== 'undefined') {
            MobilePagination.triggerHaptic('light');
        }
    },

    // ========================================
    // LEVEL 3: RENDER SUBCATEGORIES
    // ========================================
    renderSubcategoriesLevel3(category) {
        const container = document.getElementById('menuSubcategories');
        if (!container) return;

        if (category === 'all') {
            container.innerHTML = '';
            return;
        }

        // Get subcategories from MenuHierarchy
        let subcategories = [];
        if (typeof MenuHierarchy !== 'undefined') {
            subcategories = MenuHierarchy.getSubcategories(category);
        }

        if (subcategories.length === 0) {
            container.innerHTML = '';
            return;
        }

        container.innerHTML = `
            <md-chip-set>
                <md-filter-chip label="Tất cả" data-sub="all" onclick="CustomerApp.filterSubcategory('all')" selected></md-filter-chip>
                ${subcategories.map(sub => `
                    <md-filter-chip label="${sub.name}" data-sub="${sub.id}" onclick="CustomerApp.filterSubcategory('${sub.id}')">
                    </md-filter-chip>
                `).join('')}
            </md-chip-set>
        `;
    },

    // ========================================
    // LEVEL 3: FILTER BY SUBCATEGORY
    // ========================================
    filterSubcategory(subcategory) {
        this.currentSubcategory = subcategory;

        // Update active state
        document.querySelectorAll('#menuSubcategories md-filter-chip').forEach(chip => {
            chip.selected = chip.dataset.sub === subcategory;
        });

        // Render menu
        this.renderMenu(this.mapGroupToCategory(this.currentGroup));
    },

    // ========================================
    // RENDER COMBOS
    // ========================================
    renderCombos() {
        const grid = document.getElementById('customerMenuGrid');
        if (!grid) return;

        let combos = [];
        if (typeof MenuHierarchy !== 'undefined') {
            combos = MenuHierarchy.combos;
        }

        if (combos.length === 0) {
            grid.innerHTML = `
                <div style="grid-column: 1/-1; text-align: center; padding: 40px;">
                    <div style="font-size: 3rem; margin-bottom: 16px;">🎁</div>
                    <p>Chưa có combo nào</p>
                </div>`;
            return;
        }

        grid.innerHTML = combos.map((combo, index) => `
            <div class="combo-card glass-card animate-fadeInUp hover-lift md-ripple md-focus-ring"
                 onclick="CustomerApp.addComboToCart('${combo.id}')"
                 style="animation-delay: ${index * 100}ms">
                <div class="combo-badge">-${this.formatPrice(combo.savings)}</div>
                <div class="combo-name" style="font-weight: 700; font-size: 1.1rem;">${combo.icon} ${combo.name}</div>
                <div class="combo-desc" style="opacity: 0.8; font-size: 0.9rem;">${combo.description}</div>
                <div class="combo-pricing" style="margin-top: 12px;">
                    <span class="combo-original" style="text-decoration: line-through; opacity: 0.5; font-size: 0.9rem;">${this.formatPrice(combo.originalPrice)}</span>
                    <span class="combo-price" style="color: var(--primary-2026); font-weight: 800; font-size: 1.2rem; display: block;">${this.formatPrice(combo.comboPrice)}</span>
                    <span class="combo-savings" style="color: var(--accent-neon); font-weight: 600; font-size: 0.85rem;">Tiết kiệm ${this.formatPrice(combo.savings)}</span>
                </div>
            </div>
        `).join('');
    },

    // Add combo to cart
    addComboToCart(comboId) {
        if (typeof MenuHierarchy === 'undefined') return;

        const combo = MenuHierarchy.combos.find(c => c.id === comboId);
        if (!combo) return;

        // Add combo as special cart item
        const comboCartItem = {
            id: comboId,
            name: combo.name,
            price: combo.comboPrice,
            icon: combo.icon,
            isCombo: true,
            items: combo.items
        };

        this.cart.push(comboCartItem);
        this.saveCart();
        this.updateCartUI();
        this.showToast(`🎁 Đã thêm ${combo.name} vào giỏ!`);

        // Haptic feedback
        if (typeof MobilePagination !== 'undefined') {
            MobilePagination.triggerHaptic('success');
        }
    },

    // ========================================
    // FEATURED SECTION - with FeaturedItemsService support
    // ========================================
    async loadFeaturedItems() {
        const container = document.getElementById('featuredCards');
        if (!container) return;

        let featured = [];

        // Try to get featured items from FeaturedItemsService
        if (typeof FeaturedItemsService !== 'undefined') {
            try {
                const result = await FeaturedItemsService.getFeaturedItems();
                if (result.success && result.data && result.data.length > 0) {
                    featured = result.data;
                    console.log('🔥 Loaded', featured.length, 'featured items from FeaturedItemsService');
                }
            } catch (e) {
                console.warn('Could not load featured items from service:', e);
            }
        }

        // Fallback to default featured items - REMOVED to use Service only
        /*
        if (featured.length === 0) {
            const featuredIds = typeof window.featuredItems !== 'undefined' ? window.featuredItems : [1, 2, 16, 51, 66];
            featured = this.menuData.filter(item => featuredIds.includes(item.id));
        }
        */

        // Render featured cards
        this.renderFeaturedCards(featured);
    },

    renderFeaturedCards(featured) {
        const container = document.getElementById('featuredCards');
        if (!container) return;

        if (featured.length === 0) {
            container.innerHTML = '<p class="text-muted" style="text-align: center; padding: 20px;">Không có món bán chạy</p>';
            return;
        }

        container.innerHTML = featured.map((item, index) => `
            <div class="featured-card glass-card animate-fadeInUp hover-lift md-ripple md-focus-ring"
                 onclick="CustomerApp.addToCart(${item.id})"
                 style="animation-delay: ${index * 100}ms">
                <div class="featured-card-image micro-scale">${item.icon || '🍽️'}</div>
                <div class="featured-card-body">
                    <div class="featured-card-name" style="font-weight: 600;">${item.name}</div>
                    <div class="featured-card-price" style="color: var(--primary-2026); font-weight: 700;">${this.formatPrice(item.price)}</div>
                </div>
            </div>
        `).join('');
    },

    // Legacy wrapper for backwards compatibility
    renderFeaturedSection() {
        this.loadFeaturedItems();
    },

    // ========================================
    // MENU & SEARCH
    // ========================================
    getMenuItems() {
        return this.menuData.length > 0 ? this.menuData : this.getSampleMenu();
    },

    searchMenu(query) {
        this.searchQuery = query.toLowerCase().trim();
        this.renderMenu(this.currentCategory);
    },

    renderMenu(category = 'all') {
        // Reset subcategory if category changed
        if (this.currentCategory !== category) {
            this.currentSubcategory = 'all';
        }
        this.currentCategory = category;

        // Update subcategory tabs
        // this.renderSubcategoryTabs(category); // Legacy

        const grid = document.getElementById('customerMenuGrid');
        if (!grid) {
            console.error('Menu grid not found!');
            return;
        }

        let items = this.getMenuItems();
        console.log('📜 Rendering, category:', category, 'subcategory:', this.currentSubcategory, 'search:', this.searchQuery);

        // Filter by category
        if (category !== 'all') {
            items = items.filter(item => item.category === category);
        }

        // Filter by subcategory
        if (this.currentSubcategory !== 'all') {
            items = items.filter(item => item.subcategory === this.currentSubcategory);
        }

        // Filter by search query
        if (this.searchQuery) {
            items = items.filter(item =>
                item.name.toLowerCase().includes(this.searchQuery) ||
                (item.description && item.description.toLowerCase().includes(this.searchQuery))
            );
        }

        if (items.length === 0) {
            // Check if daily menu is active but empty (Option B)
            const dailyConfig = localStorage.getItem('daily_menu_config');
            let isDailyMenuEmpty = false;
            if (dailyConfig) {
                try {
                    const config = JSON.parse(dailyConfig);
                    if (config && Array.isArray(config.activeItems) && config.activeItems.length === 0) {
                        isDailyMenuEmpty = true;
                    }
                } catch (e) { }
            }

            if (isDailyMenuEmpty && this.originalMenuData && this.originalMenuData.length > 0) {
                // Daily menu is empty - show special message (Option B)
                grid.innerHTML = `
                    <div class="empty-state-enhanced" style="grid-column: 1/-1; text-align: center; padding: 60px 20px;">
                        <div class="empty-icon" style="font-size: 4.5rem; margin-bottom: 20px; animation: float 3s ease-in-out infinite;">🍽️</div>
                        <h3 style="font-size: 1.3rem; margin-bottom: 12px; color: var(--text-primary);">Hôm nay không có món bán</h3>
                        <p style="color: var(--text-muted); margin-bottom: 24px; font-size: 0.95rem;">
                            Quán chưa cập nhật menu hôm nay.<br>
                            Vui lòng quay lại sau hoặc liên hệ quán!
                        </p>
                        <a href="tel:0909123456" 
                           style="display: inline-flex; align-items: center; gap: 8px; padding: 12px 24px; 
                                  background: linear-gradient(135deg, var(--primary), var(--secondary)); 
                                  color: white; border-radius: 25px; text-decoration: none; font-weight: 500;
                                  box-shadow: 0 4px 15px rgba(99, 102, 241, 0.3);">
                            📞 Gọi ngay
                        </a>
                    </div>`;
                return;
            }

            // Normal search/filter empty state
            const suggestions = ['drinks', 'food', 'dessert'].filter(c => c !== category);
            const categoryLabels = { drinks: '🥤 Đồ uống', food: '🍜 Món ăn', dessert: '🍰 Tráng miệng' };

            grid.innerHTML = `
                <div class="empty-state-enhanced" style="grid-column: 1/-1;">
                    <div class="empty-icon" style="font-size: 4rem; margin-bottom: 16px; animation: float 3s ease-in-out infinite;">🔍</div>
                    <h3 style="font-size: 1.1rem; margin-bottom: 8px;">Không tìm thấy "${this.searchQuery || category}"</h3>
                    <p style="color: var(--text-muted); margin-bottom: 20px;">Thử tìm kiếm khác hoặc chọn danh mục:</p>
                    <div class="empty-suggestions" style="display: flex; gap: 8px; justify-content: center; flex-wrap: wrap;">
                        ${suggestions.map(cat => `
                            <button onclick="CustomerApp.filterMenu('${cat}')" 
                                style="padding: 10px 16px; background: var(--bg-card); border: 1px solid var(--border-color); 
                                       border-radius: 20px; color: var(--text-secondary); font-size: 0.85rem; cursor: pointer;
                                       transition: all 0.2s ease;">
                                ${categoryLabels[cat]}
                            </button>
                        `).join('')}
                    </div>
                </div>`;
            return;
        }

        // Use pagination for large menus
        const self = this;
        if (typeof Pagination !== 'undefined' && items.length > 12) {
            if (!this.menuPaginationInit || Pagination.instances['customerMenuGrid']) {
                Pagination.destroy('customerMenuGrid');
            }
            Pagination.init({
                containerId: 'customerMenuGrid',
                itemsPerPage: 12,
                infiniteScroll: true,
                emptyMessage: 'Không tìm thấy món',
                loadMoreText: 'Xem thêm món',
                getData: () => items,
                renderItem: (item) => self.renderMenuCard(item)
            });
            this.menuPaginationInit = true;
        } else {
            // Render all items directly (small menu)
            grid.innerHTML = items.map((item, index) => `
                <div class="pagination-item" style="animation-delay: ${index * 50}ms">
                    ${this.renderMenuCard(item)}
                </div>
            `).join('');
        }

        if (window.Debug) Debug.info('✅ Rendered', items.length, 'menu cards with animations');
    },

    renderMenuCard(item) {
        // Combo items get special styling with savings badge
        const isCombo = item.isCombo === true;
        const comboClass = isCombo ? 'combo-item' : '';

        // Build price HTML - different for combo vs regular items
        let priceHTML = '';
        if (isCombo && item.originalPrice) {
            priceHTML = `
                <div class="menu-card-price-combo">
                    <span class="original-price">${this.formatPrice(item.originalPrice)}</span>
                    <span class="combo-price" style="color: var(--primary-2026); font-weight: 700; font-size: 1.1rem;">${this.formatPrice(item.price)}</span>
                </div>
                <div class="combo-savings-tag" style="color: #22c55e; font-size: 0.75rem; font-weight: 600;">
                    🎁 Tiết kiệm ${this.formatPrice(item.savings || (item.originalPrice - item.price))}
                </div>
            `;
        } else {
            priceHTML = `<div class="menu-card-price" style="color: var(--primary-2026); font-weight: 700;">${this.formatPrice(item.price)}</div>`;
        }

        // Build description for combo
        const descHTML = isCombo && item.description ?
            `<div class="combo-description" style="font-size: 0.75rem; opacity: 0.7; margin-top: 2px;">${item.description}</div>` : '';

        return `
            <div class="menu-card glass-card animate-fadeInUp hover-lift ${comboClass}" data-id="${item.id}"
                 onclick="CustomerApp.showItemDetail(${item.id})" style="border: 1px solid rgba(255,255,255,0.1); position: relative;">
                ${isCombo ? `<div class="savings-badge">-${this.formatPrice(item.savings || (item.originalPrice - item.price))}</div>` : ''}
                <div class="menu-card-image micro-scale">${item.icon || '🍽️'}</div>
                <div class="menu-card-body">
                    <div class="menu-card-name" style="font-weight: 600;">${item.name}</div>
                    ${descHTML}
                    ${priceHTML}
                    <md-filled-tonal-button class="menu-card-add"
                            onclick="event.stopPropagation(); CustomerApp.addToCart(${item.id})">
                        ➕ Thêm
                    </md-filled-tonal-button>
                </div>
            </div>
        `;
    },

    showItemDetail(itemId) {
        const item = this.getMenuItems().find(i => i.id === itemId || String(i.id) === String(itemId));
        if (!item) return;

        // Use MobileUX bottom sheet if available
        if (typeof MobileUX !== 'undefined') {
            MobileUX.showItemDetail(item);
        } else {
            // Fallback to confirm dialog
            const confirmed = confirm(`${item.icon} ${item.name}\n\nGiá: ${this.formatPrice(item.price)}\n\nThêm vào giỏ hàng?`);
            if (confirmed) {
                this.addToCart(itemId);
            }
        }
    },

    getSampleMenu() {
        return [
            { id: 1, name: 'Cà Phê Đen Đá', icon: '☕', price: 20000, category: 'drinks' },
            { id: 2, name: 'Cà Phê Sữa Đá', icon: '☕', price: 25000, category: 'drinks' },
            { id: 3, name: 'Bạc Xỉu', icon: '🥛', price: 28000, category: 'drinks' },
            { id: 4, name: 'Trà Đào', icon: '🍑', price: 35000, category: 'drinks' },
            { id: 5, name: 'Sinh Tố Bơ', icon: '🥑', price: 40000, category: 'drinks' },
            { id: 6, name: 'Phở Bò', icon: '🍜', price: 55000, category: 'food' },
            { id: 7, name: 'Bún Bò Huế', icon: '🍜', price: 50000, category: 'food' },
            { id: 8, name: 'Cơm Tấm Sườn', icon: '🍚', price: 45000, category: 'food' },
            { id: 9, name: 'Mì Quảng', icon: '🍝', price: 48000, category: 'food' },
            { id: 10, name: 'Bánh Flan', icon: '🍮', price: 20000, category: 'dessert' },
            { id: 11, name: 'Chè Thái', icon: '🍧', price: 25000, category: 'dessert' },
            { id: 12, name: 'Kem Dừa', icon: '🍦', price: 30000, category: 'dessert' }
        ];
    },

    // ========================================
    // CART
    // ========================================
    addToCart(itemId) {
        if (window.Debug) Debug.info('📦 Adding item:', itemId);
        const items = this.getMenuItems();
        const item = items.find(i => i.id === itemId || String(i.id) === String(itemId));

        if (!item) {
            if (window.Debug) Debug.error('❌ Item not found:', itemId);
            this.showToast('Không tìm thấy món này', 'error');
            return;
        }

        const existing = this.cart.find(c => c.id === item.id || String(c.id) === String(item.id));
        if (existing) {
            existing.qty++;
            if (window.Debug) Debug.info('📦 Updated qty:', existing.qty);
        } else {
            this.cart.push({ ...item, qty: 1 });
            if (window.Debug) Debug.info('📦 Added new item to cart');
        }

        this.saveCart();
        this.updateCartUI();
        this.showToast(`✅ Đã thêm ${item.name}`);
    },

    removeFromCart(itemId) {
        this.cart = this.cart.filter(c => c.id !== itemId && String(c.id) !== String(itemId));
        this.saveCart();
        this.updateCartUI();
    },

    updateQty(itemId, delta) {
        const item = this.cart.find(c => c.id === itemId || String(c.id) === String(itemId));
        if (!item) return;

        item.qty += delta;
        if (item.qty <= 0) {
            this.removeFromCart(itemId);
        } else {
            this.saveCart();
            this.updateCartUI();
        }
    },

    saveCart() {
        localStorage.setItem('customer_cart', JSON.stringify(this.cart));
    },

    loadCart() {
        const saved = localStorage.getItem('customer_cart');
        if (saved) {
            this.cart = JSON.parse(saved);
        }
    },

    updateCartUI() {
        const count = this.cart.reduce((sum, item) => sum + item.qty, 0);
        const total = this.cart.reduce((sum, item) => sum + (item.price * item.qty), 0);

        // Update header cart count
        const cartCount = document.getElementById('cartCount');
        if (cartCount) cartCount.textContent = count;

        // Update floating cart
        const floatingCount = document.getElementById('floatingCartCount');
        if (floatingCount) floatingCount.textContent = count;

        const floatingTotal = document.getElementById('floatingCartTotal');
        if (floatingTotal) floatingTotal.textContent = this.formatPrice(total);

        // Update FAB cart badge (M3 bottom nav)
        const fabBadge = document.getElementById('fabCartBadge');
        if (fabBadge) {
            fabBadge.textContent = count > 0 ? count : '';
        }

        // Render cart items
        this.renderCartItems('floatingCartItems');
        this.renderCartItems('orderItems');

        // Update order section
        this.updateOrderSummary();
    },

    renderCartItems(containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;

        if (this.cart.length === 0) {
            container.innerHTML = '<p class="empty-cart">Chưa có món nào trong giỏ hàng</p>';
            return;
        }

        container.innerHTML = this.cart.map(item => `
            <div class="order-item">
                <div class="order-item-info">
                    <div class="order-item-name">${item.icon} ${item.name}</div>
                    <div class="order-item-price">${this.formatPrice(item.price)}</div>
                </div>
                <div class="order-item-qty" style="display: flex; align-items: center; gap: 8px;">
                    <button class='qty-btn' onclick='CustomerApp.updateQty("${item.id}", -1)'>Bỏ</button>
                    <span class="qty-value" style="font-weight: 600; min-width: 24px; text-align: center;">${item.qty}</span>
                    <button class='qty-btn' onclick='CustomerApp.updateQty("${item.id}", 1)'>Thêm</button>
                </div>
                <div class="order-item-total">${this.formatPrice(item.price * item.qty)}</div>
            </div>
        `).join('');
    },

    toggleCart() {
        const cart = document.getElementById('floatingCart');
        if (cart) cart.classList.toggle('show');
    },

    goToOrder() {
        this.toggleCart();
        this.showSection('order');
    },

    // ========================================
    // PROMO CODES
    // ========================================
    applyPromo() {
        const codeInput = document.getElementById('promoCode');
        const statusDiv = document.getElementById('promoStatus');
        if (!codeInput || !statusDiv) return;

        const code = codeInput.value.toUpperCase().trim();
        if (!code) {
            statusDiv.innerHTML = '<span class="error">Vui lòng nhập mã giảm giá</span>';
            statusDiv.className = 'promo-status error';
            return;
        }

        const promo = this.promoCodes[code];
        const subtotal = this.cart.reduce((sum, item) => sum + (item.price * item.qty), 0);

        if (!promo) {
            statusDiv.innerHTML = '❌ Mã giảm giá không hợp lệ';
            statusDiv.className = 'promo-status error';
            this.appliedPromo = null;
            this.updateOrderSummary();
            return;
        }

        if (subtotal < promo.minOrder) {
            statusDiv.innerHTML = `❌ Đơn tối thiểu ${this.formatPrice(promo.minOrder)}`;
            statusDiv.className = 'promo-status error';
            this.appliedPromo = null;
            this.updateOrderSummary();
            return;
        }

        this.appliedPromo = { code, ...promo };
        const discountAmount = promo.type === 'percent'
            ? Math.round(subtotal * promo.discount / 100)
            : promo.discount;

        statusDiv.innerHTML = `✅ ${promo.description} (-${this.formatPrice(discountAmount)})`;
        statusDiv.className = 'promo-status success animate-bounce';
        this.showToast(`🎉 Áp dụng mã ${code} thành công!`);
        this.updateOrderSummary();

        // Celebration effect!
        if (typeof Confetti !== 'undefined') {
            Confetti.promoSuccess(statusDiv);
        }
    },

    // ========================================
    // ORDER
    // ========================================
    setOrderType(type) {
        this.orderType = type;

        document.querySelectorAll('.order-type-selector md-filter-chip').forEach(chip => {
            chip.selected = chip.dataset.type === type;
        });

        const deliveryInfo = document.getElementById('deliveryInfo');
        const dineinInfo = document.getElementById('dineinInfo');

        if (deliveryInfo) {
            deliveryInfo.style.display = type === 'delivery' ? 'block' : 'none';
        }
        if (dineinInfo) {
            dineinInfo.style.display = type === 'dinein' ? 'block' : 'none';
        }

        this.updateOrderSummary();
    },

    updateOrderSummary() {
        const subtotal = this.cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
        const deliveryFee = this.orderType === 'delivery' ? 15000 : 0;

        // Calculate discount
        let discount = 0;
        if (this.appliedPromo && subtotal >= this.appliedPromo.minOrder) {
            discount = this.appliedPromo.type === 'percent'
                ? Math.round(subtotal * this.appliedPromo.discount / 100)
                : this.appliedPromo.discount;
        }

        const total = Math.max(0, subtotal - discount + deliveryFee);

        const subtotalEl = document.getElementById('orderSubtotal');
        const feeEl = document.getElementById('deliveryFee');
        const totalEl = document.getElementById('orderTotal');

        if (subtotalEl) subtotalEl.textContent = this.formatPrice(subtotal);
        if (feeEl) feeEl.textContent = this.formatPrice(deliveryFee);
        if (totalEl) totalEl.textContent = this.formatPrice(total);
    },

    checkout() {
        if (this.cart.length === 0) {
            this.showToast('Vui lòng thêm món vào giỏ hàng', 'error');
            return;
        }

        // Validate based on order type
        if (this.orderType === 'dinein') {
            const tableSelect = document.getElementById('dineinTable');
            if (tableSelect && !tableSelect.value) {
                this.showToast('Vui lòng chọn bàn', 'error');
                return;
            }
        }

        if (this.orderType === 'delivery') {
            const name = document.getElementById('deliveryName')?.value;
            const phone = document.getElementById('deliveryPhone')?.value;
            const address = document.getElementById('deliveryAddress')?.value;

            if (!name || !phone || !address) {
                this.showToast('Vui lòng nhập đầy đủ thông tin giao hàng', 'error');
                return;
            }
        }

        const subtotal = this.cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
        const deliveryFee = this.orderType === 'delivery' ? 15000 : 0;
        let discount = 0;
        if (this.appliedPromo && subtotal >= this.appliedPromo.minOrder) {
            discount = this.appliedPromo.type === 'percent'
                ? Math.round(subtotal * this.appliedPromo.discount / 100)
                : this.appliedPromo.discount;
        }
        const total = Math.max(0, subtotal - discount + deliveryFee);

        // Get table number for dine-in
        const tableNumber = this.orderType === 'dinein'
            ? document.getElementById('dineinTable')?.value || null
            : null;

        // Create order with tracking
        const order = {
            id: 'ORD' + Date.now(),
            items: [...this.cart],
            orderType: this.orderType,
            tableNumber: tableNumber,
            subtotal,
            discount,
            deliveryFee,
            total,
            promoCode: this.appliedPromo?.code || null,
            status: 'pending',
            statusHistory: [
                { status: 'pending', time: new Date().toISOString(), label: 'Đã đặt hàng' }
            ],
            createdAt: new Date().toISOString(),
            estimatedTime: this.orderType === 'delivery' ? '30-45 phút' : '15-20 phút'
        };

        // Add delivery info if applicable
        if (this.orderType === 'delivery') {
            order.delivery = {
                name: document.getElementById('deliveryName')?.value,
                phone: document.getElementById('deliveryPhone')?.value,
                address: document.getElementById('deliveryAddress')?.value,
                note: document.getElementById('deliveryNote')?.value
            };
        }

        // Save order
        const orders = JSON.parse(localStorage.getItem('customer_orders') || '[]');
        orders.unshift(order);
        localStorage.setItem('customer_orders', JSON.stringify(orders));

        // Clear cart and promo
        this.cart = [];
        this.appliedPromo = null;
        this.saveCart();
        this.updateCartUI();

        // Clear promo input
        const promoInput = document.getElementById('promoCode');
        const promoStatus = document.getElementById('promoStatus');
        if (promoInput) promoInput.value = '';
        if (promoStatus) promoStatus.innerHTML = '';

        this.showToast('🎉 Đặt hàng thành công!');
        this.renderOrderHistory();

        // Celebration confetti!
        if (typeof Confetti !== 'undefined') {
            Confetti.orderSuccess();
        }

        // Sync to Supabase if available
        this.syncOrderToSupabase(order);

        // Subscribe to realtime updates for this order
        this.subscribeToOrderUpdates(order.id);

        // Show confirmation with animation
        setTimeout(() => {
            alert(`✅ Đặt hàng thành công!\n\nMã đơn: ${order.id}\nTổng tiền: ${this.formatPrice(order.total)}\nThời gian dự kiến: ${order.estimatedTime}\n\nNhà hàng sẽ liên hệ xác nhận ngay!`);
        }, 500);

        // Navigate to tracking
        this.showSection('tracking');
        document.getElementById('trackingOrderId').value = order.id;
        this.trackOrder();
    },

    // Sync order to Supabase
    async syncOrderToSupabase(order) {
        console.log('🔄 syncOrderToSupabase called:', order.id);

        const isConfigured = typeof isSupabaseConfigured !== 'undefined' && isSupabaseConfigured();
        console.log('🔄 Supabase configured:', isConfigured);

        const isOnline = typeof OfflineManager !== 'undefined' ? OfflineManager.isOnline : navigator.onLine;
        console.log('🔄 Online:', isOnline);

        if (!isOnline) {
            // Queue for offline sync
            if (typeof OfflineManager !== 'undefined') {
                await OfflineManager.queueOrder(order);
                this.showToast('📴 Đã lưu đơn offline, sẽ đồng bộ khi có mạng');
            }
            return;
        }

        if (isConfigured && typeof SupabaseService !== 'undefined') {
            try {
                // Build order data without 'address' field (not in Supabase schema)
                const orderData = {
                    order_number: order.id,
                    customer_name: order.delivery?.name || 'Khách',
                    customer_phone: order.delivery?.phone || '',
                    items: JSON.stringify(order.items),
                    subtotal: order.subtotal,
                    discount: order.discount || 0,
                    total: order.total,
                    status: 'pending',
                    order_type: order.orderType,
                    table_number: order.tableNumber || null,
                    notes: order.delivery?.note || (order.tableNumber ? `Bàn ${order.tableNumber}` : (order.delivery?.address || 'Tại quán'))
                };

                console.log('🔄 Creating order with data:', orderData);

                const result = await SupabaseService.createOrder(orderData);

                if (result.error) {
                    console.error('❌ Failed to sync order:', result.error);
                    if (window.Debug) Debug.error('Failed to sync order:', result.error);
                } else {
                    console.log('✅ Order synced to Supabase:', result.data?.id);
                    if (window.Debug) Debug.info('✅ Order synced to Supabase:', result.data?.id);
                    // Update local order with Supabase ID
                    order.supabaseId = result.data?.id;
                    this.updateLocalOrder(order);
                }
            } catch (err) {
                if (window.Debug) Debug.error('Supabase sync error:', err);
            }
        }
    },

    // Subscribe to realtime order updates
    subscribeToOrderUpdates(orderId) {
        if (typeof SupabaseService !== 'undefined' && isSupabaseConfigured?.()) {
            SupabaseService.subscribeToOrderById(orderId, (payload) => {
                if (window.Debug) Debug.info('🔔 Order update received:', payload);

                // Update local order status
                const newStatus = payload.new?.status;
                if (newStatus) {
                    this.updateOrderStatus(orderId, newStatus);
                }
            });
        }
    },

    // Update local order status
    updateOrderStatus(orderId, newStatus) {
        const orders = JSON.parse(localStorage.getItem('customer_orders') || '[]');
        const orderIndex = orders.findIndex(o => o.id === orderId || o.supabaseId === orderId);

        if (orderIndex !== -1) {
            orders[orderIndex].status = newStatus;
            orders[orderIndex].statusHistory = orders[orderIndex].statusHistory || [];
            orders[orderIndex].statusHistory.push({
                status: newStatus,
                time: new Date().toISOString()
            });
            localStorage.setItem('customer_orders', JSON.stringify(orders));

            // Re-render if on tracking page
            const trackingContainer = document.getElementById('currentOrderTracking');
            if (trackingContainer && document.getElementById('trackingOrderId')?.value === orderId) {
                this.renderOrderStatus(orders[orderIndex], trackingContainer);
            }

            // Re-render order history
            this.renderOrderHistory();
        }
    },

    // Update local order with new data
    updateLocalOrder(order) {
        console.log('📝 updateLocalOrder called for:', order.id, 'supabaseId:', order.supabaseId);

        const orders = JSON.parse(localStorage.getItem('customer_orders') || '[]');
        const orderIndex = orders.findIndex(o => o.id === order.id);

        if (orderIndex !== -1) {
            orders[orderIndex] = { ...orders[orderIndex], ...order };
            localStorage.setItem('customer_orders', JSON.stringify(orders));
            console.log('✅ updateLocalOrder: Order updated at index', orderIndex, 'with supabaseId:', order.supabaseId);
        } else {
            console.warn('⚠️ updateLocalOrder: Order not found in localStorage:', order.id);
        }
    },

    // ========================================
    // ORDER TRACKING
    // ========================================
    trackOrder() {
        const orderId = document.getElementById('trackingOrderId')?.value.trim();
        const container = document.getElementById('currentOrderTracking');
        if (!container) return;

        if (!orderId) {
            container.innerHTML = '<p class="no-order">Nhập mã đơn hàng để theo dõi trạng thái</p>';
            return;
        }

        const orders = JSON.parse(localStorage.getItem('customer_orders') || '[]');
        const order = orders.find(o => o.id === orderId);

        if (!order) {
            container.innerHTML = `
                <div style="text-align: center; padding: 20px;">
                    <div style="font-size: 3rem; margin-bottom: 12px;">❌</div>
                    <p>Không tìm thấy đơn hàng "${orderId}"</p>
                </div>`;
            return;
        }

        this.renderOrderStatus(order, container);
    },

    renderOrderStatus(order, container) {
        const statusLabels = {
            'pending': '⏳ Chờ xác nhận',
            'confirmed': '✅ Đã xác nhận',
            'preparing': '👨‍🍳 Đang chuẩn bị',
            'ready': '✨ Sẵn sàng',
            'delivering': '🛵 Đang giao',
            'completed': '🎉 Hoàn thành'
        };

        const steps = [
            { status: 'pending', icon: '📝', label: 'Đặt hàng' },
            { status: 'confirmed', icon: '✅', label: 'Xác nhận' },
            { status: 'preparing', icon: '👨‍🍳', label: 'Chuẩn bị' },
            {
                status: order.orderType === 'delivery' ? 'delivering' : 'ready',
                icon: order.orderType === 'delivery' ? '🛵' : '✨',
                label: order.orderType === 'delivery' ? 'Giao hàng' : 'Sẵn sàng'
            },
            { status: 'completed', icon: '🎉', label: 'Hoàn thành' }
        ];

        const currentIndex = steps.findIndex(s => s.status === order.status);

        container.innerHTML = `
            <div class="order-status-card">
                <div class="order-status-header">
                    <span class="order-id">${order.id}</span>
                    <span class="order-status-badge ${order.status}">${statusLabels[order.status] || order.status}</span>
                </div>
                
                <div class="order-timeline">
                    ${steps.map((step, index) => {
            const historyItem = order.statusHistory?.find(h => h.status === step.status);
            const isCompleted = index < currentIndex;
            const isActive = index === currentIndex;

            return `
                            <div class="timeline-step ${isCompleted ? 'completed' : ''} ${isActive ? 'active' : ''}">
                                <div class="timeline-icon">${step.icon}</div>
                                <div class="timeline-content">
                                    <div class="timeline-title">${step.label}</div>
                                    <div class="timeline-time">${historyItem ? this.formatDateTime(historyItem.time) : (isActive ? 'Đang xử lý...' : '---')}</div>
                                </div>
                            </div>
                        `;
        }).join('')}
                </div>

                <div style="padding: 12px; background: rgba(99,102,241,0.1); border-radius: 10px; text-align: center;">
                    <strong>⏱️ Thời gian dự kiến:</strong> ${order.estimatedTime || '15-20 phút'}
                </div>

                <div style="margin-top: 16px;">
                    <strong>📦 Chi tiết đơn hàng:</strong>
                    <div style="margin-top: 8px; font-size: 0.9rem; color: var(--text-secondary);">
                        ${order.items.map(item => `${item.icon} ${item.name} x${item.qty}`).join('<br>')}
                    </div>
                    <div style="margin-top: 12px; font-weight: 600; color: var(--secondary);">
                        Tổng: ${this.formatPrice(order.total)}
                    </div>
                </div>
            </div>
        `;
    },

    renderOrderHistory() {
        const container = document.getElementById('orderHistoryList');
        if (!container) return;

        const orders = JSON.parse(localStorage.getItem('customer_orders') || '[]');

        if (orders.length === 0) {
            container.innerHTML = '<p class="no-orders">Chưa có đơn hàng nào</p>';
            return;
        }

        // Use pagination for order history
        const self = this;
        if (typeof Pagination !== 'undefined' && orders.length > 5) {
            Pagination.destroy('orderHistoryList');
            Pagination.init({
                containerId: 'orderHistoryList',
                itemsPerPage: 5,
                infiniteScroll: false, // Use load more button
                emptyMessage: 'Chưa có đơn hàng nào',
                loadMoreText: 'Xem thêm lịch sử',
                getData: () => orders,
                renderItem: (order) => self.renderHistoryCard(order)
            });
        } else {
            container.innerHTML = orders.map(order => `
                <div class="pagination-item">${this.renderHistoryCard(order)}</div>
            `).join('');
        }
    },

    renderHistoryCard(order) {
        return `
            <div class="history-card md-ripple md-focus-ring" onclick="CustomerApp.viewHistoryOrder('${order.id}')">
                <div class="history-info">
                    <h4>${order.id}</h4>
                    <p>${this.formatDateTime(order.createdAt)} • ${order.items.length} món</p>
                </div>
                <div class="history-amount">${this.formatPrice(order.total)}</div>
            </div>
        `;
    },

    viewHistoryOrder(orderId) {
        document.getElementById('trackingOrderId').value = orderId;
        this.trackOrder();
        // Scroll to top of tracking section
        document.getElementById('currentOrderTracking')?.scrollIntoView({ behavior: 'smooth' });
    },

    // ========================================
    // LOYALTY
    // ========================================
    showMemberModal() {
        document.getElementById('memberModal').classList.add('show');
    },

    closeMemberModal() {
        document.getElementById('memberModal').classList.remove('show');
    },

    lookupMember() {
        const phone = document.getElementById('lookupPhone')?.value;
        if (!phone) {
            this.showToast('Vui lòng nhập số điện thoại', 'error');
            return;
        }

        // Check from CustomerLoyalty if available
        let customers = [];
        if (typeof CustomerLoyalty !== 'undefined') {
            customers = CustomerLoyalty.customers;
        } else {
            customers = JSON.parse(localStorage.getItem('fb_customers') || '[]');
        }

        const customer = customers.find(c => c.phone === phone);
        const resultDiv = document.getElementById('memberResult');

        if (customer) {
            this.currentMember = customer;
            resultDiv.innerHTML = `
                <div class="member-found">
                    <h3>✅ Xin chào, ${customer.name}!</h3>
                    <p>Hạng: ${customer.tier}</p>
                    <p>Điểm tích lũy: <strong>${customer.points}</strong></p>
                    <p>Tổng chi tiêu: ${this.formatPrice(customer.totalSpent)}</p>
                </div>
            `;
            this.updateMemberCard(customer);
            this.closeMemberModal();
            this.showToast(`Chào mừng ${customer.name}!`);
        } else {
            resultDiv.innerHTML = `
                <div class="member-not-found">
                    <p>❌ Không tìm thấy thành viên</p>
                    <button onclick="CustomerApp.closeAndRegister()">Đăng ký ngay</button>
                </div>
            `;
        }
    },

    closeAndRegister() {
        this.closeMemberModal();
        this.showRegisterModal();
    },

    updateMemberCard(customer) {
        document.getElementById('memberName').textContent = customer.name;
        document.getElementById('memberPhone').textContent = customer.phone;
        document.getElementById('memberPoints').textContent = customer.points;

        const tierBadge = document.getElementById('memberTier');
        const tierIcons = { 'Bronze': '🥉', 'Silver': '🥈', 'Gold': '🥇', 'Diamond': '💎' };
        tierBadge.textContent = `${tierIcons[customer.tier] || '🥉'} ${customer.tier}`;

        // Generate QR
        const qrDiv = document.getElementById('memberQR');
        if (qrDiv && typeof QRCode !== 'undefined') {
            qrDiv.innerHTML = '';
            QRCode.toCanvas(qrDiv, customer.qrCode || customer.phone, {
                width: 120,
                margin: 1,
                color: { dark: '#000', light: '#fff' }
            }, function (err) {
                if (err) console.error(err);
            });
        }
    },

    showRegisterModal() {
        document.getElementById('registerModal').classList.add('show');
    },

    closeRegisterModal() {
        document.getElementById('registerModal').classList.remove('show');
    },

    registerMember() {
        const name = document.getElementById('regName')?.value;
        const phone = document.getElementById('regPhone')?.value;
        const email = document.getElementById('regEmail')?.value;

        if (!name || !phone) {
            this.showToast('Vui lòng nhập họ tên và số điện thoại', 'error');
            return;
        }

        const newCustomer = {
            id: 'C' + Date.now(),
            name,
            phone,
            email,
            tier: 'Bronze',
            points: 0,
            totalSpent: 0,
            visits: 0,
            qrCode: `MEMBER-${phone}`,
            history: [],
            createdAt: new Date().toISOString()
        };

        // Save customer
        const customers = JSON.parse(localStorage.getItem('fb_customers') || '[]');
        customers.push(newCustomer);
        localStorage.setItem('fb_customers', JSON.stringify(customers));

        this.currentMember = newCustomer;
        this.updateMemberCard(newCustomer);
        this.closeRegisterModal();
        this.showToast('🎉 Đăng ký thành viên thành công!');
        this.showSection('loyalty');
    },

    // ========================================
    // NAVIGATION
    // ========================================
    showSection(sectionId) {
        document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));

        // Update Nav Chips
        const navChips = document.querySelectorAll('.customer-nav md-filter-chip');
        navChips.forEach(chip => {
            // Check based on onclick attribute or id since data-section might be missing on custom element if I didn't add it
            // In HTML I added id="nav-menu", etc.
            if (chip.id === `nav-${sectionId}`) {
                chip.selected = true;
            } else {
                chip.selected = false;
            }
        });

        document.getElementById(`section-${sectionId}`)?.classList.add('active');
        // document.querySelector(`[data-section="${sectionId}"]`)?.classList.add('active'); // No longer needed for chips

        // Load order history when visiting tracking section
        if (sectionId === 'tracking') {
            this.renderOrderHistory();
        }
    },

    // ========================================
    // UTILITIES
    // ========================================
    formatPrice(amount) {
        return window.utils ? window.utils.formatPrice(amount) : new Intl.NumberFormat('vi-VN').format(amount) + 'đ';
    },

    formatDateTime(dateStr) {
        const date = new Date(dateStr);
        if (window.utils) {
            return `${window.utils.getCurrentTime(date)}, ${window.utils.getCurrentDate(date)}`;
        }
        return date.toLocaleString('vi-VN', {
            day: '2-digit',
            month: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
    },

    showToast(message, type = 'success') {
        if (window.utils && window.utils.toast) {
            window.utils.toast.show(message, type);
            return;
        }
        const container = document.getElementById('toastContainer');
        if (!container) return;

        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.textContent = message;
        container.appendChild(toast);

        setTimeout(() => toast.remove(), 3000);
    }
};

// Initialize on load
document.addEventListener('DOMContentLoaded', () => CustomerApp.init());

window.CustomerApp = CustomerApp;

