-- Migration 013: Lock down email campaign tables for server-only (service_role) access.
-- Admin panel uses custom JWT + Supabase service role; anon/authenticated must not read/write.

-- ---------------------------------------------------------------------------
-- Privileges: defense in depth (RLS alone is not enough if grants are permissive)
-- ---------------------------------------------------------------------------
REVOKE ALL ON TABLE public.email_templates FROM anon, authenticated;
REVOKE ALL ON TABLE public.email_template_versions FROM anon, authenticated;
REVOKE ALL ON TABLE public.email_template_assets FROM anon, authenticated;
REVOKE ALL ON TABLE public.email_campaigns FROM anon, authenticated;
REVOKE ALL ON TABLE public.email_campaign_recipients FROM anon, authenticated;
REVOKE ALL ON TABLE public.email_automation_rules FROM anon, authenticated;

REVOKE ALL ON SEQUENCE public.email_templates_id_seq FROM anon, authenticated;
REVOKE ALL ON SEQUENCE public.email_template_versions_id_seq FROM anon, authenticated;
REVOKE ALL ON SEQUENCE public.email_template_assets_id_seq FROM anon, authenticated;
REVOKE ALL ON SEQUENCE public.email_campaigns_id_seq FROM anon, authenticated;
REVOKE ALL ON SEQUENCE public.email_campaign_recipients_id_seq FROM anon, authenticated;
REVOKE ALL ON SEQUENCE public.email_automation_rules_id_seq FROM anon, authenticated;

GRANT ALL ON TABLE public.email_templates TO service_role;
GRANT ALL ON TABLE public.email_template_versions TO service_role;
GRANT ALL ON TABLE public.email_template_assets TO service_role;
GRANT ALL ON TABLE public.email_campaigns TO service_role;
GRANT ALL ON TABLE public.email_campaign_recipients TO service_role;
GRANT ALL ON TABLE public.email_automation_rules TO service_role;

GRANT ALL ON SEQUENCE public.email_templates_id_seq TO service_role;
GRANT ALL ON SEQUENCE public.email_template_versions_id_seq TO service_role;
GRANT ALL ON SEQUENCE public.email_template_assets_id_seq TO service_role;
GRANT ALL ON SEQUENCE public.email_campaigns_id_seq TO service_role;
GRANT ALL ON SEQUENCE public.email_campaign_recipients_id_seq TO service_role;
GRANT ALL ON SEQUENCE public.email_automation_rules_id_seq TO service_role;

-- ---------------------------------------------------------------------------
-- RLS: explicit no-access for client JWT roles (satisfies linter; service_role bypasses RLS)
-- ---------------------------------------------------------------------------
CREATE POLICY "email_templates_block_anon_authenticated"
  ON public.email_templates
  FOR ALL
  TO anon, authenticated
  USING (false)
  WITH CHECK (false);

CREATE POLICY "email_template_versions_block_anon_authenticated"
  ON public.email_template_versions
  FOR ALL
  TO anon, authenticated
  USING (false)
  WITH CHECK (false);

CREATE POLICY "email_template_assets_block_anon_authenticated"
  ON public.email_template_assets
  FOR ALL
  TO anon, authenticated
  USING (false)
  WITH CHECK (false);

CREATE POLICY "email_campaigns_block_anon_authenticated"
  ON public.email_campaigns
  FOR ALL
  TO anon, authenticated
  USING (false)
  WITH CHECK (false);

CREATE POLICY "email_campaign_recipients_block_anon_authenticated"
  ON public.email_campaign_recipients
  FOR ALL
  TO anon, authenticated
  USING (false)
  WITH CHECK (false);

CREATE POLICY "email_automation_rules_block_anon_authenticated"
  ON public.email_automation_rules
  FOR ALL
  TO anon, authenticated
  USING (false)
  WITH CHECK (false);
