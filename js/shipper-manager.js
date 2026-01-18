// =====================================================
// SHIPPER MANAGER - ADMIN MODULE
// Manage shipper accounts, PINs, and permissions
// =====================================================

const ShipperManager = {
    state: {
        shippers: [],
        currentEdit: null
    },

    async init() {
        console.log('🚚 Shipper Manager Initialized');
        const container = document.getElementById('page-shippers');
        if (!container || container.querySelector('.shippers-header')) return;

        this.renderUI(container);
        await this.loadShippers();
    },

    renderUI(container) {
        container.innerHTML = `
            <div class="shippers-header">
                <div class="header-left">
                    <h2>🚚 Quản Lý Shipper</h2>
                    <span class="shipper-count" id="shipperCount">0 shipper</span>
                </div>
                <button class="btn-primary btn-icon-text" onclick="ShipperManager.openModal()">
                    <span>+</span> Thêm Shipper
                </button>
            </div>

            <div class="shippers-table-wrapper">
                <table class="shippers-table">
                    <thead>
                        <tr>
                            <th>Tên</th>
                            <th>Số điện thoại</th>
                            <th>Đánh giá</th>
                            <th>Đơn giao</th>
                            <th>Thu nhập</th>
                            <th>Trạng thái</th>
                            <th>Hoạt động</th>
                            <th style="width: 120px;">Hành động</th>
                        </tr>
                    </thead>
                    <tbody id="shippersTableBody">
                        <tr><td colspan="8" class="loading-state">⏳ Đang tải...</td></tr>
                    </tbody>
                </table>
            </div>

            <style>
                .shippers-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 20px;
                    padding: 20px;
                    background: var(--bg-card);
                    border-radius: 12px;
                }
                .header-left h2 { margin: 0 0 5px 0; }
                .shipper-count {
                    font-size: 0.85rem;
                    color: var(--text-secondary);
                }
                .shippers-table-wrapper {
                    background: var(--bg-card);
                    border-radius: 12px;
                    overflow: hidden;
                }
                .shippers-table {
                    width: 100%;
                    border-collapse: collapse;
                }
                .shippers-table th {
                    background: var(--bg-surface);
                    padding: 14px 16px;
                    text-align: left;
                    font-weight: 600;
                    border-bottom: 2px solid var(--border);
                }
                .shippers-table td {
                    padding: 14px 16px;
                    border-bottom: 1px solid var(--border);
                }
                .shippers-table tbody tr:hover {
                    background: var(--bg-hover);
                }
                .status-badge {
                    display: inline-block;
                    padding: 4px 12px;
                    border-radius: 12px;
                    font-size: 0.85rem;
                    font-weight: 500;
                }
                .status-online { background: #e8f5e9; color: #2e7d32; }
                .status-offline { background: #f5f5f5; color: #757575; }
                .status-busy { background: #fff3e0; color: #f57c00; }
                .active-badge {
                    display: inline-block;
                    padding: 4px 12px;
                    border-radius: 12px;
                    font-size: 0.85rem;
                }
                .active-yes { background: #e8f5e9; color: #2e7d32; }
                .active-no { background: #ffebee; color: #c62828; }
            </style>
        `;
    },

    async loadShippers() {
        const supabase = await getSupabase();
        const { data, error } = await supabase
            .from('shippers')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            toast.error('Lỗi khi tải shippers: ' + error.message);
            return;
        }

        this.state.shippers = data || [];
        this.renderTable();
    },

    renderTable() {
        const tbody = document.getElementById('shippersTableBody');
        const count = document.getElementById('shipperCount');

        if (!tbody) return;

        if (this.state.shippers.length === 0) {
            tbody.innerHTML = `
                <tr><td colspan="8" class="empty-state">
                    📭 Chưa có shipper nào<br>
                    <small>Click "Thêm Shipper" để tạo tài khoản mới</small>
                </td></tr>
            `;
            if (count) count.textContent = '0 shipper';
            return;
        }

        tbody.innerHTML = this.state.shippers.map(s => `
            <tr>
                <td><strong>${s.name}</strong></td>
                <td>${s.phone}</td>
                <td>⭐ ${s.rating || '5.0'}</td>
                <td>${s.total_deliveries || 0}</td>
                <td>${(s.total_earnings || 0).toLocaleString('vi-VN')}đ</td>
                <td>
                    <span class="status-badge status-${s.status || 'offline'}">
                        ${s.status === 'online' ? '🟢 Online' :
                s.status === 'busy' ? '🟠 Đang giao' : '⚪ Offline'}
                    </span>
                </td>
                <td>
                    <span class="active-badge active-${s.is_active ? 'yes' : 'no'}">
                        ${s.is_active ? '✅ Hoạt động' : '❌ Khóa'}
                    </span>
                </td>
                <td>
                    <div class="action-buttons">
                        <button class="btn-icon" onclick="ShipperManager.resetPin('${s.id}')" title="Reset PIN">
                            🔑
                        </button>
                        <button class="btn-icon" onclick="ShipperManager.toggleActive('${s.id}')" title="Khóa/Mở">
                            ${s.is_active ? '🔓' : '🔒'}
                        </button>
                        <button class="btn-icon" onclick="ShipperManager.openModal('${s.id}')" title="Sửa">
                            ✏️
                        </button>
                        <button class="btn-icon" onclick="ShipperManager.deleteShipper('${s.id}')" title="Xóa">
                            🗑️
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');

        if (count) count.textContent = `${this.state.shippers.length} shipper`;
    },

    openModal(shipperId = null) {
        let shipper = {
            name: '',
            phone: '',
            commission_rate: 15000
        };

        if (shipperId) {
            shipper = this.state.shippers.find(s => s.id === shipperId) || shipper;
        }

        this.state.currentEdit = shipperId ? shipper : null;

        const modalHtml = `
            <div class="modal-overlay active" id="shipperModal">
                <div class="modal-container">
                    <div class="modal-header">
                        <h3>${shipperId ? '✏️ Sửa thông tin Shipper' : '➕ Thêm Shipper mới'}</h3>
                        <button class="btn-close" onclick="document.getElementById('shipperModal').remove()">×</button>
                    </div>
                    <div class="modal-body">
                        <form id="shipperForm" onsubmit="event.preventDefault(); ShipperManager.saveShipper();">
                            <div class="form-group">
                                <label>Tên Shipper *</label>
                                <input type="text" id="sName" class="md-input" 
                                       value="${shipper.name}" 
                                       placeholder="Nguyễn Văn A"
                                       required>
                            </div>
                            
                            <div class="form-group">
                                <label>Số điện thoại *</label>
                                <input type="tel" id="sPhone" class="md-input" 
                                       value="${shipper.phone}" 
                                       placeholder="0901234567"
                                       pattern="[0-9]{10}"
                                       ${shipperId ? 'disabled' : ''}
                                       required>
                                <small class="field-hint">10 chữ số, không có khoảng trắng</small>
                            </div>

                            ${!shipperId ? `
                            <div class="form-group">
                                <label>Mã PIN (4 chữ số) *</label>
                                <div style="display: flex; gap: 8px;">
                                    <input type="text" id="sPin" class="md-input" 
                                           placeholder="0000" 
                                           pattern="[0-9]{4}"
                                           maxlength="4"
                                           required>
                                    <button type="button" class="btn-secondary" onclick="ShipperManager.generatePin()">
                                        🎲 Tạo ngẫu nhiên
                                    </button>
                                </div>
                                <small class="field-hint">⚠️ Lưu lại PIN để gửi cho shipper. Không thể xem lại!</small>
                            </div>
                            ` : ''}

                            <div class="form-group">
                                <label>Hoa hồng/đơn (VNĐ)</label>
                                <input type="number" id="sCommission" class="md-input" 
                                       value="${shipper.commission_rate || 15000}" 
                                       min="0" step="1000">
                                <small class="field-hint">Mặc định: 15,000đ/đơn</small>
                            </div>

                            <div class="modal-footer">
                                <button type="button" class="md-button" onclick="document.getElementById('shipperModal').remove()">
                                    Hủy
                                </button>
                                <button type="submit" class="md-button md-button-filled">
                                    💾 ${shipperId ? 'Cập nhật' : 'Tạo tài khoản'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', modalHtml);
    },

    generatePin() {
        const pin = Math.floor(1000 + Math.random() * 9000).toString();
        document.getElementById('sPin').value = pin;
    },

    async saveShipper() {
        const id = this.state.currentEdit ? this.state.currentEdit.id : undefined;
        const supabase = await getSupabase();

        if (!id) {
            // Create new shipper
            const name = document.getElementById('sName').value;
            const phone = document.getElementById('sPhone').value;
            const pin = document.getElementById('sPin').value;
            const commission = parseInt(document.getElementById('sCommission').value);

            // Call RPC function to create shipper with hashed PIN
            const { data, error } = await supabase.rpc('admin_create_shipper', {
                p_name: name,
                p_phone: phone,
                p_pin: pin
            });

            if (error || (data && data.length > 0 && !data[0].success)) {
                const errMsg = data?.[0]?.error_message || error?.message || 'Lỗi không xác định';
                toast.error('Lỗi: ' + errMsg);
                return;
            }

            // Update commission rate
            const newId = data[0].shipper_id;
            await supabase
                .from('shippers')
                .update({ commission_rate: commission })
                .eq('id', newId);

            toast.success(`✅ Đã tạo tài khoản shipper!\n📱 Số điện thoại: ${phone}\n🔑 PIN: ${pin}\n\n⚠️ Gửi PIN này cho shipper và KHÔNG THỂ xem lại!`);

        } else {
            // Update existing shipper
            const name = document.getElementById('sName').value;
            const commission = parseInt(document.getElementById('sCommission').value);

            const { error } = await supabase
                .from('shippers')
                .update({
                    name: name,
                    commission_rate: commission
                })
                .eq('id', id);

            if (error) {
                toast.error('Lỗi khi cập nhật: ' + error.message);
                return;
            }

            toast.success('✅ Đã cập nhật thông tin shipper!');
        }

        document.getElementById('shipperModal').remove();
        this.loadShippers();
    },

    async resetPin(id) {
        const newPin = Math.floor(1000 + Math.random() * 9000).toString();

        if (!confirm(`Tạo PIN mới: ${newPin}\n\nBạn có chắc chắn reset PIN cho shipper này?\n\n⚠️ Shipper sẽ bị đăng xuất khỏi thiết bị cũ và cần đăng nhập lại với PIN mới.`)) {
            return;
        }

        const supabase = await getSupabase();
        const { data, error } = await supabase.rpc('admin_reset_shipper_pin', {
            p_shipper_id: id,
            p_new_pin: newPin
        });

        if (error || (data && data.length > 0 && !data[0].success)) {
            const errMsg = data?.[0]?.error_message || error?.message || 'Lỗi không xác định';
            toast.error('Lỗi: ' + errMsg);
            return;
        }

        toast.success(`🔑 PIN mới: ${newPin}\n\n⚠️ Gửi ngay cho shipper và KHÔNG THỂ xem lại!`);
        this.loadShippers();
    },

    async toggleActive(id) {
        const shipper = this.state.shippers.find(s => s.id === id);
        if (!shipper) return;

        const newStatus = !shipper.is_active;
        const action = newStatus ? 'mở khóa' : 'khóa';

        if (!confirm(`Bạn có chắc chắn muốn ${action} shipper ${shipper.name}?`)) return;

        const supabase = await getSupabase();
        const { error } = await supabase
            .from('shippers')
            .update({ is_active: newStatus })
            .eq('id', id);

        if (error) {
            toast.error('Lỗi: ' + error.message);
            return;
        }

        toast.success(newStatus ? '🔓 Đã mở khóa shipper' : '🔒 Đã khóa shipper');
        this.loadShippers();
    },

    async deleteShipper(id) {
        const shipper = this.state.shippers.find(s => s.id === id);
        if (!shipper) return;

        if (!confirm(`⚠️ Xóa shipper ${shipper.name}?\n\nHành động này KHÔNG THỂ hoàn tác!`)) return;

        const supabase = await getSupabase();
        const { error } = await supabase
            .from('shippers')
            .delete()
            .eq('id', id);

        if (error) {
            toast.error('Lỗi khi xóa: ' + error.message);
            return;
        }

        toast.success('🗑️ Đã xóa shipper');
        this.loadShippers();
    }
};

window.ShipperManager = ShipperManager;
