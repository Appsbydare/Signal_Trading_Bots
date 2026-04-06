import { NextRequest, NextResponse } from "next/server";
import { getCurrentAdmin } from "@/lib/auth-server";
import { createCampaign, listCampaigns } from "@/lib/email-campaigns";

export async function GET() {
  const admin = await getCurrentAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const campaigns = await listCampaigns();
    return NextResponse.json({ campaigns });
  } catch (error: unknown) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Failed to load campaigns" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const admin = await getCurrentAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await request.json();
    const result = await createCampaign({
      templateId: Number(body.templateId),
      name: body.name,
      audienceFilters: body.audienceFilters || {},
      sendMode: body.sendMode || "manual",
      status: body.status || "draft",
      scheduledFor: body.scheduledFor || null,
      createdBy: admin.email,
    });
    return NextResponse.json(result);
  } catch (error: unknown) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Failed to create campaign" }, { status: 500 });
  }
}
