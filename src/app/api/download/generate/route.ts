import { NextRequest, NextResponse } from "next/server";
import { createDownloadToken, getExeFileName } from "@/lib/download-tokens";
import { getLicenseByKey } from "@/lib/license-db";
import { getCustomerByEmail } from "@/lib/auth-users";
import { isR2Enabled } from "@/lib/r2-client";

/**
 * POST /api/download/generate
 * Generate a secure download link for the installer
 * 
 * Request body:
 * - licenseKey (optional): License key to validate
 * - email (required): User's email address
 */
export async function POST(request: NextRequest) {
    try {
        // Check if R2 is configured
        if (!isR2Enabled()) {
            return NextResponse.json(
                { error: "Download service is not configured. Please contact support." },
                { status: 503 }
            );
        }

        const body = await request.json();
        const { licenseKey, email } = body;

        // Validate required fields
        if (!email) {
            return NextResponse.json(
                { error: "Email is required" },
                { status: 400 }
            );
        }

        // If license key is provided, validate it
        if (licenseKey) {
            const license = await getLicenseByKey(licenseKey);

            if (!license) {
                return NextResponse.json(
                    { error: "Invalid license key" },
                    { status: 404 }
                );
            }

            // Check if license belongs to the email
            if (license.email.toLowerCase() !== email.toLowerCase()) {
                return NextResponse.json(
                    { error: "License key does not match email" },
                    { status: 403 }
                );
            }

            // Check if license is active
            if (license.status !== "active") {
                return NextResponse.json(
                    { error: `License is ${license.status}. Please contact support.` },
                    { status: 403 }
                );
            }

            // Check if license is expired
            const now = new Date();
            const expiresAt = new Date(license.expires_at);
            if (now > expiresAt) {
                return NextResponse.json(
                    { error: "License has expired" },
                    { status: 403 }
                );
            }
        } else {
            // If no license key, check if customer exists
            const customer = await getCustomerByEmail(email);
            if (!customer) {
                return NextResponse.json(
                    { error: "Customer not found. Please complete your purchase first." },
                    { status: 404 }
                );
            }
        }

        // Get client IP and user agent for audit trail
        const ipAddress = request.headers.get("x-forwarded-for") ||
            request.headers.get("x-real-ip") ||
            "unknown";
        const userAgent = request.headers.get("user-agent") || "unknown";

        // Create download token (this generates the R2 signed URL)
        const downloadToken = await createDownloadToken({
            licenseKey: licenseKey || undefined,
            email,
            fileName: getExeFileName(),
            ipAddress,
            userAgent,
        });

        console.log(`✅ Generated download link for ${email} (token: ${downloadToken.token})`);

        // Return proxy URL instead of direct R2 URL
        const host = request.headers.get("host") || "localhost:3000";
        const protocol = host.includes("localhost") ? "http" : "https";
        const proxyUrl = `${protocol}://${host}/api/download/${downloadToken.token}`;

        return NextResponse.json({
            success: true,
            downloadUrl: proxyUrl, // Proxy URL that enforces single-use
            token: downloadToken.token,
            fileName: downloadToken.file_name,
            expiresAt: downloadToken.expires_at,
            message: "Download link generated successfully. This link will expire in 1 hour and can only be used once.",
        });

    } catch (error: any) {
        console.error("Error generating download link:", error);

        // Check for specific R2 errors
        if (error.message?.includes("not found in R2 bucket")) {
            return NextResponse.json(
                { error: "Installer file not available. Please contact support." },
                { status: 503 }
            );
        }

        return NextResponse.json(
            { error: "Failed to generate download link. Please try again or contact support." },
            { status: 500 }
        );
    }
}
