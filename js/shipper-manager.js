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
                <div class="header-actions">
                    <button class="btn-secondary btn-icon-text" onclick="ShipperManager.openReport()">
                        📊 Báo Cáo
                    </button>
                    <button class="btn-primary btn-icon-text" onclick="ShipperManager.openModal()">
                        <span>+</span> Thêm Shipper
                    </button>
                </div>
            </div>

            <!-- Stats Dashboard -->
            <div class="shipper-stats-grid" id="shipperStats">
                <div class="shipper-stat-card">
                    <div class="stat-icon">👥</div>
                    <div class="stat-content">
                        <span class="stat-value" id="statTotalShippers">0</span>
                        <span class="stat-label">Tổng shipper</span>
                    </div>
                </div>
                <div class="shipper-stat-card online">
                    <div class="stat-icon">🟢</div>
                    <div class="stat-content">
                        <span class="stat-value" id="statOnlineShippers">0</span>
                        <span class="stat-label">Đang online</span>
                    </div>
                </div>
                <div class="shipper-stat-card">
                    <div class="stat-icon">📦</div>
                    <div class="stat-content">
                        <span class="stat-value" id="statTotalDeliveries">0</span>
                        <span class="stat-label">Tổng đơn giao</span>
                    </div>
                </div>
                <div class="shipper-stat-card earnings">
                    <div class="stat-icon">💰</div>
                    <div class="stat-content">
                        <span class="stat-value" id="statTotalEarnings">0đ</span>
                        <span class="stat-label">Tổng hoa hồng</span>
                    </div>
                </div>
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
                
                /* Stats Grid */
                .shipper-stats-grid {
                    display: grid;
                    grid-template-columns: repeat(4, 1fr);
                    gap: 16px;
                    margin-bottom: 24px;
                }
                .shipper-stat-card {
                    background: var(--bg-card);
                    border-radius: 16px;
                    padding: 20px;
                    display: flex;
                    align-items: center;
                    gap: 16px;
                    border: 1px solid var(--border);
                    transition: transform 0.2s, box-shadow 0.2s;
                }
                .shipper-stat-card:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 8px 24px rgba(0,0,0,0.15);
                }
                .shipper-stat-card .stat-icon {
                    font-size: 2rem;
                    width: 56px;
                    height: 56px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    background: var(--bg-surface);
                    border-radius: 12px;
                }
                .shipper-stat-card.online .stat-icon { background: #e8f5e9; }
                .shipper-stat-card.earnings .stat-icon { background: #fff8e1; }
                .shipper-stat-card .stat-content {
                    display: flex;
                    flex-direction: column;
                }
                .shipper-stat-card .stat-value {
                    font-size: 1.75rem;
                    font-weight: 700;
                    color: var(--text-primary);
                }
                .shipper-stat-card .stat-label {
                    font-size: 0.85rem;
                    color: var(--text-secondary);
                    margin-top: 2px;
                }
                @media (max-width: 900px) {
                    .shipper-stats-grid { grid-template-columns: repeat(2, 1fr); }
                }
                @media (max-width: 500px) {
                    .shipper-stats-grid { grid-template-columns: 1fr; }
                }
            </style>
        `;
    },

    async loadShippers() {
        const supabase = await getSupabase();

        // Load shippers
        const { data: shippers, error } = await supabase
            .from('shippers')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            toast.error('Lỗi khi tải shippers: ' + error.message);
            return;
        }

        // Load delivery stats for each shipper
        const { data: stats, error: statsError } = await supabase
            .from('delivery_assignments')
            .select('shipper_id, status, commission')
            .eq('status', 'delivered');

        if (!statsError && stats) {
            // Aggregate stats by shipper
            const shipperStats = {};
            stats.forEach(d => {
                if (!shipperStats[d.shipper_id]) {
                    shipperStats[d.shipper_id] = { count: 0, earnings: 0 };
                }
                shipperStats[d.shipper_id].count++;
                shipperStats[d.shipper_id].earnings += (d.commission || 15000);
            });

            // Merge stats into shippers
            shippers.forEach(s => {
                const stat = shipperStats[s.id] || { count: 0, earnings: 0 };
                s.total_deliveries = stat.count;
                s.total_earnings = stat.earnings;
            });
        }

        this.state.shippers = shippers || [];
        this.renderTable();
        this.updateStats();
    },

    updateStats() {
        const shippers = this.state.shippers;

        // Calculate totals
        const totalShippers = shippers.length;
        const onlineShippers = shippers.filter(s => s.status === 'online' || s.status === 'busy').length;
        const totalDeliveries = shippers.reduce((sum, s) => sum + (s.total_deliveries || 0), 0);
        const totalEarnings = shippers.reduce((sum, s) => sum + (s.total_earnings || 0), 0);

        // Update UI
        const el = (id, val) => {
            const elem = document.getElementById(id);
            if (elem) elem.textContent = val;
        };

        el('statTotalShippers', totalShippers);
        el('statOnlineShippers', onlineShippers);
        el('statTotalDeliveries', totalDeliveries);
        el('statTotalEarnings', totalEarnings.toLocaleString('vi-VN') + 'đ');
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
            <div class="modal-overlay active shipper-modal-overlay" id="shipperModal">
                <div class="shipper-modal">
                    <!-- Premium Header with Gradient -->
                    <div class="shipper-modal-header">
                        <div class="shipper-modal-icon">
                            ${shipperId ? '✏️' : '🚚'}
                        </div>
                        <div class="shipper-modal-title">
                            <h3>${shipperId ? 'Cập nhật thông tin' : 'Tạo tài khoản Shipper'}</h3>
                            <p>${shipperId ? 'Chỉnh sửa thông tin shipper hiện tại' : 'Thêm shipper mới vào hệ thống'}</p>
                        </div>
                        <button class="shipper-modal-close" onclick="document.getElementById('shipperModal').remove()">
                            <span>×</span>
                        </button>
                    </div>
                    
                    <!-- Form Body -->
                    <form id="shipperForm" onsubmit="event.preventDefault(); ShipperManager.saveShipper();">
                        <div class="shipper-modal-body">
                            <!-- Name Field -->
                            <div class="shipper-form-group">
                                <div class="shipper-field-header">
                                    <span class="shipper-field-icon">👤</span>
                                    <label>Họ và tên đầy đủ</label>
                                    <span class="shipper-required">*</span>
                                </div>
                                <input type="text" id="sName" class="shipper-input" 
                                       value="${shipper.name}" 
                                       placeholder="Ví dụ: Nguyễn Hữu Cần"
                                       required>
                                <div class="shipper-field-hint">
                                    <span class="hint-icon">💡</span>
                                    Tên đầy đủ giúp khách hàng nhận diện shipper
                                </div>
                            </div>
                            
                            <!-- Phone Field -->
                            <div class="shipper-form-group">
                                <div class="shipper-field-header">
                                    <span class="shipper-field-icon">📱</span>
                                    <label>Số điện thoại</label>
                                    <span class="shipper-required">*</span>
                                    <span class="shipper-badge">Đăng nhập</span>
                                </div>
                                <input type="tel" id="sPhone" class="shipper-input" 
                                       value="${shipper.phone}" 
                                       placeholder="0901234567"
                                       pattern="[0-9]{10}"
                                       ${shipperId ? 'disabled' : ''}
                                       required>
                                <div class="shipper-field-hint">
                                    <span class="hint-icon">ℹ️</span>
                                    10 chữ số • Shipper dùng SĐT này để đăng nhập app
                                </div>
                            </div>

                            ${!shipperId ? `
                            <!-- PIN Field - Only for new shipper -->
                            <div class="shipper-form-group shipper-pin-group">
                                <div class="shipper-field-header">
                                    <span class="shipper-field-icon">🔐</span>
                                    <label>Mã PIN bí mật</label>
                                    <span class="shipper-required">*</span>
                                </div>
                                <div class="shipper-pin-wrapper">
                                    <input type="text" id="sPin" class="shipper-pin-input" 
                                           placeholder="• • • •" 
                                           pattern="[0-9]{4}"
                                           maxlength="4"
                                           required>
                                    <button type="button" class="shipper-pin-generate" onclick="ShipperManager.generatePin()">
                                        <span class="pin-icon">🎲</span>
                                        <span class="pin-text">Tạo ngẫu nhiên</span>
                                    </button>
                                </div>
                                <div class="shipper-pin-warning">
                                    <div class="warning-icon">⚠️</div>
                                    <div class="warning-text">
                                        <strong>QUAN TRỌNG</strong>
                                        <span>Ghi lại PIN để gửi cho shipper. Không thể xem lại sau khi tạo!</span>
                                    </div>
                                </div>
                            </div>
                            ` : ''}

                            <!-- Commission Field -->
                            <div class="shipper-form-group">
                                <div class="shipper-field-header">
                                    <span class="shipper-field-icon">💰</span>
                                    <label>Hoa hồng mỗi đơn</label>
                                </div>
                                <div class="shipper-commission-wrapper">
                                    <input type="number" id="sCommission" class="shipper-input" 
                                           value="${shipper.commission_rate || 15000}" 
                                           min="0" step="1000">
                                    <span class="shipper-currency">VNĐ</span>
                                </div>
                                <div class="shipper-field-hint">
                                    <span class="hint-icon">💡</span>
                                    Số tiền shipper nhận khi giao hàng thành công
                                </div>
                            </div>
                        </div>

                        <!-- Footer Actions -->
                        <div class="shipper-modal-footer">
                            <button type="button" class="shipper-btn-cancel" onclick="document.getElementById('shipperModal').remove()">
                                Hủy bỏ
                            </button>
                            <button type="submit" class="shipper-btn-submit">
                                <span class="btn-icon">${shipperId ? '💾' : '✨'}</span>
                                <span>${shipperId ? 'Lưu thay đổi' : 'Tạo tài khoản'}</span>
                            </button>
                        </div>
                    </form>
                </div>
            </div>
            
            <style>
                /* Modal Overlay */
                .shipper-modal-overlay {
                    position: fixed;
                    inset: 0;
                    background: rgba(0, 0, 0, 0.7);
                    backdrop-filter: blur(8px);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 9999;
                    animation: fadeIn 0.3s ease;
                }
                
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                
                /* Modal Container */
                .shipper-modal {
                    background: linear-gradient(145deg, rgba(30, 30, 35, 0.95), rgba(25, 25, 30, 0.98));
                    border-radius: 24px;
                    width: 95%;
                    max-width: 480px;
                    max-height: 90vh;
                    overflow: hidden;
                    box-shadow: 
                        0 25px 50px -12px rgba(0, 0, 0, 0.5),
                        0 0 0 1px rgba(255, 255, 255, 0.1),
                        inset 0 1px 0 rgba(255, 255, 255, 0.1);
                    animation: slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1);
                }
                
                @keyframes slideUp {
                    from { transform: translateY(30px) scale(0.95); opacity: 0; }
                    to { transform: translateY(0) scale(1); opacity: 1; }
                }
                
                /* Premium Header */
                .shipper-modal-header {
                    background: linear-gradient(135deg, #2e7d32 0%, #1b5e20 50%, #43a047 100%);
                    padding: 24px;
                    display: flex;
                    align-items: center;
                    gap: 16px;
                    position: relative;
                    overflow: hidden;
                }
                
                .shipper-modal-header::before {
                    content: '';
                    position: absolute;
                    inset: 0;
                    background: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
                    opacity: 0.5;
                }
                
                .shipper-modal-icon {
                    width: 56px;
                    height: 56px;
                    background: rgba(255, 255, 255, 0.2);
                    border-radius: 16px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 28px;
                    backdrop-filter: blur(10px);
                    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
                    animation: pulse 2s infinite;
                }
                
                @keyframes pulse {
                    0%, 100% { transform: scale(1); }
                    50% { transform: scale(1.05); }
                }
                
                .shipper-modal-title {
                    flex: 1;
                    z-index: 1;
                }
                
                .shipper-modal-title h3 {
                    margin: 0;
                    font-size: 1.35rem;
                    font-weight: 700;
                    color: white;
                    text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
                }
                
                .shipper-modal-title p {
                    margin: 4px 0 0;
                    font-size: 0.9rem;
                    color: rgba(255, 255, 255, 0.8);
                }
                
                .shipper-modal-close {
                    width: 36px;
                    height: 36px;
                    border: none;
                    background: rgba(255, 255, 255, 0.15);
                    border-radius: 50%;
                    color: white;
                    font-size: 24px;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    transition: all 0.2s;
                    z-index: 1;
                }
                
                .shipper-modal-close:hover {
                    background: rgba(255, 255, 255, 0.25);
                    transform: rotate(90deg);
                }
                
                /* Form Body */
                .shipper-modal-body {
                    padding: 24px;
                    display: flex;
                    flex-direction: column;
                    gap: 20px;
                    max-height: 55vh;
                    overflow-y: auto;
                }
                
                /* Form Groups */
                .shipper-form-group {
                    background: rgba(255, 255, 255, 0.03);
                    border-radius: 16px;
                    padding: 16px;
                    border: 1px solid rgba(255, 255, 255, 0.06);
                    transition: all 0.3s;
                }
                
                .shipper-form-group:hover, .shipper-form-group:focus-within {
                    background: rgba(255, 255, 255, 0.05);
                    border-color: rgba(76, 175, 80, 0.3);
                    box-shadow: 0 0 20px rgba(76, 175, 80, 0.1);
                }
                
                .shipper-field-header {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    margin-bottom: 10px;
                }
                
                .shipper-field-icon {
                    font-size: 18px;
                }
                
                .shipper-field-header label {
                    font-weight: 600;
                    color: #e0e0e0;
                    font-size: 0.95rem;
                }
                
                .shipper-required {
                    color: #ef5350;
                    font-weight: 700;
                }
                
                .shipper-badge {
                    margin-left: auto;
                    background: linear-gradient(135deg, #4CAF50, #2E7D32);
                    color: white;
                    padding: 3px 10px;
                    border-radius: 20px;
                    font-size: 0.7rem;
                    font-weight: 600;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                }
                
                /* Input Styling */
                .shipper-input {
                    width: 100%;
                    padding: 14px 16px;
                    background: rgba(0, 0, 0, 0.3);
                    border: 2px solid rgba(255, 255, 255, 0.1);
                    border-radius: 12px;
                    color: white;
                    font-size: 1rem;
                    transition: all 0.3s;
                }
                
                .shipper-input:focus {
                    outline: none;
                    border-color: #4CAF50;
                    box-shadow: 0 0 0 4px rgba(76, 175, 80, 0.15);
                }
                
                .shipper-input::placeholder {
                    color: rgba(255, 255, 255, 0.3);
                }
                
                .shipper-input:disabled {
                    opacity: 0.6;
                    cursor: not-allowed;
                }
                
                /* Field Hints */
                .shipper-field-hint {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    margin-top: 10px;
                    font-size: 0.8rem;
                    color: rgba(255, 255, 255, 0.5);
                }
                
                .hint-icon {
                    font-size: 14px;
                }
                
                /* PIN Special Styling */
                .shipper-pin-wrapper {
                    display: flex;
                    gap: 12px;
                }
                
                .shipper-pin-input {
                    flex: 1;
                    padding: 18px;
                    background: rgba(0, 0, 0, 0.4);
                    border: 2px solid rgba(255, 255, 255, 0.1);
                    border-radius: 12px;
                    color: white;
                    font-size: 1.5rem;
                    font-weight: 700;
                    letter-spacing: 12px;
                    text-align: center;
                    font-family: 'Monaco', 'Consolas', monospace;
                }
                
                .shipper-pin-input:focus {
                    outline: none;
                    border-color: #FF9800;
                    box-shadow: 0 0 0 4px rgba(255, 152, 0, 0.2);
                }
                
                .shipper-pin-generate {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    padding: 0 20px;
                    background: linear-gradient(135deg, #FF9800, #F57C00);
                    border: none;
                    border-radius: 12px;
                    color: white;
                    font-weight: 600;
                    cursor: pointer;
                    white-space: nowrap;
                    transition: all 0.3s;
                }
                
                .shipper-pin-generate:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 6px 20px rgba(255, 152, 0, 0.4);
                }
                
                .pin-icon {
                    font-size: 20px;
                }
                
                /* PIN Warning */
                .shipper-pin-warning {
                    display: flex;
                    align-items: flex-start;
                    gap: 12px;
                    margin-top: 12px;
                    padding: 12px 16px;
                    background: rgba(255, 152, 0, 0.15);
                    border-radius: 12px;
                    border-left: 4px solid #FF9800;
                }
                
                .warning-icon {
                    font-size: 24px;
                    animation: shake 0.5s ease-in-out infinite alternate;
                }
                
                @keyframes shake {
                    0% { transform: rotate(-5deg); }
                    100% { transform: rotate(5deg); }
                }
                
                .warning-text {
                    display: flex;
                    flex-direction: column;
                    gap: 2px;
                }
                
                .warning-text strong {
                    color: #FF9800;
                    font-size: 0.85rem;
                }
                
                .warning-text span {
                    color: rgba(255, 255, 255, 0.7);
                    font-size: 0.8rem;
                }
                
                /* Commission Wrapper */
                .shipper-commission-wrapper {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }
                
                .shipper-commission-wrapper .shipper-input {
                    text-align: right;
                    font-weight: 600;
                }
                
                .shipper-currency {
                    color: rgba(255, 255, 255, 0.5);
                    font-size: 0.9rem;
                    white-space: nowrap;
                }
                
                /* Footer */
                .shipper-modal-footer {
                    display: flex;
                    gap: 12px;
                    padding: 20px 24px;
                    background: rgba(0, 0, 0, 0.2);
                    border-top: 1px solid rgba(255, 255, 255, 0.05);
                }
                
                .shipper-btn-cancel {
                    flex: 1;
                    padding: 14px 24px;
                    background: rgba(255, 255, 255, 0.1);
                    border: 1px solid rgba(255, 255, 255, 0.2);
                    border-radius: 12px;
                    color: rgba(255, 255, 255, 0.8);
                    font-size: 1rem;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.3s;
                }
                
                .shipper-btn-cancel:hover {
                    background: rgba(255, 255, 255, 0.15);
                }
                
                .shipper-btn-submit {
                    flex: 1.5;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 8px;
                    padding: 14px 24px;
                    background: linear-gradient(135deg, #4CAF50, #2E7D32);
                    border: none;
                    border-radius: 12px;
                    color: white;
                    font-size: 1rem;
                    font-weight: 700;
                    cursor: pointer;
                    transition: all 0.3s;
                    box-shadow: 0 4px 15px rgba(76, 175, 80, 0.3);
                }
                
                .shipper-btn-submit:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 8px 25px rgba(76, 175, 80, 0.4);
                }
                
                .btn-icon {
                    font-size: 18px;
                }
                
                /* Responsive */
                @media (max-width: 500px) {
                    .shipper-modal {
                        border-radius: 20px 20px 0 0;
                        max-height: 95vh;
                    }
                    
                    .shipper-pin-wrapper {
                        flex-direction: column;
                    }
                    
                    .shipper-pin-generate {
                        justify-content: center;
                        padding: 14px;
                    }
                }
            </style>
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
    },

    // ==================== REPORT ====================

    openReport() {
        // Default date range: current month
        const now = new Date();
        const firstDay = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
        const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0];

        const modalHtml = `
            <div class="modal-overlay active" id="reportModal">
                <div class="modal-container report-modal">
                    <div class="modal-header">
                        <h3>📊 Báo Cáo Shipper</h3>
                        <button class="btn-close" onclick="document.getElementById('reportModal').remove()">×</button>
                    </div>
                    <div class="modal-body">
                        <div class="report-filters">
                            <div class="filter-group">
                                <label>Từ ngày</label>
                                <input type="date" id="reportDateFrom" value="${firstDay}">
                            </div>
                            <div class="filter-group">
                                <label>Đến ngày</label>
                                <input type="date" id="reportDateTo" value="${lastDay}">
                            </div>
                            <button class="btn-primary" onclick="ShipperManager.loadReport()">
                                🔍 Xem báo cáo
                            </button>
                        </div>
                        
                        <div class="report-content" id="reportContent">
                            <p class="report-placeholder">Chọn khoảng thời gian và bấm "Xem báo cáo"</p>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button class="btn-secondary" onclick="ShipperManager.exportReport()">
                            📥 Xuất Excel
                        </button>
                        <button class="md-button" onclick="document.getElementById('reportModal').remove()">
                            Đóng
                        </button>
                    </div>
                </div>
            </div>
            
            <style>
                .report-modal { max-width: 800px; width: 95%; }
                .report-filters {
                    display: flex;
                    gap: 16px;
                    align-items: flex-end;
                    margin-bottom: 20px;
                    padding: 16px;
                    background: var(--bg-surface);
                    border-radius: 12px;
                }
                .filter-group {
                    display: flex;
                    flex-direction: column;
                    gap: 4px;
                }
                .filter-group label { font-size: 0.85rem; color: var(--text-secondary); }
                .filter-group input {
                    padding: 10px 12px;
                    border: 1px solid var(--border);
                    border-radius: 8px;
                    background: var(--bg-card);
                    color: var(--text-primary);
                }
                .report-content {
                    max-height: 400px;
                    overflow-y: auto;
                }
                .report-placeholder {
                    text-align: center;
                    color: var(--text-secondary);
                    padding: 40px;
                }
                .report-table {
                    width: 100%;
                    border-collapse: collapse;
                }
                .report-table th, .report-table td {
                    padding: 12px;
                    border-bottom: 1px solid var(--border);
                    text-align: left;
                }
                .report-table th {
                    background: var(--bg-surface);
                    font-weight: 600;
                }
                .report-table tr:hover { background: var(--bg-hover); }
                .report-table tfoot tr {
                    background: var(--bg-surface);
                    font-weight: 700;
                }
                .report-summary {
                    display: flex;
                    gap: 20px;
                    margin-bottom: 16px;
                    padding: 16px;
                    background: linear-gradient(135deg, #4CAF50, #2E7D32);
                    border-radius: 12px;
                    color: white;
                }
                .summary-item {
                    text-align: center;
                    flex: 1;
                }
                .summary-value { font-size: 1.5rem; font-weight: 700; }
                .summary-label { font-size: 0.8rem; opacity: 0.9; }
            </style>
        `;

        document.body.insertAdjacentHTML('beforeend', modalHtml);
    },

    async loadReport() {
        const dateFrom = document.getElementById('reportDateFrom').value;
        const dateTo = document.getElementById('reportDateTo').value;
        const content = document.getElementById('reportContent');

        if (!dateFrom || !dateTo) {
            toast.error('Vui lòng chọn khoảng thời gian');
            return;
        }

        content.innerHTML = '<p class="report-placeholder">⏳ Đang tải...</p>';

        try {
            const supabase = await getSupabase();

            // Get deliveries in date range
            const { data: deliveries, error } = await supabase
                .from('delivery_assignments')
                .select('shipper_id, commission, delivered_at, status')
                .eq('status', 'delivered')
                .gte('delivered_at', dateFrom + 'T00:00:00')
                .lte('delivered_at', dateTo + 'T23:59:59');

            if (error) throw error;

            // Aggregate by shipper
            const shipperData = {};
            (deliveries || []).forEach(d => {
                if (!shipperData[d.shipper_id]) {
                    shipperData[d.shipper_id] = { count: 0, earnings: 0 };
                }
                shipperData[d.shipper_id].count++;
                shipperData[d.shipper_id].earnings += (d.commission || 15000);
            });

            // Get shipper names
            const shipperIds = Object.keys(shipperData);
            let shippersInfo = {};

            if (shipperIds.length > 0) {
                const { data: shippers } = await supabase
                    .from('shippers')
                    .select('id, name, phone, commission_rate')
                    .in('id', shipperIds);

                (shippers || []).forEach(s => {
                    shippersInfo[s.id] = s;
                });
            }

            // Calculate totals
            let totalOrders = 0;
            let totalEarnings = 0;
            const rows = shipperIds.map(id => {
                const stat = shipperData[id];
                const info = shippersInfo[id] || { name: 'Unknown', phone: '', commission_rate: 15000 };
                totalOrders += stat.count;
                totalEarnings += stat.earnings;
                return { ...info, ...stat };
            }).sort((a, b) => b.count - a.count);

            // Render
            if (rows.length === 0) {
                content.innerHTML = '<p class="report-placeholder">📭 Không có dữ liệu trong khoảng thời gian này</p>';
                return;
            }

            content.innerHTML = `
                <div class="report-summary">
                    <div class="summary-item">
                        <div class="summary-value">${rows.length}</div>
                        <div class="summary-label">Shipper</div>
                    </div>
                    <div class="summary-item">
                        <div class="summary-value">${totalOrders}</div>
                        <div class="summary-label">Đơn giao</div>
                    </div>
                    <div class="summary-item">
                        <div class="summary-value">${totalEarnings.toLocaleString('vi-VN')}đ</div>
                        <div class="summary-label">Tổng hoa hồng</div>
                    </div>
                </div>
                
                <table class="report-table" id="reportTable">
                    <thead>
                        <tr>
                            <th>#</th>
                            <th>Shipper</th>
                            <th>SĐT</th>
                            <th>Đơn giao</th>
                            <th>Hoa hồng/đơn</th>
                            <th>Tổng hoa hồng</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${rows.map((r, i) => `
                            <tr>
                                <td>${i + 1}</td>
                                <td><strong>${r.name}</strong></td>
                                <td>${r.phone}</td>
                                <td>${r.count}</td>
                                <td>${(r.commission_rate || 15000).toLocaleString('vi-VN')}đ</td>
                                <td><strong>${r.earnings.toLocaleString('vi-VN')}đ</strong></td>
                            </tr>
                        `).join('')}
                    </tbody>
                    <tfoot>
                        <tr>
                            <td colspan="3">TỔNG CỘNG</td>
                            <td>${totalOrders}</td>
                            <td>-</td>
                            <td>${totalEarnings.toLocaleString('vi-VN')}đ</td>
                        </tr>
                    </tfoot>
                </table>
            `;

            // Store for export
            this.reportData = { rows, totalOrders, totalEarnings, dateFrom, dateTo };

        } catch (err) {
            console.error('Report error:', err);
            content.innerHTML = '<p class="report-placeholder">⚠️ Lỗi tải báo cáo</p>';
        }
    },

    exportReport() {
        if (!this.reportData || !this.reportData.rows.length) {
            toast.error('Chưa có dữ liệu để xuất');
            return;
        }

        const { rows, totalOrders, totalEarnings, dateFrom, dateTo } = this.reportData;

        // Create CSV content
        let csv = 'STT,Shipper,SĐT,Đơn giao,Hoa hồng/đơn,Tổng hoa hồng\n';
        rows.forEach((r, i) => {
            csv += `${i + 1},"${r.name}","${r.phone}",${r.count},${r.commission_rate || 15000},${r.earnings}\n`;
        });
        csv += `TỔNG,,,"${totalOrders}",,${totalEarnings}\n`;

        // Download
        const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `BaoCao_Shipper_${dateFrom}_${dateTo}.csv`;
        a.click();
        URL.revokeObjectURL(url);

        toast.success('📥 Đã xuất file CSV');
    }
};

window.ShipperManager = ShipperManager;
