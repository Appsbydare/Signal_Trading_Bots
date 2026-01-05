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

  // Check if device is banned
  const { isDeviceBanned } = await import("@/lib/license-db");
  const banStatus = await isDeviceBanned(deviceId);
  if (banStatus.banned) {
    return jsonError(200, "Device is banned", "DEVICE_BANNED", {
      reason: banStatus.reason
    });
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

  // Refresh session and update session_serial if it has changed
  // Session serial changes on each app restart for security, this is normal behavior
  await refreshSession(sessionId, sessionSerial);

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

        // Log that a login request is being delivered to the active device
        // We only log this once ideally (but heartbeat happens often, maybe track if already logged?)
        // For now logging every heartbeat might be noisy. Let's log it only if it's very fresh (e.g. within 30s)
        if (diffMs < 30 * 1000) {
          await logValidation({
            licenseKey,
            deviceId, // The active device receiving the notification
            deviceName: session.device_name ?? undefined,
            eventType: 'login_requested',
            success: true, // Notification delivered successfully
            details: {
              requesting_device_name: request.deviceName,
              requesting_device_id: request.deviceId,
              request_age_ms: diffMs
            }
          });
        }
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
      supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL,
      supabaseKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      channelName: `license:${licenseKey}`
    },
  });
}


