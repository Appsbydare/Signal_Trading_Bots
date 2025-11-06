import { NextRequest, NextResponse } from "next/server";
import { getNextWallet, getEmbeddedPrice } from "@/lib/wallets";

// In production, use a database. For now, we'll use in-memory storage
// You should replace this with a real database or Google Sheets integration
const orders = new Map();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { plan, email, fullName, country } = body;

    if (!plan || !email || !fullName || !country) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const displayPrice = plan === "pro" ? 49 : 29;
    const coinNetwork = "USDT-TRC20"; // Default, can be selected by user
    const wallet = getNextWallet(coinNetwork);
    const embeddedPrice = getEmbeddedPrice(displayPrice, wallet.index);

    const orderId = `ORD${Date.now()}${Math.floor(Math.random() * 1000)}`;
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    const order = {
      orderId,
      plan,
      email,
      fullName,
      country,
      displayPrice,
      embeddedPrice,
      walletAddress: wallet.address,
      coin: wallet.coin,
      network: wallet.network,
      walletIndex: wallet.index,
      status: "waiting_for_payment",
      createdAt: new Date().toISOString(),
      expiresAt: expiresAt.toISOString(),
      licenseKey: null,
    };

    orders.set(orderId, order);

    return NextResponse.json({
      orderId,
      embeddedPrice,
      walletAddress: wallet.address,
      coin: wallet.coin,
      network: wallet.network,
      expiresAt: expiresAt.toISOString(),
    });
  } catch (error) {
    console.error("Order creation error:", error);
    return NextResponse.json({ error: "Failed to create order" }, { status: 500 });
  }
}

// Export orders map for verification endpoints (in production, use shared DB)
export { orders };

