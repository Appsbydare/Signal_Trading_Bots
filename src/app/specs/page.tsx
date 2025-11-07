export const metadata = {
  title: "Specs | signaltradingbots",
  description: "High-level product specifications without implementation details.",
};

export default function SpecsPage() {
  return (
    <div className="space-y-8">
      <h1 className="reveal brand-heading text-2xl font-semibold tracking-tight">Specifications</h1>
      <div className="grid gap-6 sm:grid-cols-2">
        <div className="rounded-lg border border-[#5e17eb] bg-white/90 p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
          <h2 className="mb-2 font-medium">Platform</h2>
          <ul className="list-disc space-y-1 pl-5 text-sm text-zinc-700">
            <li>Windows 10/11 (64-bit)</li>
            <li>MetaTrader 5 compatible</li>
            <li>Recommended: VPS for 24/7 uptime</li>
          </ul>
        </div>
        <div className="rounded-lg border border-[#5e17eb] bg-white/90 p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
          <h2 className="mb-2 font-medium">Capabilities</h2>
          <ul className="list-disc space-y-1 pl-5 text-sm text-zinc-700">
            <li>Real-time monitoring of Telegram signals</li>
            <li>Automated MT5 order placement and management</li>
            <li>Strategy configuration for TP/SL, order type, lot sizing</li>
          </ul>
        </div>
        <div className="rounded-lg border border-[#5e17eb] bg-white/90 p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
          <h2 className="mb-2 font-medium">Assets</h2>
          <ul className="list-disc space-y-1 pl-5 text-sm text-zinc-700">
            <li>Forex pairs, Gold, Crypto, Indices</li>
          </ul>
        </div>
        <div className="rounded-lg border border-[#5e17eb] bg-white/90 p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
          <h2 className="mb-2 font-medium">Guidance</h2>
          <ul className="list-disc space-y-1 pl-5 text-sm text-zinc-700">
            <li>Use demo first; understand your signal provider’s SL/TP style</li>
            <li>Ensure broker allows EAs and automated trading</li>
            <li>Not financial advice; trading involves significant risk</li>
          </ul>
        </div>
      </div>
      <p className="text-xs text-zinc-500">
        For inspiration and positioning, see also: Telegram Trading Bot overview
        and high-level specs. We intentionally avoid exposing code/methods.
      </p>
    </div>
  );
}


