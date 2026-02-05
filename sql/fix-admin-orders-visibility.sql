-- =====================================================
-- FIX ADMIN ORDERS VISIBILITY
-- Run this in Supabase SQL Editor
-- =====================================================

-- 1. Orders Table Policies
-- Drop strict policies that might be blocking access due to empty staff_claims
DROP POLICY IF EXISTS "Authenticated staff can view orders" ON orders;
DROP POLICY IF EXISTS "Staff can view all orders" ON orders;
DROP POLICY IF EXISTS "Authenticated staff can update orders" ON orders;
DROP POLICY IF EXISTS "Staff can update orders" ON orders;
DROP POLICY IF EXISTS "Admin can delete orders" ON orders;

-- Create standard permissive policies for authenticated users (Admin/Staff)
-- This allows any logged-in user to view/manage orders
CREATE POLICY "Authenticated users can view all orders" ON orders
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can update orders" ON orders
    FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Authenticated users can delete orders" ON orders
    FOR DELETE TO authenticated USING (true);


-- 2. Order Items Table Policies
-- Ensure order_items is accessible
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Authenticated users can view order items" ON order_items;
-- Allow view if the parent order is visible (or just true for now)
CREATE POLICY "Authenticated users can view order items" ON order_items
    FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Authenticated users can manage order items" ON order_items;
CREATE POLICY "Authenticated users can manage order items" ON order_items
    FOR ALL TO authenticated USING (true);


-- 3. Profiles/Staff Policies (Optional, ensuring visibility)
-- Ensure profiles are visible to authenticated users
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Authenticated users can view profiles" ON profiles;
CREATE POLICY "Authenticated users can view profiles" ON profiles
    FOR SELECT TO authenticated USING (true);

NOTIFY pgrst, 'reload config';
