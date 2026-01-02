import { NextRequest, NextResponse } from "next/server";

import { licenseConfig } from "@/lib/license-config";
import { getSessionById, refreshSession, getLicenseByKey, logValidation } from "@/lib/license-db";
import { ensureHttps, verifyRequestSignature } from "@/lib/license-security";

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

  let payload: any;
  try {
    payload = await request.json();
  } catch {
    return jsonError(400, "Invalid JSON body", "INVALID_REQUEST");
  }

  const sec = verifyRequestSignature(payload);
  if (!sec.ok) {
    return jsonError(401, `Security verification failed: ${sec.message}`, "SECURITY_ERROR");
  }

  const { licenseKey, sessionId, deviceId, sessionSerial } = payload as {
    licenseKey?: string;
    sessionId?: string;
    deviceId?: string;
    sessionSerial?: string;
  };

  if (!licenseKey || !sessionId || !deviceId) {
    return jsonError(400, "Missing licenseKey, sessionId, or deviceId", "INVALID_REQUEST");
  }

  const session = await getSessionById(sessionId);
  if (!session || session.license_key !== licenseKey || session.device_id !== deviceId) {
    // Log failed heartbeat
    await logValidation({
      licenseKey: licenseKey ?? '',
      deviceId,
      eventType: 'heartbeat_failed',
      success: false,
      errorCode: 'INVALID_SESSION',
    });
    return jsonError(200, "Invalid session", "INVALID_SESSION");
  }

  // Check session serial if provided and stored
  if (sessionSerial && session.session_serial && session.session_serial !== sessionSerial) {
    return jsonError(200, "Session invalid - duplicate instance detected", "SESSION_CONFLICT");
  }

  const now = new Date();
  const lastSeen = new Date(session.last_seen_at);
  const ageSeconds = (now.getTime() - lastSeen.getTime()) / 1000;
  const expired = !session.active || ageSeconds > licenseConfig.heartbeatGraceSeconds;

  if (expired) {
    // Mark as inactive and signal expiration
    await import("@/lib/license-db").then(async ({ deactivateSession }) => {
      await deactivateSession(sessionId);
    });

    // Log session expiration
    await logValidation({
      licenseKey,
      deviceId,
      eventType: 'heartbeat_failed',
      success: false,
      errorCode: 'SESSION_EXPIRED',
    });

    return jsonError(200, "Session has expired", "SESSION_EXPIRED");
  }

  await refreshSession(sessionId);

  // Get license to check grace_period_allowed status
  const license = await getLicenseByKey(licenseKey);

  // Check for pending login requests
  let loginRequest = null;
  if (license) {
    const request = await import("@/lib/license-db").then(async ({ getLoginRequest }) => {
      return await getLoginRequest(licenseKey);
    });

    if (request) {
      // Check if request is recent (within 5 minutes)
      const reqTime = new Date(request.timestamp);
      const nowTime = new Date();
      const diffMs = nowTime.getTime() - reqTime.getTime();
      const fiveMinutesMs = 5 * 60 * 1000;

      if (diffMs < fiveMinutesMs) {
        loginRequest = {
          action: "request_login_approval",
          deviceName: request.deviceName,
          deviceId: request.deviceId
        };
      }
    }
  }

  return NextResponse.json({
    success: true,
    message: "Heartbeat received",
    data: {
      lastSeenAt: new Date().toISOString(),
      sessionActive: true,
      graceAllowed: (license as any)?.grace_period_allowed ?? true,  // Include grace status
      loginRequest, // Include login request if any
    },
  });
}


