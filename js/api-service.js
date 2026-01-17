// =====================================================
// UNIFIED API SERVICE - ÁNH DƯƠNG F&B
// Unified API layer for Admin, Customer, Staff portals
// Wraps SupabaseService with standardized handling
// =====================================================

const APIService = {
    // Vietnamese error messages
    errorMessages: {
        'Not configured': 'Chưa cấu hình kết nối',
        'Network Error': 'Lỗi mạng, vui lòng thử lại',
        'Timeout': 'Kết nối quá thời gian',
        'Rate limit': 'Quá nhiều yêu cầu, đợi giây lát',
        'default': 'Đã có lỗi xảy ra'
    },

    // Request queue for offline mode (Delegated to OfflineManager)
    isOnline: navigator.onLine,

    // =====================================================
    // INITIALIZATION
    // =====================================================

    init() {
        // Listen for online/offline events
        window.addEventListener('online', () => this.handleOnline());
        window.addEventListener('offline', () => this.handleOffline());

        // Sync if online
        if (this.isOnline) {
            // Delay slightly to ensure OfflineManager is ready
            setTimeout(() => this.syncOfflineQueue(), 1000);
        }

        if (window.Debug) Debug.info('APIService initialized');
    },

    handleOnline() {
        this.isOnline = true;
        this.showConnectionStatus(true);
        this.syncOfflineQueue();
        if (window.Debug) Debug.info('📶 Back online');
    },

    handleOffline() {
        this.isOnline = false;
        this.showConnectionStatus(false);
        if (window.Debug) Debug.warn('📴 Gone offline');
    },

    showConnectionStatus(online) {
        // Delegate UI to OfflineManager if available, or keep simple fallback
        if (typeof OfflineManager !== 'undefined') {
            OfflineManager.showStatus(online ? 'online' : 'offline');
        }
    },

    // =====================================================
    // OFFLINE QUEUE MANAGEMENT (Delegated to OfflineManager)
    // =====================================================

    addToQueue(action, data) {
        if (typeof OfflineManager !== 'undefined') {
            OfflineManager.enqueueAction(action, data);
        } else {
            console.error('OfflineManager not loaded');
        }
    },

    async syncOfflineQueue() {
        if (typeof OfflineManager !== 'undefined') {
            await OfflineManager.syncQueue();
        }
    },

    // =====================================================
    // MENU API
    // =====================================================

    menu: {
        async getAll() {
            const result = await SupabaseService.getMenuItems();
            return APIService.handleResponse(result, 'Không thể tải menu');
        },

        async getCategories() {
            const result = await SupabaseService.getCategories();
            return APIService.handleResponse(result, 'Không thể tải danh mục');
        },

        async getCombos() {
            const result = await SupabaseService.getCombos();
            return APIService.handleResponse(result, 'Không thể tải combo');
        }
    },

    // =====================================================
    // ORDERS API
    // =====================================================

    orders: {
        async create(orderData) {
            if (!APIService.isOnline) {
                // Queue for later sync
                APIService.addToQueue('createOrder', orderData);
                return {
                    success: true,
                    data: { ...orderData, id: 'offline-' + Date.now(), status: 'pending_sync' },
                    offline: true,
                    message: 'Đơn hàng sẽ được gửi khi có mạng'
                };
            }

            const result = await SupabaseService.createOrder(orderData);
            return APIService.handleResponse(result, 'Không thể tạo đơn hàng');
        },

        async getAll(status = null) {
            const result = await SupabaseService.getOrders(status);
            return APIService.handleResponse(result, 'Không thể tải đơn hàng');
        },

        async updateStatus(orderId, status) {
            if (!APIService.isOnline) {
                APIService.addToQueue('updateOrderStatus', { orderId, status });
                return {
                    success: true,
                    offline: true,
                    message: 'Cập nhật sẽ được đồng bộ khi có mạng'
                };
            }

            const result = await SupabaseService.updateOrderStatus(orderId, status);
            return APIService.handleResponse(result, 'Không thể cập nhật đơn hàng');
        },

        subscribe(callback) {
            SupabaseService.subscribeToOrders(callback);
        },

        subscribeToCustomer(phone, callback) {
            SupabaseService.subscribeToCustomerOrders(phone, callback);
        },

        subscribeById(orderId, callback) {
            SupabaseService.subscribeToOrderById(orderId, callback);
        }
    },

    // =====================================================
    // CUSTOMERS API
    // =====================================================

    customers: {
        async getByPhone(phone) {
            const result = await SupabaseService.getCustomerByPhone(phone);
            return APIService.handleResponse(result, 'Không tìm thấy khách hàng');
        },

        async upsert(customerData) {
            if (!APIService.isOnline) {
                APIService.addToQueue('upsertCustomer', customerData);
                return {
                    success: true,
                    data: customerData,
                    offline: true
                };
            }

            const result = await SupabaseService.upsertCustomer(customerData);
            return APIService.handleResponse(result, 'Không thể lưu thông tin khách hàng');
        }
    },

    // =====================================================
    // ANALYTICS API
    // =====================================================

    analytics: {
        async getTodayStats() {
            const result = await SupabaseService.getTodayStats();
            return APIService.handleResponse(result, 'Không thể tải thống kê');
        },

        async getDailyReport(date = null) {
            const result = await SupabaseService.getDailyReport(date);
            return APIService.handleResponse(result, 'Không thể tải báo cáo ngày');
        },

        async getRangeReport(dateFrom, dateTo) {
            const result = await SupabaseService.getRangeReport(dateFrom, dateTo);
            return APIService.handleResponse(result, 'Không thể tải báo cáo');
        },

        async getTopItems(dateFrom = null, dateTo = null, limit = 10) {
            const result = await SupabaseService.getTopItems(dateFrom, dateTo, limit);
            return APIService.handleResponse(result, 'Không thể tải top sản phẩm');
        },

        async getCategoryRevenue(dateFrom = null, dateTo = null) {
            const result = await SupabaseService.getCategoryRevenue(dateFrom, dateTo);
            return APIService.handleResponse(result, 'Không thể tải doanh thu danh mục');
        },

        async getHourlyStats(date = null) {
            const result = await SupabaseService.getHourlyStats(date);
            return APIService.handleResponse(result, 'Không thể tải thống kê theo giờ');
        },

        async getOrdersForExport(dateFrom, dateTo) {
            const result = await SupabaseService.getOrdersForExport(dateFrom, dateTo);
            return APIService.handleResponse(result, 'Không thể xuất dữ liệu');
        },

        subscribeToStats(callback) {
            SupabaseService.subscribeToStats(callback);
        }
    },

    // =====================================================
    // RESPONSE HANDLERS
    // =====================================================

    handleResponse(result, defaultError = 'Đã có lỗi xảy ra') {
        if (result.success || (result.data && !result.error)) {
            return {
                success: true,
                data: result.data,
                error: null
            };
        }

        const errorMsg = this.translateError(result.error) || defaultError;
        return {
            success: false,
            data: null,
            error: errorMsg
        };
    },

    translateError(error) {
        if (!error) return this.errorMessages.default;

        const errorStr = typeof error === 'string' ? error : error.message || '';

        for (const [key, msg] of Object.entries(this.errorMessages)) {
            if (errorStr.toLowerCase().includes(key.toLowerCase())) {
                return msg;
            }
        }

        return errorStr || this.errorMessages.default;
    },

    // =====================================================
    // UTILITIES
    // =====================================================

    showToast(message, type = 'info') {
        if (typeof Toast !== 'undefined') {
            Toast.show(message, type);
        } else {
            // Fallback toast
            const toast = document.createElement('div');
            toast.className = `api-toast api-toast-${type}`;
            toast.textContent = message;
            toast.style.cssText = `
                position: fixed;
                bottom: 80px;
                left: 50%;
                transform: translateX(-50%);
                padding: 12px 24px;
                border-radius: 8px;
                background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#3b82f6'};
                color: white;
                font-size: 14px;
                z-index: 10001;
                animation: fadeInUp 0.3s;
            `;
            document.body.appendChild(toast);
            setTimeout(() => toast.remove(), 3000);
        }
    },

    // Get pending queue count
    getPendingCount() {
        return this.offlineQueue.length;
    },

    // Check if configured
    isConfigured() {
        return typeof isSupabaseConfigured === 'function' ? isSupabaseConfigured() : false;
    }
};

// Initialize on load
document.addEventListener('DOMContentLoaded', () => APIService.init());

// Export to window
window.APIService = APIService;

if (window.Debug) Debug.info('APIService loaded');
