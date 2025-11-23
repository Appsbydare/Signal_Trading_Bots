import Link from "next/link";
import type { Metadata } from "next";
import { resourceArticles } from "@/data/resources";

export const metadata: Metadata = {
  title: "Resources | signaltradingbots",
  description:
    "Guides and best practices for automating Telegram signals into MT5, supporting prop firm challenges, and running secure VPS setups.",
};

export default function ResourcesPage() {
  return (
    <section className="space-y-10">
      <div className="space-y-4 text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[var(--brand-blue-deep)]">
          Resources
        </p>
        <h1 className="text-3xl font-semibold text-[var(--text-main)] md:text-4xl">
          Learn how pro traders automate Telegram → MT5
        </h1>
        <p className="mx-auto max-w-3xl text-sm text-[var(--text-muted)] md:text-base">
          Deep dives on automation workflows, prop firm guardrails, and VPS best
          practices. Articles marked “Coming soon” are outlines in progress — join the
          list to get notified when they go live.
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
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {resourceArticles.map((article) => (
          <article
            key={article.id}
            id={article.id}
            className="flex h-full flex-col rounded-2xl border border-[var(--border-subtle)] bg-white/90 p-6 shadow-sm"
          >
            <div className="mb-4 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-[var(--brand-blue-deep)]">
              <span>{article.category}</span>
              <span className="text-[var(--text-muted)]">· {article.readTime}</span>
            </div>
            <h2 className="mb-2 text-xl font-semibold text-[var(--text-main)]">
              {article.title}
            </h2>
            <p className="text-sm text-[var(--text-muted)]">{article.description}</p>
            <div className="mt-4 flex flex-wrap gap-2 text-xs text-[var(--text-muted)]">
              <span className="rounded-full bg-[var(--bg-light-2)] px-3 py-1 text-[var(--text-main)]">
                Keyword: {article.primaryKeyword}
              </span>
              {article.status === "coming_soon" && (
                <span className="rounded-full bg-amber-100 px-3 py-1 text-amber-800">
                  Coming soon
                </span>
              )}
            </div>
            <div className="mt-auto pt-5">
              {article.status === "coming_soon" ? (
                <Link
                  href="/contact"
                  className="inline-flex items-center justify-center rounded-full border border-[var(--border-subtle)] px-4 py-2 text-xs font-semibold text-[var(--text-main)] transition hover:border-[var(--brand-blue-soft)] hover:text-[var(--brand-blue-deep)]"
                >
                  Get notified
                </Link>
              ) : (
                <Link
                  href={`/resources/${article.id}`}
                  className="inline-flex items-center justify-center rounded-full bg-[var(--brand-blue)] px-4 py-2 text-xs font-semibold text-white"
                >
                  Read article
                </Link>
              )}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}


