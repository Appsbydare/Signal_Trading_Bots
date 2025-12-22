import { NextRequest, NextResponse } from "next/server";
import { getCurrentAdmin } from "@/lib/auth-server";
import { getSupabaseClient } from "@/lib/supabase-storage";
import { logValidation } from "@/lib/license-db";

export async function POST(request: NextRequest) {
  // Verify admin authentication
  const admin = await getCurrentAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: any;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { licenseKey, sessionId, reason } = body as {
    licenseKey?: string;
    sessionId?: string;
    reason?: string;
  };

  if (!licenseKey) {
    return NextResponse.json(
      { error: "Missing licenseKey" },
      { status: 400 }
    );
  }

  const client = getSupabaseClient();

  try {
    if (sessionId) {
      // Deactivate specific session
      const { error } = await client
        .from("license_sessions")
        .update({ active: false })
        .eq("session_id", sessionId)
        .eq("license_key", licenseKey);

      if (error) {
        throw error;
      }

      // Log the admin action
      await logValidation({
        licenseKey,
        deviceId: sessionId,
        eventType: 'deactivation',
        success: true,
        errorCode: 'ADMIN_DEACTIVATE',
      });

      return NextResponse.json({
        success: true,
        message: "Session deactivated successfully",
      });
    } else {
      // Deactivate all sessions for this license
      const { error } = await client
        .from("license_sessions")
        .update({ active: false })
        .eq("license_key", licenseKey);

      if (error) {
        throw error;
      }

      // Log the admin action
      await logValidation({
        licenseKey,
        eventType: 'deactivation',
        success: true,
        errorCode: 'ADMIN_DEACTIVATE_ALL',
      });

      return NextResponse.json({
        success: true,
        message: "All sessions deactivated successfully",
      });
    }
  } catch (error) {
    console.error("Error deactivating session:", error);
    return NextResponse.json(
      { error: "Failed to deactivate session" },
      { status: 500 }
    );
  }
}

// Also support revoke license endpoint
export async function PATCH(request: NextRequest) {
  // Verify admin authentication
  const admin = await getCurrentAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: any;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { licenseKey, status: newStatus } = body as {
    licenseKey?: string;
    status?: string;
  };

  if (!licenseKey || !newStatus) {
    return NextResponse.json(
      { error: "Missing licenseKey or status" },
      { status: 400 }
    );
  }

  if (!["active", "expired", "revoked"].includes(newStatus)) {
    return NextResponse.json(
      { error: "Invalid status. Must be: active, expired, or revoked" },
      { status: 400 }
    );
  }

  const client = getSupabaseClient();

  try {
    // Update license status
    const { error } = await client
      .from("licenses")
      .update({ status: newStatus })
      .eq("license_key", licenseKey);

    if (error) {
      throw error;
    }

    // If revoking, also deactivate all sessions
    if (newStatus === "revoked") {
      await client
        .from("license_sessions")
        .update({ active: false })
        .eq("license_key", licenseKey);
    }

    // Log the admin action
    await logValidation({
      licenseKey,
      eventType: 'failed',
      success: false,
      errorCode: `ADMIN_REVOKE_${newStatus.toUpperCase()}`,
    });

    return NextResponse.json({
      success: true,
      message: `License status updated to ${newStatus}`,
    });
  } catch (error) {
    console.error("Error updating license status:", error);
    return NextResponse.json(
      { error: "Failed to update license status" },
      { status: 500 }
    );
  }
}

