import { redirect } from "next/navigation";
import Link from "next/link";
import { getCurrentAdmin } from "@/lib/auth-server";
import { getSupabaseClient } from "@/lib/supabase-storage";

// Icons
function PlusIcon(props: any) {
    return (
        <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
        </svg>
    );
}

function PencilIcon(props: any) {
    return (
        <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487zm0 0L19.5 7.125" />
        </svg>
    );
}

async function getBlogPosts() {
    const client = getSupabaseClient();
    const { data, error } = await client
        .from("blog_posts")
        .select("*")
        .order("created_at", { ascending: false });

    if (error) {
        console.error("Error fetching blog posts:", error);
        return [];
    }
    return data;
}

export default async function AdminBlogPage() {
    const admin = await getCurrentAdmin();
    if (!admin) redirect("/admin/login");

    const posts = await getBlogPosts();

    return (
        <div className="w-full space-y-6">
            <div className="flex items-center justify-between rounded-xl border border-zinc-800 bg-zinc-900/50 p-6 backdrop-blur-sm">
                <div>
                    <h1 className="text-2xl font-bold text-white">Blog Posts</h1>
                    <p className="mt-1 text-sm text-zinc-400">
                        Manage your blog articles and publications
                    </p>
                </div>
                <Link
                    href="/admin/blog/new"
                    className="flex items-center gap-2 rounded-lg bg-[#5e17eb] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#4a11c0]"
                >
                    <PlusIcon className="h-4 w-4" />
                    Create New Post
                </Link>
            </div>

            <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 backdrop-blur-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-zinc-400">
                        <thead className="border-b border-zinc-800 bg-zinc-900/50 text-xs uppercase text-zinc-500">
                            <tr>
                                <th className="px-6 py-4 font-medium">Title</th>
                                <th className="px-6 py-4 font-medium">Status</th>
                                <th className="px-6 py-4 font-medium">Date</th>
                                <th className="px-6 py-4 text-right font-medium">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-800">
                            {posts.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="px-6 py-12 text-center text-zinc-500">
                                        No blog posts found. Create your first one!
                                    </td>
                                </tr>
                            ) : (
                                posts.map((post: any) => (
                                    <tr key={post.id} className="group hover:bg-zinc-800/10">
                                        <td className="px-6 py-4">
                                            <div className="font-medium text-white">{post.title}</div>
                                            <div className="text-xs text-zinc-500">{post.slug}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span
                                                className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${post.is_published
                                                        ? "bg-emerald-500/10 text-emerald-400"
                                                        : "bg-yellow-500/10 text-yellow-500"
                                                    }`}
                                            >
                                                {post.is_published ? "Published" : "Draft"}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            {new Date(post.created_at).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <Link
                                                href={`/admin/blog/edit/${post.id}`}
                                                className="inline-flex items-center gap-1 rounded-md p-2 text-zinc-400 hover:bg-zinc-800 hover:text-white"
                                                title="Edit Post"
                                            >
                                                <PencilIcon className="h-4 w-4" />
                                                <span className="sr-only">Edit</span>
                                            </Link>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
