// Stripe Product and Price IDs
// These values should match your Stripe Dashboard configuration

import { PLAN_SALE_USD } from '@/lib/plan-pricing';

export const STRIPE_PRODUCTS = {
    starter_yearly: {
        productId: process.env.STRIPE_PRODUCT_STARTER_YEARLY!,
        priceId: process.env.STRIPE_PRICE_STARTER_YEARLY!,
        name: 'Starter (Yearly)',
        amount: PLAN_SALE_USD.starter_yearly,
        interval: 'year' as const,
    },
    pro_yearly: {
        productId: process.env.STRIPE_PRODUCT_PRO_YEARLY!,
        priceId: process.env.STRIPE_PRICE_PRO_YEARLY!,
        name: 'Pro (Yearly)',
        amount: PLAN_SALE_USD.pro_yearly,
        interval: 'year' as const,
    },
    lifetime: {
        productId: process.env.STRIPE_PRODUCT_LIFETIME!,
        priceId: process.env.STRIPE_PRICE_LIFETIME!,
        name: 'Lifetime',
        amount: PLAN_SALE_USD.lifetime,
        interval: null, // One-time payment
    },
    orb_lifetime: {
        productId: process.env.STRIPE_PRODUCT_ORB_LIFETIME!,
        priceId: process.env.STRIPE_PRICE_ORB_LIFETIME!,
        name: 'ORB Bot (Lifetime)',
        amount: PLAN_SALE_USD.orb_lifetime,
        interval: null,
    },
} as const;

export type PlanKey = keyof typeof STRIPE_PRODUCTS;

export function getPlanConfig(planKey: string) {
    return STRIPE_PRODUCTS[planKey as PlanKey];
}

export function isSubscriptionPlan(planKey: string): boolean {
    return planKey !== 'lifetime' && planKey !== 'orb_lifetime';
}
