-- Create order_items table if not exists
CREATE TABLE IF NOT EXISTS public.order_items (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    order_id UUID NOT NULL,
    menu_item_id INTEGER,
    item_name VARCHAR(255) NOT NULL,
    unit_price INTEGER NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 1,
    total_price INTEGER NOT NULL,
    notes TEXT,
    options JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON public.order_items(order_id);

-- Enable realtime if needed
DO $$ BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE order_items;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
