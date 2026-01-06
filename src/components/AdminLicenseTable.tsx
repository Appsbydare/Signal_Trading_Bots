"use client";

import { useState, useMemo } from "react";
import { AdminLicenseRow } from "./AdminLicenseRow";

// Helper type matching the data structure from page.tsx
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
}

interface AdminLicenseTableProps {
    licenses: EnrichedLicense[];
}

export function AdminLicenseTable({ licenses }: AdminLicenseTableProps) {
    const [filterStatus, setFilterStatus] = useState<string>("all");
    const [searchTerm, setSearchTerm] = useState("");

    const filteredAndSortedLicenses = useMemo(() => {
        let result = [...licenses];

        // 1. Filter
        if (filterStatus !== "all") {
            result = result.filter(l => l.status === filterStatus);
        }

        if (searchTerm) {
            const lower = searchTerm.toLowerCase();
            result = result.filter(l =>
                l.email?.toLowerCase().includes(lower) ||
                l.license_key.toLowerCase().includes(lower)
            );
        }

        // 2. Sort: Active Top, Revoked Bottom, others in between?
        // Priority: Active > Expired > Revoked
        const statusPriority: Record<string, number> = {
            'active': 3,
            'test': 2,
            'expired': 1,
            'revoked': 0
        };

        result.sort((a, b) => {
            const pA = statusPriority[a.status] ?? 1;
            const pB = statusPriority[b.status] ?? 1;

            if (pA !== pB) {
                return pB - pA; // Descending priority (Active first)
            }

            // Secondary sort: Creation date descending
            return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        });

        return result;
    }, [licenses, filterStatus, searchTerm]);

    return (
        <section className="rounded-xl border border-zinc-800 bg-zinc-900/50 shadow-sm">
            <div className="border-b border-zinc-800 p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-lg font-semibold text-white">All Licenses</h2>
                    <p className="mt-1 text-sm text-zinc-400">Complete list of all licenses in the system</p>
                </div>

                {/* Filters */}
                <div className="flex flex-wrap gap-2">
                    <input
                        type="text"
                        placeholder="Search email or key..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="rounded-md border border-zinc-700 bg-zinc-800 px-3 py-1.5 text-sm text-white placeholder-zinc-500 focus:border-blue-500 focus:outline-none"
                    />

                    <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        className="rounded-md border border-zinc-700 bg-zinc-800 px-3 py-1.5 text-sm text-white focus:border-blue-500 focus:outline-none"
                    >
                        <option value="all">All Status</option>
                        <option value="active">Active</option>
                        <option value="revoked">Revoked</option>
                        <option value="expired">Expired</option>
                    </select>
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead className="border-b border-zinc-800 bg-zinc-800/50">
                        <tr>
                            <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-zinc-500 w-48">
                                License Key
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-zinc-500">
                                Email
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-zinc-500">
                                Plan
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-zinc-500">
                                Status
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-zinc-500">
                                Expires
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-zinc-500">
                                Sessions
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-zinc-500 min-w-[100px]">
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-800">
                        {filteredAndSortedLicenses.length === 0 ? (
                            <tr>
                                <td colSpan={7} className="px-6 py-12 text-center text-sm text-zinc-500">
                                    No licenses found
                                </td>
                            </tr>
                        ) : (
                            filteredAndSortedLicenses.map((license) => (
                                <AdminLicenseRow key={license.id} license={license as any} />
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            <div className="border-t border-zinc-800 p-4 text-xs text-zinc-500 text-center">
                Showing {filteredAndSortedLicenses.length} of {licenses.length} licenses
            </div>
        </section>
    );
}
