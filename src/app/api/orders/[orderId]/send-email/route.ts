import { NextRequest, NextResponse } from "next/server";
import { getStripeOrder } from "@/lib/orders-supabase";
import { sendStripeLicenseEmail } from "@/lib/email-stripe";
import { createMagicLinkToken } from "@/lib/auth-tokens";
import { getCurrentCustomer } from "@/lib/auth-server";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { getLicenseByKey } from "@/lib/license-db";
import { createDownloadToken } from "@/lib/download-tokens";
import { getInstallerFileNameForProduct, isR2Enabled } from "@/lib/r2-client";
import { licenseProductIdFromPlan } from "@/lib/license-products";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ orderId: string }> }
) {
  try {
    // Must be authenticated
    const caller = await getCurrentCustomer();
    if (!caller) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 3 resend attempts per customer per hour
    if (!checkRateLimit(`resend-email:${caller.email}`, { limit: 3, windowSeconds: 3600 })) {
      return NextResponse.json({ error: "Too many requests. Please try again later." }, { status: 429 });
    }

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

    // Verify the authenticated customer owns this order
    if (caller.email.toLowerCase() !== order.email?.toLowerCase()) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    if (!order.license_key) {
      return NextResponse.json(
        { error: "Order does not have a license key yet" },
        { status: 400 }
      );
    }

    // Generate Magic Link
    let magicLinkUrl = "https://www.signaltradingbots.com/login"; // Fallback
    try {
      const host = request.headers.get("host") || "www.signaltradingbots.com";
      const protocol = host.includes("localhost") ? "http" : "https";
      const token = await createMagicLinkToken(order.email);
      magicLinkUrl = `${protocol}://${host}/api/auth/magic-login?token=${token}`;
    } catch (err) {
      console.error("Failed to generate magic link:", err);
    }

    let downloadUrl: string | undefined;
    if (isR2Enabled() && order.license_key) {
      try {
        const lic = await getLicenseByKey(order.license_key);
        const productId = lic?.product_id ?? licenseProductIdFromPlan(order.plan);
        const host = request.headers.get("host") || "www.signaltradingbots.com";
        const protocol = host.includes("localhost") ? "http" : "https";
        const dt = await createDownloadToken({
          licenseKey: order.license_key,
          email: order.email,
          fileName: getInstallerFileNameForProduct(productId),
          ipAddress: getClientIp(request),
          userAgent: request.headers.get("user-agent") || "resend-email",
        });
        downloadUrl = `${protocol}://${host}/api/download/${dt.token}`;
      } catch (e) {
        console.error("Resend email: could not create download token:", e);
      }
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
        magicLinkUrl,
        downloadUrl,
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



