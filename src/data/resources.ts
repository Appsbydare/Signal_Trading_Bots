export type ResourceArticle = {
  id: string;
  title: string;
  description: string;
  category: string;
  readTime: string;
  status: "available" | "coming_soon";
  primaryKeyword: string;
  lastUpdated: string;
};

export const resourceArticles: ResourceArticle[] = [
  {
    id: "telegram-to-mt5-guide",
    title: "How to Automate Telegram Signals into MT5 (Step-by-Step)",
    description:
      "Requirements checklist, mapping signal formats, demo-first workflow, and risk guardrails so you can trust every automation step.",
    category: "How-to",
    readTime: "8 min read",
    status: "available",
    primaryKeyword: "telegram to mt5 automation",
    lastUpdated: "November 2024",
  },
  {
    id: "prop-firm-copier",
    title: "Prop Firm Traders’ Guide to Telegram Copiers",
    description:
      "Daily loss limits, hidden comments, and other tactics to keep your copier compliant while attempting funded challenges.",
    category: "Prop Firms",
    readTime: "7 min read",
    status: "available",
    primaryKeyword: "prop firm telegram copier",
    lastUpdated: "November 2024",
  },
  {
    id: "vps-for-mt5-automation",
    title: "Choosing the Right VPS for MT5 Automation",
    description:
      "Latency, uptime, Windows licensing, and monitoring tips so your copier stays online 24/7 without surprises.",
    category: "Infrastructure",
    readTime: "6 min read",
    status: "available",
    primaryKeyword: "mt5 vps automation",
    lastUpdated: "November 2024",
  },
  {
    id: "telegram-signal-trading-gold",
    title: "Telegram Signal Trading in Gold – A Game Changer for Retail Traders",
    description:
      "Discover how Telegram signal trading is transforming gold trading for retail investors. Learn the benefits, risks, and strategies to maximize profits.",
    category: "Trading Strategies",
    readTime: "8 min read",
    status: "available",
    primaryKeyword: "telegram signal trading gold",
    lastUpdated: "January 2026",
  },
  {
    id: "signal-trading-gold-market-volatility",
    title: "How Signal Trading Impacts Gold Market Volatility",
    description:
      "Explore how Telegram signal trading influences gold market volatility. Understand the pros, cons, and future of automated trading signals.",
    category: "Market Analysis",
    readTime: "7 min read",
    status: "available",
    primaryKeyword: "gold market volatility telegram signals",
    lastUpdated: "January 2026",
  },
  {
    id: "telegram-bots-gold-trading",
    title: "Leveraging Telegram Signal Bots for Profitable Gold Trading",
    description:
      "Learn how to use Telegram signal bots to enhance your gold trading strategy. Discover automation, risk control, and profit potential.",
    category: "Automation",
    readTime: "7 min read",
    status: "available",
    primaryKeyword: "telegram bots gold trading",
    lastUpdated: "January 2026",
  },
];


