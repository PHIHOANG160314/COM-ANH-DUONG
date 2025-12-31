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

    // Active subscriptions tracking
    _subscriptions: {},

    // Subscribe to all order changes (for staff/kitchen)
    subscribeToOrders(callback) {
        getSupabase().then(supabase => {
            if (!supabase) return null;

            // Unsubscribe existing if any
            if (this._subscriptions['orders']) {
                supabase.removeChannel(this._subscriptions['orders']);
            }

            const channel = supabase
                .channel('orders-channel')
                .on('postgres_changes',
                    { event: '*', schema: 'public', table: 'orders' },
                    (payload) => {
                        console.log('🔔 Realtime order update:', payload.eventType);
                        callback(payload);
                    }
                )
                .subscribe((status) => {
                    console.log('📡 Orders subscription:', status);
                });

            this._subscriptions['orders'] = channel;
            return channel;
        });
    },

    // Subscribe to specific customer's orders (for customer portal)
    subscribeToCustomerOrders(customerPhone, callback) {
        getSupabase().then(supabase => {
            if (!supabase) return null;

            const channelName = `customer-orders-${customerPhone}`;

            // Unsubscribe existing if any
            if (this._subscriptions[channelName]) {
                supabase.removeChannel(this._subscriptions[channelName]);
            }

            const channel = supabase
                .channel(channelName)
                .on('postgres_changes',
                    {
                        event: 'UPDATE',
                        schema: 'public',
                        table: 'orders',
                        filter: `customer_phone=eq.${customerPhone}`
                    },
                    (payload) => {
                        console.log('🔔 Customer order update:', payload.new?.status);
                        callback(payload);

                        // Show notification
                        this._showOrderNotification(payload);
                    }
                )
                .subscribe((status) => {
                    console.log('📡 Customer orders subscription:', status);
                });

            this._subscriptions[channelName] = channel;
            return channel;
        });
    },

    // Subscribe to specific order by ID
    subscribeToOrderById(orderId, callback) {
        getSupabase().then(supabase => {
            if (!supabase) return null;

            const channelName = `order-${orderId}`;

            if (this._subscriptions[channelName]) {
                supabase.removeChannel(this._subscriptions[channelName]);
            }

            const channel = supabase
                .channel(channelName)
                .on('postgres_changes',
                    {
                        event: 'UPDATE',
                        schema: 'public',
                        table: 'orders',
                        filter: `id=eq.${orderId}`
                    },
                    (payload) => {
                        console.log('🔔 Order update:', orderId, payload.new?.status);
                        callback(payload);
                        this._showOrderNotification(payload);
                    }
                )
                .subscribe();

            this._subscriptions[channelName] = channel;
            return channel;
        });
    },

    // Unsubscribe from a channel
    unsubscribe(channelName) {
        getSupabase().then(supabase => {
            if (supabase && this._subscriptions[channelName]) {
                supabase.removeChannel(this._subscriptions[channelName]);
                delete this._subscriptions[channelName];
                console.log('📴 Unsubscribed from:', channelName);
            }
        });
    },

    // Show visual notification for order updates
    _showOrderNotification(payload) {
        if (!payload.new) return;

        const statusLabels = {
            'pending': '🕐 Đang chờ xử lý',
            'confirmed': '✅ Đã xác nhận',
            'preparing': '👨‍🍳 Đang chuẩn bị',
            'ready': '🍽️ Sẵn sàng phục vụ',
            'delivering': '🛵 Đang giao hàng',
            'completed': '✨ Hoàn thành',
            'cancelled': '❌ Đã hủy'
        };

        const status = payload.new.status;
        const orderNumber = payload.new.order_number || payload.new.id;
        const message = statusLabels[status] || status;

        // Show toast notification
        if (typeof Toast !== 'undefined') {
            Toast.show(`Đơn ${orderNumber}: ${message}`, status === 'completed' ? 'success' : 'info');
        }

        // Trigger confetti for completed orders
        if (status === 'completed' && typeof Confetti !== 'undefined') {
            Confetti.orderSuccess();
        }

        // Play sound for new order (staff side)
        if (status === 'pending' && document.querySelector('#page-kitchen, #staffApp')) {
            this._playNotificationSound();
        }

        // Push notification if supported
        if (Notification.permission === 'granted') {
            new Notification(`Đơn ${orderNumber}`, {
                body: message,
                icon: '/icons/icon-192.png',
                badge: '/icons/icon-72.png',
                vibrate: [100, 50, 100]
            });
        }
    },

    // Play notification sound
    _playNotificationSound() {
        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();

            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);

            oscillator.frequency.value = 800;
            oscillator.type = 'sine';
            gainNode.gain.value = 0.3;

            oscillator.start();
            oscillator.stop(audioContext.currentTime + 0.2);
        } catch (e) {
            console.log('Audio notification not supported');
        }
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

if (window.Debug) Debug.info('Supabase Service loaded', isSupabaseConfigured() ? '(Configured)' : '(Using local data)');

