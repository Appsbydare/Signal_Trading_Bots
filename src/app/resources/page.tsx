import type { Metadata } from "next";
import ResourcesPageClient from "./ResourcesPageClient";

export const metadata: Metadata = {
  title: "Trading Resources & Guides | Telegram Signal Trading | SignalTradingBots",
  description:
    "Comprehensive guides on automating Telegram signals into MT5, gold trading strategies, signal bots, prop firm challenges, and VPS setups. Expert resources for profitable trading.",
  keywords: "telegram signal trading, gold trading, mt5 automation, trading bots, forex signals, signal copier, automated trading, prop firm trading, telegram bots",
  openGraph: {
    title: "Trading Resources & Guides | SignalTradingBots",
    description: "Expert guides on Telegram signal trading, gold trading automation, and MT5 integration. Learn professional trading strategies.",
    type: "website",
    url: "https://signaltradingbots.com/resources",
  },
  twitter: {
    card: "summary_large_image",
    title: "Trading Resources & Guides | SignalTradingBots",
    description: "Expert guides on Telegram signal trading, gold trading automation, and MT5 integration.",
  },
  alternates: {
    canonical: "https://signaltradingbots.com/resources",
  },
};

export default function ResourcesPage() {
  return <ResourcesPageClient />;
}


