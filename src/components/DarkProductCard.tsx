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
  rating?: number;
  reviewCount?: number;
  gradientFrom?: string;
  gradientTo?: string;
  featuresColor?: string;
  offerBadge?: string;
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
  rating,
  reviewCount,
  gradientFrom = "#03a9f4",
  gradientTo = "#ff0058",
  featuresColor,
  offerBadge,
}: DarkProductCardProps) {
  return (
    <div className={`group relative w-full h-full transition-all duration-500 ${offerBadge ? "mt-3" : ""}`}>
      {/* Skewed gradient panels from reference */}
      <span
        className="absolute top-0 left-[20px] w-1/2 h-full rounded-lg transform skew-x-[15deg] transition-all duration-500 group-hover:skew-x-0 group-hover:left-[10px] group-hover:w-[calc(100%-20px)] z-0"
        style={{
          background: `linear-gradient(315deg, ${gradientFrom}, ${gradientTo})`,
        }}
      />
      <span
        className="absolute top-0 left-[20px] w-1/2 h-full rounded-lg transform skew-x-[15deg] blur-[30px] transition-all duration-500 group-hover:skew-x-0 group-hover:left-[10px] group-hover:w-[calc(100%-20px)] z-0"
        style={{
          background: `linear-gradient(315deg, ${gradientFrom}, ${gradientTo})`,
        }}
      />

      {/* Animated blurs (Blobs) */}
      <span className="pointer-events-none absolute inset-0 z-10">
        <span className="absolute top-0 left-0 w-0 h-0 rounded-lg opacity-0 bg-[rgba(255,255,255,0.1)] backdrop-blur-[10px] shadow-[0_5px_15px_rgba(0,0,0,0.08)] transition-all duration-500 animate-blob group-hover:top-[-30px] group-hover:left-[20px] group-hover:w-[80px] group-hover:h-[80px] group-hover:opacity-100" />
        <span className="absolute bottom-0 right-0 w-0 h-0 rounded-lg opacity-0 bg-[rgba(255,255,255,0.1)] backdrop-blur-[10px] shadow-[0_5px_15px_rgba(0,0,0,0.08)] transition-all duration-500 animate-blob animation-delay-1000 group-hover:bottom-[-30px] group-hover:right-[20px] group-hover:w-[80px] group-hover:h-[80px] group-hover:opacity-100" />
      </span>

      {/* Glass card content */}
      <div
        className={`relative z-20 h-full flex flex-col rounded-xl p-8 backdrop-blur-[15px] bg-white/5 border border-white/10 shadow-2xl transition-all duration-500 group-hover:left-[-15px] group-hover:p-10 ${featured ? "ring-1 ring-white/20" : ""}`}
      >
        {/* Offer tag — pill badge top-right, no clipping */}
        {offerBadge && (
          <div className="absolute -top-3 right-4 z-30 pointer-events-none">
            <div className="relative">
              <div className="absolute inset-0 rounded-full blur-sm bg-orange-500/50" />
              <div className="relative inline-flex items-center rounded-full bg-gradient-to-r from-amber-400 to-orange-500 px-4 py-1 shadow-lg shadow-orange-500/30 ring-1 ring-white/25">
                <span className="text-[11px] font-black tracking-wider text-white uppercase whitespace-nowrap">
                  {offerBadge}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Top badge and Billing Toggle */}
        <div className="mb-4 flex items-center justify-between">
          {badge && (
            <span className="inline-flex rounded-full bg-blue-600 px-3 py-1 text-xs font-semibold text-white">
              {badge}
            </span>
          )}

          {/* Billing Toggle (if enabled) */}
          {/* {showBillingToggle && onBillingIntervalChange && (
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
          )} */}
        </div>

        {/* Title */}
        <h3 className="mb-1 text-4xl font-black text-white uppercase tracking-tighter drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]" style={{ fontFamily: "var(--font-heading)" }}>
          {name}
        </h3>

        {/* Rating */}
        {rating && reviewCount && (
          <Link href="/reviews" className="mb-4 flex items-center gap-2 transition hover:opacity-80">
            <div className="flex items-center gap-0.5">
              {[...Array(5)].map((_, i) => (
                <svg
                  key={i}
                  className={`h-4 w-4 ${i < Math.floor(rating) ? "text-yellow-400 fill-yellow-400" : "text-zinc-600"
                    }`}
                  viewBox="0 0 20 20"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
            </div>
            <span className="text-sm font-medium text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]">
              {rating} <span className="text-white/70">({reviewCount} reviews)</span>
            </span>
          </Link>
        )}

        {/* Description/Price info - REMOVED AS REQUESTED */}
        {/* <p className="text-sm font-medium uppercase tracking-wide text-blue-300 mb-1">
          {yearlyNote}
        </p> */}

        <div className="mb-6 flex items-baseline justify-end gap-1 text-right">
          {(() => {
            const parts = price.split(/(\/| )/);
            const amount = parts[0];
            const suffix = parts.slice(1).join("");

            return (
              <>
                <span className="text-6xl font-black text-white drop-shadow-[0_4px_6px_rgba(0,0,0,0.4)] transform scale-y-110 origin-left" style={{ fontFamily: "var(--font-heading)" }}>
                  {amount}
                </span>
                <span className="text-xl font-black text-white uppercase tracking-tighter drop-shadow-[0_2px_4px_rgba(0,0,0,0.3)]" style={{ fontFamily: "var(--font-heading)" }}>
                  {suffix}
                </span>
              </>
            );
          })()}
        </div>

        {/* Trial Offer Banner */}
        {/* {(showPromoOffer || (featured && !isCurrentPlan)) && (
          <div className="mb-4 relative rounded-lg overflow-hidden p-[2px]">
            {showPromoOffer ? (
              <>
                <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-yellow-400 via-amber-500 to-yellow-400 bg-[length:200%_100%] animate-[gradient_3s_linear_infinite]" />

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
                <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-yellow-400 via-amber-500 to-yellow-400 bg-[length:200%_100%] animate-[gradient_3s_linear_infinite]" />

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
        )} */}

        {/* Features — glass pill bubbles */}
        <div className="mb-6 flex-grow flex flex-wrap gap-2 content-start">
          {features.map((feature, idx) => {
            const isIncluded = feature.startsWith("Everything in");
            return (
              <span
                key={idx}
                className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[0.72rem] font-semibold backdrop-blur-sm border transition-all
                  ${isIncluded
                    ? "border-white/20 bg-white/10 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.15)]"
                    : "border-white/10 bg-white/5 text-white/80 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]"
                  }`}
              >
                <span className={`flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-full text-[8px] font-bold
                  ${isIncluded ? "bg-white/30 text-white" : "bg-white/15 text-white/70"}`}>
                  ✓
                </span>
                {feature}
              </span>
            );
          })}
        </div>

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
          <button
            onClick={onViewDetailsClick}
            className="inline-flex w-full items-center justify-center rounded-md bg-[#5e17eb] text-white hover:bg-[#4512c2] px-4 py-2 text-sm font-medium transition"
          >
            View details
          </button>
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
              className="inline-flex w-full items-center justify-center rounded-md bg-[#5e17eb] px-4 py-2 text-sm font-bold text-white transition hover:bg-[#4512c2] shadow-xl shadow-purple-900/40 border border-purple-400/20 active:scale-95 duration-200"
            >
              <span className="drop-shadow-[0_1.5px_1.5px_rgba(0,0,0,0.7)]">Start Automation →</span>
            </Link>
          )}
        </div>

        {/* Footer text */}
        <div className="mt-3 flex items-center justify-center gap-1 text-xs text-amber-400 drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]">
          <span>🔒</span>
          <span>Secure License</span>
        </div>
      </div>

      {/* Tailwind custom keyframes for glass effect blurs */}
      <style jsx>{`
        @keyframes blob {
          0%, 100% { transform: translateY(10px); }
          50% { transform: translateY(-10px) translateX(-10px); }
        }
        .animate-blob { animation: blob 5s ease-in-out infinite; }
        .animation-delay-1000 { animation-delay: -2s; }
      `}</style>
    </div>
  );
}



