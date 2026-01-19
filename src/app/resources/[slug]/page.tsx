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

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { slug } = await params;
  const article = resourceArticles.find((item) => item.id === slug);
  if (!article || article.status !== "available") {
    return {};
  }

  const keywords = [
    article.primaryKeyword,
    'telegram signal trading',
    'gold trading',
    'mt5 automation',
    'trading bots',
    'forex signals',
    'signal copier',
    'automated trading',
    article.category.toLowerCase(),
  ].join(', ');

  return {
    title: `${article.title} | signaltradingbots`,
    description: article.description,
    keywords,
    authors: [{ name: 'SignalTradingBots Team' }],
    openGraph: {
      title: article.title,
      description: article.description,
      type: 'article',
      publishedTime: article.lastUpdated,
      authors: ['SignalTradingBots Team'],
      tags: [article.primaryKeyword, 'telegram trading', 'gold trading', 'mt5 automation'],
    },
    twitter: {
      card: 'summary_large_image',
      title: article.title,
      description: article.description,
    },
    alternates: {
      canonical: `https://signaltradingbots.com/resources/${slug}`,
    },
  };
}

export default async function ResourceArticle({
  params,
}: {
  params: Promise<Params>;
}) {
  const { slug } = await params;
  const article = resourceArticles.find((item) => item.id === slug);
  const content = resourceArticlesContent[slug];

  if (!article || article.status !== "available" || !content) {
    notFound();
  }

  // Generate JSON-LD schema for SEO
  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": article.title,
    "description": article.description,
    "author": {
      "@type": "Organization",
      "name": "SignalTradingBots",
      "url": "https://signaltradingbots.com"
    },
    "publisher": {
      "@type": "Organization",
      "name": "SignalTradingBots",
      "logo": {
        "@type": "ImageObject",
        "url": "https://signaltradingbots.com/assets/tradingbot-logo.png"
      }
    },
    "datePublished": article.lastUpdated,
    "dateModified": article.lastUpdated,
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": `https://signaltradingbots.com/resources/${slug}`
    },
    "keywords": article.primaryKeyword,
    "articleSection": article.category,
    "wordCount": content.intro.split(' ').length + content.sections.reduce((acc, s) => acc + s.body.split(' ').length + (s.bullets?.join(' ').split(' ').length || 0), 0) + content.conclusion.split(' ').length,
    "inLanguage": "en-US"
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Home",
        "item": "https://signaltradingbots.com"
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": "Resources",
        "item": "https://signaltradingbots.com/resources"
      },
      {
        "@type": "ListItem",
        "position": 3,
        "name": article.title,
        "item": `https://signaltradingbots.com/resources/${slug}`
      }
    ]
  };

  const faqSchema = content.sections.length > 0 ? {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": content.sections.slice(0, 5).map(section => ({
      "@type": "Question",
      "name": section.heading,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": section.body + (section.bullets ? ' ' + section.bullets.join(' ') : '')
      }
    }))
  } : null;

  return (
    <>
      {/* JSON-LD Schema Markup */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      {faqSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
        />
      )}
      
      <article className="space-y-12 pb-16">
      <header className="space-y-6">
        <Link
          href="/resources"
          className="inline-block text-xs font-semibold uppercase tracking-[0.3em] text-[var(--brand-blue-deep)] hover:text-[var(--brand-blue)] transition-colors"
        >
          ← Back to Resources
        </Link>
        <div className="space-y-4">
          <h1 className="text-4xl font-bold text-white md:text-5xl lg:text-6xl leading-tight">
            {article.title}
          </h1>
          <div className="flex flex-wrap items-center gap-3 text-sm text-zinc-400">
            <span className="inline-flex items-center gap-1 rounded-full bg-[var(--brand-blue)]/20 px-4 py-1.5 text-[var(--brand-blue-soft)] font-medium">
              📚 {article.category}
            </span>
            <span>⏱️ {article.readTime}</span>
            <span>📅 Updated {article.lastUpdated}</span>
          </div>
          <div className="rounded-xl bg-gradient-to-r from-[var(--brand-blue)]/10 to-transparent border-l-4 border-[var(--brand-blue)] p-6">
            <p className="text-base md:text-lg text-zinc-200 leading-relaxed">
              {content.intro}
            </p>
          </div>
          <div className="flex flex-wrap gap-2 text-xs">
            <span className="text-zinc-400">Target Keywords:</span>
            <span className="rounded-full bg-[var(--bg-light-2)] px-4 py-1.5 text-[var(--text-main)] font-medium">
              {article.primaryKeyword}
            </span>
          </div>
        </div>
      </header>

      {/* Table of Contents */}
      <nav className="rounded-2xl border border-[var(--border-subtle)] bg-white/95 p-6 shadow-md">
        <h2 className="text-lg font-bold text-[var(--text-main)] mb-4 flex items-center gap-2">
          <span>📋</span>
          <span>Table of Contents</span>
        </h2>
        <ol className="space-y-2 list-decimal list-inside">
          {content.sections.map((section, index) => (
            <li key={index} className="text-sm">
              <a
                href={`#section-${index}`}
                className="text-[var(--brand-blue)] hover:text-[var(--brand-blue-deep)] hover:underline ml-2"
              >
                {section.heading}
              </a>
            </li>
          ))}
        </ol>
      </nav>

      <div className="space-y-8">
        {content.sections.map((section, index) => (
          <section
            key={section.heading}
            id={`section-${index}`}
            className="rounded-2xl border border-[var(--border-subtle)] bg-white/95 p-8 shadow-lg hover:shadow-xl transition-shadow duration-300"
          >
            <h2 className="mb-4 text-2xl font-bold text-[var(--brand-blue-deep)] md:text-3xl border-l-4 border-[var(--brand-blue)] pl-4 py-2 bg-gradient-to-r from-[var(--bg-light-2)] to-transparent">
              {section.heading}
            </h2>
            <p className="text-base text-[var(--text-main)] leading-relaxed mb-4">
              {section.body}
            </p>
            {section.bullets && (
              <ul className="mt-4 space-y-3 pl-2">
                {section.bullets.map((item, bulletIndex) => (
                  <li
                    key={bulletIndex}
                    className="flex items-start gap-3 text-base text-[var(--text-main)] leading-relaxed"
                  >
                    <span className="flex-shrink-0 mt-1.5 h-2 w-2 rounded-full bg-[var(--brand-blue)]" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            )}
          </section>
        ))}
      </div>

      <div className="rounded-2xl border-2 border-[var(--brand-blue)]/30 bg-gradient-to-br from-[var(--bg-light-2)] to-white/95 p-8 shadow-lg">
        <h2 className="mb-4 text-2xl font-bold text-[var(--brand-blue-deep)] flex items-center gap-2">
          <span>🎯</span>
          <span>Conclusion</span>
        </h2>
        <p className="text-base text-[var(--text-main)] leading-relaxed">
          {content.conclusion}
        </p>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-6 rounded-2xl border-2 border-[var(--brand-blue)] bg-gradient-to-r from-[var(--brand-blue)]/5 to-transparent p-8 shadow-xl">
        <div className="flex-1">
          <h3 className="text-xl font-bold text-[var(--text-main)] mb-2">
            💬 Need help implementing this strategy?
          </h3>
          <p className="text-base text-[var(--text-muted)] leading-relaxed">
            We review configurations, map signal formats, and monitor MT5 execution to
            make sure automation is production-ready. Get expert support tailored to your needs.
          </p>
        </div>
        <Link
          href="/contact"
          className="inline-flex items-center justify-center rounded-full bg-[var(--brand-blue)] px-8 py-3 text-sm font-bold text-white hover:bg-[var(--brand-blue-deep)] transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105"
        >
          Contact Support →
        </Link>
      </div>

      {/* Related Articles */}
      <section className="rounded-2xl border border-[var(--border-subtle)] bg-gradient-to-br from-white/95 to-[var(--bg-light-2)]/50 p-8 shadow-lg">
        <h3 className="text-2xl font-bold text-[var(--text-main)] mb-6 flex items-center gap-2">
          <span>📚</span>
          <span>Related Articles</span>
        </h3>
        <div className="grid gap-4 md:grid-cols-2">
          {resourceArticles
            .filter((a) => a.id !== slug && a.status === 'available')
            .slice(0, 4)
            .map((relatedArticle) => (
              <Link
                key={relatedArticle.id}
                href={`/resources/${relatedArticle.id}`}
                className="block rounded-xl border border-[var(--border-subtle)] bg-white/90 p-4 transition-all hover:shadow-md hover:border-[var(--brand-blue)]/50 hover:-translate-y-1"
              >
                <span className="text-xs font-semibold text-[var(--brand-blue)] uppercase tracking-wide">
                  {relatedArticle.category}
                </span>
                <h4 className="mt-2 font-semibold text-[var(--text-main)] line-clamp-2">
                  {relatedArticle.title}
                </h4>
                <p className="mt-1 text-sm text-[var(--text-muted)] line-clamp-2">
                  {relatedArticle.description}
                </p>
                <span className="mt-3 inline-block text-xs text-[var(--brand-blue)] font-medium">
                  Read more →
                </span>
              </Link>
            ))}
        </div>
      </section>

      <nav className="rounded-2xl border border-[var(--border-subtle)] bg-white/95 p-6 shadow-md">
        <h3 className="text-lg font-bold text-[var(--text-main)] mb-4 flex items-center gap-2">
          <span>🔗</span>
          <span>Quick Links</span>
        </h3>
        <ul className="space-y-3">
          <li>
            <Link
              href="/resources"
              className="flex items-center gap-2 text-[var(--brand-blue)] hover:text-[var(--brand-blue-deep)] hover:underline text-sm group"
            >
              <span className="group-hover:translate-x-1 transition-transform">→</span>
              <span>View all trading resources & guides</span>
            </Link>
          </li>
          <li>
            <Link
              href="/products"
              className="flex items-center gap-2 text-[var(--brand-blue)] hover:text-[var(--brand-blue-deep)] hover:underline text-sm group"
            >
              <span className="group-hover:translate-x-1 transition-transform">→</span>
              <span>Explore our Telegram signal trading bots</span>
            </Link>
          </li>
          <li>
            <Link
              href="/specs"
              className="flex items-center gap-2 text-[var(--brand-blue)] hover:text-[var(--brand-blue-deep)] hover:underline text-sm group"
            >
              <span className="group-hover:translate-x-1 transition-transform">→</span>
              <span>Technical specifications & features</span>
            </Link>
          </li>
          <li>
            <Link
              href="/contact"
              className="flex items-center gap-2 text-[var(--brand-blue)] hover:text-[var(--brand-blue-deep)] hover:underline text-sm group"
            >
              <span className="group-hover:translate-x-1 transition-transform">→</span>
              <span>Get personalized trading consultation</span>
            </Link>
          </li>
        </ul>
      </nav>
    </article>
    </>
  );
}


