import { NextRequest, NextResponse } from "next/server";
import { getCryptoOrder, getStripeOrder } from "@/lib/orders-supabase";

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

    // Return order details with payment method
    return NextResponse.json({
      ...order,
      paymentMethod,
    });
  } catch (error: any) {
    console.error("Error fetching order status:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch order status" },
      { status: 500 }
    );
  }
}
