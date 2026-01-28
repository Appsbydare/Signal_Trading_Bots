import { NextResponse } from "next/server";
import { getCurrentAdmin } from "@/lib/auth-server";
import { getSupabaseClient } from "@/lib/supabase-storage";

export async function PUT(request: Request) {
    try {
        const admin = await getCurrentAdmin();
        if (!admin) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const url = new URL(request.url);
        const id = url.searchParams.get("id");

        if (!id) {
            return NextResponse.json({ error: "Missing Post ID" }, { status: 400 });
        }

        const body = await request.json();
        const { title, slug, excerpt, content, is_published } = body;

        const client = getSupabaseClient();

        // Update
        const { data, error } = await client
            .from("blog_posts")
            .update({
                title,
                slug,
                excerpt,
                content,
                is_published,
                updated_at: new Date().toISOString()
            })
            .eq("id", id)
            .select()
            .single();

        if (error) throw error;

        return NextResponse.json({ success: true, post: data });
    } catch (error: any) {
        console.error("Update blog error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
