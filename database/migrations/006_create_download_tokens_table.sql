-- Migration: Create download_tokens table for secure R2 downloads
-- This table tracks single-use download links with expiration

CREATE TABLE IF NOT EXISTS download_tokens (
  id SERIAL PRIMARY KEY,
  token VARCHAR(100) UNIQUE NOT NULL,
  license_key VARCHAR(50) REFERENCES licenses (license_key) ON DELETE SET NULL,
  email VARCHAR(255) NOT NULL,
  file_name VARCHAR(255) NOT NULL,
  r2_signed_url TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL,
  used_at TIMESTAMPTZ,
  is_used BOOLEAN NOT NULL DEFAULT FALSE,
  ip_address VARCHAR(50),
  user_agent TEXT
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_download_tokens_token ON download_tokens (token);
CREATE INDEX IF NOT EXISTS idx_download_tokens_license_key ON download_tokens (license_key);
CREATE INDEX IF NOT EXISTS idx_download_tokens_email ON download_tokens (email);
CREATE INDEX IF NOT EXISTS idx_download_tokens_created_at ON download_tokens (created_at);
CREATE INDEX IF NOT EXISTS idx_download_tokens_is_used ON download_tokens (is_used);

-- Comments for documentation
COMMENT ON TABLE download_tokens IS 'Tracks single-use download links for installer files with R2 signed URLs';
COMMENT ON COLUMN download_tokens.token IS 'Unique token for download link verification';
COMMENT ON COLUMN download_tokens.license_key IS 'Associated license key (optional, can be null for pre-purchase downloads)';
COMMENT ON COLUMN download_tokens.email IS 'Email address of the user requesting download';
COMMENT ON COLUMN download_tokens.file_name IS 'Name of the file being downloaded';
COMMENT ON COLUMN download_tokens.r2_signed_url IS 'Cloudflare R2 presigned URL (expires after 1 hour)';
COMMENT ON COLUMN download_tokens.expires_at IS 'When the download link expires (typically 1 hour from creation)';
COMMENT ON COLUMN download_tokens.used_at IS 'Timestamp when the download was used';
COMMENT ON COLUMN download_tokens.is_used IS 'Whether the download link has been used (enforces single-use)';
COMMENT ON COLUMN download_tokens.ip_address IS 'IP address of the download request (for security audit)';
COMMENT ON COLUMN download_tokens.user_agent IS 'User agent of the download request (for security audit)';
