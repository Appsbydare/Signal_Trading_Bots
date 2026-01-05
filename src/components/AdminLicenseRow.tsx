"use client";

import { format } from "date-fns";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { RevokeLicenseButton } from "./RevokeLicenseButton";
import { LicenseKeyDisplay } from "./LicenseKeyDisplay";

interface LicenseSession {
    id: number;
    session_id: string;
    device_id: string;
    device_name: string | null;
    created_at: string;
    last_seen_at: string;
    active: boolean;
}

interface EnrichedLicense {
    id: number;
    license_key: string;
    email: string;
    plan: string;
    status: string;
    created_at: string;
    expires_at: string;
    duplicate_detected: boolean;
    grace_period_allowed: boolean;
    active_sessions_count: number;
    sessions: LicenseSession[];
    banned_devices: string[]; // List of banned device IDs for this license context
}

export function AdminLicenseRow({ license }: { license: EnrichedLicense }) {
    const [expanded, setExpanded] = useState(false);
    const [historyExpanded, setHistoryExpanded] = useState(false);
    const router = useRouter();
    const [processing, setProcessing] = useState<string | null>(null);


    const expiresAt = new Date(license.expires_at);
    const isLifetime = license.plan.toLowerCase() === 'lifetime';
    const isExpired = !isLifetime && expiresAt < new Date();
    const daysUntilExpiry = isLifetime ? 9999 : Math.ceil(
        (expiresAt.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
    );

    const handleRevokeSession = async (sessionId: string) => {
        if (!confirm("Revoke this session? The device will be disconnected.")) return;
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

    const handleBanDevice = async (deviceId: string, isBanned: boolean) => {
        const action = isBanned ? "unban" : "ban";
        const msg = isBanned
            ? "Unban this device? They will be able to log in again."
            : "Ban this device? All their sessions will be revoked and they won't be able to log in.";

        if (!confirm(msg)) return;

        setProcessing(deviceId);
        try {
            const res = await fetch("/api/admin/devices/ban", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ deviceId, action, reason: "Admin Action" })
            });
            if (res.ok) {
                router.refresh();
            } else {
                alert(`Failed to ${action} device`);
            }
        } finally {
            setProcessing(null);
        }
    };

    const activeSessions = license.sessions.filter(s => s.active);
    const pastSessions = license.sessions.filter(s => !s.active).sort((a, b) => new Date(b.last_seen_at).getTime() - new Date(a.last_seen_at).getTime()).slice(0, 20);

    // Helper to find device name for a banned ID
    const getDeviceName = (deviceId: string) => {
        const session = license.sessions.find(s => s.device_id === deviceId);
        return session?.device_name || "Unknown Device";
    };

    return (
        <>
            <tr className={`hover:bg-zinc-800/30 ${expanded ? "bg-zinc-800/10" : ""}`}>
                <td className="px-4 py-3">
                    <LicenseKeyDisplay licenseKey={license.license_key} />
                </td>
                <td className="px-4 py-3 text-sm text-zinc-300">{license.email}</td>
                <td className="px-4 py-3">
                    <span className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${license.plan === "test" ? "bg-yellow-500/20 text-yellow-400" :
                        license.plan === "yearly" ? "bg-blue-500/20 text-blue-400" :
                            isLifetime ? "bg-purple-500/20 text-purple-400" :
                                "bg-zinc-500/20 text-zinc-400"
                        }`}>
                        {license.plan}
                    </span>
                </td>
                <td className="px-4 py-3">
                    <span className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${license.status === "active" ? "bg-emerald-500/20 text-emerald-400" :
                        license.status === "revoked" ? "bg-red-600/20 text-red-400 border border-red-500/30" :
                            license.status === "expired" && !isLifetime ? "bg-red-500/20 text-red-400" :
                                "bg-zinc-500/20 text-zinc-400"
                        }`}>
                        {license.status}
                    </span>
                </td>
                <td className="px-4 py-3 text-sm text-zinc-300">
                    <div>{isLifetime ? "Never" : format(expiresAt, "MMM d, yyyy")}</div>
                    <div className={`text-xs ${isExpired ? "text-red-400" : "text-zinc-500"}`}>
                        {isLifetime ? "Lifetime" : (isExpired ? "Expired" : `${daysUntilExpiry} days`)}
                    </div>
                </td>
                <td className="px-4 py-3">
                    <button
                        onClick={() => setExpanded(!expanded)}
                        className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold transition ${license.active_sessions_count > 0
                            ? "bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30"
                            : "bg-zinc-500/20 text-zinc-500 hover:bg-zinc-500/30"
                            }`}
                    >
                        {license.active_sessions_count} Active
                        <svg className={`h-3 w-3 transform transition ${expanded ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                    </button>
                </td>
                <td className="px-4 py-3">
                    {license.duplicate_detected && (
                        <div className="flex flex-col items-start gap-1">
                            <span className="inline-flex rounded-full bg-red-500/20 px-2 py-1 text-xs font-semibold text-red-400 animate-pulse">DUP DETECTED</span>
                        </div>
                    )}
                </td>
                <td className="px-4 py-3">
                    <RevokeLicenseButton licenseKey={license.license_key} email={license.email} />
                </td>
            </tr>
            {expanded && (
                <tr className="bg-zinc-900/40">
                    <td colSpan={8} className="px-6 py-4">
                        <div className="space-y-6">

                            {/* Section 1: Active Sessions */}
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <h4 className="text-xs font-semibold uppercase tracking-wider text-emerald-500/80">Active Sessions</h4>
                                    {license.duplicate_detected && (
                                        <span className="text-[10px] font-bold text-red-400 animate-pulse bg-red-500/10 px-2 py-0.5 rounded border border-red-500/20">
                                            DUPLICATE USAGE DETECTED
                                        </span>
                                    )}
                                </div>
                                {activeSessions.length === 0 ? (
                                    <p className="text-sm text-zinc-500 italic">No active sessions.</p>
                                ) : (
                                    <div className="grid gap-2">
                                        {activeSessions.map(session => {
                                            const isBanned = license.banned_devices.includes(session.device_id);
                                            return (
                                                <div key={session.id} className="flex items-center justify-between rounded-md bg-emerald-500/10 p-3 border border-emerald-500/20">
                                                    <div className="flex items-center gap-4">
                                                        <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                                                        <div>
                                                            <div className="text-sm font-medium text-white flex items-center gap-2">
                                                                {session.device_name || "Unknown Device"}
                                                                {isBanned && <span className="rounded bg-red-500/20 px-1.5 py-0.5 text-[10px] text-red-400 max-w-fit">BANNED</span>}
                                                            </div>
                                                            <div className="text-xs text-zinc-500 font-mono">{session.device_id}</div>
                                                        </div>
                                                    </div>

                                                    <div className="flex items-center gap-4 text-xs text-zinc-400">
                                                        <div className="flex flex-col text-right text-[10px] text-zinc-500 mr-2">
                                                            {session.created_at && (
                                                                <span>Login: {new Date(session.created_at).toLocaleString()}</span>
                                                            )}
                                                            <span className="text-emerald-500/70">Online</span>
                                                        </div>
                                                        <div className="flex gap-2">
                                                            <button
                                                                onClick={() => handleRevokeSession(session.session_id)}
                                                                disabled={!!processing}
                                                                className="text-orange-400 hover:text-orange-300 disabled:opacity-50 transition-all duration-200"
                                                            >
                                                                {processing === session.session_id ? (
                                                                    <span className="flex items-center gap-1.5 text-orange-400/80">
                                                                        <svg className="animate-spin h-3 w-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                                        </svg>
                                                                        <span className="text-[10px] font-semibold tracking-wide uppercase">Pending Revoke</span>
                                                                    </span>
                                                                ) : "Revoke"}
                                                            </button>
                                                            <span className="text-zinc-600">|</span>
                                                            <button
                                                                onClick={() => handleBanDevice(session.device_id, isBanned)}
                                                                disabled={!!processing}
                                                                className={`${isBanned ? "text-emerald-400 hover:text-emerald-300" : "text-red-400 hover:text-red-300"} disabled:opacity-50`}
                                                            >
                                                                {processing === session.device_id ? "..." : (isBanned ? "Unban" : "Ban")}
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>

                            {/* Section 2: Banned Devices (Offline) */}
                            {license.banned_devices.length > 0 && (
                                <div className="space-y-3">
                                    <h4 className="text-xs font-semibold uppercase tracking-wider text-red-400/80">Banned Devices</h4>
                                    <div className="grid gap-2">
                                        {license.banned_devices.map(deviceId => {
                                            // Only show here if NOT in active sessions (duplicates active display)
                                            if (activeSessions.some(s => s.device_id === deviceId)) return null;

                                            return (
                                                <div key={deviceId} className="flex items-center justify-between rounded-md bg-red-500/5 p-3 border border-red-500/20">
                                                    <div className="flex items-center gap-4">
                                                        <div className="h-2 w-2 rounded-full bg-red-500" />
                                                        <div>
                                                            <div className="text-sm font-medium text-white flex items-center gap-2">
                                                                {getDeviceName(deviceId)}
                                                                <span className="rounded bg-red-500/20 px-1.5 py-0.5 text-[10px] text-red-400">BANNED</span>
                                                            </div>
                                                            <div className="text-xs text-zinc-500 font-mono">{deviceId}</div>
                                                        </div>
                                                    </div>
                                                    <div className="text-xs">
                                                        <button
                                                            onClick={() => handleBanDevice(deviceId, true)}
                                                            disabled={!!processing}
                                                            className="text-emerald-400 hover:text-emerald-300 disabled:opacity-50 font-medium"
                                                        >
                                                            {processing === deviceId ? "..." : "Unban Device"}
                                                        </button>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}

                            {/* Section 3: Connection History (Collapsible) */}
                            <div className="space-y-1 pt-2 border-t border-zinc-800/50">
                                <button
                                    onClick={() => setHistoryExpanded(!historyExpanded)}
                                    className="flex items-center gap-2 py-2 px-1 text-xs font-semibold uppercase tracking-wider text-zinc-500 hover:text-zinc-300 transition-colors w-full text-left"
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
                                    <span className="ml-auto text-[10px] font-normal normal-case opacity-50">
                                        {pastSessions.length} records
                                    </span>
                                </button>

                                {historyExpanded && (
                                    <>
                                        {pastSessions.length === 0 ? (
                                            <p className="text-sm text-zinc-500 italic pl-6">No history available.</p>
                                        ) : (
                                            <div className="grid gap-2 opacity-75 hover:opacity-100 transition-opacity pl-4">
                                                {pastSessions.map(session => {
                                                    const isBanned = license.banned_devices.includes(session.device_id);
                                                    return (
                                                        <div key={session.id} className="flex items-center justify-between rounded-md bg-zinc-800/30 p-2 border border-zinc-800">
                                                            <div className="flex items-center gap-4">
                                                                <div className={`h-1.5 w-1.5 rounded-full ${isBanned ? "bg-red-500" : "bg-zinc-600"}`} />
                                                                <div>
                                                                    <div className="text-xs font-medium text-zinc-300">
                                                                        {session.device_name || "Unknown Device"}
                                                                        {isBanned && <span className="ml-2 text-red-400 text-[10px] uppercase font-bold">Banned</span>}
                                                                    </div>
                                                                    <div className="text-[10px] text-zinc-600 font-mono">{session.device_id.substring(0, 16)}...</div>
                                                                </div>
                                                            </div>

                                                            <div className="flex flex-col text-[10px] text-zinc-500 mr-4 min-w-[140px] text-right">
                                                                {session.created_at && (
                                                                    <span>Login: {new Date(session.created_at).toLocaleString()}</span>
                                                                )}
                                                                <span>Seen: {new Date(session.last_seen_at).toLocaleString()}</span>
                                                            </div>

                                                            <div className="flex items-center gap-4 text-xs text-zinc-400">
                                                                <div className="px-1.5 py-0.5 rounded bg-zinc-700/50 text-zinc-400 text-[10px] uppercase">Ended</div>
                                                                <button
                                                                    onClick={() => handleBanDevice(session.device_id, isBanned)}
                                                                    disabled={!!processing}
                                                                    className={`${isBanned ? "text-emerald-500 hover:text-emerald-400" : "text-zinc-500 hover:text-red-400"} disabled:opacity-50`}
                                                                >
                                                                    {processing === session.device_id ? "..." : (isBanned ? "Unban" : "Ban")}
                                                                </button>
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        )}
                                    </>
                                )}
                            </div>
                        </div>
                    </td>
                </tr>
            )}
        </>
    );
}
