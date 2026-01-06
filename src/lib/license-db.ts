import "server-only";

import { getSupabaseClient } from "./supabase-storage";

export type LicenseStatus = "active" | "expired" | "revoked";

// Helper to broadcast events
export async function broadcastLicenseEvent(licenseKey: string, eventType: string, payload: any = {}): Promise<void> {
  const client = getSupabaseClient();
  const channel = client.channel(`license:${licenseKey}`);

  // Serverless environments need to wait for the socket event to actually send
  return new Promise((resolve) => {
    let handled = false;

    // Timeout to prevent hanging
    const timeout = setTimeout(() => {
      if (!handled) {
        console.warn(`[Broadcast] Timeout waiting for subscription to ${licenseKey}`);
        client.removeChannel(channel);
        handled = true;
        resolve();
      }
    }, 4000);

    channel.subscribe(async (status) => {
      if (status === 'SUBSCRIBED') {
        if (handled) return;

        try {
          await channel.send({
            type: 'broadcast',
            event: eventType,
            payload: payload
          });
          console.log(`[Broadcast] Sent '${eventType}' to license:${licenseKey}`);
        } catch (err) {
          console.error(`[Broadcast] Failed to send:`, err);
        } finally {
          clearTimeout(timeout);
          client.removeChannel(channel);
          handled = true;
          resolve();
        }
      } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT' || status === 'CLOSED') {
        if (!handled) {
          console.error(`[Broadcast] Channel status failed: ${status}`);
          clearTimeout(timeout);
          client.removeChannel(channel);
          handled = true;
          resolve();
        }
      }
    });
  });
}


export interface LicenseRow {
  id: number;
  license_key: string;
  email: string;
  plan: string;
  status: LicenseStatus;
  created_at: string;
  expires_at: string;
  payment_id: string | null;
  amount: number | null;
  currency: string | null;
  upgraded_from?: string | null;
}

export interface LicenseSessionRow {
  id: number;
  license_key: string;
  device_id: string;
  session_id: string;
  session_serial: string | null;
  device_name: string | null;
  device_mac: string | null;
  created_at: string;
  last_seen_at: string;
  active: boolean;
}

export async function getLicensesForEmail(email: string): Promise<LicenseRow[]> {
  const client = getSupabaseClient();
  const { data, error } = await client
    .from("licenses")
    .select("*")
    .eq("email", email.toLowerCase())
    .neq("status", "revoked") // Exclude revoked licenses
    .order("created_at", { ascending: false })
    .returns<LicenseRow[]>();

  if (error) {
    throw error;
  }

  return data ?? [];
}

export async function getLicenseByKey(licenseKey: string): Promise<LicenseRow | null> {
  const client = getSupabaseClient();
  const { data, error } = await client
    .from("licenses")
    .select("*")
    .eq("license_key", licenseKey)
    .maybeSingle<LicenseRow>();

  if (error) {
    throw error;
  }

  return data ?? null;
}

export async function getActiveSessionForLicense(licenseKey: string): Promise<LicenseSessionRow | null> {
  const client = getSupabaseClient();
  const { data, error } = await client
    .from("license_sessions")
    .select("*")
    .eq("license_key", licenseKey)
    .eq("active", true)
    .order("last_seen_at", { ascending: false })
    .limit(1)
    .maybeSingle<LicenseSessionRow>();

  if (error) {
    throw error;
  }

  return data ?? null;
}

export async function getSessionById(sessionId: string): Promise<LicenseSessionRow | null> {
  const client = getSupabaseClient();
  const { data, error } = await client
    .from("license_sessions")
    .select("*")
    .eq("session_id", sessionId)
    .maybeSingle<LicenseSessionRow>();

  if (error) {
    throw error;
  }

  return data ?? null;
}

export interface CreateSessionArgs {
  licenseKey: string;
  deviceId: string;
  deviceName?: string;
  deviceMac?: string;
  sessionId: string;
  sessionSerial?: string;
}

export async function createSession(args: CreateSessionArgs): Promise<LicenseSessionRow> {
  const client = getSupabaseClient();
  const { data, error } = await client
    .from("license_sessions")
    .insert({
      license_key: args.licenseKey,
      device_id: args.deviceId,
      session_id: args.sessionId,
      device_name: args.deviceName ?? null,
      device_mac: args.deviceMac ?? null,
      session_serial: args.sessionSerial ?? null,
    })
    .select("*")
    .maybeSingle<LicenseSessionRow>();

  if (error) {
    throw error;
  }
  if (!data) {
    throw new Error("Failed to create license session");
  }

  return data;
}

export async function refreshSession(sessionId: string, sessionSerial?: string, deviceName?: string): Promise<void> {
  const client = getSupabaseClient();
  const gatheredUpdates: any = {
    last_seen_at: new Date().toISOString(),
    active: true
  };

  if (sessionSerial) {
    gatheredUpdates.session_serial = sessionSerial;
  }

  if (deviceName && deviceName !== "Unknown Device") {
    gatheredUpdates.device_name = deviceName;
  }

  const { error } = await client
    .from("license_sessions")
    .update(gatheredUpdates)
    .eq("session_id", sessionId);

  if (error) {
    throw error;
  }
}

