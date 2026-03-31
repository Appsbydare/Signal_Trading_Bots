import "server-only";

import crypto from "crypto";
import type { NextRequest } from "next/server";

import { getLicenseConfigForProduct } from "./license-config";
import type { LicenseProductId } from "./license-products";

export interface SecurityCheckResult {
  ok: boolean;
  message: string;
}

export function verifyRequestSignature(payload: Record<string, unknown>): SecurityCheckResult {
  return verifyRequestSignatureForProduct(payload, "SIGNAL_TRADING_BOTS");
}

export function verifyRequestSignatureForProduct(
  payload: Record<string, unknown>,
  productId: LicenseProductId,
): SecurityCheckResult {
  const productConfig = getLicenseConfigForProduct(productId);
  const timestamp = payload.timestamp as string | undefined;
  const apiKey = payload.apiKey as string | undefined;
  const signature = payload.signature as string | undefined;

  if (!apiKey || apiKey !== productConfig.apiKeyPublic) {
    return { ok: false, message: "Invalid API key" };
  }

  if (!timestamp) {
    return { ok: false, message: "Missing timestamp" };
  }

  if (!signature) {
    return { ok: false, message: "Missing signature" };
  }

  // Timestamp window check (±5 minutes, configurable)
  try {
    const requestTime = new Date(timestamp);
    if (Number.isNaN(requestTime.getTime())) {
      return { ok: false, message: "Invalid timestamp format" };
    }

    const now = new Date();
    const ageSeconds = Math.abs(now.getTime() - requestTime.getTime()) / 1000;
    if (ageSeconds > productConfig.heartbeatGraceSeconds) {
      return { ok: false, message: "Request timestamp expired" };
    }
  } catch {
    return { ok: false, message: "Invalid timestamp format" };
  }

  // Build canonical business payload: all fields except security ones, sorted by key.
  const businessEntries = Object.entries(payload).filter(
    ([key]) => key !== "signature" && key !== "timestamp" && key !== "apiKey",
  );

  const sortedBusiness = Object.fromEntries(
    businessEntries.sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0)),
  );

  const sortedJson = JSON.stringify(sortedBusiness);
  const message = `${timestamp}${sortedJson}`;

  const expected = crypto
    .createHmac("sha256", productConfig.apiSecret)
    .update(message, "utf8")
    .digest("hex");

  if (process.env.NODE_ENV !== 'production') {
    console.log('[Validate] Signature Debug:', {
      timestamp,
      sortedJson,
      expected: expected.substring(0, 8) + '...',
      received: signature.substring(0, 8) + '...',
    });
  }

  const valid = crypto.timingSafeEqual(
    Buffer.from(expected, "utf8"),
    Buffer.from(signature, "utf8"),
  );

  if (!valid) {
    return { ok: false, message: "Invalid signature" };
  }

  return { ok: true, message: "OK" };
}

/**
 * Signs the response data body so the desktop app can verify it wasn't
 * tampered with or injected by a MITM proxy.
 *
 * Uses a SEPARATE secret (APP_RESPONSE_SECRET) from the request signing
 * secret so that extracting one doesn't compromise both directions.
 */
export function signResponseBody(data: Record<string, unknown>): string {
  const secret = process.env.APP_RESPONSE_SECRET;
  if (!secret) {
    // Secret not yet configured in this environment — return empty string.
    // The desktop app will reject the response as untrusted, which is the
    // safe fallback. Add APP_RESPONSE_SECRET to Vercel env vars to enable.
    return "";
  }
  const canonical = JSON.stringify(data, Object.keys(data).sort());
  return crypto
    .createHmac("sha256", secret)
    .update(canonical, "utf8")
    .digest("hex");
}

export function ensureHttps(request: NextRequest): SecurityCheckResult {
  const proto = request.headers.get("x-forwarded-proto") || request.nextUrl.protocol.replace(":", "");
  const host = request.headers.get("host") || "";

  // Allow HTTP for localhost/127.0.0.1 (development)
  if (host.includes("localhost") || host.includes("127.0.0.1")) {
    return { ok: true, message: "OK (localhost development)" };
  }

  if (proto !== "https") {
    return { ok: false, message: "HTTPS is required" };
  }
  return { ok: true, message: "OK" };
}


