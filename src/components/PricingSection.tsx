"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { motion, Variants } from "framer-motion";
import { DarkProductCard } from "./DarkProductCard";

const staggerContainer: Variants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1,
            delayChildren: 0.1
        }
    }
};

const cardVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { type: "spring", stiffness: 50, damping: 15 } as const
    }
};

const pricingPlans = [
    {
        name: "Starter",
        badge: "Basic plan",
        features: [
            "Ideal for demo and small live accounts",
            "Core Telegram → MT5 automation",
            "Basic configuration templates",
            "No credit card required",
        ],
    },
    {
        name: "Pro",
        badge: "Most popular",
        featured: true,
        features: [
            "Full configuration flexibility",
            "Priority support during setup",
            "Best for active signal users",
        ],
    },
    {
        name: "Lifetime",
        badge: "New · One-time payment",
        features: [
            "Single payment, long-term usage",
            "Access to all future versions and major features",
            "Best for committed, long-term traders",
        ],
    },
];

export function PricingSection() {
    const [customerLicenses, setCustomerLicenses] = useState<Array<{ plan: string, expires_at: string }>>([]);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [loadingLicenses, setLoadingLicenses] = useState(true);
    const [billingInterval, setBillingInterval] = useState<"monthly" | "yearly">("monthly");

    // Fetch customer licenses if logged in
    useEffect(() => {
        fetch("/api/auth/customer/me")
            .then(res => res.ok ? res.json() : null)
            .then(data => {
                if (data?.customer) {
                    setIsLoggedIn(true);
                    if (data.customer.licenses) {
                        setCustomerLicenses(data.customer.licenses);
                    }
                    setLoadingLicenses(false);
                } else {
                    setLoadingLicenses(false);
                }
            })
            .catch(() => setLoadingLicenses(false));
    }, []);

    return (
        <section className="relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] w-screen bg-gradient-to-b from-zinc-950 to-black py-16">
            <motion.div
                id="plans"
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-100px" }}
                variants={staggerContainer}
                className="mx-auto max-w-7xl px-6 space-y-6"
            >
                <div className="text-center space-y-4">
                    <h2 className="text-3xl md:text-4xl font-bold text-white uppercase tracking-tight">
                        SIMPLE PACKAGES FOR EVERY TRADING STAGE
                    </h2>
                    <p className="text-zinc-400 text-sm">
                        include a 10% discount when you choose yearly billing
                    </p>

                    {/* Billing Toggle */}
                    <div className="flex items-center justify-center gap-3 pt-2">
                        <span className={`text-sm font-medium ${billingInterval === 'monthly' ? 'text-white' : 'text-zinc-500'}`}>
                            Monthly
                        </span>
                        <button
                            type="button"
                            onClick={() => setBillingInterval(billingInterval === 'monthly' ? 'yearly' : 'monthly')}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-[#5e17eb] focus:ring-offset-2 focus:ring-offset-zinc-900 ${billingInterval === 'yearly' ? 'bg-[#5e17eb]' : 'bg-zinc-700'
                                }`}
                            aria-label="Toggle billing interval"
                        >
                            <span
                                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${billingInterval === 'yearly' ? 'translate-x-6' : 'translate-x-1'
                                    }`}
                            />
                        </button>
                        <span className={`text-sm font-medium ${billingInterval === 'yearly' ? 'text-white' : 'text-zinc-500'}`}>
                            Yearly <span className="text-[#5e17eb] font-bold text-xs ml-1">(Save 10%)</span>
                        </span>
                    </div>
                </div>

                <motion.div
                    className="grid gap-6 md:grid-cols-3 max-w-6xl mx-auto"
                    variants={staggerContainer}
                >
                    {pricingPlans.map((plan) => {
                        const planKey = plan.name.toLowerCase();
                        const license = customerLicenses.find((l: any) => l.plan.toLowerCase().startsWith(planKey));
                        const isCurrentPlan = !!license;
                        const expiresAt = license?.expires_at;

                        // Check if user has ANY active starter license (to determine price display)
                        const hasActiveStarter = customerLicenses.some((l: any) =>
                            l.status === 'active' &&
                            (l.plan.toLowerCase() === 'starter' || l.plan.toLowerCase().includes('starter'))
                        );

                        const daysRemaining = expiresAt
                            ? Math.max(
                                0,
                                Math.ceil(
                                    (new Date(expiresAt).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
                                )
                            )
                            : undefined;

                        const showPromoOffer = plan.name === "Starter" && customerLicenses.length === 0;
                        const isLifetime = plan.name === "Lifetime";

                        const hasMonthlyPlan = license && !license.plan.toLowerCase().includes('yearly') && !isLifetime;
                        const isViewingYearly = billingInterval === 'yearly' && !isLifetime;
                        const canUpgradeToYearly = hasMonthlyPlan && isViewingYearly;

                        let proratedCredit = 0;
                        if (canUpgradeToYearly && daysRemaining) {
                            const monthlyPrice = plan.name === "Pro" ? 29 : 9;
                            const dailyRate = monthlyPrice / 30;
                            proratedCredit = Math.min(dailyRate * Math.max(0, daysRemaining - 1), monthlyPrice);
                        }

                        return (
                            <motion.div key={plan.name} variants={cardVariants} className="h-full">
                                <DarkProductCard
                                    name={plan.name}
                                    badge={plan.badge}
                                    price={
                                        plan.name === "Starter"
                                            ? (billingInterval === 'monthly'
                                                ? (hasActiveStarter ? "$9/month" : "FREE FOR 30 DAYS")
                                                : "$108/year")
                                            : plan.name === "Pro"
                                                ? (billingInterval === 'monthly' ? "$29/month" : "$348/year")
                                                : "$999 one-time"
                                    }
                                    yearlyNote={
                                        plan.name === "Lifetime"
                                            ? "ALL FUTURE VERSIONS AND FEATURES INCLUDED"
                                            : billingInterval === 'monthly'
                                                ? "SAVE 10% WITH YEARLY BILLING"
                                                : "Billed annually (10% discount applied)"
                                    }
                                    features={plan.features}
                                    featured={plan.featured}
                                    paymentLink={
                                        plan.name === "Starter"
                                            ? `/payment?plan=${billingInterval === 'monthly' ? 'starter' : 'starter_yearly'}`
                                            : plan.name === "Pro"
                                                ? `/payment?plan=${billingInterval === 'monthly' ? 'pro' : 'pro_yearly'}`
                                                : "/payment?plan=lifetime"
                                    }
                                    viewDetailsHref="/products"
                                    isCurrentPlan={isCurrentPlan}
                                    expiresAt={expiresAt}
                                    daysRemaining={daysRemaining}
                                    showPromoOffer={showPromoOffer}
                                    isLifetime={isLifetime}
                                    canUpgradeToYearly={canUpgradeToYearly}
                                    upgradeYearlyLink={
                                        canUpgradeToYearly
                                            ? `/payment?plan=${plan.name.toLowerCase()}_yearly&upgrade=true&credit=${proratedCredit.toFixed(2)}`
                                            : undefined
                                    }
                                    proratedCredit={proratedCredit}
                                    billingInterval={billingInterval}
                                    onBillingIntervalChange={setBillingInterval}
                                    showBillingToggle={plan.name !== "Lifetime"}
                                />
                            </motion.div>
                        );
                    })}
                </motion.div>

                <div className="mt-6 text-center text-sm text-zinc-400">
                    Have questions before you buy?{" "}
                    <Link
                        href="/contact"
                        className="font-medium text-[#5e17eb] hover:text-[#4512c2]"
                    >
                        Contact us
                    </Link>
                    .
                </div>
            </motion.div>
        </section>
    );
}
