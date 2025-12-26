// ========================================
// F&B MASTER - POS MODULE
// ========================================

const POS = {
    cart: [],
    currentCategory: 'all',

    init() {
        this.renderMenu();
        this.setupEventListeners();
        this.updateCart();
    },

    setupEventListeners() {
        // Category tabs
        document.querySelectorAll('.category-tab').forEach(tab => {
            tab.addEventListener('click', (e) => {
                document.querySelectorAll('.category-tab').forEach(t => t.classList.remove('active'));
                e.target.classList.add('active');
                this.currentCategory = e.target.dataset.category;
                this.renderMenu();
            });
        });

        // Cart actions
        document.getElementById('clearCartBtn').addEventListener('click', () => this.clearCart());
        document.getElementById('checkoutBtn').addEventListener('click', () => this.checkout());
    },

    renderMenu() {
        const grid = document.getElementById('menuGrid');
        grid.innerHTML = '';

        const items = this.currentCategory === 'all'
            ? menuItems
            : menuItems.filter(item => item.category === this.currentCategory);

        items.forEach(item => {
            const menuItem = document.createElement('div');
            menuItem.className = 'menu-item';
            menuItem.innerHTML = `
                <div class="menu-item-icon">${item.icon}</div>
                <div class="menu-item-name">${item.name}</div>
                <div class="menu-item-price">${formatCurrency(item.price)}</div>
            `;
            menuItem.addEventListener('click', () => this.addToCart(item));
            grid.appendChild(menuItem);
        });
    },

    addToCart(item) {
        const existingItem = this.cart.find(cartItem => cartItem.id === item.id);

        if (existingItem) {
            existingItem.quantity++;
        } else {
            this.cart.push({ ...item, quantity: 1 });
        }

        this.updateCart();
        toast.success(`Đã thêm ${item.name}`);
    },

    removeFromCart(itemId) {
        this.cart = this.cart.filter(item => item.id !== itemId);
        this.updateCart();
    },

    updateQuantity(itemId, delta) {
        const item = this.cart.find(cartItem => cartItem.id === itemId);
        if (item) {
            item.quantity += delta;
            if (item.quantity <= 0) {
                this.removeFromCart(itemId);
            } else {
                this.updateCart();
            }
        }
    },

    updateCart() {
        const cartItems = document.getElementById('cartItems');

        if (this.cart.length === 0) {
            cartItems.innerHTML = '<div class="cart-empty">Chưa có món nào</div>';
        } else {
            cartItems.innerHTML = this.cart.map(item => `
                <div class="cart-item">
                    <div class="cart-item-info">
                        <div class="cart-item-name">${item.icon} ${item.name}</div>
                        <div class="cart-item-price">${formatCurrency(item.price)}</div>
                    </div>
                    <div class="cart-item-qty">
                        <button class="qty-btn" onclick="POS.updateQuantity(${item.id}, -1)">−</button>
                        <span class="qty-value">${item.quantity}</span>
                        <button class="qty-btn" onclick="POS.updateQuantity(${item.id}, 1)">+</button>
                    </div>
                    <div class="cart-item-total">${formatCurrency(item.price * item.quantity)}</div>
                </div>
            `).join('');
        }

        this.updateTotals();
    },

    updateTotals() {
        const subtotal = this.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const vat = subtotal * 0.1;
        const total = subtotal + vat;

        document.getElementById('subtotal').textContent = formatCurrency(subtotal);
        document.getElementById('vat').textContent = formatCurrency(vat);
        document.getElementById('total').textContent = formatCurrency(total);
    },

    clearCart() {
        if (this.cart.length === 0) return;

        if (confirm('Xóa toàn bộ đơn hàng?')) {
            this.cart = [];
            this.updateCart();
            toast.info('Đã xóa đơn hàng');
        }
    },

    checkout() {
        if (this.cart.length === 0) {
            toast.warning('Vui lòng thêm món vào đơn');
            return;
        }

        const table = document.getElementById('tableSelect').value;
        if (!table) {
            toast.warning('Vui lòng chọn bàn');
            return;
        }

        const subtotal = this.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const vat = subtotal * 0.1;
        const total = subtotal + vat;

        const orderSummary = this.cart.map(item =>
            `${item.name} x${item.quantity} = ${formatCurrency(item.price * item.quantity)}`
        ).join('<br>');

        modal.open('Xác nhận thanh toán', `
            <div style="margin-bottom: 1rem;">
                <strong>Bàn:</strong> ${table === 'takeaway' ? 'Mang đi' : 'Bàn ' + table}
            </div>
            <div style="margin-bottom: 1rem;">
                <strong>Chi tiết đơn:</strong><br>
                ${orderSummary}
            </div>
            <hr style="border-color: var(--border-color); margin: 1rem 0;">
            <div><strong>VAT (10%):</strong> ${formatCurrency(vat)}</div>
            <div style="font-size: 1.25rem; margin-top: 0.5rem;">
                <strong>Tổng cộng: ${formatCurrency(total)}</strong>
            </div>
        `, `
            <button class="btn-secondary" onclick="modal.close()">Hủy</button>
            <button class="btn-primary" onclick="POS.confirmCheckout()">Xác nhận</button>
        `);
    },

    confirmCheckout() {
        const orderId = generateId('ORD');
        const table = document.getElementById('tableSelect').value;
        const total = this.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0) * 1.1;

        // Create order with items detail for kitchen
        const orderItems = this.cart.map(item => ({
            name: item.name,
            icon: item.icon || '🍽️',
            quantity: item.quantity,
            price: item.price
        }));

        // Add to orders (for history/reports)
        const newOrder = {
            id: orderId,
            table: table === 'takeaway' ? 'Mang đi' : 'Bàn ' + table,
            items: this.cart.map(item => `${item.name} x${item.quantity}`).join(', '),
            itemsDetail: orderItems,
            total: total,
            status: 'pending', // Start as pending for kitchen
            time: getCurrentTime(),
            createdAt: new Date().toISOString()
        };

        sampleOrders.unshift(newOrder);

        // *** SAVE TO LOCALSTORAGE FOR KITCHEN DISPLAY ***
        const kitchenOrders = JSON.parse(localStorage.getItem('fb_orders') || '[]');
        kitchenOrders.unshift(newOrder);
        localStorage.setItem('fb_orders', JSON.stringify(kitchenOrders));

        dashboardData.revenue.today += total;
        dashboardData.orders.today++;

        modal.close();
        this.lastOrderItems = [...this.cart]; // Save for printing
        this.cart = [];
        this.updateCart();
        document.getElementById('tableSelect').value = '';

        toast.success(`✅ Đơn ${orderId} đã gửi đến bếp!`);

        // *** REFRESH KITCHEN DISPLAY ***
        if (window.KitchenDisplay) {
            KitchenDisplay.loadOrders();
        }

        // Ask to print
        setTimeout(() => {
            if (confirm('In hóa đơn cho khách?')) {
                this.printReceipt(newOrder, this.lastOrderItems);
            }
        }, 500);

        // Refresh dashboard
        if (Dashboard) Dashboard.refresh();
    },

    printReceipt(order, items) {
        const receiptHTML = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Hóa đơn - ${order.id}</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { 
            font-family: 'Courier New', monospace; 
            padding: 10mm; 
            max-width: 80mm;
            font-size: 12px;
        }
        .header { text-align: center; margin-bottom: 10px; border-bottom: 1px dashed #000; padding-bottom: 10px; }
        .header h1 { font-size: 18px; margin-bottom: 5px; }
        .header p { font-size: 10px; }
        .info { margin: 10px 0; font-size: 11px; }
        .items { border-top: 1px dashed #000; border-bottom: 1px dashed #000; padding: 10px 0; }
        .item { display: flex; justify-content: space-between; margin: 5px 0; }
        .item-name { flex: 1; }
        .item-qty { width: 30px; text-align: center; }
        .item-price { width: 70px; text-align: right; }
        .totals { padding: 10px 0; }
        .total-row { display: flex; justify-content: space-between; margin: 3px 0; }
        .grand-total { font-weight: bold; font-size: 14px; margin-top: 5px; }
        .footer { text-align: center; margin-top: 15px; font-size: 10px; }
        @media print { body { padding: 5mm; } }
    </style>
</head>
<body>
    <div class="header">
        <h1>ÁNH DƯƠNG</h1>
        <p>Nhà Hàng & Quán Ăn</p>
        <p>ĐT: 0917 076 061</p>
    </div>
    <div class="info">
        <p><strong>Mã HĐ:</strong> ${order.id}</p>
        <p><strong>Bàn:</strong> ${order.table}</p>
        <p><strong>Thời gian:</strong> ${order.time}</p>
    </div>
    <div class="items">
        ${items ? items.map(item => `
            <div class="item">
                <span class="item-name">${item.name}</span>
                <span class="item-qty">x${item.quantity}</span>
                <span class="item-price">${(item.price * item.quantity).toLocaleString()}đ</span>
            </div>
        `).join('') : `<p>${order.items}</p>`}
    </div>
    <div class="totals">
        <div class="total-row">
            <span>Tạm tính:</span>
            <span>${Math.round(order.total / 1.1).toLocaleString()}đ</span>
        </div>
        <div class="total-row">
            <span>VAT (10%):</span>
            <span>${Math.round(order.total - order.total / 1.1).toLocaleString()}đ</span>
        </div>
        <div class="total-row grand-total">
            <span>TỔNG CỘNG:</span>
            <span>${order.total.toLocaleString()}đ</span>
        </div>
    </div>
    <div class="footer">
        <p>Cảm ơn quý khách!</p>
        <p>Hẹn gặp lại!</p>
    </div>
    <script>window.onload = function() { window.print(); }</script>
</body>
</html>`;

        const printWindow = window.open('', '_blank', 'width=400,height=600');
        printWindow.document.write(receiptHTML);
        printWindow.document.close();
    }
};

window.POS = POS;
