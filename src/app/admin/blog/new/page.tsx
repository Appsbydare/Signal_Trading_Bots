import { redirect } from "next/navigation";
import { getCurrentAdmin } from "@/lib/auth-server";
import { BlogEditor } from "@/components/admin/BlogEditor";

export default async function NewBlogPage() {
    const admin = await getCurrentAdmin();
    if (!admin) redirect("/admin/login");

    return (
        <div className="w-full">
            {/* Breadcrumb-ish header handled by AdminHeader mostly, but we add spacing */}
            <div className="mb-8">
                <a href="/admin/blog" className="text-sm text-zinc-500 hover:text-zinc-300">← Back to Posts</a>
            </div>
            <BlogEditor isNew={true} />
        </div>
    );
}
