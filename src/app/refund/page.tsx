export const metadata = {
  title: "Refund Policy | signaltradingbots",
  description: "Refund Policy for signaltradingbots.",
};

export default function RefundPage() {
  return (
    <div className="space-y-8">
      <h1 className="reveal brand-heading text-2xl font-semibold tracking-tight">Refund Policy</h1>
      <div className="prose prose-sm max-w-3xl space-y-4 text-zinc-700">
        <p className="reveal">
          Last updated: {new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
        </p>
        <section className="reveal space-y-3">
          <h2>1. Refund Eligibility</h2>
          <p>
            Refund requests must be submitted within 7 days of the initial purchase. Refunds are considered on a
            case-by-case basis.
          </p>
        </section>
        <section className="reveal space-y-3">
          <h2>2. Non-Refundable Situations</h2>
          <p>Refunds may not be granted for:</p>
          <ul className="list-disc space-y-1 pl-5">
            <li>Requests made after 7 days from purchase</li>
            <li>Issues arising from user error or misconfiguration</li>
            <li>Broker or platform compatibility issues that were not disclosed</li>
            <li>Dissatisfaction with trading results or losses</li>
          </ul>
        </section>
        <section className="reveal space-y-3">
          <h2>3. Refund Process</h2>
          <p>
            To request a refund, contact us at{" "}
            <a href="mailto:support@signaltradingbots.com" className="underline">
              support@signaltradingbots.com
            </a>{" "}
            with your purchase details and reason for the request. We will review and respond within 5 business days.
          </p>
        </section>
        <section className="reveal space-y-3">
          <h2>4. Processing Time</h2>
          <p>
            Approved refunds will be processed within 10 business days. Refunds will be issued to the original payment
            method.
          </p>
        </section>
        <section className="reveal space-y-3">
          <h2>5. Subscription Cancellations</h2>
          <p>
            You may cancel your subscription at any time. Cancellation takes effect at the end of the current billing
            period. No refunds are provided for partial subscription periods.
          </p>
        </section>
        <section className="reveal space-y-3">
          <h2>6. Contact</h2>
          <p>
            For refund inquiries, contact us at{" "}
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

