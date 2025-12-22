# Telegram Signal Copier - Competitor Feature Comparison

## Executive Summary

This document provides a comprehensive feature comparison of the top 3 Telegram to MT5 signal copier competitors: TSC (Telegram Signal Copier), TSCopier, and Telegram Copier.

---

## CORE EXECUTION FEATURES

| Feature Category | TSC (Telegram Signal Copier) | TSCopier | Telegram Copier | Your App |
|-----------------|------------------------------|----------|-----------------|----------|
| **Execution Speed** | Not specified | 70ms (claimed) | 300ms | Desktop MT5 API; low-latency but not formally benchmarked (broker/VPS dependent) |
| **AI Signal Parsing** | ✅ Yes (Vision AI + OpenAI) | ✅ Yes (NLP-based) | ✅ Yes (OCR for images) | ❌ Rules-based (regex + keywords), no AI/OpenAI |
| **Image Signal Recognition** | ✅ Yes (Vision AI) | ✅ Yes | ✅ Yes (OCR) | ❌ Not supported (text-only) |
| **Text Signal Parsing** | ✅ Any format | ✅ Any format | ✅ Any format/language | ✅ Flexible regex + keyword parsing for GOLD/XAU, BTC/ETH and FX pairs |
| **Multi-Language Support** | ✅ Yes | ✅ Yes | ✅ Yes | ✅ Works with any language via user-defined keywords (no auto-translation) |

**Your App extra in this category:** Price-range entry-wait mode with pending orders and configurable expiry per signal.

---

## PLATFORM SUPPORT

| Platform | TSC | TSCopier | Telegram Copier | Your App |
|----------|-----|----------|-----------------|----------|
| **MT4** | ✅ | ✅ | ✅ | ❌ Not supported (MT5 only) |
| **MT5** | ✅ | ✅ | ✅ | ✅ Native MT5 desktop (MetaTrader5 Python API) |
| **cTrader** | ✅ | ✅ | ✅ | ❌ Not supported |
| **DXTrade** | ✅ | ✅ | ❌ | ❌ Not supported |
| **TradeLocker** | ✅ | ✅ | ❌ | ❌ Not supported |

**Your App extra in this category:** Pure Windows desktop app (PyQt5) connecting directly to MT5 terminal—no MT4/MT5 EA deployment required.

---

## ORDER MANAGEMENT

| Feature | TSC | TSCopier | Telegram Copier | Your App |
|---------|-----|----------|-----------------|----------|
| **Multi Take-Profit** | ✅ Up to TP5 | ✅ Multiple TPs | ✅ Up to TP5 | ✅ Up to 10 trades per signal, each with its own TP (from signal or strategy) |
| **Custom SL/TP Override** | ✅ Yes | ✅ Yes | ✅ Yes | ✅ Strategy defaults plus per-signal SL/TP, with fallback SL/TP in points |
| **Pending Orders** | ✅ Yes | ✅ Yes | ✅ Yes | ✅ Price-range entry mode can place multi-TP pending orders with expiry |
| **Market Execution** | ✅ Yes | ✅ Yes | ✅ Yes | ✅ Yes (Instant Execution mode) |
| **Limit Orders** | ✅ Yes | ✅ Yes | ✅ Yes | ✅ BUY_LIMIT/SELL_LIMIT via pending orders |
| **Stop Orders** | ✅ Yes | ✅ Yes | ✅ Yes | ✅ BUY_STOP/SELL_STOP via pending orders |
| **Breakeven Automation** | ✅ Yes | ✅ Yes | ✅ Customizable | ✅ Per-strategy breakeven pips + offset |
| **Trailing Stop Loss** | ✅ Yes (SL or TP based) | ✅ Yes | ✅ Yes | ✅ Multi-level trailing SL/TP with dynamic increments |
| **Partial Close** | ✅ Yes (customizable %) | ✅ Yes | ✅ Yes | ❌ Not yet (full-position closes only) |
| **Close Half Position** | ✅ Yes | ✅ Yes | ✅ Yes | ❌ Not yet (use multi-TP instead) |
| **Auto SL to Entry** | ✅ After TP1 | ✅ Yes | ✅ After TP1 | ✅ Auto-move SL to entry ± offset via breakeven engine |

**Your App extra in this category:** Combination of multi-TP, breakeven, and multi-level trailing stop managed centrally via the BreakevenManager.

---

## RISK MANAGEMENT