export async function deactivateSession(sessionId: string, notify: boolean = true): Promise<void> {
  const client = getSupabaseClient();

  // 1. Get session details FIRST to know license key for broadcast
  let session = null;
  try {
    session = await getSessionById(sessionId);
  } catch (e) {
    console.error("Failed to fetch session for deactivation:", e);
  }

  // 2. Broadcast revocation if valid session found and notify is true
  if (notify && session) {
    try {
      await broadcastLicenseEvent(session.license_key, 'revocation', {
        sessionId: sessionId,
        licenseKey: session.license_key
      });
    } catch (e) {
      console.error("Failed to broadcast revocation:", e);
    }
  }

  // 3. Deactivate session (set active = false)
  // We do NOT delete it, so we can keep history logs of past sessions!
  // Customer portal relies on filtered active=true/false lists.
  const { error } = await client
    .from("license_sessions")
    .update({ active: false })
    .eq("session_id", sessionId);

  if (error) {
    throw error;
  }
}

/**
 * Clean up old inactive sessions for a license.
 * Keeps only the most recent inactive sessions (up to 5) and deletes the rest.
 * This prevents the database from accumulating too many inactive sessions.
 */
export async function cleanupOldSessions(licenseKey: string): Promise<void> {
  const client = getSupabaseClient();
  try {
    // Get all inactive sessions for this license, ordered by last_seen_at descending
    const { data: inactiveSessions } = await client
      .from("license_sessions")
      .select("session_id, last_seen_at")
      .eq("license_key", licenseKey)
      .eq("active", false)
      .order("last_seen_at", { ascending: false });

    if (inactiveSessions && inactiveSessions.length > 5) {
      // Keep the 5 most recent, delete the rest
      const sessionsToDelete = inactiveSessions.slice(5);
      const sessionIdsToDelete = sessionsToDelete.map(s => s.session_id);

      await client
        .from("license_sessions")
        .delete()
        .in("session_id", sessionIdsToDelete);

      console.log(`[CleanupSessions] Deleted ${sessionIdsToDelete.length} old inactive sessions for license ${licenseKey}`);
    }
  } catch (error) {
    console.error("Failed to cleanup old sessions:", error);
    // Don't throw - this is a cleanup operation and shouldn't fail the main request
  }
}

export interface LogValidationArgs {
  licenseKey: string;
  deviceId?: string;
  deviceName?: string;
  eventType: 'validation' | 'duplicate_detected' | 'deactivation' | 'failed' | 'heartbeat_failed' | 'login_requested';
  success: boolean;
  errorCode?: string;
  ipAddress?: string;
  userAgent?: string;
  details?: Record<string, any>;
}

export async function logValidation(args: LogValidationArgs): Promise<void> {
  const client = getSupabaseClient();

  try {
    await client.from("license_validation_log").insert({
      license_key: args.licenseKey,
      device_id: args.deviceId ?? null,
      device_name: args.deviceName ?? null,
      event_type: args.eventType,
      success: args.success,
      error_code: args.errorCode ?? null,
      ip_address: args.ipAddress ?? null,
      user_agent: args.userAgent ?? null,
      details: args.details ?? null,
    });
  } catch (error) {
    // Don't fail request if logging fails
    console.error("Failed to log validation:", error);
  }
}

export interface CreateLicenseArgs {
  licenseKey: string;
  email: string;
  plan: string;
  expiresAt: Date;
  paymentId?: string;
  amount?: number;
  currency?: string;
}

export async function createLicense(args: CreateLicenseArgs): Promise<LicenseRow> {
  const client = getSupabaseClient();
  const { data, error } = await client
    .from("licenses")
    .insert({
      license_key: args.licenseKey,
      email: args.email.toLowerCase(),
      plan: args.plan,
      status: "active",
      expires_at: args.expiresAt.toISOString(),
      payment_id: args.paymentId ?? null,
      amount: args.amount ?? null,
      currency: args.currency ?? "USD",
    })
    .select("*")
    .maybeSingle<LicenseRow>();

  if (error) {
    throw error;
  }
  if (!data) {
    throw new Error("Failed to create license");
  }

  return data;
}

export interface UpgradeLicenseArgs {
  licenseId: number;
  newPlan: string;
  newExpiresAt: Date;
  paymentId: string;
  amount: number;
  oldPlan?: string;
}

export async function upgradeLicense(args: UpgradeLicenseArgs): Promise<void> {
  const client = getSupabaseClient();
  const { error } = await client
    .from("licenses")
    .update({
      plan: args.newPlan,
      expires_at: args.newExpiresAt.toISOString(),
      payment_id: args.paymentId,
      amount: args.amount,
      upgraded_from: args.oldPlan,
    })
    .eq("id", args.licenseId);

  if (error) {
    throw error;
  }
}

