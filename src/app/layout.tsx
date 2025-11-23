import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import localFont from "next/font/local";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import SchemaOrg from "./schema-org";
import Analytics from "./analytics";

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
  openGraph: {
    title: "Telegram to MT5 Trading Bot | Automate Forex Signals",
    description:
      "Turn Telegram trading signals into automated MT5 orders with configurable strategies and risk controls.",
    url: "https://www.signaltradingbots.com",
    siteName: "signaltradingbots",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Telegram to MT5 Trading Bot | Automate Forex Signals",
    description:
      "Automate MT5 trades from Telegram signals with configurable strategies and risk management.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${bebasNeue.variable} antialiased`}
      >
        <header className="sticky top-0 z-50 border-b border-[#5e17eb]/40 bg-zinc-950/98 text-zinc-50 shadow-sm">
          <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
            <Link href="/" className="flex items-center">
              <Image
                src="/Tradingbot.png"
                alt="SIGNAL trading bots"
                width={90}
                height={25}
                className="h-auto w-auto"
                priority
              />
            </Link>
            <nav className="flex items-center gap-6 text-sm">
              <Link className="text-white/90 transition hover:text-[#d3c5ff]" href="/products">Products</Link>
              <Link className="text-white/90 transition hover:text-[#d3c5ff]" href="/specs">Specs</Link>
              <Link className="text-white/90 transition hover:text-[#d3c5ff]" href="/faq">FAQ</Link>
              <Link className="text-white/90 transition hover:text-[#d3c5ff]" href="/contact">Contact</Link>
            </nav>
          </div>
        </header>

        <main className="mx-auto min-h-[70vh] max-w-6xl px-6 py-12">{children}</main>

        <SchemaOrg />
        <Analytics />

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
                © {new Date().getFullYear()} signaltradingbots. All rights reserved.
              </p>
              <p className="text-xs text-zinc-500">
                MetaTrader, MT4, and MT5 are trademarks of MetaQuotes Software Corp. Telegram is a trademark of Telegram FZ-LLC. Trading involves risk; use a demo first. Not financial advice.
              </p>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
