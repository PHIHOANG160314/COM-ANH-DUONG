-- =====================================================
-- ANALYTICS FUNCTIONS
-- Created: 2026-01-31
-- =====================================================

-- 1. GET REVENUE ANALYTICS
-- Returns revenue aggregated by day for a date range
CREATE OR REPLACE FUNCTION get_revenue_analytics(
    date_from TIMESTAMPTZ,
    date_to TIMESTAMPTZ
)
RETURNS TABLE (
    period TEXT,
    total_revenue BIGINT,
    order_count BIGINT,
    avg_order_value BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        TO_CHAR(created_at, 'YYYY-MM-DD') AS period,
        SUM(total)::BIGINT AS total_revenue,
        COUNT(id)::BIGINT AS order_count,
        CASE
            WHEN COUNT(id) > 0 THEN (SUM(total) / COUNT(id))::BIGINT
            ELSE 0
        END AS avg_order_value
    FROM
        public.orders
    WHERE
        status = 'completed'
        AND created_at >= date_from
        AND created_at <= date_to
    GROUP BY
        TO_CHAR(created_at, 'YYYY-MM-DD')
    ORDER BY
        period ASC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. GET TOP SELLING ITEMS
-- Returns top performing menu items
CREATE OR REPLACE FUNCTION get_top_selling_items(
    date_from TIMESTAMPTZ,
    date_to TIMESTAMPTZ,
    limit_count INTEGER DEFAULT 10
)
RETURNS TABLE (
    item_name TEXT,
    quantity_sold BIGINT,
    revenue BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        oi.item_name::TEXT,
        SUM(oi.quantity)::BIGINT AS quantity_sold,
        SUM(oi.total_price)::BIGINT AS revenue
    FROM
        public.order_items oi
    JOIN
        public.orders o ON oi.order_id = o.id
    WHERE
        o.status = 'completed'
        AND o.created_at >= date_from
        AND o.created_at <= date_to
    GROUP BY
        oi.item_name
    ORDER BY
        revenue DESC
    LIMIT
        limit_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. GET ORDER STATUS DISTRIBUTION
-- Returns breakdown of order statuses
CREATE OR REPLACE FUNCTION get_order_status_distribution(
    date_from TIMESTAMPTZ,
    date_to TIMESTAMPTZ
)
RETURNS TABLE (
    status TEXT,
    count BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        o.status::TEXT,
        COUNT(o.id)::BIGINT AS count
    FROM
        public.orders o
    WHERE
        o.created_at >= date_from
        AND o.created_at <= date_to
    GROUP BY
        o.status
    ORDER BY
        count DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. SECURITY CHECK
-- Ensure only admins/managers can access these functions via RLS/Policies?
-- RPC functions run with SECURITY DEFINER, so they bypass RLS.
-- We must enforce role checking inside the function or rely on API Gateway constraints.
-- Adding simple role check inside functions:

CREATE OR REPLACE FUNCTION check_admin_access()
RETURNS VOID AS $$
DECLARE
    v_role TEXT;
BEGIN
    SELECT role INTO v_role FROM public.profiles WHERE id = auth.uid();
    IF v_role NOT IN ('admin', 'manager') THEN
        RAISE EXCEPTION 'Access denied. Admin or Manager role required.';
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update functions to include check
-- (Re-creating them with the check included at start)

CREATE OR REPLACE FUNCTION get_revenue_analytics_secure(
    date_from TIMESTAMPTZ,
    date_to TIMESTAMPTZ
)
RETURNS TABLE (
    period TEXT,
    total_revenue BIGINT,
    order_count BIGINT,
    avg_order_value BIGINT
) AS $$
BEGIN
    PERFORM check_admin_access();

    RETURN QUERY
    SELECT
        TO_CHAR(created_at, 'YYYY-MM-DD') AS period,
        SUM(total)::BIGINT AS total_revenue,
        COUNT(id)::BIGINT AS order_count,
        CASE
            WHEN COUNT(id) > 0 THEN (SUM(total) / COUNT(id))::BIGINT
            ELSE 0
        END AS avg_order_value
    FROM
        public.orders
    WHERE
        status = 'completed'
        AND created_at >= date_from
        AND created_at <= date_to
    GROUP BY
        TO_CHAR(created_at, 'YYYY-MM-DD')
    ORDER BY
        period ASC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION get_top_selling_items_secure(
    date_from TIMESTAMPTZ,
    date_to TIMESTAMPTZ,
    limit_count INTEGER DEFAULT 10
)
RETURNS TABLE (
    item_name TEXT,
    quantity_sold BIGINT,
    revenue BIGINT
) AS $$
BEGIN
    PERFORM check_admin_access();

    RETURN QUERY
    SELECT
        oi.item_name::TEXT,
        SUM(oi.quantity)::BIGINT AS quantity_sold,
        SUM(oi.total_price)::BIGINT AS revenue
    FROM
        public.order_items oi
    JOIN
        public.orders o ON oi.order_id = o.id
    WHERE
        o.status = 'completed'
        AND o.created_at >= date_from
        AND o.created_at <= date_to
    GROUP BY
        oi.item_name
    ORDER BY
        revenue DESC
    LIMIT
        limit_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION get_order_status_distribution_secure(
    date_from TIMESTAMPTZ,
    date_to TIMESTAMPTZ
)
RETURNS TABLE (
    status TEXT,
    count BIGINT
) AS $$
BEGIN
    PERFORM check_admin_access();

    RETURN QUERY
    SELECT
        o.status::TEXT,
        COUNT(o.id)::BIGINT AS count
    FROM
        public.orders o
    WHERE
        o.created_at >= date_from
        AND o.created_at <= date_to
    GROUP BY
        o.status
    ORDER BY
        count DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
