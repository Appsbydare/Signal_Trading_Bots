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
    { address: "13hF6PqeZWERviRYRE1Gmpsb9D73S3GUcs", coin: "BTC", network: "BTC", index: 1 },
    { address: "1FJzBtHE7NjAjPUR26k49Cj41GHQYRbAmG", coin: "BTC", network: "BTC", index: 2 },
    { address: "1FgjE17fXWNeqae9m6rxXwzLMAEqZvxxNU", coin: "BTC", network: "BTC", index: 3 },
    { address: "1JZqvCBUzziajvBvVHyv9D1sGNipZtmq8", coin: "BTC", network: "BTC", index: 4 },
    { address: "1NAS43ri7frZakbn2ZFQ3Jm76ovVSNkV3i", coin: "BTC", network: "BTC", index: 5 },
    { address: "13rYrVaZBHGLFc1EAqkpTXKrMizAhAKi71", coin: "BTC", network: "BTC", index: 6 },
    { address: "17oCRjb17GtLpNdo4iEoKyRiPDLmmSqhkg", coin: "BTC", network: "BTC", index: 7 },
    { address: "1BLFaJgJGBVMiX3ycf7mmeR2t7idTuAivC", coin: "BTC", network: "BTC", index: 8 },
    { address: "14SteNWVQP9Xqjpjv49YMFsqPdQcs8HJkM", coin: "BTC", network: "BTC", index: 9 },
    { address: "1B7ffGHpdChTRm1sNjJHDiLL2VRc7z7Lhs", coin: "BTC", network: "BTC", index: 10 },
    { address: "12dPxvEaT7GHwK4GpZFLHAw2bkaFbPqpfr", coin: "BTC", network: "BTC", index: 11 },
    { address: "19SzcQdS98YhALwYqXT3fTY6sfsGqe77C2", coin: "BTC", network: "BTC", index: 12 },
    { address: "17wxfYmQSKwKqM5WrvXgofuTZcvngnaWLv", coin: "BTC", network: "BTC", index: 13 },
    { address: "1272CDwE3cFzgFhtSbW1iYTQb8faWy6yA8", coin: "BTC", network: "BTC", index: 14 },
    { address: "1FwFtfiDR8SbUAMUME1jHJdnW9vA28AY2S", coin: "BTC", network: "BTC", index: 15 },
  ],
  "ETH": [
    { address: "YOUR_BINANCE_ETH_WALLET_1", coin: "ETH", network: "ETH", index: 1 },
    // Add 14 more wallets
  ],
  "BNB": [
    { address: "0x5796C69917eb8a1F23FF65dd8AafEC2bE1d2C6F5", coin: "BNB", network: "BSC", index: 1 },
    { address: "0xE84ce0A69DD113CFf56e6C7Bb25D1f8957Ff1431", coin: "BNB", network: "BSC", index: 2 },
    { address: "0xc5fe57f66430f32EAbe25517737dA2088a8226A9", coin: "BNB", network: "BSC", index: 3 },
    { address: "0xC97d4924044dE44EbFF10F15b7C700f5b0beA33C", coin: "BNB", network: "BSC", index: 4 },
    { address: "0xDF02713EC1277f76fa6891860Ce7e9fa3a39cfF3", coin: "BNB", network: "BSC", index: 5 },
    { address: "0xd94AFf40C1f9141FBaBEEEf5ba4653c23bC0Da47", coin: "BNB", network: "BSC", index: 6 },
    { address: "0xd4779bDef1e390f78D1F2f958c5F518106629866", coin: "BNB", network: "BSC", index: 7 },
    { address: "0xD8C80E92338916B44E94547b70EB0139280Ef388", coin: "BNB", network: "BSC", index: 8 },
    { address: "0xB0Ad9529CB1E19D237ae4da47A7d0bC05A948F40", coin: "BNB", network: "BSC", index: 9 },
    { address: "0x713cC627E2158370ce1d1d1Bc1C824f2991E53C5", coin: "BNB", network: "BSC", index: 10 },
    { address: "0x1b10A15Ab0962c0052F1d12DAa70bBd85B032b2b", coin: "BNB", network: "BSC", index: 11 },
    { address: "0x90696ED08501f0E9dC95FCe0C5888666191a881b", coin: "BNB", network: "BSC", index: 12 },
    { address: "0xeff8ED2083b073879Ae53EDb568BED270FA59CE1", coin: "BNB", network: "BSC", index: 13 },
    { address: "0x543E468649d3e070c4407c7BC22e9fd8122D5884", coin: "BNB", network: "BSC", index: 14 },
    { address: "0x6278ebFd62bea971Dbe4F8D09A82d51eFFDa01b7", coin: "BNB", network: "BSC", index: 15 },
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

// Import database functions for wallet rotation
import { getNextWalletFromDB } from "./wallets-supabase";

// Calculate embedded price based on order count for this specific wallet
// Resets to base price when it would exceed display price
// Base price: displayPrice - 0.01989 (starts from 8.98011 for $9)
export function getEmbeddedPrice(displayPrice: number, orderCount: number): number {
  // Base: displayPrice - 0.019890 (smaller loss, starts closer to display price)
  const base = displayPrice - 0.01989;
  
  // Calculate maximum order count before price exceeds display price
  // maxOrderCount = (displayPrice - base) / 0.00001
  // For $9: (9 - 8.98011) / 0.00001 = 1989
  // For $29: (29 - 28.98011) / 0.00001 = 1989
  const maxOrderCount = Math.floor((displayPrice - base) / 0.00001);
  
  // Reset orderCount if it would exceed display price
  const adjustedOrderCount = orderCount % (maxOrderCount + 1);
  
  // Increment: adjustedOrderCount * 0.000010
  const increment = adjustedOrderCount * 0.00001;
  const calculatedPrice = base + increment;
  
  // Ensure price never exceeds display price
  const finalPrice = calculatedPrice >= displayPrice ? base : calculatedPrice;
  
  return parseFloat(finalPrice.toFixed(6));
}

// Get next available wallet (sequential rotation per coin/network)
// Returns wallet and its current order count for price calculation
// Now uses database for persistent state
export function getNextWallet(coinNetwork: string): { wallet: Wallet; orderCount: number } {
  // This is now a wrapper that calls the database version
  // We keep it synchronous for backward compatibility, but it will be called from async contexts
  throw new Error("getNextWallet must be called from async context. Use getNextWalletFromDB instead.");
}

// Async version that uses database
export async function getNextWalletAsync(coinNetwork: string): Promise<{ wallet: Wallet; orderCount: number }> {
  return await getNextWalletFromDB(coinNetwork);
}

