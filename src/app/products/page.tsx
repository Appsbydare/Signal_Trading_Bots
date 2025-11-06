export const metadata = {
  title: "Products | signaltradingbots",
  description: "Choose a plan that fits your needs.",
};

export default function ProductsPage() {
  return (
    <div className="space-y-8">
      <h1 className="reveal text-2xl font-semibold tracking-tight">Products</h1>
      <p className="reveal max-w-2xl text-sm text-zinc-600">
        Reduced-feature plans compared to the flagship offering. Designed to be
        simple, reliable, and affordable. Choose a plan and submit the order via
        our Google Form.
      </p>
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
              href="https://docs.google.com/forms/d/e/1FAIpQLSclVvR_Rwz-kdAUdbBRsIr2FxVn2n2RkCY0UP-oLjaLlCAIuA/viewform?usp=header"
              target="_blank"
              rel="noopener noreferrer"
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
              href="https://docs.google.com/forms/d/e/1FAIpQLSclVvR_Rwz-kdAUdbBRsIr2FxVn2n2RkCY0UP-oLjaLlCAIuA/viewform?usp=header"
              target="_blank"
              rel="noopener noreferrer"
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
      <p className="text-xs text-zinc-500">
        Note: Features are presented at a capability level only. Implementation
        details are proprietary and not disclosed.
      </p>
    </div>
  );
}


