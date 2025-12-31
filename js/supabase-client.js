// =====================================================
// SUPABASE CLIENT - ÁNH DƯƠNG F&B
// Enhanced with retry logic and standardized error handling
// =====================================================

// Config - Load from environment or use defaults
const SUPABASE_CONFIG = {
    url: window.ENV?.SUPABASE_URL || 'YOUR_SUPABASE_URL',
    anonKey: window.ENV?.SUPABASE_ANON_KEY || 'YOUR_SUPABASE_ANON_KEY'
};

// Retry configuration
const RETRY_CONFIG = {
    maxRetries: 3,
    baseDelay: 1000, // 1 second
    maxDelay: 10000  // 10 seconds max
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
        if (window.Debug) Debug.warn('Supabase not configured. Using local data.');
        return null;
    }

    try {
        // Dynamic import of Supabase
        const { createClient } = await import('https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm');
        supabaseClient = createClient(SUPABASE_CONFIG.url, SUPABASE_CONFIG.anonKey);
        if (window.Debug) Debug.info('Supabase client initialized');
        return supabaseClient;
    } catch (err) {
        if (window.Debug) Debug.error('Failed to initialize Supabase:', err.message);
        return null;
    }
};

// =====================================================
// RETRY UTILITY WITH EXPONENTIAL BACKOFF
// =====================================================

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const withRetry = async (operation, operationName = 'API call') => {
    let lastError;

    for (let attempt = 0; attempt <= RETRY_CONFIG.maxRetries; attempt++) {
        try {
            const result = await operation();

            // If Supabase returns an error, check if it's retryable
            if (result?.error) {
                const isRetryable = isRetryableError(result.error);
                if (isRetryable && attempt < RETRY_CONFIG.maxRetries) {
                    const delay = calculateBackoff(attempt);
                    if (window.Debug) Debug.warn(`${operationName} failed (attempt ${attempt + 1}), retrying in ${delay}ms...`);
                    await sleep(delay);
                    continue;
                }
                return result; // Return error result if not retryable
            }

            return result; // Success
        } catch (err) {
            lastError = err;

            if (attempt < RETRY_CONFIG.maxRetries && isRetryableError(err)) {
                const delay = calculateBackoff(attempt);
                if (window.Debug) Debug.warn(`${operationName} exception (attempt ${attempt + 1}), retrying in ${delay}ms...`);
                await sleep(delay);
            }
        }
    }

    if (window.Debug) Debug.error(`${operationName} failed after ${RETRY_CONFIG.maxRetries + 1} attempts`);
    return { data: null, error: lastError?.message || 'Max retries exceeded' };
};

const calculateBackoff = (attempt) => {
    const delay = RETRY_CONFIG.baseDelay * Math.pow(2, attempt);
    const jitter = Math.random() * 500; // Add some randomness
    return Math.min(delay + jitter, RETRY_CONFIG.maxDelay);
};

const isRetryableError = (error) => {
    if (!error) return false;

    // Check for network errors or temporary failures
    const errorMessage = typeof error === 'string' ? error : error.message || '';
    const retryablePatterns = [
        'network', 'timeout', 'ECONNREFUSED', 'ENOTFOUND',
        '502', '503', '504', 'rate limit', 'too many requests'
    ];

    return retryablePatterns.some(pattern =>
        errorMessage.toLowerCase().includes(pattern.toLowerCase())
    );
};

// =====================================================
// STANDARDIZED API RESPONSE
// =====================================================

const createSuccessResponse = (data) => ({ data, error: null, success: true });
const createErrorResponse = (error, context = '') => {
    if (window.Debug) Debug.error(`API Error${context ? ` (${context})` : ''}:`, error);
    return { data: null, error: typeof error === 'string' ? error : error?.message || 'Unknown error', success: false };
};

// =====================================================
// DATA SERVICE
// =====================================================

