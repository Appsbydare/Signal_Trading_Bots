import { NextResponse } from "next/server";
import { getCurrentCustomer } from "@/lib/auth-server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET() {
  try {
    const customer = await getCurrentCustomer();

    if (!customer) {
      return NextResponse.json({ customer: null }, { status: 200 });
    }

    // Fetch customer name and country from customers table
    const { data: customerData } = await supabase
      .from("customers")
      .select("name, country")
      .eq("id", customer.id)
      .single();

    // Fetch customer licenses
    const { data: licenses } = await supabase
      .from("licenses")
      .select("*")
      .eq("email", customer.email)
      .neq("status", "revoked")
      .order("created_at", { ascending: false });

    // Sync Subscription Status with Stripe (Self-Healing)
    if (licenses && licenses.length > 0) {
      const { stripe, getPlanFromPrice, normalizePlanName, PLAN_RANK } = await import("@/lib/stripe-server");
      if (stripe) {
        await Promise.all(licenses.map(async (lic: any) => {
          if (lic.subscription_id && lic.payment_type === 'subscription' && lic.status !== 'revoked' && lic.stripe_customer_id) {
            try {
              const sub = await stripe.subscriptions.retrieve(lic.subscription_id, {
                expand: ['items.data.price.product']
              });

              const isCanceling = (sub as any).cancel_at_period_end;
              const status = sub.status;

              // Intelligent Date Logic (Fallbacks)
              const currentPeriodEndTimestamp = (sub as any).current_period_end;
              let currentPeriodEnd: string | undefined;

              if (currentPeriodEndTimestamp) {
                const date = new Date(currentPeriodEndTimestamp * 1000);
                if (!isNaN(date.getTime())) currentPeriodEnd = date.toISOString();
              }

              if (!currentPeriodEnd) {
                // Only extend if active/trialing
                if (['active', 'trialing'].includes(status)) {
                  // Fallback based on Plan Interval
                  const interval = sub.items?.data[0]?.price?.recurring?.interval;
                  const d = new Date();
                  if (interval === 'year') d.setFullYear(d.getFullYear() + 1);
                  else d.setDate(d.getDate() + 30);
                  currentPeriodEnd = d.toISOString();
                } else {
                  // If canceled/unpaid/incomplete, assume expired (ended_at or Now)
                  const ended = (sub as any).ended_at ? new Date((sub as any).ended_at * 1000) : new Date();
                  currentPeriodEnd = ended.toISOString();
                }
              }

              // Extract Plan Name from Stripe Product (Internal ID fallback)
              const priceItem = sub.items.data[0];
              // Use getPlanFromPrice to ensure we get 'pro_monthly' instead of 'Signal Trading Bot - Pro Monthly'
              const derivedPlan = getPlanFromPrice(priceItem.price as any);
              const remotePlanName = derivedPlan || lic.plan;

              const normalizedOld = normalizePlanName(lic.plan);
              const normalizedNew = normalizePlanName(remotePlanName);

              // Check if DB needs update
              // We compare NORMALIZED plans to avoid 'pro' vs 'pro_monthly' loops
              const planChanged = normalizedOld !== normalizedNew;

              if (
                lic.subscription_status !== status ||
                lic.subscription_cancel_at_period_end !== isCanceling ||
                planChanged
              ) {
                try {
                  console.log(`Syncing subscription ${lic.subscription_id}: Status=${status}, Cancel=${isCanceling}, Plan=${remotePlanName} (Old: ${lic.plan})`);

                  const updateData: any = {
                    subscription_status: status,
                    subscription_cancel_at_period_end: isCanceling,
                    subscription_current_period_end: currentPeriodEnd,
                    expires_at: currentPeriodEnd, // Ensure expiry matches period end
                    plan: normalizedNew || remotePlanName // Sync the plan
                  };

                  // Handle Plan Change Badge
                  if (planChanged) {
                    // Always store previous plan for UI to decide Upgrade/Downgrade
                    updateData.upgraded_from = normalizedOld;
                  } else if (normalizedNew === normalizedOld && lic.upgraded_from) {
                    if (lic.plan === 'pro' && remotePlanName === 'pro_monthly') {
                      updateData.upgraded_from = null;
                    }
                  }

                  // Update DB
                  await supabase.from('licenses').update(updateData).eq('id', lic.id);

                  // Update local object for immediate response
                  lic.subscription_status = status;
                  lic.subscription_cancel_at_period_end = isCanceling;
                  lic.subscription_current_period_end = currentPeriodEnd;
                  lic.expires_at = currentPeriodEnd;
                  lic.plan = updateData.plan;
                  if (updateData.upgraded_from !== undefined) lic.upgraded_from = updateData.upgraded_from;
                } catch (err) {
                  // Ignore errors (e.g. sub not found), just log
                  console.warn(`Failed to sync subscription ${lic.subscription_id}:`, err);
                }
              }
            } catch (err) {
              // Ignore errors (e.g. sub not found), just log
              console.warn(`Failed to retrieve subscription ${lic.subscription_id}:`, err);
            }
          }
        }));
      }
    }

    return NextResponse.json({
      customer: {
        id: customer.id,
        email: customer.email,
        password_set_by_user: customer.password_set_by_user,
        name: customerData?.name || null,
        country: customerData?.country || null,
        licenses: licenses || [],
      },
    });
  } catch (error) {
    console.error("Failed to get current customer:", error);
    return NextResponse.json({ customer: null }, { status: 200 });
  }
}

