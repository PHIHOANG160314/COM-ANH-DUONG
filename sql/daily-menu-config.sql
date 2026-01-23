-- =====================================================
-- DAILY MENU CONFIG TABLE
-- Enables realtime sync across devices
-- =====================================================

-- Create table for daily menu configuration
CREATE TABLE IF NOT EXISTS daily_menu_config (
    id SERIAL PRIMARY KEY,
    active_items INTEGER[] DEFAULT '{}',
    active_date DATE DEFAULT CURRENT_DATE,
    updated_at TIMESTAMPTZ DEFAULT now(),
    updated_by TEXT
);

-- Create unique index on active_date (only one config per day)
CREATE UNIQUE INDEX IF NOT EXISTS idx_daily_menu_config_date 
ON daily_menu_config(active_date);

-- Enable Row Level Security
ALTER TABLE daily_menu_config ENABLE ROW LEVEL SECURITY;

-- Policy: Everyone can read
CREATE POLICY "Anyone can read daily menu config" 
ON daily_menu_config FOR SELECT 
USING (true);

-- Policy: Authenticated users can insert/update
CREATE POLICY "Authenticated users can modify daily menu config" 
ON daily_menu_config FOR ALL 
USING (true)
WITH CHECK (true);

-- Enable Realtime for this table
ALTER PUBLICATION supabase_realtime ADD TABLE daily_menu_config;

-- Insert default row for today if not exists
INSERT INTO daily_menu_config (active_items, active_date)
VALUES ('{}', CURRENT_DATE)
ON CONFLICT (active_date) DO NOTHING;

-- Function to auto-update updated_at
CREATE OR REPLACE FUNCTION update_daily_menu_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for auto-update
DROP TRIGGER IF EXISTS trigger_update_daily_menu_timestamp ON daily_menu_config;
CREATE TRIGGER trigger_update_daily_menu_timestamp
BEFORE UPDATE ON daily_menu_config
FOR EACH ROW EXECUTE FUNCTION update_daily_menu_timestamp();
