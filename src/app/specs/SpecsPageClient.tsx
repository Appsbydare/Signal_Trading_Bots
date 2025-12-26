"use client";

import { motion } from "framer-motion";
import { DownloadSpecsButton } from "@/components/DownloadSpecsButton";
import { specsData } from "@/data/specs";

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

export function SpecsPageClient() {
    return (
        <div id="specs-content" className="space-y-10 pb-10">
            {/* Hero / Intro */}
            <motion.section
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={staggerContainer}
                className="space-y-3 pt-10"
            >
                <motion.div variants={fadeInUp} className="flex items-start justify-between gap-4">
                    <h1 className="reveal brand-heading text-3xl font-semibold tracking-tight">
                        {specsData.title}
                    </h1>
                    <div data-html2canvas-ignore="true">
                        <DownloadSpecsButton />
                    </div>
                </motion.div>

                <motion.p variants={fadeInUp} className="max-w-3xl text-sm text-zinc-400">
                    {specsData.description}
                </motion.p>
            </motion.section>

            {/* Platform & requirements */}
            <motion.section
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={staggerContainer}
                className="grid gap-6 md:grid-cols-[1.4fr,1fr]"
            >
                <motion.div variants={fadeInUp} className="rounded-xl border border-[var(--border-subtle)] bg-white/90 p-6 shadow-sm transition-all hover:shadow-md">
                    <div className="mb-3 flex items-center gap-2">
                        <span className="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-[var(--brand-blue-soft)]/30 text-lg">
                            💻
                        </span>
                        <h2 className="text-base font-semibold text-zinc-900">
                            Platform & requirements
                        </h2>
                    </div>
                    <ul className="list-disc space-y-1 pl-5 text-sm text-zinc-700">
                        {specsData.platformDetails.map((item) => (
                            <li key={item}>{item}</li>
                        ))}
                    </ul>
                </motion.div>
                <motion.div variants={fadeInUp} className="rounded-xl border border-[var(--border-subtle)] bg-white/90 p-6 shadow-sm transition-all hover:shadow-md">
                    <div className="mb-3 flex items-center gap-2">
                        <span className="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-[var(--brand-blue-soft)]/30 text-lg">
                            📌
                        </span>
                        <h2 className="text-base font-semibold text-zinc-900">Usage guidance</h2>
                    </div>
                    <ul className="list-disc space-y-1 pl-5 text-sm text-zinc-700">
                        {specsData.usageGuidance.map((item) => (
                            <li key={item}>{item}</li>
                        ))}
                    </ul>
                </motion.div>
            </motion.section>

            {/* Tabs overview */}
            <motion.section
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={staggerContainer}
                className="space-y-4"
            >
                <motion.div variants={fadeInUp} className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
                    <div>
                        <h2 className="text-xl font-semibold text-zinc-400">Tabs & workflows</h2>
                        <p className="max-w-3xl text-sm text-zinc-400">
                            Each tab focuses on a specific part of the trading lifecycle—from live
                            execution and logs to strategy design, auditing and configuration.
                        </p>
                    </div>
                </motion.div>
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {specsData.tabs.map((tab) => (
                        <motion.div
                            key={tab.name}
                            variants={fadeInUp}
                            className="flex flex-col rounded-xl border border-[var(--border-subtle)] bg-white/95 p-5 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-lg"
                        >
                            <div className="mb-3 flex items-center gap-2">
                                <span className="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-[var(--brand-blue-soft)]/25 text-lg">
                                    {tab.icon}
                                </span>
                                <div>
                                    <h3 className="text-sm font-semibold text-zinc-900">{tab.name}</h3>
                                    <p className="text-xs text-zinc-500">{tab.tagline}</p>
                                </div>
                            </div>
                            <ul className="mt-1 space-y-1 text-xs text-zinc-600">
                                {tab.bullets.map((item) => (
                                    <li key={item} className="flex gap-2">
                                        <span className="mt-[5px] h-1.5 w-1.5 flex-shrink-0 rounded-full bg-[var(--brand-blue-soft)]" />
                                        <span>{item}</span>
                                    </li>
                                ))}
                            </ul>
                        </motion.div>
                    ))}
                </div>
            </motion.section>

            {/* QA checklist */}
            <motion.section
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={staggerContainer}
                className="rounded-xl border border-[var(--border-subtle)] bg-white/90 p-6 shadow-sm transition-all hover:shadow-md"
            >
                <motion.div variants={fadeInUp}>
                    <div className="mb-3 flex items-center gap-2">
                        <span className="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-[var(--brand-blue-soft)]/30 text-lg">
                            ✅
                        </span>
                        <h2 className="text-base font-semibold text-zinc-900">QA checklist starter</h2>
                    </div>
                    <p className="mb-3 text-sm text-zinc-600">
                        Use this list when testing new installs, updates, or broker changes to ensure
                        the full experience behaves as expected.
                    </p>
                    <ul className="list-disc space-y-1 pl-5 text-sm text-zinc-700">
                        {specsData.qaChecklist.map((item) => (
                            <li key={item}>{item}</li>
                        ))}
                    </ul>
                </motion.div>
            </motion.section>
        </div>
    );
}
