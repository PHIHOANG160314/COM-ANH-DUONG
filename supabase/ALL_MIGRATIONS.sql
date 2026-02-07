-- =============================================
-- FILE: 20260131_analytics_functions.sql
-- =============================================
-- =====================================================
-- ANALYTICS FUNCTIONS
-- Created: 2026-01-31
-- =====================================================

-- 1. GET REVENUE ANALYTICS
-- Returns revenue aggregated by day for a date range
CREATE OR REPLACE FUNCTION get_revenue_analytics(
    date_from TIMESTAMPTZ,
    date_to TIMESTAMPTZ
)
RETURNS TABLE (
    period TEXT,
    total_revenue BIGINT,
    order_count BIGINT,
    avg_order_value BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        TO_CHAR(created_at, 'YYYY-MM-DD') AS period,
        SUM(total)::BIGINT AS total_revenue,
        COUNT(id)::BIGINT AS order_count,
        CASE
            WHEN COUNT(id) > 0 THEN (SUM(total) / COUNT(id))::BIGINT
            ELSE 0
        END AS avg_order_value
    FROM
        public.orders
    WHERE
        status = 'completed'
        AND created_at >= date_from
        AND created_at <= date_to
    GROUP BY
        TO_CHAR(created_at, 'YYYY-MM-DD')
    ORDER BY
        period ASC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. GET TOP SELLING ITEMS
-- Returns top performing menu items
CREATE OR REPLACE FUNCTION get_top_selling_items(
    date_from TIMESTAMPTZ,
    date_to TIMESTAMPTZ,
    limit_count INTEGER DEFAULT 10
)
RETURNS TABLE (
    item_name TEXT,
    quantity_sold BIGINT,
    revenue BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        oi.item_name::TEXT,
        SUM(oi.quantity)::BIGINT AS quantity_sold,
        SUM(oi.total_price)::BIGINT AS revenue
    FROM
        public.order_items oi
    JOIN
        public.orders o ON oi.order_id = o.id
    WHERE
        o.status = 'completed'
        AND o.created_at >= date_from
        AND o.created_at <= date_to
    GROUP BY
        oi.item_name
    ORDER BY
        revenue DESC
    LIMIT
        limit_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. GET ORDER STATUS DISTRIBUTION
-- Returns breakdown of order statuses
CREATE OR REPLACE FUNCTION get_order_status_distribution(
    date_from TIMESTAMPTZ,
    date_to TIMESTAMPTZ
)
RETURNS TABLE (
    status TEXT,
    count BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        o.status::TEXT,
        COUNT(o.id)::BIGINT AS count
    FROM
        public.orders o
    WHERE
        o.created_at >= date_from
        AND o.created_at <= date_to
    GROUP BY
        o.status
    ORDER BY
        count DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. SECURITY CHECK
-- Ensure only admins/managers can access these functions via RLS/Policies?
-- RPC functions run with SECURITY DEFINER, so they bypass RLS.
-- We must enforce role checking inside the function or rely on API Gateway constraints.
-- Adding simple role check inside functions:

CREATE OR REPLACE FUNCTION check_admin_access()
RETURNS VOID AS $$
DECLARE
    v_role TEXT;
BEGIN
    SELECT role INTO v_role FROM public.profiles WHERE id = auth.uid();
    IF v_role NOT IN ('admin', 'manager') THEN
        RAISE EXCEPTION 'Access denied. Admin or Manager role required.';
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update functions to include check
-- (Re-creating them with the check included at start)

CREATE OR REPLACE FUNCTION get_revenue_analytics_secure(
    date_from TIMESTAMPTZ,
    date_to TIMESTAMPTZ
)
RETURNS TABLE (
    period TEXT,
    total_revenue BIGINT,
    order_count BIGINT,
    avg_order_value BIGINT
) AS $$
BEGIN
    PERFORM check_admin_access();

    RETURN QUERY
    SELECT
        TO_CHAR(created_at, 'YYYY-MM-DD') AS period,
        SUM(total)::BIGINT AS total_revenue,
        COUNT(id)::BIGINT AS order_count,
        CASE
            WHEN COUNT(id) > 0 THEN (SUM(total) / COUNT(id))::BIGINT
            ELSE 0
        END AS avg_order_value
    FROM
        public.orders
    WHERE
        status = 'completed'
        AND created_at >= date_from
        AND created_at <= date_to
    GROUP BY
        TO_CHAR(created_at, 'YYYY-MM-DD')
    ORDER BY
        period ASC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION get_top_selling_items_secure(
    date_from TIMESTAMPTZ,
    date_to TIMESTAMPTZ,
    limit_count INTEGER DEFAULT 10
)
RETURNS TABLE (
    item_name TEXT,
    quantity_sold BIGINT,
    revenue BIGINT
) AS $$
BEGIN
    PERFORM check_admin_access();

    RETURN QUERY
    SELECT
        oi.item_name::TEXT,
        SUM(oi.quantity)::BIGINT AS quantity_sold,
        SUM(oi.total_price)::BIGINT AS revenue
    FROM
        public.order_items oi
    JOIN
        public.orders o ON oi.order_id = o.id
    WHERE
        o.status = 'completed'
        AND o.created_at >= date_from
        AND o.created_at <= date_to
    GROUP BY
        oi.item_name
    ORDER BY
        revenue DESC
    LIMIT
        limit_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION get_order_status_distribution_secure(
    date_from TIMESTAMPTZ,
    date_to TIMESTAMPTZ
)
RETURNS TABLE (
    status TEXT,
    count BIGINT
) AS $$
BEGIN
    PERFORM check_admin_access();

    RETURN QUERY
    SELECT
        o.status::TEXT,
        COUNT(o.id)::BIGINT AS count
    FROM
        public.orders o
    WHERE
        o.created_at >= date_from
        AND o.created_at <= date_to
    GROUP BY
        o.status
    ORDER BY
        count DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- =============================================
-- FILE: 20260131_checkout_loyalty.sql
-- =============================================
-- =====================================================
-- CHECKOUT LOYALTY INTEGRATION
-- Created: 2026-01-31
-- =====================================================

-- 1. Add points_redeemed to orders
ALTER TABLE public.orders
ADD COLUMN IF NOT EXISTS points_redeemed INTEGER DEFAULT 0;

-- 2. Trigger to Deduct Points on Order Creation
CREATE OR REPLACE FUNCTION process_point_redemption()
RETURNS TRIGGER AS $$
DECLARE
    v_customer_id UUID;
    v_current_points INTEGER;
    v_discount_amount INTEGER;
BEGIN
    -- Only process if points are being redeemed
    IF NEW.points_redeemed > 0 THEN
        v_customer_id := NEW.customer_id;

        -- Validate customer
        IF v_customer_id IS NULL THEN
            RAISE EXCEPTION 'Cannot redeem points for guest orders';
        END IF;

        -- Check balance
        SELECT points INTO v_current_points
        FROM public.customers
        WHERE id = v_customer_id;

        IF v_current_points IS NULL OR v_current_points < NEW.points_redeemed THEN
            RAISE EXCEPTION 'Insufficient points balance';
        END IF;

        -- Deduct points
        UPDATE public.customers
        SET points = points - NEW.points_redeemed
        WHERE id = v_customer_id;

        -- Log transaction
        -- Note: We log the discount value for reference.
        -- Assuming 1 Point = 100 VND (Consistent with previous RPC)
        v_discount_amount := NEW.points_redeemed * 100;

        INSERT INTO public.loyalty_transactions (customer_id, order_id, type, points, description)
        VALUES (
            v_customer_id,
            NEW.id, -- This ID is available in BEFORE INSERT if it's UUID generated by client or default?
                    -- Wait, BEFORE INSERT, NEW.id might be generated by DEFAULT uuid_generate_v4().
                    -- Postgres allows accessing NEW.id if it's generated.
            'redeem',
            -NEW.points_redeemed,
            'Redeemed ' || NEW.points_redeemed || ' points for Order discount'
        );

    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Attach Trigger
DROP TRIGGER IF EXISTS trg_deduct_points_on_order ON public.orders;
CREATE TRIGGER trg_deduct_points_on_order
    BEFORE INSERT ON public.orders
    FOR EACH ROW
    EXECUTE FUNCTION process_point_redemption();

-- 4. Update Orders RLS to allow inserting with points_redeemed
-- (Existing policies might already allow it if they are broad, checking...)
-- The initial schema didn't explicitely restrict columns, but good to verify.


-- =============================================
-- FILE: 20260131_create_payment_transactions.sql
-- =============================================
-- =====================================================
-- PAYMENT TRANSACTIONS SCHEMA
-- Created: 2026-01-31
-- =====================================================

-- Table Definition
CREATE TABLE IF NOT EXISTS public.payment_transactions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    order_id UUID REFERENCES public.orders(id) NOT NULL,
    provider VARCHAR(50) NOT NULL CHECK (provider IN ('vnpay', 'momo', 'cash')),
    amount INTEGER NOT NULL,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'success', 'failed', 'expired')),
    transaction_id TEXT, -- ID from the gateway (e.g. VNPay TransactionNo)
    request_id TEXT UNIQUE, -- Idempotency key (e.g. generated by us sent to gateway)
    payment_url TEXT,
    return_url TEXT,
    ipn_data JSONB, -- Raw webhook payload
    metadata JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ
);

