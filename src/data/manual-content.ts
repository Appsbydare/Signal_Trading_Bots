export interface ManualSection {
    category: string;
    items: {
        question: string;
        answer: string;
        tags?: string[];
    }[];
}

export const MANUAL_CONTENT: ManualSection[] = [
    {
        category: "Getting Started & Overview",
        items: [
            {
                question: "What do I need before I begin?",
                answer: "You'll need: Windows 10 or later, MetaTrader 5 installed, an MT5 demo or live account, a Telegram account on your phone, an active internet connection, and a valid license key. Setup takes 15-20 minutes for first time, and 5 minutes for subsequent starts.",
                tags: ["requirements", "getting started", "prerequisites"],
            },
            {
                question: "Should I start with a demo or live account?",
                answer: "NEVER start with a live account. Always use a demo account first and test for at least 1 week. Verify signals are detected correctly and trades execute as expected before going live.",
                tags: ["demo", "testing", "safety", "best practices"],
            },
            {
                question: "What should I have ready before setup?",
                answer: "Have your MT5 login credentials ready, your broker's server name, access to your Telegram account, and 15 minutes of uninterrupted time. Follow steps in exact order, don't skip any steps, save settings after each change, and test before going live.",
                tags: ["preparation", "setup", "checklist"],
            },
        ],
    },
    {
        category: "Installation & Onboarding",
        items: [
            {
                question: "How do I install the Signal Trading Bot?",
                answer: "Locate your installation file (TelegramTradingBot_Installer.exe), double-click it, click 'Yes' if Windows asks for permission, follow the installation wizard, choose installation location (default is fine), and wait for installation to complete. Then launch from the desktop shortcut.",
                tags: ["installation", "setup", "windows", "installer"],
            },
            {
                question: "How do I know if installation was successful?",
                answer: "After launching, the main window should open showing tabs (Dashboard, Strategies, Settings, Audit, Logs, News) with no error messages. This confirms successful installation.",
                tags: ["installation", "verification", "success"],
            },
        ],
    },
    {
        category: "MetaTrader 5 Setup",
        items: [
            {
                question: "How do I download and install MetaTrader 5?",
                answer: "Download MT5 from https://www.metatrader5.com/en/download or from your broker's website. Run mt5setup.exe, accept the license agreement, choose installation location (default: C:\\Program Files\\MetaTrader 5\\), wait 2-5 minutes, and click Finish. MT5 will launch automatically.",
                tags: ["mt5", "installation", "download", "metatrader"],
            },
            {
                question: "How do I create an MT5 demo account?",
                answer: "When MT5 launches, a 'Trade Servers' window appears (or go to File → Open an Account). Search for your broker (e.g., IC Markets, XM, FTMO), select the demo server (usually ends with '-Demo'), fill in account details (Name, Email, Phone, Account Type: Demo, Deposit: $10,000, Leverage: 1:100 or 1:500, Currency: USD), and click Next. You'll receive Login, Password, and Server name - write these down!",
                tags: ["mt5", "demo account", "setup", "broker"],
            },
            {
                question: "How do I find my MT5 installation path?",
                answer: "Method 1: Right-click MT5 desktop shortcut, select 'Open file location', copy the full path. Method 2: Open Start Menu → Find MetaTrader 5, right-click → More → Open file location, right-click the shortcut → Properties, copy the 'Target' path. Common locations: C:\\Program Files\\MetaTrader 5\\terminal64.exe or C:\\Program Files (x86)\\MetaTrader 5\\terminal64.exe",
                tags: ["mt5", "installation path", "terminal", "configuration"],
            },
            {
                question: "How do I add trading symbols in MT5?",
                answer: "Press Ctrl+M to open Market Watch, right-click in Market Watch → 'Symbols', search for symbols you'll trade (XAUUSD, XAGUSD, EURUSD, BTCUSD), select each symbol and click 'Show', click 'OK', and verify symbols appear in Market Watch with live prices.",
                tags: ["mt5", "symbols", "market watch", "trading"],
            },
            {
                question: "MT5 won't connect to the server, what should I do?",
                answer: "Check your internet connection, verify the server name is correct, try a different demo server from your broker, or disable your firewall temporarily to test.",
                tags: ["mt5", "troubleshooting", "connection", "server"],
            },
            {
                question: "How do I verify MT5 is working correctly?",
                answer: "Check these items: MT5 main window is open with charts visible, bottom right shows 'Connected' with green bars and ping time (e.g., '120 ms'), Market Watch panel shows currency pairs (Ctrl+M if not visible), and Terminal panel shows account balance (Ctrl+T if not visible).",
                tags: ["mt5", "verification", "connection", "status"],
            },
        ],
    },
    {
        category: "Telegram Configuration",
        items: [
            {
                question: "How do I get Telegram API credentials?",
                answer: "Visit https://my.telegram.org, log in with your phone number (include country code like +12025550123), check your Telegram app for verification code and enter it, enter your 2FA password if enabled, click 'API development tools', fill in the form (App title: 'Trading Bot', Short name: 'tradingbot', Platform: Desktop), and click 'Create application'. You'll receive an API ID (8-digit number) and API Hash (32-character string).",
                tags: ["telegram", "api", "credentials", "setup"],
            },
            {
                question: "How do I find my Telegram channel ID?",
                answer: "Method 1: Open https://web.telegram.org, navigate to your signal channel, look at the URL (https://web.telegram.org/k/#-1001234567890), the number after -100 is your Channel ID (1234567890). Method 2: Forward any message from your signal channel to @userinfobot, which will reply with the Channel ID.",
                tags: ["telegram", "channel id", "configuration"],
            },
            {
                question: "What format should my phone number be in?",
                answer: "Your phone number must include the country code, start with +, have no spaces or dashes, and match your Telegram account. Examples: USA: +12025550123, UK: +447700900123, India: +919876543210.",
                tags: ["telegram", "phone number", "format", "configuration"],
            },
            {
                question: "What happens during first-time Telegram setup?",
                answer: "When you start the bot: it attempts to connect to Telegram, you'll receive a verification code via Telegram, enter the code in the bot's console/terminal, if 2FA is enabled enter your password, and the session is saved for future use.",
                tags: ["telegram", "setup", "authentication", "2fa"],
            },
        ],
    },
    {
        category: "Bot Configuration",
        items: [
            {
                question: "How do I configure Telegram settings in the bot?",
                answer: "In the bot window, click the 'Settings' tab. Enter Session Name (e.g., session01), paste your API ID (from Step 2), paste your API Hash, paste your Channel ID (numbers only, no minus sign), enter your Phone Number (with + and country code like +12025550123), and optionally enter Channel Username (@yourchannelname for public channels). Then click 'SAVE SETTINGS'.",
                tags: ["configuration", "telegram", "settings"],
            },
            {
                question: "How do I configure MT5 settings in the bot?",
                answer: "In Settings tab, enter MT5 Login (your account number from MT5 → Tools → Options → Server tab), enter MT5 Server (broker's server name like ICMarketsSC-Demo, case-sensitive), click 'Browse' for MT5 Terminal Path and select terminal64.exe (usually C:\\Program Files\\MetaTrader 5\\terminal64.exe), and configure Asset Symbols by clicking 'Configure Asset Symbols' and adding mappings like GOLD → XAUUSD.",
                tags: ["configuration", "mt5", "settings", "symbols"],
            },
            {
                question: "What are Asset Symbols and why do I need them?",
                answer: "Asset Symbols map common signal names to broker-specific symbols. Different brokers use different symbol names - signals might say 'GOLD' but your broker uses 'XAUUSD'. The bot needs to know the correct symbol to trade. Common mappings: GOLD → XAUUSD, SILVER → XAGUSD, EUR/USD → EURUSD, BTC → BTCUSD.",
                tags: ["symbols", "mapping", "configuration", "mt5"],
            },
            {
                question: "What trading parameters should I configure?",
                answer: "Set Lot Size to 0.01 (start with minimum for safety!), Max Slippage to 100 points (default is fine). Auto Trading is already enabled (locked) - no action needed. Always start with minimum lot size for testing.",
                tags: ["trading", "parameters", "lot size", "safety"],
            },
        ],
    },
    {
        category: "Strategy Creation",
        items: [
            {
                question: "How do I create my first trading strategy?",
                answer: "Click the 'Strategies' tab, click 'New Strategy' button, enter name like 'My First Strategy', add optional description like 'Gold trading with instant execution', and select execution mode 'Instant Execution' (recommended for beginners).",
                tags: ["strategy", "creation", "setup"],
            },
            {
                question: "How do I configure keywords for signal detection?",
                answer: "Set up BUY and SELL logic using keywords. Example: BUY Logic: 'GOLD AND BUY', SELL Logic: 'GOLD AND SELL'. Use AND for specific matching - both keywords must be present in the signal.",
                tags: ["strategy", "keywords", "signals", "detection"],
            },
            {
                question: "How do I set Take Profit and Stop Loss?",
                answer: "In your strategy configuration, set Number of Trades to 1 (start with 1 trade per signal), Take Profit to 300 points, and Stop Loss to 600 points. NEVER trade without a Stop Loss - it protects your account from large losses. Then click 'Save' or 'Create Strategy'.",
                tags: ["strategy", "take profit", "stop loss", "risk management"],
            },
        ],
    },
    {
        category: "Running the Bot",
        items: [
            {
                question: "How do I start the bot?",
                answer: "Make sure MT5 is running and logged in (check green connection status), click the 'Start' button in the bot (usually at the top). First time only: enter Telegram verification code (check your Telegram app), enter your 2FA password if enabled, and wait for 'Connected' status messages.",
                tags: ["start", "running", "operation"],
            },
            {
                question: "How do I know the bot started successfully?",
                answer: "Look for these success indicators: Telegram connected, MT5 connected, Strategy active, and 'Monitoring channel: [Your Channel ID]' message.",
                tags: ["verification", "status", "success"],
            },
            {
                question: "How do I verify everything is working?",
                answer: "Check the Logs tab for messages like '[INFO] Bot started', '[INFO] Telegram connected', '[INFO] MT5 connected', '[INFO] Strategy loaded: My First Strategy', '[INFO] Monitoring channel: 1234567890'. When a signal arrives, verify: signal appears in Audit tab with details, trade executes in MT5 (check Terminal → Trade tab), position shows in Dashboard with current P/L, and TP/SL are set correctly in MT5.",
                tags: ["verification", "testing", "monitoring"],
            },
        ],
    },
    {
        category: "Troubleshooting",
        items: [
            {
                question: "Telegram connection failed - what should I do?",
                answer: "Check your internet connection, verify API ID and Hash are correct, ensure phone number has + and country code, or delete session file and reconnect.",
                tags: ["troubleshooting", "telegram", "connection"],
            },
            {
                question: "MT5 connection failed - how do I fix it?",
                answer: "Make sure MT5 is running, verify login number is correct, check server name matches exactly (case-sensitive), and ensure terminal path is correct.",
                tags: ["troubleshooting", "mt5", "connection"],
            },
            {
                question: "No signals are being detected - what's wrong?",
                answer: "Verify you're a member of the channel, check Channel ID is correct, ensure channel is active, and test keywords with a sample message.",
                tags: ["troubleshooting", "signals", "detection"],
            },
            {
                question: "The EA is not taking trades in MT5, what's wrong?",
                answer: "Check the 'Experts' tab in MT5 toolbox for error messages. Common issues: 'Algo Trading' is disabled (click the button in top toolbar so it turns green), symbol name in signal doesn't match broker's symbol (e.g., XAUUSD vs Gold - configure Asset Symbols), or invalid lot size.",
                tags: ["troubleshooting", "mt5", "trades", "expert advisor"],
            },
            {
                question: "How do I enable AutoTrading in MT5?",
                answer: "In MetaTrader 5, click the 'Algo Trading' button in the top toolbar so it turns green. Also go to Tools → Options → Expert Advisors and ensure 'Allow algorithmic trading' is checked.",
                tags: ["mt5", "autotrading", "expert advisor", "configuration"],
            },
        ],
    },
    {
        category: "Settings Reference - Telegram",
        items: [
            {
                question: "What is Session Name and how should I set it?",
                answer: "Session Name is a unique identifier for your Telegram session used to save your login state. Best practices: use lowercase letters and numbers, avoid spaces (use underscores), keep it simple and memorable, don't change frequently (requires re-login). Examples: session01, my_trading_session, gold_signals_bot.",
                tags: ["telegram", "session", "settings", "configuration"],
            },
            {
                question: "What is the correct format for Channel ID?",
                answer: "Channel ID should be numbers only without the minus sign. Correct: 1234567890 or 1001234567890. Wrong: -1001234567890 (don't include minus) or @channelname (use numbers, not username).",
                tags: ["telegram", "channel id", "format"],
            },
            {
                question: "When should I use Channel Username?",
                answer: "Use Channel Username for public channels with usernames as a backup to Channel ID. Format: @signalchannel or @goldtradingsignals. Skip for private channels without usernames or when only Channel ID is available.",
                tags: ["telegram", "channel username", "configuration"],
            },
        ],
    },
    {
        category: "Settings Reference - MT5",
        items: [
            {
                question: "How do I find my MT5 Login number?",
                answer: "Open MetaTrader 5, click 'Tools' → 'Options', go to 'Server' tab, and your login number is displayed there. This works for both demo and live accounts.",
                tags: ["mt5", "login", "account", "settings"],
            },
            {
                question: "What is the MT5 Server name and where do I find it?",
                answer: "The MT5 Server is your broker's server name (case-sensitive). Find it in MT5: Tools → Options → Server tab. Copy exactly as shown including dashes and special characters. Examples: ICMarketsSC-Demo, Exness-MT5Real, FTMO-Server, Alpari-MT5-Demo. It's different for demo vs live accounts.",
                tags: ["mt5", "server", "broker", "configuration"],
            },
            {
                question: "What if I can't find terminal64.exe?",
                answer: "Common locations: C:\\Program Files\\MetaTrader 5\\terminal64.exe, C:\\Program Files (x86)\\MetaTrader 5\\terminal.exe, or C:\\Program Files\\[BrokerName] MetaTrader 5\\terminal64.exe. To find manually: right-click MT5 desktop shortcut, select 'Open file location', look for terminal64.exe or terminal.exe, and copy the full path.",
                tags: ["mt5", "terminal", "installation path", "troubleshooting"],
            },
        ],
    },
    {
        category: "Subscription & Billing",
        items: [
            {
                question: "How do I upgrade my plan?",
                answer: "Log in to the web dashboard and go to the 'Subscription' page. Click 'Upgrade' on the plan you want. The pro-rated amount will be calculated automatically.",
                tags: ["subscription", "upgrade", "billing"],
            },
            {
                question: "What payment methods do you accept?",
                answer: "We accept credit cards (via Stripe) and cryptocurrency payments.",
                tags: ["payment", "billing", "crypto", "stripe"],
            },
        ],
    },
];