| Feature | TSC | TSCopier | Telegram Copier | Your App |
|---------|-----|----------|-----------------|----------|
| **Fixed Lot Size** | ✅ Yes | ✅ Yes | ✅ Manual lots | ✅ Global fixed lot (`LOT_SIZE`) from Settings |
| **Auto Lot by Balance** | ✅ Yes | ✅ Yes | ✅ Yes | ❌ Not yet wired to UI (helpers only) |
| **Risk % per Trade** | ✅ Yes | ✅ Yes | ✅ Yes | ❌ Not yet |
| **Custom Risk Balance** | ✅ Yes (calculate from custom balance) | ❌ | ✅ Auto lots on ref capital | ❌ Not yet (uses actual account balance/equity) |
| **Pair-Specific Lot Sizing** | ✅ Yes | ✅ Yes | ✅ Custom lot per pair | ❌ Not yet |
| **Position Size Calculator** | ✅ Yes | ✅ Yes | ✅ Yes | ❌ Not yet |
| **Risk:Reward Ratio** | ✅ Yes | ❌ | ❌ | ⚠️ Calculated internally for diagnostics; not exposed in UI |
| **Spread Calculation** | ✅ Auto-adjust SL/TP | ✅ Yes | ✅ Auto spread to TP/SL | ❌ No explicit spread adjustment (uses raw price/points) |

**Your App extra in this category:** Daily P&L and risk metrics can be anchored to MT5 server midnight or local system midnight (configurable analytics timezone).

---

## PROP FIRM FEATURES ⭐ (Critical Differentiator)

| Feature | TSC | TSCopier | Telegram Copier | Your App |
|---------|-----|----------|-----------------|----------|
| **Prop Firm Mode** | ✅ Yes | ✅ Yes (Prop Version) | ✅ PropFirm Add-on | ⚠️ Daily loss/profit guardrails + No New Entries/Immediate Exit/Stop Bot; no dedicated “prop profile” toggle yet |
| **Hidden Comments** | ✅ Yes (hide provider info) | ✅ Yes | ✅ Yes | ✅ MT5 trade comments contain only strategy/magic; no provider/channel info ever sent |
| **Entry Modification (Pips)** | ✅ Yes | ✅ Yes | ✅ Add custom pips to TP/SL | ❌ Not supported yet |
| **Daily Max Loss** | ✅ Yes | ✅ Yes | ✅ Yes | ✅ Per-strategy daily loss limit (value or %) with configurable action |
| **Overall Max Loss** | ✅ Yes | ✅ Yes | ✅ Yes | ❌ Not yet (daily-based only) |
| **Profit Target** | ✅ Yes | ✅ Yes | ✅ Stop copier at target | ✅ Per-strategy daily profit target (value or %) with configurable action |
| **Auto-Close on Drawdown** | ✅ Yes | ✅ Yes | ✅ Close at % drawdown | ✅ Can auto-close all strategy positions when daily loss threshold is hit |
| **FIFO Mode** | ✅ Yes | ❌ | ❌ | ❌ Uses broker’s default (no explicit FIFO mode) |
| **Time Delay Execution** | ✅ Yes | ✅ Yes | ❌ | ⚠️ Signal Price Entry with entry-wait window (price/expiry based, not pure time delay) |
| **Limit Trades/Lots per Pair** | ✅ Yes | ✅ Yes | ✅ Yes | ❌ Not yet (per-signal `num_trades` only) |

**Your App extra in this category:** Automatic “No New Entries” mode and optional Immediate Exit/Stop Bot actions when daily loss or profit targets are hit.

---

## ADVANCED FEATURES

