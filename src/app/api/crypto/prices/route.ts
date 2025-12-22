import { NextRequest, NextResponse } from "next/server";

// Cache prices for 5 minutes
const priceCache: {
  prices: Record<string, number>;
  lastUpdate: number;
} = {
  prices: {},
  lastUpdate: 0,
};

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// CoinGecko ID mapping
const COINGECKO_IDS: Record<string, string> = {
  BTC: "bitcoin",
  ETH: "ethereum",
  BNB: "binancecoin",
  USDT: "tether",
  USDC: "usd-coin",
};

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const coin = searchParams.get("coin")?.toUpperCase();

    if (!coin) {
      return NextResponse.json({ error: "Coin parameter required" }, { status: 400 });
    }

    // Check cache
    const now = Date.now();
    if (priceCache.lastUpdate + CACHE_DURATION > now && priceCache.prices[coin]) {
      return NextResponse.json({
        coin,
        price: priceCache.prices[coin],
        cached: true,
      });
    }

    // For stablecoins, return 1 (no conversion needed)
    if (coin === "USDT" || coin === "USDC") {
      priceCache.prices[coin] = 1;
      priceCache.lastUpdate = now;
      return NextResponse.json({
        coin,
        price: 1,
        cached: false,
      });
    }

    // Get CoinGecko ID
    const coinGeckoId = COINGECKO_IDS[coin];
    if (!coinGeckoId) {
      return NextResponse.json({ error: `Unsupported coin: ${coin}` }, { status: 400 });
    }

    // Fetch from CoinGecko API
    const response = await fetch(
      `https://api.coingecko.com/api/v3/simple/price?ids=${coinGeckoId}&vs_currencies=usd`,
      {
        headers: {
          Accept: "application/json",
        },
      }
    );

    if (!response.ok) {
      // If API fails, use cached price if available
      if (priceCache.prices[coin]) {
        return NextResponse.json({
          coin,
          price: priceCache.prices[coin],
          cached: true,
          warning: "Using cached price due to API error",
        });
      }
      throw new Error(`CoinGecko API error: ${response.status}`);
    }

    const data = await response.json();
    const price = data[coinGeckoId]?.usd;

    if (!price || price <= 0) {
      // If invalid price, use cached price if available
      if (priceCache.prices[coin]) {
        return NextResponse.json({
          coin,
          price: priceCache.prices[coin],
          cached: true,
          warning: "Using cached price due to invalid API response",
        });
      }
      throw new Error("Invalid price from CoinGecko");
    }

    // Update cache
    priceCache.prices[coin] = price;
    priceCache.lastUpdate = now;

    return NextResponse.json({
      coin,
      price,
      cached: false,
    });
  } catch (error) {
    console.error("Price fetch error:", error);
    
    // Return cached price if available, even if expired
    const coin = new URL(request.url).searchParams.get("coin")?.toUpperCase();
    if (coin && priceCache.prices[coin]) {
      return NextResponse.json({
        coin,
        price: priceCache.prices[coin],
        cached: true,
        warning: "Using cached price due to error",
      });
    }

    return NextResponse.json(
      { error: "Failed to fetch price" },
      { status: 500 }
    );
  }
}

