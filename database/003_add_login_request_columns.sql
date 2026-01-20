-- Migration: Add login request columns to licenses table
-- Date: 2026-01-02
-- Purpose: Enable "Request Access" feature for switching devices interactively

-- Add columns to track pending login requests
ALTER TABLE licenses 
ADD COLUMN IF NOT EXISTS login_request_device_id VARCHAR(100),
ADD COLUMN IF NOT EXISTS login_request_device_name VARCHAR(255),
ADD COLUMN IF NOT EXISTS login_request_timestamp TIMESTAMPTZ;

-- Add comments
COMMENT ON COLUMN licenses.login_request_device_id IS 'Device ID of the device requesting to take over the session';
COMMENT ON COLUMN licenses.login_request_device_name IS 'Human readable name of the device requesting access';
COMMENT ON COLUMN licenses.login_request_timestamp IS 'Time when the login request was initiated';

-- Create index for performance might be overkill but good if high volume
CREATE INDEX IF NOT EXISTS idx_licenses_login_request ON licenses(login_request_timestamp) WHERE login_request_timestamp IS NOT NULL;
