// Stripe Product and Price IDs
// These values should match your Stripe Dashboard configuration

export const STRIPE_PRODUCTS = {
    starter_monthly: {
        productId: process.env.STRIPE_PRODUCT_STARTER_MONTHLY!,
        priceId: process.env.STRIPE_PRICE_STARTER_MONTHLY!,
        name: 'Starter (Monthly)',
        amount: 9,
        interval: 'month' as const,
    },
    starter_yearly: {
        productId: process.env.STRIPE_PRODUCT_STARTER_YEARLY!,
        priceId: process.env.STRIPE_PRICE_STARTER_YEARLY!,
        name: 'Starter (Yearly)',
        amount: 108,
        interval: 'year' as const,
    },
    pro_monthly: {
        productId: process.env.STRIPE_PRODUCT_PRO_MONTHLY!,
        priceId: process.env.STRIPE_PRICE_PRO_MONTHLY!,
        name: 'Pro (Monthly)',
        amount: 29,
        interval: 'month' as const,
    },
    pro_yearly: {
        productId: process.env.STRIPE_PRODUCT_PRO_YEARLY!,
        priceId: process.env.STRIPE_PRICE_PRO_YEARLY!,
        name: 'Pro (Yearly)',
        amount: 348,
        interval: 'year' as const,
    },
    lifetime: {
        productId: process.env.STRIPE_PRODUCT_LIFETIME!,
        priceId: process.env.STRIPE_PRICE_LIFETIME!,
        name: 'Lifetime',
        amount: 999,
        interval: null, // One-time payment
    },
} as const;

export type PlanKey = keyof typeof STRIPE_PRODUCTS;

export function getPlanConfig(planKey: string) {
    return STRIPE_PRODUCTS[planKey as PlanKey];
}

export function isSubscriptionPlan(planKey: string): boolean {
    return planKey !== 'lifetime';
}
