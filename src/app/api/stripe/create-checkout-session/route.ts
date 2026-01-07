import { NextRequest, NextResponse } from 'next/server';
import { stripe, getOrCreateStripeCustomer } from '@/lib/stripe-server';
import { getPlanConfig, isSubscriptionPlan } from '@/lib/stripe-products';
import { generateLicenseKey } from '@/lib/license-keys';

export async function POST(request: NextRequest) {
    try {
        if (!stripe) {
            return NextResponse.json(
                { error: 'Stripe not configured' },
                { status: 503 }
            );
        }

        const body = await request.json();
        const { plan, email, fullName, country, isUpgrade, upgradeLicenseKey } = body;

        if (!plan || !email || !fullName || !country) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            );
        }

        if (!isSubscriptionPlan(plan)) {
            return NextResponse.json(
                { error: 'Plan is not a subscription' },
                { status: 400 }
            );
        }

        const planConfig = getPlanConfig(plan);
        if (!planConfig) {
            return NextResponse.json(
                { error: 'Invalid plan' },
                { status: 400 }
            );
        }

        // Get or create Stripe customer
        const customerId = await getOrCreateStripeCustomer({
            email,
            name: fullName,
            metadata: { country },
        });

        // Generate license key upfront
        const licenseKey = generateLicenseKey();

        // Determine success/cancel URLs
        const host = request.headers.get("host") || "www.signaltradingbots.com";
        const protocol = host.includes("localhost") ? "http" : "https";
        const successUrl = `${protocol}://${host}/payment/success?session_id={CHECKOUT_SESSION_ID}`;
        const cancelUrl = `${protocol}://${host}/payment?plan=${plan}`;

        // Create Checkout Session
        const session = await stripe.checkout.sessions.create({
            customer: customerId,
            mode: 'subscription',
            line_items: [
                {
                    price: planConfig.priceId,
                    quantity: 1,
                },
            ],
            success_url: successUrl,
            cancel_url: cancelUrl,
            metadata: {
                plan,
                email,
                fullName,
                country,
                licenseKey,
                isUpgrade: isUpgrade ? "true" : "false",
                upgradeLicenseKey: upgradeLicenseKey || "",
            },
            subscription_data: {
                metadata: {
                    plan,
                    email,
                    licenseKey,
                },
            },
            allow_promotion_codes: true,
            billing_address_collection: 'auto',
        });

        return NextResponse.json({
            sessionId: session.id,
            licenseKey,
        });
    } catch (error) {
        console.error('Checkout session creation error:', error);
        return NextResponse.json(
            { error: 'Failed to create checkout session' },
            { status: 500 }
        );
    }
}
