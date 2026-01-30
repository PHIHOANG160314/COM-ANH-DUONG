-- =====================================================
-- ENABLE SUPABASE REALTIME FOR DAILY MENU SYNC
-- Run this in Supabase Dashboard → SQL Editor
-- =====================================================

-- Enable Realtime for daily_menu_config table
ALTER PUBLICATION supabase_realtime ADD TABLE daily_menu_config;

-- Enable Realtime for featured_items_config table
ALTER PUBLICATION supabase_realtime ADD TABLE featured_items_config;

-- Verify (should show the tables in the publication)
SELECT * FROM pg_publication_tables WHERE pubname = 'supabase_realtime';
