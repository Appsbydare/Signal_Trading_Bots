import crypto from "crypto";
import { NextRequest, NextResponse } from "next/server";

import {
  broadcastLicenseEvent,
  createSession,
  getActiveSessionForLicense,
  getLicenseByKey,
  getSessionHistoryForLicense,
  logValidation,
  refreshSession,
} from "@/lib/license-db";
import { ensureHttps, signResponseBody, verifyRequestSignatureForProduct } from "@/lib/license-security";
import { getSupabaseClient } from "@/lib/supabase-storage";
import { sendDuplicateDetectedEmail, sendNewDeviceEmail } from "@/lib/email";

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
  const deviceId = String(payload.deviceId ?? "").trim();
  const deviceName = typeof payload.deviceName === "string" ? payload.deviceName : undefined;
  const sessionSerial = typeof payload.sessionSerial === "string" ? payload.sessionSerial : undefined;
  const action = typeof payload.action === "string" ? payload.action : undefined;

  if (!licenseKey || !deviceId) {
    return jsonError(400, "Missing licenseKey or deviceId", "INVALID_REQUEST");
  }

  if (!licenseKey.toUpperCase().startsWith("ORB")) {
    return jsonError(200, "Invalid ORB license key", "INVALID_LICENSE");
  }

  const { isDeviceBanned } = await import("@/lib/license-db");
  const banStatus = await isDeviceBanned(deviceId);
  if (banStatus.banned) {
    return jsonError(200, "Device is banned", "DEVICE_BANNED", { reason: banStatus.reason });
  }

  const license = await getLicenseByKey(licenseKey, PRODUCT_ID);
  if (!license || license.status !== "active") {
    await logValidation({
      productId: PRODUCT_ID,
      licenseKey,
      deviceId,
      deviceName,
      eventType: "failed",
      success: false,
      errorCode: "INVALID_LICENSE",
      ipAddress: request.headers.get("x-forwarded-for") ?? undefined,
      userAgent: request.headers.get("user-agent") ?? undefined,
    });
    return jsonError(200, "Invalid license key", "INVALID_LICENSE");
  }

  const now = new Date();
  const expiresAt = new Date(license.expires_at);
  if (expiresAt.getTime() <= now.getTime()) {
    await logValidation({
      productId: PRODUCT_ID,
      licenseKey,
      deviceId,
      deviceName,
      eventType: "failed",
      success: false,
      errorCode: "LICENSE_EXPIRED",
      ipAddress: request.headers.get("x-forwarded-for") ?? undefined,
      userAgent: request.headers.get("user-agent") ?? undefined,
    });
    return jsonError(200, "License has expired", "LICENSE_EXPIRED");
  }

  let session = await getActiveSessionForLicense(license.license_key, PRODUCT_ID);
  let isNewDevice = false;

  if (!session) {
    const history = await getSessionHistoryForLicense(license.license_key, 20, PRODUCT_ID);
    const deviceSeenBefore = history.some((s) => s.device_id === deviceId);

    const sessionId = `SESSION-${crypto.randomUUID()}`;
    session = await createSession({
      productId: PRODUCT_ID,
      licenseKey: license.license_key,
      deviceId,
      deviceName: deviceName || "Unknown Device",
      sessionId,
      sessionSerial,
    });

    isNewDevice = !deviceSeenBefore;
  } else {
    const nowMs = now.getTime();
    const ageSeconds = (nowMs - new Date(session.last_seen_at).getTime()) / 1000;
    const heartbeatGraceSeconds = Number(process.env.LICENSE_HEARTBEAT_GRACE_SECONDS ?? "300");
    const expired = ageSeconds > heartbeatGraceSeconds;

    if (session.device_id === deviceId) {
      await refreshSession(session.session_id, sessionSerial, deviceName);
      isNewDevice = false;
    } else if (expired) {
      const sameDevice = session.device_id === deviceId;
      await import("@/lib/license-db").then(async ({ deactivateSession }) => {
        await deactivateSession(session!.session_id, false);
      });

      const sessionId = `SESSION-${crypto.randomUUID()}`;
      session = await createSession({
        productId: PRODUCT_ID,
        licenseKey: license.license_key,
        deviceId,
        deviceName: deviceName || "Unknown Device",
        sessionId,
        sessionSerial,
      });
      isNewDevice = !sameDevice;
    } else {
      if (action === "request_login") {
        await import("@/lib/license-db").then(async ({ setLoginRequest }) => {
          await setLoginRequest({
            licenseKey: license.license_key,
            deviceId,
            deviceName: deviceName || "Unknown Device",
          });
        });

        return jsonError(
          200,
          "Login request sent to the active device. Please wait for approval.",
          "LOGIN_REQUESTED",
          { wait: true },
        );
      }

      const supabase = getSupabaseClient();
      await supabase
        .from("licenses")
        .update({
          duplicate_detected: true,
          grace_period_allowed: false,
        })
        .eq("license_key", license.license_key)
        .eq("product_id", PRODUCT_ID);

      await logValidation({
        productId: PRODUCT_ID,
        licenseKey,
        deviceId,
        deviceName,
        eventType: "duplicate_detected",
        success: false,
        errorCode: "LICENSE_IN_USE",
        ipAddress: request.headers.get("x-forwarded-for") ?? undefined,
        userAgent: request.headers.get("user-agent") ?? undefined,
      });

      try {
        await broadcastLicenseEvent(license.license_key, "login_request", {
          deviceId,
          deviceName: deviceName || "Unknown Device",
          timestamp: new Date().toISOString(),
        });
      } catch (e) {
        console.error("Failed to broadcast duplicate login attempt:", e);
      }

      try {
        await sendDuplicateDetectedEmail({
          to: license.email,
          licenseKey,
          deviceName1: session.device_name || session.device_id.substring(0, 8),
          deviceName2: deviceName || deviceId.substring(0, 8),
        });
      } catch (emailError) {
        console.error("Failed to send duplicate detection email:", emailError);
      }

      return jsonError(200, "License is already active on another device", "LICENSE_IN_USE", {
        activeDeviceId: session.device_id,
        activeDeviceName: session.device_name,
        lastSeenAt: session.last_seen_at,
        graceAllowed: false,
      });
    }
  }

  if (isNewDevice) {
    try {
      await sendNewDeviceEmail({
        to: license.email,
        licenseKey: license.license_key,
        deviceName: deviceId.substring(0, 16),
        activatedAt: now.toISOString(),
      });
    } catch (emailError) {
      console.error("Failed to send new device email:", emailError);
    }
  }

  const daysRemaining = Math.max(
    0,
    Math.ceil((expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)),
  );

  const rawPlan = (license.plan ?? "").toLowerCase();
  const normalizedPlan: "basic" | "pro" =
    rawPlan === "pro_yearly" || rawPlan === "pro" || rawPlan === "lifetime"
      ? "pro"
      : "basic";

  await logValidation({
    productId: PRODUCT_ID,
    licenseKey,
    deviceId,
    deviceName,
    eventType: "validation",
    success: true,
    ipAddress: request.headers.get("x-forwarded-for") ?? undefined,
    userAgent: request.headers.get("user-agent") ?? undefined,
  });

  const { cleanupOldSessions } = await import("@/lib/license-db");
  await cleanupOldSessions(license.license_key);

  const responseData = {
    licenseKey: license.license_key,
    sessionId: session.session_id,
    deviceId: session.device_id,
    status: license.status,
    plan: normalizedPlan,
    rawPlan: license.plan,
    expiresAt: license.expires_at,
    daysRemaining,
    email: license.email,
    createdAt: license.created_at,
    lastSeenAt: session.last_seen_at ?? now.toISOString(),
    graceAllowed: (license as unknown as { grace_period_allowed?: boolean }).grace_period_allowed ?? true,
    channelName: `license:${license.license_key}`,
    productId: PRODUCT_ID,
  };

  return NextResponse.json({
    success: true,
    message: "License validated successfully",
    data: {
      ...responseData,
      _sig: signResponseBody(responseData),
    },
  });
}
