// ========================================
// F&B MASTER - MAIN APP
// ========================================

document.addEventListener('DOMContentLoaded', function () {
    App.init();
});

const App = {
    currentPage: 'dashboard',

    init() {
        this.setupNavigation();
        this.updateDate();
        this.initModules();

        // Initialize modal
        modal.init();
        toast.init();

        console.log('🍽️ F&B Master initialized successfully!');
    },

    setupNavigation() {
        document.querySelectorAll('.nav-item, .view-all').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const page = e.currentTarget.dataset.page;
                if (page) this.navigateTo(page);
            });
        });

        // Mobile bottom navigation
        document.querySelectorAll('.mobile-nav-item').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const page = e.currentTarget.dataset.page;
                if (page) this.navigateTo(page);
            });
        });

        // Sidebar toggle for mobile
        const sidebarToggle = document.getElementById('sidebarToggle');
        const sidebar = document.getElementById('sidebar');
        const sidebarOverlay = document.getElementById('sidebarOverlay');

        if (sidebarToggle) {
            sidebarToggle.addEventListener('click', () => {
                sidebar.classList.toggle('active');
                sidebarOverlay.classList.toggle('active');
            });
        }

        // Close sidebar when clicking overlay
        if (sidebarOverlay) {
            sidebarOverlay.addEventListener('click', () => {
                sidebar.classList.remove('active');
                sidebarOverlay.classList.remove('active');
            });
        }

        // Mobile POS cart expand/collapse
        this.setupMobileCart();
    },

    setupMobileCart() {
        const cartHeader = document.querySelector('.cart-header');
        const posCart = document.querySelector('.pos-cart');

        if (cartHeader && posCart) {
            cartHeader.addEventListener('click', () => {
                if (window.innerWidth <= 768) {
                    posCart.classList.toggle('expanded');
                }
            });
        }
    },

    navigateTo(page) {
        // Update sidebar nav items
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.remove('active');
            if (item.dataset.page === page) {
                item.classList.add('active');
            }
        });

        // Update mobile nav items
        document.querySelectorAll('.mobile-nav-item').forEach(item => {
            item.classList.remove('active');
            if (item.dataset.page === page) {
                item.classList.add('active');
            }
        });

        // Update pages
        document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
        const pageEl = document.getElementById(`page-${page}`);
        if (pageEl) {
            pageEl.classList.add('active');
        }

        // Update title
        const titles = {
            dashboard: 'Dashboard',
            pos: 'POS - Đơn hàng',
            foodcost: 'Tính Giá Thành',
            inventory: 'Quản Lý Kho',
            recipes: 'Công Thức',
            menu: 'Menu',
            orders: 'Quản Lý Đơn Hàng',
            tables: 'Quản Lý Bàn',
            kitchen: 'Màn Hình Bếp',
            staff: 'Quản Lý Nhân Viên',
            customers: 'Khách Hàng Thân Thiết',
            sops: 'SOPs - Quy Trình'
        };
        document.getElementById('pageTitle').textContent = titles[page] || page;

        this.currentPage = page;

        // Close sidebar on mobile
        document.getElementById('sidebar').classList.remove('active');
    },

    updateDate() {
        document.getElementById('currentDate').textContent = getCurrentDate();
    },

    initModules() {
        // Initialize all modules
        Dashboard.init();
        POS.init();
        FoodCost.init();
        Inventory.init();
        Recipes.init();
        MenuManagement.init();
        OrderManagement.init();
        SOPs.init();
        Analytics.init();
        TableManagement.init();
        KitchenDisplay.init();
        StaffManagement.init();
        CustomerLoyalty.init();
        if (window.i18n) i18n.init();
        this.setupThemeToggle();
    },

    setupThemeToggle() {
        const toggleBtn = document.getElementById('themeToggleBtn');
        const themeIcon = document.getElementById('themeIcon');
        const savedTheme = localStorage.getItem('fb_theme') || 'dark';

        // Apply saved theme
        document.body.classList.toggle('light-mode', savedTheme === 'light');
        themeIcon.textContent = savedTheme === 'light' ? '☀️' : '🌙';

        if (toggleBtn) {
            toggleBtn.addEventListener('click', () => {
                document.body.classList.toggle('light-mode');
                const isLight = document.body.classList.contains('light-mode');
                themeIcon.textContent = isLight ? '☀️' : '🌙';
                localStorage.setItem('fb_theme', isLight ? 'light' : 'dark');
                toast.info(isLight ? '🌞 Chế độ sáng' : '🌙 Chế độ tối');
            });
        }
    }
};

window.App = App;
