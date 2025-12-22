"use client";
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { DarkProductCard } from "@/components/DarkProductCard";
import { HeroTelegramSignals } from "@/components/HeroTelegramSignals";
import XmLogo from "../../broker_logos/XM-Logo.webp";
import TelegramLogo from "../../telegram.webp";
import TradingBotLogo from "../../Tradingbot - Copy.png";
import MT5Logo from "../../mt5.png";
import { resourceArticles } from "@/data/resources";
import { ProductSummaryCards } from "@/components/ProductSummaryCards";

const heroMessages = [
  {
    number: 1,
    text: "Stop losing money—missing Telegram signals",
    importantWords: ["Stop losing money", "Telegram signals"],
    subtext: "Your MT5 executes every trade automatically — no hesitation, no excuses.",
  },
  {
    number: 2,
    text: "Fast signals need faster execution",
    importantWords: ["Fast signals", "faster execution"],
    subtext: "Automate every Telegram signal directly into MT5 with precision.",
  },
  {
    number: 3,
    text: "Manual trading is costing you profits",
    importantWords: ["Manual trading", "costing", "profits"],
    subtext: "Let your Telegram‑to‑MT5 auto‑trader fire every setup instantly.",
  },
  {
    number: 4,
    text: "Your signals don't sleep why should trade?",
    importantWords: ["signals don't sleep", "trade"],
    subtext: "24/7 automated MT5 execution for forex, gold, and indices.",
  },
  {
    number: 5,
    text: "Dominate the market with automation",
    importantWords: ["Dominate", "market", "automation"],
    subtext: "Turn Telegram signals into real MT5 trades before other traders even react.",
  },
];