| Feature | TSC | TSCopier | Telegram Copier | Your App |
|---------|-----|----------|-----------------|----------|
| **Reverse Trading** | ✅ Yes (flip signals) | ✅ Yes | ❌ | ❌ Not supported |
| **Backtester** | ✅ Yes | ✅ Yes (PRO) | ✅ Yes (separate purchase) | ❌ Not built-in (uses live & MT5 history only) |
| **Signal Strategy Rules** | ✅ Per channel/pair | ✅ Per provider/pair | ✅ Per channel | ✅ Per-channel strategies with per-strategy buy/sell keyword logic |
| **AI Auto-Configuration** | ✅ Yes (AI Config) | ✅ Yes | ❌ | ❌ Manual configuration (no AI auto-setup) |
| **Keyword Filtering** | ✅ Skip unwanted signals | ✅ Yes | ✅ Ignore keywords | ✅ Direction/SL/TP extraction via AND/OR keyword logic (no negative filter yet) |
| **Symbol Mapping** | ✅ Yes (prefix/suffix) | ✅ Yes | ✅ Custom names | ✅ Asset Symbols dialog maps signal keywords (e.g. GOLD, #EURUSD) to broker symbols |
| **Order Lifecycle Tracking** | ✅ Yes | ✅ Yes | ❌ | ✅ Full signal audit DB + trade-history database |
| **Performance Dashboard** | ✅ Order Profit Chart | ✅ Analytics | ❌ | ✅ Dashboard tab with daily P&L chart, account metrics, and per-strategy stats |
| **Signal Provider Scoring** | ❌ | ❌ | ❌ | ❌ Not yet (no per-provider scorecards) |

**Your App extra in this category:** Dedicated Audit tab with per-signal parse/validate/execute status, latency, and rich detail pane, plus strategy performance panel.

---

## SIGNAL SOURCE OPTIONS

| Feature | TSC | TSCopier | Telegram Copier | Your App |
|---------|-----|----------|-----------------|----------|
| **Public Channels** | ✅ Yes | ✅ Yes | ✅ Yes | ✅ Yes (Pyrogram) |
| **Private Channels** | ✅ Yes | ✅ Yes | ✅ Yes | ✅ Yes (Telethon) |
| **Groups** | ✅ Yes | ✅ Yes | ✅ Yes | ✅ Yes (by setting `CHANNEL_ID` to group) |
| **Restricted Channels** | ✅ Bypass restrictions | ✅ Yes | ✅ Yes | ✅ Via Telethon if the user account has access (no restriction bypass) |
| **Forwarded Messages** | ✅ Optional | ✅ Yes | ✅ Yes | ✅ Yes (text parsed normally) |
| **Unlimited Channels** | ✅ Yes | ✅ Yes | ✅ Yes | ❌ Single configured channel per bot instance |
| **Multi-Account Copying** | ✅ Yes | ✅ Yes | ✅ Up to 10 accounts | ❌ One MT5 account per bot instance |

**Your App extra in this category:** Supports both Pyrogram (standard channels) and Telethon (paid/private channels) with a unified configuration flow.

---

## SIGNAL UPDATES & EDITING

| Feature | TSC | TSCopier | Telegram Copier | Your App |
|---------|-----|----------|-----------------|----------|
| **Edit Signal SL/TP** | ✅ Real-time sync | ✅ Yes | ✅ Instant updates | ⚠️ SL can be updated via SL_UPDATE text signals; TP edits not automated |
| **Close Commands** | ✅ Full/Half/Partial | ✅ Yes | ✅ All types | ❌ Close-all via dashboard UI only (no text close commands) |
| **Move SL to Entry** | ✅ Via image signals too | ✅ Yes | ✅ Yes | ✅ Auto-breakeven moves SL to entry ± offset based on profit thresholds |
| **Re-entry Commands** | ✅ Yes | ✅ Yes | ❌ | ❌ Not supported |
| **Opposite Signal Auto-Close** | ✅ Yes | ✅ Yes | ✅ Yes | ❌ Not supported |

**Your App extra in this category:** SL updates are matched to recent trades using both symbol and time-window logic to reduce mis-targeted updates.

---

## TECHNICAL FEATURES

| Feature | TSC | TSCopier | Telegram Copier | Your App |
|---------|-----|----------|-----------------|----------|
| **Desktop Application** | ✅ Windows + EA | ✅ Windows + EA | ✅ Windows + EA | ✅ Windows desktop app (PyQt5), no EA required |
| **VPS Compatible** | ✅ Yes | ✅ Yes | ✅ Yes | ✅ Yes (runs on Windows VPS) |
| **24/7 Operation** | ✅ With VPS | ✅ With VPS | ✅ With VPS | ✅ With VPS + MT5 terminal running |
| **No EA Required?** | ❌ (requires EA) | ❌ (requires EA) | ❌ (requires EA) | ✅ Yes (connects directly to MT5 terminal API) |
| **Time Filtering** | ✅ Schedule trading hours | ✅ Yes | ✅ Filter days/hours | ❌ No trading-hours filter yet |
| **Max Trades Limiter** | ✅ Yes | ✅ Yes | ✅ Per pair | ❌ No global per-pair/per-day trade limiter yet |

**Your App extra in this category:** Automatically attempts to enable MT5 “Algo Trading” via Ctrl+E hotkey and window focus—reducing setup friction for non-technical users.

---

## SUPPORT & EXTRAS

| Feature | TSC | TSCopier | Telegram Copier | Your App |
|---------|-----|----------|-----------------|----------|
| **24/7 Support** | ✅ Yes | ✅ Yes | ✅ Yes | TBD (manual support; not automated in app) |
| **AI Assistant (Chatbot)** | ❌ | ✅ "Pipster" | ❌ | ❌ Not included |
| **Free Trial** | ✅ 15-day (Eightcap) | ✅ Demo available | ❌ | ✅ Built-in 30-day trial enforced in app |
| **Telegram Support Group** | ✅ Yes | ✅ Yes | ✅ Yes | TBD (not wired into app; support handled outside the client) |
| **Video Tutorials** | ✅ Yes | ✅ Yes | ✅ Yes | ✅ Help tab pulls news + YouTube tutorial playlist from backend |
| **Updates** | ✅ Free | ✅ Free | ✅ Free | ✅ Free app updates during active license (per planned license model) |

**Your App extra in this category:** Integrated Help tab with dynamic news, promo banners, and video guides directly inside the desktop app.

---

## PRICING COMPARISON

| Plan | TSC | TSCopier | Telegram Copier | Your App |
|------|-----|----------|-----------------|----------|
| **Monthly** | $39 | ~$39 | ~$35 | $49 (planned) |
| **Lifetime (1 account)** | $200-300 | Available | ~$200 | $899 (10-year license, planned) |
| **Prop Firm Add-on** | Included? | Extra cost | Extra cost | Included in core (no separate add-on) |
| **Backtester** | Included? | PRO version | Separate purchase | ❌ Not included |

---

## ESTIMATED ACTIVE USERS

| Competitor | Estimated Active Users | Market Share |
|------------|----------------------|--------------|
| **TSC (Telegram Signal Copier)** | 2,000-5,000 | ~30-35% |
| **Telegram Copier** | 3,000-6,000 | ~35-40% |
| **TSCopier** | 1,000-2,500 | ~15-20% |
| **Others Combined** | 2,000-3,500 | ~10-15% |
| **TOTAL MARKET** | ~8,000-17,000 | 100% |

---

## WHAT WE NEED FROM YOUR APP

Please fill in the "Your App" column by providing information on:

### 1. Execution & Parsing
- [ ] Execution speed (in milliseconds)?
- [ ] AI parsing capabilities?
- [ ] Image signal support?
- [ ] Multi-language support?

### 2. Platform Support
- [ ] Which platforms beyond MT5?
- [ ] Architecture: Desktop only or Desktop + EA?

### 3. Order Types
- [ ] How many TP levels?
- [ ] Order types supported?
- [ ] Trailing stops?
- [ ] Partial closes?

### 4. Risk Management
- [ ] Lot sizing options?
- [ ] Risk % per trade?
- [ ] Spread handling?

### 5. Prop Firm Features
- [ ] Daily/overall loss limits?
- [ ] Hidden comments?
- [ ] Entry modification?
- [ ] Drawdown protection?

### 6. Advanced
- [ ] Reverse trading?
- [ ] Backtester?
- [ ] Per-channel strategies?
- [ ] Performance analytics?

### 7. Unique Features
- [ ] Anything competitors DON'T have?

### 8. Pricing
- [ ] Monthly subscription price?
- [ ] Lifetime license price?
- [ ] Free trial available?
- [ ] Refund policy?

---

## KEY COMPETITIVE INSIGHTS

### Top 3 Competitors Control 70-80% Market Share
- **Telegram Copier** (Italian company, BST GROUP): Oldest, most features (100+)
- **TSC**: Aggressive marketing, Vision AI technology
- **TSCopier**: Fast execution (70ms), AI assistant "Pipster"

### Critical Features for Success
1. **Prop Firm Support** - Huge market segment (daily loss limits, hidden comments)
2. **AI Signal Parsing** - Table stakes in 2024
3. **Execution Speed** - Advertise specific millisecond speeds
4. **Backtester** - Validates signal providers
5. **24/7 Support** - Most mentioned in reviews

### Your Potential Differentiators
- Pure desktop app (if true) - No EA configuration hassle
- Specific niche focus (prop firms, regional markets)
- Unique features competitors lack
- Superior support/onboarding experience

---

## MARKET ENTRY RECOMMENDATIONS

### Option 1: Niche Specialization
**Target:** Prop Firm Traders
- Built-in challenge passing features
- Stealth execution
- Marketing: "Pass Your Prop Firm Challenge"

### Option 2: Regional Focus
**Target:** Asian Markets
- Local broker support
- Time zone optimization
- Regional language support

### Option 3: Premium Positioning
**Target:** Professional Traders
- Ultra-fast execution
- Enterprise features
- Price: $79-99/month

### Option 4: Simplicity Leader
**Target:** Non-Technical Traders
- 5-minute setup
- 1-on-1 onboarding
- Managed setup service

---

## NEXT STEPS

1. **Fill in your app's features** in the tables above
2. **Identify 2-3 unique differentiators** that competitors lack
3. **Choose a positioning strategy** from the recommendations
4. **Update website** with clear feature comparison
5. **Add pricing transparency** - competitors show prices upfront
6. **Create demo video** showing actual software
7. **Launch strategy** for collecting first 20 reviews

---

**Document Created:** November 2024  
**Sources:** Competitor websites, Trustpilot reviews, market research  
**Status:** Awaiting your app's feature details for complete comparison