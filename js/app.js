// ========================================
// F&B MASTER - MAIN APP
// ========================================

const PAGE_TITLES = {
    dashboard: 'Tổng quan',
    pos: 'Bán hàng',
    foodcost: 'Tính Giá Thành',
    inventory: 'Quản Lý Kho',
    recipes: 'Công Thức',
    menu: 'Menu',
    orders: 'Quản Lý Đơn Hàng',
    tables: 'Quản Lý Bàn',
    kitchen: 'Màn Hình Bếp',
    staff: 'Quản Lý Nhân Viên',
    customers: 'Khách Hàng Thân Thiết',
    sops: 'SOPs - Quy Trình',
    articles: 'Quản Lý Bài Viết',
    shippers: 'Quản Lý Shipper'
};

const THEME_STORAGE_KEY = 'fb_theme';

document.addEventListener('DOMContentLoaded', () => {
    App.init();
});

const App = {
    currentPage: 'pos',

    // Cache DOM elements that are accessed frequently
    elements: {},

    init() {
        this.cacheElements();
        this.setupNavigation();
        this.updateDate();
        this.initModules();

        // Initialize global components
        if (window.utils && window.utils.modal) window.utils.modal.init();
        if (window.utils && window.utils.toast) window.utils.toast.init();

        console.log('🍽️ F&B Master initialized successfully!');
    },

    cacheElements() {
        this.elements = {
            pageTitle: document.getElementById('pageTitle'),
            sidebar: document.getElementById('sidebar'),
            sidebarOverlay: document.getElementById('sidebarOverlay'),
            sidebarToggle: document.getElementById('sidebarToggle'),
            currentDate: document.getElementById('currentDate'),
            themeToggleBtn: document.getElementById('themeToggleBtn'),
            themeIcon: document.getElementById('themeIcon'),
            body: document.body
        };
    },

    setupNavigation() {
        // Main navigation links
        document.querySelectorAll('.nav-item, .view-all, .mobile-nav-item').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const page = e.currentTarget.dataset.page;
                if (page) this.navigateTo(page);
            });
        });

        // Sidebar interactions
        if (this.elements.sidebarToggle) {
            this.elements.sidebarToggle.addEventListener('click', () => this.toggleSidebar());
        }

        if (this.elements.sidebarOverlay) {
            this.elements.sidebarOverlay.addEventListener('click', () => this.closeSidebar());
        }

        this.setupMobileCart();
    },

    toggleSidebar() {
        this.elements.sidebar.classList.toggle('active');
        this.elements.sidebarOverlay.classList.toggle('active');
    },

    closeSidebar() {
        this.elements.sidebar.classList.remove('active');
        this.elements.sidebarOverlay.classList.remove('active');
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
        // Update active states for navigation items
        const updateActiveState = (selector) => {
            document.querySelectorAll(selector).forEach(item => {
                item.classList.toggle('active', item.dataset.page === page);
            });
        };

        updateActiveState('.nav-item');
        updateActiveState('.mobile-nav-item');

        // Switch page views
        document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
        const targetPage = document.getElementById(`page-${page}`);
        if (targetPage) {
            targetPage.classList.add('active');
        }

        // Update page title
        if (this.elements.pageTitle) {
            this.elements.pageTitle.textContent = PAGE_TITLES[page] || page;
        }

        this.currentPage = page;
        this.closeSidebar();
    },

    updateDate() {
        if (this.elements.currentDate) {
            this.elements.currentDate.textContent = window.utils ? window.utils.getCurrentDate() : new Date().toLocaleDateString('vi-VN');
        }
    },

    initModules() {
        // List of modules to initialize
        const modules = [
            'Dashboard', 'POS', 'FoodCost', 'Inventory', 'Recipes',
            'MenuManagement', 'OrderManagement', 'SOPs', 'Analytics',
            'TableManagement', 'KitchenDisplay', 'StaffManagement',
            'CustomerLoyalty', 'ArticlesManager', 'ShipperManager', 'i18n'
        ];

        modules.forEach(moduleName => {
            const module = window[moduleName];
            if (module && typeof module.init === 'function') {
                module.init();
            }
        });

        this.setupThemeToggle();
    },

    setupThemeToggle() {
        const { themeToggleBtn, themeIcon, body } = this.elements;
        const savedTheme = localStorage.getItem(THEME_STORAGE_KEY) || 'dark';

        const applyTheme = (isLight) => {
            body.classList.toggle('light-mode', isLight);
            if (themeIcon) themeIcon.textContent = isLight ? '☀️' : '🌙';
            localStorage.setItem(THEME_STORAGE_KEY, isLight ? 'light' : 'dark');
        };

        // Initial application
        applyTheme(savedTheme === 'light');

        if (themeToggleBtn) {
            themeToggleBtn.addEventListener('click', () => {
                const isLight = !body.classList.contains('light-mode');
                applyTheme(isLight);
                if (window.toast) {
                    toast.info(isLight ? '🌞 Chế độ sáng' : '🌙 Chế độ tối');
                }
            });
        }
    }
};

window.App = App;
