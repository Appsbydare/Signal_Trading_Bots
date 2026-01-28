import { NextResponse } from "next/server";
import { getCurrentAdmin } from "@/lib/auth-server";
import { getSupabaseClient } from "@/lib/supabase-storage";

export async function POST(request: Request) {
    try {
        const admin = await getCurrentAdmin();
        if (!admin) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await request.json();
        const { title, slug, excerpt, content, is_published } = body;

        if (!title || !slug) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        const client = getSupabaseClient();

        // Check if slug exists
        const { data: existing } = await client.from("blog_posts").select("id").eq("slug", slug).single();
        if (existing) {
            return NextResponse.json({ error: "Slug already exists" }, { status: 400 });
        }

        const { data, error } = await client
            .from("blog_posts")
            .insert({
                title,
                slug,
                excerpt,
                content, // JSONB
                is_published
            })
            .select()
            .single();

        if (error) throw error;

        return NextResponse.json({ success: true, post: data });
    } catch (error: any) {
        console.error("Create blog error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
