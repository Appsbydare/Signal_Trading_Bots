import { NextRequest, NextResponse } from 'next/server';
import { stripe, getOrCreateStripeCustomer, createSubscription, createPaymentIntent } from '@/lib/stripe-server';
import { getPlanConfig, isSubscriptionPlan } from '@/lib/stripe-products';
import { generateLicenseKey } from '@/lib/license-keys';
import Stripe from 'stripe';

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

        let clientSecret: string | null = null;
        let subscriptionId: string | undefined;

        if (isSubscriptionPlan(plan)) {
            // Create Subscription
            const subscription = await createSubscription({
                customerId,
                priceId: planConfig.priceId,
                metadata: {
                    plan,
                    email,
                    fullName,
                    country,
                    licenseKey,
                    isUpgrade: isUpgrade ? "true" : "false",
                    upgradeLicenseKey: upgradeLicenseKey || "",
                }
            });

            subscriptionId = subscription.id;

            // Get client secret from latest invoice
            const latestInvoice = subscription.latest_invoice as Stripe.Invoice;
            const paymentIntent = latestInvoice?.payment_intent as Stripe.PaymentIntent;
            clientSecret = paymentIntent?.client_secret;

        } else {
            // Lifetime Plan (One-time payment)
            const paymentIntent = await createPaymentIntent(
                planConfig.amount,
                {
                    plan,
                    email,
                    fullName,
                    country,
                    licenseKey,
                    isUpgrade: isUpgrade ? "true" : "false",
                    upgradeLicenseKey: upgradeLicenseKey || "",
                    orderId: `LIFETIME-${Date.now()}` // Simple order ID
                }
            );
            clientSecret = paymentIntent.client_secret;
        }

        if (!clientSecret) {
            return NextResponse.json(
                { error: 'Failed to generate payment intent' },
                { status: 500 }
            );
        }

        return NextResponse.json({
            clientSecret,
            licenseKey,
            subscriptionId
        });
    } catch (error: any) {
        console.error('Subscription creation error:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to create subscription' },
            { status: 500 }
        );
    }
}
