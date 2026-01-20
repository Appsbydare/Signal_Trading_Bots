-- Migration: Enhance validation log table
-- Date: 2026-01-02
-- Purpose: Add ability to store device name and detailed metadata for security auditing

ALTER TABLE license_validation_log 
ADD COLUMN IF NOT EXISTS device_name VARCHAR(255),
ADD COLUMN IF NOT EXISTS details JSONB;

COMMENT ON COLUMN license_validation_log.device_name IS 'Name of the device attempting validation';
COMMENT ON COLUMN license_validation_log.details IS 'Flexible JSONB field for storing event details like conflicting sessions, ban reasons, etc.';
