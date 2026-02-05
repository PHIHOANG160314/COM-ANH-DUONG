-- =====================================================
-- FIX POS ORDER CREATION (INSERT POLICY)
-- Run this in Supabase SQL Editor
-- =====================================================

-- 1. Allow Authenticated Users to CREATE Orders (INSERT)
-- This was missing from the previous fix, causing "Lỗi khi lên đơn"
CREATE POLICY "Authenticated users can create orders" ON orders
    FOR INSERT TO authenticated 
    WITH CHECK (true);

-- 2. Allow Authenticated Users to CREATE Order Items (INSERT)
-- POS creates items immediately after order
CREATE POLICY "Authenticated users can create order items" ON order_items
    FOR INSERT TO authenticated 
    WITH CHECK (true);

NOTIFY pgrst, 'reload config';
