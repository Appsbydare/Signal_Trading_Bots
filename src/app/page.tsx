"use client";
import React, { useState, useEffect, useRef } from "react";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { DarkProductCard } from "@/components/DarkProductCard";
import { HeroTelegramSignals } from "@/components/HeroTelegramSignals";
import XmLogo from "../../broker_logos/XM-Logo.webp";
import TelegramLogo from "../../assets/telegram.webp";
import TradingBotLogo from "../../assets/Tradingbot - Copy.png";
import MT5Logo from "../../assets/mt5.png";
import { resourceArticles } from "@/data/resources";
import { PricingSection } from "@/components/PricingSection";
import { TrustBox } from "@/components/TrustBox";
import { CustomerFeedback } from "@/components/CustomerFeedback";
import { DownloadModal } from "@/components/DownloadModal";
import { usePreloader } from "@/context/PreloaderContext";
import StripeLogo from "../../assets/stripe_logo.png";
import PayPalLogo from "../../assets/paypal_logo.png";
import VisaLogo from "../../assets/visa_logo.png";
import MastercardLogo from "../../assets/mastercard_logo.png";
import BitcoinLogo from "../../assets/bitcoin-logo.png";
import EthereumLogo from "../../assets/ethereum_logo.png";
import TetherLogo from "../../assets/tether_logo.png";

