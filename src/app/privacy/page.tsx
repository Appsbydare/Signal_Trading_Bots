export const metadata = {
  title: "Privacy Policy | signaltradingbots",
  description: "Privacy Policy for signaltradingbots.",
};

export default function PrivacyPage() {
  return (
    <div className="space-y-8">
      <h1 className="reveal text-2xl font-semibold tracking-tight">Privacy Policy</h1>
      <div className="prose prose-sm max-w-3xl space-y-4 text-zinc-700">
        <p className="reveal">
          Last updated: {new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
        </p>
        <section className="reveal space-y-3">
          <h2>1. Information We Collect</h2>
          <p>We collect information you provide directly, such as:</p>
          <ul className="list-disc space-y-1 pl-5">
            <li>Contact information (name, email) when you contact us</li>
            <li>Subscription and payment information</li>
            <li>Hardware fingerprinting for license management</li>
          </ul>
        </section>
        <section className="reveal space-y-3">
          <h2>2. How We Use Information</h2>
          <p>We use collected information to:</p>
          <ul className="list-disc space-y-1 pl-5">
            <li>Provide and maintain the software service</li>
            <li>Process payments and manage subscriptions</li>
            <li>Respond to support requests</li>
            <li>Enforce license terms</li>
          </ul>
        </section>
        <section className="reveal space-y-3">
          <h2>3. Data Security</h2>
          <p>
            We implement reasonable security measures to protect your information. However, no method of transmission
            over the internet is 100% secure.
          </p>
        </section>
        <section className="reveal space-y-3">
          <h2>4. Third-Party Services</h2>
          <p>
            Our software integrates with Telegram and MetaTrader 5. We do not control their privacy practices. Please
            review their respective privacy policies.
          </p>
        </section>
        <section className="reveal space-y-3">
          <h2>5. Your Rights</h2>
          <p>You may request access, correction, or deletion of your personal information by contacting us.</p>
        </section>
        <section className="reveal space-y-3">
          <h2>6. Contact</h2>
          <p>
            For privacy inquiries, contact us at{" "}
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

