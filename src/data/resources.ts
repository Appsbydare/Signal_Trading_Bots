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
];


