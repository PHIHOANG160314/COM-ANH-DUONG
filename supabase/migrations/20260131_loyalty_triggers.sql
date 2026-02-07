-- =====================================================
-- LOYALTY LOGIC & TRIGGERS
-- Created: 2026-01-31
-- =====================================================

-- 1. Helper Function: Calculate Tier Percentage
CREATE OR REPLACE FUNCTION calculate_tier_percentage(p_tier VARCHAR)
RETURNS DECIMAL AS $$
BEGIN
    -- Based on PROMOTIONAL_CAMPAIGNS.md
    -- Silver (Bạc) = Bronze (Default) -> 5%
    -- Gold (Vàng) = Silver -> 8%
    -- Diamond (Kim Cương) = Gold -> 10%

    -- Mapping DB values to percentages
    IF p_tier = 'Gold' THEN RETURN 0.10;      -- 10%
    ELSIF p_tier = 'Silver' THEN RETURN 0.08; -- 8%
    ELSE RETURN 0.05;                         -- Bronze 5%
    END IF;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- 2. Trigger Function: Process Rewards on Order Completion
CREATE OR REPLACE FUNCTION process_loyalty_rewards()
RETURNS TRIGGER AS $$
DECLARE
    v_customer_id UUID;
    v_current_tier VARCHAR;
    v_points_to_add INTEGER;
    v_percentage DECIMAL;
    v_new_visits INTEGER;
    v_new_tier VARCHAR;
BEGIN
    -- Only run when status changes to 'completed'
    IF NEW.status = 'completed' AND (OLD.status IS DISTINCT FROM 'completed') THEN
        v_customer_id := NEW.customer_id;

        -- If guest order (no customer_id), skip
        IF v_customer_id IS NULL THEN
            RETURN NEW;
        END IF;

        -- Get current customer details
        SELECT tier, visits INTO v_current_tier, v_new_visits
        FROM public.customers
        WHERE id = v_customer_id;

        -- Default values if null
        IF v_current_tier IS NULL THEN v_current_tier := 'Bronze'; END IF;
        IF v_new_visits IS NULL THEN v_new_visits := 0; END IF;

        -- A. Calculate Points
        v_percentage := calculate_tier_percentage(v_current_tier);
        v_points_to_add := FLOOR(NEW.total * v_percentage);

        -- B. Insert Loyalty Transaction (Idempotency check)
        IF NOT EXISTS (SELECT 1 FROM public.loyalty_transactions WHERE order_id = NEW.id AND type = 'earn') THEN

            -- Insert transaction record
            INSERT INTO public.loyalty_transactions (customer_id, order_id, type, points, description)
            VALUES (
                v_customer_id,
                NEW.id,
                'earn',
                v_points_to_add,
                'Points earned from Order #' || COALESCE(NEW.order_number, 'Unknown')
            );

            -- C. Update Customer Stats
            UPDATE public.customers
            SET
                points = COALESCE(points, 0) + v_points_to_add,
                total_spent = COALESCE(total_spent, 0) + NEW.total,
                visits = COALESCE(visits, 0) + 1
            WHERE id = v_customer_id
            RETURNING visits INTO v_new_visits; -- Capture new visit count

            -- D. Check Tier Upgrade
            -- Rules: Bronze (0-5), Silver (6-15), Gold (16+)
            v_new_tier := v_current_tier;

            IF v_new_visits >= 16 THEN
                v_new_tier := 'Gold';
            ELSIF v_new_visits >= 6 THEN
                v_new_tier := 'Silver';
            ELSE
                v_new_tier := 'Bronze';
            END IF;

            -- Only update if tier changes (Upgrades)
            IF v_new_tier != v_current_tier THEN
                 UPDATE public.customers
                 SET tier = v_new_tier
                 WHERE id = v_customer_id;

                 -- Log tier upgrade (Optional bonus points could be added here later)
                 INSERT INTO public.loyalty_transactions (customer_id, type, points, description)
                 VALUES (
                    v_customer_id,
                    'adjustment',
                    0,
                    'Tier upgraded to ' || v_new_tier
                 );
            END IF;

        END IF;

    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Create Trigger
DROP TRIGGER IF EXISTS trg_order_completed_loyalty ON public.orders;
CREATE TRIGGER trg_order_completed_loyalty
    AFTER UPDATE ON public.orders
    FOR EACH ROW
    EXECUTE FUNCTION process_loyalty_rewards();

-- 4. RPC Function: Redeem Points
-- Used by Frontend to exchange points for discount
CREATE OR REPLACE FUNCTION redeem_loyalty_points(p_points_to_redeem INTEGER)
RETURNS JSONB AS $$
DECLARE
    v_customer_id UUID;
    v_current_points INTEGER;
    v_discount_amount INTEGER;
BEGIN
    -- Get customer ID linked to auth user
    SELECT id, points INTO v_customer_id, v_current_points
    FROM public.customers
    WHERE auth_user_id = auth.uid();

    IF v_customer_id IS NULL THEN
        RAISE EXCEPTION 'Customer profile not found';
    END IF;

    IF v_current_points < p_points_to_redeem THEN
        RAISE EXCEPTION 'Insufficient points balance';
    END IF;

    -- Calculate discount (1 point = 1 VND? Or 100 points = 10,000 VND?)
    -- Marketing: "100 điểm = 10,000đ" => 1 point = 100 VND
    v_discount_amount := p_points_to_redeem * 100;

    -- Deduct points
    INSERT INTO public.loyalty_transactions (customer_id, type, points, description)
    VALUES (v_customer_id, 'redeem', -p_points_to_redeem, 'Redeemed for ' || v_discount_amount || ' VND discount');

    UPDATE public.customers
    SET points = points - p_points_to_redeem
    WHERE id = v_customer_id;

    RETURN jsonb_build_object(
        'success', true,
        'discount_amount', v_discount_amount,
        'remaining_points', v_current_points - p_points_to_redeem
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
