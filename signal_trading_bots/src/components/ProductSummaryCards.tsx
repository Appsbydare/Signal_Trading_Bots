import React from "react";

export function ProductSummaryCards() {
  return (
    <div className="space-y-4">
      <div className="grid gap-6 sm:grid-cols-3">
        <div className="rounded-lg border border-[#5e17eb] bg-white/85 p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
          <h3 className="reveal mb-2 text-[var(--text-main)] font-medium">Overview</h3>
          <ul className="list-disc space-y-1 pl-5 text -sm text-[var(--text-main)]">
            <li>Monitors Telegram signals in real time</li>
            <li>Executes orders on MT5 based on your strategy</li>
            <li>Configurable TP/SL, order type, lot sizing</li>
          </ul>
        </div>
        <div className="rounded-lg border border-[#5e17eb] bg-white/85 p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
          <h3 className="reveal mb-2  text-[var(--text-main)] font-medium">Requirements</h3>
          <ul className="list-disc space-y-1 pl-5 text-sm text-[var(--text-main)]">
            <li>Windows 10/11 (64-bit) or VPS</li>
            <li>MetaTrader 5 with broker allowing EAs</li>
            <li>Use a demo first before going live</li>
          </ul>
        </div>
        <div className="rounded-lg border border-[#5e17eb] bg-white/85 p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
          <h3 className="reveal mb-2 text-[var(--text-main)] font-medium">Includes</h3>
          <ul className="list-disc space-y-1 pl-5 text-sm text-[var(--text-main)]">
            <li>License for one user</li>
            <li>Updates included while subscribed</li>
            <li>Email support</li>
          </ul>
        </div>
      </div>
      <section className="rounded-lg border border-[#5e17eb] bg-white/90 p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
        <h3 className="reveal mb-2  text-[var(--text-main)] font-medium">Important notices</h3>
        <ul className="list-disc space-y-1 pl-5 text-sm text-[var(--text-main)]">
          <li>Use a demo first to validate your signal provider’s SL/TP style.</li>
          <li>We do not disclose internal implementation or methods.</li>
          <li>Not financial advice; trading involves significant risk.</li>
        </ul>
      </section>
    </div>
  );
}



