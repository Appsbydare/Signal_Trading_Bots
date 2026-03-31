import { NextRequest, NextResponse } from "next/server";

import { getLicenseByKey, getSessionById, logValidation, refreshSession } from "@/lib/license-db";
import { ensureHttps, signResponseBody, verifyRequestSignatureForProduct } from "@/lib/license-security";

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
  const deviceId = String(payload.deviceId ?? "").trim();
  const sessionSerial = typeof payload.sessionSerial === "string" ? payload.sessionSerial : undefined;

  if (!licenseKey || !sessionId || !deviceId) {
    return jsonError(400, "Missing licenseKey, sessionId, or deviceId", "INVALID_REQUEST");
  }

  if (!licenseKey.toUpperCase().startsWith("ORB")) {
    return jsonError(200, "Invalid ORB license key", "INVALID_LICENSE");
  }

  const { isDeviceBanned } = await import("@/lib/license-db");
  const banStatus = await isDeviceBanned(deviceId);
  if (banStatus.banned) {
    return jsonError(200, "Device is banned", "DEVICE_BANNED", { reason: banStatus.reason });
  }

  const session = await getSessionById(sessionId);
  if (
    !session ||
    session.license_key !== licenseKey ||
    session.device_id !== deviceId ||
    session.product_id !== PRODUCT_ID
  ) {
    await logValidation({
      productId: PRODUCT_ID,
      licenseKey,
      deviceId,
      eventType: "heartbeat_failed",
      success: false,
      errorCode: "INVALID_SESSION",
    });
    return jsonError(200, "Invalid session", "INVALID_SESSION");
  }

  const now = new Date();
  const ageSeconds = (now.getTime() - new Date(session.last_seen_at).getTime()) / 1000;
  const heartbeatGraceSeconds = Number(process.env.LICENSE_HEARTBEAT_GRACE_SECONDS ?? "300");
  const expired = !session.active || ageSeconds > heartbeatGraceSeconds;

  if (expired) {
    await import("@/lib/license-db").then(async ({ deactivateSession }) => {
      await deactivateSession(sessionId, false);
    });

    await logValidation({
      productId: PRODUCT_ID,
      licenseKey,
      deviceId,
      eventType: "heartbeat_failed",
      success: false,
      errorCode: "SESSION_EXPIRED",
    });

    return jsonError(200, "Session has expired", "SESSION_EXPIRED");
  }

  await refreshSession(sessionId, sessionSerial);

  const license = await getLicenseByKey(licenseKey, PRODUCT_ID);

  let loginRequest = null;
  if (license) {
    const requestData = await import("@/lib/license-db").then(async ({ getLoginRequest }) => {
      return await getLoginRequest(licenseKey);
    });

    if (requestData) {
      const reqTime = new Date(requestData.timestamp);
      const diffMs = now.getTime() - reqTime.getTime();
      const fiveMinutesMs = 5 * 60 * 1000;

      if (diffMs < fiveMinutesMs) {
        loginRequest = {
          action: "request_login_approval",
          deviceName: requestData.deviceName,
          deviceId: requestData.deviceId,
        };
      }
    }
  }

  const rawPlan = (license?.plan ?? "").toLowerCase();
  const normalizedPlan: "basic" | "pro" =
    rawPlan === "pro_yearly" || rawPlan === "pro" || rawPlan === "lifetime"
      ? "pro"
      : "basic";

  const responseData = {
    lastSeenAt: new Date().toISOString(),
    sessionActive: true,
    graceAllowed: (license as unknown as { grace_period_allowed?: boolean })?.grace_period_allowed ?? true,
    plan: normalizedPlan,
    loginRequest,
    channelName: `license:${licenseKey}`,
    productId: PRODUCT_ID,
  };

  return NextResponse.json({
    success: true,
    message: "Heartbeat received",
    data: {
      ...responseData,
      _sig: signResponseBody(responseData),
    },
  });
}
