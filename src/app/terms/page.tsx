export const metadata = {
  title: "Terms and Conditions | signaltradingbots",
  description: "Terms and Conditions for signaltradingbots - Comprehensive terms covering USA, EU, and international regulations.",
};

export default function TermsPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="reveal text-2xl font-semibold tracking-tight">Terms and Conditions</h1>
        <p className="reveal mt-2 text-sm text-zinc-600">
          Comprehensive terms covering USA, EU, and international regulations
        </p>
      </div>
      <div className="prose prose-sm max-w-3xl space-y-6 text-zinc-700">
        <section className="reveal space-y-3">
          <h2 className="text-lg font-semibold">Introduction</h2>
          <p>
            These Terms and Conditions (&quot;Terms&quot;) govern your use of signaltradingbots&apos; trading automation
            software, services, and website. By accessing or using our services, you agree to be bound by these Terms.
          </p>
          <p className="text-sm text-zinc-600">
            <strong>Last Updated:</strong> {new Date().toLocaleDateString("en-US", { year: "numeric", month: "long" })}
            <br />
            <strong>Effective Date:</strong> {new Date().toLocaleDateString("en-US", { year: "numeric", month: "long" })}
          </p>
        </section>

        <section className="reveal space-y-3">
          <h2 className="text-lg font-semibold">Definitions</h2>
          <ul className="list-disc space-y-1 pl-5">
            <li>
              <strong>Service:</strong> Our trading automation bots and related software for Telegram signal integration
              with MT5
            </li>
            <li>
              <strong>User:</strong> Any individual or entity using our services
            </li>
            <li>
              <strong>License:</strong> The right to use our software on a single MT5 account
            </li>
            <li>
              <strong>Platform:</strong> MetaTrader 5 trading platform
            </li>
            <li>
              <strong>Subscription:</strong> Monthly or annual access to our software services
            </li>
          </ul>
        </section>

        <section className="reveal space-y-3">
          <h2 className="text-lg font-semibold">License Terms</h2>
          <p>
            By purchasing our trading automation software, you are granted a limited, non-exclusive,
            non-transferable license to use the software in accordance with your subscription plan.
          </p>
          <h3 className="font-medium">License Restrictions:</h3>
          <ul className="list-disc space-y-1 pl-5">
            <li>One license per MT5 account only</li>
            <li>No sharing, reselling, or redistribution of the software</li>
            <li>No reverse engineering or unauthorized modification</li>
            <li>No use on multiple accounts without additional licenses</li>
            <li>License is bound to the specific account number provided</li>
            <li>All intellectual property rights remain with signaltradingbots</li>
          </ul>
        </section>

        <section className="reveal space-y-3">
          <h2 className="text-lg font-semibold">Regulatory Compliance</h2>
          <p>Our services comply with applicable regulations in major jurisdictions:</p>
          <h3 className="font-medium">United States (USA):</h3>
          <ul className="list-disc space-y-1 pl-5">
            <li>Compliance with CFTC regulations for automated trading</li>
            <li>Adherence to SEC guidelines for financial software</li>
            <li>State-specific regulations where applicable</li>
          </ul>
          <h3 className="font-medium">European Union (EU):</h3>
          <ul className="list-disc space-y-1 pl-5">
            <li>GDPR compliance for data protection</li>
            <li>MiFID II compliance for financial instruments</li>
            <li>ePrivacy Directive compliance</li>
            <li>Country-specific financial regulations</li>
          </ul>
          <h3 className="font-medium">Other Jurisdictions:</h3>
          <ul className="list-disc space-y-1 pl-5">
            <li>UK: FCA regulations and data protection laws</li>
            <li>Canada: PIPEDA and provincial regulations</li>
            <li>Australia: Privacy Act and ASIC regulations</li>
            <li>Singapore: PDPA and MAS regulations</li>
            <li>Japan: APPI and financial services regulations</li>
          </ul>
        </section>

        <section className="reveal space-y-3">
          <h2 className="text-lg font-semibold">Usage Terms</h2>
          <p>
            Our trading automation bots are designed for educational and trading purposes. Users are responsible for
            their own trading decisions and risk management.
          </p>
          <h3 className="font-medium">User Responsibilities:</h3>
          <ul className="list-disc space-y-1 pl-5">
            <li>Test all bots on demo accounts before live trading</li>
            <li>Understand the risks involved in automated trading</li>
            <li>Monitor bot performance and adjust settings as needed</li>
            <li>Ensure proper risk management and position sizing</li>
            <li>Keep software and dependencies updated</li>
            <li>Comply with local trading regulations and broker terms</li>
            <li>Maintain secure Telegram API credentials and access</li>
            <li>Ensure your broker allows Expert Advisors and automated trading</li>
          </ul>
        </section>

        <section className="reveal space-y-3">
          <h2 className="text-lg font-semibold">Payment Terms</h2>
          <p>
            All payments are processed securely through our payment gateways. Prices are listed in USD but may be
            converted to your local currency.
          </p>
          <h3 className="font-medium">Payment Information:</h3>
          <ul className="list-disc space-y-1 pl-5">
            <li>All prices are final and non-negotiable</li>
            <li>Payments are processed via cryptocurrency or other accepted methods</li>
            <li>License delivery occurs after payment confirmation</li>
            <li>Subscription fees are recurring based on your selected plan</li>
            <li>Refunds available within 7 days for unused licenses (see Refund Policy)</li>
            <li>Tax obligations are the responsibility of the user</li>
          </ul>
        </section>

        <section className="reveal space-y-3">
          <h2 className="text-lg font-semibold">Refund Policy</h2>
          <p>We offer a 7-day money-back guarantee for all products under specific conditions.</p>
          <h3 className="font-medium">Refund Conditions:</h3>
          <ul className="list-disc space-y-1 pl-5">
            <li>Request must be made within 7 days of purchase</li>
            <li>Bot must not have been used for live trading</li>
            <li>Technical issues that cannot be resolved by our support team</li>
            <li>No refunds for used licenses or after 7-day period</li>
            <li>Refunds processed in the original payment method</li>
            <li>Processing time: 3-5 business days</li>
          </ul>
          <p className="text-sm text-zinc-600">
            For more details, please see our{" "}
            <a href="/refund" className="underline">
              Refund Policy
            </a>
            .
          </p>
        </section>

        <section className="reveal space-y-3">
          <h2 className="text-lg font-semibold">Support Terms</h2>
          <p>
            We provide technical support for installation, configuration, and troubleshooting of our products during the
            subscription period.
          </p>
          <h3 className="font-medium">Support Includes:</h3>
          <ul className="list-disc space-y-1 pl-5">
            <li>Software installation and setup assistance</li>
            <li>MT5 integration help</li>
            <li>Telegram signal configuration</li>
            <li>Bug fixes and compatibility updates</li>
            <li>Email support with 24-hour response time</li>
            <li>Access to documentation and guides</li>
          </ul>
        </section>

        <section className="reveal space-y-3">
          <h2 className="text-lg font-semibold">Intellectual Property</h2>
          <p>All software, documentation, and related materials remain our intellectual property.</p>
          <h3 className="font-medium">IP Rights:</h3>
          <ul className="list-disc space-y-1 pl-5">
            <li>All code and software remain our property</li>
            <li>No redistribution or resale rights</li>
            <li>Custom modifications are permitted for personal use only</li>
            <li>Trademarks and branding are protected</li>
            <li>Documentation and guides are copyrighted</li>
          </ul>
        </section>

        <section className="reveal space-y-3">
          <h2 className="text-lg font-semibold">Disclaimers</h2>
          <h3 className="font-medium">Important Disclaimers:</h3>
          <ul className="list-disc space-y-1 pl-5">
            <li>Trading involves substantial risk of loss and is not suitable for all investors</li>
            <li>Past performance does not guarantee future results</li>
            <li>Automated trading systems can result in losses</li>
            <li>We are not responsible for trading losses or financial damages</li>
            <li>Users should always test on demo accounts first</li>
            <li>API connectivity issues are beyond our control</li>
            <li>Market conditions may affect bot performance</li>
            <li>We are not financial advisers and do not provide trading advice</li>
          </ul>
        </section>

        <section className="reveal space-y-3">
          <h2 className="text-lg font-semibold">Limitation of Liability</h2>
          <p>Our liability is limited to the amount paid for the software license or subscription.</p>
          <h3 className="font-medium">Liability Limits:</h3>
          <ul className="list-disc space-y-1 pl-5">
            <li>Maximum liability: Purchase price of the license or subscription</li>
            <li>No consequential or indirect damages</li>
            <li>No liability for trading losses</li>
            <li>No liability for data loss or corruption</li>
            <li>Force majeure events excluded</li>
          </ul>
        </section>

        <section className="reveal space-y-3">
          <h2 className="text-lg font-semibold">Third-Party Services</h2>
          <p>
            This software uses Telegram API and MetaTrader 5. We are independent third-party software providers, not
            affiliated with, endorsed by, or sponsored by Telegram FZ-LLC or MetaQuotes Software Corp.
          </p>
        </section>

        <section className="reveal space-y-3">
          <h2 className="text-lg font-semibold">Governing Law</h2>
          <p>
            These Terms are governed by applicable laws in your jurisdiction. Any disputes will be resolved through
            appropriate legal channels.
          </p>
          <h3 className="font-medium">Legal Information:</h3>
          <ul className="list-disc space-y-1 pl-5">
            <li>Terms may be updated without notice</li>
            <li>Continued use constitutes acceptance of new terms</li>
            <li>Severability clause applies to all terms</li>
            <li>Force majeure events may affect service delivery</li>
            <li>Dispute resolution through arbitration or local courts</li>
          </ul>
        </section>

        <section className="reveal space-y-3">
          <h2 className="text-lg font-semibold">Questions About These Terms?</h2>
          <p>
            If you have any questions about these terms and conditions, please contact our support team at{" "}
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

