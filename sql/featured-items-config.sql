-- =====================================================
-- FEATURED ITEMS CONFIG TABLE
-- Quản lý mục "Món bán chạy" từ Admin
-- =====================================================

CREATE TABLE IF NOT EXISTS featured_items_config (
    id SERIAL PRIMARY KEY,
    mode VARCHAR(10) DEFAULT 'auto' CHECK (mode IN ('auto', 'manual')),
    auto_count INTEGER DEFAULT 6,          -- Số món khi mode=auto
    auto_cache_hours INTEGER DEFAULT 1,    -- Cache 1 giờ
    manual_items INTEGER[] DEFAULT '{}',   -- Danh sách item_id khi mode=manual
    last_auto_update TIMESTAMPTZ,          -- Lần cuối cập nhật auto
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE featured_items_config ENABLE ROW LEVEL SECURITY;

-- Policy: Everyone can read
CREATE POLICY "Anyone can read featured config" 
ON featured_items_config FOR SELECT 
USING (true);

-- Policy: Authenticated users can modify
CREATE POLICY "Authenticated users can modify featured config" 
ON featured_items_config FOR ALL 
USING (true)
WITH CHECK (true);

-- Enable Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE featured_items_config;

-- Insert default config
INSERT INTO featured_items_config (mode, auto_count, auto_cache_hours)
VALUES ('auto', 6, 1)
ON CONFLICT DO NOTHING;

-- Trigger auto-update timestamp
CREATE OR REPLACE FUNCTION update_featured_items_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_featured_items_timestamp ON featured_items_config;
CREATE TRIGGER trigger_update_featured_items_timestamp
BEFORE UPDATE ON featured_items_config
FOR EACH ROW EXECUTE FUNCTION update_featured_items_timestamp();

-- =====================================================
-- VIEW: Top selling items (for auto mode)
-- Parse JSONB from orders.items (không dùng order_items table)
-- =====================================================
CREATE OR REPLACE VIEW top_selling_items AS
SELECT 
    (item->>'id')::INTEGER as item_id,
    item->>'name' as item_name,
    SUM((item->>'qty')::INTEGER) as total_sold,
    COUNT(*) as order_count
FROM orders,
     jsonb_array_elements(items) as item
WHERE created_at > NOW() - INTERVAL '7 days'
  AND status NOT IN ('cancelled')
GROUP BY item->>'id', item->>'name'
ORDER BY total_sold DESC
LIMIT 6;

