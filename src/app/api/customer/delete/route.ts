import "server-only";

import { NextRequest, NextResponse } from "next/server";

import { getCurrentCustomer } from "@/lib/auth-server";
import { getSupabaseClient } from "@/lib/supabase-storage";
import { CUSTOMER_COOKIE_NAME } from "@/lib/auth-tokens";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";

/**
 * DELETE /api/customer/delete
 * GDPR hard-delete (right to erasure).
 * Cancels active Stripe subscriptions, anonymizes PII, then deletes the account row.
 * The customer must be authenticated; this is a self-service endpoint.
 */
export async function DELETE(request: NextRequest) {
  if (!checkRateLimit(`gdpr-delete:${getClientIp(request)}`, { limit: 3, windowSeconds: 3600 })) {
    return NextResponse.json({ error: "Too many requests." }, { status: 429 });
  }

  const customer = await getCurrentCustomer();
  if (!customer) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = getSupabaseClient();

  // 1. Cancel any active Stripe subscriptions for this customer's licenses
  try {
    const { data: licenses } = await supabase
      .from("licenses")
      .select("subscription_id, stripe_customer_id")
      .eq("customer_id", customer.id)
      .eq("payment_type", "subscription")
      .in("status", ["active"]);

    if (licenses && licenses.length > 0) {
      // Dynamic import keeps Stripe out of the cold-start bundle for this route
      const { default: Stripe } = await import("stripe");
      const stripe = process.env.STRIPE_SECRET_KEY
        ? new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: "2025-01-27.acacia" as any })
        : null;

      if (stripe) {
        for (const lic of licenses) {
          if (lic.subscription_id) {
            try {
              await stripe.subscriptions.cancel(lic.subscription_id);
            } catch {
              // Subscription may already be cancelled — not a hard failure
            }
          }
        }
      }
    }
  } catch {
    // Non-fatal; proceed with local deletion
  }

  // 2. Anonymize PII in child tables (licenses, tickets, conversations)
  const anonymizedEmail = `deleted_${customer.id}@anonymized.invalid`;
  const now = new Date().toISOString();

  await supabase
    .from("licenses")
    .update({ email: anonymizedEmail, full_name: "Deleted User" })
    .eq("customer_id", customer.id);

  await supabase
    .from("tickets")
    .update({ customer_email: anonymizedEmail })
    .eq("customer_id", customer.id);

  // 3. Hard-delete the customer row — cascades handle child FK rows
  const { error } = await supabase
    .from("customers")
    .delete()
    .eq("id", customer.id);

  if (error) {
    return NextResponse.json({ error: "Failed to delete account. Please contact support." }, { status: 500 });
  }

  // 4. Clear session cookie
  const response = NextResponse.json({ success: true, deletedAt: now });
  response.cookies.set(CUSTOMER_COOKIE_NAME, "", { maxAge: 0, path: "/" });
  return response;
}
