import "server-only";

import { getSupabaseClient } from "./supabase-storage";

// ============================================================================
// TYPES
// ============================================================================

export interface CryptoOrderRow {
  id: number;
  order_id: string;
  plan: string;
  email: string;
  full_name: string;
  country: string;
  display_price: number;
  embedded_price: number;
  wallet_address: string;
  coin: string;
  network: string;
  wallet_index: number;
  status: string;
  license_key: string | null;
  tx_hash: string | null;
  verified_at: string | null;
  created_at: string;
  expires_at: string;
}

export interface StripeOrderRow {
  id: number;
  order_id: string;
  payment_intent_id: string;
  plan: string;
  email: string;
  full_name: string;
  country: string;
  display_price: number;
  status: string;
  payment_method: string;
  license_key: string | null;
  created_at: string;
}

export interface CreateCryptoOrderArgs {
  orderId: string;
  plan: string;
  email: string;
  fullName: string;
  country: string;
  displayPrice: number;
  embeddedPrice: number;
  walletAddress: string;
  coin: string;
  network: string;
  walletIndex: number;
  expiresAt: Date;
}

export interface CreateStripeOrderArgs {
  orderId: string;
  paymentIntentId: string;
  plan: string;
  email: string;
  fullName: string;
  country: string;
  displayPrice: number;
}

// ============================================================================
// CRYPTO ORDERS
// ============================================================================

/**
 * Create a new crypto order in the database
 */
export async function createCryptoOrder(args: CreateCryptoOrderArgs): Promise<CryptoOrderRow> {
  const client = getSupabaseClient();
  
  const { data, error } = await client
    .from("orders")
    .insert({
      order_id: args.orderId,
      plan: args.plan,
      email: args.email.toLowerCase(),
      full_name: args.fullName,
      country: args.country,
      display_price: args.displayPrice,
      embedded_price: args.embeddedPrice,
      wallet_address: args.walletAddress,
      coin: args.coin,
      network: args.network,
      wallet_index: args.walletIndex,
      status: "waiting_for_payment",
      expires_at: args.expiresAt.toISOString(),
    })
    .select("*")
    .single();

  if (error) {
    console.error("Failed to create crypto order:", error);
    throw error;
  }
  if (!data) {
    throw new Error("Failed to create crypto order - no data returned");
  }

  return data as CryptoOrderRow;
}

/**
 * Get a crypto order by order ID
 */
export async function getCryptoOrder(orderId: string): Promise<CryptoOrderRow | null> {
  const client = getSupabaseClient();
  
  const { data, error } = await client
    .from("orders")
    .select("*")
    .eq("order_id", orderId)
    .maybeSingle();

  if (error) {
    console.error("Failed to get crypto order:", error);
    throw error;
  }

  return data as CryptoOrderRow | null;
}

/**
 * Get a crypto order by wallet address and embedded price (for payment verification)
 */
export async function getCryptoOrderByWalletAndPrice(
  walletAddress: string,
  embeddedPrice: number
): Promise<CryptoOrderRow | null> {
  const client = getSupabaseClient();
  
  const { data, error } = await client
    .from("orders")
    .select("*")
    .eq("wallet_address", walletAddress)
    .eq("embedded_price", embeddedPrice)
    .eq("status", "waiting_for_payment")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error("Failed to get crypto order by wallet and price:", error);
    throw error;
  }

  return data as CryptoOrderRow | null;
}

/**
 * Update crypto order status and optionally set license key and tx hash
 */
export async function updateCryptoOrderStatus(
  orderId: string,
  status: string,
  updates?: {
    licenseKey?: string;
    txHash?: string;
    verifiedAt?: Date;
  }
): Promise<void> {
  const client = getSupabaseClient();
  
  const updateData: any = { status };
  
  if (updates?.licenseKey) {
    updateData.license_key = updates.licenseKey;
  }
  if (updates?.txHash) {
    updateData.tx_hash = updates.txHash;
  }
  if (updates?.verifiedAt) {
    updateData.verified_at = updates.verifiedAt.toISOString();
  }

  const { error } = await client
    .from("orders")
    .update(updateData)
    .eq("order_id", orderId);

  if (error) {
    console.error("Failed to update crypto order status:", error);
    throw error;
  }
}

