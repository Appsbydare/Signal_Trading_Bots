import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe-server";
import { getLicenseByKey } from "@/lib/license-db";

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const sessionId = searchParams.get("session_id");

    if (!sessionId) {
        return NextResponse.json({ error: "Session ID required" }, { status: 400 });
    }

    if (!stripe) {
        return NextResponse.json({ error: "Stripe not configured" }, { status: 500 });
    }

    try {
        const session = await stripe.checkout.sessions.retrieve(sessionId);

        // Get metadata
        const metadata = session.metadata || {};
        const licenseKey = metadata.licenseKey;
        const plan = metadata.plan;
        const email = metadata.email;
        const isUpgrade = metadata.isUpgrade === "true";

        // Check payment status
        if (session.payment_status === "paid") {
            // Fetch license details to get upgraded_from if available
            let upgradedFrom;
            if (licenseKey) {
                try {
                    const license = await getLicenseByKey(licenseKey);
                    if (license?.upgraded_from) {
                        upgradedFrom = license.upgraded_from;
                    }
                } catch (err) {
                    console.error("Error fetching license:", err);
                }
            }

            return NextResponse.json({
                status: "paid",
                licenseKey,
                plan,
                email,
                isUpgrade,
                upgradedFrom,
                displayPrice: session.amount_total ? session.amount_total / 100 : 0,
                // For subscriptions, downloadUrl might be generic or generated based on license
                downloadUrl: `${process.env.NEXT_PUBLIC_APP_URL}/api/download?license=${licenseKey}`,
            });
        }

        return NextResponse.json({ status: session.payment_status });
    } catch (error: any) {
        console.error("Error retrieving session:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
