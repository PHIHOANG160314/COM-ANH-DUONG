// ========================================
// F&B MASTER - CUSTOMER APP
// ========================================

const CustomerApp = {
    cart: [],
    orderType: 'dinein',
    currentMember: null,
    menuData: [],

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
        console.log('🍽️ Customer Portal ready!');
    },

    // ========================================
    // MENU
    // ========================================
    getMenuItems() {
        return this.menuData.length > 0 ? this.menuData : this.getSampleMenu();
    },

    renderMenu(category = 'all') {
        const grid = document.getElementById('customerMenuGrid');
        if (!grid) {
            console.error('Menu grid not found!');
            return;
        }

        const items = this.getMenuItems();
        console.log('📜 Rendering', items.length, 'items, category:', category);

        const filtered = category === 'all'
            ? items
            : items.filter(item => item.category === category);

        if (filtered.length === 0) {
            grid.innerHTML = '<p style="text-align:center;padding:20px;color:#888;">Không có món trong danh mục này</p>';
            return;
        }

        grid.innerHTML = filtered.map(item => `
            <div class="menu-card" data-id="${item.id}">
                <div class="menu-card-image">${item.icon || '🍽️'}</div>
                <div class="menu-card-body">
                    <div class="menu-card-name">${item.name}</div>
                    <div class="menu-card-price">${this.formatPrice(item.price)}</div>
                    <button class="menu-card-add" onclick="CustomerApp.addToCart(${item.id})">
                        + Thêm vào giỏ
                    </button>
                </div>
            </div>
        `).join('');

        console.log('✅ Rendered', filtered.length, 'menu cards');
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
        // Update active filter button
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
        const total = subtotal + deliveryFee;

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

        // Create order
        const order = {
            id: 'ORD' + Date.now(),
            items: this.cart,
            orderType: this.orderType,
            total: this.cart.reduce((sum, item) => sum + (item.price * item.qty), 0),
            createdAt: new Date().toISOString()
        };

        // Save order
        const orders = JSON.parse(localStorage.getItem('customer_orders') || '[]');
        orders.push(order);
        localStorage.setItem('customer_orders', JSON.stringify(orders));

        // Clear cart
        this.cart = [];
        this.saveCart();
        this.updateCartUI();

        this.showToast('🎉 Đặt hàng thành công!');

        // Show confirmation
        alert(`✅ Đặt hàng thành công!\n\nMã đơn: ${order.id}\nTổng tiền: ${this.formatPrice(order.total)}\n\nNhà hàng sẽ liên hệ xác nhận ngay!`);
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
    },

    // ========================================
    // UTILITIES
    // ========================================
    formatPrice(amount) {
        return new Intl.NumberFormat('vi-VN').format(amount) + 'đ';
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
