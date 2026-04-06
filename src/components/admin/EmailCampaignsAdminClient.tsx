"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type {
  AudienceFilterSet,
  AudienceRecipient,
  EmailAutomationRule,
  EmailCampaign,
  EmailRecipientLog,
  EmailTemplate,
  TemplateBlock,
} from "@/lib/email-campaigns";

type TabKey = "templates" | "audience" | "send" | "history";

const PRESET_OPTIONS = [
  { value: "expired_licenses", label: "Expired licenses" },
  { value: "expiring_in_3_days", label: "Expiring in 3 days" },
  { value: "expiring_in_7_days", label: "Expiring in 7 days" },
  { value: "active_lifetime", label: "Active lifetime customers" },
  { value: "all_customers_with_license", label: "All customers with a license" },
];

const BLOCK_TYPE_OPTIONS: Array<TemplateBlock["type"]> = [
  "heading",
  "text",
  "image",
  "button",
  "divider",
  "highlight",
  "signature",
  "html",
];

const DEFAULT_BLOCKS: TemplateBlock[] = [
  { id: "heading-1", type: "heading", content: "Your license has expired", level: 1 },
  { id: "text-1", type: "text", content: "Hi {{customer_name}},\n\nYour {{plan_name}} license for {{license_key}} expired on {{expiry_date}}." },
  { id: "button-1", type: "button", label: "Open Customer Portal", url: "{{portal_url}}" },
  { id: "signature-1", type: "signature", content: "Signal Trading Bots Support\n{{support_email}}" },
];

function classNames(...values: Array<string | false | null | undefined>) {
  return values.filter(Boolean).join(" ");
}

function PreviewCard({ html }: { html: string }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-950 shadow-xl">
      <div className="border-b border-zinc-800 bg-zinc-900 px-4 py-3 text-xs uppercase tracking-[0.2em] text-zinc-500">Preview</div>
      <iframe title="Email preview" className="h-[520px] w-full bg-white" sandbox="" srcDoc={html} />
    </div>
  );
}

async function jsonFetch<T>(input: RequestInfo, init?: RequestInit): Promise<T> {
  const response = await fetch(input, init);
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || "Request failed");
  return data as T;
}

function buildPreviewHtml(subject: string, preheader: string, blocks: TemplateBlock[]) {
  const normalize = (value: string) =>
    value
      .replaceAll("{{customer_name}}", "Alex")
      .replaceAll("{{email}}", "alex@example.com")
      .replaceAll("{{license_key}}", "STB-ABCD-EFGH")
      .replaceAll("{{plan_name}}", "Starter Plan")
      .replaceAll("{{expiry_date}}", "April 1, 2026")
      .replaceAll("{{days_expired}}", "5")
      .replaceAll("{{portal_url}}", "https://www.signaltradingbots.com/portal")
      .replaceAll("{{support_email}}", "support@signaltradingbots.com");

  const renderedBlocks = blocks.map((block) => {
    const hydrated = {
      ...block,
      content: normalize(block.content || ""),
      label: normalize(block.label || ""),
      title: normalize(block.title || ""),
      url: normalize(block.url || ""),
      src: normalize(block.src || ""),
      alt: normalize(block.alt || ""),
    };

    if (hydrated.type === "heading") {
      const tag = hydrated.level === 1 ? "h1" : hydrated.level === 3 ? "h3" : "h2";
      return `<${tag} style="color:#fff;margin:0 0 16px;">${hydrated.content}</${tag}>`;
    }
    if (hydrated.type === "text") return `<p style="color:#d4d4d8;line-height:1.75;">${hydrated.content.replaceAll("\n", "<br>")}</p>`;
    if (hydrated.type === "image" && hydrated.src) return `<img src="${hydrated.src}" alt="${hydrated.alt || ""}" style="max-width:100%;border-radius:16px;margin:0 0 16px;" />`;
    if (hydrated.type === "button" && hydrated.url) return `<p><a href="${hydrated.url}" style="display:inline-block;background:#2563eb;color:#fff;padding:12px 18px;border-radius:12px;text-decoration:none;font-weight:700;">${hydrated.label || "Open"}</a></p>`;
    if (hydrated.type === "divider") return `<hr style="border:none;border-top:1px solid rgba(255,255,255,.12);margin:20px 0;" />`;
    if (hydrated.type === "highlight") return `<div style="padding:16px;border-left:4px solid #f59e0b;background:#451a03;border-radius:14px;color:#fde68a;margin:0 0 16px;"><strong>${hydrated.title || ""}</strong><br/>${hydrated.content || ""}</div>`;
    if (hydrated.type === "signature") return `<p style="color:#a1a1aa;white-space:pre-line;">${hydrated.content}</p>`;
    if (hydrated.type === "html") return hydrated.content || "";
    return "";
  }).join("");

  return `<!DOCTYPE html><html><head><meta charset="utf-8"/><title>${normalize(subject)}</title></head><body style="margin:0;background:#09090b;font-family:Arial,sans-serif;"><div style="display:none;opacity:0;">${normalize(preheader)}</div><div style="max-width:680px;margin:24px auto;background:#111827;border:1px solid rgba(255,255,255,.08);border-radius:24px;padding:28px;"><p style="margin:0 0 12px;color:#93c5fd;font-size:12px;font-weight:700;letter-spacing:.18em;text-transform:uppercase;">Signal Trading Bots</p>${renderedBlocks}<div style="margin-top:24px;padding-top:18px;border-top:1px solid rgba(255,255,255,.08);color:#71717a;font-size:12px;">Signal Trading Bots</div></div></body></html>`;
}

