/** Client-safe: resolve STB vs ORB from DB fields, plan key, or license key prefix. */
export type ResolvedLicenseProductId = "SIGNAL_TRADING_BOTS" | "ORB_BOT";

export function resolveLicenseProductId(license: {
  product_id?: string | null;
  plan: string;
  license_key: string;
}): ResolvedLicenseProductId {
  const pid = license.product_id;
  if (pid === "ORB_BOT") return "ORB_BOT";
  if (pid === "SIGNAL_TRADING_BOTS") return "SIGNAL_TRADING_BOTS";

  const p = license.plan.toLowerCase();
  if (p === "orb_lifetime" || p.startsWith("orb_")) return "ORB_BOT";
  if (license.license_key.toUpperCase().startsWith("ORB")) return "ORB_BOT";
  return "SIGNAL_TRADING_BOTS";
}
