"use client";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import XmLogo from "../../broker_logos/XM-Logo.webp";

export default function Home() {
  const features = [
    {
      title: "24/7 automation",
      description:
        "Let the bot watch your Telegram channels and execute MT5 trades around the clock.",
    },
    {
      title: "Multi‑TP & SL logic",
      description:
        "Configure multiple take‑profit levels, stop loss, and partial closes based on your strategy.",
    },
    {
      title: "Risk‑based sizing",
      description:
        "Control position size by fixed lot or percentage risk per trade on supported MT5 brokers.",
    },
    {
      title: "Flexible mapping",
      description:
        "Adapt to different Telegram signal formats with configurable mapping rules.",
    },
  ];

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
      label: "Execution speed",
      manual: "You manually copy signals when you are online.",
      bot: "Orders are placed automatically within seconds of the signal.",
    },
    {
      label: "Missed trades",
      manual: "Easy to miss late‑night or work‑time signals.",
      bot: "Runs 24/7 on VPS so signals are not missed.",
    },
    {
      label: "Consistency",
      manual: "Decisions can be emotional and inconsistent.",
      bot: "Rules are followed exactly as configured every time.",
    },
    {
      label: "Workload",
      manual: "You monitor chats and place every trade by hand.",
      bot: "You focus on strategy while execution is automated.",
    },
  ];

  const pricingPlans = [
    {
      name: "Starter",
      badge: "For testing on demo",
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
      features: [
        "Full configuration flexibility",
        "Priority support during setup",
        "Best for active signal users",
      ],
    },
    {
      name: "Lifetime",
      badge: "One‑time payment",
      features: [
        "One license, long‑term usage",
        "Access to future improvements",
        "Designed for committed traders",
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
      {/* Notice Banner */}
      <div className="bg-[var(--bg-light-2)] py-4">
        <div className="mx-auto max-w-6xl px-6 text-center">
          <p className="text-sm font-medium text-[var(--brand-blue-deep)]">
            Service will be commencing on <strong>26th November</strong>
          </p>
        </div>
      </div>

      {/* Hero Section - Full Width (LIGHT) */}
      <section className="relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] w-screen bg-[var(--bg-light-1)] py-16">
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-12 px-6 md:flex-row md:items-start">
          <div className="flex-1 space-y-6">
            <motion.h1
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className="reveal brand-heading text-4xl font-semibold tracking-tight md:text-5xl"
            >
              Automate MT5 trades directly from Telegram signals
            </motion.h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.15, duration: 0.5 }}
              className="reveal max-w-xl text-sm text-[var(--text-muted)] md:text-base"
            >
              Configure multi‑TP and SL logic, order types, and lot sizing once. The bot
              watches your Telegram channels and executes trades on MT5 while you sleep.
            </motion.p>
            <div className="flex flex-wrap gap-4">
              <Link
                href="/products"
                className="rounded-md bg-[var(--brand-blue)] px-5 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-[var(--brand-blue-deep)] hover:scale-105 hover:shadow-lg"
              >
                View Products
              </Link>
              <Link
                href="/specs"
                className="rounded-md border border-[var(--border-subtle)] px-5 py-2 text-sm font-medium text-[var(--text-main)] transition hover:border-[var(--brand-blue-soft)] hover:text-[var(--brand-blue-deep)]"
              >
                View Specs
              </Link>
            </div>
            <div className="mt-6 space-y-4">
              <div className="flex flex-wrap items-center gap-3">
                <span className="text-xs font-medium uppercase tracking-wide text-[var(--text-muted)]">
                  Supported platforms
                </span>
                <Image
                  src="/telegram-badge.svg"
                  alt="Telegram Compatible"
                  title="Works with Telegram signals"
                  width={32}
                  height={32}
                  className="h-8 w-8 transition hover:scale-110"
                  loading="lazy"
                />
                <Image
                  src="/mt5-badge.svg"
                  alt="MT5 Supported"
                  title="Executes trades via MetaTrader 5"
                  width={32}
                  height={32}
                  className="h-8 w-8 transition hover:scale-110"
                  loading="lazy"
                />
              </div>
            </div>
          </div>
          <div className="flex-1">
            <div className="brand-callout relative rounded-xl bg-white/80 p-6 shadow-sm">
              <h3 className="mb-3 text-sm font-semibold text-[var(--text-main)]">
                How the bot fits into your trading
              </h3>
              <p className="mb-4 text-sm text-[var(--text-muted)]">
                Choose your signal provider, configure your rules once, and let the bot
                handle the execution on MT5. You stay in control of risk and broker
                selection at all times.
              </p>
              <ul className="space-y-2 text-xs text-[var(--text-muted)]">
                <li>• Works with MT5 EAs and supported brokers</li>
                <li>• Designed for running on Windows or VPS</li>
                <li>• Start safely on a demo account first</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Key Features (DARK) */}
      <section className="relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] w-screen bg-[var(--bg-dark-2)] py-16 text-[var(--text-on-dark)]">
        <div className="mx-auto max-w-6xl px-6">
          <div className="mb-10 text-center">
            <h2 className="mb-3 text-2xl font-semibold md:text-3xl">
              Built for real Telegram signal workflows
            </h2>
            <p className="mx-auto max-w-2xl text-sm text-zinc-400 md:text-base">
              Simple to configure, but powerful enough to handle multiple take‑profits,
              risk‑based sizing, and different signal formats.
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-2">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="rounded-lg border border-[var(--border-on-dark-strong)] bg-[var(--bg-dark-3)] p-6"
              >
                <h3 className="mb-2 text-base font-semibold">{feature.title}</h3>
                <p className="text-sm text-zinc-400">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works (LIGHT) */}
      <section className="relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] w-screen bg-[var(--bg-light-1)] py-16">
        <div className="mx-auto max-w-6xl px-6">
          <div className="mb-8 text-center">
            <h2 className="mb-3 text-2xl font-semibold text-[var(--text-main)] md:text-3xl">
              How it works
            </h2>
            <p className="mx-auto max-w-2xl text-sm text-[var(--text-muted)] md:text-base">
              A clear step‑by‑step flow from Telegram signal to MT5 execution so you know
              exactly what the bot is doing.
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-5">
            {steps.map((step, index) => (
              <div
                key={step.title}
                className="flex flex-col rounded-lg bg-white/70 p-4 text-left shadow-sm"
              >
                <span className="mb-2 inline-flex h-7 w-7 items-center justify-center rounded-full bg-[var(--brand-blue)] text-xs font-semibold text-white">
                  {index + 1}
                </span>
                <h3 className="mb-1 text-sm font-semibold text-[var(--text-main)]">
                  {step.title}
                </h3>
                <p className="text-xs text-[var(--text-muted)]">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Manual vs Bot Comparison (DARK) */}
      <section className="relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] w-screen bg-[var(--bg-dark-3)] py-16 text-[var(--text-on-dark)]">
        <div className="mx-auto max-w-6xl px-6">
          <div className="mb-8 text-center">
            <h2 className="mb-3 text-2xl font-semibold md:text-3xl">
              Manual copying vs automation
            </h2>
            <p className="mx-auto max-w-2xl text-sm text-zinc-400 md:text-base">
              See where automation adds value while you still control risk, broker, and
              strategy.
            </p>
          </div>
          <div className="overflow-hidden rounded-xl border border-[var(--border-on-dark-strong)] bg-[var(--bg-dark-2)]">
            <div className="grid grid-cols-3 border-b border-[var(--border-on-dark-strong)] bg-black/20 px-4 py-3 text-xs font-semibold uppercase tracking-wide text-zinc-400 md:px-6">
              <div>Aspect</div>
              <div className="text-center">Manual</div>
              <div className="text-center">With bot</div>
            </div>
            <div className="divide-y divide-[var(--border-on-dark-strong)]">
              {comparisonRows.map((row) => (
                <div key={row.label} className="grid grid-cols-3 gap-4 px-4 py-4 md:px-6">
                  <div className="text-sm font-medium">{row.label}</div>
                  <div className="text-sm text-zinc-400">{row.manual}</div>
                  <div className="text-sm text-zinc-200">{row.bot}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Preview (LIGHT) */}
      <section className="relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] w-screen bg-[var(--bg-light-1)] py-16">
        <div className="mx-auto max-w-6xl px-6">
          <div className="mb-8 text-center">
            <h2 className="mb-3 text-2xl font-semibold text-[var(--text-main)] md:text-3xl">
              Simple plans for different trading stages
            </h2>
            <p className="mx-auto max-w-2xl text-sm text-[var(--text-muted)] md:text-base">
              Start on demo, then scale to live once you are comfortable. Pricing details
              are available on the products and payment pages.
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {pricingPlans.map((plan) => (
              <div
                key={plan.name}
                className={`flex flex-col rounded-xl border bg-white/80 p-6 text-left shadow-sm ${
                  plan.featured
                    ? "border-[var(--brand-blue)] shadow-md"
                    : "border-[var(--border-subtle)]"
                }`}
              >
                <div className="mb-2 flex items-center justify-between">
                  <h3 className="text-base font-semibold text-[var(--text-main)]">
                    {plan.name}
                  </h3>
                  {plan.badge && (
                    <span className="rounded-full bg-[var(--brand-blue-soft)]/20 px-3 py-1 text-xs font-medium text-[var(--brand-blue-deep)]">
                      {plan.badge}
                    </span>
                  )}
                </div>
                <ul className="mb-4 mt-3 space-y-2 text-sm text-[var(--text-muted)]">
                  {plan.features.map((item) => (
                    <li key={item}>• {item}</li>
                  ))}
                </ul>
                <div className="mt-auto pt-2">
                  <Link
                    href="/products"
                    className={`inline-flex w-full items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition ${
                      plan.featured
                        ? "bg-[var(--brand-blue)] text-white hover:bg-[var(--brand-blue-deep)]"
                        : "border border-[var(--border-subtle)] text-[var(--text-main)] hover:border-[var(--brand-blue-soft)] hover:text-[var(--brand-blue-deep)]"
                    }`}
                  >
                    View details
                  </Link>
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
                className="flex flex-col rounded-xl border border-[var(--border-on-dark-strong)] bg-[var(--bg-dark-3)] p-6"
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

      {/* FAQ Preview (LIGHT) */}
      <section className="relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] w-screen bg-[var(--bg-light-1)] py-16">
        <div className="mx-auto max-w-6xl px-6">
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
                className="rounded-lg border border-[var(--border-subtle)] bg-white/80 p-4"
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

      {/* Broker List / Supported brokers (DARK) */}
      <section className="relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] w-screen bg-[var(--bg-dark-1)] py-16 text-[var(--text-on-dark)]">
        <div className="mx-auto max-w-6xl px-6">
          <h2 className="mb-8 text-center text-2xl font-semibold">Example supported brokers</h2>

          {/* First Row - Moving Left to Right */}
          <div className="mb-8 overflow-hidden">
            <div className="broker-scroll-left flex gap-4">
              {[
                {
                  name: "XM Group",
                  description:
                    "Forex trading and trading in other leveraged products involves substantial risk.",
                  referralLink: "https://www.xmglobal.com/referral?token=GxGWLVScWveRbMRJ8v1pbQ",
                  logo: XmLogo,
                },
                {
                  name: "PrimeXBT",
                  description: "Trading involves substantial risk and may not be suitable for all investors.",
                  logo: undefined,
                },
                {
                  name: "Trade Nation",
                  description: "Financial Spread Bets and CFDs are complex instruments with high risk.",
                  logo: undefined,
                },
                {
                  name: "HF Markets",
                  description: "Risk Warning: Trading leveraged products such as CFDs carries significant risk.",
                  logo: undefined,
                },
              ].map((broker, index) => (
                <div
                  key={`row1-${index}`}
                  className="broker-card flex min-w-[300px] flex-shrink-0 flex-col rounded-lg bg-zinc-800 p-6 text-white"
                >
                  <div className="mb-4 flex items-center gap-4">
                    <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded bg-zinc-700 text-xs text-zinc-400">
                      {broker.logo ? (
                        <Image
                          src={broker.logo}
                          alt={`${broker.name} logo`}
                          width={64}
                          height={64}
                          className="h-full w-full object-contain"
                        />
                      ) : (
                        "Logo"
                      )}
                    </div>
                    <h3 className="text-lg font-semibold">{broker.name}</h3>
                  </div>
                  <p className="mb-4 text-sm text-zinc-300">{broker.description}</p>
                  {broker.referralLink ? (
                    <Link
                      href={broker.referralLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-auto rounded-md bg-[var(--brand-blue)] px-4 py-2 text-center text-white !text-white transition hover:bg-[var(--brand-blue-deep)]"
                    >
                      Open Account
                    </Link>
                  ) : (
                    <button className="mt-auto rounded-md bg-[var(--brand-blue)] px-4 py-2 text-white !text-white transition hover:bg-[var(--brand-blue-deep)]">
                      Open Account
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Second Row - Moving Right to Left */}
          <div className="overflow-hidden">
            <div className="broker-scroll-right flex gap-4">
              {[
                {
                  name: "IC Markets",
                  description: "IC Markets Global is the trading name of Raw Trading Ltd.",
                  logo: undefined,
                },
                {
                  name: "ATFX",
                  description: "ATFX is a leading forex broker trusted by traders worldwide.",
                  logo: undefined,
                },
                {
                  name: "FxPro",
                  description: "Risk Warning: Contracts for Difference (CFDs) carry a high level of risk.",
                  logo: undefined,
                },
                {
                  name: "Pepperstone",
                  description: "CFDs are complex instruments and come with a high risk of losing money.",
                  logo: undefined,
                },
              ].map((broker, index) => (
                <div
                  key={`row2-${index}`}
                  className="broker-card flex min-w-[300px] flex-shrink-0 flex-col rounded-lg bg-zinc-800 p-6 text-white"
                >
                  <div className="mb-4 flex items-center gap-4">
                    <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded bg-zinc-700 text-xs text-zinc-400">
                      {broker.logo ? (
                        <Image
                          src={broker.logo}
                          alt={`${broker.name} logo`}
                          width={64}
                          height={64}
                          className="h-full w-full object-contain"
                        />
                      ) : (
                        "Logo"
                      )}
                    </div>
                    <h3 className="text-lg font-semibold">{broker.name}</h3>
                  </div>
                  <p className="mb-4 text-sm text-zinc-300">{broker.description}</p>
                  <button className="mt-auto rounded-md bg-[var(--brand-blue)] px-4 py-2 text-white !text-white transition hover:bg-[var(--brand-blue-deep)]">
                    Open Account
                  </button>
                </div>
              ))}
            </div>
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
