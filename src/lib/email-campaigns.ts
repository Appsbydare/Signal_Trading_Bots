import "server-only";

import { getSupabaseClient, getSupabasePublicUrl, uploadBinaryFile } from "@/lib/supabase-storage";
import { getSupportFromEmail, sendResendEmail } from "@/lib/email-core";

export type TemplateBlockType =
  | "heading"
  | "text"
  | "image"
  | "button"
  | "divider"
  | "highlight"
  | "signature"
  | "html";

export interface TemplateBlock {
  id: string;
  type: TemplateBlockType;
  content?: string;
  level?: 1 | 2 | 3;
  align?: "left" | "center" | "right";
  label?: string;
  url?: string;
  src?: string;
  alt?: string;
  title?: string;
  variant?: "primary" | "secondary" | "success" | "warning" | "danger";
}

export interface EmailTemplate {
  id: number;
  key: string;
  name: string;
  category: string;
  subject_template: string;
  preheader: string | null;
  content_json: TemplateBlock[];
  html_shell_version: string;
  is_active: boolean;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface EmailTemplateVersion {
  id: number;
  template_id: number;
  version_number: number;
  subject_template: string;
  preheader: string | null;
  content_json: TemplateBlock[];
  created_by: string | null;
  created_at: string;
}

export interface AudienceFilterSet {
  preset?: string;
  licenseStatus?: Array<"active" | "expired" | "revoked">;
  daysToExpiryMin?: number | null;
  daysToExpiryMax?: number | null;
  daysSinceExpiryMin?: number | null;
  daysSinceExpiryMax?: number | null;
  planIds?: string[];
  hasActiveSubscription?: boolean | null;
  requiresEmail?: boolean;
  limit?: number;
}

export interface AudienceRecipient {
  email: string;
  customerName: string;
  customerRef: string | null;
  licenseKey: string | null;
  licenseStatus: string | null;
  planName: string | null;
  expiryDate: string | null;
  daysExpired: number | null;
  daysToExpiry: number | null;
}

export interface EmailCampaign {
  id: number;
  template_id: number | null;
  template_version_id: number | null;
  name: string;
  audience_type: string;
  audience_filters_json: AudienceFilterSet;
  send_mode: string;
  status: string;
  scheduled_for: string | null;
  started_at: string | null;
  completed_at: string | null;
  last_run_at: string | null;
  total_recipients: number;
  success_count: number;
  failed_count: number;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface EmailRecipientLog {
  id: number;
  campaign_id: number;
  email: string;
  customer_ref: string | null;
  license_key: string | null;
  license_status: string | null;
  rendered_subject: string;
  rendered_html: string;
  delivery_status: string;
  provider_message_id: string | null;
  sent_at: string | null;
  error_message: string | null;
  metadata_json: Record<string, unknown>;
  created_at: string;
}

export interface EmailAutomationRule {
  id: number;
  template_id: number | null;
  name: string;
  trigger_type: string;
  trigger_config_json: Record<string, unknown>;
  audience_filters_json: AudienceFilterSet;
  is_enabled: boolean;
  cooldown_hours: number;
  last_run_at: string | null;
  next_run_at: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export const EMAIL_TEMPLATE_TOKENS = [
  "{{customer_name}}",
  "{{email}}",
  "{{license_key}}",
  "{{plan_name}}",
  "{{expiry_date}}",
  "{{days_expired}}",
  "{{portal_url}}",
  "{{support_email}}",
] as const;

const DEFAULT_PORTAL_URL =
  process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") || "https://www.signaltradingbots.com/portal";
const EMAIL_ASSET_PREFIX = "email-campaigns/assets";
const DEFAULT_BATCH_SIZE = 20;

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80) || `template-${Date.now()}`;
}

function safeJson<T>(value: unknown, fallback: T): T {
  if (value == null) return fallback;
  return value as T;
}

export function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;");
}

function nl2br(text: string): string {
  return escapeHtml(text).replace(/\n/g, "<br>");
}

