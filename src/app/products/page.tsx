export const metadata = {
  title: "Products | signaltradingbots",
  description: "Choose a plan that fits your needs.",
};

export default function ProductsPage() {
  return (
    <div className="space-y-8">
      <h1 className="reveal brand-heading text-2xl font-semibold tracking-tight">Products</h1>
      <section className="space-y-4">
        <p className="reveal max-w-3xl text-sm text-zinc-600">
          Automate MT5 trades from Telegram signals with configurable strategies.
          Simple, reliable, and affordable. Choose a plan and submit your order
          via our Google Form.
        </p>
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-sm font-medium text-[#5e17eb]">Compatible with:</span>
          <img
            src="/telegram-badge.svg"
            alt="Telegram Compatible"
            title="Works with Telegram signals"
            className="h-8 w-8 transition hover:scale-110"
          />
          <img
            src="/mt5-badge.svg"
            alt="MT5 Supported"
            title="Executes trades via MetaTrader 5"
            className="h-8 w-8 transition hover:scale-110"
          />
        </div>
        <div className="grid gap-6 sm:grid-cols-3">
          <div className="rounded-lg border border-[#5e17eb] bg-white/85 p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
            <h3 className="reveal mb-2 font-medium">Overview</h3>
            <ul className="list-disc space-y-1 pl-5 text-sm text-zinc-700">
              <li>Monitors Telegram signals in real time</li>
              <li>Executes orders on MT5 based on your strategy</li>
              <li>Configurable TP/SL, order type, lot sizing</li>
            </ul>
          </div>
          <div className="rounded-lg border border-[#5e17eb] bg-white/85 p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
            <h3 className="reveal mb-2 font-medium">Requirements</h3>
            <ul className="list-disc space-y-1 pl-5 text-sm text-zinc-700">
              <li>Windows 10/11 (64-bit) or VPS</li>
              <li>MetaTrader 5 with broker allowing EAs</li>
              <li>Use a demo first before going live</li>
            </ul>
          </div>
          <div className="rounded-lg border border-[#5e17eb] bg-white/85 p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
            <h3 className="reveal mb-2 font-medium">Includes</h3>
            <ul className="list-disc space-y-1 pl-5 text-sm text-zinc-700">
              <li>License for one user</li>
              <li>Updates included while subscribed</li>
              <li>Email support</li>
            </ul>
          </div>
        </div>
      </section>
      <div className="grid gap-6 sm:grid-cols-2">
        <div className="rounded-lg border border-[#5e17eb] bg-white/90 p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
          <div className="mb-3 flex items-center gap-2">
            <h2 className="reveal text-lg font-medium">Starter</h2>
            <img
              src="/telegram-badge.svg"
              alt="Telegram Compatible"
              title="Works with Telegram signals"
              className="h-6 w-6 transition hover:scale-110"
            />
            <img
              src="/mt5-badge.svg"
              alt="MT5 Supported"
              title="Executes trades via MetaTrader 5"
              className="h-6 w-6 transition hover:scale-110"
            />
          </div>
          <p className="text-sm text-zinc-600">$29/month</p>
          <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-zinc-700">
            <li>Telegram signal monitoring</li>
            <li>MT5 order execution</li>
            <li>Core strategy options (TP/SL, lot size)</li>
          </ul>
          <div className="mt-4 flex gap-3">
            <a
              href="/payment?plan=starter"
              className="rounded-md bg-[#5e17eb] px-4 py-2 text-white shadow-sm transition hover:bg-[#4512c2] hover:shadow-md"
            >
              Buy Starter
            </a>
            <a
              href="/contact"
              className="rounded-md border border-[#5e17eb] px-4 py-2 text-[#5e17eb] transition hover:bg-[#5e17eb] hover:text-white"
            >
              Questions?
            </a>
          </div>
        </div>
        <div className="rounded-lg border border-[#5e17eb] bg-white/90 p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
          <div className="mb-3 flex items-center gap-2">
            <h2 className="reveal text-lg font-medium">Pro</h2>
            <img
              src="/telegram-badge.svg"
              alt="Telegram Compatible"
              title="Works with Telegram signals"
              className="h-6 w-6 transition hover:scale-110"
            />
            <img
              src="/mt5-badge.svg"
              alt="MT5 Supported"
              title="Executes trades via MetaTrader 5"
              className="h-6 w-6 transition hover:scale-110"
            />
          </div>
          <p className="text-sm text-zinc-600">$49/month</p>
          <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-zinc-700">
            <li>Everything in Starter</li>
            <li>Extended strategy controls</li>
            <li>Priority support</li>
          </ul>
          <div className="mt-4 flex gap-3">
            <a
              href="/payment?plan=pro"
              className="rounded-md bg-[#5e17eb] px-4 py-2 text-white shadow-sm transition hover:bg-[#4512c2] hover:shadow-md"
            >
              Buy Pro
            </a>
            <a
              href="/contact"
              className="rounded-md border border-[#5e17eb] px-4 py-2 text-[#5e17eb] transition hover:bg-[#5e17eb] hover:text-white"
            >
              Questions?
            </a>
          </div>
        </div>
      </div>
      <section className="rounded-lg border border-[#5e17eb] bg-white/90 p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
        <h3 className="reveal mb-2 font-medium">Important notices</h3>
        <ul className="list-disc space-y-1 pl-5 text-sm text-zinc-700">
          <li>Use a demo first to validate your signal provider’s SL/TP style.</li>
          <li>We do not disclose internal implementation or methods.</li>
          <li>Not financial advice; trading involves significant risk.</li>
        </ul>
      </section>
    </div>
  );
}


