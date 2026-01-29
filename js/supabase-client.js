/**
 * F&B Master - Supabase Client
 * Author: Google DeepMind / Antigravity Team
 * Description: Supabase client wrapper with retry logic, offline handling, and realtime subscriptions.
 */

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

    // ==================== GENERIC HELPERS ====================

    get client() {
        return supabaseClient;
    },

    async insert(table, record) {
        return withRetry(async () => {
            const supabase = await getSupabase();
            if (!supabase) return createErrorResponse('Not configured', `insert ${table}`);

            const { data, error } = await supabase
                .from(table)
                .insert(record)
                .select()
                .single();

            if (error) return createErrorResponse(error, `insert ${table}`);
            return createSuccessResponse(data);
        }, `insert ${table}`);
    },

    async update(table, id, updates) {
        return withRetry(async () => {
            const supabase = await getSupabase();
            if (!supabase) return createErrorResponse('Not configured', `update ${table}`);

            const { data, error } = await supabase
                .from(table)
                .update(updates)
                .eq('id', id)
                .select()
                .single();

            if (error) return createErrorResponse(error, `update ${table}`);
            return createSuccessResponse(data);
        }, `update ${table}`);
    },

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
                .select();

            if (error) return createErrorResponse(error, 'updateOrderStatus');

            // Check if any rows were updated
            if (!data || data.length === 0) {
                if (window.Debug) Debug.warn('No order found with id:', orderId);
                return createErrorResponse('Order not found', 'updateOrderStatus');
            }

            if (window.Debug) Debug.info('Order status updated:', orderId, '->', status);
            return createSuccessResponse(data[0]);
        }, 'updateOrderStatus');
    },

    // ==================== SHIPPER ====================

    // Get orders available for delivery (ready status, order_type = delivery)
    async getPendingDeliveryOrders() {
        return withRetry(async () => {
            const supabase = await getSupabase();
            if (!supabase) return createErrorResponse('Not configured', 'getPendingDeliveryOrders');

            const { data, error } = await supabase
                .from('orders')
                .select('*')
                .eq('order_type', 'delivery')
                .in('status', ['pending', 'confirmed', 'preparing', 'ready'])
                .order('created_at', { ascending: false });

            if (error) return createErrorResponse(error, 'getPendingDeliveryOrders');
            return createSuccessResponse(data || []);
        }, 'getPendingDeliveryOrders');
    },

    // Update shipper status (online/offline/busy)
    async updateShipperStatus(shipperId, status) {
        return withRetry(async () => {
            const supabase = await getSupabase();
            if (!supabase) return createErrorResponse('Not configured', 'updateShipperStatus');

            const { data, error } = await supabase
                .from('shippers')
                .update({ status })
                .eq('id', shipperId)
                .select();

            if (error) return createErrorResponse(error, 'updateShipperStatus');
            return createSuccessResponse(data?.[0]);
        }, 'updateShipperStatus');
    },

    // Get shipper's active deliveries
    async getShipperDeliveries(shipperId, statuses = ['assigned', 'picked_up', 'delivering']) {
        return withRetry(async () => {
            const supabase = await getSupabase();
            if (!supabase) return createErrorResponse('Not configured', 'getShipperDeliveries');

            const { data, error } = await supabase
                .from('delivery_assignments')
                .select('*, order:orders(*)')
                .eq('shipper_id', shipperId)
                .in('status', statuses)
                .order('assigned_at', { ascending: false });

            if (error) return createErrorResponse(error, 'getShipperDeliveries');
            return createSuccessResponse(data || []);
        }, 'getShipperDeliveries');
    },

    // Assign shipper to order
    async assignShipperToDelivery(orderId, shipperId) {
        return withRetry(async () => {
            const supabase = await getSupabase();
            if (!supabase) return createErrorResponse('Not configured', 'assignShipperToDelivery');

            const { data, error } = await supabase
                .from('delivery_assignments')
                .insert({
                    order_id: orderId,
                    shipper_id: shipperId,
                    status: 'assigned',
                    assigned_at: new Date().toISOString()
                })
                .select();

            if (error) return createErrorResponse(error, 'assignShipperToDelivery');
            return createSuccessResponse(data?.[0]);
        }, 'assignShipperToDelivery');
    },

    // Update delivery status
    async updateDeliveryStatus(assignmentId, status) {
        return withRetry(async () => {
            const supabase = await getSupabase();
            if (!supabase) return createErrorResponse('Not configured', 'updateDeliveryStatus');

            const updateData = { status };
            if (status === 'picked_up') updateData.picked_up_at = new Date().toISOString();
            if (status === 'delivered') updateData.delivered_at = new Date().toISOString();

            const { data, error } = await supabase
                .from('delivery_assignments')
                .update(updateData)
                .eq('id', assignmentId)
                .select();

            if (error) return createErrorResponse(error, 'updateDeliveryStatus');
            return createSuccessResponse(data?.[0]);
        }, 'updateDeliveryStatus');
    },

    // Complete delivery
    async completeDelivery(assignmentId) {
        return withRetry(async () => {
            const supabase = await getSupabase();
            if (!supabase) return createErrorResponse('Not configured', 'completeDelivery');

            const { data, error } = await supabase
                .from('delivery_assignments')
                .update({
                    status: 'delivered',
                    delivered_at: new Date().toISOString()
                })
                .eq('id', assignmentId)
                .select();

            if (error) return createErrorResponse(error, 'completeDelivery');
            return createSuccessResponse(data?.[0]);
        }, 'completeDelivery');
    },

    // Subscribe to shipper assignments
    subscribeToShipperAssignments(shipperId, callback) {
        getSupabase().then(supabase => {
            if (!supabase) return;

            const channelName = `shipper-${shipperId}`;
            if (this._subscriptions[channelName]) return;

            const channel = supabase.channel(channelName)
                .on('postgres_changes', {
                    event: '*',
                    schema: 'public',
                    table: 'delivery_assignments',
                    filter: `shipper_id=eq.${shipperId}`
                }, (payload) => {
                    callback(payload);
                })
                .subscribe();

            this._subscriptions[channelName] = channel;
        });
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

    // Multiple listeners for order events (broadcast pattern)
    _orderListeners: [],
    _ordersChannelInitialized: false,

    // Initialize orders channel once, broadcast to all listeners
    _initOrdersChannel() {
        if (this._ordersChannelInitialized) return;

        getSupabase().then(supabase => {
            if (!supabase) return;

            const channel = supabase
                .channel('orders-channel-shared')
                .on('postgres_changes',
                    { event: '*', schema: 'public', table: 'orders' },
                    (payload) => {
                        if (window.Debug) Debug.info('🔔 Realtime order update:', payload.eventType);
                        // Broadcast to ALL registered listeners
                        this._orderListeners.forEach(listener => {
                            try {
                                listener.callback(payload);
                            } catch (e) {
                                console.error('Order listener error:', listener.name, e);
                            }
                        });
                    }
                )
                .subscribe((status) => {
                    if (window.Debug) Debug.info('📡 Orders subscription:', status);
                });

            this._subscriptions['orders-shared'] = channel;
            this._ordersChannelInitialized = true;
        });
    },

    // Subscribe to all order changes (supports multiple listeners)
    subscribeToOrders(callback, listenerName = 'anonymous') {
        // Remove existing listener with same name to prevent duplicates
        this._orderListeners = this._orderListeners.filter(l => l.name !== listenerName);

        // Add new listener
        this._orderListeners.push({ name: listenerName, callback });

        if (window.Debug) Debug.info(`📡 Added order listener: ${listenerName} (total: ${this._orderListeners.length})`);

        // Initialize shared channel if not already
        this._initOrdersChannel();
    },

    // Unsubscribe a specific listener
    unsubscribeFromOrders(listenerName) {
        this._orderListeners = this._orderListeners.filter(l => l.name !== listenerName);
        if (window.Debug) Debug.info(`📡 Removed order listener: ${listenerName}`);
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

    // ==================== ANALYTICS & REPORTING ====================

    async getTodayStats() {
        return withRetry(async () => {
            const supabase = await getSupabase();
            if (!supabase) return createErrorResponse('Not configured', 'getTodayStats');

            // Use RPC function for optimized query
            const { data, error } = await supabase.rpc('get_daily_report');

            if (error) {
                // Fallback to direct query
                const today = new Date().toISOString().split('T')[0];
                const { data: orders, error: ordersError } = await supabase
                    .from('orders')
                    .select('total, status')
                    .gte('created_at', today);

                if (ordersError) return createErrorResponse(ordersError, 'getTodayStats');

                return createSuccessResponse({
                    totalOrders: orders.length,
                    totalRevenue: orders.reduce((sum, o) => sum + (o.total || 0), 0),
                    completedOrders: orders.filter(o => o.status === 'completed').length,
                    pendingOrders: orders.filter(o => o.status === 'pending').length
                });
            }

            return createSuccessResponse(data);
        }, 'getTodayStats');
    },

    // Get daily report for specific date
    async getDailyReport(date = null) {
        return withRetry(async () => {
            const supabase = await getSupabase();
            if (!supabase) return createErrorResponse('Not configured', 'getDailyReport');

            const reportDate = date || new Date().toISOString().split('T')[0];
            const { data, error } = await supabase.rpc('get_daily_report', {
                report_date: reportDate
            });

            if (error) return createErrorResponse(error, 'getDailyReport');
            return createSuccessResponse(data);
        }, 'getDailyReport');
    },

    // Get report for date range
    async getRangeReport(dateFrom, dateTo) {
        return withRetry(async () => {
            const supabase = await getSupabase();
            if (!supabase) return createErrorResponse('Not configured', 'getRangeReport');

            const { data, error } = await supabase.rpc('get_range_report', {
                date_from: dateFrom,
                date_to: dateTo
            });

            if (error) return createErrorResponse(error, 'getRangeReport');
            return createSuccessResponse(data);
        }, 'getRangeReport');
    },

    // Get top selling items
    async getTopItems(dateFrom = null, dateTo = null, limit = 10) {
        return withRetry(async () => {
            const supabase = await getSupabase();
            if (!supabase) return createErrorResponse('Not configured', 'getTopItems');

            const from = dateFrom || new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
            const to = dateTo || new Date().toISOString().split('T')[0];

            const { data, error } = await supabase.rpc('get_top_items', {
                date_from: from,
                date_to: to,
                limit_count: limit
            });

            if (error) return createErrorResponse(error, 'getTopItems');
            return createSuccessResponse(data || []);
        }, 'getTopItems');
    },

    // Get revenue by category
    async getCategoryRevenue(dateFrom = null, dateTo = null) {
        return withRetry(async () => {
            const supabase = await getSupabase();
            if (!supabase) return createErrorResponse('Not configured', 'getCategoryRevenue');

            const from = dateFrom || new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
            const to = dateTo || new Date().toISOString().split('T')[0];

            const { data, error } = await supabase.rpc('get_revenue_by_category', {
                date_from: from,
                date_to: to
            });

            if (error) return createErrorResponse(error, 'getCategoryRevenue');
            return createSuccessResponse(data || []);
        }, 'getCategoryRevenue');
    },

    // Get hourly stats for real-time dashboard
    async getHourlyStats(date = null) {
        return withRetry(async () => {
            const supabase = await getSupabase();
            if (!supabase) return createErrorResponse('Not configured', 'getHourlyStats');

            const targetDate = date || new Date().toISOString().split('T')[0];
            const { data, error } = await supabase.rpc('get_hourly_stats', {
                target_date: targetDate
            });

            if (error) return createErrorResponse(error, 'getHourlyStats');
            return createSuccessResponse(data || []);
        }, 'getHourlyStats');
    },

    // Get all orders for export (with date range)
    async getOrdersForExport(dateFrom, dateTo) {
        return withRetry(async () => {
            const supabase = await getSupabase();
            if (!supabase) return createErrorResponse('Not configured', 'getOrdersForExport');

            const { data, error } = await supabase
                .from('orders')
                .select('*')
                .gte('created_at', dateFrom)
                .lte('created_at', dateTo + 'T23:59:59')
                .order('created_at', { ascending: false });

            if (error) return createErrorResponse(error, 'getOrdersForExport');
            return createSuccessResponse(data || []);
        }, 'getOrdersForExport');
    },

    // Subscribe to real-time stats updates
    subscribeToStats(callback) {
        getSupabase().then(supabase => {
            if (!supabase) return null;

            const channelName = 'stats-realtime';

            if (this._subscriptions[channelName]) {
                supabase.removeChannel(this._subscriptions[channelName]);
            }

            const channel = supabase
                .channel(channelName)
                .on('postgres_changes',
                    { event: '*', schema: 'public', table: 'orders' },
                    async (payload) => {
                        if (window.Debug) Debug.info('📊 Stats update triggered');
                        // Fetch fresh stats and call callback
                        const stats = await this.getTodayStats();
                        if (stats.success) {
                            callback(stats.data);
                        }
                    }
                )
                .subscribe((status) => {
                    if (window.Debug) Debug.info('📡 Stats subscription:', status);
                });

            this._subscriptions[channelName] = channel;
            return channel;
        });
    },

    // ==================== SHIPPER SERVICE ====================

    // Login shipper by phone + PIN (SECURE - uses bcrypt RPC)
    async loginShipper(phone, pin) {
        return withRetry(async () => {
            const supabase = await getSupabase();
            if (!supabase) return createErrorResponse('Not configured', 'loginShipper');

            // Use secure RPC function that verifies PIN with bcrypt
            const { data, error } = await supabase.rpc('verify_shipper_pin', {
                p_phone: phone,
                p_pin: pin
            });

            if (error) {
                return createErrorResponse(error, 'loginShipper');
            }

            // RPC returns empty array if PIN incorrect
            if (!data || data.length === 0) {
                return createErrorResponse('Số điện thoại hoặc mã PIN không đúng', 'loginShipper');
            }

            const shipper = data[0];
            if (window.Debug) Debug.info('🛵 Shipper logged in:', shipper?.name);
            return createSuccessResponse(shipper);
        }, 'loginShipper');
    },

    // Get shipper by ID
    async getShipperById(shipperId) {
        return withRetry(async () => {
            const supabase = await getSupabase();
            if (!supabase) return createErrorResponse('Not configured', 'getShipperById');

            const { data, error } = await supabase
                .from('shippers')
                .select('*')
                .eq('id', shipperId)
                .single();

            if (error) return createErrorResponse(error, 'getShipperById');
            return createSuccessResponse(data);
        }, 'getShipperById');
    },

    // Update shipper status (online/offline/busy)
    async updateShipperStatus(shipperId, status) {
        return withRetry(async () => {
            const supabase = await getSupabase();
            if (!supabase) return createErrorResponse('Not configured', 'updateShipperStatus');

            const { data, error } = await supabase
                .from('shippers')
                .update({ status, updated_at: new Date().toISOString() })
                .eq('id', shipperId)
                .select()
                .single();

            if (error) return createErrorResponse(error, 'updateShipperStatus');
            if (window.Debug) Debug.info('🛵 Shipper status:', status);
            return createSuccessResponse(data);
        }, 'updateShipperStatus');
    },

    // Update shipper location
    async updateShipperLocation(shipperId, lat, lng) {
        return withRetry(async () => {
            const supabase = await getSupabase();
            if (!supabase) return createErrorResponse('Not configured', 'updateShipperLocation');

            const location = {
                lat,
                lng,
                updated_at: new Date().toISOString()
            };

            const { data, error } = await supabase
                .from('shippers')
                .update({ current_location: location })
                .eq('id', shipperId)
                .select()
                .single();

            if (error) return createErrorResponse(error, 'updateShipperLocation');
            return createSuccessResponse(data);
        }, 'updateShipperLocation');
    },

    // Get all active shippers
    async getActiveShippers() {
        return withRetry(async () => {
            const supabase = await getSupabase();
            if (!supabase) return createErrorResponse('Not configured', 'getActiveShippers');

            const { data, error } = await supabase
                .from('shippers')
                .select('*')
                .eq('is_active', true)
                .order('name');

            if (error) return createErrorResponse(error, 'getActiveShippers');
            return createSuccessResponse(data);
        }, 'getActiveShippers');
    },

    // Get available shippers (online and not busy)
    async getAvailableShippers() {
        return withRetry(async () => {
            const supabase = await getSupabase();
            if (!supabase) return createErrorResponse('Not configured', 'getAvailableShippers');

            const { data, error } = await supabase
                .from('shippers')
                .select('*')
                .eq('is_active', true)
                .eq('status', 'online')
                .order('total_deliveries', { ascending: true }); // Prefer shippers with fewer deliveries

            if (error) return createErrorResponse(error, 'getAvailableShippers');
            return createSuccessResponse(data);
        }, 'getAvailableShippers');
    },

    // Create delivery assignment for order
    async createDeliveryAssignment(orderId, shipperId = null) {
        return withRetry(async () => {
            const supabase = await getSupabase();
            if (!supabase) return createErrorResponse('Not configured', 'createDeliveryAssignment');

            const assignmentData = {
                order_id: orderId,
                shipper_id: shipperId,
                status: shipperId ? 'assigned' : 'pending',
                assigned_at: shipperId ? new Date().toISOString() : null
            };

            const { data, error } = await supabase
                .from('delivery_assignments')
                .insert(assignmentData)
                .select()
                .single();

            if (error) return createErrorResponse(error, 'createDeliveryAssignment');
            if (window.Debug) Debug.info('🛵 Delivery assignment created:', data?.id);
            return createSuccessResponse(data);
        }, 'createDeliveryAssignment');
    },

    // Assign shipper to delivery
    async assignShipperToDelivery(orderId, shipperId) {
        return withRetry(async () => {
            const supabase = await getSupabase();
            if (!supabase) return createErrorResponse('Not configured', 'assignShipperToDelivery');

            // Get shipper commission rate
            const { data: shipper } = await supabase
                .from('shippers')
                .select('commission_rate')
                .eq('id', shipperId)
                .single();

            const commission = shipper?.commission_rate || 15000;

            const { data, error } = await supabase
                .from('delivery_assignments')
                .upsert({
                    order_id: orderId,
                    shipper_id: shipperId,
                    status: 'assigned',
                    assigned_at: new Date().toISOString(),
                    commission
                }, { onConflict: 'order_id' })
                .select()
                .single();

            if (error) return createErrorResponse(error, 'assignShipperToDelivery');

            // Update shipper status to busy
            await supabase
                .from('shippers')
                .update({ status: 'busy' })
                .eq('id', shipperId);

            if (window.Debug) Debug.info('🛵 Assigned shipper to order:', orderId);
            return createSuccessResponse(data);
        }, 'assignShipperToDelivery');
    },

    // Get delivery assignment by order ID
    async getDeliveryAssignment(orderId) {
        return withRetry(async () => {
            const supabase = await getSupabase();
            if (!supabase) return createErrorResponse('Not configured', 'getDeliveryAssignment');

            const { data, error } = await supabase
                .from('delivery_assignments')
                .select('*, shipper:shippers(*)')
                .eq('order_id', orderId)
                .single();

            if (error && error.code !== 'PGRST116') {
                return createErrorResponse(error, 'getDeliveryAssignment');
            }
            return createSuccessResponse(data);
        }, 'getDeliveryAssignment');
    },

    // Get shipper's deliveries
    async getShipperDeliveries(shipperId, status = null) {
        return withRetry(async () => {
            const supabase = await getSupabase();
            if (!supabase) return createErrorResponse('Not configured', 'getShipperDeliveries');

            let query = supabase
                .from('delivery_assignments')
                .select('*, order:orders(*)')
                .eq('shipper_id', shipperId)
                .order('created_at', { ascending: false });

            if (status) {
                if (Array.isArray(status)) {
                    query = query.in('status', status);
                } else {
                    query = query.eq('status', status);
                }
            }

            const { data, error } = await query;
            if (error) return createErrorResponse(error, 'getShipperDeliveries');
            return createSuccessResponse(data);
        }, 'getShipperDeliveries');
    },

    // Get pending delivery orders (for shipper to pick)
    async getPendingDeliveryOrders() {
        return withRetry(async () => {
            const supabase = await getSupabase();
            if (!supabase) return createErrorResponse('Not configured', 'getPendingDeliveryOrders');

            // Get orders that are delivery type and ready but not yet assigned
            const { data, error } = await supabase
                .from('orders')
                .select('*')
                .eq('order_type', 'delivery')
                .in('status', ['ready', 'confirmed', 'preparing'])
                .order('created_at', { ascending: true });

            if (error) return createErrorResponse(error, 'getPendingDeliveryOrders');

            // Filter out orders that already have an assigned shipper
            const { data: assignments } = await supabase
                .from('delivery_assignments')
                .select('order_id')
                .in('status', ['assigned', 'picked_up', 'delivering']);

            const assignedOrderIds = (assignments || []).map(a => a.order_id);
            const availableOrders = (data || []).filter(o => !assignedOrderIds.includes(o.id));

            return createSuccessResponse(availableOrders);
        }, 'getPendingDeliveryOrders');
    },

    // Update delivery assignment status
    async updateDeliveryStatus(assignmentId, status, extraData = {}) {
        return withRetry(async () => {
            const supabase = await getSupabase();
            if (!supabase) return createErrorResponse('Not configured', 'updateDeliveryStatus');

            const updateData = {
                status,
                ...extraData
            };

            // Add timestamps based on status
            if (status === 'picked_up') {
                updateData.picked_up_at = new Date().toISOString();
            } else if (status === 'completed') {
                updateData.delivered_at = new Date().toISOString();
            }

            const { data, error } = await supabase
                .from('delivery_assignments')
                .update(updateData)
                .eq('id', assignmentId)
                .select('*, shipper:shippers(*)')
                .single();

            if (error) return createErrorResponse(error, 'updateDeliveryStatus');

            // Update shipper status based on delivery status
            if (data?.shipper_id) {
                if (status === 'completed' || status === 'cancelled') {
                    await supabase
                        .from('shippers')
                        .update({ status: 'online' })
                        .eq('id', data.shipper_id);
                }
            }

            if (window.Debug) Debug.info('🛵 Delivery status updated:', status);
            return createSuccessResponse(data);
        }, 'updateDeliveryStatus');
    },

    // Complete delivery with optional customer rating
    async completeDelivery(assignmentId, customerRating = null, customerFeedback = null) {
        const extraData = {};
        if (customerRating) extraData.customer_rating = customerRating;
        if (customerFeedback) extraData.customer_feedback = customerFeedback;

        return this.updateDeliveryStatus(assignmentId, 'completed', extraData);
    },

    // Get shipper earnings for date range
    async getShipperEarnings(shipperId, dateFrom = null, dateTo = null) {
        return withRetry(async () => {
            const supabase = await getSupabase();
            if (!supabase) return createErrorResponse('Not configured', 'getShipperEarnings');

            let query = supabase
                .from('delivery_assignments')
                .select('commission, delivered_at, customer_rating')
                .eq('shipper_id', shipperId)
                .eq('status', 'completed');

            if (dateFrom) {
                query = query.gte('delivered_at', dateFrom);
            }
            if (dateTo) {
                query = query.lte('delivered_at', dateTo + 'T23:59:59');
            }

            const { data, error } = await query;
            if (error) return createErrorResponse(error, 'getShipperEarnings');

            const totalEarnings = (data || []).reduce((sum, d) => sum + (d.commission || 0), 0);
            const totalDeliveries = (data || []).length;
            const avgRating = data?.length > 0
                ? data.filter(d => d.customer_rating).reduce((sum, d) => sum + d.customer_rating, 0) / data.filter(d => d.customer_rating).length
                : 0;

            return createSuccessResponse({
                totalEarnings,
                totalDeliveries,
                avgRating: Math.round(avgRating * 10) / 10,
                deliveries: data
            });
        }, 'getShipperEarnings');
    },

    // Subscribe to shipper assignments realtime
    subscribeToShipperAssignments(shipperId, callback) {
        getSupabase().then(supabase => {
            if (!supabase) return null;

            const channelName = `shipper-assignments-${shipperId}`;

            if (this._subscriptions[channelName]) {
                supabase.removeChannel(this._subscriptions[channelName]);
            }

            const channel = supabase
                .channel(channelName)
                .on('postgres_changes',
                    {
                        event: '*',
                        schema: 'public',
                        table: 'delivery_assignments',
                        filter: `shipper_id=eq.${shipperId}`
                    },
                    (payload) => {
                        if (window.Debug) Debug.info('🛵 Assignment update:', payload.eventType);
                        callback(payload);
                    }
                )
                .subscribe((status) => {
                    if (window.Debug) Debug.info('📡 Shipper assignments subscription:', status);
                });

            this._subscriptions[channelName] = channel;
            return channel;
        });
    },

    // Subscribe to all delivery assignments (for admin)
    subscribeToAllDeliveries(callback) {
        getSupabase().then(supabase => {
            if (!supabase) return null;

            const channelName = 'all-deliveries';

            if (this._subscriptions[channelName]) {
                supabase.removeChannel(this._subscriptions[channelName]);
            }

            const channel = supabase
                .channel(channelName)
                .on('postgres_changes',
                    {
                        event: '*',
                        schema: 'public',
                        table: 'delivery_assignments'
                    },
                    (payload) => {
                        if (window.Debug) Debug.info('🛵 All deliveries update:', payload.eventType);
                        callback(payload);
                    }
                )
                .subscribe((status) => {
                    if (window.Debug) Debug.info('📡 All deliveries subscription:', status);
                });

            this._subscriptions[channelName] = channel;
            return channel;
        });
    },

    // ==================== ATTENDANCE (REALTIME) ====================

    // Check in staff
    async checkIn(staffId) {
        return withRetry(async () => {
            const supabase = await getSupabase();
            if (!supabase) return createErrorResponse('Not configured', 'checkIn');

            const { data, error } = await supabase
                .from('attendance_log')
                .insert({
                    staff_id: staffId,
                    check_in: new Date().toISOString(),
                    date: new Date().toISOString().split('T')[0]
                })
                .select()
                .single();

            if (error) return createErrorResponse(error, 'checkIn');
            return createSuccessResponse(data);
        }, 'checkIn');
    },

    // Check out staff
    async checkOut(staffId) {
        return withRetry(async () => {
            const supabase = await getSupabase();
            if (!supabase) return createErrorResponse('Not configured', 'checkOut');

            const today = new Date().toISOString().split('T')[0];

            // Find latest active check-in
            const { data: latest, error: findError } = await supabase
                .from('attendance_log')
                .select('id')
                .eq('staff_id', staffId)
                .eq('date', today)
                .is('check_out', null)
                .order('check_in', { ascending: false })
                .limit(1)
                .single();

            if (findError) return createErrorResponse(findError, 'checkOut - find');
            if (!latest) return createErrorResponse('No active check-in found', 'checkOut');

            const { data, error } = await supabase
                .from('attendance_log')
                .update({
                    check_out: new Date().toISOString()
                })
                .eq('id', latest.id)
                .select()
                .single();

            if (error) return createErrorResponse(error, 'checkOut');
            return createSuccessResponse(data);
        }, 'checkOut');
    },

    // Get active attendance
    async getActiveAttendance() {
        return withRetry(async () => {
            const supabase = await getSupabase();
            if (!supabase) return createErrorResponse('Not configured', 'getActiveAttendance');

            const today = new Date().toISOString().split('T')[0];

            const { data, error } = await supabase
                .from('attendance_log')
                .select('*, staff:staff(*)') // Assuming relationship exists or will be ignored if not
                .eq('date', today)
                .is('check_out', null);

            if (error) return createErrorResponse(error, 'getActiveAttendance');
            return createSuccessResponse(data || []);
        }, 'getActiveAttendance');
    },

    // Subscribe to attendance updates
    subscribeToAttendance(callback) {
        getSupabase().then(supabase => {
            if (!supabase) return;

            const channelName = 'attendance-realtime';
            if (this._subscriptions[channelName]) return;

            const channel = supabase
                .channel(channelName)
                .on('postgres_changes',
                    { event: '*', schema: 'public', table: 'attendance_log' },
                    (payload) => {
                        if (window.Debug) Debug.info('⏱️ Attendance update:', payload.eventType);
                        callback(payload);
                    }
                )
                .subscribe();

            this._subscriptions[channelName] = channel;
        });
    }
};

// =====================================================
// DAILY MENU SERVICE - REALTIME SYNC
// =====================================================

const DailyMenuService = {
    _subscription: null,
    _callbacks: [],

    // Get today's daily menu config
    async getConfig() {
        // FIX: Check for stale cache BEFORE everything else
        try {
            const local = localStorage.getItem('daily_menu_config');
            if (local) {
                const config = JSON.parse(local);
                const today = new Date().toISOString().split('T')[0];
                const lastUpdated = config.lastUpdated ? config.lastUpdated.split('T')[0] : '';
                console.log(`🔍 DailyMenuService: Pre-check cache date: stored=${lastUpdated}, today=${today}`);

                if (lastUpdated !== today) {
                    console.log('🧹 DailyMenuService: Clearing stale daily menu cache before connection');
                    localStorage.removeItem('daily_menu_config');
                } else {
                    console.log('✅ DailyMenuService: Local cache is up to date');
                }
            } else {
                console.log('ℹ️ DailyMenuService: No local cache found');
            }
        } catch (e) {
            console.error('⚠️ DailyMenuService: Error checking local cache:', e);
        }

        return withRetry(async () => {
            const today = new Date().toISOString().split('T')[0];
            const localCache = localStorage.getItem('daily_menu_config');
            if (localCache) {
                try {
                    const cached = JSON.parse(localCache);
                    const cachedDate = cached.lastUpdated?.split('T')[0];
                    if (cachedDate !== today) {
                        console.log('Clearing stale cache from', cachedDate);
                        localStorage.removeItem('daily_menu_config');
                    }
                } catch (e) { }
            }
            const supabase = await getSupabase();
            if (!supabase) {
                // Fallback to localStorage
                const local = localStorage.getItem('daily_menu_config');
                if (local) {
                    try {
                        const config = JSON.parse(local);
                        // Check if cache is from today
                        const today = new Date().toISOString().split('T')[0];
                        const lastUpdated = config.lastUpdated ? config.lastUpdated.split('T')[0] : '';
                        console.log(`📅 Date check: stored=${lastUpdated}, today=${today}`);

                        if (lastUpdated !== today) {
                            console.log('📅 Clearing old daily menu cache from localStorage');
                            localStorage.removeItem('daily_menu_config');
                            return createSuccessResponse({ active_items: [] });
                        }

                        return createSuccessResponse({ active_items: config.activeItems || [] });
                    } catch (e) { }
                }
                return createSuccessResponse({ active_items: [] });
            }

            // const today = new Date().toISOString().split('T')[0];
            const { data, error } = await supabase
                .from('daily_menu_config')
                .select('*')
                .eq('active_date', today)
                .single();

            if (error && error.code === 'PGRST116') {
                // No row found for today, return empty
                return createSuccessResponse({ active_items: [] });
            }
            if (error) return createErrorResponse(error, 'DailyMenuService.getConfig');
            return createSuccessResponse(data);
        }, 'DailyMenuService.getConfig');
    },

    // Save daily menu config
    async saveConfig(activeItems) {
        return withRetry(async () => {
            const supabase = await getSupabase();
            const today = new Date().toISOString().split('T')[0]; // FIX: Declare 'today' variable
            console.log('📅 DailyMenuService.saveConfig:', { today, activeItemsCount: activeItems.length });

            // Always save to localStorage as fallback
            const localConfig = {
                active: true,
                activeItems: activeItems,
                lastUpdated: new Date().toISOString()
            };
            localStorage.setItem('daily_menu_config', JSON.stringify(localConfig));

            // Also broadcast via BroadcastChannel for same-browser tabs
            if (typeof BroadcastChannel !== 'undefined') {
                const channel = new BroadcastChannel('daily_menu_sync');
                channel.postMessage({ type: 'daily_menu_updated', config: localConfig });
                channel.close();
            }

            if (!supabase) {
                return createSuccessResponse({ active_items: activeItems, source: 'localStorage' });
            }

            const { data, error } = await supabase
                .from('daily_menu_config')
                .upsert({
                    active_date: today,
                    active_items: activeItems,
                    updated_at: new Date().toISOString()
                }, { onConflict: 'active_date' })
                .select()
                .single();

            if (error) return createErrorResponse(error, 'DailyMenuService.saveConfig');
            if (window.Debug) Debug.info('📅 Daily menu saved:', activeItems.length, 'items');
            return createSuccessResponse(data);
        }, 'DailyMenuService.saveConfig');
    },

    // Subscribe to realtime changes
    subscribe(callback) {
        this._callbacks.push(callback);

        // Setup Supabase realtime if available
        getSupabase().then(supabase => {
            if (!supabase) {
                if (window.Debug) Debug.warn('📅 DailyMenuService: Using localStorage fallback');
                return;
            }

            if (this._subscription) return; // Already subscribed

            const channelName = 'daily-menu-realtime';
            const today = new Date().toISOString().split('T')[0];

            const channel = supabase
                .channel(channelName)
                .on('postgres_changes',
                    {
                        event: '*',
                        schema: 'public',
                        table: 'daily_menu_config',
                        filter: `active_date=eq.${today}`
                    },
                    (payload) => {
                        if (window.Debug) Debug.info('📅 Daily menu realtime update:', payload.eventType);
                        const config = payload.new;
                        // Notify all callbacks
                        this._callbacks.forEach(cb => {
                            try {
                                cb({ activeItems: config.active_items || [] });
                            } catch (e) {
                                if (window.Debug) Debug.error('Callback error:', e);
                            }
                        });
                    }
                )
                .subscribe((status) => {
                    if (window.Debug) Debug.info('📅 Daily menu subscription:', status);
                });

            this._subscription = channel;
        });

        // Also listen to BroadcastChannel for same-browser updates
        if (typeof BroadcastChannel !== 'undefined' && !this._broadcastChannel) {
            this._broadcastChannel = new BroadcastChannel('daily_menu_sync');
            this._broadcastChannel.onmessage = (e) => {
                if (e.data && e.data.type === 'daily_menu_updated') {
                    if (window.Debug) Debug.info('📅 Daily menu broadcast update');
                    this._callbacks.forEach(cb => {
                        try {
                            cb({ activeItems: e.data.config.activeItems || [] });
                        } catch (err) {
                            if (window.Debug) Debug.error('Callback error:', err);
                        }
                    });
                }
            };
        }
    },

    // Unsubscribe
    unsubscribe() {
        if (this._subscription) {
            this._subscription.unsubscribe();
            this._subscription = null;
        }
        if (this._broadcastChannel) {
            this._broadcastChannel.close();
            this._broadcastChannel = null;
        }
        this._callbacks = [];
    }
};

// =====================================================
// FEATURED ITEMS SERVICE - MÓN BÁN CHẠY
// =====================================================

const FeaturedItemsService = {
    _subscription: null,
    _cachedItems: null,
    _cacheTime: null,

    // Get featured items config
    async getConfig() {
        return withRetry(async () => {
            const supabase = await getSupabase();
            if (!supabase) {
                const local = localStorage.getItem('featured_items_config');
                if (local) {
                    try {
                        return createSuccessResponse(JSON.parse(local));
                    } catch (e) { }
                }
                return createSuccessResponse({ mode: 'auto', auto_count: 6, manual_items: [] });
            }

            const { data, error } = await supabase
                .from('featured_items_config')
                .select('*')
                .single();

            if (error && error.code === 'PGRST116') {
                return createSuccessResponse({ mode: 'auto', auto_count: 6, manual_items: [] });
            }
            if (error) return createErrorResponse(error, 'FeaturedItemsService.getConfig');

            // Cache to localStorage
            localStorage.setItem('featured_items_config', JSON.stringify(data));
            return createSuccessResponse(data);
        }, 'FeaturedItemsService.getConfig');
    },

    // Save config
    async saveConfig(config) {
        return withRetry(async () => {
            const supabase = await getSupabase();

            // Save to localStorage
            localStorage.setItem('featured_items_config', JSON.stringify(config));

            // Broadcast update
            if (typeof BroadcastChannel !== 'undefined') {
                const channel = new BroadcastChannel('featured_items_sync');
                channel.postMessage({ type: 'featured_updated', config });
                channel.close();
            }

            if (!supabase) {
                return createSuccessResponse({ ...config, source: 'localStorage' });
            }

            const { data, error } = await supabase
                .from('featured_items_config')
                .upsert({
                    id: 1,
                    ...config,
                    updated_at: new Date().toISOString()
                })
                .select()
                .single();

            if (error) return createErrorResponse(error, 'FeaturedItemsService.saveConfig');
            if (window.Debug) Debug.info('🔥 Featured items saved:', config.mode);
            return createSuccessResponse(data);
        }, 'FeaturedItemsService.saveConfig');
    },

    // Get top selling items (for auto mode)
    async getTopSellers(limit = 6) {
        return withRetry(async () => {
            const supabase = await getSupabase();
            if (!supabase) {
                // Fallback: return sample items
                if (typeof window.menuItems !== 'undefined') {
                    return createSuccessResponse(window.menuItems.slice(0, limit));
                }
                return createSuccessResponse([]);
            }

            // Check cache (1 hour)
            if (this._cachedItems && this._cacheTime) {
                const hourAgo = Date.now() - (60 * 60 * 1000);
                if (this._cacheTime > hourAgo) {
                    return createSuccessResponse(this._cachedItems);
                }
            }

            // Query top sellers from view
            const { data, error } = await supabase
                .from('top_selling_items')
                .select('*')
                .limit(limit);

            if (error) {
                // View might not exist, fallback to menuItems
                if (window.Debug) Debug.warn('top_selling_items view not found, using fallback');
                if (typeof window.menuItems !== 'undefined') {
                    return createSuccessResponse(window.menuItems.slice(0, limit));
                }
                return createErrorResponse(error, 'FeaturedItemsService.getTopSellers');
            }

            // Map to menu items
            const itemIds = data.map(d => d.item_id);
            let featuredItems = [];

            if (typeof window.menuItems !== 'undefined') {
                featuredItems = window.menuItems.filter(item => itemIds.includes(item.id));
            }

            // Cache results
            this._cachedItems = featuredItems.length > 0 ? featuredItems : window.menuItems?.slice(0, limit) || [];
            this._cacheTime = Date.now();

            return createSuccessResponse(this._cachedItems);
        }, 'FeaturedItemsService.getTopSellers');
    },

    // Get featured items based on config
    async getFeaturedItems() {
        const configResult = await this.getConfig();
        if (!configResult.success) return configResult;

        const config = configResult.data;

        if (config.mode === 'manual' && config.manual_items?.length > 0) {
            // Manual mode: return items by IDs in order
            if (typeof window.menuItems !== 'undefined') {
                const items = config.manual_items
                    .map(id => window.menuItems.find(item => item.id === id))
                    .filter(Boolean);
                return createSuccessResponse(items);
            }
        }

        // Auto mode
        return this.getTopSellers(config.auto_count || 6);
    },

    // Subscribe to realtime updates
    subscribe(callback) {
        getSupabase().then(supabase => {
            if (!supabase) return;

            if (this._subscription) return;

            const channel = supabase
                .channel('featured-items-realtime')
                .on('postgres_changes',
                    { event: '*', schema: 'public', table: 'featured_items_config' },
                    (payload) => {
                        if (window.Debug) Debug.info('🔥 Featured items realtime update');
                        callback(payload.new);
                    }
                )
                .subscribe();

            this._subscription = channel;
        });

        // Also listen to BroadcastChannel
        if (typeof BroadcastChannel !== 'undefined') {
            const bc = new BroadcastChannel('featured_items_sync');
            bc.onmessage = (e) => {
                if (e.data?.type === 'featured_updated') {
                    callback(e.data.config);
                }
            };
        }
    }
};

// Export to window
window.SupabaseService = SupabaseService;
window.DailyMenuService = DailyMenuService;
window.FeaturedItemsService = FeaturedItemsService;
window.isSupabaseConfigured = isSupabaseConfigured;
window.getSupabase = getSupabase;

if (window.Debug) Debug.info('Supabase Service loaded', isSupabaseConfigured() ? '(Configured)' : '(Using local data)');


