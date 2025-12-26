// ========================================
// F&B MASTER - ORDER MANAGEMENT MODULE
// ========================================

const OrderManagement = {
    orders: [],

    init() {
        this.loadOrders();
        this.render();
        this.setupEventListeners();
    },

    loadOrders() {
        // Load from localStorage or use sample data
        const saved = storage.get('orders_data');
        if (saved && saved.length > 0) {
            this.orders = saved;
        } else {
            // Updated Sample orders data with type
            this.orders = [
                {
                    id: 'DH001',
                    type: 'dine_in',
                    customer: 'Nguyễn Văn A',
                    phone: '0912345678',
                    address: 'Bàn 1 (Tại quán)',
                    items: 'Bún Bò Huế x2, Cà Phê Sữa x2',
                    total: 160000,
                    status: 'new',
                    createdAt: '07:30',
                    note: ''
                },
                {
                    id: 'DH002',
                    type: 'delivery',
                    customer: 'Trần Thị B',
                    phone: '0987654321',
                    address: '456 Lê Lợi, Q.3, TP.HCM',
                    items: 'Phở Bò Tái x1',
                    total: 55000,
                    status: 'received',
                    createdAt: '08:00',
                    note: 'Ít hành'
                }
            ];
            this.saveOrders();
        }
    },

    saveOrders() {
        storage.set('orders_data', this.orders);
    },

    render() {
        this.renderStats();
        this.renderKanban();
    },

    renderStats() {
        const counts = {
            new: this.orders.filter(o => o.status === 'new').length,
            received: this.orders.filter(o => o.status === 'received').length,
            delivering: this.orders.filter(o => o.status === 'delivering').length,
            delivered: this.orders.filter(o => o.status === 'delivered').length
        };

        ['New', 'Received', 'Delivering', 'Delivered'].forEach(status => {
            const id = status;
            document.getElementById('orders' + id).textContent = counts[id.toLowerCase()];
            document.getElementById('kanban' + id).textContent = counts[id.toLowerCase()];
        });
    },

    renderKanban() {
        const statuses = ['new', 'received', 'delivering', 'delivered'];
        const containers = {
            new: document.getElementById('kanbanCardsNew'),
            received: document.getElementById('kanbanCardsReceived'),
            delivering: document.getElementById('kanbanCardsDelivering'),
            delivered: document.getElementById('kanbanCardsDelivered')
        };

        Object.values(containers).forEach(c => c.innerHTML = '');

        statuses.forEach(status => {
            const orders = this.orders.filter(o => o.status === status);
            const container = containers[status];

            if (orders.length === 0) {
                container.innerHTML = '<div class="empty-column">Không có đơn</div>';
                return;
            }

            orders.forEach(order => {
                container.appendChild(this.createOrderCard(order));
            });
        });
    },

    createOrderCard(order) {
        const card = document.createElement('div');
        card.className = 'order-card';
        card.dataset.orderId = order.id;

        const nextAction = this.getNextAction(order.status, order.type);
        const typeLabel = order.type === 'dine_in' ? '🍽️ Đặt trước' : '🛵 Giao hàng';
        const typeClass = order.type === 'dine_in' ? 'bg-primary' : 'bg-secondary';

        card.innerHTML = `
            <div class="order-card-header">
                <span class="order-id">#${order.id}</span>
                <span class="order-type-badge ${order.type}">${typeLabel}</span>
            </div>
            <div class="order-time">🕐 ${order.createdAt}</div>
            
            <div class="order-customer">
                <span class="order-customer-icon">👤</span>
                <span>${order.customer}</span>
            </div>
            <div class="order-address">
                <span>📍</span>
                <span>${order.address}</span>
            </div>
            
            ${order.assignee ? `<div class="order-assignee">👮 Shipper: <strong>${order.assignee}</strong></div>` : ''}
            
            <div class="order-items">📦 ${order.items}</div>
            ${order.note ? `<div class="order-note" style="color: #f59e0b; font-size: 0.8rem; margin-bottom:0.5rem">📝 ${order.note}</div>` : ''}
            
            <div class="order-card-footer">
                <span class="order-total">${formatCurrency(order.total)}</span>
                ${nextAction ?
                `<button class="order-action-btn ${nextAction.class}" onclick="OrderManagement.handleAction('${order.id}', '${nextAction.nextStatus}')">${nextAction.label}</button>`
                : '<span style="color: var(--secondary); font-weight: 600;">✓ Hoàn thành</span>'}
            </div>
        `;

        card.addEventListener('click', (e) => {
            if (!e.target.classList.contains('order-action-btn')) {
                this.showOrderDetail(order);
            }
        });

        return card;
    },

    getNextAction(status, type) {
        if (status === 'new') return { label: 'Nhận đơn', nextStatus: 'received', class: '' };

        if (status === 'received') {
            if (type === 'dine_in') return { label: 'Khách đến', nextStatus: 'delivered', class: 'success' };
            return { label: 'Giao hàng', nextStatus: 'delivering', class: '' };
        }

        if (status === 'delivering') return { label: 'Đã giao', nextStatus: 'delivered', class: 'success' };

        return null;
    },

    handleAction(orderId, nextStatus) {
        const order = this.orders.find(o => o.id === orderId);
        if (!order) return;

        if (nextStatus === 'delivering') {
            this.showAssignShipperModal(order);
        } else if (nextStatus === 'delivered' && order.type === 'delivery') {
            this.showDeliveryProofModal(order);
        } else {
            this.updateStatus(orderId, nextStatus);
        }
    },

    showAssignShipperModal(order) {
        modal.open('Chọn người giao hàng', `
            <div class="form-group">
                <label>Đơn hàng: #${order.id}</label>
                <div style="font-size: 0.9rem; margin-bottom: 1rem; color: var(--text-muted);">${order.address}</div>
            </div>
            <div class="form-group">
                <label>Chọn Shipper *</label>
                <select id="assignShipper" class="full-width" style="padding: 0.75rem; background: var(--bg-input); border: 1px solid var(--border-color); color: var(--text-primary); border-radius: 8px;">
                    <option value="">-- Chọn Shipper --</option>
                    <option value="Nguyễn Văn Shipper A">Nguyễn Văn Shipper A</option>
                    <option value="Trần Văn Shipper B">Trần Văn Shipper B</option>
                    <option value="Lê Văn Shipper C">Lê Văn Shipper C</option>
                </select>
            </div>
        `, `
            <button class="btn-secondary" onclick="modal.close()">Hủy</button>
            <button class="btn-primary" onclick="OrderManagement.confirmAssign('${order.id}')">Xác nhận giao hàng</button>
        `);
    },

    confirmAssign(orderId) {
        const shipper = document.getElementById('assignShipper').value;
        if (!shipper) {
            toast.warning('Vui lòng chọn shipper');
            return;
        }

        const order = this.orders.find(o => o.id === orderId);
        if (order) {
            order.assignee = shipper;
            this.updateStatus(orderId, 'delivering');
            modal.close();
        }
    },

    showDeliveryProofModal(order) {
        modal.open('Xác minh giao hàng thành công', `
            <div class="form-group">
                <label>Đơn hàng: #${order.id}</label>
                <div style="margin-bottom: 1rem;">Shipper: <strong>${order.assignee}</strong></div>
            </div>
            <div class="form-group">
                <label>Chụp ảnh / Quét mã QR xác nhận</label>
                <div class="upload-placeholder" style="border: 2px dashed var(--border-color); padding: 2rem; text-align: center; border-radius: 12px; cursor: pointer; transition: all 0.3s;" onclick="alert('Giả lập: Đã chụp ảnh thành công!')">
                    <div style="font-size: 3rem; margin-bottom: 0.5rem;">📸</div>
                    <div>Nhấn vào đây để chụp ảnh hoặc upload</div>
                </div>
            </div>
            <div class="form-group">
                <label>Ghi chú thêm</label>
                <input type="text" id="deliveryNote" placeholder="VD: Đã nhận tiền mặt, khách hài lòng...">
            </div>
        `, `
            <button class="btn-secondary" onclick="modal.close()">Hủy</button>
            <button class="btn-primary" onclick="OrderManagement.confirmDelivery('${order.id}')">Hoàn tất đơn hàng</button>
        `);
    },

    confirmDelivery(orderId) {
        const note = document.getElementById('deliveryNote').value;
        const order = this.orders.find(o => o.id === orderId);

        if (order) {
            if (note) order.deliveryNote = note;
            order.deliveryTime = getCurrentTime();
            order.proof = 'verified'; // Simulated proof
            this.updateStatus(orderId, 'delivered');
            modal.close();
            toast.success('Đã lưu bằng chứng giao hàng!');
        }
    },

    updateStatus(orderId, newStatus) {
        const order = this.orders.find(o => o.id === orderId);
        if (order) {
            order.status = newStatus;
            this.saveOrders();
            this.render();
            toast.success(`Cập nhật trạng thái: ${newStatus}`);
        }
    },

    setupEventListeners() {
        document.getElementById('addOrderBtn').addEventListener('click', () => this.showAddOrderModal());
    },

    showAddOrderModal() {
        const dailyItems = MenuManagement && MenuManagement.getDailyMenuItems ? MenuManagement.getDailyMenuItems() : [];
        const itemsOptions = dailyItems.length > 0
            ? dailyItems.map(i => `<option value="${i.name} - ${i.price}">${i.name} (${formatCurrency(i.price)})</option>`).join('')
            : '<option value="">Chưa có menu hôm nay</option>';

        modal.open('Tạo đơn hàng mới', `
            <div class="form-group">
                <label>Loại đơn hàng</label>
                <div class="radio-group" style="display: flex; gap: 1rem; margin-bottom: 1rem;">
                    <label style="flex: 1; padding: 0.75rem; border: 1px solid var(--border-color); border-radius: 8px; cursor: pointer; display: flex; align-items: center; gap: 0.5rem;">
                        <input type="radio" name="orderType" value="dine_in" checked onclick="OrderManagement.toggleAddressField(false)">
                        <span>🍽️ Đặt trước (Tại quán)</span>
                    </label>
                    <label style="flex: 1; padding: 0.75rem; border: 1px solid var(--border-color); border-radius: 8px; cursor: pointer; display: flex; align-items: center; gap: 0.5rem;">
                        <input type="radio" name="orderType" value="delivery" onclick="OrderManagement.toggleAddressField(true)">
                        <span>🛵 Giao tận nơi</span>
                    </label>
                </div>
            </div>
            <div class="form-group">
                <label>Tên khách hàng *</label>
                <input type="text" id="orderCustomer" placeholder="VD: Nguyễn Văn A">
            </div>
            <div class="form-group">
                <label>Số điện thoại *</label>
                <input type="tel" id="orderPhone" placeholder="VD: 0912345678">
            </div>
            <div class="form-group" id="addressGroup" style="display: none;">
                <label>Địa chỉ giao hàng *</label>
                <input type="text" id="orderAddress" placeholder="VD: 123 Nguyễn Huệ, Q.1">
            </div>
            <div class="form-group">
                <label>Món ăn (Chọn từ Menu hôm nay)</label>
                <select id="orderItemSelect" onchange="OrderManagement.addItemToOrder()" style="padding: 0.75rem; background: var(--bg-input); border: 1px solid var(--border-color); color: var(--text-primary); border-radius: 8px; width: 100%; margin-bottom: 0.5rem;">
                    <option value="">-- Chọn món --</option>
                    ${itemsOptions}
                </select>
                <textarea id="orderItems" rows="3" placeholder="Chi tiết món..." style="width: 100%; padding: 0.75rem; background: var(--bg-input); border: 1px solid var(--border-color); border-radius: 8px; color: var(--text-primary); resize: vertical;"></textarea>
            </div>
            <div class="form-group">
                <label>Tổng tiền (VNĐ) *</label>
                <input type="number" id="orderTotal" placeholder="0" min="0">
            </div>
            <div class="form-group">
                <label>Ghi chú</label>
                <input type="text" id="orderNote" placeholder="VD: Ít cay...">
            </div>
        `, `
            <button class="btn-secondary" onclick="modal.close()">Hủy</button>
            <button class="btn-primary" onclick="OrderManagement.createOrder()">Tạo đơn</button>
        `);
    },

    toggleAddressField(show) {
        const group = document.getElementById('addressGroup');
        const input = document.getElementById('orderAddress');
        if (show) {
            group.style.display = 'block';
            input.placeholder = 'Nhập địa chỉ giao hàng...';
        } else {
            group.style.display = 'none';
            input.value = 'Tại quán (Đặt trước)';
        }
    },

    addItemToOrder() {
        const select = document.getElementById('orderItemSelect');
        const textarea = document.getElementById('orderItems');
        const totalInput = document.getElementById('orderTotal');

        if (select.value) {
            const [name, price] = select.value.split(' - ');
            const currentText = textarea.value;
            textarea.value = currentText ? currentText + ', ' + name : name;

            const currentTotal = parseInt(totalInput.value) || 0;
            totalInput.value = currentTotal + (parseInt(price) || 0);

            select.value = ''; // Reset select
        }
    },

    createOrder() {
        const type = document.querySelector('input[name="orderType"]:checked').value;
        const customer = document.getElementById('orderCustomer').value.trim();
        const phone = document.getElementById('orderPhone').value.trim();
        let address = document.getElementById('orderAddress').value.trim();
        const items = document.getElementById('orderItems').value.trim();
        const total = parseInt(document.getElementById('orderTotal').value) || 0;
        const note = document.getElementById('orderNote').value.trim();

        if (type === 'dine_in') address = 'Tại quán (Đặt trước)';

        if (!customer || !phone || !address || !items || !total) {
            toast.warning('Vui lòng điền đầy đủ thông tin');
            return;
        }

        const newOrder = {
            id: 'DH' + Date.now().toString().slice(-6),
            type,
            customer,
            phone,
            address,
            items,
            total,
            status: 'new',
            createdAt: getCurrentTime(),
            note
        };

        this.orders.unshift(newOrder);
        this.saveOrders();
        this.render();
        modal.close();
        toast.success('Tạo đơn hàng thành công');
    },

    showOrderDetail(order) {
        const typeLabel = order.type === 'dine_in' ? '🍽️ Đặt trước' : '🛵 Giao hàng';

        modal.open(`Chi tiết đơn hàng #${order.id}`, `
            <div style="margin-bottom: 1rem;">
                <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 1rem;">
                    <div>
                        <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.5rem;">
                            <span style="font-size: 1.25rem;">👤</span>
                            <strong>${order.customer}</strong>
                        </div>
                        <div style="color: var(--text-muted); font-size: 0.9rem;">📞 ${order.phone}</div>
                    </div>
                    <span class="status-badge ${order.type === 'dine_in' ? 'excess' : 'pending'}" style="font-size: 0.9rem;">${typeLabel}</span>
                </div>
                
                <div style="padding: 0.75rem; background: var(--bg-hover); border-radius: 8px; margin-bottom: 1rem;">
                    <div style="color: var(--text-muted); font-size: 0.8rem; margin-bottom: 0.25rem;">Địa chỉ:</div>
                    <div>📍 ${order.address}</div>
                </div>
                
                ${order.assignee ? `
                <div style="padding: 0.75rem; background: rgba(99, 102, 241, 0.1); border: 1px solid rgba(99, 102, 241, 0.2); border-radius: 8px; margin-bottom: 1rem;">
                    <div style="color: var(--primary-light); font-size: 0.8rem; margin-bottom: 0.25rem;">Người giao hàng:</div>
                    <div>👮 <strong>${order.assignee}</strong></div>
                </div>` : ''}
                
                ${order.proof ? `
                <div style="padding: 0.75rem; background: rgba(16, 185, 129, 0.1); border: 1px solid rgba(16, 185, 129, 0.2); border-radius: 8px; margin-bottom: 1rem;">
                    <div style="color: #10b981; font-size: 0.8rem;">✅ Đã xác minh giao hàng (Ảnh/QR)</div>
                    ${order.deliveryNote ? `<div style="font-size: 0.85rem; margin-top: 0.25rem;">Note: ${order.deliveryNote}</div>` : ''}
                    <div style="font-size: 0.8rem; color: var(--text-muted); margin-top: 0.25rem;">(${order.deliveryTime})</div>
                </div>` : ''}
            </div>
            
            <hr style="border-color: var(--border-color); margin: 1rem 0;">
            
            <div style="margin-bottom: 1rem;">
                <strong>Món đặt:</strong>
                <div style="padding: 0.75rem; background: var(--bg-hover); border-radius: 8px; margin-top: 0.5rem;">
                    ${order.items}
                </div>
            </div>
            
            ${order.note ? `<div style="margin-bottom: 1rem; color: #f59e0b;">📝 Ghi chú: ${order.note}</div>` : ''}
            
            <div style="display: flex; justify-content: space-between; padding: 1rem; background: linear-gradient(135deg, rgba(16, 185, 129, 0.1), rgba(6, 182, 212, 0.1)); border-radius: 8px;">
                <span>Tổng tiền:</span>
                <strong style="font-size: 1.25rem; color: var(--secondary);">${formatCurrency(order.total)}</strong>
            </div>
        `, `
            <button class="btn-secondary" onclick="modal.close()">Đóng</button>
            <button class="btn-primary" onclick="OrderManagement.printOrder('${order.id}')">🖨️ In đơn</button>
        `);
    }
};

window.OrderManagement = OrderManagement;
