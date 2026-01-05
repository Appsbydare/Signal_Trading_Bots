"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface LicenseSession {
    id: number;
    session_id: string;
    device_id: string;
    device_name: string | null;
    last_seen_at: string;
    active: boolean;
    license_key: string;
}

export function CustomerSessionList({ sessions, historySessions = [] }: { sessions: LicenseSession[], historySessions?: LicenseSession[] }) {
    const router = useRouter();
    const [processing, setProcessing] = useState<string | null>(null);
    const [historyExpanded, setHistoryExpanded] = useState(false);

    const handleRevokeSession = async (sessionId: string) => {
        if (!confirm("Are you sure you want to disconnect this device? It will stop running immediately.")) return;
        setProcessing(sessionId);
        try {
            const res = await fetch("/api/license/sessions/revoke", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ sessionId })
            });
            if (res.ok) {
                router.refresh();
            } else {
                alert("Failed to revoke session");
            }
        } finally {
            setProcessing(null);
        }
    };

    return (
        <div className="space-y-6">
            {/* Active Sessions Grid */}
            {sessions.length === 0 ? (
                <div className="rounded-md bg-zinc-800/50 p-4 text-sm text-zinc-400">
                    No active devices found. Proceed to download and install the software to get started.
                </div>
            ) : (
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {sessions.map(session => (
                        <div key={session.id} className="relative overflow-hidden rounded-lg border border-zinc-800 bg-zinc-900/50 p-4 transition hover:border-zinc-700">
                            <div className="flex items-start justify-between">
                                <div className="flex items-center gap-3">
                                    <div className={`flex h-10 w-10 items-center justify-center rounded-full ${session.active ? "bg-emerald-500/10" : "bg-zinc-800"}`}>
                                        <svg className={`h-6 w-6 ${session.active ? "text-emerald-500" : "text-zinc-500"}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <h3 className="font-medium text-white">{session.device_name || "Unknown Device"}</h3>
                                        <p className="text-xs text-zinc-500 font-mono truncate max-w-[120px]" title={session.device_id}>{session.device_id}</p>
                                    </div>
                                </div>
                                <div className={`h-2 w-2 rounded-full ${session.active ? "bg-emerald-500" : "bg-zinc-500"}`} title={session.active ? "Online" : "Offline"} />
                            </div>

                            <div className="mt-4 flex flex-col gap-1 text-xs text-zinc-400">
                                <div className="flex justify-between">
                                    <span>License:</span>
                                    <span className="font-mono text-zinc-300">{session.license_key.substring(0, 8)}...</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Last active:</span>
                                    <span>{new Date(session.last_seen_at).toLocaleDateString()}</span>
                                </div>
                            </div>

                            <div className="mt-4 border-t border-zinc-800 pt-3">
                                <button
                                    onClick={() => handleRevokeSession(session.session_id)}
                                    disabled={!!processing}
                                    className="w-full rounded bg-zinc-800 py-1.5 text-xs font-medium text-zinc-300 transition hover:bg-red-500/10 hover:text-red-400 disabled:opacity-50 flex justify-center items-center gap-2"
                                >
                                    {processing === session.session_id ? (
                                        <>
                                            <svg className="animate-spin h-3 w-3 text-red-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            <span>Disconnecting...</span>
                                        </>
                                    ) : "Disconnect Device"}
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Connection History */}
            <div className="border-t border-zinc-800/50 pt-4">
                <button
                    onClick={() => setHistoryExpanded(!historyExpanded)}
                    className="flex items-center gap-2 text-sm font-medium text-zinc-400 hover:text-zinc-200 transition-colors w-full text-left"
                >
                    <svg
                        className={`h-4 w-4 transform transition-transform ${historyExpanded ? "rotate-90" : ""}`}
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                    Recent Connection History
                    <span className="ml-auto text-xs font-normal text-zinc-600">
                        {historySessions.length} records
                    </span>
                </button>

                {historyExpanded && (
                    <div className="mt-4 space-y-2">
                        {historySessions.length === 0 ? (
                            <p className="text-sm text-zinc-500 italic pl-6">No history available.</p>
                        ) : (
                            <div className="grid gap-2 pl-4">
                                {historySessions.map(session => (
                                    <div key={session.id} className="flex items-center justify-between rounded-md bg-zinc-800/30 p-2 border border-zinc-800">
                                        <div className="flex items-center gap-3">
                                            <div className="h-1.5 w-1.5 rounded-full bg-zinc-600" />
                                            <div>
                                                <div className="text-sm font-medium text-zinc-300">
                                                    {session.device_name || "Unknown Device"}
                                                </div>
                                                <div className="text-xs text-zinc-600 font-mono">{session.device_id.substring(0, 16)}...</div>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-4">
                                            <div className="text-xs text-zinc-500 text-right">
                                                <div>Seen: {new Date(session.last_seen_at).toLocaleString()}</div>
                                            </div>
                                            <div className="px-1.5 py-0.5 rounded bg-zinc-700/50 text-zinc-500 text-[10px] uppercase font-medium">
                                                Ended
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
