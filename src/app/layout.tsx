import type { Metadata } from "next";
import Link from "next/link";
import Script from "next/script";
import Image from "next/image";
import localFont from "next/font/local";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import SchemaOrg from "./schema-org";
import Analytics from "./analytics";
import VirtualSupportChat from "@/components/VirtualSupportChat";
import HumanAgentChatLink from "@/components/HumanAgentChatLink";
import Breadcrumb from "@/components/Breadcrumb";
import Navbar from "@/components/Navbar";
import Preloader from "@/components/Preloader";
import { PreloaderProvider } from "@/context/PreloaderContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const bebasNeue = localFont({
  src: "../fonts/BebasNeue-Regular.ttf",
  variable: "--font-heading",
  display: "swap",
  weight: "400",
  style: "normal",
});

export const metadata: Metadata = {
  title: "Telegram to MT5 Trading Bot | Automate Forex Signals | signaltradingbots",
  description:
    "Automate MT5 trades from Telegram signals with multi-TP, SL, and risk-based lot sizing. Run it on Windows or VPS and start safely with a demo account.",
  metadataBase: new URL("https://www.signaltradingbots.com"),
  alternates: { canonical: "/" },
  icons: {
    icon: "/favicon.ico",
  },
  other: {
    "color-scheme": "dark",
  },
  openGraph: {
    title: "Telegram to MT5 Trading Bot | Automate Forex Signals",
    description:
      "Turn Telegram trading signals into automated MT5 orders with configurable strategies and risk controls.",
    url: "https://www.signaltradingbots.com",
    siteName: "signaltradingbots",
    locale: "en_US",
    type: "website",
    images: [
      {
        url: "/Tradingbot.png",
        width: 1200,
        height: 630,
        alt: "signaltradingbots hero",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Telegram to MT5 Trading Bot | Automate Forex Signals",
    description:
      "Automate MT5 trades from Telegram signals with configurable strategies and risk management.",
    images: ["/Tradingbot.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" style={{ colorScheme: 'dark' }}>
      <head>
        <link
          rel="alternate"
          type="application/rss+xml"
          title="SignalTradingBots Resources RSS Feed"
          href="/resources/rss.xml"
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${bebasNeue.variable} antialiased overflow-x-hidden bg-zinc-950 text-white`}
      >
        <PreloaderProvider>
          <Preloader />
          <Navbar />

          <main className="mx-auto min-h-[70vh] max-w-6xl px-6 pb-12 pt-0">
            <Breadcrumb />
            {children}
          </main>

          <SchemaOrg />
          <Analytics />
          <VirtualSupportChat />

          <footer className="mt-10 border-t border-[#5e17eb]/25 bg-zinc-950 py-10 text-sm text-zinc-300">
            <div className="mx-auto max-w-6xl px-6">
              <div className="grid grid-cols-1 gap-8 pb-8 md:grid-cols-2 lg:grid-cols-4">
                {/* Company Section */}
                <div className="space-y-3">
                  <Link href="/" className="flex items-center">
                    <Image
                      src="/Tradingbot.png"
                      alt="SIGNAL trading bots"
                      width={150}
                      height={42}
                      className="h-auto w-auto"
                    />
                  </Link>
                  <p className="text-xs leading-relaxed text-zinc-400">
                    Professional automated trading solutions for MT5 and Telegram signal integration.
                  </p>
                  <div className="flex items-center gap-4 pt-2">
                    <a href="https://www.facebook.com/profile.php?id=61583335566928" target="_blank" rel="noopener noreferrer" className="text-zinc-400 hover:text-[#5e17eb] transition-colors" title="Facebook">
                      <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" />
                      </svg>
                    </a>
                    <a href="https://www.instagram.com/signaltradingbots/" target="_blank" rel="noopener noreferrer" className="text-zinc-400 hover:text-[#5e17eb] transition-colors" title="Instagram">
                      <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                        <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                        <path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37z"></path>
                        <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                      </svg>
                    </a>
                    <a href="https://www.tiktok.com/@signaltradingbots?lang=en" target="_blank" rel="noopener noreferrer" className="text-zinc-400 hover:text-[#5e17eb] transition-colors" title="TikTok">
                      <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1.04-.1z" />
                      </svg>
                    </a>
                    <a href="https://www.youtube.com/@SignalTradingBots" target="_blank" rel="noopener noreferrer" className="text-zinc-400 hover:text-[#5e17eb] transition-colors" title="YouTube">
                      <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                      </svg>
                    </a>
                  </div>
                </div>

                {/* Products Section */}
                <div className="space-y-3">
                  <h3 className="font-semibold text-zinc-200">Products</h3>
                  <ul className="space-y-2">
                    <li>
                      <Link href="/products" className="text-zinc-400 hover:text-zinc-200">
                        Trading Bots
                      </Link>
                    </li>
                    <li>
                      <Link href="/specs" className="text-zinc-400 hover:text-zinc-200">
                        Specifications
                      </Link>
                    </li>
                    <li>
                      <Link href="/resources" className="text-zinc-400 hover:text-zinc-200">
                        Trading Resources
                      </Link>
                    </li>
                  </ul>
                </div>

                {/* Support Section */}
                <div className="space-y-3">
                  <h3 className="font-semibold text-zinc-200">Support</h3>
                  <ul className="space-y-2">
                    <li>
                      <Link href="/faq" className="text-zinc-400 hover:text-zinc-200">
                        FAQ
                      </Link>
                    </li>
                    <li>
                      <Link href="/contact" className="text-zinc-400 hover:text-zinc-200">
                        Contact
                      </Link>
                    </li>
                    <li>
                      <a
                        href="mailto:support@signaltradingbots.com"
                        className="text-zinc-400 hover:text-zinc-200"
                      >
                        support@signaltradingbots.com
                      </a>
                    </li>
                    <li>
                      <HumanAgentChatLink />
                    </li>
                  </ul>
                </div>

                {/* Legal Section */}
                <div className="space-y-3">
                  <h3 className="font-semibold text-zinc-200">Legal</h3>
                  <ul className="space-y-2">
                    <li>
                      <Link href="/terms" className="text-zinc-400 hover:text-zinc-200">
                        Terms of Service
                      </Link>
                    </li>
                    <li>
                      <Link href="/privacy" className="text-zinc-400 hover:text-zinc-200">
                        Privacy Policy
                      </Link>
                    </li>
                    <li>
                      <Link href="/refund" className="text-zinc-400 hover:text-zinc-200">
                        Refund Policy
                      </Link>
                    </li>
                  </ul>
                </div>
              </div>

              {/* Copyright and Disclaimer - Center Aligned */}
              <div className="border-t border-zinc-800 pt-6 text-center">
                <p className="mb-2 text-zinc-400">
                  © {new Date().getFullYear()} SignalTradingBots, a brand of theDBot LLC. All rights reserved.
                </p>
                <p className="mb-3 text-xs text-zinc-500">
                  1207 Delaware Ave #2685, Wilmington, DE 19806
                </p>
                <p className="text-xs text-zinc-500">
                  MetaTrader, MT4, and MT5 are trademarks of MetaQuotes Software Corp. Telegram is a trademark of Telegram FZ-LLC. Trading involves risk; use a demo first. Not financial advice.
                </p>
              </div>
            </div>
          </footer>
        </PreloaderProvider>
      </body>
    </html>
  );
}
