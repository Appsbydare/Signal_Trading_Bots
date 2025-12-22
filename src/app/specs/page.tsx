export const metadata = {
  title: "Mini Bot V13.1 Specs | signaltradingbots",
  description:
    "High-level feature specification for the Mini Bot V13.1 Telegram → MT5 trading assistant, covering each tab and core capability.",
};

const tabs = [
  {
    icon: "📊",
    name: "Dashboard",
    tagline: "Live view of performance and open risk.",
    bullets: [
      "Daily profit chart with date filters and profit vs. cumulative views.",
      "Account equity, balance, margin level, and free margin at a glance.",
      "Today’s P&L with clear gain/loss colouring and timezone label.",
    ],
  },
  {
    icon: "📝",
    name: "Logs",
    tagline: "Real-time console for everything the bot is doing.",
    bullets: [
      "Live feed with severity levels and optional stack traces for errors.",
      "Filters for Info / Warning / Error plus text search.",
      "Controls for clear, save, auto-scroll and timestamp visibility.",
    ],
  },
  {
    icon: "🎯",
    name: "Strategies",
    tagline: "Where you configure how signals become trades.",
    bullets: [
      "Grid of strategies with status, channel link, and quick enable / disable.",
      "Execution modes for instant or signal-based entries with tailored forms.",
      "Rich risk controls: TP ladders, trailing stops, breakeven and daily loss guards.",
    ],
  },
  {
    icon: "🕵️‍♂️",
    name: "Audit",
    tagline: "Full trace for every processed signal.",
    bullets: [
      "7‑day stats for total signals, success rate and processing time.",
      "Filterable audit table with parse / exec status and latency.",
      "Details pane with raw signal, parsed payload and execution response.",
    ],
  },
  {
    icon: "⚙️",
    name: "Settings",
    tagline: "All integration and global preferences in one place.",
    bullets: [
      "Telegram + MT5 connection, including terminal path validation.",
      "Global trading parameters such as default lot, max slippage and algo toggle.",
      "Clock and analytics timezone configuration with persistent storage.",
    ],
  },
  {
    icon: "🆘",
    name: "Help / News",
    tagline: "In‑app knowledge base and updates.",
    bullets: [
      "News cards with summaries pulled from the SignalTradingBots API.",
      "Video tutorials sourced from a dedicated help feed.",
      "Optional promotional hero image for campaigns or release notes.",
    ],
  },
  {
    icon: "🧭",
    name: "Global controls",
    tagline: "Always‑visible bot controls and clocks.",
    bullets: [
      "Start / Stop buttons with clear enabled / disabled states.",
      "Status indicator and inline notifications for lifecycle events.",
      "Three digital clocks aligned with your chosen timezones.",
    ],
  },
];

const platform = [
  "Windows 10/11 (64‑bit).",
  "Designed for MetaTrader 5 terminals that allow Expert Advisors (EAs).",
  "Best experience on a Windows VPS for 24/7 uptime.",
];

const qaChecklist = [
  "Confirm Start / Stop behaviour, status banner and clock updates.",
  "Match Dashboard P&L against MT5 for both server and system timezone modes.",
  "Trigger sample Info / Warning / Error logs and verify filters respond instantly.",
  "Save, duplicate and adjust a strategy; confirm the Audit tab reflects new behaviour.",
  "Change MT5 path and timezones in Settings, restart, and verify persistence.",
];

export default function SpecsPage() {
  return (
    <div className="space-y-10">
      {/* Hero / Intro */}
      <section className="space-y-3">
        <h1 className="reveal brand-heading text-3xl font-semibold tracking-tight">
          Mini Bot V13.1 – Feature Specification
        </h1>
        <p className="max-w-3xl text-sm text-zinc-600">
          This page summarises what the desktop bot offers from a user experience point
          of view: which tabs exist, what they show, and how they work together with MT5
          and Telegram. It avoids implementation details while giving enough depth for
          demos, documentation, or QA.
        </p>
      </section>

      {/* Platform & requirements */}
      <section className="grid gap-6 md:grid-cols-[1.4fr,1fr]">
        <div className="rounded-xl border border-[var(--border-subtle)] bg-white/90 p-6 shadow-sm">
          <div className="mb-3 flex items-center gap-2">
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-[var(--brand-blue-soft)]/30 text-lg">
              💻
            </span>
            <h2 className="text-base font-semibold text-zinc-900">
              Platform & requirements
            </h2>
          </div>
          <ul className="list-disc space-y-1 pl-5 text-sm text-zinc-700">
            {platform.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
        <div className="rounded-xl border border-[var(--border-subtle)] bg-white/90 p-6 shadow-sm">
          <div className="mb-3 flex items-center gap-2">
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-[var(--brand-blue-soft)]/30 text-lg">
              📌
            </span>
            <h2 className="text-base font-semibold text-zinc-900">Usage guidance</h2>
          </div>
          <ul className="list-disc space-y-1 pl-5 text-sm text-zinc-700">
            <li>Always start on a demo account before trading live capital.</li>
            <li>Confirm your broker supports EAs and automated order placement.</li>
            <li>
              Understand your signal provider’s SL / TP style and latency before
              configuring automation.
            </li>
            <li>Trading involves significant risk; nothing here is financial advice.</li>
          </ul>
        </div>
      </section>

      {/* Tabs overview */}
      <section className="space-y-4">
        <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
          <div>
            <h2 className="text-xl font-semibold text-zinc-900">Tabs & workflows</h2>
            <p className="max-w-3xl text-sm text-zinc-600">
              Each tab focuses on a specific part of the trading lifecycle—from live
              execution and logs to strategy design, auditing and configuration.
            </p>
          </div>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {tabs.map((tab) => (
            <div
              key={tab.name}
              className="flex flex-col rounded-xl border border-[var(--border-subtle)] bg-white/95 p-5 shadow-sm"
            >
              <div className="mb-3 flex items-center gap-2">
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-[var(--brand-blue-soft)]/25 text-lg">
                  {tab.icon}
                </span>
                <div>
                  <h3 className="text-sm font-semibold text-zinc-900">{tab.name}</h3>
                  <p className="text-xs text-zinc-500">{tab.tagline}</p>
                </div>
              </div>
              <ul className="mt-1 space-y-1 text-xs text-zinc-600">
                {tab.bullets.map((item) => (
                  <li key={item} className="flex gap-2">
                    <span className="mt-[5px] h-1.5 w-1.5 flex-shrink-0 rounded-full bg-[var(--brand-blue-soft)]" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* QA checklist */}
      <section className="rounded-xl border border-[var(--border-subtle)] bg-white/90 p-6 shadow-sm">
        <div className="mb-3 flex items-center gap-2">
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-[var(--brand-blue-soft)]/30 text-lg">
            ✅
          </span>
          <h2 className="text-base font-semibold text-zinc-900">QA checklist starter</h2>
        </div>
        <p className="mb-3 text-sm text-zinc-600">
          Use this list when testing new installs, updates, or broker changes to ensure
          the full experience behaves as expected.
        </p>
        <ul className="list-disc space-y-1 pl-5 text-sm text-zinc-700">
          {qaChecklist.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </section>
    </div>
  );
}
