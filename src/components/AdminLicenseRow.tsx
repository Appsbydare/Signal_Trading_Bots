"use client";

import { format } from "date-fns";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { RevokeLicenseButton } from "./RevokeLicenseButton";
import { LicenseKeyDisplay } from "./LicenseKeyDisplay";
import toast from "react-hot-toast";
import { ConfirmationModal } from "@/components/ConfirmationModal";
import { ChangePlanModal } from "@/components/ChangePlanModal";

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
    upgraded_from?: string | null;
    duplicate_detected: boolean;
    grace_period_allowed: boolean;
    active_sessions_count: number;
    sessions: LicenseSession[];
    banned_devices: string[];
    subscription_id?: string | null;
    payment_type?: string | null;
    subscription_status?: string | null;
    subscription_cancel_at_period_end?: boolean | null;
}

interface AdminLicenseRowProps {
    license: EnrichedLicense;
    plans: {
        key: string;
        name: string;
        priceId: string;
        amount: number;
        interval: string | null;
    }[];
}

export function AdminLicenseRow({ license, plans }: AdminLicenseRowProps) {
    const [expanded, setExpanded] = useState(false);
    const [historyExpanded, setHistoryExpanded] = useState(false);
    const router = useRouter();
    const [processing, setProcessing] = useState<string | null>(null);

    // Confirmation Modal State
    const [confirmModal, setConfirmModal] = useState<{
        isOpen: boolean;
        title: string;
        message: string;
        onConfirm: () => Promise<void> | void;
        isDestructive?: boolean;
        confirmLabel?: string;
    }>({
        isOpen: false,
        title: "",
        message: "",
        onConfirm: () => { },
    });

    const closeConfirmModal = () => setConfirmModal(prev => ({ ...prev, isOpen: false }));

    const [isChangePlanModalOpen, setIsChangePlanModalOpen] = useState(false);

    // Get current plan name from license or plans list
    const currentPlanName = plans.find(p => p.key === license.plan || p.priceId === license.plan)?.name || license.plan;

    // Helper to check if it's a subscription that can be changed
    const canChangePlan = license.subscription_id && license.status !== 'revoked' && license.status !== 'expired';

    const expiresAt = new Date(license.expires_at);
    const isLifetime = license.plan.toLowerCase() === 'lifetime';
    const isExpired = !isLifetime && expiresAt < new Date();
    const isSubscription = license.payment_type === 'subscription';
    const daysUntilExpiry = isLifetime ? 9999 : Math.ceil(
        (expiresAt.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
    );

    const handleRevokeSession = async (sessionId: string) => {
        setConfirmModal({
            isOpen: true,
            title: "Revoke Session?",
            message: "Are you sure you want to revoke this session? The device will be disconnected immediately.",
            isDestructive: true,
            confirmLabel: "Revoke Session",
            onConfirm: async () => {
                setProcessing(sessionId);
                try {
                    const res = await fetch("/api/license/sessions/revoke", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ sessionId })
                    });
                    if (res.ok) {
                        toast.success("Session revoked successfully");
                        router.refresh();
                    } else {
                        toast.error("Failed to revoke session");
                    }
                } catch (e) {
                    toast.error("An error occurred");
                } finally {
                    setProcessing(null);
                    closeConfirmModal();
                }
            }
        });
    };

    const handleBanDevice = async (deviceId: string, isBanned: boolean) => {
        const action = isBanned ? "unban" : "ban";
        const title = isBanned ? "Unban Device?" : "Ban Device?";
        const msg = isBanned
            ? "Unban this device? They will be able to log in again."
            : "Ban this device? All their sessions will be revoked and they won't be able to log in.";

        setConfirmModal({
            isOpen: true,
            title: title,
            message: msg,
            isDestructive: !isBanned,
            confirmLabel: isBanned ? "Unban Device" : "Ban Device",
            onConfirm: async () => {
                setProcessing(deviceId);
                try {
                    const res = await fetch("/api/admin/devices/ban", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ deviceId, action, reason: "Admin Action" })
                    });
                    if (res.ok) {
                        toast.success(`Device ${action}ned successfully`);
                        router.refresh();
                    } else {
                        toast.error(`Failed to ${action} device`);
                    }
                } catch (e) {
                    toast.error("An error occurred");
                } finally {
                    setProcessing(null);
                    closeConfirmModal();
                }
            }
        });
    };

    const handleDeleteLicense = async () => {
        setConfirmModal({
            isOpen: true,
            title: "Delete License?",
            message: "Are you sure you want to PERMANENTLY delete this license? This cannot be undone and all data will be lost.",
            isDestructive: true,
            confirmLabel: "Delete Forever",
            onConfirm: async () => {
                setProcessing(license.license_key);
                try {
                    const res = await fetch("/api/admin/licenses/delete", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ licenseKey: license.license_key })
                    });
                    if (res.ok) {
                        toast.success("License deleted successfully");
                        router.refresh();
                    } else {
                        const data = await res.json();
                        toast.error(data.error || "Failed to delete license");
                    }
                } catch (e) {
                    toast.error("Error deleting license");
                } finally {
                    setProcessing(null);
                    closeConfirmModal();
                }
            }
        });
    };

    const activeSessions = license.sessions.filter(s => s.active);
    const pastSessions = license.sessions.filter(s => !s.active).sort((a, b) => new Date(b.last_seen_at).getTime() - new Date(a.last_seen_at).getTime()).slice(0, 20);

    const getDeviceName = (deviceId: string) => {
        const session = license.sessions.find(s => s.device_id === deviceId);
        return session?.device_name || "Unknown Device";
    };

    const getPlanBadgeStyle = (planName: string) => {
        const p = planName.toLowerCase();
        if (p === 'test') return "bg-yellow-500/20 text-yellow-400 border border-yellow-500/20";
        if (p === 'lifetime') return "bg-amber-500/20 text-amber-400 border border-amber-500/20";
        if (p.includes('yearly')) return "bg-indigo-500/20 text-indigo-400 border border-indigo-500/20";
        if (p.includes('pro')) return "bg-purple-500/20 text-purple-400 border border-purple-500/20";
        if (p.includes('starter')) return "bg-blue-500/20 text-blue-400 border border-blue-500/20";
        return "bg-zinc-500/20 text-zinc-400";
    };

    return (
        <>
            <tr className={`hover:bg-zinc-800/30 ${expanded ? "bg-zinc-800/10" : ""} group`}>
                <td className="px-4 py-3">
                    <LicenseKeyDisplay licenseKey={license.license_key} />
                    {isSubscription && license.subscription_id && (
                        <div className="mt-1 text-[10px] text-zinc-500 font-mono hidden group-hover:block transition-all">
                            Sub: {license.subscription_id.substring(0, 12)}...
                        </div>
                    )}
                </td>
                <td className="px-4 py-3 text-sm text-zinc-300">{license.email}</td>
                <td className="px-4 py-3">
                    <div className="flex flex-col gap-1 items-start">
                        <div className="flex items-center gap-1.5">
                            <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${getPlanBadgeStyle(license.plan)}`}>
                                {currentPlanName}
                            </span>
                            {canChangePlan && (
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setIsChangePlanModalOpen(true);
                                    }}
                                    className="text-zinc-500 hover:text-white hover:bg-zinc-700/50 rounded p-0.5 transition-colors"
                                    title="Change Plan"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5 cursor-pointer">
                                        <path d="M5.433 13.917l1.262-3.155A4 4 0 017.58 9.42l6.92-6.918a2.121 2.121 0 013 3l-6.92 6.918c-.383.383-.84.685-1.343.886l-3.154 1.262a.5.5 0 01-.65-.65z" />
                                        <path d="M3.5 5.75c0-.69.56-1.25 1.25-1.25H10A.75.75 0 0010 3H4.75A2.75 2.75 0 002 5.75v9.5A2.75 2.75 0 004.75 18h9.5A2.75 2.75 0 0017 15.25V10a.75.75 0 00-1.5 0v5.25c0 .69-.56 1.25-1.25 1.25h-9.5c-.69 0-1.25-.56-1.25-1.25v-9.5z" />
                                    </svg>
                                </button>
                            )}
                        </div>
                        {license.upgraded_from && (
                            <span className="inline-flex items-center gap-1 rounded-full px-1.5 py-0.5 text-[10px] font-medium bg-gradient-to-r from-indigo-500/20 to-purple-500/20 text-indigo-300 border border-indigo-500/20">
                                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
                                Upgraded
                            </span>
                        )}
                    </div>
                </td>
                <td className="px-4 py-3">
                    <div className="flex flex-col gap-1">
                        <span className={`inline-flex w-fit rounded-full px-2 py-1 text-xs font-semibold ${license.status === "active" ? "bg-emerald-500/20 text-emerald-400" :
                            license.status === "revoked" ? "bg-red-600/20 text-red-400 border border-red-500/30" :
                                license.status === "expired" && !isLifetime ? "bg-red-500/20 text-red-400" :
                                    "bg-zinc-500/20 text-zinc-400"
                            }`}>
                            {license.status}
                        </span>

                        {/* Trial Badge */}
                        {isSubscription && license.subscription_status === 'trialing' && (
                            <span className="inline-flex w-fit rounded-full px-2 py-0.5 text-[10px] font-medium bg-blue-500/10 text-blue-400 border border-blue-500/20">
                                Trial Active
                            </span>
                        )}

                        {isSubscription && license.subscription_status && license.subscription_status !== 'trialing' && (
                            <span className={`text-[10px] flex items-center gap-1 ${license.subscription_cancel_at_period_end ? 'text-amber-500' : 'text-zinc-500'}`}>
                                {license.subscription_cancel_at_period_end ? 'Activates Cancel' : 'Auto-renewing'}
                            </span>
                        )}
                    </div>
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
                    {license.status === 'revoked' ? (
                        <button
                            onClick={handleDeleteLicense}
                            disabled={!!processing}
                            title="Start Deletion (Irreversible)"
                            className="p-1.5 rounded-md text-zinc-500 hover:text-red-500 hover:bg-red-500/10 transition-colors disabled:opacity-50"
                        >
                            {processing === license.license_key ? (
                                <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                            ) : (
                                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                            )}
                        </button>
                    ) : (
                        <RevokeLicenseButton licenseKey={license.license_key} email={license.email} />
                    )}
                </td>
            </tr>
            {expanded && (
                <tr className="bg-zinc-900/40">
                    <td colSpan={7} className="px-6 py-4">
                        <div className="space-y-6">

                            {isSubscription && license.subscription_id && (
                                <div className="rounded-md border border-blue-500/20 bg-blue-500/5 p-3 flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 rounded-full bg-blue-500/20 text-blue-400">
                                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>
                                        </div>
                                        <div>
                                            <div className="text-xs font-semibold text-blue-300 uppercase tracking-wide">Subscription Details</div>
                                            <div className="text-xs text-zinc-400 font-mono mt-0.5">{license.subscription_id}</div>
                                            <div className="text-sm text-zinc-300">
                                                Status: <span className="text-white capitalize">{license.subscription_status?.replace('_', ' ')}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <a
                                            href={`https://dashboard.stripe.com/subscriptions/${license.subscription_id}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-xs text-blue-400 hover:text-blue-300 hover:underline flex items-center gap-1"
                                        >
                                            View in Stripe
                                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                                        </a>
                                    </div>
                                </div>
                            )}

                            {license.upgraded_from && (
                                <div className="rounded-md border border-indigo-500/20 bg-indigo-500/5 p-3 flex items-center gap-3">
                                    <div className="p-2 rounded-full bg-indigo-500/20 text-indigo-400">
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
                                    </div>
                                    <div>
                                        <div className="text-xs font-semibold text-indigo-300 uppercase tracking-wide">Plan Upgrade History</div>
                                        <div className="text-sm text-zinc-300">
                                            Upgraded from <span className="text-white font-medium">{license.upgraded_from}</span> to <span className="text-white font-medium">{license.plan}</span>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <h4 className="text-xs font-semibold uppercase tracking-wider text-emerald-500/80">Active Sessions</h4>
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

                            {license.banned_devices.length > 0 && (
                                <div className="space-y-3">
                                    <h4 className="text-xs font-semibold uppercase tracking-wider text-red-400/80">Banned Devices</h4>
                                    <div className="grid gap-2">
                                        {license.banned_devices.map(deviceId => {
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

            <ConfirmationModal
                isOpen={confirmModal.isOpen}
                onClose={closeConfirmModal}
                onConfirm={confirmModal.onConfirm}
                title={confirmModal.title}
                message={confirmModal.message}
                isDestructive={confirmModal.isDestructive}
                confirmLabel={confirmModal.confirmLabel}
                isLoading={!!processing}
            />

            {canChangePlan && (
                <ChangePlanModal
                    isOpen={isChangePlanModalOpen}
                    onClose={() => setIsChangePlanModalOpen(false)}
                    onSuccess={() => {
                        router.refresh();
                        setIsChangePlanModalOpen(false);
                    }}
                    subscriptionId={license.subscription_id!}
                    currentPlanName={currentPlanName}
                    plans={plans}
                />
            )}
        </>
    );
}