function sanitizeInlineHtml(html: string): string {
  return html
    .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, "")
    .replace(/\son\w+="[^"]*"/gi, "")
    .replace(/\son\w+='[^']*'/gi, "")
    .replace(/javascript:/gi, "");
}

function normalizeBlocks(blocks: TemplateBlock[]): TemplateBlock[] {
  return (blocks || []).map((block, index) => ({
    id: block.id || `block-${index + 1}`,
    type: block.type,
    content: block.content || "",
    level: block.level || 2,
    align: block.align || "left",
    label: block.label || "",
    url: block.url || "",
    src: block.src || "",
    alt: block.alt || "",
    title: block.title || "",
    variant: block.variant || "primary",
  }));
}

function renderBlock(block: TemplateBlock): string {
  const align = block.align || "left";
  const textAlign = `text-align:${align};`;

  switch (block.type) {
    case "heading": {
      const tag = block.level === 1 ? "h1" : block.level === 3 ? "h3" : "h2";
      const fontSize = block.level === 1 ? "30px" : block.level === 3 ? "18px" : "24px";
      return `<${tag} style="margin:0 0 16px;color:#ffffff;font-size:${fontSize};line-height:1.2;${textAlign}">${nl2br(block.content || "")}</${tag}>`;
    }
    case "text":
      return `<p style="margin:0 0 16px;color:#d4d4d8;font-size:15px;line-height:1.75;${textAlign}">${nl2br(block.content || "")}</p>`;
    case "image":
      if (!block.src) return "";
      return `<div style="margin:0 0 18px;${textAlign}"><img src="${escapeHtml(block.src)}" alt="${escapeHtml(block.alt || "")}" style="max-width:100%;height:auto;border-radius:16px;display:inline-block;border:1px solid rgba(255,255,255,0.08);" /></div>`;
    case "button":
      if (!block.url) return "";
      return `<div style="margin:0 0 18px;${textAlign}"><a href="${escapeHtml(block.url)}" style="display:inline-block;background:${block.variant === "secondary" ? "#27272a" : "#2563eb"};color:#ffffff;padding:14px 22px;border-radius:12px;text-decoration:none;font-weight:700;font-size:14px;">${escapeHtml(block.label || "Open")}</a></div>`;
    case "divider":
      return `<hr style="border:none;border-top:1px solid rgba(255,255,255,0.12);margin:24px 0;" />`;
    case "highlight": {
      const palette =
        block.variant === "warning"
          ? { border: "#f59e0b", bg: "#451a03", text: "#fde68a" }
          : block.variant === "success"
            ? { border: "#10b981", bg: "#052e2b", text: "#a7f3d0" }
            : block.variant === "danger"
              ? { border: "#ef4444", bg: "#450a0a", text: "#fecaca" }
              : { border: "#3b82f6", bg: "#172554", text: "#bfdbfe" };
      return `<div style="margin:0 0 18px;padding:18px;border-left:4px solid ${palette.border};background:${palette.bg};border-radius:14px;">${block.title ? `<p style="margin:0 0 8px;color:${palette.text};font-size:15px;font-weight:700;">${escapeHtml(block.title)}</p>` : ""}<p style="margin:0;color:${palette.text};font-size:14px;line-height:1.7;">${nl2br(block.content || "")}</p></div>`;
    }
    case "signature":
      return `<p style="margin:8px 0 0;color:#a1a1aa;font-size:14px;line-height:1.7;${textAlign}">${nl2br(block.content || "")}</p>`;
    case "html":
      return `<div style="margin:0 0 18px;">${sanitizeInlineHtml(block.content || "")}</div>`;
    default:
      return "";
  }
}

