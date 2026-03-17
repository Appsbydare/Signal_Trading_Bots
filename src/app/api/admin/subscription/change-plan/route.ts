import { NextRequest, NextResponse } from "next/server";
import { changeSubscriptionPlan } from "@/lib/stripe-server";
import { getCurrentAdmin } from "@/lib/auth-server";

export async function POST(req: NextRequest) {
    try {
        const admin = await getCurrentAdmin();
        if (!admin) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const { subscriptionId, newPriceId } = body;

        if (!subscriptionId || !newPriceId) {
            return NextResponse.json(
                { error: "Missing required fields" },
                { status: 400 }
            );
        }

        const subscription = await changeSubscriptionPlan(subscriptionId, newPriceId);

        return NextResponse.json({
            message: "Subscription plan updated successfully",
            subscriptionId: subscription.id,
            newStatus: subscription.status,
            currentPeriodEnd: (subscription as any).current_period_end
        });

    } catch (error: any) {
        console.error("Error changing subscription plan:", error);
        return NextResponse.json(
            { error: error.message || "Internal server error" },
            { status: 500 }
        );
    }
}
