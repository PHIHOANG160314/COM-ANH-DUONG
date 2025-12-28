// =====================================================
// SUPABASE CLIENT - ÁNH DƯƠNG F&B
// =====================================================

// Config - Load from environment or use defaults
const SUPABASE_CONFIG = {
    url: window.ENV?.SUPABASE_URL || 'YOUR_SUPABASE_URL',
    anonKey: window.ENV?.SUPABASE_ANON_KEY || 'YOUR_SUPABASE_ANON_KEY'
};

// Check if Supabase is available
const isSupabaseConfigured = () => {
    return SUPABASE_CONFIG.url !== 'YOUR_SUPABASE_URL' &&
        SUPABASE_CONFIG.anonKey !== 'YOUR_SUPABASE_ANON_KEY';
};

// Initialize Supabase client (lazy load)
let supabaseClient = null;

const getSupabase = async () => {
    if (supabaseClient) return supabaseClient;

    if (!isSupabaseConfigured()) {
        console.warn('Supabase not configured. Using local data.');
        return null;
    }

    // Dynamic import of Supabase
    const { createClient } = await import('https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm');
    supabaseClient = createClient(SUPABASE_CONFIG.url, SUPABASE_CONFIG.anonKey);
    return supabaseClient;
};

// =====================================================
// DATA SERVICE
// =====================================================

const SupabaseService = {

    // ==================== MENU ====================

    async getMenuItems() {
        const supabase = await getSupabase();
        if (!supabase) return { data: null, error: 'Not configured' };

        const { data, error } = await supabase
            .from('menu_items')
            .select('*')
            .eq('is_available', true)
            .order('id');

        return { data, error };
    },

    async getCategories() {
        const supabase = await getSupabase();
        if (!supabase) return { data: null, error: 'Not configured' };

        const { data, error } = await supabase
            .from('categories')
            .select('*')
            .eq('is_active', true)
            .order('order');

        return { data, error };
    },

    async getCombos() {
        const supabase = await getSupabase();
        if (!supabase) return { data: null, error: 'Not configured' };

        const { data, error } = await supabase
            .from('combos')
            .select('*')
            .eq('is_active', true);

        return { data, error };
    },

    // ==================== ORDERS ====================

    async createOrder(orderData) {
        const supabase = await getSupabase();
        if (!supabase) return { data: null, error: 'Not configured' };

        const { data, error } = await supabase
            .from('orders')
            .insert(orderData)
            .select()
            .single();

        return { data, error };
    },

    async getOrders(status = null) {
        const supabase = await getSupabase();
        if (!supabase) return { data: null, error: 'Not configured' };

        let query = supabase
            .from('orders')
            .select('*')
            .order('created_at', { ascending: false });

        if (status) {
            query = query.eq('status', status);
        }

        const { data, error } = await query;
        return { data, error };
    },

    async updateOrderStatus(orderId, status) {
        const supabase = await getSupabase();
        if (!supabase) return { data: null, error: 'Not configured' };

        const { data, error } = await supabase
            .from('orders')
            .update({ status })
            .eq('id', orderId)
            .select()
            .single();

        return { data, error };
    },

    // ==================== CUSTOMERS ====================

    async getCustomerByPhone(phone) {
        const supabase = await getSupabase();
        if (!supabase) return { data: null, error: 'Not configured' };

        const { data, error } = await supabase
            .from('customers')
            .select('*')
            .eq('phone', phone)
            .single();

        return { data, error };
    },

    async upsertCustomer(customerData) {
        const supabase = await getSupabase();
        if (!supabase) return { data: null, error: 'Not configured' };

        const { data, error } = await supabase
            .from('customers')
            .upsert(customerData, { onConflict: 'phone' })
            .select()
            .single();

        return { data, error };
    },

    // ==================== REALTIME ====================

    subscribeToOrders(callback) {
        getSupabase().then(supabase => {
            if (!supabase) return null;

            return supabase
                .channel('orders-channel')
                .on('postgres_changes',
                    { event: '*', schema: 'public', table: 'orders' },
                    (payload) => callback(payload)
                )
                .subscribe();
        });
    },

    // ==================== ANALYTICS ====================

    async getTodayStats() {
        const supabase = await getSupabase();
        if (!supabase) return { data: null, error: 'Not configured' };

        const today = new Date().toISOString().split('T')[0];

        const { data, error } = await supabase
            .from('orders')
            .select('total, status')
            .gte('created_at', today);

        if (error) return { data: null, error };

        const stats = {
            totalOrders: data.length,
            totalRevenue: data.reduce((sum, o) => sum + o.total, 0),
            completedOrders: data.filter(o => o.status === 'completed').length,
            pendingOrders: data.filter(o => o.status === 'pending').length
        };

        return { data: stats, error: null };
    }
};

// Export to window
window.SupabaseService = SupabaseService;
window.isSupabaseConfigured = isSupabaseConfigured;

console.log('✅ Supabase Service loaded', isSupabaseConfigured() ? '(Configured)' : '(Using local data)');
