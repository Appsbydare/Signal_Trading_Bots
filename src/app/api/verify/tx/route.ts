import { NextRequest, NextResponse } from "next/server";
import { getCryptoOrder, updateCryptoOrderStatus } from "@/lib/orders-supabase";
import { generateLicenseKey } from "@/lib/license-keys";
import { createLicense } from "@/lib/license-db";
import { sendLicenseEmail } from "@/lib/email";

// Verify transaction by TX hash
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { orderId, txHash } = body;

    if (!orderId || !txHash) {
      return NextResponse.json({ error: "Missing orderId or txHash" }, { status: 400 });
    }

    const order = await getCryptoOrder(orderId);
    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
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
      // Generate DBOT-style license key
      const licenseKey = generateLicenseKey();
      
      // Calculate expiry date based on plan
      const now = new Date();
      const expiresAt = new Date(now);
      if (order.plan === "monthly") {
        expiresAt.setMonth(expiresAt.getMonth() + 1);
      } else if (order.plan === "yearly") {
        expiresAt.setFullYear(expiresAt.getFullYear() + 1);
      } else {
        // Default to yearly if plan not recognized
        expiresAt.setFullYear(expiresAt.getFullYear() + 1);
      }

      // Insert license into Supabase
      try {
        await createLicense({
          licenseKey,
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

      // Send license key email
      try {
        await sendLicenseEmail({
          to: order.email,
          licenseKey,
          plan: order.plan,
          expiresAt: expiresAt.toISOString(),
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

