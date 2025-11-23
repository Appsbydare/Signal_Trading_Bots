export type ResourceArticle = {
  id: string;
  title: string;
  description: string;
  category: string;
  readTime: string;
  status: "available" | "coming_soon";
  primaryKeyword: string;
};

export const resourceArticles: ResourceArticle[] = [
  {
    id: "telegram-to-mt5-guide",
    title: "How to Automate Telegram Signals into MT5 (Step-by-Step)",
    description:
      "Requirements checklist, mapping signal formats, demo-first workflow, and risk guardrails so you can trust every automation step.",
    category: "How-to",
    readTime: "8 min read",
    status: "coming_soon",
    primaryKeyword: "telegram to mt5 automation",
  },
  {
    id: "prop-firm-copier",
    title: "Prop Firm Traders’ Guide to Telegram Copiers",
    description:
      "Daily loss limits, hidden comments, and other tactics to keep your copier compliant while attempting funded challenges.",
    category: "Prop Firms",
    readTime: "6 min read",
    status: "coming_soon",
    primaryKeyword: "prop firm telegram copier",
  },
  {
    id: "vps-for-mt5-automation",
    title: "Choosing the Right VPS for MT5 Automation",
    description:
      "Latency, uptime, Windows licensing, and monitoring tips so your copier stays online 24/7 without surprises.",
    category: "Infrastructure",
    readTime: "5 min read",
    status: "coming_soon",
    primaryKeyword: "mt5 vps automation",
  },
];


