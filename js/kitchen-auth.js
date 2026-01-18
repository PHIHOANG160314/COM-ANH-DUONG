// =====================================================
// KITCHEN AUTH SERVICE
// PIN-based authentication for kitchen staff
// =====================================================

const KitchenAuth = {
    SESSION_KEY: 'ad_kitchen_session',
    SESSION_DURATION: 12 * 60 * 60 * 1000, // 12 hours

    // Login with name + PIN
    async login(name, pin) {
        if (!name || !pin) {
            return { success: false, error: 'Vui lòng nhập đầy đủ thông tin' };
        }

        if (pin.length !== 4 || !/^\d{4}$/.test(pin)) {
            return { success: false, error: 'Mã PIN phải là 4 chữ số' };
        }

        try {
            const supabase = await getSupabase();
            if (!supabase) {
                return { success: false, error: 'Không thể kết nối database' };
            }

            const { data, error } = await supabase.rpc('verify_kitchen_pin', {
                p_name: name,
                p_pin: pin
            });

            if (error) {
                console.error('Kitchen login RPC error:', error);
                return { success: false, error: 'Lỗi xác thực' };
            }

            if (!data.success) {
                return { success: false, error: data.error || 'Đăng nhập thất bại' };
            }

            // Save session
            const session = {
                account: data.account,
                loginTime: Date.now(),
                expiresAt: Date.now() + this.SESSION_DURATION
            };

            localStorage.setItem(this.SESSION_KEY, JSON.stringify(session));
            return { success: true, account: data.account };

        } catch (err) {
            console.error('Kitchen login error:', err);
            return { success: false, error: 'Lỗi kết nối' };
        }
    },

    // Get current session
    getSession() {
        try {
            const sessionStr = localStorage.getItem(this.SESSION_KEY);
            if (!sessionStr) return null;

            const session = JSON.parse(sessionStr);

            // Check expiry
            if (Date.now() > session.expiresAt) {
                this.logout();
                return null;
            }

            return session.account;
        } catch (e) {
            this.logout();
            return null;
        }
    },

    // Check if authenticated
    isAuthenticated() {
        return this.getSession() !== null;
    },

    // Logout
    logout() {
        localStorage.removeItem(this.SESSION_KEY);
    }
};

window.KitchenAuth = KitchenAuth;
