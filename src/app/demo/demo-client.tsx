"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";

const uiTabs = [
  {
    id: "dashboard",
    icon: "📊",
    name: "Dashboard",
    tagline: "Live performance & account overview",
    preview: (
      <div className="space-y-4 p-6 bg-gradient-to-br from-zinc-900 to-zinc-800 rounded-lg min-h-[400px]">
        <div className="flex justify-between items-center">
          <div>
            <p className="text-zinc-400 text-xs uppercase tracking-wide">Today's P&L</p>
            <p className="text-3xl font-bold text-green-400">+$1,245.50</p>
          </div>
          <div className="text-right">
            <p className="text-zinc-400 text-xs uppercase tracking-wide">Account Equity</p>
            <p className="text-3xl font-bold text-blue-400">$125,430.00</p>
          </div>
        </div>
        <div className="h-32 bg-zinc-700/50 rounded flex items-end justify-around p-2 gap-1">
          {[40, 60, 45, 70, 50, 65, 55].map((h, i) => (
            <div key={i} className="flex-1 bg-gradient-to-t from-blue-500 to-blue-300 rounded" style={{height: `${h}%`}} />
          ))}
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div className="bg-zinc-700/30 p-3 rounded">
            <p className="text-zinc-500 text-xs">Balance</p>
            <p className="text-white font-semibold">$124,185.50</p>
          </div>
          <div className="bg-zinc-700/30 p-3 rounded">
            <p className="text-zinc-500 text-xs">Margin Level</p>
            <p className="text-white font-semibold">1,245%</p>
          </div>
        </div>
      </div>
    ),
  },
  {
    id: "strategies",
    icon: "🎯",
    name: "Strategies",
    tagline: "Configure trading rules & risk controls",
    preview: (
      <div className="space-y-3 p-6 bg-gradient-to-br from-zinc-900 to-zinc-800 rounded-lg min-h-[400px]">
        <div className="space-y-2">
          {["Gold Signals Pro", "Forex Scalper", "Crypto Trends"].map((name, i) => (
            <div key={i} className="bg-zinc-700/50 p-3 rounded flex items-center justify-between hover:bg-zinc-700 transition">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-green-400"></div>
                <div>
                  <p className="text-white font-medium text-sm">{name}</p>
                  <p className="text-zinc-400 text-xs">Active • 5 open trades</p>
                </div>
              </div>
              <button className="text-blue-400 text-sm hover:text-blue-300">Edit</button>
            </div>
          ))}
        </div>
        <div className="border-t border-zinc-600 pt-3">
          <p className="text-zinc-400 text-xs uppercase tracking-wide mb-2">Risk Controls</p>
          <div className="space-y-1 text-xs text-zinc-300">
            <p>• Daily Loss Limit: -$500</p>
            <p>• Max Position Size: 2.0 lots</p>
            <p>• Take Profit Levels: 5</p>
          </div>
        </div>
      </div>
    ),
  },
  {
    id: "logs",
    icon: "📝",
    name: "Logs",
    tagline: "Real-time monitoring & debugging",
    preview: (
      <div className="p-6 bg-gradient-to-br from-zinc-900 to-zinc-800 rounded-lg min-h-[400px] font-mono text-xs">
        <div className="space-y-1 text-zinc-300 max-h-96 overflow-y-auto">
          <p className="text-green-400">[INFO] 2024-12-13 14:32:15 - Bot started successfully</p>
          <p className="text-green-400">[INFO] 2024-12-13 14:32:16 - Telegram connection established</p>
          <p className="text-blue-400">[INFO] 2024-12-13 14:32:17 - MT5 terminal detected at C:\MT5\terminal.exe</p>
          <p className="text-yellow-400">[WARN] 2024-12-13 14:33:02 - High slippage detected: 2.5 pips</p>
          <p className="text-green-400">[INFO] 2024-12-13 14:33:45 - Signal received: BUY EURUSD @1.1050 TP1:1.1065 SL:1.1035</p>
          <p className="text-blue-400">[INFO] 2024-12-13 14:33:46 - Order placed: Ticket #123456</p>
          <p className="text-green-400">[INFO] 2024-12-13 14:34:12 - Profit locked at TP1, 0.5 lots remaining</p>
        </div>
      </div>
    ),
  },
  {
    id: "audit",
    icon: "🕵️‍♂️",
    name: "Audit",
    tagline: "Full trace for every signal",
    preview: (
      <div className="space-y-2 p-6 bg-gradient-to-br from-zinc-900 to-zinc-800 rounded-lg min-h-[400px]">
        <div className="grid grid-cols-4 gap-2 text-xs font-semibold text-zinc-400 mb-3 pb-2 border-b border-zinc-600">
          <div>Time</div>
          <div>Signal</div>
          <div>Status</div>
          <div>Latency</div>
        </div>
        {[
          { time: "14:33:45", signal: "BUY GOLD", status: "✅ Success", latency: "145ms" },
          { time: "14:22:12", signal: "SELL EURUSD", status: "✅ Success", latency: "98ms" },
          { time: "14:15:33", signal: "BUY GBPUSD", status: "⚠️ Partial", latency: "267ms" },
          { time: "14:08:19", signal: "CLOSE BUY", status: "✅ Success", latency: "76ms" },
        ].map((row, i) => (
          <div key={i} className="grid grid-cols-4 gap-2 text-xs text-zinc-300 p-2 bg-zinc-700/30 rounded hover:bg-zinc-700/50 transition">
            <div>{row.time}</div>
            <div className="font-medium">{row.signal}</div>
            <div>{row.status}</div>
            <div className="text-blue-400">{row.latency}</div>
          </div>
        ))}
      </div>
    ),
  },
  {
    id: "settings",
    icon: "⚙️",
    name: "Settings",
    tagline: "Integration & preferences",
    preview: (
      <div className="space-y-4 p-6 bg-gradient-to-br from-zinc-900 to-zinc-800 rounded-lg min-h-[400px]">
        <div className="space-y-3">
          <div>
            <p className="text-zinc-400 text-xs uppercase tracking-wide mb-1">Telegram Configuration</p>
            <div className="bg-zinc-700/30 p-2 rounded text-sm text-zinc-300">
              ✓ Connected • Monitoring 3 channels
            </div>
          </div>
          <div>
            <p className="text-zinc-400 text-xs uppercase tracking-wide mb-1">MT5 Terminal Path</p>
            <div className="bg-zinc-700/30 p-2 rounded text-sm text-zinc-300 font-mono text-xs">
              C:\Program Files\MetaTrader 5\terminal.exe
            </div>
          </div>
          <div>
            <p className="text-zinc-400 text-xs uppercase tracking-wide mb-1">Global Parameters</p>
            <div className="bg-zinc-700/30 p-2 rounded space-y-1 text-sm text-zinc-300">
              <p>• Default Lot Size: 1.0</p>
              <p>• Max Slippage: 2.5 pips</p>
              <p>• Timezone: UTC</p>
            </div>
          </div>
        </div>
      </div>
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

export default function DemoPageClient() {
  const [activeTab, setActiveTab] = useState("dashboard");

  const activeTabData = uiTabs.find(tab => tab.id === activeTab);

  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <section className="space-y-4">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-3"
        >
          <h1 className="reveal brand-heading text-4xl font-semibold tracking-tight md:text-5xl">
            Application Simulator
          </h1>
          <p className="max-w-3xl text-base text-zinc-600">
            Explore the SignalTradingBots desktop interface. Click through each tab to see how the bot displays live trading data, logs, strategy management, and more.
          </p>
        </motion.div>
      </section>

      {/* Features Overview */}
      <section className="space-y-6">
        <div>
          <h2 className="text-2xl font-semibold text-zinc-900 mb-4">Key Tabs & Features</h2>
          <p className="text-zinc-600 text-sm mb-6">
            The desktop app is organized into focused tabs, each with a specific purpose in your trading workflow.
          </p>
        </div>

        {/* Tab Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="flex flex-wrap gap-3"
        >
          {uiTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2.5 rounded-lg font-medium text-sm transition-all duration-200 flex items-center gap-2 ${
                activeTab === tab.id
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
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="space-y-4"
          >
            <div className="flex flex-col gap-2">
              <h3 className="text-xl font-semibold text-zinc-900 flex items-center gap-2">
                <span className="text-2xl">{activeTabData.icon}</span>
                {activeTabData.name}
              </h3>
              <p className="text-zinc-600">{activeTabData.tagline}</p>
            </div>

            {/* Preview Container */}
            <div className="rounded-xl border border-zinc-200 shadow-sm overflow-hidden">
              {activeTabData.preview}
            </div>
          </motion.div>
        )}
      </section>

      {/* Feature Highlights Grid */}
      <section className="space-y-6">
        <div>
          <h2 className="text-2xl font-semibold text-zinc-900 mb-2">What You Get</h2>
          <p className="text-zinc-600 text-sm">
            Complete control over your trading automation, with real-time visibility into every aspect of your bot's operation.
          </p>
        </div>

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
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="rounded-xl border border-zinc-200 bg-white/90 p-5 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-200"
            >
              <div className="mb-3 text-3xl">{feature.icon}</div>
              <h3 className="font-semibold text-zinc-900 mb-1 text-sm">{feature.title}</h3>
              <p className="text-xs text-zinc-600">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* System Requirements & CTA */}
      <section className="rounded-2xl border border-zinc-200 bg-gradient-to-br from-zinc-50 to-white p-8 shadow-sm">
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
      </section>
    </div>
  );
}





