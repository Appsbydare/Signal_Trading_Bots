import { NextRequest, NextResponse } from "next/server";

import { getCurrentAdmin, getCurrentCustomer } from "@/lib/auth-server";
import { getLicense, getSession, revokeSession } from "@/lib/license-db";

const PRODUCT_ID = "ORB_BOT" as const;

export async function POST(request: NextRequest) {
  const admin = await getCurrentAdmin();
  const customer = await getCurrentCustomer();

  if (!admin && !customer) {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
  }

  try {
    const payload = (await request.json()) as { sessionId?: string };
    if (!payload.sessionId) {
      return NextResponse.json({ success: false, message: "Missing sessionId" }, { status: 400 });
    }

    if (!admin) {
      const session = await getSession(payload.sessionId);
      if (!session || session.product_id !== PRODUCT_ID) {
        return NextResponse.json({ success: false, message: "Session not found" }, { status: 404 });
      }

      const license = await getLicense(session.license_key, PRODUCT_ID);
      if (!license) {
        return NextResponse.json({ success: false, message: "License not found for this session" }, { status: 404 });
      }

      if (license.email.toLowerCase() !== customer!.email.toLowerCase()) {
        return NextResponse.json(
          { success: false, message: "Unauthorized: You do not own this session" },
          { status: 403 },
        );
      }
    }

    await revokeSession(payload.sessionId, admin ? "admin" : "customer");
    return NextResponse.json({ success: true, message: "Session revoked successfully" });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("Error revoking ORB session:", error);
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}
