-- =====================================================
-- ANALYTICS SCHEMA - ÁNH DƯƠNG F&B
-- Báo cáo & Thống kê với Real-time Updates
-- Run this in Supabase SQL Editor
-- =====================================================

-- =====================================================
-- DAILY SALES SUMMARY VIEW
-- =====================================================
CREATE OR REPLACE VIEW daily_sales_summary AS
SELECT 
    DATE(created_at AT TIME ZONE 'Asia/Ho_Chi_Minh') as sale_date,
    COUNT(*) as order_count,
    COALESCE(SUM(total), 0) as total_revenue,
    COALESCE(AVG(total), 0)::INTEGER as avg_order_value,
    COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_orders,
    COUNT(CASE WHEN status = 'cancelled' THEN 1 END) as cancelled_orders,
    COALESCE(SUM(CASE WHEN order_type = 'dinein' THEN total ELSE 0 END), 0) as dinein_revenue,
    COALESCE(SUM(CASE WHEN order_type = 'delivery' THEN total ELSE 0 END), 0) as delivery_revenue,
    COALESCE(SUM(CASE WHEN order_type = 'takeaway' THEN total ELSE 0 END), 0) as takeaway_revenue
FROM orders
WHERE status IN ('completed', 'pending', 'preparing', 'ready')
GROUP BY DATE(created_at AT TIME ZONE 'Asia/Ho_Chi_Minh')
ORDER BY sale_date DESC;

-- =====================================================
-- GET DAILY REPORT FUNCTION
-- =====================================================
CREATE OR REPLACE FUNCTION get_daily_report(report_date DATE DEFAULT CURRENT_DATE)
RETURNS JSON AS $$
DECLARE
    result JSON;
BEGIN
    SELECT json_build_object(
        'date', report_date,
        'summary', (
            SELECT json_build_object(
                'orderCount', COALESCE(COUNT(*), 0),
                'totalRevenue', COALESCE(SUM(total), 0),
                'avgOrderValue', COALESCE(AVG(total), 0)::INTEGER,
                'completedOrders', COUNT(CASE WHEN status = 'completed' THEN 1 END),
                'pendingOrders', COUNT(CASE WHEN status = 'pending' THEN 1 END)
            )
            FROM orders
            WHERE DATE(created_at AT TIME ZONE 'Asia/Ho_Chi_Minh') = report_date
        ),
        'revenueByChannel', (
            SELECT json_build_object(
                'dinein', COALESCE(SUM(CASE WHEN order_type = 'dinein' THEN total ELSE 0 END), 0),
                'delivery', COALESCE(SUM(CASE WHEN order_type = 'delivery' THEN total ELSE 0 END), 0),
                'takeaway', COALESCE(SUM(CASE WHEN order_type = 'takeaway' THEN total ELSE 0 END), 0)
            )
            FROM orders
            WHERE DATE(created_at AT TIME ZONE 'Asia/Ho_Chi_Minh') = report_date
              AND status = 'completed'
        ),
        'generatedAt', NOW()
    ) INTO result;
    
    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- GET TOP SELLING ITEMS FUNCTION
-- =====================================================
CREATE OR REPLACE FUNCTION get_top_items(
    date_from DATE DEFAULT CURRENT_DATE - INTERVAL '7 days',
    date_to DATE DEFAULT CURRENT_DATE,
    limit_count INTEGER DEFAULT 10
)
RETURNS JSON AS $$
DECLARE
    result JSON;
BEGIN
    SELECT json_agg(item_stats ORDER BY revenue DESC)
    INTO result
    FROM (
        SELECT 
            item->>'name' as name,
            SUM((item->>'qty')::INTEGER) as quantity,
            SUM((item->>'price')::INTEGER * (item->>'qty')::INTEGER) as revenue
        FROM orders,
        LATERAL jsonb_array_elements(items) as item
        WHERE DATE(created_at AT TIME ZONE 'Asia/Ho_Chi_Minh') BETWEEN date_from AND date_to
          AND status = 'completed'
        GROUP BY item->>'name'
        ORDER BY revenue DESC
        LIMIT limit_count
    ) item_stats;
    
    RETURN COALESCE(result, '[]'::JSON);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- GET REVENUE BY CATEGORY FUNCTION
-- =====================================================
CREATE OR REPLACE FUNCTION get_revenue_by_category(
    date_from DATE DEFAULT CURRENT_DATE - INTERVAL '7 days',
    date_to DATE DEFAULT CURRENT_DATE
)
RETURNS JSON AS $$
DECLARE
    result JSON;
    total_revenue BIGINT;
