-- =====================================================
-- MIGRATION: Create missing tables for Daily Menu Sync
-- Run this in Supabase Dashboard → SQL Editor
-- =====================================================

-- 1. DAILY MENU CONFIG TABLE
CREATE TABLE IF NOT EXISTS daily_menu_config (
    id SERIAL PRIMARY KEY,
    active_items INTEGER[] DEFAULT '{}',
    active_date DATE DEFAULT CURRENT_DATE,
    updated_at TIMESTAMPTZ DEFAULT now(),
    updated_by TEXT
);

-- Create unique index on active_date
CREATE UNIQUE INDEX IF NOT EXISTS idx_daily_menu_config_date 
ON daily_menu_config(active_date);

-- Enable RLS
ALTER TABLE daily_menu_config ENABLE ROW LEVEL SECURITY;

-- Policy: Everyone can read
DROP POLICY IF EXISTS "Anyone can read daily menu config" ON daily_menu_config;
CREATE POLICY "Anyone can read daily menu config" 
ON daily_menu_config FOR SELECT USING (true);

-- Policy: Anyone can modify (for demo)
DROP POLICY IF EXISTS "Anyone can modify daily menu config" ON daily_menu_config;
CREATE POLICY "Anyone can modify daily menu config" 
ON daily_menu_config FOR ALL USING (true) WITH CHECK (true);

-- 2. FEATURED ITEMS CONFIG TABLE
CREATE TABLE IF NOT EXISTS featured_items_config (
    id SERIAL PRIMARY KEY,
    mode VARCHAR(10) DEFAULT 'auto' CHECK (mode IN ('auto', 'manual')),
    auto_count INTEGER DEFAULT 6,
    auto_cache_hours INTEGER DEFAULT 1,
    manual_items INTEGER[] DEFAULT '{}',
    last_auto_update TIMESTAMPTZ,
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE featured_items_config ENABLE ROW LEVEL SECURITY;

-- Policy: Everyone can read
DROP POLICY IF EXISTS "Anyone can read featured config" ON featured_items_config;
CREATE POLICY "Anyone can read featured config" 
ON featured_items_config FOR SELECT USING (true);

-- Policy: Anyone can modify (for demo)
DROP POLICY IF EXISTS "Anyone can modify featured config" ON featured_items_config;
CREATE POLICY "Anyone can modify featured config" 
ON featured_items_config FOR ALL USING (true) WITH CHECK (true);

-- 3. INSERT DEFAULT DATA
INSERT INTO daily_menu_config (active_items, active_date)
VALUES ('{}', CURRENT_DATE)
ON CONFLICT (active_date) DO NOTHING;

INSERT INTO featured_items_config (mode, auto_count, auto_cache_hours)
VALUES ('auto', 6, 1)
ON CONFLICT DO NOTHING;

-- 4. ENABLE REALTIME (optional, may fail if already added)
-- ALTER PUBLICATION supabase_realtime ADD TABLE daily_menu_config;
-- ALTER PUBLICATION supabase_realtime ADD TABLE featured_items_config;

SELECT 'Migration completed! Tables created:' as status,
       (SELECT COUNT(*) FROM daily_menu_config) as daily_menu_rows,
       (SELECT COUNT(*) FROM featured_items_config) as featured_items_rows;
