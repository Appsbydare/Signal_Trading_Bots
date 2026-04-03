import { NextRequest, NextResponse } from "next/server";
import { getCryptoOrder } from "@/lib/orders-supabase";

/**
 * Public read for crypto `orders` rows only (guest checkout).
 * Does not expose email or license_key. Used by /payment-crypto and payment-success fallback.
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ orderId: string }> }
) {
  try {
    const { orderId } = await params;
    if (!orderId) {
      return NextResponse.json({ error: "Order ID is required" }, { status: 400 });
    }

    const row = await getCryptoOrder(orderId);
    if (!row) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    return NextResponse.json({
      orderId: row.order_id,
      plan: row.plan,
      displayPrice: row.display_price,
      embeddedPrice: row.embedded_price,
      walletAddress: row.wallet_address,
      coin: row.coin,
      network: row.network,
      status: row.status,
      expiresAt: row.expires_at,
      paymentMethod: "crypto",
    });
  } catch (e: unknown) {
    console.error("crypto-public:", e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Failed to load order" },
      { status: 500 }
    );
  }
}
