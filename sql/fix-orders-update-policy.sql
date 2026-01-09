-- =====================================================
-- FIX: Add UPDATE policy for orders table
-- Run this in Supabase SQL Editor
-- =====================================================

-- Allow anyone to update orders (for Kitchen to update status)
CREATE POLICY "Anyone can update orders" ON orders
    FOR UPDATE USING (true) WITH CHECK (true);

-- Alternative: If you want more restrictive, only allow status updates
-- CREATE POLICY "Anyone can update order status" ON orders
--     FOR UPDATE USING (true) WITH CHECK (true);
