-- Work Sessions Table
CREATE TABLE IF NOT EXISTS work_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code TEXT NOT NULL UNIQUE,
    created_by TEXT NOT NULL,
    created_by_id TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ NOT NULL,
    is_active BOOLEAN DEFAULT true,
    used_by JSONB DEFAULT '[]'::jsonb
);

-- Index
CREATE INDEX IF NOT EXISTS idx_work_sessions_code ON work_sessions(code);
CREATE INDEX IF NOT EXISTS idx_work_sessions_active ON work_sessions(is_active, expires_at);

-- RLS
ALTER TABLE work_sessions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can read active work sessions" ON work_sessions;
CREATE POLICY "Anyone can read active work sessions"
    ON work_sessions FOR SELECT
    USING (is_active = true AND expires_at > NOW());

DROP POLICY IF EXISTS "Authenticated users can create work sessions" ON work_sessions;
CREATE POLICY "Authenticated users can create work sessions"
    ON work_sessions FOR INSERT
    WITH CHECK (true);

DROP POLICY IF EXISTS "Creator can update work sessions" ON work_sessions;
CREATE POLICY "Creator can update work sessions"
    ON work_sessions FOR UPDATE
    USING (true);

-- Function: Get active session
CREATE OR REPLACE FUNCTION get_active_work_session()
RETURNS TABLE(code TEXT, created_by TEXT, expires_at TIMESTAMPTZ) AS $$
BEGIN
    RETURN QUERY
    SELECT ws.code, ws.created_by, ws.expires_at
    FROM work_sessions ws
    WHERE ws.is_active = true AND ws.expires_at > NOW()
    ORDER BY ws.created_at DESC
    LIMIT 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: Create new session
CREATE OR REPLACE FUNCTION create_work_session(
    p_code TEXT,
    p_created_by TEXT,
    p_created_by_id TEXT,
    p_expires_at TIMESTAMPTZ
) RETURNS UUID AS $$
DECLARE
    v_session_id UUID;
BEGIN
    UPDATE work_sessions SET is_active = false WHERE is_active = true;
    INSERT INTO work_sessions (code, created_by, created_by_id, expires_at)
    VALUES (p_code, p_created_by, p_created_by_id, p_expires_at)
    RETURNING id INTO v_session_id;
    RETURN v_session_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: Validate code
CREATE OR REPLACE FUNCTION validate_work_code(p_code TEXT)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM work_sessions
        WHERE code = UPPER(p_code) AND is_active = true AND expires_at > NOW()
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: Record usage
CREATE OR REPLACE FUNCTION record_work_code_usage(
    p_code TEXT,
    p_staff_name TEXT,
    p_staff_id TEXT
) RETURNS BOOLEAN AS $$
BEGIN
    UPDATE work_sessions
    SET used_by = used_by || jsonb_build_array(
        jsonb_build_object('id', p_staff_id, 'name', p_staff_name, 'loginAt', extract(epoch from now()) * 1000)
    )
    WHERE code = UPPER(p_code) AND is_active = true;
    RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
