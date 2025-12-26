// ========================================
// F&B MASTER - STAFF MANAGEMENT MODULE
// ========================================

const StaffManagement = {
    staff: [],

    init() {
        this.loadStaff();
        this.render();
        this.renderAttendance();
        this.setupEventListeners();
    },

    loadStaff() {
        const saved = localStorage.getItem('fb_staff');
        if (saved) {
            this.staff = JSON.parse(saved);
        } else {
            this.staff = [
                { id: 1, name: 'Nguyễn Văn A', role: 'manager', phone: '0901234567', shift: 'full', status: 'active', hourlyRate: 50000 },
                { id: 2, name: 'Trần Thị B', role: 'cashier', phone: '0912345678', shift: 'morning', status: 'active', hourlyRate: 30000 },
                { id: 3, name: 'Lê Văn C', role: 'chef', phone: '0923456789', shift: 'full', status: 'active', hourlyRate: 40000 },
                { id: 4, name: 'Phạm Thị D', role: 'waiter', phone: '0934567890', shift: 'evening', status: 'active', hourlyRate: 25000 },
                { id: 5, name: 'Hoàng Văn E', role: 'shipper', phone: '0945678901', shift: 'full', status: 'active', hourlyRate: 28000 }
            ];
            this.saveStaff();
        }

        // Load attendance records
        const attendanceSaved = localStorage.getItem('fb_attendance');
        this.attendance = attendanceSaved ? JSON.parse(attendanceSaved) : [];
    },

    saveStaff() {
        localStorage.setItem('fb_staff', JSON.stringify(this.staff));
    },

    saveAttendance() {
        localStorage.setItem('fb_attendance', JSON.stringify(this.attendance));
    },

    render() {
        const container = document.getElementById('staffTable');
        if (!container) return;

        const roleNames = {
            manager: '👔 Quản lý',
            cashier: '💰 Thu ngân',
            chef: '👨‍🍳 Đầu bếp',
            waiter: '🍽️ Phục vụ',
            shipper: '🛵 Giao hàng'
        };

        const shiftNames = {
            morning: '🌅 Sáng (6-14h)',
            evening: '🌆 Chiều (14-22h)',
            full: '⏰ Cả ngày'
        };

        const tbody = container.querySelector('tbody');
        if (!tbody) return;

        tbody.innerHTML = this.staff.map(s => `
            <tr>
                <td><strong>${s.id}</strong></td>
                <td>${s.name}</td>
                <td>${roleNames[s.role] || s.role}</td>
                <td>${s.phone}</td>
                <td>${shiftNames[s.shift] || s.shift}</td>
                <td>${s.status === 'active' ? '<span class="status-badge ok">Đang làm</span>' : '<span class="status-badge low">Nghỉ</span>'}</td>
                <td>
                    <button class="action-btn" onclick="StaffManagement.editStaff(${s.id})" title="Sửa">✏️</button>
                    <button class="action-btn" onclick="StaffManagement.toggleStatus(${s.id})" title="Đổi trạng thái">🔄</button>
                    <button class="action-btn delete-btn" onclick="StaffManagement.deleteStaff(${s.id})" title="Xóa">🗑️</button>
                </td>
            </tr>
        `).join('');

        // Update stats
        const stats = document.getElementById('staffStats');
        if (stats) {
            const active = this.staff.filter(s => s.status === 'active').length;
            stats.innerHTML = `Tổng: <strong>${this.staff.length}</strong> | Đang làm: <strong>${active}</strong>`;
        }
    },

    setupEventListeners() {
        const addBtn = document.getElementById('addStaffBtn');
        if (addBtn) addBtn.addEventListener('click', () => this.showAddModal());
    },

    showAddModal() {
        modal.open('➕ Thêm Nhân Viên', `
            <div class="form-group"><label>Họ tên</label><input type="text" id="staffName" placeholder="Nhập họ tên..."></div>
            <div class="form-group"><label>Chức vụ</label>
                <select id="staffRole" onchange="StaffManagement.suggestHourlyRate()">
                    <option value="waiter">🍽️ Phục vụ</option>
                    <option value="cashier">💰 Thu ngân</option>
                    <option value="chef">👨‍🍳 Đầu bếp</option>
                    <option value="shipper">🛵 Giao hàng</option>
                    <option value="manager">👔 Quản lý</option>
                </select>
            </div>
            <div class="form-group"><label>Số điện thoại</label><input type="tel" id="staffPhone" placeholder="0901234567"></div>
            <div class="form-group"><label>Ca làm việc</label>
                <select id="staffShift">
                    <option value="full">⏰ Cả ngày</option>
                    <option value="morning">🌅 Sáng (6-14h)</option>
                    <option value="evening">🌆 Chiều (14-22h)</option>
                </select>
            </div>
            <div class="form-group"><label>💰 Lương/giờ (VNĐ)</label><input type="number" id="staffHourlyRate" value="25000" min="10000" step="1000" placeholder="25000"></div>
        `, `
            <button class="btn-secondary" onclick="modal.close()">Hủy</button>
            <button class="btn-primary" onclick="StaffManagement.addStaff()">✅ Thêm</button>
        `);
    },

    addStaff() {
        const name = document.getElementById('staffName').value.trim();
        const role = document.getElementById('staffRole').value;
        const phone = document.getElementById('staffPhone').value.trim();
        const shift = document.getElementById('staffShift').value;
        const hourlyRate = parseInt(document.getElementById('staffHourlyRate').value) || 25000;

        if (!name) {
            toast.warning('Vui lòng nhập họ tên');
            return;
        }

        const newId = Math.max(0, ...this.staff.map(s => s.id)) + 1;
        this.staff.push({ id: newId, name, role, phone, shift, status: 'active', hourlyRate });
        this.saveStaff();
        this.render();
        this.renderAttendance();
        modal.close();
        toast.success(`Đã thêm nhân viên "${name}" (${hourlyRate.toLocaleString()}đ/h)`);
    },

    suggestHourlyRate() {
        const role = document.getElementById('staffRole')?.value;
        const rateInput = document.getElementById('staffHourlyRate');
        if (!rateInput) return;

        const suggestedRates = {
            manager: 50000,
            chef: 40000,
            cashier: 30000,
            shipper: 28000,
            waiter: 25000
        };
        rateInput.value = suggestedRates[role] || 25000;
    },

    editStaff(id) {
        const s = this.staff.find(x => x.id === id);
        if (!s) return;

        modal.open('✏️ Sửa Nhân Viên', `
            <div class="form-group"><label>Họ tên</label><input type="text" id="editStaffName" value="${s.name}"></div>
            <div class="form-group"><label>Chức vụ</label>
                <select id="editStaffRole">
                    <option value="waiter" ${s.role === 'waiter' ? 'selected' : ''}>🍽️ Phục vụ</option>
                    <option value="cashier" ${s.role === 'cashier' ? 'selected' : ''}>💰 Thu ngân</option>
                    <option value="chef" ${s.role === 'chef' ? 'selected' : ''}>👨‍🍳 Đầu bếp</option>
                    <option value="shipper" ${s.role === 'shipper' ? 'selected' : ''}>🛵 Giao hàng</option>
                    <option value="manager" ${s.role === 'manager' ? 'selected' : ''}>👔 Quản lý</option>
                </select>
            </div>
            <div class="form-group"><label>Số điện thoại</label><input type="tel" id="editStaffPhone" value="${s.phone}"></div>
            <div class="form-group"><label>Ca làm việc</label>
                <select id="editStaffShift">
                    <option value="full" ${s.shift === 'full' ? 'selected' : ''}>⏰ Cả ngày</option>
                    <option value="morning" ${s.shift === 'morning' ? 'selected' : ''}>🌅 Sáng</option>
                    <option value="evening" ${s.shift === 'evening' ? 'selected' : ''}>🌆 Chiều</option>
                </select>
            </div>
            <div class="form-group"><label>💰 Lương/giờ (VNĐ)</label><input type="number" id="editStaffHourlyRate" value="${s.hourlyRate || 25000}" min="10000" step="1000"></div>
        `, `
            <button class="btn-secondary" onclick="modal.close()">Hủy</button>
            <button class="btn-primary" onclick="StaffManagement.saveEdit(${id})">💾 Lưu</button>
        `);
    },

    saveEdit(id) {
        const s = this.staff.find(x => x.id === id);
        if (!s) return;

        s.name = document.getElementById('editStaffName').value.trim() || s.name;
        s.role = document.getElementById('editStaffRole').value;
        s.phone = document.getElementById('editStaffPhone').value.trim();
        s.shift = document.getElementById('editStaffShift').value;
        s.hourlyRate = parseInt(document.getElementById('editStaffHourlyRate').value) || s.hourlyRate || 25000;

        this.saveStaff();
        this.render();
        modal.close();
        toast.success('Đã cập nhật thông tin nhân viên');
    },

    toggleStatus(id) {
        const s = this.staff.find(x => x.id === id);
        if (s) {
            s.status = s.status === 'active' ? 'inactive' : 'active';
            this.saveStaff();
            this.render();
            toast.info(s.status === 'active' ? `${s.name} đã quay lại làm việc` : `${s.name} đã nghỉ`);
        }
    },

    deleteStaff(id) {
        const s = this.staff.find(x => x.id === id);
        if (!s) return;

        if (confirm(`Xóa nhân viên "${s.name}"?`)) {
            this.staff = this.staff.filter(x => x.id !== id);
            this.saveStaff();
            this.render();
            toast.success(`Đã xóa nhân viên "${s.name}"`);
        }
    },

    // ========================================
    // ATTENDANCE TRACKING
    // ========================================
    checkIn(id) {
        const s = this.staff.find(x => x.id === id);
        if (!s) return;

        const today = new Date().toISOString().slice(0, 10);
        const now = new Date();
        const timeStr = now.toTimeString().slice(0, 5);

        // Check if already checked in today
        const existing = this.attendance.find(a => a.staffId === id && a.date === today && !a.checkOut);
        if (existing) {
            toast.warning(`${s.name} đã check-in lúc ${existing.checkIn}`);
            return;
        }

        this.attendance.push({
            id: Date.now(),
            staffId: id,
            staffName: s.name,
            date: today,
            checkIn: timeStr,
            checkOut: null,
            hours: 0
        });
        this.saveAttendance();
        this.renderAttendance();
        toast.success(`✅ ${s.name} check-in lúc ${timeStr}`);
    },

    checkOut(id) {
        const s = this.staff.find(x => x.id === id);
        if (!s) return;

        const today = new Date().toISOString().slice(0, 10);
        const now = new Date();
        const timeStr = now.toTimeString().slice(0, 5);

        const record = this.attendance.find(a => a.staffId === id && a.date === today && !a.checkOut);
        if (!record) {
            toast.warning(`${s.name} chưa check-in hôm nay!`);
            return;
        }

        record.checkOut = timeStr;
        // Calculate hours
        const [inH, inM] = record.checkIn.split(':').map(Number);
        const [outH, outM] = timeStr.split(':').map(Number);
        record.hours = Math.max(0, ((outH * 60 + outM) - (inH * 60 + inM)) / 60);
        record.hours = Math.round(record.hours * 100) / 100;

        this.saveAttendance();
        this.renderAttendance();
        toast.success(`👋 ${s.name} check-out lúc ${timeStr} (${record.hours}h)`);
    },

    renderAttendance() {
        const container = document.getElementById('attendanceTable');
        if (!container) return;

        const tbody = container.querySelector('tbody');
        if (!tbody) return;

        const today = new Date().toISOString().slice(0, 10);
        const todayRecords = this.attendance.filter(a => a.date === today);

        tbody.innerHTML = this.staff.filter(s => s.status === 'active').map(s => {
            const record = todayRecords.find(r => r.staffId === s.id);
            return `
                <tr>
                    <td>${s.name}</td>
                    <td>${record?.checkIn || '--:--'}</td>
                    <td>${record?.checkOut || '--:--'}</td>
                    <td>${record?.hours ? record.hours + 'h' : '-'}</td>
                    <td>
                        ${!record || record.checkOut ?
                    `<button class="btn-success btn-sm" onclick="StaffManagement.checkIn(${s.id})">📥 Check-in</button>` :
                    `<button class="btn-warning btn-sm" onclick="StaffManagement.checkOut(${s.id})">📤 Check-out</button>`
                }
                    </td>
                </tr>
            `;
        }).join('');
    },

    // ========================================
    // PAYROLL CALCULATION
    // ========================================
    calculatePayroll() {
        const month = document.getElementById('payrollMonth')?.value || new Date().toISOString().slice(0, 7);

        const monthRecords = this.attendance.filter(a => a.date.startsWith(month) && a.checkOut);

        const payrollData = this.staff.map(s => {
            const staffRecords = monthRecords.filter(r => r.staffId === s.id);
            const totalHours = staffRecords.reduce((sum, r) => sum + (r.hours || 0), 0);
            const hourlyRate = s.hourlyRate || 25000;
            const grossSalary = Math.round(totalHours * hourlyRate);
            const socialInsurance = Math.round(grossSalary * 0.08);
            const netSalary = grossSalary - socialInsurance;

            return {
                ...s,
                workDays: staffRecords.length,
                totalHours: Math.round(totalHours * 100) / 100,
                hourlyRate,
                grossSalary,
                socialInsurance,
                netSalary
            };
        });

        this.renderPayroll(payrollData, month);
    },

    renderPayroll(data, month) {
        const container = document.getElementById('payrollTable');
        if (!container) return;

        const tbody = container.querySelector('tbody');
        if (!tbody) return;

        tbody.innerHTML = data.map(s => `
            <tr>
                <td>${s.name}</td>
                <td>${s.workDays} ngày</td>
                <td>${s.totalHours}h</td>
                <td>${s.hourlyRate.toLocaleString()}đ/h</td>
                <td>${s.grossSalary.toLocaleString()}đ</td>
                <td style="color:var(--danger);">-${s.socialInsurance.toLocaleString()}đ</td>
                <td><strong style="color:var(--secondary);">${s.netSalary.toLocaleString()}đ</strong></td>
            </tr>
        `).join('');

        const totalNet = data.reduce((sum, s) => sum + s.netSalary, 0);
        document.getElementById('payrollTotal').textContent = totalNet.toLocaleString() + 'đ';
    },

    showPayrollModal() {
        const month = new Date().toISOString().slice(0, 7);
        modal.open('💰 Bảng Tính Lương Tháng', `
            <div class="form-group">
                <label>Chọn tháng</label>
                <input type="month" id="payrollMonth" value="${month}" onchange="StaffManagement.calculatePayroll()">
            </div>
            <div style="max-height: 400px; overflow-y: auto;">
                <table class="data-table" id="payrollTable" style="font-size: 0.85rem;">
                    <thead>
                        <tr>
                            <th>Nhân viên</th>
                            <th>Ngày công</th>
                            <th>Giờ làm</th>
                            <th>Lương/giờ</th>
                            <th>Lương gộp</th>
                            <th>BH (8%)</th>
                            <th>Thực nhận</th>
                        </tr>
                    </thead>
                    <tbody></tbody>
                </table>
            </div>
            <div style="margin-top: 1rem; text-align: right; font-size: 1.1rem;">
                <strong>Tổng chi trả: <span id="payrollTotal" style="color: var(--primary-light);">0đ</span></strong>
            </div>
        `, `
            <button class="btn-secondary" onclick="modal.close()">Đóng</button>
            <button class="btn-primary" onclick="StaffManagement.exportPayroll()">📤 Xuất Excel</button>
        `);

        setTimeout(() => this.calculatePayroll(), 100);
    },

    exportPayroll() {
        const month = document.getElementById('payrollMonth')?.value || new Date().toISOString().slice(0, 7);
        const monthRecords = this.attendance.filter(a => a.date.startsWith(month) && a.checkOut);

        const data = this.staff.map(s => {
            const staffRecords = monthRecords.filter(r => r.staffId === s.id);
            const totalHours = staffRecords.reduce((sum, r) => sum + (r.hours || 0), 0);
            const hourlyRate = s.hourlyRate || 25000;
            const grossSalary = Math.round(totalHours * hourlyRate);
            const socialInsurance = Math.round(grossSalary * 0.08);
            const netSalary = grossSalary - socialInsurance;

            return {
                'Nhân viên': s.name,
                'Chức vụ': s.role,
                'Ngày công': staffRecords.length,
                'Giờ làm': totalHours,
                'Lương/giờ': hourlyRate,
                'Lương gộp': grossSalary,
                'Bảo hiểm (8%)': socialInsurance,
                'Thực nhận': netSalary
            };
        });

        const ws = XLSX.utils.json_to_sheet(data);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, `Luong_${month}`);
        XLSX.writeFile(wb, `bang_luong_${month}.xlsx`);
        toast.success(`📤 Đã xuất bảng lương tháng ${month}`);
    }
};

window.StaffManagement = StaffManagement;
