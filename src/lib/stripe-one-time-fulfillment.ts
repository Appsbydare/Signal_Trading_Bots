import "server-only";

import type { NextRequest } from "next/server";
import type Stripe from "stripe";
import { generateLicenseKeyForProduct } from "@/lib/license-keys";
import { licenseProductIdFromPlan, type LicenseProductId } from "@/lib/license-products";
import { getStripeOrderByPaymentIntent, updateStripeOrderByPaymentIntent } from "@/lib/orders-supabase";
import {
  createLicense,
  getLicensesForEmail,
  getLicenseByPaymentId,
  upgradeLicense,
} from "@/lib/license-db";
import { handleStripePostPurchase } from "@/lib/stripe-post-purchase";

export type OneTimeFulfillResult =
  | { outcome: "fulfilled"; licenseKey: string }
  | { outcome: "already_paid"; licenseKey: string | null }
  | {
      outcome: "skipped";
      reason: "subscription_invoice" | "no_order" | "order_mismatch" | "not_succeeded" | "processing";
    };

/**
 * Idempotent: creates license, marks order paid, emails — same logic as webhook payment_intent.succeeded
 * for one-time / non-invoice payment intents.
 */
export async function fulfillOneTimePaymentIntent(
  paymentIntent: Stripe.PaymentIntent,
  request: NextRequest,
): Promise<OneTimeFulfillResult> {
  if ((paymentIntent as { invoice?: string | null }).invoice) {
    return { outcome: "skipped", reason: "subscription_invoice" };
  }
  if (paymentIntent.description?.includes("Subscription")) {
    return { outcome: "skipped", reason: "subscription_invoice" };
  }

  if (paymentIntent.status === "processing") {
    return { outcome: "skipped", reason: "processing" };
  }
  if (paymentIntent.status !== "succeeded") {
    return { outcome: "skipped", reason: "not_succeeded" };
  }

  const order = await getStripeOrderByPaymentIntent(paymentIntent.id);
  if (!order) {
    return { outcome: "skipped", reason: "no_order" };
  }

  const metaOrderId = paymentIntent.metadata?.orderId;
  if (metaOrderId && metaOrderId !== order.order_id) {
    console.error("PaymentIntent orderId metadata mismatch:", metaOrderId, order.order_id);
    return { outcome: "skipped", reason: "order_mismatch" };
  }

  const existingByPi = await getLicenseByPaymentId(paymentIntent.id);

  if (order.status === "paid") {
    return {
      outcome: "already_paid",
      licenseKey: order.license_key ?? existingByPi?.license_key ?? null,
    };
  }

  if (existingByPi) {
    await updateStripeOrderByPaymentIntent(paymentIntent.id, "paid", existingByPi.license_key);
    const piProductMeta = paymentIntent.metadata?.product || "";
    await handleStripePostPurchase(
      order.email,
      order.full_name || "Valued Customer",
      existingByPi.license_key,
      order.plan,
      order.display_price,
      order.order_id,
      request,
      true,
      {
        country: paymentIntent.shipping?.address?.country || undefined,
        stripeLink: `https://dashboard.stripe.com/${paymentIntent.livemode ? "" : "test/"}payments/${paymentIntent.id}`,
        licenseProductId:
          piProductMeta === "orb-bot" ? "ORB_BOT" : licenseProductIdFromPlan(order.plan),
      },
    );
    return { outcome: "fulfilled", licenseKey: existingByPi.license_key };
  }

  const isUpgrade = paymentIntent.metadata?.isUpgrade === "true";
  const metaUpgradeLicenseKey = paymentIntent.metadata?.upgradeLicenseKey || "";
  let licenseKey = "";

  if (isUpgrade) {
    const licenses = await getLicensesForEmail(order.email, "SIGNAL_TRADING_BOTS");
    let existingLicense: { id: number; license_key: string; plan: string; status: string } | null =
      null;

    if (metaUpgradeLicenseKey) {
      existingLicense = licenses.find((l) => l.license_key === metaUpgradeLicenseKey) ?? null;
    }
    if (!existingLicense) {
      existingLicense =
        licenses.find(
          (l) =>
            l.status === "active" &&
            l.plan.toLowerCase() !== "lifetime" &&
            l.plan.toLowerCase() !== "orb_lifetime",
        ) ?? null;
    }

    if (existingLicense) {
      licenseKey = existingLicense.license_key;
      const expiresAt = new Date();
      expiresAt.setFullYear(expiresAt.getFullYear() + 1);

      await upgradeLicense({
        licenseId: existingLicense.id,
        newPlan: order.plan,
        newExpiresAt: expiresAt,
        paymentId: paymentIntent.id,
        amount: order.display_price,
        oldPlan: existingLicense.plan,
      });
    }
  }

  if (!licenseKey) {
    const productMeta = paymentIntent.metadata?.product || "";
    const licProductId: LicenseProductId =
      productMeta === "orb-bot" ? "ORB_BOT" : licenseProductIdFromPlan(order.plan);

    licenseKey = generateLicenseKeyForProduct(licProductId);
    const now = new Date();
    const expiresAt = new Date(now);
    const planLower = order.plan.toLowerCase();

    if (planLower === "lifetime" || planLower === "orb_lifetime") {
      expiresAt.setFullYear(expiresAt.getFullYear() + 100);
    } else if (planLower.includes("yearly")) {
      expiresAt.setFullYear(expiresAt.getFullYear() + 1);
    } else {
      expiresAt.setDate(expiresAt.getDate() + 30);
    }

    const metaSubscriptionId = paymentIntent.metadata?.subscriptionId;

    await createLicense({
      licenseKey,
      productId: licProductId,
      email: order.email,
      plan: order.plan,
      expiresAt,
      paymentId: paymentIntent.id,
      amount: order.display_price,
      currency: "USD",
      payment_type: metaSubscriptionId ? "subscription" : "one_time",
      subscription_id: metaSubscriptionId || undefined,
      subscription_status: metaSubscriptionId ? "active" : undefined,
    });
  }

  await updateStripeOrderByPaymentIntent(paymentIntent.id, "paid", licenseKey);
  const piProductMeta = paymentIntent.metadata?.product || "";
  await handleStripePostPurchase(
    order.email,
    order.full_name || "Valued Customer",
    licenseKey,
    order.plan,
    order.display_price,
    order.order_id,
    request,
    true,
    {
      country: paymentIntent.shipping?.address?.country || undefined,
      stripeLink: `https://dashboard.stripe.com/${paymentIntent.livemode ? "" : "test/"}payments/${paymentIntent.id}`,
      licenseProductId:
        piProductMeta === "orb-bot" ? "ORB_BOT" : licenseProductIdFromPlan(order.plan),
    },
  );

  return { outcome: "fulfilled", licenseKey };
}
