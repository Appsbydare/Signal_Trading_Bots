import { getPublicFaqs } from "@/lib/faqs-db";

export const metadata = {
  title: "FAQ | signaltradingbots",
  description: "Frequently asked questions about setup, requirements, and usage.",
};

export default async function FAQPage() {
  const faqs = await getPublicFaqs();

  const groupedByCategory = faqs.reduce<Record<string, typeof faqs>>((acc, faq) => {
    const key = faq.category && faq.category.trim().length > 0 ? faq.category : "General";
    if (!acc[key]) {
      acc[key] = [];
    }
    acc[key].push(faq);
    return acc;
  }, {});

  // Google recommends limiting FAQ rich results to a reasonable number of Q&As.
  const schemaFaqs = faqs.slice(0, 50);

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: schemaFaqs.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };

  return (
    <div className="space-y-8">
      <h1 className="reveal brand-heading text-2xl font-semibold tracking-tight">FAQ</h1>

      <div className="space-y-10">
        {Object.entries(groupedByCategory).map(([category, items]) => (
          <section key={category} className="space-y-4">
            <h2 className="text-xl font-semibold text-zinc-900">{category}</h2>
            <ul className="space-y-4">
              {items.map((item) => (
                <li
                  key={item.id}
                  className="rounded-lg border border-[#5e17eb] bg-white/90 p-4 shadow-sm transition hover:-translate-y-[2px] hover:shadow-md"
                >
                  <p className="font-medium">{item.question}</p>
                  <p className="text-sm text-zinc-600">{item.answer}</p>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>

      {/* SEO: FAQPage structured data for rich results */}
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
        suppressHydrationWarning
      />
    </div>
  );
}