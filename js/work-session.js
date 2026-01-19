// =====================================================
// WORK SESSION SERVICE
// Quản lý mã làm việc cho Staff/Waiter
// Sử dụng Supabase để đồng bộ giữa các thiết bị
// =====================================================

const WorkSessionService = {
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
    async createSession(adminUser) {
        const code = this.generateCode();
        const expiresAt = new Date(Date.now() + this.CODE_VALIDITY).toISOString();

        try {
            // Try Supabase first
            if (typeof window.getSupabase === 'function') {
                const supabase = await window.getSupabase();
                const { data, error } = await supabase.rpc('create_work_session', {
                    p_code: code,
                    p_created_by: adminUser.name,
                    p_created_by_id: adminUser.id,
                    p_expires_at: expiresAt
                });

                if (!error) {
                    console.log('✅ Work session created in Supabase:', code);
                    return { code, createdBy: adminUser.name, expiresAt };
                }
            }
        } catch (err) {
            console.warn('Failed to create session in Supabase, using demo:', err);
        }

        // Fallback: return demo session
        console.log('📝 Using demo work session');
        return { code: 'DEMO99', createdBy: 'Demo Admin', expiresAt };
    },

    // Lấy session hiện tại
    async getCurrentSession() {
        try {
            if (typeof window.getSupabase === 'function') {
                const supabase = await window.getSupabase();
                const { data, error } = await supabase.rpc('get_active_work_session');

                if (!error && data && data.length > 0) {
                    return {
                        code: data[0].code,
                        createdBy: data[0].created_by,
                        expiresAt: data[0].expires_at
                    };
                }
            }
        } catch (err) {
            console.warn('Failed to get session from Supabase:', err);
        }

        // Fallback: return demo session
        return {
            code: 'DEMO99',
            createdBy: 'Demo Admin',
            expiresAt: new Date(Date.now() + this.CODE_VALIDITY).toISOString()
        };
    },

    // Validate mã
    async validateCode(inputCode) {
        try {
            if (typeof window.getSupabase === 'function') {
                const supabase = await window.getSupabase();
                const { data: isValid, error } = await supabase.rpc('validate_work_code', {
                    p_code: inputCode.toUpperCase()
                });

                if (!error) {
                    if (isValid) {
                        return { valid: true };
                    } else {
                        return { valid: false, error: 'Mã làm việc không đúng hoặc đã hết hạn' };
                    }
                }
            }
        } catch (err) {
            console.warn('Failed to validate code in Supabase, using demo:', err);
        }

        // Fallback: accept demo code
        if (inputCode.toUpperCase() === 'DEMO99') {
            return { valid: true };
        }

        return { valid: false, error: 'Không thể xác thực mã. Vui lòng thử lại.' };
    },

    // Track staff đã dùng mã
    async recordUsage(staffName, staffId) {
        try {
            if (typeof window.getSupabase === 'function') {
                const session = await this.getCurrentSession();
                if (!session || !session.code) return;

                const supabase = await window.getSupabase();
                await supabase.rpc('record_work_code_usage', {
                    p_code: session.code,
                    p_staff_name: staffName,
                    p_staff_id: staffId
                });
            }
        } catch (err) {
            console.warn('Failed to record usage:', err);
        }
    },

    // Reset - tạo mã mới
    async resetSession(adminUser) {
        return await this.createSession(adminUser);
    },

    // Get code để hiển thị
    async getDisplayCode() {
        const session = await this.getCurrentSession();
        if (!session || !session.code) return null;

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

console.log('✅ Work Session Service loaded (Supabase mode)');
