// =====================================================
// ADMIN CREDENTIALS - ÁNH DƯƠNG F&B
// Staff session management (no plaintext credentials)
// =====================================================

const AdminCredentials = {
    // NOTE: Staff credentials are stored in Supabase with hashed PINs
    // This module only manages local session fallback

    // Staff structure template (loaded from Supabase, not hardcoded)
    _staffTemplate: {
        id: '',
        name: '',
        role: '',
        phone: '',
        active: true
    },

    // Version for cache invalidation
    STAFF_VERSION: 'v3.0-secure',

    // Initialize - no longer stores default credentials
    init() {
        const version = localStorage.getItem('fb_staff_version');

        // Clear old insecure credentials if version mismatch
        if (version && version !== this.STAFF_VERSION) {
            console.warn('⚠️ Old credentials cleared for security upgrade');
            localStorage.removeItem('fb_staff');
            localStorage.setItem('fb_staff_version', this.STAFF_VERSION);
        }

        console.log('✅ Admin Credentials v3.0 (Secure Mode)');
    },

    // Get staff from localStorage cache (synced from Supabase)
    getStaff() {
        const data = localStorage.getItem('fb_staff');
        if (data) {
            try {
                return JSON.parse(data);
            } catch {
                return [];
            }
        }
        return [];
    },

    // Authenticate by PIN - MUST use Supabase (no local plaintext check)
    // Returns null - authentication should go through AuthService → Supabase
    authenticateByPin(pin) {
        console.warn('⚠️ Local PIN authentication disabled for security');
        console.info('💡 Use AuthService.login() with Supabase backend');
        return null;
    },

    // Cache staff from Supabase (without PIN - never store PINs locally)
    cacheStaffFromSupabase(staffList) {
        // Remove sensitive fields before caching
        const safeStaff = staffList.map(s => ({
            id: s.id,
            name: s.name,
            role: s.role,
            phone: s.phone || '',
            active: s.is_active !== false
        }));
        localStorage.setItem('fb_staff', JSON.stringify(safeStaff));
        localStorage.setItem('fb_staff_version', this.STAFF_VERSION);
        console.log('✅ Staff list cached (without credentials)');
    },

    // Add new staff - via Supabase only
    async addStaff(staffData, pin) {
        if (typeof SupabaseService === 'undefined') {
            return { success: false, error: 'Supabase chưa được cấu hình' };
        }

        try {
            const supabase = await window.getSupabase();
            const { data, error } = await supabase
                .from('staff')
                .insert({
                    name: staffData.name,
                    role: staffData.role,
                    pin: pin, // Will be hashed by database trigger
                    phone: staffData.phone || '',
                    is_active: true
                })
                .select()
                .single();

            if (error) throw error;
            return { success: true, staff: data };
        } catch (err) {
            console.error('Failed to add staff:', err);
            return { success: false, error: err.message };
        }
    },

    // Update staff - via Supabase only
    async updateStaff(id, updates) {
        if (typeof SupabaseService === 'undefined') {
            return { success: false, error: 'Supabase chưa được cấu hình' };
        }

        try {
            const supabase = await window.getSupabase();
            const { data, error } = await supabase
                .from('staff')
                .update(updates)
                .eq('id', id)
                .select()
                .single();

            if (error) throw error;
            return { success: true, staff: data };
        } catch (err) {
            console.error('Failed to update staff:', err);
            return { success: false, error: err.message };
        }
    },

    // Change PIN - via Supabase RPC function
    async changePin(staffId, oldPin, newPin) {
        if (typeof SupabaseService === 'undefined') {
            return { success: false, error: 'Supabase chưa được cấu hình' };
        }

        // Validate new PIN format
        if (newPin.length !== 4 || !/^\d+$/.test(newPin)) {
            return { success: false, error: 'Mã PIN phải là 4 chữ số' };
        }

        try {
            const supabase = await window.getSupabase();
            const { data, error } = await supabase.rpc('change_staff_pin', {
                p_staff_id: staffId,
                p_old_pin: oldPin,
                p_new_pin: newPin
            });

            if (error) throw error;
            if (!data || !data.success) {
                return { success: false, error: data?.error || 'PIN cũ không đúng' };
            }
            return { success: true };
        } catch (err) {
            console.error('Failed to change PIN:', err);
            return { success: false, error: err.message };
        }
    },

    // Sync staff list from Supabase
    async syncFromSupabase() {
        if (typeof SupabaseService === 'undefined') {
            console.warn('⚠️ Supabase not available for sync');
            return false;
        }

        try {
            const supabase = await window.getSupabase();
            const { data, error } = await supabase
                .from('staff')
                .select('id, name, role, phone, is_active')
                .eq('is_active', true);

            if (error) throw error;
            this.cacheStaffFromSupabase(data || []);
            return true;
        } catch (err) {
            console.error('Failed to sync staff:', err);
            return false;
        }
    }
};

// Initialize on load
AdminCredentials.init();

// Export
window.AdminCredentials = AdminCredentials;

console.log('✅ Admin Credentials module loaded (Secure Mode)');

