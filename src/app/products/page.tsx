export const metadata = {
  title: "Products | signaltradingbots",
  description: "Choose a plan that fits your needs.",
};

export default function ProductsPage() {
  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-semibold tracking-tight">Products</h1>
      <p className="max-w-2xl text-sm text-zinc-600">
        Reduced-feature plans compared to the flagship offering. Designed to be
        simple, reliable, and affordable.
      </p>
      <div className="grid gap-6 sm:grid-cols-2">
        <div className="rounded-lg border p-6">
          <h2 className="text-lg font-medium">Starter</h2>
          <p className="text-sm text-zinc-600">$29/month</p>
          <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-zinc-700">
            <li>Telegram signal monitoring</li>
            <li>MT5 order execution</li>
            <li>Core strategy options (TP/SL, lot size)</li>
          </ul>
        </div>
        <div className="rounded-lg border p-6">
          <h2 className="text-lg font-medium">Pro</h2>
          <p className="text-sm text-zinc-600">$49/month</p>
          <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-zinc-700">
            <li>Everything in Starter</li>
            <li>Extended strategy controls</li>
            <li>Priority support</li>
          </ul>
        </div>
      </div>
      <p className="text-xs text-zinc-500">
        Note: Features are presented at a capability level only. Implementation
        details are proprietary and not disclosed.
      </p>
    </div>
  );
}


