import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { resourceArticles } from "@/data/resources";
import { resourceArticlesContent } from "@/data/resource-articles-content";

type Params = {
  slug: string;
};

export async function generateStaticParams() {
  return resourceArticles
    .filter((article) => article.status === "available")
    .map((article) => ({ slug: article.id }));
}

export function generateMetadata({ params }: { params: Params }): Metadata {
  const article = resourceArticles.find((item) => item.id === params.slug);
  if (!article || article.status !== "available") {
    return {};
  }

  return {
    title: `${article.title} | signaltradingbots`,
    description: article.description,
  };
}

export default function ResourceArticle({ params }: { params: Params }) {
  const article = resourceArticles.find((item) => item.id === params.slug);
  const content = resourceArticlesContent[params.slug];

  if (!article || article.status !== "available" || !content) {
    notFound();
  }

  return (
    <article className="space-y-10">
      <div className="space-y-3">
        <Link
          href="/resources"
          className="text-xs font-semibold uppercase tracking-[0.3em] text-[var(--brand-blue-deep)]"
        >
          Resources
        </Link>
        <h1 className="text-3xl font-semibold text-[var(--text-main)] md:text-4xl">
          {article.title}
        </h1>
        <p className="text-sm text-[var(--text-muted)] md:text-base">{content.intro}</p>
        <div className="flex flex-wrap gap-2 text-xs text-[var(--text-muted)]">
          <span>{article.category}</span>
          <span>· {article.readTime}</span>
          <span>· Updated {article.lastUpdated}</span>
          <span className="rounded-full bg-[var(--bg-light-2)] px-3 py-1 text-[var(--text-main)]">
            Keyword: {article.primaryKeyword}
          </span>
        </div>
      </div>

      <div className="space-y-8">
        {content.sections.map((section) => (
          <section
            key={section.heading}
            className="rounded-2xl border border-[var(--border-subtle)] bg-white/95 p-6 shadow-sm"
          >
            <h2 className="mb-3 text-xl font-semibold text-[var(--text-main)]">
              {section.heading}
            </h2>
            <p className="text-sm text-[var(--text-muted)]">{section.body}</p>
            {section.bullets && (
              <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-[var(--text-muted)]">
                {section.bullets.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            )}
          </section>
        ))}
      </div>

      <div className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-light-2)] p-6 text-sm text-[var(--text-muted)]">
        <p>{content.conclusion}</p>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-[var(--border-subtle)] bg-white/95 p-6 shadow-sm">
        <div>
          <h3 className="text-base font-semibold text-[var(--text-main)]">
            Need help implementing this playbook?
          </h3>
          <p className="text-xs text-[var(--text-muted)]">
            We review configurations, map signal formats, and monitor MT5 execution to
            make sure automation is production-ready.
          </p>
        </div>
        <Link
          href="/contact"
          className="inline-flex items-center justify-center rounded-full bg-[var(--brand-blue)] px-4 py-2 text-xs font-semibold text-white"
        >
          Contact support
        </Link>
      </div>
    </article>
  );
}


