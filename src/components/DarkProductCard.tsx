import React from "react";
import Link from "next/link";

interface DarkProductCardProps {
  name: string;
  badge: string;
  price: string;
  yearlyNote: string;
  features: string[];
  featured?: boolean;
  paymentLink: string;
  viewDetailsHref?: string;
  onViewDetailsClick?: () => void;
  isCurrentPlan?: boolean;
  expiresAt?: string;
  daysRemaining?: number;
  showPromoOffer?: boolean;
  isLifetime?: boolean;
  canUpgradeToYearly?: boolean;
  upgradeYearlyLink?: string;
  proratedCredit?: number;
  billingInterval?: "monthly" | "yearly";
  onBillingIntervalChange?: (interval: "monthly" | "yearly") => void;
  showBillingToggle?: boolean;
}

export function DarkProductCard({
  name,
  badge,
  price,
  yearlyNote,
  features,
  featured,
  paymentLink,
  viewDetailsHref = "#",
  onViewDetailsClick,
  isCurrentPlan = false,
  expiresAt,
  daysRemaining,
  showPromoOffer = false,
  isLifetime = false,
  canUpgradeToYearly = false,
  upgradeYearlyLink,
  proratedCredit,
  billingInterval = "monthly",
  onBillingIntervalChange,
  showBillingToggle = false,
}: DarkProductCardProps) {
  return (
    <div className="relative group h-full">
      {/* Starry background effect */}
      <div
        className="absolute inset-0 rounded-xl bg-gradient-to-br from-slate-900 via-slate-950 to-black"
        style={{
          backgroundImage: `
            radial-gradient(2px 2px at 20px 30px, white, rgba(255,255,255,.2)),
            radial-gradient(2px 2px at 60px 70px, white, rgba(255,255,255,.2)),
            radial-gradient(1px 1px at 50px 50px, white, rgba(255,255,255,.2)),
            radial-gradient(1px 1px at 130px 80px, white, rgba(255,255,255,.2)),
            radial-gradient(2px 2px at 90px 10px, white, rgba(255,255,255,.2)),
            radial-gradient(1px 1px at 130px 130px, white, rgba(255,255,255,.2))
          `,
          backgroundRepeat: "repeat",
          backgroundSize: "200px 200px",
        }}
      />

      {/* Special Offer Tag - Top Left Corner */}
      {(showPromoOffer || (featured && !isCurrentPlan)) && (
        <div className="absolute -top-2 -left-2 z-20">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 via-amber-500 to-yellow-400 rounded-full blur-[2px] opacity-40" />
            <div className="relative bg-gradient-to-br from-slate-900 to-black border-2 border-yellow-400 text-yellow-300 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide shadow-lg shadow-yellow-500/20">
              ⚡No Credit Card Required
            </div>
          </div>
        </div>
      )}


      {/* Card content */}
      <div
        className={`relative z-10 flex h-full flex-col rounded-xl border p-6 text-left shadow-lg transition-all duration-200 hover:shadow-xl ${featured
          ? "border-blue-500 bg-gradient-to-br from-slate-900 to-black"
          : "border-blue-600/30 bg-gradient-to-br from-slate-900 to-black"
          }`}
      >
        {/* Top badge and Billing Toggle */}
        <div className="mb-4 flex items-center justify-between">
          {badge && (
            <span className="inline-flex rounded-full bg-blue-600 px-3 py-1 text-xs font-semibold text-white">
              {badge}
            </span>
          )}

          {/* Billing Toggle (if enabled) */}
          {showBillingToggle && onBillingIntervalChange && (
            <button
              onClick={() => onBillingIntervalChange(billingInterval === "yearly" ? "monthly" : "yearly")}
              className="flex items-center gap-2 rounded-md border border-zinc-700 bg-zinc-800/50 px-2.5 py-1.5 transition-all hover:border-[#5e17eb]/50 hover:bg-zinc-700/50"
            >
              <div className={`h-3.5 w-3.5 rounded border-2 transition-colors ${billingInterval === "yearly"
                ? "border-[#5e17eb] bg-[#5e17eb]"
                : "border-zinc-600 bg-transparent"
                }`}>
                {billingInterval === "yearly" && (
                  <svg
                    viewBox="0 0 12 12"
                    className="h-full w-full text-white"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M2 6l3 3 5-5" />
                  </svg>
                )}
              </div>
              <span className={`text-xs font-medium transition-colors ${billingInterval === "yearly" ? "text-white" : "text-zinc-400"
                }`}>
                Yearly <span className="text-[10px] text-purple-400">(Save 10%)</span>
              </span>
            </button>
          )}
        </div>

        {/* Title */}
        <h3 className="mb-3 text-xl font-bold text-white">{name}</h3>

        {/* Description/Price info */}
        <p className="text-sm font-medium uppercase tracking-wide text-blue-300 mb-1">
          {yearlyNote}
        </p>

        {/* Price */}
        <div className="mb-4">
          {(name === "Starter" || name === "Pro") ? (
            <div className="flex items-center gap-2 flex-wrap">
              {/* Strikethrough original price */}
              <span className="text-3xl font-bold text-zinc-600 line-through" style={{ fontFamily: "var(--font-heading)" }}>
                {name === "Starter"
                  ? billingInterval === "monthly"
                    ? "$29"
                    : "$348"
                  : billingInterval === "monthly"
                    ? "$49"
                    : "$588"
                }
              </span>

              {/* Kickstart Price label */}
              <span className="text-sm font-medium text-zinc-400">
                Kickstart Price
              </span>

              {/* Discounted price */}
              <span className="text-3xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 bg-clip-text text-transparent" style={{ fontFamily: "var(--font-heading)" }}>
                {price}
              </span>
            </div>
          ) : (
            <p className="text-3xl font-bold text-white" style={{ fontFamily: "var(--font-heading)" }}>
              {price}
            </p>
          )}
        </div>

        {/* Trial Offer Banner */}
        {(showPromoOffer || (featured && !isCurrentPlan)) && (
          <div className="mb-4 relative rounded-lg overflow-hidden p-[2px]">
            {showPromoOffer ? (
              <>
                {/* Yellow/Gold Animated gradient border for Special Offer */}
                <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-yellow-400 via-amber-500 to-yellow-400 bg-[length:200%_100%] animate-[gradient_3s_linear_infinite]" />

                {/* Inner content with dark background */}
                <div className="relative rounded-lg bg-gradient-to-br from-slate-900 to-black p-3 text-center">
                  <div className="flex items-center justify-center gap-1.5">
                    <span className="text-xs font-bold uppercase tracking-wider text-yellow-300">
                      🎉 Limited Time Offer
                    </span>
                  </div>
                  <p className="mt-1 text-sm font-semibold text-yellow-100">
                    30-Day Trial + Pro Features for 1st Month!
                  </p>
                </div>
              </>
            ) : (
              <>
                {/* Yellow/Gold gradient for Most Popular */}
                <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-yellow-400 via-amber-500 to-yellow-400 bg-[length:200%_100%] animate-[gradient_3s_linear_infinite]" />

                {/* Inner content with dark background */}
                <div className="relative rounded-lg bg-gradient-to-br from-slate-900 to-black p-3 text-center">
                  <div className="flex items-center justify-center gap-1.5">
                    <span className="text-xs font-bold uppercase tracking-wider text-yellow-300">
                      ⭐ Most Popular
                    </span>
                  </div>
                  <p className="mt-1 text-sm font-semibold text-yellow-100">
                    30-Day Free Trial Available
                  </p>
                </div>
              </>
            )}
          </div>
        )}

        {/* Features list */}
        <ul className="mb-6 flex-grow space-y-2">
          {features.map((feature, idx) => (
            <li
              key={idx}
              className="flex items-center gap-2 text-sm text-blue-100"
            >
              <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-blue-600/30 text-xs text-blue-300">
                ✓
              </span>
              {feature}
            </li>
          ))}
        </ul>

        {/* Current Plan Badge or Expiration Info */}
        {isCurrentPlan && (
          <div className="mb-3 rounded-lg border border-blue-500/30 bg-blue-500/10 p-3 text-center">
            <p className="text-sm font-semibold text-blue-300">✓ Current Plan</p>
            {daysRemaining !== undefined && expiresAt && (
              <p className="mt-1 text-xs text-blue-200">
                {isLifetime
                  ? 'Lifetime Access'
                  : daysRemaining > 0
                    ? `Active for ${daysRemaining} more days`
                    : 'Expired - Renew to continue'
                }
              </p>
            )}
          </div>
        )}

        {/* Buttons */}
        <div className="mt-auto space-y-2 pt-4">
          {!isCurrentPlan && (
            <button
              onClick={onViewDetailsClick}
              className="inline-flex w-full items-center justify-center rounded-md bg-[#5e17eb] text-white hover:bg-[#4512c2] px-4 py-2 text-sm font-medium transition"
            >
              View details
            </button>
          )}
          {canUpgradeToYearly && upgradeYearlyLink ? (
            <>
              <Link
                href={upgradeYearlyLink}
                className="inline-flex w-full items-center justify-center rounded-md bg-gradient-to-r from-emerald-900/80 to-teal-900/80 border border-emerald-500/30 px-4 py-2 text-sm font-medium text-emerald-100 transition hover:from-emerald-800 hover:to-teal-800 hover:border-emerald-500/50 shadow-lg shadow-emerald-900/20"
              >
                Upgrade to Yearly
              </Link>
              {proratedCredit && proratedCredit > 0 && (
                <p className="text-xs text-center text-emerald-400/80 font-medium">
                  Credits will propagate automatically
                </p>
              )}
              <Link
                href={paymentLink}
                className="inline-flex w-full items-center justify-center rounded-md bg-[#5e17eb] px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-[#4512c2] hover:shadow-md"
              >
                + Buy New Yearly License
              </Link>
            </>
          ) : isCurrentPlan && daysRemaining !== undefined && daysRemaining > 0 ? (
            <div className="space-y-2">
              <button
                disabled
                className="inline-flex w-full items-center justify-center rounded-md bg-zinc-700/50 border border-zinc-600 px-4 py-2 text-sm font-medium text-zinc-300 cursor-not-allowed"
              >
                Active Until {expiresAt ? new Date(expiresAt).toLocaleDateString() : ''}
              </button>
              <Link
                href={paymentLink}
                className="inline-flex w-full items-center justify-center rounded-md bg-[#5e17eb] px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-[#4512c2] hover:shadow-md"
              >
                + Buy Another License
              </Link>
            </div>
          ) : (
            <Link
              href={paymentLink}
              className="inline-flex w-full items-center justify-center rounded-md bg-[#5e17eb] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#4512c2]"
            >
              {isLifetime ? "Start Automation →" : "Start Free"}
            </Link>
          )}
        </div>

        {/* Footer text */}
        <div className="mt-3 flex items-center justify-center gap-1 text-xs text-blue-300/70">
          <span>🔒</span>
          <span>Secure License</span>
        </div>
      </div>
    </div>
  );
}



