"use client";
import { motion } from "framer-motion";
import Link from "next/link";

export default function Home() {
  return (
    <div className="space-y-6">
      <div className="px-6 py-4 text-center">
        <p className="text-sm font-medium text-[#5e17eb]">
          Service will be commencing on <strong>26th November</strong>
        </p>
      </div>
      <div className="space-y-10 p-8">
      <motion.h1
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="reveal brand-heading text-3xl font-semibold tracking-tight"
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
  );
}
