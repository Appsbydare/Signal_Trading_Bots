export const metadata = {
  title: "Products | signaltradingbots",
  description: "Choose a plan that fits your needs.",
};

export default function ProductsPage() {
  return (
    <div className="space-y-8">
      <h1 className="reveal text-2xl font-semibold tracking-tight">Products</h1>
      <section className="space-y-4">
        <p className="reveal max-w-3xl text-sm text-zinc-600">
          Automate MT5 trades from Telegram signals with configurable strategies.
          Simple, reliable, and affordable. Choose a plan and submit your order
          via our Google Form.
        </p>
        <div className="grid gap-6 sm:grid-cols-3">
          <div className="rounded-lg border p-6">
            <h3 className="reveal mb-2 font-medium">Overview</h3>
            <ul className="list-disc space-y-1 pl-5 text-sm text-zinc-700">
              <li>Monitors Telegram signals in real time</li>
              <li>Executes orders on MT5 based on your strategy</li>
              <li>Configurable TP/SL, order type, lot sizing</li>
            </ul>
          </div>
          <div className="rounded-lg border p-6">
            <h3 className="reveal mb-2 font-medium">Requirements</h3>
            <ul className="list-disc space-y-1 pl-5 text-sm text-zinc-700">
              <li>Windows 10/11 (64-bit) or VPS</li>
              <li>MetaTrader 5 with broker allowing EAs</li>
              <li>Use a demo first before going live</li>
            </ul>
          </div>
          <div className="rounded-lg border p-6">
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
        <div className="rounded-lg border p-6">
          <h2 className="reveal text-lg font-medium">Starter</h2>
          <p className="text-sm text-zinc-600">$29/month</p>
          <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-zinc-700">
            <li>Telegram signal monitoring</li>
            <li>MT5 order execution</li>
            <li>Core strategy options (TP/SL, lot size)</li>
          </ul>
          <div className="mt-4 flex gap-3">
            <a
              href="/payment?plan=starter"
              className="rounded-md bg-black px-4 py-2 text-white hover:bg-zinc-800"
            >
              Buy Starter
            </a>
            <a
              href="/contact"
              className="rounded-md border px-4 py-2 hover:bg-zinc-50"
            >
              Questions?
            </a>
          </div>
        </div>
        <div className="rounded-lg border p-6">
          <h2 className="reveal text-lg font-medium">Pro</h2>
          <p className="text-sm text-zinc-600">$49/month</p>
          <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-zinc-700">
            <li>Everything in Starter</li>
            <li>Extended strategy controls</li>
            <li>Priority support</li>
          </ul>
          <div className="mt-4 flex gap-3">
            <a
              href="/payment?plan=pro"
              className="rounded-md bg-black px-4 py-2 text-white hover:bg-zinc-800"
            >
              Buy Pro
            </a>
            <a
              href="/contact"
              className="rounded-md border px-4 py-2 hover:bg-zinc-50"
            >
              Questions?
            </a>
          </div>
        </div>
      </div>
      <section className="rounded-lg border p-6">
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


