import { NextRequest, NextResponse } from "next/server";
import { getCurrentAdmin } from "@/lib/auth-server";
import { sendCampaignNow } from "@/lib/email-campaigns";

export async function POST(request: NextRequest) {
  const admin = await getCurrentAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await request.json();
    const result = await sendCampaignNow({
      campaignId: Number(body.campaignId),
      cooldownHours: typeof body.cooldownHours === "number" ? body.cooldownHours : 24,
    });
    return NextResponse.json(result);
  } catch (error: unknown) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Failed to send campaign" }, { status: 500 });
  }
}
