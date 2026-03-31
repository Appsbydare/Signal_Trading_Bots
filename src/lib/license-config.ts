import "server-only";
import { getProduct, type LicenseProductId } from "./license-products";

// Centralised configuration for the licensing backend.
// All secrets must be provided via environment variables at deploy/runtime.

const stbProduct = getProduct("SIGNAL_TRADING_BOTS");

// Heartbeat / session settings (in seconds)
const HEARTBEAT_INTERVAL_SECONDS = Number(
  process.env.LICENSE_HEARTBEAT_INTERVAL_SECONDS ?? "300",
);
const HEARTBEAT_GRACE_SECONDS = Number(
  process.env.LICENSE_HEARTBEAT_GRACE_SECONDS ?? "300",
);

export const licenseConfig = {
  apiSecret: stbProduct.security.apiSecret,
  apiKeyPublic: stbProduct.security.apiKeyPublic,
  heartbeatIntervalSeconds: HEARTBEAT_INTERVAL_SECONDS,
  heartbeatGraceSeconds: HEARTBEAT_GRACE_SECONDS,
};

export function getLicenseConfigForProduct(productId: LicenseProductId) {
  const product = getProduct(productId);
  return {
    ...licenseConfig,
    apiSecret: product.security.apiSecret,
    apiKeyPublic: product.security.apiKeyPublic,
  };
}


