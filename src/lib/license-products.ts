import "server-only";

import { resolveLicenseProductId } from "@/lib/license-product-resolve";

export type LicenseProductId = "SIGNAL_TRADING_BOTS" | "ORB_BOT";

interface ProductSecurityConfig {
  apiSecret: string;
  apiKeyPublic: string;
}

interface ProductDefinition {
  id: LicenseProductId;
  keyPrefix: string;
  security: ProductSecurityConfig;
}

function readRequiredSecret(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`${name} is not configured. Set ${name} in the environment.`);
  }
  return value;
}

const stbSecret = readRequiredSecret("API_SECRET");

const products: Record<LicenseProductId, ProductDefinition> = {
  SIGNAL_TRADING_BOTS: {
    id: "SIGNAL_TRADING_BOTS",
    keyPrefix: "STB",
    security: {
      apiSecret: stbSecret,
      apiKeyPublic: process.env.API_KEY_PUBLIC ?? "DBOT-API-KEY-V8",
    },
  },
  ORB_BOT: {
    id: "ORB_BOT",
    keyPrefix: "ORB",
    security: {
      apiSecret: process.env.API_SECRET_ORB ?? stbSecret,
      apiKeyPublic: process.env.API_KEY_PUBLIC_ORB ?? "ORB-API-KEY-V1",
    },
  },
};

export function getProduct(productId: LicenseProductId): ProductDefinition {
  return products[productId];
}

export function getProductByLicenseKey(licenseKey: string): LicenseProductId {
  if (licenseKey.toUpperCase().startsWith("ORB")) {
    return "ORB_BOT";
  }
  return "SIGNAL_TRADING_BOTS";
}

export function normalizeProductId(productId?: string): LicenseProductId {
  return productId === "ORB_BOT" ? "ORB_BOT" : "SIGNAL_TRADING_BOTS";
}

/** Plan keys such as orb_lifetime / orb_* → ORB; otherwise STB. */
export function licenseProductIdFromPlan(plan: string): LicenseProductId {
  return resolveLicenseProductId({ product_id: null, plan, license_key: "" });
}
