-- =====================================================
-- FIX MISSING TABLES SPECIFICALLY FOR ADMIN & USER FEATURES
-- Run this in Supabase SQL Editor
-- =====================================================

-- 1. Create saved_items table (Favorites)
CREATE TABLE IF NOT EXISTS saved_items (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
    menu_item_id INTEGER REFERENCES menu_items(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(customer_id, menu_item_id)
);

-- 2. Create customer_addresses table (Address Book)
CREATE TABLE IF NOT EXISTS customer_addresses (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
    label VARCHAR(50) DEFAULT 'Home', -- Home, Work, etc.
    address TEXT NOT NULL,
    phone VARCHAR(20),
    is_default BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Enable RLS
ALTER TABLE saved_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_addresses ENABLE ROW LEVEL SECURITY;

-- 4. RLS Policies
-- Saved Items: Users can view/manage their own favorites
CREATE POLICY "Users can manage own favorites" ON saved_items
    FOR ALL USING (auth.uid() = customer_id);

-- Addresses: Users can view/manage their own addresses
CREATE POLICY "Users can manage own addresses" ON customer_addresses
    FOR ALL USING (auth.uid() = customer_id);

-- 5. Helper Function for Default Address
CREATE OR REPLACE FUNCTION set_default_address()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.is_default THEN
        UPDATE customer_addresses
        SET is_default = false
        WHERE customer_id = NEW.customer_id AND id != NEW.id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_address_default_update
    BEFORE INSERT OR UPDATE ON customer_addresses
    FOR EACH ROW EXECUTE FUNCTION set_default_address();

-- 6. Grant permissions (if needed for anon roles in dev)
GRANT ALL ON saved_items TO anon, authenticated, service_role;
GRANT ALL ON customer_addresses TO anon, authenticated, service_role;

NOTIFY pgrst, 'reload config';
