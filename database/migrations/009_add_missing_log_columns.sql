-- Migration: Add missing columns to license_validation_log
-- Date: 2026-01-07
-- Purpose: Add device_name and details columns which are used by the application code

ALTER TABLE license_validation_log
ADD COLUMN IF NOT EXISTS device_name VARCHAR(255),
ADD COLUMN IF NOT EXISTS details JSONB;
