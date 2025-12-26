-- Migration: Add security columns to licenses table
-- Date: 2025-12-13
-- Purpose: Add duplicate detection and grace period control

-- Add duplicate_detected flag and grace_allowed flag
ALTER TABLE licenses 
ADD COLUMN IF NOT EXISTS duplicate_detected BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS grace_period_allowed BOOLEAN DEFAULT TRUE;

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_licenses_duplicate ON licenses(duplicate_detected);

-- Add comments
COMMENT ON COLUMN licenses.duplicate_detected IS 'Set to TRUE when license used on multiple devices simultaneously';
COMMENT ON COLUMN licenses.grace_period_allowed IS 'When FALSE, this license will never receive grace period';

-- For existing licenses, ensure defaults are set
UPDATE licenses 
SET duplicate_detected = FALSE, 
    grace_period_allowed = TRUE 
WHERE duplicate_detected IS NULL 
   OR grace_period_allowed IS NULL;


