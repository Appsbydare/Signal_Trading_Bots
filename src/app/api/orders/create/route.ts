import { NextRequest, NextResponse } from "next/server";
import { getEmbeddedPrice } from "@/lib/wallets";
import { getNextWalletFromDB } from "@/lib/wallets-supabase";
import { createCryptoOrder } from "@/lib/orders-supabase";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { plan, email, fullName, country, coinNetwork } = body;

    if (!plan || !email || !fullName || !country) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const displayPrice = plan === "lifetime" ? 999 : plan === "pro" ? 49 : 0.99;
    const selectedCoinNetwork = coinNetwork || "USDT-TRC20"; // Default to USDT-TRC20 if not provided
    const { wallet, orderCount } = await getNextWalletFromDB(selectedCoinNetwork);
    const embeddedPrice = getEmbeddedPrice(displayPrice, orderCount);

    const orderId = `ORD${Date.now()}${Math.floor(Math.random() * 1000)}`;
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    // Create order in database
    await createCryptoOrder({
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
      expiresAt,
    });

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

