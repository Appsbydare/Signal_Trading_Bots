import { getSupabaseClient } from "./supabase-storage";

export interface SubscriptionRow {
    id: number;
    stripe_subscription_id: string;
    stripe_customer_id: string;
    license_key: string;
    email: string;
    plan_id: string;
    status: string;
    current_period_start: string;
    current_period_end: string;
    cancel_at_period_end: boolean;
    canceled_at: string | null;
    ended_at: string | null;
    trial_start: string | null;
    trial_end: string | null;
    created_at: string;
    updated_at: string;
}

export async function createSubscription(args: {
    stripeSubscriptionId: string;
    stripeCustomerId: string;
    licenseKey: string;
    email: string;
    planId: string;
    status: string;
    currentPeriodStart: Date;
    currentPeriodEnd: Date;
}): Promise<SubscriptionRow> {
    const client = getSupabaseClient();
    const { data, error } = await client
        .from("subscriptions")
        .insert({
            stripe_subscription_id: args.stripeSubscriptionId,
            stripe_customer_id: args.stripeCustomerId,
            license_key: args.licenseKey,
            email: args.email.toLowerCase(),
            plan_id: args.planId,
            status: args.status,
            current_period_start: args.currentPeriodStart.toISOString(),
            current_period_end: args.currentPeriodEnd.toISOString(),
        })
        .select("*")
        .single();

    if (error) throw error;
    return data;
}

export async function getSubscriptionByStripeId(
    stripeSubscriptionId: string
): Promise<SubscriptionRow | null> {
    const client = getSupabaseClient();
    const { data, error } = await client
        .from("subscriptions")
        .select("*")
        .eq("stripe_subscription_id", stripeSubscriptionId)
        .maybeSingle();

    if (error) throw error;
    return data;
}

export async function updateSubscriptionStatus(
    stripeSubscriptionId: string,
    updates: {
        status?: string;
        currentPeriodEnd?: Date;
        cancelAtPeriodEnd?: boolean;
        canceledAt?: Date | null;
        endedAt?: Date | null;
    }
): Promise<void> {
    const client = getSupabaseClient();
    const updateData: any = { updated_at: new Date().toISOString() };

    if (updates.status) updateData.status = updates.status;
    if (updates.currentPeriodEnd)
        updateData.current_period_end = updates.currentPeriodEnd.toISOString();
    if (updates.cancelAtPeriodEnd !== undefined)
        updateData.cancel_at_period_end = updates.cancelAtPeriodEnd;
    if (updates.canceledAt !== undefined)
        updateData.canceled_at = updates.canceledAt?.toISOString() || null;
    if (updates.endedAt !== undefined)
        updateData.ended_at = updates.endedAt?.toISOString() || null;

    const { error } = await client
        .from("subscriptions")
        .update(updateData)
        .eq("stripe_subscription_id", stripeSubscriptionId);

    if (error) throw error;
}

export async function getSubscriptionsForEmail(
    email: string
): Promise<SubscriptionRow[]> {
    const client = getSupabaseClient();
    const { data, error } = await client
        .from("subscriptions")
        .select("*")
        .eq("email", email.toLowerCase())
        .order("created_at", { ascending: false });

    if (error) throw error;
    return data || [];
}
