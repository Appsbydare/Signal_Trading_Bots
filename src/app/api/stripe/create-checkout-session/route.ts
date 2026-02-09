import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe-server";

export async function POST(req: NextRequest) {
    try {
        const { plan, email, fullName, country, skip_trial } = await req.json();

        if (!plan || !email || !fullName || !country) {
            return NextResponse.json(
                { error: "Missing required fields" },
                { status: 400 }
            );
        }

        // Determine if this is a subscription plan
        const isLifetime = plan === "lifetime";
        if (isLifetime) {
            return NextResponse.json(
                { error: "Lifetime plans should use embedded form" },
                { status: 400 }
            );
        }

        // Parse plan details
        const isYearly = plan.endsWith("_yearly");
        const basePlan = isYearly ? plan.replace("_yearly", "") : plan;
        const isPro = basePlan === "pro";

        // Calculate price
        let price = 9;
        if (isPro) {
            price = isYearly ? 348 : 29;
        } else {
            price = isYearly ? 108 : 9;
        }

        const priceInCents = price * 100;

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

        if (!stripe) {
            throw new Error("Stripe is not configured");
        }

        const shouldHaveTrial = (isPro || !isYearly) && !skip_trial;

        // Create Stripe Checkout Session
        const session = await stripe.checkout.sessions.create({
            mode: "subscription",
            payment_method_collection: (shouldHaveTrial && !isPro) ? "if_required" : "always",
            line_items: [
                {
                    price_data: {
                        currency: "usd",
                        product_data: {
                            name: `Signal Trading Bot - ${isPro ? "Pro" : "Starter"} ${isYearly ? "Yearly" : "Monthly"}`,
                            description: "Telegram Trading Bot License",
                        },
                        recurring: {
                            interval: isYearly ? "year" : "month",
                        },
                        unit_amount: priceInCents,
                    },
                    quantity: 1,
                },
            ],
            customer_email: email,
            subscription_data: {
                metadata: {
                    licenseKey,
                    email,
                    plan,
                    fullName,
                    country,
                    is_trial_conversion: (shouldHaveTrial && !isPro) ? "true" : "false"
                },
                trial_period_days: shouldHaveTrial ? 30 : undefined,
            },
            metadata: {
                licenseKey,
                email,
                plan,
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
