-- ATTENDANCE LOG TABLE (REALTIME)
CREATE TABLE IF NOT EXISTS attendance_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    staff_id BIGINT, -- Using BIGINT to match staff.id based on previous file reads, referencing managed by logic if FK fails
    check_in TIMESTAMPTZ DEFAULT NOW(),
    check_out TIMESTAMPTZ,
    date DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Realtime
ALTER TABLE attendance_log REPLICA IDENTITY FULL;

-- Create publication if it doesn't exist, or add table to it
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
        CREATE PUBLICATION supabase_realtime FOR TABLE attendance_log;
    ELSE
        ALTER PUBLICATION supabase_realtime ADD TABLE attendance_log;
    END IF;
END
$$;
