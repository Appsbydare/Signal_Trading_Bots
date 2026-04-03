/**
 * Marketing list price (strikethrough) vs current sale price.
 * Sale amounts must match Stripe Price unit_amount (cents) / 100.
 */

export const PLAN_LIST_USD = {
  starter_yearly: 98,
  pro_yearly: 188,
  lifetime: 299,
  orb_lifetime: 149,
  starter: 98,
  pro: 188,
} as const;

export const PLAN_SALE_USD = {
  starter_yearly: 59,
  pro_yearly: 79,
  lifetime: 129,
  orb_lifetime: 99,
  starter: 9,
  pro: 29,
} as const;

export type PlanPricingKey = keyof typeof PLAN_SALE_USD;

/** Rounded discount vs list price, for labels like "40% OFF". */
export function discountPercentOff(listUsd: number, saleUsd: number): number {
  if (listUsd <= 0 || saleUsd >= listUsd) return 0;
  return Math.round((1 - saleUsd / listUsd) * 100);
}

export function saleAndListForCheckoutPlan(plan: string): { sale: number; list: number } {
  const p = plan as PlanPricingKey;
  if (p === "orb_lifetime") {
    return { sale: PLAN_SALE_USD.orb_lifetime, list: PLAN_LIST_USD.orb_lifetime };
  }
  if (p === "lifetime") {
    return { sale: PLAN_SALE_USD.lifetime, list: PLAN_LIST_USD.lifetime };
  }
  if (p === "pro_yearly") {
    return { sale: PLAN_SALE_USD.pro_yearly, list: PLAN_LIST_USD.pro_yearly };
  }
  if (p === "pro") {
    const sale = PLAN_SALE_USD.pro;
    return { sale, list: sale };
  }
  if (p === "starter_yearly") {
    return { sale: PLAN_SALE_USD.starter_yearly, list: PLAN_LIST_USD.starter_yearly };
  }
  if (p === "starter") {
    const sale = PLAN_SALE_USD.starter;
    return { sale, list: sale };
  }
  return { sale: PLAN_SALE_USD.starter_yearly, list: PLAN_LIST_USD.starter_yearly };
}

/** Server-side crypto order amounts (full yearly / lifetime; monthly unchanged). */
export const CRYPTO_ORDER_BASE_USD: Record<string, number> = {
  lifetime: PLAN_SALE_USD.lifetime,
  orb_lifetime: PLAN_SALE_USD.orb_lifetime,
  pro_yearly: PLAN_SALE_USD.pro_yearly,
  starter_yearly: PLAN_SALE_USD.starter_yearly,
  pro: PLAN_SALE_USD.pro,
  starter: PLAN_SALE_USD.starter,
};
