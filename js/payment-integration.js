/**
 * F&B Master - Payment Integration
 * Author: Google DeepMind / Antigravity Team
 * Description: Payment gateway simulation (MoMo, VNPay, ZaloPay) and cash handling.
 */

const PaymentIntegration = {
    methods: [
        {
            id: 'momo',
            name: 'MoMo',
            icon: '💜',
            color: '#ae2070',
            description: 'Ví điện tử MoMo'
        },
        {
            id: 'vnpay',
            name: 'VNPay',
            icon: '🔵',
            color: '#0066b3',
            description: 'Cổng thanh toán VNPay'
        },
        {
            id: 'zalopay',
            name: 'ZaloPay',
            icon: '💙',
            color: '#0068ff',
            description: 'Ví ZaloPay'
        },
        {
            id: 'bank',
            name: 'Chuyển khoản',
            icon: '🏦',
            color: '#10b981',
            description: 'Chuyển khoản ngân hàng'
        },
        {
            id: 'cash',
            name: 'Tiền mặt',
            icon: '💵',
            color: '#f59e0b',
            description: 'Thanh toán khi nhận hàng'
        }
    ],

    bankInfo: {
        bank: 'Vietcombank',
        accountNumber: '1234567890',
        accountName: 'NGUYEN ANH DUONG',
        branch: 'Hồ Chí Minh'
    },

    selectedMethod: null,

    init() {
        if (window.Debug) Debug.info('Payment Integration initialized');
    },

    // ========================================
    // PAYMENT MODAL
    // ========================================

    showPaymentModal(order) {
        this.currentOrder = order;
        this.selectedMethod = null;

        const modal = document.createElement('div');
        modal.className = 'payment-modal';
        modal.id = 'paymentModal';
        modal.innerHTML = `
            <div class="payment-overlay" onclick="PaymentIntegration.close()"></div>
            <div class="payment-content animate-fadeInUp">
                <div class="payment-header">
                    <h2>💳 Thanh toán</h2>
                    <button class="payment-close" onclick="PaymentIntegration.close()">✕</button>
                </div>
                <div class="payment-body">
                    <div class="payment-summary">
                        <div class="summary-row">
                            <span>Tổng tiền hàng</span>
                            <span>${this.formatPrice(order.subtotal || order.total)}</span>
                        </div>
                        ${order.discount ? `
                            <div class="summary-row discount">
                                <span>Giảm giá</span>
                                <span>-${this.formatPrice(order.discount)}</span>
                            </div>
                        ` : ''}
                        <div class="summary-row total">
                            <span>Thành tiền</span>
                            <span>${this.formatPrice(order.total)}</span>
                        </div>
                    </div>

                    <div class="payment-methods">
                        <h4>Chọn phương thức thanh toán</h4>
                        <div class="method-list">
                            ${this.methods.map(m => `
                                <div class="payment-method" data-method="${m.id}" 
                                     onclick="PaymentIntegration.selectMethod('${m.id}')"
                                     style="--method-color: ${m.color}">
                                    <div class="method-icon">${m.icon}</div>
                                    <div class="method-info">
                                        <div class="method-name">${m.name}</div>
                                        <div class="method-desc">${m.description}</div>
                                    </div>
                                    <div class="method-check">✓</div>
                                </div>
                            `).join('')}
                        </div>
                    </div>

                    <div id="paymentDetails"></div>

                    <button class="pay-now-btn" id="payNowBtn" disabled onclick="PaymentIntegration.processPayment()">
                        Thanh toán ${this.formatPrice(order.total)}
                    </button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
        document.body.style.overflow = 'hidden';
        this.injectStyles();
    },

    selectMethod(methodId) {
        this.selectedMethod = methodId;

        // Update UI
        document.querySelectorAll('.payment-method').forEach(el => {
            el.classList.toggle('selected', el.dataset.method === methodId);
        });

        // Show method-specific details
        this.showMethodDetails(methodId);

        // Enable pay button
        document.getElementById('payNowBtn').disabled = false;
    },

    showMethodDetails(methodId) {
        const detailsContainer = document.getElementById('paymentDetails');

        switch (methodId) {
            case 'bank':
                detailsContainer.innerHTML = `
                    <div class="bank-details animate-fadeIn">
                        <h4>📋 Thông tin chuyển khoản</h4>
                        <div class="bank-info-card">
                            <div class="bank-row">
                                <span>Ngân hàng</span>
                                <strong>${this.bankInfo.bank}</strong>
                            </div>
                            <div class="bank-row">
                                <span>Số tài khoản</span>
                                <strong class="copy-text" onclick="PaymentIntegration.copyText('${this.bankInfo.accountNumber}')">
                                    ${this.bankInfo.accountNumber} 📋
                                </strong>
                            </div>
                            <div class="bank-row">
                                <span>Tên TK</span>
                                <strong>${this.bankInfo.accountName}</strong>
                            </div>
                            <div class="bank-row">
                                <span>Nội dung CK</span>
                                <strong class="copy-text" onclick="PaymentIntegration.copyText('${this.currentOrder.id || 'ORDER' + Date.now()}')">
                                    ${this.currentOrder.id || 'ORDER' + Date.now()} 📋
                                </strong>
                            </div>
                        </div>
                        <div class="qr-placeholder">
                            <div id="bankQR"></div>
                            <p>Quét mã QR để chuyển khoản</p>
                        </div>
                    </div>
                `;
                // Generate QR if library available
                this.generateBankQR();
                break;

            case 'momo':
            case 'vnpay':
            case 'zalopay':
                detailsContainer.innerHTML = `
                    <div class="ewallet-details animate-fadeIn">
                        <div class="ewallet-note">
                            <span>📱</span>
                            <p>Bạn sẽ được chuyển đến ứng dụng ${this.getMethodName(methodId)} để hoàn tất thanh toán</p>
                        </div>
                    </div>
                `;
                break;

            case 'cash':
                detailsContainer.innerHTML = `
                    <div class="cash-details animate-fadeIn">
                        <div class="cash-note">
                            <span>💵</span>
                            <p>Thanh toán bằng tiền mặt khi nhận hàng</p>
                        </div>
                    </div>
                `;
                break;

            default:
                detailsContainer.innerHTML = '';
        }
    },

    getMethodName(id) {
        const method = this.methods.find(m => m.id === id);
        return method ? method.name : '';
    },

    generateBankQR() {
        const qrContainer = document.getElementById('bankQR');
        if (!qrContainer) return;

        // VietQR format
        const qrData = `https://img.vietqr.io/image/${this.bankInfo.bank}-${this.bankInfo.accountNumber}-compact.png?amount=${this.currentOrder.total}&addInfo=${this.currentOrder.id || 'ORDER'}`;

        qrContainer.innerHTML = `<img src="${qrData}" alt="QR Code" onerror="this.src='data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%2250%22 x=%2250%22 text-anchor=%22middle%22 font-size=%2220%22>QR</text></svg>'">`;
    },

    async processPayment() {
        const method = this.selectedMethod;

        // Show loading
        const btn = document.getElementById('payNowBtn');
        btn.innerHTML = '<span class="loading-spinner"></span> Đang xử lý...';
        btn.disabled = true;

        // Simulate payment processing
        await this.delay(2000);

        switch (method) {
            case 'momo':
            case 'vnpay':
            case 'zalopay':
                // In real app, redirect to payment gateway
                this.showProcessingScreen(method);
                break;

            case 'bank':
                // Show confirmation pending
                this.showBankConfirmation();
                break;

            case 'cash':
                // Complete order
                this.completePayment('cash');
                break;
        }
    },

    showProcessingScreen(method) {
        const methodInfo = this.methods.find(m => m.id === method);
        const container = document.querySelector('.payment-body');

        container.innerHTML = `
            <div class="payment-processing animate-fadeIn">
                <div class="processing-icon">${methodInfo.icon}</div>
                <h3>Đang kết nối ${methodInfo.name}...</h3>
                <div class="processing-animation">
                    <div class="dot"></div>
                    <div class="dot"></div>
                    <div class="dot"></div>
                </div>
                <p>Vui lòng hoàn tất thanh toán trên ứng dụng</p>
                <button onclick="PaymentIntegration.simulateSuccess()">
                    (Demo) Giả lập thành công
                </button>
            </div>
        `;
    },

    showBankConfirmation() {
        const container = document.querySelector('.payment-body');

        container.innerHTML = `
            <div class="payment-pending animate-fadeIn">
                <div class="pending-icon">⏳</div>
                <h3>Chờ xác nhận chuyển khoản</h3>
                <p>Sau khi chuyển khoản, đơn hàng sẽ được xác nhận trong vài phút</p>
                <div class="pending-order">
                    <span>Mã đơn:</span>
                    <strong>${this.currentOrder.id || 'Đang tạo...'}</strong>
                </div>
                <button onclick="PaymentIntegration.close()">Đóng</button>
            </div>
        `;
    },

    simulateSuccess() {
        this.completePayment(this.selectedMethod);
    },

    completePayment(method) {
        const container = document.querySelector('.payment-body');

        container.innerHTML = `
            <div class="payment-success animate-popIn">
                <div class="success-icon">🎉</div>
                <h3>Thanh toán thành công!</h3>
                <div class="success-details">
                    <p>Số tiền: <strong>${this.formatPrice(this.currentOrder.total)}</strong></p>
                    <p>Phương thức: <strong>${this.getMethodName(method)}</strong></p>
                </div>
                <button class="success-btn" onclick="PaymentIntegration.close()">
                    Hoàn tất
                </button>
            </div>
        `;

        // Celebration
        if (typeof Confetti !== 'undefined') {
            Confetti.celebrate();
        }

        // Add loyalty points
        if (typeof LoyaltyGame !== 'undefined') {
            const points = Math.floor(this.currentOrder.total / 1000);
            LoyaltyGame.addPoints(points, 'Thanh toán');
        }

        // Send notification
        if (typeof PushNotifications !== 'undefined') {
            PushNotifications.orderConfirmed(this.currentOrder.id);
        }
    },

    close() {
        const modal = document.getElementById('paymentModal');
        if (modal) {
            modal.remove();
            document.body.style.overflow = '';
        }
        this.currentOrder = null;
        this.selectedMethod = null;
    },

    async copyText(text) {
        try {
            await navigator.clipboard.writeText(text);
            this.showToast('📋 Đã sao chép!');
        } catch (err) {
            // Fallback
            const input = document.createElement('input');
            input.value = text;
            document.body.appendChild(input);
            input.select();
            document.execCommand('copy');
            document.body.removeChild(input);
            this.showToast('📋 Đã sao chép!');
        }
    },

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    },

    formatPrice(amount) {
        return new Intl.NumberFormat('vi-VN').format(amount) + 'đ';
    },

    showToast(message) {
        if (typeof CustomerApp !== 'undefined' && CustomerApp.showToast) {
            CustomerApp.showToast(message);
        }
    },

    // ========================================
    // STYLES
    // ========================================

    injectStyles() {
        if (document.getElementById('paymentStyles')) return;

        const style = document.createElement('style');
        style.id = 'paymentStyles';
        style.textContent = `
            .payment-modal {
                position: fixed;
                inset: 0;
                z-index: 2000;
                display: flex;
                align-items: flex-end;
            }

            .payment-overlay {
                position: absolute;
                inset: 0;
                background: rgba(0,0,0,0.7);
            }

            .payment-content {
                position: relative;
                width: 100%;
                max-height: 90vh;
                background: var(--bg-main, #0f0f23);
                border-radius: 24px 24px 0 0;
                overflow: hidden;
                display: flex;
                flex-direction: column;
            }

            .payment-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 20px;
                border-bottom: 1px solid var(--border);
            }

            .payment-header h2 { margin: 0; }

            .payment-close {
                width: 36px;
                height: 36px;
                border: none;
                background: rgba(255,255,255,0.1);
                color: var(--text-primary);
                border-radius: 50%;
                cursor: pointer;
            }

            .payment-body {
                flex: 1;
                overflow-y: auto;
                padding: 20px;
                padding-bottom: calc(20px + env(safe-area-inset-bottom));
            }

            .payment-summary {
                background: var(--bg-card);
                border-radius: 16px;
                padding: 16px;
                margin-bottom: 20px;
            }

            .summary-row {
                display: flex;
                justify-content: space-between;
                padding: 8px 0;
            }

            .summary-row.discount { color: var(--secondary); }

            .summary-row.total {
                border-top: 1px solid var(--border);
                padding-top: 12px;
                margin-top: 8px;
                font-size: 1.2rem;
                font-weight: 700;
            }

            .payment-methods h4 {
                margin: 0 0 12px;
                font-size: 0.9rem;
                color: var(--text-secondary);
            }

            .method-list {
                display: flex;
                flex-direction: column;
                gap: 8px;
            }

            .payment-method {
                display: flex;
                align-items: center;
                gap: 12px;
                padding: 16px;
                background: var(--bg-card);
                border: 2px solid transparent;
                border-radius: 16px;
                cursor: pointer;
                transition: all 0.2s;
            }

            .payment-method:hover {
                background: var(--bg-surface);
            }

            .payment-method.selected {
                border-color: var(--method-color);
                background: rgba(99, 102, 241, 0.1);
            }

            .method-icon {
                width: 48px;
                height: 48px;
                background: rgba(255,255,255,0.05);
                border-radius: 12px;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 1.5rem;
            }

            .method-info { flex: 1; }

            .method-name {
                font-weight: 600;
                margin-bottom: 2px;
            }

            .method-desc {
                font-size: 0.8rem;
                color: var(--text-muted);
            }

            .method-check {
                width: 24px;
                height: 24px;
                border: 2px solid var(--border);
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 0.8rem;
                color: transparent;
                transition: all 0.2s;
            }

            .payment-method.selected .method-check {
                background: var(--method-color);
                border-color: var(--method-color);
                color: white;
            }

            /* Bank Details */
            .bank-details, .ewallet-details, .cash-details {
                margin: 20px 0;
            }

            .bank-details h4 {
                margin: 0 0 12px;
            }

            .bank-info-card {
                background: var(--bg-card);
                border-radius: 16px;
                padding: 16px;
                margin-bottom: 16px;
            }

            .bank-row {
                display: flex;
                justify-content: space-between;
                padding: 10px 0;
                border-bottom: 1px solid var(--border);
            }

            .bank-row:last-child { border: none; }

            .copy-text {
                cursor: pointer;
                color: var(--primary);
            }

            .qr-placeholder {
                text-align: center;
                padding: 20px;
                background: white;
                border-radius: 16px;
            }

            .qr-placeholder img {
                max-width: 200px;
                border-radius: 8px;
            }

            .qr-placeholder p {
                margin: 12px 0 0;
                color: #333;
                font-size: 0.85rem;
            }

            .ewallet-note, .cash-note {
                display: flex;
                align-items: center;
                gap: 16px;
                padding: 20px;
                background: var(--bg-card);
                border-radius: 16px;
            }

            .ewallet-note span, .cash-note span {
                font-size: 2.5rem;
            }

            .ewallet-note p, .cash-note p {
                margin: 0;
                color: var(--text-secondary);
            }

            .pay-now-btn {
                width: 100%;
                margin-top: 20px;
                padding: 18px;
                background: linear-gradient(135deg, var(--primary), var(--secondary));
                border: none;
                border-radius: 16px;
                color: white;
                font-size: 1.1rem;
                font-weight: 700;
                cursor: pointer;
                transition: opacity 0.2s;
            }

            .pay-now-btn:disabled {
                opacity: 0.5;
                cursor: not-allowed;
            }

            /* Processing */
            .payment-processing, .payment-pending, .payment-success {
                text-align: center;
                padding: 40px 20px;
            }

            .processing-icon, .pending-icon, .success-icon {
                font-size: 4rem;
                margin-bottom: 20px;
            }

            .processing-animation {
                display: flex;
                justify-content: center;
                gap: 8px;
                margin: 20px 0;
            }

            .processing-animation .dot {
                width: 12px;
                height: 12px;
                background: var(--primary);
                border-radius: 50%;
                animation: bounce 1.4s infinite ease-in-out both;
            }

            .processing-animation .dot:nth-child(1) { animation-delay: -0.32s; }
            .processing-animation .dot:nth-child(2) { animation-delay: -0.16s; }

            @keyframes bounce {
                0%, 80%, 100% { transform: scale(0); }
                40% { transform: scale(1); }
            }

            .payment-processing button,
            .payment-pending button {
                margin-top: 20px;
                padding: 12px 24px;
                background: rgba(255,255,255,0.1);
                border: none;
                border-radius: 12px;
                color: var(--text-primary);
                cursor: pointer;
            }

            .success-details {
                background: var(--bg-card);
                border-radius: 16px;
                padding: 20px;
                margin: 20px 0;
            }

            .success-btn {
                width: 100%;
                padding: 16px;
                background: linear-gradient(135deg, var(--primary), var(--secondary));
                border: none;
                border-radius: 16px;
                color: white;
                font-size: 1rem;
                font-weight: 600;
                cursor: pointer;
            }

            .loading-spinner {
                display: inline-block;
                width: 20px;
                height: 20px;
                border: 2px solid rgba(255,255,255,0.3);
                border-top-color: white;
                border-radius: 50%;
                animation: spin 0.8s linear infinite;
            }

            @keyframes spin {
                to { transform: rotate(360deg); }
            }
        `;
        document.head.appendChild(style);
    }
};

// Initialize
document.addEventListener('DOMContentLoaded', () => PaymentIntegration.init());

window.PaymentIntegration = PaymentIntegration;
