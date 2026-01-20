import { NextRequest, NextResponse } from "next/server";
import { getCurrentAdmin } from "@/lib/auth-server";
import { getSupabaseClient } from "@/lib/supabase-storage";

export async function POST(request: NextRequest) {
    try {
        const admin = await getCurrentAdmin();
        if (!admin) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { licenseKey } = await request.json();

        if (!licenseKey) {
            return NextResponse.json({ error: "License key is required" }, { status: 400 });
        }

        const client = getSupabaseClient();

        // Delete the license (cascade should handle related sessions/logs if configured, 
        // otherwise we might need to delete them manually. Assuming cascade or manual cleanup needed).

        // First, verify it's revoked? User said "only we can delte therevoked licen".
        const { data: license } = await client
            .from("licenses")
            .select("status")
            .eq("license_key", licenseKey)
            .single();

        if (!license) {
            return NextResponse.json({ error: "License not found" }, { status: 404 });
        }

        if (license.status !== 'revoked') {
            return NextResponse.json({ error: "Only revoked licenses can be deleted" }, { status: 400 });
        }

        // Delete related sessions first (just to be safe if no cascade)
        await client.from("license_sessions").delete().eq("license_key", licenseKey);

        // Delete validation logs (if any)
        await client.from("license_validation_log").delete().eq("license_key", licenseKey);

        // Delete download tokens (if any)
        await client.from("download_tokens").delete().eq("license_key", licenseKey);

        // Delete the license
        const { error } = await client
            .from("licenses")
            .delete()
            .eq("license_key", licenseKey);

        if (error) throw error;

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Delete license error:", error);
        return NextResponse.json(
            { error: "Failed to delete license" },
            { status: 500 }
        );
    }
}
