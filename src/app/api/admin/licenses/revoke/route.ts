import { NextRequest, NextResponse } from "next/server";
import { getCurrentAdmin } from "@/lib/auth-server";
import { getSupabaseClient } from "@/lib/supabase-storage";

/**
 * POST /api/admin/licenses/revoke
 * Revoke a license - sets status to 'revoked' and deactivates all sessions
 */
export async function POST(request: NextRequest) {
    try {
        // Check admin authentication
        const admin = await getCurrentAdmin();
        if (!admin) {
            return NextResponse.json(
                { error: "Unauthorized. Admin access required." },
                { status: 401 }
            );
        }

        const body = await request.json();
        const { licenseKey } = body;

        if (!licenseKey) {
            return NextResponse.json(
                { error: "License key is required" },
                { status: 400 }
            );
        }

        const client = getSupabaseClient();

        // Check if license exists
        const { data: license, error: fetchError } = await client
            .from("licenses")
            .select("*")
            .eq("license_key", licenseKey)
            .single();

        if (fetchError || !license) {
            return NextResponse.json(
                { error: "License not found" },
                { status: 404 }
            );
        }

        // Update license status to 'revoked'
        const { error: updateError } = await client
            .from("licenses")
            .update({ status: "revoked" })
            .eq("license_key", licenseKey);

        if (updateError) {
            console.error("Error revoking license:", updateError);
            return NextResponse.json(
                { error: "Failed to revoke license" },
                { status: 500 }
            );
        }

        // Deactivate all active sessions for this license
        const { error: sessionError } = await client
            .from("license_sessions")
            .update({ active: false })
            .eq("license_key", licenseKey)
            .eq("active", true);

        if (sessionError) {
            console.error("Error deactivating sessions:", sessionError);
            // Don't fail the request - license is already revoked
        }

        console.log(`✅ Admin ${admin.email} revoked license ${licenseKey}`);

        return NextResponse.json({
            success: true,
            message: `License ${licenseKey} has been revoked and all active sessions have been deactivated.`,
        });

    } catch (error: any) {
        console.error("Error in revoke license endpoint:", error);
        return NextResponse.json(
            { error: "Failed to revoke license. Please try again." },
            { status: 500 }
        );
    }
}
