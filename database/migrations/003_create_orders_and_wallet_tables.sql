-- Migration 003: Create orders, wallet state, and admin content tables
-- This migration adds persistent storage for orders, wallet rotation, and admin content

-- Orders table for crypto payments
CREATE TABLE IF NOT EXISTS orders (
  id SERIAL PRIMARY KEY,
  order_id VARCHAR(50) UNIQUE NOT NULL,
  plan VARCHAR(20) NOT NULL,
  email VARCHAR(255) NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  country VARCHAR(100) NOT NULL,
  display_price NUMERIC(10, 2) NOT NULL,
  embedded_price NUMERIC(10, 6) NOT NULL,
  wallet_address VARCHAR(255) NOT NULL,
  coin VARCHAR(20) NOT NULL,
  network VARCHAR(20) NOT NULL,
  wallet_index INTEGER NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'waiting_for_payment',
  license_key VARCHAR(50),
  tx_hash VARCHAR(255),
  verified_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_orders_order_id ON orders (order_id);
CREATE INDEX IF NOT EXISTS idx_orders_email ON orders (email);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders (status);
CREATE INDEX IF NOT EXISTS idx_orders_wallet_address ON orders (wallet_address);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders (created_at);

-- Stripe orders table
CREATE TABLE IF NOT EXISTS stripe_orders (
  id SERIAL PRIMARY KEY,
  order_id VARCHAR(50) UNIQUE NOT NULL,
  payment_intent_id VARCHAR(255) UNIQUE NOT NULL,
  plan VARCHAR(20) NOT NULL,
  email VARCHAR(255) NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  country VARCHAR(100) NOT NULL,
  display_price NUMERIC(10, 2) NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'pending_payment',
  payment_method VARCHAR(20) NOT NULL DEFAULT 'card',
  license_key VARCHAR(50),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_stripe_orders_order_id ON stripe_orders (order_id);
CREATE INDEX IF NOT EXISTS idx_stripe_orders_payment_intent_id ON stripe_orders (payment_intent_id);
CREATE INDEX IF NOT EXISTS idx_stripe_orders_email ON stripe_orders (email);
CREATE INDEX IF NOT EXISTS idx_stripe_orders_status ON stripe_orders (status);
CREATE INDEX IF NOT EXISTS idx_stripe_orders_created_at ON stripe_orders (created_at);

-- Wallet rotation state table
CREATE TABLE IF NOT EXISTS wallet_rotation_state (
  id SERIAL PRIMARY KEY,
  coin_network VARCHAR(50) UNIQUE NOT NULL,
  rotation_count INTEGER NOT NULL DEFAULT 0,
  last_updated TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_wallet_rotation_state_coin_network ON wallet_rotation_state (coin_network);

-- Wallet order counts (for price embedding)
CREATE TABLE IF NOT EXISTS wallet_order_counts (
  id SERIAL PRIMARY KEY,
  wallet_key VARCHAR(100) UNIQUE NOT NULL, -- format: "COIN-NETWORK:address"
  order_count INTEGER NOT NULL DEFAULT 0,
  last_reset_date DATE NOT NULL,
  last_updated TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_wallet_order_counts_wallet_key ON wallet_order_counts (wallet_key);
CREATE INDEX IF NOT EXISTS idx_wallet_order_counts_last_reset_date ON wallet_order_counts (last_reset_date);

-- Admin content tables (migrate from JSON files)
CREATE TABLE IF NOT EXISTS youtube_help_items (
  id INTEGER PRIMARY KEY,
  control_name VARCHAR(50) NOT NULL,
  title VARCHAR(255) NOT NULL,
  url TEXT NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS news_items (
  id INTEGER PRIMARY KEY,
  control_name VARCHAR(50) NOT NULL,
  title VARCHAR(255) NOT NULL,
  url TEXT NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS promotional_images (
  id SERIAL PRIMARY KEY,
  redirect_url TEXT,
  image_path TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_promotional_images_is_active ON promotional_images (is_active);

-- Initialize wallet rotation state for all supported coin networks
INSERT INTO wallet_rotation_state (coin_network, rotation_count) VALUES
  ('USDT-TRC20', 0),
  ('USDT-ERC20', 0),
  ('USDC-ERC20', 0),
  ('BTC', 0),
  ('BNB', 0),
  ('ETH', 0)
ON CONFLICT (coin_network) DO NOTHING;

-- Initialize YouTube help items (16 empty slots)
INSERT INTO youtube_help_items (id, control_name, title, url) VALUES
  (1, 'Help1', '', ''),
  (2, 'Help2', '', ''),
  (3, 'Help3', '', ''),
  (4, 'Help4', '', ''),
  (5, 'Help5', '', ''),
  (6, 'Help6', '', ''),
  (7, 'Help7', '', ''),
  (8, 'Help8', '', ''),
  (9, 'Help9', '', ''),
  (10, 'Help10', '', ''),
  (11, 'Help11', '', ''),
  (12, 'Help12', '', ''),
  (13, 'Help13', '', ''),
  (14, 'Help14', '', ''),
  (15, 'Help15', '', ''),
  (16, 'Help16', '', '')
ON CONFLICT (id) DO NOTHING;

-- Initialize news items (16 empty slots)
INSERT INTO news_items (id, control_name, title, url) VALUES
  (1, 'News1', '', ''),
  (2, 'News2', '', ''),
  (3, 'News3', '', ''),
  (4, 'News4', '', ''),
  (5, 'News5', '', ''),
  (6, 'News6', '', ''),
  (7, 'News7', '', ''),
  (8, 'News8', '', ''),
  (9, 'News9', '', ''),
  (10, 'News10', '', ''),
  (11, 'News11', '', ''),
  (12, 'News12', '', ''),
  (13, 'News13', '', ''),
  (14, 'News14', '', ''),
  (15, 'News15', '', ''),
  (16, 'News16', '', '')
ON CONFLICT (id) DO NOTHING;

