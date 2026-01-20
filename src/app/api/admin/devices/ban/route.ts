import { NextRequest, NextResponse } from "next/server";
import { banDevice, unbanDevice, isDeviceBanned } from "@/lib/license-db";
import { getCurrentAdmin } from "@/lib/auth-server";

export async function POST(request: NextRequest) {
    // Check admin auth
    const admin = await getCurrentAdmin();
    if (!admin) {
        return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    try {
        const { deviceId, action, reason } = await request.json();

        if (!deviceId || !action) {
            return NextResponse.json({ success: false, message: "Missing deviceId or action" }, { status: 400 });
        }

        if (action === 'ban') {
            await banDevice(deviceId, reason, admin.email);
            return NextResponse.json({ success: true, message: "Device banned successfully" });
        } else if (action === 'unban') {
            await unbanDevice(deviceId);
            return NextResponse.json({ success: true, message: "Device unbanned successfully" });
        } else if (action === 'check') {
            const status = await isDeviceBanned(deviceId);
            return NextResponse.json({ success: true, banned: status.banned, reason: status.reason });
        } else {
            return NextResponse.json({ success: false, message: "Invalid action" }, { status: 400 });
        }

    } catch (error: any) {
        console.error("Error managing device ban:", error);
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
}
