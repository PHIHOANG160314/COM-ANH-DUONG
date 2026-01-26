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
                // Demo mode fallback
                return this._demoLogin(name, pin);
            }

            // Use new secure RPC from phase2-security-combined.sql
            const { data, error } = await supabase.rpc('verify_staff_pin_with_claims', {
                p_role: '', // Allow any role, we check later
                p_pin: pin
            });

            if (error) {
                console.warn('Kitchen RPC error, using demo mode:', error.message);
                // Fallback to demo mode if RPC doesn't exist
                return this._demoLogin(name, pin);
            }

            if (!data || data.length === 0) {
                return { success: false, error: 'Mã PIN không đúng' };
            }

            const staff = data[0];

            // Validate Role
            // Kitchen allowed roles: Bếp, chef, admin, Quản lý
            const validRoles = ['Bếp', 'chef', 'admin', 'Quản lý', 'manager'];
            if (!validRoles.includes(staff.role)) {
                return { success: false, error: 'Tài khoản không có quyền truy cập Bếp' };
            }

            // Allow name update if it differs
            const account = {
                id: staff.id,
                name: staff.name,
                role: staff.role
            };

            // Save session
            const session = {
                account: account,
                loginTime: Date.now(),
                expiresAt: Date.now() + this.SESSION_DURATION
            };

            localStorage.setItem(this.SESSION_KEY, JSON.stringify(session));
            return { success: true, account: account };

        } catch (err) {
            console.error('Kitchen login error:', err);
            // Fallback to demo mode
            return this._demoLogin(name, pin);
        }
    },

    // Demo mode login (until SQL is run)
    _demoLogin(name, pin) {
        const demoAccounts = {
            'bếp chính': '1234',
            'bep chinh': '1234',
            'bếp': '1234',
            'bep': '1234',
            'kitchen': '1234',
            'admin': '0000',
            'bếp 1': '1111',
            'bếp 2': '2222'
        };

        const normalizedName = name.toLowerCase().trim();
        if (demoAccounts[normalizedName] === pin) {
            const session = {
                account: { id: 'demo', name: name },
                loginTime: Date.now(),
                expiresAt: Date.now() + this.SESSION_DURATION
            };
            localStorage.setItem(this.SESSION_KEY, JSON.stringify(session));
            return { success: true, account: session.account };
        }

        return { success: false, error: 'Tên hoặc PIN không đúng' };
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
