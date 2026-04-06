import { NextRequest, NextResponse } from "next/server";
import { getCurrentAdmin } from "@/lib/auth-server";
import { getCampaignById, listCampaignRecipients } from "@/lib/email-campaigns";

type Params = { params: Promise<{ id: string }> };

export async function GET(_: NextRequest, { params }: Params) {
  const admin = await getCurrentAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { id } = await params;
    const campaign = await getCampaignById(Number(id));
    if (!campaign) return NextResponse.json({ error: "Not found" }, { status: 404 });
    const recipients = await listCampaignRecipients(campaign.id);
    return NextResponse.json({ campaign, recipients });
  } catch (error: unknown) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Failed to load history detail" }, { status: 500 });
  }
}
