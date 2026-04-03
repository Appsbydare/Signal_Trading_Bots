import { sessionStintInterval, type SessionStintFields } from "./session-analytics";

/** Human-readable duration from milliseconds (non-negative). */
export function formatSessionDurationMs(ms: number): string {
  if (!Number.isFinite(ms) || ms <= 0) return "0m";
  const sec = Math.floor(ms / 1000);
  const d = Math.floor(sec / 86400);
  const h = Math.floor((sec % 86400) / 3600);
  const m = Math.floor((sec % 3600) / 60);
  if (d > 0) return h > 0 ? `${d}d ${h}h` : `${d}d`;
  if (h > 0) return m > 0 ? `${h}h ${m}m` : `${h}h`;
  if (m > 0) return `${m}m`;
  return "<1m";
}

export type SessionLike = SessionStintFields;

/** Length of one session row: login → ended_at (or last_seen) → now if active. */
export function sessionStintDurationMs(session: SessionLike, nowMs: number = Date.now()): number {
  const iv = sessionStintInterval(session, nowMs);
  return Math.max(0, iv.end - iv.start);
}

export function totalSessionsDurationMs(sessions: SessionLike[], nowMs: number = Date.now()): number {
  return sessions.reduce((acc, s) => acc + sessionStintDurationMs(s, nowMs), 0);
}

/** For an active session, time since login (current stint). */
export function activeSessionElapsedMs(session: SessionLike, nowMs: number = Date.now()): number {
  if (!session.active) return 0;
  return sessionStintDurationMs(session, nowMs);
}

export type LicenseSessionUsageStats = {
  /** Sum of all stint lengths (ended = login→ended_at; active = login→now). */
  totalMs: number;
  totalActiveStintsMs: number;
  totalEndedStintsMs: number;
  sessionRowCount: number;
  activeCount: number;
  endedCount: number;
  longestStintMs: number;
  firstLoginAtMs: number | null;
  /** Latest last_seen or now for any active row. */
  lastActivityAtMs: number | null;
};

/**
 * Aggregate usage for one license from its session rows.
 * Note: if two devices are online together, their stints add up (can exceed wall-clock time).
 */
export function computeLicenseSessionUsageStats(
  sessions: SessionLike[],
  nowMs: number = Date.now()
): LicenseSessionUsageStats {
  let totalActiveStintsMs = 0;
  let totalEndedStintsMs = 0;
  let longestStintMs = 0;
  let firstLoginAtMs: number | null = null;
  let lastActivityAtMs: number | null = null;

  for (const s of sessions) {
    const stint = sessionStintDurationMs(s, nowMs);
    longestStintMs = Math.max(longestStintMs, stint);
    const start = new Date(s.created_at).getTime();
    const activityEnd = s.active
      ? nowMs
      : s.ended_at
        ? new Date(s.ended_at).getTime()
        : new Date(s.last_seen_at).getTime();
    if (firstLoginAtMs === null || start < firstLoginAtMs) firstLoginAtMs = start;
    lastActivityAtMs =
      lastActivityAtMs === null ? activityEnd : Math.max(lastActivityAtMs, activityEnd);

    if (s.active) totalActiveStintsMs += stint;
    else totalEndedStintsMs += stint;
  }

  return {
    totalMs: totalActiveStintsMs + totalEndedStintsMs,
    totalActiveStintsMs,
    totalEndedStintsMs,
    sessionRowCount: sessions.length,
    activeCount: sessions.filter((s) => s.active).length,
    endedCount: sessions.filter((s) => !s.active).length,
    longestStintMs,
    firstLoginAtMs,
    lastActivityAtMs: sessions.length ? lastActivityAtMs : null,
  };
}
