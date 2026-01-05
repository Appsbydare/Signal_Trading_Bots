"use client";

import { useState, Fragment } from "react";
import { format } from "date-fns";

export interface SecurityLog {
    id: number;
    license_key: string;
    device_id: string | null;
    device_name: string | null;
    event_type: string;
    success: boolean;
    error_code: string | null;
    ip_address: string | null;
    created_at: string;
    details: any | null;
    // Enriched fields
    user_email?: string;
    license_plan?: string;
    license_status?: string;
}

interface SecurityLogsTableProps {
    logs: SecurityLog[];
    loading?: boolean;
}

export function SecurityLogsTable({ logs, loading }: SecurityLogsTableProps) {
    const [expandedRow, setExpandedRow] = useState<number | null>(null);

    const toggleRow = (id: number) => {
        setExpandedRow(expandedRow === id ? null : id);
    };

    const getEventBadge = (type: string, success: boolean) => {
        if (type === 'duplicate_detected' || type === 'login_requested') {
            const bg = type === 'duplicate_detected' ? 'bg-red-500/20 text-red-300 border-red-500/30' : 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30';
            return <span className={`px-2 py-0.5 rounded text-xs border ${bg}`}>{type.replace('_', ' ').toUpperCase()}</span>;
        }
        if (!success) {
            return <span className="px-2 py-0.5 rounded text-xs border bg-red-500/20 text-red-400 border-red-500/30">FAILED</span>;
        }
        return <span className="px-2 py-0.5 rounded text-xs border bg-emerald-500/20 text-emerald-400 border-emerald-500/30">{type.toUpperCase()}</span>;
    };

    if (loading) {
        return <div className="p-8 text-center text-zinc-400 animate-pulse">Loading security logs...</div>;
    }

    if (logs.length === 0) {
        return <div className="p-8 text-center text-zinc-500 italic">No security events found.</div>;
    }

    return (
        <div className="w-full overflow-hidden rounded-lg border border-zinc-800 bg-zinc-900/50">
            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-zinc-400">
                    <thead className="bg-zinc-800/80 text-zinc-200 uppercase text-xs border-b border-zinc-800">
                        <tr>
                            <th className="px-4 py-3 font-semibold">Time</th>
                            <th className="px-4 py-3 font-semibold">Event</th>
                            <th className="px-4 py-3 font-semibold">User</th>
                            <th className="px-4 py-3 font-semibold">License / Device</th>
                            <th className="px-4 py-3 font-semibold">IP Address</th>
                            <th className="px-4 py-3 font-semibold text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-800">
                        {logs.map((log) => (
                            <Fragment key={log.id}>
                                <tr
                                    className={`hover:bg-zinc-800/50 transition-colors cursor-pointer ${log.event_type === 'duplicate_detected' ? 'bg-red-500/5' : ''}`}
                                    onClick={() => toggleRow(log.id)}
                                >
                                    <td className="px-6 py-4 whitespace-nowrap font-mono text-zinc-500">
                                        {format(new Date(log.created_at), "MMM d, HH:mm:ss")}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col gap-1 items-start">
                                            <div>{getEventBadge(log.event_type, log.success)}</div>
                                            {log.error_code && <span className="text-xs text-zinc-500 font-mono">{log.error_code}</span>}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        {log.user_email ? (
                                            <div className="flex flex-col">
                                                <span className="text-zinc-200">{log.user_email}</span>
                                                <div className="flex gap-2 text-xs">
                                                    {log.license_plan && <span className="text-zinc-500">{log.license_plan}</span>}
                                                </div>
                                            </div>
                                        ) : (
                                            <span className="text-zinc-500 italic font-mono text-xs">{log.license_key ? `${log.license_key.substring(0, 8)}...` : 'Unknown'}</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col">
                                            <span className="text-zinc-400 font-mono text-xs">{log.license_key}</span>
                                            <div className="flex items-center gap-2 text-xs text-zinc-500">
                                                {log.device_name && <span className="text-blue-400">{log.device_name}</span>}
                                                <span>{log.device_id ? `(${log.device_id.substring(0, 8)}...)` : '-'}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 font-mono text-xs">
                                        {log.ip_address || '-'}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button
                                            onClick={(e) => { e.stopPropagation(); toggleRow(log.id); }}
                                            className="text-xs text-blue-400 hover:text-blue-300"
                                        >
                                            {expandedRow === log.id ? "Hide Details" : "View Details"}
                                        </button>
                                    </td>
                                </tr>
                                {expandedRow === log.id && (
                                    <tr className="bg-zinc-900/40">
                                        <td colSpan={6} className="px-6 py-4">
                                            <div className="bg-zinc-900 rounded p-4 border border-zinc-800 shadow-inner">
                                                <h4 className="text-xs font-semibold text-zinc-400 uppercase mb-2">Event Details</h4>
                                                {log.details ? (
                                                    <pre className="text-xs font-mono text-green-300/90 whitespace-pre-wrap break-all p-2 bg-zinc-950 rounded border border-zinc-800">
                                                        {JSON.stringify(log.details, null, 2)}
                                                    </pre>
                                                ) : (
                                                    <span className="text-xs text-zinc-600 italic">No additional details recorded for this event.</span>
                                                )}

                                                <div className="mt-4 grid grid-cols-2 gap-4 border-t border-zinc-800 pt-3">
                                                    <div>
                                                        <span className="text-zinc-500 text-xs">Raw Device ID:</span>
                                                        <div className="text-zinc-300 font-mono text-xs break-all">{log.device_id}</div>
                                                    </div>
                                                    <div>
                                                        <span className="text-zinc-500 text-xs">User Agent:</span>
                                                        <div className="text-zinc-300 text-xs break-all">{log.details?.userAgent || log.details?.user_agent || log.details?.userAgent || '-'}</div>
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </Fragment>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
