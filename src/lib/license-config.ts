import "server-only";

// Centralised configuration for the licensing backend.
// All secrets must be provided via environment variables at deploy/runtime.

const API_SECRET = process.env.API_SECRET;
const API_KEY_PUBLIC = process.env.API_KEY_PUBLIC ?? "DBOT-API-KEY-V8";

// Heartbeat / session settings (in seconds)
const HEARTBEAT_INTERVAL_SECONDS = Number(
  process.env.LICENSE_HEARTBEAT_INTERVAL_SECONDS ?? "300",
);
const HEARTBEAT_GRACE_SECONDS = Number(
  process.env.LICENSE_HEARTBEAT_GRACE_SECONDS ?? "300",
);

if (!API_SECRET) {
  // Fail fast on misconfiguration so we don't accidentally accept unsigned traffic.
  throw new Error(
    "API_SECRET is not configured. Set API_SECRET in the environment to enable licensing endpoints.",
  );
}

export const licenseConfig = {
  apiSecret: API_SECRET,
  apiKeyPublic: API_KEY_PUBLIC,
  heartbeatIntervalSeconds: HEARTBEAT_INTERVAL_SECONDS,
  heartbeatGraceSeconds: HEARTBEAT_GRACE_SECONDS,
};


