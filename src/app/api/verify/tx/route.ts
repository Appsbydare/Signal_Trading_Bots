import { NextRequest, NextResponse } from "next/server";
import { orders } from "../../orders/create/route";

// Verify transaction by TX hash
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { orderId, txHash } = body;

    if (!orderId || !txHash) {
      return NextResponse.json({ error: "Missing orderId or txHash" }, { status: 400 });
    }

    const order = orders.get(orderId);
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
          toAddress.toLowerCase() === order.walletAddress.toLowerCase() &&
          Math.abs(amount - order.embeddedPrice) < 0.000001 // Allow tiny tolerance
        ) {
          verified = true;
          txDetails = data;
        }
      }
    }

    if (verified) {
      // Generate license key (simple example)
      const licenseKey = `LIC-${order.orderId}-${Date.now()}`;
      order.status = "paid";
      order.licenseKey = licenseKey;
      order.txHash = txHash;
      order.verifiedAt = new Date().toISOString();

      // TODO: Send license key email

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

