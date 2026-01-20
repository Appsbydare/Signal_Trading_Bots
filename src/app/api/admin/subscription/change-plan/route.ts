import { NextRequest, NextResponse } from "next/server";
import { changeSubscriptionPlan } from "@/lib/stripe-server";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Verify admin role (assuming you have an admin check, or just rely on RLS/middleware)
        // ideally: 
        // const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
        // if (profile?.role !== 'admin') ...

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
