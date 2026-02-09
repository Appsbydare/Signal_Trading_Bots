import { NextResponse } from "next/server";
import { sendTelegramAdminNotification } from "@/lib/telegram";

export async function GET() {
    const token = process.env.TELEGRAM_BOT_TOKEN;
    const channelId = process.env.TELEGRAM_ADMIN_CHANNEL_ID;

    const configStatus = {
        hasToken: !!token,
        tokenPreview: token ? `${token.substring(0, 4)}...` : "MISSING",
        hasChannelId: !!channelId,
        channelId: channelId || "MISSING"
    };

    try {
        console.log("Testing Telegram notification...", configStatus);

        await sendTelegramAdminNotification({
            fullName: "Test User",
            email: "test@example.com",
            plan: "Test Plan (Debug)",
            amount: 0.01,
            orderId: "TEST-ORDER-123",
            country: "Testland",
            stripeLink: "https://dashboard.stripe.com/test",
        });

        return NextResponse.json({ success: true, config: configStatus, message: "Notification function called" });
    } catch (error) {
        console.error("Test Telegram Error:", error);
        return NextResponse.json({ success: false, error: String(error), config: configStatus }, { status: 500 });
    }
}
