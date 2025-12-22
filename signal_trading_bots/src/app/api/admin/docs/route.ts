import { NextRequest, NextResponse } from "next/server";

import { getSupabaseClient } from "@/lib/supabase-storage";

function jsonError(status: number, message: string) {
  return NextResponse.json({ success: false, message }, { status });
}

export async function GET() {
  const client = getSupabaseClient();
  const { data, error } = await client
    .from("kb_documents")
    .select("*")
    .order("created_at", { ascending: true });

  if (error) {
    console.error("Failed to load documents", error);
    return jsonError(500, "Failed to load documents");
  }

  return NextResponse.json({ success: true, docs: data ?? [] });
}

export async function POST(request: NextRequest) {
  let body: {
    id?: number;
    title?: string;
    slug?: string;
    content_md?: string;
    category?: string;
  } = {};

  try {
    body = await request.json();
  } catch {
    return jsonError(400, "Invalid JSON body");
  }

  if (!body.title || !body.slug || !body.content_md) {
    return jsonError(400, "title, slug, and content_md are required");
  }

  const client = getSupabaseClient();
  const { data, error } = await client
    .from("kb_documents")
    .upsert(
      [
        {
          id: body.id,
          title: body.title,
          slug: body.slug,
          content_md: body.content_md,
          category: body.category ?? null,
        },
      ],
      { onConflict: "slug" },
    )
    .select("*")
    .maybeSingle();

  if (error) {
    console.error("Failed to save document", error);
    return jsonError(500, "Failed to save document");
  }

  return NextResponse.json({ success: true, doc: data });
}

export async function DELETE(request: NextRequest) {
  const idParam = request.nextUrl.searchParams.get("id");
  const id = idParam ? Number(idParam) : NaN;
  if (!idParam || Number.isNaN(id)) {
    return jsonError(400, "Valid id is required");
  }

  const client = getSupabaseClient();
  const { error } = await client.from("kb_documents").delete().eq("id", id);
  if (error) {
    console.error("Failed to delete document", error);
    return jsonError(500, "Failed to delete document");
  }

  return NextResponse.json({ success: true });
}