export function EmailCampaignsAdminClient({ adminEmail }: { adminEmail: string }) {
  const [activeTab, setActiveTab] = useState<TabKey>("templates");
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [campaigns, setCampaigns] = useState<EmailCampaign[]>([]);
  const [automationRules, setAutomationRules] = useState<EmailAutomationRule[]>([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState<number | null>(null);
  const [selectedCampaignId, setSelectedCampaignId] = useState<number | null>(null);
  const [historyRecipients, setHistoryRecipients] = useState<EmailRecipientLog[]>([]);
  const [audiencePreview, setAudiencePreview] = useState<AudienceRecipient[]>([]);
  const [audienceCount, setAudienceCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [testEmail, setTestEmail] = useState(adminEmail);

  const [templateForm, setTemplateForm] = useState({
    id: undefined as number | undefined,
    key: "",
    name: "Expired License Reminder",
    category: "expired_license",
    subjectTemplate: "Your Signal Trading Bots license has expired",
    preheader: "Renew your access and get back online.",
    blocks: DEFAULT_BLOCKS as TemplateBlock[],
  });

  const [audienceFilters, setAudienceFilters] = useState<AudienceFilterSet>({
    preset: "expired_licenses",
    requiresEmail: true,
  });

  const [campaignForm, setCampaignForm] = useState({
    name: "Expired license reminder",
    sendMode: "manual",
    scheduledFor: "",
    cooldownHours: 24,
  });

  const [automationForm, setAutomationForm] = useState({
    id: undefined as number | undefined,
    name: "Daily expired license reminder",
    triggerType: "daily",
    hour: 8,
    cooldownHours: 24,
    isEnabled: true,
  });

  const previewHtml = useMemo(
    () => buildPreviewHtml(templateForm.subjectTemplate, templateForm.preheader, templateForm.blocks),
    [templateForm],
  );

  const loadAll = useCallback(async () => {
    setLoading(true);
    try {
      const [{ templates: templateRows }, { campaigns: campaignRows }, { rules }] = await Promise.all([
        jsonFetch<{ templates: EmailTemplate[] }>("/api/admin/email-campaigns/templates"),
        jsonFetch<{ campaigns: EmailCampaign[] }>("/api/admin/email-campaigns/campaigns"),
        jsonFetch<{ rules: EmailAutomationRule[] }>("/api/admin/email-campaigns/automation"),
      ]);
      setTemplates(templateRows);
      setCampaigns(campaignRows);
      setAutomationRules(rules);
      if (!selectedTemplateId && templateRows[0]) hydrateTemplate(templateRows[0]);
    } catch (error: unknown) {
      setMessage(error instanceof Error ? error.message : "Failed to load email campaigns.");
    } finally {
      setLoading(false);
    }
  }, [selectedTemplateId]);

  useEffect(() => {
    void loadAll();
  }, [loadAll]);

  async function previewAudience() {
    setLoading(true);
    try {
      const result = await jsonFetch<{ total: number; recipients: AudienceRecipient[] }>("/api/admin/email-campaigns/audience/preview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ filters: audienceFilters }),
      });
      setAudienceCount(result.total);
      setAudiencePreview(result.recipients);
      setMessage(`Audience preview ready: ${result.total} recipients`);
    } catch (error: unknown) {
      setMessage(error instanceof Error ? error.message : "Failed to preview audience.");
    } finally {
      setLoading(false);
    }
  }

  function hydrateTemplate(template: EmailTemplate) {
    setSelectedTemplateId(template.id);
    setTemplateForm({
      id: template.id,
      key: template.key,
      name: template.name,
      category: template.category,
      subjectTemplate: template.subject_template,
      preheader: template.preheader || "",
      blocks: template.content_json?.length ? template.content_json : DEFAULT_BLOCKS,
    });
  }

  async function saveTemplate() {
    setLoading(true);
    try {
      const result = await jsonFetch<{ template: EmailTemplate }>("/api/admin/email-campaigns/templates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(templateForm),
      });
      setMessage("Template saved.");
      await loadAll();
      hydrateTemplate(result.template);
    } catch (error: unknown) {
      setMessage(error instanceof Error ? error.message : "Failed to save template.");
    } finally {
      setLoading(false);
    }
  }

  async function uploadAsset(file: File) {
    const formData = new FormData();
    formData.append("file", file);
    if (templateForm.id) formData.append("templateId", String(templateForm.id));
    const result = await jsonFetch<{ asset: { public_url: string } }>("/api/admin/email-campaigns/assets", {
      method: "POST",
      body: formData,
    });
    return result.asset.public_url;
  }

  async function handleAssetUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      setLoading(true);
      const publicUrl = await uploadAsset(file);
      setTemplateForm((current) => ({
        ...current,
        blocks: [...current.blocks, { id: `image-${Date.now()}`, type: "image", src: publicUrl, alt: file.name }],
      }));
      setMessage("Image uploaded and added to template.");
    } catch (error: unknown) {
      setMessage(error instanceof Error ? error.message : "Failed to upload image.");
    } finally {
      setLoading(false);
      event.target.value = "";
    }
  }

  async function runTestSend() {
    if (!selectedTemplateId && !templateForm.id) {
      setMessage("Save the template first.");
      return;
    }

    setLoading(true);
    try {
      await jsonFetch("/api/admin/email-campaigns/send-test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          templateId: selectedTemplateId || templateForm.id,
          testEmail,
          filters: audienceFilters,
        }),
      });
      setMessage(`Test email sent to ${testEmail}.`);
    } catch (error: unknown) {
      setMessage(error instanceof Error ? error.message : "Failed to send test email.");
    } finally {
      setLoading(false);
    }
  }

  async function createCampaignAndMaybeSend(sendImmediately: boolean) {
    if (!selectedTemplateId && !templateForm.id) {
      setMessage("Save the template first.");
      return;
    }

    setLoading(true);
    try {
      const result = await jsonFetch<{ campaign: EmailCampaign }>("/api/admin/email-campaigns/campaigns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          templateId: selectedTemplateId || templateForm.id,
          name: campaignForm.name,
          audienceFilters,
          sendMode: campaignForm.sendMode,
          status: campaignForm.sendMode === "scheduled" ? "scheduled" : "queued",
          scheduledFor: campaignForm.scheduledFor || null,
        }),
      });

      if (sendImmediately) {
        await jsonFetch("/api/admin/email-campaigns/send-now", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ campaignId: result.campaign.id, cooldownHours: campaignForm.cooldownHours }),
        });
        setMessage("Campaign sent.");
      } else {
        setMessage(campaignForm.sendMode === "scheduled" ? "Campaign scheduled." : "Campaign saved.");
      }

      await loadAll();
      setSelectedCampaignId(result.campaign.id);
      await loadHistoryDetail(result.campaign.id);
    } catch (error: unknown) {
      setMessage(error instanceof Error ? error.message : "Failed to create campaign.");
    } finally {
      setLoading(false);
    }
  }

  async function saveAutomationRule() {
    if (!selectedTemplateId && !templateForm.id) {
      setMessage("Save the template first.");
      return;
    }

    setLoading(true);
    try {
      await jsonFetch("/api/admin/email-campaigns/automation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: automationForm.id,
          templateId: selectedTemplateId || templateForm.id,
          name: automationForm.name,
          triggerType: automationForm.triggerType,
          triggerConfig: {
            hour: automationForm.hour,
            scheduledFor: campaignForm.scheduledFor || undefined,
          },
          audienceFilters,
          cooldownHours: automationForm.cooldownHours,
          isEnabled: automationForm.isEnabled,
        }),
      });
      setMessage("Automation rule saved.");
      await loadAll();
    } catch (error: unknown) {
      setMessage(error instanceof Error ? error.message : "Failed to save automation rule.");
    } finally {
      setLoading(false);
    }
  }

  async function loadHistoryDetail(campaignId: number) {
    setLoading(true);
    try {
      const result = await jsonFetch<{ recipients: EmailRecipientLog[] }>(`/api/admin/email-campaigns/history/${campaignId}`);
      setHistoryRecipients(result.recipients);
      setSelectedCampaignId(campaignId);
    } catch (error: unknown) {
      setMessage(error instanceof Error ? error.message : "Failed to load campaign history.");
    } finally {
      setLoading(false);
    }
  }

  function updateBlock(index: number, patch: Partial<TemplateBlock>) {
    setTemplateForm((current) => ({
      ...current,
      blocks: current.blocks.map((block, blockIndex) => blockIndex === index ? { ...block, ...patch } : block),
    }));
  }

  function addBlock(type: TemplateBlock["type"]) {
    setTemplateForm((current) => ({
      ...current,
      blocks: [
        ...current.blocks,
        { id: `${type}-${Date.now()}`, type, content: "", label: "Open portal", url: "{{portal_url}}", variant: "primary" },
      ],
    }));
  }

  function removeBlock(index: number) {
    setTemplateForm((current) => ({
      ...current,
      blocks: current.blocks.filter((_, blockIndex) => blockIndex !== index),
    }));
  }

  return (
    <div className="space-y-6 px-4 pb-10">
      <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-white">Email Campaigns</h1>
            <p className="mt-2 max-w-3xl text-sm text-zinc-400">
              Build branded HTML email templates, target expired-license audiences, run reviewed campaigns, and automate recurring reminders.
            </p>
          </div>
          <div className="flex flex-wrap gap-2 text-xs">
            {["templates", "audience", "send", "history"].map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveTab(tab as TabKey)}
                className={classNames(
                  "rounded-full border px-4 py-2 font-medium capitalize transition",
                  activeTab === tab
                    ? "border-blue-500 bg-blue-500/15 text-blue-200"
                    : "border-zinc-700 bg-zinc-950 text-zinc-400 hover:border-zinc-500 hover:text-white",
                )}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>
        {message ? <p className="mt-4 rounded-xl border border-blue-500/20 bg-blue-500/10 px-4 py-3 text-sm text-blue-200">{message}</p> : null}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.35fr_0.95fr]">
        <div className="space-y-6">
          {activeTab === "templates" && (
            <section className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-white">Template Builder</h2>
                  <p className="mt-1 text-sm text-zinc-400">Save reusable email templates with blocks, HTML-safe sections, images, and signatures.</p>
                </div>
                <div className="flex gap-2">
                  <input type="file" accept="image/*" onChange={handleAssetUpload} className="max-w-[210px] text-xs text-zinc-400" />
                  <button onClick={saveTemplate} disabled={loading} className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-500 disabled:opacity-60">
                    Save Template
                  </button>
                </div>
              </div>

              <div className="mt-6 grid gap-4 md:grid-cols-2">
                <label className="space-y-2 text-sm text-zinc-300">
                  <span>Template</span>
                  <select
                    value={selectedTemplateId ?? ""}
                    onChange={(event) => {
                      const template = templates.find((item) => item.id === Number(event.target.value));
                      if (template) hydrateTemplate(template);
                    }}
                    className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-3 py-2 text-white"
                  >
                    <option value="">New template</option>
                    {templates.map((template) => (
                      <option key={template.id} value={template.id}>{template.name}</option>
                    ))}
                  </select>
                </label>
                <label className="space-y-2 text-sm text-zinc-300">
                  <span>Name</span>
                  <input value={templateForm.name} onChange={(e) => setTemplateForm((c) => ({ ...c, name: e.target.value }))} className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-3 py-2 text-white" />
                </label>
                <label className="space-y-2 text-sm text-zinc-300 md:col-span-2">
                  <span>Subject</span>
                  <input value={templateForm.subjectTemplate} onChange={(e) => setTemplateForm((c) => ({ ...c, subjectTemplate: e.target.value }))} className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-3 py-2 text-white" />
                </label>
                <label className="space-y-2 text-sm text-zinc-300 md:col-span-2">
                  <span>Preheader</span>
                  <input value={templateForm.preheader} onChange={(e) => setTemplateForm((c) => ({ ...c, preheader: e.target.value }))} className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-3 py-2 text-white" />
                </label>
              </div>

              <div className="mt-5 flex flex-wrap gap-2">
                {BLOCK_TYPE_OPTIONS.map((type) => (
                  <button key={type} type="button" onClick={() => addBlock(type)} className="rounded-full border border-zinc-700 bg-zinc-950 px-3 py-1.5 text-xs text-zinc-300 hover:border-zinc-500 hover:text-white">
                    Add {type}
                  </button>
                ))}
              </div>

              <div className="mt-6 space-y-4">
                {templateForm.blocks.map((block, index) => (
                  <div key={block.id} className="rounded-2xl border border-zinc-800 bg-zinc-950/70 p-4">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-white">{index + 1}. {block.type}</p>
                      <button type="button" onClick={() => removeBlock(index)} className="text-xs text-rose-300 hover:text-rose-200">Remove</button>
                    </div>
                    <div className="mt-3 grid gap-3">
                      {(block.type === "heading" || block.type === "text" || block.type === "highlight" || block.type === "signature" || block.type === "html") && (
                        <textarea
                          value={block.content || ""}
                          onChange={(e) => updateBlock(index, { content: e.target.value })}
                          rows={block.type === "html" ? 8 : 4}
                          className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-white"
                        />
                      )}
                      {block.type === "heading" && (
                        <select value={block.level || 2} onChange={(e) => updateBlock(index, { level: Number(e.target.value) as 1 | 2 | 3 })} className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-white">
                          <option value={1}>Heading 1</option>
                          <option value={2}>Heading 2</option>
                          <option value={3}>Heading 3</option>
                        </select>
                      )}
                      {block.type === "image" && (
                        <>
                          <input value={block.src || ""} onChange={(e) => updateBlock(index, { src: e.target.value })} placeholder="Image URL" className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-white" />
                          <input value={block.alt || ""} onChange={(e) => updateBlock(index, { alt: e.target.value })} placeholder="Alt text" className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-white" />
                        </>
                      )}
                      {block.type === "button" && (
                        <>
                          <input value={block.label || ""} onChange={(e) => updateBlock(index, { label: e.target.value })} placeholder="Button label" className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-white" />
                          <input value={block.url || ""} onChange={(e) => updateBlock(index, { url: e.target.value })} placeholder="Button URL" className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-white" />
                        </>
                      )}
                      {block.type === "highlight" && (
                        <input value={block.title || ""} onChange={(e) => updateBlock(index, { title: e.target.value })} placeholder="Highlight title" className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-white" />
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 rounded-2xl border border-zinc-800 bg-zinc-950/60 p-4">
                <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-zinc-400">Tokens</h3>
                <div className="mt-3 flex flex-wrap gap-2">
                  {["{{customer_name}}", "{{email}}", "{{license_key}}", "{{plan_name}}", "{{expiry_date}}", "{{days_expired}}", "{{portal_url}}", "{{support_email}}"].map((token) => (
                    <button key={token} type="button" onClick={() => navigator.clipboard.writeText(token)} className="rounded-full border border-zinc-700 bg-zinc-950 px-3 py-1.5 text-xs text-zinc-300 hover:border-zinc-500 hover:text-white">
                      {token}
                    </button>
                  ))}
                </div>
              </div>
            </section>
          )}

          {activeTab === "audience" && (
            <section className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-white">Audience Builder</h2>
                  <p className="mt-1 text-sm text-zinc-400">Preview recipient count before sending, with segment presets and plan/status filters.</p>
                </div>
                <button onClick={previewAudience} disabled={loading} className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-500 disabled:opacity-60">
                  Preview Audience
                </button>
              </div>
              <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                <label className="space-y-2 text-sm text-zinc-300">
                  <span>Preset</span>
                  <select value={audienceFilters.preset || ""} onChange={(e) => setAudienceFilters((c) => ({ ...c, preset: e.target.value || undefined }))} className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-3 py-2 text-white">
                    {PRESET_OPTIONS.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
                  </select>
                </label>
                <label className="space-y-2 text-sm text-zinc-300">
                  <span>License status</span>
                  <select value={audienceFilters.licenseStatus?.[0] || ""} onChange={(e) => setAudienceFilters((c) => ({ ...c, licenseStatus: e.target.value ? [e.target.value as "active" | "expired" | "revoked"] : undefined }))} className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-3 py-2 text-white">
                    <option value="">Any</option>
                    <option value="expired">Expired</option>
                    <option value="active">Active</option>
                    <option value="revoked">Revoked</option>
                  </select>
                </label>
                <label className="space-y-2 text-sm text-zinc-300">
                  <span>Plan</span>
                  <input value={audienceFilters.planIds?.[0] || ""} onChange={(e) => setAudienceFilters((c) => ({ ...c, planIds: e.target.value ? [e.target.value] : undefined }))} placeholder="starter_yearly" className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-3 py-2 text-white" />
                </label>
                <label className="space-y-2 text-sm text-zinc-300">
                  <span>Days to expiry min</span>
                  <input type="number" value={audienceFilters.daysToExpiryMin ?? ""} onChange={(e) => setAudienceFilters((c) => ({ ...c, daysToExpiryMin: e.target.value === "" ? null : Number(e.target.value) }))} className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-3 py-2 text-white" />
                </label>
                <label className="space-y-2 text-sm text-zinc-300">
                  <span>Days to expiry max</span>
                  <input type="number" value={audienceFilters.daysToExpiryMax ?? ""} onChange={(e) => setAudienceFilters((c) => ({ ...c, daysToExpiryMax: e.target.value === "" ? null : Number(e.target.value) }))} className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-3 py-2 text-white" />
                </label>
                <label className="space-y-2 text-sm text-zinc-300">
                  <span>Days since expiry max</span>
                  <input type="number" value={audienceFilters.daysSinceExpiryMax ?? ""} onChange={(e) => setAudienceFilters((c) => ({ ...c, daysSinceExpiryMax: e.target.value === "" ? null : Number(e.target.value) }))} className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-3 py-2 text-white" />
                </label>
              </div>
              <div className="mt-6 rounded-2xl border border-zinc-800 bg-zinc-950/70 p-4">
                <p className="text-sm text-zinc-300">Estimated recipients</p>
                <p className="mt-2 text-4xl font-semibold text-white">{audienceCount}</p>
                <div className="mt-5 space-y-3">
                  {audiencePreview.map((recipient) => (
                    <div key={recipient.email} className="rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-3">
                      <p className="text-sm font-medium text-white">{recipient.customerName}</p>
                      <p className="text-xs text-zinc-400">{recipient.email} · {recipient.planName} · {recipient.licenseStatus}</p>
                    </div>
                  ))}
                  {!audiencePreview.length ? <p className="text-sm text-zinc-500">Run audience preview to inspect sample recipients.</p> : null}
                </div>
              </div>
            </section>
          )}

          {activeTab === "send" && (
            <section className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6">
              <h2 className="text-xl font-semibold text-white">Review, Test, And Send</h2>
              <p className="mt-1 text-sm text-zinc-400">Review your audience, send a test email, then send now or schedule a campaign.</p>
              <div className="mt-6 grid gap-4 md:grid-cols-2">
                <label className="space-y-2 text-sm text-zinc-300">
                  <span>Campaign name</span>
                  <input value={campaignForm.name} onChange={(e) => setCampaignForm((c) => ({ ...c, name: e.target.value }))} className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-3 py-2 text-white" />
                </label>
                <label className="space-y-2 text-sm text-zinc-300">
                  <span>Mode</span>
                  <select value={campaignForm.sendMode} onChange={(e) => setCampaignForm((c) => ({ ...c, sendMode: e.target.value }))} className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-3 py-2 text-white">
                    <option value="manual">Manual</option>
                    <option value="scheduled">Scheduled</option>
                    <option value="automation">Automation</option>
                  </select>
                </label>
                <label className="space-y-2 text-sm text-zinc-300">
                  <span>Test email</span>
                  <input value={testEmail} onChange={(e) => setTestEmail(e.target.value)} className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-3 py-2 text-white" />
                </label>
                <label className="space-y-2 text-sm text-zinc-300">
                  <span>Cooldown hours</span>
                  <input type="number" value={campaignForm.cooldownHours} onChange={(e) => setCampaignForm((c) => ({ ...c, cooldownHours: Number(e.target.value) }))} className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-3 py-2 text-white" />
                </label>
                <label className="space-y-2 text-sm text-zinc-300 md:col-span-2">
                  <span>Schedule for</span>
                  <input type="datetime-local" value={campaignForm.scheduledFor} onChange={(e) => setCampaignForm((c) => ({ ...c, scheduledFor: e.target.value }))} className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-3 py-2 text-white" />
                </label>
              </div>
              <div className="mt-6 flex flex-wrap gap-3">
                <button onClick={previewAudience} disabled={loading} className="rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-2 text-sm text-zinc-200 hover:border-zinc-500">Refresh Preview</button>
                <button onClick={runTestSend} disabled={loading} className="rounded-xl border border-blue-500/30 bg-blue-500/10 px-4 py-2 text-sm text-blue-100 hover:bg-blue-500/20">Send Test</button>
                <button onClick={() => createCampaignAndMaybeSend(false)} disabled={loading} className="rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-2 text-sm text-amber-100 hover:bg-amber-500/20">Save / Schedule</button>
                <button onClick={() => createCampaignAndMaybeSend(true)} disabled={loading} className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-500">Send Now</button>
              </div>

              <div className="mt-8 rounded-2xl border border-zinc-800 bg-zinc-950/70 p-4">
                <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-zinc-400">Automation</h3>
                <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                  <input value={automationForm.name} onChange={(e) => setAutomationForm((c) => ({ ...c, name: e.target.value }))} placeholder="Rule name" className="rounded-xl border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-white" />
                  <select value={automationForm.triggerType} onChange={(e) => setAutomationForm((c) => ({ ...c, triggerType: e.target.value }))} className="rounded-xl border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-white">
                    <option value="daily">Daily rule</option>
                    <option value="one_time">One-time scheduled rule</option>
                  </select>
                  <input type="number" value={automationForm.hour} onChange={(e) => setAutomationForm((c) => ({ ...c, hour: Number(e.target.value) }))} placeholder="UTC hour" className="rounded-xl border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-white" />
                  <input type="number" value={automationForm.cooldownHours} onChange={(e) => setAutomationForm((c) => ({ ...c, cooldownHours: Number(e.target.value) }))} placeholder="Cooldown hours" className="rounded-xl border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-white" />
                </div>
                <div className="mt-4 flex items-center justify-between">
                  <label className="flex items-center gap-2 text-sm text-zinc-300">
                    <input type="checkbox" checked={automationForm.isEnabled} onChange={(e) => setAutomationForm((c) => ({ ...c, isEnabled: e.target.checked }))} />
                    Rule enabled
                  </label>
                  <button onClick={saveAutomationRule} disabled={loading} className="rounded-xl bg-violet-600 px-4 py-2 text-sm font-medium text-white hover:bg-violet-500">Save Automation Rule</button>
                </div>
                <div className="mt-4 space-y-2">
                  {automationRules.map((rule) => (
                    <div key={rule.id} className="rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-3">
                      <p className="text-sm font-medium text-white">{rule.name}</p>
                      <p className="text-xs text-zinc-400">{rule.trigger_type} · next run {rule.next_run_at ? new Date(rule.next_run_at).toLocaleString() : "not scheduled"} · cooldown {rule.cooldown_hours}h</p>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          )}
          {activeTab === "history" && (
            <section className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6">
              <h2 className="text-xl font-semibold text-white">Campaign History</h2>
              <p className="mt-1 text-sm text-zinc-400">Inspect campaign totals and per-recipient delivery results.</p>
              <div className="mt-6 grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
                <div className="space-y-3">
                  {campaigns.map((campaign) => (
                    <button
                      key={campaign.id}
                      type="button"
                      onClick={() => loadHistoryDetail(campaign.id)}
                      className={classNames(
                        "w-full rounded-2xl border p-4 text-left transition",
                        selectedCampaignId === campaign.id ? "border-blue-500 bg-blue-500/10" : "border-zinc-800 bg-zinc-950 hover:border-zinc-600",
                      )}
                    >
                      <p className="text-sm font-semibold text-white">{campaign.name}</p>
                      <p className="mt-1 text-xs text-zinc-400">{campaign.status} · {campaign.success_count} sent · {campaign.failed_count} failed</p>
                    </button>
                  ))}
                  {!campaigns.length ? <p className="text-sm text-zinc-500">No campaigns yet.</p> : null}
                </div>
                <div className="rounded-2xl border border-zinc-800 bg-zinc-950/70 p-4">
                  <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-zinc-400">Recipient Logs</h3>
                  <div className="mt-4 space-y-3">
                    {historyRecipients.map((item) => (
                      <div key={item.id} className="rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-3">
                        <p className="text-sm font-medium text-white">{item.email}</p>
                        <p className="mt-1 text-xs text-zinc-400">{item.delivery_status} · {item.license_status || "n/a"} · {item.sent_at ? new Date(item.sent_at).toLocaleString() : "not sent"}</p>
                        {item.error_message ? <p className="mt-2 text-xs text-rose-300">{item.error_message}</p> : null}
                      </div>
                    ))}
                    {!historyRecipients.length ? <p className="text-sm text-zinc-500">Select a campaign to load recipient history.</p> : null}
                  </div>
                </div>
              </div>
            </section>
          )}
        </div>

        <div className="space-y-6">
          <PreviewCard html={previewHtml} />
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-5">
            <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-zinc-400">Review checklist</h3>
            <ul className="mt-4 space-y-2 text-sm text-zinc-300">
              <li>Save the template before sending or scheduling.</li>
              <li>Run audience preview to confirm recipient count and sample rows.</li>
              <li>Send a test email to yourself before bulk delivery.</li>
              <li>Use cooldown hours to avoid duplicate reminders to the same recipient.</li>
            </ul>
            {loading ? <p className="mt-4 text-xs text-zinc-500">Working...</p> : null}
          </div>
        </div>
      </div>
    </div>
  );
}
