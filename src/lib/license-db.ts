import "server-only";

import { getSupabaseClient } from "./supabase-storage";

export type LicenseStatus = "active" | "expired" | "revoked";

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
}

export interface LicenseSessionRow {
  id: number;
  license_key: string;
  device_id: string;
  session_id: string;
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

export async function refreshSession(sessionId: string): Promise<void> {
  const client = getSupabaseClient();
  const { error } = await client
    .from("license_sessions")
    .update({ last_seen_at: new Date().toISOString(), active: true })
    .eq("session_id", sessionId);

  if (error) {
    throw error;
  }
}

export async function deactivateSession(sessionId: string): Promise<void> {
  const client = getSupabaseClient();
  const { error } = await client
    .from("license_sessions")
    .update({ active: false })
    .eq("session_id", sessionId);

  if (error) {
    throw error;
  }
}


