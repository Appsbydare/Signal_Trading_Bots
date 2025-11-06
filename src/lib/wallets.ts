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
    { address: "THk6NfkTxZPXmwPF4PUXZP2898Bip2Hacn", coin: "USDT", network: "TRC20", index: 1 },
    { address: "TVtfaFPoNXhj2a3cuZKkLpNXD5oCs8PaDs", coin: "USDT", network: "TRC20", index: 2 },
    { address: "TJayY25fBcDkVpBynvvxmAfXkgxTtH9TH1", coin: "USDT", network: "TRC20", index: 3 },
    { address: "TQhdkkSb77pxaKyN2LauWvnMT2iLbh4pwZ", coin: "USDT", network: "TRC20", index: 4 },
    { address: "TDxW6LzxRPUQDWuGJL8tWQiKWLLKDqNSfG", coin: "USDT", network: "TRC20", index: 5 },
    { address: "TNDqDqgp27JHbsD9u7gPNYRhhRnkg5kLje", coin: "USDT", network: "TRC20", index: 6 },
    { address: "TATBA9g8W1LpoQC3fdCUdS4EraB8nkPFbv", coin: "USDT", network: "TRC20", index: 7 },
    { address: "TYxdPmYXwLJ2BjHPr3KYPL5EcEkZe7kb3x", coin: "USDT", network: "TRC20", index: 8 },
    { address: "TP1EAyP1Qw1x3jjiM4rRduwtMQRKd9M7aJ", coin: "USDT", network: "TRC20", index: 9 },
    { address: "TB2xB6rtnDJy2ffFu5K7rvSRMSTGaDdCfC", coin: "USDT", network: "TRC20", index: 10 },
    { address: "TNRyf3FxwtBeZ44oT4NDWJZU4ra2eXmysE", coin: "USDT", network: "TRC20", index: 11 },
    { address: "TXfbURzTCdZtx2HtBVP4PfP5TFbQEwnuR9", coin: "USDT", network: "TRC20", index: 12 },
    { address: "TNa3r7bnmHkR8PZWJjfTNQbaJVZxPPLyBX", coin: "USDT", network: "TRC20", index: 13 },
    { address: "TWNXbYf1a675aAt1RgdC1jnXQfTYMZqdDP", coin: "USDT", network: "TRC20", index: 14 },
    { address: "TFMdDpHdqxJkPK5NVLkuTopxwLFXKGpvvB", coin: "USDT", network: "TRC20", index: 15 },
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

