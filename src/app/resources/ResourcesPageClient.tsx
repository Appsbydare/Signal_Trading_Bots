"use client";

import Link from "next/link";
import { resourceArticles } from "@/data/resources";
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

export default function ResourcesPageClient() {
    return (
        <motion.section
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
            className="space-y-10 pt-10"
        >
            <motion.div variants={fadeInUp} className="space-y-4 text-center">
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[var(--brand-blue-deep)]">
                    Resources
                </p>
                <h1 className="text-3xl font-semibold text-[var(--brand-blue-deep)] md:text-4xl">
                    Learn how pro traders automate Telegram → MT5
                </h1>
                <p className="mx-auto max-w-3xl text-sm text-[var(--text-white)] md:text-base">
                    Deep dives on automation workflows, prop firm guardrails, and VPS best
                    practices. Every article includes practical checklists so you can follow along
                    step by step.
                </p>
                <div className="flex flex-wrap items-center justify-center gap-3 text-xs text-[var(--text-muted)]">
                    <span>Priority keywords:</span>
                    <span className="rounded-full bg-[var(--bg-light-2)] px-3 py-1 text-[var(--text-main)]">
                        telegram trading bot
                    </span>
                    <span className="rounded-full bg-[var(--bg-light-2)] px-3 py-1 text-[var(--text-main)]">
                        telegram signal copier
                    </span>
                    <span className="rounded-full bg-[var(--bg-light-2)] px-3 py-1 text-[var(--text-main)]">
                        mt5 automation
                    </span>
                </div>
            </motion.div>

            <div className="grid gap-6 md:grid-cols-2">
                {resourceArticles.map((article) => (
                    <motion.article
                        key={article.id}
                        id={article.id}
                        variants={fadeInUp}
                        className="flex h-full flex-col rounded-2xl border border-[var(--border-subtle)] bg-white/90 p-6 shadow-sm transition-all hover:shadow-md hover:-translate-y-1"
                    >
                        <div className="mb-4 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-[var(--brand-blue-deep)]">
                            <span>{article.category}</span>
                            <span className="text-[var(--text-muted)]">· {article.readTime}</span>
                            <span className="text-[var(--text-muted)]">· Updated {article.lastUpdated}</span>
                        </div>
                        <h2 className="mb-2 text-xl font-semibold text-[var(--text-main)]">
                            {article.title}
                        </h2>
                        <p className="text-sm text-[var(--text-muted)]">{article.description}</p>
                        <div className="mt-4 flex flex-wrap gap-2 text-xs text-[var(--text-muted)]">
                            <span className="rounded-full bg-[var(--bg-light-2)] px-3 py-1 text-[var(--text-main)]">
                                Keyword: {article.primaryKeyword}
                            </span>
                        </div>
                        <div className="mt-auto pt-5">
                            <Link
                                href={`/resources/${article.id}`}
                                className="inline-flex items-center justify-center rounded-full bg-[var(--brand-blue)] px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-[var(--brand-blue-deep)]"
                            >
                                Read article
                            </Link>
                        </div>
                    </motion.article>
                ))}
            </div>
        </motion.section>
    );
}