export function renderBrandedEmailShell(params: { subject: string; preheader?: string | null; bodyHtml: string }) {
  const preheader = params.preheader || "";
  const supportEmail = getSupportFromEmail();

  return `<!DOCTYPE html><html><head><meta charset="utf-8" /><meta name="viewport" content="width=device-width, initial-scale=1.0" /><title>${escapeHtml(params.subject)}</title></head><body style="margin:0;padding:0;background:#09090b;font-family:Arial,sans-serif;"><div style="display:none;max-height:0;overflow:hidden;opacity:0;">${escapeHtml(preheader)}</div><table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:radial-gradient(circle at top,#1d4ed8 0%,#0f172a 40%,#09090b 100%);padding:24px 0;"><tr><td align="center"><table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:680px;background:#111827;border:1px solid rgba(255,255,255,0.08);border-radius:24px;overflow:hidden;"><tr><td style="padding:28px 28px 12px;"><p style="margin:0;color:#93c5fd;font-size:12px;font-weight:700;letter-spacing:0.18em;text-transform:uppercase;">Signal Trading Bots</p></td></tr><tr><td style="padding:8px 28px 28px;">${params.bodyHtml}</td></tr><tr><td style="padding:0 28px 28px;"><div style="padding-top:18px;border-top:1px solid rgba(255,255,255,0.08);color:#71717a;font-size:12px;line-height:1.7;">Signal Trading Bots<br />Support: <a href="mailto:${escapeHtml(supportEmail)}" style="color:#93c5fd;text-decoration:none;">${escapeHtml(supportEmail)}</a></div></td></tr></table></td></tr></table></body></html>`;
}

export function renderEmailTemplate(template: Pick<EmailTemplate, "subject_template" | "preheader" | "content_json">, recipient: AudienceRecipient) {
  const tokens: Record<string, string> = {
    customer_name: recipient.customerName || "Trader",
    email: recipient.email || "",
    license_key: recipient.licenseKey || "N/A",
    plan_name: recipient.planName || "Signal Trading Bots plan",
    expiry_date: recipient.expiryDate || "N/A",
    days_expired: recipient.daysExpired == null ? "" : String(recipient.daysExpired),
    portal_url: DEFAULT_PORTAL_URL,
    support_email: getSupportFromEmail(),
  };

  const replaceTokens = (value: string) => value.replace(/\{\{(\w+)\}\}/g, (_, key: string) => tokens[key] ?? "");
  const hydratedBlocks = normalizeBlocks(template.content_json).map((block) => ({
    ...block,
    content: replaceTokens(block.content || ""),
    label: replaceTokens(block.label || ""),
    title: replaceTokens(block.title || ""),
    url: replaceTokens(block.url || ""),
    src: replaceTokens(block.src || ""),
    alt: replaceTokens(block.alt || ""),
  }));

  const subject = replaceTokens(template.subject_template);
  const preheader = replaceTokens(template.preheader || "");
  const bodyHtml = hydratedBlocks.map(renderBlock).join("");
  const html = renderBrandedEmailShell({ subject, preheader, bodyHtml });

  return { subject, preheader, html, blocks: hydratedBlocks };
}

function inferPreset(filters: AudienceFilterSet): AudienceFilterSet {
  switch (filters.preset) {
    case "expired_licenses":
      return { ...filters, licenseStatus: ["expired"], requiresEmail: true };
    case "expiring_in_3_days":
      return { ...filters, licenseStatus: ["active"], daysToExpiryMin: 0, daysToExpiryMax: 3, requiresEmail: true };
    case "expiring_in_7_days":
      return { ...filters, licenseStatus: ["active"], daysToExpiryMin: 0, daysToExpiryMax: 7, requiresEmail: true };
    case "active_lifetime":
      return { ...filters, licenseStatus: ["active"], planIds: ["lifetime", "orb_lifetime"], requiresEmail: true };
    case "all_customers_with_license":
      return { ...filters, requiresEmail: true };
    default:
      return filters;
  }
}

