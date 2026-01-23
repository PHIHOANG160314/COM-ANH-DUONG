// PM2 Ecosystem Configuration for Antigravity Claude Proxy
// Always-on proxy management with auto-restart

module.exports = {
    apps: [{
        name: 'antigravity-proxy',
        script: 'antigravity-claude-proxy',
        cwd: 'd:\\COM ANH DUONG\\CAD',

        // Auto-restart settings
        autorestart: true,
        watch: false,
        max_restarts: 10,
        min_uptime: '10s',
        restart_delay: 3000,

        // Exponential backoff restart delay
        exp_backoff_restart_delay: 100,

        // Memory limit - restart if exceeds
        max_memory_restart: '500M',

        // Environment
        env: {
            NODE_ENV: 'production'
        },

        // Logging
        log_file: 'd:\\COM ANH DUONG\\CAD\\logs\\proxy.log',
        error_file: 'd:\\COM ANH DUONG\\CAD\\logs\\proxy-error.log',
        out_file: 'd:\\COM ANH DUONG\\CAD\\logs\\proxy-out.log',
        log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
        merge_logs: true,

        // Windows compatibility
        kill_timeout: 5000,
        listen_timeout: 8000,

        // Graceful shutdown
        wait_ready: true,
        shutdown_with_message: true
    }]
}
