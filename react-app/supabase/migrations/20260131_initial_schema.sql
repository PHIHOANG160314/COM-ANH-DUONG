-- =====================================================
-- INITIAL SCHEMA - ÁNH DƯƠNG F&B
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
