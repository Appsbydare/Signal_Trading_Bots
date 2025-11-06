// Wallet pool configuration
// 15 wallets per coin, rotate every 15 minutes

export interface Wallet {
  address: string;
  coin: string;
  network: string;
  index: number;
}

export const WALLET_POOLS: Record<string, Wallet[]> = {
  "USDT-TRC20": [
    { address: "YOUR_BINANCE_USDT_TRC20_WALLET_1", coin: "USDT", network: "TRC20", index: 1 },
    { address: "YOUR_BINANCE_USDT_TRC20_WALLET_2", coin: "USDT", network: "TRC20", index: 2 },
    { address: "YOUR_BINANCE_USDT_TRC20_WALLET_3", coin: "USDT", network: "TRC20", index: 3 },
    // Add 12 more wallets (4-15)
  ],
  "USDT-ERC20": [
    { address: "YOUR_BINANCE_USDT_ERC20_WALLET_1", coin: "USDT", network: "ERC20", index: 1 },
    // Add 14 more wallets
  ],
  "BTC": [
    { address: "YOUR_BINANCE_BTC_WALLET_1", coin: "BTC", network: "BTC", index: 1 },
    // Add 14 more wallets
  ],
  "ETH": [
    { address: "YOUR_BINANCE_ETH_WALLET_1", coin: "ETH", network: "ETH", index: 1 },
    // Add 14 more wallets
  ],
  "BNB": [
    { address: "YOUR_BINANCE_BNB_WALLET_1", coin: "BNB", network: "BSC", index: 1 },
    // Add 14 more wallets
  ],
  "USDC-ERC20": [
    { address: "YOUR_BINANCE_USDC_ERC20_WALLET_1", coin: "USDC", network: "ERC20", index: 1 },
    // Add 14 more wallets
  ],
};

// Calculate embedded price based on wallet index
export function getEmbeddedPrice(displayPrice: number, walletIndex: number): number {
  // Base: displayPrice - 0.099890
  // Increment: walletIndex * 0.000010
  const base = displayPrice - 0.09989;
  const increment = walletIndex * 0.00001;
  return parseFloat((base + increment).toFixed(6));
}

// Get next available wallet (rotate every 15 minutes)
export function getNextWallet(coinNetwork: string): Wallet {
  const pool = WALLET_POOLS[coinNetwork];
  if (!pool || pool.length === 0) {
    throw new Error(`No wallets configured for ${coinNetwork}`);
  }

  // Simple rotation: use wallet index based on current time (15-minute windows)
  const now = Date.now();
  const windowMs = 15 * 60 * 1000; // 15 minutes
  const windowIndex = Math.floor(now / windowMs) % pool.length;
  const walletIndex = windowIndex % pool.length;

  return pool[walletIndex];
}

