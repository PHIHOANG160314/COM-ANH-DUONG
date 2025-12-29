// ========================================
// F&B MASTER - ROLE-BASED ACCESS CONTROL
// Inspired by AgencyOS Tiered Permissions
// ========================================

const AccessControl = {
    // Staff Role Definitions (like AgencyOS Starter/Pro/Franchise)
    staffRoles: {
        staff: {
            name: 'Nhân viên',
            level: 1,
            permissions: ['pos', 'kitchen', 'orders'],
            maxFeatures: 3
        },
        manager: {
            name: 'Quản lý',
            level: 2,
            permissions: ['pos', 'kitchen', 'orders', 'inventory', 'staff', 'reports'],
            maxFeatures: 10
        },
        admin: {
            name: 'Admin',
            level: 3,
            permissions: ['*'], // All access
            maxFeatures: Infinity
        }
    },

    // Customer Tier Definitions
    customerTiers: {
        bronze: {
            name: 'Bronze',
            icon: '🥉',
            minSpent: 0,
            pointMultiplier: 1,
            benefits: ['Tích điểm cơ bản']
        },
        silver: {
            name: 'Silver',
            icon: '🥈',
            minSpent: 500000,
            pointMultiplier: 1.2,
            benefits: ['Tích điểm 1.2x', 'Ưu tiên đặt bàn']
        },
        gold: {
            name: 'Gold',
            icon: '🥇',
            minSpent: 2000000,
            pointMultiplier: 1.5,
            benefits: ['Tích điểm 1.5x', 'Giảm 5% hóa đơn', 'Phục vụ ưu tiên']
        },
        diamond: {
            name: 'Diamond',
            icon: '💎',
            minSpent: 5000000,
            pointMultiplier: 2,
            benefits: ['Tích điểm 2x', 'Giảm 10% hóa đơn', 'VIP lounge', 'Quà sinh nhật']
        }
    },

    // Current user session
    currentUser: null,

    init() {
        this.loadSession();
        if (window.Debug) Debug.info('AccessControl initialized');
    },

    // ========================================
    // SESSION MANAGEMENT
    // ========================================

    loadSession() {
        const saved = localStorage.getItem('fb_session');
        if (saved) {
            this.currentUser = JSON.parse(saved);
        }
    },

    saveSession() {
        localStorage.setItem('fb_session', JSON.stringify(this.currentUser));
    },

    login(user) {
        this.currentUser = {
            id: user.id,
            name: user.name,
            role: user.role || 'staff',
            loginTime: new Date().toISOString()
        };
        this.saveSession();
        if (window.Debug) Debug.info('User logged in:', user.name, `(${user.role})`);
    },

    logout() {
        this.currentUser = null;
        localStorage.removeItem('fb_session');
    },

    // ========================================
    // PERMISSION CHECKS
    // ========================================

    hasPermission(feature) {
        if (!this.currentUser) return false;

        const role = this.staffRoles[this.currentUser.role];
        if (!role) return false;

        // Admin has all permissions
        if (role.permissions.includes('*')) return true;

        return role.permissions.includes(feature);
    },

    requirePermission(feature) {
        if (!this.hasPermission(feature)) {
            this.showAccessDenied(feature);
            return false;
        }
        return true;
    },

    showAccessDenied(feature) {
        const message = `⛔ Bạn không có quyền truy cập "${feature}"`;
        if (typeof Toast !== 'undefined') {
            Toast.error(message);
        } else {
            alert(message);
        }
    },

    // ========================================
    // CUSTOMER TIER MANAGEMENT
    // ========================================

    getCustomerTier(totalSpent) {
        if (totalSpent >= 5000000) return 'diamond';
        if (totalSpent >= 2000000) return 'gold';
        if (totalSpent >= 500000) return 'silver';
        return 'bronze';
    },

    getTierInfo(tierName) {
        return this.customerTiers[tierName] || this.customerTiers.bronze;
    },

    calculatePoints(amount, tier) {
        const tierInfo = this.getTierInfo(tier);
        const basePoints = Math.floor(amount / 500); // 500đ = 1 điểm
        return Math.floor(basePoints * tierInfo.pointMultiplier);
    },

    getDiscount(tier) {
        const discounts = {
            bronze: 0,
            silver: 0,
            gold: 0.05,    // 5%
            diamond: 0.10  // 10%
        };
        return discounts[tier] || 0;
    },

    // ========================================
    // UI HELPERS
    // ========================================

    renderTierBadge(tier) {
        const info = this.getTierInfo(tier);
        return `<span class="tier-badge tier-${tier}">${info.icon} ${info.name}</span>`;
    },

    renderRoleBadge(role) {
        const info = this.staffRoles[role];
        if (!info) return '';
        const icons = { staff: '👤', manager: '👔', admin: '👑' };
        return `<span class="role-badge role-${role}">${icons[role]} ${info.name}</span>`;
    },

    // Hide/show elements based on permissions
    applyPermissions() {
        document.querySelectorAll('[data-requires-permission]').forEach(el => {
            const permission = el.dataset.requiresPermission;
            el.style.display = this.hasPermission(permission) ? '' : 'none';
        });
    },

    // ========================================
    // STYLES
    // ========================================

    injectStyles() {
        if (document.getElementById('accessControlStyles')) return;

        const style = document.createElement('style');
        style.id = 'accessControlStyles';
        style.textContent = `
            .tier-badge, .role-badge {
                display: inline-flex;
                align-items: center;
                gap: 4px;
                padding: 4px 12px;
                border-radius: 20px;
                font-size: 0.8rem;
                font-weight: 600;
            }
            
            .tier-bronze { background: linear-gradient(135deg, #cd7f32, #8b4513); color: white; }
            .tier-silver { background: linear-gradient(135deg, #c0c0c0, #808080); color: #333; }
            .tier-gold { background: linear-gradient(135deg, #ffd700, #daa520); color: #333; }
            .tier-diamond { background: linear-gradient(135deg, #b9f2ff, #00bfff); color: #333; }
            
            .role-staff { background: rgba(99, 102, 241, 0.2); color: #6366f1; }
            .role-manager { background: rgba(16, 185, 129, 0.2); color: #10b981; }
            .role-admin { background: rgba(239, 68, 68, 0.2); color: #ef4444; }
        `;
        document.head.appendChild(style);
    }
};

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    AccessControl.init();
    AccessControl.injectStyles();
});

window.AccessControl = AccessControl;
