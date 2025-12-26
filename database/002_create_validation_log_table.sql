-- Migration: Create license validation log table
-- Date: 2025-12-13
-- Purpose: Track all license validation attempts for security auditing

CREATE TABLE IF NOT EXISTS license_validation_log (
  id SERIAL PRIMARY KEY,
  license_key VARCHAR(50) NOT NULL,
  device_id VARCHAR(100),
  event_type VARCHAR(30) NOT NULL,  -- 'validation', 'duplicate_detected', 'deactivation', 'failed', 'heartbeat_failed'
  success BOOLEAN NOT NULL,
  error_code VARCHAR(50),
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_validation_log_license ON license_validation_log(license_key, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_validation_log_created ON license_validation_log(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_validation_log_event_type ON license_validation_log(event_type);

-- Add comments
COMMENT ON TABLE license_validation_log IS 'Tracks all license validation attempts for security and auditing';
COMMENT ON COLUMN license_validation_log.event_type IS 'Type of event: validation, duplicate_detected, deactivation, failed, heartbeat_failed';

-- Create function to automatically delete old logs (90 days retention)
CREATE OR REPLACE FUNCTION delete_old_validation_logs()
RETURNS void AS $$
BEGIN
  DELETE FROM license_validation_log 
  WHERE created_at < NOW() - INTERVAL '90 days';
END;
$$ LANGUAGE plpgsql;

-- Create a scheduled job (Note: This requires pg_cron extension or external scheduler)
-- For manual cleanup, admin can run: SELECT delete_old_validation_logs();
COMMENT ON FUNCTION delete_old_validation_logs IS 'Deletes validation logs older than 90 days. Run periodically via cron job.';


