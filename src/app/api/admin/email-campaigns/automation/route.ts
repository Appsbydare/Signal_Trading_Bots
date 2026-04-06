import { NextRequest, NextResponse } from "next/server";
import { getCurrentAdmin } from "@/lib/auth-server";
import { listAutomationRules, upsertAutomationRule } from "@/lib/email-campaigns";

export async function GET() {
  const admin = await getCurrentAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const rules = await listAutomationRules();
    return NextResponse.json({ rules });
  } catch (error: unknown) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Failed to load automation rules" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const admin = await getCurrentAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await request.json();
    const rule = await upsertAutomationRule({
      id: body.id,
      templateId: Number(body.templateId),
      name: body.name,
      triggerType: body.triggerType || "daily",
      triggerConfig: body.triggerConfig || {},
      audienceFilters: body.audienceFilters || {},
      isEnabled: body.isEnabled,
      cooldownHours: body.cooldownHours,
      createdBy: admin.email,
    });

    return NextResponse.json({ rule });
  } catch (error: unknown) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Failed to save automation rule" }, { status: 500 });
  }
}
