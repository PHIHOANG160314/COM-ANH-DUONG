-- =====================================================
-- ENABLE REALTIME ON ORDERS TABLE
-- Run this in Supabase SQL Editor
-- =====================================================

-- Step 1: Check if replica identity is set correctly
-- (Required for UPDATE events to include full row data)
ALTER TABLE orders REPLICA IDENTITY FULL;

-- Step 2: Enable realtime for orders table
-- Go to Supabase Dashboard > Database > Replication
-- OR run this command:
BEGIN;
  -- Check current publication
  DROP PUBLICATION IF EXISTS supabase_realtime;
  
  -- Create new publication including orders table
  CREATE PUBLICATION supabase_realtime FOR TABLE orders;
COMMIT;

-- Alternative: Add orders to existing publication
-- ALTER PUBLICATION supabase_realtime ADD TABLE orders;

-- Step 3: Verify realtime is enabled
SELECT * FROM pg_publication_tables WHERE pubname = 'supabase_realtime';
