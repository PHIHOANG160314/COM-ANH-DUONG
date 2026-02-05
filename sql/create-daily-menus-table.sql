-- =====================================================
-- CREATE DAILY MENUS TABLE
-- Run this in Supabase SQL Editor
-- =====================================================

-- 1. Create table
CREATE TABLE IF NOT EXISTS daily_menus (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    product_id INTEGER NOT NULL REFERENCES menu_items(id) ON DELETE CASCADE,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(date, product_id)
);

-- 2. Create index for matching today's date quickly
CREATE INDEX IF NOT EXISTS idx_daily_menus_date ON daily_menus(date);

-- 3. Enable RLS
ALTER TABLE daily_menus ENABLE ROW LEVEL SECURITY;

-- 4. Policies
-- Public can see (for Homepage)
DROP POLICY IF EXISTS "Public read daily_menus" ON daily_menus;
CREATE POLICY "Public read daily_menus" ON daily_menus
    FOR SELECT USING (true);

-- Admin/Staff can manage
DROP POLICY IF EXISTS "Authenticated users manage daily_menus" ON daily_menus;
CREATE POLICY "Authenticated users manage daily_menus" ON daily_menus
    FOR ALL TO authenticated USING (true);

-- 5. Reload Schema Cache
NOTIFY pgrst, 'reload config';
