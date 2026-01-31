-- =====================================================
-- PRODUCTS SCHEMA - ÁNH DƯƠNG F&B
-- Created: 2026-06-14
-- Purpose: Create products table matching React app TypeScript types
-- =====================================================

-- Enable extensions (if not already enabled)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- 1. UPDATE CATEGORIES TABLE
-- Add slug column and ensure UUID primary key compatibility
-- =====================================================

-- Add slug column if not exists
ALTER TABLE public.categories 
ADD COLUMN IF NOT EXISTS slug VARCHAR(100);

-- Add image_url column if not exists (React types expect this)
ALTER TABLE public.categories 
ADD COLUMN IF NOT EXISTS image_url TEXT;

-- Update existing categories with slugs
UPDATE public.categories SET slug = 'pho' WHERE id = 'pho' AND slug IS NULL;
UPDATE public.categories SET slug = 'com' WHERE id = 'com' AND slug IS NULL;
UPDATE public.categories SET slug = 'banh-mi' WHERE id = 'banh-mi' AND slug IS NULL;
UPDATE public.categories SET slug = 'mon-an-kem' WHERE id = 'mon-an-kem' AND slug IS NULL;
UPDATE public.categories SET slug = 'drinks' WHERE id = 'drinks' AND slug IS NULL;
UPDATE public.categories SET slug = 'dessert' WHERE id = 'dessert' AND slug IS NULL;

-- =====================================================
-- 2. CREATE PRODUCTS TABLE
-- This is what the React app TypeScript types expect
-- =====================================================

CREATE TABLE IF NOT EXISTS public.products (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    category_id VARCHAR(50) REFERENCES public.categories(id),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price INTEGER NOT NULL DEFAULT 0,
    image_url TEXT,
    is_active BOOLEAN DEFAULT true,
    is_sold_out BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_products_category ON public.products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_active ON public.products(is_active);
CREATE INDEX IF NOT EXISTS idx_products_name ON public.products(name);

-- Apply update_updated_at trigger
DROP TRIGGER IF EXISTS update_products_modtime ON products;
CREATE TRIGGER update_products_modtime 
    BEFORE UPDATE ON products 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- 3. ROW LEVEL SECURITY (RLS)
-- =====================================================

-- Enable RLS
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- Allow public read access (menu visibility)
CREATE POLICY "Products are publicly readable"
    ON public.products
    FOR SELECT
    USING (true);

-- Allow authenticated users with admin/staff role to modify
CREATE POLICY "Staff can insert products"
    ON public.products
    FOR INSERT
    TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role IN ('admin', 'manager', 'staff')
        )
    );

CREATE POLICY "Staff can update products"
    ON public.products
    FOR UPDATE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role IN ('admin', 'manager', 'staff')
        )
    );

CREATE POLICY "Admin can delete products"
    ON public.products
    FOR DELETE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role IN ('admin', 'manager')
        )
    );

-- =====================================================
-- 4. ENABLE REALTIME
-- =====================================================

ALTER PUBLICATION supabase_realtime ADD TABLE products;

-- =====================================================
-- 5. MIGRATE DATA FROM menu_items TO products (Optional)
-- Run this if you have existing data in menu_items
-- =====================================================

-- INSERT INTO public.products (category_id, name, description, price, image_url, is_active, created_at)
-- SELECT category_id, name, description, price, image_url, is_available, created_at
-- FROM public.menu_items
-- WHERE NOT EXISTS (SELECT 1 FROM public.products WHERE products.name = menu_items.name);
