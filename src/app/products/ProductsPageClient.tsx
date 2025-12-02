"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ProductSummaryCards } from "@/components/ProductSummaryCards";

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
    badge: "For testing on demo",
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

  return (
    <div className="space-y-10">
      <section className="space-y-4">
        <h1 className="reveal brand-heading text-2xl font-semibold tracking-tight">
          Products
        </h1>
        <p className="reveal max-w-3xl text-sm text-zinc-600">
          Automate MT5 trades from Telegram signals today, and explore upcoming bots
          for WhatsApp and rule‑based MT5/MT4 strategies. Choose the automation that
          best fits your trading workflow.
        </p>
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-sm font-medium text-[#5e17eb]">Compatible with:</span>
          <Image
            src="/telegram-badge.svg"
            alt="Telegram Compatible"
            title="Works with Telegram signals"
            width={32}
            height={32}
            className="h-8 w-8 transition hover:scale-110"
            loading="lazy"
          />
          <Image
            src="/mt5-badge.svg"
            alt="MT5 Supported"
            title="Executes trades via MetaTrader 5"
            width={32}
            height={32}
            className="h-8 w-8 transition hover:scale-110"
            loading="lazy"
          />
        </div>
      </section>

      {/* Product cards */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-zinc-900">Choose your bot</h2>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {products.map((product) => {
            const isActive = product.id === activeProduct;
            return (
              <button
                key={product.id}
                type="button"
                onClick={() => setActiveProduct(product.id)}
                className={`flex h-full flex-col rounded-xl border bg-white/90 p-5 text-left shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-[#5e17eb] ${
                  isActive ? "border-[#5e17eb]" : "border-zinc-200"
                }`}
              >
                <div className="mb-2 flex items-center justify-between gap-2">
                  <h3 className="text-sm font-semibold text-zinc-900">
                    {product.name}
                  </h3>
                  <span
                    className={`whitespace-nowrap rounded-full px-2.5 py-1 text-[0.65rem] font-semibold uppercase tracking-wide ${
                      product.statusTone === "primary"
                        ? "bg-[#5e17eb] text-white"
                        : "bg-zinc-100 text-zinc-700"
                    }`}
                  >
                    {product.status}
                  </span>
                </div>
                <p className="mb-3 text-xs text-zinc-600">{product.description}</p>
                <ul className="mb-4 space-y-1 text-xs text-zinc-700">
                  {product.bullets.map((item) => (
                    <li key={item}>• {item}</li>
                  ))}
                </ul>
                {product.id === "telegram-mt5" && (
                  <div className="mt-auto pt-1">
                    <Link
                      href="#telegram-details"
                      className="inline-flex w-full items-center justify-center rounded-md bg-[#5e17eb] px-4 py-2 text-sm font-medium !text-white shadow-sm transition hover:bg-[#4512c2] hover:scale-105 hover:shadow-lg"
                    >
                      View details
                    </Link>
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </section>

      {/* Current product details (moved from landing page) */}
      {activeProduct === "telegram-mt5" && (
        <section id="telegram-details" className="space-y-10">
          {/* How the bot fits card */}
          <section className="relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] w-screen bg-[var(--bg-light-2)] pb-8">
            <div className="mx-auto max-w-6xl px-6">
              <div className="brand-callout relative mx-auto max-w-xl rounded-xl bg-white/80 p-6 shadow-sm">
                <h3 className="mb-3 text-sm font-semibold text-[var(--text-main)]">
                  How the Telegram → MT5 bot fits into your trading
                </h3>
                <p className="mb-4 text-sm text-[var(--text-muted)]">
                  Choose your Telegram signal provider, configure your rules once, and let
                  the bot handle the execution on MT5. You stay in control of risk and
                  broker selection at all times.
                </p>
                <ul className="space-y-2 text-xs text-[var(--text-muted)]">
                  <li>• Works with MT5 EAs and supported brokers</li>
                  <li>• Designed for running on Windows or VPS</li>
                  <li>• Start safely on a demo account first</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Key features */}
          <section className="relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] w-screen bg-[var(--bg-dark-2)] py-16 text-[var(--text-on-dark)]">
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
              <div className="grid gap-6 md:grid-cols-2">
                {features.map((feature) => (
                  <div
                    key={feature.title}
                    className="rounded-lg border border-[var(--border-on-dark-strong)] bg-[var(--bg-dark-3)] p-6 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-[0_18px_45px_rgba(15,23,42,0.75)] hover:border-[var(--brand-blue-soft)]"
                  >
                    <h3 className="mb-2 text-base font-semibold">{feature.title}</h3>
                    <p className="text-sm text-zinc-400">{feature.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Simple plans section */}
          <section className="relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] w-screen bg-[var(--bg-light-2)] py-16">
            <div className="mx-auto max-w-6xl px-6">
              <div className="mb-8 text-center">
                <h2 className="mb-3 text-2xl font-semibold text-[var(--text-main)] md:text-3xl">
                  Simple plans for different trading stages
                </h2>
                <p className="mx-auto max-w-2xl text-sm text-[var(--text-muted)] md:text-base">
                  Start on demo, then scale to live once you are comfortable. Pricing
                  details are available on the products and payment pages.
                </p>
              </div>
              <div className="grid gap-6 md:grid-cols-3">
                {pricingPlans.map((plan) => (
                  <div
                    key={plan.name}
                    className={`flex flex-col rounded-xl border bg-white/80 p-6 text-left shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-lg ${
                      plan.featured
                        ? "border-[var(--brand-blue)] shadow-md"
                        : "border-[var(--border-subtle)]"
                    }`}
                  >
                    <div className="mb-2 flex items-center justify-between">
                      <h3 className="text-base font-semibold text-[var(--text-main)]">
                        {plan.name}
                      </h3>
                      {plan.badge && (
                        <span className="rounded-full bg-[var(--brand-blue-soft)]/20 px-3 py-1 text-xs font-medium text-[var(--brand-blue-deep)]">
                          {plan.badge}
                        </span>
                      )}
                    </div>
                    <ul className="mb-4 mt-3 space-y-2 text-sm text-[var(--text-muted)]">
                      {plan.features.map((item) => (
                        <li key={item}>• {item}</li>
                      ))}
                    </ul>
                    <div className="mt-auto pt-2">
                      <Link
                        href={
                          plan.name === "Starter"
                            ? "/payment?plan=starter"
                            : plan.name === "Pro"
                              ? "/payment?plan=pro"
                              : "/payment?plan=lifetime"
                        }
                        className={`inline-flex w-full items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition ${
                          plan.featured
                            ? "bg-[var(--brand-blue)] text-white hover:bg-[var(--brand-blue-deep)]"
                            : "border border-[var(--border-subtle)] text-[var(--text-main)] hover:border-[var(--brand-blue-soft)] hover:text-[var(--brand-blue-deep)]"
                        }`}
                      >
                        Go to payment
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
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
        </section>
      )}

      {/* Summary cards */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-zinc-900">
          Overview, requirements & what&apos;s included
        </h2>
        <ProductSummaryCards />
      </section>
    </div>
  );
}


