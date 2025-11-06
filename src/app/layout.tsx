import type { Metadata } from "next";
import Link from "next/link";
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
  title: "signaltradingbots | Telegram → MT5 Automation",
  description:
    "Automate MT5 trades from Telegram signals with configurable strategies (TP/SL, order type, lot sizing). Simple, professional, and affordable.",
  metadataBase: new URL("https://www.signaltradingbots.com"),
  alternates: { canonical: "/" },
  openGraph: {
    title: "signaltradingbots | Telegram → MT5 Automation",
    description:
      "Automate MT5 trades from Telegram signals with configurable strategies.",
    url: "https://www.signaltradingbots.com",
    siteName: "signaltradingbots",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "signaltradingbots | Telegram → MT5 Automation",
    description:
      "Automate MT5 trades from Telegram signals with configurable strategies.",
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
        <header className="sticky top-0 z-50 border-b border-black/20 bg-zinc-900/95 text-zinc-50 backdrop-blur supports-[backdrop-filter]:bg-zinc-900/85">
          <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
            <Link href="/" className="text-base font-semibold tracking-tight">
              signaltradingbots
            </Link>
            <nav className="flex items-center gap-6 text-sm">
              <Link className="hover:opacity-80" href="/products">Products</Link>
              <Link className="hover:opacity-80" href="/specs">Specs</Link>
              <Link className="hover:opacity-80" href="/faq">FAQ</Link>
              <Link className="hover:opacity-80" href="/contact">Contact</Link>
            </nav>
          </div>
        </header>

        <main className="mx-auto min-h-[70vh] max-w-6xl px-6 py-12">{children}</main>

        <SchemaOrg />
        <Analytics />

        <footer className="mt-10 border-t border-black/20 bg-zinc-950 py-10 text-sm text-zinc-300">
          <div className="mx-auto max-w-6xl px-6">
            <div className="flex flex-col gap-3">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="font-medium text-zinc-200">signaltradingbots</p>
                <div className="flex gap-4">
                  <Link className="hover:opacity-80" href="/terms">Terms</Link>
                  <Link className="hover:opacity-80" href="/privacy">Privacy</Link>
                  <Link className="hover:opacity-80" href="/refund">Refund</Link>
                </div>
              </div>
              <p>© {new Date().getFullYear()} signaltradingbots. All rights reserved.</p>
              <p className="text-xs text-zinc-400">
                MetaTrader, MT4, and MT5 are trademarks of MetaQuotes Software Corp. Telegram is a trademark of Telegram FZ-LLC. Trading involves risk; use a demo first. Not financial advice.
              </p>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