function daysBetween(dateValue: string | null | undefined, now = new Date()) {
  if (!dateValue) return null;
  const diff = new Date(dateValue).getTime() - now.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

export async function resolveAudience(rawFilters: AudienceFilterSet): Promise<AudienceRecipient[]> {
  const filters = inferPreset(rawFilters);
  const client = getSupabaseClient();
  const { data: licenses, error } = await client.from("licenses").select("email, license_key, status, plan, expires_at").order("created_at", { ascending: false });
  if (error) throw error;

  const { data: customers } = await client.from("customers").select("id, email, name");
  const { data: subscriptions } = await client.from("subscriptions").select("email, status").in("status", ["active", "trialing", "past_due"]);
  const customerByEmail = new Map((customers || []).map((row) => [String(row.email).toLowerCase(), row]));
  const activeSubscriptionEmails = new Set((subscriptions || []).map((row) => String(row.email).toLowerCase()));
  const now = new Date();

  const resolved = (licenses || [])
    .filter((license) => {
      const email = String(license.email || "").trim().toLowerCase();
      if (filters.requiresEmail && !email) return false;
      if (filters.licenseStatus?.length && !filters.licenseStatus.includes(license.status)) return false;
      if (filters.planIds?.length && !filters.planIds.includes(license.plan)) return false;
      const daysToExpiry = daysBetween(license.expires_at, now);
      const daysSinceExpiry = daysToExpiry == null ? null : Math.max(0, -daysToExpiry);
      if (filters.daysToExpiryMin != null && (daysToExpiry == null || daysToExpiry < filters.daysToExpiryMin)) return false;
      if (filters.daysToExpiryMax != null && (daysToExpiry == null || daysToExpiry > filters.daysToExpiryMax)) return false;
      if (filters.daysSinceExpiryMin != null && (daysSinceExpiry == null || daysSinceExpiry < filters.daysSinceExpiryMin)) return false;
      if (filters.daysSinceExpiryMax != null && (daysSinceExpiry == null || daysSinceExpiry > filters.daysSinceExpiryMax)) return false;
      if (filters.hasActiveSubscription === true && !activeSubscriptionEmails.has(email)) return false;
      if (filters.hasActiveSubscription === false && activeSubscriptionEmails.has(email)) return false;
      return true;
    })
    .map((license) => {
      const email = String(license.email || "").trim().toLowerCase();
      const customer = customerByEmail.get(email);
      const daysToExpiry = daysBetween(license.expires_at, now);
      return {
        email,
        customerName: customer?.name || email.split("@")[0] || "Trader",
        customerRef: customer?.id ? String(customer.id) : null,
        licenseKey: license.license_key,
        licenseStatus: license.status,
        planName: license.plan,
        expiryDate: license.expires_at ? new Date(license.expires_at).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }) : null,
        daysExpired: daysToExpiry != null && daysToExpiry < 0 ? Math.abs(daysToExpiry) : 0,
        daysToExpiry,
      } satisfies AudienceRecipient;
    });

  const deduped = new Map<string, AudienceRecipient>();
  for (const row of resolved) {
    if (!deduped.has(row.email)) deduped.set(row.email, row);
  }
  const audience = Array.from(deduped.values());
  return typeof filters.limit === "number" ? audience.slice(0, filters.limit) : audience;
}

export async function listEmailTemplates(): Promise<EmailTemplate[]> {
  const client = getSupabaseClient();
  const { data, error } = await client.from("email_templates").select("*").order("updated_at", { ascending: false });
  if (error) throw error;
  return (data || []).map((row) => ({ ...row, content_json: safeJson(row.content_json, []) })) as EmailTemplate[];
}

export async function getEmailTemplateById(id: number): Promise<EmailTemplate | null> {
  const client = getSupabaseClient();
  const { data, error } = await client.from("email_templates").select("*").eq("id", id).maybeSingle();
  if (error) throw error;
  return data ? ({ ...data, content_json: safeJson(data.content_json, []) } as EmailTemplate) : null;
}

