import { NextResponse } from "next/server";
import { isR2Enabled, getExeFileName } from "@/lib/r2-client";
import { S3Client, HeadObjectCommand } from "@aws-sdk/client-s3";

/**
 * GET /api/test/r2
 * Test R2 configuration and file existence
 */
export async function GET() {
    try {
        if (!isR2Enabled()) {
            return NextResponse.json({
                error: "R2 is not configured",
                configured: false,
            }, { status: 503 });
        }

        const fileName = getExeFileName();

        // Check if file exists
        const client = new S3Client({
            region: "auto",
            endpoint: process.env.R2_ENDPOINT,
            credentials: {
                accessKeyId: process.env.R2_ACCESS_KEY_ID!,
                secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
            },
        });

        try {
            const headCommand = new HeadObjectCommand({
                Bucket: process.env.R2_BUCKET_NAME,
                Key: fileName,
            });

            const response = await client.send(headCommand);

            return NextResponse.json({
                success: true,
                configured: true,
                fileExists: true,
                fileName,
                fileSize: response.ContentLength,
                lastModified: response.LastModified,
                contentType: response.ContentType,
                bucket: process.env.R2_BUCKET_NAME,
            });
        } catch (err: any) {
            if (err.name === "NotFound" || err.$metadata?.httpStatusCode === 404) {
                return NextResponse.json({
                    success: false,
                    configured: true,
                    fileExists: false,
                    fileName,
                    bucket: process.env.R2_BUCKET_NAME,
                    error: `File "${fileName}" not found in bucket "${process.env.R2_BUCKET_NAME}"`,
                    instructions: [
                        "1. Go to Cloudflare Dashboard → R2",
                        `2. Select the "${process.env.R2_BUCKET_NAME}" bucket`,
                        `3. Upload a file named exactly: "${fileName}"`,
                        "4. Try this endpoint again to verify",
                    ],
                }, { status: 404 });
            }
            throw err;
        }
    } catch (error: any) {
        return NextResponse.json({
            error: error.message || "Failed to test R2 connection",
            configured: isR2Enabled(),
        }, { status: 500 });
    }
}
