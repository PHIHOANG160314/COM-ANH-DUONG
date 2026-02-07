// =====================================================
// ENVIRONMENT CONFIG - ÁNH DƯƠNG F&B
// Secure configuration with runtime detection
// =====================================================

(function () {
    'use strict';

    // Check if running on Vercel with environment variables
    // In production, these should be set via Vercel Dashboard > Settings > Environment Variables
    const isProduction = window.location.hostname.includes('vercel.app') ||
        window.location.hostname === 'comanhduong.com' ||
        window.location.hostname.includes('.vercel.app');

    // Default config (for local development only)
    // IMPORTANT: In production, replace with environment-injected values
    const DEFAULT_CONFIG = {
        // These are public anon keys - safe to expose but better to inject
        SUPABASE_URL: 'https://rnhtfaxqnvikedwufvcd.supabase.co',
        SUPABASE_ANON_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJuaHRmYXhxbnZpa2Vkd3VmdmNkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY5MTU5ODksImV4cCI6MjA4MjQ5MTk4OX0.4T0tGpULmokG-m5RJMWVy2IxluBiPYVOwUMVhyFQbSk',

        // Error Tracking - Get DSN from https://sentry.io
        SENTRY_DSN: '',

        // Google Analytics 4 - Get ID from https://analytics.google.com
        GA4_MEASUREMENT_ID: '',

        // Plausible Analytics - Get from https://plausible.io
        PLAUSIBLE_DOMAIN: ''
    };

    // Try to get config from Vercel-injected global (if using edge functions)
    // Or from data attributes on script tag
    function getConfig() {
        // Method 1: Check for Vercel edge-injected config
        if (window.__ENV__) {
            return { ...DEFAULT_CONFIG, ...window.__ENV__ };
        }

        // Method 2: Check for inline config from build process
        if (window.__CONFIG__) {
            return { ...DEFAULT_CONFIG, ...window.__CONFIG__ };
        }

        // Method 3: Use defaults (for development)
        return DEFAULT_CONFIG;
    }

    // Export config
    window.ENV = Object.freeze(getConfig());

    // Security: Prevent modification
    Object.defineProperty(window, 'ENV', {
        configurable: false,
        writable: false
    });

    // Log status (only in development)
    if (!isProduction && window.Debug) {
        Debug.info('✅ Environment loaded:', window.ENV.SUPABASE_URL);
        Debug.warn('⚠️ Running in development mode - API keys visible in source');
    }

    // Security warning for production without proper config
    if (isProduction && !window.__ENV__ && !window.__CONFIG__) {
        console.warn(
            '⚠️ Security Notice: Running in production without injected environment variables.\n' +
            'Consider using Vercel Environment Variables for better security.\n' +
            'See: https://vercel.com/docs/concepts/projects/environment-variables'
        );
    }
})();