async function createTemplateVersion(templateId: number, createdBy: string | null, template: Pick<EmailTemplate, "subject_template" | "preheader" | "content_json">) {
  const client = getSupabaseClient();
  const { data: latest } = await client
    .from("email_template_versions")
    .select("version_number")
    .eq("template_id", templateId)
    .order("version_number", { ascending: false })
    .limit(1)
    .maybeSingle();

  const versionNumber = (latest?.version_number || 0) + 1;
  const { data, error } = await client
    .from("email_template_versions")
    .insert({
      template_id: templateId,
      version_number: versionNumber,
      subject_template: template.subject_template,
      preheader: template.preheader,
      content_json: normalizeBlocks(template.content_json),
      created_by: createdBy,
    })
    .select("*")
    .single();
  if (error) throw error;
  return data as EmailTemplateVersion;
}

export async function upsertEmailTemplate(input: {
  id?: number;
  key?: string;
  name: string;
  category: string;
  subjectTemplate: string;
  preheader?: string;
  blocks: TemplateBlock[];
  isActive?: boolean;
  createdBy?: string | null;
}) {
  const client = getSupabaseClient();
  const payload = {
    key: input.key || slugify(input.name),
    name: input.name,
    category: input.category || "campaign",
    subject_template: input.subjectTemplate,
    preheader: input.preheader || "",
    content_json: normalizeBlocks(input.blocks),
    html_shell_version: "v1",
    is_active: input.isActive ?? true,
    created_by: input.createdBy || null,
    updated_at: new Date().toISOString(),
  };

  let row: EmailTemplate | null = null;
  if (input.id) {
    const { data, error } = await client.from("email_templates").update(payload).eq("id", input.id).select("*").single();
    if (error) throw error;
    row = { ...data, content_json: safeJson(data.content_json, []) } as EmailTemplate;
  } else {
    const { data, error } = await client.from("email_templates").insert(payload).select("*").single();
    if (error) throw error;
    row = { ...data, content_json: safeJson(data.content_json, []) } as EmailTemplate;
  }

  const version = await createTemplateVersion(row.id, input.createdBy || null, row);
  return { template: row, version };
}

export async function deleteEmailTemplate(id: number) {
  const client = getSupabaseClient();
  const { error } = await client.from("email_templates").delete().eq("id", id);
  if (error) throw error;
}

export async function listCampaigns(limit = 30): Promise<EmailCampaign[]> {
  const client = getSupabaseClient();
  const { data, error } = await client.from("email_campaigns").select("*").order("created_at", { ascending: false }).limit(limit);
  if (error) throw error;
  return (data || []).map((row) => ({ ...row, audience_filters_json: safeJson(row.audience_filters_json, {}) })) as EmailCampaign[];
}

export async function getCampaignById(id: number): Promise<EmailCampaign | null> {
  const client = getSupabaseClient();
  const { data, error } = await client.from("email_campaigns").select("*").eq("id", id).maybeSingle();
  if (error) throw error;
  return data ? ({ ...data, audience_filters_json: safeJson(data.audience_filters_json, {}) } as EmailCampaign) : null;
}

export async function listCampaignRecipients(campaignId: number): Promise<EmailRecipientLog[]> {
  const client = getSupabaseClient();
  const { data, error } = await client
    .from("email_campaign_recipients")
    .select("*")
    .eq("campaign_id", campaignId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data || []).map((row) => ({ ...row, metadata_json: safeJson(row.metadata_json, {}) })) as EmailRecipientLog[];
}

export async function createCampaign(input: {
  templateId: number;
  name: string;
  audienceFilters: AudienceFilterSet;
  sendMode: string;
  status?: string;
  scheduledFor?: string | null;
  createdBy?: string | null;
}) {
  const template = await getEmailTemplateById(input.templateId);
  if (!template) throw new Error("Template not found.");
  const version = await createTemplateVersion(template.id, input.createdBy || null, template);
  const audience = await resolveAudience(input.audienceFilters);
  const client = getSupabaseClient();
  const { data, error } = await client
    .from("email_campaigns")
    .insert({
      template_id: template.id,
      template_version_id: version.id,
      name: input.name,
      audience_type: input.audienceFilters.preset ? "preset" : "segment",
      audience_filters_json: input.audienceFilters,
      send_mode: input.sendMode,
      status: input.status || "draft",
      scheduled_for: input.scheduledFor || null,
      total_recipients: audience.length,
      created_by: input.createdBy || null,
      updated_at: new Date().toISOString(),
    })
    .select("*")
    .single();
  if (error) throw error;
  return { campaign: data as EmailCampaign, audienceCount: audience.length, template, version };
}

