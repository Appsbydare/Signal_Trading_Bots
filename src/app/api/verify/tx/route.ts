import { NextRequest, NextResponse } from "next/server";
import { getCryptoOrder, updateCryptoOrderStatus } from "@/lib/orders-supabase";
import { generateLicenseKeyForProduct } from "@/lib/license-keys";
import { createLicense } from "@/lib/license-db";
import { sendLicenseEmail } from "@/lib/email";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { licenseProductIdFromPlan } from "@/lib/license-products";
import { createDownloadToken } from "@/lib/download-tokens";
import { getInstallerFileNameForProduct, isR2Enabled } from "@/lib/r2-client";

// Verify transaction by TX hash
export async function POST(request: NextRequest) {
  // 5 verification attempts per IP per 10 minutes — prevents brute-force txHash guessing
  if (!checkRateLimit(`verify-tx:${getClientIp(request)}`, { limit: 5, windowSeconds: 600 })) {
    return NextResponse.json({ error: "Too many requests. Please try again later." }, { status: 429 });
  }

  try {
    const body = await request.json();
    const { orderId, txHash } = body;

    if (!orderId || !txHash) {
      return NextResponse.json({ error: "Missing orderId or txHash" }, { status: 400 });
    }

    // Basic txHash format sanity check — TRC20 hashes are 64 hex chars
    if (!/^[a-fA-F0-9]{64}$/.test(txHash)) {
      return NextResponse.json({ error: "Invalid transaction hash format" }, { status: 400 });
    }

    const order = await getCryptoOrder(orderId);
    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // Idempotency guard — if already paid, return existing license key without re-processing
    if (order.status === "paid") {
      return NextResponse.json({
        success: true,
        status: "paid",
        licenseKey: order.license_key,
      });
    }

    // Reject expired orders outright
    if (order.status === "expired" || (order.expires_at && new Date(order.expires_at) < new Date())) {
      return NextResponse.json({ error: "Order has expired" }, { status: 400 });
    }

    // Verify TX hash via blockchain API
    // For TRC20, use TronScan API
    let verified = false;
    let txDetails = null;

    if (order.network === "TRC20") {
      // TronScan API call
      const response = await fetch(
        `https://apilist.tronscan.org/api/transaction-info?hash=${txHash}`
      );
      const data = await response.json();

      if (data && data.contractRet === "SUCCESS") {
        // Check if transaction matches order
        const toAddress = data.toAddress;
        const amount = parseFloat(data.amount) / 1000000; // USDT has 6 decimals

        if (
          toAddress.toLowerCase() === order.wallet_address.toLowerCase() &&
          Math.abs(amount - order.embedded_price) < 0.000001 // Allow tiny tolerance
        ) {
          verified = true;
          txDetails = data;
        }
      }
    }

    if (verified) {
      const productId = licenseProductIdFromPlan(order.plan);
      const licenseKey = generateLicenseKeyForProduct(productId);

      // Calculate expiry date based on plan
      const now = new Date();
      const expiresAt = new Date(now);
      const planLower = order.plan.toLowerCase();

      if (planLower === "lifetime" || planLower === "orb_lifetime") {
        expiresAt.setFullYear(expiresAt.getFullYear() + 100);
      } else if (planLower.includes("yearly")) {
        // Yearly plans: starter_yearly, pro_yearly
        expiresAt.setFullYear(expiresAt.getFullYear() + 1);
      } else {
        // Monthly plans: starter, pro
        expiresAt.setDate(expiresAt.getDate() + 30); 
      }

      // Insert license into Supabase
      try {
        await createLicense({
          licenseKey,
          productId,
          email: order.email,
          plan: order.plan,
          expiresAt,
          paymentId: txHash,
          amount: order.display_price,
          currency: order.coin === "USDT" ? "USD" : order.coin,
        });
      } catch (dbError) {
        console.error("Failed to create license in database:", dbError);
        return NextResponse.json(
          {
            success: false,
            error: "Failed to create license. Please contact support with your transaction hash.",
            txHash,
          },
          { status: 500 }
        );
      }

      let downloadUrl: string | undefined;
      if (isR2Enabled()) {
        try {
          const host = request.headers.get("host") || "www.signaltradingbots.com";
          const protocol = host.includes("localhost") ? "http" : "https";
          const dt = await createDownloadToken({
            licenseKey,
            email: order.email,
            fileName: getInstallerFileNameForProduct(productId),
            ipAddress: getClientIp(request),
            userAgent: request.headers.get("user-agent") || "crypto-verify",
          });
          downloadUrl = `${protocol}://${host}/api/download/${dt.token}`;
        } catch (e) {
          console.error("Crypto verify: could not create download token:", e);
        }
      }

      // Send license key email
      try {
        await sendLicenseEmail({
          to: order.email,
          licenseKey,
          plan: order.plan,
          expiresAt: expiresAt.toISOString(),
          downloadUrl,
        });
      } catch (emailError) {
        console.error("Failed to send license email:", emailError);
        // Don't fail the transaction if email fails - license is already in DB
      }

      // Update order in database
      await updateCryptoOrderStatus(orderId, "paid", {
        licenseKey,
        txHash,
        verifiedAt: now,
      });

      return NextResponse.json({
        success: true,
        status: "paid",
        licenseKey,
      });
    } else {
      // TX hash doesn't match - redirect to customer service
      return NextResponse.json(
        {
          success: false,
          error: "Transaction verification failed",
          redirectTo: "/contact?reason=payment_verification_failed",
        },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error("TX verification error:", error);
    return NextResponse.json({ error: "Verification failed" }, { status: 500 });
  }
}

