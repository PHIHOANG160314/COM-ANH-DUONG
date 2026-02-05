-- Fix RLS policy for order_items table
-- Run this in Supabase SQL Editor if orders are not showing

-- First, check if RLS is enabled
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "Allow read order_items" ON order_items;
DROP POLICY IF EXISTS "Allow insert order_items" ON order_items;
DROP POLICY IF EXISTS "order_items_select_policy" ON order_items;
DROP POLICY IF EXISTS "order_items_insert_policy" ON order_items;

-- Create permissive read policy (allows all authenticated users to read)
CREATE POLICY "order_items_select_all"
ON order_items
FOR SELECT
TO authenticated
USING (true);

-- Create permissive insert policy
CREATE POLICY "order_items_insert_all"
ON order_items
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Also allow anon users to insert (for guest checkout)
CREATE POLICY "order_items_insert_anon"
ON order_items
FOR INSERT
TO anon
WITH CHECK (true);

-- Grant necessary permissions
GRANT SELECT ON order_items TO authenticated;
GRANT INSERT ON order_items TO authenticated;
GRANT SELECT ON order_items TO anon;
GRANT INSERT ON order_items TO anon;

-- Also ensure orders table has proper RLS
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "orders_select_all" ON orders;
DROP POLICY IF EXISTS "orders_insert_all" ON orders;

CREATE POLICY "orders_select_all"
ON orders
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "orders_insert_all"
ON orders
FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "orders_insert_anon"
ON orders
FOR INSERT
TO anon
WITH CHECK (true);

GRANT SELECT ON orders TO authenticated;
GRANT INSERT ON orders TO authenticated;
GRANT SELECT ON orders TO anon;
GRANT INSERT ON orders TO anon;
