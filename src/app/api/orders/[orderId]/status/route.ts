import { NextRequest, NextResponse } from "next/server";
import { orders, stripeOrders } from "@/lib/orders-db";

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
    let order = orders.get(orderId); // Check crypto orders first

    if (!order) {
      order = stripeOrders.get(orderId); // Check card orders
    }

    if (!order) {
      return NextResponse.json(
        { error: "Order not found", orderId },
        { status: 404 }
      );
    }

    // Return order details
    // We modify the response to match what the frontend expects (flattened object)
    // and ensure all fields from the order (like embeddedPrice for crypto) are included
    return NextResponse.json({
      ...order,
      paymentMethod: order.paymentIntentId ? "card" : "crypto",
    });
  } catch (error: any) {
    console.error("Error fetching order status:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch order status" },
      { status: 500 }
    );
  }
}
