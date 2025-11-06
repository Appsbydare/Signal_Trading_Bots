export const metadata = {
  title: "Contact | signaltradingbots",
  description: "Get in touch with our support team.",
};

export default function ContactPage() {
  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-semibold tracking-tight">Contact</h1>
      <p className="max-w-2xl text-sm text-zinc-600">
        Send us a message. We typically respond within 1–2 business days.
      </p>
      <form
        action="https://formspree.io/f/your-id"
        method="POST"
        className="grid max-w-xl gap-4"
      >
        <label className="grid gap-1 text-sm">
          <span>Name</span>
          <input
            name="name"
            required
            className="rounded-md border px-3 py-2"
            placeholder="Your name"
          />
        </label>
        <label className="grid gap-1 text-sm">
          <span>Email</span>
          <input
            type="email"
            name="email"
            required
            className="rounded-md border px-3 py-2"
            placeholder="you@example.com"
          />
        </label>
        <label className="grid gap-1 text-sm">
          <span>Message</span>
          <textarea
            name="message"
            rows={5}
            required
            className="rounded-md border px-3 py-2"
            placeholder="How can we help?"
          />
        </label>
        <button className="w-fit rounded-md bg-black px-4 py-2 text-white hover:bg-zinc-800">
          Send
        </button>
      </form>
      <p className="text-xs text-zinc-500">
        Anti-spam protected. By submitting this form, you agree to our Terms and
        acknowledge our Privacy Policy.
      </p>
    </div>
  );
}


