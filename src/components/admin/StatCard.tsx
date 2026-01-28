import { ReactNode } from "react";

interface StatCardProps {
    title: string;
    value: string | number;
    icon?: ReactNode;
    trend?: string;
    trendUp?: boolean;
    color?: "blue" | "emerald" | "purple" | "orange";
}

export function StatCard({ title, value, icon, trend, trendUp, color = "blue" }: StatCardProps) {
    const colorStyles = {
        blue: "text-blue-500 bg-blue-500/10",
        emerald: "text-emerald-500 bg-emerald-500/10",
        purple: "text-purple-500 bg-purple-500/10",
        orange: "text-orange-500 bg-orange-500/10",
    };

    return (
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6 shadow-sm backdrop-blur-sm transition hover:bg-zinc-900/70">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm font-medium text-zinc-400">{title}</p>
                    <div className="mt-2 flex items-baseline gap-2">
                        <span className="text-3xl font-bold text-white">{value}</span>
                        {trend && (
                            <span
                                className={`text-xs font-medium ${trendUp ? "text-emerald-400" : "text-rose-400"
                                    }`}
                            >
                                {trend}
                            </span>
                        )}
                    </div>
                </div>
                {icon && <div className={`rounded-lg p-3 ${colorStyles[color]}`}>{icon}</div>}
            </div>
        </div>
    );
}
