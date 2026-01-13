// ========================================
// SHIPPER ADMIN MODULE - ÁNH DƯƠNG F&B
// CRUD operations for shipper management
// ========================================

const ShipperAdmin = {
    shippers: [],

    async init() {
        await this.loadShippers();
        this.render();
        this.setupEventListeners();
        console.log('✅ ShipperAdmin initialized');
    },

    async loadShippers() {
        try {
            const supabase = await window.getSupabase();
            if (!supabase) {
                console.warn('Supabase not configured');
                return;
            }

            const { data, error } = await supabase
                .from('shippers')
                .select('id, name, phone, status, rating, total_deliveries, total_earnings, is_active, created_at')
                .order('created_at', { ascending: false });

            if (error) throw error;
            this.shippers = data || [];
        } catch (err) {
            console.error('Failed to load shippers:', err);
            this.shippers = [];
        }
    },

    render() {
        const tbody = document.getElementById('shippersBody');
        const statsEl = document.getElementById('shipperStats');
        if (!tbody) return;

        // Update stats
        const activeCount = this.shippers.filter(s => s.is_active).length;
        const onlineCount = this.shippers.filter(s => s.status === 'online').length;
        if (statsEl) {
            statsEl.innerHTML = `
                <span class="stat-badge">Tổng: <strong>${this.shippers.length}</strong></span>
                <span class="stat-badge success">Online: <strong>${onlineCount}</strong></span>
                <span class="stat-badge">Active: <strong>${activeCount}</strong></span>
            `;
        }

        // Render table
        if (this.shippers.length === 0) {
            tbody.innerHTML = `<tr><td colspan="7" class="text-center">Chưa có shipper nào</td></tr>`;
            return;
        }

        tbody.innerHTML = this.shippers.map(shipper => `
            <tr data-id="${shipper.id}">
                <td>
                    <strong>${shipper.name}</strong>
                    ${!shipper.is_active ? '<span class="badge-inactive">Ngưng</span>' : ''}
                </td>
                <td>${shipper.phone}</td>
                <td>
                    <span class="status-badge status-${shipper.status || 'offline'}">
                        ${this.getStatusLabel(shipper.status)}
                    </span>
                </td>
                <td>⭐ ${(shipper.rating || 5.0).toFixed(1)}</td>
                <td>${shipper.total_deliveries || 0}</td>
                <td>${this.formatCurrency(shipper.total_earnings || 0)}</td>
                <td>
                    <button type="button" class="btn-icon-sm" onclick="ShipperAdmin.editShipper('${shipper.id}')" title="Sửa">✏️</button>
                    <button type="button" class="btn-icon-sm" onclick="ShipperAdmin.resetPIN('${shipper.id}')" title="Đổi PIN">🔑</button>
                    <button type="button" class="btn-icon-sm" onclick="ShipperAdmin.toggleActive('${shipper.id}')" title="${shipper.is_active ? 'Ngưng' : 'Kích hoạt'}">
                        ${shipper.is_active ? '🚫' : '✅'}
                    </button>
                </td>
            </tr>
        `).join('');
    },

    getStatusLabel(status) {
        const labels = {
            'online': '🟢 Online',
            'busy': '🟠 Busy',
            'offline': '⚫ Offline'
        };
        return labels[status] || '⚫ Offline';
    },

    formatCurrency(amount) {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
    },

    setupEventListeners() {
        const addBtn = document.getElementById('addShipperBtn');
        if (addBtn) {
            addBtn.onclick = () => this.showAddModal();
        }
    },

    // ==================== ADD SHIPPER ====================

    showAddModal() {
        const modal = document.getElementById('modal');
        const overlay = document.getElementById('modalOverlay');
        const title = document.getElementById('modalTitle');
        const body = document.getElementById('modalBody');
        const footer = document.getElementById('modalFooter');

        title.textContent = '➕ Thêm Shipper Mới';
        body.innerHTML = `
            <div class="form-group">
                <label>Tên shipper *</label>
                <input type="text" id="shipperName" placeholder="Nguyễn Văn A" required>
            </div>
            <div class="form-group">
                <label>Số điện thoại *</label>
                <input type="tel" id="shipperPhone" placeholder="0912345678" required>
            </div>
            <div class="form-group">
                <label>Mã PIN (4 số) *</label>
                <input type="password" id="shipperPIN" placeholder="1234" maxlength="4" pattern="[0-9]{4}" required>
                <small>PIN dùng để shipper đăng nhập app</small>
            </div>
            <div class="form-group">
                <label>Hoa hồng/đơn (VND)</label>
                <input type="number" id="shipperCommission" value="15000" min="0">
            </div>
        `;
        footer.innerHTML = `
            <button type="button" class="btn-secondary" onclick="ShipperAdmin.closeModal()">Hủy</button>
            <button type="button" class="btn-primary" onclick="ShipperAdmin.addShipper()">Thêm</button>
        `;

        overlay.classList.add('active');
        modal.classList.add('active');
    },

    async addShipper() {
        const name = document.getElementById('shipperName').value.trim();
        const phone = document.getElementById('shipperPhone').value.trim();
        const pin = document.getElementById('shipperPIN').value.trim();
        const commission = parseInt(document.getElementById('shipperCommission').value) || 15000;

        // Validate
        if (!name || !phone || !pin) {
            Toast.error('Vui lòng điền đầy đủ thông tin');
            return;
        }
        if (!/^[0-9]{4}$/.test(pin)) {
            Toast.error('PIN phải là 4 chữ số');
            return;
        }
        if (!/^0[0-9]{9}$/.test(phone)) {
            Toast.error('Số điện thoại không hợp lệ');
            return;
        }

        try {
            const supabase = await window.getSupabase();
            if (!supabase) throw new Error('Supabase not configured');

            // Insert with hashed PIN via RPC
            const { data, error } = await supabase.rpc('add_shipper_secure', {
                p_name: name,
                p_phone: phone,
                p_pin: pin,
                p_commission: commission
            });

            if (error) throw error;

            Toast.success('Đã thêm shipper thành công!');
            this.closeModal();
            await this.loadShippers();
            this.render();
        } catch (err) {
            console.error('Add shipper error:', err);
            Toast.error('Lỗi: ' + (err.message || 'Không thể thêm shipper'));
        }
    },

    // ==================== EDIT SHIPPER ====================

    editShipper(id) {
        const shipper = this.shippers.find(s => s.id === id);
        if (!shipper) return;

        const modal = document.getElementById('modal');
        const overlay = document.getElementById('modalOverlay');
        const title = document.getElementById('modalTitle');
        const body = document.getElementById('modalBody');
        const footer = document.getElementById('modalFooter');

        title.textContent = '✏️ Sửa Shipper';
        body.innerHTML = `
            <div class="form-group">
                <label>Tên shipper</label>
                <input type="text" id="editShipperName" value="${shipper.name}">
            </div>
            <div class="form-group">
                <label>Số điện thoại</label>
                <input type="tel" id="editShipperPhone" value="${shipper.phone}" disabled>
                <small>Không thể đổi SĐT</small>
            </div>
        `;
        footer.innerHTML = `
            <button type="button" class="btn-secondary" onclick="ShipperAdmin.closeModal()">Hủy</button>
            <button type="button" class="btn-primary" onclick="ShipperAdmin.saveEdit('${id}')">Lưu</button>
        `;

        overlay.classList.add('active');
        modal.classList.add('active');
    },

    async saveEdit(id) {
        const name = document.getElementById('editShipperName').value.trim();
        if (!name) {
            Toast.error('Tên không được để trống');
            return;
        }

        try {
            const supabase = await window.getSupabase();
            const { error } = await supabase
                .from('shippers')
                .update({ name, updated_at: new Date().toISOString() })
                .eq('id', id);

            if (error) throw error;

            Toast.success('Đã cập nhật!');
            this.closeModal();
            await this.loadShippers();
            this.render();
        } catch (err) {
            Toast.error('Lỗi: ' + err.message);
        }
    },

    // ==================== RESET PIN ====================

    resetPIN(id) {
        const shipper = this.shippers.find(s => s.id === id);
        if (!shipper) return;

        const modal = document.getElementById('modal');
        const overlay = document.getElementById('modalOverlay');
        const title = document.getElementById('modalTitle');
        const body = document.getElementById('modalBody');
        const footer = document.getElementById('modalFooter');

        title.textContent = '🔑 Đổi PIN - ' + shipper.name;
        body.innerHTML = `
            <div class="form-group">
                <label>PIN mới (4 số)</label>
                <input type="password" id="newPIN" placeholder="1234" maxlength="4" pattern="[0-9]{4}">
            </div>
            <div class="form-group">
                <label>Xác nhận PIN</label>
                <input type="password" id="confirmPIN" placeholder="1234" maxlength="4">
            </div>
        `;
        footer.innerHTML = `
            <button type="button" class="btn-secondary" onclick="ShipperAdmin.closeModal()">Hủy</button>
            <button type="button" class="btn-primary" onclick="ShipperAdmin.savePIN('${id}')">Đổi PIN</button>
        `;

        overlay.classList.add('active');
        modal.classList.add('active');
    },

    async savePIN(id) {
        const newPIN = document.getElementById('newPIN').value;
        const confirmPIN = document.getElementById('confirmPIN').value;

        if (!/^[0-9]{4}$/.test(newPIN)) {
            Toast.error('PIN phải là 4 chữ số');
            return;
        }
        if (newPIN !== confirmPIN) {
            Toast.error('PIN xác nhận không khớp');
            return;
        }

        try {
            const supabase = await window.getSupabase();
            const { error } = await supabase.rpc('reset_shipper_pin', {
                p_shipper_id: id,
                p_new_pin: newPIN
            });

            if (error) throw error;

            Toast.success('Đã đổi PIN thành công!');
            this.closeModal();
        } catch (err) {
            Toast.error('Lỗi: ' + err.message);
        }
    },

    // ==================== TOGGLE ACTIVE ====================

    async toggleActive(id) {
        const shipper = this.shippers.find(s => s.id === id);
        if (!shipper) return;

        const newStatus = !shipper.is_active;
        const action = newStatus ? 'kích hoạt' : 'ngưng hoạt động';

        if (!confirm(`Bạn có chắc muốn ${action} shipper ${shipper.name}?`)) return;

        try {
            const supabase = await window.getSupabase();
            const { error } = await supabase
                .from('shippers')
                .update({ is_active: newStatus, updated_at: new Date().toISOString() })
                .eq('id', id);

            if (error) throw error;

            Toast.success(`Đã ${action} shipper!`);
            await this.loadShippers();
            this.render();
        } catch (err) {
            Toast.error('Lỗi: ' + err.message);
        }
    },

    // ==================== UTILS ====================

    closeModal() {
        document.getElementById('modalOverlay').classList.remove('active');
        document.getElementById('modal').classList.remove('active');
    }
};

// Initialize when page loads
document.addEventListener('DOMContentLoaded', () => {
    // Initialize when shipper page is first shown
    const observer = new MutationObserver((mutations) => {
        const shipperPage = document.getElementById('page-shippers');
        if (shipperPage && shipperPage.classList.contains('active')) {
            ShipperAdmin.init();
            observer.disconnect();
        }
    });

    observer.observe(document.body, { subtree: true, attributes: true, attributeFilter: ['class'] });
});

window.ShipperAdmin = ShipperAdmin;
