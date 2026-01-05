import { NextRequest, NextResponse } from "next/server";
import { revokeSession } from "@/lib/license-db";
import { getCurrentAdmin, getCurrentCustomer } from "@/lib/auth-server";

export async function POST(request: NextRequest) {
    // Allow both admin and customer to revoke
    const admin = await getCurrentAdmin();
    const customer = await getCurrentCustomer();

    if (!admin && !customer) {
        return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    try {
        const { sessionId } = await request.json();

        if (!sessionId) {
            return NextResponse.json({ success: false, message: "Missing sessionId" }, { status: 400 });
        }

        // If not admin, verify ownership
        if (!admin) {
            // we know customer exists because of first check logic above
            // 1. Get the session to find the license key
            const { getSession, getLicense } = await import("@/lib/license-db");
            const session = await getSession(sessionId);

            if (!session) {
                return NextResponse.json({ success: false, message: "Session not found" }, { status: 404 });
            }

            // 2. Get the license to find the owner email
            const license = await getLicense(session.license_key);

            if (!license) {
                return NextResponse.json({ success: false, message: "License not found for this session" }, { status: 404 });
            }

            // 3. Verify ownership
            if (license.email.toLowerCase() !== customer!.email.toLowerCase()) {
                return NextResponse.json({ success: false, message: "Unauthorized: You do not own this session" }, { status: 403 });
            }
        }

        await revokeSession(sessionId);

        return NextResponse.json({ success: true, message: "Session revoked successfully" });

    } catch (error: any) {
        console.error("Error revoking session:", error);
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
}
