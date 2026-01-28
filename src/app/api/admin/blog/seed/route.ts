import { NextResponse } from "next/server";
import { getSupabaseClient } from "@/lib/supabase-storage";
import { resourceArticles } from "@/data/resources";
import { resourceArticlesContent } from "@/data/resource-articles-content";

export async function GET() {
    try {
        const client = getSupabaseClient();
        const results = [];

        for (const article of resourceArticles) {
            if (article.status !== "available") continue;

            const content = resourceArticlesContent[article.id];
            if (!content) {
                console.warn(`No content found for article: ${article.id}`);
                continue;
            }

            // Check if exists
            const { data: existing } = await client
                .from("blog_posts")
                .select("id")
                .eq("slug", article.id)
                .single();

            if (existing) {
                results.push({ slug: article.id, status: "skipped (exists)" });
                continue;
            }

            const { error } = await client.from("blog_posts").insert({
                slug: article.id,
                title: article.title,
                excerpt: article.description,
                content: content,
                is_published: true,
                created_at: new Date().toISOString(), // Or use article.lastUpdated if strictly parsing date
            });

            if (error) {
                results.push({ slug: article.id, status: "error", error: error.message });
            } else {
                results.push({ slug: article.id, status: "migrated" });
            }
        }

        return NextResponse.json({ success: true, results });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
