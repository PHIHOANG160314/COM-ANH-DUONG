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
