import { NextResponse } from "next/server";
import { generateInstallerDownloadUrl, isR2Enabled } from "@/lib/r2-client";
import { getCurrentCustomer } from "@/lib/auth-server";
import { getSupabaseClient } from "@/lib/supabase-storage";

export const dynamic = 'force-dynamic';

export async function GET() {
    const customer = await getCurrentCustomer();
    if (!customer) {
        return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    // Verify the customer holds at least one active (non-revoked) license
    const supabase = getSupabaseClient();
    const { data: license } = await supabase
        .from("licenses")
        .select("id")
        .eq("email", customer.email)
        .in("status", ["active", "trial"])
        .limit(1)
        .maybeSingle();

    if (!license) {
        return NextResponse.json({ error: "No active license found" }, { status: 403 });
    }

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

        // Log more details about the error
        if (error instanceof Error) {
            console.error("Error message:", error.message);
            console.error("Error stack:", error.stack);
        }

        return NextResponse.json(
            {
                error: "Internal server error",
                details: error instanceof Error ? error.message : "Unknown error"
            },
            { status: 500 }
        );
    }
}
