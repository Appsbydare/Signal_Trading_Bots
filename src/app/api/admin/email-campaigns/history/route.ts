import { NextResponse } from "next/server";
import { getCurrentAdmin } from "@/lib/auth-server";
import { listCampaigns } from "@/lib/email-campaigns";

export async function GET() {
  const admin = await getCurrentAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const campaigns = await listCampaigns(50);
    return NextResponse.json({ campaigns });
  } catch (error: unknown) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Failed to load history" }, { status: 500 });
  }
}
