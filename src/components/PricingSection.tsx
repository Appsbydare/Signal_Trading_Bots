"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { motion, Variants, AnimatePresence } from "framer-motion";
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
            "MT5 Auto-Execution",
            "Telegram Signal Parsing",
            "Single Take Profit",
            "Fixed Lot Sizing",
            "Auto Stop Loss",
            "Activity Logs",
        ],
        rating: 4.1,
        reviewCount: 248,
    },
    {
        name: "Pro",
        badge: "Most popular",
        featured: true,
        features: [
            "Everything in Starter",
            "Multi-TP Splitting",
            "Dynamic Trailing Stop",
            "Auto Break-Even",
            "Daily Profit Target",
            "Max Daily Loss Limit",
        ],
        rating: 4.8,
        reviewCount: 438,
    },
    {
        name: "Lifetime",
        badge: "One-time payment",
        features: [
            "Everything in Pro",
            "All Future Updates",
            "Priority Support",
            "No Recurring Fees",
        ],
        rating: 4.6,
        reviewCount: 114,
    },
];

const productFeatures = [
    {
        title: "24/7 automation",
        description:
            "Let the bot watch your Telegram channels and execute MT5 trades around the clock.",
    },
    {
        title: "Multi‑TP & SL logic",
        description:
            "Configure multiple take‑profit levels, stop loss, and partial closes based on your strategy.",
    },
    {
        title: "Risk‑based sizing",
        description:
            "Control position size by fixed lot or percentage risk per trade on supported MT5 brokers.",
    },
    {
        title: "Flexible mapping",
        description:
            "Adapt to different Telegram signal formats with configurable mapping rules.",
    },
];

const telegramProduct = {
    name: "Telegram → MT5 Executor",
    description: "Our flagship desktop app that turns Telegram signals into fully automated MT5 trades.",
    bullets: [
        "Real‑time monitoring of your Telegram signal channels",
        "Multi‑TP, SL and risk‑based position sizing options",
        "Strategy‑level controls for prop firm style guardrails",
        "Ideal for traders who want reliable, low‑maintenance automation",
    ],
};

