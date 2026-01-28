import Link from "next/link";
import { ReactNode } from "react";

interface ToolCardProps {
    title: string;
    description: string;
    href: string;
    icon?: ReactNode;
    color?: "blue" | "emerald" | "purple" | "orange" | "pink" | "cyan";
}

export function ToolCard({ title, description, href, icon, color = "blue" }: ToolCardProps) {
    const colorStyles = {
        blue: "text-blue-500 group-hover:bg-blue-500/10",
        emerald: "text-emerald-500 group-hover:bg-emerald-500/10",
        purple: "text-purple-500 group-hover:bg-purple-500/10",
        orange: "text-orange-500 group-hover:bg-orange-500/10",
        pink: "text-pink-500 group-hover:bg-pink-500/10",
        cyan: "text-cyan-500 group-hover:bg-cyan-500/10",
    };

    return (
        <Link
            href={href}
            className="group flex flex-col rounded-xl border border-zinc-800 bg-zinc-900/50 p-6 shadow-sm transition-all hover:border-zinc-700 hover:bg-zinc-800/80 hover:shadow-md"
        >
            <div className="flex items-start justify-between">
                <div className={`mb-4 rounded-lg bg-zinc-800/50 p-3 transition-colors ${colorStyles[color]}`}>
                    {icon || <div className="h-6 w-6" />}
                </div>
                <div className="text-zinc-600 transition-colors group-hover:text-white">
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                </div>
            </div>

            <h3 className="text-lg font-semibold text-white group-hover:text-white">
                {title}
            </h3>
            <p className="mt-2 text-sm text-zinc-400 group-hover:text-zinc-300">
                {description}
            </p>
        </Link>
    );
}
