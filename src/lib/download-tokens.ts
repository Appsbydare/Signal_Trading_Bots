import "server-only";

import { getSupabaseClient } from "./supabase-storage";
import { generateInstallerDownloadUrl, getExeFileName } from "./r2-client";
import { randomBytes } from "crypto";

// Re-export for convenience
export { getExeFileName } from "./r2-client";

export interface DownloadTokenRow {
    id: number;
    token: string;
    license_key: string | null;
    email: string;
    file_name: string;
    r2_signed_url: string;
    created_at: string;
    expires_at: string;
    used_at: string | null;
    is_used: boolean;
    ip_address: string | null;
    user_agent: string | null;
}

export interface CreateDownloadTokenArgs {
    licenseKey?: string;
    email: string;
    fileName: string;
    ipAddress?: string;
    userAgent?: string;
}

/**
 * Generate a unique download token
 */
function generateToken(): string {
    return randomBytes(32).toString("hex");
}

/**
 * Create a download token and generate R2 signed URL
 * Token will be marked as used when download actually happens via proxy endpoint
 */
export async function createDownloadToken(
    args: CreateDownloadTokenArgs
): Promise<DownloadTokenRow> {
    const client = getSupabaseClient();

    // Generate R2 signed URL (1 hour expiration)
    const signedUrl = await generateInstallerDownloadUrl(3600);

    // Generate unique token
    const token = generateToken();

    // Calculate expiration (1 hour from now)
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 1);

    // Create token record (NOT marked as used - will be marked when actually downloaded)
    const { data, error } = await client
        .from("download_tokens")
        .insert({
            token,
            license_key: args.licenseKey ?? null,
            email: args.email.toLowerCase(),
            file_name: args.fileName,
            r2_signed_url: signedUrl,
            expires_at: expiresAt.toISOString(),
            is_used: false, // Will be marked as used when download happens
            ip_address: args.ipAddress ?? null,
            user_agent: args.userAgent ?? null,
        })
        .select("*")
        .single();

    if (error) {
        console.error("Failed to create download token:", error);
        throw error;
    }

    if (!data) {
        throw new Error("Failed to create download token - no data returned");
    }

    console.log(`✅ Created download token for ${args.email} (license: ${args.licenseKey || "N/A"})`);
    return data as DownloadTokenRow;
}

/**
 * Get a download token by token string
 */
export async function getDownloadToken(
    token: string
): Promise<DownloadTokenRow | null> {
    const client = getSupabaseClient();

    const { data, error } = await client
        .from("download_tokens")
        .select("*")
        .eq("token", token)
        .maybeSingle();

    if (error) {
        console.error("Failed to get download token:", error);
        throw error;
    }

    return data as DownloadTokenRow | null;
}

/**
 * Get download tokens by email
 */
export async function getDownloadTokensByEmail(
    email: string
): Promise<DownloadTokenRow[]> {
    const client = getSupabaseClient();

    const { data, error } = await client
        .from("download_tokens")
        .select("*")
        .eq("email", email.toLowerCase())
        .order("created_at", { ascending: false });

    if (error) {
        console.error("Failed to get download tokens by email:", error);
        throw error;
    }

    return (data as DownloadTokenRow[]) ?? [];
}

/**
 * Get download tokens by license key
 */
export async function getDownloadTokensByLicenseKey(
    licenseKey: string
): Promise<DownloadTokenRow[]> {
    const client = getSupabaseClient();

    const { data, error } = await client
        .from("download_tokens")
        .select("*")
        .eq("license_key", licenseKey)
        .order("created_at", { ascending: false });

    if (error) {
        console.error("Failed to get download tokens by license key:", error);
        throw error;
    }

    return (data as DownloadTokenRow[]) ?? [];
}

/**
 * Validate a download token
 * Returns validation result with reason if invalid
 */
export async function validateDownloadToken(token: string): Promise<{
    valid: boolean;
    reason?: string;
    tokenData?: DownloadTokenRow;
}> {
    const tokenData = await getDownloadToken(token);

    if (!tokenData) {
        return { valid: false, reason: "Token not found" };
    }

    // Check if already used (should always be true since we mark immediately)
    if (tokenData.is_used) {
        return {
            valid: false,
            reason: "This download link has already been used",
            tokenData,
        };
    }

    // Check if expired
    const now = new Date();
    const expiresAt = new Date(tokenData.expires_at);
    if (now > expiresAt) {
        return {
            valid: false,
            reason: "Download link has expired",
            tokenData,
        };
    }

    return { valid: true, tokenData };
}

/**
 * Mark a token as used (for future use if we change the immediate-use behavior)
 */
export async function markTokenAsUsed(
    token: string,
    ipAddress?: string,
    userAgent?: string
): Promise<void> {
    const client = getSupabaseClient();

    const updateData: any = {
        is_used: true,
        used_at: new Date().toISOString(),
    };

    if (ipAddress) {
        updateData.ip_address = ipAddress;
    }
    if (userAgent) {
        updateData.user_agent = userAgent;
    }

    const { error } = await client
        .from("download_tokens")
        .update(updateData)
        .eq("token", token);

    if (error) {
        console.error("Failed to mark token as used:", error);
        throw error;
    }
}
