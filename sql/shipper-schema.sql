-- =====================================================
-- SHIPPER SYSTEM SCHEMA - ÁNH DƯƠNG F&B
-- Run this in Supabase SQL Editor
-- =====================================================

-- =====================================================
-- SHIPPERS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS shippers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(20) UNIQUE NOT NULL,
    pin VARCHAR(10) NOT NULL,
    status VARCHAR(20) DEFAULT 'offline', -- online, offline, busy
    current_location JSONB, -- {lat, lng, updated_at}
    rating DECIMAL(2,1) DEFAULT 5.0,
    total_deliveries INTEGER DEFAULT 0,
    total_earnings INTEGER DEFAULT 0,
    commission_rate INTEGER DEFAULT 15000, -- 15k per delivery
    avatar_url TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_shippers_phone ON shippers(phone);
CREATE INDEX IF NOT EXISTS idx_shippers_status ON shippers(status);

-- =====================================================
-- DELIVERY ASSIGNMENTS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS delivery_assignments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE NOT NULL,
    shipper_id UUID REFERENCES shippers(id) ON DELETE SET NULL,
    status VARCHAR(20) DEFAULT 'pending', -- pending, assigned, picked_up, delivering, completed, cancelled
    assigned_at TIMESTAMPTZ,
    picked_up_at TIMESTAMPTZ,
    delivered_at TIMESTAMPTZ,
    customer_rating INTEGER CHECK (customer_rating >= 1 AND customer_rating <= 5),
    customer_feedback TEXT,
    distance_km DECIMAL(5,2),
    commission INTEGER,
    delivery_notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(order_id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_delivery_shipper ON delivery_assignments(shipper_id);
CREATE INDEX IF NOT EXISTS idx_delivery_status ON delivery_assignments(status);
CREATE INDEX IF NOT EXISTS idx_delivery_order ON delivery_assignments(order_id);

-- =====================================================
-- ROW LEVEL SECURITY (RLS)
-- =====================================================

-- Enable RLS
ALTER TABLE shippers ENABLE ROW LEVEL SECURITY;
ALTER TABLE delivery_assignments ENABLE ROW LEVEL SECURITY;

-- Shippers policies
CREATE POLICY "Anyone can view shippers" ON shippers
    FOR SELECT USING (is_active = true);

CREATE POLICY "Service can manage shippers" ON shippers
    FOR ALL USING (true);

-- Delivery assignments policies
CREATE POLICY "Anyone can view assignments" ON delivery_assignments
    FOR SELECT USING (true);

CREATE POLICY "Anyone can insert assignments" ON delivery_assignments
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Anyone can update assignments" ON delivery_assignments
    FOR UPDATE USING (true);

-- =====================================================
-- TRIGGERS
-- =====================================================

-- Auto-update updated_at for shippers
CREATE TRIGGER update_shippers_updated_at
    BEFORE UPDATE ON shippers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Auto-update updated_at for delivery_assignments
CREATE TRIGGER update_delivery_assignments_updated_at
    BEFORE UPDATE ON delivery_assignments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- =====================================================
-- FUNCTIONS
-- =====================================================

-- Function to update shipper stats after delivery completion
CREATE OR REPLACE FUNCTION update_shipper_stats()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
        UPDATE shippers SET
            total_deliveries = total_deliveries + 1,
            total_earnings = total_earnings + COALESCE(NEW.commission, commission_rate),
            updated_at = NOW()
        WHERE id = NEW.shipper_id;
        
        -- Update shipper rating if customer rated
        IF NEW.customer_rating IS NOT NULL THEN
            UPDATE shippers SET
                rating = (
                    SELECT ROUND(AVG(customer_rating)::numeric, 1)
                    FROM delivery_assignments
                    WHERE shipper_id = NEW.shipper_id
                    AND customer_rating IS NOT NULL
                ),
                updated_at = NOW()
            WHERE id = NEW.shipper_id;
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_delivery_completed
    AFTER UPDATE ON delivery_assignments
    FOR EACH ROW EXECUTE FUNCTION update_shipper_stats();

-- =====================================================
-- ENABLE REALTIME
-- =====================================================
ALTER PUBLICATION supabase_realtime ADD TABLE shippers;
ALTER PUBLICATION supabase_realtime ADD TABLE delivery_assignments;

-- =====================================================
-- INSERT SAMPLE SHIPPERS (for testing)
-- =====================================================
INSERT INTO shippers (name, phone, pin, status, commission_rate) VALUES
('Shipper Demo', '0901234567', '1234', 'offline', 15000),
('Nguyễn Văn Shipper', '0909876543', '5678', 'offline', 15000)
ON CONFLICT (phone) DO NOTHING;

-- =====================================================
-- VERIFICATION QUERY
-- =====================================================
-- Run this to verify tables created:
-- SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_name IN ('shippers', 'delivery_assignments');
