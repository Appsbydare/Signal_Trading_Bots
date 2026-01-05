import "server-only";

import crypto from "crypto";
import type { NextRequest } from "next/server";

import { licenseConfig } from "./license-config";

export interface SecurityCheckResult {
  ok: boolean;
  message: string;
}

export function verifyRequestSignature(payload: Record<string, unknown>): SecurityCheckResult {
  const timestamp = payload.timestamp as string | undefined;
  const apiKey = payload.apiKey as string | undefined;
  const signature = payload.signature as string | undefined;

  if (!apiKey || apiKey !== licenseConfig.apiKeyPublic) {
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
    if (ageSeconds > licenseConfig.heartbeatGraceSeconds) {
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
    .createHmac("sha256", licenseConfig.apiSecret)
    .update(message, "utf8")
    .digest("hex");

  const valid = crypto.timingSafeEqual(
    Buffer.from(expected, "utf8"),
    Buffer.from(signature, "utf8"),
  );

  if (!valid) {
    return { ok: false, message: "Invalid signature" };
  }

  return { ok: true, message: "OK" };
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


