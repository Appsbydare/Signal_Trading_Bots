import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe-server";
import { getPlanConfig } from "@/lib/stripe-products";

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

        if (!stripe) {
            throw new Error("Stripe is not configured");
        }

        // Normalize to yearly plan key — only starter_yearly and pro_yearly are supported
        const planKey = plan.includes("pro") ? "pro_yearly" : "starter_yearly";
        const planConfig = getPlanConfig(planKey);

        if (!planConfig?.priceId) {
            return NextResponse.json(
                { error: `Plan configuration not found for: ${planKey}` },
                { status: 400 }
            );
        }

        // Generate license key
        const generateLicenseKey = () => {
            const segments = [];
            for (let i = 0; i < 5; i++) {
                const segment = Math.random().toString(36).substring(2, 6).toUpperCase();
                segments.push(segment);
            }
            return `STB${segments.join("-")}`;
        };

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
