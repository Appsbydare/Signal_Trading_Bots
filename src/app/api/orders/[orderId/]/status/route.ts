import { NextRequest, NextResponse } from "next/server";
import { orders } from "../create/route";

export async function GET(
  request: NextRequest,
  { params }: { params: { orderId: string } }
) {
  try {
    const orderId = params.orderId;
    const order = orders.get(orderId);

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    const now = new Date();
    const expiresAt = new Date(order.expiresAt);
    const isExpired = now > expiresAt;

    return NextResponse.json({
      ...order,
      status: isExpired && order.status === "waiting_for_payment" ? "expired" : order.status,
      paymentDetected: order.status === "paid" || order.status === "confirming",
      confirmations: order.confirmations || 0,
      isExpired,
    });
  } catch (error) {
    console.error("Status check error:", error);
    return NextResponse.json({ error: "Failed to check status" }, { status: 500 });
  }
}

