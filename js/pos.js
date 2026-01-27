/**
 * F&B Master - POS Module
 * Author: Google DeepMind / Antigravity Team
 * Description: Point of Sale system, cart management, and checkout logic.
 */

const POS = {
    cart: [],
    currentCategory: 'all',

    init() {
        this.renderMenu();
        this.setupEventListeners();
        this.updateCart();
        this.populateTableSelect();
    },

    // Dynamically populate table dropdown from TableManagement
    populateTableSelect() {
        const select = document.getElementById('tableSelect');
        if (!select) return;

        // Get tables from TableManagement if available
        let tables = [];
        if (typeof TableManagement !== 'undefined' && TableManagement.tables) {
            tables = TableManagement.tables;
        } else {
            // Fallback: try to get from localStorage
            const saved = localStorage.getItem('fb_tables');
            if (saved) {
                try {
                    tables = JSON.parse(saved);
                } catch (e) {
                    tables = [];
                }
            }
        }

        // Default tables if none exist
        if (tables.length === 0) {
            tables = [
                { id: 1, name: 'Bàn 1' },
                { id: 2, name: 'Bàn 2' },
                { id: 3, name: 'Bàn 3' },
                { id: 4, name: 'Bàn 4' },
                { id: 5, name: 'Bàn 5' },
                { id: 6, name: 'Bàn 6' },
                { id: 7, name: 'Bàn 7' },
                { id: 8, name: 'Bàn 8' },
                { id: 9, name: 'Bàn 9' },
                { id: 10, name: 'Bàn 10' },
                { id: 11, name: 'Bàn 11' },
                { id: 12, name: 'Bàn 12' }
            ];
        }

        // Build options
        let optionsHTML = '<md-select-option value=""><div slot="headline">Chọn bàn</div></md-select-option>';
        tables.forEach(table => {
            optionsHTML += `<md-select-option value="${table.id}"><div slot="headline">${table.name}</div></md-select-option>`;
        });
        optionsHTML += '<md-select-option value="takeaway"><div slot="headline">Mang đi</div></md-select-option>';

        select.innerHTML = optionsHTML;
        if (window.Debug) Debug.log('POS: Populated', tables.length, 'tables');
    },

    setupEventListeners() {
        // Category tabs
        // md-chip-set handles selection, we just need to listen to interaction
        // However, the original code used class manipulation.
        // With md-filter-chip, we can listen to 'click' or 'input' on the chips.
        const chips = document.querySelectorAll('.category-tab');
        chips.forEach(chip => {
            chip.addEventListener('click', (e) => {
                // md-filter-chip toggles by default, but we want radio behavior here effectively.
                // We'll manually handle visual selection if needed, or rely on the fact that we clear others?
                // Actually md-chip-set doesn't enforce single selection automatically unless configured?
                // Let's just update the state.

                // Unselect others
                chips.forEach(c => {
                    if (c !== e.currentTarget) c.selected = false;
                });
                e.currentTarget.selected = true;

                this.currentCategory = e.currentTarget.dataset.category;
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
            menuItem.className = 'menu-item md-ripple md-focus-ring';
            menuItem.innerHTML = `
                <div class="menu-item-icon">${item.icon}</div>
                <div class="menu-item-name">${item.name}</div>
                <div class="menu-item-price">${window.utils.formatCurrency(item.price)}</div>
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
        window.utils.toast.success(`Đã thêm ${item.name}`);
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
                        <div class="cart-item-price">${window.utils.formatCurrency(item.price)}</div>
                    </div>
                    <div class="cart-item-qty">
                        <md-icon-button class="qty-btn" onclick="POS.updateQuantity(${item.id}, -1)">
                            <md-icon>remove</md-icon>
                        </md-icon-button>
                        <span class="qty-value">${item.quantity}</span>
                        <md-icon-button class="qty-btn" onclick="POS.updateQuantity(${item.id}, 1)">
                            <md-icon>add</md-icon>
                        </md-icon-button>
                    </div>
                    <div class="cart-item-total">${window.utils.formatCurrency(item.price * item.quantity)}</div>
                </div>
            `).join('');
        }

        this.updateTotals();
    },

    updateTotals() {
        const subtotal = this.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const vat = subtotal * 0.1;
        const total = subtotal + vat;

        document.getElementById('subtotal').textContent = window.utils.formatCurrency(subtotal);
        document.getElementById('vat').textContent = window.utils.formatCurrency(vat);
        document.getElementById('total').textContent = window.utils.formatCurrency(total);
    },

    clearCart() {
        if (this.cart.length === 0) return;

        if (confirm('Xóa toàn bộ đơn hàng?')) {
            this.cart = [];
            this.updateCart();
            window.utils.toast.info('Đã xóa đơn hàng');
        }
    },

    checkout() {
        if (this.cart.length === 0) {
            window.utils.toast.warning('Vui lòng thêm món vào đơn');
            return;
        }

        const table = document.getElementById('tableSelect').value;
        if (!table) {
            window.utils.toast.warning('Vui lòng chọn bàn');
            return;
        }

        const subtotal = this.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const vat = subtotal * 0.1;
        const total = subtotal + vat;

        const orderSummary = this.cart.map(item =>
            `${item.name} x${item.quantity} = ${window.utils.formatCurrency(item.price * item.quantity)}`
        ).join('<br>');

        if (window.utils.modal) {
             window.utils.modal.open('Xác nhận thanh toán', `
                <div style="margin-bottom: 1rem;">
                    <strong>Bàn:</strong> ${table === 'takeaway' ? 'Mang đi' : 'Bàn ' + table}
                </div>
                <div style="margin-bottom: 1rem;">
                    <strong>Chi tiết đơn:</strong><br>
                    ${orderSummary}
                </div>
                <hr style="border-color: var(--border-color); margin: 1rem 0;">
                <div><strong>VAT (10%):</strong> ${window.utils.formatCurrency(vat)}</div>
                <div style="font-size: 1.25rem; margin-top: 0.5rem;">
                    <strong>Tổng cộng: ${window.utils.formatCurrency(total)}</strong>
                </div>
            `, `
                <md-outlined-button onclick="window.utils.modal.close()">Hủy</md-outlined-button>
                <md-filled-button onclick="POS.confirmCheckout()">Xác nhận</md-filled-button>
            `);
        }
    },

    confirmCheckout() {
        const orderId = window.utils.generateId('ORD');
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
            time: window.utils.getCurrentTime(),
            createdAt: new Date().toISOString()
        };

        sampleOrders.unshift(newOrder);

        // *** SAVE TO LOCALSTORAGE FOR KITCHEN DISPLAY ***
        const kitchenOrders = JSON.parse(localStorage.getItem('fb_orders') || '[]');
        kitchenOrders.unshift(newOrder);
        localStorage.setItem('fb_orders', JSON.stringify(kitchenOrders));

        dashboardData.revenue.today += total;
        dashboardData.orders.today++;

        if (window.utils.modal) window.utils.modal.close();
        this.lastOrderItems = [...this.cart]; // Save for printing
        this.cart = [];
        this.updateCart();
        document.getElementById('tableSelect').value = '';

        window.utils.toast.success(`✅ Đơn ${orderId} đã gửi đến bếp!`);

        // *** SYNC TO SUPABASE FOR REALTIME ***
        this.syncOrderToSupabase(newOrder);

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

    // Sync order to Supabase for realtime updates
    async syncOrderToSupabase(order) {
        if (window.Debug) Debug.log('🔄 POS syncOrderToSupabase called:', order.id);

        const isConfigured = typeof isSupabaseConfigured !== 'undefined' && isSupabaseConfigured();
        if (!isConfigured || typeof SupabaseService === 'undefined') {
            console.warn('⚠️ Supabase not configured, skipping sync');
            return;
        }

        try {
            const result = await SupabaseService.createOrder({
                order_number: order.id,
                customer_name: 'Khách tại quán',
                customer_phone: '',
                table_number: order.table,
                items: JSON.stringify(order.itemsDetail.map(item => ({
                    name: item.name,
                    icon: item.icon,
                    qty: item.quantity,
                    price: item.price
                }))),
                subtotal: Math.round(order.total / 1.1),
                discount: 0,
                total: order.total,
                status: 'pending',
                order_type: order.table === 'Mang đi' ? 'takeaway' : 'dinein',
                notes: ''
            });

            if (window.Debug) Debug.log('🔄 Supabase createOrder result:', result);

            if (result.error) {
                console.error('❌ Failed to sync order:', result.error);
            } else {
                if (window.Debug) Debug.log('✅ Order synced to Supabase:', result.data?.id);
            }
        } catch (err) {
            console.error('❌ Supabase sync error:', err);
        }
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
