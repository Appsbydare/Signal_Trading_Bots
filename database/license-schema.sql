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

-- Table: agents (virtual support personas)
CREATE TABLE IF NOT EXISTS agents (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  avatar_url TEXT,
  description TEXT,
  prompt_style TEXT,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Table: faqs (structured Q&A)
CREATE TABLE IF NOT EXISTS faqs (
  id SERIAL PRIMARY KEY,
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  category VARCHAR(100),
  tags TEXT[],
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_faqs_category ON faqs (category);
CREATE INDEX IF NOT EXISTS idx_faqs_is_active ON faqs (is_active);

-- Table: kb_documents (long-form docs / guides)
CREATE TABLE IF NOT EXISTS kb_documents (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  content_md TEXT NOT NULL,
  category VARCHAR(100),
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_kb_documents_category ON kb_documents (category);
CREATE INDEX IF NOT EXISTS idx_kb_documents_is_active ON kb_documents (is_active);

-- Table: conversations (chat sessions)
CREATE TABLE IF NOT EXISTS conversations (
  id SERIAL PRIMARY KEY,
  customer_id INTEGER REFERENCES customers (id) ON DELETE SET NULL,
  visitor_email VARCHAR(255),
  status VARCHAR(20) NOT NULL DEFAULT 'open', -- 'open', 'closed'
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_activity_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_conversations_customer_id ON conversations (customer_id);
CREATE INDEX IF NOT EXISTS idx_conversations_status ON conversations (status);
CREATE INDEX IF NOT EXISTS idx_conversations_last_activity ON conversations (last_activity_at);

-- Table: messages (individual chat messages)
CREATE TABLE IF NOT EXISTS messages (
  id SERIAL PRIMARY KEY,
  conversation_id INTEGER NOT NULL REFERENCES conversations (id) ON DELETE CASCADE,
  sender_type VARCHAR(20) NOT NULL, -- 'customer', 'agent', 'admin', 'system'
  sender_agent_id INTEGER REFERENCES agents (id) ON DELETE SET NULL,
  content TEXT NOT NULL,
  is_from_llm BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON messages (conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages (created_at);

-- Table: tickets (escalated issues)
CREATE TABLE IF NOT EXISTS tickets (
  id SERIAL PRIMARY KEY,
  conversation_id INTEGER REFERENCES conversations (id) ON DELETE SET NULL,
  customer_id INTEGER REFERENCES customers (id) ON DELETE SET NULL,
  email VARCHAR(255),
  subject VARCHAR(255) NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'pending', -- 'pending', 'sorted'
  priority VARCHAR(20),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_tickets_status ON tickets (status);
CREATE INDEX IF NOT EXISTS idx_tickets_customer_id ON tickets (customer_id);

-- Table: ticket_events (status changes / internal notes)
CREATE TABLE IF NOT EXISTS ticket_events (
  id SERIAL PRIMARY KEY,
  ticket_id INTEGER NOT NULL REFERENCES tickets (id) ON DELETE CASCADE,
  actor_type VARCHAR(20) NOT NULL, -- 'agent', 'admin', 'system'
  actor_id INTEGER,
  note TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ticket_events_ticket_id ON ticket_events (ticket_id);
CREATE INDEX IF NOT EXISTS idx_ticket_events_created_at ON ticket_events (created_at);

