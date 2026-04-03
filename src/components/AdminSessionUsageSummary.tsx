"use client";

import { format } from "date-fns";
import { wallClockMsForLicense } from "@/lib/session-analytics";
import {
  computeLicenseSessionUsageStats,
  formatSessionDurationMs,
  type SessionLike,
} from "@/lib/format-session-duration";

export function AdminSessionUsageSummary({ sessions }: { sessions: SessionLike[] }) {
  const stats = computeLicenseSessionUsageStats(sessions);
  const nowMs = Date.now();
  const wallClockAllMs = wallClockMsForLicense(sessions, nowMs);
  const wallClock7dMs = wallClockMsForLicense(sessions, nowMs, {
    start: nowMs - 7 * 24 * 60 * 60 * 1000,
    end: nowMs,
  });

  if (sessions.length === 0) {
    return (
      <div className="rounded-lg border border-zinc-700/80 bg-zinc-800/30 p-4">
        <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Session usage</h4>
        <p className="mt-2 text-sm text-zinc-500">No session history for this license yet.</p>
      </div>
    );
  }

  const cell =
    "rounded-md border border-zinc-700/60 bg-zinc-900/50 px-3 py-2.5 min-w-0";

  return (
    <div className="rounded-lg border border-violet-500/20 bg-violet-500/[0.06] p-4">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <h4 className="text-xs font-semibold uppercase tracking-wider text-violet-300">Session usage</h4>
        <p className="max-w-xl text-[10px] leading-snug text-zinc-500">
          Raw total = sum of stints (login → <span className="text-zinc-400">ended_at</span> or last ping; active → now). Two
          devices overlap in time still add. <span className="text-cyan-500/90">Wall-clock</span> merges overlaps for this
          license only.
        </p>
      </div>

      <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
        <div className={cell}>
          <div className="text-[10px] font-medium uppercase tracking-wide text-zinc-500">Total connected</div>
          <div className="mt-1 text-lg font-semibold tabular-nums text-white">
            {formatSessionDurationMs(stats.totalMs)}
          </div>
          <div className="mt-0.5 text-[10px] text-zinc-500">
            {stats.sessionRowCount} row{stats.sessionRowCount === 1 ? "" : "s"} in DB
          </div>
        </div>

        <div className={cell}>
          <div className="text-[10px] font-medium uppercase tracking-wide text-zinc-500">Active vs ended</div>
          <div className="mt-1 space-y-0.5 text-sm text-zinc-200">
            <div>
              <span className="text-emerald-400/90">Active runs</span>{" "}
              <span className="font-medium tabular-nums">{formatSessionDurationMs(stats.totalActiveStintsMs)}</span>
              <span className="text-zinc-500"> ({stats.activeCount})</span>
            </div>
            <div>
              <span className="text-zinc-400">Ended runs</span>{" "}
              <span className="font-medium tabular-nums">{formatSessionDurationMs(stats.totalEndedStintsMs)}</span>
              <span className="text-zinc-500"> ({stats.endedCount})</span>
            </div>
          </div>
        </div>

        <div className={cell}>
          <div className="text-[10px] font-medium uppercase tracking-wide text-zinc-500">Longest single run</div>
          <div className="mt-1 text-lg font-semibold tabular-nums text-zinc-100">
            {formatSessionDurationMs(stats.longestStintMs)}
          </div>
        </div>

        <div className={cell}>
          <div className="text-[10px] font-medium uppercase tracking-wide text-zinc-500">First login · Last activity</div>
          <div className="mt-1 space-y-0.5 text-xs text-zinc-300">
            {stats.firstLoginAtMs != null && (
              <div>
                <span className="text-zinc-500">First: </span>
                {format(stats.firstLoginAtMs, "MMM d, yyyy HH:mm")}
              </div>
            )}
            {stats.lastActivityAtMs != null && (
              <div>
                <span className="text-zinc-500">Last: </span>
                {format(stats.lastActivityAtMs, "MMM d, yyyy HH:mm")}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="mt-3 grid gap-2 sm:grid-cols-2">
        <div className="rounded-md border border-cyan-500/25 bg-cyan-500/5 px-3 py-2.5">
          <div className="text-[10px] font-medium uppercase tracking-wide text-cyan-400/90">Wall-clock (all time)</div>
          <div className="mt-0.5 text-base font-semibold tabular-nums text-cyan-200">
            {formatSessionDurationMs(wallClockAllMs)}
          </div>
          <p className="mt-1 text-[10px] text-zinc-500">Merged overlaps across devices for this customer.</p>
        </div>
        <div className="rounded-md border border-cyan-500/25 bg-cyan-500/5 px-3 py-2.5">
          <div className="text-[10px] font-medium uppercase tracking-wide text-cyan-400/90">Wall-clock (last 7 days)</div>
          <div className="mt-0.5 text-base font-semibold tabular-nums text-cyan-200">
            {formatSessionDurationMs(wallClock7dMs)}
          </div>
        </div>
      </div>
    </div>
  );
}
