"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, Variants, AnimatePresence } from "framer-motion";
import { DarkProductCard } from "@/components/DarkProductCard";
import { ProductTabPill } from "@/components/ProductTabPill";
import { ComingSoonMessage } from "@/components/ComingSoonMessage";
import TelegramLogo from "../../../assets/telegram.webp";
import MT5Logo from "../../../assets/mt5.png";

const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: "easeOut" } as const
  }
};

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

const features = [
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

const pricingPlans = [
  {
    name: "Starter",
    badge: "Basic plan",
    features: [
      "Ideal for demo and small live accounts",
      "Core Telegram → MT5 automation",
      "Basic configuration templates",
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
    badge: "One‑time payment",
    features: [
      "One license, long‑term usage",
      "Access to future improvements",
      "Designed for committed traders",
    ],
  },
];

type ProductId = "telegram-mt5" | "whatsapp-mt" | "ma-crossing" | "rsi-bot";

const products = [
  {
    id: "telegram-mt5" as ProductId,
    name: "Telegram → MT5 Executor",
    status: "Current product",
    statusTone: "primary",
    description:
      "Our flagship desktop app that turns Telegram signals into fully automated MT5 trades.",
    bullets: [
      "Real‑time monitoring of your Telegram signal channels",
      "Multi‑TP, SL and risk‑based position sizing options",
      "Strategy‑level controls for prop firm style guardrails",
      "Ideal for traders who want reliable, low‑maintenance automation",
    ],
  },
  {
    id: "whatsapp-mt" as ProductId,
    name: "WhatsApp → MT5/MT4 Executor",
    status: "Coming soon",
    statusTone: "soon",
    description:
      "Bridge WhatsApp signal groups directly into MT5/MT4 without manual copying.",
    bullets: [
      "Designed for structured WhatsApp FX and gold signal providers",
      "Automatic parsing of pair, direction, entry and TP/SL levels",
      "Built for running on a Windows PC or VPS with MT5/MT4",
    ],
  },
  {
    id: "ma-crossing" as ProductId,
    name: "MA Crossing Bot → MT5/MT4",
    status: "Coming soon",
    statusTone: "soon",
    description:
      "Rule‑based moving average crossover bot for MT5/MT4 with flexible risk controls.",
    bullets: [
      "Configurable fast/slow MA periods and filters",
      "Automatic trade management with TP/SL and trailing options",
      "Built to work with multiple symbols and timeframes",
    ],
  },
  {
    id: "rsi-bot" as ProductId,
    name: "RSI Precision Trend Bot → MT5/MT4",
    status: "Coming soon",
    statusTone: "soon",
    description:
      "An RSI‑driven execution engine that looks for precise overbought/oversold structures.",
    bullets: [
      "Configurable RSI levels and confirmation rules",
      "Supports partial exits and re‑entries based on RSI behaviour",
      "Aimed at traders who like clean, rules‑driven swing setups",
    ],
  },
];

export function ProductsPageClient() {
  const [activeProduct, setActiveProduct] = useState<ProductId>("telegram-mt5");
  const [customerLicenses, setCustomerLicenses] = useState<Array<{ plan: string, expires_at: string }>>([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loadingLicenses, setLoadingLicenses] = useState(true);
  const [billingInterval, setBillingInterval] = useState<"monthly" | "yearly">("monthly");
  const [showProductDetails, setShowProductDetails] = useState(false);

  // Fetch customer licenses if logged in
  useEffect(() => {
    fetch("/api/auth/customer/me")
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        if (data?.customer) {
          setIsLoggedIn(true);
          // Fetch licenses
          fetch("/api/customer/licenses")
            .then(res => res.ok ? res.json() : null)
            .then(licensesData => {
              if (licensesData?.licenses) {
                setCustomerLicenses(licensesData.licenses);
              }
              setLoadingLicenses(false);
            })
            .catch(() => setLoadingLicenses(false));
        } else {
          setLoadingLicenses(false);
        }
      })
      .catch(() => setLoadingLicenses(false));
  }, []);

  // Auto-scroll to plans section if hash is present
  useEffect(() => {
    if (window.location.hash === '#plans') {
      setTimeout(() => {
        const element = document.getElementById('plans');
        if (element) {
          const headerOffset = 20; // Reduced offset for better positioning
          const elementPosition = element.getBoundingClientRect().top;
          const offsetPosition = elementPosition + window.scrollY - headerOffset;
          window.scrollTo({
            top: offsetPosition,
            behavior: "smooth",
          });
        }
      }, 300);
    }
  }, []);

  const scrollToSection = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    const element = document.getElementById(id);
    if (element) {
      const headerOffset = 100;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.scrollY - headerOffset;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth",
      });
    }
  };

  return (
    <div className="space-y-4">
      <motion.section
        initial="hidden"
        animate="visible"
        variants={staggerContainer}
        className="space-y-2"
      >
        <motion.h1 id="choose-bot" variants={fadeInUp} className="brand-heading text-xl font-semibold tracking-tight">
          Products
        </motion.h1>
        <motion.div variants={fadeInUp} className="flex items-center justify-between gap-4">
          <p className="text-sm text-zinc-400 flex-1">
            Automate MT5 trades from Telegram signals today, and explore upcoming bots
            for WhatsApp and rule‑based MT5/MT4 strategies. Choose the automation that
            best fits your trading workflow.
          </p>
          <div className="flex items-center gap-2 flex-shrink-0">
            <span className="text-xs font-medium text-zinc-500">Compatible with:</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-zinc-800 border-2 border-[#5e17eb] shadow-md p-1.5 overflow-hidden transition hover:scale-110">
              <Image
                src={TelegramLogo}
                alt="Telegram Compatible"
                title="Works with Telegram signals"
                width={32}
                height={32}
                className="h-full w-full object-contain"
                loading="lazy"
              />
            </div>
            <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-[#5e17eb] shadow-md p-1.5 overflow-hidden transition hover:scale-110">
              <Image
                src={MT5Logo}
                alt="MT5 Supported"
                title="Executes trades via MetaTrader 5"
                width={32}
                height={32}
                className="h-full w-full object-contain"
                loading="lazy"
              />
            </div>
          </div>
        </motion.div>
      </motion.section>

      {/* Unified Product Selection & Pricing Section */}
      <section id="product-selector" className="space-y-3">
        {/* Horizontal Product Tabs */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
          className="space-y-2"
        >
          <motion.h2 variants={fadeInUp} className="text-sm font-semibold text-zinc-400">
            Choose your bot
          </motion.h2>
          <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
            {products.map((product) => (
              <ProductTabPill
                key={product.id}
                product={product}
                isActive={product.id === activeProduct}
                onClick={() => setActiveProduct(product.id)}
              />
            ))}
          </div>
        </motion.div>

        {/* Product Details & Pricing Layout */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeInUp}
          className="space-y-6"
        >
          {(() => {
            const selectedProduct = products.find((p) => p.id === activeProduct);
            if (!selectedProduct) return null;

            return (
              <>
                {/* Product Details - Collapsible */}
                <div className="rounded-xl border border-zinc-700 bg-gradient-to-br from-zinc-900 to-black shadow-lg overflow-hidden">
                  {/* Collapsible Header */}
                  <button
                    onClick={() => setShowProductDetails(!showProductDetails)}
                    className="w-full flex items-center justify-between p-4 text-left hover:bg-zinc-800/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <h3 className="text-lg font-bold text-white">
                        {selectedProduct.name}
                      </h3>
                      <span
                        className={`whitespace-nowrap rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide ${
                          selectedProduct.statusTone === "primary"
                            ? "bg-blue-600 text-white"
                            : "bg-zinc-700 text-zinc-300"
                        }`}
                      >
                        {selectedProduct.status}
                      </span>
                    </div>
                    <motion.div
                      animate={{ rotate: showProductDetails ? 180 : 0 }}
                      transition={{ duration: 0.2 }}
                      className="text-zinc-400"
                    >
                      <svg
                        width="20"
                        height="20"
                        viewBox="0 0 20 20"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M5 7.5L10 12.5L15 7.5"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </motion.div>
                  </button>

                  {/* Collapsible Content */}
                  <AnimatePresence>
                    {showProductDetails && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="overflow-hidden"
                      >
                        <div className="border-t border-zinc-700 p-4">
                          <p className="mb-3 text-sm text-zinc-300">
                            {selectedProduct.description}
                          </p>
                          <ul className="space-y-1.5">
                            {selectedProduct.bullets.map((bullet, idx) => (
                              <li key={idx} className="flex items-start gap-2 text-sm text-zinc-400">
                                <span className="mt-0.5 inline-flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full bg-[#5e17eb]/20 text-xs text-[#5e17eb]">
                                  ✓
                                </span>
                                <span className="text-xs">{bullet}</span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        {/* Key Features (only for Telegram MT5) */}
                        {activeProduct === "telegram-mt5" && (
                          <div className="border-t border-zinc-700 px-4 py-4">
                            <h4 className="mb-3 text-sm font-semibold text-white">Key Features</h4>
                            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                              {features.map((feature) => (
                                <div key={feature.title} className="space-y-0.5">
                                  <h5 className="text-xs font-semibold text-white">{feature.title}</h5>
                                  <p className="text-xs text-zinc-400">{feature.description}</p>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Pricing Section or Coming Soon */}
                {activeProduct === "telegram-mt5" ? (
                  <div>
                    {/* Pricing Cards - Horizontal */}
                    <div className="grid gap-4 md:grid-cols-3">
                      {pricingPlans.map((plan) => {
                        const planKey = plan.name.toLowerCase();
                        const license = customerLicenses.find((l: any) =>
                          l.plan.toLowerCase().startsWith(planKey)
                        );
                        const isCurrentPlan = !!license;
                        const expiresAt = license?.expires_at;
                        const daysRemaining = expiresAt
                          ? Math.max(
                              0,
                              Math.ceil(
                                (new Date(expiresAt).getTime() - new Date().getTime()) /
                                  (1000 * 60 * 60 * 24)
                              )
                            )
                          : undefined;

                        const showPromoOffer =
                          plan.name === "Starter" && customerLicenses.length === 0;
                        const isLifetime = plan.name === "Lifetime";

                        const hasMonthlyPlan =
                          license && !license.plan.toLowerCase().includes("yearly") && !isLifetime;
                        const isViewingYearly = billingInterval === "yearly" && !isLifetime;
                        const canUpgradeToYearly = hasMonthlyPlan && isViewingYearly;

                        let proratedCredit = 0;
                        if (canUpgradeToYearly && daysRemaining) {
                          const monthlyPrice = plan.name === "Pro" ? 49 : 29;
                          const dailyRate = monthlyPrice / 30;
                          proratedCredit = Math.min(
                            Math.ceil(dailyRate * daysRemaining),
                            monthlyPrice
                          );
                        }

                        return (
                          <DarkProductCard
                            key={plan.name}
                            name={plan.name}
                            badge={plan.badge}
                            price={
                              plan.name === "Starter"
                                ? billingInterval === "monthly"
                                  ? "$29/month"
                                  : "$313/year"
                                : plan.name === "Pro"
                                ? billingInterval === "monthly"
                                  ? "$49/month"
                                  : "$529/year"
                                : "$999 one-time"
                            }
                            yearlyNote={
                              plan.name === "Lifetime"
                                ? "All future versions and features included"
                                : billingInterval === "monthly"
                                ? "Save 10% with yearly billing"
                                : "Billed annually (10% discount applied)"
                            }
                            features={plan.features}
                            featured={plan.featured}
                            paymentLink={
                              plan.name === "Starter"
                                ? `/payment?plan=${
                                    billingInterval === "monthly" ? "starter" : "starter_yearly"
                                  }`
                                : plan.name === "Pro"
                                ? `/payment?plan=${
                                    billingInterval === "monthly" ? "pro" : "pro_yearly"
                                  }`
                                : "/payment?plan=lifetime"
                            }
                            onViewDetailsClick={() => setShowProductDetails(true)}
                            isCurrentPlan={isCurrentPlan}
                            expiresAt={expiresAt}
                            daysRemaining={daysRemaining}
                            showPromoOffer={showPromoOffer}
                            isLifetime={isLifetime}
                            canUpgradeToYearly={canUpgradeToYearly}
                            upgradeYearlyLink={
                              canUpgradeToYearly
                                ? `/payment?plan=${plan.name.toLowerCase()}_yearly&upgrade=true&credit=${proratedCredit.toFixed(
                                    2
                                  )}`
                                : undefined
                            }
                            proratedCredit={proratedCredit}
                            billingInterval={billingInterval}
                            onBillingIntervalChange={setBillingInterval}
                            showBillingToggle={plan.name !== "Lifetime"}
                          />
                        );
                      })}
                    </div>

                    {/* Help text */}
                    <div className="text-center text-sm text-zinc-400">
                      Have questions?{" "}
                      <Link href="/contact" className="font-medium text-[#5e17eb] hover:text-[#4512c2]">
                        Contact us
                      </Link>
                    </div>
                  </div>
                ) : (
                  <ComingSoonMessage
                    productName={selectedProduct.name}
                    productDescription="This product is currently under development. We'll notify you when it's ready."
                  />
                )}
              </>
            );
          })()}
        </motion.div>
      </section>

      {/* Key Features Section */}
      <motion.section
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={staggerContainer}
        className="py-16"
      >
        <motion.div variants={fadeInUp} className="text-center mb-12">
          <h2 className="text-2xl font-bold text-white mb-3">
            BUILT FOR REAL TELEGRAM SIGNAL WORKFLOWS
          </h2>
          <p className="text-sm text-zinc-400 max-w-3xl mx-auto">
            Simple to configure, but powerful enough to handle multiple take-profits, risk-based sizing, and
            different signal formats.
          </p>
        </motion.div>

        <div className="grid gap-6 md:grid-cols-2">
          {[
            {
              title: "24/7 AUTOMATION",
              description: "Let the bot watch your Telegram channels and execute MT5 trades around the clock.",
            },
            {
              title: "MULTI-TP & SL LOGIC",
              description: "Configure multiple take-profit levels, stop loss, and partial closes based on your strategy.",
            },
            {
              title: "RISK-BASED SIZING",
              description: "Control position size by fixed lot or percentage risk per trade on supported MT5 brokers.",
            },
            {
              title: "FLEXIBLE MAPPING",
              description: "Adapt to different Telegram signal formats with configurable mapping rules.",
            },
          ].map((feature, index) => (
            <motion.div
              key={index}
              variants={cardVariants}
              className="rounded-xl border border-blue-500/30 bg-gradient-to-br from-slate-900 to-black p-6 shadow-lg hover:border-blue-500/50 transition-colors"
            >
              <h3 className="text-lg font-bold text-white mb-2">{feature.title}</h3>
              <p className="text-sm text-zinc-400 leading-relaxed">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </motion.section>

    </div>
  );
}