export function PricingSection() {
    const [customerLicenses, setCustomerLicenses] = useState<Array<{ plan: string, expires_at: string }>>([]);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [loadingLicenses, setLoadingLicenses] = useState(true);
    const billingInterval = "yearly" as const;
    const [showProductDetails, setShowProductDetails] = useState(false);

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

    const handleViewDetails = () => {
        setShowProductDetails(true);
        setTimeout(() => {
            const element = document.getElementById('product-details-content');
            if (element) {
                const headerOffset = 80;
                const elementPosition = element.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.scrollY - headerOffset;
                window.scrollTo({
                    top: offsetPosition,
                    behavior: "smooth",
                });
            }
        }, 100);
    };

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
                <div className="text-center space-y-6">
                    <h2 className="text-center text-5xl font-bold text-white md:text-6xl lg:text-7xl leading-tight">
                        Simple Packages For Every Trading Stage
                    </h2>
                    {/* <p className="text-center text-sm text-zinc-400">
                        include a 10% discount when you choose yearly billing
                    </p> */}

                    {/* Billing Toggle */}
                    {/* <div className="flex items-center justify-center gap-3 pt-2">
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
                    </div> */}
                </div>

                {/* Collapsible Product Details */}
                <div id="product-details-content" className="max-w-6xl mx-auto mb-8">
                    <AnimatePresence>
                        {showProductDetails && (
                            <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: "auto", opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.4, ease: "easeInOut" }}
                                className="overflow-hidden rounded-2xl border border-zinc-700 bg-zinc-900/50 shadow-2xl"
                            >
                                <div className="p-1">
                                    <div className="flex items-center justify-between bg-zinc-800/50 px-6 py-4">
                                        <div className="flex items-center gap-4">
                                            <h3 className="text-xl font-bold text-white">
                                                {telegramProduct.name}
                                            </h3>
                                            <span className="rounded-full bg-blue-500/10 px-3 py-1 text-xs font-semibold text-blue-400 border border-blue-500/20">
                                                Current Product
                                            </span>
                                        </div>
                                        <button
                                            onClick={() => setShowProductDetails(false)}
                                            className="text-zinc-400 hover:text-white transition-colors"
                                        >
                                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                <path d="M18 6L6 18M6 6l12 12" />
                                            </svg>
                                        </button>
                                    </div>

                                    <div className="grid gap-8 p-6 lg:grid-cols-2">
                                        <div className="space-y-6">
                                            <div>
                                                <p className="text-zinc-300 leading-relaxed">
                                                    {telegramProduct.description}
                                                </p>
                                            </div>
                                            <ul className="grid gap-3 sm:grid-cols-1">
                                                {telegramProduct.bullets.map((bullet, idx) => (
                                                    <li key={idx} className="flex items-start gap-3 text-sm text-zinc-400">
                                                        <span className="mt-1 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-blue-500/20 text-blue-400">
                                                            ✓
                                                        </span>
                                                        <span>{bullet}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>

                                        <div className="space-y-6 lg:border-l lg:border-zinc-700 lg:pl-8">
                                            <h4 className="text-sm font-bold uppercase tracking-widest text-zinc-500">
                                                Technical Specifications
                                            </h4>
                                            <div className="grid gap-4 sm:grid-cols-2">
                                                {productFeatures.map((feature) => (
                                                    <div key={feature.title} className="space-y-1">
                                                        <h5 className="text-sm font-semibold text-white">
                                                            {feature.title}
                                                        </h5>
                                                        <p className="text-xs text-zinc-400 leading-relaxed">
                                                            {feature.description}
                                                        </p>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
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
                        const isLifetime = plan.name === "Lifetime";

                        const daysRemaining = expiresAt
                            ? Math.max(
                                0,
                                Math.ceil(
                                    (new Date(expiresAt).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
                                )
                            )
                            : undefined;

                        const showPromoOffer = plan.name === "Starter" && customerLicenses.length === 0;

                        return (
                            <motion.div key={plan.name} variants={cardVariants} className="h-full">
                                <DarkProductCard
                                    name={plan.name}
                                    badge={plan.badge}
                                    price={
                                        plan.name === "Starter"
                                            ? "$98/YEAR"
                                            : plan.name === "Pro"
                                                ? "$188/YEAR"
                                                : "$299 ONE-TIME"
                                    }
                                    gradientFrom={
                                        plan.name === "Starter" ? "#0a1628" :
                                            plan.name === "Pro" ? "#0072ff" : "#05036deb"
                                    }
                                    gradientTo={
                                        plan.name === "Starter" ? "#1e40af" :
                                            plan.name === "Pro" ? "#00c6ff" : "#0059ffff"
                                    }
                                    featuresColor={undefined}
                                    yearlyNote=""
                                    features={plan.features}
                                    featured={plan.featured}
                                    paymentLink={
                                        plan.name === "Starter"
                                            ? "/payment?plan=starter_yearly"
                                            : plan.name === "Pro"
                                                ? "/payment?plan=pro_yearly"
                                                : "/payment?plan=lifetime"
                                    }
                                    offerBadge={plan.name === "Lifetime" ? "70% OFF" : undefined}
                                    viewDetailsHref="/products"
                                    isCurrentPlan={isCurrentPlan}
                                    expiresAt={expiresAt}
                                    daysRemaining={daysRemaining}
                                    showPromoOffer={showPromoOffer}
                                    isLifetime={isLifetime}
                                    canUpgradeToYearly={false}
                                    upgradeYearlyLink={undefined}
                                    proratedCredit={0}
                                    billingInterval={billingInterval}
                                    onBillingIntervalChange={() => {}}
                                    onViewDetailsClick={handleViewDetails}
                                    rating={plan.rating}
                                    reviewCount={plan.reviewCount}
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