export default function Home() {
  const [showFullFeatureComparison, setShowFullFeatureComparison] = useState<
    Record<string, boolean>
  >({});
  
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
  const [displayedText, setDisplayedText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [isFadingOut, setIsFadingOut] = useState(false);

  // Helper function to split text into two lines - balanced split
  const splitIntoTwoLines = (text: string) => {
    // Special handling for text with em dash: split at the em dash
    if (text.includes('—')) {
      const dashIndex = text.indexOf('—');
      const beforeDash = text.substring(0, dashIndex + 1); // Include the em dash
      const afterDash = text.substring(dashIndex + 1).trim();
      return { line1: beforeDash, line2: afterDash };
    }
    
    // Regular split for other texts
    const words = text.split(' ');
    const totalChars = text.length;
    const targetChars = Math.floor(totalChars * 0.5);
    
    let line1Chars = 0;
    let line1Words: string[] = [];
    
    for (const word of words) {
      const wordLength = word.length + (line1Words.length > 0 ? 1 : 0); // +1 for space
      if (line1Chars + wordLength <= targetChars || line1Words.length === 0) {
        line1Words.push(word);
        line1Chars += wordLength;
      } else {
        break;
      }
    }
    
    const line1 = line1Words.join(' ');
    const line2 = words.slice(line1Words.length).join(' ');
    return { line1, line2 };
  };

  // Helper function to render text with important words highlighted
  const renderTextWithHighlights = (text: string, importantWords: string[]) => {
    if (!text) return null;
    
    // Create a map of character positions to whether they're important
    const textLower = text.toLowerCase();
    const charMap = new Array(text.length).fill(false);
    
    // Mark important words/phrases
    importantWords.forEach(phrase => {
      const phraseLower = phrase.toLowerCase();
      let searchIndex = 0;
      while (true) {
        const index = textLower.indexOf(phraseLower, searchIndex);
        if (index === -1) break;
        // Mark all characters in this phrase as important
        for (let i = index; i < index + phrase.length; i++) {
          charMap[i] = true;
        }
        searchIndex = index + 1;
      }
    });
    
    // Build parts array by grouping consecutive characters with same importance
    const parts: Array<{ text: string; isImportant: boolean }> = [];
    let currentPart = { text: '', isImportant: charMap[0] || false };
    
    for (let i = 0; i < text.length; i++) {
      const isImportant = charMap[i];
      if (isImportant === currentPart.isImportant) {
        currentPart.text += text[i];
      } else {
        if (currentPart.text) {
          parts.push(currentPart);
        }
        currentPart = { text: text[i], isImportant };
      }
    }
    
    // Add the last part
    if (currentPart.text) {
      parts.push(currentPart);
    }
    
    // If no parts (empty text), return null
    if (parts.length === 0) {
      return null;
    }
    
    return parts.map((part, index) => (
      <span
        key={index}
        className={part.isImportant ? "text-[#5e17eb]" : ""}
        style={part.isImportant ? {} : { fontSize: '0.8em' }}
      >
        {part.text}
      </span>
    ));
  };

  useEffect(() => {
    const currentMessage = heroMessages[currentMessageIndex];
    const fullText = currentMessage.text;
    let timeout: NodeJS.Timeout;

    if (!isDeleting && !isFadingOut && displayedText.length < fullText.length) {
      // Typing
      timeout = setTimeout(() => {
        setDisplayedText(fullText.slice(0, displayedText.length + 1));
      }, 50);
    } else if (!isDeleting && !isFadingOut && displayedText.length === fullText.length) {
      // Pause before fading out
      timeout = setTimeout(() => {
        setIsFadingOut(true);
      }, 3000);
    } else if (isFadingOut) {
      // Fade out animation (wait for animation to complete)
      timeout = setTimeout(() => {
        setIsFadingOut(false);
        setIsDeleting(true);
        setDisplayedText("");
      }, 500); // Match fade-out duration
    } else if (isDeleting && displayedText.length === 0) {
      // Move to next message
      setIsDeleting(false);
      setCurrentMessageIndex((prev) => (prev + 1) % heroMessages.length);
    }

    return () => clearTimeout(timeout);
  }, [displayedText, isDeleting, isFadingOut, currentMessageIndex]);

  const steps = [
    {
      title: "Connect Telegram",
      description: "Point the bot to your signal channel or group.",
    },
    {
      title: "Configure strategy",
      description: "Choose lot sizing, TP / SL behavior, and risk limits.",
    },
    {
      title: "Map signal format",
      description: "Tell the bot how to read pair, direction, and price levels.",
    },
    {
      title: "Run on VPS or PC",
      description: "Keep MT5 and the bot online for continuous execution.",
    },
    {
      title: "Monitor & refine",
      description: "Track trades and tweak settings as your strategy evolves.",
    },
  ];

  const comparisonRows = [
    {
      icon: "⚡",
      label: "Execution speed",
      manual: "You manually copy signals when you are online.",
      bot: "Orders are placed automatically within seconds of the signal.",
    },
    {
      icon: "⏰",
      label: "Missed trades",
      manual: "Easy to miss late‑night or work‑time signals.",
      bot: "Runs 24/7 on VPS so signals are not missed.",
    },
    {
      icon: "🎯",
      label: "Consistency",
      manual: "Decisions can be emotional and inconsistent.",
      bot: "Rules are followed exactly as configured every time.",
    },
    {
      icon: "🧠",
      label: "Workload",
      manual: "You monitor chats and place every trade by hand.",
      bot: "You focus on strategy while execution is automated.",
    },
  ];

  const eaComparisonRows = [
    {
      icon: "⚙️",
      label: "Setup steps",
      ea: "Install MT4/MT5 EA plugin, configure each terminal, then link to the copier app.",
      ours: "Install one Windows app, connect Telegram and MT5 once, and start copying.",
    },
    {
      icon: "🧩",
      label: "Components required",
      ea: "Desktop controller + separate EA scripts inside every MT4/MT5 terminal.",
      ours: "Single desktop application that talks directly to your MT5 terminal.",
    },
    {
      icon: "🔄",
      label: "Updates & maintenance",
      ea: "Keep both the desktop app and all installed EAs up to date across terminals.",
      ours: "Update just one desktop app when new versions are released.",
    },
    {
      icon: "🔁",
      label: "Changing brokers or accounts",
      ea: "Re‑install or re‑link EAs when switching accounts or terminals.",
      ours: "Update MT5 login details in Settings; no EA re‑installation needed.",
    },
    {
      icon: "👤",
      label: "Who it suits best",
      ea: "More comfortable for advanced or technically confident traders.",
      ours: "Designed for traders who want a simpler setup with guided support.",
    },
  ];

  const featureCategories = [
    {
      id: "execution",
      icon: "⚡",
      title: "Execution & parsing",
      caption: "How signals are understood and turned into trades.",
      features: [
        {
          label: "AI / image signal parsing",
          competitors: "Use AI / Vision / OCR engines to parse screenshots and any text layout.",
          ours: "Deliberately text‑only: configurable keyword + regex rules tuned for FX, GOLD, crypto formats you control.",
          advantage: true,
        },
        {
          label: "Flexible text formats",
          competitors: "Handle most formats but often hide mapping logic behind black‑box AI.",
          ours: "Per‑strategy parsing rules so each signal channel can have its own BUY/SELL, SL/TP, and entry extraction logic.",
          advantage: true,
        },
        {
          label: "Trailing take‑profit & breakeven",
          competitors: "Built‑in trailing and breakeven, usually with a single rule set.",
          ours: "Central BreakevenManager per strategy with multi‑level trailing TP/SL and automatic SL‑to‑entry behaviour.",
          advantage: true,
        },
        {
          label: "Execution speed",
          competitors: "Market leaders advertise 70–300ms execution depending on VPS and broker.",
          ours: "Desktop MT5 API with low‑latency execution; exact milliseconds depend on your VPS and broker routing.",
          advantage: false,
        },
      ],
    },
    {
      id: "platform",
      icon: "🖥️",
      title: "Platform & setup",
      caption: "Where it runs and how hard it is to configure.",
      features: [
        {
          label: "Architecture",
          competitors: "Windows desktop controller + MT4/MT5 EAs that must be installed into each terminal.",
          ours: "Pure Windows desktop app connecting directly to MT5; no EA deployment or per‑terminal scripts.",
          advantage: true,
        },
        {
          label: "Other platform support (MT4, cTrader, DXTrade…)",
          competitors: "Some cover 4–5 trading platforms via separate EAs or connectors.",
          ours: "Not required – SignalTradingBots focuses on MT5 and handles all automation through your MT5 terminal.",
          advantage: true,
        },
        {
          label: "Algo trading switch",
          competitors: "User must manually enable algo/auto‑trading in MT4/MT5 and keep it on.",
          ours: "Attempts to toggle MT5 “Algo Trading” automatically via hotkeys and window focus during setup.",
          advantage: true,
        },
        {
          label: "VPS friendliness",
          competitors: "Designed for VPS but still require EA installs and MT4/MT5 configuration.",
          ours: "One Windows installer on a VPS with MT5 running – fewer moving parts to manage or break.",
          advantage: true,
        },
      ],
    },
    {
      id: "orders-risk",
      icon: "🛡️",
      title: "Orders, risk & prop‑firm tools",
      caption: "How positions are opened, managed and protected.",
      features: [
        {
          label: "Multi‑TP & partial close",
          competitors: "Support explicit partial closes and multiple TP levels.",
          ours: "Up to 10 trades per signal, each with its own TP – partial closes are handled via multiple positions instead of one big order.",
          advantage: true,
        },
        {
          label: "Price‑range entries & pending orders",
          competitors: "Standard pending orders with basic expiry controls.",
          ours: "Price‑range entry mode that waits for price to reach your zone and places multi‑TP pending orders with configurable expiry.",
          advantage: true,
        },
        {
          label: "Daily loss / profit guardrails",
          competitors: "Dedicated “prop firm modes” with daily and sometimes overall limits.",
          ours: "Per‑strategy daily loss and profit targets that can trigger No New Entries, Immediate Exit, or full stop of the bot.",
          advantage: true,
        },
        {
          label: "Hidden comments & discretion",
          competitors: "Offer options to hide provider details in trade comments.",
          ours: "MT5 comments are strategy/magic‑based only; signal provider or channel names are never written to trades.",
          advantage: true,
        },
      ],
    },
    {
      id: "analytics-support",
      icon: "📊",
      title: "Analytics, audit & support experience",
      caption: "How you see what’s happening and learn from it.",
      features: [
        {
          label: "Dashboard & daily progress",
          competitors: "Some provide profit charts or simple account stats.",
          ours: "Dashboard tab shows daily P&L, equity/balance, per‑strategy stats, and cumulative totals so you can track progress at a glance.",
          advantage: true,
        },
        {
          label: "Channel‑wise strategies & comparison",
          competitors: "Per‑channel or per‑provider settings exist, but scoring is often hidden.",
          ours: "Build custom strategies per signal channel with dedicated parsing and risk rules, plus panels that compare strategy performance.",
          advantage: true,
        },
        {
          label: "Per‑signal Audit tab",
          competitors: "May log activity, but rarely expose a full audit trail per signal.",
          ours: "Dedicated Audit tab records parse/validate/execute status, latency and full detail for every processed signal.",
          advantage: true,
        },
        {
          label: "Detailed logs & in‑app help",
          competitors: "Rely on simple logs and external web docs or Telegram groups.",
          ours: "Rich Logs tab with filters plus an in‑app Help tab that pulls news, promo banners and YouTube tutorials directly into the desktop app.",
          advantage: true,
        },
      ],
    },
  ];

  const testimonials = [
    {
      name: "Daniel M.",
      role: "Forex trader (demo to live)",
      quote:
        "After switching to the bot, I stopped missing late‑night signals. It quietly runs on my VPS and mirrors my Telegram channel.",
    },
    {
      name: "Sara K.",
      role: "Signal follower",
      quote:
        "Setup was straightforward and the risk controls give me confidence. I started on demo first, then moved to a small live account.",
    },
    {
      name: "Imran T.",
      role: "Automated trading enthusiast",
      quote:
        "Exactly what I needed: simple Telegram → MT5 automation without extra noise. Support helped me configure my broker in one session.",
    },
  ];

  const executionFlow = [
    {
      title: "Telegram signals",
      description: "Bot listens to your configured channels via Pyrogram/Telethon.",
      icon: "📩",
      image: TelegramLogo,
    },
    {
      title: "SignalTradingBots app",
      description: "Rules map each signal to strategies, TP/SL logic, and risk guardrails.",
      icon: "🤖",
      image: TradingBotLogo,
    },
    {
      title: "MT5 terminal",
      description: "Orders are executed on your MT5 terminal running on Windows or VPS.",
      icon: "📈",
      image: MT5Logo,
    },
  ];

  const securityHighlights = [
    "Runs on your own Windows PC or VPS – we never hold broker logins.",
    "MT5 trade comments never expose your signal providers or channels.",
    "Recommended workflow: start on demo, then go live once you trust the setup.",
    "Keep VPS monitored; if MT5 closes, the bot pauses to avoid unmanaged trades.",
  ];

  const supportItems = [
    {
      title: "Email & Telegram support",
      description: "support@signaltradingbots.com with typical 12–24h response windows.",
    },
    {
      title: "Guided onboarding",
      description: "We help map your channels, configure strategies, and verify MT5 connectivity.",
    },
    {
      title: "In-app help center",
      description: "News, promo banners, and YouTube walkthroughs are available directly inside the desktop app.",
    },
  ];

  const homePricingPlans = [
    {
      name: "Starter",
      badge: "For testing on demo",
      price: "$29/month",
      yearlyNote: "Save 10% with yearly billing",
      features: [
        "Ideal for demo and small live accounts",
        "Core Telegram → MT5 automation",
        "Basic configuration templates",
      ],
    },
    {
      name: "Pro",
      badge: "Most popular",
      featured: true,
      price: "$49/month",
      yearlyNote: "Save 10% with yearly billing",
      features: [
        "Full configuration flexibility",
        "Priority support during setup",
        "Best for active signal users",
      ],
    },
    {
      name: "Lifetime",
      badge: "New · One‑time payment",
      featured: false,
      price: "$999 one‑time",
      yearlyNote: "All future versions and features included",
      features: [
        "Single payment, long‑term usage",
        "Access to all future versions and major features",
        "Best for committed, long‑term traders",
      ],
    },
  ];

  const featuredResources = resourceArticles.slice(0, 3);

  const faqs = [
    {
      question: "Do I need a VPS?",
      answer:
        "We strongly recommend running the bot on a Windows VPS so it can stay online 24/7 with MT5 open.",
    },
    {
      question: "Which brokers are supported?",
      answer:
        "Any MT5 broker that allows Expert Advisors (EAs) should work. Always check your broker’s conditions and rules.",
    },
    {
      question: "Can I test on a demo account first?",
      answer:
        "Yes. You should always start on a demo account to validate your configuration before using real funds.",
    },
    {
      question: "Does the bot guarantee profits?",
      answer:
        "No. Trading involves significant risk and past performance does not guarantee future results.",
    },
  ];

  return (
    <>
      {/* Hero Section - Full Width (LIGHT) */}
      <section className="relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] w-screen bg-white pt-2 pb-16 overflow-hidden">
        {/* Telegram Signals Background Animation */}
        <HeroTelegramSignals opacity={0.35} />
        
        <div className="relative z-10 mx-auto flex max-w-6xl flex-col items-start gap-10 px-6">
          <div className="space-y-8 w-full max-w-6xl text-left">
            {/* Typewriter Animation */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="flex flex-col justify-start pt-0"
              style={{ minHeight: 'clamp(7rem, 25vw, 30rem)' }}
            >
              <h1 
                className="font-bold leading-tight mb-2 hero-typewriter-text" 
                style={{ 
                  fontSize: 'clamp(2.268rem, 8.505vw, 10.206rem)',
                  lineHeight: '1.1',
                  minHeight: 'clamp(5rem, 19vw, 22.5rem)',
                  maxHeight: 'clamp(5rem, 19vw, 22.5rem)',
                  overflow: 'hidden',
                  wordWrap: 'break-word',
                  wordBreak: 'break-word'
                }}
              >
                <motion.div 
                  className="text-[var(--text-main)]" 
                  style={{ display: 'block' }}
                  animate={{ opacity: isFadingOut ? 0 : 1 }}
                  transition={{ duration: 0.5, ease: "easeInOut" }}
                >
                  {(() => {
                    const fullText = heroMessages[currentMessageIndex].text;
                    const importantWords = heroMessages[currentMessageIndex].importantWords || [];
                    const { line1, line2 } = splitIntoTwoLines(fullText);
                    const line1Length = line1.length;
                    
                    // Display first line until it's complete, then second line
                    const firstLineText = displayedText.substring(0, line1Length);
                    const secondLineText = displayedText.substring(line1Length);
                    const isFirstLineComplete = firstLineText.length >= line1Length;
                    const hasSecondLine = secondLineText.length > 0;
                    
                    return (
                      <>
                        {renderTextWithHighlights(firstLineText, importantWords)}
                        {(isFirstLineComplete || hasSecondLine) && (
                          <>
                            <br />
                            {hasSecondLine && (
                              <>
                                {renderTextWithHighlights(secondLineText, importantWords)}
                                {!isFadingOut && (
                                  <motion.span
                                    animate={{ opacity: [1, 0] }}
                                    transition={{ duration: 0.8, repeat: Infinity, repeatType: "reverse" }}
                                    className="inline-block w-2 h-[4.5rem] md:h-[5.4rem] lg:h-[6.3rem] bg-[var(--brand-blue-deep)] ml-3"
                                    style={{ verticalAlign: 'middle', display: 'inline-block' }}
                                  />
                                )}
                              </>
                            )}
                          </>
                        )}
                        {!isFirstLineComplete && !hasSecondLine && !isFadingOut && (
                          <motion.span
                            animate={{ opacity: [1, 0] }}
                            transition={{ duration: 0.8, repeat: Infinity, repeatType: "reverse" }}
                            className="inline-block w-2 h-[4.5rem] md:h-[5.4rem] lg:h-[6.3rem] bg-[var(--brand-blue-deep)] ml-3"
                            style={{ verticalAlign: 'middle', display: 'inline-block' }}
                          />
                        )}
                      </>
                    );
                  })()}
                </motion.div>
              </h1>
              
              <motion.p
                key={currentMessageIndex}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: isFadingOut ? 0 : 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="text-[0.9rem] md:text-base lg:text-lg text-[var(--text-muted)] max-w-5xl leading-relaxed mt-2"
              >
                {heroMessages[currentMessageIndex].subtext}
              </motion.p>
            </motion.div>
            <div className="flex flex-wrap gap-4 mt-8">
              <Link
                href="/products"
                className="rounded-md bg-[var(--brand-blue)] px-5 py-2 text-[0.675rem] font-medium text-white shadow-sm transition hover:bg-[var(--brand-blue-deep)] hover:scale-105 hover:shadow-lg"
              >
                View Products
              </Link>
              <Link
                href="/specs"
                className="rounded-md border border-[var(--border-subtle)] px-5 py-2 text-[0.675rem] font-medium text-[var(--text-main)] transition hover:border-[var(--brand-blue-soft)] hover:text-[var(--brand-blue-deep)]"
              >
                View Specs
              </Link>
              <Link
                href="#pricing"
                className="rounded-md border border-[var(--border-subtle)] px-5 py-2 text-[0.675rem] font-medium text-[var(--text-main)] transition hover:border-[var(--brand-blue-soft)] hover:text-[var(--brand-blue-deep)]"
              >
                View product details
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works (DARK) - MOVED TO TOP - ENHANCED WITH ANIMATIONS */}
      <section className="relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] w-screen bg-black py-20">
        <div className="mx-auto max-w-6xl px-6">
          <div className="mb-12 text-center">
            <motion.h2
              initial={{ opacity: 0, y: -20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="mb-3 text-2xl font-semibold text-white md:text-3xl"
            >
              How it works
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: -10 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="mx-auto max-w-2xl text-sm text-blue-300 md:text-base"
            >
              A clear step‑by‑step flow from Telegram signal to MT5 execution so you know
              exactly what the bot is doing.
            </motion.p>
          </div>

          {/* Process Flow Container */}
          <div className="relative">
            {/* Animated Connection Lines with Arrows */}
            <svg
              className="absolute left-0 top-1/2 w-full h-32 pointer-events-none"
              style={{ transform: "translateY(-50%)" }}
              viewBox="0 0 1200 100"
              preserveAspectRatio="none"
            >
              <defs>
                <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.5" />
                  <stop offset="50%" stopColor="#3b82f6" stopOpacity="1" />
                  <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.5" />
                </linearGradient>
              </defs>

              {/* Connection Lines and Arrows */}
              {[0, 1, 2, 3].map((i) => {
                const x1 = (i + 1) * 20 + 5;
                const x2 = (i + 2) * 20 - 5;
                const midX = x1 + (x2 - x1) * 0.5;
                return (
                  <g key={`connector-${i}`}>
                    {/* Animated line */}
                    <motion.line
                      x1={`${x1}%`}
                      y1="50"
                      x2={`${x2}%`}
                      y2="50"
                      stroke="url(#gradient)"
                      strokeWidth="3"
                      strokeDasharray="8,4"
                      initial={{ pathLength: 0, opacity: 0 }}
                      whileInView={{ pathLength: 1, opacity: 1 }}
                      transition={{
                        duration: 0.8,
                        delay: 0.3 + i * 0.1,
                      }}
                      viewport={{ once: false }}
                    />
                    {/* Animated Arrow - Larger and More Visible */}
                    <motion.g
                      initial={{ opacity: 0 }}
                      whileInView={{ opacity: 1 }}
                      transition={{
                        duration: 0.6,
                        delay: 0.6 + i * 0.1,
                      }}
                      viewport={{ once: false }}
                    >
                      {/* Arrow head pointing right */}
                      <polygon
                        points={`${midX},35 ${midX + 1.5},50 ${midX},65`}
                        fill="#3b82f6"
                        opacity="0.9"
                      />
                      <line
                        x1={`${midX - 1}`}
                        y1="50"
                        x2={`${midX + 1.5}`}
                        y2="50"
                        stroke="#3b82f6"
                        strokeWidth="2"
                        opacity="0.9"
                      />
                    </motion.g>
                  </g>
                );
              })}
            </svg>

            {/* Reordered Step Cards - 2>1, 3>2, 1>3 pattern for first 3 */}
            <div className="grid gap-6 md:grid-cols-5 relative z-10">
              {/* Position 1: Step 2 (Configure Strategy) */}
              {[steps[1], steps[2], steps[0], steps[3], steps[4]].map((step, index) => {
                const originalIndex = steps.indexOf(step);
                return (
                  <motion.div
                    key={step.title}
                    initial={{ opacity: 0, y: 30, scale: 0.8 }}
                    whileInView={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{
                      duration: 0.6,
                      delay: index * 0.25,
                    }}
                    viewport={{ once: false }}
                    className="flex flex-col h-full"
                  >
                    <div className="relative h-full">
                      {/* Pulsing Glow Background */}
                      <motion.div
                        className="absolute inset-0 bg-gradient-to-r from-[#3b82f6]/20 to-[#8b5cf6]/20 rounded-lg blur-xl"
                        animate={{
                          opacity: [0.5, 1, 0.5],
                          scale: [0.95, 1.05, 0.95],
                        }}
                        transition={{
                          duration: 3,
                          delay: index * 0.2,
                          repeat: Infinity,
                        }}
                      />

                      {/* Card */}
                      <div className="relative h-full rounded-lg bg-gradient-to-br from-[#3a3a3a] to-[#1f1f1f] p-5 text-left shadow-lg border border-zinc-700/50 hover:border-[#3b82f6]/50 transition-all duration-300 group overflow-hidden flex flex-col">
                        {/* Animated Border Glow - Left to Right */}
                        <motion.div
                          className="absolute inset-0 bg-gradient-to-r from-[#3b82f6]/0 via-[#3b82f6]/10 to-[#3b82f6]/0 rounded-lg"
                          animate={{
                            x: ["-100%", "100%"],
                          }}
                          transition={{
                            duration: 2,
                            delay: index * 0.15,
                            repeat: Infinity,
                          }}
                        />

                        {/* Content */}
                        <div className="relative z-10 flex flex-col h-full">
                          {/* Step Number with Pulse - Centered */}
                          <div className="flex justify-center mb-3">
                            <motion.div
                              className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-[#8b5cf6] to-[#7c3aed] text-sm font-bold text-white shadow-lg"
                              animate={{
                                boxShadow: [
                                  "0 0 0 0 rgba(139, 92, 246, 0.7)",
                                  "0 0 0 10px rgba(139, 92, 246, 0)",
                                ],
                              }}
                              transition={{
                                duration: 2,
                                delay: index * 0.2,
                                repeat: Infinity,
                              }}
                            >
                              {index + 1}
                            </motion.div>
                          </div>

                          <h3 className="mb-2 text-center text-sm font-bold text-white uppercase tracking-wider leading-tight">
                            {step.title}
                          </h3>
                          <p className="text-xs text-blue-300 leading-relaxed text-center flex-grow">
                            {step.description}
                          </p>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Background Accent Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 -left-48 w-96 h-96 bg-[#3b82f6]/5 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 -right-48 w-96 h-96 bg-[#8b5cf6]/5 rounded-full blur-3xl" />
        </div>
      </section>

      {/* Execution flow & security reminders (LIGHT) - ENHANCED WITH ANIMATIONS */}
      <section className="relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] w-screen bg-white py-20">
        <div className="mx-auto max-w-6xl px-6 space-y-16">
          <div className="text-center">
            <motion.h3
              initial={{ opacity: 0, y: -20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="mb-2 text-3xl font-bold text-slate-900 md:text-4xl"
            >
              How execution works and how you stay in control
            </motion.h3>
            <motion.p
              initial={{ opacity: 0, y: -10 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="mx-auto max-w-3xl text-base text-slate-600 md:text-lg leading-relaxed"
            >
              A simple three-step flow: Telegram signals → SignalTradingBots desktop app →
              your MT5 terminal. Everything runs on hardware you manage.
            </motion.p>
          </div>

          {/* Three-step flow with animated arrows and step badges */}
          <div className="relative">
            {/* Animated SVG Arrows and Flow */}
            <svg
              className="absolute left-0 top-1/2 w-full h-32 pointer-events-none"
              style={{ transform: "translateY(-50%)" }}
              viewBox="0 0 1200 120"
              preserveAspectRatio="none"
            >
              <defs>
                <linearGradient id="flowGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.4" />
                  <stop offset="50%" stopColor="#3b82f6" stopOpacity="1" />
                  <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.4" />
                </linearGradient>
                <filter id="arrowGlow">
                  <feGaussianBlur stdDeviation="2" result="coloredBlur" />
                  <feMerge>
                    <feMergeNode in="coloredBlur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>

              {/* Flowing Arrows with Animation */}
              {[0, 1].map((i) => {
                const x1 = 20 + i * 40;
                const x2 = 40 + i * 40;
                const midX = (x1 + x2) / 2;
                return (
                  <g key={`flow-${i}`}>
                    {/* Thick arrow line */}
                    <motion.line
                      x1={`${x1}%`}
                      y1="60"
                      x2={`${x2}%`}
                      y2="60"
                      stroke="url(#flowGradient)"
                      strokeWidth="4"
                      strokeLinecap="round"
                      initial={{ pathLength: 0, opacity: 0 }}
                      whileInView={{ pathLength: 1, opacity: 1 }}
                      transition={{
                        duration: 0.8,
                        delay: 0.2 + i * 0.2,
                      }}
                      viewport={{ once: false }}
                    />
                    
                    {/* Large animated arrowhead */}
                    <motion.polygon
                      points={`${midX},40 ${midX + 2},60 ${midX},80`}
                      fill="#3b82f6"
                      filter="url(#arrowGlow)"
                      initial={{ opacity: 0, scale: 0 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      transition={{
                        duration: 0.4,
                        delay: 0.6 + i * 0.2,
                      }}
                      viewport={{ once: false }}
                    />

                    {/* Animated flowing dots along arrow */}
                    {[0, 0.3, 0.6].map((offset) => (
                      <motion.circle
                        key={`dot-${i}-${offset}`}
                        cx={`${x1 + (x2 - x1) * offset}%`}
                        cy="60"
                        r="2"
                        fill="#3b82f6"
                        initial={{ opacity: 0 }}
                        whileInView={{ 
                          opacity: [0.3, 1, 0.3],
                          cx: [`${x1}%`, `${x2}%`, `${x1}%`]
                        }}
                        transition={{
                          duration: 1.5,
                          delay: 1 + i * 0.3 + offset * 0.2,
                          repeat: Infinity,
                          repeatType: "loop"
                        }}
                        viewport={{ once: false }}
                      />
                    ))}
                  </g>
                );
              })}
            </svg>

            {/* Step Cards with Enhanced Design */}
            <div className="grid gap-8 md:grid-cols-3 relative z-10">
              {/* Card 1: Telegram Signals */}
              <motion.div
                initial={{ opacity: 0, y: 40, scale: 0.8 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.6, delay: 0 }}
                viewport={{ once: false }}
                whileHover={{ y: -12, boxShadow: "0 20px 40px rgba(37, 99, 235, 0.3)" }}
                className="relative"
              >
                <div className="relative h-full rounded-2xl border-2 border-blue-600 bg-gradient-to-br from-slate-900 to-slate-800 p-8 text-center shadow-lg hover:border-blue-500 transition-all group">
                  {/* Animated background glow */}
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-transparent opacity-0 group-hover:opacity-100 rounded-2xl"
                    transition={{ duration: 0.3 }}
                  />

                  {/* Icon */}
                  <motion.div
                    className="relative z-10 mb-6 flex justify-center"
                    animate={{ y: [0, -8, 0] }}
                    transition={{ duration: 3, repeat: Infinity }}
                  >
                    <div className="flex h-24 w-24 items-center justify-center rounded-full bg-slate-800 border-3 border-blue-500 shadow-md p-3 overflow-hidden">
                      <Image
                        src={TelegramLogo}
                        alt="Telegram"
                        width={80}
                        height={80}
                        className="h-full w-full object-contain"
                      />
                    </div>
                  </motion.div>

                  {/* Content */}
                  <div className="relative z-10">
                    <h4 className="mb-3 text-xl font-bold text-white">
                      Telegram signals
                    </h4>
                    <p className="text-sm text-blue-200 leading-relaxed">
                      Bot listens to your configured channels via Pyrogram/Telethon.
                    </p>
                  </div>
                </div>
              </motion.div>

              {/* Card 2: SignalTradingBots App */}
              <motion.div
                initial={{ opacity: 0, y: 40, scale: 0.8 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.6, delay: 1 }}
                viewport={{ once: false }}
                whileHover={{ y: -12, boxShadow: "0 20px 40px rgba(37, 99, 235, 0.3)" }}
                className="relative"
              >
                <div className="relative h-full rounded-2xl border-2 border-blue-700 bg-gradient-to-br from-slate-900 to-slate-800 p-8 text-center shadow-lg hover:border-blue-600 transition-all group">
                  {/* Animated background glow */}
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-transparent opacity-0 group-hover:opacity-100 rounded-2xl"
                    transition={{ duration: 0.3 }}
                  />

                  {/* Icon */}
                  <motion.div
                    className="relative z-10 mb-6 flex justify-center"
                    animate={{ y: [0, -8, 0] }}
                    transition={{ duration: 3, delay: 0.1, repeat: Infinity }}
                  >
                    <div className="flex h-24 w-24 items-center justify-center rounded-full bg-slate-800 border-3 border-blue-500 shadow-md p-2 overflow-hidden">
                      <Image
                        src={TradingBotLogo}
                        alt="SignalTradingBots"
                        width={80}
                        height={80}
                        className="h-full w-full object-contain"
                      />
                    </div>
                  </motion.div>

                  {/* Content */}
                  <div className="relative z-10">
                    <h4 className="mb-3 text-xl font-bold text-white">
                      SignalTradingBots app
                    </h4>
                    <p className="text-sm text-blue-200 leading-relaxed">
                      Rules map each signal to strategies, TP/SL logic, and risk guardrails.
                    </p>
                  </div>
                </div>
              </motion.div>

              {/* Card 3: MT5 Terminal */}
              <motion.div
                initial={{ opacity: 0, y: 40, scale: 0.8 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.6, delay: 2 }}
                viewport={{ once: false }}
                whileHover={{ y: -12, boxShadow: "0 20px 40px rgba(37, 99, 235, 0.3)" }}
              >
                <div className="relative h-full rounded-2xl border-2 border-blue-600 bg-gradient-to-br from-slate-900 to-slate-800 p-8 text-center shadow-lg hover:border-blue-500 transition-all group">
                  {/* Animated background glow */}
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-transparent opacity-0 group-hover:opacity-100 rounded-2xl"
                    transition={{ duration: 0.3 }}
                  />

                  {/* Icon */}
                  <motion.div
                    className="relative z-10 mb-6 flex justify-center"
                    animate={{ y: [0, -8, 0] }}
                    transition={{ duration: 3, delay: 0.2, repeat: Infinity }}
                  >
                    <div className="flex h-24 w-24 items-center justify-center rounded-full border-3 border-blue-500 shadow-md p-3 overflow-hidden">
                      <Image
                        src={MT5Logo}
                        alt="MetaTrader 5"
                        width={80}
                        height={80}
                        className="h-full w-full object-contain"
                      />
                    </div>
                  </motion.div>

                  {/* Content */}
                  <div className="relative z-10">
                    <h4 className="mb-3 text-xl font-bold text-white">
                      MT5 terminal
                    </h4>
                    <p className="text-sm text-blue-200 leading-relaxed">
                      Orders are executed on your MT5 terminal running on Windows or VPS.
                    </p>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>

          {/* Enhanced Security & Risk Reminders Section */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            viewport={{ once: false }}
            className="rounded-2xl border-2 border-blue-600 bg-slate-900 p-10 shadow-lg"
          >
            <div className="mb-8 flex items-center gap-3">
              <motion.div
                className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-blue-600 to-blue-700 text-2xl shadow-lg border border-blue-400"
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                🔒
              </motion.div>
              <h3 className="text-2xl font-bold text-white">
                Security & risk reminders
              </h3>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              {securityHighlights.map((item, index) => (
                <motion.div
                  key={item}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.5 + index * 0.1 }}
                  viewport={{ once: false }}
                  className="flex gap-4 rounded-xl bg-slate-800 p-4 border border-blue-500/50 hover:border-blue-400 transition-all"
                  whileHover={{ boxShadow: "0 8px 20px rgba(37, 99, 235, 0.2)" }}
                >
                  <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-blue-600 text-sm font-bold text-white">
                    ✓
                  </div>
                  <span className="text-sm text-blue-100 leading-relaxed">{item}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Pricing & product overview (LIGHT) */}
      <section id="pricing" className="relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] w-screen bg-white py-16">
        <div className="mx-auto max-w-6xl px-6 space-y-10">
          <div className="text-center">
            <h2 className="mb-3 text-2xl font-semibold text-[var(--text-main)] md:text-3xl">
              Simple packages for every trading stage
            </h2>
            <p className="mx-auto max-w-2xl text-sm text-[var(--text-muted)] md:text-base">
              Start with a monthly plan or secure a one‑time Lifetime license. Starter and Pro
              include a 10% discount when you choose yearly billing.
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {homePricingPlans.map((plan) => (
              <DarkProductCard
                key={plan.name}
                name={plan.name}
                badge={plan.badge}
                price={plan.price}
                yearlyNote={plan.yearlyNote}
                features={plan.features}
                featured={plan.featured}
                paymentLink={`/payment?plan=${plan.name.toLowerCase()}`}
              />
            ))}
          </div>

          <div className="pt-4">
            <ProductSummaryCards />
          </div>
        </div>
      </section>

      {/* Resources teaser (LIGHT) */}
      <section className="relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] w-screen bg-white py-16">
        <div className="mx-auto max-w-6xl px-6 space-y-6">
          <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-end">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[var(--brand-blue-deep)]">
                Resources
              </p>
              <h3 className="text-2xl font-semibold text-[var(--text-main)] md:text-3xl">
                Learn the playbooks behind reliable automation
              </h3>
              <p className="max-w-2xl text-sm text-[var(--text-muted)] md:text-base">
                Articles covering Telegram → MT5 setup, prop firm guardrails, and VPS best
                practices. All content is written for traders who prefer clarity over hype.
              </p>
            </div>
            <Link
              href="/resources"
              className="inline-flex items-center justify-center rounded-full border border-[var(--border-subtle)] px-4 py-2 text-xs font-semibold text-[var(--text-main)] transition hover:border-[var(--brand-blue-soft)] hover:text-[var(--brand-blue-deep)]"
            >
              View all resources
            </Link>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {featuredResources.map((article) => (
              <Link
                key={article.id}
                href={`/resources/${article.id}`}
                className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-light-2)] p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
              >
                <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-[var(--brand-blue-deep)]">
                  <span>{article.category}</span>
                  <span className="text-[var(--text-muted)]">· {article.readTime}</span>
                </div>
                <h4 className="mb-2 text-base font-semibold text-[var(--text-main)]">
                  {article.title}
                </h4>
                <p className="text-xs text-[var(--text-muted)]">
                  {article.description}
                </p>
                <div className="mt-4 text-[0.65rem] uppercase tracking-wide text-[var(--text-muted)]">
                  Keyword: {article.primaryKeyword}
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Manual vs Bot Comparison (DARK) */}
      <section className="relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] w-screen bg-[var(--bg-dark-3)] py-16 text-[var(--text-on-dark)]">
        <div className="mx-auto max-w-6xl px-6">
          <div className="mb-10 space-y-6">
            <div className="mx-auto max-w-3xl rounded-full border border-[var(--border-on-dark-strong)] bg-[rgba(15,23,42,0.9)] px-6 py-3 text-center text-xs font-medium tracking-wide text-zinc-300">
              Understand why traders move away from manual copying and complex EA setups
              towards a single, easier desktop app.
            </div>
            <div className="text-center">
              <h2 className="mb-3 text-2xl font-semibold md:text-3xl">
                Manual copying vs automation
              </h2>
              <p className="mx-auto max-w-2xl text-sm text-zinc-400 md:text-base">
                See where automation adds value while you still control risk, broker, and
                strategy.
              </p>
            </div>
            <div className="overflow-hidden rounded-xl border border-[var(--border-on-dark-strong)] bg-[var(--bg-dark-2)] shadow-sm">
              <div className="grid grid-cols-3 border-b border-[var(--border-on-dark-strong)] bg-black/30 px-4 py-3 text-xs font-semibold uppercase tracking-wide text-zinc-400 md:px-6">
                <div className="text-left">Aspect</div>
                <div className="text-center">Manual</div>
                <div className="text-center text-[var(--brand-blue-soft)]">With bot</div>
              </div>
              <div className="divide-y divide-[var(--border-on-dark-strong)]">
                {comparisonRows.map((row) => (
                  <div
                    key={row.label}
                    className="grid grid-cols-3 gap-4 px-4 py-4 md:px-6 md:py-5"
                  >
                    <div className="flex items-start gap-2 text-sm font-medium">
                      <span className="mt-[1px] text-base">{row.icon}</span>
                      <span>{row.label}</span>
                    </div>
                    <div className="text-sm text-zinc-400">
                      {row.manual}
                    </div>
                    <div className="rounded-lg bg-[rgba(37,99,235,0.15)] px-3 py-2 text-sm text-zinc-100 ring-1 ring-[rgba(37,99,235,0.4)]">
                      {row.bot}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="text-center">
              <h3 className="mb-2 text-lg font-semibold md:text-xl">
                Desktop app vs EA‑based copiers
              </h3>
              <p className="mx-auto max-w-2xl text-sm text-zinc-400 md:text-base">
                Many competitors require both a desktop controller and MT4/MT5 EA plugins.
                SignalTradingBots keeps things simple with a single desktop application.
              </p>
            </div>
            <div className="overflow-hidden rounded-xl border border-[var(--border-on-dark-strong)] bg-[var(--bg-dark-2)] shadow-sm">
              <div className="grid grid-cols-3 border-b border-[var(--border-on-dark-strong)] bg-black/30 px-4 py-3 text-xs font-semibold uppercase tracking-wide text-zinc-400 md:px-6">
                <div className="text-left">Aspect</div>
                <div className="text-center">Typical EA‑based copier</div>
                <div className="text-center text-[var(--brand-blue-soft)]">
                  SignalTradingBots app
                </div>
              </div>
              <div className="divide-y divide-[var(--border-on-dark-strong)]">
                {eaComparisonRows.map((row) => (
                  <div
                    key={row.label}
                    className="grid grid-cols-3 gap-4 px-4 py-4 md:px-6 md:py-5"
                  >
                    <div className="flex items-start gap-2 text-sm font-medium">
                      <span className="mt-[1px] text-base">{row.icon}</span>
                      <span>{row.label}</span>
                    </div>
                    <div className="text-sm text-zinc-400">
                      {row.ea}
                    </div>
                    <div className="rounded-lg bg-[rgba(37,99,235,0.15)] px-3 py-2 text-sm text-zinc-100 ring-1 ring-[rgba(37,99,235,0.4)]">
                      {row.ours}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* High-level feature comparison vs competitors (LIGHT, 4 categories, each expandable) */}
      <section className="relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] w-screen bg-[var(--bg-light-2)] py-16">
        <div className="mx-auto max-w-6xl px-6">
          <div className="mb-8 text-center">
            <h3 className="mb-2 text-2xl font-semibold text-[var(--text-main)] md:text-3xl">
              Key feature comparison vs other copiers
            </h3>
            <p className="mx-auto max-w-3xl text-sm text-[var(--text-muted)] md:text-base">
              Based on analysis of typical features from other Telegram to MT5 copier tools,
              plus the full internal feature matrix for SignalTradingBots.
            </p>
          </div>
          <div className="space-y-6">
            {featureCategories.map((cat) => (
              <div
                key={cat.id}
                className="rounded-xl border border-[var(--border-subtle)] bg-white/90 p-5 shadow-sm"
              >
                <div className="mb-3 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                  <div>
                    <h4 className="flex items-center gap-2 text-sm font-semibold text-[var(--text-main)]">
                      <span className="text-base">{cat.icon}</span>
                      <span>{cat.title}</span>
                    </h4>
                    <p className="text-xs text-[var(--text-muted)]">{cat.caption}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      setShowFullFeatureComparison((prev) => ({
                        ...prev,
                        [cat.id]: !prev[cat.id],
                      }))
                    }
                    className="mt-1 inline-flex items-center justify-center rounded-full border border-[var(--border-subtle)] bg-white px-3 py-1.5 text-[0.7rem] font-medium text-[var(--text-main)] shadow-sm transition hover:border-[var(--brand-blue-soft)] hover:text-[var(--brand-blue-deep)] md:mt-0"
                  >
                    {showFullFeatureComparison[cat.id]
                      ? "Hide full list"
                      : "Show full list"}
                  </button>
                </div>

                <div className="grid gap-3 text-xs text-[var(--text-muted)] md:grid-cols-3">
                  <div className="rounded-l-md bg-[rgba(37,99,235,0.06)] px-3 py-2 text-[0.7rem] font-semibold uppercase tracking-wide text-[var(--text-main)]">
                    Feature
                  </div>
                  <div className="bg-[rgba(37,99,235,0.06)] px-3 py-2 text-[0.7rem] font-semibold uppercase tracking-wide text-[var(--text-main)]">
                    Typical competitors
                  </div>
                  <div className="rounded-r-md bg-[rgba(37,99,235,0.08)] px-3 py-2 text-[0.7rem] font-semibold uppercase tracking-wide text-[var(--brand-blue-deep)]">
                    SignalTradingBots
                  </div>
                  {cat.features
                    .slice(
                      0,
                      showFullFeatureComparison[cat.id] ? cat.features.length : 3,
                    )
                    .map((f) => (
                      <React.Fragment key={f.label}>
                        <div className="border-b border-[rgba(148,163,184,0.25)] pb-2 pt-1 font-medium text-[var(--text-main)] last:border-b-0">
                          {f.label}
                        </div>
                        <div className="border-b border-[rgba(148,163,184,0.25)] pb-2 pt-1 last:border-b-0">
                          {f.competitors}
                        </div>
                        <div
                          className={
                            f.advantage
                              ? "border-b border-[rgba(148,163,184,0.25)] pb-2 pt-1 text-[var(--text-main)] last:border-b-0"
                              : "border-b border-[rgba(148,163,184,0.25)] pb-2 pt-1 text-[var(--text-main)] last:border-b-0"
                          }
                        >
                          <span
                            className={
                              f.advantage
                                ? "inline-flex items-center gap-1 rounded-full bg-[rgba(37,99,235,0.08)] px-2 py-1 text-xs font-medium text-[var(--brand-blue-deep)] ring-1 ring-[rgba(37,99,235,0.25)]"
                                : ""
                            }
                          >
                            {f.advantage && <span>⭐</span>}
                            <span>{f.ours}</span>
                          </span>
                          {!f.advantage && <span>{!f.advantage && !f.ours ? "" : ""}</span>}
                        </div>
                      </React.Fragment>
                    ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials (DARK) */}
      <section className="relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] w-screen bg-[var(--bg-dark-2)] py-16 text-[var(--text-on-dark)]">
        <div className="mx-auto max-w-6xl px-6">
          <div className="mb-8 text-center">
            <h2 className="mb-3 text-2xl font-semibold md:text-3xl">
              Traders testing and using the bot
            </h2>
            <p className="mx-auto max-w-2xl text-sm text-zinc-400 md:text-base">
              These are example quotes you can replace with real feedback from your own
              users.
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {testimonials.map((t) => (
              <div
                key={t.name}
                className="flex flex-col rounded-xl border border-[var(--border-on-dark-strong)] bg-[var(--bg-dark-3)] p-6 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-[0_18px_45px_rgba(15,23,42,0.75)] hover:border-[var(--brand-blue-soft)]"
              >
                <p className="mb-4 text-sm text-zinc-200">&ldquo;{t.quote}&rdquo;</p>
                <div className="mt-auto text-sm">
                  <div className="font-semibold">{t.name}</div>
                  <div className="text-xs text-zinc-400">{t.role}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Support highlight + FAQ (LIGHT) */}
      <section className="relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] w-screen bg-[var(--bg-light-2)] py-16">
        <div className="mx-auto max-w-6xl px-6">
          <div className="mb-10 rounded-2xl border border-[var(--border-subtle)] bg-white/90 p-6 shadow-sm">
            <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <h3 className="text-xl font-semibold text-[var(--text-main)]">
                  Personal support when you need it
                </h3>
                <p className="text-sm text-[var(--text-muted)]">
                  We know MT5 automation can feel technical, so we stay close during setup
                  and scaling.
                </p>
              </div>
              <Link
                href="/contact"
                className="inline-flex items-center justify-center rounded-full border border-[var(--border-subtle)] px-4 py-2 text-xs font-medium text-[var(--text-main)] transition hover:border-[var(--brand-blue-soft)] hover:text-[var(--brand-blue-deep)]"
              >
                Contact support
              </Link>
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              {supportItems.map((item) => (
                <div key={item.title} className="rounded-lg bg-[var(--bg-light-2)] p-4">
                  <h4 className="mb-1 text-sm font-semibold text-[var(--text-main)]">
                    {item.title}
                  </h4>
                  <p className="text-xs text-[var(--text-muted)]">{item.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* FAQ preview */}
          <div className="mb-8 flex flex-col items-start justify-between gap-4 md:flex-row md:items-end">
            <div>
              <h2 className="mb-3 text-2xl font-semibold text-[var(--text-main)] md:text-3xl">
                Common questions
              </h2>
              <p className="max-w-2xl text-sm text-[var(--text-muted)] md:text-base">
                Quick answers to the most asked questions about setup, VPS usage, and
                risk.
              </p>
            </div>
            <Link
              href="/faq"
              className="text-sm font-medium text-[var(--brand-blue)] hover:text-[var(--brand-blue-deep)]"
            >
              View full FAQ
            </Link>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {faqs.map((item) => (
              <div
                key={item.question}
                className="rounded-lg border border-[var(--border-subtle)] bg-white/80 p-4 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-lg hover:border-[var(--brand-blue-soft)]"
              >
                <h3 className="mb-1 text-sm font-semibold text-[var(--text-main)]">
                  {item.question}
                </h3>
                <p className="text-xs text-[var(--text-muted)] md:text-sm">
                  {item.answer}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA Strip */}
      <section className="relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] w-screen bg-[var(--bg-dark-1)] py-12 text-[var(--text-on-dark)]">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-6 text-center md:flex-row md:text-left">
          <div>
            <h2 className="mb-2 text-2xl font-semibold">
              Ready to automate your Telegram signals into MT5?
            </h2>
            <p className="text-sm text-zinc-400">
              Start with a demo account, refine your settings, and move to live trading
              only when you are comfortable with the results.
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/products"
              className="rounded-md bg-[var(--brand-blue)] px-5 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-[var(--brand-blue-deep)] hover:scale-105 hover:shadow-lg"
            >
              View Products
            </Link>
            <Link
              href="/contact"
              className="text-sm font-medium text-[var(--brand-blue-soft)] hover:text-white"
            >
              Contact us
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
