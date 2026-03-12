import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe-server';
import { getCurrentCustomer } from '@/lib/auth-server';

export async function POST(request: NextRequest) {
    try {
        const customer = await getCurrentCustomer();
        if (!customer) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { subscriptionId, flow } = body;
        let { stripeCustomerId } = body;

        // If stripeCustomerId is missing but we have a subscriptionId, look it up from Stripe
        if (!stripeCustomerId && subscriptionId && stripe) {
            try {
                const sub = await stripe.subscriptions.retrieve(subscriptionId);
                stripeCustomerId = typeof sub.customer === 'string' ? sub.customer : sub.customer?.id;

                // Persist it back to the DB so future calls work
                if (stripeCustomerId) {
                    const { getSupabaseClient } = await import('@/lib/supabase-storage');
                    const client = getSupabaseClient();
                    await client.from('licenses')
                        .update({ stripe_customer_id: stripeCustomerId })
                        .eq('subscription_id', subscriptionId);
                }
            } catch (err: any) {
                console.error('Failed to retrieve subscription for customer lookup:', err.message);
            }
        }

        if (!stripeCustomerId) {
            return NextResponse.json(
                { error: 'Missing stripeCustomerId' },
                { status: 400 }
            );
        }

        if (!stripe) {
            return NextResponse.json(
                { error: 'Stripe not configured' },
                { status: 500 }
            );
        }

        const sessionConfig: any = {
            customer: stripeCustomerId,
            return_url: `${process.env.NEXT_PUBLIC_APP_URL}/portal`,
        };

        // Deep link to specific flow if requested
        if (flow === 'update_subscription' && subscriptionId) {
            sessionConfig.flow_data = {
                type: 'subscription_update',
                subscription_update: {
                    subscription: subscriptionId,
                },
            };
            sessionConfig.return_url = `${process.env.NEXT_PUBLIC_APP_URL}/portal?from=stripe`;
        }

        // Create a Stripe Customer Portal session
        let session;
        try {
            session = await stripe.billingPortal.sessions.create(sessionConfig);
        } catch (err: any) {
            // If the specific flow failed (e.g., config disabled), fallback to generic portal
            if (sessionConfig.flow_data) {
                console.warn('Failed to create flow-specific session, falling back to generic portal:', err.message);
                delete sessionConfig.flow_data;
                session = await stripe.billingPortal.sessions.create(sessionConfig);
            } else {
                throw err;
            }
        }

        return NextResponse.json({ url: session.url });
    } catch (error: any) {
        console.error('Error creating portal session:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to create portal session' },
            { status: 500 }
        );
    }
}
