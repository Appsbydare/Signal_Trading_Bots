import { NextRequest, NextResponse } from "next/server";
import { getCurrentAdmin } from "@/lib/auth-server";
import { resolveAudience, type AudienceFilterSet } from "@/lib/email-campaigns";

export async function POST(request: NextRequest) {
  const admin = await getCurrentAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await request.json();
    const filters = (body.filters || {}) as AudienceFilterSet;
    const audience = await resolveAudience(filters);

    return NextResponse.json({
      total: audience.length,
      recipients: audience.slice(0, 12),
    });
  } catch (error: unknown) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Failed to resolve audience" }, { status: 500 });
  }
}
