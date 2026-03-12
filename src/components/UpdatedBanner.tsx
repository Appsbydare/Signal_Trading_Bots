"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface Props {
  currentPlans: string[];
}

const PLAN_RANK: Record<string, number> = {
  starter_yearly: 1,
  pro_yearly: 2,
  lifetime: 3,
};

function getHighestPlanRank(plans: string[]): number {
  return Math.max(0, ...plans.map((p) => PLAN_RANK[p] ?? 0));
}

export function UpdatedBanner({ currentPlans }: Props) {
  const router = useRouter();
  const [status, setStatus] = useState<"upgraded" | "downgraded" | null>(null);

  useEffect(() => {
    const url = new URL(window.location.href);
    const fromStripe = url.searchParams.get("from") === "stripe";

    if (fromStripe) {
      url.searchParams.delete("from");
      router.replace(url.pathname + (url.search || ""), { scroll: false });

      const prePlan = sessionStorage.getItem("preUpgradePlan");
      sessionStorage.removeItem("preUpgradePlan");

      if (prePlan) {
        const oldRank = PLAN_RANK[prePlan] ?? 0;
        const newRank = getHighestPlanRank(currentPlans);

        if (newRank > oldRank) setStatus("upgraded");
        else if (newRank < oldRank) setStatus("downgraded");
        // newRank === oldRank → no change, no banner
      }
    }
  }, [currentPlans, router]);

  if (!status) return null;

  const isUpgrade = status === "upgraded";

  return (
    <div className={`rounded-xl border p-4 animate-in fade-in slide-in-from-top-4 duration-500 ${
      isUpgrade
        ? "border-emerald-500/30 bg-emerald-500/10"
        : "border-amber-500/30 bg-amber-500/10"
    }`}>
      <div className="flex items-center gap-3">
        <div className={`flex h-10 w-10 items-center justify-center rounded-full ${
          isUpgrade ? "bg-emerald-500/20" : "bg-amber-500/20"
        }`}>
          {isUpgrade ? (
            <svg className="h-6 w-6 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          ) : (
            <svg className="h-6 w-6 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0l-4-4m4 4l-4 4M6 10h8M6 10l4-4M6 10l4 4" />
            </svg>
          )}
        </div>
        <div>
          <h3 className={`text-base font-semibold ${isUpgrade ? "text-emerald-300" : "text-amber-300"}`}>
            {isUpgrade ? "Subscription Upgraded" : "Subscription Downgraded"}
          </h3>
          <p className={`text-sm ${isUpgrade ? "text-emerald-200/80" : "text-amber-200/80"}`}>
            {isUpgrade
              ? "Your plan has been successfully upgraded. Your new features are now active."
              : "Your plan has been downgraded. Changes will take effect at the end of your billing period."}
          </p>
        </div>
      </div>
    </div>
  );
}
