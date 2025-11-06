import type { Metadata } from "next";
import Link from "next/link";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "signaltradingbots | Telegram → MT5 Automation",
  description:
    "Automate MT5 trades from Telegram signals with configurable strategies (TP/SL, order type, lot sizing). Simple, professional, and affordable.",
  metadataBase: new URL("https://www.signaltradingbots.com"),
  alternates: { canonical: "/" },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <header className="sticky top-0 z-50 border-b border-black/10 bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60">
          <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
            <Link href="/" className="text-base font-semibold tracking-tight">
              signaltradingbots
            </Link>
            <nav className="flex items-center gap-6 text-sm">
              <Link href="/products">Products</Link>
              <Link href="/specs">Specs</Link>
              <Link href="/faq">FAQ</Link>
              <Link href="/contact">Contact</Link>
            </nav>
          </div>
        </header>

        <main className="mx-auto min-h-[70vh] max-w-6xl px-6 py-12">{children}</main>

        <footer className="border-t border-black/10 py-10 text-sm">
          <div className="mx-auto max-w-6xl px-6">
            <div className="flex flex-col gap-2 text-zinc-600">
              <p>
                © {new Date().getFullYear()} signaltradingbots. All rights reserved.
              </p>
              <p>
                MetaTrader, MT4, and MT5 are trademarks of MetaQuotes Software Corp. Telegram is a trademark of Telegram FZ-LLC. Trading involves risk; use a demo first. Not financial advice.
              </p>
              <div className="flex gap-4">
                <Link href="/terms">Terms</Link>
                <Link href="/privacy">Privacy</Link>
                <Link href="/refund">Refund</Link>
              </div>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
