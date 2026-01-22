"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";

export default function UserManualPage() {
    const [activeTab, setActiveTab] = useState<"video" | "quickstart" | "settings" | "strategy">("video");
    const [activeSection, setActiveSection] = useState<string>("");

    useEffect(() => {
        const handleScroll = () => {
            const sections = document.querySelectorAll("[data-section]");
            let current = "";

            sections.forEach((section) => {
                const rect = section.getBoundingClientRect();
                if (rect.top <= 150 && rect.bottom >= 150) {
                    current = section.getAttribute("data-section") || "";
                }
            });

            if (current) setActiveSection(current);
        };

        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const scrollToSection = (id: string) => {
        const element = document.getElementById(id);
        if (element) {
            const offset = 120;
            const elementPosition = element.getBoundingClientRect().top;
            const offsetPosition = elementPosition + window.scrollY - offset;
            window.scrollTo({ top: offsetPosition, behavior: "smooth" });
        }
    };

    return (
        <div className="min-h-screen bg-[var(--background)]">
            {/* Hero Section */}
            <section className="relative py-16 overflow-hidden">
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-[120px]" />
                <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-blue-500/20 rounded-full blur-[100px]" />

                <div className="relative z-10 max-w-7xl mx-auto px-6 text-center">
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-white via-white to-white/60 bg-clip-text text-transparent mb-4"
                    >
                        Signal Trading Bot
                        <br />
                        <span className="text-[#5e17eb]">User Manual</span>
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-lg text-zinc-400 max-w-2xl mx-auto"
                    >
                        Complete guide to setting up and using your automated trading bot
                    </motion.p>
                </div>
            </section>

            {/* Main Content with Sidebar Navigation */}
            <div className="max-w-7xl mx-auto px-6 py-12">
                <div className="grid lg:grid-cols-[320px_1fr] gap-8">
                    {/* Left Sidebar - Manual Navigation */}
                    <aside className="lg:block">
                        <div className="sticky top-8 space-y-3">
                            {/* Manual Tabs */}
                            <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6">
                                <h3 className="text-sm font-semibold text-white mb-4 uppercase tracking-wider">
                                    Documentation
                                </h3>
                                <nav className="space-y-2">
                                    {[
                                        { id: "video", label: "Video Tutorials", icon: "🎬", desc: "Watch step-by-step guides" },
                                        { id: "quickstart", label: "Quick Start Guide", icon: "🚀", desc: "Get started in 15 minutes" },
                                        { id: "settings", label: "Settings Manual", icon: "⚙️", desc: "Configure your bot" },
                                        { id: "strategy", label: "Strategy Manual", icon: "📊", desc: "Create trading strategies" },
                                    ].map((tab) => (
                                        <button
                                            key={tab.id}
                                            onClick={() => {
                                                setActiveTab(tab.id as any);
                                                window.scrollTo({ top: 0, behavior: "smooth" });
                                            }}
                                            className={`w-full text-left px-4 py-3 rounded-lg transition-all ${activeTab === tab.id
                                                ? "bg-[#5e17eb] text-white shadow-lg shadow-[#5e17eb]/30"
                                                : "bg-white/5 text-zinc-400 hover:bg-white/10 hover:text-white"
                                                }`}
                                        >
                                            <div className="flex items-start gap-3">
                                                <span className="text-2xl">{tab.icon}</span>
                                                <div className="flex-1">
                                                    <div className="font-semibold">{tab.label}</div>
                                                    <div className={`text-xs mt-0.5 ${activeTab === tab.id ? "text-white/70" : "text-zinc-500"}`}>
                                                        {tab.desc}
                                                    </div>
                                                </div>
                                            </div>
                                        </button>
                                    ))}
                                </nav>
                            </div>

                            {/* Table of Contents */}
                            <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6">
                                <h3 className="text-sm font-semibold text-white mb-4 uppercase tracking-wider">
                                    On This Page
                                </h3>
                                <TableOfContents
                                    activeTab={activeTab}
                                    activeSection={activeSection}
                                    scrollToSection={scrollToSection}
                                />
                            </div>
                        </div>
                    </aside>

                    {/* Content Area */}
                    <main className="space-y-8">
                        {activeTab === "video" && <VideoTutorialsContent />}
                        {activeTab === "quickstart" && <QuickStartContent scrollToSection={scrollToSection} />}
                        {activeTab === "settings" && <SettingsContent scrollToSection={scrollToSection} />}
                        {activeTab === "strategy" && <StrategyContent scrollToSection={scrollToSection} />}
                    </main>
                </div>
            </div>
        </div>
    );
}

function TableOfContents({ activeTab, activeSection, scrollToSection }: {
    activeTab: "video" | "quickstart" | "settings" | "strategy";
    activeSection: string;
    scrollToSection: (id: string) => void;
}) {
    const sections = {
        video: [
            { id: "full-guide", title: "Complete Setup Guide", icon: "📺" },
            { id: "telegram-setup", title: "Telegram Integration", icon: "📱" },
            { id: "mt5-connection", title: "MT5 Linkage", icon: "💹" },
        ],
        quickstart: [
            { id: "before-begin", title: "Before You Begin", icon: "✅" },
            { id: "installation", title: "Installation", icon: "📥" },
            { id: "install-mt5", title: "Install MT5", icon: "💹" },
            { id: "telegram-creds", title: "Telegram Credentials", icon: "📱" },
            { id: "configure-settings", title: "Configure Settings", icon: "⚙️" },
            { id: "create-strategy", title: "Create Strategy", icon: "🎯" },
            { id: "start-bot", title: "Start the Bot", icon: "▶️" },
            { id: "verify", title: "Verify & Test", icon: "✅" },
            { id: "troubleshooting", title: "Troubleshooting", icon: "🔧" },
        ],
        settings: [
            { id: "telegram-settings", title: "Telegram Settings", icon: "📱" },
            { id: "mt5-settings", title: "MetaTrader 5", icon: "💹" },
            { id: "trading-params", title: "Trading Parameters", icon: "⚙️" },
            { id: "timezone", title: "Time Zone Settings", icon: "🕐" },
            { id: "licensing", title: "Licensing", icon: "📄" },
            { id: "import-export", title: "Import & Export", icon: "📤" },
        ],
        strategy: [
            { id: "execution-modes", title: "Execution Modes", icon: "📍" },
            { id: "creating-strategy", title: "Creating Strategy", icon: "🎯" },
            { id: "configuration", title: "Configuration", icon: "⚙️" },
            { id: "advanced-features", title: "Advanced Features", icon: "🚀" },
            { id: "best-practices", title: "Best Practices", icon: "✅" },
        ],
    };

    return (
        <nav className="max-h-[calc(100vh-300px)] overflow-y-auto space-y-1 pr-2 custom-scrollbar">
            {sections[activeTab].map((section) => (
                <button
                    key={section.id}
                    onClick={() => scrollToSection(section.id)}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all flex items-center gap-2 ${activeSection === section.id
                        ? "bg-[#5e17eb]/20 text-[#5e17eb] border-l-2 border-[#5e17eb]"
                        : "text-zinc-400 hover:text-white hover:bg-white/5"
                        }`}
                >
                    <span>{section.icon}</span>
                    <span>{section.title}</span>
                </button>
            ))}
            <style jsx>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 6px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: rgba(255, 255, 255, 0.05);
                    border-radius: 10px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: linear-gradient(180deg, #5e17eb 0%, #8b5cf6 100%);
                    border-radius: 10px;
                    transition: all 0.3s ease;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: linear-gradient(180deg, #7c3aed 0%, #a78bfa 100%);
                    width: 8px;
                }
                .custom-scrollbar {
                    scrollbar-width: thin;
                    scrollbar-color: #5e17eb rgba(255, 255, 255, 0.05);
                }
            `}</style>
        </nav>
    );
}

// Link Button Component for external links
function LinkButton({ href, children }: { href: string; children: React.ReactNode }) {
    return (
        <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#5e17eb] to-[#7c3aed] text-white rounded-lg hover:from-[#7c3aed] hover:to-[#5e17eb] transition-all duration-300 text-sm font-medium shadow-lg hover:shadow-xl hover:scale-105"
        >
            {children}
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
        </a>
    );
}

// Video Tutorial Content Component
function VideoTutorialsContent() {
    return (
        <div className="space-y-8">
            <div className="bg-gradient-to-r from-[#5e17eb]/10 to-purple-500/10 border border-[#5e17eb]/20 rounded-lg p-6">
                <h2 className="text-2xl font-bold text-white mb-2">🎬 Video Tutorials</h2>
                <p className="text-zinc-300">
                    Watch our step-by-step guides to master the Signal Trading Bot. Follow along as we demonstrate setup and features.
                </p>
            </div>

            <Section id="full-guide" title="Complete Setup Guide" icon="📹">
                <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
                    <div className="aspect-video w-full">
                        <iframe
                            className="w-full h-full"
                            src="https://www.youtube.com/embed/Rfy0Jy7m2ak"
                            title="Signal Trading Bot - Complete Setup Tutorial"
                            frameBorder="0"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                            allowFullScreen
                        ></iframe>
                    </div>
                </div>
                <div className="mt-6 space-y-4">
                    <SubSection title="📺 What's Covered in This Video:">
                        <CheckList>
                            <CheckItem>Software Installation & First Run</CheckItem>
                            <CheckItem>Telegram API Credentials Generation</CheckItem>
                            <CheckItem>MetaTrader 5 Installation & Account Linkage</CheckItem>
                            <CheckItem>Creating and Testing Your First Strategy</CheckItem>
                            <CheckItem>Interpreting Logs and Audit History</CheckItem>
                        </CheckList>
                    </SubSection>
                </div>
            </Section>

            <Section id="telegram-setup" title="Telegram Integration" icon="🗺️">
                <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
                    <p className="text-zinc-400 mb-4 text-sm leading-relaxed">
                        Learn how to correctly map symbols and keywords from your signal channels to the bot for 100% accuracy.
                    </p>
                    <div className="aspect-video rounded-xl overflow-hidden bg-zinc-900 flex items-center justify-center text-zinc-500">
                        <span className="text-sm italic">Additional Telegram tutorial video coming soon...</span>
                    </div>
                </div>
            </Section>
        </div>
    );
}

// Content Components
function QuickStartContent({ scrollToSection }: any) {
    return (
        <div className="space-y-8">
            <div className="bg-gradient-to-r from-[#5e17eb]/10 to-purple-500/10 border border-[#5e17eb]/20 rounded-lg p-6">
                <h2 className="text-2xl font-bold text-white mb-2">🚀 Get Trading in 15 Minutes!</h2>
                <p className="text-zinc-300">
                    Welcome to the Signal Trading Bot! This guide will take you from installation to your first automated trade in just 15 minutes.
                </p>
            </div>

            <Section id="before-begin" title="Before You Begin" icon="📋">
                <SubSection title="✅ What You'll Need">
                    <div className="grid md:grid-cols-2 gap-4 mb-4">
                        <div className="bg-white/5 rounded-lg p-4">
                            <p className="text-sm font-semibold text-white mb-3">Required:</p>
                            <CheckList>
                                <CheckItem>Windows computer (Windows 10 or later)</CheckItem>
                                <CheckItem>MetaTrader 5 installed</CheckItem>
                                <CheckItem>MT5 demo or live account</CheckItem>
                                <CheckItem>Telegram account on your phone</CheckItem>
                                <CheckItem>Active internet connection</CheckItem>
                                <CheckItem>Valid license key</CheckItem>
                            </CheckList>
                        </div>
                        <div className="bg-white/5 rounded-lg p-4">
                            <p className="text-sm font-semibold text-white mb-3">Time & Skill:</p>
                            <ul className="list-disc list-inside text-sm text-zinc-400 space-y-1">
                                <li>⏱️ 15-20 minutes for complete setup</li>
                                <li>⏱️ 5 minutes for subsequent starts</li>
                                <li>👤 Beginner-friendly</li>
                                <li>📖 No coding required</li>
                                <li>🎯 Step-by-step instructions</li>
                            </ul>
                        </div>
                    </div>
                </SubSection>

                <SubSection title="⚠️ Important First Steps">
                    <div className="space-y-4">
                        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
                            <p className="text-sm font-semibold text-red-400 mb-2">1. Use Demo Account First</p>
                            <ul className="list-disc list-inside text-xs text-zinc-400 space-y-1">
                                <li>NEVER start with a live account</li>
                                <li>Test everything on demo for at least 1 week</li>
                                <li>Verify signals are detected correctly</li>
                                <li>Confirm trades execute as expected</li>
                            </ul>
                        </div>

                        <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
                            <p className="text-sm font-semibold text-blue-400 mb-2">2. Have These Ready</p>
                            <ul className="list-disc list-inside text-xs text-zinc-400 space-y-1">
                                <li>Your MT5 login credentials</li>
                                <li>Your broker's server name</li>
                                <li>Access to your Telegram account</li>
                                <li>15 minutes of uninterrupted time</li>
                            </ul>
                        </div>

                        <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4">
                            <p className="text-sm font-semibold text-green-400 mb-2">3. Read This First</p>
                            <ul className="list-disc list-inside text-xs text-zinc-400 space-y-1">
                                <li>Follow steps in exact order</li>
                                <li>Don't skip any steps</li>
                                <li>Save settings after each change</li>
                                <li>Test before going live</li>
                            </ul>
                        </div>
                    </div>
                </SubSection>
            </Section>

            <Section id="installation" title="Step 1: Installation" icon="📥">
                <SubSection title="Download and Install">
                    <StepList>
                        <Step num={1}>Locate your installation file: <Code>TelegramTradingBot_Installer.exe</Code></Step>
                        <Step num={2}>Double-click the .exe file</Step>
                        <Step num={3}>If Windows asks "Do you want to allow this app?", click <strong>Yes</strong></Step>
                        <Step num={4}>Follow the installation wizard</Step>
                        <Step num={5}>Choose installation location (default is fine)</Step>
                        <Step num={6}>Wait for installation to complete</Step>
                    </StepList>
                </SubSection>

                <SubSection title="Launch the Application">
                    <p className="text-sm text-zinc-400 mb-3">Find the desktop shortcut or navigate to installation folder and double-click to launch.</p>
                    <Alert type="success">
                        <strong>✅ Success Check:</strong> Main window opens, you see tabs (Dashboard, Strategies, Settings, Audit, Logs, News), no error messages appear.
                    </Alert>
                </SubSection>
            </Section>

            <Section id="install-mt5" title="Step 1.5: Install MetaTrader 5" icon="💹">
                <p className="text-zinc-300 mb-6">
                    The Signal Trading Bot connects to MetaTrader 5 to execute trades automatically. MT5 must be installed and running for the bot to work.
                </p>

                <SubSection title="Download MetaTrader 5">
                    <div className="space-y-4">
                        <div>
                            <p className="text-sm font-semibold text-white mb-3">Option 1: Official Website (Recommended)</p>
                            <div className="flex items-center gap-3 mb-2">
                                <LinkButton href="https://www.metatrader5.com/en/download">
                                    Download MT5 Official
                                </LinkButton>
                            </div>
                            <StepList>
                                <Step num={1}>Click the button above to visit the official MT5 website</Step>
                                <Step num={2}>Click "Download MetaTrader 5" for Windows</Step>
                                <Step num={3}>Save the installer file: <Code>mt5setup.exe</Code></Step>
                            </StepList>
                        </div>

                        <div>
                            <p className="text-sm font-semibold text-white mb-2">Option 2: From Your Broker</p>
                            <p className="text-xs text-zinc-400">Visit your broker's website, look for "Trading Platforms" or "Downloads", and download their MT5 installer (may include broker-specific settings).</p>
                        </div>
                    </div>
                </SubSection>

                <SubSection title="Install MetaTrader 5">
                    <StepList>
                        <Step num={1}>Double-click <Code>mt5setup.exe</Code> and click Yes if prompted</Step>
                        <Step num={2}>Accept the license agreement</Step>
                        <Step num={3}>Choose installation location (default: <Code>C:\Program Files\MetaTrader 5\</Code>)</Step>
                        <Step num={4}>Wait 2-5 minutes for installation to complete</Step>
                        <Step num={5}>Click Finish - MT5 will launch automatically</Step>
                    </StepList>
                </SubSection>

                <SubSection title="Create Demo Account">
                    <Alert type="warning">
                        <strong>IMPORTANT:</strong> Always start with a demo account!
                    </Alert>

                    <div className="mt-4">
                        <p className="text-sm text-zinc-300 mb-3">When MT5 launches for the first time:</p>
                        <StepList>
                            <Step num={1}>A "Trade Servers" window appears automatically (if not: File → Open an Account)</Step>
                            <Step num={2}>Search for your broker (e.g., "IC Markets", "XM", "FTMO")</Step>
                            <Step num={3}>Select the demo server (usually ends with "-Demo")</Step>
                            <Step num={4}>Fill in account details:
                                <ul className="list-disc list-inside ml-4 mt-2 text-sm space-y-1">
                                    <li>Name, Email, Phone</li>
                                    <li>Account Type: Demo</li>
                                    <li>Deposit: $10,000 (recommended)</li>
                                    <li>Leverage: 1:100 or 1:500</li>
                                    <li>Currency: USD</li>
                                </ul>
                            </Step>
                            <Step num={5}>Click Next and wait for account creation</Step>
                        </StepList>
                    </div>

                    <CodeBlock>
                        {`You'll receive:
Login: 12345678
Password: YourPassword123
Server: ICMarketsSC-Demo`}
                    </CodeBlock>

                    <Alert type="warning">
                        <strong>CRITICAL:</strong> Write down your Login, Password, and Server name. You'll need them for bot configuration!
                    </Alert>
                </SubSection>

                <SubSection title="Verify MT5 Installation">
                    <p className="text-sm text-zinc-300 mb-3">Check these items:</p>
                    <CheckList>
                        <CheckItem>MT5 main window is open with charts visible</CheckItem>
                        <CheckItem>Bottom right shows "Connected" with green bars and ping time (e.g., "120 ms")</CheckItem>
                        <CheckItem>Market Watch panel shows currency pairs (Ctrl+M if not visible)</CheckItem>
                        <CheckItem>Terminal panel shows account balance (Ctrl+T if not visible)</CheckItem>
                    </CheckList>
                </SubSection>

                <SubSection title="Find MT5 Installation Path">
                    <p className="text-zinc-300 mb-4">
                        You'll need this path for bot configuration:
                    </p>

                    <div className="space-y-3 mb-4">
                        <div>
                            <p className="text-sm font-semibold text-white mb-2">Method 1: From Desktop Shortcut</p>
                            <ol className="list-decimal list-inside text-xs text-zinc-400 space-y-1">
                                <li>Right-click MT5 desktop shortcut</li>
                                <li>Select "Open file location"</li>
                                <li>Copy the full path</li>
                            </ol>
                        </div>
                        <div>
                            <p className="text-sm font-semibold text-white mb-2">Method 2: From Start Menu</p>
                            <ol className="list-decimal list-inside text-xs text-zinc-400 space-y-1">
                                <li>Open Start Menu → Find MetaTrader 5</li>
                                <li>Right-click → More → Open file location</li>
                                <li>Right-click the shortcut → Properties</li>
                                <li>Copy the "Target" path</li>
                            </ol>
                        </div>
                    </div>

                    <CodeBlock>
                        {`Common locations:
C:\\Program Files\\MetaTrader 5\\terminal64.exe
C:\\Program Files (x86)\\MetaTrader 5\\terminal64.exe
C:\\Users\\[YourName]\\AppData\\Roaming\\MetaQuotes\\Terminal\\[BrokerName]\\terminal64.exe`}
                    </CodeBlock>

                    <Alert type="info">
                        <strong>💡 Save this path</strong> - you'll need it in Step 3!
                    </Alert>
                </SubSection>

                <SubSection title="Add Trading Symbols">
                    <StepList>
                        <Step num={1}>Press Ctrl+M to open Market Watch</Step>
                        <Step num={2}>Right-click in Market Watch → "Symbols"</Step>
                        <Step num={3}>Search for symbols you'll trade (XAUUSD, XAGUSD, EURUSD, BTCUSD)</Step>
                        <Step num={4}>Select each symbol and click "Show"</Step>
                        <Step num={5}>Click "OK"</Step>
                        <Step num={6}>Verify symbols appear in Market Watch with live prices</Step>
                    </StepList>
                </SubSection>

                <SubSection title="🔧 MT5 Troubleshooting">
                    <TroubleshootingItem
                        issue="Cannot connect to server"
                        solutions={[
                            "Check your internet connection",
                            "Verify server name is correct",
                            "Try a different demo server from your broker",
                            "Disable firewall temporarily"
                        ]}
                    />

                    <TroubleshootingItem
                        issue="Invalid account"
                        solutions={[
                            "Re-create demo account",
                            "Check login and password are correct",
                            "Ensure you're using the correct server"
                        ]}
                    />

                    <TroubleshootingItem
                        issue="No trading symbols visible"
                        solutions={[
                            "Open Market Watch (Ctrl+M)",
                            "Right-click → Symbols",
                            "Enable 'Show All' or search for specific symbols"
                        ]}
                    />
                </SubSection>

                <Alert type="success">
                    <strong>MT5 Installation Complete!</strong> Verify all items before proceeding:
                    <ul className="list-disc list-inside mt-2 space-y-1">
                        <li>MT5 installed and shows "Connected" status</li>
                        <li>Demo account created with credentials saved</li>
                        <li>Market Watch shows trading symbols</li>
                        <li>You know your MT5 installation path</li>
                    </ul>
                </Alert>

                <Alert type="info">
                    <strong>📝 Important MT5 Notes:</strong>
                    <ul className="list-disc list-inside mt-2 space-y-1">
                        <li><strong>Keep MT5 Running:</strong> The bot needs MT5 to be open and logged in</li>
                        <li><strong>Demo vs Live:</strong> ALWAYS test on demo first (minimum 1-2 weeks)</li>
                        <li><strong>Updates:</strong> MT5 updates automatically - don't interrupt updates</li>
                    </ul>
                </Alert>
            </Section>

            <Section id="telegram-creds" title="Step 2: Get Telegram Credentials" icon="📱">
                <p className="text-zinc-300 mb-6">
                    The bot needs official API credentials to connect to Telegram and read signals from your channels.
                </p>

                <SubSection title="Create Telegram API Credentials">
                    <div className="mb-4">
                        <LinkButton href="https://my.telegram.org">
                            Visit Telegram API Portal
                        </LinkButton>
                    </div>

                    <StepList>
                        <Step num={1}>Click the button above to visit https://my.telegram.org</Step>
                        <Step num={2}>Log in with your phone number (include country code, e.g., +12025550123)</Step>
                        <Step num={3}>Check your Telegram app for verification code and enter it</Step>
                        <Step num={4}>If you have 2FA enabled, enter your password</Step>
                        <Step num={5}>Click <strong>"API development tools"</strong></Step>
                        <Step num={6}>Fill in the form:
                            <ul className="list-disc list-inside ml-4 mt-2 text-sm space-y-1">
                                <li>App title: "Trading Bot" (or any name)</li>
                                <li>Short name: "tradingbot"</li>
                                <li>Platform: Desktop</li>
                                <li>Description: "Automated trading bot" (optional)</li>
                            </ul>
                        </Step>
                        <Step num={7}>Click <strong>"Create application"</strong></Step>
                    </StepList>
                </SubSection>

                <SubSection title="Save Your Credentials">
                    <p className="text-sm text-zinc-300 mb-3">You'll now see two important values:</p>

                    <CodeBlock>
                        {`API ID: 12345678 (a number)
API Hash: 1a2b3c4d5e6f7g8h9i0j1k2l3m4n5o6p (long string)`}
                    </CodeBlock>

                    <Alert type="warning">
                        <strong>⚠️ IMPORTANT:</strong> Keep these credentials private. Don't share with anyone or post publicly. You'll need them in Step 3.
                    </Alert>
                </SubSection>

                <SubSection title="Find Your Signal Channel ID">
                    <div className="space-y-4">
                        <div>
                            <p className="text-sm font-semibold text-white mb-2">Method 1: Using Telegram Web</p>
                            <div className="mb-3">
                                <LinkButton href="https://web.telegram.org">
                                    Open Telegram Web
                                </LinkButton>
                            </div>
                            <ol className="list-decimal list-inside text-xs text-zinc-400 space-y-1">
                                <li>Click the button above to open Telegram Web</li>
                                <li>Log in with your account</li>
                                <li>Navigate to your signal channel</li>
                                <li>Look at the URL: https://web.telegram.org/k/#-1001234567890</li>
                                <li>The number after -100 is your Channel ID: 1234567890</li>
                            </ol>
                        </div>

                        <div>
                            <p className="text-sm font-semibold text-white mb-2">Method 2: Using a Bot</p>
                            <p className="text-xs text-zinc-400">Forward any message from your signal channel to @userinfobot. The bot will reply with channel information including the Channel ID.</p>
                        </div>
                    </div>

                    <CodeBlock>
                        {`Save this:
Channel ID: 1234567890 (numbers only, no minus sign)`}
                    </CodeBlock>
                </SubSection>

                <Alert type="success">
                    <strong>✅ Credentials Checklist:</strong> Before moving to Step 3, make sure you have:
                    <ul className="list-disc list-inside mt-2 space-y-1">
                        <li>API ID (8-digit number)</li>
                        <li>API Hash (32-character string)</li>
                        <li>Channel ID (10-13 digit number)</li>
                        <li>Your phone number (with + and country code)</li>
                    </ul>
                </Alert>
            </Section>

            <Section id="configure-settings" title="Step 3: Configure Settings" icon="⚙️">
                <p className="text-zinc-300 mb-6">
                    Now we'll configure the bot with your credentials.
                </p>

                <SubSection title="Open Settings Tab">
                    <p className="text-sm text-zinc-400 mb-3">In the bot window, click the <strong>"Settings"</strong> tab. You'll see several sections.</p>
                </SubSection>

                <SubSection title="Configure Telegram Settings">
                    <FieldList>
                        <Field name="Session Name" example="session01 (leave as default or choose your own)" />
                        <Field name="API ID" example="Paste your API ID (the number from Step 2)" required />
                        <Field name="API Hash" example="Paste your API Hash (the long string from Step 2)" required />
                        <Field name="Channel ID" example="Paste your Channel ID (numbers only, no minus sign)" required />
                        <Field name="Phone Number" example="+12025550123 (with country code)" required />
                        <Field name="Channel Username" example="@yourchannelname (optional, only if public channel)" />
                    </FieldList>
                </SubSection>

                <SubSection title="Configure MT5 Settings">
                    <div className="space-y-4">
                        <div>
                            <p className="text-sm font-semibold text-white mb-2">MT5 Login:</p>
                            <p className="text-xs text-zinc-400 mb-2">Your MT5 account number (e.g., 12345678)</p>
                            <p className="text-xs text-zinc-400"><strong>How to find:</strong> Open MT5 → Tools → Options → Server tab → Copy the Login number</p>
                        </div>

                        <div>
                            <p className="text-sm font-semibold text-white mb-2">MT5 Server:</p>
                            <p className="text-xs text-zinc-400 mb-2">Your broker's server name (e.g., ICMarketsSC-Demo)</p>
                            <p className="text-xs text-zinc-400"><strong>How to find:</strong> Same location as Login. Copy exactly as shown (case-sensitive)</p>
                        </div>

                        <div>
                            <p className="text-sm font-semibold text-white mb-2">MT5 Terminal Path:</p>
                            <ol className="list-decimal list-inside text-xs text-zinc-400 space-y-1">
                                <li>Click the "Browse…" button</li>
                                <li>Navigate to your MT5 installation</li>
                                <li>Common location: C:\Program Files\MetaTrader 5\terminal64.exe</li>
                                <li>Select terminal64.exe (or terminal.exe)</li>
                                <li>Click Open</li>
                            </ol>
                        </div>

                        <div>
                            <p className="text-sm font-semibold text-white mb-2">Asset Symbols:</p>
                            <ol className="list-decimal list-inside text-xs text-zinc-400 space-y-1">
                                <li>Click "Configure Asset Symbols"</li>
                                <li>Add your trading symbol (e.g., Signal Name: GOLD, Broker Symbol: XAUUSD)</li>
                                <li>Click Add or Save</li>
                            </ol>
                            <CodeBlock>
                                {`Common Mappings:
GOLD → XAUUSD
SILVER → XAGUSD
EUR/USD → EURUSD
BTC → BTCUSD`}
                            </CodeBlock>
                        </div>
                    </div>
                </SubSection>

                <SubSection title="Configure Trading Parameters">
                    <FieldList>
                        <Field name="Lot Size" example="0.01 (Start with minimum! VERY important for safety)" />
                        <Field name="Max Slippage" example="100 points (default is fine)" />
                    </FieldList>
                    <Alert type="info">
                        Auto Trading is already enabled (locked) - no action needed
                    </Alert>
                </SubSection>

                <SubSection title="Configure Time Zones (Optional)">
                    <FieldList>
                        <Field name="Clock 1" example="Your local timezone" />
                        <Field name="Clock 2" example="MT5 server timezone" />
                        <Field name="Clock 3" example="Signal provider timezone" />
                    </FieldList>
                </SubSection>

                <Alert type="warning">
                    <strong>CRITICAL:</strong> Click the big green "SAVE SETTINGS" button at the bottom! Changes won't take effect until you save.
                </Alert>
            </Section>

            <Section id="create-strategy" title="Step 4: Create Your First Strategy" icon="🎯">
                <StepList>
                    <Step num={1}>Click the <strong>"Strategies"</strong> tab</Step>
                    <Step num={2}>Click <strong>"New Strategy"</strong> button</Step>
                    <Step num={3}>Enter name: "My First Strategy"</Step>
                    <Step num={4}>Add description (optional): "Gold trading with instant execution"</Step>
                    <Step num={5}>Select execution mode: <strong>Instant Execution</strong> (recommended for beginners)</Step>
                </StepList>

                <SubSection title="Configure Keywords">
                    <p className="text-sm text-zinc-300 mb-3">Set up how the bot identifies BUY and SELL signals:</p>
                    <CodeBlock>
                        {`BUY Logic: GOLD AND BUY
SELL Logic: GOLD AND SELL`}
                    </CodeBlock>
                    <Alert type="info">
                        <strong>💡 Tip:</strong> Use AND for specific matching. Example: "GOLD AND BUY" means both keywords must be present.
                    </Alert>
                </SubSection>

                <SubSection title="Set Take Profit and Stop Loss">
                    <FieldList>
                        <Field name="Number of Trades" example="1 (start with 1 trade per signal)" />
                        <Field name="Take Profit" example="300 points" />
                        <Field name="Stop Loss" example="600 points" required />
                    </FieldList>
                    <Alert type="warning">
                        <strong>NEVER</strong> trade without a Stop Loss! This protects your account from large losses.
                    </Alert>
                </SubSection>

                <SubSection title="Save Your Strategy">
                    <p className="text-sm text-zinc-400">Click the "Save" or "Create Strategy" button to save your configuration.</p>
                </SubSection>
            </Section>

            <Section id="start-bot" title="Step 5: Start the Bot" icon="▶️">
                <StepList>
                    <Step num={1}>Make sure MT5 is running and logged in (check green connection status)</Step>
                    <Step num={2}>Click the <strong>"Start"</strong> button in the bot (usually at the top)</Step>
                    <Step num={3}>First time only: Enter Telegram verification code
                        <ul className="list-disc list-inside ml-4 mt-2 text-sm space-y-1">
                            <li>Check your Telegram app for the code</li>
                            <li>Enter it in the bot's console/terminal window</li>
                            <li>If 2FA enabled, enter your password</li>
                        </ul>
                    </Step>
                    <Step num={4}>Wait for "Connected" status messages</Step>
                </StepList>

                <Alert type="success">
                    <strong>✅ Success Indicators:</strong>
                    <ul className="list-disc list-inside mt-2 space-y-1">
                        <li>Telegram connected</li>
                        <li>MT5 connected</li>
                        <li>Strategy active</li>
                        <li>Monitoring channel: [Your Channel ID]</li>
                    </ul>
                </Alert>
            </Section>

            <Section id="verify" title="Step 6: Verify Everything Works" icon="✅">
                <SubSection title="Check Logs Tab">
                    <p className="text-sm text-zinc-300 mb-3">You should see messages like:</p>
                    <CodeBlock>
                        {`[INFO] Bot started
[INFO] Telegram connected
[INFO] MT5 connected
[INFO] Strategy loaded: My First Strategy
[INFO] Monitoring channel: 1234567890`}
                    </CodeBlock>
                </SubSection>

                <SubSection title="Monitor First Trade">
                    <p className="text-sm text-zinc-300 mb-3">When a signal arrives, verify:</p>
                    <CheckList>
                        <CheckItem>Signal appears in Audit tab with details</CheckItem>
                        <CheckItem>Trade executes in MT5 (check Terminal → Trade tab)</CheckItem>
                        <CheckItem>Position shows in Dashboard with current P/L</CheckItem>
                        <CheckItem>TP/SL are set correctly in MT5</CheckItem>
                    </CheckList>
                </SubSection>

                <Alert type="success">
                    <strong>🎉 Congratulations!</strong> Your Signal Trading Bot is now running and ready to trade automatically!
                </Alert>
            </Section>

            <Section id="troubleshooting" title="Quick Troubleshooting" icon="🔧">
                <TroubleshootingItem
                    issue="Telegram Connection Failed"
                    solutions={[
                        "Check internet connection",
                        "Verify API ID and Hash are correct",
                        "Ensure phone number has + and country code",
                        "Delete session file and reconnect"
                    ]}
                />

                <TroubleshootingItem
                    issue="MT5 Connection Failed"
                    solutions={[
                        "Make sure MT5 is running",
                        "Verify login number is correct",
                        "Check server name matches exactly",
                        "Ensure terminal path is correct"
                    ]}
                />

                <TroubleshootingItem
                    issue="No Signals Detected"
                    solutions={[
                        "Verify you're member of the channel",
                        "Check Channel ID is correct",
                        "Ensure channel is active",
                        "Test keywords with sample message"
                    ]}
                />
            </Section>
        </div >
    );
}

function SettingsContent({ scrollToSection }: any) {
    return (
        <div className="space-y-8">
            <Section id="telegram-settings" title="Telegram Settings" icon="📱">
                <p className="text-zinc-300 mb-6">
                    Configure your Telegram connection to monitor signal channels. You'll need API credentials from Telegram before configuring this section.
                </p>

                <SubSection title="1️⃣ Client Type">
                    <div className="bg-white/5 rounded-lg p-4 mb-4">
                        <p className="text-sm text-zinc-300 mb-2"><strong>Current Status:</strong> Telethon (Fixed)</p>
                        <p className="text-xs text-zinc-400">The Telegram client library used to connect. Currently locked to Telethon for stability.</p>
                    </div>
                    <Alert type="info">
                        ✅ <strong>Telethon (Paid Channels)</strong> - Supports paid/private channels (ACTIVE)
                    </Alert>
                </SubSection>

                <SubSection title="2️⃣ Session Name">
                    <SettingField
                        name="Session Name"
                        description="A unique identifier for your Telegram session. Used to save your login state."
                        example="session01"
                    />
                    <div className="mt-3 bg-white/5 rounded-lg p-3">
                        <p className="text-xs font-semibold text-white mb-2">Best Practices:</p>
                        <ul className="list-disc list-inside text-xs text-zinc-400 space-y-1">
                            <li>Use lowercase letters and numbers</li>
                            <li>Avoid spaces (use underscores instead)</li>
                            <li>Keep it simple and memorable</li>
                            <li>Don't change frequently (requires re-login)</li>
                        </ul>
                    </div>
                    <CodeBlock>
                        {`Examples:
session01
my_trading_session
gold_signals_bot`}
                    </CodeBlock>
                </SubSection>

                <SubSection title="3️⃣ API ID">
                    <SettingField
                        name="API ID"
                        required
                        description="Your unique Telegram API identifier obtained from https://my.telegram.org"
                        example="12345678"
                    />
                    <div className="mt-3 space-y-2">
                        <p className="text-sm font-semibold text-white">How to get it:</p>
                        <ol className="list-decimal list-inside text-sm text-zinc-400 space-y-1">
                            <li>Go to https://my.telegram.org</li>
                            <li>Log in with your phone number</li>
                            <li>Click on "API development tools"</li>
                            <li>Create a new application if you haven't already</li>
                            <li>Copy the <strong>App api_id</strong> (it's a number like 12345678)</li>
                        </ol>
                    </div>
                    <Alert type="warning">
                        <strong>⚠️ Security:</strong> Keep this private. Don't share with others or post publicly.
                    </Alert>
                </SubSection>

                <SubSection title="4️⃣ API Hash">
                    <SettingField
                        name="API Hash"
                        required
                        description="Your unique Telegram API hash key. Works together with API ID for authentication."
                        example="1a2b3c4d5e6f7g8h9i0j1k2l3m4n5o6p"
                    />
                    <div className="mt-3 space-y-2">
                        <p className="text-sm font-semibold text-white">How to get it:</p>
                        <ol className="list-decimal list-inside text-sm text-zinc-400 space-y-1">
                            <li>Same process as API ID</li>
                            <li>On the same page at https://my.telegram.org</li>
                            <li>Copy the <strong>App api_hash</strong> (long string)</li>
                        </ol>
                    </div>
                    <Alert type="warning">
                        <strong>⚠️ Security:</strong> Treat like a password. Never share publicly.
                    </Alert>
                </SubSection>

                <SubSection title="5️⃣ Channel ID">
                    <SettingField
                        name="Channel ID"
                        required
                        description="The unique identifier of the Telegram channel you want to monitor (public or private)"
                        example="1234567890"
                    />
                    <div className="mt-3 space-y-3">
                        <div>
                            <p className="text-sm font-semibold text-white mb-2">Method 1: Using Telegram Web</p>
                            <ol className="list-decimal list-inside text-xs text-zinc-400 space-y-1">
                                <li>Open https://web.telegram.org</li>
                                <li>Navigate to your signal channel</li>
                                <li>Look at URL: https://web.telegram.org/k/#-1001234567890</li>
                                <li>The number after -100 is your channel ID: 1234567890</li>
                            </ol>
                        </div>
                        <div>
                            <p className="text-sm font-semibold text-white mb-2">Method 2: Using Bot</p>
                            <p className="text-xs text-zinc-400">Forward a message from the channel to @userinfobot</p>
                        </div>
                    </div>
                    <CodeBlock>
                        {`Format Examples:
✅ Correct: 1234567890
✅ Correct: 1001234567890
❌ Wrong: -1001234567890 (don't include minus)
❌ Wrong: @channelname (use numbers, not username)`}
                    </CodeBlock>
                </SubSection>

                <SubSection title="6️⃣ Phone Number">
                    <SettingField
                        name="Phone Number"
                        required
                        description="Your Telegram account phone number. Used for initial authentication."
                        example="+12025550123"
                    />
                    <div className="mt-3">
                        <p className="text-sm font-semibold text-white mb-2">Requirements:</p>
                        <ul className="list-disc list-inside text-xs text-zinc-400 space-y-1">
                            <li>Must include country code</li>
                            <li>Must start with +</li>
                            <li>No spaces or dashes</li>
                            <li>Must match your Telegram account</li>
                        </ul>
                    </div>
                    <CodeBlock>
                        {`Examples by Country:
USA: +1 202 555 0123 → +12025550123
UK: +44 7700 900123 → +447700900123
India: +91 98765 43210 → +919876543210`}
                    </CodeBlock>
                </SubSection>

                <SubSection title="7️⃣ Channel Username">
                    <SettingField
                        name="Channel Username"
                        description="The public username of the channel (optional but recommended)"
                        example="@signalchannel"
                    />
                    <CodeBlock>
                        {`Format Examples:
✅ Correct: @signalchannel
✅ Correct: @goldtradingsignals
❌ Wrong: signalchannel (missing @)
❌ Wrong: https://t.me/signalchannel (use @username only)`}
                    </CodeBlock>
                    <div className="mt-3 grid md:grid-cols-2 gap-3">
                        <div className="bg-green-500/10 border border-green-500/20 rounded p-2">
                            <p className="text-xs font-semibold text-green-400 mb-1">When to use:</p>
                            <ul className="list-disc list-inside text-xs text-zinc-400 space-y-1">
                                <li>Public channels with usernames</li>
                                <li>As backup to Channel ID</li>
                            </ul>
                        </div>
                        <div className="bg-red-500/10 border border-red-500/20 rounded p-2">
                            <p className="text-xs font-semibold text-red-400 mb-1">When to skip:</p>
                            <ul className="list-disc list-inside text-xs text-zinc-400 space-y-1">
                                <li>Private channels without usernames</li>
                                <li>When only Channel ID is available</li>
                            </ul>
                        </div>
                    </div>
                </SubSection>

                <SubSection title="🔐 First-Time Telegram Setup">
                    <p className="text-sm text-zinc-300 mb-3">What happens when you start the bot:</p>
                    <ol className="list-decimal list-inside text-sm text-zinc-400 space-y-1 mb-4">
                        <li>Bot attempts to connect to Telegram</li>
                        <li>You'll receive a verification code via Telegram</li>
                        <li>Enter the code in the bot's console/terminal</li>
                        <li>If 2FA is enabled, enter your password</li>
                        <li>Session is saved for future use</li>
                    </ol>
                    <Alert type="info">
                        <strong>Troubleshooting Login:</strong> Make sure all credentials are correct, check phone number format (+country code), verify API ID and Hash are from the same app.
                    </Alert>
                </SubSection>
            </Section>

            <Section id="mt5-settings" title="MetaTrader 5 Settings" icon="💹">
                <p className="text-zinc-300 mb-6">
                    These settings connect the bot to your MetaTrader 5 trading platform. You must have MT5 installed and an active trading account.
                </p>

                <SubSection title="1️⃣ Login">
                    <SettingField
                        name="Login"
                        required
                        description="Your MT5 account number found in MT5 terminal"
                        example="12345678"
                    />
                    <div className="mt-3 space-y-2">
                        <p className="text-sm font-semibold text-white">How to find it:</p>
                        <ol className="list-decimal list-inside text-xs text-zinc-400 space-y-1">
                            <li>Open MetaTrader 5</li>
                            <li>Click on "Tools" → "Options"</li>
                            <li>Go to "Server" tab</li>
                            <li>Your login number is displayed</li>
                        </ol>
                    </div>
                    <div className="mt-3 grid md:grid-cols-2 gap-3">
                        <div className="bg-blue-500/10 border border-blue-500/20 rounded p-2">
                            <p className="text-xs font-semibold text-blue-400">Demo Account</p>
                            <p className="text-xs text-zinc-400">For testing (recommended to start)</p>
                        </div>
                        <div className="bg-purple-500/10 border border-purple-500/20 rounded p-2">
                            <p className="text-xs font-semibold text-purple-400">Live Account</p>
                            <p className="text-xs text-zinc-400">For real trading (use after testing)</p>
                        </div>
                    </div>
                </SubSection>

                <SubSection title="2️⃣ Server">
                    <SettingField
                        name="Server"
                        required
                        description="The MT5 broker server name (case-sensitive, specific to your broker)"
                        example="ICMarketsSC-Demo"
                    />
                    <div className="mt-3 space-y-2">
                        <p className="text-sm font-semibold text-white">How to find it:</p>
                        <ol className="list-decimal list-inside text-xs text-zinc-400 space-y-1">
                            <li>Open MetaTrader 5</li>
                            <li>Click on "Tools" → "Options"</li>
                            <li>Go to "Server" tab</li>
                            <li>Copy the server name exactly</li>
                        </ol>
                    </div>
                    <CodeBlock>
                        {`Examples:
ICMarketsSC-Demo
Exness-MT5Real
FTMO-Server
Alpari-MT5-Demo`}
                    </CodeBlock>
                    <Alert type="warning">
                        <strong>⚠️ Important:</strong> Copy exactly as shown (case-sensitive). Include dashes and special characters. Different for demo vs live accounts.
                    </Alert>
                </SubSection>

                <SubSection title="3️⃣ MT5 Terminal Path">
                    <SettingField
                        name="MT5 Terminal Path"
                        required
                        description="The location of your MT5 terminal executable file (terminal64.exe or terminal.exe)"
                        example="C:\\Program Files\\MetaTrader 5\\terminal64.exe"
                    />
                    <div className="mt-3 space-y-3">
                        <div>
                            <p className="text-sm font-semibold text-white mb-2">How to configure:</p>
                            <ol className="list-decimal list-inside text-xs text-zinc-400 space-y-1">
                                <li>Click the "Browse…" button</li>
                                <li>Navigate to your MT5 installation folder</li>
                                <li>Select terminal64.exe (or terminal.exe)</li>
                                <li>Click "Open"</li>
                            </ol>
                        </div>
                        <div>
                            <p className="text-sm font-semibold text-white mb-2">Common Locations:</p>
                            <CodeBlock>
                                {`C:\\Program Files\\MetaTrader 5\\terminal64.exe
C:\\Program Files (x86)\\MetaTrader 5\\terminal.exe
C:\\Program Files\\[BrokerName] MetaTrader 5\\terminal64.exe`}
                            </CodeBlock>
                        </div>
                        <div>
                            <p className="text-sm font-semibold text-white mb-2">How to find it manually:</p>
                            <ol className="list-decimal list-inside text-xs text-zinc-400 space-y-1">
                                <li>Right-click MT5 desktop shortcut</li>
                                <li>Select "Open file location"</li>
                                <li>Look for terminal64.exe or terminal.exe</li>
                                <li>Copy the full path</li>
                            </ol>
                        </div>
                    </div>
                    <div className="mt-4">
                        <p className="text-sm font-semibold text-white mb-2">⚠️ Error Messages:</p>
                        <Table
                            headers={["Error", "Solution"]}
                            rows={[
                                ["MT5 Terminal Path is required", "You must select a file"],
                                ["Path does not exist", "File was moved or deleted"],
                                ["Must be a file", "You selected a folder"],
                                ["Must be a .exe file", "Selected wrong file type"],
                                ["Please select terminal.exe", "Selected wrong executable"],
                            ]}
                        />
                    </div>
                </SubSection>

                <SubSection title="4️⃣ Asset Symbols">
                    <p className="text-zinc-300 mb-4">
                        Configuration of trading symbols and their broker-specific names. Maps common names (like GOLD) to broker symbols (like XAUUSD).
                    </p>
                    <div className="bg-white/5 rounded-lg p-4 mb-4">
                        <p className="text-sm font-semibold text-white mb-2">How to configure:</p>
                        <ol className="list-decimal list-inside text-xs text-zinc-400 space-y-1">
                            <li>Click "Configure Asset Symbols" button</li>
                            <li>A dialog window opens</li>
                            <li>Add/edit symbol mappings</li>
                            <li>Save changes</li>
                        </ol>
                    </div>
                    <div className="mb-4">
                        <p className="text-sm font-semibold text-white mb-2">Why it's needed:</p>
                        <ul className="list-disc list-inside text-xs text-zinc-400 space-y-1">
                            <li>Different brokers use different symbol names</li>
                            <li>Signals might say "GOLD" but your broker uses "XAUUSD"</li>
                            <li>Bot needs to know the correct symbol to trade</li>
                        </ul>
                    </div>
                    <Table
                        headers={["Signal Name", "Broker Symbol", "Asset"]}
                        rows={[
                            ["GOLD", "XAUUSD", "Gold vs USD"],
                            ["SILVER", "XAGUSD", "Silver vs USD"],
                            ["OIL", "USOIL / WTI", "Crude Oil"],
                            ["BTC", "BTCUSD", "Bitcoin"],
                            ["EUR/USD", "EURUSD", "Euro vs USD"],
                            ["GBP/USD", "GBPUSD", "Pound vs USD"],
                        ]}
                    />
                    <Alert type="info">
                        <strong>Best Practices:</strong> Verify symbols in MT5 Market Watch, test with demo account first, add all symbols you plan to trade, check symbol availability with broker.
                    </Alert>
                </SubSection>
            </Section>

            <Section id="trading-params" title="Trading Parameters" icon="⚙️">
                <p className="text-zinc-300 mb-6">
                    These settings control the default trading behavior for all strategies unless overridden.
                </p>

                <SubSection title="1️⃣ Lot Size">
                    <SettingField
                        name="Lot Size"
                        description="The default volume for each trade, measured in lots (standard units)"
                        example="0.01"
                    />
                    <div className="mt-4 mb-4">
                        <p className="text-sm font-semibold text-white mb-2">Understanding Lot Sizes:</p>
                        <Table
                            headers={["Lot Size", "Contract Size", "Risk Level"]}
                            rows={[
                                ["0.01", "Micro lot", "Very Low (Beginner)"],
                                ["0.10", "Mini lot", "Low (Conservative)"],
                                ["1.00", "Standard lot", "High (Experienced)"],
                                ["10.00", "Large lot", "Very High (Professional)"],
                            ]}
                        />
                    </div>
                    <div className="space-y-3 mb-4">
                        <div className="bg-white/5 rounded-lg p-3">
                            <p className="text-sm font-semibold text-white mb-2">For Forex (EURUSD):</p>
                            <ul className="list-disc list-inside text-xs text-zinc-400 space-y-1">
                                <li>0.01 lot = $1,000 contract = ~$0.10 per pip</li>
                                <li>0.10 lot = $10,000 contract = ~$1.00 per pip</li>
                                <li>1.00 lot = $100,000 contract = ~$10.00 per pip</li>
                            </ul>
                        </div>
                        <div className="bg-white/5 rounded-lg p-3">
                            <p className="text-sm font-semibold text-white mb-2">For Gold (XAUUSD):</p>
                            <ul className="list-disc list-inside text-xs text-zinc-400 space-y-1">
                                <li>0.01 lot = 1 ounce = ~$0.01 per point</li>
                                <li>0.10 lot = 10 ounces = ~$0.10 per point</li>
                                <li>1.00 lot = 100 ounces = ~$1.00 per point</li>
                            </ul>
                        </div>
                    </div>
                    <div className="mb-4">
                        <p className="text-sm font-semibold text-white mb-2">Recommendations by Account Size:</p>
                        <Table
                            headers={["Account Balance", "Recommended Lot Size", "Risk Level"]}
                            rows={[
                                ["$100 - $500", "0.01", "Conservative"],
                                ["$500 - $1,000", "0.01 - 0.02", "Moderate"],
                                ["$1,000 - $5,000", "0.02 - 0.10", "Moderate"],
                                ["$5,000 - $10,000", "0.10 - 0.50", "Balanced"],
                                ["$10,000+", "0.50+", "Aggressive"],
                            ]}
                        />
                    </div>
                    <Alert type="warning">
                        <strong>⚠️ Risk Warning:</strong> Start with smallest lot size (0.01). Never risk more than 1-2% per trade. Consider account balance and leverage. Test with demo account first.
                    </Alert>
                </SubSection>

                <SubSection title="2️⃣ Max Slippage (points)">
                    <SettingField
                        name="Max Slippage"
                        description="Maximum acceptable price difference between order request and execution, measured in points (not pips)"
                        example="100"
                    />
                    <div className="mt-4 mb-4">
                        <p className="text-sm font-semibold text-white mb-2">Understanding Slippage:</p>
                        <p className="text-xs text-zinc-400 mb-2">Slippage occurs when:</p>
                        <ul className="list-disc list-inside text-xs text-zinc-400 space-y-1">
                            <li>Market moves between order placement and execution</li>
                            <li>High volatility periods</li>
                            <li>News events</li>
                            <li>Low liquidity</li>
                        </ul>
                    </div>
                    <div className="mb-4">
                        <p className="text-sm font-semibold text-white mb-2">Point vs Pip:</p>
                        <Table
                            headers={["Instrument", "1 Pip", "1 Point", "100 Points"]}
                            rows={[
                                ["EURUSD", "0.0001", "0.00001", "0.001 (10 pips)"],
                                ["XAUUSD", "0.01", "0.01", "1.00 (100 pips)"],
                                ["USDJPY", "0.01", "0.001", "0.10 (10 pips)"],
                            ]}
                        />
                    </div>
                    <div className="mb-4">
                        <p className="text-sm font-semibold text-white mb-2">Recommended Settings:</p>
                        <Table
                            headers={["Trading Style", "Slippage Setting", "Reason"]}
                            rows={[
                                ["Scalping", "20-50 points", "Tight control needed"],
                                ["Day Trading", "50-100 points", "Balanced approach"],
                                ["Swing Trading", "100-200 points", "More flexibility"],
                                ["News Trading", "200-500 points", "High volatility expected"],
                            ]}
                        />
                    </div>
                    <Alert type="info">
                        <strong>What happens if slippage exceeds limit:</strong> Order is rejected, bot logs the rejection, no trade is executed, you can retry with higher slippage.
                    </Alert>
                    <Alert type="warning">
                        <strong>⚠️ Important:</strong> Too low = orders rejected frequently. Too high = poor execution prices. Adjust based on market conditions.
                    </Alert>
                </SubSection>

                <SubSection title="3️⃣ Auto Trading">
                    <div className="bg-white/5 rounded-lg p-4">
                        <p className="text-sm font-semibold text-white mb-2">Status: Always Enabled (Read-Only)</p>
                        <p className="text-xs text-zinc-400 mb-3">Automatic trade execution when signals are detected. Cannot be disabled (core functionality).</p>
                        <div className="space-y-2">
                            <p className="text-xs font-semibold text-white">Why it's locked:</p>
                            <ul className="list-disc list-inside text-xs text-zinc-400 space-y-1">
                                <li>This is an automated trading bot</li>
                                <li>Manual trading defeats the purpose</li>
                                <li>Ensures consistent execution</li>
                                <li>Prevents user error</li>
                            </ul>
                        </div>
                    </div>
                    <div className="mt-3 bg-blue-500/10 border border-blue-500/20 rounded-lg p-3">
                        <p className="text-xs font-semibold text-blue-400 mb-2">⚠️ Control Options:</p>
                        <ul className="list-disc list-inside text-xs text-zinc-400 space-y-1">
                            <li>Enable/disable specific strategies</li>
                            <li>Pause bot completely (Stop button)</li>
                            <li>Modify strategy settings</li>
                            <li>Use demo account for testing</li>
                        </ul>
                    </div>
                </SubSection>
            </Section>

            <Section id="timezone" title="Time Zone Settings" icon="🕐">
                <p className="text-zinc-300 mb-6">
                    Configure display clocks and analytics timezone preferences. This affects how times are displayed and when daily calculations reset.
                </p>

                <SubSection title="🕐 Clock Time Zones">
                    <p className="text-sm text-zinc-300 mb-3">Three customizable clocks displayed in the bot. Can show different time zones simultaneously.</p>
                    <FieldList>
                        <Field name="Clock 1" example="Your local time" />
                        <Field name="Clock 2" example="Broker server time (MT5)" />
                        <Field name="Clock 3" example="Signal provider's time zone" />
                    </FieldList>
                    <div className="mt-4 mb-4">
                        <p className="text-sm font-semibold text-white mb-2">Popular Time Zones:</p>
                        <Table
                            headers={["Region", "Time Zone", "Common Use"]}
                            rows={[
                                ["New York", "America/New_York", "US Eastern Time"],
                                ["London", "Europe/London", "GMT/BST"],
                                ["Tokyo", "Asia/Tokyo", "Asian Session"],
                                ["Sydney", "Australia/Sydney", "Pacific Session"],
                                ["Dubai", "Asia/Dubai", "Middle East"],
                                ["UTC", "UTC", "Universal Time"],
                            ]}
                        />
                    </div>
                    <div className="bg-white/5 rounded-lg p-3">
                        <p className="text-xs font-semibold text-white mb-2">Trading Session Times (UTC):</p>
                        <ul className="list-disc list-inside text-xs text-zinc-400 space-y-1">
                            <li><strong>Asian:</strong> 00:00 - 09:00 UTC</li>
                            <li><strong>European:</strong> 07:00 - 16:00 UTC</li>
                            <li><strong>American:</strong> 13:00 - 22:00 UTC</li>
                        </ul>
                    </div>
                </SubSection>

                <SubSection title="📊 Analytics Time Zone">
                    <p className="text-sm text-zinc-300 mb-3">Setting: Use system time for analytics</p>
                    <p className="text-xs text-zinc-400 mb-4">Affects: Dashboard calculations, Today's P&L reset time, Risk Management daily limits, Trade history timestamps</p>

                    <div className="space-y-3">
                        <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-3">
                            <p className="text-sm font-semibold text-green-400 mb-2">☑️ Checked (Use System Time)</p>
                            <ul className="list-disc list-inside text-xs text-zinc-400 space-y-1">
                                <li>Uses your computer's local time</li>
                                <li>Daily calculations reset at midnight YOUR time</li>
                                <li>P&L shows YOUR day's performance</li>
                                <li>Risk limits reset at YOUR midnight</li>
                            </ul>
                            <p className="text-xs text-zinc-300 mt-2"><strong>When to use:</strong> You trade based on your local day, want P&L to match your schedule</p>
                        </div>

                        <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3">
                            <p className="text-sm font-semibold text-blue-400 mb-2">☐ Unchecked (Use MT5 Server Time)</p>
                            <ul className="list-disc list-inside text-xs text-zinc-400 space-y-1">
                                <li>Uses broker's server time</li>
                                <li>Daily calculations reset at midnight SERVER time</li>
                                <li>P&L shows SERVER day's performance</li>
                                <li>Risk limits reset at SERVER midnight</li>
                            </ul>
                            <p className="text-xs text-zinc-300 mt-2"><strong>When to use:</strong> You follow broker's trading day, multiple users in different timezones</p>
                        </div>
                    </div>

                    <div className="mt-4">
                        <p className="text-sm font-semibold text-white mb-2">Example Scenario:</p>
                        <CodeBlock>
                            {`Your Location: New York (UTC-5)
MT5 Server: London (UTC+0)
Time: 8:00 PM New York (1:00 AM London - next day)`}
                        </CodeBlock>
                        <Table
                            headers={["Setting", "Daily Reset", "What You See"]}
                            rows={[
                                ["System Time", "Midnight New York", "Still today's trades"],
                                ["Server Time", "Midnight London", "Already tomorrow's trades"],
                            ]}
                        />
                    </div>
                </SubSection>
            </Section>

            <Section id="licensing" title="Licensing Information" icon="📄">
                <p className="text-zinc-300 mb-6">
                    This section displays your license details. All fields are read-only and automatically populated.
                </p>

                <SubSection title="📄 License Fields">
                    <FieldList>
                        <Field name="License Key" example="XXXX-XXXX-XXXX-XXXX (Your unique license identifier)" />
                        <Field name="Status" example="Active / Expired / Revoked / Invalid" />
                        <Field name="Expires At" example="YYYY-MM-DD HH:MM:SS (Plan ahead for renewal)" />
                        <Field name="Session ID" example="Current session identifier (changes each time bot starts)" />
                        <Field name="Device ID" example="Unique identifier for this computer (hardware-based)" />
                    </FieldList>
                </SubSection>

                <SubSection title="🔐 License Validation">
                    <div className="bg-white/5 rounded-lg p-4 mb-4">
                        <p className="text-sm font-semibold text-white mb-2">When license is checked:</p>
                        <ul className="list-disc list-inside text-xs text-zinc-400 space-y-1">
                            <li>On bot startup</li>
                            <li>Periodically during operation</li>
                            <li>When saving settings</li>
                            <li>On manual refresh</li>
                        </ul>
                    </div>
                    <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 mb-4">
                        <p className="text-sm font-semibold text-red-400 mb-2">What happens if license expires:</p>
                        <ul className="list-disc list-inside text-xs text-zinc-400 space-y-1">
                            <li>Bot stops accepting new signals</li>
                            <li>Existing trades continue to run</li>
                            <li>You can close positions manually</li>
                            <li>Settings remain accessible</li>
                        </ul>
                    </div>
                    <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-3">
                        <p className="text-sm font-semibold text-green-400 mb-2">How to renew:</p>
                        <ol className="list-decimal list-inside text-xs text-zinc-400 space-y-1">
                            <li>Contact support or visit customer portal</li>
                            <li>Purchase license extension</li>
                            <li>Restart bot to activate new license</li>
                            <li>Verify new expiry date</li>
                        </ol>
                    </div>
                </SubSection>

                <SubSection title="⚠️ License Troubleshooting">
                    <Table
                        headers={["Issue", "Possible Cause", "Solution"]}
                        rows={[
                            ["Invalid License", "Wrong key entered", "Contact support"],
                            ["License Expired", "Subscription ended", "Renew license"],
                            ["Device Mismatch", "Hardware changed", "Request device reset"],
                            ["Session Limit", "Too many instances", "Close other instances"],
                        ]}
                    />
                </SubSection>
            </Section>

            <Section id="import-export" title="Import & Export Settings" icon="📤">
                <p className="text-zinc-300 mb-6">
                    Save and restore your configuration easily. Perfect for backing up settings, transferring to another computer, sharing configuration (without sensitive data), or quick setup of multiple bots.
                </p>

                <SubSection title="📥 Import Settings">
                    <p className="text-zinc-300 mb-4">
                        Loads settings from a .env file. Overwrites current settings and updates all fields automatically.
                    </p>
                    <StepList>
                        <Step num={1}>Click "Import Settings" button</Step>
                        <Step num={2}>Browse to your .env file</Step>
                        <Step num={3}>Select the file</Step>
                        <Step num={4}>Click "Open"</Step>
                        <Step num={5}>Settings are loaded immediately</Step>
                        <Step num={6}>Click "SAVE SETTINGS" to apply</Step>
                    </StepList>

                    <div className="mt-4 grid md:grid-cols-2 gap-3">
                        <div className="bg-green-500/10 border border-green-500/20 rounded p-3">
                            <p className="text-xs font-semibold text-green-400 mb-2">✅ What gets imported:</p>
                            <ul className="list-disc list-inside text-xs text-zinc-400 space-y-1">
                                <li>Telegram credentials</li>
                                <li>MT5 connection details</li>
                                <li>Trading parameters</li>
                                <li>All configuration values</li>
                            </ul>
                        </div>
                        <div className="bg-red-500/10 border border-red-500/20 rounded p-3">
                            <p className="text-xs font-semibold text-red-400 mb-2">❌ What doesn't get imported:</p>
                            <ul className="list-disc list-inside text-xs text-zinc-400 space-y-1">
                                <li>License information (device-specific)</li>
                                <li>Session files (must re-login)</li>
                                <li>Strategy configurations (separate files)</li>
                            </ul>
                        </div>
                    </div>

                    <Alert type="warning">
                        <strong>⚠️ Security Warning:</strong> .env files contain sensitive data. Don't share publicly, store securely, delete old backups.
                    </Alert>
                </SubSection>

                <SubSection title="📤 Export Settings">
                    <p className="text-zinc-300 mb-4">
                        Saves current settings to a .env file. Creates a backup of configuration that's portable to other installations.
                    </p>
                    <StepList>
                        <Step num={1}>Click "Export Settings" button</Step>
                        <Step num={2}>Choose save location</Step>
                        <Step num={3}>Enter filename (e.g., my_settings.env)</Step>
                        <Step num={4}>Click "Save"</Step>
                        <Step num={5}>File is created with all settings</Step>
                    </StepList>

                    <div className="mt-4 mb-4">
                        <p className="text-sm font-semibold text-white mb-2">Use cases:</p>
                        <ul className="list-disc list-inside text-sm text-zinc-400 space-y-1">
                            <li><strong>Backup:</strong> Before making changes</li>
                            <li><strong>Transfer:</strong> Moving to new computer</li>
                            <li><strong>Template:</strong> Setup multiple bots</li>
                            <li><strong>Recovery:</strong> Restore after issues</li>
                        </ul>
                    </div>

                    <div className="bg-white/5 rounded-lg p-4">
                        <p className="text-sm font-semibold text-white mb-2">Best Practices:</p>
                        <ul className="list-disc list-inside text-xs text-zinc-400 space-y-1">
                            <li>Export before major changes</li>
                            <li>Name files descriptively</li>
                            <li>Store in secure location</li>
                            <li>Keep multiple versions</li>
                            <li>Date your backups</li>
                        </ul>
                    </div>

                    <CodeBlock>
                        {`Example naming:
settings_backup_2026-01-01.env
gold_trading_config.env
demo_account_settings.env
live_account_backup.env`}
                    </CodeBlock>
                </SubSection>

                <SubSection title="💾 Save Settings">
                    <div className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/20 rounded-lg p-4 mb-4">
                        <p className="text-sm font-semibold text-green-400 mb-2">The big green button at the bottom</p>
                        <p className="text-xs text-zinc-400">Saves all current settings to .env file, validates configuration, applies changes to running bot, shows confirmation message.</p>
                    </div>

                    <div className="space-y-3">
                        <div>
                            <p className="text-sm font-semibold text-white mb-2">When to click:</p>
                            <ul className="list-disc list-inside text-xs text-zinc-400 space-y-1">
                                <li>After changing any setting</li>
                                <li>Before starting the bot</li>
                                <li>After importing settings</li>
                                <li>When troubleshooting</li>
                            </ul>
                        </div>

                        <div>
                            <p className="text-sm font-semibold text-white mb-2">Validation checks:</p>
                            <ul className="list-disc list-inside text-xs text-zinc-400 space-y-1">
                                <li>MT5 Terminal Path exists</li>
                                <li>Required fields filled</li>
                                <li>Values in valid ranges</li>
                                <li>Format correctness</li>
                            </ul>
                        </div>

                        <div>
                            <p className="text-sm font-semibold text-white mb-2">What happens on save:</p>
                            <ol className="list-decimal list-inside text-xs text-zinc-400 space-y-1">
                                <li>Settings validated</li>
                                <li>.env file updated</li>
                                <li>Bot configuration refreshed</li>
                                <li>Telegram client updated (if needed)</li>
                                <li>MT5 trader updated (if needed)</li>
                                <li>Confirmation shown</li>
                            </ol>
                        </div>
                    </div>

                    <Alert type="info">
                        <strong>💡 Tip:</strong> Always save settings before starting the bot. Changes won't take effect until you click "SAVE SETTINGS".
                    </Alert>
                </SubSection>
            </Section>
        </div>
    );
}

function StrategyContent({ scrollToSection }: any) {
    return (
        <div className="space-y-8">
            <Section id="execution-modes" title="Three Execution Methods" icon="📍">
                <p className="text-zinc-300 mb-6">
                    The Signal Trading Bot supports <strong>three execution methods</strong>, each designed for different trading styles and market conditions:
                </p>

                <SubSection title="1. Instant Execution ⚡">
                    <p className="text-zinc-300 mb-4">
                        Places orders immediately at current market price when keywords are detected in a signal.
                    </p>

                    <div className="grid md:grid-cols-2 gap-4 mb-4">
                        <div>
                            <p className="text-sm font-semibold text-white mb-2">✅ When to Use:</p>
                            <ul className="list-disc list-inside text-sm text-zinc-400 space-y-1">
                                <li>Fast-moving markets</li>
                                <li>Trust signal timing</li>
                                <li>Trending markets</li>
                                <li>Scalping strategies</li>
                            </ul>
                        </div>
                        <div>
                            <p className="text-sm font-semibold text-white mb-2">⚙️ Key Features:</p>
                            <ul className="list-disc list-inside text-sm text-zinc-400 space-y-1">
                                <li>Immediate execution</li>
                                <li>Fixed TP/SL levels</li>
                                <li>Multiple trades per signal</li>
                                <li>Trailing TP available</li>
                            </ul>
                        </div>
                    </div>
                </SubSection>

                <SubSection title="2. Signal Price Execution - Monitor Price 👁️">
                    <p className="text-zinc-300 mb-4">
                        Waits for signal's entry price, monitors continuously, then executes at market when price reaches range OR at expiry.
                    </p>

                    <Alert type="info">
                        <strong>⭐ Recommended for Beginners:</strong> Guarantees trade execution while attempting to get better entry price.
                    </Alert>

                    <div className="mt-4 space-y-3">
                        <div>
                            <p className="text-sm font-semibold text-white mb-2">How It Works:</p>
                            <ol className="list-decimal list-inside text-sm text-zinc-400 space-y-1">
                                <li>Bot continuously monitors market price</li>
                                <li>Waits for price to enter signal's entry range</li>
                                <li>If price reaches range: Executes immediately at market</li>
                                <li>If expiry reached: Executes at current market price anyway</li>
                            </ol>
                        </div>

                        <div className="grid md:grid-cols-2 gap-4">
                            <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-3">
                                <p className="text-sm font-semibold text-green-400 mb-2">✅ Advantages:</p>
                                <ul className="list-disc list-inside text-xs text-zinc-400 space-y-1">
                                    <li>Guarantees execution (won't miss signals)</li>
                                    <li>Active price monitoring</li>
                                    <li>Best price when range is hit</li>
                                    <li>No manual intervention needed</li>
                                </ul>
                            </div>
                            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3">
                                <p className="text-sm font-semibold text-red-400 mb-2">❌ Disadvantages:</p>
                                <ul className="list-disc list-inside text-xs text-zinc-400 space-y-1">
                                    <li>May execute at less favorable price</li>
                                    <li>Requires bot running continuously</li>
                                </ul>
                            </div>
                        </div>

                        <div>
                            <p className="text-sm font-semibold text-white mb-2">🎯 Best For:</p>
                            <ul className="list-disc list-inside text-sm text-zinc-400 space-y-1">
                                <li>Traders who want guaranteed execution</li>
                                <li>Fast-moving markets</li>
                                <li>Trust signal direction more than exact entry</li>
                            </ul>
                        </div>
                    </div>
                </SubSection>

                <SubSection title="3. Signal Price Execution - Place Pending Order 📌">
                    <p className="text-zinc-300 mb-4">
                        Places a pending order in MT5 at the signal's exact entry price. Order activates only when price touches entry level.
                    </p>

                    <Alert type="warning">
                        <strong>⭐ Recommended for Precise Entries:</strong> Order may not fill if price doesn't reach entry level. Requires managing unfilled orders.
                    </Alert>

                    <div className="mt-4 space-y-3">
                        <div>
                            <p className="text-sm font-semibold text-white mb-2">How It Works:</p>
                            <ol className="list-decimal list-inside text-sm text-zinc-400 space-y-1">
                                <li>Bot places pending order at signal's entry price</li>
                                <li>Order sits in MT5 waiting for price</li>
                                <li>When price touches entry: Order executes automatically</li>
                                <li>If price never reaches: Order remains pending</li>
                            </ol>
                        </div>

                        <div className="grid md:grid-cols-2 gap-4">
                            <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-3">
                                <p className="text-sm font-semibold text-green-400 mb-2">✅ Advantages:</p>
                                <ul className="list-disc list-inside text-xs text-zinc-400 space-y-1">
                                    <li>Precise entry at exact signal price</li>
                                    <li>No slippage from monitoring delays</li>
                                    <li>Order remains even if bot stops</li>
                                    <li>Set-and-forget approach</li>
                                </ul>
                            </div>
                            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3">
                                <p className="text-sm font-semibold text-red-400 mb-2">❌ Disadvantages:</p>
                                <ul className="list-disc list-inside text-xs text-zinc-400 space-y-1">
                                    <li>May never execute if price doesn't reach</li>
                                    <li>Requires manual management of unfilled orders</li>
                                    <li>Can accumulate pending orders</li>
                                </ul>
                            </div>
                        </div>

                        <div>
                            <p className="text-sm font-semibold text-white mb-2">🎯 Best For:</p>
                            <ul className="list-disc list-inside text-sm text-zinc-400 space-y-1">
                                <li>Traders who prioritize entry precision</li>
                                <li>Range-bound markets</li>
                                <li>Exact entry price is critical</li>
                                <li>Experienced traders comfortable managing pending orders</li>
                            </ul>
                        </div>
                    </div>
                </SubSection>

                <SubSection title="Which Method Should You Choose?">
                    <Table
                        headers={["Scenario", "Recommended Method"]}
                        rows={[
                            ["Beginner trader", "Monitor Price and Execute at Market"],
                            ["Want guaranteed execution", "Monitor Price and Execute at Market"],
                            ["Fast-moving markets", "Monitor Price and Execute at Market"],
                            ["Precise entry critical", "Place Pending Order"],
                            ["Range-bound markets", "Place Pending Order"],
                            ["Can monitor pending orders", "Place Pending Order"],
                            ["Set-and-forget style", "Place Pending Order"],
                            ["Immediate execution needed", "Instant Execution"],
                        ]}
                    />
                </SubSection>

                <SubSection title="Execution Methods Comparison">
                    <Table
                        headers={["Feature", "Instant Execution", "Signal Price (Monitor)", "Signal Price (Pending)"]}
                        rows={[
                            ["Entry Timing", "Immediate", "Waits, then market", "Waits for exact price"],
                            ["Entry Price", "Current market", "Signal price or market", "Exact signal price"],
                            ["Speed", "Very fast", "Moderate", "Depends on price"],
                            ["Execution Guarantee", "Yes", "Yes (at expiry)", "No (may not fill)"],
                            ["Take Profit", "Fixed or Signal", "From signal", "From signal"],
                            ["Stop Loss", "Fixed or Signal", "From signal", "From signal"],
                            ["Price Range Support", "No", "Yes", "Yes"],
                            ["Pending Orders", "No", "No", "Yes"],
                            ["Bot Must Run", "Yes", "Yes", "No (order in MT5)"],
                            ["Entry Precision", "Low", "Medium", "High"],
                            ["Slippage Risk", "Medium", "Low-Medium", "Very Low"],
                            ["Best For", "Fast execution, trending", "Guaranteed execution", "Precise entries, ranging"],
                            ["Skill Level", "Beginner", "Beginner-Intermediate", "Intermediate-Advanced"],
                        ]}
                    />
                </SubSection>
            </Section>

            <Section id="creating-strategy" title="Creating a New Strategy" icon="🎯">
                <StepList>
                    <Step num={1}>Navigate to Strategies tab</Step>
                    <Step num={2}>Click "New Strategy" button</Step>
                    <Step num={3}>Enter unique strategy name</Step>
                    <Step num={4}>Add description</Step>
                    <Step num={5}>Choose execution mode</Step>
                </StepList>
            </Section>

            <Section id="configuration" title="Strategy Configuration Guide" icon="⚙️">
                <SubSection title="1️⃣ Strategy Information">
                    <FieldList>
                        <Field name="Strategy Name" example="XAUUSD Multi-TP Strategy" />
                        <Field name="Description" example="Gold scalping with 3 TP levels for trending markets" />
                    </FieldList>
                </SubSection>

                <SubSection title="2️⃣ Trade Direction Identification">
                    <p className="text-zinc-300 mb-4">
                        Configure how the bot identifies BUY and SELL signals using keyword logic.
                    </p>

                    <CodeBlock>
                        {`BUY Logic Examples:
GOLD AND BUY AND NOW
XAUUSD OR GOLD AND BUY

SELL Logic Examples:
GOLD AND SELL AND NOW
XAUUSD OR GOLD AND SELL`}</CodeBlock>

                    <div className="mt-4 bg-white/5 rounded-lg p-4">
                        <p className="text-sm font-semibold text-white mb-2">Logic Operators:</p>
                        <ul className="list-disc list-inside text-sm text-zinc-400 space-y-1">
                            <li><Code>AND</Code> - All keywords must be present</li>
                            <li><Code>OR</Code> - At least one keyword must be present</li>
                            <li>Combine multiple keywords for precision</li>
                        </ul>
                    </div>

                    <Alert type="info">
                        <strong>💡 Tip:</strong> Use specific keywords to avoid false signals. The more specific, the better!
                    </Alert>
                </SubSection>

                <SubSection title="3️⃣ Trade Parameters">
                    <div className="space-y-4">
                        <div>
                            <p className="text-sm font-semibold text-white mb-2">Number of Trades</p>
                            <ul className="list-disc list-inside text-sm text-zinc-400 space-y-1">
                                <li><strong>Range:</strong> 1-10 trades per signal</li>
                                <li><strong>Purpose:</strong> Execute multiple positions with different TP levels</li>
                                <li><strong>Example:</strong> Set to 3 to place 3 trades with TP1, TP2, TP3</li>
                                <li><strong>Important:</strong> Each trade uses the FULL lot size from settings</li>
                            </ul>
                        </div>

                        <Alert type="warning">
                            <strong>Example:</strong> Lot size 0.1 + 3 trades = Total exposure 0.3 lots
                        </Alert>
                    </div>
                </SubSection>

                <SubSection title="4️⃣ Take Profit Strategy">
                    <p className="text-zinc-300 mb-4">
                        Choose how the bot determines Take Profit levels:
                    </p>

                    <div className="space-y-4">
                        <div className="bg-white/5 border border-white/10 rounded-lg p-4">
                            <p className="text-sm font-semibold text-white mb-2">Option A: Use TP from Strategy (Fixed Points)</p>
                            <ul className="list-disc list-inside text-sm text-zinc-400 space-y-1">
                                <li>Define fixed TP levels in points</li>
                                <li>Each trade gets its corresponding TP level</li>
                                <li>Example: Trade 1: 200pts, Trade 2: 400pts, Trade 3: 600pts</li>
                                <li><strong>When to use:</strong> Consistent, fixed targets</li>
                            </ul>
                        </div>

                        <div className="bg-white/5 border border-white/10 rounded-lg p-4">
                            <p className="text-sm font-semibold text-white mb-2">Option B: Use TP from Signal (Keyword-Based)</p>
                            <ul className="list-disc list-inside text-sm text-zinc-400 space-y-1">
                                <li>Bot extracts TP from signal message</li>
                                <li>Default Keywords: TP, TP1, TP2, TP3, TAKE PROFIT</li>
                                <li><strong>When to use:</strong> Signal provider gives specific TP levels</li>
                            </ul>
                        </div>
                    </div>
                </SubSection>

                <SubSection title="5️⃣ Trailing Take Profit Strategy">
                    <p className="text-zinc-300 mb-4">
                        Automatically moves your Stop Loss to protect profits as the trade moves in your favor.
                    </p>

                    <Alert type="info">
                        ☑️ Enable Trailing Take Profit (checked by default)
                    </Alert>

                    <Table
                        headers={["Level", "Profit Threshold", "Move SL To", "Meaning"]}
                        rows={[
                            ["Level 1", "200 points", "50 points profit", "Lock in 50pts when trade reaches 200pts"],
                            ["Level 2", "500 points", "200 points profit", "Lock in 200pts when trade reaches 500pts"],
                            ["Level 3", "1000 points", "500 points profit", "Lock in 500pts when trade reaches 1000pts"],
                        ]}
                    />

                    <div className="mt-4 bg-purple-500/10 border border-purple-500/20 rounded-lg p-4">
                        <p className="text-sm font-semibold text-purple-400 mb-2">Dynamic Trailing (After Level 3):</p>
                        <ul className="list-disc list-inside text-sm text-zinc-400 space-y-1">
                            <li><strong>For each additional:</strong> 400 points profit</li>
                            <li><strong>Move SL up by:</strong> 400 points</li>
                            <li><strong>Meaning:</strong> After Level 3, for every 400pts gained, move SL up by 400pts</li>
                        </ul>
                    </div>

                    <Alert type="warning">
                        <strong>⚠️ Important:</strong> SL levels must be in ascending order (Level 1 &lt; Level 2 &lt; Level 3)
                    </Alert>
                </SubSection>

                <SubSection title="6️⃣ Breakeven Strategy">
                    <p className="text-zinc-300 mb-4">
                        Choose how the bot moves Stop Loss to breakeven:
                    </p>

                    <div className="space-y-4">
                        <div className="bg-white/5 border border-white/10 rounded-lg p-4">
                            <p className="text-sm font-semibold text-white mb-2">Option A: Use Breakeven from Strategy (Threshold-Based)</p>
                            <FieldList>
                                <Field name="Move to breakeven at" example="300 points profit (default)" />
                                <Field name="Offset (points)" example="30 points (default)" />
                            </FieldList>
                            <p className="text-xs text-zinc-400 mt-2">
                                When trade reaches 300pts profit, SL moves to entry price ± 30pts
                            </p>
                        </div>

                        <div className="bg-white/5 border border-white/10 rounded-lg p-4">
                            <p className="text-sm font-semibold text-white mb-2">Option B: Use Breakeven from Signal (Keyword-Based)</p>
                            <ul className="list-disc list-inside text-sm text-zinc-400 space-y-1">
                                <li><strong>Keywords:</strong> BE, UPDATE BE, MOVE TO BE</li>
                                <li><strong>Fallback:</strong> 100 points (if no keyword found)</li>
                                <li>Bot monitors signals for breakeven keywords</li>
                                <li>When keyword detected, moves SL to breakeven</li>
                            </ul>
                        </div>
                    </div>
                </SubSection>

                <SubSection title="7️⃣ Stop Loss Strategy">
                    <p className="text-zinc-300 mb-4">
                        Choose how the bot determines Stop Loss:
                    </p>

                    <div className="space-y-4">
                        <div className="bg-white/5 border border-white/10 rounded-lg p-4">
                            <p className="text-sm font-semibold text-white mb-2">Option A: Use Stop Loss from Strategy (Fixed Points)</p>
                            <FieldList>
                                <Field name="Default SL (points)" example="600 points (default)" />
                            </FieldList>
                            <p className="text-xs text-zinc-400 mt-2">
                                Every trade uses this fixed SL - Simple and consistent
                            </p>
                        </div>

                        <div className="bg-white/5 border border-white/10 rounded-lg p-4">
                            <p className="text-sm font-semibold text-white mb-2">Option B: Use Stop Loss from Signal (Keyword-Based)</p>
                            <ul className="list-disc list-inside text-sm text-zinc-400 space-y-1">
                                <li><strong>Keywords:</strong> SL, STOP LOSS, SL:</li>
                                <li><strong>Fallback SL:</strong> 600 points (if keyword not found)</li>
                                <li>Bot extracts SL from signal message</li>
                                <li>If no SL found, uses fallback value</li>
                            </ul>
                        </div>
                    </div>

                    <Alert type="warning">
                        <strong>⚠️ CRITICAL:</strong> NEVER trade without a Stop Loss. Always ensure SL is configured!
                    </Alert>
                </SubSection>

                <SubSection title="8️⃣ Signal Price Execution Settings">
                    <Alert type="info">
                        Only applicable when using "Signal Price Execution" mode
                    </Alert>

                    <div className="mt-4 space-y-4">
                        <div>
                            <p className="text-sm font-semibold text-white mb-2">Entry Keywords</p>
                            <CodeBlock>
                                {`Default Keywords:
ENTRY, ENTER, ENTRY IN, BUY BETWEEN, SELL BETWEEN`}
                            </CodeBlock>
                            <p className="text-xs text-zinc-400 mt-2">
                                Used to identify entry price information in signals
                            </p>
                        </div>

                        <div>
                            <p className="text-sm font-semibold text-white mb-2">Entry Range Pick</p>
                            <p className="text-sm text-zinc-400 mb-2">When signal specifies a price range, choose:</p>
                            <ul className="list-disc list-inside text-sm text-zinc-400 space-y-1">
                                <li><strong>Lowest:</strong> Use the lowest price in range (aggressive)</li>
                                <li><strong>Mid:</strong> Use the middle of the range (balanced) ⭐ Recommended</li>
                                <li><strong>Highest:</strong> Use the highest price in range (conservative)</li>
                            </ul>
                        </div>

                        <div>
                            <p className="text-sm font-semibold text-white mb-2">Entry Tolerance</p>
                            <FieldList>
                                <Field name="Tolerance" example="50 points (default)" />
                            </FieldList>
                            <p className="text-xs text-zinc-400 mt-2">
                                Maximum distance from signal's entry price. If current price is within tolerance, execute immediately.
                            </p>
                        </div>

                        <div className="bg-gradient-to-r from-purple-500/10 to-blue-500/10 border border-purple-500/20 rounded-lg p-4">
                            <p className="text-sm font-semibold text-white mb-3">When Current Price NOT Within Signal Range - Choose One:</p>

                            <div className="space-y-3">
                                <div className="bg-black/30 rounded-lg p-3">
                                    <p className="text-sm font-semibold text-green-400 mb-2">Method 1: Monitor Price and Execute at Market ⭐ (Beginners)</p>
                                    <ul className="list-disc list-inside text-xs text-zinc-400 space-y-1">
                                        <li>Bot monitors price continuously</li>
                                        <li>If price reaches range: Executes at market immediately</li>
                                        <li>If expiry reached: Executes at current market price anyway</li>
                                        <li><strong>Guarantees execution</strong> - Won't miss signals</li>
                                    </ul>
                                </div>

                                <div className="bg-black/30 rounded-lg p-3">
                                    <p className="text-sm font-semibold text-blue-400 mb-2">Method 2: Place Pending Order ⭐ (Precise Entries)</p>
                                    <ul className="list-disc list-inside text-xs text-zinc-400 space-y-1">
                                        <li>Bot places pending order at signal's entry price</li>
                                        <li>Order sits in MT5 waiting for price</li>
                                        <li>Executes only when price touches entry level</li>
                                        <li><strong>May not fill</strong> if price doesn't reach entry</li>
                                        <li>Order remains even if bot stops</li>
                                    </ul>
                                </div>
                            </div>
                        </div>

                        <div>
                            <p className="text-sm font-semibold text-white mb-2">Expire Waiting After</p>
                            <FieldList>
                                <Field name="Expiry Time" example="120 minutes (default)" />
                            </FieldList>
                            <p className="text-xs text-zinc-400 mt-2">
                                Maximum time to wait for entry price. After expiry, bot either executes at market or cancels (based on method chosen).
                            </p>
                        </div>
                    </div>
                </SubSection>

                <SubSection title="9️⃣ Advanced Risk Management (Premium Users)">
                    <Alert type="warning">
                        <strong>Premium Feature:</strong> Requires premium license. Contact support to upgrade if needed.
                    </Alert>

                    <div className="mt-4 space-y-6">
                        <div>
                            <p className="text-sm font-semibold text-white mb-2">☑️ Activate Advance Risk Management</p>
                            <p className="text-xs text-zinc-400">Enable this checkbox to access risk management features</p>
                        </div>

                        <div className="bg-white/5 border border-white/10 rounded-lg p-4">
                            <p className="text-sm font-semibold text-white mb-3">Starting Balance Source</p>
                            <p className="text-xs text-zinc-400 mb-3">Determines baseline for daily P/L calculations:</p>

                            <div className="space-y-2">
                                <div className="bg-black/30 rounded p-2">
                                    <p className="text-xs font-semibold text-white">MT5 Account Equity at Midnight</p>
                                    <p className="text-xs text-zinc-400">Balance + floating P/L. Best for: Active traders with overnight positions</p>
                                </div>
                                <div className="bg-black/30 rounded p-2">
                                    <p className="text-xs font-semibold text-white">MT5 Account Balance at Midnight</p>
                                    <p className="text-xs text-zinc-400">Closed trades only. Best for: Day traders who close all positions daily</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
                            <p className="text-sm font-semibold text-red-400 mb-3">Maximum Daily Loss</p>

                            <div className="space-y-3">
                                <div>
                                    <p className="text-xs text-zinc-300 mb-1">☑️ Enable Maximum Daily Loss</p>
                                    <FieldList>
                                        <Field name="Amount" example="195 (or any value 0-1,000,000,000)" />
                                        <Field name="Type" example="Dollar Value OR Percentage (%)" />
                                    </FieldList>
                                </div>

                                <div>
                                    <p className="text-xs font-semibold text-white mb-2">Action for Running Orders (when limit reached):</p>
                                    <ul className="list-disc list-inside text-xs text-zinc-400 space-y-1">
                                        <li><strong>Immediate Exit:</strong> Closes ALL positions immediately</li>
                                        <li><strong>Sound Alert:</strong> Plays alert, continues trading</li>
                                        <li><strong>No New Entries:</strong> Stops new trades, manages existing</li>
                                        <li><strong>Stop Bot:</strong> Stops bot (⚠️ existing trades become unmanaged!)</li>
                                    </ul>
                                </div>

                                <Alert type="warning">
                                    <strong>Example:</strong> Starting Balance $10,000 + Max Loss 5% = $500. When daily loss reaches -$500, action triggers.
                                </Alert>
                            </div>
                        </div>

                        <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4">
                            <p className="text-sm font-semibold text-green-400 mb-3">Daily Profit Target</p>

                            <div className="space-y-3">
                                <div>
                                    <p className="text-xs text-zinc-300 mb-1">☑️ Enable Daily Profit Target</p>
                                    <FieldList>
                                        <Field name="Amount" example="195 (or any value 0-1,000,000,000)" />
                                        <Field name="Type" example="Dollar Value OR Percentage (%)" />
                                    </FieldList>
                                </div>

                                <div>
                                    <p className="text-xs font-semibold text-white mb-2">Action for Running Orders (when target reached):</p>
                                    <ul className="list-disc list-inside text-xs text-zinc-400 space-y-1">
                                        <li><strong>Immediate Exit:</strong> Closes ALL positions, locks in profits</li>
                                        <li><strong>Sound Alert:</strong> Plays alert, you decide whether to continue</li>
                                        <li><strong>No New Entries:</strong> Stops new trades, lets current trades finish</li>
                                        <li><strong>Stop Bot:</strong> Stops bot for the day (⚠️ trades become unmanaged!)</li>
                                    </ul>
                                </div>

                                <Alert type="success">
                                    <strong>Example:</strong> Starting Balance $10,000 + Profit Target 5% = $500. When daily profit reaches +$500, action triggers.
                                </Alert>
                            </div>
                        </div>

                        <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
                            <p className="text-sm font-semibold text-blue-400 mb-2">💡 Important Notes:</p>
                            <ul className="list-disc list-inside text-xs text-zinc-400 space-y-1">
                                <li><strong>Dollar Value:</strong> Fixed amount, doesn't scale with account</li>
                                <li><strong>Percentage (%):</strong> Scales with starting balance automatically</li>
                                <li><strong>Reset Timing:</strong> Both limits reset at midnight (Analytics Timezone)</li>
                                <li><strong>Per-Strategy:</strong> Limits are per-strategy, not account-wide</li>
                                <li><strong>"Stop Bot" Warning:</strong> Existing trades won't be managed for trailing stops, breakeven, or modifications</li>
                            </ul>
                        </div>

                        <div>
                            <p className="text-sm font-semibold text-white mb-2">Configuration Examples:</p>

                            <div className="space-y-2">
                                <div className="bg-black/30 rounded p-3">
                                    <p className="text-xs font-semibold text-white mb-1">Conservative Risk Management</p>
                                    <CodeBlock>
                                        {`✅ Activate Advance Risk Management
Starting Balance: MT5 Account Balance at Midnight
✅ Max Daily Loss: $200 (Dollar) → Action: Immediate Exit
✅ Daily Profit Target: $300 (Dollar) → Action: No New Entries`}
                                    </CodeBlock>
                                </div>

                                <div className="bg-black/30 rounded p-3">
                                    <p className="text-xs font-semibold text-white mb-1">Percentage-Based Management</p>
                                    <CodeBlock>
                                        {`✅ Activate Advance Risk Management
Starting Balance: MT5 Account Equity at Midnight
✅ Max Daily Loss: 3% (Percentage) → Action: No New Entries
✅ Daily Profit Target: 5% (Percentage) → Action: Sound Alert`}
                                    </CodeBlock>
                                </div>
                            </div>
                        </div>
                    </div>
                </SubSection>
            </Section>

            <Section id="advanced-features" title="Advanced Features" icon="🚀">
                <SubSection title="Multiple Take Profit Levels">
                    <p className="text-zinc-300 mb-4">
                        Execute multiple positions with different TP levels to balance early profit-taking with letting winners run.
                    </p>

                    <div className="bg-white/5 rounded-lg p-4 mb-4">
                        <p className="text-sm font-semibold text-white mb-2">How it works:</p>
                        <ul className="list-disc list-inside text-sm text-zinc-400 space-y-1">
                            <li>Each trade uses the full lot size</li>
                            <li>Trade 1 closes at TP1, Trade 2 at TP2, Trade 3 at TP3</li>
                            <li>Allows partial profit-taking while keeping positions open</li>
                        </ul>
                    </div>

                    <Alert type="info">
                        <strong>Example:</strong> Lot Size 0.1 + 3 trades = 3 trades of 0.1 lots each (total 0.3 lots exposure)
                    </Alert>
                </SubSection>

                <SubSection title="Keyword Logic System">
                    <p className="text-zinc-300 mb-4">
                        Understanding AND/OR logic for signal detection:
                    </p>

                    <div className="space-y-3">
                        <div className="bg-white/5 rounded-lg p-3">
                            <p className="text-sm font-semibold text-white mb-2">AND Logic</p>
                            <CodeBlock>{`GOLD AND BUY AND NOW`}</CodeBlock>
                            <p className="text-xs text-zinc-400 mt-2">ALL keywords must be present - More specific, fewer false signals</p>
                        </div>

                        <div className="bg-white/5 rounded-lg p-3">
                            <p className="text-sm font-semibold text-white mb-2">OR Logic</p>
                            <CodeBlock>{`XAUUSD OR GOLD AND BUY`}</CodeBlock>
                            <p className="text-xs text-zinc-400 mt-2">At least ONE keyword from OR group - More flexible matching</p>
                        </div>

                        <div className="bg-white/5 rounded-lg p-3">
                            <p className="text-sm font-semibold text-white mb-2">Combined Logic</p>
                            <CodeBlock>{`(XAUUSD OR GOLD) AND BUY AND (NOW OR ENTRY)`}</CodeBlock>
                            <p className="text-xs text-zinc-400 mt-2">Combines both operators - Maximum flexibility</p>
                        </div>
                    </div>

                    <Alert type="info">
                        <strong>Best Practice:</strong> Start with specific keywords (AND logic), then add OR variations for synonyms. Test with historical signals and refine based on results.
                    </Alert>
                </SubSection>

                <SubSection title="Entry Price Range Handling">
                    <p className="text-zinc-300 mb-4">
                        When signal provides a range (e.g., "Entry: 2050 - 2055"):
                    </p>

                    <Table
                        headers={["Option", "Entry Price", "Risk/Reward", "Fill Probability"]}
                        rows={[
                            ["Lowest (2050)", "Most aggressive", "Highest R/R", "May not fill"],
                            ["Mid (2052.5)", "Balanced", "Moderate R/R", "Good probability ⭐"],
                            ["Highest (2055)", "Most conservative", "Lower R/R", "Highest probability"],
                        ]}
                    />

                    <Alert type="success">
                        <strong>Recommendation:</strong> Use "Mid" for most strategies unless you have specific reasons for others.
                    </Alert>
                </SubSection>
            </Section>

            <Section id="best-practices" title="Best Practices" icon="✅">
                <SubSection title="DO's">
                    <CheckList>
                        <CheckItem>Always use Stop Loss</CheckItem>
                        <CheckItem>Test strategies on demo first</CheckItem>
                        <CheckItem>Start with conservative settings</CheckItem>
                        <CheckItem>Monitor performance regularly</CheckItem>
                        <CheckItem>Use descriptive strategy names</CheckItem>
                        <CheckItem>Document your settings</CheckItem>
                    </CheckList>
                </SubSection>

                <SubSection title="DON'Ts">
                    <CheckList>
                        <CheckItem>Don't over-optimize</CheckItem>
                        <CheckItem>Don't ignore risk management</CheckItem>
                        <CheckItem>Don't use vague keywords</CheckItem>
                        <CheckItem>Don't set unrealistic TPs</CheckItem>
                        <CheckItem>Don't neglect trailing stops</CheckItem>
                        <CheckItem>Don't switch modes randomly</CheckItem>
                    </CheckList>
                </SubSection>

                <Alert type="info">
                    <strong>Pro Tip:</strong> Start with 1-3 trades per signal. More trades increase exposure. Test thoroughly before scaling up.
                </Alert>
            </Section>
        </div>
    );
}

// Reusable UI Components
function Section({ id, title, icon, children }: any) {
    return (
        <section id={id} data-section={id} className="scroll-mt-28">
            <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6 md:p-8">
                <h2 className="text-2xl md:text-3xl font-bold text-white mb-6 flex items-center gap-3">
                    <span className="text-3xl md:text-4xl">{icon}</span>
                    {title}
                </h2>
                <div className="space-y-6">{children}</div>
            </div>
        </section>
    );
}

function SubSection({ title, children }: any) {
    return (
        <div className="space-y-4">
            <h3 className="text-xl font-semibold text-white">{title}</h3>
            {children}
        </div>
    );
}

function Alert({ type = "info", children }: { type?: "info" | "warning" | "success"; children: React.ReactNode }) {
    const styles = {
        info: "border-blue-500/30 bg-blue-500/10 text-blue-200",
        warning: "border-amber-500/30 bg-amber-500/10 text-amber-200",
        success: "border-emerald-500/30 bg-emerald-500/10 text-emerald-200",
    };

    return (
        <div className={`rounded-lg border ${styles[type]} px-4 py-3 text-sm leading-relaxed`}>
            {children}
        </div>
    );
}

function StepList({ children }: any) {
    return <ol className="space-y-3">{children}</ol>;
}

function Step({ num, children }: any) {
    return (
        <li className="flex gap-3">
            <div className="flex-shrink-0 w-7 h-7 rounded-full bg-[#5e17eb] text-white flex items-center justify-center font-bold text-sm">
                {num}
            </div>
            <div className="flex-1 text-zinc-300 pt-0.5">{children}</div>
        </li>
    );
}

function CheckList({ children }: any) {
    return <div className="space-y-2">{children}</div>;
}

function CheckItem({ children }: any) {
    return (
        <div className="flex items-start gap-2 text-zinc-300">
            <svg className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span>{children}</span>
        </div>
    );
}

function Code({ children }: any) {
    return (
        <code className="px-2 py-1 bg-black/50 border border-white/10 rounded text-[#5e17eb] font-mono text-sm">
            {children}
        </code>
    );
}

function CodeBlock({ children }: any) {
    return (
        <pre className="bg-black/50 border border-white/10 rounded-lg p-4 overflow-x-auto">
            <code className="text-sm text-zinc-300 font-mono whitespace-pre">{children}</code>
        </pre>
    );
}

function FieldList({ children }: any) {
    return <div className="space-y-4">{children}</div>;
}

function Field({ name, example, note, required }: any) {
    return (
        <div className="border-l-2 border-[#5e17eb]/50 pl-4">
            <div className="flex items-center gap-2 mb-1">
                <span className="font-semibold text-white">{name}</span>
                {required && <span className="text-xs bg-red-500/20 text-red-300 px-2 py-0.5 rounded">Required</span>}
            </div>
            {example && <Code>Example: {example}</Code>}
            {note && <p className="text-xs text-zinc-500 mt-1">{note}</p>}
        </div>
    );
}

function SettingField({ name, required, description, example }: any) {
    return (
        <div className="border-l-4 border-[#5e17eb] pl-4 py-3 space-y-2">
            <div className="flex items-center gap-2">
                <h4 className="text-lg font-semibold text-white">{name}</h4>
                {required && <span className="text-xs bg-red-500/20 text-red-300 px-2 py-1 rounded">Required</span>}
            </div>
            <p className="text-zinc-400 text-sm">{description}</p>
            {example && <Code>Example: {example}</Code>}
        </div>
    );
}

function Table({ headers, rows }: any) {
    return (
        <div className="overflow-x-auto">
            <table className="w-full text-sm border border-white/10 rounded-lg overflow-hidden">
                <thead className="bg-white/5">
                    <tr>
                        {headers.map((header: string, i: number) => (
                            <th key={i} className="text-left p-3 text-white font-semibold border-b border-white/10">
                                {header}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody className="text-zinc-300">
                    {rows.map((row: string[], i: number) => (
                        <tr key={i} className="border-b border-white/5 last:border-0">
                            {row.map((cell: string, j: number) => (
                                <td key={j} className="p-3">{cell}</td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

function TroubleshootingItem({ issue, solutions }: any) {
    return (
        <div className="border-l-4 border-red-500/50 pl-4 py-2 space-y-2">
            <h4 className="text-lg font-semibold text-white">❌ {issue}</h4>
            <ul className="space-y-1">
                {solutions.map((solution: string, i: number) => (
                    <li key={i} className="text-zinc-300 text-sm flex items-start gap-2">
                        <span className="text-emerald-400">✓</span>
                        <span>{solution}</span>
                    </li>
                ))}
            </ul>
        </div>
    );
}
