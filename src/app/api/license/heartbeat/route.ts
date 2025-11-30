import { NextRequest, NextResponse } from "next/server";

import { licenseConfig } from "@/lib/license-config";
import { getSessionById, refreshSession } from "@/lib/license-db";
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

  const { licenseKey, sessionId, deviceId } = payload as {
    licenseKey?: string;
    sessionId?: string;
    deviceId?: string;
  };

  if (!licenseKey || !sessionId || !deviceId) {
    return jsonError(400, "Missing licenseKey, sessionId, or deviceId", "INVALID_REQUEST");
  }

  const session = await getSessionById(sessionId);
  if (!session || session.license_key !== licenseKey || session.device_id !== deviceId) {
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
    return jsonError(200, "Session has expired", "SESSION_EXPIRED");
  }

  await refreshSession(sessionId);

  return NextResponse.json({
    success: true,
    message: "Heartbeat received",
    data: {
      lastSeenAt: new Date().toISOString(),
      sessionActive: true,
    },
  });
}


