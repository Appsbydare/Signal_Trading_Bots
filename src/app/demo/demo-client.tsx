"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import Image from "next/image";

const uiTabs = [
  {
    id: "dashboard",
    icon: "📊",
    name: "Dashboard",
    tagline: "Live performance & account overview",
    preview: (
      <Image
        src="/images/01. App - Dashboard 1.png"
        alt="Dashboard Preview"
        width={1000}
        height={600}
        className="w-full h-auto rounded-lg border border-zinc-800 shadow-xl"
      />
    ),
  },
  {
    id: "strategies",
    icon: "🎯",
    name: "Strategies",
    tagline: "Configure trading rules & risk controls",
    preview: (
      <Image
        src="/images/01. App - Strategies 1.png"
        alt="Strategies Preview"
        width={1000}
        height={600}
        className="w-full h-auto rounded-lg border border-zinc-800 shadow-xl"
      />
    ),
  },
  {
    id: "logs",
    icon: "📝",
    name: "Logs",
    tagline: "Real-time monitoring & debugging",
    preview: (
      <Image
        src="/images/01. App - Logs 1.png"
        alt="Logs Preview"
        width={1000}
        height={600}
        className="w-full h-auto rounded-lg border border-zinc-800 shadow-xl"
      />
    ),
  },
  {
    id: "audit",
    icon: "🕵️‍♂️",
    name: "Audit",
    tagline: "Full trace for every signal",
    preview: (
      <Image
        src="/images/01. App - Audit 1.png"
        alt="Audit Preview"
        width={1000}
        height={600}
        className="w-full h-auto rounded-lg border border-zinc-800 shadow-xl"
      />
    ),
  },
  {
    id: "settings",
    icon: "⚙️",
    name: "Settings",
    tagline: "Integration & preferences",
    preview: (
      <Image
        src="/images/01. App - Settings 1.png"
        alt="Settings Preview"
        width={1000}
        height={600}
        className="w-full h-auto rounded-lg border border-zinc-800 shadow-xl"
      />
    ),
  },
  {
    id: "help",
    icon: "🆘",
    name: "Help & News",
    tagline: "Built-in knowledge & updates",
    preview: (
      <div className="space-y-3 p-6 bg-gradient-to-br from-zinc-900 to-zinc-800 rounded-lg min-h-[400px]">
        <div className="space-y-2">
          {[
            { title: "Getting Started with VPS", category: "Setup" },
            { title: "Understanding Multi-TP Strategy", category: "Guide" },
            { title: "v13.2 Release Notes", category: "News" },
          ].map((item, i) => (
            <div key={i} className="bg-zinc-700/50 p-3 rounded hover:bg-zinc-700 transition cursor-pointer">
              <p className="text-white font-medium text-sm">{item.title}</p>
              <p className="text-zinc-400 text-xs">{item.category}</p>
            </div>
          ))}
        </div>
      </div>
    ),
  },
];

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

