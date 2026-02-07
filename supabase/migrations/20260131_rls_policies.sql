-- =====================================================
-- ROW LEVEL SECURITY POLICIES - ÁNH DƯƠNG F&B
-- Created: 2026-01-31
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.staff ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shippers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.delivery_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_menu_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.featured_items_config ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- 1. PUBLIC ACCESS (Unauthenticated)
-- =====================================================

-- Anyone can read categories and active menu items
CREATE POLICY "Public can view categories" ON public.categories
    FOR SELECT USING (is_active = true);

CREATE POLICY "Public can view active menu items" ON public.menu_items
    FOR SELECT USING (is_available = true);

-- Anyone can view daily menu config
CREATE POLICY "Public can view daily menu config" ON public.daily_menu_config
    FOR SELECT USING (true);

CREATE POLICY "Public can view featured items config" ON public.featured_items_config
    FOR SELECT USING (true);

-- =====================================================
-- 2. CUSTOMERS (Authenticated & Anonymous)
-- =====================================================

-- Customers can view their own profile
CREATE POLICY "Users can view own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = id);

-- Customers can update their own profile
CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

-- Customers can create orders (Anonymous or Auth)
CREATE POLICY "Anyone can create orders" ON public.orders
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Anyone can create order items" ON public.order_items
    FOR INSERT WITH CHECK (true);

-- Customers can view their own orders (if authenticated)
-- Note: For anonymous users, we might rely on client-side storage or session IDs,
-- but RLS mainly protects auth users. Anonymous access might be handled via service role or public policy restricted by order ID if needed.
-- Here we allow users to see orders linked to their customer record if linked to auth
CREATE POLICY "Users can view own orders" ON public.orders
    FOR SELECT USING (
        auth.uid() IN (
            SELECT auth_user_id FROM public.customers WHERE id = orders.customer_id
        )
    );

CREATE POLICY "Users can view own order items" ON public.order_items
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.orders o
            JOIN public.customers c ON o.customer_id = c.id
            WHERE o.id = order_items.order_id
            AND c.auth_user_id = auth.uid()
        )
    );

-- =====================================================
-- 3. STAFF & ADMIN ACCESS
-- =====================================================
-- We use a helper function to check if user is admin/staff
-- But since we have a separate 'staff' table for POS PIN auth, standard Supabase Auth users might be Admins.
-- Let's assume Admins/Managers login via Supabase Auth and have 'admin' or 'manager' role in profiles.

CREATE OR REPLACE FUNCTION public.is_admin_or_manager()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid()
        AND role IN ('admin', 'manager')
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Admins/Managers have full access
CREATE POLICY "Admins have full access to profiles" ON public.profiles FOR ALL USING (public.is_admin_or_manager());
CREATE POLICY "Admins have full access to categories" ON public.categories FOR ALL USING (public.is_admin_or_manager());
CREATE POLICY "Admins have full access to menu_items" ON public.menu_items FOR ALL USING (public.is_admin_or_manager());
CREATE POLICY "Admins have full access to customers" ON public.customers FOR ALL USING (public.is_admin_or_manager());
CREATE POLICY "Admins have full access to orders" ON public.orders FOR ALL USING (public.is_admin_or_manager());
CREATE POLICY "Admins have full access to order_items" ON public.order_items FOR ALL USING (public.is_admin_or_manager());
CREATE POLICY "Admins have full access to staff" ON public.staff FOR ALL USING (public.is_admin_or_manager());
CREATE POLICY "Admins have full access to shippers" ON public.shippers FOR ALL USING (public.is_admin_or_manager());
CREATE POLICY "Admins have full access to delivery_assignments" ON public.delivery_assignments FOR ALL USING (public.is_admin_or_manager());

-- =====================================================
-- 4. POS / KITCHEN / SHIPPER DEVICES
-- =====================================================
-- Often POS devices use a generic "service account" or a shared "staff" login if using Supabase Auth.
-- OR they access via public API using the `staff` table PIN verification (which uses Service Role on backend).
-- If the React App uses the Supabase Client directly for POS functions without logging in as a Supabase User,
-- it will be "anon". Anon usually has restricted access.
--
-- RECOMMENDATION:
-- The POS app should authenticate as a generic "staff" user (Supabase Auth) to get a JWT,
-- OR use Anonymous authentication but specific RLS policies are hard for "verified via PIN".
--
-- ALTERNATIVE:
-- The `verify_staff_pin` function is SECURITY DEFINER, so it can bypass RLS to check credentials.
-- Once verified, the frontend might store a session. But for direct DB access (Realtime), we need a valid JWT.
--
-- For simplicity in this setup, we will allow "Authenticated" users (any logged in user) to read most operational data,
-- assuming "staff" role check is done in UI or via specific policies.
-- But wait, Customers are also Authenticated users. We must distinguish.

-- Let's define policies based on Profile Role.

CREATE POLICY "Staff can view all orders" ON public.orders
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid()
            AND role IN ('staff', 'manager', 'admin', 'kitchen')
        )
    );

CREATE POLICY "Staff can update orders" ON public.orders
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid()
            AND role IN ('staff', 'manager', 'admin', 'kitchen')
        )
    );

CREATE POLICY "Kitchen can view active orders" ON public.order_items
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid()
            AND role IN ('staff', 'manager', 'admin', 'kitchen')
        )
    );

-- =====================================================
-- 5. SERVICE ROLE OVERRIDES
-- =====================================================
-- The Service Role (server-side) always bypasses RLS.
-- These policies are for Client-Side (Supabase JS) access.
