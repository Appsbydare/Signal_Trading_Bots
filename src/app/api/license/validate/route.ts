import { NextRequest, NextResponse } from "next/server";

import { licenseConfig } from "@/src/lib/license-config";
import {
  createSession,
  getActiveSessionForLicense,
  getLicenseByKey,
  refreshSession,
} from "@/src/lib/license-db";
import { ensureHttps, verifyRequestSignature } from "@/src/lib/license-security";

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

  const { licenseKey, deviceId } = payload as {
    licenseKey?: string;
    deviceId?: string;
    appVersion?: string;
  };

  if (!licenseKey || !deviceId) {
    return jsonError(400, "Missing licenseKey or deviceId", "INVALID_REQUEST");
  }

  const license = await getLicenseByKey(licenseKey);
  if (!license || license.status !== "active") {
    return jsonError(200, "Invalid license key", "INVALID_LICENSE");
  }

  const now = new Date();
  const expiresAt = new Date(license.expires_at);
  if (expiresAt.getTime() <= now.getTime()) {
    return jsonError(200, "License has expired", "LICENSE_EXPIRED");
  }

  let session = await getActiveSessionForLicense(license.license_key);
  const nowIso = now.toISOString();

  if (!session) {
    // No active session -> create one
    const sessionId = `SESSION-${crypto.randomUUID()}`;
    session = await createSession({
      licenseKey: license.license_key,
      deviceId,
      sessionId,
    });
  } else {
    const lastSeen = new Date(session.last_seen_at);
    const ageSeconds = (now.getTime() - lastSeen.getTime()) / 1000;
    const expired = ageSeconds > licenseConfig.heartbeatGraceSeconds;

    if (session.device_id === deviceId) {
      // Same device -> refresh
      await refreshSession(session.session_id);
    } else if (expired) {
      // Different device but old session -> deactivate old and create new
      // Mark existing inactive and create new record
      await import("@/src/lib/license-db").then(async ({ deactivateSession }) => {
        await deactivateSession(session!.session_id);
      });
      const sessionId = `SESSION-${crypto.randomUUID()}`;
      session = await createSession({
        licenseKey: license.license_key,
        deviceId,
        sessionId,
      });
    } else {
      // Active session on another device
      return jsonError(200, "License is already active on another device", "LICENSE_IN_USE", {
        activeDeviceId: session.device_id,
        lastSeenAt: session.last_seen_at,
      });
    }
  }

  const daysRemaining = Math.max(
    0,
    Math.ceil((expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)),
  );

  return NextResponse.json({
    success: true,
    message: "License validated successfully",
    data: {
      licenseKey: license.license_key,
      sessionId: session.session_id,
      deviceId: session.device_id,
      status: license.status,
      plan: license.plan,
      expiresAt: license.expires_at,
      daysRemaining,
      email: license.email,
      createdAt: license.created_at,
      lastSeenAt: session.last_seen_at ?? nowIso,
    },
  });
}


