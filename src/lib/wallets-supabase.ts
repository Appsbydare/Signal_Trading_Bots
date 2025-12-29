import "server-only";

import { getSupabaseClient } from "./supabase-storage";
import { WALLET_POOLS, Wallet } from "./wallets";

// ============================================================================
// WALLET ROTATION STATE
// ============================================================================

interface WalletRotationStateRow {
  id: number;
  coin_network: string;
  rotation_count: number;
  last_updated: string;
}

interface WalletOrderCountRow {
  id: number;
  wallet_key: string;
  order_count: number;
  last_reset_date: string;
  last_updated: string;
}

/**
 * Get the next wallet for a coin network with atomic rotation counter increment
 * Returns the wallet and its current order count for price calculation
 */
export async function getNextWalletFromDB(coinNetwork: string): Promise<{ wallet: Wallet; orderCount: number }> {
  const client = getSupabaseClient();
  const pool = WALLET_POOLS[coinNetwork];
  
  if (!pool || pool.length === 0) {
    throw new Error(`No wallets configured for ${coinNetwork}`);
  }

  // Get and increment rotation count atomically using RPC or raw SQL
  const { data: rotationData, error: rotationError } = await client
    .rpc('increment_wallet_rotation', { p_coin_network: coinNetwork });

  if (rotationError) {
    console.error("Failed to increment wallet rotation:", rotationError);
    throw rotationError;
  }

  // If RPC doesn't exist, fall back to manual update
  let rotationCount = 0;
  if (!rotationData) {
    // Fetch current rotation count
    const { data: stateData, error: fetchError } = await client
      .from("wallet_rotation_state")
      .select("rotation_count")
      .eq("coin_network", coinNetwork)
      .single();

    if (fetchError) {
      console.error("Failed to fetch wallet rotation state:", fetchError);
      throw fetchError;
    }

    rotationCount = stateData?.rotation_count ?? 0;

    // Increment rotation count
    const { error: updateError } = await client
      .from("wallet_rotation_state")
      .update({ 
        rotation_count: rotationCount + 1,
        last_updated: new Date().toISOString()
      })
      .eq("coin_network", coinNetwork);

    if (updateError) {
      console.error("Failed to update wallet rotation state:", updateError);
      throw updateError;
    }
  } else {
    rotationCount = rotationData;
  }

  // Select wallet based on rotation count
  const walletIndex = rotationCount % pool.length;
  const selectedWallet = pool[walletIndex];

  // Get order count for this wallet
  const walletKey = `${coinNetwork}:${selectedWallet.address}`;
  const today = getTodayDateString();

  const { data: countData, error: countError } = await client
    .from("wallet_order_counts")
    .select("*")
    .eq("wallet_key", walletKey)
    .maybeSingle();

  if (countError) {
    console.error("Failed to fetch wallet order count:", countError);
    throw countError;
  }

  let orderCount = 0;

  if (!countData) {
    // Create new entry
    const { data: newCountData, error: insertError } = await client
      .from("wallet_order_counts")
      .insert({
        wallet_key: walletKey,
        order_count: 1,
        last_reset_date: today,
      })
      .select("*")
      .single();

    if (insertError) {
      console.error("Failed to create wallet order count:", insertError);
      throw insertError;
    }

    orderCount = 0; // First order for this wallet
  } else {
    // Check if we need to reset (new day)
    if (countData.last_reset_date !== today) {
      // Reset order count for new day
      const { error: resetError } = await client
        .from("wallet_order_counts")
        .update({
          order_count: 1,
          last_reset_date: today,
          last_updated: new Date().toISOString(),
        })
        .eq("wallet_key", walletKey);

      if (resetError) {
        console.error("Failed to reset wallet order count:", resetError);
        throw resetError;
      }

      orderCount = 0; // First order after reset
    } else {
      // Increment order count
      orderCount = countData.order_count;

      const { error: incrementError } = await client
        .from("wallet_order_counts")
        .update({
          order_count: orderCount + 1,
          last_updated: new Date().toISOString(),
        })
        .eq("wallet_key", walletKey);

      if (incrementError) {
        console.error("Failed to increment wallet order count:", incrementError);
        throw incrementError;
      }
    }
  }

  return { wallet: selectedWallet, orderCount };
}

/**
 * Get today's date string (YYYY-MM-DD) for daily reset tracking
 */
function getTodayDateString(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
}

/**
 * Create RPC function for atomic wallet rotation increment
 * This should be run once in Supabase SQL editor:
 * 
 * CREATE OR REPLACE FUNCTION increment_wallet_rotation(p_coin_network VARCHAR)
 * RETURNS INTEGER AS $$
 * DECLARE
 *   v_rotation_count INTEGER;
 * BEGIN
 *   UPDATE wallet_rotation_state
 *   SET rotation_count = rotation_count + 1,
 *       last_updated = NOW()
 *   WHERE coin_network = p_coin_network
 *   RETURNING rotation_count INTO v_rotation_count;
 *   
 *   RETURN v_rotation_count;
 * END;
 * $$ LANGUAGE plpgsql;
 */


