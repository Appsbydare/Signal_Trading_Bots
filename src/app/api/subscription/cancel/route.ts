import { NextRequest, NextResponse } from 'next/server';
import { getCurrentCustomer } from '@/lib/auth-server';
import { cancelSubscriptionAtPeriodEnd } from '@/lib/stripe-server';
import { getSubscriptionByStripeId, updateSubscriptionStatus } from '@/lib/subscription-db';

export async function POST(request: NextRequest) {
    try {
        const customer = await getCurrentCustomer();
        if (!customer) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { subscriptionId } = await request.json();

        // Verify subscription belongs to customer
        const subscription = await getSubscriptionByStripeId(subscriptionId);
        if (!subscription || subscription.email !== customer.email) {
            return NextResponse.json({ error: 'Subscription not found' }, { status: 404 });
        }

        // Cancel in Stripe
        await cancelSubscriptionAtPeriodEnd(subscriptionId);

        // Update in database
        await updateSubscriptionStatus(subscriptionId, {
            cancelAtPeriodEnd: true,
            canceledAt: new Date(),
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Cancel subscription error:', error);
        return NextResponse.json({ error: 'Failed to cancel subscription' }, { status: 500 });
    }
}
