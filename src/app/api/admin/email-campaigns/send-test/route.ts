import { NextRequest, NextResponse } from "next/server";
import { getCurrentAdmin } from "@/lib/auth-server";
import { resolveAudience, sendCampaignTest, type AudienceFilterSet } from "@/lib/email-campaigns";

export async function POST(request: NextRequest) {
  const admin = await getCurrentAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await request.json();
    const templateId = Number(body.templateId);
    const testEmail = String(body.testEmail || admin.email).trim();
    const filters = (body.filters || { preset: "expired_licenses", limit: 1 }) as AudienceFilterSet;
    const sample = (await resolveAudience({ ...filters, limit: 1 }))[0];
    const result = await sendCampaignTest({
      templateId,
      testEmail,
      sampleRecipient: sample,
    });

    return NextResponse.json(result);
  } catch (error: unknown) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Failed to send test email" }, { status: 500 });
  }
}
