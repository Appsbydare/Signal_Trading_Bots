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
  onViewDetailsClick?: (e: React.MouseEvent<HTMLAnchorElement>) => void;
  isCurrentPlan?: boolean;
  expiresAt?: string;
  daysRemaining?: number;
  showPromoOffer?: boolean;
  isLifetime?: boolean;
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
}: DarkProductCardProps) {
  return (
    <div className="relative group h-full">
      {/* Starry background effect */}
      <div
        className="absolute inset-0 rounded-xl bg-gradient-to-br from-slate-900 via-slate-950 to-black opacity-95"
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

      {/* Card content */}
      <div
        className={`relative z-10 flex h-full flex-col rounded-xl border p-6 text-left shadow-lg transition-all duration-200 hover:-translate-y-1 hover:shadow-xl ${featured
          ? "border-blue-500 bg-gradient-to-br from-slate-900/95 to-black/95"
          : "border-blue-600/30 bg-gradient-to-br from-slate-900/90 to-black/90"
          }`}
      >
        {/* Top badge */}
        <div className="mb-4 flex items-center justify-between">
          {badge && (
            <span className="inline-flex rounded-full bg-blue-600 px-3 py-1 text-xs font-semibold text-white">
              {badge}
            </span>
          )}
        </div>

        {/* Title */}
        <h3 className="mb-3 text-xl font-bold text-white">{name}</h3>

        {/* Description/Price info */}
        <p className="text-sm font-medium uppercase tracking-wide text-blue-300 mb-1">
          {yearlyNote}
        </p>

        {/* Price */}
        <p className="mb-4 text-3xl font-bold text-white" style={{ fontFamily: "var(--font-heading)" }}>
          {price}
        </p>

        {/* Promo Offer Banner for Starter */}
        {showPromoOffer && (
          <div className="mb-4 rounded-lg border border-blue-400/40 bg-gradient-to-r from-blue-500/25 to-purple-500/25 p-3 text-center shadow-lg shadow-blue-500/20">
            <p className="text-xs font-bold uppercase tracking-wide text-blue-300">🎉 Special Offer</p>
            <p className="mt-1 text-sm font-semibold text-white">Get Pro features for the 1st month!</p>
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
          <Link
            href={viewDetailsHref}
            onClick={onViewDetailsClick}
            className={`inline-flex w-full items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition ${featured
              ? "bg-[#5e17eb] text-white hover:bg-[#4512c2]"
              : "border border-[#5e17eb]/30 text-blue-200 hover:border-[#5e17eb] hover:text-white"
              }`}
          >
            View details
          </Link>
          {isCurrentPlan && daysRemaining !== undefined && daysRemaining > 0 ? (
            <button
              disabled
              className="inline-flex w-full items-center justify-center rounded-md bg-zinc-700 px-4 py-2 text-sm font-medium text-zinc-400 cursor-not-allowed"
              title={`Your current plan is active for ${daysRemaining} more days`}
            >
              Active Until {expiresAt ? new Date(expiresAt).toLocaleDateString() : ''}
            </button>
          ) : (
            <Link
              href={paymentLink}
              className="inline-flex w-full items-center justify-center rounded-md bg-[#5e17eb] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#4512c2]"
            >
              {isCurrentPlan ? 'Renew Now →' : 'Start Automation →'}
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



