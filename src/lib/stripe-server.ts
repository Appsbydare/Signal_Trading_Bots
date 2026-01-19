import Stripe from 'stripe';

// Plan Ranking and Normalization
export const PLAN_RANK: Record<string, number> = {
  'starter_monthly': 1,
  'starter_yearly': 2,
  'pro_monthly': 3,
  'pro_yearly': 4,
  'lifetime': 5
};

export const normalizePlanName = (p: string | undefined | null): string => {
  if (!p) return '';

  const lower = p.toLowerCase();

  if (lower.includes('pro') && lower.includes('monthly')) return 'pro_monthly';
  if (lower.includes('pro') && lower.includes('yearly')) return 'pro_yearly';
  if (lower.includes('starter') && lower.includes('monthly')) return 'starter_monthly';
  if (lower.includes('starter') && lower.includes('yearly')) return 'starter_yearly';
  if (lower.includes('lifetime')) return 'lifetime';

  if (p === 'pro') return 'pro_monthly';
  if (p === 'starter') return 'starter_monthly';

  return p;
};

// Helper to map Stripe price to plan name
export function getPlanFromPrice(price: Stripe.Price | null | undefined, fallbackPlan?: string): string | undefined {
  if (!price) return fallbackPlan;

  const amount = price.unit_amount || 0;
  const interval = price.recurring?.interval;

  // Map price amounts to plan names
  if (interval === 'year') {
    if (amount === 52900) return 'pro_yearly';
    if (amount === 31300) return 'starter_yearly';
  } else if (interval === 'month') {
    if (amount === 4900) return 'pro_monthly';
    if (amount === 2900) return 'starter_monthly';
  }

  return fallbackPlan;
}

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
 * @param amount - Amount in USD (e.g., 9, 29, 108, 348, 999)
 * @returns Amount in cents (e.g., 900, 2900, 10800, 34800, 99900)
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
    subscriptionId?: string;
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

/**
 * Create or retrieve Stripe customer
 */
export async function getOrCreateStripeCustomer(args: {
  email: string;
  name?: string;
  metadata?: Record<string, string>;
}): Promise<string> {
  if (!stripe) {
    throw new Error('Stripe is not configured');
  }

  // Search for existing customer
  const existingCustomers = await stripe.customers.list({
    email: args.email,
    limit: 1,
  });

  if (existingCustomers.data.length > 0) {
    return existingCustomers.data[0].id;
  }

  // Create new customer
  const customer = await stripe.customers.create({
    email: args.email,
    name: args.name,
    metadata: args.metadata || {},
  });

  return customer.id;
}

/**
 * Create a Stripe Subscription
 */
export async function createSubscription(args: {
  customerId: string;
  priceId: string;
  metadata: Record<string, string>;
  trialPeriodDays?: number;
}): Promise<Stripe.Subscription> {
  if (!stripe) {
    throw new Error('Stripe is not configured');
  }

  const subscription = await stripe.subscriptions.create({
    customer: args.customerId,
    items: [{ price: args.priceId }],
    metadata: args.metadata,
    trial_period_days: args.trialPeriodDays,
    payment_behavior: 'default_incomplete',
    payment_settings: {
      save_default_payment_method: 'on_subscription',
      payment_method_types: ['card'],
    },
    expand: ['latest_invoice.payment_intent', 'latest_invoice.confirmation_secret'],
  });

  return subscription;
}

/**
 * Cancel a subscription at period end
 */
export async function cancelSubscriptionAtPeriodEnd(
  subscriptionId: string
): Promise<Stripe.Subscription> {
  if (!stripe) {
    throw new Error('Stripe is not configured');
  }

  return await stripe.subscriptions.update(subscriptionId, {
    cancel_at_period_end: true,
  });
}

/**
 * Reactivate a canceled subscription
 */
export async function reactivateSubscription(
  subscriptionId: string
): Promise<Stripe.Subscription> {
  if (!stripe) {
    throw new Error('Stripe is not configured');
  }

  return await stripe.subscriptions.update(subscriptionId, {
    cancel_at_period_end: false,
  });
}

/**
 * Upgrade/downgrade subscription (change plan)
 */
export async function changeSubscriptionPlan(
  subscriptionId: string,
  newPriceId: string,
  prorationBehavior: 'create_prorations' | 'none' = 'create_prorations'
): Promise<Stripe.Subscription> {
  if (!stripe) {
    throw new Error('Stripe is not configured');
  }

  const subscription = await stripe.subscriptions.retrieve(subscriptionId);

  return await stripe.subscriptions.update(subscriptionId, {
    items: [{
      id: subscription.items.data[0].id,
      price: newPriceId,
    }],
    proration_behavior: prorationBehavior,
  });
}
