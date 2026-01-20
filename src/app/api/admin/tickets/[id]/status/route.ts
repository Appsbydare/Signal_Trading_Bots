import { NextRequest, NextResponse } from "next/server";

import { getCurrentAdmin } from "@/lib/auth-server";
import { getTicketById, updateTicket, addTicketEvent } from "@/lib/tickets-db";
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

  let body: { status?: string } = {};
  try {
    body = await request.json();
  } catch {
    return jsonError(400, "Invalid JSON body");
  }

  const status = body.status?.trim();
  if (!status || !["pending", "sorted"].includes(status)) {
    return jsonError(400, "Invalid status");
  }

  // Update ticket status
  const updatedTicket = await updateTicket({
    id: ticketId,
    status,
  });

  // Add event
  await addTicketEvent({
    ticketId: ticket.id,
    actorType: "admin",
    actorId: admin.id,
    note: `Status changed to ${status} by admin`,
  });

  // Send email notification to customer if status changed to sorted
  if (status === "sorted" && ticket.email) {
    const customerHtml = `
      <h2>Your Support Ticket #${ticket.id} Has Been Resolved</h2>
      <p><strong>Subject:</strong> ${ticket.subject}</p>
      <p>Our support team has marked your ticket as resolved. If you need further assistance, please create a new ticket.</p>
      <p><a href="${process.env.NEXT_PUBLIC_APP_URL || "https://signaltradingbots.com"}/portal/tickets/${ticket.id}">View Ticket</a></p>
    `;

    await sendTicketEmail({
      to: ticket.email,
      subject: `Ticket #${ticket.id} Resolved - ${ticket.subject}`,
      html: customerHtml,
    });
  }

  return NextResponse.json({
    success: true,
    ticket: updatedTicket,
  });
}

