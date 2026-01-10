// ========================================
// F&B MASTER - CUSTOMER APP
// Enhanced Mobile Customer Portal
// ========================================

const CustomerApp = {
    cart: [],
    orderType: 'dinein',
    currentMember: null,
    menuData: [],
    searchQuery: '',
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

    init() {
        console.log('🍽️ Customer Portal initializing...');

        // Load menu data from window.menuItems (from data.js)
        if (typeof window.menuItems !== 'undefined' && window.menuItems.length > 0) {
            this.menuData = window.menuItems;
            console.log('✅ Loaded', this.menuData.length, 'menu items from data.js');
        } else if (typeof menuItems !== 'undefined' && menuItems.length > 0) {
            this.menuData = menuItems;
            console.log('✅ Loaded', this.menuData.length, 'menu items');
        } else {
            this.menuData = this.getSampleMenu();
            console.log('⚠️ Using sample menu data');
        }

        this.loadCart();
        this.renderFeaturedSection();
        this.renderCategories(this.currentGroup);
        this.renderSubcategoryTabs();
        this.renderMenu();
        this.updateCartUI();
        this.renderOrderHistory();
        this.populateDineinTables();
        this.listenForTableUpdates();

        // Initialize realtime order tracking
        this.initRealtimeOrderTracking();

        console.log('🍽️ Customer Portal ready!');
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

            if (localOrders.length === 0) return;

            // Get all orders from Supabase
            const result = await SupabaseService.getOrders();
            if (result.error) {
                console.error('Customer: Failed to load orders from Supabase:', result.error);
                return;
            }

            // Update local orders with Supabase status
            let updated = false;
            localOrders.forEach(localOrder => {
                const supabaseOrder = result.data?.find(o =>
                    o.order_number === localOrder.id ||
                    o.id === localOrder.supabaseId
                );

                if (supabaseOrder && supabaseOrder.status !== localOrder.status) {
                    localOrder.status = supabaseOrder.status;
                    localOrder.supabaseId = supabaseOrder.id;
                    updated = true;
                    console.log('🔄 Order', localOrder.id, 'status updated to:', supabaseOrder.status);
                }
            });

            if (updated) {
                localStorage.setItem('customer_orders', JSON.stringify(localOrders));
                this.renderOrderHistory();
            }

            console.log('✅ Customer: Synced', localOrders.length, 'orders from Supabase');
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
            console.log('🔔 Customer: Order update received:', payload.eventType);

            if (payload.eventType === 'UPDATE' && payload.new) {
                const localOrders = JSON.parse(localStorage.getItem('customer_orders') || '[]');
                const orderIndex = localOrders.findIndex(o =>
                    o.id === payload.new.order_number ||
                    o.supabaseId === payload.new.id
                );

                if (orderIndex !== -1) {
                    const oldStatus = localOrders[orderIndex].status;
                    const newStatus = payload.new.status;

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

                        // If tracking section is visible, update it
                        const trackingContainer = document.getElementById('currentOrderTracking');
                        if (trackingContainer && trackingContainer.innerHTML.includes(localOrders[orderIndex].id)) {
                            this.renderOrderStatus(localOrders[orderIndex], trackingContainer);
                        }

                        // Show notification
                        this.showToast(`Đơn ${localOrders[orderIndex].id}: ${this.getStatusLabel(newStatus)}`, 'success');
                        console.log('✅ Order', localOrders[orderIndex].id, 'updated to:', newStatus);
                    }
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
        document.querySelectorAll('.menu-group-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.group === group);
        });

        // Render Level 2 categories
        this.renderCategories(group);

        // Clear Level 3
        const subcatContainer = document.getElementById('menuSubcategories');
        if (subcatContainer) subcatContainer.innerHTML = '';

        // Render menu based on group
        if (group === 'combo') {
            this.renderCombos();
        } else {
            this.renderMenu(group === 'all' ? 'all' : this.mapGroupToCategory(group));
        }

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
            'dessert': 'dessert'
        };
        return mapping[group] || group;
    },

    // ========================================
    // LEVEL 2: RENDER CATEGORIES
    // ========================================
    renderCategories(group) {
        const container = document.getElementById('menuCategories');
        if (!container) return;

        // Hide if 'all' or 'combo' group
        if (group === 'all' || group === 'combo') {
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
            <div class="category-pill active" data-cat="all" onclick="CustomerApp.filterCategory('all')">
                <span class="cat-icon">📋</span> Tất cả
            </div>
            ${categories.map(cat => `
                <div class="category-pill" data-cat="${cat.id}" onclick="CustomerApp.filterCategory('${cat.id}')">
                    <span class="cat-icon">${cat.icon}</span> ${cat.name}
                </div>
            `).join('')}
        `;
    },

    // ========================================
    // LEVEL 2: FILTER BY CATEGORY
    // ========================================
    filterCategory(category) {
        this.currentCategory = category;
        this.currentSubcategory = 'all';

        // Update active state
        document.querySelectorAll('.category-pill').forEach(pill => {
            pill.classList.toggle('active', pill.dataset.cat === category);
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
            <div class="subcategory-chip active" data-sub="all" onclick="CustomerApp.filterSubcategory('all')">
                Tất cả
            </div>
            ${subcategories.map(sub => `
                <div class="subcategory-chip" data-sub="${sub.id}" onclick="CustomerApp.filterSubcategory('${sub.id}')">
                    ${sub.icon} ${sub.name}
                </div>
            `).join('')}
        `;
    },

    // ========================================
    // LEVEL 3: FILTER BY SUBCATEGORY
    // ========================================
    filterSubcategory(subcategory) {
        this.currentSubcategory = subcategory;

        // Update active state
        document.querySelectorAll('.subcategory-chip').forEach(chip => {
            chip.classList.toggle('active', chip.dataset.sub === subcategory);
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

        grid.innerHTML = combos.map(combo => `
            <div class="combo-card" onclick="CustomerApp.addComboToCart('${combo.id}')">
                <div class="combo-badge">-${this.formatPrice(combo.savings)}</div>
                <div class="combo-name">${combo.icon} ${combo.name}</div>
                <div class="combo-desc">${combo.description}</div>
                <div class="combo-pricing">
                    <span class="combo-original">${this.formatPrice(combo.originalPrice)}</span>
                    <span class="combo-price">${this.formatPrice(combo.comboPrice)}</span>
                    <span class="combo-savings">Tiết kiệm ${this.formatPrice(combo.savings)}</span>
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
    // FEATURED SECTION
    // ========================================
    renderFeaturedSection() {
        const container = document.getElementById('featuredCards');
        if (!container) return;

        // Get featured items (top 5 sellers)
        const featuredIds = typeof window.featuredItems !== 'undefined' ? window.featuredItems : [1, 2, 16, 51, 66];
        const featured = this.menuData.filter(item => featuredIds.includes(item.id));

        container.innerHTML = featured.map(item => `
            <div class="featured-card" onclick="CustomerApp.addToCart(${item.id})">
                <div class="featured-card-image">${item.icon || '🍽️'}</div>
                <div class="featured-card-body">
                    <div class="featured-card-name">${item.name}</div>
                    <div class="featured-card-price">${this.formatPrice(item.price)}</div>
                </div>
            </div>
        `).join('');
    },

    // ========================================
    // SUBCATEGORY TABS
    // ========================================
    renderSubcategoryTabs(category = 'all') {
        const container = document.getElementById('subcategoryTabs');
        if (!container) return;

        // Hide subcategory tabs if 'all' category
        if (category === 'all') {
            container.innerHTML = '';
            return;
        }

        // Get subcategories for current category
        const subcats = typeof window.menuSubcategories !== 'undefined'
            ? window.menuSubcategories[category] || []
            : [];

        if (subcats.length === 0) {
            container.innerHTML = '';
            return;
        }

        // Count items in each subcategory
        const items = this.menuData.filter(item => item.category === category);

        container.innerHTML = `
            <button class="subcategory-tab ${this.currentSubcategory === 'all' ? 'active' : ''}" 
                    onclick="CustomerApp.filterBySubcategory('all')">
                <span class="tab-icon">🔤</span> Tất cả
                <span class="tab-count">${items.length}</span>
            </button>
            ${subcats.map(sub => {
            const count = items.filter(item => item.subcategory === sub.id).length;
            return `
                    <button class="subcategory-tab ${this.currentSubcategory === sub.id ? 'active' : ''}" 
                            onclick="CustomerApp.filterBySubcategory('${sub.id}')">
                        <span class="tab-icon">${sub.icon}</span> ${sub.name}
                        <span class="tab-count">${count}</span>
                    </button>
                `;
        }).join('')}
        `;
    },

    filterBySubcategory(subcategory) {
        this.currentSubcategory = subcategory;
        this.renderSubcategoryTabs(this.currentCategory);
        this.renderMenu(this.currentCategory);
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
        this.renderSubcategoryTabs(category);

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
        return `
            <div class="menu-card animate-fadeInUp hover-lift" data-id="${item.id}" 
                 onclick="CustomerApp.showItemDetail(${item.id})">
                <div class="menu-card-image">${item.icon || '🍽️'}</div>
                <div class="menu-card-body">
                    <div class="menu-card-name">${item.name}</div>
                    <div class="menu-card-price">${this.formatPrice(item.price)}</div>
                    <button class="menu-card-add btn-press hover-glow" onclick="event.stopPropagation(); CustomerApp.addToCart(${item.id})">
                        + Thêm vào giỏ
                    </button>
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

    filterMenu(category) {
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.cat === category);
        });
        this.renderMenu(category);
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
                <div class="order-item-qty">
                    <button class="qty-btn" onclick="CustomerApp.updateQty('${item.id}', -1)">-</button>
                    <span class="qty-value">${item.qty}</span>
                    <button class="qty-btn" onclick="CustomerApp.updateQty('${item.id}', 1)">+</button>
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

        document.querySelectorAll('.order-type').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.type === type);
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
                const result = await SupabaseService.createOrder({
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
                    notes: order.delivery?.note || '',
                    address: order.tableNumber ? `Bàn ${order.tableNumber}` : (order.delivery?.address || 'Tại quán')
                });

                console.log('🔄 Supabase createOrder result:', result);

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
        const orders = JSON.parse(localStorage.getItem('customer_orders') || '[]');
        const orderIndex = orders.findIndex(o => o.id === order.id);
        if (orderIndex !== -1) {
            orders[orderIndex] = order;
            localStorage.setItem('customer_orders', JSON.stringify(orders));
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
            <div class="history-card" onclick="CustomerApp.viewHistoryOrder('${order.id}')">
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
        document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));

        document.getElementById(`section-${sectionId}`)?.classList.add('active');
        document.querySelector(`[data-section="${sectionId}"]`)?.classList.add('active');

        // Load order history when visiting tracking section
        if (sectionId === 'tracking') {
            this.renderOrderHistory();
        }
    },

    // ========================================
    // UTILITIES
    // ========================================
    formatPrice(amount) {
        return new Intl.NumberFormat('vi-VN').format(amount) + 'đ';
    },

    formatDateTime(dateStr) {
        const date = new Date(dateStr);
        return date.toLocaleString('vi-VN', {
            day: '2-digit',
            month: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
    },

    showToast(message, type = 'success') {
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

