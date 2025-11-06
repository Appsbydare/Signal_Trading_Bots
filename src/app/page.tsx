"use client";
import { motion } from "framer-motion";
import Link from "next/link";

export default function Home() {
  return (
    <div className="space-y-10">
      <motion.h1
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="text-3xl font-semibold tracking-tight"
      >
        Automate MT5 trading from Telegram signals
      </motion.h1>
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.15, duration: 0.5 }}
        className="max-w-2xl text-zinc-600"
      >
        Configure strategies with multi-TP, SL, order types (instant/pending), and lot
        size management. Run it on Windows or VPS and let it work while you sleep.
      </motion.p>
      <div className="flex gap-4">
        <Link
          href="/products"
          className="rounded-md bg-black px-4 py-2 text-white hover:bg-zinc-800"
        >
          View Products
        </Link>
        <Link
          href="/contact"
          className="rounded-md border px-4 py-2 hover:bg-zinc-50"
        >
          Contact
        </Link>
      </div>
      <div className="mt-10 grid gap-6 sm:grid-cols-2">
        <div className="rounded-lg border p-6">
          <h3 className="mb-2 font-medium">How it works</h3>
          <p className="text-sm text-zinc-600">
            The bot monitors Telegram signals and executes orders on MT5 based on your
            configured mapping and strategy.
          </p>
        </div>
        <div className="rounded-lg border p-6">
          <h3 className="mb-2 font-medium">Important notice</h3>
          <p className="text-sm text-zinc-600">
            Use a demo first. Trading involves significant risk. Not financial advice.
          </p>
        </div>
      </div>
    </div>
  );
}
