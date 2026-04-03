import { NextRequest, NextResponse } from "next/server";
import { getCryptoOrder, getStripeOrder } from "@/lib/orders-supabase";
import { getDownloadFieldsForPaidOrder } from "@/lib/stripe-order-download-fields";
import { getCurrentCustomer } from "@/lib/auth-server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ orderId: string }> }
) {
  try {
    // Await params in Next.js 15
    const { orderId } = await params;

    if (!orderId) {
      return NextResponse.json({ error: "Order ID is required" }, { status: 400 });
    }

    // Check both crypto and card orders
    let order = await getCryptoOrder(orderId); // Check crypto orders first
    let paymentMethod = "crypto";

    if (!order) {
      const stripeOrder = await getStripeOrder(orderId); // Check card orders
      if (stripeOrder) {
        // Convert stripe order to match expected format
        order = {
          orderId: stripeOrder.order_id,
          plan: stripeOrder.plan,
          email: stripeOrder.email,
          fullName: stripeOrder.full_name,
          country: stripeOrder.country,
          displayPrice: stripeOrder.display_price,
          status: stripeOrder.status,
          paymentIntentId: stripeOrder.payment_intent_id,
          licenseKey: stripeOrder.license_key,
          createdAt: stripeOrder.created_at,
        } as any;
        paymentMethod = "card";
      }
    } else {
      // Convert crypto order to match expected format
      order = {
        orderId: order.order_id,
        plan: order.plan,
        email: order.email,
        fullName: order.full_name,
        country: order.country,
        displayPrice: order.display_price,
        embeddedPrice: order.embedded_price,
        walletAddress: order.wallet_address,
        coin: order.coin,
        network: order.network,
        status: order.status,
        licenseKey: order.license_key,
        txHash: order.tx_hash,
        createdAt: order.created_at,
        expiresAt: order.expires_at,
      } as any;
    }

    if (!order) {
      return NextResponse.json(
        { error: "Order not found", orderId },
        { status: 404 }
      );
    }

    // Verify the caller owns this order — authenticated customers must match
    // the order email; unauthenticated callers are rejected.
    const caller = await getCurrentCustomer();
    if (!caller) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (caller.email.toLowerCase() !== (order as any).email?.toLowerCase()) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const orderLicenseKey =
      (order as { licenseKey?: string; license_key?: string }).licenseKey ??
      (order as { license_key?: string }).license_key;

    const { downloadUrl, downloadToken, downloadExpired, downloadFileName } =
      await getDownloadFieldsForPaidOrder(order.email, orderLicenseKey, request);

    return NextResponse.json({
      ...order,
      paymentMethod,
      downloadUrl,
      downloadToken,
      downloadExpired,
      downloadFileName,
    });
  } catch (error: any) {
    console.error("Error fetching order status:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch order status" },
      { status: 500 }
    );
  }
}
