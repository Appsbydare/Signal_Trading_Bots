"use client";
import { motion } from "framer-motion";
import Link from "next/link";

export default function Home() {
  return (
    <>
      {/* Notice Banner */}
      <div className="bg-white py-4">
        <div className="mx-auto max-w-6xl px-6 text-center">
          <p className="text-sm font-medium text-[#5e17eb]">
            Service will be commencing on <strong>26th November</strong>
          </p>
        </div>
      </div>

      {/* Hero Section - Full Width */}
      <section className="relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] w-screen bg-white py-12">
        <div className="mx-auto max-w-6xl px-6">
          <div className="space-y-10">
      <motion.h1
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="reveal brand-heading text-6xl font-semibold tracking-tight"
      >
        Automate MT5 trading from Telegram signals
      </motion.h1>
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.15, duration: 0.5 }}
        className="reveal max-w-2xl text-zinc-600"
      >
        Configure strategies with multi-TP, SL, order types (instant/pending), and lot
        size management. Run it on Windows or VPS and let it work while you sleep.
      </motion.p>
      <div className="flex gap-4">
        <Link
          href="/products"
          className="rounded-md bg-[#5e17eb] px-5 py-2 text-white !text-white shadow-sm transition hover:bg-[#4512c2] hover:scale-105 hover:shadow-lg"
        >
          View Products
        </Link>
        <Link
          href="/contact"
          className="rounded-md bg-[#5e17eb] px-5 py-2 text-white !text-white shadow-sm transition hover:bg-[#4512c2] hover:scale-105 hover:shadow-lg"
        >
          Contact
        </Link>
      </div>
      <div className="mt-10 space-y-6">
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-sm font-medium text-[#5e17eb]">Supported Platforms:</span>
          <img
            src="/telegram-badge.svg"
            alt="Telegram Compatible"
            title="Works with Telegram signals"
            className="h-8 w-8 transition hover:scale-110"
          />
          <img
            src="/mt5-badge.svg"
            alt="MT5 Supported"
            title="Executes trades via MetaTrader 5"
            className="h-8 w-8 transition hover:scale-110"
          />
        </div>
        <div className="grid gap-6 sm:grid-cols-2">
          <div className="rounded-lg bg-white/80 p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
            <h3 className="reveal mb-2 font-medium">How it works</h3>
            <p className="text-sm text-zinc-600">
              The bot monitors Telegram signals and executes orders on MT5 based on your
              configured mapping and strategy.
            </p>
          </div>
          <div className="rounded-lg bg-white/80 p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
            <h3 className="reveal mb-2 font-medium">Important notice</h3>
            <p className="text-sm text-zinc-600">
              Use a demo first. Trading involves significant risk. Not financial advice.
            </p>
          </div>
        </div>
        </div>
        </div>
        </div>
      </section>

      {/* Broker List Section - Full Width */}
      <section className="relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] w-screen bg-zinc-950 py-12">
        <div className="w-full px-6">
          <h2 className="mb-8 text-center text-2xl font-semibold text-white">Broker List</h2>
          
          {/* First Row - Moving Left to Right */}
          <div className="mb-8 overflow-hidden">
            <div className="broker-scroll-left flex gap-4">
              {[
                { name: "XM Group", description: "Forex trading and trading in other leveraged products involves substantial risk." },
                { name: "PrimeXBT", description: "Trading involves substantial risk and may not be suitable for all investors." },
                { name: "Trade Nation", description: "Financial Spread Bets and CFDs are complex instruments with high risk." },
                { name: "HF Markets", description: "Risk Warning: Trading leveraged products such as CFDs carries significant risk." },
              ].map((broker, index) => (
                <div
                  key={`row1-${index}`}
                  className="broker-card flex min-w-[300px] flex-shrink-0 flex-col rounded-lg bg-zinc-800 p-6 text-white"
                >
                  <div className="mb-4 flex items-center gap-4">
                    <div className="flex h-16 w-16 items-center justify-center rounded bg-zinc-700 text-xs text-zinc-400">
                      Logo
                    </div>
                    <h3 className="text-lg font-semibold">{broker.name}</h3>
                  </div>
                  <p className="mb-4 text-sm text-zinc-300">{broker.description}</p>
                  <button className="mt-auto rounded-md bg-[#5e17eb] px-4 py-2 text-white !text-white transition hover:bg-[#4512c2]">
                    Open Account
                  </button>
                </div>
              ))}
              {/* Duplicate for seamless loop */}
              {[
                { name: "XM Group", description: "Forex trading and trading in other leveraged products involves substantial risk." },
                { name: "PrimeXBT", description: "Trading involves substantial risk and may not be suitable for all investors." },
                { name: "Trade Nation", description: "Financial Spread Bets and CFDs are complex instruments with high risk." },
                { name: "HF Markets", description: "Risk Warning: Trading leveraged products such as CFDs carries significant risk." },
              ].map((broker, index) => (
                <div
                  key={`row1-dup-${index}`}
                  className="broker-card flex min-w-[300px] flex-shrink-0 flex-col rounded-lg bg-zinc-800 p-6 text-white"
                >
                  <div className="mb-4 flex items-center gap-4">
                    <div className="flex h-16 w-16 items-center justify-center rounded bg-zinc-700 text-xs text-zinc-400">
                      Logo
                    </div>
                    <h3 className="text-lg font-semibold">{broker.name}</h3>
                  </div>
                  <p className="mb-4 text-sm text-zinc-300">{broker.description}</p>
                  <button className="mt-auto rounded-md bg-[#5e17eb] px-4 py-2 text-white !text-white transition hover:bg-[#4512c2]">
                    Open Account
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Second Row - Moving Right to Left */}
          <div className="overflow-hidden">
            <div className="broker-scroll-right flex gap-4">
              {[
                { name: "IC Markets", description: "IC Markets Global is the trading name of Raw Trading Ltd." },
                { name: "ATFX", description: "ATFX is a leading forex broker trusted by traders worldwide." },
                { name: "FxPro", description: "Risk Warning: Contracts for Difference (CFDs) carry a high level of risk." },
                { name: "Pepperstone", description: "CFDs are complex instruments and come with a high risk of losing money." },
              ].map((broker, index) => (
                <div
                  key={`row2-${index}`}
                  className="broker-card flex min-w-[300px] flex-shrink-0 flex-col rounded-lg bg-zinc-800 p-6 text-white"
                >
                  <div className="mb-4 flex items-center gap-4">
                    <div className="flex h-16 w-16 items-center justify-center rounded bg-zinc-700 text-xs text-zinc-400">
                      Logo
                    </div>
                    <h3 className="text-lg font-semibold">{broker.name}</h3>
                  </div>
                  <p className="mb-4 text-sm text-zinc-300">{broker.description}</p>
                  <button className="mt-auto rounded-md bg-[#5e17eb] px-4 py-2 text-white !text-white transition hover:bg-[#4512c2]">
                    Open Account
                  </button>
                </div>
              ))}
              {/* Duplicate for seamless loop */}
              {[
                { name: "IC Markets", description: "IC Markets Global is the trading name of Raw Trading Ltd." },
                { name: "ATFX", description: "ATFX is a leading forex broker trusted by traders worldwide." },
                { name: "FxPro", description: "Risk Warning: Contracts for Difference (CFDs) carry a high level of risk." },
                { name: "Pepperstone", description: "CFDs are complex instruments and come with a high risk of losing money." },
              ].map((broker, index) => (
                <div
                  key={`row2-dup-${index}`}
                  className="broker-card flex min-w-[300px] flex-shrink-0 flex-col rounded-lg bg-zinc-800 p-6 text-white"
                >
                  <div className="mb-4 flex items-center gap-4">
                    <div className="flex h-16 w-16 items-center justify-center rounded bg-zinc-700 text-xs text-zinc-400">
                      Logo
                    </div>
                    <h3 className="text-lg font-semibold">{broker.name}</h3>
                  </div>
                  <p className="mb-4 text-sm text-zinc-300">{broker.description}</p>
                  <button className="mt-auto rounded-md bg-[#5e17eb] px-4 py-2 text-white !text-white transition hover:bg-[#4512c2]">
                    Open Account
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
