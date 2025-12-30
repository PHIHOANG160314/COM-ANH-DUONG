// =====================================================
// ENVIRONMENT CONFIG - ÁNH DƯƠNG F&B
// Load this before supabase-client.js
// =====================================================

window.ENV = {
    SUPABASE_URL: 'https://rnhtfaxqnvikedwufvcd.supabase.co',
    SUPABASE_ANON_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJuaHRmYXhxbnZpa2Vkd3VmdmNkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY5MTU5ODksImV4cCI6MjA4MjQ5MTk4OX0.4T0tGpULmokG-m5RJMWVy2IxluBiPYVOwUMVhyFQbSk',
    // Sentry Error Tracking - Get DSN from https://sentry.io
    SENTRY_DSN: ''  // Add your Sentry DSN here when ready
};

console.log('✅ Environment loaded:', window.ENV.SUPABASE_URL);
