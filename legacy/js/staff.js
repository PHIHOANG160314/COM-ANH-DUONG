/**
 * F&B Master - Staff Management
 * Author: Google DeepMind / Antigravity Team
 * Description: Employee directory, attendance tracking (check-in/out), and payroll.
 */

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
                    <md-icon-button onclick="StaffManagement.editStaff(${s.id})" title="Sửa"><md-icon>edit</md-icon></md-icon-button>
                    <md-icon-button onclick="StaffManagement.toggleStatus(${s.id})" title="Đổi trạng thái"><md-icon>sync</md-icon></md-icon-button>
                    <md-icon-button class="delete-btn" onclick="StaffManagement.deleteStaff(${s.id})" title="Xóa" style="color:var(--error);"><md-icon>delete</md-icon></md-icon-button>
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
            <div class="form-group"><md-outlined-text-field label="Họ tên" id="staffName" placeholder="Nhập họ tên..."></md-outlined-text-field></div>
            <div class="form-group">
                <md-outlined-select label="Chức vụ" id="staffRole" onchange="StaffManagement.suggestHourlyRate()">
                    <md-select-option value="waiter"><div slot="headline">🍽️ Phục vụ</div></md-select-option>
                    <md-select-option value="cashier"><div slot="headline">💰 Thu ngân</div></md-select-option>
                    <md-select-option value="chef"><div slot="headline">👨‍🍳 Đầu bếp</div></md-select-option>
                    <md-select-option value="shipper"><div slot="headline">🛵 Giao hàng</div></md-select-option>
                    <md-select-option value="manager"><div slot="headline">👔 Quản lý</div></md-select-option>
                </md-outlined-select>
            </div>
            <div class="form-group"><md-outlined-text-field label="Số điện thoại" type="tel" id="staffPhone" placeholder="0901234567"></md-outlined-text-field></div>
            <div class="form-group">
                <md-outlined-select label="Ca làm việc" id="staffShift">
                    <md-select-option value="full"><div slot="headline">⏰ Cả ngày</div></md-select-option>
                    <md-select-option value="morning"><div slot="headline">🌅 Sáng (6-14h)</div></md-select-option>
                    <md-select-option value="evening"><div slot="headline">🌆 Chiều (14-22h)</div></md-select-option>
                </md-outlined-select>
            </div>
            <div class="form-group"><md-outlined-text-field label="💰 Lương/giờ (VNĐ)" type="number" id="staffHourlyRate" value="25000" min="10000" step="1000" placeholder="25000"></md-outlined-text-field></div>
        `, `
            <md-outlined-button onclick="modal.close()">Hủy</md-outlined-button>
            <md-filled-button onclick="StaffManagement.addStaff()">✅ Thêm</md-filled-button>
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
            <div class="form-group"><md-outlined-text-field label="Họ tên" id="editStaffName" value="${s.name}"></md-outlined-text-field></div>
            <div class="form-group">
                <md-outlined-select label="Chức vụ" id="editStaffRole">
                    <md-select-option value="waiter" ${s.role === 'waiter' ? 'selected' : ''}><div slot="headline">🍽️ Phục vụ</div></md-select-option>
                    <md-select-option value="cashier" ${s.role === 'cashier' ? 'selected' : ''}><div slot="headline">💰 Thu ngân</div></md-select-option>
                    <md-select-option value="chef" ${s.role === 'chef' ? 'selected' : ''}><div slot="headline">👨‍🍳 Đầu bếp</div></md-select-option>
                    <md-select-option value="shipper" ${s.role === 'shipper' ? 'selected' : ''}><div slot="headline">🛵 Giao hàng</div></md-select-option>
                    <md-select-option value="manager" ${s.role === 'manager' ? 'selected' : ''}><div slot="headline">👔 Quản lý</div></md-select-option>
                </md-outlined-select>
            </div>
            <div class="form-group"><md-outlined-text-field label="Số điện thoại" type="tel" id="editStaffPhone" value="${s.phone}"></md-outlined-text-field></div>
            <div class="form-group">
                <md-outlined-select label="Ca làm việc" id="editStaffShift">
                    <md-select-option value="full" ${s.shift === 'full' ? 'selected' : ''}><div slot="headline">⏰ Cả ngày</div></md-select-option>
                    <md-select-option value="morning" ${s.shift === 'morning' ? 'selected' : ''}><div slot="headline">🌅 Sáng</div></md-select-option>
                    <md-select-option value="evening" ${s.shift === 'evening' ? 'selected' : ''}><div slot="headline">🌆 Chiều</div></md-select-option>
                </md-outlined-select>
            </div>
            <div class="form-group"><md-outlined-text-field label="💰 Lương/giờ (VNĐ)" type="number" id="editStaffHourlyRate" value="${s.hourlyRate || 25000}" min="10000" step="1000"></md-outlined-text-field></div>
        `, `
            <md-outlined-button onclick="modal.close()">Hủy</md-outlined-button>
            <md-filled-button onclick="StaffManagement.saveEdit(${id})">💾 Lưu</md-filled-button>
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
    async checkIn(id) {
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

        // Local Update
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

        // Supabase Sync
        if (typeof SupabaseService !== 'undefined') {
            try {
                await SupabaseService.insert('attendance_log', {
                    staff_id: String(id),
                    staff_name: s.name,
                    date: today,
                    check_in: new Date().toISOString(),
                    check_out: null,
                    total_hours: 0
                });
            } catch (err) {
                console.error('Supabase Check-in failed:', err);
            }
        }

        toast.success(`✅ ${s.name} check-in lúc ${timeStr}`);
    },

    async checkOut(id) {
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

        // Local Update
        record.checkOut = timeStr;
        // Calculate hours
        const [inH, inM] = record.checkIn.split(':').map(Number);
        const [outH, outM] = timeStr.split(':').map(Number);
        record.hours = Math.max(0, ((outH * 60 + outM) - (inH * 60 + inM)) / 60);
        record.hours = Math.round(record.hours * 100) / 100;

        this.saveAttendance();
        this.renderAttendance();

        // Supabase Sync
        if (typeof SupabaseService !== 'undefined') {
            try {
                // Find the active record for this staff
                const { data } = await SupabaseService.client
                    .from('attendance_log')
                    .select('id')
                    .eq('staff_id', String(id))
                    .eq('date', today)
                    .is('check_out', null)
                    .single();

                if (data) {
                    await SupabaseService.update('attendance_log', data.id, {
                        check_out: new Date().toISOString(),
                        total_hours: record.hours
                    });
                }
            } catch (err) {
                console.error('Supabase Check-out failed:', err);
            }
        }

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
                    `<md-filled-tonal-button class="btn-success btn-sm" onclick="StaffManagement.checkIn(${s.id})">📥 Check-in</md-filled-tonal-button>` :
                    `<md-filled-tonal-button class="btn-warning btn-sm" onclick="StaffManagement.checkOut(${s.id})">📤 Check-out</md-filled-tonal-button>`
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
                <md-outlined-text-field label="Chọn tháng" type="month" id="payrollMonth" value="${month}" onchange="StaffManagement.calculatePayroll()"></md-outlined-text-field>
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
            <md-outlined-button onclick="modal.close()">Đóng</md-outlined-button>
            <md-filled-button onclick="StaffManagement.exportPayroll()">📤 Xuất Excel</md-filled-button>
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
