-- =====================================================
-- ENFORCE STORE HOURS
-- Created: 2026-02-02
-- Purpose: Prevent orders outside operating hours (8:00 - 22:00 UTC+7)
-- =====================================================

CREATE OR REPLACE FUNCTION public.is_store_open()
RETURNS BOOLEAN
LANGUAGE plpgsql
IMMUTABLE
AS $$
DECLARE
    v_current_hour INTEGER;
    v_open_hour INTEGER := 8;
    v_close_hour INTEGER := 22;
BEGIN
    -- Get current hour in Vietnam Time (Asia/Ho_Chi_Minh)
    -- Postgres stores timestamps in UTC. timezone('Asia/Ho_Chi_Minh', now()) converts UTC now() to local time.
    v_current_hour := EXTRACT(HOUR FROM timezone('Asia/Ho_Chi_Minh', now()));

    RETURN v_current_hour >= v_open_hour AND v_current_hour < v_close_hour;
END;
$$;

-- Modify create_order_atomic to check store hours
CREATE OR REPLACE FUNCTION public.create_order_atomic(
    p_order_payload JSONB,
    p_items_payload JSONB
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_order_id UUID;
    v_order_result JSONB;
BEGIN
    -- 0. Check Store Hours
    IF NOT public.is_store_open() THEN
        RAISE EXCEPTION 'Store is closed. Operating hours are 8:00 - 22:00';
    END IF;

    -- 1. Insert Order
    INSERT INTO public.orders (
        customer_id,
        customer_name,
        customer_phone,
        delivery_address,
        notes,
        subtotal,
        discount,
        total,
        points_redeemed,
        status,
        payment_method,
        payment_status,
        order_type,
        created_at
    )
    VALUES (
        (p_order_payload->>'customer_id')::UUID,
        p_order_payload->>'customer_name',
        p_order_payload->>'customer_phone',
        p_order_payload->>'delivery_address',
        p_order_payload->>'notes',
        (p_order_payload->>'subtotal')::INTEGER,
        (p_order_payload->>'discount')::INTEGER,
        (p_order_payload->>'total')::INTEGER,
        COALESCE((p_order_payload->>'points_redeemed')::INTEGER, 0),
        p_order_payload->>'status',
        p_order_payload->>'payment_method',
        p_order_payload->>'payment_status',
        p_order_payload->>'order_type',
        NOW()
    )
    RETURNING id INTO v_order_id;

    -- 2. Insert Order Items
    INSERT INTO public.order_items (
        order_id,
        menu_item_id,
        item_name,
        unit_price,
        quantity,
        total_price,
        notes
    )
    SELECT
        v_order_id,
        (item->>'menu_item_id')::INTEGER,
        item->>'item_name',
        (item->>'unit_price')::INTEGER,
        (item->>'quantity')::INTEGER,
        (item->>'total_price')::INTEGER,
        item->>'notes'
    FROM jsonb_array_elements(p_items_payload) AS item;

    -- 3. Return the created order
    SELECT to_jsonb(o) INTO v_order_result
    FROM public.orders o
    WHERE o.id = v_order_id;

    RETURN v_order_result;

EXCEPTION WHEN OTHERS THEN
    -- Propagate error to client
    RAISE EXCEPTION 'Order creation failed: %', SQLERRM;
END;
$$;