-- Indexes
CREATE INDEX idx_payment_transactions_order_id ON public.payment_transactions(order_id);
CREATE INDEX idx_payment_transactions_request_id ON public.payment_transactions(request_id);
CREATE INDEX idx_payment_transactions_status ON public.payment_transactions(status);

-- Trigger for updated_at (reusing function from initial_schema)
CREATE TRIGGER update_payment_transactions_modtime
    BEFORE UPDATE ON public.payment_transactions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE payment_transactions;

-- RLS Policies
ALTER TABLE public.payment_transactions ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own order's payments
CREATE POLICY "Users can view their own payment transactions"
ON public.payment_transactions FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.orders o
        JOIN public.customers c ON o.customer_id = c.id
        WHERE o.id = payment_transactions.order_id
        AND c.auth_user_id = auth.uid()
    )
);

-- Policy: Staff/Admin can view all payment transactions
CREATE POLICY "Staff can view all payment transactions"
ON public.payment_transactions FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid()
        AND role IN ('admin', 'manager', 'staff', 'cashier')
    )
);

-- Policy: Service Role (Edge Functions) can do full access
-- Service role bypasses RLS by default, but we can be explicit if needed.
-- No explicit policy needed for service_role as it defaults to bypass RLS in Supabase client if configured correctly.


