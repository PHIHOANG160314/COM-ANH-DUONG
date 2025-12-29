// ========================================
// F&B MASTER - CUSTOMER LOYALTY MODULE
// With Supabase Integration + LocalStorage Fallback
// ========================================

const CustomerLoyalty = {
    customers: [],
    useSupabase: false,

    async init() {
        await this.loadCustomers();
        this.render();
        this.setupEventListeners();
        if (window.Debug) Debug.info('CustomerLoyalty initialized', this.useSupabase ? '(Supabase)' : '(localStorage)');
    },

    async loadCustomers() {
        // Try Supabase first if configured
        if (window.isSupabaseConfigured && isSupabaseConfigured()) {
            try {
                const supabase = await window.getSupabase?.();
                if (supabase) {
                    const { data, error } = await supabase.from('customers').select('*').order('id');
                    if (!error && data && data.length > 0) {
                        this.customers = data.map(c => ({
                            id: c.id,
                            name: c.name,
                            phone: c.phone,
                            email: c.email,
                            tier: c.tier?.toLowerCase() || 'bronze',
                            points: c.points || 0,
                            totalSpent: c.total_spent || 0,
                            visits: c.visits || 0,
                            createdAt: c.created_at?.split('T')[0] || new Date().toISOString().split('T')[0]
                        }));
                        this.useSupabase = true;
                        return;
                    }
                }
            } catch (e) {
                if (window.Debug) Debug.warn('Supabase load failed, using localStorage:', e.message);
            }
        }

        // Fallback to localStorage
        const saved = localStorage.getItem('fb_customers');
        if (saved) {
            this.customers = JSON.parse(saved);
        } else {
            // Use sample customers from data.js if available
            this.customers = window.sampleCustomers || [
                { id: 1, name: 'Nguyễn Văn Khách', phone: '0901111111', points: 500, totalSpent: 2500000, visits: 12, tier: 'gold', createdAt: '2025-01-15' },
                { id: 2, name: 'Trần Thị Lan', phone: '0902222222', points: 150, totalSpent: 750000, visits: 5, tier: 'silver', createdAt: '2025-06-20' },
                { id: 3, name: 'Lê Hoàng Nam', phone: '0903333333', points: 50, totalSpent: 250000, visits: 2, tier: 'bronze', createdAt: '2025-11-10' }
            ];
            this.saveCustomers();
        }
    },

    saveCustomers() {
        localStorage.setItem('fb_customers', JSON.stringify(this.customers));
        // TODO: Sync to Supabase when online
    },


    render() {
        const container = document.getElementById('customersTable');
        if (!container) return;

        const tierBadges = {
            gold: '<span class="tier-badge gold">🥇 Gold</span>',
            silver: '<span class="tier-badge silver">🥈 Silver</span>',
            bronze: '<span class="tier-badge bronze">🥉 Bronze</span>'
        };

        const tbody = container.querySelector('tbody');
        if (!tbody) return;

        tbody.innerHTML = this.customers.map(c => `
            <tr>
                <td><strong>${c.id}</strong></td>
                <td>${c.name}</td>
                <td>${c.phone}</td>
                <td>${tierBadges[c.tier] || c.tier}</td>
                <td><strong class="points-value">${c.points.toLocaleString()}</strong> điểm</td>
                <td>${c.totalSpent.toLocaleString()}đ</td>
                <td>${c.visits} lần</td>
                <td>
                    <button class="action-btn" onclick="CustomerLoyalty.showQRCode(${c.id})" title="Mã QR">📲</button>
                    <button class="action-btn" onclick="CustomerLoyalty.sendMessage(${c.id})" title="Gửi tin nhắn">📱</button>
                    <button class="action-btn" onclick="CustomerLoyalty.viewHistory(${c.id})" title="Xem lịch sử">📋</button>
                    <button class="action-btn" onclick="CustomerLoyalty.addPoints(${c.id})" title="Thêm điểm">➕</button>
                    <button class="action-btn" onclick="CustomerLoyalty.redeemPoints(${c.id})" title="Đổi điểm">🎁</button>
                </td>
            </tr>
        `).join('');

        // Update stats
        const stats = document.getElementById('customerStats');
        if (stats) {
            const totalPoints = this.customers.reduce((sum, c) => sum + c.points, 0);
            const goldCount = this.customers.filter(c => c.tier === 'gold').length;
            stats.innerHTML = `
                Tổng khách: <strong>${this.customers.length}</strong> | 
                Điểm tích lũy: <strong>${totalPoints.toLocaleString()}</strong> |
                Gold: <strong>${goldCount}</strong>
            `;
        }
    },

    setupEventListeners() {
        const addBtn = document.getElementById('addCustomerBtn');
        if (addBtn) addBtn.addEventListener('click', () => this.showAddModal());
    },

    showAddModal() {
        modal.open('➕ Thêm Khách Hàng', `
            <div class="form-group"><label>Họ tên</label><input type="text" id="customerName" placeholder="Nhập họ tên..."></div>
            <div class="form-group"><label>Số điện thoại</label><input type="tel" id="customerPhone" placeholder="0901234567"></div>
            <div class="form-group"><label>Điểm ban đầu</label><input type="number" id="customerPoints" value="0" min="0"></div>
        `, `
            <button class="btn-secondary" onclick="modal.close()">Hủy</button>
            <button class="btn-primary" onclick="CustomerLoyalty.addCustomer()">✅ Thêm</button>
        `);
    },

    addCustomer() {
        const name = document.getElementById('customerName').value.trim();
        const phone = document.getElementById('customerPhone').value.trim();
        const points = parseInt(document.getElementById('customerPoints').value) || 0;

        if (!name || !phone) {
            toast.warning('Vui lòng nhập đầy đủ thông tin');
            return;
        }

        const newId = Math.max(0, ...this.customers.map(c => c.id)) + 1;
        this.customers.push({
            id: newId,
            name,
            phone,
            points,
            totalSpent: 0,
            visits: 0,
            tier: 'bronze',
            createdAt: new Date().toISOString().slice(0, 10)
        });
        this.saveCustomers();
        this.render();
        modal.close();
        toast.success(`Đã thêm khách hàng "${name}"`);
    },

    addPoints(id) {
        const c = this.customers.find(x => x.id === id);
        if (!c) return;

        modal.open(`➕ Thêm Điểm - ${c.name}`, `
            <div style="text-align: center; margin-bottom: 1rem;">
                <p>Điểm hiện tại: <strong class="points-value">${c.points.toLocaleString()}</strong></p>
            </div>
            <div class="form-group">
                <label>Số điểm thêm</label>
                <input type="number" id="addPointsAmount" value="10" min="1" max="10000">
            </div>
            <p style="font-size: 0.85rem; color: var(--text-muted);">
                💡 Quy đổi: 10.000đ = 10 điểm
            </p>
        `, `
            <button class="btn-secondary" onclick="modal.close()">Hủy</button>
            <button class="btn-primary" onclick="CustomerLoyalty.confirmAddPoints(${id})">✅ Thêm điểm</button>
        `);
    },

    confirmAddPoints(id) {
        const c = this.customers.find(x => x.id === id);
        if (!c) return;

        const amount = parseInt(document.getElementById('addPointsAmount').value) || 0;
        if (amount <= 0) {
            toast.warning('Số điểm phải lớn hơn 0');
            return;
        }

        c.points += amount;
        c.visits++;
        c.totalSpent += amount * 1000; // Estimate spending
        this.updateTier(c);
        this.saveCustomers();
        this.render();
        modal.close();
        toast.success(`Đã thêm ${amount} điểm cho ${c.name} (Tổng: ${c.points} điểm)`);
    },

    redeemPoints(id) {
        const c = this.customers.find(x => x.id === id);
        if (!c) return;

        modal.open(`🎁 Đổi Điểm - ${c.name}`, `
            <div style="text-align: center; margin-bottom: 1rem;">
                <p>Điểm hiện tại: <strong class="points-value">${c.points.toLocaleString()}</strong></p>
            </div>
            <div class="form-group">
                <label>Đổi thành voucher</label>
                <select id="redeemOption">
                    <option value="50" ${c.points < 50 ? 'disabled' : ''}>50 điểm → Giảm 10.000đ</option>
                    <option value="100" ${c.points < 100 ? 'disabled' : ''}>100 điểm → Giảm 25.000đ</option>
                    <option value="200" ${c.points < 200 ? 'disabled' : ''}>200 điểm → Giảm 60.000đ</option>
                    <option value="500" ${c.points < 500 ? 'disabled' : ''}>500 điểm → Giảm 200.000đ</option>
                </select>
            </div>
        `, `
            <button class="btn-secondary" onclick="modal.close()">Hủy</button>
            <button class="btn-success" onclick="CustomerLoyalty.confirmRedeem(${id})">🎁 Đổi</button>
        `);
    },

    confirmRedeem(id) {
        const c = this.customers.find(x => x.id === id);
        if (!c) return;

        const pointsToRedeem = parseInt(document.getElementById('redeemOption').value) || 0;
        if (c.points < pointsToRedeem) {
            toast.error('Không đủ điểm!');
            return;
        }

        const discounts = { 50: 10000, 100: 25000, 200: 60000, 500: 200000 };
        c.points -= pointsToRedeem;
        this.updateTier(c);
        this.saveCustomers();
        this.render();
        modal.close();
        toast.success(`🎁 Đã đổi ${pointsToRedeem} điểm → Voucher ${discounts[pointsToRedeem].toLocaleString()}đ`);
    },

    updateTier(customer) {
        if (customer.totalSpent >= 2000000) {
            customer.tier = 'gold';
        } else if (customer.totalSpent >= 500000) {
            customer.tier = 'silver';
        } else {
            customer.tier = 'bronze';
        }
    },

    viewHistory(id) {
        const c = this.customers.find(x => x.id === id);
        if (!c) return;

        modal.open(`📋 Lịch Sử - ${c.name}`, `
            <div style="text-align: center;">
                <div style="font-size: 3rem; margin-bottom: 1rem;">
                    ${c.tier === 'gold' ? '🥇' : c.tier === 'silver' ? '🥈' : '🥉'}
                </div>
                <h3>${c.name}</h3>
                <p style="color: var(--text-muted);">${c.phone}</p>
                <hr style="margin: 1rem 0; border-color: var(--border-color);">
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; text-align: left;">
                    <div><span style="color: var(--text-muted);">Điểm tích lũy:</span><br><strong>${c.points.toLocaleString()}</strong></div>
                    <div><span style="color: var(--text-muted);">Tổng chi tiêu:</span><br><strong>${c.totalSpent.toLocaleString()}đ</strong></div>
                    <div><span style="color: var(--text-muted);">Số lần ghé:</span><br><strong>${c.visits} lần</strong></div>
                    <div><span style="color: var(--text-muted);">Khách hàng từ:</span><br><strong>${c.createdAt}</strong></div>
                </div>
            </div>
        `, `
            <button class="btn-primary" onclick="modal.close()">Đóng</button>
        `);
    },

    // ========================================
    // MESSAGING & PROMOTIONS
    // ========================================
    sendMessage(id) {
        const c = this.customers.find(x => x.id === id);
        if (!c) return;

        modal.open(`📱 Gửi Tin Nhắn - ${c.name}`, `
            <div class="form-group">
                <label>Chọn mẫu tin nhắn</label>
                <select id="messageTemplate" onchange="CustomerLoyalty.previewMessage()">
                    <option value="menu">📜 Menu Hôm Nay</option>
                    <option value="promo">🎉 Khuyến mãi hôm nay</option>
                    <option value="birthday">🎂 Chúc mừng sinh nhật</option>
                    <option value="points">💎 Thông báo điểm thưởng</option>
                    <option value="custom">✏️ Tin nhắn tùy chỉnh</option>
                </select>
            </div>
            <div class="form-group">
                <label>Nội dung tin nhắn</label>
                <textarea id="messageContent" rows="5" style="width:100%; padding:0.75rem; border-radius:8px; border:1px solid var(--border-color); background:var(--bg-input); color:var(--text-primary);"></textarea>
            </div>
            <div class="form-group">
                <label>Gửi qua</label>
                <div style="display:flex; gap:0.5rem; flex-wrap:wrap;">
                    <button class="btn-primary" style="flex:1; min-width:150px; background:linear-gradient(135deg,#0068ff,#0099ff);" onclick="CustomerLoyalty.sendViaZalo('${c.phone}')">💬 Gửi qua Zalo</button>
                    <button class="btn-secondary" onclick="CustomerLoyalty.copyMessage()">📋 Copy</button>
                    <button class="btn-icon-sm" onclick="CustomerLoyalty.sendViaSMS('${c.phone}')" title="SMS">📱</button>
                </div>
            </div>
        `, `
            <button class="btn-secondary" onclick="modal.close()">Đóng</button>
        `);

        // Load default message
        setTimeout(() => this.previewMessage(), 100);
    },

    previewMessage() {
        const template = document.getElementById('messageTemplate')?.value;
        const content = document.getElementById('messageContent');
        if (!content) return;

        // Get today's menu from MenuManagement
        const dailyMenu = window.MenuManagement?.dailyMenu || [];
        const foodItems = dailyMenu.filter(m => m.category === 'food');
        const drinkItems = dailyMenu.filter(m => m.category === 'drinks');
        const dessertItems = dailyMenu.filter(m => m.category === 'dessert');

        const formatItems = (items) => items.map(m =>
            `• ${m.name} - ${m.price.toLocaleString()}đ`
        ).join('\n');

        const menuText = dailyMenu.length > 0 ? `🍽️ ÁNH DƯƠNG - MENU HÔM NAY

${foodItems.length > 0 ? `🍚 MÓN CHÍNH:\n${formatItems(foodItems)}\n\n` : ''}${drinkItems.length > 0 ? `🥤 ĐỒ UỐNG:\n${formatItems(drinkItems)}\n\n` : ''}${dessertItems.length > 0 ? `🍰 TRÁNG MIỆNG:\n${formatItems(dessertItems)}\n\n` : ''}📍 Địa chỉ: [Địa chỉ quán]
📞 ĐT: 0917 076 061` : `🍽️ ÁNH DƯƠNG - MENU HÔM NAY

⚠️ Chưa có món trong Menu Hôm Nay!
Vui lòng thêm món vào Menu Hôm Nay trước.

📞 ĐT: 0917 076 061`;

        // Get full master menu
        const masterMenu = window.MenuManagement?.masterMenu || [];
        const masterFood = masterMenu.filter(m => m.category === 'food' && m.active !== false);
        const masterDrinks = masterMenu.filter(m => m.category === 'drinks' && m.active !== false);
        const masterDessert = masterMenu.filter(m => m.category === 'dessert' && m.active !== false);

        const fullMenuText = masterMenu.length > 0 ? `📚 ÁNH DƯƠNG - MENU ĐẦY ĐỦ

${masterFood.length > 0 ? `🍚 MÓN CHÍNH (${masterFood.length} món):\n${formatItems(masterFood)}\n\n` : ''}${masterDrinks.length > 0 ? `🥤 ĐỒ UỐNG (${masterDrinks.length} món):\n${formatItems(masterDrinks)}\n\n` : ''}${masterDessert.length > 0 ? `🍰 TRÁNG MIỆNG (${masterDessert.length} món):\n${formatItems(masterDessert)}\n\n` : ''}📍 Địa chỉ: [Địa chỉ quán]
📞 ĐT: 0917 076 061` : `📚 Menu Tổng đang trống!`;

        const templates = {
            menu: menuText,
            fullmenu: fullMenuText,

            promo: `🎉 KHUYẾN MÃI ĐẶC BIỆT!

✨ ÁNH DƯƠNG xin gửi đến quý khách:

🏷️ GIẢM 20% tất cả món ăn
⏰ Áp dụng: Hôm nay - ${new Date().toLocaleDateString('vi-VN')}
🎁 Tặng thêm 10 điểm tích lũy

📍 Ghé ngay ÁNH DƯƠNG!
📞 ĐT: 0917 076 061`,

            birthday: `🎂 CHÚC MỪNG SINH NHẬT!

🎉 ÁNH DƯƠNG xin chúc bạn:
Sinh nhật vui vẻ, hạnh phúc!

🎁 TẶNG BẠN:
• Voucher giảm 50.000đ
• Bánh sinh nhật miễn phí

⏰ Áp dụng trong 7 ngày
📍 Ghé ÁNH DƯƠNG nhận quà nhé!`,

            points: `💎 THÔNG BÁO ĐIỂM THƯỞNG

Xin chào quý khách!

🎯 Điểm hiện tại của bạn: [X điểm]
🎁 Bạn có thể đổi:
• 50 điểm → Giảm 10.000đ
• 100 điểm → Giảm 25.000đ

📍 Ghé ÁNH DƯƠNG để sử dụng!`,

            custom: `Nhập nội dung tin nhắn tùy chỉnh...`
        };

        content.value = templates[template] || '';
    },

    sendViaZalo(phone) {
        const message = document.getElementById('messageContent')?.value || '';
        const encoded = encodeURIComponent(message);
        const zaloLink = `https://zalo.me/${phone}`;

        // Copy message and open Zalo
        navigator.clipboard.writeText(message);
        window.open(zaloLink, '_blank');
        toast.success(`📋 Đã copy tin nhắn! Đang mở Zalo...`);
        modal.close();
    },

    sendViaSMS(phone) {
        const message = document.getElementById('messageContent')?.value || '';
        const encoded = encodeURIComponent(message);
        const smsLink = `sms:${phone}?body=${encoded}`;
        window.open(smsLink);
        toast.success(`📱 Đang mở ứng dụng SMS...`);
        modal.close();
    },

    copyMessage() {
        const message = document.getElementById('messageContent')?.value || '';
        navigator.clipboard.writeText(message);
        toast.success('📋 Đã copy tin nhắn vào clipboard!');
    },

    showBulkPromotionModal() {
        modal.open('📢 Gửi Khuyến Mãi Hàng Loạt', `
            <div class="form-group">
                <label>Chọn nhóm khách hàng</label>
                <select id="bulkTarget">
                    <option value="all">👥 Tất cả khách hàng (${this.customers.length})</option>
                    <option value="gold">🥇 Khách Gold (${this.customers.filter(c => c.tier === 'gold').length})</option>
                    <option value="silver">🥈 Khách Silver (${this.customers.filter(c => c.tier === 'silver').length})</option>
                    <option value="bronze">🥉 Khách Bronze (${this.customers.filter(c => c.tier === 'bronze').length})</option>
                </select>
            </div>
            <div class="form-group">
                <label>Loại tin nhắn</label>
                <select id="bulkTemplate" onchange="CustomerLoyalty.previewBulkMessage()">
                    <option value="menuToday">📜 Menu Hôm Nay</option>
                    <option value="promo">🎉 Khuyến mãi</option>
                    <option value="event">🎊 Sự kiện đặc biệt</option>
                </select>
            </div>
            <div class="form-group">
                <label>Nội dung</label>
                <textarea id="bulkMessageContent" rows="5" style="width:100%; padding:0.75rem; border-radius:8px; border:1px solid var(--border-color); background:var(--bg-input); color:var(--text-primary);"></textarea>
            </div>
        `, `
            <button class="btn-secondary" onclick="modal.close()">Hủy</button>
            <button class="btn-primary" onclick="CustomerLoyalty.exportPhoneList()">📋 Xuất danh sách SĐT</button>
            <button class="btn-success" onclick="CustomerLoyalty.sendBulkPromotion()">📤 Gửi tất cả</button>
        `);

        setTimeout(() => this.previewBulkMessage(), 100);
    },

    previewBulkMessage() {
        const template = document.getElementById('bulkTemplate')?.value;
        const content = document.getElementById('bulkMessageContent');
        if (!content) return;

        // Get menus from MenuManagement
        const dailyMenu = window.MenuManagement?.dailyMenu || [];
        const masterMenu = window.MenuManagement?.masterMenu || [];

        const formatItems = (items) => items.map(m =>
            `• ${m.name} - ${m.price.toLocaleString()}đ`
        ).join('\n');

        // Menu Hôm Nay
        const foodToday = dailyMenu.filter(m => m.category === 'food');
        const drinksToday = dailyMenu.filter(m => m.category === 'drinks');
        const menuTodayText = dailyMenu.length > 0 ?
            `🍽️ ÁNH DƯƠNG - MENU HÔM NAY\n\n${foodToday.length > 0 ? `🍚 MÓN CHÍNH:\n${formatItems(foodToday)}\n\n` : ''}${drinksToday.length > 0 ? `🥤 ĐỒ UỐNG:\n${formatItems(drinksToday)}\n\n` : ''}📍 Ghé ngay ÁNH DƯƠNG!\n📞 ĐT: 0917 076 061` :
            `⚠️ Chưa có món trong Menu Hôm Nay!`;

        // Menu Tổng
        const foodFull = masterMenu.filter(m => m.category === 'food' && m.active !== false);
        const drinksFull = masterMenu.filter(m => m.category === 'drinks' && m.active !== false);
        const menuFullText = masterMenu.length > 0 ?
            `📚 ÁNH DƯƠNG - MENU ĐẦY ĐỦ\n\n${foodFull.length > 0 ? `🍚 MÓN CHÍNH (${foodFull.length}):\n${formatItems(foodFull)}\n\n` : ''}${drinksFull.length > 0 ? `🥤 ĐỒ UỐNG (${drinksFull.length}):\n${formatItems(drinksFull)}\n\n` : ''}📍 Ghé ngay ÁNH DƯƠNG!\n📞 ĐT: 0917 076 061` :
            `⚠️ Menu Tổng đang trống!`;

        const templates = {
            menuToday: menuTodayText,
            menuFull: menuFullText,
            promo: `🎉 KHUYẾN MÃI SỐC!\n\n🏷️ Giảm 30% tất cả món\n⏰ Chỉ trong 3 ngày!\n\n📍 ÁNH DƯƠNG chờ bạn!\n📞 ĐT: 0917 076 061`,
            event: `🎊 SỰ KIỆN ĐẶC BIỆT!\n\n✨ Khai trương chi nhánh mới\n🎁 Tặng voucher 50k cho 100 khách đầu tiên\n\n📍 Địa chỉ: [...]\n📞 ĐT: 0917 076 061`
        };

        content.value = templates[template] || '';
    },

    exportPhoneList() {
        const target = document.getElementById('bulkTarget')?.value || 'all';
        let customers = this.customers;

        if (target !== 'all') {
            customers = customers.filter(c => c.tier === target);
        }

        const phoneList = customers.map(c => `${c.name}: ${c.phone}`).join('\n');
        navigator.clipboard.writeText(phoneList);
        toast.success(`📋 Đã copy ${customers.length} số điện thoại!`);
    },

    sendBulkPromotion() {
        const target = document.getElementById('bulkTarget')?.value || 'all';
        const message = document.getElementById('bulkMessageContent')?.value || '';

        let customers = this.customers;
        if (target !== 'all') {
            customers = customers.filter(c => c.tier === target);
        }

        // Copy message for manual sending
        navigator.clipboard.writeText(message);

        const phoneNumbers = customers.map(c => c.phone).join(', ');
        toast.success(`✅ Đã copy tin nhắn! Gửi đến ${customers.length} khách hàng.`);

        // Show summary
        modal.close();
        setTimeout(() => {
            modal.open('📤 Gửi Thành Công', `
                <div style="text-align: center;">
                    <div style="font-size: 3rem; margin-bottom: 1rem;">✅</div>
                    <h3>Đã chuẩn bị tin nhắn</h3>
                    <p style="margin-top: 1rem;">Số khách hàng: <strong>${customers.length}</strong></p>
                    <p style="color: var(--text-muted); font-size: 0.85rem; margin-top: 1rem;">
                        Tin nhắn đã được copy. Bạn có thể dán vào Zalo/SMS để gửi hàng loạt.
                    </p>
                    <div style="margin-top: 1rem; padding: 0.75rem; background: var(--bg-input); border-radius: 8px; font-size: 0.8rem; text-align: left; max-height: 100px; overflow-y: auto;">
                        <strong>Danh sách SĐT:</strong><br>
                        ${phoneNumbers}
                    </div>
                </div>
            `, `
                <button class="btn-primary" onclick="modal.close()">Đóng</button>
            `);
        }, 300);
    },

    // ========================================
    // QR CODE & POINTS CALCULATION (500VND = 1 POINT)
    // ========================================
    POINTS_RATE: 500, // 500 VND = 1 điểm

    calculatePoints(amount) {
        return Math.floor(amount / this.POINTS_RATE);
    },

    showQRCode(id) {
        const c = this.customers.find(x => x.id === id);
        if (!c) return;

        // Create unique customer code
        const customerCode = `ANDG-${c.id.toString().padStart(4, '0')}-${c.phone.slice(-4)}`;

        modal.open(`📲 Mã QR Khách Hàng`, `
            <div style="text-align: center;">
                <h3 style="margin-bottom: 0.5rem;">${c.name}</h3>
                <p style="color: var(--text-muted); margin-bottom: 1rem;">📱 ${c.phone}</p>
                
                <div id="customerQRCode" style="background: white; padding: 1rem; border-radius: 12px; display: inline-block; margin-bottom: 1rem;"></div>
                
                <p style="font-size: 1.1rem; font-weight: bold; color: var(--primary-light);">${customerCode}</p>
                
                <div style="margin-top: 1rem; padding: 1rem; background: var(--bg-input); border-radius: 8px; text-align: left;">
                    <p style="margin-bottom: 0.5rem;">💎 Điểm hiện tại: <strong>${c.points.toLocaleString()}</strong></p>
                    <p style="margin-bottom: 0.5rem;">🏆 Hạng thành viên: <strong>${c.tier === 'gold' ? '🥇 Gold' : c.tier === 'silver' ? '🥈 Silver' : '🥉 Bronze'}</strong></p>
                    <p style="font-size: 0.85rem; color: var(--text-muted);">
                        💡 Quy đổi: ${this.POINTS_RATE.toLocaleString()}đ = 1 điểm
                    </p>
                </div>
            </div>
        `, `
            <button class="btn-secondary" onclick="modal.close()">Đóng</button>
            <button class="btn-primary" onclick="CustomerLoyalty.downloadQR('${customerCode}', '${c.name}')">💾 Tải QR</button>
        `);

        // Generate QR Code
        setTimeout(() => {
            const qrContainer = document.getElementById('customerQRCode');
            if (qrContainer && window.QRCode) {
                qrContainer.innerHTML = '';
                QRCode.toCanvas(document.createElement('canvas'), customerCode, {
                    width: 200,
                    margin: 2,
                    color: { dark: '#000000', light: '#ffffff' }
                }, (err, canvas) => {
                    if (!err) qrContainer.appendChild(canvas);
                });
            }
        }, 100);
    },

    downloadQR(code, name) {
        const canvas = document.querySelector('#customerQRCode canvas');
        if (canvas) {
            const link = document.createElement('a');
            link.download = `QR_${name}_${code}.png`;
            link.href = canvas.toDataURL('image/png');
            link.click();
            toast.success('💾 Đã tải mã QR!');
        }
    },

    showStoreScanModal() {
        modal.open('📱 Quét QR Tích/Đổi Điểm', `
            <div style="text-align: center;">
                <div style="font-size: 3rem; margin-bottom: 1rem;">📲</div>
                <p style="margin-bottom: 1rem;">Nhập mã khách hàng hoặc số điện thoại:</p>
                
                <div class="form-group">
                    <input type="text" id="scanCustomerCode" placeholder="ANDG-0001-1234 hoặc 0901234567" style="text-align: center; font-size: 1.1rem;">
                </div>
                
                <button class="btn-primary" style="width: 100%; margin-bottom: 1rem;" onclick="CustomerLoyalty.lookupCustomer()">🔍 Tìm khách hàng</button>
                
                <div id="scanResult" style="display: none; padding: 1rem; background: var(--bg-input); border-radius: 8px; text-align: left;"></div>
            </div>
        `, `
            <button class="btn-secondary" onclick="modal.close()">Đóng</button>
        `);
    },

    lookupCustomer() {
        const input = document.getElementById('scanCustomerCode')?.value?.trim();
        const resultDiv = document.getElementById('scanResult');
        if (!input || !resultDiv) return;

        // Find customer by code or phone
        let customer = null;
        if (input.startsWith('ANDG-')) {
            const idMatch = input.match(/ANDG-(\d+)-/);
            if (idMatch) {
                customer = this.customers.find(c => c.id === parseInt(idMatch[1]));
            }
        } else {
            customer = this.customers.find(c => c.phone.includes(input));
        }

        if (!customer) {
            resultDiv.style.display = 'block';
            resultDiv.innerHTML = `<p style="color: var(--danger);">❌ Không tìm thấy khách hàng!</p>`;
            return;
        }

        resultDiv.style.display = 'block';
        resultDiv.innerHTML = `
            <h4 style="margin-bottom: 0.5rem;">✅ ${customer.name}</h4>
            <p>📱 ${customer.phone} | 💎 ${customer.points.toLocaleString()} điểm</p>
            <hr style="margin: 0.75rem 0; border-color: var(--border-color);">
            
            <div class="form-group" style="margin-bottom: 0.5rem;">
                <label>Số tiền mua hàng (VNĐ)</label>
                <input type="number" id="purchaseAmount" placeholder="50000" min="0" step="1000">
            </div>
            
            <div style="display: flex; gap: 0.5rem; margin-top: 0.5rem;">
                <button class="btn-success" style="flex:1;" onclick="CustomerLoyalty.addPointsFromPurchase(${customer.id})">➕ Tích điểm</button>
                <button class="btn-warning" style="flex:1;" onclick="CustomerLoyalty.usePointsForPurchase(${customer.id})">🎁 Dùng điểm</button>
            </div>
        `;
    },

    addPointsFromPurchase(id) {
        const c = this.customers.find(x => x.id === id);
        if (!c) return;

        const amount = parseInt(document.getElementById('purchaseAmount')?.value) || 0;
        if (amount <= 0) {
            toast.warning('Vui lòng nhập số tiền!');
            return;
        }

        const pointsEarned = this.calculatePoints(amount);
        c.points += pointsEarned;
        c.totalSpent += amount;
        c.visits++;
        this.updateTier(c);
        this.saveCustomers();
        this.render();

        modal.close();
        toast.success(`✅ ${c.name} được +${pointsEarned} điểm (${amount.toLocaleString()}đ)`);
    },

    usePointsForPurchase(id) {
        const c = this.customers.find(x => x.id === id);
        if (!c) return;

        if (c.points <= 0) {
            toast.warning('Khách hàng chưa có điểm!');
            return;
        }

        modal.close();
        setTimeout(() => {
            modal.open(`🎁 Đổi Điểm - ${c.name}`, `
                <div style="text-align: center; margin-bottom: 1rem;">
                    <p>Điểm hiện tại: <strong class="points-value">${c.points.toLocaleString()}</strong></p>
                    <p style="font-size: 0.85rem; color: var(--text-muted);">1 điểm = ${this.POINTS_RATE.toLocaleString()}đ</p>
                </div>
                <div class="form-group">
                    <label>Số điểm muốn dùng</label>
                    <input type="number" id="pointsToUse" value="${Math.min(c.points, 100)}" min="1" max="${c.points}">
                </div>
                <p style="margin-top: 0.5rem;">
                    💰 Giảm giá: <strong id="discountPreview">${(Math.min(c.points, 100) * this.POINTS_RATE).toLocaleString()}đ</strong>
                </p>
            `, `
                <button class="btn-secondary" onclick="modal.close()">Hủy</button>
                <button class="btn-success" onclick="CustomerLoyalty.confirmUsePoints(${id})">✅ Xác nhận đổi</button>
            `);

            // Update preview on change
            setTimeout(() => {
                document.getElementById('pointsToUse')?.addEventListener('input', (e) => {
                    const pts = parseInt(e.target.value) || 0;
                    document.getElementById('discountPreview').textContent =
                        (pts * this.POINTS_RATE).toLocaleString() + 'đ';
                });
            }, 100);
        }, 300);
    },

    confirmUsePoints(id) {
        const c = this.customers.find(x => x.id === id);
        if (!c) return;

        const pointsToUse = parseInt(document.getElementById('pointsToUse')?.value) || 0;
        if (pointsToUse <= 0 || pointsToUse > c.points) {
            toast.warning('Số điểm không hợp lệ!');
            return;
        }

        const discount = pointsToUse * this.POINTS_RATE;
        c.points -= pointsToUse;
        this.updateTier(c);
        this.saveCustomers();
        this.render();
        modal.close();
        toast.success(`🎁 ${c.name} đã dùng ${pointsToUse} điểm → Giảm ${discount.toLocaleString()}đ`);
    }
};

window.CustomerLoyalty = CustomerLoyalty;