export async function updateCampaignStatus(id: number, updates: Partial<EmailCampaign>) {
  const client = getSupabaseClient();
  const { error } = await client.from("email_campaigns").update({ ...updates, updated_at: new Date().toISOString() }).eq("id", id);
  if (error) throw error;
}

async function getTemplateVersionById(id: number): Promise<EmailTemplateVersion | null> {
  const client = getSupabaseClient();
  const { data, error } = await client.from("email_template_versions").select("*").eq("id", id).maybeSingle();
  if (error) throw error;
  return data ? ({ ...data, content_json: safeJson(data.content_json, []) } as EmailTemplateVersion) : null;
}

async function hasRecentDelivery(email: string, templateId: number, cooldownHours: number) {
  const client = getSupabaseClient();
  const cutoff = new Date(Date.now() - cooldownHours * 60 * 60 * 1000).toISOString();
  const { data, error } = await client
    .from("email_campaign_recipients")
    .select("id, campaign_id")
    .eq("email", email)
    .gte("created_at", cutoff)
    .limit(25);

  if (error) {
    console.warn("Recent delivery check failed", error.message);
    return false;
  }

  if (!data?.length) return false;
  const campaignIds = data.map((row) => row.campaign_id);
  const { data: campaigns, error: campaignError } = await client
    .from("email_campaigns")
    .select("id, template_id")
    .in("id", campaignIds);
  if (campaignError) return false;
  return (campaigns || []).some((campaign) => campaign.template_id === templateId);
}

async function createRecipientLog(input: {
  campaignId: number;
  recipient: AudienceRecipient;
  renderedSubject: string;
  renderedHtml: string;
  deliveryStatus: string;
  providerMessageId?: string | null;
  sentAt?: string | null;
  errorMessage?: string | null;
}) {
  const client = getSupabaseClient();
  const { error } = await client.from("email_campaign_recipients").insert({
    campaign_id: input.campaignId,
    email: input.recipient.email,
    customer_ref: input.recipient.customerRef,
    license_key: input.recipient.licenseKey,
    license_status: input.recipient.licenseStatus,
    rendered_subject: input.renderedSubject,
    rendered_html: input.renderedHtml,
    delivery_status: input.deliveryStatus,
    provider_message_id: input.providerMessageId || null,
    sent_at: input.sentAt || null,
    error_message: input.errorMessage || null,
    metadata_json: {
      planName: input.recipient.planName,
      expiryDate: input.recipient.expiryDate,
      daysExpired: input.recipient.daysExpired,
      daysToExpiry: input.recipient.daysToExpiry,
    },
  });
  if (error) throw error;
}

export async function sendCampaignTest(params: {
  templateId: number;
  testEmail: string;
  sampleRecipient?: AudienceRecipient;
}) {
  const template = await getEmailTemplateById(params.templateId);
  if (!template) throw new Error("Template not found.");
  const sample = params.sampleRecipient || {
    email: params.testEmail,
    customerName: "Sample Trader",
    customerRef: null,
    licenseKey: "STB-EXAMPLE-1234",
    licenseStatus: "expired",
    planName: "starter_yearly",
    expiryDate: new Date().toLocaleDateString("en-US"),
    daysExpired: 4,
    daysToExpiry: -4,
  };

  const rendered = renderEmailTemplate(template, sample);
  const result = await sendResendEmail({
    to: params.testEmail,
    subject: `[Test] ${rendered.subject}`,
    html: rendered.html,
  });
  return { rendered, providerMessageId: result.id || null };
}

