import "server-only";

const FROM_EMAIL =
  process.env.SUPPORT_FROM_EMAIL || "support@signaltradingbots.com";
const RESEND_API_KEY = process.env.RESEND_API_KEY;

export async function sendTicketEmail(params: {
  to: string;
  subject: string;
  html: string;
}): Promise<void> {
  if (!RESEND_API_KEY) {
    console.warn(
      "RESEND_API_KEY is not configured. Ticket email will not be sent.",
    );
    return;
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: FROM_EMAIL,
      to: params.to,
      subject: params.subject,
      html: params.html,
    }),
  });

  if (!response.ok) {
    console.error("Failed to send ticket email", await response.text());
  }
}


