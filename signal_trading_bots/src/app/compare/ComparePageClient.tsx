"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";

const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.5, ease: "easeOut" as const }
    }
};

const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1,
            delayChildren: 0.1
        }
    }
};

export default function ComparePageClient() {
    const [showFullFeatureComparison, setShowFullFeatureComparison] = useState<
        Record<string, boolean>
    >({});

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
                {
                    label: "Execution speed",
                    competitors: "Market leaders advertise 70–300ms execution depending on VPS and broker.",
                    ours: "Desktop MT5 API with low‑latency execution; exact milliseconds depend on your VPS and broker routing.",
                    advantage: false,
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

    return (
        <motion.div initial="hidden" animate="visible" variants={staggerContainer} className="pt-10 pb-16">

            {/* Intro - Left Aligned */}
            <motion.section variants={fadeInUp} className="mx-auto max-w-6xl px-2 mb-16">
                <div className="space-y-4">
                    <h1 className="brand-heading text-2xl font-semibold tracking-tight">
                        Comparison
                    </h1>
                    <p className="max-w-3xl text-base text-zinc-400">
                        See how SignalTradingBots stacks up against manual trading, traditional copy-trading services, and other EA-based tools. Compare features, setup complexity, and automation capabilities side-by-side.
                    </p>
                </div>
            </motion.section>

            {/* Manual vs Bot Comparison (DARK) */}
            <section className="relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] w-screen bg-[var(--bg-dark-3)] py-16 text-[var(--text-on-dark)]">
                <div className="mx-auto max-w-6xl px-6">
                    <motion.div variants={staggerContainer} initial="hidden" whileInView="visible" viewport={{ once: true }} className="mb-10 space-y-6">
                        <motion.div variants={fadeInUp} className="text-center">
                            <h2 className="mb-3 text-2xl font-semibold md:text-3xl">
                                Manual copying vs automation
                            </h2>
                            <p className="mx-auto max-w-2xl text-sm text-zinc-400 md:text-base">
                                See where automation adds value while you still control risk, broker, and
                                strategy.
                            </p>
                        </motion.div>
                        <motion.div variants={fadeInUp} className="overflow-hidden rounded-xl border border-[var(--border-on-dark-strong)] bg-[var(--bg-dark-2)] shadow-sm">
                            <div className="grid grid-cols-3 border-b border-[var(--border-on-dark-strong)] bg-black/30 px-4 py-3 text-xs font-semibold uppercase tracking-wide text-zinc-400 md:px-6">
                                <div className="text-left">Aspect</div>
                                <div className="text-center">Manual</div>
                                <div className="text-center text-[var(--brand-blue-soft)]">With bot</div>
                            </div>
                            <div className="divide-y divide-[var(--border-on-dark-strong)]">
                                {comparisonRows.map((row) => (
                                    <motion.div
                                        key={row.label}
                                        variants={fadeInUp}
                                        className="grid grid-cols-3 gap-4 px-4 py-4 md:px-6 md:py-5 hover:bg-white/5 transition-colors"
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
                                    </motion.div>
                                ))}
                            </div>
                        </motion.div>
                    </motion.div>

                    <motion.div variants={staggerContainer} initial="hidden" whileInView="visible" viewport={{ once: true }} className="space-y-4">
                        <motion.div variants={fadeInUp} className="text-center">
                            <h3 className="mb-2 text-lg font-semibold md:text-xl">
                                Desktop app vs EA‑based copiers
                            </h3>
                            <p className="mx-auto max-w-2xl text-sm text-zinc-400 md:text-base">
                                Many competitors require both a desktop controller and MT4/MT5 EA plugins.
                                SignalTradingBots keeps things simple with a single desktop application.
                            </p>
                        </motion.div>
                        <motion.div variants={fadeInUp} className="overflow-hidden rounded-xl border border-[var(--border-on-dark-strong)] bg-[var(--bg-dark-2)] shadow-sm">
                            <div className="grid grid-cols-3 border-b border-[var(--border-on-dark-strong)] bg-black/30 px-4 py-3 text-xs font-semibold uppercase tracking-wide text-zinc-400 md:px-6">
                                <div className="text-left">Aspect</div>
                                <div className="text-center">Typical EA‑based copier</div>
                                <div className="text-center text-[var(--brand-blue-soft)]">
                                    SignalTradingBots app
                                </div>
                            </div>
                            <div className="divide-y divide-[var(--border-on-dark-strong)]">
                                {eaComparisonRows.map((row) => (
                                    <motion.div
                                        key={row.label}
                                        variants={fadeInUp}
                                        className="grid grid-cols-3 gap-4 px-4 py-4 md:px-6 md:py-5 hover:bg-white/5 transition-colors"
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
                                    </motion.div>
                                ))}
                            </div>
                        </motion.div>
                    </motion.div>
                </div>
            </section>

            {/* High-level feature comparison vs competitors (LIGHT, 4 categories, each expandable) */}
            <section className="relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] w-screen bg-[var(--bg-light-2)] py-16">
                <motion.div variants={staggerContainer} initial="hidden" whileInView="visible" viewport={{ once: true }} className="mx-auto max-w-6xl px-6">
                    <motion.div variants={fadeInUp} className="mb-8 text-center">
                        <h3 className="mb-2 text-2xl font-semibold text-[var(--text-main)] md:text-3xl">
                            Key feature comparison vs other copiers
                        </h3>
                        <p className="mx-auto max-w-3xl text-sm text-[var(--text-muted)] md:text-base">
                            Based on analysis of typical features from other Telegram to MT5 copier tools,
                            plus the full internal feature matrix for SignalTradingBots.
                        </p>
                    </motion.div>
                    <motion.div variants={staggerContainer} className="space-y-6">
                        {featureCategories.map((cat) => (
                            <motion.div
                                key={cat.id}
                                variants={fadeInUp}
                                className="rounded-xl border border-[var(--border-subtle)] bg-white/90 p-5 shadow-sm transition-all hover:shadow-md"
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
                            </motion.div>
                        ))}
                    </motion.div>
                </motion.div>
            </section>
        </motion.div>
    );
}
