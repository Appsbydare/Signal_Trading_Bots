"use client";

import { useState } from "react";
import Link from "next/link";

interface License {
  id: number;
  plan: string;
  license_key: string;
  status: string;
  expires_at: string;
  upgraded_from?: string | null;
}

interface LicenseTableProps {
  licenses: License[];
}

function getLicenseStatusColor(daysRemaining: number): string {
  if (daysRemaining <= 7) return "text-red-600 bg-red-50";
  if (daysRemaining <= 30) return "text-amber-700 bg-amber-50";
  return "text-emerald-700 bg-emerald-50";
}

export function LicenseTable({ licenses }: LicenseTableProps) {
  const [revealedKeys, setRevealedKeys] = useState<Set<number>>(new Set());
  const [copiedKey, setCopiedKey] = useState<number | null>(null);

  const toggleReveal = (licenseId: number) => {
    setRevealedKeys(prev => {
      const newSet = new Set(prev);
      if (newSet.has(licenseId)) {
        newSet.delete(licenseId);
      } else {
        newSet.add(licenseId);
      }
      return newSet;
    });
  };

  const copyToClipboard = async (licenseKey: string, licenseId: number) => {
    try {
      await navigator.clipboard.writeText(licenseKey);
      setCopiedKey(licenseId);
      setTimeout(() => setCopiedKey(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const maskKey = (key: string) => {
    const parts = key.split('-');
    return parts.map((part, index) => index === 0 ? part : '****').join('-');
  };

  return (
    <div className="overflow-x-auto">
      {/* Toast notification */}
      {copiedKey !== null && (
        <div className="fixed top-20 right-6 z-50 animate-in fade-in slide-in-from-top-2">
          <div className="rounded-lg border border-green-500/30 bg-green-500/10 px-4 py-3 shadow-lg backdrop-blur-sm">
            <div className="flex items-center gap-2">
              <svg className="h-5 w-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span className="text-sm font-medium text-green-300">License key copied!</span>
            </div>
          </div>
        </div>
      )}

      <table className="min-w-full divide-y divide-zinc-800 text-sm">
        <thead className="bg-zinc-800/50">
          <tr>
            <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-zinc-500">
              Product / Plan
            </th>
            <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-zinc-500">
              License Key
            </th>
            <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-zinc-500">
              Status
            </th>
            <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-zinc-500">
              Expires
            </th>
            <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-zinc-500">
              Days Left
            </th>
            <th className="px-3 py-2 text-right text-xs font-semibold uppercase tracking-wide text-zinc-500">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-800">
          {licenses.map((lic) => {
            const expiresAt = new Date(lic.expires_at);
            const now = new Date();
            const daysRemaining = Math.max(
              0,
              Math.ceil(
                (expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24),
              ),
            );
            const isLifetime = lic.plan.toLowerCase() === 'lifetime';
            const isRevealed = revealedKeys.has(lic.id);

            return (
              <tr key={lic.id}>
                <td className="whitespace-nowrap px-3 py-3 text-xs text-zinc-300">
                  <div className="flex flex-col gap-1">
                    <div className="font-medium capitalize">{lic.plan}</div>
                    {lic.upgraded_from && (
                      <div className="flex flex-col items-start gap-0.5">
                        <span className="inline-flex items-center gap-1 rounded-full px-1.5 py-0.5 text-[0.6rem] font-medium bg-indigo-500/20 text-indigo-300 border border-indigo-500/20">
                          <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
                          Upgraded
                        </span>
                        <span className="text-[0.65rem] text-zinc-500">
                          From {lic.upgraded_from}
                        </span>
                      </div>
                    )}
                  </div>
                </td>
                <td className="whitespace-nowrap px-3 py-3 text-xs text-zinc-300">
                  <div className="flex items-center gap-2">
                    <code
                      onClick={() => copyToClipboard(lic.license_key, lic.id)}
                      className="cursor-pointer rounded bg-zinc-800 px-2 py-1 text-[0.7rem] font-mono text-white hover:bg-zinc-700 transition-colors"
                      title="Click to copy"
                    >
                      {isRevealed ? lic.license_key : maskKey(lic.license_key)}
                    </code>
                    <button
                      onClick={() => toggleReveal(lic.id)}
                      className="text-zinc-400 hover:text-zinc-300 transition-colors"
                      title={isRevealed ? "Hide key" : "Reveal key"}
                    >
                      {isRevealed ? (
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                        </svg>
                      ) : (
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      )}
                    </button>
                  </div>
                </td>
                <td className="whitespace-nowrap px-3 py-3 text-xs text-zinc-300">
                  <span className="inline-flex rounded-full bg-zinc-800 px-2 py-1 text-[0.7rem] capitalize text-zinc-300">
                    {lic.status}
                  </span>
                </td>
                <td className="whitespace-nowrap px-3 py-3 text-xs text-zinc-300">
                  {isLifetime ? 'Never' : expiresAt.toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: '2-digit',
                    day: '2-digit'
                  })}
                </td>
                <td className="whitespace-nowrap px-3 py-3 text-xs">
                  <span
                    className={`inline-flex rounded-full px-2 py-1 text-[0.7rem] ${isLifetime
                      ? 'text-emerald-700 bg-emerald-50'
                      : getLicenseStatusColor(daysRemaining)
                      }`}
                  >
                    {isLifetime ? 'Lifetime' : `${daysRemaining} days`}
                  </span>
                </td>
                <td className="whitespace-nowrap px-3 py-3 text-right text-xs">
                  <div className="flex justify-end gap-2">
                    <Link
                      href="/products"
                      className="rounded-md border border-zinc-700 bg-zinc-800 px-2 py-1 text-[0.7rem] font-medium text-white hover:bg-zinc-700"
                    >
                      View details
                    </Link>
                    <Link
                      href="/products#plans"
                      className="rounded-md bg-[#5e17eb] px-2 py-1 text-[0.7rem] font-medium text-white hover:bg-[#4512c2]"
                    >
                      Renew / Upgrade
                    </Link>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
