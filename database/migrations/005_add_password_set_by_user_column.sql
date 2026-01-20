-- Migration 005: Add password_set_by_user column to customers table
-- This column tracks whether the customer has manually set their password
-- vs using the auto-generated password from account creation

ALTER TABLE customers 
ADD COLUMN IF NOT EXISTS password_set_by_user BOOLEAN NOT NULL DEFAULT FALSE;

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_customers_password_set_by_user ON customers (password_set_by_user);

-- Update existing customers who might have already set passwords
-- (This is optional - you can run this if you want to mark existing customers)
-- UPDATE customers SET password_set_by_user = TRUE WHERE password_hash IS NOT NULL AND password_hash != '';

