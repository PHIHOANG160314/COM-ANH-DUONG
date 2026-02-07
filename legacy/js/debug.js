/**
 * F&B Master - Debug Utility
 * Author: Google DeepMind / Antigravity Team
 * Description: Production-ready logging utility with environment detection.
 */

const Debug = {
    // Set to false in production
    enabled: window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1',

    log(...args) {
        if (this.enabled) console.log('[DEBUG]', ...args);
    },

    info(...args) {
        console.log('✅', ...args);  // Status messages always shown
    },

    warn(...args) {
        console.warn('⚠️', ...args);
    },

    error(...args) {
        console.error('❌', ...args);
    }
};

window.Debug = Debug;