export async function sendCampaignNow(params: {
  campaignId: number;
  batchSize?: number;
  cooldownHours?: number;
}) {
  const campaign = await getCampaignById(params.campaignId);
  if (!campaign) throw new Error("Campaign not found.");
  const template = campaign.template_version_id ? await getTemplateVersionById(campaign.template_version_id) : null;
  if (!template) throw new Error("Campaign template snapshot not found.");

  const audience = await resolveAudience(campaign.audience_filters_json);
  const batchSize = params.batchSize || DEFAULT_BATCH_SIZE;
  const cooldownHours = params.cooldownHours || 24;

  await updateCampaignStatus(campaign.id, {
    status: "sending",
    started_at: new Date().toISOString(),
    total_recipients: audience.length,
  } as Partial<EmailCampaign>);

  let successCount = 0;
  let failedCount = 0;

  for (let i = 0; i < audience.length; i += batchSize) {
    const chunk = audience.slice(i, i + batchSize);
    for (const recipient of chunk) {
      const rendered = renderEmailTemplate({
        subject_template: template.subject_template,
        preheader: template.preheader,
        content_json: template.content_json,
      }, recipient);

      try {
        if (campaign.template_id && await hasRecentDelivery(recipient.email, campaign.template_id, cooldownHours)) {
          await createRecipientLog({
            campaignId: campaign.id,
            recipient,
            renderedSubject: rendered.subject,
            renderedHtml: rendered.html,
            deliveryStatus: "skipped_duplicate",
            errorMessage: `Skipped due to ${cooldownHours}h cooldown window.`,
          });
          continue;
        }

        const result = await sendResendEmail({
          to: recipient.email,
          subject: rendered.subject,
          html: rendered.html,
        });

        successCount += 1;
        await createRecipientLog({
          campaignId: campaign.id,
          recipient,
          renderedSubject: rendered.subject,
          renderedHtml: rendered.html,
          deliveryStatus: "sent",
          providerMessageId: result.id || null,
          sentAt: new Date().toISOString(),
        });
      } catch (error: unknown) {
        failedCount += 1;
        await createRecipientLog({
          campaignId: campaign.id,
          recipient,
          renderedSubject: rendered.subject,
          renderedHtml: rendered.html,
          deliveryStatus: "failed",
          errorMessage: error instanceof Error ? error.message : "Unknown delivery error",
        });
      }
    }
  }

  const finalStatus = failedCount > 0 && successCount > 0 ? "completed_with_errors" : failedCount > 0 ? "failed" : "completed";
  await updateCampaignStatus(campaign.id, {
    status: finalStatus,
    success_count: successCount,
    failed_count: failedCount,
    last_run_at: new Date().toISOString(),
    completed_at: new Date().toISOString(),
  } as Partial<EmailCampaign>);

  return { successCount, failedCount, totalRecipients: audience.length, status: finalStatus };
}

export async function listAutomationRules(): Promise<EmailAutomationRule[]> {
  const client = getSupabaseClient();
  const { data, error } = await client.from("email_automation_rules").select("*").order("created_at", { ascending: false });
  if (error) throw error;
  return (data || []).map((row) => ({
    ...row,
    trigger_config_json: safeJson(row.trigger_config_json, {}),
    audience_filters_json: safeJson(row.audience_filters_json, {}),
  })) as EmailAutomationRule[];
}

function computeNextRunAt(triggerType: string, triggerConfig: Record<string, unknown>) {
  const now = new Date();
  if (triggerType === "one_time") {
    return typeof triggerConfig.scheduledFor === "string" ? triggerConfig.scheduledFor : now.toISOString();
  }
  const runHour = typeof triggerConfig.hour === "number" ? triggerConfig.hour : 8;
  const next = new Date(now);
  next.setUTCHours(runHour, 0, 0, 0);
  if (next <= now) next.setUTCDate(next.getUTCDate() + 1);
  return next.toISOString();
}

