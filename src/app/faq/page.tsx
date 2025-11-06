export const metadata = {
  title: "FAQ | signaltradingbots",
  description: "Frequently asked questions about setup, requirements, and usage.",
};

const faqs = [
  {
    q: "What do I need to use this?",
    a: "Windows 10/11 (64-bit), MetaTrader 5 with a broker that allows EAs, and stable internet.",
  },
  {
    q: "Can I test on demo first?",
    a: "Yes, we strongly recommend starting on a demo account to understand SL/TP behavior.",
  },
  {
    q: "Do you provide financial advice?",
    a: "No. This is software only and not financial advice. Trading involves risk.",
  },
  {
    q: "Which assets are supported?",
    a: "Forex pairs, Gold, Crypto, and major indices (availability varies by broker).",
  },
];

export default function FAQPage() {
  return (
    <div className="space-y-8">
      <h1 className="reveal text-2xl font-semibold tracking-tight">FAQ</h1>
      <ul className="space-y-4">
        {faqs.map((item) => (
          <li key={item.q} className="rounded-lg border p-4">
            <p className="font-medium">{item.q}</p>
            <p className="text-sm text-zinc-600">{item.a}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}