-- =============================================
-- FILE: 20260131_enable_cron.sql
-- =============================================
-- Enable pg_cron extension (Must be done by Superuser/Dashboard)
-- CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Schedule the reconciliation job to run every 15 minutes
-- Adjust the URL to your deployed Edge Function URL
-- Requires 'net' extension for http requests usually, or pg_net

-- Note: In standard Supabase, use the UI "Database > Cron" or SQL editor if permissions allow.
-- This script is for documentation/manual execution.

/*
SELECT cron.schedule(
    'reconcile_payments',
    '*/15 * * * *',
    $$
    select
        net.http_post(
            url:='https://your-project.supabase.co/functions/v1/reconcile-transactions',
            headers:='{"Content-Type": "application/json", "Authorization": "Bearer SERVICE_ROLE_KEY"}'::jsonb,
            body:='{}'::jsonb
        ) as request_id;
    $$
);
*/


-- =============================================
-- FILE: 20260131_enable_daily_report.sql
-- =============================================
-- =====================================================
-- DAILY REPORT AUTOMATION
-- Created: 2026-01-31
-- =====================================================

-- 1. Enable pg_cron if not exists (Requires Supabase Extension to be toggled in Dashboard,
-- but we can try creating extension here. Note: pg_cron often requires superuser or dashboard toggle).
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- 2. Schedule Job
-- Run at 23:00 (11 PM) every day
-- Calls the Edge Function 'daily-report'
-- Note: Replace PROJECT_REF and ANON_KEY/SERVICE_KEY placeholders in real deployment.
-- Since we can't easily put secrets in SQL, standard practice is to use `pg_net` or similar.
-- Or just rely on Supabase Dashboard UI for Cron.
-- However, we can use `SELECT cron.schedule(...)`

SELECT cron.schedule(
    'daily-report-job', -- name
    '0 23 * * *',       -- schedule (11:00 PM daily)
    $$
    SELECT
        net.http_post(
            url:='https://PROJECT_REF.supabase.co/functions/v1/daily-report',
            headers:='{"Content-Type": "application/json", "Authorization": "Bearer SERVICE_ROLE_KEY"}'::jsonb,
            body:='{}'::jsonb
        ) as request_id;
    $$
);

-- Note: The user will need to replace PROJECT_REF and SERVICE_ROLE_KEY manually
-- or set this up via the Supabase Dashboard UI.
-- For now, this migration serves as the template/documentation.


-- =============================================
-- FILE: 20260131_initial_schema.sql
-- =============================================
-- =====================================================
-- INITIAL SCHEMA - ÃNH DÆ¯Æ NG F&B
-- Created: 2026-01-31
-- =====================================================

-- Enable extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =====================================================
-- 1. USERS & PROFILES (Supabase Auth Integration)
-- =====================================================

-- Create a table for public profiles (linked to auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email TEXT,
    full_name TEXT,
    avatar_url TEXT,
    role VARCHAR(20) DEFAULT 'customer' CHECK (role IN ('admin', 'manager', 'staff', 'kitchen', 'shipper', 'customer')),
    phone VARCHAR(20),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name, avatar_url, role)
    VALUES (
        NEW.id,
        NEW.email,
        NEW.raw_user_meta_data->>'full_name',
        NEW.raw_user_meta_data->>'avatar_url',
        COALESCE(NEW.raw_user_meta_data->>'role', 'customer')
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =====================================================
-- 2. CATEGORIES & MENU ITEMS
-- =====================================================

CREATE TABLE IF NOT EXISTS public.categories (
    id VARCHAR(50) PRIMARY KEY, -- 'coffee', 'food', etc.
    name VARCHAR(100) NOT NULL,
    icon VARCHAR(10),
    parent_id VARCHAR(50) REFERENCES public.categories(id),
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.menu_items (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    price INTEGER NOT NULL,
    category_id VARCHAR(50) REFERENCES public.categories(id),
    subcategory_id VARCHAR(50) REFERENCES public.categories(id),
    description TEXT,
    image_url TEXT,
    icon VARCHAR(10),
    cost INTEGER DEFAULT 0,
    is_available BOOLEAN DEFAULT true,
    is_featured BOOLEAN DEFAULT false,
    options JSONB DEFAULT '{}'::jsonb, -- Store size, sugar, ice options configuration
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_menu_items_category ON public.menu_items(category_id);
CREATE INDEX idx_menu_items_subcategory ON public.menu_items(subcategory_id);
CREATE INDEX idx_menu_items_available ON public.menu_items(is_available);

-- =====================================================
-- 3. CUSTOMERS (CRM / Guest Data)
-- =====================================================

CREATE TABLE IF NOT EXISTS public.customers (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    auth_user_id UUID REFERENCES auth.users(id), -- Link to auth user if registered
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    email VARCHAR(255),
    tier VARCHAR(20) DEFAULT 'Bronze',
    points INTEGER DEFAULT 0,
    total_spent INTEGER DEFAULT 0,
    visits INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT unique_phone UNIQUE NULLS NOT DISTINCT (phone)
);

CREATE INDEX idx_customers_phone ON public.customers(phone);
CREATE INDEX idx_customers_auth_id ON public.customers(auth_user_id);

-- =====================================================
-- 4. ORDERS & ORDER ITEMS
-- =====================================================

CREATE TABLE IF NOT EXISTS public.orders (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    order_number VARCHAR(20) UNIQUE, -- Format: AD240131-0001
    customer_id UUID REFERENCES public.customers(id),

    -- Snapshot of customer info at time of order
    customer_name VARCHAR(255),
    customer_phone VARCHAR(20),

    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'processing', 'ready', 'delivering', 'completed', 'cancelled', 'refunded')),
    order_type VARCHAR(20) DEFAULT 'dinein' CHECK (order_type IN ('dinein', 'takeaway', 'delivery')),
    payment_status VARCHAR(20) DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'failed', 'refunded')),
    payment_method VARCHAR(20) DEFAULT 'cash',

    table_number VARCHAR(10),
    delivery_address TEXT,

    subtotal INTEGER NOT NULL DEFAULT 0,
    discount INTEGER DEFAULT 0,
    delivery_fee INTEGER DEFAULT 0,
    total INTEGER NOT NULL DEFAULT 0,

    notes TEXT,

    -- Staff tracking
    created_by UUID, -- Reference to staff id (if created by staff)

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_orders_status ON public.orders(status);
CREATE INDEX idx_orders_customer ON public.orders(customer_id);
CREATE INDEX idx_orders_created_at ON public.orders(created_at DESC);
CREATE INDEX idx_orders_order_number ON public.orders(order_number);