const SupabaseService = {

    // ==================== MENU ====================

    async getMenuItems() {
        return withRetry(async () => {
            const supabase = await getSupabase();
            if (!supabase) return createErrorResponse('Not configured', 'getMenuItems');

            const { data, error } = await supabase
                .from('menu_items')
                .select('*')
                .eq('is_available', true)
                .order('id');

            if (error) return createErrorResponse(error, 'getMenuItems');
            return createSuccessResponse(data);
        }, 'getMenuItems');
    },

    async getCategories() {
        return withRetry(async () => {
            const supabase = await getSupabase();
            if (!supabase) return createErrorResponse('Not configured', 'getCategories');

            const { data, error } = await supabase
                .from('categories')
                .select('*')
                .eq('is_active', true)
                .order('order');

            if (error) return createErrorResponse(error, 'getCategories');
            return createSuccessResponse(data);
        }, 'getCategories');
    },

    async getCombos() {
        return withRetry(async () => {
            const supabase = await getSupabase();
            if (!supabase) return createErrorResponse('Not configured', 'getCombos');

            const { data, error } = await supabase
                .from('combos')
                .select('*')
                .eq('is_active', true);

            if (error) return createErrorResponse(error, 'getCombos');
            return createSuccessResponse(data);
        }, 'getCombos');
    },

    // ==================== ORDERS ====================

    async createOrder(orderData) {
        return withRetry(async () => {
            const supabase = await getSupabase();
            if (!supabase) return createErrorResponse('Not configured', 'createOrder');

            const { data, error } = await supabase
                .from('orders')
                .insert(orderData)
                .select()
                .single();

            if (error) return createErrorResponse(error, 'createOrder');
            if (window.Debug) Debug.info('Order created:', data?.id);
            return createSuccessResponse(data);
        }, 'createOrder');
    },

    async getOrders(status = null) {
        return withRetry(async () => {
            const supabase = await getSupabase();
            if (!supabase) return createErrorResponse('Not configured', 'getOrders');

            let query = supabase
                .from('orders')
                .select('*')
                .order('created_at', { ascending: false });

            if (status) {
                query = query.eq('status', status);
            }

            const { data, error } = await query;
            if (error) return createErrorResponse(error, 'getOrders');
            return createSuccessResponse(data);
        }, 'getOrders');
    },

    async updateOrderStatus(orderId, status) {
        return withRetry(async () => {
            const supabase = await getSupabase();
            if (!supabase) return createErrorResponse('Not configured', 'updateOrderStatus');

            const { data, error } = await supabase
                .from('orders')
                .update({ status })
                .eq('id', orderId)
                .select()
                .single();

            if (error) return createErrorResponse(error, 'updateOrderStatus');
            if (window.Debug) Debug.info('Order status updated:', orderId, '->', status);
            return createSuccessResponse(data);
        }, 'updateOrderStatus');
    },

    // ==================== CUSTOMERS ====================

    async getCustomerByPhone(phone) {
        return withRetry(async () => {
            const supabase = await getSupabase();
            if (!supabase) return createErrorResponse('Not configured', 'getCustomerByPhone');

            const { data, error } = await supabase
                .from('customers')
                .select('*')
                .eq('phone', phone)
                .single();

            if (error && error.code !== 'PGRST116') { // PGRST116 = no rows
                return createErrorResponse(error, 'getCustomerByPhone');
            }
            return createSuccessResponse(data);
        }, 'getCustomerByPhone');
    },

    async upsertCustomer(customerData) {
        return withRetry(async () => {
            const supabase = await getSupabase();
            if (!supabase) return createErrorResponse('Not configured', 'upsertCustomer');

            const { data, error } = await supabase
                .from('customers')
                .upsert(customerData, { onConflict: 'phone' })
                .select()
                .single();

            if (error) return createErrorResponse(error, 'upsertCustomer');
            if (window.Debug) Debug.info('Customer upserted:', data?.phone);
            return createSuccessResponse(data);
        }, 'upsertCustomer');
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
                        if (window.Debug) Debug.info('🔔 Realtime order update:', payload.eventType);
                        callback(payload);
                    }
                )
                .subscribe((status) => {
                    if (window.Debug) Debug.info('📡 Orders subscription:', status);
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
                        if (window.Debug) Debug.info('🔔 Customer order update:', payload.new?.status);
                        callback(payload);

                        // Show notification
                        this._showOrderNotification(payload);
                    }
                )
                .subscribe((status) => {
                    if (window.Debug) Debug.info('📡 Customer orders subscription:', status);
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
                        if (window.Debug) Debug.info('🔔 Order update:', orderId, payload.new?.status);
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
                if (window.Debug) Debug.info('📴 Unsubscribed from:', channelName);
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
            if (window.Debug) Debug.warn('Audio notification not supported');
        }
    },

    // ==================== ANALYTICS ====================

    async getTodayStats() {
        return withRetry(async () => {
            const supabase = await getSupabase();
            if (!supabase) return createErrorResponse('Not configured', 'getTodayStats');

            const today = new Date().toISOString().split('T')[0];

            const { data, error } = await supabase
                .from('orders')
                .select('total, status')
                .gte('created_at', today);

            if (error) return createErrorResponse(error, 'getTodayStats');

            const stats = {
                totalOrders: data.length,
                totalRevenue: data.reduce((sum, o) => sum + (o.total || 0), 0),
                completedOrders: data.filter(o => o.status === 'completed').length,
                pendingOrders: data.filter(o => o.status === 'pending').length
            };

            return createSuccessResponse(stats);
        }, 'getTodayStats');
    }
};

// Export to window
window.SupabaseService = SupabaseService;
window.isSupabaseConfigured = isSupabaseConfigured;
window.getSupabase = getSupabase;

if (window.Debug) Debug.info('Supabase Service loaded', isSupabaseConfigured() ? '(Configured)' : '(Using local data)');
