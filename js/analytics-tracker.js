// =====================================================
// ANALYTICS - ÁNH DƯƠNG F&B
// Google Analytics 4 / Plausible Integration
// =====================================================

const Analytics = {
    // Configuration
    config: {
        ga4Id: window.ENV?.GA4_MEASUREMENT_ID || '',
        plausibleDomain: window.ENV?.PLAUSIBLE_DOMAIN || '',
        debug: false
    },

    initialized: false,

    // Initialize analytics
    init() {
        if (this.initialized) return;

        // Try GA4 first
        if (this.config.ga4Id) {
            this.initGA4();
        }
        // Or use Plausible
        else if (this.config.plausibleDomain) {
            this.initPlausible();
        }
        // Fallback to console logging
        else {
            console.log('📊 Analytics not configured. Using local tracking.');
        }

        this.setupAutoTracking();
        this.initialized = true;
        console.log('✅ Analytics module loaded');
    },

    // Initialize Google Analytics 4
    initGA4() {
        // Load gtag.js
        const script = document.createElement('script');
        script.async = true;
        script.src = `https://www.googletagmanager.com/gtag/js?id=${this.config.ga4Id}`;
        document.head.appendChild(script);

        // Initialize gtag
        window.dataLayer = window.dataLayer || [];
        window.gtag = function () { dataLayer.push(arguments); };
        gtag('js', new Date());
        gtag('config', this.config.ga4Id, {
            page_path: window.location.pathname,
            send_page_view: true
        });

        console.log('✅ GA4 initialized:', this.config.ga4Id);
    },

    // Initialize Plausible Analytics
    initPlausible() {
        const script = document.createElement('script');
        script.defer = true;
        script.dataset.domain = this.config.plausibleDomain;
        script.src = 'https://plausible.io/js/script.js';
        document.head.appendChild(script);

        console.log('✅ Plausible initialized:', this.config.plausibleDomain);
    },

    // ========================================
    // TRACKING METHODS
    // ========================================

    // Track page view
    pageView(pageName, pageTitle) {
        const data = {
            page: pageName || window.location.pathname,
            title: pageTitle || document.title,
            timestamp: new Date().toISOString()
        };

        if (window.gtag) {
            gtag('event', 'page_view', {
                page_path: data.page,
                page_title: data.title
            });
        }

        if (window.plausible) {
            plausible('pageview');
        }

        this.log('pageview', data);
    },

    // Track custom event
    event(eventName, params = {}) {
        const data = {
            event: eventName,
            ...params,
            timestamp: new Date().toISOString()
        };

        if (window.gtag) {
            gtag('event', eventName, params);
        }

        if (window.plausible) {
            plausible(eventName, { props: params });
        }

        this.log('event', data);
    },

    // ========================================
    // E-COMMERCE TRACKING
    // ========================================

    // Track add to cart
    addToCart(item, quantity = 1) {
        this.event('add_to_cart', {
            currency: 'VND',
            value: item.price * quantity,
            items: [{
                item_id: item.id,
                item_name: item.name,
                item_category: item.category,
                price: item.price,
                quantity: quantity
            }]
        });
    },

    // Track remove from cart
    removeFromCart(item, quantity = 1) {
        this.event('remove_from_cart', {
            currency: 'VND',
            value: item.price * quantity,
            items: [{
                item_id: item.id,
                item_name: item.name,
                price: item.price,
                quantity: quantity
            }]
        });
    },

    // Track checkout begin
    beginCheckout(cart, total) {
        this.event('begin_checkout', {
            currency: 'VND',
            value: total,
            items: cart.map(item => ({
                item_id: item.id,
                item_name: item.name,
                price: item.price,
                quantity: item.quantity
            }))
        });
    },

    // Track purchase complete
    purchase(orderId, items, total) {
        this.event('purchase', {
            transaction_id: orderId,
            currency: 'VND',
            value: total,
            items: items.map(item => ({
                item_id: item.id,
                item_name: item.name,
                price: item.price,
                quantity: item.quantity
            }))
        });
    },

    // ========================================
    // USER ENGAGEMENT
    // ========================================

    // Track menu view
    viewMenu(category) {
        this.event('view_menu', {
            category: category
        });
    },

    // Track search
    search(query, resultsCount) {
        this.event('search', {
            search_term: query,
            results_count: resultsCount
        });
    },

    // Track loyalty action
    loyaltyAction(action, points) {
        this.event('loyalty_action', {
            action: action,
            points: points
        });
    },

    // Track member signup
    memberSignup(method = 'phone') {
        this.event('sign_up', {
            method: method
        });
    },

    // ========================================
    // AUTO TRACKING
    // ========================================

    setupAutoTracking() {
        // Track navigation clicks
        document.addEventListener('click', (e) => {
            const navItem = e.target.closest('.nav-item, .nav-btn, .bottom-nav-item');
            if (navItem) {
                const page = navItem.dataset.page || navItem.dataset.section;
                if (page) {
                    this.event('navigation', { destination: page });
                }
            }

            // Track button clicks
            const btn = e.target.closest('button[id], .btn-primary, .btn-secondary');
            if (btn && btn.id) {
                this.event('button_click', { button_id: btn.id });
            }
        });

        // Track section visibility
        if ('IntersectionObserver' in window) {
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting && entry.intersectionRatio > 0.5) {
                        const sectionId = entry.target.id;
                        if (sectionId) {
                            this.event('section_view', { section: sectionId });
                        }
                    }
                });
            }, { threshold: 0.5 });

            document.querySelectorAll('section[id]').forEach(section => {
                observer.observe(section);
            });
        }

        // Track time on page
        let startTime = Date.now();
        window.addEventListener('beforeunload', () => {
            const timeSpent = Math.round((Date.now() - startTime) / 1000);
            this.event('time_on_page', { seconds: timeSpent });
        });
    },

    // ========================================
    // LOCAL TRACKING (FALLBACK)
    // ========================================

    log(type, data) {
        if (this.config.debug) {
            console.log(`📊 [${type}]`, data);
        }

        // Store locally for dashboard
        try {
            const logs = JSON.parse(localStorage.getItem('analytics_log') || '[]');
            logs.push({ type, data, timestamp: Date.now() });
            // Keep only last 100 events
            localStorage.setItem('analytics_log', JSON.stringify(logs.slice(-100)));
        } catch (e) {
            // Ignore storage errors
        }
    },

    // Get local analytics data
    getLocalData() {
        try {
            return JSON.parse(localStorage.getItem('analytics_log') || '[]');
        } catch (e) {
            return [];
        }
    },

    // Get summary stats
    getSummary() {
        const logs = this.getLocalData();
        const today = new Date().toDateString();
        const todayLogs = logs.filter(l =>
            new Date(l.timestamp).toDateString() === today
        );

        return {
            totalEvents: logs.length,
            todayEvents: todayLogs.length,
            pageViews: logs.filter(l => l.type === 'pageview').length,
            purchases: logs.filter(l => l.data?.event === 'purchase').length,
            lastEvent: logs[logs.length - 1] || null
        };
    }
};

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    Analytics.init();
});

// Export
window.Analytics = Analytics;