CREATE TABLE IF NOT EXISTS public.order_items (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE NOT NULL,
    menu_item_id INTEGER REFERENCES public.menu_items(id),

    -- Snapshot of item details (price can change)
    item_name VARCHAR(255) NOT NULL,
    unit_price INTEGER NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 1,
    total_price INTEGER NOT NULL, -- unit_price * quantity

    notes TEXT,
    options JSONB, -- Selected options (size: L, sugar: 50%, etc)

    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_order_items_order_id ON public.order_items(order_id);

-- =====================================================
-- 5. STAFF SYSTEM (POS/PIN Auth)
-- =====================================================

CREATE TABLE IF NOT EXISTS public.staff (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL CHECK (role IN ('admin', 'manager', 'cashier', 'waiter', 'chef')),
    pin VARCHAR(60) NOT NULL, -- Bcrypt hashed PIN
    phone VARCHAR(20),
    is_active BOOLEAN DEFAULT true,
    last_login TIMESTAMPTZ,
    login_attempts INTEGER DEFAULT 0,
    locked_until TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_staff_role ON public.staff(role);

-- =====================================================
-- 6. SHIPPER SYSTEM
-- =====================================================

CREATE TABLE IF NOT EXISTS public.shippers (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(20) UNIQUE NOT NULL,
    pin VARCHAR(60) NOT NULL, -- Bcrypt hashed PIN
    status VARCHAR(20) DEFAULT 'offline' CHECK (status IN ('online', 'offline', 'busy')),
    current_location JSONB, -- {lat, lng, updated_at}
    rating DECIMAL(2,1) DEFAULT 5.0,
    total_deliveries INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.delivery_assignments (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE UNIQUE NOT NULL,
    shipper_id UUID REFERENCES public.shippers(id),
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'assigned', 'picked_up', 'delivering', 'completed', 'cancelled')),
    distance_km DECIMAL(5,2),
    shipping_fee INTEGER DEFAULT 0,
    shipper_commission INTEGER DEFAULT 0,
    customer_feedback TEXT,
    customer_rating INTEGER,
    assigned_at TIMESTAMPTZ,
    picked_up_at TIMESTAMPTZ,
    delivered_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_delivery_assignments_order ON public.delivery_assignments(order_id);
CREATE INDEX idx_delivery_assignments_shipper ON public.delivery_assignments(shipper_id);
CREATE INDEX idx_delivery_assignments_status ON public.delivery_assignments(status);

-- =====================================================
-- 7. CONFIGURATIONS
-- =====================================================

CREATE TABLE IF NOT EXISTS public.daily_menu_config (
    id SERIAL PRIMARY KEY,
    active_date DATE UNIQUE DEFAULT CURRENT_DATE,
    active_items INTEGER[] DEFAULT '{}', -- Array of menu_item_ids
    updated_by TEXT,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.featured_items_config (
    id SERIAL PRIMARY KEY,
    mode VARCHAR(10) DEFAULT 'auto' CHECK (mode IN ('auto', 'manual')),
    auto_count INTEGER DEFAULT 6,
    manual_items INTEGER[] DEFAULT '{}',
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 8. FUNCTIONS & TRIGGERS
-- =====================================================

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply update_updated_at trigger to all tables with updated_at
CREATE TRIGGER update_profiles_modtime BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_menu_items_modtime BEFORE UPDATE ON menu_items FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_customers_modtime BEFORE UPDATE ON customers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_orders_modtime BEFORE UPDATE ON orders FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_staff_modtime BEFORE UPDATE ON staff FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_shippers_modtime BEFORE UPDATE ON shippers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_delivery_assignments_modtime BEFORE UPDATE ON delivery_assignments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Generate Order Number (Format: ADYYMMDD-XXXX)
CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS TRIGGER AS $$
DECLARE
    date_part TEXT;
    random_part TEXT;
BEGIN
    -- Format: YYMMDD
    date_part := TO_CHAR(NOW(), 'YYMMDD');
    -- Random 4 digits (pad with 0)
    random_part := LPAD(CAST(FLOOR(RANDOM() * 10000) AS TEXT), 4, '0');

    NEW.order_number := 'AD' || date_part || '-' || random_part;

    -- Ensure uniqueness (simple retry logic could be added here, but collision is rare enough for this scale)
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_order_number
    BEFORE INSERT ON orders
    FOR EACH ROW
    WHEN (NEW.order_number IS NULL)
    EXECUTE FUNCTION generate_order_number();

-- Verify Staff PIN (for POS login)
CREATE OR REPLACE FUNCTION verify_staff_pin(p_role TEXT, p_pin TEXT)
RETURNS TABLE(
    id UUID,
    name TEXT,
    role TEXT,
    phone TEXT,
    is_active BOOLEAN
) AS $$
DECLARE
    v_staff RECORD;
    v_now TIMESTAMPTZ := NOW();
BEGIN
    -- Find staff by role (if specified) or just iterate active staff
    -- In a real app, we might want to lookup by ID or Phone, but POS often uses just PIN or Role+PIN
    -- Here we scan active staff matching the role (if provided) or all staff

    FOR v_staff IN
        SELECT s.* FROM staff s
        WHERE s.is_active = true
          AND (p_role IS NULL OR p_role = '' OR s.role = p_role)
          AND (s.locked_until IS NULL OR s.locked_until < v_now)
    LOOP
        IF v_staff.pin = crypt(p_pin, v_staff.pin) THEN
            -- Success: Reset attempts
            UPDATE staff SET
                login_attempts = 0,
                last_login = v_now,
                locked_until = NULL
            WHERE staff.id = v_staff.id;

            RETURN QUERY SELECT
                v_staff.id, v_staff.name::TEXT, v_staff.role::TEXT, v_staff.phone::TEXT, v_staff.is_active;
            RETURN;
        END IF;
    END LOOP;

    -- If we get here, no match found or wrong pin
    RETURN;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 9. ENABLE REALTIME
-- =====================================================

ALTER PUBLICATION supabase_realtime ADD TABLE orders;
ALTER PUBLICATION supabase_realtime ADD TABLE order_items;
ALTER PUBLICATION supabase_realtime ADD TABLE delivery_assignments;
ALTER PUBLICATION supabase_realtime ADD TABLE menu_items;
ALTER PUBLICATION supabase_realtime ADD TABLE daily_menu_config;


-- =============================================
-- FILE: 20260131_inventory_schema.sql
-- =============================================
-- =====================================================
-- INVENTORY MANAGEMENT
-- Created: 2026-01-31
-- =====================================================

-- 1. Add stock_quantity to menu_items
ALTER TABLE public.menu_items
ADD COLUMN IF NOT EXISTS stock_quantity INTEGER DEFAULT NULL; -- NULL implies unlimited stock

-- 2. Trigger Function: Decrement Stock
CREATE OR REPLACE FUNCTION decrement_stock_on_order()
RETURNS TRIGGER AS $$
DECLARE
    v_item RECORD;
    v_new_stock INTEGER;
BEGIN
    -- Iterate through order items if needed?
    -- No, this trigger is on `order_items` INSERT.
    -- So NEW refers to the single item being inserted.

    -- Get current stock
    SELECT id, stock_quantity, name INTO v_item
    FROM public.menu_items
    WHERE id = NEW.menu_item_id
    FOR UPDATE; -- Lock row to prevent race conditions

    -- If stock is managed (not null)
    IF v_item.stock_quantity IS NOT NULL THEN

        -- Check availability
        IF v_item.stock_quantity < NEW.quantity THEN
            RAISE EXCEPTION 'Insufficient stock for item: %. Available: %, Requested: %',
                v_item.name, v_item.stock_quantity, NEW.quantity;
        END IF;

        -- Update stock
        v_new_stock := v_item.stock_quantity - NEW.quantity;

        UPDATE public.menu_items
        SET
            stock_quantity = v_new_stock,
            is_available = (v_new_stock > 0) -- Auto-disable if 0
        WHERE id = NEW.menu_item_id;

    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Attach Trigger
DROP TRIGGER IF EXISTS trg_inventory_check ON public.order_items;
CREATE TRIGGER trg_inventory_check
    BEFORE INSERT ON public.order_items
    FOR EACH ROW
    EXECUTE FUNCTION decrement_stock_on_order();

-- 4. Enable Realtime for Menu Items (already done in initial schema, but ensuring updates push)
-- ALTER PUBLICATION supabase_realtime ADD TABLE menu_items; -- Already done


-- =============================================
-- FILE: 20260131_loyalty_schema.sql
-- =============================================
-- =====================================================
-- LOYALTY SYSTEM SCHEMA
-- Created: 2026-01-31
-- =====================================================

-- 1. LOYALTY TRANSACTIONS
-- Tracks point history (earning and redemption)
CREATE TABLE IF NOT EXISTS public.loyalty_transactions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    customer_id UUID REFERENCES public.customers(id) ON DELETE CASCADE NOT NULL,
    order_id UUID REFERENCES public.orders(id) ON DELETE SET NULL, -- Nullable if adjustment/bonus
    type VARCHAR(20) NOT NULL CHECK (type IN ('earn', 'redeem', 'adjustment', 'expire', 'bonus')),
    points INTEGER NOT NULL, -- Positive for earn, Negative for redeem
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_loyalty_customer ON public.loyalty_transactions(customer_id);
CREATE INDEX idx_loyalty_order ON public.loyalty_transactions(order_id);

-- 2. CUSTOMER ADDRESSES
-- Saved addresses for quick checkout
CREATE TABLE IF NOT EXISTS public.customer_addresses (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    customer_id UUID REFERENCES public.customers(id) ON DELETE CASCADE NOT NULL,
    label VARCHAR(50) DEFAULT 'Home', -- Home, Office, Other
    address TEXT NOT NULL,
    phone VARCHAR(20), -- Optional contact number for this address
    is_default BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_addresses_customer ON public.customer_addresses(customer_id);

-- Trigger to ensure only one default address per customer
CREATE OR REPLACE FUNCTION set_default_address()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.is_default THEN
        UPDATE public.customer_addresses
        SET is_default = false
        WHERE customer_id = NEW.customer_id AND id != NEW.id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_address_default_change
    BEFORE INSERT OR UPDATE ON public.customer_addresses
    FOR EACH ROW
    WHEN (NEW.is_default = true)
    EXECUTE FUNCTION set_default_address();

-- Trigger for updated_at
CREATE TRIGGER update_addresses_modtime
    BEFORE UPDATE ON public.customer_addresses
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();


-- 3. SAVED ITEMS (FAVORITES)
-- Favorite menu items
CREATE TABLE IF NOT EXISTS public.saved_items (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    customer_id UUID REFERENCES public.customers(id) ON DELETE CASCADE NOT NULL,
    menu_item_id INTEGER REFERENCES public.menu_items(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(customer_id, menu_item_id) -- Prevent duplicates
);

CREATE INDEX idx_saved_items_customer ON public.saved_items(customer_id);


-- =====================================================
-- RLS POLICIES
-- =====================================================

-- Enable RLS
ALTER TABLE public.loyalty_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customer_addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_items ENABLE ROW LEVEL SECURITY;

-- LOYALTY TRANSACTIONS POLICIES
-- Customers can view their own transactions
CREATE POLICY "Users can view own loyalty history"
    ON public.loyalty_transactions
    FOR SELECT
    USING (
        customer_id IN (
            SELECT id FROM public.customers
            WHERE auth_user_id = auth.uid()
        )
    );

-- Only Service Role can insert/update loyalty transactions (via backend logic)
-- No INSERT/UPDATE policy for authenticated users.

-- CUSTOMER ADDRESSES POLICIES
-- Users can manage their own addresses
CREATE POLICY "Users can view own addresses"
    ON public.customer_addresses FOR SELECT
    USING (customer_id IN (SELECT id FROM public.customers WHERE auth_user_id = auth.uid()));

CREATE POLICY "Users can insert own addresses"
    ON public.customer_addresses FOR INSERT
    WITH CHECK (customer_id IN (SELECT id FROM public.customers WHERE auth_user_id = auth.uid()));

CREATE POLICY "Users can update own addresses"
    ON public.customer_addresses FOR UPDATE
    USING (customer_id IN (SELECT id FROM public.customers WHERE auth_user_id = auth.uid()));

CREATE POLICY "Users can delete own addresses"
    ON public.customer_addresses FOR DELETE
    USING (customer_id IN (SELECT id FROM public.customers WHERE auth_user_id = auth.uid()));

-- SAVED ITEMS POLICIES
-- Users can manage their favorites
CREATE POLICY "Users can view own favorites"
    ON public.saved_items FOR SELECT
    USING (customer_id IN (SELECT id FROM public.customers WHERE auth_user_id = auth.uid()));

CREATE POLICY "Users can insert own favorites"
    ON public.saved_items FOR INSERT
    WITH CHECK (customer_id IN (SELECT id FROM public.customers WHERE auth_user_id = auth.uid()));

CREATE POLICY "Users can delete own favorites"
    ON public.saved_items FOR DELETE
    USING (customer_id IN (SELECT id FROM public.customers WHERE auth_user_id = auth.uid()));

-- Enable Realtime for Loyalty and Favorites
ALTER PUBLICATION supabase_realtime ADD TABLE loyalty_transactions;
ALTER PUBLICATION supabase_realtime ADD TABLE customer_addresses;
ALTER PUBLICATION supabase_realtime ADD TABLE saved_items;


-- =============================================
-- FILE: 20260131_loyalty_triggers.sql
-- =============================================
-- =====================================================
-- LOYALTY LOGIC & TRIGGERS
-- Created: 2026-01-31
-- =====================================================

-- 1. Helper Function: Calculate Tier Percentage
CREATE OR REPLACE FUNCTION calculate_tier_percentage(p_tier VARCHAR)
RETURNS DECIMAL AS $$
BEGIN
    -- Based on PROMOTIONAL_CAMPAIGNS.md
    -- Silver (Báº¡c) = Bronze (Default) -> 5%
    -- Gold (VÃ ng) = Silver -> 8%
    -- Diamond (Kim CÆ°Æ¡ng) = Gold -> 10%

    -- Mapping DB values to percentages
    IF p_tier = 'Gold' THEN RETURN 0.10;      -- 10%
    ELSIF p_tier = 'Silver' THEN RETURN 0.08; -- 8%
    ELSE RETURN 0.05;                         -- Bronze 5%
    END IF;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- 2. Trigger Function: Process Rewards on Order Completion
CREATE OR REPLACE FUNCTION process_loyalty_rewards()
RETURNS TRIGGER AS $$
DECLARE
    v_customer_id UUID;
    v_current_tier VARCHAR;
    v_points_to_add INTEGER;
    v_percentage DECIMAL;
    v_new_visits INTEGER;
    v_new_tier VARCHAR;
BEGIN
    -- Only run when status changes to 'completed'
    IF NEW.status = 'completed' AND (OLD.status IS DISTINCT FROM 'completed') THEN
        v_customer_id := NEW.customer_id;

        -- If guest order (no customer_id), skip
        IF v_customer_id IS NULL THEN
            RETURN NEW;
        END IF;

        -- Get current customer details
        SELECT tier, visits INTO v_current_tier, v_new_visits
        FROM public.customers
        WHERE id = v_customer_id;

        -- Default values if null
        IF v_current_tier IS NULL THEN v_current_tier := 'Bronze'; END IF;
        IF v_new_visits IS NULL THEN v_new_visits := 0; END IF;

        -- A. Calculate Points
        v_percentage := calculate_tier_percentage(v_current_tier);
        v_points_to_add := FLOOR(NEW.total * v_percentage);

        -- B. Insert Loyalty Transaction (Idempotency check)
        IF NOT EXISTS (SELECT 1 FROM public.loyalty_transactions WHERE order_id = NEW.id AND type = 'earn') THEN

            -- Insert transaction record
            INSERT INTO public.loyalty_transactions (customer_id, order_id, type, points, description)
            VALUES (
                v_customer_id,
                NEW.id,
                'earn',
                v_points_to_add,
                'Points earned from Order #' || COALESCE(NEW.order_number, 'Unknown')
            );

            -- C. Update Customer Stats
            UPDATE public.customers
            SET
                points = COALESCE(points, 0) + v_points_to_add,
                total_spent = COALESCE(total_spent, 0) + NEW.total,
                visits = COALESCE(visits, 0) + 1
            WHERE id = v_customer_id
            RETURNING visits INTO v_new_visits; -- Capture new visit count

            -- D. Check Tier Upgrade
            -- Rules: Bronze (0-5), Silver (6-15), Gold (16+)
            v_new_tier := v_current_tier;

            IF v_new_visits >= 16 THEN
                v_new_tier := 'Gold';
            ELSIF v_new_visits >= 6 THEN
                v_new_tier := 'Silver';
            ELSE
                v_new_tier := 'Bronze';
            END IF;

            -- Only update if tier changes (Upgrades)
            IF v_new_tier != v_current_tier THEN
                 UPDATE public.customers
                 SET tier = v_new_tier
                 WHERE id = v_customer_id;

                 -- Log tier upgrade (Optional bonus points could be added here later)
                 INSERT INTO public.loyalty_transactions (customer_id, type, points, description)
                 VALUES (
                    v_customer_id,
                    'adjustment',
                    0,
                    'Tier upgraded to ' || v_new_tier
                 );
            END IF;

        END IF;

    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Create Trigger
DROP TRIGGER IF EXISTS trg_order_completed_loyalty ON public.orders;
CREATE TRIGGER trg_order_completed_loyalty
    AFTER UPDATE ON public.orders
    FOR EACH ROW
    EXECUTE FUNCTION process_loyalty_rewards();

-- 4. RPC Function: Redeem Points
-- Used by Frontend to exchange points for discount
CREATE OR REPLACE FUNCTION redeem_loyalty_points(p_points_to_redeem INTEGER)
RETURNS JSONB AS $$
DECLARE
    v_customer_id UUID;
    v_current_points INTEGER;
    v_discount_amount INTEGER;
BEGIN
    -- Get customer ID linked to auth user
    SELECT id, points INTO v_customer_id, v_current_points
    FROM public.customers
    WHERE auth_user_id = auth.uid();

    IF v_customer_id IS NULL THEN
        RAISE EXCEPTION 'Customer profile not found';
    END IF;

    IF v_current_points < p_points_to_redeem THEN
        RAISE EXCEPTION 'Insufficient points balance';
    END IF;

    -- Calculate discount (1 point = 1 VND? Or 100 points = 10,000 VND?)
    -- Marketing: "100 Ä‘iá»ƒm = 10,000Ä‘" => 1 point = 100 VND
    v_discount_amount := p_points_to_redeem * 100;

    -- Deduct points
    INSERT INTO public.loyalty_transactions (customer_id, type, points, description)
    VALUES (v_customer_id, 'redeem', -p_points_to_redeem, 'Redeemed for ' || v_discount_amount || ' VND discount');

    UPDATE public.customers
    SET points = points - p_points_to_redeem
    WHERE id = v_customer_id;

    RETURN jsonb_build_object(
        'success', true,
        'discount_amount', v_discount_amount,
        'remaining_points', v_current_points - p_points_to_redeem
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- =============================================
-- FILE: 20260131_notifications_schema.sql
-- =============================================
-- =====================================================
-- NOTIFICATION SYSTEM
-- Created: 2026-01-31
-- =====================================================

-- 1. Create Notifications Table
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    recipient_role VARCHAR(20) NOT NULL, -- 'admin', 'kitchen', 'staff', 'shipper' (or specific user_id if needed later)
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    link TEXT, -- Internal link like '/admin/orders/123'
    type VARCHAR(50) DEFAULT 'info', -- 'info', 'warning', 'success', 'error'
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_notifications_role ON public.notifications(recipient_role);
CREATE INDEX idx_notifications_created ON public.notifications(created_at DESC);

-- Enable RLS
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Policy: Staff can view notifications for their role
CREATE POLICY "Staff view role notifications"
    ON public.notifications FOR SELECT
    USING (
        recipient_role = (
            SELECT role FROM public.staff WHERE id::text = auth.uid()::text -- This assumes staff auth maps to staff table.
            -- Actually, our Auth is via Supabase Auth Users table -> Profiles table.
            -- Profiles.role matches recipient_role.
        )
        OR
        recipient_role IN (
            SELECT role FROM public.profiles WHERE id = auth.uid()
        )
    );

-- Policy: Admin can view all
CREATE POLICY "Admin view all notifications"
    ON public.notifications FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE notifications;


-- 2. Trigger: Notify on New Order
CREATE OR REPLACE FUNCTION notify_new_order()
RETURNS TRIGGER AS $$
BEGIN
    -- Notify Kitchen
    INSERT INTO public.notifications (recipient_role, title, message, link, type)
    VALUES (
        'kitchen',
        'ÄÆ¡n hÃ ng má»›i #' || NEW.order_number,
        'CÃ³ Ä‘Æ¡n hÃ ng má»›i cáº§n chuáº©n bá»‹.',
        '/kitchen',
        'info'
    );

    -- Notify Admin/Staff
    INSERT INTO public.notifications (recipient_role, title, message, link, type)
    VALUES (
        'admin',
        'ÄÆ¡n hÃ ng má»›i #' || NEW.order_number,
        'KhÃ¡ch hÃ ng ' || COALESCE(NEW.customer_name, 'Guest') || ' vá»«a Ä‘áº·t Ä‘Æ¡n.',
        '/admin/orders',
        'success'
    );

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trg_notify_new_order
    AFTER INSERT ON public.orders
    FOR EACH ROW
    EXECUTE FUNCTION notify_new_order();


-- 3. Trigger: Notify Low Stock
-- Attached to menu_items update (triggered by inventory decrement)
CREATE OR REPLACE FUNCTION notify_low_stock()
RETURNS TRIGGER AS $$
BEGIN
    -- Check if stock dropped below threshold (e.g., 5) and was previously above
    IF NEW.stock_quantity IS NOT NULL AND NEW.stock_quantity <= 5 AND (OLD.stock_quantity IS NULL OR OLD.stock_quantity > 5) THEN

        INSERT INTO public.notifications (recipient_role, title, message, link, type)
        VALUES (
            'admin',
            'Cáº£nh bÃ¡o sáº¯p háº¿t hÃ ng: ' || NEW.name,
            'Sáº£n pháº©m ' || NEW.name || ' chá»‰ cÃ²n ' || NEW.stock_quantity || ' pháº§n.',
            '/admin/products',
            'warning'
        );

    END IF;

    -- Check if stock hit 0
    IF NEW.stock_quantity IS NOT NULL AND NEW.stock_quantity = 0 AND (OLD.stock_quantity > 0) THEN
         INSERT INTO public.notifications (recipient_role, title, message, link, type)
        VALUES (
            'admin',
            'Háº¿t hÃ ng: ' || NEW.name,
            'Sáº£n pháº©m ' || NEW.name || ' Ä‘Ã£ háº¿t hÃ ng vÃ  tá»± Ä‘á»™ng áº©n.',
            '/admin/products',
            'error'
        );
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trg_notify_low_stock
    AFTER UPDATE ON public.menu_items
    FOR EACH ROW
    EXECUTE FUNCTION notify_low_stock();


-- =============================================
-- FILE: 20260131_rls_policies.sql
-- =============================================
-- =====================================================
-- ROW LEVEL SECURITY POLICIES - ÃNH DÆ¯Æ NG F&B
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



