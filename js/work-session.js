// =====================================================
// WORK SESSION SERVICE
// Quản lý mã làm việc cho Staff/Waiter
// =====================================================

const WorkSessionService = {
    SESSION_KEY: 'fb_work_session',
    CODE_LENGTH: 6,
    CODE_VALIDITY: 24 * 60 * 60 * 1000, // 24 hours

    // Tạo mã ngẫu nhiên
    generateCode() {
        const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Bỏ O, 0, 1, I
        let code = '';
        for (let i = 0; i < this.CODE_LENGTH; i++) {
            code += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return code;
    },

    // Tạo session mới (Admin gọi khi login)
    createSession(adminUser) {
        const code = this.generateCode();
        const session = {
            code: code,
            createdBy: adminUser.name,
            createdById: adminUser.id,
            createdAt: Date.now(),
            expiresAt: Date.now() + this.CODE_VALIDITY,
            usedBy: [] // Track who has used this code
        };

        localStorage.setItem(this.SESSION_KEY, JSON.stringify(session));
        console.log('✅ Work session created:', code);
        return session;
    },

    // Lấy session hiện tại
    getCurrentSession() {
        try {
            const data = localStorage.getItem(this.SESSION_KEY);
            if (!data) return null;

            const session = JSON.parse(data);

            // Check expiry
            if (Date.now() > session.expiresAt) {
                this.clearSession();
                return null;
            }

            return session;
        } catch (e) {
            this.clearSession();
            return null;
        }
    },

    // Validate mã
    validateCode(inputCode) {
        const session = this.getCurrentSession();
        if (!session) {
            return { valid: false, error: 'Không có phiên làm việc. Vui lòng liên hệ admin.' };
        }

        if (session.code !== inputCode.toUpperCase()) {
            return { valid: false, error: 'Mã làm việc không đúng' };
        }

        return { valid: true, session };
    },

    // Track staff đã dùng mã
    recordUsage(staffName, staffId) {
        const session = this.getCurrentSession();
        if (!session) return;

        if (!session.usedBy.find(u => u.id === staffId)) {
            session.usedBy.push({
                id: staffId,
                name: staffName,
                loginAt: Date.now()
            });
            localStorage.setItem(this.SESSION_KEY, JSON.stringify(session));
        }
    },

    // Xóa session (Admin logout hoặc reset)
    clearSession() {
        localStorage.removeItem(this.SESSION_KEY);
        console.log('🔄 Work session cleared');
    },

    // Reset - tạo mã mới
    resetSession(adminUser) {
        this.clearSession();
        return this.createSession(adminUser);
    },

    // Get code để hiển thị
    getDisplayCode() {
        const session = this.getCurrentSession();
        if (!session) return null;

        // Format: ABC-DEF
        const code = session.code;
        return code.slice(0, 3) + '-' + code.slice(3);
    },

    // Check if user needs code (not admin)
    requiresCode(role) {
        return role === 'manager' || role === 'waiter' || role === 'chef';
    }
};

// Export
window.WorkSessionService = WorkSessionService;

console.log('✅ Work Session Service loaded');
