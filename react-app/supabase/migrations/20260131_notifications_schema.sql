-- =====================================================
-- NOTIFICATION SYSTEM
-- Created: 2026-01-31
-- =====================================================

-- 1. Create Notifications Table
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    recipient_role VARCHAR(20) NOT NULL, -- 'admin', 'kitchen', 'staff', 'shipper' (or specific user_id if needed later)
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    link TEXT, -- Internal link like '/admin/orders/123'
    type VARCHAR(50) DEFAULT 'info', -- 'info', 'warning', 'success', 'error'
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_notifications_role ON public.notifications(recipient_role);
CREATE INDEX idx_notifications_created ON public.notifications(created_at DESC);

-- Enable RLS
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Policy: Staff can view notifications for their role
CREATE POLICY "Staff view role notifications"
    ON public.notifications FOR SELECT
    USING (
        recipient_role = (
            SELECT role FROM public.staff WHERE id::text = auth.uid()::text -- This assumes staff auth maps to staff table.
            -- Actually, our Auth is via Supabase Auth Users table -> Profiles table.
            -- Profiles.role matches recipient_role.
        )
        OR
        recipient_role IN (
            SELECT role FROM public.profiles WHERE id = auth.uid()
        )
    );

-- Policy: Admin can view all
CREATE POLICY "Admin view all notifications"
    ON public.notifications FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE notifications;


-- 2. Trigger: Notify on New Order
CREATE OR REPLACE FUNCTION notify_new_order()
RETURNS TRIGGER AS $$
BEGIN
    -- Notify Kitchen
    INSERT INTO public.notifications (recipient_role, title, message, link, type)
    VALUES (
        'kitchen',
        'Đơn hàng mới #' || NEW.order_number,
        'Có đơn hàng mới cần chuẩn bị.',
        '/kitchen',
        'info'
    );

    -- Notify Admin/Staff
    INSERT INTO public.notifications (recipient_role, title, message, link, type)
    VALUES (
        'admin',
        'Đơn hàng mới #' || NEW.order_number,
        'Khách hàng ' || COALESCE(NEW.customer_name, 'Guest') || ' vừa đặt đơn.',
        '/admin/orders',
        'success'
    );

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trg_notify_new_order
    AFTER INSERT ON public.orders
    FOR EACH ROW
    EXECUTE FUNCTION notify_new_order();


-- 3. Trigger: Notify Low Stock
-- Attached to menu_items update (triggered by inventory decrement)
CREATE OR REPLACE FUNCTION notify_low_stock()
RETURNS TRIGGER AS $$
BEGIN
    -- Check if stock dropped below threshold (e.g., 5) and was previously above
    IF NEW.stock_quantity IS NOT NULL AND NEW.stock_quantity <= 5 AND (OLD.stock_quantity IS NULL OR OLD.stock_quantity > 5) THEN

        INSERT INTO public.notifications (recipient_role, title, message, link, type)
        VALUES (
            'admin',
            'Cảnh báo sắp hết hàng: ' || NEW.name,
            'Sản phẩm ' || NEW.name || ' chỉ còn ' || NEW.stock_quantity || ' phần.',
            '/admin/products',
            'warning'
        );

    END IF;

    -- Check if stock hit 0
    IF NEW.stock_quantity IS NOT NULL AND NEW.stock_quantity = 0 AND (OLD.stock_quantity > 0) THEN
         INSERT INTO public.notifications (recipient_role, title, message, link, type)
        VALUES (
            'admin',
            'Hết hàng: ' || NEW.name,
            'Sản phẩm ' || NEW.name || ' đã hết hàng và tự động ẩn.',
            '/admin/products',
            'error'
        );
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trg_notify_low_stock
    AFTER UPDATE ON public.menu_items
    FOR EACH ROW
    EXECUTE FUNCTION notify_low_stock();
