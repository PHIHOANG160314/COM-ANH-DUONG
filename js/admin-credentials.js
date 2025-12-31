// =====================================================
// ADMIN CREDENTIALS - ÁNH DƯƠNG F&B
// Default staff accounts and PIN codes
// =====================================================

const AdminCredentials = {
    // Default staff accounts
    // NOTE: In production, store in Supabase with hashed PINs
    defaultStaff: [
        {
            id: 'S001',
            name: 'Admin',
            role: 'Quản lý',
            pin: '1234',  // Change in production!
            phone: '0917076061',
            active: true
        },
        {
            id: 'S002',
            name: 'Quản lý 1',
            role: 'Quản lý',
            pin: '2345',
            phone: '',
            active: true
        },
        {
            id: 'S003',
            name: 'Thu ngân 1',
            role: 'Thu ngân',
            pin: '3456',
            phone: '',
            active: true
        },
        {
            id: 'S004',
            name: 'Phục vụ 1',
            role: 'Phục vụ',
            pin: '4567',
            phone: '',
            active: true
        },
        {
            id: 'S005',
            name: 'Bếp trưởng',
            role: 'Bếp',
            pin: '5678',
            phone: '',
            active: true
        }
    ],

    // Initialize staff data if not exists
    init() {
        const existing = localStorage.getItem('fb_staff');
        if (!existing) {
            localStorage.setItem('fb_staff', JSON.stringify(this.defaultStaff));
            console.log('✅ Default admin credentials initialized');
        }
    },

    // Get all staff
    getStaff() {
        const data = localStorage.getItem('fb_staff');
        return data ? JSON.parse(data) : this.defaultStaff;
    },

    // Authenticate by PIN
    authenticateByPin(pin) {
        const staff = this.getStaff();
        return staff.find(s => s.pin === pin && s.active);
    },

    // Add new staff
    addStaff(staffData) {
        const staff = this.getStaff();
        const newStaff = {
            id: 'S' + String(staff.length + 1).padStart(3, '0'),
            ...staffData,
            active: true
        };
        staff.push(newStaff);
        localStorage.setItem('fb_staff', JSON.stringify(staff));
        return newStaff;
    },

    // Update staff
    updateStaff(id, updates) {
        const staff = this.getStaff();
        const index = staff.findIndex(s => s.id === id);
        if (index !== -1) {
            staff[index] = { ...staff[index], ...updates };
            localStorage.setItem('fb_staff', JSON.stringify(staff));
            return staff[index];
        }
        return null;
    },

    // Reset to default (for development/testing)
    resetToDefault() {
        localStorage.setItem('fb_staff', JSON.stringify(this.defaultStaff));
        console.log('✅ Staff credentials reset to default');
    },

    // Change PIN
    changePin(staffId, oldPin, newPin) {
        const staff = this.getStaff();
        const index = staff.findIndex(s => s.id === staffId);

        if (index === -1) {
            return { success: false, error: 'Staff not found' };
        }

        if (staff[index].pin !== oldPin) {
            return { success: false, error: 'Incorrect old PIN' };
        }

        if (newPin.length !== 4 || !/^\d+$/.test(newPin)) {
            return { success: false, error: 'PIN must be 4 digits' };
        }

        staff[index].pin = newPin;
        localStorage.setItem('fb_staff', JSON.stringify(staff));
        return { success: true };
    }
};

// Initialize on load
AdminCredentials.init();

// Export
window.AdminCredentials = AdminCredentials;

console.log('✅ Admin Credentials module loaded');
