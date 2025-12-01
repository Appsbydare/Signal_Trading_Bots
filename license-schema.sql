-- License system schema for SignalTradingBots (Supabase/Postgres)
-- Apply this in your Supabase SQL editor or Postgres migration tool.

-- Table: licenses
CREATE TABLE IF NOT EXISTS licenses (
  id SERIAL PRIMARY KEY,
  license_key VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(255) NOT NULL,
  plan VARCHAR(20) NOT NULL, -- 'monthly', 'yearly', 'lifetime'
  status VARCHAR(20) NOT NULL DEFAULT 'active', -- 'active', 'expired', 'revoked'
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL,
  payment_id VARCHAR(100),
  amount NUMERIC(10, 2),
  currency VARCHAR(3) DEFAULT 'USD'
);

CREATE INDEX IF NOT EXISTS idx_licenses_license_key ON licenses (license_key);
CREATE INDEX IF NOT EXISTS idx_licenses_email ON licenses (email);
CREATE INDEX IF NOT EXISTS idx_licenses_status ON licenses (status);

-- Table: license_sessions
CREATE TABLE IF NOT EXISTS license_sessions (
  id SERIAL PRIMARY KEY,
  license_key VARCHAR(50) NOT NULL REFERENCES licenses (license_key) ON DELETE CASCADE,
  device_id VARCHAR(100) NOT NULL,
  session_id VARCHAR(100) UNIQUE NOT NULL,
  device_name VARCHAR(255),
  device_mac VARCHAR(50),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_seen_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  active BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE INDEX IF NOT EXISTS idx_license_sessions_license_key ON license_sessions (license_key);
CREATE INDEX IF NOT EXISTS idx_license_sessions_session_id ON license_sessions (session_id);
CREATE INDEX IF NOT EXISTS idx_license_sessions_device_id ON license_sessions (device_id);
CREATE INDEX IF NOT EXISTS idx_license_sessions_active ON license_sessions (active);
CREATE INDEX IF NOT EXISTS idx_license_sessions_last_seen ON license_sessions (last_seen_at);

-- Table: customers (portal users)
CREATE TABLE IF NOT EXISTS customers (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(255),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_customers_email ON customers (email);

-- Table: admins (admin panel users)
CREATE TABLE IF NOT EXISTS admins (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(255),
  role VARCHAR(50) NOT NULL DEFAULT 'admin',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_admins_email ON admins (email);
CREATE INDEX IF NOT EXISTS idx_admins_role ON admins (role);


