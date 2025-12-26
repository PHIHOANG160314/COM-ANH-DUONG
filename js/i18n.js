// ========================================
// F&B MASTER - INTERNATIONALIZATION MODULE
// ========================================

const i18n = {
    currentLang: 'vi',

    translations: {
        vi: {
            // Navigation
            nav_dashboard: 'Tổng quan',
            nav_pos: 'Bán hàng',
            nav_foodcost: 'Giá thành',
            nav_inventory: 'Kho hàng',
            nav_recipes: 'Công thức',
            nav_menu: 'Menu',
            nav_orders: 'Đơn hàng',
            nav_analytics: 'Thống kê',
            nav_tables: 'Quản lý bàn',
            nav_kitchen: 'Màn hình bếp',
            nav_staff: 'Nhân viên',
            nav_customers: 'Khách hàng',
            nav_sops: 'SOPs',

            // Common
            btn_save: 'Lưu',
            btn_cancel: 'Hủy',
            btn_add: 'Thêm',
            btn_edit: 'Sửa',
            btn_delete: 'Xóa',
            btn_close: 'Đóng',
            btn_confirm: 'Xác nhận',
            btn_search: 'Tìm kiếm',
            btn_export: 'Xuất Excel',
            btn_import: 'Nhập Excel',
            btn_print: 'In',

            // Dashboard
            dashboard_title: 'Tổng Quan',
            dashboard_revenue_today: 'Doanh thu hôm nay',
            dashboard_orders_today: 'Đơn hàng hôm nay',
            dashboard_foodcost: 'Food Cost',
            dashboard_inventory_alerts: 'Cảnh báo tồn kho',

            // POS
            pos_title: 'Bán Hàng',
            pos_select_table: 'Chọn bàn',
            pos_takeaway: 'Mang đi',
            pos_cart: 'Giỏ hàng',
            pos_cart_empty: 'Chưa có món nào',
            pos_subtotal: 'Tạm tính',
            pos_vat: 'VAT (10%)',
            pos_total: 'Tổng cộng',
            pos_checkout: 'Thanh toán',
            pos_clear_cart: 'Xóa đơn',

            // Menu
            menu_title: 'Quản Lý Menu',
            menu_master: 'Menu Tổng',
            menu_today: 'Menu Hôm Nay',
            menu_add_item: 'Thêm món',
            menu_item_name: 'Tên món',
            menu_item_price: 'Giá bán',
            menu_item_cost: 'Giá vốn',
            menu_item_category: 'Loại món',
            menu_category_food: 'Món chính',
            menu_category_drinks: 'Đồ uống',
            menu_category_dessert: 'Tráng miệng',

            // Staff
            staff_title: 'Quản Lý Nhân Viên',
            staff_add: 'Thêm nhân viên',
            staff_name: 'Họ tên',
            staff_role: 'Chức vụ',
            staff_phone: 'Số điện thoại',
            staff_shift: 'Ca làm việc',
            staff_status: 'Trạng thái',
            staff_active: 'Đang làm',
            staff_inactive: 'Nghỉ',
            staff_payroll: 'Bảng lương',
            staff_attendance: 'Chấm công',
            staff_checkin: 'Check-in',
            staff_checkout: 'Check-out',

            // Customers
            customers_title: 'Khách Hàng Thân Thiết',
            customers_add: 'Thêm khách hàng',
            customers_points: 'Điểm tích lũy',
            customers_tier: 'Hạng thành viên',
            customers_total_spent: 'Tổng chi tiêu',
            customers_visits: 'Số lần ghé',
            customers_scan_qr: 'Quét QR tích điểm',
            customers_send_promo: 'Gửi khuyến mãi',

            // Kitchen
            kitchen_title: 'Màn Hình Bếp',
            kitchen_pending: 'Đang chờ',
            kitchen_preparing: 'Đang làm',
            kitchen_ready: 'Sẵn sàng',
            kitchen_start: 'Bắt đầu làm',
            kitchen_complete: 'Hoàn thành',
            kitchen_no_orders: 'Không có đơn hàng đang chờ',

            // Tables
            tables_title: 'Quản Lý Bàn',
            tables_add: 'Thêm bàn',
            tables_available: 'Trống',
            tables_occupied: 'Có khách',
            tables_reserved: 'Đã đặt',
            tables_cleaning: 'Đang dọn',

            // Analytics
            analytics_title: 'Thống Kê Doanh Thu',
            analytics_revenue: 'Doanh thu',
            analytics_orders: 'Đơn hàng',
            analytics_avg_order: 'Trung bình đơn',
            analytics_top_items: 'Món bán chạy',

            // Messages
            msg_success: 'Thành công!',
            msg_error: 'Có lỗi xảy ra!',
            msg_confirm_delete: 'Bạn có chắc muốn xóa?',
            msg_loading: 'Đang tải...',
            msg_no_data: 'Không có dữ liệu'
        },

        en: {
            // Navigation
            nav_dashboard: 'Dashboard',
            nav_pos: 'Point of Sale',
            nav_foodcost: 'Food Cost',
            nav_inventory: 'Inventory',
            nav_recipes: 'Recipes',
            nav_menu: 'Menu',
            nav_orders: 'Orders',
            nav_analytics: 'Analytics',
            nav_tables: 'Table Management',
            nav_kitchen: 'Kitchen Display',
            nav_staff: 'Staff',
            nav_customers: 'Customers',
            nav_sops: 'SOPs',

            // Common
            btn_save: 'Save',
            btn_cancel: 'Cancel',
            btn_add: 'Add',
            btn_edit: 'Edit',
            btn_delete: 'Delete',
            btn_close: 'Close',
            btn_confirm: 'Confirm',
            btn_search: 'Search',
            btn_export: 'Export Excel',
            btn_import: 'Import Excel',
            btn_print: 'Print',

            // Dashboard
            dashboard_title: 'Dashboard',
            dashboard_revenue_today: "Today's Revenue",
            dashboard_orders_today: "Today's Orders",
            dashboard_foodcost: 'Food Cost',
            dashboard_inventory_alerts: 'Inventory Alerts',

            // POS
            pos_title: 'Point of Sale',
            pos_select_table: 'Select table',
            pos_takeaway: 'Takeaway',
            pos_cart: 'Cart',
            pos_cart_empty: 'No items yet',
            pos_subtotal: 'Subtotal',
            pos_vat: 'VAT (10%)',
            pos_total: 'Total',
            pos_checkout: 'Checkout',
            pos_clear_cart: 'Clear Cart',

            // Menu
            menu_title: 'Menu Management',
            menu_master: 'Master Menu',
            menu_today: "Today's Menu",
            menu_add_item: 'Add Item',
            menu_item_name: 'Item Name',
            menu_item_price: 'Selling Price',
            menu_item_cost: 'Cost Price',
            menu_item_category: 'Category',
            menu_category_food: 'Main Dishes',
            menu_category_drinks: 'Beverages',
            menu_category_dessert: 'Desserts',

            // Staff
            staff_title: 'Staff Management',
            staff_add: 'Add Staff',
            staff_name: 'Full Name',
            staff_role: 'Position',
            staff_phone: 'Phone Number',
            staff_shift: 'Work Shift',
            staff_status: 'Status',
            staff_active: 'Active',
            staff_inactive: 'Inactive',
            staff_payroll: 'Payroll',
            staff_attendance: 'Attendance',
            staff_checkin: 'Check-in',
            staff_checkout: 'Check-out',

            // Customers
            customers_title: 'Customer Loyalty',
            customers_add: 'Add Customer',
            customers_points: 'Loyalty Points',
            customers_tier: 'Member Tier',
            customers_total_spent: 'Total Spent',
            customers_visits: 'Visits',
            customers_scan_qr: 'Scan QR for Points',
            customers_send_promo: 'Send Promotion',

            // Kitchen
            kitchen_title: 'Kitchen Display',
            kitchen_pending: 'Pending',
            kitchen_preparing: 'Preparing',
            kitchen_ready: 'Ready',
            kitchen_start: 'Start Preparing',
            kitchen_complete: 'Mark Complete',
            kitchen_no_orders: 'No pending orders',

            // Tables
            tables_title: 'Table Management',
            tables_add: 'Add Table',
            tables_available: 'Available',
            tables_occupied: 'Occupied',
            tables_reserved: 'Reserved',
            tables_cleaning: 'Cleaning',

            // Analytics
            analytics_title: 'Revenue Analytics',
            analytics_revenue: 'Revenue',
            analytics_orders: 'Orders',
            analytics_avg_order: 'Avg Order Value',
            analytics_top_items: 'Top Selling Items',

            // Messages
            msg_success: 'Success!',
            msg_error: 'An error occurred!',
            msg_confirm_delete: 'Are you sure you want to delete?',
            msg_loading: 'Loading...',
            msg_no_data: 'No data available'
        }
    },

    init() {
        const savedLang = localStorage.getItem('fb_language') || 'vi';
        console.log('🌐 i18n initialized, language:', savedLang);
        this.setLanguage(savedLang);
    },

    setLanguage(lang) {
        if (!this.translations[lang]) return;

        this.currentLang = lang;
        localStorage.setItem('fb_language', lang);

        // Update all elements with data-i18n attribute
        document.querySelectorAll('[data-i18n]').forEach(el => {
            const key = el.getAttribute('data-i18n');
            if (this.translations[lang][key]) {
                el.textContent = this.translations[lang][key];
            }
        });

        // Update placeholders
        document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
            const key = el.getAttribute('data-i18n-placeholder');
            if (this.translations[lang][key]) {
                el.placeholder = this.translations[lang][key];
            }
        });

        // Update language toggle button
        const langBtn = document.getElementById('langToggleBtn');
        if (langBtn) {
            langBtn.textContent = lang === 'vi' ? '🌐 EN' : '🌐 VI';
            langBtn.title = lang === 'vi' ? 'Switch to English' : 'Chuyển sang Tiếng Việt';
        }
    },

    toggleLanguage() {
        const newLang = this.currentLang === 'vi' ? 'en' : 'vi';
        this.setLanguage(newLang);
        toast.info(newLang === 'vi' ? '🇻🇳 Đã chuyển sang Tiếng Việt' : '🇬🇧 Switched to English');
    },

    t(key) {
        return this.translations[this.currentLang][key] || key;
    }
};

window.i18n = i18n;
