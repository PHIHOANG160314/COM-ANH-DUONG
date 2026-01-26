-- Attendance Log Table
CREATE TABLE IF NOT EXISTS attendance_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    staff_id TEXT NOT NULL,
    staff_name TEXT,
    check_in TIMESTAMPTZ DEFAULT NOW(),
    check_out TIMESTAMPTZ,
    date TEXT, -- YYYY-MM-DD
    total_hours NUMERIC
);

-- Enable Realtime
ALTER TABLE attendance_log REPLICA IDENTITY FULL;

-- Add to publication safely
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'attendance_log') THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE attendance_log;
    END IF;
END $$;
