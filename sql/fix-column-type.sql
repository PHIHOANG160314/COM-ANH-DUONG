-- =====================================================
-- FIX: Change active_items column type to accept any ID format
-- Run this in Supabase SQL Editor
-- =====================================================

-- Step 1: Change column type from integer[] to text[]
-- This allows both numeric IDs (1, 2, 3) and string IDs ("M024")
ALTER TABLE daily_menu_config 
ALTER COLUMN active_items TYPE text[] 
USING active_items::text[];

-- Step 2: Also fix featured_items_config if it has the same issue
ALTER TABLE featured_items_config 
ALTER COLUMN item_ids TYPE text[] 
USING item_ids::text[];

-- Step 3: Verify the change
SELECT column_name, data_type, udt_name 
FROM information_schema.columns 
WHERE table_name = 'daily_menu_config';
