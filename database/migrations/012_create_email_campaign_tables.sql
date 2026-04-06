-- Migration 012: Admin email campaigns, templates, automation, and delivery history

CREATE TABLE IF NOT EXISTS email_templates (
  id SERIAL PRIMARY KEY,
  key VARCHAR(120) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  category VARCHAR(80) NOT NULL DEFAULT 'campaign',
  subject_template TEXT NOT NULL,
  preheader TEXT,
  content_json JSONB NOT NULL DEFAULT '[]'::jsonb,
  html_shell_version VARCHAR(40) NOT NULL DEFAULT 'v1',
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_by VARCHAR(255),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_email_templates_category ON email_templates (category);
CREATE INDEX IF NOT EXISTS idx_email_templates_active ON email_templates (is_active);

CREATE TABLE IF NOT EXISTS email_template_versions (
  id SERIAL PRIMARY KEY,
  template_id INTEGER NOT NULL REFERENCES email_templates (id) ON DELETE CASCADE,
  version_number INTEGER NOT NULL,
  subject_template TEXT NOT NULL,
  preheader TEXT,
  content_json JSONB NOT NULL,
  created_by VARCHAR(255),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (template_id, version_number)
);

CREATE TABLE IF NOT EXISTS email_template_assets (
  id SERIAL PRIMARY KEY,
  template_id INTEGER REFERENCES email_templates (id) ON DELETE SET NULL,
  filename VARCHAR(255) NOT NULL,
  original_filename VARCHAR(255) NOT NULL,
  content_type VARCHAR(120) NOT NULL,
  file_size INTEGER NOT NULL,
  storage_path TEXT NOT NULL,
  public_url TEXT NOT NULL,
  created_by VARCHAR(255),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_email_template_assets_template_id ON email_template_assets (template_id);

CREATE TABLE IF NOT EXISTS email_campaigns (
  id SERIAL PRIMARY KEY,
  template_id INTEGER REFERENCES email_templates (id) ON DELETE SET NULL,
  template_version_id INTEGER REFERENCES email_template_versions (id) ON DELETE SET NULL,
  name VARCHAR(255) NOT NULL,
  audience_type VARCHAR(80) NOT NULL DEFAULT 'segment',
  audience_filters_json JSONB NOT NULL DEFAULT '{}'::jsonb,
  send_mode VARCHAR(40) NOT NULL DEFAULT 'manual',
  status VARCHAR(40) NOT NULL DEFAULT 'draft',
  scheduled_for TIMESTAMPTZ,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  last_run_at TIMESTAMPTZ,
  total_recipients INTEGER NOT NULL DEFAULT 0,
  success_count INTEGER NOT NULL DEFAULT 0,
  failed_count INTEGER NOT NULL DEFAULT 0,
  created_by VARCHAR(255),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_email_campaigns_status ON email_campaigns (status);
CREATE INDEX IF NOT EXISTS idx_email_campaigns_scheduled_for ON email_campaigns (scheduled_for);

CREATE TABLE IF NOT EXISTS email_campaign_recipients (
  id SERIAL PRIMARY KEY,
  campaign_id INTEGER NOT NULL REFERENCES email_campaigns (id) ON DELETE CASCADE,
  email VARCHAR(255) NOT NULL,
  customer_ref VARCHAR(255),
  license_key VARCHAR(80),
  license_status VARCHAR(40),
  rendered_subject TEXT NOT NULL,
  rendered_html TEXT NOT NULL,
  delivery_status VARCHAR(40) NOT NULL DEFAULT 'pending',
  provider_message_id VARCHAR(255),
  sent_at TIMESTAMPTZ,
  error_message TEXT,
  metadata_json JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_email_campaign_recipients_campaign_id ON email_campaign_recipients (campaign_id);
CREATE INDEX IF NOT EXISTS idx_email_campaign_recipients_email ON email_campaign_recipients (email);
CREATE INDEX IF NOT EXISTS idx_email_campaign_recipients_status ON email_campaign_recipients (delivery_status);

CREATE TABLE IF NOT EXISTS email_automation_rules (
  id SERIAL PRIMARY KEY,
  template_id INTEGER REFERENCES email_templates (id) ON DELETE SET NULL,
  name VARCHAR(255) NOT NULL,
  trigger_type VARCHAR(60) NOT NULL,
  trigger_config_json JSONB NOT NULL DEFAULT '{}'::jsonb,
  audience_filters_json JSONB NOT NULL DEFAULT '{}'::jsonb,
  is_enabled BOOLEAN NOT NULL DEFAULT TRUE,
  cooldown_hours INTEGER NOT NULL DEFAULT 24,
  last_run_at TIMESTAMPTZ,
  next_run_at TIMESTAMPTZ,
  created_by VARCHAR(255),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_email_automation_rules_enabled ON email_automation_rules (is_enabled);
CREATE INDEX IF NOT EXISTS idx_email_automation_rules_next_run_at ON email_automation_rules (next_run_at);

INSERT INTO email_templates (
  key,
  name,
  category,
  subject_template,
  preheader,
  content_json,
  html_shell_version,
  is_active,
  created_by
) VALUES (
  'expired-license-reminder',
  'Expired License Reminder',
  'expired_license',
  'Your Signal Trading Bots license has expired',
  'Renew your access and get back online.',
  '[
    {"id":"intro-heading","type":"heading","content":"Your license has expired","level":1,"align":"left"},
    {"id":"intro-text","type":"text","content":"Hi {{customer_name}},\\n\\nYour {{plan_name}} license for {{license_key}} expired on {{expiry_date}}. We would love to help you get back online."},
    {"id":"cta","type":"button","label":"Open Customer Portal","url":"{{portal_url}}","variant":"primary"},
    {"id":"highlight","type":"highlight","variant":"warning","title":"Need help renewing?","content":"Reply to this email or contact {{support_email}} and we will guide you."},
    {"id":"signature","type":"signature","content":"Best regards,\\nSignal Trading Bots Support\\n{{support_email}}"}
  ]'::jsonb,
  'v1',
  TRUE,
  'system'
)
ON CONFLICT (key) DO NOTHING;
