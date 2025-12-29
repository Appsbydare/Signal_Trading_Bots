-- Migration 004: Fix customers table sequence
-- This migration ensures the SERIAL sequence for customers.id is properly synced
-- with the current maximum ID in the table to prevent duplicate key violations
-- Applied: 2025-12-29 (via Supabase MCP as fix_customers_sequence)

-- Reset the sequence for customers table to the current max ID + 1
-- This fixes the issue where the sequence might be out of sync with actual data
SELECT setval(
  pg_get_serial_sequence('customers', 'id'),
  COALESCE((SELECT MAX(id) FROM customers), 0) + 1,
  false
);

-- Do the same for other tables that might have the same issue
SELECT setval(
  pg_get_serial_sequence('admins', 'id'),
  COALESCE((SELECT MAX(id) FROM admins), 0) + 1,
  false
);

SELECT setval(
  pg_get_serial_sequence('licenses', 'id'),
  COALESCE((SELECT MAX(id) FROM licenses), 0) + 1,
  false
);

SELECT setval(
  pg_get_serial_sequence('orders', 'id'),
  COALESCE((SELECT MAX(id) FROM orders), 0) + 1,
  false
);

SELECT setval(
  pg_get_serial_sequence('stripe_orders', 'id'),
  COALESCE((SELECT MAX(id) FROM stripe_orders), 0) + 1,
  false
);

-- Note: This migration should be run if you encounter errors like:
-- "duplicate key value violates unique constraint 'customers_pkey'"
-- which indicates the SERIAL sequence is out of sync with the table data

