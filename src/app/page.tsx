"use client";
import React, { useState } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import XmLogo from "../../broker_logos/XM-Logo.webp";
import { resourceArticles } from "@/data/resources";

export default function Home() {
  const [showFullFeatureComparison, setShowFullFeatureComparison] = useState<
    Record<string, boolean>
  >({});
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

  const steps = [
    {
      title: "Connect Telegram",
      description: "Point the bot to your signal channel or group.",
    },
    {
      title: "Configure strategy",
      description: "Choose lot sizing, TP / SL behavior, and risk limits.",
    },
    {
      title: "Map signal format",
      description: "Tell the bot how to read pair, direction, and price levels.",
    },
    {
      title: "Run on VPS or PC",
      description: "Keep MT5 and the bot online for continuous execution.",
    },
    {
      title: "Monitor & refine",
      description: "Track trades and tweak settings as your strategy evolves.",
    },
  ];

  const comparisonRows = [
    {
      icon: "⚡",
      label: "Execution speed",
      manual: "You manually copy signals when you are online.",
      bot: "Orders are placed automatically within seconds of the signal.",
    },
    {
      icon: "⏰",
      label: "Missed trades",
      manual: "Easy to miss late‑night or work‑time signals.",
      bot: "Runs 24/7 on VPS so signals are not missed.",
    },
    {
      icon: "🎯",
      label: "Consistency",
      manual: "Decisions can be emotional and inconsistent.",
      bot: "Rules are followed exactly as configured every time.",
    },
    {
      icon: "🧠",
      label: "Workload",
      manual: "You monitor chats and place every trade by hand.",
      bot: "You focus on strategy while execution is automated.",
    },
  ];

  const eaComparisonRows = [
    {
      icon: "⚙️",
      label: "Setup steps",
      ea: "Install MT4/MT5 EA plugin, configure each terminal, then link to the copier app.",
      ours: "Install one Windows app, connect Telegram and MT5 once, and start copying.",
    },
    {
      icon: "🧩",
      label: "Components required",
      ea: "Desktop controller + separate EA scripts inside every MT4/MT5 terminal.",
      ours: "Single desktop application that talks directly to your MT5 terminal.",
    },
    {
      icon: "🔄",
      label: "Updates & maintenance",
      ea: "Keep both the desktop app and all installed EAs up to date across terminals.",
      ours: "Update just one desktop app when new versions are released.",
    },
    {
      icon: "🔁",
      label: "Changing brokers or accounts",
      ea: "Re‑install or re‑link EAs when switching accounts or terminals.",
      ours: "Update MT5 login details in Settings; no EA re‑installation needed.",
    },
    {
      icon: "👤",
      label: "Who it suits best",
      ea: "More comfortable for advanced or technically confident traders.",
      ours: "Designed for traders who want a simpler setup with guided support.",
    },
  ];

  const featureCategories = [
    {
      id: "execution",
      icon: "⚡",
      title: "Execution & parsing",
      caption: "How signals are understood and turned into trades.",
      features: [
        {
          label: "Execution speed",
          competitors: "Market leaders advertise 70–300ms execution depending on VPS and broker.",
          ours: "Desktop MT5 API with low‑latency execution; exact milliseconds depend on your VPS and broker routing.",
          advantage: false,
        },
        {
          label: "AI / image signal parsing",
          competitors: "Use AI / Vision / OCR engines to parse screenshots and any text layout.",
          ours: "Deliberately text‑only: configurable keyword + regex rules tuned for FX, GOLD, crypto formats you control.",
          advantage: true,
        },
        {
          label: "Flexible text formats",
          competitors: "Handle most formats but often hide mapping logic behind black‑box AI.",
          ours: "Per‑strategy parsing rules so each signal channel can have its own BUY/SELL, SL/TP, and entry extraction logic.",
          advantage: true,
        },
        {
          label: "Trailing take‑profit & breakeven",
          competitors: "Built‑in trailing and breakeven, usually with a single rule set.",
          ours: "Central BreakevenManager per strategy with multi‑level trailing TP/SL and automatic SL‑to‑entry behaviour.",
          advantage: true,
        },
      ],
    },
    {
      id: "platform",
      icon: "🖥️",
      title: "Platform & setup",
      caption: "Where it runs and how hard it is to configure.",
      features: [
        {
          label: "Architecture",
          competitors: "Windows desktop controller + MT4/MT5 EAs that must be installed into each terminal.",
          ours: "Pure Windows desktop app connecting directly to MT5; no EA deployment or per‑terminal scripts.",
          advantage: true,
        },
        {
          label: "Other platform support (MT4, cTrader, DXTrade…)",
          competitors: "Some cover 4–5 trading platforms via separate EAs or connectors.",
          ours: "Not required – SignalTradingBots focuses on MT5 and handles all automation through your MT5 terminal.",
          advantage: true,
        },
        {
          label: "Algo trading switch",
          competitors: "User must manually enable algo/auto‑trading in MT4/MT5 and keep it on.",
          ours: "Attempts to toggle MT5 “Algo Trading” automatically via hotkeys and window focus during setup.",
          advantage: true,
        },
        {
          label: "VPS friendliness",
          competitors: "Designed for VPS but still require EA installs and MT4/MT5 configuration.",
          ours: "One Windows installer on a VPS with MT5 running – fewer moving parts to manage or break.",
          advantage: true,
        },
      ],
    },
    {
      id: "orders-risk",
      icon: "🛡️",
      title: "Orders, risk & prop‑firm tools",
      caption: "How positions are opened, managed and protected.",
      features: [
        {
          label: "Multi‑TP & partial close",
          competitors: "Support explicit partial closes and multiple TP levels.",
          ours: "Up to 10 trades per signal, each with its own TP – partial closes are handled via multiple positions instead of one big order.",
          advantage: true,
        },
        {
          label: "Price‑range entries & pending orders",
          competitors: "Standard pending orders with basic expiry controls.",
          ours: "Price‑range entry mode that waits for price to reach your zone and places multi‑TP pending orders with configurable expiry.",
          advantage: true,
        },
        {
          label: "Daily loss / profit guardrails",
          competitors: "Dedicated “prop firm modes” with daily and sometimes overall limits.",
          ours: "Per‑strategy daily loss and profit targets that can trigger No New Entries, Immediate Exit, or full stop of the bot.",
          advantage: true,
        },
        {
          label: "Hidden comments & discretion",
          competitors: "Offer options to hide provider details in trade comments.",
          ours: "MT5 comments are strategy/magic‑based only; signal provider or channel names are never written to trades.",
          advantage: true,
        },
      ],
    },
    {
      id: "analytics-support",
      icon: "📊",
      title: "Analytics, audit & support experience",
      caption: "How you see what’s happening and learn from it.",
      features: [
        {
          label: "Dashboard & daily progress",
          competitors: "Some provide profit charts or simple account stats.",
          ours: "Dashboard tab shows daily P&L, equity/balance, per‑strategy stats, and cumulative totals so you can track progress at a glance.",
          advantage: true,
        },
        {
          label: "Channel‑wise strategies & comparison",
          competitors: "Per‑channel or per‑provider settings exist, but scoring is often hidden.",
          ours: "Build custom strategies per signal channel with dedicated parsing and risk rules, plus panels that compare strategy performance.",
          advantage: true,
        },
        {
          label: "Per‑signal Audit tab",
          competitors: "May log activity, but rarely expose a full audit trail per signal.",
          ours: "Dedicated Audit tab records parse/validate/execute status, latency and full detail for every processed signal.",
          advantage: true,
        },
        {
          label: "Detailed logs & in‑app help",
          competitors: "Rely on simple logs and external web docs or Telegram groups.",
          ours: "Rich Logs tab with filters plus an in‑app Help tab that pulls news, promo banners and YouTube tutorials directly into the desktop app.",
          advantage: true,
        },
      ],
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

  const testimonials = [
    {
      name: "Daniel M.",
      role: "Forex trader (demo to live)",
      quote:
        "After switching to the bot, I stopped missing late‑night signals. It quietly runs on my VPS and mirrors my Telegram channel.",
    },
    {
      name: "Sara K.",
      role: "Signal follower",
      quote:
        "Setup was straightforward and the risk controls give me confidence. I started on demo first, then moved to a small live account.",
    },
    {
      name: "Imran T.",
      role: "Automated trading enthusiast",
      quote:
        "Exactly what I needed: simple Telegram → MT5 automation without extra noise. Support helped me configure my broker in one session.",
    },
  ];

  const executionFlow = [
    {
      title: "Telegram signals",
      description: "Bot listens to your configured channels via Pyrogram/Telethon.",
      icon: "📩",
    },
    {
      title: "SignalTradingBots app",
      description: "Rules map each signal to strategies, TP/SL logic, and risk guardrails.",
      icon: "🤖",
    },
    {
      title: "MT5 terminal",
      description: "Orders are executed on your MT5 terminal running on Windows or VPS.",
      icon: "📈",
    },
  ];

  const securityHighlights = [
    "Runs on your own Windows PC or VPS – we never hold broker logins.",
    "MT5 trade comments never expose your signal providers or channels.",
    "Recommended workflow: start on demo, then go live once you trust the setup.",
    "Keep VPS monitored; if MT5 closes, the bot pauses to avoid unmanaged trades.",
  ];

  const supportItems = [
    {
      title: "Email & Telegram support",
      description: "support@signaltradingbots.com with typical 12–24h response windows.",
    },
    {
      title: "Guided onboarding",
      description: "We help map your channels, configure strategies, and verify MT5 connectivity.",
    },
    {
      title: "In-app help center",
      description: "News, promo banners, and YouTube walkthroughs are available directly inside the desktop app.",
    },
  ];

  const faqs = [
  const featuredResources = resourceArticles.slice(0, 3);
    {
      question: "Do I need a VPS?",
      answer:
        "We strongly recommend running the bot on a Windows VPS so it can stay online 24/7 with MT5 open.",
    },
    {
      question: "Which brokers are supported?",
      answer:
        "Any MT5 broker that allows Expert Advisors (EAs) should work. Always check your broker’s conditions and rules.",
    },
    {
      question: "Can I test on a demo account first?",
      answer:
        "Yes. You should always start on a demo account to validate your configuration before using real funds.",
    },
    {
      question: "Does the bot guarantee profits?",
      answer:
        "No. Trading involves significant risk and past performance does not guarantee future results.",
    },
  ];

  return (
    <>
      {/* Notice Banner */}
      <div className="py-2">
        <div className="mx-auto max-w-6xl px-4 text-center">
          <p className="text-xs font-medium text-[var(--brand-blue-deep)]">
            Service will be commencing on <strong>26th November</strong>
          </p>
        </div>
      </div>

      {/* Hero Section - Full Width (LIGHT) */}
      <section className="relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] w-screen bg-[var(--bg-light-2)] py-16">
        <div className="mx-auto flex max-w-6xl flex-col items-start gap-10 px-6">
          <div className="space-y-6">
            <motion.h1
              initial={{ opacity: 0, x: -80 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="reveal brand-heading max-w-5xl text-4xl font-semibold leading-tight tracking-tight md:text-7xl lg:text-[clamp(5rem,9vw,9rem)]"
            >
              <span className="block">Automate MT5 trades</span>
              <span className="block">directly from Telegram signals</span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, x: 60 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2, duration: 0.6, ease: "easeOut" }}
              className="reveal max-w-xl text-sm text-[var(--text-muted)] md:text-base"
            >
              Configure multi‑TP and SL logic, order types, and lot sizing once. The bot
              watches your Telegram channels and executes trades on MT5 while you sleep.
            </motion.p>
            <div className="flex flex-wrap gap-4">
              <Link
                href="/products"
                className="rounded-md bg-[var(--brand-blue)] px-5 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-[var(--brand-blue-deep)] hover:scale-105 hover:shadow-lg"
              >
                View Products
              </Link>
              <Link
                href="/specs"
                className="rounded-md border border-[var(--border-subtle)] px-5 py-2 text-sm font-medium text-[var(--text-main)] transition hover:border-[var(--brand-blue-soft)] hover:text-[var(--brand-blue-deep)]"
              >
                View Specs
              </Link>
            </div>
            <div className="mt-6 space-y-4">
              <div className="flex flex-wrap items-center gap-3">
                <span className="text-xs font-medium uppercase tracking-wide text-[var(--text-muted)]">
                  Supported platforms
                </span>
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
            </div>
          </div>
        </div>
      </section>

      {/* Resources teaser (LIGHT) */}
      <section className="relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] w-screen bg-white py-16">
        <div className="mx-auto max-w-6xl px-6 space-y-6">
          <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-end">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[var(--brand-blue-deep)]">
                Resources
              </p>
              <h3 className="text-2xl font-semibold text-[var(--text-main)] md:text-3xl">
                Learn the playbooks behind reliable automation
              </h3>
              <p className="max-w-2xl text-sm text-[var(--text-muted)] md:text-base">
                Articles covering Telegram → MT5 setup, prop firm guardrails, and VPS best
                practices. All content is written for traders who prefer clarity over hype.
              </p>
            </div>
            <Link
              href="/resources"
              className="inline-flex items-center justify-center rounded-full border border-[var(--border-subtle)] px-4 py-2 text-xs font-semibold text-[var(--text-main)] transition hover:border-[var(--brand-blue-soft)] hover:text-[var(--brand-blue-deep)]"
            >
              View all resources
            </Link>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {featuredResources.map((article) => (
              <Link
                key={article.id}
                href={`/resources#${article.id}`}
                className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-light-2)] p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
              >
                <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-[var(--brand-blue-deep)]">
                  <span>{article.category}</span>
                  <span className="text-[var(--text-muted)]">· {article.readTime}</span>
                </div>
                <h4 className="mb-2 text-base font-semibold text-[var(--text-main)]">
                  {article.title}
                </h4>
                <p className="text-xs text-[var(--text-muted)]">
                  {article.description}
                </p>
                <div className="mt-4 text-[0.65rem] uppercase tracking-wide text-[var(--text-muted)]">
                  Keyword: {article.primaryKeyword}
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* How the bot fits card (LIGHT, under hero) */}
      <section className="relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] w-screen bg-[var(--bg-light-2)] pb-8">
        <div className="mx-auto max-w-6xl px-6">
          <div className="brand-callout relative mx-auto max-w-xl rounded-xl bg-white/80 p-6 shadow-sm">
            <h3 className="mb-3 text-sm font-semibold text-[var(--text-main)]">
              How the bot fits into your trading
            </h3>
            <p className="mb-4 text-sm text-[var(--text-muted)]">
              Choose your signal provider, configure your rules once, and let the bot
              handle the execution on MT5. You stay in control of risk and broker
              selection at all times.
            </p>
            <ul className="space-y-2 text-xs text-[var(--text-muted)]">
              <li>• Works with MT5 EAs and supported brokers</li>
              <li>• Designed for running on Windows or VPS</li>
              <li>• Start safely on a demo account first</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Key Features (DARK) */}
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

      {/* How It Works (LIGHT) */}
      <section className="relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] w-screen bg-[var(--bg-light-2)] py-16">
        <div className="mx-auto max-w-6xl px-6">
          <div className="mb-8 text-center">
            <h2 className="mb-3 text-2xl font-semibold text-[var(--text-main)] md:text-3xl">
              How it works
            </h2>
            <p className="mx-auto max-w-2xl text-sm text-[var(--text-muted)] md:text-base">
              A clear step‑by‑step flow from Telegram signal to MT5 execution so you know
              exactly what the bot is doing.
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-5">
            {steps.map((step, index) => (
              <div
                key={step.title}
                className="flex flex-col rounded-lg bg-white/70 p-4 text-left shadow-sm transition-transform duration-200 hover:-translate-y-1 hover:shadow-lg"
              >
                <span className="mb-2 inline-flex h-7 w-7 items-center justify-center rounded-full bg-[var(--brand-blue)] text-xs font-semibold text-white">
                  {index + 1}
                </span>
                <h3 className="mb-1 text-sm font-semibold text-[var(--text-main)]">
                  {step.title}
                </h3>
                <p className="text-xs text-[var(--text-muted)]">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Manual vs Bot Comparison (DARK) */}
      <section className="relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] w-screen bg-[var(--bg-dark-3)] py-16 text-[var(--text-on-dark)]">
        <div className="mx-auto max-w-6xl px-6">
          <div className="mb-10 space-y-6">
            <div className="mx-auto max-w-3xl rounded-full border border-[var(--border-on-dark-strong)] bg-[rgba(15,23,42,0.9)] px-6 py-3 text-center text-xs font-medium tracking-wide text-zinc-300">
              Understand why traders move away from manual copying and complex EA setups
              towards a single, easier desktop app.
            </div>
            <div className="text-center">
              <h2 className="mb-3 text-2xl font-semibold md:text-3xl">
                Manual copying vs automation
              </h2>
              <p className="mx-auto max-w-2xl text-sm text-zinc-400 md:text-base">
                See where automation adds value while you still control risk, broker, and
                strategy.
              </p>
            </div>
            <div className="overflow-hidden rounded-xl border border-[var(--border-on-dark-strong)] bg-[var(--bg-dark-2)] shadow-sm">
              <div className="grid grid-cols-3 border-b border-[var(--border-on-dark-strong)] bg-black/30 px-4 py-3 text-xs font-semibold uppercase tracking-wide text-zinc-400 md:px-6">
                <div className="text-left">Aspect</div>
                <div className="text-center">Manual</div>
                <div className="text-center text-[var(--brand-blue-soft)]">With bot</div>
              </div>
              <div className="divide-y divide-[var(--border-on-dark-strong)]">
                {comparisonRows.map((row) => (
                  <div
                    key={row.label}
                    className="grid grid-cols-3 gap-4 px-4 py-4 md:px-6 md:py-5"
                  >
                    <div className="flex items-start gap-2 text-sm font-medium">
                      <span className="mt-[1px] text-base">{row.icon}</span>
                      <span>{row.label}</span>
                    </div>
                    <div className="text-sm text-zinc-400">
                      {row.manual}
                    </div>
                    <div className="rounded-lg bg-[rgba(37,99,235,0.15)] px-3 py-2 text-sm text-zinc-100 ring-1 ring-[rgba(37,99,235,0.4)]">
                      {row.bot}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="text-center">
              <h3 className="mb-2 text-lg font-semibold md:text-xl">
                Desktop app vs EA‑based copiers
              </h3>
              <p className="mx-auto max-w-2xl text-sm text-zinc-400 md:text-base">
                Many competitors require both a desktop controller and MT4/MT5 EA plugins.
                SignalTradingBots keeps things simple with a single desktop application.
              </p>
            </div>
            <div className="overflow-hidden rounded-xl border border-[var(--border-on-dark-strong)] bg-[var(--bg-dark-2)] shadow-sm">
              <div className="grid grid-cols-3 border-b border-[var(--border-on-dark-strong)] bg-black/30 px-4 py-3 text-xs font-semibold uppercase tracking-wide text-zinc-400 md:px-6">
                <div className="text-left">Aspect</div>
                <div className="text-center">Typical EA‑based copier</div>
                <div className="text-center text-[var(--brand-blue-soft)]">
                  SignalTradingBots app
                </div>
              </div>
              <div className="divide-y divide-[var(--border-on-dark-strong)]">
                {eaComparisonRows.map((row) => (
                  <div
                    key={row.label}
                    className="grid grid-cols-3 gap-4 px-4 py-4 md:px-6 md:py-5"
                  >
                    <div className="flex items-start gap-2 text-sm font-medium">
                      <span className="mt-[1px] text-base">{row.icon}</span>
                      <span>{row.label}</span>
                    </div>
                    <div className="text-sm text-zinc-400">
                      {row.ea}
                    </div>
                    <div className="rounded-lg bg-[rgba(37,99,235,0.15)] px-3 py-2 text-sm text-zinc-100 ring-1 ring-[rgba(37,99,235,0.4)]">
                      {row.ours}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* High-level feature comparison vs competitors (LIGHT, 4 categories, each expandable) */}
      <section className="relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] w-screen bg-[var(--bg-light-2)] py-16">
        <div className="mx-auto max-w-6xl px-6">
          <div className="mb-8 text-center">
            <h3 className="mb-2 text-2xl font-semibold text-[var(--text-main)] md:text-3xl">
              Key feature comparison vs leading Telegram copiers
            </h3>
            <p className="mx-auto max-w-3xl text-sm text-[var(--text-muted)] md:text-base">
              Based on public specs from tools like TSC, TSCopier and Telegram Copier,
              plus the full internal feature matrix for SignalTradingBots.
            </p>
          </div>
          <div className="space-y-6">
            {featureCategories.map((cat) => (
              <div
                key={cat.id}
                className="rounded-xl border border-[var(--border-subtle)] bg-white/90 p-5 shadow-sm"
              >
                <div className="mb-3 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                  <div>
                    <h4 className="flex items-center gap-2 text-sm font-semibold text-[var(--text-main)]">
                      <span className="text-base">{cat.icon}</span>
                      <span>{cat.title}</span>
                    </h4>
                    <p className="text-xs text-[var(--text-muted)]">{cat.caption}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      setShowFullFeatureComparison((prev) => ({
                        ...prev,
                        [cat.id]: !prev[cat.id],
                      }))
                    }
                    className="mt-1 inline-flex items-center justify-center rounded-full border border-[var(--border-subtle)] bg-white px-3 py-1.5 text-[0.7rem] font-medium text-[var(--text-main)] shadow-sm transition hover:border-[var(--brand-blue-soft)] hover:text-[var(--brand-blue-deep)] md:mt-0"
                  >
                    {showFullFeatureComparison[cat.id]
                      ? "Hide full list"
                      : "Show full list"}
                  </button>
                </div>

                <div className="grid gap-3 text-xs text-[var(--text-muted)] md:grid-cols-3">
                  <div className="rounded-l-md bg-[rgba(37,99,235,0.06)] px-3 py-2 text-[0.7rem] font-semibold uppercase tracking-wide text-[var(--text-main)]">
                    Feature
                  </div>
                  <div className="bg-[rgba(37,99,235,0.06)] px-3 py-2 text-[0.7rem] font-semibold uppercase tracking-wide text-[var(--text-main)]">
                    Typical competitors
                  </div>
                  <div className="rounded-r-md bg-[rgba(37,99,235,0.08)] px-3 py-2 text-[0.7rem] font-semibold uppercase tracking-wide text-[var(--brand-blue-deep)]">
                    SignalTradingBots
                  </div>
                  {cat.features
                    .slice(
                      0,
                      showFullFeatureComparison[cat.id] ? cat.features.length : 3,
                    )
                    .map((f) => (
                      <React.Fragment key={f.label}>
                        <div className="border-b border-[rgba(148,163,184,0.25)] pb-2 pt-1 font-medium text-[var(--text-main)] last:border-b-0">
                          {f.label}
                        </div>
                        <div className="border-b border-[rgba(148,163,184,0.25)] pb-2 pt-1 last:border-b-0">
                          {f.competitors}
                        </div>
                        <div
                          className={
                            f.advantage
                              ? "border-b border-[rgba(148,163,184,0.25)] pb-2 pt-1 text-[var(--text-main)] last:border-b-0"
                              : "border-b border-[rgba(148,163,184,0.25)] pb-2 pt-1 text-[var(--text-main)] last:border-b-0"
                          }
                        >
                          <span
                            className={
                              f.advantage
                                ? "inline-flex items-center gap-1 rounded-full bg-[rgba(37,99,235,0.08)] px-2 py-1 text-xs font-medium text-[var(--brand-blue-deep)] ring-1 ring-[rgba(37,99,235,0.25)]"
                                : ""
                            }
                          >
                            {f.advantage && <span>⭐</span>}
                            <span>{f.ours}</span>
                          </span>
                          {!f.advantage && <span>{!f.advantage && !f.ours ? "" : ""}</span>}
                        </div>
                      </React.Fragment>
                    ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Execution flow & security reminders (LIGHT) */}
      <section className="relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] w-screen bg-white py-16">
        <div className="mx-auto max-w-6xl px-6 space-y-10">
          <div className="text-center">
            <h3 className="mb-2 text-2xl font-semibold text-[var(--text-main)] md:text-3xl">
              How execution works and how you stay in control
            </h3>
            <p className="mx-auto max-w-3xl text-sm text-[var(--text-muted)] md:text-base">
              A simple three-step flow: Telegram signals → SignalTradingBots desktop app →
              your MT5 terminal. Everything runs on hardware you manage.
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {executionFlow.map((step) => (
              <div
                key={step.title}
                className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-light-2)] p-5 text-center shadow-sm"
              >
                <div className="mb-3 text-3xl">{step.icon}</div>
                <h4 className="mb-2 text-sm font-semibold text-[var(--text-main)]">
                  {step.title}
                </h4>
                <p className="text-xs text-[var(--text-muted)]">{step.description}</p>
              </div>
            ))}
          </div>
          <div className="rounded-2xl border border-[var(--border-subtle)] bg-white/90 p-6 shadow-sm">
            <div className="mb-3 text-sm font-semibold text-[var(--text-main)]">
              Security & risk reminders
            </div>
            <ul className="grid gap-3 text-xs text-[var(--text-muted)] md:grid-cols-2">
              {securityHighlights.map((item) => (
                <li key={item} className="flex gap-2">
                  <span className="mt-[5px] h-1.5 w-1.5 flex-shrink-0 rounded-full bg-[var(--brand-blue)]" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Pricing Preview (LIGHT) */}
      <section className="relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] w-screen bg-[var(--bg-light-2)] py-16">
        <div className="mx-auto max-w-6xl px-6">
          <div className="mb-8 text-center">
            <h2 className="mb-3 text-2xl font-semibold text-[var(--text-main)] md:text-3xl">
              Simple plans for different trading stages
            </h2>
            <p className="mx-auto max-w-2xl text-sm text-[var(--text-muted)] md:text-base">
              Start on demo, then scale to live once you are comfortable. Pricing details
              are available on the products and payment pages.
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
                    href="/products"
                    className={`inline-flex w-full items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition ${
                      plan.featured
                        ? "bg-[var(--brand-blue)] text-white hover:bg-[var(--brand-blue-deep)]"
                        : "border border-[var(--border-subtle)] text-[var(--text-main)] hover:border-[var(--brand-blue-soft)] hover:text-[var(--brand-blue-deep)]"
                    }`}
                  >
                    View details
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials (DARK) */}
      <section className="relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] w-screen bg-[var(--bg-dark-2)] py-16 text-[var(--text-on-dark)]">
        <div className="mx-auto max-w-6xl px-6">
          <div className="mb-8 text-center">
            <h2 className="mb-3 text-2xl font-semibold md:text-3xl">
              Traders testing and using the bot
            </h2>
            <p className="mx-auto max-w-2xl text-sm text-zinc-400 md:text-base">
              These are example quotes you can replace with real feedback from your own
              users.
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {testimonials.map((t) => (
              <div
                key={t.name}
                className="flex flex-col rounded-xl border border-[var(--border-on-dark-strong)] bg-[var(--bg-dark-3)] p-6 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-[0_18px_45px_rgba(15,23,42,0.75)] hover:border-[var(--brand-blue-soft)]"
              >
                <p className="mb-4 text-sm text-zinc-200">&ldquo;{t.quote}&rdquo;</p>
                <div className="mt-auto text-sm">
                  <div className="font-semibold">{t.name}</div>
                  <div className="text-xs text-zinc-400">{t.role}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Support highlight + FAQ (LIGHT) */}
      <section className="relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] w-screen bg-[var(--bg-light-2)] py-16">
        <div className="mx-auto max-w-6xl px-6">
          <div className="mb-10 rounded-2xl border border-[var(--border-subtle)] bg-white/90 p-6 shadow-sm">
            <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <h3 className="text-xl font-semibold text-[var(--text-main)]">
                  Personal support when you need it
                </h3>
                <p className="text-sm text-[var(--text-muted)]">
                  We know MT5 automation can feel technical, so we stay close during setup
                  and scaling.
                </p>
              </div>
              <Link
                href="/contact"
                className="inline-flex items-center justify-center rounded-full border border-[var(--border-subtle)] px-4 py-2 text-xs font-medium text-[var(--text-main)] transition hover:border-[var(--brand-blue-soft)] hover:text-[var(--brand-blue-deep)]"
              >
                Contact support
              </Link>
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              {supportItems.map((item) => (
                <div key={item.title} className="rounded-lg bg-[var(--bg-light-2)] p-4">
                  <h4 className="mb-1 text-sm font-semibold text-[var(--text-main)]">
                    {item.title}
                  </h4>
                  <p className="text-xs text-[var(--text-muted)]">{item.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* FAQ preview */}
          <div className="mb-8 flex flex-col items-start justify-between gap-4 md:flex-row md:items-end">
            <div>
              <h2 className="mb-3 text-2xl font-semibold text-[var(--text-main)] md:text-3xl">
                Common questions
              </h2>
              <p className="max-w-2xl text-sm text-[var(--text-muted)] md:text-base">
                Quick answers to the most asked questions about setup, VPS usage, and
                risk.
              </p>
            </div>
            <Link
              href="/faq"
              className="text-sm font-medium text-[var(--brand-blue)] hover:text-[var(--brand-blue-deep)]"
            >
              View full FAQ
            </Link>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {faqs.map((item) => (
              <div
                key={item.question}
                className="rounded-lg border border-[var(--border-subtle)] bg-white/80 p-4 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-lg hover:border-[var(--brand-blue-soft)]"
              >
                <h3 className="mb-1 text-sm font-semibold text-[var(--text-main)]">
                  {item.question}
                </h3>
                <p className="text-xs text-[var(--text-muted)] md:text-sm">
                  {item.answer}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Broker List / Supported brokers (DARK) */}
      <section className="relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] w-screen bg-[var(--bg-dark-1)] py-16 text-[var(--text-on-dark)]">
        <div className="mx-auto max-w-6xl px-6">
          <h2 className="mb-8 text-center text-2xl font-semibold">Example supported brokers</h2>

          {/* First Row - Moving Left to Right */}
          <div className="mb-8 overflow-hidden">
            <div className="broker-scroll-left flex gap-4">
              {[
                {
                  name: "XM Group",
                  description:
                    "Forex trading and trading in other leveraged products involves substantial risk.",
                  referralLink: "https://www.xmglobal.com/referral?token=GxGWLVScWveRbMRJ8v1pbQ",
                  logo: XmLogo,
                },
                {
                  name: "PrimeXBT",
                  description: "Trading involves substantial risk and may not be suitable for all investors.",
                  logo: undefined,
                },
                {
                  name: "Trade Nation",
                  description: "Financial Spread Bets and CFDs are complex instruments with high risk.",
                  logo: undefined,
                },
                {
                  name: "HF Markets",
                  description: "Risk Warning: Trading leveraged products such as CFDs carries significant risk.",
                  logo: undefined,
                },
              ].map((broker, index) => (
                <div
                  key={`row1-${index}`}
                  className="broker-card flex min-w-[300px] flex-shrink-0 flex-col rounded-lg bg-zinc-800 p-6 text-white shadow-sm transition-transform duration-200 hover:-translate-y-1 hover:shadow-[0_18px_45px_rgba(15,23,42,0.85)]"
                >
                  <div className="mb-4 flex items-center gap-4">
                    <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded bg-zinc-700 text-xs text-zinc-400">
                      {broker.logo ? (
                        <Image
                          src={broker.logo}
                          alt={`${broker.name} logo`}
                          width={64}
                          height={64}
                          className="h-full w-full object-contain"
                        />
                      ) : (
                        "Logo"
                      )}
                    </div>
                    <h3 className="text-lg font-semibold">{broker.name}</h3>
                  </div>
                  <p className="mb-4 text-sm text-zinc-300">{broker.description}</p>
                  {broker.referralLink ? (
                    <Link
                      href={broker.referralLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-auto rounded-md bg-[var(--brand-blue)] px-4 py-2 text-center text-white !text-white transition hover:bg-[var(--brand-blue-deep)]"
                    >
                      Open Account
                    </Link>
                  ) : (
                    <button className="mt-auto rounded-md bg-[var(--brand-blue)] px-4 py-2 text-white !text-white transition hover:bg-[var(--brand-blue-deep)]">
                      Open Account
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Second Row - Moving Right to Left */}
          <div className="overflow-hidden">
            <div className="broker-scroll-right flex gap-4">
              {[
                {
                  name: "IC Markets",
                  description: "IC Markets Global is the trading name of Raw Trading Ltd.",
                  logo: undefined,
                },
                {
                  name: "ATFX",
                  description: "ATFX is a leading forex broker trusted by traders worldwide.",
                  logo: undefined,
                },
                {
                  name: "FxPro",
                  description: "Risk Warning: Contracts for Difference (CFDs) carry a high level of risk.",
                  logo: undefined,
                },
                {
                  name: "Pepperstone",
                  description: "CFDs are complex instruments and come with a high risk of losing money.",
                  logo: undefined,
                },
              ].map((broker, index) => (
                <div
                  key={`row2-${index}`}
                  className="broker-card flex min-w-[300px] flex-shrink-0 flex-col rounded-lg bg-zinc-800 p-6 text-white shadow-sm transition-transform duration-200 hover:-translate-y-1 hover:shadow-[0_18px_45px_rgba(15,23,42,0.85)]"
                >
                  <div className="mb-4 flex items-center gap-4">
                    <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded bg-zinc-700 text-xs text-zinc-400">
                      {broker.logo ? (
                        <Image
                          src={broker.logo}
                          alt={`${broker.name} logo`}
                          width={64}
                          height={64}
                          className="h-full w-full object-contain"
                        />
                      ) : (
                        "Logo"
                      )}
                    </div>
                    <h3 className="text-lg font-semibold">{broker.name}</h3>
                  </div>
                  <p className="mb-4 text-sm text-zinc-300">{broker.description}</p>
                  <button className="mt-auto rounded-md bg-[var(--brand-blue)] px-4 py-2 text-white !text-white transition hover:bg-[var(--brand-blue-deep)]">
                    Open Account
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA Strip */}
      <section className="relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] w-screen bg-[var(--bg-dark-1)] py-12 text-[var(--text-on-dark)]">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-6 text-center md:flex-row md:text-left">
          <div>
            <h2 className="mb-2 text-2xl font-semibold">
              Ready to automate your Telegram signals into MT5?
            </h2>
            <p className="text-sm text-zinc-400">
              Start with a demo account, refine your settings, and move to live trading
              only when you are comfortable with the results.
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/products"
              className="rounded-md bg-[var(--brand-blue)] px-5 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-[var(--brand-blue-deep)] hover:scale-105 hover:shadow-lg"
            >
              View Products
            </Link>
            <Link
              href="/contact"
              className="text-sm font-medium text-[var(--brand-blue-soft)] hover:text-white"
            >
              Contact us
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
