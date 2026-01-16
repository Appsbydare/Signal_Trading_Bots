import React from "react";
import { motion } from "framer-motion";

export function TrialBanner() {
    return (
        <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="relative mb-6 overflow-hidden rounded-xl border border-yellow-400/50 bg-gradient-to-r from-yellow-900/20 via-amber-900/20 to-yellow-900/20 p-1 shadow-lg shadow-yellow-500/10"
        >
            {/* Animated Gradient Border Effect - Special Offer Style */}
            <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 via-amber-500 to-yellow-400 opacity-20 blur-xl animate-[pulse_3s_ease-in-out_infinite]" />

            <div className="relative flex flex-col items-center justify-between gap-4 rounded-lg bg-black/80 px-6 py-4 backdrop-blur-md sm:flex-row">
                {/* Left Side: Icon + Text */}
                <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-yellow-400/20 to-amber-600/20 shadow-inner shadow-yellow-500/20 border border-yellow-500/20">
                        <span className="text-2xl">⚡</span>
                    </div>
                    <div>
                        <h3 className="flex items-center gap-2 text-lg font-bold text-white">
                            Risk-Free 30-Day Trial
                            <span className="rounded-full bg-gradient-to-r from-yellow-400/20 to-amber-500/20 px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider text-yellow-300 border border-yellow-400/30 shadow-[0_0_10px_rgba(250,204,21,0.2)]">
                                Special Offer
                            </span>
                        </h3>
                        <p className="text-sm text-zinc-300">
                            Try our premium automation tools completely risk-free
                        </p>
                    </div>
                </div>

                {/* Right Side: CTA Button */}
                <div className="flex-shrink-0">
                    <a
                        href="/payment?plan=starter"
                        className="group relative inline-flex items-center justify-center gap-2 overflow-hidden rounded-lg bg-gradient-to-br from-yellow-400 via-amber-500 to-yellow-500 px-6 py-2.5 font-bold text-zinc-950 transition-all duration-300 hover:from-yellow-300 hover:via-amber-400 hover:to-yellow-400 hover:shadow-[0_0_25px_rgba(245,158,11,0.5)] focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:ring-offset-2 focus:ring-offset-black"
                    >
                        <span>Start Free Trial</span>
                        <svg
                            className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                        </svg>
                    </a>
                </div>
            </div>
        </motion.div>
    );
}
