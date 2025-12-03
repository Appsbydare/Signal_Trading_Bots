import { getPublicFaqs } from "@/lib/faqs-db";

export const metadata = {
  title: "FAQ | signaltradingbots",
  description: "Frequently asked questions about setup, requirements, and usage.",
};

export default async function FAQPage() {
  const faqs = await getPublicFaqs();

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
      <ul className="space-y-4">
        {faqs.map((item) => (
          <li
            key={item.id}
            className="rounded-lg border border-[#5e17eb] bg-white/90 p-4 shadow-sm transition hover:-translate-y-[2px] hover:shadow-md"
          >
            <p className="font-medium">{item.question}</p>
            <p className="text-sm text-zinc-600">{item.answer}</p>
          </li>
        ))}
      </ul>

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