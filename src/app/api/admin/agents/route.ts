import { NextRequest, NextResponse } from "next/server";

import { getSupabaseClient } from "@/lib/supabase-storage";

function jsonError(status: number, message: string) {
  return NextResponse.json({ success: false, message }, { status });
}

export async function GET() {
  const client = getSupabaseClient();
  const { data, error } = await client
    .from("agents")
    .select("*")
    .order("id", { ascending: true });

  if (error) {
    console.error("Failed to load agents", error);
    return jsonError(500, "Failed to load agents");
  }

  return NextResponse.json({ success: true, agents: data ?? [] });
}

export async function POST(request: NextRequest) {
  let body: { agents?: any[] } = {};
  try {
    body = await request.json();
  } catch {
    return jsonError(400, "Invalid JSON body");
  }

  const agents = body.agents;
  if (!agents || !Array.isArray(agents)) {
    return jsonError(400, "agents array is required");
  }

  const client = getSupabaseClient();

  const payload = agents.map((a) => ({
    id: a.id,
    name: a.name,
    avatar_url: a.avatar_url ?? null,
    description: a.description ?? null,
    prompt_style: a.prompt_style ?? null,
    is_active: Boolean(a.is_active),
  }));

  const { data, error } = await client
    .from("agents")
    .upsert(payload, { onConflict: "id" })
    .select("*")
    .order("id", { ascending: true });

  if (error) {
    console.error("Failed to save agents", error);
    return jsonError(500, "Failed to save agents");
  }

  return NextResponse.json({ success: true, agents: data ?? [] });
}


