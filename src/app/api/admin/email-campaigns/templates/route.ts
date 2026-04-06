import { NextRequest, NextResponse } from "next/server";
import { getCurrentAdmin } from "@/lib/auth-server";
import { listEmailTemplates, upsertEmailTemplate } from "@/lib/email-campaigns";

export async function GET() {
  const admin = await getCurrentAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const templates = await listEmailTemplates();
    return NextResponse.json({ templates });
  } catch (error: unknown) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Failed to load templates" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const admin = await getCurrentAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await request.json();
    const result = await upsertEmailTemplate({
      id: body.id,
      key: body.key,
      name: body.name,
      category: body.category || "campaign",
      subjectTemplate: body.subjectTemplate,
      preheader: body.preheader,
      blocks: body.blocks || [],
      isActive: body.isActive,
      createdBy: admin.email,
    });

    return NextResponse.json(result);
  } catch (error: unknown) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Failed to save template" }, { status: 500 });
  }
}
