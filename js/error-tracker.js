// =====================================================
// SENTRY ERROR TRACKING - ÁNH DƯƠNG F&B
// =====================================================
// To enable Sentry, create a project at sentry.io and add your DSN

(function () {
    'use strict';

    // Sentry Configuration
    const SENTRY_CONFIG = {
        dsn: window.ENV?.SENTRY_DSN || '',
        environment: window.location.hostname.includes('localhost') ? 'development' : 'production',
        release: 'anh-duong-fb@1.0.0',
        enabled: true
    };

    // Check if Sentry should be enabled
    const isSentryConfigured = () => {
        return SENTRY_CONFIG.dsn && SENTRY_CONFIG.dsn.startsWith('https://');
    };

    // Initialize Sentry (lazy load from CDN)
    const initSentry = async () => {
        if (!isSentryConfigured()) {
            console.log('ℹ️ Sentry not configured. Error tracking disabled.');
            return;
        }

        try {
            // Load Sentry from CDN
            const script = document.createElement('script');
            script.src = 'https://browser.sentry-cdn.com/8.0.0/bundle.min.js';
            script.crossOrigin = 'anonymous';

            script.onload = () => {
                if (window.Sentry) {
                    window.Sentry.init({
                        dsn: SENTRY_CONFIG.dsn,
                        environment: SENTRY_CONFIG.environment,
                        release: SENTRY_CONFIG.release,
                        integrations: [],
                        tracesSampleRate: 0.1,
                        beforeSend(event) {
                            // Filter out non-critical errors
                            if (event.exception) {
                                const message = event.exception.values?.[0]?.value || '';
                                // Skip common non-critical errors
                                if (message.includes('ResizeObserver') ||
                                    message.includes('Script error')) {
                                    return null;
                                }
                            }
                            return event;
                        }
                    });
                    console.log('✅ Sentry initialized');
                }
            };

            script.onerror = () => {
                console.warn('⚠️ Failed to load Sentry SDK');
            };

            document.head.appendChild(script);
        } catch (error) {
            console.warn('⚠️ Sentry initialization failed:', error);
        }
    };

    // Custom error reporter (works with or without Sentry)
    window.ErrorTracker = {
        // Capture exception
        captureException: (error, context = {}) => {
            console.error('🚨 Error:', error, context);

            if (window.Sentry) {
                window.Sentry.captureException(error, { extra: context });
            }

            // Also log to localStorage for debugging
            try {
                const errors = JSON.parse(localStorage.getItem('app_errors') || '[]');
                errors.push({
                    timestamp: new Date().toISOString(),
                    message: error.message || String(error),
                    stack: error.stack,
                    context,
                    url: window.location.href
                });
                // Keep only last 50 errors
                localStorage.setItem('app_errors', JSON.stringify(errors.slice(-50)));
            } catch (e) {
                // Ignore localStorage errors
            }
        },

        // Capture message
        captureMessage: (message, level = 'info') => {
            console.log(`📝 [${level}]`, message);

            if (window.Sentry) {
                window.Sentry.captureMessage(message, level);
            }
        },

        // Set user context
        setUser: (user) => {
            if (window.Sentry) {
                window.Sentry.setUser(user);
            }
        },

        // Add breadcrumb
        addBreadcrumb: (category, message, data = {}) => {
            if (window.Sentry) {
                window.Sentry.addBreadcrumb({
                    category,
                    message,
                    data,
                    level: 'info'
                });
            }
        },

        // Get local error log
        getErrorLog: () => {
            try {
                return JSON.parse(localStorage.getItem('app_errors') || '[]');
            } catch (e) {
                return [];
            }
        },

        // Clear error log
        clearErrorLog: () => {
            localStorage.removeItem('app_errors');
        }
    };

    // Global error handlers
    window.addEventListener('error', (event) => {
        ErrorTracker.captureException(event.error || new Error(event.message), {
            filename: event.filename,
            lineno: event.lineno,
            colno: event.colno
        });
    });

    window.addEventListener('unhandledrejection', (event) => {
        ErrorTracker.captureException(
            event.reason instanceof Error ? event.reason : new Error(String(event.reason)),
            { type: 'unhandledrejection' }
        );
    });

    // Initialize on DOM ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initSentry);
    } else {
        initSentry();
    }

    console.log('✅ Error Tracker loaded');
})();
