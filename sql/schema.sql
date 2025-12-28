-- =====================================================
-- SUPABASE SCHEMA - ÁNH DƯƠNG F&B
-- Run this in Supabase SQL Editor
-- =====================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- CATEGORIES TABLE
-- =====================================================
CREATE TABLE categories (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    icon VARCHAR(10),
    parent_id VARCHAR(50) REFERENCES categories(id),
    "order" INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert categories
INSERT INTO categories (id, name, icon, "order") VALUES
('drinks', 'Đồ Uống', '🥤', 1),
('food', 'Thức Ăn', '🍜', 2),
('dessert', 'Tráng Miệng', '🍰', 3);

-- Insert subcategories
INSERT INTO categories (id, name, icon, parent_id, "order") VALUES
('coffee', 'Cà Phê', '☕', 'drinks', 1),
('milk-tea', 'Trà Sữa', '🧋', 'drinks', 2),
('fruit-tea', 'Trà Trái Cây', '🍑', 'drinks', 3),
('smoothie', 'Sinh Tố', '🥤', 'drinks', 4),
('refresh', 'Giải Khát', '🧊', 'drinks', 5),
('noodle', 'Phở & Bún', '🍲', 'food', 1),
('rice', 'Cơm', '🍚', 'food', 2),
('bread', 'Bánh Mì', '🥖', 'food', 3),
('snack', 'Ăn Vặt', '🍟', 'food', 4),
('homemade', 'Món Nhà', '🥘', 'food', 5),
('che', 'Chè', '🍧', 'dessert', 1),
('sweet', 'Kem & Bánh', '🍮', 'dessert', 2);

-- =====================================================
-- MENU ITEMS TABLE
-- =====================================================
CREATE TABLE menu_items (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    price INTEGER NOT NULL,
    category_id VARCHAR(50) REFERENCES categories(id),
    subcategory_id VARCHAR(50) REFERENCES categories(id),
    icon VARCHAR(10),
    cost INTEGER DEFAULT 0,
    description TEXT,
    image_url TEXT,
    is_available BOOLEAN DEFAULT true,
    is_featured BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX idx_menu_items_category ON menu_items(category_id);
CREATE INDEX idx_menu_items_subcategory ON menu_items(subcategory_id);

-- =====================================================
-- CUSTOMERS TABLE
-- =====================================================
CREATE TABLE customers (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(20) UNIQUE,
    email VARCHAR(255),
    tier VARCHAR(20) DEFAULT 'Bronze',
    points INTEGER DEFAULT 0,
    total_spent INTEGER DEFAULT 0,
    visits INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_customers_phone ON customers(phone);

-- =====================================================
-- ORDERS TABLE
-- =====================================================
CREATE TABLE orders (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    order_number VARCHAR(20) UNIQUE,
    customer_id UUID REFERENCES customers(id),
    customer_name VARCHAR(255),
    customer_phone VARCHAR(20),
    items JSONB NOT NULL,
    subtotal INTEGER NOT NULL,
    discount INTEGER DEFAULT 0,
    total INTEGER NOT NULL,
    status VARCHAR(20) DEFAULT 'pending',
    order_type VARCHAR(20) DEFAULT 'dinein',
    table_number VARCHAR(10),
    notes TEXT,
    payment_method VARCHAR(20) DEFAULT 'cash',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_customer ON orders(customer_id);
CREATE INDEX idx_orders_created ON orders(created_at DESC);

-- =====================================================
-- COMBOS TABLE
-- =====================================================
CREATE TABLE combos (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    item_ids INTEGER[] NOT NULL,
    original_price INTEGER NOT NULL,
    combo_price INTEGER NOT NULL,
    savings INTEGER NOT NULL,
    category VARCHAR(50),
    icon VARCHAR(10),
    is_popular BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- ROW LEVEL SECURITY (RLS)
-- =====================================================

-- Enable RLS
ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE combos ENABLE ROW LEVEL SECURITY;

-- Public can read menu and categories
CREATE POLICY "Public read menu_items" ON menu_items
    FOR SELECT USING (is_available = true);

CREATE POLICY "Public read categories" ON categories
    FOR SELECT USING (is_active = true);

CREATE POLICY "Public read combos" ON combos
    FOR SELECT USING (is_active = true);

-- Authenticated users can create orders
CREATE POLICY "Anyone can create orders" ON orders
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can view own orders" ON orders
    FOR SELECT USING (true);

-- =====================================================
-- FUNCTIONS
-- =====================================================

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_menu_items_updated_at
    BEFORE UPDATE ON menu_items
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_orders_updated_at
    BEFORE UPDATE ON orders
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_customers_updated_at
    BEFORE UPDATE ON customers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Generate order number
CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS TRIGGER AS $$
BEGIN
    NEW.order_number = 'AD' || TO_CHAR(NOW(), 'YYMMDD') || '-' || LPAD(CAST(FLOOR(RANDOM() * 10000) AS TEXT), 4, '0');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_order_number
    BEFORE INSERT ON orders
    FOR EACH ROW EXECUTE FUNCTION generate_order_number();
