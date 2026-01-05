ALTER TABLE licenses 
ADD COLUMN IF NOT EXISTS duplicate_detected BOOLEAN DEFAULT FALSE;

-- Optional: Create an index if we query this often, though table is likely small
-- CREATE INDEX IF NOT EXISTS idx_licenses_duplicate_detected ON licenses(duplicate_detected);
