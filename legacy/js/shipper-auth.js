// =====================================================
// SHIPPER AUTHENTICATION SERVICE
// PIN login, device lock, working hours (6-18h)
// =====================================================

const ShipperAuth = {
    SESSION_KEY: 'ad_shipper_session',
    DEVICE_KEY: 'ad_shipper_device',

    // Generate unique device fingerprint
    getDeviceId() {
        let deviceId = localStorage.getItem(this.DEVICE_KEY);
        if (!deviceId) {
            deviceId = 'device_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
            localStorage.setItem(this.DEVICE_KEY, deviceId);
        }
        return deviceId;
    },

    // Check if within working hours (6AM-6PM Vietnam time)
    isWorkingHours() {
        const now = new Date();
        const vietnamOffset = 7 * 60; // GMT+7
        const localOffset = now.getTimezoneOffset();
        const vietnamTime = new Date(now.getTime() + (vietnamOffset + localOffset) * 60 * 1000);
        const hour = vietnamTime.getHours();
        return hour >= 6 && hour < 18;
    },

    // Login with phone + PIN
    async login(phone, pin) {
        // Validate inputs
        if (!phone || phone.length !== 10) {
            return { success: false, error: 'Số điện thoại phải có 10 chữ số' };
        }
        if (!pin || pin.length !== 4) {
            return { success: false, error: 'Mã PIN phải có 4 chữ số' };
        }

        try {
            const supabase = await getSupabase();
            const deviceId = this.getDeviceId();

            // Call RPC function to verify PIN
            const { data, error } = await supabase.rpc('verify_shipper_pin', {
                p_phone: phone,
                p_pin: pin,
                p_device_id: deviceId
            });

            if (error) {
                console.error('Login error:', error);
                return { success: false, error: 'Lỗi kết nối. Vui lòng thử lại.' };
            }

            // Check result
            if (!data || data.length === 0) {
                return { success: false, error: 'Số điện thoại hoặc mã PIN không đúng' };
            }

            const result = data[0];

            if (!result.success) {
                return { success: false, error: result.error_message || 'Đăng nhập thất bại' };
            }

            // Success - save session
            const session = {
                shipper_id: result.shipper_id,
                name: result.shipper_name,
                phone: result.shipper_phone,
                status: result.shipper_status,
                rating: result.shipper_rating,
                total_deliveries: result.total_deliveries,
                device_id: deviceId,
                login_at: new Date().toISOString()
            };

            localStorage.setItem(this.SESSION_KEY, JSON.stringify(session));

            return { success: true, shipper: session };

        } catch (err) {
            console.error('Login exception:', err);
            return { success: false, error: 'Lỗi hệ thống. Vui lòng thử lại.' };
        }
    },

    // Get current session
    getSession() {
        try {
            const data = localStorage.getItem(this.SESSION_KEY);
            if (!data) return null;

            const session = JSON.parse(data);

            // Verify device match
            if (session.device_id !== this.getDeviceId()) {
                this.logout();
                return null;
            }

            // Check session age (12 hours max)
            const loginTime = new Date(session.login_at);
            const now = new Date();
            const hoursDiff = (now - loginTime) / (1000 * 60 * 60);

            if (hoursDiff > 12) {
                this.logout();
                return null;
            }

            return session;
        } catch (err) {
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
    },

    // Update shipper status (online/offline)
    async updateStatus(status) {
        const session = this.getSession();
        if (!session) return false;

        try {
            const supabase = await getSupabase();
            const { error } = await supabase
                .from('shippers')
                .update({ status: status })
                .eq('id', session.shipper_id);

            if (!error) {
                session.status = status;
                localStorage.setItem(this.SESSION_KEY, JSON.stringify(session));
                return true;
            }
        } catch (err) {
            console.error('Status update error:', err);
        }
        return false;
    }
};

window.ShipperAuth = ShipperAuth;
