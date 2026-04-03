import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe-server";
import { getStripeOrder } from "@/lib/orders-supabase";
import { fulfillOneTimePaymentIntent } from "@/lib/stripe-one-time-fulfillment";
import { getDownloadFieldsForPaidOrder } from "@/lib/stripe-order-download-fields";

/**
 * Called from /payment-success with orderId + paymentIntentId so fulfillment runs even when
 * Stripe webhooks are delayed or misconfigured (dev, wrong URL, etc.). Idempotent with webhook.
 */
export async function POST(request: NextRequest) {
  try {
    if (!stripe) {
      return NextResponse.json({ error: "Stripe is not configured" }, { status: 503 });
    }

    const body = await request.json();
    const orderId = body?.orderId as string | undefined;
    const paymentIntentId = body?.paymentIntentId as string | undefined;

    if (!orderId || !paymentIntentId) {
      return NextResponse.json(
        { error: "orderId and paymentIntentId are required" },
        { status: 400 },
      );
    }

    const order = await getStripeOrder(orderId);
    if (!order || order.payment_intent_id !== paymentIntentId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const pi = await stripe.paymentIntents.retrieve(paymentIntentId);
    const result = await fulfillOneTimePaymentIntent(pi, request);

    const row = await getStripeOrder(orderId);
    if (!row) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    const dl = await getDownloadFieldsForPaidOrder(row.email, row.license_key, request);

    return NextResponse.json({
      fulfillResult: result.outcome,
      fulfillReason: result.outcome === "skipped" ? result.reason : undefined,
      orderId: row.order_id,
      plan: row.plan,
      email: row.email,
      fullName: row.full_name,
      country: row.country,
      displayPrice: row.display_price,
      status: row.status,
      licenseKey: row.license_key,
      paymentIntentId: row.payment_intent_id,
      createdAt: row.created_at,
      paymentMethod: "card",
      ...dl,
    });
  } catch (e: unknown) {
    console.error("sync-payment-intent:", e);
    return NextResponse.json(
      { error: (e as Error).message || "Sync failed" },
      { status: 500 },
    );
  }
}

export const runtime = "nodejs";
