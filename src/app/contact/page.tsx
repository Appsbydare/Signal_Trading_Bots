export const metadata = {
  title: "Contact | signaltradingbots",
  description: "Get in touch with our support team.",
};

export default function ContactPage() {
  return (
    <div className="space-y-8">
      <h1 className="reveal text-2xl font-semibold tracking-tight">Contact</h1>
      <div className="space-y-4">
        <p className="reveal max-w-2xl text-sm text-zinc-600">
          We typically respond within 1–2 business days.
        </p>
        <div className="rounded-lg border p-4 text-sm">
          <p className="mb-2 font-medium">Email support</p>
          <a
            href="mailto:support@signaltradingbots.com"
            className="inline-block rounded-md border px-3 py-2 hover:bg-zinc-50"
          >
            support@signaltradingbots.com
          </a>
        </div>
        <div className="rounded-lg border p-4 text-sm">
          <p className="mb-2 font-medium">Google Form</p>
          <p className="mb-3 text-zinc-600">
            Share your Google Form link and we will wire this button to submit
            directly to your form.
          </p>
          <a
            href="https://docs.google.com/forms/d/e/1FAIpQLSclVvR_Rwz-kdAUdbBRsIr2FxVn2n2RkCY0UP-oLjaLlCAIuA/viewform?usp=header"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block rounded-md bg-black px-4 py-2 text-white hover:bg-zinc-800"
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


