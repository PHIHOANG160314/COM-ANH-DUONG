// ========================================
// F&B MASTER - UTILITIES
// ========================================

// Format currency
function formatCurrency(amount) {
    return amount.toLocaleString('vi-VN') + 'đ';
}

// Format number
function formatNumber(num) {
    return num.toLocaleString('vi-VN');
}

// Get current date formatted
function getCurrentDate() {
    const now = new Date();
    const options = {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    };
    return now.toLocaleDateString('vi-VN', options);
}

// Get current time
function getCurrentTime() {
    const now = new Date();
    return now.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
}

// Generate unique ID
function generateId(prefix = 'ID') {
    return prefix + Date.now().toString(36).toUpperCase();
}

// Local Storage helpers
const storage = {
    get(key) {
        try {
            const data = localStorage.getItem(key);
            return data ? JSON.parse(data) : null;
        } catch (e) {
            console.error('Error reading from localStorage:', e);
            return null;
        }
    },

    set(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
            return true;
        } catch (e) {
            console.error('Error writing to localStorage:', e);
            return false;
        }
    },

    remove(key) {
        try {
            localStorage.removeItem(key);
            return true;
        } catch (e) {
            return false;
        }
    }
};

// Toast notification system
const toast = {
    container: null,

    init() {
        this.container = document.getElementById('toastContainer');
    },

    show(message, type = 'info', duration = 3000) {
        if (!this.container) this.init();

        const icons = {
            success: '✅',
            error: '❌',
            warning: '⚠️',
            info: 'ℹ️'
        };

        const toastEl = document.createElement('div');
        toastEl.className = `toast ${type}`;
        toastEl.innerHTML = `
            <span class="toast-icon">${icons[type]}</span>
            <span class="toast-message">${message}</span>
            <button class="toast-close" onclick="this.parentElement.remove()">×</button>
        `;

        this.container.appendChild(toastEl);

        setTimeout(() => {
            toastEl.style.animation = 'toastSlideIn 0.3s ease reverse';
            setTimeout(() => toastEl.remove(), 300);
        }, duration);
    },

    success(message) { this.show(message, 'success'); },
    error(message) { this.show(message, 'error'); },
    warning(message) { this.show(message, 'warning'); },
    info(message) { this.show(message, 'info'); }
};

// Modal system
const modal = {
    overlay: null,
    modalEl: null,

    init() {
        this.overlay = document.getElementById('modalOverlay');
        this.modalEl = document.getElementById('modal');

        document.getElementById('modalClose').addEventListener('click', () => this.close());
        this.overlay.addEventListener('click', (e) => {
            if (e.target === this.overlay) this.close();
        });
    },

    open(title, content, footer = '') {
        if (!this.overlay) this.init();

        document.getElementById('modalTitle').textContent = title;
        document.getElementById('modalBody').innerHTML = content;
        document.getElementById('modalFooter').innerHTML = footer;

        this.overlay.classList.add('active');
        document.body.style.overflow = 'hidden';
    },

    close() {
        this.overlay.classList.remove('active');
        document.body.style.overflow = '';
    }
};

// Calculate food cost percentage
function calculateFoodCost(cost, sellingPrice) {
    if (sellingPrice === 0) return 0;
    return ((cost / sellingPrice) * 100).toFixed(1);
}

// Calculate suggested price based on target food cost
function calculateSuggestedPrice(cost, targetFoodCost) {
    if (targetFoodCost === 0) return 0;
    return Math.ceil((cost / (targetFoodCost / 100)) / 1000) * 1000;
}

// Get inventory status
function getInventoryStatus(stock, minStock) {
    if (stock <= minStock * 0.5) return 'low';
    if (stock <= minStock) return 'warning';
    if (stock > minStock * 2) return 'excess';
    return 'ok';
}

// Get status badge HTML
function getStatusBadge(status, text) {
    return `<span class="status-badge ${status}">${text}</span>`;
}

// Debounce function
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Export for use
window.utils = {
    formatCurrency,
    formatNumber,
    getCurrentDate,
    getCurrentTime,
    generateId,
    storage,
    toast,
    modal,
    calculateFoodCost,
    calculateSuggestedPrice,
    getInventoryStatus,
    getStatusBadge,
    debounce
};