export interface SetLoginRequestArgs {
  licenseKey: string;
  deviceId: string;
  deviceName?: string;
}

export async function setLoginRequest(args: SetLoginRequestArgs): Promise<void> {
  const client = getSupabaseClient();
  const { error } = await client
    .from("licenses")
    .update({
      login_request_device_id: args.deviceId,
      login_request_device_name: args.deviceName ?? "Unknown Device",
      login_request_timestamp: new Date().toISOString(),
    })
    .eq("license_key", args.licenseKey);

  if (error) {
    throw error;
  }

  // Broadcast login request
  try {
    await broadcastLicenseEvent(args.licenseKey, 'login_request', {
      deviceId: args.deviceId,
      deviceName: args.deviceName ?? "Unknown Device",
      timestamp: new Date().toISOString()
    });
  } catch (e) {
    console.error("Failed to broadcast login request:", e);
  }
}

export interface LoginRequestData {
  deviceId: string;
  deviceName: string;
  timestamp: string;
}

export async function getLoginRequest(licenseKey: string): Promise<LoginRequestData | null> {
  const client = getSupabaseClient();
  const { data, error } = await client
    .from("licenses")
    .select("login_request_device_id, login_request_device_name, login_request_timestamp")
    .eq("license_key", licenseKey)
    .maybeSingle();

  if (error) {
    throw error;
  }

  if (!data?.login_request_device_id) {
    return null;
  }

  return {
    deviceId: data.login_request_device_id,
    deviceName: data.login_request_device_name,
    timestamp: data.login_request_timestamp,
  };
}

export async function clearLoginRequest(licenseKey: string): Promise<void> {
  const client = getSupabaseClient();
  const { error } = await client
    .from("licenses")
    .update({
      login_request_device_id: null,
      login_request_device_name: null,
      login_request_timestamp: null,
    })
    .eq("license_key", licenseKey);


  if (error) {
    throw error;
  }
}

export async function banDevice(deviceId: string, reason?: string, adminEmail?: string): Promise<void> {
  const client = getSupabaseClient();
  const { error } = await client
    .from("banned_devices")
    .insert({
      device_id: deviceId,
      reason: reason ?? null,
      banned_by: adminEmail ?? 'admin'
    });

  // Also deactivate all active sessions for this device
  if (!error) {
    // Get active sessions before deactivating to know which licenses to notify
    const { data: sessions } = await client
      .from("license_sessions")
      .select("license_key, session_id")
      .eq("device_id", deviceId)
      .eq("active", true);

    await client
      .from("license_sessions")
      .update({ active: false })
      .eq("device_id", deviceId);

    // Broadcast ban event to all affected licenses
    if (sessions && sessions.length > 0) {
      for (const session of sessions) {
        try {
          await broadcastLicenseEvent(session.license_key, 'device_banned', {
            deviceId: deviceId,
            reason: reason ?? "Device Banned",
            sessionId: session.session_id
          });
        } catch (e) {
          console.error(`Failed to broadcast ban for license ${session.license_key}:`, e);
        }
      }
    }

  } else {
    throw error;
  }
}

export async function unbanDevice(deviceId: string): Promise<void> {
  const client = getSupabaseClient();
  const { error } = await client
    .from("banned_devices")
    .delete()
    .eq("device_id", deviceId);
  if (error) throw error;
}

export async function isDeviceBanned(deviceId: string): Promise<{ banned: boolean, reason?: string }> {
  const client = getSupabaseClient();
  const { data, error } = await client
    .from("banned_devices")
    .select("reason")
    .eq("device_id", deviceId)
    .maybeSingle();

  if (error) {
    console.error("Error checking banned status:", error);
    return { banned: false };
  }

  return { banned: !!data, reason: data?.reason };
}

export async function revokeSession(sessionId: string): Promise<void> {
  return deactivateSession(sessionId);
}

export async function getSessionsForLicense(licenseKey: string): Promise<LicenseSessionRow[]> {
  const client = getSupabaseClient();
  const { data, error } = await client
    .from("license_sessions")
    .select("*")
    .eq("license_key", licenseKey)
    .eq("active", true)
    .order("last_seen_at", { ascending: false });

  if (error) throw error;
  return data ?? [];
}

export async function getSessionHistoryForLicense(licenseKey: string, limit = 10): Promise<LicenseSessionRow[]> {
  const client = getSupabaseClient();
  const { data, error } = await client
    .from("license_sessions")
    .select("*")
    .eq("license_key", licenseKey)
    .eq("active", false)
    .order("last_seen_at", { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data ?? [];
}



export async function getSession(sessionId: string): Promise<LicenseSessionRow | null> {
  const client = getSupabaseClient();
  const { data, error } = await client
    .from("license_sessions")
    .select("*")
    .eq("id", sessionId)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data;
}

export async function getLicense(licenseKey: string): Promise<LicenseRow | null> {
  const client = getSupabaseClient();
  const { data, error } = await client
    .from("licenses")
    .select("*")
    .eq("license_key", licenseKey)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data;
}
