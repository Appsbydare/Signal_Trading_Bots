import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentCustomer } from "@/lib/auth-server";
import { getSubscriptionByStripeId } from "@/lib/subscription-db";
import { STRIPE_PRODUCTS } from "@/lib/stripe-products";
import { SubscriptionActions } from "../../../../components/SubscriptionActions";

export const dynamic = 'force-dynamic';

interface PageProps {
    params: {
        subscriptionId: string;
    };
}

export default async function SubscriptionPage({ params }: PageProps) {
    const customer = await getCurrentCustomer();
    if (!customer) {
        redirect("/login");
    }

    const subscription = await getSubscriptionByStripeId(params.subscriptionId);

    if (!subscription || subscription.email !== customer.email) {
        return (
            <div className="flex flex-col items-center justify-center p-12 text-center">
                <h2 className="text-xl font-semibold text-white">Subscription Not Found</h2>
                <p className="mt-2 text-zinc-400">
                    The subscription you are looking for does not exist or you do not have permission to view it.
                </p>
                <Link
                    href="/portal"
                    className="mt-6 rounded-md bg-zinc-800 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700"
                >
                    Return to Portal
                </Link>
            </div>
        );
    }

    const planConfig = Object.values(STRIPE_PRODUCTS).find(
        (p) => p.priceId === subscription.plan_id || Object.keys(STRIPE_PRODUCTS).some(k => STRIPE_PRODUCTS[k as keyof typeof STRIPE_PRODUCTS].productId === subscription.plan_id)
    ) || { name: 'Unknown Plan', amount: 0, interval: 'month' };

    // Basic fallback lookup by iterating keys if plan_id matches a key or product/price ID
    let planName = 'Unknown Plan';
    let planAmount = 0;
    let planInterval = 'month';

    // Try to find matching plan config
    // In our DB we store plan_id as 'starter_monthly' etc usually, but might store Stripe ID in some cases? 
    // Let's assume we stored the key or try to match.
    // Actually subscription-db says: plan_id: args.planId which is likely the key from the webhook metadata.

    const productKey = Object.keys(STRIPE_PRODUCTS).find(key => key === subscription.plan_id) as keyof typeof STRIPE_PRODUCTS | undefined;

    if (productKey) {
        const p = STRIPE_PRODUCTS[productKey];
        planName = p.name;
        planAmount = p.amount;
        planInterval = p.interval || 'month';
    } else {
        // Fallback: maybe it stored price ID?
        const p = Object.values(STRIPE_PRODUCTS).find(prod => prod.priceId === subscription.plan_id);
        if (p) {
            planName = p.name;
            planAmount = p.amount;
            planInterval = p.interval || 'month';
        }
    }

    const currentPeriodEnd = new Date(subscription.current_period_end);
    const isCanceled = subscription.status === 'canceled';
    const cancelAtPeriodEnd = subscription.cancel_at_period_end;

    return (
        <div className="max-w-3xl mx-auto space-y-6">
            <div className="mb-6">
                <Link
                    href="/portal"
                    className="text-sm text-zinc-400 hover:text-white transition-colors flex items-center gap-1"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                    Back to Portal
                </Link>
            </div>

            <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-8 shadow-sm">
                <div className="flex items-start justify-between mb-8">
                    <div>
                        <h1 className="text-2xl font-bold text-white mb-1">Subscription Details</h1>
                        <p className="text-zinc-400 text-sm">Manage your subscription and billing details</p>
                    </div>
                    <div className={`px-3 py-1 rounded-full text-xs font-medium capitalize border ${subscription.status === 'active' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                        subscription.status === 'past_due' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                            'bg-zinc-800 text-zinc-400 border-zinc-700'
                        }`}>
                        {subscription.status.replace('_', ' ')}
                    </div>
                </div>

                <div className="grid gap-8 md:grid-cols-2">
                    <div className="space-y-6">
                        <div>
                            <h3 className="text-sm font-medium text-zinc-500 uppercase tracking-wider mb-2">Current Plan</h3>
                            <div className="text-xl font-semibold text-white">{planName}</div>
                            <div className="text-zinc-400 text-sm mt-1">
                                ${planAmount}/{planInterval}
                            </div>
                        </div>

                        <div>
                            <h3 className="text-sm font-medium text-zinc-500 uppercase tracking-wider mb-2">Billing Cycle</h3>
                            <div className="text-white">
                                {cancelAtPeriodEnd ? (
                                    <span className="text-amber-400">Cancels on {currentPeriodEnd.toLocaleDateString()}</span>
                                ) : (
                                    <span>Renews on {currentPeriodEnd.toLocaleDateString()}</span>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div>
                            <h3 className="text-sm font-medium text-zinc-500 uppercase tracking-wider mb-2">License Key</h3>
                            <div className="font-mono text-sm bg-zinc-950 px-3 py-2 rounded border border-zinc-800 text-zinc-300 inline-block">
                                {subscription.license_key}
                            </div>
                        </div>

                        <div>
                            <h3 className="text-sm font-medium text-zinc-500 uppercase tracking-wider mb-2">Actions</h3>
                            <SubscriptionActions
                                subscriptionId={subscription.stripe_subscription_id}
                                status={subscription.status}
                                cancelAtPeriodEnd={subscription.cancel_at_period_end}
                            />
                        </div>
                    </div>
                </div>

                {/* Upgrade / Downgrade Section */}
                {!cancelAtPeriodEnd && subscription.status === 'active' && planInterval === 'month' && (
                    <div className="mt-8 pt-8 border-t border-zinc-800">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="text-white font-medium">Save with Yearly Billing</h3>
                                <p className="text-sm text-zinc-400 mt-1">Upgrade to an annual plan and save ~10%</p>
                            </div>
                            <Link
                                href={`/payment?plan=${subscription.plan_id.replace('_monthly', '_yearly')}&upgrade=true&license_key=${subscription.license_key}`}
                                className="rounded-md bg-[#5e17eb] px-4 py-2 text-sm font-medium text-white hover:bg-[#4512c2] transition"
                            >
                                Upgrade to Yearly
                            </Link>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
