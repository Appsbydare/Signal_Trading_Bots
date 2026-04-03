-- When a session ends (active = false), ended_at records the deactivation time (clearer than inferring from last_seen).

ALTER TABLE public.license_sessions
  ADD COLUMN IF NOT EXISTS ended_at TIMESTAMPTZ NULL;

COMMENT ON COLUMN public.license_sessions.ended_at IS 'Set when active becomes false; cleared on reactivation.';

-- Backfill historical inactive rows
UPDATE public.license_sessions
SET ended_at = last_seen_at
WHERE active = false AND ended_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_license_sessions_ended_at
  ON public.license_sessions (ended_at)
  WHERE ended_at IS NOT NULL;
