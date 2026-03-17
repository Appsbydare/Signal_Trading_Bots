import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe-server";
import { getPlanConfig } from "@/lib/stripe-products";

const VALID_PLAN_KEYS = new Set(["starter_yearly", "pro_yearly", "starter", "pro"]);

const PLAN_KEY_MAP: Record<string, "starter_yearly" | "pro_yearly"> = {
    starter: "starter_yearly",
    starter_yearly: "starter_yearly",
    pro: "pro_yearly",
    pro_yearly: "pro_yearly",
};

function generateLicenseKey(): string {
    const ts = Date.now().toString(36).toUpperCase();
    const segments: string[] = [ts.slice(-4)];
    for (let i = 0; i < 4; i++) {
        segments.push(Math.random().toString(36).substring(2, 6).toUpperCase());
    }
    return `STB${segments.join("-")}`;
}

export async function POST(req: NextRequest) {
    try {
        const { plan, email, fullName, country } = await req.json();

        if (!plan || !email || !fullName || !country) {
            return NextResponse.json(
                { error: "Missing required fields" },
                { status: 400 }
            );
        }

        if (plan === "lifetime") {
            return NextResponse.json(
                { error: "Lifetime plans should use embedded form" },
                { status: 400 }
            );
        }

        if (!VALID_PLAN_KEYS.has(plan)) {
            return NextResponse.json(
                { error: `Invalid plan: ${plan}` },
                { status: 400 }
            );
        }

        if (!stripe) {
            throw new Error("Stripe is not configured");
        }

        const planKey = PLAN_KEY_MAP[plan];
        const planConfig = getPlanConfig(planKey);

        if (!planConfig?.priceId) {
            return NextResponse.json(
                { error: `Plan configuration not found for: ${planKey}` },
                { status: 400 }
            );
        }

        const licenseKey = generateLicenseKey();

        const session = await stripe.checkout.sessions.create({
            mode: "subscription",
            payment_method_collection: "always",
            line_items: [
                {
                    price: planConfig.priceId,
                    quantity: 1,
                },
            ],
            customer_email: email,
            subscription_data: {
                metadata: {
                    licenseKey,
                    email,
                    plan: planKey,
                    fullName,
                    country,
                },
            },
            metadata: {
                licenseKey,
                email,
                plan: planKey,
                fullName,
                country,
            },
            success_url: `${process.env.NEXT_PUBLIC_APP_URL}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/payment?plan=${plan}`,
        });

        return NextResponse.json({ url: session.url });
    } catch (error: any) {
        console.error("Error creating checkout session:", error);
        return NextResponse.json(
            { error: error.message || "Failed to create checkout session" },
            { status: 500 }
        );
    }
}
