"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, Variants } from "framer-motion";
import { DarkProductCard } from "@/components/DarkProductCard";
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
    <div className="space-y-10">
      <motion.section
        initial="hidden"
        animate="visible"
        variants={staggerContainer}
        className="space-y-4 pt-10"
      >
        <motion.h1 id="choose-bot" variants={fadeInUp} className="brand-heading text-2xl font-semibold tracking-tight">
          Products
        </motion.h1>
        <motion.p variants={fadeInUp} className="max-w-3xl text-sm text-zinc-400">
          Automate MT5 trades from Telegram signals today, and explore upcoming bots
          for WhatsApp and rule‑based MT5/MT4 strategies. Choose the automation that
          best fits your trading workflow.
        </motion.p>
        <motion.div variants={fadeInUp} className="flex flex-wrap items-center gap-3">
          <span className="text-sm font-medium text-[#5e17eb]">Compatible with:</span>
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-zinc-800 border-2 border-[#5e17eb] shadow-md p-2 overflow-hidden transition hover:scale-110">
            <Image
              src={TelegramLogo}
              alt="Telegram Compatible"
              title="Works with Telegram signals"
              width={40}
              height={40}
              className="h-full w-full object-contain"
              loading="lazy"
            />
          </div>
          <div className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-[#5e17eb] shadow-md p-2 overflow-hidden transition hover:scale-110">
            <Image
              src={MT5Logo}
              alt="MT5 Supported"
              title="Executes trades via MetaTrader 5"
              width={40}
              height={40}
              className="h-full w-full object-contain"
              loading="lazy"
            />
          </div>
        </motion.div>
      </motion.section>

      {/* Product cards */}
      <motion.section
        initial="hidden"
        animate="visible"
        variants={staggerContainer}
        className="space-y-4"
      >
        <motion.h2 variants={fadeInUp} className="text-lg font-semibold text-zinc-400">Choose your bot</motion.h2>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {products.map((product) => {
            const isActive = product.id === activeProduct;
            return (
              <motion.button
                key={product.id}
                variants={cardVariants}
                type="button"
                onClick={() => {
                  // Only allow selecting the current product (telegram-mt5)
                  if (product.id === "telegram-mt5") {
                    setActiveProduct(product.id);
                  }
                }}
                className={`flex h-full flex-col rounded-xl border bg-zinc-800/80 backdrop-blur-sm p-5 text-left shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-[#5e17eb] ${isActive ? "border-[#5e17eb]" : "border-zinc-700"
                  }`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="mb-4 flex justify-start">
                  <span
                    className={`whitespace-nowrap rounded-full px-2.5 py-1 text-[0.65rem] font-semibold uppercase tracking-wide ${product.statusTone === "primary"
                      ? "bg-[#5e17eb] text-white"
                      : "bg-zinc-700 text-zinc-300"
                      }`}
                  >
                    {product.status}
                  </span>
                </div>
                <h3 className="mb-2 text-sm font-semibold text-white">
                  {product.name}
                </h3>
                <p className="mb-3 text-xs text-zinc-300">{product.description}</p>
                <ul className="mb-4 space-y-1 text-xs text-zinc-400">
                  {product.bullets.map((item) => (
                    <li key={item}>• {item}</li>
                  ))}
                </ul>
                {product.id === "telegram-mt5" && (
                  <div className="mt-auto pt-1">
                    <Link
                      href="#telegram-details"
                      onClick={(e) => scrollToSection(e, "telegram-details")}
                      className="inline-flex w-full items-center justify-center rounded-md bg-[#5e17eb] px-4 py-2 text-sm font-medium !text-white shadow-sm transition hover:bg-[#4512c2] hover:scale-105 hover:shadow-lg"
                    >
                      View details
                    </Link>
                  </div>
                )}
              </motion.button>
            );
          })}
        </div>
      </motion.section>

      {/* Current product details (moved from landing page) */}
      {activeProduct === "telegram-mt5" && (
        <section id="telegram-details">
          {/* Simple plans section */}
          <section id="plans" className="relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] w-screen bg-[var(--bg-light-2)] py-16">
            <div className="mx-auto max-w-6xl px-6">
              <div className="mb-8 text-center">
                <h2 className="mb-3 text-2xl font-semibold text-[var(--text-main)] md:text-3xl">
                  Simple plans for different trading stages
                </h2>
                <p className="mx-auto max-w-2xl text-sm text-[var(--text-muted)] md:text-base mb-8">
                  Start on demo, then scale to live once you are comfortable. Pricing
                  details are available on the products and payment pages.
                </p>

                {/* Billing Toggle */}
                <div className="flex justify-center items-center gap-3">
                  <span className={`text-sm font-medium ${billingInterval === 'monthly' ? 'text-[var(--text-main)]' : 'text-[var(--text-muted)]'}`}>
                    Monthly
                  </span>
                  <button
                    onClick={() => setBillingInterval(prev => prev === 'monthly' ? 'yearly' : 'monthly')}
                    className="relative h-7 w-12 rounded-full bg-zinc-700 transition-colors hover:bg-zinc-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#5e17eb] focus-visible:ring-offset-2 focus-visible:ring-offset-white"
                  >
                    <motion.div
                      className="absolute left-1 top-1 h-5 w-5 rounded-full bg-white shadow-sm"
                      animate={{ x: billingInterval === 'monthly' ? 0 : 20 }}
                      transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    />
                  </button>
                  <span className={`text-sm font-medium ${billingInterval === 'yearly' ? 'text-[var(--text-main)]' : 'text-[var(--text-muted)]'}`}>
                    Yearly <span className="text-[#5e17eb] font-bold text-xs ml-1">(Save 10%)</span>
                  </span>
                </div>
              </div>
              <motion.div
                className="grid gap-6 md:grid-cols-3"
                variants={staggerContainer}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-100px" }}
              >
                {pricingPlans.map((plan) => {
                  const planKey = plan.name.toLowerCase();
                  const license = customerLicenses.find((l: any) => l.plan.toLowerCase().startsWith(planKey));
                  const isCurrentPlan = !!license;
                  const expiresAt = license?.expires_at;
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
                    const monthlyPrice = plan.name === "Pro" ? 49 : 29;
                    const dailyRate = monthlyPrice / 30;
                    proratedCredit = Math.min(Math.ceil(dailyRate * daysRemaining), monthlyPrice);
                  }

                  return (
                    <motion.div key={plan.name} variants={cardVariants} className="h-full">
                      <DarkProductCard
                        name={plan.name}
                        badge={plan.badge}
                        price={
                          plan.name === "Starter"
                            ? (billingInterval === 'monthly' ? "$29/month" : "$313/year")
                            : plan.name === "Pro"
                              ? (billingInterval === 'monthly' ? "$49/month" : "$529/year")
                              : "$999 one-time"
                        }
                        yearlyNote={
                          plan.name === "Lifetime"
                            ? "All future versions and features included"
                            : billingInterval === 'monthly'
                              ? "Save 10% with yearly billing"
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
                        viewDetailsHref="#choose-bot"
                        onViewDetailsClick={(e) => scrollToSection(e, "choose-bot")}
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
                      />
                    </motion.div>
                  );
                })}
              </motion.div>
              <div className="mt-6 text-center text-sm text-[var(--text-muted)]">
                Have questions before you buy?{" "}
                <Link
                  href="/contact"
                  className="font-medium text-[var(--brand-blue)] hover:text-[var(--brand-blue-deep)]"
                >
                  Contact us
                </Link>
                .
              </div>
            </div>
          </section>

          {/* Key features */}
          <section
            id="telegram-features"
            className="relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] w-screen bg-[var(--bg-dark-2)] py-16 text-[var(--text-on-dark)]"
          >
            <div className="mx-auto max-w-6xl px-6">
              <div className="mb-10 text-center">
                <h2 className="mb-3 text-2xl font-semibold md:text-3xl">
                  Built for real Telegram signal workflows
                </h2>
                <p className="mx-auto max-w-2xl text-sm text-zinc-400 md:text-base">
                  Simple to configure, but powerful enough to handle multiple take‑profits,
                  risk‑based sizing, and different signal formats.
                </p>
              </div>
              <motion.div
                className="grid gap-6 md:grid-cols-2"
                variants={staggerContainer}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
              >
                {features.map((feature) => (
                  <motion.div
                    key={feature.title}
                    variants={cardVariants}
                    className="rounded-lg border border-[var(--border-on-dark-strong)] bg-[var(--bg-dark-3)] p-6 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-[0_18px_45px_rgba(15,23,42,0.75)] hover:border-[var(--brand-blue-soft)]"
                  >
                    <h3 className="mb-2 text-base font-semibold">{feature.title}</h3>
                    <p className="text-sm text-zinc-400">{feature.description}</p>
                  </motion.div>
                ))}
              </motion.div>
            </div>
          </section>
        </section>
      )}


    </div>
  );
}


