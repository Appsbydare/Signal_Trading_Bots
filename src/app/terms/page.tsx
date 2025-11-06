export const metadata = {
  title: "Terms of Service | signaltradingbots",
  description: "Terms of Service for signaltradingbots.",
};

export default function TermsPage() {
  return (
    <div className="space-y-8">
      <h1 className="reveal text-2xl font-semibold tracking-tight">Terms of Service</h1>
      <div className="prose prose-sm max-w-3xl space-y-4 text-zinc-700">
        <p className="reveal">
          Last updated: {new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
        </p>
        <section className="reveal space-y-3">
          <h2>1. Acceptance of Terms</h2>
          <p>
            By accessing and using signaltradingbots software, you agree to be bound by these Terms of Service.
          </p>
        </section>
        <section className="reveal space-y-3">
          <h2>2. Software License</h2>
          <p>
            The software is provided on a subscription basis. You are granted a non-exclusive, non-transferable license
            to use the software in accordance with your subscription plan.
          </p>
        </section>
        <section className="reveal space-y-3">
          <h2>3. User Responsibilities</h2>
          <p>You agree to:</p>
          <ul className="list-disc space-y-1 pl-5">
            <li>Test thoroughly on demo accounts before live trading</li>
            <li>Comply with your broker&apos;s terms and conditions</li>
            <li>Comply with Telegram&apos;s Terms of Service</li>
            <li>Obtain your own Telegram API credentials</li>
            <li>Ensure your broker allows Expert Advisors and automated trading</li>
          </ul>
        </section>
        <section className="reveal space-y-3">
          <h2>4. Risk Disclaimer</h2>
          <p>
            Trading involves substantial risk of loss. More than 95% of traders lose money. This software is provided
            &quot;as is&quot; without warranties. We are not financial advisers and do not provide trading advice.
          </p>
        </section>
        <section className="reveal space-y-3">
          <h2>5. Third-Party Services</h2>
          <p>
            This software uses Telegram API and MetaTrader 5. We are independent third-party software providers, not
            affiliated with, endorsed by, or sponsored by Telegram FZ-LLC or MetaQuotes Software Corp.
          </p>
        </section>
        <section className="reveal space-y-3">
          <h2>6. Limitation of Liability</h2>
          <p>
            We shall not be liable for any trading losses, damages, or financial consequences resulting from the use of
            this software.
          </p>
        </section>
        <section className="reveal space-y-3">
          <h2>7. Contact</h2>
          <p>
            For questions about these terms, contact us at{" "}
            <a href="mailto:support@signaltradingbots.com" className="underline">
              support@signaltradingbots.com
            </a>
            .
          </p>
        </section>
      </div>
    </div>
  );
}

