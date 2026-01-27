import { NextResponse } from "next/server";
import { generateInstallerDownloadUrl, isR2Enabled } from "@/lib/r2-client";

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        if (!isR2Enabled()) {
            return NextResponse.json(
                { error: "Download service is not yet configured" },
                { status: 503 }
            );
        }

        // Generate a signed URL valid for 1 hour
        const signedUrl = await generateInstallerDownloadUrl(3600);

        // Redirect the user to the R2 signed URL
        return NextResponse.redirect(signedUrl);
    } catch (error) {
        console.error("Failed to generate public download link:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
