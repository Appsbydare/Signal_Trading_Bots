import "server-only";

const FROM_EMAIL = process.env.SUPPORT_FROM_EMAIL;
const RESEND_API_KEY = process.env.RESEND_API_KEY;

export interface SendResendEmailArgs {
  to: string | string[];
  subject: string;
  html: string;
  replyTo?: string;
}

function assertEmailConfig() {
  if (!RESEND_API_KEY) {
    throw new Error("RESEND_API_KEY is not configured.");
  }

  if (!FROM_EMAIL) {
    throw new Error("SUPPORT_FROM_EMAIL is not configured.");
  }
}

export function getSupportFromEmail(): string {
  if (!FROM_EMAIL) {
    throw new Error("SUPPORT_FROM_EMAIL is not configured.");
  }

  return FROM_EMAIL;
}

export async function sendResendEmail(args: SendResendEmailArgs): Promise<{ id?: string }> {
  assertEmailConfig();

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: FROM_EMAIL,
      to: args.to,
      subject: args.subject,
      html: args.html,
      reply_to: args.replyTo,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to send email: ${errorText}`);
  }

  return (await response.json()) as { id?: string };
}