const heroMessages = [
  {
    number: 1,
    text: "Automate Telegram signals into MetaTrader 5",
    importantWords: ["Automate", "Telegram", "signals"],
    subtext: "Fast,Reliable, and Fully customizable.",
  },
  {
    number: 2,
    text: "Stop losing money—missing Telegram signals",
    importantWords: ["Stop losing money", "Telegram signals"],
    subtext: "Your MT5 executes every trade automatically — no hesitation, no excuses.",
  },
  {
    number: 3,
    text: "Fast signals need faster execution",
    importantWords: ["Fast signals", "faster execution"],
    subtext: "Automate every Telegram signal directly into MT5 with precision.",
  },
  {
    number: 4,
    text: "Manual trading is costing you profits",
    importantWords: ["Manual trading", "costing", "profits"],
    subtext: "Let your Telegram‑to‑MT5 auto‑trader fire every setup instantly.",
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
  const [billingInterval, setBillingInterval] = useState<"monthly" | "yearly">("monthly");
  const [isDownloadModalOpen, setIsDownloadModalOpen] = useState(false);
  const { isPreloaderFinished } = usePreloader();

  // Ref and Scroll Progress for Execution Section
  const executionSectionRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: executionSectionRef,
    offset: ["start 0.9", "end 0.1"]
  });

  // Card 1: From Left (progress 0.1 to 0.3)
  const opacity1 = useTransform(scrollYProgress, [0, 0.1, 0.3], [0, 0, 1]);
  const x1 = useTransform(scrollYProgress, [0, 0.1, 0.3], [-100, -100, 0]);

  // Card 2: From Top (progress 0.3 to 0.5)
  const opacity2 = useTransform(scrollYProgress, [0, 0.3, 0.5], [0, 0, 1]);
  const y2 = useTransform(scrollYProgress, [0, 0.3, 0.5], [-100, -100, 0]);

  // Card 3: From Right (progress 0.5 to 0.7)
  const opacity3 = useTransform(scrollYProgress, [0, 0.5, 0.7], [0, 0, 1]);
  const x3 = useTransform(scrollYProgress, [0, 0.5, 0.7], [100, 100, 0]);

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

    if (!isPreloaderFinished) return;

    if (!isDeleting && !isFadingOut && displayedText.length < fullText.length) {
      // Typing
      timeout = setTimeout(() => {
        setDisplayedText(fullText.slice(0, displayedText.length + 1));
      }, 50);
    } else if (!isDeleting && !isFadingOut && displayedText.length === fullText.length) {
      // Pause before fading out
      timeout = setTimeout(() => {
        setIsFadingOut(true);
      }, 600000); // 10 minutes (600,000ms) delay
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
  }, [displayedText, isDeleting, isFadingOut, currentMessageIndex, isPreloaderFinished]);

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
      badge: "Basic plan",
      price: "$9/month",
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
      price: "$29/month",
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
      {/* Hero Section - Large and Impactful (LIGHT) */}
      <section className="relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] w-screen bg-white overflow-hidden flex items-center min-h-[auto]">
        {/* Telegram Signals Background Animation */}
        <HeroTelegramSignals opacity={0.35} />

        <div className="relative z-10 mx-auto w-full max-w-7xl px-6 pt-4 pb-8 md:pt-10 md:pb-10">
          {/* Left Column: Text Content (Full Width) */}
          <div className="lg:col-span-12 space-y-8 text-left">
            {/* Typewriter Animation */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={isPreloaderFinished ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ duration: 0.6 }}
              className="flex flex-col justify-start"
            >
              <div className="mb-6 flex flex-wrap items-center gap-3">
                {/* Trusted Badge */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={isPreloaderFinished ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
                  transition={{ duration: 0.5, delay: 0.1 }}
                  className="inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50/50 px-3 py-1.5 md:px-4 md:py-2 backdrop-blur-sm self-start"
                >
                  <div className="flex gap-0">
                    {[1, 2, 3, 4, 5].map((_, i) => (
                      <svg
                        key={i}
                        className="h-3 w-3 md:h-4 md:w-4 text-yellow-400"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                  <div className="h-3 w-px bg-blue-200 lg:h-4" />
                  <span className="text-xs font-semibold text-blue-900 md:text-sm">
                    Trusted by 100+ traders
                  </span>
                </motion.div>

                {/* TrustBox */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={isPreloaderFinished ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                >
                  <TrustBox />
                </motion.div>
              </div>

              <h1
                className="font-bold leading-tight mb-3 hero-typewriter-text"
                style={{
                  fontSize: '8vw',
                  lineHeight: '1.05',
                  overflow: 'visible',
                  wordWrap: 'break-word',
                  wordBreak: 'break-word'
                }}
              >
                <motion.div
                  className="text-[var(--text-main)] relative"
                  style={{ display: 'block' }}
                  animate={{ opacity: isFadingOut ? 0 : 1 }}
                  transition={{ duration: 0.5, ease: "easeInOut" }}
                >
                  {/* Ghost Element for Height Reservation */}
                  <div className="invisible" aria-hidden="true">
                    {(() => {
                      const fullText = heroMessages[currentMessageIndex].text;
                      const importantWords = heroMessages[currentMessageIndex].importantWords || [];
                      const { line1, line2 } = splitIntoTwoLines(fullText);
                      return (
                        <>
                          {renderTextWithHighlights(line1, importantWords)}
                          {line2 && line2.length > 0 && <br />}
                          {line2 && renderTextWithHighlights(line2, importantWords)}
                        </>
                      );
                    })()}
                  </div>

                  {/* Active Typewriter Element */}
                  <div className="absolute inset-0 top-0 left-0">
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
                                      className="inline-block w-2 md:w-3 h-[1.625rem] md:h-[2.5rem] lg:h-[3.5rem] bg-[#5e17eb] ml-1 md:ml-3"
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
                              className="inline-block w-2 md:w-3 h-[1.625rem] md:h-[2.5rem] lg:h-[3.5rem] bg-[#5e17eb] ml-1 md:ml-3"
                              style={{ verticalAlign: 'middle', display: 'inline-block' }}
                            />
                          )}
                        </>
                      );
                    })()}
                  </div>
                </motion.div>
              </h1>

              <motion.p
                key={currentMessageIndex}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: isFadingOut ? 0 : 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="text-base md:text-lg lg:text-xl text-[var(--text-muted)] max-w-2xl leading-relaxed mt-4"
              >
                {heroMessages[currentMessageIndex].subtext}
              </motion.p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={isPreloaderFinished ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="flex flex-wrap gap-3 mt-6 md:mt-8"
            >
              <Link
                href="/products"
                className="rounded-lg bg-[#5e17eb] px-5 py-3 md:px-8 md:py-4 text-sm md:text-base font-semibold text-white shadow-lg transition hover:bg-[#4a12bf] hover:scale-105 hover:shadow-xl"
              >
                View Products
              </Link>

              {/* Download for Windows Button */}
              <a
                href="/api/download/public"
                onClick={() => setIsDownloadModalOpen(true)}
                className="group relative flex items-center gap-2 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 px-5 py-3 md:px-8 md:py-4 text-sm md:text-base font-bold text-white shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-cyan-500/25 hover:from-cyan-400 hover:to-blue-500"
              >
                <svg className="h-5 w-5 fill-current" viewBox="0 0 88 88" xmlns="http://www.w3.org/2000/svg">
                  <path d="M0 12.402l35.687-4.86.016 34.423-35.67.203zm35.67 33.529l.028 34.453L.028 75.48l-.028-33.646zm6.338-38.16l45.965-6.65v41.01l-45.965.265zm0 38.307l45.965.226v41.28l-45.965-6.505z" />
                </svg>
                <span>Download for Windows</span>
                <div className="absolute inset-0 -z-10 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 opacity-0 blur transition-opacity duration-300 group-hover:opacity-50" />
              </a>


            </motion.div>



            {/* Tech Providers - Integrated into Hero but separated */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={isPreloaderFinished ? { opacity: 1 } : { opacity: 0 }}
              transition={{ duration: 0.6, delay: 0.9 }}
              className="mt-4 md:mt-6 relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] w-screen bg-white py-6 border-t border-b border-slate-100 shadow-[0_4px_20px_-2px_rgba(0,0,0,0.05)]"
            >
              <div className="mx-auto max-w-6xl px-6">
                <div className="flex flex-col items-center gap-4">
                  <p className="text-[10px] md:text-xs font-bold text-slate-500 uppercase tracking-[0.2em]">Powered By & Integrated With</p>
                  <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16">
                    <div className="relative h-16 w-46 transition-all duration-300 cursor-pointer hover:scale-105 opacity-80 ">
                      <Image src="/assets/mt5.png" alt="MetaTrader 5" fill className="object-contain" />
                    </div>
                    <div className="relative h-16 w-46 transition-all duration-300 cursor-pointer hover:scale-105 opacity-80 ">
                      <Image src="/assets/MT4.png" alt="MetaTrader 4" fill className="object-contain" />
                    </div>
                    <div className="relative h-18 w-46 transition-all duration-300 cursor-pointer hover:scale-105 opacity-80 mr-5 ">
                      <Image src="/assets/geminilogo.png" alt="Gemini" fill className="object-contain" />
                    </div>
                    <div className="relative h-12 w-43 transition-all duration-300 cursor-pointer hover:scale-105 opacity-80 ">
                      <Image src="/assets/TG.png" alt="Telegram" fill className="object-contain" />
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>


      {/* Customer Feedback Carousel - COMMENTED OUT */}
      {/* <CustomerFeedback /> */}

      {/* Execution flow & security reminders (LIGHT) - MOVED HERE FROM BELOW */}
      <section className="relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] w-screen bg-white py-20">
        <div className="mx-auto max-w-6xl px-6 space-y-16">
          <div className="text-center">
            <motion.h2
              initial={{ opacity: 0, y: -20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="mb-8 text-center text-5xl font-bold text-slate-900 md:text-6xl lg:text-7xl leading-tight"
            >
              How Execution Works And How You Stay In Control
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: -10 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="mx-auto max-w-3xl text-center text-base text-slate-600 leading-relaxed md:text-lg"
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
                        duration: 0.5,
                        delay: 0.25 + i * 0.5,
                      }}
                      viewport={{ once: true }}
                    />

                    {/* Large animated arrowhead */}
                    <motion.polygon
                      points={`${midX},40 ${midX + 2},60 ${midX},80`}
                      fill="#3b82f6"
                      filter="url(#arrowGlow)"
                      initial={{ opacity: 0, scale: 0 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      transition={{
                        duration: 0.3,
                        delay: 0.35 + i * 0.5,
                      }}
                      viewport={{ once: true }}
                    />

                    {/* Animated flowing dots along arrow */}
                    {[0, 0.3, 0.6].map((offset) => {
                      const initialCx = x1 + (x2 - x1) * offset;
                      return (
                        <motion.circle
                          key={`dot-${i}-${offset}`}
                          cx={`${initialCx}%`}
                          cy="60"
                          r="2"
                          fill="#3b82f6"
                          initial={{ opacity: 0, cx: `${initialCx}%` }}
                          whileInView={{
                            opacity: [0.3, 1, 0.3],
                            cx: [`${x1}%`, `${x2}%`, `${x1}%`]
                          }}
                          transition={{
                            duration: 1.2,
                            delay: 0.5 + i * 0.5 + offset * 0.15,
                            repeat: Infinity,
                            repeatType: "loop"
                          }}
                          viewport={{ once: true }}
                        />
                      );
                    })}
                  </g>
                );
              })}
            </svg>

            {/* Step Cards with Enhanced Design */}
            <div ref={executionSectionRef} className="grid gap-8 md:grid-cols-3 relative z-10 pb-20">
              {/* Card 1: Telegram Signals */}
              <motion.div
                style={{ opacity: opacity1, x: x1, perspective: "1000px" }}
              >
                <motion.div
                  className="relative h-full rounded-2xl border-2 border-blue-600 bg-gradient-to-br from-[#1e293b] to-[#0f172a] p-8 text-center shadow-lg hover:border-blue-500 transition-all group overflow-hidden"
                  animate={{
                    rotateX: [3, -3, 3],
                    rotateY: [-3, 3, -3]
                  }}
                  transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                  style={{ transformStyle: "preserve-3d" }}
                >
                  {/* Speed lines for motion effect across the entire card */}
                  <div className="absolute inset-0 z-0 w-full h-full pointer-events-none">
                    <motion.div
                      className="absolute right-[0%] top-[25%] h-[2px] w-[70%] bg-blue-400/30 rounded-full blur-[1px]"
                      animate={{ x: ["50%", "-350%"] }}
                      transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                    />
                    <motion.div
                      className="absolute right-[0%] top-[65%] h-[1.5px] w-[50%] bg-blue-400/20 rounded-full"
                      animate={{ x: ["50%", "-450%"] }}
                      transition={{ duration: 2, repeat: Infinity, ease: "linear", delay: 0.4 }}
                    />
                    <motion.div
                      className="absolute right-[0%] top-[45%] h-[2.5px] w-[60%] bg-[#2AABEE]/40 rounded-full shadow-[0_0_8px_#2AABEE]"
                      animate={{ x: ["50%", "-400%"] }}
                      transition={{ duration: 1.2, repeat: Infinity, ease: "linear", delay: 0.8 }}
                    />
                    {/* Glowing aura inside card */}
                    <div className="absolute top-[40%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-[#2AABEE]/15 rounded-full blur-3xl" />
                  </div>

                  {/* 3D Paper Plane */}
                  <div className="relative mb-6 flex justify-center items-center h-28 w-full mt-2" style={{ transformStyle: "preserve-3d" }}>
                    <motion.div
                      animate={{
                        y: [0, -12, 0],
                        translateZ: [30, 50, 30],
                        rotateZ: [-5, 5, -5]
                      }}
                      transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                      style={{ filter: "drop-shadow(0px 15px 12px rgba(0,0,0,0.6))", transformStyle: "preserve-3d" }}
                      className="z-30 relative mr-2"
                    >
                      {/* Telegram blue Paper Plane */}
                      <svg
                        width="80"
                        height="80"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"
                          fill="#2AABEE"
                          stroke="#ffffff"
                          strokeWidth="0.5"
                        />
                      </svg>
                    </motion.div>

                    {/* Outgoing Blue Paper Plane (Syncing with Card 2) */}
                    <motion.div
                      className="absolute z-20 top-1/2"
                      style={{
                        filter: "drop-shadow(0px 8px 6px rgba(0,0,0,0.5))",
                        transformStyle: "preserve-3d",
                        marginTop: "-20px",
                        marginLeft: "-20px"
                      }}
                      animate={{
                        left: ["50%", "50%", "115%", "115%"],
                        opacity: [0, 1, 0, 0],
                        scale: [0, 1, 0.6, 0.6],
                        rotateZ: [0, -5, -5, -5],
                        translateZ: [0, 30, 10, 10]
                      }}
                      transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", times: [0, 0.05, 0.2, 1] }}
                    >
                      <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" fill="#2AABEE" stroke="#ffffff" strokeWidth="1" />
                      </svg>
                    </motion.div>
                  </div>

                  {/* Content */}
                  <motion.div
                    className="relative z-10"
                    style={{ transform: "translateZ(20px)" }}
                  >
                    <h4 className="mb-3 text-xl font-bold text-white">
                      1. Receive Signal
                    </h4>
                    <p className="text-sm text-blue-200 leading-relaxed">
                      We receive the Telegram signal instantly from your configured channels or groups.
                    </p>
                  </motion.div>
                </motion.div>
              </motion.div>

              {/* Card 2: SignalTradingBots App */}
              <motion.div
                style={{ opacity: opacity2, y: y2, perspective: "1000px" }}
              >
                <motion.div
                  className="relative h-full rounded-2xl border-2 border-blue-700 bg-gradient-to-br from-[#1e293b] to-[#0f172a] p-8 text-center shadow-lg hover:border-blue-600 transition-all group overflow-hidden"
                  animate={{
                    rotateX: [2, -2, 2],
                    rotateY: [-2, 2, -2]
                  }}
                  transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                  style={{ transformStyle: "preserve-3d" }}
                >
                  {/* Animated background glow */}
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-transparent opacity-0 group-hover:opacity-100 rounded-2xl transition duration-300"
                  />

                  {/* Glowing aura inside card */}
                  <div className="absolute top-[35%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-[#3b82f6]/10 rounded-full blur-3xl" />

                  {/* 3D Animated Planes & Center Logo Area */}
                  <div className="relative mb-6 flex justify-center items-center h-28 w-full mt-2" style={{ transformStyle: "preserve-3d" }}>

                    {/* Blue Incoming Paper Plane */}
                    <motion.div
                      className="absolute z-20 top-1/2"
                      style={{
                        filter: "drop-shadow(0px 8px 6px rgba(0,0,0,0.5))",
                        transformStyle: "preserve-3d",
                        marginTop: "-20px",
                        marginLeft: "-20px"
                      }}
                      animate={{
                        left: ["-15%", "50%", "50%", "50%"],
                        opacity: [0, 1, 0, 0],
                        scale: [0.6, 1, 0, 0],
                        rotateZ: [5, 0, 0, 0],
                        translateZ: [10, 30, 0, 0]
                      }}
                      transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", times: [0, 0.2, 0.3, 1] }}
                    >
                      <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" fill="#2AABEE" stroke="#ffffff" strokeWidth="1" />
                      </svg>
                    </motion.div>

                    {/* Center Logo Area */}
                    <motion.div
                      className="relative z-30 flex h-24 w-24 items-center justify-center rounded-full bg-slate-800 border-3 border-blue-500 shadow-[0_0_20px_rgba(59,130,246,0.5)] p-2 overflow-hidden"
                      animate={{
                        scale: [1, 1, 1.15, 1, 1],
                        boxShadow: [
                          "0 0 20px rgba(59,130,246,0.3)",
                          "0 0 20px rgba(59,130,246,0.3)",
                          "0 0 50px rgba(234,179,8,0.6)",
                          "0 0 20px rgba(59,130,246,0.3)",
                          "0 0 20px rgba(59,130,246,0.3)"
                        ],
                        borderColor: [
                          "#3b82f6",
                          "#3b82f6",
                          "#eab308",
                          "#3b82f6",
                          "#3b82f6"
                        ]
                      }}
                      transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", times: [0, 0.2, 0.3, 0.5, 1] }}
                      style={{ transform: "translateZ(30px)" }}
                    >
                      <Image
                        src={TradingBotLogo}
                        alt="SignalTradingBots"
                        width={80}
                        height={80}
                        className="h-full w-full object-contain"
                      />
                    </motion.div>

                    {/* Gold Outgoing Paper Plane */}
                    <motion.div
                      className="absolute z-20 top-1/2"
                      style={{
                        filter: "drop-shadow(0px 8px 6px rgba(0,0,0,0.5))",
                        transformStyle: "preserve-3d",
                        marginTop: "-20px",
                        marginLeft: "-20px"
                      }}
                      animate={{
                        left: ["50%", "50%", "115%", "115%", "115%"],
                        opacity: [0, 0, 1, 0, 0],
                        scale: [0, 0, 1, 0.6, 0.6],
                        rotateZ: [0, 0, -5, -5, -5],
                        translateZ: [0, 0, 30, 10, 10]
                      }}
                      transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", times: [0, 0.3, 0.45, 0.5, 1] }}
                    >
                      <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" fill="#eab308" stroke="#ffffff" strokeWidth="1" />
                      </svg>
                    </motion.div>
                  </div>

                  {/* Content */}
                  <motion.div
                    className="relative z-10"
                    style={{ transform: "translateZ(20px)" }}
                  >
                    <h4 className="mb-3 text-xl font-bold text-white">
                      2. Read & Map
                    </h4>
                    <p className="text-sm text-blue-200 leading-relaxed">
                      Then the App reads the signal and applies the custom signal mapping and strategy you gave to it.
                    </p>
                  </motion.div>
                </motion.div>
              </motion.div>

              {/* Card 3: MT5 Terminal */}
              <motion.div
                style={{ opacity: opacity3, x: x3, perspective: "1000px" }}
              >
                <div
                  className="relative h-full rounded-2xl border-2 border-blue-600 bg-gradient-to-br from-[#1e293b] to-[#0f172a] p-8 text-center shadow-lg hover:border-blue-500 transition-all group overflow-hidden"
                  style={{ transformStyle: "preserve-3d" }}
                >
                  <motion.div
                    animate={{
                      rotateX: [2, -2, 2],
                      rotateY: [-2, 2, -2]
                    }}
                    transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut", delay: 2 }}
                    className="absolute inset-0 z-0 pointer-events-none"
                    style={{ transformStyle: "preserve-3d" }}
                  >
                    {/* Animated background glow */}
                    <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-transparent opacity-0 group-hover:opacity-100 rounded-2xl transition duration-300" />

                    {/* Glowing aura inside card */}
                    <div className="absolute top-[35%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-green-500/10 rounded-full blur-3xl" />
                  </motion.div>

                  {/* 3D Animated Planes, Logo & Popups */}
                  <div className="relative mb-6 flex justify-center items-center h-28 w-full mt-2" style={{ transformStyle: "preserve-3d" }}>

                    {/* Gold Incoming Paper Plane */}
                    <motion.div
                      className="absolute z-20 top-1/2"
                      style={{
                        filter: "drop-shadow(0px 8px 6px rgba(0,0,0,0.5))",
                        transformStyle: "preserve-3d",
                        marginTop: "-20px",
                        marginLeft: "-20px"
                      }}
                      animate={{
                        left: ["-15%", "-15%", "50%", "50%", "50%"],
                        opacity: [0, 0, 1, 0, 0],
                        scale: [0.6, 0.6, 1, 0, 0],
                        rotateZ: [5, 5, 0, 0, 0],
                        translateZ: [10, 10, 30, 0, 0]
                      }}
                      transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", times: [0, 0.5, 0.7, 0.8, 1] }}
                    >
                      <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" fill="#eab308" stroke="#ffffff" strokeWidth="1" />
                      </svg>
                    </motion.div>

                    {/* Center Logo Area */}
                    <motion.div
                      className="relative z-30 flex h-24 w-24 items-center justify-center rounded-full bg-slate-800 border-3 border-blue-500 shadow-[0_0_20px_rgba(59,130,246,0.3)] p-3 overflow-hidden"
                      animate={{
                        scale: [1, 1, 1.15, 1, 1],
                        boxShadow: [
                          "0 0 20px rgba(59,130,246,0.3)",
                          "0 0 20px rgba(59,130,246,0.3)",
                          "0 0 40px rgba(34,197,94,0.5)",
                          "0 0 20px rgba(59,130,246,0.3)",
                          "0 0 20px rgba(59,130,246,0.3)"
                        ],
                        borderColor: [
                          "#3b82f6",
                          "#3b82f6",
                          "#22c55e",
                          "#3b82f6",
                          "#3b82f6"
                        ]
                      }}
                      transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", times: [0, 0.7, 0.8, 0.9, 1] }}
                      style={{ transform: "translateZ(30px)" }}
                    >
                      <Image
                        src={MT5Logo}
                        alt="MetaTrader 5"
                        width={80}
                        height={80}
                        className="h-full w-full object-contain"
                      />
                    </motion.div>

                    {/* Profit Popups (Outgoing) */}
                    {[
                      { text: "+$50", color: "#4ade80", delay: 1.0, duration: 2, repeatDelay: 4, yOffset: -25 },
                      { text: "+$100", color: "#4ade80", delay: 2.2, duration: 2, repeatDelay: 5, yOffset: -45 },
                      { text: "+$75", color: "#4ade80", delay: 3.5, duration: 2, repeatDelay: 4, yOffset: 15 },
                      { text: "-$20", color: "#f87171", delay: 5.0, duration: 2, repeatDelay: 12, yOffset: 35 }, // Appears much less often
                    ].map((item, i) => (
                      <motion.div
                        key={i}
                        className="absolute z-20 font-bold text-xl tracking-wider select-none"
                        style={{
                          color: item.color,
                          textShadow: `0 0 15px ${item.color}60`,
                          top: "50%",
                          marginTop: "-15px"
                        }}
                        animate={{
                          left: ["50%", "100%", "115%"],
                          y: [0, item.yOffset, item.yOffset - 10],
                          opacity: [0, 1, 0],
                          scale: [0.5, 1.2, 0.8],
                          translateZ: [0, 30, 10]
                        }}
                        transition={{
                          duration: item.duration,
                          repeat: Infinity,
                          repeatDelay: item.repeatDelay,
                          delay: item.delay,
                          ease: "easeOut"
                        }}
                      >
                        {item.text}
                      </motion.div>
                    ))}
                  </div>

                  {/* Content */}
                  <motion.div
                    className="relative z-10"
                    style={{ transform: "translateZ(20px)" }}
                  >
                    <h4 className="mb-3 text-xl font-bold text-white">
                      3. Execute Order
                    </h4>
                    <p className="text-sm text-blue-200 leading-relaxed">
                      Finally, it places the calculated orders directly in your MetaTrader 5 terminal.
                    </p>
                  </motion.div>
                </div>
              </motion.div>
            </div>
          </div>

          {/* Enhanced Security & Risk Reminders Section */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            viewport={{ once: true }}
            className="rounded-2xl border-2 border-blue-600 bg-slate-900 p-10 shadow-lg"
          >
            <div className="mb-12 flex flex-col items-center justify-center gap-4 text-center">
              <motion.div
                className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-blue-600 to-blue-700 text-3xl shadow-lg border border-blue-400"
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                🔒
              </motion.div>
              <h2 className="text-center text-5xl font-bold text-white md:text-6xl lg:text-7xl leading-tight">
                Security & Risk Reminders
              </h2>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              {securityHighlights.map((item, index) => (
                <motion.div
                  key={item}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.5 + index * 0.1 }}
                  viewport={{ once: true }}
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

      {/* Pricing Section with License-Aware Logic */}
      < PricingSection />

      {/* Payment Gateway Stripe - Full Width White Stripe */}
      <section className="relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] w-screen bg-white shadow-[0_4px_20px_rgba(0,0,0,0.03)] border-y border-slate-100 py-6">
        <div className="flex flex-col items-center gap-3">
          {/* Row 1: Heading */}
          <div className="text-center">
            <h3 className="text-[13px] font-extrabold text-slate-400 tracking-[0.2em] uppercase">World-Class Payment Security</h3>
          </div>

          {/* Row 2: Logos Strip */}
          <div className="flex flex-wrap items-center justify-center gap-8 md:gap-14 py-2">
            <div className="relative h-10 w-24 transition-transform duration-300 hover:scale-110">
              <Image src={StripeLogo} alt="Stripe" fill className="object-contain" />
            </div>
            <div className="relative h-9 w-24 transition-transform duration-300 hover:scale-110">
              <Image src={PayPalLogo} alt="PayPal" fill className="object-contain" />
            </div>
            <div className="relative h-8 w-20 transition-transform duration-300 hover:scale-110">
              <Image src={VisaLogo} alt="Visa" fill className="object-contain" />
            </div>
            <div className="relative h-10 w-16 transition-transform duration-300 hover:scale-110">
              <Image src={MastercardLogo} alt="Mastercard" fill className="object-contain" />
            </div>
            <div className="relative h-12 w-12 transition-transform duration-300 hover:scale-110">
              <Image src={BitcoinLogo} alt="Bitcoin" fill className="object-contain" />
            </div>
            <div className="relative h-12 w-12 transition-transform duration-300 hover:scale-110">
              <Image src={EthereumLogo} alt="Ethereum" fill className="object-contain" />
            </div>
            <div className="relative h-12 w-12 transition-transform duration-300 hover:scale-110">
              <Image src={TetherLogo} alt="Tether" fill className="object-contain" />
            </div>
          </div>

          {/* Row 3: Description Text (Tight Spacing) */}
          <div className="max-w-4xl text-center px-6">
            <p className="text-[13px] text-slate-500 leading-tight font-medium">
              Payments are securely processed via <span className="text-[#635bff] font-bold">Stripe</span>, the global leader in online commerce.
              <br className="hidden sm:block" />
              Full support for <span className="font-semibold text-slate-700">All Major Cards, PayPal, and Cryptocurrency</span> for a seamless checkout experience.
            </p>
          </div>
        </div>
      </section>

      {/* Video Showcase Section */}
      <section className="relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] w-screen bg-gradient-to-b from-slate-50 to-white py-16 md:py-20">
        <div className="mx-auto max-w-6xl px-6">
          {/* Section Header */}
          <div className="text-center mb-10">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="mb-8 text-center text-5xl font-bold text-slate-900 md:text-6xl lg:text-7xl leading-tight"
            >
              See It In Action 🎬
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              viewport={{ once: true }}
              className="mx-auto max-w-3xl text-center text-lg text-slate-600 md:text-xl"
            >
              Watch how Signal Trading Bot transforms Telegram signals into profitable trades automatically
            </motion.p>
          </div>

          {/* Video Container */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            viewport={{ once: true }}
            className="relative"
          >
            <div className="relative rounded-2xl overflow-hidden shadow-2xl border-4 border-slate-200/50">
              <div className="aspect-video w-full bg-slate-900">
                <iframe
                  className="w-full h-full"
                  src="https://www.youtube.com/embed/1Kp-uGMg33E?si=16a9yY4Luobihvs9"
                  title="YouTube video player"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  referrerPolicy="strict-origin-when-cross-origin"
                  allowFullScreen
                ></iframe>
              </div>
            </div>

            {/* Decorative elements */}
            <div className="absolute -top-4 -left-4 w-24 h-24 bg-blue-500/10 rounded-full blur-2xl"></div>
            <div className="absolute -bottom-4 -right-4 w-32 h-32 bg-purple-500/10 rounded-full blur-2xl"></div>
          </motion.div>

          {/* Call to Action */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            viewport={{ once: true }}
            className="text-center mt-10"
          >
            <p className="text-slate-600 mb-4">Ready to automate your trading?</p>
            <a
              href="/products"
              className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-[#5e17eb] to-[#7c3aed] text-white font-semibold rounded-lg hover:from-[#7c3aed] hover:to-[#5e17eb] transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105"
            >
              Get Started Now
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </a>
          </motion.div>
        </div>
      </section>

      {/* How It Works (DARK) - MOVED TO TOP - ENHANCED WITH ANIMATIONS */}
      <section id="how-it-works" className="relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] w-screen bg-black py-20">
        <div className="mx-auto max-w-6xl px-6">
          <div className="mb-12 text-center">
            <motion.h2
              initial={{ opacity: 0, y: -20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="mb-8 text-center text-5xl font-bold text-white md:text-6xl lg:text-7xl leading-tight"
            >
              How It Works
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: -10 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="mx-auto max-w-2xl text-center text-sm text-blue-300 md:text-base"
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
                      viewport={{ once: true }}
                    />
                    {/* Animated Arrow - Larger and More Visible */}
                    <motion.g
                      initial={{ opacity: 0 }}
                      whileInView={{ opacity: 1 }}
                      transition={{
                        duration: 0.6,
                        delay: 0.6 + i * 0.1,
                      }}
                      viewport={{ once: true }}
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
                    viewport={{ once: true }}
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


      {/* Resources teaser (LIGHT) */}
      < section className="relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] w-screen bg-white py-5" >
        <div className="mx-auto max-w-6xl px-6 space-y-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="flex flex-col items-center justify-center gap-6 text-center"
          >
            <div className="space-y-4">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[var(--brand-blue-deep)]">
                Resources
              </p>
              <h2 className="mb-8 text-center text-5xl font-bold text-zinc-900 md:text-6xl lg:text-7xl leading-tight">
                Learn The Playbooks Behind Reliable Automation
              </h2>
              <p className="mx-auto max-w-2xl text-center text-sm text-zinc-600 md:text-base leading-relaxed">
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
          </motion.div>
          <div className="grid gap-6 md:grid-cols-3 pb-15">
            {featuredResources.map((article, index) => (
              <motion.div
                key={article.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.15 }}
              >
                <Link
                  href={`/resources/${article.id}`}
                  className="block rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg h-full"
                >
                  <div className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-[var(--brand-blue-deep)]">
                    <span>{article.category}</span>
                    <span className="text-zinc-600">· {article.readTime}</span>
                  </div>
                  <h4 className="mb-3 text-base font-semibold text-zinc-900">
                    {article.title}
                  </h4>
                  <p className="text-xs text-zinc-900 leading-relaxed font-medium">
                    {article.description}
                  </p>
                  <div className="mt-5 text-[0.65rem] uppercase tracking-wide text-zinc-500 font-medium">
                    Keyword: {article.primaryKeyword}
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Manual vs Bot Comparison (DARK) */}
      <section className="relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] w-screen bg-[var(--bg-dark-3)] py-16 text-[var(--text-on-dark)]">
        <div className="mx-auto max-w-6xl px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="mb-10 space-y-6"
          >
            <div className="mx-auto max-w-3xl rounded-full border border-[var(--border-on-dark-strong)] bg-[rgba(15,23,42,0.9)] px-6 py-3 text-center text-xs font-medium tracking-wide text-zinc-300">
              Understand why traders move away from manual copying and complex EA setups
              towards a single, easier desktop app.
            </div>
            <div className="text-center">
              <h2 className="mb-8 text-center text-5xl font-bold md:text-6xl lg:text-7xl leading-tight">
                Manual Copying Vs Automation
              </h2>
              <p className="mx-auto max-w-2xl text-center text-sm text-zinc-400 md:text-base">
                See where automation adds value while you still control risk, broker, and
                strategy.
              </p>
            </div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="overflow-hidden rounded-xl border border-[var(--border-on-dark-strong)] bg-[var(--bg-dark-2)] shadow-sm"
          >
            <div className="grid grid-cols-3 border-b border-[var(--border-on-dark-strong)] bg-black/30 px-4 py-3 text-xs font-semibold uppercase tracking-wide text-zinc-400 md:px-6">
              <div className="text-left">Aspect</div>
              <div className="text-center">Manual</div>
              <div className="text-center text-[var(--brand-blue-soft)]">With bot</div>
            </div>
            <div className="divide-y divide-[var(--border-on-dark-strong)]">
              {comparisonRows.map((row, index) => (
                <motion.div
                  key={row.label}
                  initial={{ opacity: 0, y: 15 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.2 + index * 0.1, ease: "easeOut" }}
                  className="grid grid-cols-3 gap-4 px-4 py-4 md:px-6 md:py-5 hover:bg-white/5 transition-colors"
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
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Comparison CTA (LIGHT) - SEPARATOR */}
      <section className="relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] w-screen bg-white py-16 border-y border-zinc-100">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mx-auto max-w-4xl px-6 text-center"
        >
          <h2 className="mb-8 text-center text-5xl font-bold text-[var(--text-main)] md:text-6xl lg:text-7xl leading-tight">Want To See The Full Picture?</h2>
          <p className="text-[var(--text-muted)] text-base mb-6 max-w-2xl mx-auto">
            Compare our exact features against common EA solutions and traditional copy-trading tools side-by-side.
          </p>
          <Link
            href="/compare"
            className="inline-flex items-center gap-2 rounded-full bg-[var(--brand-blue)] px-8 py-3 text-sm font-medium text-white shadow-md transition hover:bg-[var(--brand-blue-deep)] hover:scale-105"
          >
            View all comparisons
            <span aria-hidden="true">&rarr;</span>
          </Link>
        </motion.div>
      </section>



      {/* Support highlight + FAQ (LIGHT) */}
      <section className="relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] w-screen bg-[var(--bg-light-2)] py-16">
        <div className="mx-auto max-w-6xl px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="mb-10 rounded-2xl border border-[var(--border-subtle)] bg-white/90 p-6 shadow-sm"
          >
            <div className="mb-4 flex flex-col gap-3 items-center text-center">
              <div>
                <h2 className="mb-6 text-center text-5xl font-bold text-[var(--text-main)] md:text-6xl lg:text-7xl leading-tight">
                  Personal Support When You Need It
                </h2>
                <p className="mx-auto text-center text-sm text-[var(--text-muted)]">
                  We know MT5 automation can feel technical, so we stay close during setup
                  and scaling.
                </p>
              </div>
              <Link
                href="/contact"
                className="mt-4 inline-flex items-center justify-center rounded-full border border-[var(--border-subtle)] px-4 py-2 text-xs font-medium text-[var(--text-main)] transition hover:border-[var(--brand-blue-soft)] hover:text-[var(--brand-blue-deep)]"
              >
                Contact support
              </Link>
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              {supportItems.map((item, index) => (
                <motion.div
                  key={item.title}
                  initial={{ opacity: 0, y: 15 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: 0.2 + index * 0.1 }}
                  className="rounded-lg bg-[var(--bg-light-2)] p-4"
                >
                  <h4 className="mb-1 text-sm font-semibold text-[var(--text-main)]">
                    {item.title}
                  </h4>
                  <p className="text-xs text-[var(--text-muted)]">{item.description}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* FAQ preview */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mb-8 flex flex-col items-center justify-center gap-4 text-center"
          >
            <div>
              <h2 className="mb-8 text-center text-5xl font-bold text-[var(--text-main)] md:text-6xl lg:text-7xl leading-tight">
                Common Questions
              </h2>
              <p className="mx-auto max-w-2xl text-center text-sm text-[var(--text-muted)] md:text-base">
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
          </motion.div>
          <div className="grid gap-4 md:grid-cols-2">
            {faqs.map((item, index) => (
              <motion.div
                key={item.question}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.3 + index * 0.1 }}
                className="rounded-lg border border-[var(--border-subtle)] bg-white/80 p-4 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-lg hover:border-[var(--brand-blue-soft)]"
              >
                <h3 className="mb-1 text-sm font-semibold text-[var(--text-main)]">
                  {item.question}
                </h3>
                <p className="text-xs text-[var(--text-muted)] md:text-sm">
                  {item.answer}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA Strip */}
      <section className="relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] w-screen bg-[var(--bg-dark-1)] py-12 text-[var(--text-on-dark)]">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mx-auto flex max-w-6xl flex-col items-center justify-center gap-8 px-6 text-center"
        >
          <div>
            <h2 className="mb-8 text-center text-5xl font-bold md:text-6xl lg:text-7xl leading-tight">
              Ready To Automate Your Telegram Signals Into MT5?
            </h2>
            <p className="mx-auto max-w-xl text-center text-sm text-zinc-400 leading-relaxed">
              Start with a demo account, refine your settings, and move to live trading
              only when you are comfortable with the results.
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/products"
              className="rounded-md bg-[var(--brand-blue)] px-5 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-[var(--brand-blue-soft)] hover:scale-105 hover:shadow-lg"
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
        </motion.div>
      </section>
      <DownloadModal
        isOpen={isDownloadModalOpen}
        onClose={() => setIsDownloadModalOpen(false)}
      />
    </>
  );
}