BEGIN
    -- Get total revenue first
    SELECT COALESCE(SUM(total), 0) INTO total_revenue
    FROM orders
    WHERE DATE(created_at AT TIME ZONE 'Asia/Ho_Chi_Minh') BETWEEN date_from AND date_to
      AND status = 'completed';
    
    -- Get breakdown by category
    SELECT json_agg(cat_stats)
    INTO result
    FROM (
        SELECT 
            COALESCE(item->>'category', 'other') as category,
            SUM((item->>'price')::INTEGER * (item->>'qty')::INTEGER) as revenue,
            CASE 
                WHEN total_revenue > 0 THEN 
                    ROUND((SUM((item->>'price')::INTEGER * (item->>'qty')::INTEGER)::NUMERIC / total_revenue * 100), 1)
                ELSE 0 
            END as percentage
        FROM orders,
        LATERAL jsonb_array_elements(items) as item
        WHERE DATE(created_at AT TIME ZONE 'Asia/Ho_Chi_Minh') BETWEEN date_from AND date_to
          AND status = 'completed'
        GROUP BY item->>'category'
        ORDER BY revenue DESC
    ) cat_stats;
    
    RETURN COALESCE(result, '[]'::JSON);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- GET DATE RANGE REPORT FUNCTION
-- =====================================================
CREATE OR REPLACE FUNCTION get_range_report(
    date_from DATE,
    date_to DATE
)
RETURNS JSON AS $$
DECLARE
    result JSON;
BEGIN
    SELECT json_build_object(
        'dateFrom', date_from,
        'dateTo', date_to,
        'summary', (
            SELECT json_build_object(
                'orderCount', COALESCE(COUNT(*), 0),
                'totalRevenue', COALESCE(SUM(total), 0),
                'avgOrderValue', COALESCE(AVG(total), 0)::INTEGER,
                'completedOrders', COUNT(CASE WHEN status = 'completed' THEN 1 END)
            )
            FROM orders
            WHERE DATE(created_at AT TIME ZONE 'Asia/Ho_Chi_Minh') BETWEEN date_from AND date_to
        ),
        'dailyBreakdown', (
            SELECT json_agg(daily ORDER BY sale_date)
            FROM (
                SELECT 
                    DATE(created_at AT TIME ZONE 'Asia/Ho_Chi_Minh') as sale_date,
                    COUNT(*) as orders,
                    SUM(total) as revenue
                FROM orders
                WHERE DATE(created_at AT TIME ZONE 'Asia/Ho_Chi_Minh') BETWEEN date_from AND date_to
                  AND status = 'completed'
                GROUP BY DATE(created_at AT TIME ZONE 'Asia/Ho_Chi_Minh')
            ) daily
        ),
        'topItems', get_top_items(date_from, date_to, 10),
        'categoryBreakdown', get_revenue_by_category(date_from, date_to),
        'generatedAt', NOW()
    ) INTO result;
    
    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- GET HOURLY STATS (for real-time dashboard)
-- =====================================================
CREATE OR REPLACE FUNCTION get_hourly_stats(target_date DATE DEFAULT CURRENT_DATE)
RETURNS JSON AS $$
DECLARE
    result JSON;
BEGIN
    SELECT json_agg(hourly ORDER BY hour)
    INTO result
    FROM (
        SELECT 
            EXTRACT(HOUR FROM created_at AT TIME ZONE 'Asia/Ho_Chi_Minh')::INTEGER as hour,
            COUNT(*) as orders,
            SUM(total) as revenue
        FROM orders
        WHERE DATE(created_at AT TIME ZONE 'Asia/Ho_Chi_Minh') = target_date
          AND status = 'completed'
        GROUP BY EXTRACT(HOUR FROM created_at AT TIME ZONE 'Asia/Ho_Chi_Minh')
    ) hourly;
    
    RETURN COALESCE(result, '[]'::JSON);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- GRANT PERMISSIONS
-- =====================================================
GRANT EXECUTE ON FUNCTION get_daily_report TO anon, authenticated;
GRANT EXECUTE ON FUNCTION get_top_items TO anon, authenticated;
GRANT EXECUTE ON FUNCTION get_revenue_by_category TO anon, authenticated;
GRANT EXECUTE ON FUNCTION get_range_report TO anon, authenticated;
GRANT EXECUTE ON FUNCTION get_hourly_stats TO anon, authenticated;
GRANT SELECT ON daily_sales_summary TO anon, authenticated;

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_orders_date_status 
    ON orders(created_at, status);
    
CREATE INDEX IF NOT EXISTS idx_orders_type 
    ON orders(order_type);

-- Note: GIN index for items JSONB (if not exists)
CREATE INDEX IF NOT EXISTS idx_orders_items 
    ON orders USING GIN (items);
