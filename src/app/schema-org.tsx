"use client";
import Script from "next/script";

const siteUrl = "https://www.signaltradingbots.com";

const faqEntries = [
  {
    question: "Do I need a VPS?",
    answer:
      "We strongly recommend running the bot on a Windows VPS so it can stay online 24/7 with MT5 open.",
  },
  {
    question: "Which brokers are supported?",
    answer:
      "Any MT5 broker that allows Expert Advisors (EAs) should work. Always check your broker’s conditions and rules.",
  },
  {
    question: "Can I test on a demo account first?",
    answer:
      "Yes. You should always start on a demo account to validate your configuration before using real funds.",
  },
  {
    question: "Does the bot guarantee profits?",
    answer:
      "No. Trading involves significant risk and past performance does not guarantee future results.",
  },
];

export default function SchemaOrg() {
  const graph = [
    {
      "@context": "https://schema.org",
      "@type": "Organization",
      name: "signaltradingbots",
      url: siteUrl,
      email: "support@signaltradingbots.com",
      sameAs: ["https://www.signaltradingbots.com/contact"],
    },
    {
      "@context": "https://schema.org",
      "@type": "SoftwareApplication",
      name: "SignalTradingBots Desktop Copier",
      applicationCategory: "BusinessApplication",
      operatingSystem: "Windows 10/11, Windows VPS",
      description:
        "Telegram to MT5 automation software with multi-TP logic, risk guardrails, and desktop-only execution.",
      offers: {
        "@type": "Offer",
        priceCurrency: "USD",
        price: "49",
        availability: "https://schema.org/PreOrder",
      },
      url: siteUrl,
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: faqEntries.map((entry) => ({
        "@type": "Question",
        name: entry.question,
        acceptedAnswer: {
          "@type": "Answer",
          text: entry.answer,
        },
      })),
    },
  ];

  return (
    <Script type="application/ld+json" id="schema-org" strategy="afterInteractive">
      {JSON.stringify(graph)}
    </Script>
  );
}