export default function DemoPageClient() {
  const [activeTab, setActiveTab] = useState("dashboard");

  const activeTabData = uiTabs.find(tab => tab.id === activeTab);

  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <motion.section
        className="space-y-4"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={staggerContainer}
      >
        <motion.div
          variants={fadeInUp}
          className="space-y-3"
        >
          <h1 className="reveal brand-heading text-4xl font-semibold tracking-tight pt-10 md:text-5xl">
            Application Simulator
          </h1>
          <p className="max-w-3xl text-base text-zinc-400">
            Explore the SignalTradingBots desktop interface. Click through each tab to see how the bot displays live trading data, logs, strategy management, and more.
          </p>
        </motion.div>
      </motion.section>

      {/* Features Overview */}
      <section className="space-y-6">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={staggerContainer}
        >
          <motion.div variants={fadeInUp}>
            <h2 className="text-2xl font-semibold text-zinc-400 mb-4">Key Tabs & Features</h2>
            <p className="text-zinc-400 text-sm mb-6">
              The desktop app is organized into focused tabs, each with a specific purpose in your trading workflow.
            </p>
          </motion.div>

          {/* Tab Buttons */}
          <motion.div
            variants={fadeInUp}
            className="flex flex-wrap gap-3"
          >
            {uiTabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2.5 rounded-lg font-medium text-sm transition-all duration-200 flex items-center gap-2 ${activeTab === tab.id
                  ? "bg-[var(--brand-blue)] text-white shadow-lg scale-105"
                  : "bg-zinc-100 text-zinc-700 hover:bg-zinc-200 border border-zinc-200"
                  }`}
              >
                <span>{tab.icon}</span>
                <span>{tab.name}</span>
              </button>
            ))}
          </motion.div>

          {/* Tab Preview */}
          {activeTabData && (
            <motion.div
              key={activeTab}
              initial="hidden"
              animate="visible"
              variants={fadeInUp}
              className="mt-6 space-y-4"
            >
              <div className="flex flex-col gap-2">
                <h3 className="text-xl font-semibold text-zinc-400 flex items-center gap-2">
                  <span className="text-2xl">{activeTabData.icon}</span>
                  {activeTabData.name}
                </h3>
                <p className="text-zinc-400">{activeTabData.tagline}</p>
              </div>

              {/* Preview Container */}
              <div className="rounded-xl border border-zinc-200 shadow-sm overflow-hidden">
                {activeTabData.preview}
              </div>
            </motion.div>
          )}
        </motion.div>
      </section>

      {/* Feature Highlights Grid */}
      <section className="space-y-6">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={staggerContainer}
        >
          <motion.div variants={fadeInUp}>
            <h2 className="text-2xl font-semibold text-zinc-400 mb-2">What You Get</h2>
            <p className="text-zinc-400 text-sm mb-6">
              Complete control over your trading automation, with real-time visibility into every aspect of your bot's operation.
            </p>
          </motion.div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[
              {
                icon: "⚡",
                title: "Instant Execution",
                description: "Orders placed within milliseconds of signal receipt with ultra-low latency.",
              },
              {
                icon: "🛡️",
                title: "Risk Controls",
                description: "Daily loss limits, profit targets, and multi-level take profit management.",
              },
              {
                icon: "📊",
                title: "Real-time Analytics",
                description: "Live P&L, equity tracking, and detailed per-strategy performance metrics.",
              },
              {
                icon: "🔍",
                title: "Full Audit Trail",
                description: "Complete trace of every signal processed with latency and execution details.",
              },
              {
                icon: "🔐",
                title: "Secure & Private",
                description: "Runs locally on your PC or VPS with no cloud storage of credentials.",
              },
              {
                icon: "🎯",
                title: "Smart Strategies",
                description: "Build custom rules per signal channel with flexible parsing and execution modes.",
              },
            ].map((feature, i) => (
              <motion.div
                key={i}
                variants={fadeInUp}
                className="rounded-xl border border-zinc-200 bg-white/90 p-5 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-200"
              >
                <div className="mb-3 text-3xl">{feature.icon}</div>
                <h3 className="font-semibold text-zinc-900 mb-1 text-sm">{feature.title}</h3>
                <p className="text-xs text-zinc-600">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* System Requirements & CTA */}
      <motion.section
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={fadeInUp}
        className="rounded-2xl border border-zinc-200 bg-gradient-to-br from-zinc-50 to-white p-8 shadow-sm"
      >
        <div className="grid gap-8 md:grid-cols-2">
          <div>
            <h3 className="text-xl font-semibold text-zinc-900 mb-4">System Requirements</h3>
            <ul className="space-y-2 text-sm text-zinc-700">
              <li className="flex gap-2">
                <span className="text-blue-500 font-bold">✓</span>
                <span>Windows 10 or 11 (64-bit)</span>
              </li>
              <li className="flex gap-2">
                <span className="text-blue-500 font-bold">✓</span>
                <span>MetaTrader 5 terminal with EA support</span>
              </li>
              <li className="flex gap-2">
                <span className="text-blue-500 font-bold">✓</span>
                <span>Stable internet connection</span>
              </li>
              <li className="flex gap-2">
                <span className="text-blue-500 font-bold">✓</span>
                <span>VPS recommended for 24/7 operation</span>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-xl font-semibold text-zinc-900 mb-4">Ready to Get Started?</h3>
            <p className="text-sm text-zinc-700 mb-4">
              Try the bot on a demo account first to see how it handles your trading signals. No risk, full insight.
            </p>
            <div className="flex flex-col gap-2">
              <a
                href="/products"
                className="rounded-lg bg-[var(--brand-blue)] text-white px-4 py-2.5 text-sm font-medium hover:bg-[var(--brand-blue-deep)] transition text-center"
              >
                Explore Pricing Plans
              </a>
              <a
                href="/specs"
                className="rounded-lg border border-zinc-300 text-zinc-700 px-4 py-2.5 text-sm font-medium hover:border-zinc-400 transition text-center"
              >
                View Full Specifications
              </a>
            </div>
          </div>
        </div>
      </motion.section>
    </div>
  );
}





