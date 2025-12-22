export const specsData = {
    title: "Mini Bot V13.1 – Feature Specification",
    description: "This page summarises what the desktop bot offers from a user experience point of view: which tabs exist, what they show, and how they work together with MT5 and Telegram. It avoids implementation details while giving enough depth for demos, documentation, or QA.",
    platformDetails: [
        "Windows 10/11 (64‑bit).",
        "Designed for MetaTrader 5 terminals that allow Expert Advisors (EAs).",
        "Best experience on a Windows VPS for 24/7 uptime.",
    ],
    usageGuidance: [
        "Always start on a demo account before trading live capital.",
        "Confirm your broker supports EAs and automated order placement.",
        "Understand your signal provider's SL / TP style and latency before configuring automation.",
        "Trading involves significant risk; nothing here is financial advice.",
    ],
    tabs: [
        {
            icon: "📊",
            name: "Dashboard",
            tagline: "Live view of performance and open risk.",
            bullets: [
                "Daily profit chart with date filters and profit vs. cumulative views.",
                "Account equity, balance, margin level, and free margin at a glance.",
                "Today's P&L with clear gain/loss colouring and timezone label.",
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
    ],
    qaChecklist: [
        "Confirm Start / Stop behaviour, status banner and clock updates.",
        "Match Dashboard P&L against MT5 for both server and system timezone modes.",
        "Trigger sample Info / Warning / Error logs and verify filters respond instantly.",
        "Save, duplicate and adjust a strategy; confirm the Audit tab reflects new behaviour.",
        "Change MT5 path and timezones in Settings, restart, and verify persistence.",
    ],
};

