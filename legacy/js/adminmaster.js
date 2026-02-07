/**
 * ========================================
 * ADMIN MASTER - COMMAND CENTER
 * Super Admin Dashboard for COM Ánh Dương
 * ========================================
 */

// Super Admin Credentials (hardcoded for demo - in production use Supabase Auth)
const SUPER_ADMIN = {
    email: 'anhduongfood01@gmail.com',
    password: 'ad123%&Ad'
};

// State
let isAuthenticated = false;
let currentPanel = 'overview';

// DOM Elements
const loginScreen = document.getElementById('loginScreen');
const mainApp = document.getElementById('mainApp');
const loginForm = document.getElementById('loginForm');
const loginError = document.getElementById('loginError');

/**
 * Initialize Admin Master
 */
function init() {
    // Check if already logged in
    const session = localStorage.getItem('adminmaster_session');
    if (session) {
        try {
            const data = JSON.parse(session);
            if (data.email === SUPER_ADMIN.email && data.expires > Date.now()) {
                showMainApp();
                return;
            }
        } catch (e) {
            localStorage.removeItem('adminmaster_session');
        }
    }

    // Show login screen
    showLoginScreen();
}

/**
 * Show Login Screen
 */
function showLoginScreen() {
    loginScreen.style.display = 'flex';
    mainApp.style.display = 'none';
    isAuthenticated = false;
}

/**
 * Show Main App
 */
function showMainApp() {
    loginScreen.style.display = 'none';
    mainApp.style.display = 'flex';
    isAuthenticated = true;

    // Initialize app
    initNavigation();
    initTools();
    initClock();
    loadKPIs();
}

/**
 * Handle Login
 */
function handleLogin(e) {
    e.preventDefault();

    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;

    // Show loading
    const btnText = document.querySelector('.btn-text');
    const btnLoading = document.querySelector('.btn-loading');
    btnText.style.display = 'none';
    btnLoading.style.display = 'inline';

    // Simulate auth delay
    setTimeout(() => {
        if (email === SUPER_ADMIN.email && password === SUPER_ADMIN.password) {
            // Save session (expires in 24 hours)
            const session = {
                email: email,
                expires: Date.now() + (24 * 60 * 60 * 1000)
            };
            localStorage.setItem('adminmaster_session', JSON.stringify(session));

            // Show main app
            showMainApp();
        } else {
            // Show error
            loginError.textContent = 'Email hoặc mật khẩu không đúng!';
            loginError.style.display = 'block';

            // Reset button
            btnText.style.display = 'inline';
            btnLoading.style.display = 'none';
        }
    }, 800);
}

/**
 * Handle Logout
 */
function handleLogout() {
    localStorage.removeItem('adminmaster_session');
    showLoginScreen();
    loginForm.reset();
    loginError.style.display = 'none';
}

/**
 * Initialize Navigation
 */
function initNavigation() {
    const navTabs = document.querySelectorAll('.nav-tab');
    const panels = document.querySelectorAll('.panel');

    navTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const panelId = tab.dataset.panel;

            // Update active tab
            navTabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');

            // Show panel
            panels.forEach(p => p.classList.remove('active'));
            document.getElementById(`panel-${panelId}`).classList.add('active');

            currentPanel = panelId;
        });
    });
}

/**
 * Initialize Tools
 */
function initTools() {
    // Clear Cache
    document.getElementById('clearCacheBtn')?.addEventListener('click', () => {
        if (confirm('Xác nhận xóa tất cả cache?')) {
            localStorage.clear();
            sessionStorage.clear();

            // Restore session
            handleLogin({ preventDefault: () => { } });

            alert('✅ Đã xóa cache thành công! Trang sẽ tải lại.');
            location.reload();
        }
    });

    // View Logs
    document.getElementById('viewLogsBtn')?.addEventListener('click', () => {
        const logsViewer = document.getElementById('logsViewer');
        const logsContent = document.getElementById('logsContent');

        logsViewer.style.display = 'block';

        // Generate sample logs
        const logs = generateSampleLogs();
        logsContent.innerHTML = `<pre>${logs}</pre>`;
    });

    // Close Logs
    document.getElementById('closeLogsBtn')?.addEventListener('click', () => {
        document.getElementById('logsViewer').style.display = 'none';
    });

    // Sync Data
    document.getElementById('syncDataBtn')?.addEventListener('click', () => {
        alert('🔄 Đang đồng bộ dữ liệu với Supabase...\n\nChức năng này sẽ được cập nhật sau.');
    });

    // Backup
    document.getElementById('backupBtn')?.addEventListener('click', () => {
        const data = {
            timestamp: new Date().toISOString(),
            localStorage: { ...localStorage },
            version: '1.0'
        };

        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `backup-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);

        alert('✅ Đã tạo file backup thành công!');
    });

    // Settings
    document.getElementById('settingsBtn')?.addEventListener('click', () => {
        alert('⚙️ Cài đặt hệ thống\n\nChức năng này sẽ được cập nhật sau.');
    });

    // Logout
    document.getElementById('logoutBtn')?.addEventListener('click', handleLogout);
}

/**
 * Initialize Clock
 */
function initClock() {
    const updateClock = () => {
        const now = new Date();
        const time = now.toLocaleTimeString('vi-VN', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
        const date = now.toLocaleDateString('vi-VN', {
            weekday: 'short',
            day: '2-digit',
            month: '2-digit'
        });
        document.getElementById('currentTime').textContent = `${date} ${time}`;
    };

    updateClock();
    setInterval(updateClock, 1000);
}

/**
 * Load KPIs
 */
async function loadKPIs() {
    // Try to get real data from Supabase
    try {
        // For now, use sample data
        const kpis = {
            revenue: formatCurrency(Math.floor(Math.random() * 10000000) + 5000000),
            orders: Math.floor(Math.random() * 50) + 20,
            staff: Math.floor(Math.random() * 8) + 2,
            kitchen: Math.floor(Math.random() * 15) + 5
        };

        document.getElementById('kpiRevenue').textContent = kpis.revenue;
        document.getElementById('kpiOrders').textContent = kpis.orders;
        document.getElementById('kpiStaff').textContent = kpis.staff;
        document.getElementById('kpiKitchen').textContent = kpis.kitchen;
    } catch (error) {
        console.error('Error loading KPIs:', error);
    }
}

/**
 * Format Currency
 */
function formatCurrency(amount) {
    return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND',
        maximumFractionDigits: 0
    }).format(amount);
}

/**
 * Generate Sample Logs
 */
function generateSampleLogs() {
    const now = new Date();
    const logs = [];

    for (let i = 0; i < 20; i++) {
        const time = new Date(now - i * 60000 * Math.random() * 5);
        const types = ['INFO', 'DEBUG', 'WARN', 'ERROR'];
        const type = types[Math.floor(Math.random() * types.length)];
        const messages = [
            'User logged in successfully',
            'Order #ORD-001 created',
            'Kitchen display updated',
            'Cache cleared',
            'Database sync completed',
            'New customer registered',
            'Payment received',
            'Menu item updated'
        ];
        const message = messages[Math.floor(Math.random() * messages.length)];

        logs.push(`[${time.toISOString()}] [${type}] ${message}`);
    }

    return logs.join('\n');
}

/**
 * Event Listeners
 */
loginForm.addEventListener('submit', handleLogin);

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', init);
