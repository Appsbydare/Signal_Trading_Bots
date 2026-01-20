import { NextRequest, NextResponse } from "next/server";
import { getEmbeddedPrice } from "@/lib/wallets";
import { getNextWalletFromDB } from "@/lib/wallets-supabase";
import { createCryptoOrder } from "@/lib/orders-supabase";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { plan, email, fullName, country, coinNetwork, finalPrice, isUpgrade, creditAmount } = body;

    if (!plan || !email || !fullName || !country) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Use finalPrice if provided (for upgrades with proration), otherwise use priceMap
    let displayPrice: number;
    if (finalPrice !== undefined && finalPrice !== null) {
      displayPrice = finalPrice;
    } else {
      const priceMap: Record<string, number> = {
        lifetime: 999,
        pro: 29,
        starter: 9,
        pro_yearly: 348,
        starter_yearly: 108,
      };
      displayPrice = priceMap[plan as string] || 9;
    }

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

