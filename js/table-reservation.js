// ========================================
// F&B MASTER - TABLE RESERVATION
// Book tables with floor plan view
// ========================================

const TableReservation = {
    // Table layout configuration
    tables: [
        { id: 1, name: 'Bàn 1', seats: 2, x: 10, y: 10, shape: 'circle' },
        { id: 2, name: 'Bàn 2', seats: 2, x: 30, y: 10, shape: 'circle' },
        { id: 3, name: 'Bàn 3', seats: 4, x: 50, y: 10, shape: 'square' },
        { id: 4, name: 'Bàn 4', seats: 4, x: 70, y: 10, shape: 'square' },
        { id: 5, name: 'Bàn 5', seats: 6, x: 10, y: 40, shape: 'rect' },
        { id: 6, name: 'Bàn 6', seats: 6, x: 40, y: 40, shape: 'rect' },
        { id: 7, name: 'Bàn 7', seats: 8, x: 70, y: 40, shape: 'rect' },
        { id: 8, name: 'Bàn VIP', seats: 10, x: 40, y: 70, shape: 'vip' }
    ],

    // State
    state: {
        selectedTable: null,
        selectedDate: null,
        selectedTime: null,
        guests: 2,
        specialRequest: ''
    },

    init() {
        console.log('🪑 Table Reservation initialized');
    },

    // ========================================
    // RESERVATION FLOW
    // ========================================

    showReservationModal() {
        const modal = document.createElement('div');
        modal.className = 'reservation-modal';
        modal.id = 'reservationModal';
        modal.innerHTML = `
            <div class="reservation-overlay" onclick="TableReservation.close()"></div>
            <div class="reservation-content animate-fadeInUp">
                <div class="reservation-header">
                    <h2>🪑 Đặt bàn</h2>
                    <button class="reservation-close" onclick="TableReservation.close()">✕</button>
                </div>
                <div class="reservation-steps">
                    <div class="step active" data-step="1">1. Thông tin</div>
                    <div class="step" data-step="2">2. Chọn bàn</div>
                    <div class="step" data-step="3">3. Xác nhận</div>
                </div>
                <div class="reservation-body">
                    ${this.renderStep1()}
                </div>
            </div>
        `;
        document.body.appendChild(modal);
        document.body.style.overflow = 'hidden';
        this.injectStyles();
    },

    renderStep1() {
        const today = new Date().toISOString().split('T')[0];
        return `
            <div class="step-content step-1">
                <div class="form-group">
                    <label>📅 Ngày</label>
                    <input type="date" id="reserveDate" min="${today}" value="${today}">
                </div>
                <div class="form-group">
                    <label>⏰ Giờ</label>
                    <div class="time-slots">
                        ${this.generateTimeSlots().map(time => `
                            <button class="time-slot" data-time="${time}" onclick="TableReservation.selectTime('${time}')">
                                ${time}
                            </button>
                        `).join('')}
                    </div>
                </div>
                <div class="form-group">
                    <label>👥 Số khách</label>
                    <div class="guest-counter">
                        <button onclick="TableReservation.changeGuests(-1)">−</button>
                        <span id="guestCount">${this.state.guests}</span>
                        <button onclick="TableReservation.changeGuests(1)">+</button>
                    </div>
                </div>
                <button class="next-step-btn" onclick="TableReservation.goToStep(2)">
                    Tiếp tục →
                </button>
            </div>
        `;
    },

    renderStep2() {
        return `
            <div class="step-content step-2">
                <div class="floor-plan">
                    <div class="floor-plan-header">
                        <span>🏠 Sơ đồ nhà hàng</span>
                        <span class="floor-legend">
                            <span class="legend-item"><span class="dot available"></span> Trống</span>
                            <span class="legend-item"><span class="dot occupied"></span> Đã đặt</span>
                        </span>
                    </div>
                    <div class="floor-grid" id="floorGrid">
                        ${this.tables.map(table => this.renderTable(table)).join('')}
                    </div>
                </div>
                <div class="selected-table-info" id="selectedTableInfo">
                    <p>Chọn một bàn trên sơ đồ</p>
                </div>
                <div class="step-buttons">
                    <button class="back-btn" onclick="TableReservation.goToStep(1)">← Quay lại</button>
                    <button class="next-step-btn" id="confirmTableBtn" disabled onclick="TableReservation.goToStep(3)">
                        Tiếp tục →
                    </button>
                </div>
            </div>
        `;
    },

    renderStep3() {
        const table = this.tables.find(t => t.id === this.state.selectedTable);
        return `
            <div class="step-content step-3">
                <div class="confirmation-summary">
                    <div class="summary-item">
                        <span class="summary-label">📅 Ngày giờ</span>
                        <span class="summary-value">${this.formatDate(this.state.selectedDate)} - ${this.state.selectedTime}</span>
                    </div>
                    <div class="summary-item">
                        <span class="summary-label">🪑 Bàn</span>
                        <span class="summary-value">${table?.name} (${table?.seats} chỗ)</span>
                    </div>
                    <div class="summary-item">
                        <span class="summary-label">👥 Số khách</span>
                        <span class="summary-value">${this.state.guests} người</span>
                    </div>
                </div>
                <div class="form-group">
                    <label>📝 Yêu cầu đặc biệt (tùy chọn)</label>
                    <textarea id="specialRequest" placeholder="VD: Bàn gần cửa sổ, sinh nhật..." rows="3"></textarea>
                </div>
                <div class="form-group">
                    <label>📱 Số điện thoại</label>
                    <input type="tel" id="reservePhone" placeholder="0901234567">
                </div>
                <div class="step-buttons">
                    <button class="back-btn" onclick="TableReservation.goToStep(2)">← Quay lại</button>
                    <button class="confirm-btn" onclick="TableReservation.confirmReservation()">
                        ✅ Xác nhận đặt bàn
                    </button>
                </div>
            </div>
        `;
    },

    renderTable(table) {
        const isOccupied = this.isTableOccupied(table.id);
        const isSelected = this.state.selectedTable === table.id;
        const canFit = table.seats >= this.state.guests;

        return `
            <div class="floor-table ${table.shape} ${isOccupied ? 'occupied' : 'available'} 
                        ${isSelected ? 'selected' : ''} ${!canFit ? 'too-small' : ''}"
                 style="left: ${table.x}%; top: ${table.y}%"
                 onclick="TableReservation.selectTable(${table.id})"
                 data-table-id="${table.id}">
                <span class="table-number">${table.id}</span>
                <span class="table-seats">${table.seats}👤</span>
            </div>
        `;
    },

    // ========================================
    // ACTIONS
    // ========================================

    generateTimeSlots() {
        const slots = [];
        for (let h = 10; h <= 21; h++) {
            slots.push(`${h}:00`);
            if (h < 21) slots.push(`${h}:30`);
        }
        return slots;
    },

    selectTime(time) {
        this.state.selectedTime = time;
        document.querySelectorAll('.time-slot').forEach(btn => {
            btn.classList.toggle('selected', btn.dataset.time === time);
        });
    },

    changeGuests(delta) {
        this.state.guests = Math.max(1, Math.min(12, this.state.guests + delta));
        document.getElementById('guestCount').textContent = this.state.guests;
    },

    selectTable(tableId) {
        const table = this.tables.find(t => t.id === tableId);
        if (!table || this.isTableOccupied(tableId) || table.seats < this.state.guests) {
            return;
        }

        this.state.selectedTable = tableId;

        // Update UI
        document.querySelectorAll('.floor-table').forEach(el => {
            el.classList.toggle('selected', parseInt(el.dataset.tableId) === tableId);
        });

        document.getElementById('selectedTableInfo').innerHTML = `
            <div class="selected-table-details">
                <strong>${table.name}</strong>
                <span>${table.seats} chỗ ngồi</span>
            </div>
        `;

        document.getElementById('confirmTableBtn').disabled = false;
    },

    isTableOccupied(tableId) {
        // Simulate some tables being occupied
        const occupiedTables = [3, 6];
        return occupiedTables.includes(tableId);
    },

    goToStep(step) {
        // Validate before proceeding
        if (step === 2) {
            this.state.selectedDate = document.getElementById('reserveDate').value;
            if (!this.state.selectedTime) {
                this.showToast('⚠️ Vui lòng chọn giờ!');
                return;
            }
        }

        // Update steps UI
        document.querySelectorAll('.step').forEach(el => {
            const s = parseInt(el.dataset.step);
            el.classList.toggle('active', s === step);
            el.classList.toggle('done', s < step);
        });

        // Render step content
        const body = document.querySelector('.reservation-body');
        if (step === 1) body.innerHTML = this.renderStep1();
        else if (step === 2) body.innerHTML = this.renderStep2();
        else if (step === 3) body.innerHTML = this.renderStep3();
    },

    confirmReservation() {
        const phone = document.getElementById('reservePhone').value;
        if (!phone || phone.length < 10) {
            this.showToast('⚠️ Vui lòng nhập số điện thoại!');
            return;
        }

        this.state.specialRequest = document.getElementById('specialRequest')?.value || '';

        // Save reservation
        const reservations = JSON.parse(localStorage.getItem('table_reservations') || '[]');
        const reservation = {
            id: 'RES' + Date.now(),
            ...this.state,
            phone,
            createdAt: new Date().toISOString(),
            status: 'confirmed'
        };
        reservations.push(reservation);
        localStorage.setItem('table_reservations', JSON.stringify(reservations));

        // Show success
        this.showSuccessModal(reservation);
    },

    showSuccessModal(reservation) {
        const table = this.tables.find(t => t.id === reservation.selectedTable);
        const body = document.querySelector('.reservation-body');
        body.innerHTML = `
            <div class="reservation-success animate-popIn">
                <div class="success-icon">🎉</div>
                <h3>Đặt bàn thành công!</h3>
                <div class="success-details">
                    <p>📅 ${this.formatDate(reservation.selectedDate)} - ${reservation.selectedTime}</p>
                    <p>🪑 ${table?.name} (${table?.seats} chỗ)</p>
                    <p>👥 ${reservation.guests} khách</p>
                    <p>📱 ${reservation.phone}</p>
                </div>
                <p class="reservation-code">Mã đặt: <strong>${reservation.id}</strong></p>
                <button class="done-btn" onclick="TableReservation.close()">Hoàn tất</button>
            </div>
        `;

        // Celebration
        if (typeof Confetti !== 'undefined') {
            Confetti.celebrate();
        }

        // Add points
        if (typeof LoyaltyGame !== 'undefined') {
            LoyaltyGame.addPoints(50, 'Đặt bàn');
        }
    },

    close() {
        const modal = document.getElementById('reservationModal');
        if (modal) {
            modal.remove();
            document.body.style.overflow = '';
        }
        // Reset state
        this.state = {
            selectedTable: null,
            selectedDate: null,
            selectedTime: null,
            guests: 2,
            specialRequest: ''
        };
    },

    // ========================================
    // UTILITIES
    // ========================================

    formatDate(dateStr) {
        return new Date(dateStr).toLocaleDateString('vi-VN', {
            weekday: 'long',
            day: 'numeric',
            month: 'long'
        });
    },

    showToast(message) {
        if (typeof CustomerApp !== 'undefined' && CustomerApp.showToast) {
            CustomerApp.showToast(message);
        } else {
            alert(message);
        }
    },

    injectStyles() {
        if (document.getElementById('reservationStyles')) return;

        const style = document.createElement('style');
        style.id = 'reservationStyles';
        style.textContent = `
            .reservation-modal {
                position: fixed;
                inset: 0;
                z-index: 2000;
                display: flex;
                align-items: center;
                justify-content: center;
            }

            .reservation-overlay {
                position: absolute;
                inset: 0;
                background: rgba(0,0,0,0.7);
            }

            .reservation-content {
                position: relative;
                width: 95%;
                max-width: 500px;
                max-height: 90vh;
                background: var(--bg-card, #1e1e3a);
                border-radius: 24px;
                overflow: hidden;
                display: flex;
                flex-direction: column;
            }

            .reservation-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 20px;
                border-bottom: 1px solid rgba(255,255,255,0.1);
            }

            .reservation-header h2 {
                margin: 0;
                font-size: 1.2rem;
            }

            .reservation-close {
                width: 36px;
                height: 36px;
                border: none;
                background: rgba(255,255,255,0.1);
                color: white;
                border-radius: 50%;
                font-size: 1rem;
                cursor: pointer;
            }

            .reservation-steps {
                display: flex;
                padding: 16px 20px;
                gap: 8px;
                border-bottom: 1px solid rgba(255,255,255,0.1);
            }

            .reservation-steps .step {
                flex: 1;
                text-align: center;
                padding: 8px;
                font-size: 0.75rem;
                color: var(--text-muted);
                border-radius: 8px;
                background: rgba(255,255,255,0.05);
            }

            .reservation-steps .step.active {
                background: var(--primary, #6366f1);
                color: white;
            }

            .reservation-steps .step.done {
                background: var(--secondary, #10b981);
                color: white;
            }

            .reservation-body {
                padding: 20px;
                overflow-y: auto;
                flex: 1;
            }

            .form-group {
                margin-bottom: 20px;
            }

            .form-group label {
                display: block;
                margin-bottom: 8px;
                font-size: 0.9rem;
                color: var(--text-secondary);
            }

            .form-group input, .form-group textarea {
                width: 100%;
                padding: 14px;
                background: rgba(255,255,255,0.05);
                border: 1px solid rgba(255,255,255,0.1);
                border-radius: 12px;
                color: white;
                font-size: 1rem;
            }

            .time-slots {
                display: grid;
                grid-template-columns: repeat(4, 1fr);
                gap: 8px;
            }

            .time-slot {
                padding: 12px;
                background: rgba(255,255,255,0.05);
                border: 1px solid rgba(255,255,255,0.1);
                border-radius: 10px;
                color: white;
                font-size: 0.85rem;
                cursor: pointer;
                transition: all 0.2s;
            }

            .time-slot.selected {
                background: var(--primary, #6366f1);
                border-color: var(--primary, #6366f1);
            }

            .guest-counter {
                display: flex;
                align-items: center;
                gap: 20px;
            }

            .guest-counter button {
                width: 44px;
                height: 44px;
                border: 2px solid rgba(255,255,255,0.2);
                background: transparent;
                color: white;
                font-size: 1.5rem;
                border-radius: 50%;
                cursor: pointer;
            }

            .guest-counter span {
                font-size: 1.5rem;
                font-weight: 700;
                min-width: 40px;
                text-align: center;
            }

            .next-step-btn, .confirm-btn, .done-btn {
                width: 100%;
                padding: 16px;
                background: linear-gradient(135deg, var(--primary, #6366f1), var(--secondary, #10b981));
                border: none;
                border-radius: 16px;
                color: white;
                font-size: 1rem;
                font-weight: 600;
                cursor: pointer;
            }

            .next-step-btn:disabled {
                opacity: 0.5;
            }

            .back-btn {
                padding: 16px;
                background: rgba(255,255,255,0.1);
                border: none;
                border-radius: 16px;
                color: white;
                font-size: 1rem;
                cursor: pointer;
            }

            .step-buttons {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 12px;
                margin-top: 20px;
            }

            /* Floor Plan */
            .floor-plan {
                background: rgba(0,0,0,0.2);
                border-radius: 16px;
                padding: 16px;
                margin-bottom: 16px;
            }

            .floor-plan-header {
                display: flex;
                justify-content: space-between;
                margin-bottom: 12px;
                font-size: 0.85rem;
            }

            .floor-legend {
                display: flex;
                gap: 12px;
            }

            .legend-item { display: flex; align-items: center; gap: 4px; }
            .dot { width: 10px; height: 10px; border-radius: 50%; }
            .dot.available { background: var(--secondary, #10b981); }
            .dot.occupied { background: #ef4444; }

            .floor-grid {
                position: relative;
                height: 200px;
                background: rgba(255,255,255,0.02);
                border-radius: 12px;
            }

            .floor-table {
                position: absolute;
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                cursor: pointer;
                transition: all 0.2s;
            }

            .floor-table.circle {
                width: 50px;
                height: 50px;
                border-radius: 50%;
            }

            .floor-table.square {
                width: 60px;
                height: 60px;
                border-radius: 12px;
            }

            .floor-table.rect {
                width: 80px;
                height: 50px;
                border-radius: 12px;
            }

            .floor-table.vip {
                width: 120px;
                height: 60px;
                border-radius: 16px;
                background: linear-gradient(135deg, #fbbf24, #f59e0b) !important;
            }

            .floor-table.available {
                background: rgba(16, 185, 129, 0.3);
                border: 2px solid var(--secondary, #10b981);
            }

            .floor-table.occupied {
                background: rgba(239, 68, 68, 0.3);
                border: 2px solid #ef4444;
                cursor: not-allowed;
            }

            .floor-table.too-small {
                opacity: 0.4;
            }

            .floor-table.selected {
                background: var(--primary, #6366f1);
                border-color: white;
                transform: scale(1.1);
            }

            .table-number {
                font-weight: 700;
                font-size: 0.9rem;
            }

            .table-seats {
                font-size: 0.65rem;
            }

            .selected-table-info {
                text-align: center;
                padding: 16px;
                background: rgba(255,255,255,0.05);
                border-radius: 12px;
                margin-bottom: 16px;
            }

            .selected-table-details {
                display: flex;
                justify-content: space-between;
            }

            /* Confirmation */
            .confirmation-summary {
                background: rgba(255,255,255,0.05);
                border-radius: 16px;
                padding: 16px;
                margin-bottom: 20px;
            }

            .summary-item {
                display: flex;
                justify-content: space-between;
                padding: 8px 0;
                border-bottom: 1px solid rgba(255,255,255,0.05);
            }

            .summary-item:last-child {
                border-bottom: none;
            }

            .summary-label {
                color: var(--text-muted);
            }

            .summary-value {
                font-weight: 600;
            }

            /* Success */
            .reservation-success {
                text-align: center;
                padding: 20px;
            }

            .success-icon {
                font-size: 4rem;
                margin-bottom: 16px;
            }

            .success-details {
                background: rgba(255,255,255,0.05);
                border-radius: 16px;
                padding: 16px;
                margin: 20px 0;
            }

            .success-details p {
                margin: 8px 0;
            }

            .reservation-code {
                font-size: 0.9rem;
                color: var(--secondary, #10b981);
                margin-bottom: 20px;
            }
        `;
        document.head.appendChild(style);
    }
};

// Initialize
document.addEventListener('DOMContentLoaded', () => TableReservation.init());

window.TableReservation = TableReservation;
