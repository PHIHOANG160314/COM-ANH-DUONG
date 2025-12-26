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
    currentCategory: 'all',
    appliedPromo: null,

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
        this.renderMenu();
        this.updateCartUI();
        this.renderOrderHistory();
        console.log('🍽️ Customer Portal ready!');
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
        this.currentCategory = category;
        const grid = document.getElementById('customerMenuGrid');
        if (!grid) {
            console.error('Menu grid not found!');
            return;
        }

        let items = this.getMenuItems();
        console.log('📜 Rendering, category:', category, 'search:', this.searchQuery);

        // Filter by category
        if (category !== 'all') {
            items = items.filter(item => item.category === category);
        }

        // Filter by search query
        if (this.searchQuery) {
            items = items.filter(item =>
                item.name.toLowerCase().includes(this.searchQuery) ||
                (item.description && item.description.toLowerCase().includes(this.searchQuery))
            );
        }

        if (items.length === 0) {
            grid.innerHTML = `
                <div style="grid-column: 1/-1; text-align:center; padding:40px; color:#888;">
                    <div style="font-size: 3rem; margin-bottom: 12px;">🔍</div>
                    <p>Không tìm thấy món "${this.searchQuery || category}"</p>
                </div>`;
            return;
        }

        grid.innerHTML = items.map((item, index) => `
            <div class="menu-card animate-fadeInUp hover-lift" data-id="${item.id}" 
                 style="animation-delay: ${index * 0.05}s; opacity: 0;"
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
        `).join('');

        console.log('✅ Rendered', items.length, 'menu cards with animations');
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
        console.log('📦 Adding item:', itemId);
        const items = this.getMenuItems();
        const item = items.find(i => i.id === itemId || String(i.id) === String(itemId));

        if (!item) {
            console.error('❌ Item not found:', itemId);
            this.showToast('Không tìm thấy món này', 'error');
            return;
        }

        const existing = this.cart.find(c => c.id === item.id || String(c.id) === String(item.id));
        if (existing) {
            existing.qty++;
            console.log('📦 Updated qty:', existing.qty);
        } else {
            this.cart.push({ ...item, qty: 1 });
            console.log('📦 Added new item to cart');
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
        if (deliveryInfo) {
            deliveryInfo.style.display = type === 'delivery' ? 'block' : 'none';
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

        // Create order with tracking
        const order = {
            id: 'ORD' + Date.now(),
            items: [...this.cart],
            orderType: this.orderType,
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

        // Show confirmation with animation
        setTimeout(() => {
            alert(`✅ Đặt hàng thành công!\n\nMã đơn: ${order.id}\nTổng tiền: ${this.formatPrice(order.total)}\nThời gian dự kiến: ${order.estimatedTime}\n\nNhà hàng sẽ liên hệ xác nhận ngay!`);
        }, 500);

        // Navigate to tracking
        this.showSection('tracking');
        document.getElementById('trackingOrderId').value = order.id;
        this.trackOrder();
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

        container.innerHTML = orders.slice(0, 10).map(order => `
            <div class="history-card" onclick="CustomerApp.viewHistoryOrder('${order.id}')">
                <div class="history-info">
                    <h4>${order.id}</h4>
                    <p>${this.formatDateTime(order.createdAt)} • ${order.items.length} món</p>
                </div>
                <div class="history-amount">${this.formatPrice(order.total)}</div>
            </div>
        `).join('');
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

