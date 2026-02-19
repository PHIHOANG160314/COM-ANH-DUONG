-- Fix RLS policies for Orders and Order Items to prevent anonymous creation
-- Based on Security Audit 2026-02-12

-- =====================================================
-- 1. ORDERS
-- =====================================================
-- Drop insecure policy
DROP POLICY IF EXISTS "Anyone can create orders" ON public.orders;

-- Create secure policy (Authenticated users only, must own the customer record)
CREATE POLICY "Authenticated users can create orders" ON public.orders
FOR INSERT TO authenticated
WITH CHECK (
    auth.uid() IN (
        SELECT auth_user_id FROM public.customers WHERE id = customer_id
    )
);

-- =====================================================
-- 2. ORDER ITEMS
-- =====================================================
-- Drop insecure policy
DROP POLICY IF EXISTS "Anyone can create order items" ON public.order_items;

-- Create secure policy
CREATE POLICY "Authenticated users can create order items" ON public.order_items
FOR INSERT TO authenticated
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.orders o
        JOIN public.customers c ON o.customer_id = c.id
        WHERE o.id = order_id
        AND c.auth_user_id = auth.uid()
    )
);

-- =====================================================
-- 3. CUSTOMERS
-- =====================================================
-- Ensure users can manage their own customer record to link with orders

DROP POLICY IF EXISTS "Users can view own customer data" ON public.customers;
CREATE POLICY "Users can view own customer data" ON public.customers
FOR SELECT TO authenticated
USING (auth_user_id = auth.uid());

DROP POLICY IF EXISTS "Users can create own customer data" ON public.customers;
CREATE POLICY "Users can create own customer data" ON public.customers
FOR INSERT TO authenticated
WITH CHECK (auth_user_id = auth.uid());

DROP POLICY IF EXISTS "Users can update own customer data" ON public.customers;
CREATE POLICY "Users can update own customer data" ON public.customers
FOR UPDATE TO authenticated
USING (auth_user_id = auth.uid());
