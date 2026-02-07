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
