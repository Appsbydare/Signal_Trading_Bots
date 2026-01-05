import { NextRequest, NextResponse } from "next/server";

import { licenseConfig } from "@/lib/license-config";
import {
  createSession,
  getActiveSessionForLicense,
  getLicenseByKey,
  refreshSession,
  logValidation,
  broadcastLicenseEvent,
} from "@/lib/license-db";
import { ensureHttps, verifyRequestSignature } from "@/lib/license-security";
import { getSupabaseClient } from "@/lib/supabase-storage";
import { sendNewDeviceEmail, sendDuplicateDetectedEmail } from "@/lib/email";

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
  console.log('[Validate] HTTPS check result:', httpsOk);
  if (!httpsOk.ok) {
    console.log('[Validate] HTTPS check FAILED:', httpsOk.message);
    return jsonError(401, `Security verification failed: ${httpsOk.message}`, "SECURITY_ERROR");
  }

  let payload: any;
  try {
    payload = await request.json();
  } catch {
    return jsonError(400, "Invalid JSON body", "INVALID_REQUEST");
  }

  const sec = verifyRequestSignature(payload);
  console.log('[Validate] Signature check result:', sec);
  if (!sec.ok) {
    console.log('[Validate] Signature check FAILED:', sec.message);
    return jsonError(401, `Security verification failed: ${sec.message}`, "SECURITY_ERROR");
  }

  const { licenseKey, deviceId, deviceName, sessionSerial } = payload as {
    licenseKey?: string;
    deviceId?: string;
    deviceName?: string;
    sessionSerial?: string;
    appVersion?: string;
  };

  if (!licenseKey || !deviceId) {
    return jsonError(400, "Missing licenseKey or deviceId", "INVALID_REQUEST");
  }

  // Check if device is banned
  const { isDeviceBanned } = await import("@/lib/license-db");
  const banStatus = await isDeviceBanned(deviceId);
  if (banStatus.banned) {
    return jsonError(200, "Device is banned", "DEVICE_BANNED", {
      reason: banStatus.reason
    });
  }

  const license = await getLicenseByKey(licenseKey);
  if (!license || license.status !== "active") {
    // Log failed validation
    await logValidation({
      licenseKey,
      deviceId,
      deviceName,
      eventType: 'failed',
      success: false,
      errorCode: 'INVALID_LICENSE',
      ipAddress: request.headers.get('x-forwarded-for') ?? undefined,
      userAgent: request.headers.get('user-agent') ?? undefined,
    });
    return jsonError(200, "Invalid license key", "INVALID_LICENSE");
  }

  const now = new Date();
  const expiresAt = new Date(license.expires_at);
  if (expiresAt.getTime() <= now.getTime()) {
    // Log expired license attempt
    await logValidation({
      licenseKey,
      deviceId,
      deviceName,
      eventType: 'failed',
      success: false,
      errorCode: 'LICENSE_EXPIRED',
      ipAddress: request.headers.get('x-forwarded-for') ?? undefined,
      userAgent: request.headers.get('user-agent') ?? undefined,
    });
    return jsonError(200, "License has expired", "LICENSE_EXPIRED");
  }

  let session = await getActiveSessionForLicense(license.license_key);
  const nowIso = now.toISOString();
  let isNewDevice = false; // Track if this is actually a new device activation

  if (!session) {
    // No active session -> create one
    console.log(`[Validate] Creating NEW session. Reason: No active session found for license. Device: ${deviceName}`);

    // Check if this device has been seen before in history to decide if it's "New"
    const { getSessionHistoryForLicense } = await import("@/lib/license-db");
    const history = await getSessionHistoryForLicense(license.license_key, 20); // check last 20 sessions?
    const deviceSeenBefore = history.some(s => s.device_id === deviceId);

    console.log(`[Validate] Device ${deviceId} seen before: ${deviceSeenBefore}`);

    const sessionId = `SESSION-${crypto.randomUUID()}`;
    session = await createSession({
      licenseKey: license.license_key,
      deviceId,
      deviceName: deviceName || "Unknown Device",
      sessionId,
      sessionSerial,
    });

    isNewDevice = !deviceSeenBefore; // Mark as new ONLY if not seen before
  } else {
    const lastSeen = new Date(session.last_seen_at);
    const ageSeconds = (now.getTime() - lastSeen.getTime()) / 1000;
    const expired = ageSeconds > licenseConfig.heartbeatGraceSeconds;

    if (session.device_id === deviceId) {
      // Same device -> refresh and update serial (sessionSerial changes for security each session)
      // This is NOT a new device, just a session refresh
      console.log(`[Validate] Same device refreshing session. Device: ${deviceId}`);
      await refreshSession(session.session_id, sessionSerial, deviceName);
      isNewDevice = false; // Same device, not new
    } else if (expired) {
      // Session expired
      // If it's the SAME device, it's not a "new device" activation, just a session refresh after expiry
      const sameDevice = session.device_id === deviceId;

      console.log(`[Validate] Replacing EXPIRED session. Old Device: ${session.device_id}, New Device: ${deviceId}. Same Device: ${sameDevice}`);

      // Mark existing inactive and create new record
      await import("@/lib/license-db").then(async ({ deactivateSession }) => {
        await deactivateSession(session!.session_id);
      });

      const sessionId = `SESSION-${crypto.randomUUID()}`;
      session = await createSession({
        licenseKey: license.license_key,
        deviceId,
        deviceName: deviceName || "Unknown Device",
        sessionId,
        sessionSerial,
      });

      // Only trigger "New Device" email if the device ID actually changed
      isNewDevice = !sameDevice;
    } else {
      // Active session on another device - DUPLICATE DETECTED

      // Check if this is a login request
      if (payload.action === 'request_login') {
        const deviceName = payload.deviceName || 'Unknown Device';
        await import("@/lib/license-db").then(async ({ setLoginRequest }) => {
          await setLoginRequest({
            licenseKey: license.license_key,
            deviceId,
            deviceName,
          });
        });

        return jsonError(200, "Login request sent to the active device. Please wait for approval.", "LOGIN_REQUESTED", {
          wait: true,
        });
      }

      const supabase = getSupabaseClient();

      // Mark this license as having duplicate usage
      await supabase
        .from("licenses")
        .update({
          duplicate_detected: true,
          grace_period_allowed: false
        })
        .eq("license_key", license.license_key);

      // Log the duplicate attempt
      await logValidation({
        licenseKey,
        deviceId,
        deviceName: payload.deviceName, // Log incoming device name if available
        eventType: 'duplicate_detected',
        success: false,
        errorCode: 'LICENSE_IN_USE',
        ipAddress: request.headers.get('x-forwarded-for') ?? undefined,
        userAgent: request.headers.get('user-agent') ?? undefined,
        details: {
          incoming_device: {
            device_id: deviceId,
            device_name: payload.deviceName,
            ip: request.headers.get('x-forwarded-for'),
          },
          active_session: {
            device_id: session.device_id,
            device_name: session.device_name,
            session_id: session.session_id,
            last_seen_at: session.last_seen_at,
          }
        }
      });

      // Mark license as having a duplicate detected
      await supabase.from("licenses").update({ duplicate_detected: true }).eq("license_key", licenseKey);

      // Broadcast login attempt to active device so they can be prompted
      // This ensures the active user knows someone is trying to connect
      try {
        await broadcastLicenseEvent(license.license_key, 'login_request', {
          deviceId,
          deviceName: payload.deviceName || "Unknown Device",
          timestamp: new Date().toISOString()
        });
      } catch (e) {
        console.error("Failed to broadcast duplicate login attempt:", e);
      }

      // Send duplicate detection email
      try {
        await sendDuplicateDetectedEmail({
          to: license.email,
          licenseKey,
          deviceName1: session.device_name || session.device_id.substring(0, 8),
          deviceName2: payload.deviceName || deviceId.substring(0, 8),
        });
      } catch (emailError) {
        console.error("Failed to send duplicate detection email:", emailError);
      }

      // Active session on another device
      return jsonError(200, "License is already active on another device", "LICENSE_IN_USE", {
        activeDeviceId: session.device_id,
        activeDeviceName: session.device_name, // Return device name for UI display
        lastSeenAt: session.last_seen_at,
        graceAllowed: false,  // Tell app not to grant grace period
      });
    }
  }

  // Send new device activation email ONLY if it's actually a new device
  if (isNewDevice) {
    try {
      await sendNewDeviceEmail({
        to: license.email,
        licenseKey: license.license_key,
        deviceName: deviceId.substring(0, 16), // Partial device ID for privacy
        activatedAt: nowIso,
      });
    } catch (emailError) {
      console.error("Failed to send new device email:", emailError);
      // Don't fail the request if email fails
    }
  }

  const daysRemaining = Math.max(
    0,
    Math.ceil((expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)),
  );

  // Log successful validation
  await logValidation({
    licenseKey,
    deviceId,
    eventType: 'validation',
    success: true,
    ipAddress: request.headers.get('x-forwarded-for') ?? undefined,
    userAgent: request.headers.get('user-agent') ?? undefined,
  });

  // Clean up old inactive sessions to prevent database bloat
  const { cleanupOldSessions } = await import("@/lib/license-db");
  await cleanupOldSessions(license.license_key);

  // Debug logging for Supabase credentials
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const channelName = `license:${license.license_key}`;

  console.log('[Validate] Supabase URL:', supabaseUrl);
  console.log('[Validate] Supabase Key exists:', !!supabaseKey);
  console.log('[Validate] Channel Name:', channelName);

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
      graceAllowed: (license as any).grace_period_allowed ?? true,
      supabaseUrl,
      supabaseKey,
      channelName
    },
  });
}



