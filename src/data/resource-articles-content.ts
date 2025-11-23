export type ResourceSection = {
  heading: string;
  body: string;
  bullets?: string[];
};

type ResourceContent = {
  intro: string;
  sections: ResourceSection[];
  conclusion: string;
};

export const resourceArticlesContent: Record<string, ResourceContent> = {
  "telegram-to-mt5-guide": {
    intro:
      "This guide walks through everything you need to turn Telegram messages into MT5 orders with zero guesswork. Use it as a practical checklist for onboarding clients or documenting your own trading stack so nothing is left unclear.",
    sections: [
      {
        heading: "1. What you need before automating",
        body:
          "The entire flow can run on a Windows desktop or VPS. Before installing, gather the following so the setup stays under 30 minutes.",
        bullets: [
          "Telegram account with access to the signal channels or groups you want to copy.",
          "Windows 10/11 PC or VPS with MetaTrader 5 installed and a broker login that allows Expert Advisors.",
          "SignalTradingBots desktop installer + license key (demo period works).",
          "Strategy brief: default lot size, acceptable slippage, how many take-profit levels, and maximum daily loss.",
        ],
      },
      {
        heading: "2. Map your signal formats",
        body:
          "Signals are rarely identical. Inside the strategy editor, define keywords for direction, entries, stop loss and take profit so the parser knows exactly what to read.",
        bullets: [
          "Create one strategy per Telegram channel; enable Pyrogram or Telethon depending on whether the channel is public or private.",
          "Use AND / OR keyword logic. Example: BUY keywords might include “buy”, “long”, “call”.",
          "Add symbol aliases so GOLD, XAUUSD and #XAU all map to the same MT5 instrument.",
          "Specify fallback SL/TP values (in points) in case a signal omits them.",
        ],
      },
      {
        heading: "3. Configure entries and order management",
        body:
          "SignalTradingBots supports both instant execution and price-range pending orders. Mix and match them per strategy.",
        bullets: [
          "Instant execution: fire the order immediately using the parsed entry price or the current market price.",
          "Price-range mode: wait for price to reach a specified zone, place up to 10 trades with independent TP ladders, and expire the order if price never arrives.",
          "BreakevenManager: define when SL should snap to entry (e.g., after TP1 or once price moves 20 pips).",
          "Trailing take-profit: set multiple trailing increments to lock in profits without babysitting MT5.",
        ],
      },
      {
        heading: "4. Risk guardrails you should enable",
        body:
          "Automation is only as good as its fail-safes. Enable the risk managers before going live.",
        bullets: [
          "Daily loss guardrail: specify a currency or percentage threshold; choose actions such as “No New Entries”, “Close all positions”, or “Stop bot”.",
          "Daily profit target: lock in a green day by stopping new entries after you hit your goal.",
          "Magic-number segregation: each strategy uses its own magic so MT5 reporting stays transparent.",
          "Audit log: verify every signal’s parse status and execution latency for post-trade reviews.",
        ],
      },
      {
        heading: "5. Launch checklist",
        body:
          "Follow this order each time you deploy to a new VPS or broker so nothing is missed.",
        bullets: [
          "Install SignalTradingBots, log in, and confirm the Telegram session connects.",
          "Open MT5, log into the trading account, and keep Algo Trading enabled (the app can toggle it, but double-check).",
          "Run the copier on a demo account for at least a week; compare MT5 history with the Audit tab.",
          "Once live, keep the VPS monitored. If MT5 closes, the bot pauses immediately to prevent unmanaged trades.",
        ],
      },
    ],
    conclusion:
      "Automating Telegram signals is a process, not a magic switch. Documenting your parsing rules and risk guardrails up front means you can scale to additional channels or clients without re-learning the same lessons. When you are ready to move beyond demo, reach out and we’ll review your configuration together and suggest tweaks based on real trade history.",
  },
  "prop-firm-copier": {
    intro:
      "Funded accounts change the rules. This playbook shows how to configure SignalTradingBots so prop firm challenges respect their drawdown, stealth, and execution constraints, without adding extra complexity to your day-to-day trading.",
    sections: [
      {
        heading: "1. Know the limits before copying",
        body:
          "Every prop firm communicates daily loss, overall loss, and consistency rules differently. Build them into your strategy notes before automation.",
        bullets: [
          "List the daily absolute loss and overall trailing loss thresholds for each firm.",
          "Confirm whether comments, magic numbers, or lot spikes trigger compliance checks.",
          "Record market open/close restrictions (e.g., no trading 5 minutes before news).",
        ],
      },
      {
        heading: "2. Configure daily guardrails per strategy",
        body:
          "Each SignalTradingBots strategy can enforce daily profit/loss values or percentages with automatic actions.",
        bullets: [
          "Set daily loss to the firm’s limit minus a personal safety buffer.",
          "Choose the action “No New Entries + Stop Bot” for hard stops, or “Immediate Exit” if you must flatten instantly.",
          "Mirror the same logic for daily profit to lock in targets and avoid giving gains back.",
        ],
      },
      {
        heading: "3. Keep trades discreet",
        body:
          "Prop firms look for copier footprints. Use the following features to stay under the radar.",
        bullets: [
          "Trade comments contain only strategy names/magic numbers, never Telegram channel titles.",
          "Stagger entries with price-range mode so fills don’t appear in perfect sync across accounts.",
          "Use VPS locations close to the prop broker to keep latency stable and avoid rejected orders.",
        ],
      },
      {
        heading: "4. Handle partial closes without breaking rules",
        body:
          "Some firms dislike manual partial closes. Instead, use multiple positions so exits are rule-based.",
        bullets: [
          "Define up to 10 trades per signal, each with its own TP percentage. This mirrors partial exits without manual intervention.",
          "Enable BreakevenManager so once TP1 hits, the remaining positions are protected.",
        ],
      },
      {
        heading: "5. Audit everything",
        body:
          "If a reviewer ever questions your trades, the Audit tab and Logs tab are your receipts.",
        bullets: [
          "Export audit rows showing the raw Telegram message, parsed payload, and execution timestamp.",
          "Use the dashboard’s per-strategy stats to prove consistency across trading days.",
        ],
      },
    ],
    conclusion:
      "Prop firm challenges reward discipline. With the right guardrails enabled and a clear audit trail, automation becomes an ally instead of a liability. Start on demo, replicate your prop firm rules in the strategy editor, and refine settings as you gather data so you are ready when the next challenge window opens.",
  },
  "vps-for-mt5-automation": {
    intro:
      "A stable VPS is just as important as the copier itself. Here’s how to choose, configure, and monitor one for 24/7 MT5 automation without constantly logging in to check on things.",
    sections: [
      {
        heading: "1. VPS specs that actually matter",
        body: "Focus on stability over raw CPU numbers.",
        bullets: [
          "2 vCPU / 4 GB RAM is a practical minimum for MT5 + SignalTradingBots.",
          "Windows Server 2019/2022 or Windows 11 Pro licenses keep updates supported.",
          "SSD storage + 1 Gbps network gives MT5 enough headroom for history files.",
        ],
      },
      {
        heading: "2. Latency and location",
        body:
          "Execution speed depends on the round trip between VPS and broker servers.",
        bullets: [
          "Pick a VPS region close to your broker’s MT5 server (e.g., New York for most US brokers, London for EU).",
          "Run ping tests from the VPS to the broker’s server IP to confirm sub-100ms latency.",
        ],
      },
      {
        heading: "3. Keep the VPS healthy",
        body:
          "Downtime is the enemy of automation. Set up monitoring from day one.",
        bullets: [
          "Enable automatic restarts during off-hours so Windows updates don’t pop up mid-session.",
          "Use a watchdog service or third-party monitor to alert you if MT5 or the VPS goes offline.",
          "Disable unnecessary animations and background apps to save CPU cycles.",
        ],
      },
      {
        heading: "4. Secure access",
        body:
          "Remember: your broker login and Telegram session run here. Keep attackers out.",
        bullets: [
          "Change the default VPS administrator password immediately and enable 2FA where possible.",
          "Whitelist your own IPs for RDP access or use a VPN tunnel.",
          "Store broker credentials inside SignalTradingBots encrypted config rather than plain text files.",
        ],
      },
      {
        heading: "5. Launch checklist",
        body:
          "Before letting the copier run unattended, confirm these steps:",
        bullets: [
          "MT5 logged in, Algo Trading enabled, all necessary symbols in the Market Watch.",
          "SignalTradingBots running with the intended strategies enabled.",
          "UPS or provider-level power redundancy confirmed (most reputable VPS hosts advertise this).",
          "Monitoring alerts tested (disconnect the RDP session to ensure MT5 keeps running).",
        ],
      },
    ],
    conclusion:
      "Treat the VPS like mission-critical infrastructure. A stable, well-monitored environment means every Telegram message can translate into an MT5 order without manual babysitting, and issues are caught before they impact live trades.",
  },
};


