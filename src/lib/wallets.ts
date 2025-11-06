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
    { address: "0xb96cbffa9c1463a863a83893e371176bda25e650", coin: "USDT", network: "ERC20", index: 1 },
    { address: "0x75f5639f5250d2b8fb770d56656f3588d0e3308b", coin: "USDT", network: "ERC20", index: 2 },
    { address: "0x9d0392b91bdb67b896fa3918359c53f07e921f8a", coin: "USDT", network: "ERC20", index: 3 },
    { address: "0x519216ffecc001d87ac3f6164ed37231758db4e9", coin: "USDT", network: "ERC20", index: 4 },
    { address: "0xd29d5f6c5c1ed84e650c8f69f28a70b73f6c0053", coin: "USDT", network: "ERC20", index: 5 },
    { address: "0x1dc444de2dbb7f2c9576076a8a8982ada56bb461", coin: "USDT", network: "ERC20", index: 6 },
    { address: "0xbf0afc054ed09104c3e887bb7e17c6c6f89067ea", coin: "USDT", network: "ERC20", index: 7 },
    { address: "0xcff480b9a3bb817467a7332c37ef704509933a7d", coin: "USDT", network: "ERC20", index: 8 },
    { address: "0x719033740201a2954af8ed786d1e57213c61e923", coin: "USDT", network: "ERC20", index: 9 },
    { address: "0xecb597b91ef82673d2fc7332aaafb2b6c7266537", coin: "USDT", network: "ERC20", index: 10 },
    { address: "0x133d89d5b4f7d30393b8e872f51f18f7e962fba4", coin: "USDT", network: "ERC20", index: 11 },
    { address: "0x815ef0af49c9daa5672345ef824ce85a14a74031", coin: "USDT", network: "ERC20", index: 12 },
    { address: "0xfa9dd540e36da6635c6d99557d0be22ac576b652", coin: "USDT", network: "ERC20", index: 13 },
    { address: "0x4dc54d82e9ee0ba62ee34e513f9f7d2e2bb14998", coin: "USDT", network: "ERC20", index: 14 },
    { address: "0x526b8375e72de2d88c57ec38012e239d379b7f1e", coin: "USDT", network: "ERC20", index: 15 },
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
    { address: "0xb96cbffa9c1463a863a83893e371176bda25e650", coin: "USDC", network: "ERC20", index: 1 },
    { address: "0x75f5639f5250d2b8fb770d56656f3588d0e3308b", coin: "USDC", network: "ERC20", index: 2 },
    { address: "0x9d0392b91bdb67b896fa3918359c53f07e921f8a", coin: "USDC", network: "ERC20", index: 3 },
    { address: "0x519216ffecc001d87ac3f6164ed37231758db4e9", coin: "USDC", network: "ERC20", index: 4 },
    { address: "0xd29d5f6c5c1ed84e650c8f69f28a70b73f6c0053", coin: "USDC", network: "ERC20", index: 5 },
    { address: "0x1dc444de2dbb7f2c9576076a8a8982ada56bb461", coin: "USDC", network: "ERC20", index: 6 },
    { address: "0xbf0afc054ed09104c3e887bb7e17c6c6f89067ea", coin: "USDC", network: "ERC20", index: 7 },
    { address: "0xcff480b9a3bb817467a7332c37ef704509933a7d", coin: "USDC", network: "ERC20", index: 8 },
    { address: "0x719033740201a2954af8ed786d1e57213c61e923", coin: "USDC", network: "ERC20", index: 9 },
    { address: "0xecb597b91ef82673d2fc7332aaafb2b6c7266537", coin: "USDC", network: "ERC20", index: 10 },
    { address: "0x133d89d5b4f7d30393b8e872f51f18f7e962fba4", coin: "USDC", network: "ERC20", index: 11 },
    { address: "0x815ef0af49c9daa5672345ef824ce85a14a74031", coin: "USDC", network: "ERC20", index: 12 },
    { address: "0xfa9dd540e36da6635c6d99557d0be22ac576b652", coin: "USDC", network: "ERC20", index: 13 },
    { address: "0x4dc54d82e9ee0ba62ee34e513f9f7d2e2bb14998", coin: "USDC", network: "ERC20", index: 14 },
    { address: "0x526b8375e72de2d88c57ec38012e239d379b7f1e", coin: "USDC", network: "ERC20", index: 15 },
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

