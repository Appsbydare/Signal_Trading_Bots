import { NextRequest, NextResponse } from "next/server";

import { getCurrentCustomer } from "@/lib/auth-server";
import { getTicketById, updateTicket, addTicketEvent } from "@/lib/tickets-db";
import { sendTicketEmail } from "@/lib/email";

function jsonError(status: number, message: string) {
  return NextResponse.json({ success: false, message }, { status });
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const customer = await getCurrentCustomer();

  if (!customer) {
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

  // Check access: either by customer_id or by email
  const hasAccess = 
    ticket.customer_id === customer.id || 
    (ticket.email && ticket.email.toLowerCase() === customer.email.toLowerCase());

  if (!hasAccess) {
    return jsonError(403, "You don't have access to this ticket");
  }

  // Check if already closed
  if (ticket.status === "sorted") {
    return jsonError(400, "Ticket is already closed");
  }

  // Update ticket status to "sorted" (resolved)
  const updatedTicket = await updateTicket({
    id: ticketId,
    status: "sorted",
  });

  // Add event
  await addTicketEvent({
    ticketId: ticket.id,
    actorType: "customer",
    actorId: customer.id,
    note: "Ticket closed by customer",
  });

  // Send notification to company
  const companyEmail = process.env.COMPANY_SUPPORT_EMAIL || "support@signaltradingbots.com";
  const companyHtml = `
    <h2>Ticket #${ticket.id} Closed by Customer</h2>
    <p><strong>Subject:</strong> ${ticket.subject}</p>
    <p>The customer has marked this ticket as resolved.</p>
    <p><a href="${process.env.NEXT_PUBLIC_APP_URL || "https://signaltradingbots.com"}/admin/tickets">View in Admin Panel</a></p>
  `;

  await sendTicketEmail({
    to: companyEmail,
    subject: `Ticket #${ticket.id} Closed - ${ticket.subject}`,
    html: companyHtml,
  });

  return NextResponse.json({
    success: true,
    ticket: updatedTicket,
  });
}

