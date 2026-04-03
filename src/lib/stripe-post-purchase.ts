import "server-only";

import type { NextRequest } from "next/server";
import { sendStripeLicenseEmail, sendAdminNotificationEmail } from "@/lib/email-stripe";
import { sendTelegramAdminNotification } from "@/lib/telegram";
import { getCustomerByEmail, createCustomer } from "@/lib/auth-users";
import { createMagicLinkToken } from "@/lib/auth-tokens";
import { createDownloadToken } from "@/lib/download-tokens";
import { getInstallerFileNameForProduct, isR2Enabled } from "@/lib/r2-client";
import { licenseProductIdFromPlan, type LicenseProductId } from "@/lib/license-products";

export async function handleStripePostPurchase(
  email: string,
  fullName: string,
  licenseKey: string,
  plan: string,
  amount: number,
  orderId: string,
  request: NextRequest,
  downloadLinkEnabled: boolean = true,
  options: { country?: string; stripeLink?: string; licenseProductId?: LicenseProductId } = {},
) {
  const licenseProductId = options.licenseProductId ?? licenseProductIdFromPlan(plan);
  let customer = await getCustomerByEmail(email);
  if (!customer) {
    try {
      const randomPassword =
        Math.random().toString(36).slice(-10) + Math.random().toString(36).slice(-10);
      customer = await createCustomer({
        email: email,
        password: randomPassword,
        name: fullName,
      });
      console.log("Auto-created customer for email:", email);
    } catch (err: unknown) {
      const code = (err as { code?: string })?.code;
      console.error("Failed to auto-create customer:", err);
      if (code === "23505") {
        customer = await getCustomerByEmail(email);
      }
    }
  }

  let magicLinkUrl = "https://www.signaltradingbots.com/login";
  try {
    const host = request.headers.get("host") || "www.signaltradingbots.com";
    const protocol = host.includes("localhost") ? "http" : "https";
    const token = await createMagicLinkToken(email);
    magicLinkUrl = `${protocol}://${host}/api/auth/magic-login?token=${token}`;
  } catch (err) {
    console.error("Failed to generate magic link:", err);
  }

  let downloadUrl = "";
  if (downloadLinkEnabled && isR2Enabled()) {
    try {
      const ipAddress =
        request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "checkout";
      const userAgent = request.headers.get("user-agent") || "stripe";
      const downloadToken = await createDownloadToken({
        licenseKey,
        email: email,
        fileName: getInstallerFileNameForProduct(licenseProductId),
        ipAddress,
        userAgent,
      });
      const host = request.headers.get("host") || "www.signaltradingbots.com";
      const protocol = host.includes("localhost") ? "http" : "https";
      downloadUrl = `${protocol}://${host}/api/download/${downloadToken.token}`;
    } catch (err) {
      console.error("Failed to generate download link:", err);
    }
  }

  try {
    await sendStripeLicenseEmail({
      to: email,
      fullName: fullName,
      licenseKey,
      plan,
      orderId,
      amount,
      magicLinkUrl,
      downloadUrl,
    });
    console.log("License email sent to:", email);
  } catch (error) {
    console.error("Failed to send license email:", error);
  }

  try {
    await Promise.allSettled([
      sendAdminNotificationEmail({
        customerEmail: email,
        fullName: fullName,
        licenseKey,
        plan,
        amount,
        orderId,
      }),
      sendTelegramAdminNotification({
        email: email,
        fullName: fullName,
        plan,
        amount,
        orderId,
        country: options.country,
        stripeLink: options.stripeLink,
      }),
    ]);
    console.log("Admin notifications sequence completed for:", email);
  } catch (adminErr) {
    console.error("Failed to process admin notifications:", adminErr);
  }
}