/**
 * Get all orders for an email address
 */
export async function getCryptoOrdersByEmail(email: string): Promise<CryptoOrderRow[]> {
  const client = getSupabaseClient();
  
  const { data, error } = await client
    .from("orders")
    .select("*")
    .eq("email", email.toLowerCase())
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Failed to get crypto orders by email:", error);
    throw error;
  }

  return (data as CryptoOrderRow[]) ?? [];
}

// ============================================================================
// STRIPE ORDERS
// ============================================================================

/**
 * Create a new Stripe order in the database
 */
export async function createStripeOrder(args: CreateStripeOrderArgs): Promise<StripeOrderRow> {
  const client = getSupabaseClient();
  
  const { data, error } = await client
    .from("stripe_orders")
    .insert({
      order_id: args.orderId,
      payment_intent_id: args.paymentIntentId,
      plan: args.plan,
      email: args.email.toLowerCase(),
      full_name: args.fullName,
      country: args.country,
      display_price: args.displayPrice,
      status: "pending_payment",
      payment_method: "card",
    })
    .select("*")
    .single();

  if (error) {
    console.error("Failed to create Stripe order:", error);
    throw error;
  }
  if (!data) {
    throw new Error("Failed to create Stripe order - no data returned");
  }

  return data as StripeOrderRow;
}

/**
 * Get a Stripe order by order ID
 */
export async function getStripeOrder(orderId: string): Promise<StripeOrderRow | null> {
  const client = getSupabaseClient();
  
  const { data, error } = await client
    .from("stripe_orders")
    .select("*")
    .eq("order_id", orderId)
    .maybeSingle();

  if (error) {
    console.error("Failed to get Stripe order:", error);
    throw error;
  }

  return data as StripeOrderRow | null;
}

/**
 * Get a Stripe order by payment intent ID
 */
export async function getStripeOrderByPaymentIntent(
  paymentIntentId: string
): Promise<StripeOrderRow | null> {
  const client = getSupabaseClient();
  
  const { data, error } = await client
    .from("stripe_orders")
    .select("*")
    .eq("payment_intent_id", paymentIntentId)
    .maybeSingle();

  if (error) {
    console.error("Failed to get Stripe order by payment intent:", error);
    throw error;
  }

  return data as StripeOrderRow | null;
}

/**
 * Update Stripe order status and optionally set license key
 */
export async function updateStripeOrderStatus(
  orderId: string,
  status: string,
  licenseKey?: string
): Promise<void> {
  const client = getSupabaseClient();
  
  const updateData: any = { status };
  
  if (licenseKey) {
    updateData.license_key = licenseKey;
  }

  const { error } = await client
    .from("stripe_orders")
    .update(updateData)
    .eq("order_id", orderId);

  if (error) {
    console.error("Failed to update Stripe order status:", error);
    throw error;
  }
}

/**
 * Update Stripe order by payment intent ID
 */
export async function updateStripeOrderByPaymentIntent(
  paymentIntentId: string,
  status: string,
  licenseKey?: string
): Promise<void> {
  const client = getSupabaseClient();
  
  const updateData: any = { status };
  
  if (licenseKey) {
    updateData.license_key = licenseKey;
  }

  const { error } = await client
    .from("stripe_orders")
    .update(updateData)
    .eq("payment_intent_id", paymentIntentId);

  if (error) {
    console.error("Failed to update Stripe order by payment intent:", error);
    throw error;
  }
}

/**
 * Get all Stripe orders for an email address
 */
export async function getStripeOrdersByEmail(email: string): Promise<StripeOrderRow[]> {
  const client = getSupabaseClient();
  
  const { data, error } = await client
    .from("stripe_orders")
    .select("*")
    .eq("email", email.toLowerCase())
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Failed to get Stripe orders by email:", error);
    throw error;
  }

  return (data as StripeOrderRow[]) ?? [];
}

