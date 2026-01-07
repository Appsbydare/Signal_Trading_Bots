import Stripe from 'stripe';

// Check if Stripe is configured
const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;
const isStripeConfigured = !!STRIPE_SECRET_KEY;

if (!isStripeConfigured) {
  console.warn(' STRIPE_SECRET_KEY is not set. Stripe payments will be disabled.');
}

// Initialize Stripe with your secret key (only if configured)
export const stripe = isStripeConfigured
  ? new Stripe(STRIPE_SECRET_KEY!, {
    apiVersion: '2025-12-15.clover',
    typescript: true,
  })
  : null;

/**
 * Check if Stripe is properly configured
 */
export function isStripeEnabled(): boolean {
  return isStripeConfigured;
}

/**
 * Convert USD amount to cents for Stripe
 * @param amount - Amount in USD (e.g., 29, 49, 999)
 * @returns Amount in cents (e.g., 2900, 4900, 99900)
 */
export function convertToCents(amount: number): number {
  return Math.round(amount * 100);
}

/**
 * Convert cents to USD
 * @param cents - Amount in cents
 * @returns Amount in USD
 */
export function convertToUSD(cents: number): number {
  return cents / 100;
}

/**
 * Create a Stripe PaymentIntent
 * @param amount - Amount in USD
 * @param metadata - Order metadata
 * @returns PaymentIntent object
 */
export async function createPaymentIntent(
  amount: number,
  metadata: {
    orderId: string;
    plan: string;
    email: string;
    fullName: string;
    country: string;
    isUpgrade?: string;
    upgradeLicenseKey?: string;
  }
) {
  if (!stripe) {
    throw new Error('Stripe is not configured. Please set STRIPE_SECRET_KEY in environment variables.');
  }

  const paymentIntent = await stripe.paymentIntents.create({
    amount: convertToCents(amount),
    currency: 'usd',
    automatic_payment_methods: {
      enabled: true,
    },
    metadata,
    description: `SignalTradingBots ${metadata.plan} License`,
    receipt_email: metadata.email,
  });

  return paymentIntent;
}

/**
 * Verify Stripe webhook signature
 * @param payload - Raw request body
 * @param signature - Stripe signature header
 * @returns Stripe event object
 */
export function verifyWebhookSignature(
  payload: string | Buffer,
  signature: string
): Stripe.Event {
  if (!stripe) {
    throw new Error('Stripe is not configured. Please set STRIPE_SECRET_KEY in environment variables.');
  }

  if (!process.env.STRIPE_WEBHOOK_SECRET) {
    throw new Error('STRIPE_WEBHOOK_SECRET is not set');
  }

  return stripe.webhooks.constructEvent(
    payload,
    signature,
    process.env.STRIPE_WEBHOOK_SECRET
  );
}

