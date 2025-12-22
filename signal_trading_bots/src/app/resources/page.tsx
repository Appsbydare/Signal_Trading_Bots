import type { Metadata } from "next";
import ResourcesPageClient from "./ResourcesPageClient";

export const metadata: Metadata = {
  title: "Resources | signaltradingbots",
  description:
    "Guides and best practices for automating Telegram signals into MT5, supporting prop firm challenges, and running secure VPS setups.",
};

export default function ResourcesPage() {
  return <ResourcesPageClient />;
}


