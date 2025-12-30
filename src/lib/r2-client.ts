import "server-only";

import { S3Client, GetObjectCommand, HeadObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

// Cloudflare R2 Configuration
const R2_ACCOUNT_ID = process.env.R2_ACCOUNT_ID;
const R2_ACCESS_KEY_ID = process.env.R2_ACCESS_KEY_ID;
const R2_SECRET_ACCESS_KEY = process.env.R2_SECRET_ACCESS_KEY;
const R2_BUCKET_NAME = process.env.R2_BUCKET_NAME || "release";
const R2_ENDPOINT = process.env.R2_ENDPOINT;
const R2_EXE_FILE_NAME = process.env.R2_EXE_FILE_NAME || "TelegramSignalBot Installer.exe";

// Validate R2 configuration
const isR2Configured = !!(
    R2_ACCOUNT_ID &&
    R2_ACCESS_KEY_ID &&
    R2_SECRET_ACCESS_KEY &&
    R2_ENDPOINT
);

if (!isR2Configured) {
    console.warn("⚠️ R2 is not fully configured. Download links will not work.");
    console.warn("Missing env vars:", {
        R2_ACCOUNT_ID: !!R2_ACCOUNT_ID,
        R2_ACCESS_KEY_ID: !!R2_ACCESS_KEY_ID,
        R2_SECRET_ACCESS_KEY: !!R2_SECRET_ACCESS_KEY,
        R2_ENDPOINT: !!R2_ENDPOINT,
    });
}

// Initialize S3 Client for Cloudflare R2
const r2Client = isR2Configured
    ? new S3Client({
        region: "auto",
        endpoint: R2_ENDPOINT,
        credentials: {
            accessKeyId: R2_ACCESS_KEY_ID!,
            secretAccessKey: R2_SECRET_ACCESS_KEY!,
        },
    })
    : null;

/**
 * Check if R2 is properly configured
 */
export function isR2Enabled(): boolean {
    return isR2Configured;
}

/**
 * Get the EXE file name
 */
export function getExeFileName(): string {
    return R2_EXE_FILE_NAME;
}

/**
 * Verify that a file exists in the R2 bucket
 */
export async function verifyFileExists(fileName: string): Promise<boolean> {
    if (!r2Client) {
        throw new Error("R2 is not configured");
    }

    try {
        const command = new HeadObjectCommand({
            Bucket: R2_BUCKET_NAME,
            Key: fileName,
        });

        await r2Client.send(command);
        return true;
    } catch (error: any) {
        if (error.name === "NotFound" || error.$metadata?.httpStatusCode === 404) {
            console.error(`File not found in R2: ${fileName}`);
            return false;
        }
        console.error("Error verifying file in R2:", error);
        throw error;
    }
}

/**
 * Generate a presigned download URL for a file in R2
 * @param fileName - Name of the file in the R2 bucket
 * @param expiresInSeconds - URL expiration time in seconds (default: 3600 = 1 hour)
 * @returns Presigned URL
 */
export async function generatePresignedDownloadUrl(
    fileName: string,
    expiresInSeconds: number = 3600
): Promise<string> {
    if (!r2Client) {
        throw new Error("R2 is not configured. Please set R2 environment variables.");
    }

    try {
        // Create GetObject command
        const command = new GetObjectCommand({
            Bucket: R2_BUCKET_NAME,
            Key: fileName,
            ResponseContentDisposition: `attachment; filename="${fileName}"`,
        });

        // Generate presigned URL
        const signedUrl = await getSignedUrl(r2Client, command, {
            expiresIn: expiresInSeconds,
        });

        console.log(`✅ Generated presigned URL for ${fileName} (expires in ${expiresInSeconds}s)`);
        return signedUrl;
    } catch (error) {
        console.error("Failed to generate presigned URL:", error);
        throw new Error(`Failed to generate download URL: ${error}`);
    }
}

/**
 * Generate a download URL for the installer EXE
 * @param expiresInSeconds - URL expiration time in seconds (default: 3600 = 1 hour)
 * @returns Presigned URL for the installer
 */
export async function generateInstallerDownloadUrl(
    expiresInSeconds: number = 3600
): Promise<string> {
    // Verify file exists before generating URL
    const exists = await verifyFileExists(R2_EXE_FILE_NAME);
    if (!exists) {
        throw new Error(
            `Installer file "${R2_EXE_FILE_NAME}" not found in R2 bucket "${R2_BUCKET_NAME}". Please upload the file first.`
        );
    }

    return generatePresignedDownloadUrl(R2_EXE_FILE_NAME, expiresInSeconds);
}
