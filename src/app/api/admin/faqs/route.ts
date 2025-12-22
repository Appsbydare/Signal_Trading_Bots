import { NextRequest, NextResponse } from "next/server";

import { getSupabaseClient } from "@/lib/supabase-storage";

function jsonError(status: number, message: string) {
  return NextResponse.json({ success: false, message }, { status });
}

export async function GET(request: NextRequest) {
  const client = getSupabaseClient();
  const search = request.nextUrl.searchParams.get("search") || "";

  let query = client.from("faqs").select("*").order("id", { ascending: true });

  if (search) {
    query = query.ilike("question", `%${search}%`);
  }

  const { data, error } = await query;

  if (error) {
    console.error("Failed to load faqs", error);
    return jsonError(500, "Failed to load FAQs");
  }

  return NextResponse.json({ success: true, faqs: data ?? [] });
}

export async function POST(request: NextRequest) {
  let body: {
    id?: number;
    question?: string;
    answer?: string;
    category?: string;
    tags?: string[];
  } = {};

  try {
    body = await request.json();
  } catch {
    return jsonError(400, "Invalid JSON body");
  }

  if (!body.question || !body.answer) {
    return jsonError(400, "question and answer are required");
  }

  const client = getSupabaseClient();
  const { data, error } = await client
    .from("faqs")
    .upsert(
      [
        {
          id: body.id,
          question: body.question,
          answer: body.answer,
          category: body.category ?? null,
          tags: body.tags ?? null,
        },
      ],
      { onConflict: "id" },
    )
    .select("*")
    .maybeSingle();

  if (error) {
    console.error("Failed to save faq", error);
    return jsonError(500, "Failed to save FAQ");
  }

  return NextResponse.json({ success: true, faq: data });
}

export async function DELETE(request: NextRequest) {
  const idParam = request.nextUrl.searchParams.get("id");
  const id = idParam ? Number(idParam) : NaN;
  if (!idParam || Number.isNaN(id)) {
    return jsonError(400, "Valid id is required");
  }

  const client = getSupabaseClient();
  const { error } = await client.from("faqs").delete().eq("id", id);
  if (error) {
    console.error("Failed to delete faq", error);
    return jsonError(500, "Failed to delete FAQ");
  }

  return NextResponse.json({ success: true });
}


