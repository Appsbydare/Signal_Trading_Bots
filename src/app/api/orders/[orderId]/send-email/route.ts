import { NextRequest, NextResponse } from "next/server";
import { getStripeOrder } from "@/lib/orders-supabase";
import { sendStripeLicenseEmail } from "@/lib/email-stripe";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ orderId: string }> }
) {
  try {
    const { orderId } = await params;

    if (!orderId) {
      return NextResponse.json({ error: "Order ID is required" }, { status: 400 });
    }

    // Get order from database
    const order = await getStripeOrder(orderId);

    if (!order) {
      return NextResponse.json(
        { error: "Order not found", orderId },
        { status: 404 }
      );
    }

    if (!order.license_key) {
      return NextResponse.json(
        { error: "Order does not have a license key yet" },
        { status: 400 }
      );
    }

    // Send email
    try {
      await sendStripeLicenseEmail({
        to: order.email,
        fullName: order.full_name,
        licenseKey: order.license_key,
        plan: order.plan,
        orderId: order.order_id,
        amount: order.display_price,
      });

      return NextResponse.json({
        success: true,
        message: "Email sent successfully",
        sentTo: order.email,
      });
    } catch (emailError: any) {
      console.error("Failed to send email:", emailError);
      return NextResponse.json(
        {
          success: false,
          error: "Failed to send email",
          details: emailError.message,
        },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error("Error in send-email endpoint:", error);
    return NextResponse.json(
      { error: error.message || "Failed to send email" },
      { status: 500 }
    );
  }
}


