/**
 * F&B Master - Order Management
 * Author: Google DeepMind / Antigravity Team
 * Description: Order tracking, status updates, and Supabase synchronization.
 */

const OrderManagement = {
    orders: [],
    useSupabase: false,

    async init() {
        await this.loadOrders();
        this.setupRealtimeSubscription();
        this.render();
        this.setupEventListeners();
    },

    async loadOrders() {
        // Try loading from Supabase first
        if (await this.loadFromSupabase()) {
            this.useSupabase = true;
            if (window.Debug) Debug.info('📦 Orders loaded from Supabase');
            return;
        }

        // Fallback to localStorage
        const saved = storage.get('orders_data');
        if (saved && saved.length > 0) {
            this.orders = saved;
        } else {
            // Sample orders data with type
            this.orders = [
                {
                    id: 'DH001',
                    type: 'dine_in',
                    customer: 'Nguyễn Văn A',
                    phone: '0912345678',
                    address: 'Bàn 1 (Tại quán)',
                    items: 'Bún Bò Huế x2, Cà Phê Sữa x2',
                    total: 160000,
                    status: 'delivered',
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
                    status: 'delivered',
                    createdAt: '08:00',
                    note: 'Ít hành'
                }
            ];
            this.saveOrders();
        }
    },

    // ========================================
    // SUPABASE INTEGRATION
    // ========================================

    async loadFromSupabase() {
        if (typeof SupabaseService === 'undefined' ||
            typeof isSupabaseConfigured === 'undefined' ||
            !isSupabaseConfigured()) {
            return false;
        }

        try {
            const result = await SupabaseService.getOrders();
            if (result.data && result.data.length > 0) {
                this.orders = result.data.map(o => this.mapSupabaseToLocal(o));
                return true;
            }
        } catch (err) {
            console.error('Failed to load from Supabase:', err);
        }
        return false;
    },

    setupRealtimeSubscription() {
        if (typeof SupabaseService === 'undefined' ||
            typeof isSupabaseConfigured === 'undefined' ||
            !isSupabaseConfigured()) {
            return;
        }

        SupabaseService.subscribeToOrders((payload) => {
            this.handleRealtimeEvent(payload);
        }, 'OrderManagement'); // Named listener

        if (window.Debug) Debug.info('📡 OrderManagement realtime subscription active');
    },

    handleRealtimeEvent(payload) {
        if (payload.eventType === 'INSERT') {
            const newOrder = this.mapSupabaseToLocal(payload.new);
            // Check if already exists (avoid duplicates)
            if (!this.orders.find(o => o.id === newOrder.id || o.supabaseId === newOrder.supabaseId)) {
                this.orders.unshift(newOrder);
                this.render();
                toast.success('🔔 Đơn hàng mới: #' + newOrder.id);
                this.playNotificationSound();
            }
        } else if (payload.eventType === 'UPDATE') {
            const idx = this.orders.findIndex(o => o.supabaseId == payload.new.id);
            if (idx !== -1) {
                this.orders[idx] = this.mapSupabaseToLocal(payload.new);
                this.render();
            }
        } else if (payload.eventType === 'DELETE') {
            const idx = this.orders.findIndex(o => o.supabaseId == payload.old.id);
            if (idx !== -1) {
                this.orders.splice(idx, 1);
                this.render();
            }
        }
    },

    mapSupabaseToLocal(supabaseOrder) {
        // Parse items from JSON string
        let itemsStr = '';
        try {
            const items = JSON.parse(supabaseOrder.items || '[]');
            itemsStr = items.map(i => `${i.name} x${i.qty}`).join(', ');
        } catch {
            itemsStr = supabaseOrder.items || '';
        }

        return {
            id: supabaseOrder.order_number || ('ORD' + supabaseOrder.id),
            supabaseId: supabaseOrder.id,
            type: supabaseOrder.order_type === 'delivery' ? 'delivery' : 'dine_in',
            customer: supabaseOrder.customer_name || 'Khách hàng',
            phone: supabaseOrder.customer_phone || '',
            address: supabaseOrder.address || 'Tại quán',
            items: itemsStr,
            total: supabaseOrder.total || 0,
            status: this.mapStatusFromSupabase(supabaseOrder.status),
            createdAt: new Date(supabaseOrder.created_at).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
            note: supabaseOrder.notes || ''
        };
    },

    mapStatusFromSupabase(supabaseStatus) {
        const map = {
            pending: 'new',
            confirmed: 'received',
            preparing: 'received',
            ready: 'received',       // Ready for pickup = received state
            delivering: 'delivering',
            completed: 'delivered',
            served: 'delivered',     // Served = delivered
            cancelled: 'cancelled'
        };
        return map[supabaseStatus] || 'new';
    },

    mapStatusToSupabase(localStatus) {
        const map = {
            new: 'pending',
            received: 'preparing',
            delivering: 'delivering',
            delivered: 'completed'
        };
        return map[localStatus] || 'pending';
    },

    playNotificationSound() {
        try {
            // Simple beep sound
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();

            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);

            oscillator.frequency.value = 800;
            oscillator.type = 'sine';
            gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);

            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.5);
        } catch (err) {
            // Ignore audio errors
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
        card.className = 'order-card md-ripple md-focus-ring';
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
                <span class="order-total">${window.utils.formatCurrency(order.total)}</span>
                ${nextAction ?
                `<md-filled-button class="order-action-btn ${nextAction.class}" onclick="OrderManagement.handleAction('${order.id}', '${nextAction.nextStatus}')">${nextAction.label}</md-filled-button>`
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

    async showAssignShipperModal(order) {
        // Load shippers from database
        let shippersHtml = '<md-select-option value=""><div slot="headline">-- Chọn Shipper --</div></md-select-option>';

        if (typeof SupabaseService !== 'undefined' && typeof isSupabaseConfigured === 'function' && isSupabaseConfigured()) {
            try {
                const result = await SupabaseService.getActiveShippers();
                if (result.data && result.data.length > 0) {
                    shippersHtml += result.data.map(s =>
                        `<md-select-option value="${s.id}" data-name="${s.name}">
                            <div slot="headline">${s.name} ${s.status === 'online' ? '🟢' : s.status === 'busy' ? '🟡' : '⚪'}
                            (⭐${s.rating?.toFixed(1) || '5.0'} | ${s.total_deliveries || 0} đơn)</div>
                        </md-select-option>`
                    ).join('');
                } else {
                    shippersHtml += '<md-select-option value="" disabled><div slot="headline">Chưa có shipper nào</div></md-select-option>';
                }
            } catch (err) {
                console.error('Failed to load shippers:', err);
                shippersHtml += '<md-select-option value="" disabled><div slot="headline">Lỗi tải danh sách</div></md-select-option>';
            }
        } else {
            // Fallback to demo shippers
            shippersHtml += `
                <md-select-option value="demo-shipper1" data-name="Nguyễn Văn Shipper A"><div slot="headline">Nguyễn Văn Shipper A 🟢</div></md-select-option>
                <md-select-option value="demo-shipper2" data-name="Trần Văn Shipper B"><div slot="headline">Trần Văn Shipper B 🟢</div></md-select-option>
            `;
        }

        if (window.utils && window.utils.modal) {
             window.utils.modal.open('Chọn người giao hàng', `
                <div class="form-group">
                    <label>Đơn hàng: #${order.id}</label>
                    <div style="font-size: 0.9rem; margin-bottom: 0.5rem; color: var(--text-muted);">${order.customer} - ${order.phone}</div>
                    <div style="font-size: 0.9rem; margin-bottom: 1rem; color: var(--text-muted);">📍 ${order.address}</div>
                </div>
                <div class="form-group">
                    <md-outlined-select label="Chọn Shipper *" id="assignShipper" class="full-width">
                        ${shippersHtml}
                    </md-outlined-select>
                </div>
            `, `
                <md-outlined-button onclick="window.utils.modal.close()">Hủy</md-outlined-button>
                <md-filled-button onclick="OrderManagement.confirmAssign('${order.id}', '${order.supabaseId || ''}')">Xác nhận giao hàng</md-filled-button>
            `);
        }
    },

    async confirmAssign(orderId, supabaseOrderId) {
        const select = document.getElementById('assignShipper');
        const shipperId = select.value;
        // For md-outlined-select, the selected option is not directly exposed via options index like native select
        // We need to find the selected element or use the value to find data
        // MD3 select doesn't support dataset on options easily accessible via value property alone
        // But we can query the selected option
        const selectedOption = select.querySelector(`md-select-option[value="${shipperId}"]`);
        const shipperName = selectedOption?.dataset?.name || 'Shipper';

        if (!shipperId) {
            window.utils.toast.warning('Vui lòng chọn shipper');
            return;
        }

        const order = this.orders.find(o => o.id === orderId);
        if (!order) return;

        // Assign shipper in database
        if (supabaseOrderId && typeof SupabaseService !== 'undefined' && typeof isSupabaseConfigured === 'function' && isSupabaseConfigured()) {
            try {
                const result = await SupabaseService.assignShipperToDelivery(supabaseOrderId, shipperId);
                if (result.error) {
                    window.utils.toast.error('Lỗi gán shipper: ' + result.error);
                    return;
                }
            } catch (err) {
                console.error('Failed to assign shipper:', err);
            }
        }

        order.assignee = shipperName.split(' 🟢')[0].split(' 🟡')[0].split(' ⚪')[0].trim();
        order.shipperId = shipperId;
        this.updateStatus(orderId, 'delivering');
        if (window.utils.modal) window.utils.modal.close();
        window.utils.toast.success('Đã gán shipper: ' + order.assignee);
    },

    showDeliveryProofModal(order) {
        if (window.utils && window.utils.modal) {
             window.utils.modal.open('Xác minh giao hàng thành công', `
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
                    <md-outlined-text-field label="Ghi chú thêm" id="deliveryNote" placeholder="VD: Đã nhận tiền mặt, khách hài lòng..."></md-outlined-text-field>
                </div>
            `, `
                <md-outlined-button onclick="window.utils.modal.close()">Hủy</md-outlined-button>
                <md-filled-button onclick="OrderManagement.confirmDelivery('${order.id}')">Hoàn tất đơn hàng</md-filled-button>
            `);
        }
    },

    confirmDelivery(orderId) {
        const note = document.getElementById('deliveryNote').value;
        const order = this.orders.find(o => o.id === orderId);

        if (order) {
            if (note) order.deliveryNote = note;
            order.deliveryTime = window.utils.getCurrentTime();
            order.proof = 'verified'; // Simulated proof
            this.updateStatus(orderId, 'delivered');
            if (window.utils.modal) window.utils.modal.close();
            window.utils.toast.success('Đã lưu bằng chứng giao hàng!');
        }
    },

    updateStatus(orderId, newStatus) {
        const order = this.orders.find(o => o.id === orderId);
        if (order) {
            order.status = newStatus;
            this.saveOrders();
            this.render();
            window.utils.toast.success(`Cập nhật trạng thái: ${newStatus}`);

            // Sync to Supabase if available
            if (order.supabaseId && this.useSupabase && typeof SupabaseService !== 'undefined') {
                const supabaseStatus = this.mapStatusToSupabase(newStatus);
                SupabaseService.updateOrderStatus(order.supabaseId, supabaseStatus)
                    .then(result => {
                        if (result.error) {
                            console.error('Failed to sync status to Supabase:', result.error);
                        } else {
                            if (window.Debug) Debug.info('✅ Status synced to Supabase:', supabaseStatus);
                        }
                    });
            }
        }
    },

    setupEventListeners() {
        document.getElementById('addOrderBtn').addEventListener('click', () => this.showAddOrderModal());
    },

    showAddOrderModal() {
        const dailyItems = MenuManagement && MenuManagement.getDailyMenuItems ? MenuManagement.getDailyMenuItems() : [];
        const itemsOptions = dailyItems.length > 0
            ? dailyItems.map(i => `<md-select-option value="${i.name} - ${i.price}"><div slot="headline">${i.name} (${window.utils.formatCurrency(i.price)})</div></md-select-option>`).join('')
            : '<md-select-option value=""><div slot="headline">Chưa có menu hôm nay</div></md-select-option>';

        if (window.utils.modal) {
             window.utils.modal.open('Tạo đơn hàng mới', `
                <div class="form-group">
                    <label>Loại đơn hàng</label>
                    <div class="radio-group" style="display: flex; gap: 1rem; margin-bottom: 1rem; align-items: center;">
                        <div style="display: flex; align-items: center;">
                            <md-radio id="radio-dinein" name="orderType" value="dine_in" checked touch-target="wrapper" onclick="OrderManagement.toggleAddressField(false)"></md-radio>
                            <label for="radio-dinein" style="cursor: pointer; margin-left: 8px;">🍽️ Đặt trước (Tại quán)</label>
                        </div>
                        <div style="display: flex; align-items: center;">
                            <md-radio id="radio-delivery" name="orderType" value="delivery" touch-target="wrapper" onclick="OrderManagement.toggleAddressField(true)"></md-radio>
                            <label for="radio-delivery" style="cursor: pointer; margin-left: 8px;">🛵 Giao tận nơi</label>
                        </div>
                    </div>
                </div>
                <div class="form-group">
                    <md-outlined-text-field label="Tên khách hàng *" id="orderCustomer" placeholder="VD: Nguyễn Văn A"></md-outlined-text-field>
                </div>
                <div class="form-group">
                    <md-outlined-text-field label="Số điện thoại *" type="tel" id="orderPhone" placeholder="VD: 0912345678"></md-outlined-text-field>
                </div>
                <div class="form-group" id="addressGroup" style="display: none;">
                    <md-outlined-text-field label="Địa chỉ giao hàng *" id="orderAddress" placeholder="VD: 123 Nguyễn Huệ, Q.1"></md-outlined-text-field>
                </div>
                <div class="form-group">
                    <md-outlined-select label="Món ăn (Chọn từ Menu hôm nay)" id="orderItemSelect" onchange="OrderManagement.addItemToOrder()" style="width: 100%; margin-bottom: 0.5rem;">
                        <md-select-option value=""><div slot="headline">-- Chọn món --</div></md-select-option>
                        ${itemsOptions}
                    </md-outlined-select>
                    <md-outlined-text-field type="textarea" id="orderItems" rows="3" label="Chi tiết món..." style="width: 100%;"></md-outlined-text-field>
                </div>
                <div class="form-group">
                    <md-outlined-text-field label="Tổng tiền (VNĐ) *" type="number" id="orderTotal" placeholder="0" min="0"></md-outlined-text-field>
                </div>
                <div class="form-group">
                    <md-outlined-text-field label="Ghi chú" id="orderNote" placeholder="VD: Ít cay..."></md-outlined-text-field>
                </div>
            `, `
                <md-outlined-button onclick="window.utils.modal.close()">Hủy</md-outlined-button>
                <md-filled-button onclick="OrderManagement.createOrder()">Tạo đơn</md-filled-button>
            `);
        }
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
        const typeRadio = document.querySelector('md-radio[name="orderType"][checked]') || document.querySelector('md-radio[name="orderType"]');
        // md-radio doesn't use 'checked' attribute for state exactly like native input in querySelector always, need to check property
        // But here we are using click handlers to set state.
        // Actually, md-radio group behaviour is handled by name. We can query the checked one.
        // For md-radio, we can just check checked property.

        let type = 'dine_in';
        if (document.getElementById('radio-delivery').checked) type = 'delivery';

        const customer = document.getElementById('orderCustomer').value.trim();
        const phone = document.getElementById('orderPhone').value.trim();
        let address = document.getElementById('orderAddress').value.trim();
        const items = document.getElementById('orderItems').value.trim();
        const total = parseInt(document.getElementById('orderTotal').value) || 0;
        const note = document.getElementById('orderNote').value.trim();

        if (type === 'dine_in') address = 'Tại quán (Đặt trước)';

        if (!customer || !phone || !address || !items || !total) {
            window.utils.toast.warning('Vui lòng điền đầy đủ thông tin');
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
            createdAt: window.utils.getCurrentTime(),
            note
        };

        this.orders.unshift(newOrder);
        this.saveOrders();
        this.render();
        if (window.utils.modal) window.utils.modal.close();
        window.utils.toast.success('Tạo đơn hàng thành công');
    },

    showOrderDetail(order) {
        const typeLabel = order.type === 'dine_in' ? '🍽️ Đặt trước' : '🛵 Giao hàng';

        if (window.utils.modal) {
             window.utils.modal.open(`Chi tiết đơn hàng #${order.id}`, `
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
                    <strong style="font-size: 1.25rem; color: var(--secondary);">${window.utils.formatCurrency(order.total)}</strong>
                </div>
            `, `
                <md-outlined-button onclick="window.utils.modal.close()">Đóng</md-outlined-button>
                <md-filled-button onclick="OrderManagement.printOrder('${order.id}')">🖨️ In đơn</md-filled-button>
            `);
        }
    }
};

window.OrderManagement = OrderManagement;
