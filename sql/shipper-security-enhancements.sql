-- =====================================================
-- SHIPPER SECURITY ENHANCEMENTS
-- Add device tracking and working hours
-- =====================================================

-- Add device_id column to shippers table
ALTER TABLE shippers ADD COLUMN IF NOT EXISTS device_id TEXT;
ALTER TABLE shippers ADD COLUMN IF NOT EXISTS last_login_at TIMESTAMPTZ;

-- Create index for device lookups
CREATE INDEX IF NOT EXISTS idx_shippers_device ON shippers(device_id) WHERE device_id IS NOT NULL;

-- Function to check working hours (6AM-6PM)
CREATE OR REPLACE FUNCTION is_working_hours()
RETURNS BOOLEAN AS $$
DECLARE
    current_hour INTEGER;
BEGIN
    -- Get current hour in Vietnam timezone (GMT+7)
    current_hour := EXTRACT(HOUR FROM (NOW() AT TIME ZONE 'Asia/Ho_Chi_Minh'));
    
    -- Working hours: 6 (6AM) to 17 (6PM, inclusive)
    RETURN current_hour >= 6 AND current_hour < 18;
END;
$$ LANGUAGE plpgsql;

-- Enhanced PIN verification with device lock and working hours
CREATE OR REPLACE FUNCTION verify_shipper_pin(
    p_phone TEXT, 
    p_pin TEXT,
    p_device_id TEXT
)
RETURNS TABLE(
    success BOOLEAN,
    shipper_id UUID,
    shipper_name TEXT,
    shipper_phone TEXT,
    shipper_status TEXT,
    shipper_rating DECIMAL,
    total_deliveries INTEGER,
    error_message TEXT
) AS $$
DECLARE
    v_shipper RECORD;
    v_working_hours BOOLEAN;
BEGIN
    -- Check working hours
    v_working_hours := is_working_hours();
    
    IF NOT v_working_hours THEN
        RETURN QUERY SELECT 
            false, 
            NULL::UUID, 
            NULL::TEXT, 
            NULL::TEXT, 
            NULL::TEXT, 
            NULL::DECIMAL, 
            NULL::INTEGER,
            'Ngoài giờ làm việc (6h-18h)'::TEXT;
        RETURN;
    END IF;
    
    -- Find shipper by phone
    SELECT * INTO v_shipper FROM shippers s
    WHERE s.phone = p_phone AND s.is_active = true;
    
    IF v_shipper IS NULL THEN
        RETURN QUERY SELECT 
            false, 
            NULL::UUID, 
            NULL::TEXT, 
            NULL::TEXT, 
            NULL::TEXT, 
            NULL::DECIMAL, 
            NULL::INTEGER,
            'Số điện thoại không tồn tại'::TEXT;
        RETURN;
    END IF;
    
    -- Check device lock
    IF v_shipper.device_id IS NOT NULL AND v_shipper.device_id != p_device_id THEN
        RETURN QUERY SELECT 
            false, 
            NULL::UUID, 
            NULL::TEXT, 
            NULL::TEXT, 
            NULL::TEXT, 
            NULL::DECIMAL, 
            NULL::INTEGER,
            'Tài khoản đã được đăng nhập trên thiết bị khác'::TEXT;
        RETURN;
    END IF;
    
    -- Verify PIN using bcrypt
    IF v_shipper.pin = crypt(p_pin, v_shipper.pin) THEN
        -- Update device_id and last login on first login or device change
        IF v_shipper.device_id IS NULL THEN
            UPDATE shippers 
            SET device_id = p_device_id, 
                last_login_at = NOW(),
                updated_at = NOW()
            WHERE id = v_shipper.id;
        ELSE
            UPDATE shippers 
            SET last_login_at = NOW(),
                updated_at = NOW()
            WHERE id = v_shipper.id;
        END IF;
        
        -- Return shipper data
        RETURN QUERY SELECT 
            true,
            v_shipper.id,
            v_shipper.name::TEXT,
            v_shipper.phone::TEXT,
            v_shipper.status::TEXT,
            v_shipper.rating,
            v_shipper.total_deliveries,
            NULL::TEXT;
    ELSE
        -- PIN incorrect
        RETURN QUERY SELECT 
            false, 
            NULL::UUID, 
            NULL::TEXT, 
            NULL::TEXT, 
            NULL::TEXT, 
            NULL::DECIMAL, 
            NULL::INTEGER,
            'Mã PIN không đúng'::TEXT;
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to generate random 4-digit PIN
CREATE OR REPLACE FUNCTION generate_4digit_pin()
RETURNS TEXT AS $$
BEGIN
    RETURN LPAD(FLOOR(RANDOM() * 10000)::TEXT, 4, '0');
END;
$$ LANGUAGE plpgsql;

-- Function for admin to create shipper with PIN
CREATE OR REPLACE FUNCTION admin_create_shipper(
    p_name TEXT,
    p_phone TEXT,
    p_pin TEXT -- Plain 4-digit PIN from admin
)
RETURNS TABLE(
    success BOOLEAN,
    shipper_id UUID,
    error_message TEXT
) AS $$
DECLARE
    v_new_id UUID;
    v_hashed_pin TEXT;
BEGIN
    -- Validate PIN is 4 digits
    IF p_pin !~ '^\d{4}$' THEN
        RETURN QUERY SELECT false, NULL::UUID, 'PIN phải là 4 chữ số'::TEXT;
        RETURN;
    END IF;
    
    -- Hash the PIN
    v_hashed_pin := crypt(p_pin, gen_salt('bf', 8));
    
    -- Insert shipper
    INSERT INTO shippers (name, phone, pin)
    VALUES (p_name, p_phone, v_hashed_pin)
    RETURNING id INTO v_new_id;
    
    RETURN QUERY SELECT true, v_new_id, NULL::TEXT;
    
EXCEPTION
    WHEN unique_violation THEN
        RETURN QUERY SELECT false, NULL::UUID, 'Số điện thoại đã tồn tại'::TEXT;
    WHEN OTHERS THEN
        RETURN QUERY SELECT false, NULL::UUID, SQLERRM::TEXT;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to reset shipper PIN (admin only)
CREATE OR REPLACE FUNCTION admin_reset_shipper_pin(
    p_shipper_id UUID,
    p_new_pin TEXT
)
RETURNS TABLE(
    success BOOLEAN,
    error_message TEXT
) AS $$
DECLARE
    v_hashed_pin TEXT;
BEGIN
    -- Validate PIN is 4 digits
    IF p_new_pin !~ '^\d{4}$' THEN
        RETURN QUERY SELECT false, 'PIN phải là 4 chữ số'::TEXT;
        RETURN;
    END IF;
    
    -- Hash the new PIN
    v_hashed_pin := crypt(p_new_pin, gen_salt('bf', 8));
    
    -- Update shipper, clear device lock
    UPDATE shippers 
    SET pin = v_hashed_pin,
        device_id = NULL,  -- Allow login on new device
        updated_at = NOW()
    WHERE id = p_shipper_id;
    
    IF FOUND THEN
        RETURN QUERY SELECT true, NULL::TEXT;
    ELSE
        RETURN QUERY SELECT false, 'Shipper không tồn tại'::TEXT;
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
