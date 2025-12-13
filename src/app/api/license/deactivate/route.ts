import { NextRequest, NextResponse } from "next/server";

import { deactivateSession, getSessionById, logValidation } from "@/lib/license-db";
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

  const { licenseKey, sessionId } = payload as { licenseKey?: string; sessionId?: string };
  if (!licenseKey || !sessionId) {
    return jsonError(400, "Missing licenseKey or sessionId", "INVALID_REQUEST");
  }

  const session = await getSessionById(sessionId);
  if (!session || session.license_key !== licenseKey) {
    return jsonError(200, "Session not found or already inactive", "SESSION_NOT_FOUND");
  }

  if (!session.active) {
    return jsonError(200, "Session not found or already inactive", "SESSION_NOT_FOUND");
  }

  await deactivateSession(sessionId);

  // Log deactivation
  await logValidation({
    licenseKey,
    deviceId: session.device_id,
    eventType: 'deactivation',
    success: true,
  });

  return NextResponse.json({
    success: true,
    message: "Session deactivated successfully",
  });
}


