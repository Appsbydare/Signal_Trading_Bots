import { NextRequest, NextResponse } from "next/server";

import { getCurrentAdmin } from "@/lib/auth-server";
import { getTicketById, addTicketReply } from "@/lib/tickets-db";
import { sendTicketEmail } from "@/lib/email";

function jsonError(status: number, message: string) {
  return NextResponse.json({ success: false, message }, { status });
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await getCurrentAdmin();

  if (!admin) {
    return jsonError(401, "Unauthorized");
  }

  const { id } = await params;
  const ticketId = parseInt(id, 10);
  if (isNaN(ticketId)) {
    return jsonError(400, "Invalid ticket ID");
  }

  const ticket = await getTicketById(ticketId);

  if (!ticket) {
    return jsonError(404, "Ticket not found");
  }

  let body: { message?: string } = {};
  try {
    body = await request.json();
  } catch {
    return jsonError(400, "Invalid JSON body");
  }

  const message = body.message?.trim();
  if (!message) {
    return jsonError(400, "Message is required");
  }

  const reply = await addTicketReply({
    ticketId: ticket.id,
    authorType: "admin",
    authorId: admin.id,
    authorName: admin.email,
    message,
  });

  // Send email notification to customer if email is available
  if (ticket.email) {
    const customerHtml = `
      <h2>New Reply on Your Support Ticket #${ticket.id}</h2>
      <p><strong>Subject:</strong> ${ticket.subject}</p>
      <p><strong>Support Team:</strong></p>
      <p>${message.replace(/\n/g, "<br>")}</p>
      <p><a href="${process.env.NEXT_PUBLIC_APP_URL || "https://signaltradingbots.com"}/portal/tickets/${ticket.id}">View Ticket</a></p>
    `;

    await sendTicketEmail({
      to: ticket.email,
      subject: `Reply on Ticket #${ticket.id} - ${ticket.subject}`,
      html: customerHtml,
    });
  }

  return NextResponse.json({
    success: true,
    reply,
  });
}

