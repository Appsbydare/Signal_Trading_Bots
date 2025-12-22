export const metadata = {
  title: "Contact | signaltradingbots",
  description: "Get in touch with our support team.",
};

export default function ContactPage() {
  return (
    <div className="space-y-8">
      <h1 className="reveal brand-heading text-2xl font-semibold tracking-tight">Contact</h1>
      <div className="space-y-4">
        <p className="reveal max-w-2xl text-sm text-zinc-600">
          We typically respond within 1–2 business days.
        </p>
        <div className="rounded-lg border border-[#5e17eb] bg-white/95 p-4 text-sm shadow-sm transition hover:-translate-y-[2px] hover:shadow-md">
          <p className="mb-2 font-medium">Email support</p>
          <a
            href="mailto:support@signaltradingbots.com"
            className="inline-block rounded-md bg-[#5e17eb] px-3 py-2 !text-white shadow-sm transition hover:bg-[#4512c2] hover:scale-105 hover:shadow-lg"
          >
            support@signaltradingbots.com
          </a>
        </div>
        <div className="rounded-lg border border-[#5e17eb] bg-white/95 p-4 text-sm shadow-sm transition hover:-translate-y-[2px] hover:shadow-md">
          <p className="mb-2 font-medium">Google Form</p>
          <p className="mb-3 text-zinc-600">
            Share your Google Form link and we will wire this button to submit
            directly to your form.
          </p>
          <a
            href="https://docs.google.com/forms/d/e/1FAIpQLSclVvR_Rwz-kdAUdbBRsIr2FxVn2n2RkCY0UP-oLjaLlCAIuA/viewform?usp=header"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block rounded-md bg-[#5e17eb] px-4 py-2 !text-white shadow-sm transition hover:bg-[#4512c2] hover:scale-105 hover:shadow-lg"
          >
            Open Contact Form
          </a>
        </div>
      </div>
      <p className="text-xs text-zinc-500">
        Anti-spam protected. By submitting this form, you agree to our Terms and
        acknowledge our Privacy Policy.
      </p>
    </div>
  );
}


