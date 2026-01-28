import { redirect } from "next/navigation";
import { getCurrentAdmin } from "@/lib/auth-server";
import { getSupabaseClient } from "@/lib/supabase-storage";
import { BlogEditor } from "@/components/admin/BlogEditor";

async function getPost(id: string) {
    const client = getSupabaseClient();
    const { data, error } = await client
        .from("blog_posts")
        .select("*")
        .eq("id", id)
        .single();

    if (error) return null;
    return data;
}

export default async function EditBlogPage({ params }: { params: Promise<{ id: string }> }) {
    const admin = await getCurrentAdmin();
    if (!admin) redirect("/admin/login");

    const resolvedParams = await params;
    const post = await getPost(resolvedParams.id);

    if (!post) {
        return (
            <div className="p-12 text-center text-zinc-400">
                Post not found. <a href="/admin/blog" className="text-white underline">Go back</a>
            </div>
        );
    }

    return (
        <div className="w-full">
            <div className="mb-8">
                <a href="/admin/blog" className="text-sm text-zinc-500 hover:text-zinc-300">← Back to Posts</a>
            </div>
            <BlogEditor isNew={false} initialPost={post} />
        </div>
    );
}
