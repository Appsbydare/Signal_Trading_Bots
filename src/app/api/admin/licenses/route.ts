import { NextRequest, NextResponse } from "next/server";
import { getCurrentAdmin } from "@/lib/auth-server";
import { getSupabaseClient } from "@/lib/supabase-storage";

export async function GET(request: NextRequest) {
  // Verify admin authentication
  const admin = await getCurrentAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const email = searchParams.get("email");
  const licenseKey = searchParams.get("key");
  const status = searchParams.get("status");

  const client = getSupabaseClient();

  try {
    let query = client.from("licenses").select("*");

    // Apply filters
    if (email) {
      query = query.ilike("email", `%${email}%`);
    }
    if (licenseKey) {
      query = query.ilike("license_key", `%${licenseKey}%`);
    }
    if (status) {
      query = query.eq("status", status);
    }

    query = query.order("created_at", { ascending: false });

    const { data, error } = await query;

    if (error) {
      throw error;
    }

    // For each license, count active sessions
    const licensesWithSessions = await Promise.all(
      (data || []).map(async (license) => {
        const { data: sessions, error: sessionError } = await client
          .from("license_sessions")
          .select("*")
          .eq("license_key", license.license_key)
          .eq("active", true);

        return {
          ...license,
          active_sessions: sessions?.length ?? 0,
          sessions: sessions || [],
        };
      })
    );

    return NextResponse.json({
      success: true,
      data: licensesWithSessions,
    });
  } catch (error) {
    console.error("Error fetching licenses:", error);
    return NextResponse.json(
      { error: "Failed to fetch licenses" },
      { status: 500 }
    );
  }
}

