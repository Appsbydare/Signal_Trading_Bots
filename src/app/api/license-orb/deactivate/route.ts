import { NextRequest, NextResponse } from "next/server";

import { deactivateSession, getSessionById, logValidation } from "@/lib/license-db";
import { ensureHttps, verifyRequestSignatureForProduct } from "@/lib/license-security";

const PRODUCT_ID = "ORB_BOT" as const;

function jsonError(status: number, message: string, errorCode: string, data: unknown = {}) {
  return NextResponse.json(
    {
      success: false,
      message,
      errorCode,
      data,
    },
    { status },
  );
}

export async function POST(request: NextRequest) {
  const httpsOk = ensureHttps(request);
  if (!httpsOk.ok) {
    return jsonError(401, `Security verification failed: ${httpsOk.message}`, "SECURITY_ERROR");
  }

  let payload: Record<string, unknown>;
  try {
    payload = await request.json();
  } catch {
    return jsonError(400, "Invalid JSON body", "INVALID_REQUEST");
  }

  const sec = verifyRequestSignatureForProduct(payload, PRODUCT_ID);
  if (!sec.ok) {
    return jsonError(401, `Security verification failed: ${sec.message}`, "SECURITY_ERROR");
  }

  const licenseKey = String(payload.licenseKey ?? "").trim();
  const sessionId = String(payload.sessionId ?? "").trim();

  if (!licenseKey || !sessionId) {
    return jsonError(400, "Missing licenseKey or sessionId", "INVALID_REQUEST");
  }

  if (!licenseKey.toUpperCase().startsWith("ORB")) {
    return jsonError(200, "Invalid ORB license key", "INVALID_LICENSE");
  }

  const session = await getSessionById(sessionId);
  if (
    !session ||
    session.license_key !== licenseKey ||
    session.product_id !== PRODUCT_ID
  ) {
    return jsonError(200, "Session not found or already inactive", "SESSION_NOT_FOUND");
  }

  if (!session.active) {
    return jsonError(200, "Session not found or already inactive", "SESSION_NOT_FOUND");
  }

  await deactivateSession(sessionId, false);

  await logValidation({
    productId: PRODUCT_ID,
    licenseKey,
    deviceId: session.device_id,
    eventType: "deactivation",
    success: true,
  });

  await import("@/lib/license-db").then(async ({ clearLoginRequest }) => {
    await clearLoginRequest(licenseKey);
  });

  return NextResponse.json({
    success: true,
    message: "Session deactivated successfully",
  });
}