export async function upsertAutomationRule(input: {
  id?: number;
  templateId: number;
  name: string;
  triggerType: string;
  triggerConfig: Record<string, unknown>;
  audienceFilters: AudienceFilterSet;
  isEnabled?: boolean;
  cooldownHours?: number;
  createdBy?: string | null;
}) {
  const client = getSupabaseClient();
  const payload = {
    template_id: input.templateId,
    name: input.name,
    trigger_type: input.triggerType,
    trigger_config_json: input.triggerConfig,
    audience_filters_json: input.audienceFilters,
    is_enabled: input.isEnabled ?? true,
    cooldown_hours: input.cooldownHours ?? 24,
    next_run_at: computeNextRunAt(input.triggerType, input.triggerConfig),
    created_by: input.createdBy || null,
    updated_at: new Date().toISOString(),
  };

  if (input.id) {
    const { data, error } = await client.from("email_automation_rules").update(payload).eq("id", input.id).select("*").single();
    if (error) throw error;
    return data as EmailAutomationRule;
  }

  const { data, error } = await client.from("email_automation_rules").insert(payload).select("*").single();
  if (error) throw error;
  return data as EmailAutomationRule;
}

export async function runScheduledEmailAutomations() {
  const client = getSupabaseClient();
  const nowIso = new Date().toISOString();
  const { data: rules, error } = await client
    .from("email_automation_rules")
    .select("*")
    .eq("is_enabled", true)
    .lte("next_run_at", nowIso)
    .order("next_run_at", { ascending: true });
  if (error) throw error;

  const results: Array<{ ruleId: number; campaignId?: number; status: string; message?: string }> = [];
  for (const rawRule of rules || []) {
    const rule = {
      ...rawRule,
      trigger_config_json: safeJson(rawRule.trigger_config_json, {}),
      audience_filters_json: safeJson(rawRule.audience_filters_json, {}),
    } as EmailAutomationRule;
    try {
      const created = await createCampaign({
        templateId: rule.template_id!,
        name: `${rule.name} ${new Date().toISOString()}`,
        audienceFilters: rule.audience_filters_json,
        sendMode: "automation",
        status: "queued",
        createdBy: rule.created_by || "automation",
      });
      const sendResult = await sendCampaignNow({ campaignId: created.campaign.id, cooldownHours: rule.cooldown_hours });
      await client.from("email_automation_rules").update({
        last_run_at: nowIso,
        next_run_at: rule.trigger_type === "one_time" ? null : computeNextRunAt(rule.trigger_type, rule.trigger_config_json),
        updated_at: nowIso,
      }).eq("id", rule.id);
      if (rule.trigger_type === "one_time") {
        await client.from("email_automation_rules").update({ is_enabled: false, updated_at: nowIso }).eq("id", rule.id);
      }
      results.push({ ruleId: rule.id, campaignId: created.campaign.id, status: sendResult.status });
    } catch (error: unknown) {
      results.push({ ruleId: rule.id, status: "failed", message: error instanceof Error ? error.message : "Automation run failed" });
    }
  }
  return results;
}

export async function uploadEmailTemplateAsset(params: {
  fileBuffer: Buffer;
  fileName: string;
  contentType: string;
  createdBy?: string | null;
  templateId?: number | null;
}) {
  const safeName = `${Date.now()}-${params.fileName.replace(/[^a-zA-Z0-9._-]/g, "-")}`;
  const storagePath = `${EMAIL_ASSET_PREFIX}/${safeName}`;
  await uploadBinaryFile(storagePath, params.fileBuffer, params.contentType);
  const publicUrl = getSupabasePublicUrl(storagePath);
  const client = getSupabaseClient();
  const { data, error } = await client
    .from("email_template_assets")
    .insert({
      template_id: params.templateId || null,
      filename: safeName,
      original_filename: params.fileName,
      content_type: params.contentType,
      file_size: params.fileBuffer.byteLength,
      storage_path: storagePath,
      public_url: publicUrl,
      created_by: params.createdBy || null,
    })
    .select("*")
    .single();
  if (error) throw error;
  return data;
}
