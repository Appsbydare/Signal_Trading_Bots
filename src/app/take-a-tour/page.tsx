import React from "react";
import DemoPageClient from "./demo-client";

export const metadata = {
  title: "Product Preview | Signal Trading Bots",
  description: "Interactive demo of the SignalTradingBots desktop application UI with live previews of all features.",
};

export default function DemoPage() {
  return <DemoPageClient />;
}
