"use client";

import { usePathname } from "next/navigation";

export function AdminHeader() {
    const pathname = usePathname();
    const pageName = pathname.split("/").pop(); // Simple way to get title from URL for now

    // Format page name (e.g., "youtube-help" -> "YouTube Help")
    // Custom title logic for specific paths
    let formattedTitle = "ADMIN";

    if (pathname === "/admin") {
        formattedTitle = "DASHBOARD";
    } else if (pathname.includes("/admin/blog/edit/")) {
        formattedTitle = "EDIT BLOG POST";
    } else if (pathname.includes("/admin/blog/new")) {
        formattedTitle = "NEW BLOG POST";
    } else if (pathname.includes("/admin/blog")) {
        formattedTitle = "BLOG POSTS";
    } else {
        // Fallback: Use last segment but prettify it
        formattedTitle = pageName
            ?.split("-")
            .map(word => word.toUpperCase())
            .join(" ") || "ADMIN";
    }

    return (
        <header className="flex h-16 w-full items-center justify-between border-b border-zinc-800 bg-zinc-900/50 px-6 backdrop-blur-xl">
            <h2 className="text-xl font-bold tracking-wide text-white">
                {formattedTitle ?? "ADMIN"}
            </h2>

            <div className="flex items-center gap-4">
                <form action="/api/auth/admin/logout" method="post">
                    <button
                        type="submit"
                        className="text-sm font-medium text-zinc-400 transition hover:text-white"
                    >
                        Log out
                    </button>
                </form>
            </div>
        </header>
    );
}
