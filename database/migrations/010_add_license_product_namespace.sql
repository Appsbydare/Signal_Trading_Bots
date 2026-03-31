-- Add product namespace support for multi-product licensing (STB + ORB)

BEGIN;

ALTER TABLE public.licenses
  ADD COLUMN IF NOT EXISTS product_id VARCHAR(64);

ALTER TABLE public.license_sessions
  ADD COLUMN IF NOT EXISTS product_id VARCHAR(64);

ALTER TABLE public.license_validation_log
  ADD COLUMN IF NOT EXISTS product_id VARCHAR(64);

UPDATE public.licenses
SET product_id = 'SIGNAL_TRADING_BOTS'
WHERE product_id IS NULL;

UPDATE public.license_sessions
SET product_id = 'SIGNAL_TRADING_BOTS'
WHERE product_id IS NULL;

UPDATE public.license_validation_log
SET product_id = 'SIGNAL_TRADING_BOTS'
WHERE product_id IS NULL;

ALTER TABLE public.licenses
  ALTER COLUMN product_id SET DEFAULT 'SIGNAL_TRADING_BOTS',
  ALTER COLUMN product_id SET NOT NULL;

ALTER TABLE public.license_sessions
  ALTER COLUMN product_id SET DEFAULT 'SIGNAL_TRADING_BOTS',
  ALTER COLUMN product_id SET NOT NULL;

ALTER TABLE public.license_validation_log
  ALTER COLUMN product_id SET DEFAULT 'SIGNAL_TRADING_BOTS',
  ALTER COLUMN product_id SET NOT NULL;

CREATE INDEX IF NOT EXISTS idx_licenses_product_id
  ON public.licenses(product_id);

CREATE INDEX IF NOT EXISTS idx_license_sessions_product_id
  ON public.license_sessions(product_id);

CREATE INDEX IF NOT EXISTS idx_license_validation_log_product_id
  ON public.license_validation_log(product_id);

ALTER TABLE public.licenses
  DROP CONSTRAINT IF EXISTS licenses_product_id_check;
ALTER TABLE public.licenses
  ADD CONSTRAINT licenses_product_id_check
  CHECK (product_id IN ('SIGNAL_TRADING_BOTS', 'ORB_BOT'));

ALTER TABLE public.license_sessions
  DROP CONSTRAINT IF EXISTS license_sessions_product_id_check;
ALTER TABLE public.license_sessions
  ADD CONSTRAINT license_sessions_product_id_check
  CHECK (product_id IN ('SIGNAL_TRADING_BOTS', 'ORB_BOT'));

ALTER TABLE public.license_validation_log
  DROP CONSTRAINT IF EXISTS license_validation_log_product_id_check;
ALTER TABLE public.license_validation_log
  ADD CONSTRAINT license_validation_log_product_id_check
  CHECK (product_id IN ('SIGNAL_TRADING_BOTS', 'ORB_BOT'));

COMMIT;
