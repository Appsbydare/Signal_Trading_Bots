/**
 * Lightweight sliding-window rate limiter.
 * Uses an in-process Map — good for single-instance / dev.
 * For multi-instance Vercel production, swap the store for Upstash Redis.
 */

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const store = new Map<string, RateLimitEntry>();

interface RateLimitOptions {
  /** Max requests allowed within the window */
  limit: number;
  /** Window size in seconds */
  windowSeconds: number;
}

/**
 * Returns true if the request is allowed, false if rate-limited.
 * Key should be something like `"login:<ip>"` or `"magic:<email>"`.
 */
export function checkRateLimit(key: string, options: RateLimitOptions): boolean {
  const now = Date.now();
  const entry = store.get(key);

  if (!entry || now > entry.resetAt) {
    store.set(key, { count: 1, resetAt: now + options.windowSeconds * 1000 });
    return true;
  }

  if (entry.count >= options.limit) {
    return false;
  }

  entry.count++;
  return true;
}

/** Extract best-effort IP from Next.js request headers */
export function getClientIp(request: Request): string {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
    request.headers.get("x-real-ip") ||
    "unknown"
  );
}

/**
 * Sanitize user-supplied text before passing to any LLM.
 * Strips common prompt-injection patterns while preserving legitimate content.
 */
export function sanitizeForLlm(input: string): string {
  return input
    .slice(0, 2000) // Hard cap — no runaway prompts
    .replace(/ignore (all )?(previous|above|prior) instructions?/gi, "[filtered]")
    .replace(/you are now (a|an|the)?\s+\w+/gi, "[filtered]")
    .replace(/system\s*:/gi, "[filtered]")
    .replace(/\[INST\]|\[\/INST\]|<\|im_start\|>|<\|im_end\|>/g, "[filtered]")
    .trim();
}
