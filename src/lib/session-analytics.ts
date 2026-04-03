/**
 * Pure session timing helpers (no server-only): stint intervals and per-license wall-clock merge.
 */

export type SessionStintFields = {
  created_at: string;
  last_seen_at: string;
  active: boolean;
  ended_at?: string | null;
};

export type TimeInterval = { start: number; end: number };

export function sessionStintInterval(s: SessionStintFields, nowMs: number = Date.now()): TimeInterval {
  const start = new Date(s.created_at).getTime();
  let end: number;
  if (s.active) {
    end = nowMs;
  } else if (s.ended_at) {
    end = new Date(s.ended_at).getTime();
  } else {
    end = new Date(s.last_seen_at).getTime();
  }
  return { start, end: Math.max(start, end) };
}

export function clipIntervalToWindow(
  iv: TimeInterval,
  windowStart: number,
  windowEnd: number,
): TimeInterval | null {
  const start = Math.max(iv.start, windowStart);
  const end = Math.min(iv.end, windowEnd);
  if (start >= end) return null;
  return { start, end };
}

export function mergeIntervals(intervals: TimeInterval[]): TimeInterval[] {
  if (intervals.length === 0) return [];
  const sorted = [...intervals].sort((a, b) => a.start - b.start);
  const out: TimeInterval[] = [{ ...sorted[0]! }];
  for (let i = 1; i < sorted.length; i++) {
    const cur = sorted[i]!;
    const last = out[out.length - 1]!;
    if (cur.start <= last.end) {
      last.end = Math.max(last.end, cur.end);
    } else {
      out.push({ ...cur });
    }
  }
  return out;
}

export function totalMergedLengthMs(intervals: TimeInterval[]): number {
  return intervals.reduce((sum, iv) => sum + Math.max(0, iv.end - iv.start), 0);
}

/** Union of stints for one license (overlapping device sessions count once). */
export function wallClockMsForLicense(
  sessions: SessionStintFields[],
  nowMs: number,
  window?: { start: number; end: number },
): number {
  const raw = sessions.map((s) => sessionStintInterval(s, nowMs));
  const clipped = window
    ? raw.map((iv) => clipIntervalToWindow(iv, window.start, window.end)).filter((x): x is TimeInterval => x !== null)
    : raw;
  return totalMergedLengthMs(mergeIntervals(clipped));
}
