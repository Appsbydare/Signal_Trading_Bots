import { NextRequest, NextResponse } from "next/server";

import { getCurrentCustomer } from "@/lib/auth-server";
import { getCustomerById } from "@/lib/auth-users";
import { getTicketById, listTicketReplies, addTicketReply, listTicketsForCustomer } from "@/lib/tickets-db";
import { sendTicketEmail } from "@/lib/email";

function jsonError(status: number, message: string) {
  return NextResponse.json({ success: false, message }, { status });
}

export async function GET(
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

  const replies = await listTicketReplies(ticketId);

  // Get all tickets for this customer to calculate user-specific ticket number
  const allTickets = await listTicketsForCustomer(customer.id);
  // Tickets are sorted by created_at DESC (newest first)
  // So we need to reverse the index: oldest ticket = #1, newest = #N
  const ticketIndex = allTickets.findIndex(t => t.id === ticketId);
  const ticketNumber = allTickets.length - ticketIndex;

  return NextResponse.json({
    success: true,
    ticket,
    replies,
    ticketNumber,
  });
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

  // Fetch customer details to get name
  const customerDetails = await getCustomerById(customer.id);
  const customerName = customerDetails?.name || customer.email;

  const reply = await addTicketReply({
    ticketId: ticket.id,
    authorType: "customer",
    authorId: customer.id,
    authorName: customerName,
    message,
  });

  // Send email notification to company
  const companyEmail = process.env.COMPANY_SUPPORT_EMAIL || "support@signaltradingbots.com";
  const companyHtml = `
    <h2>New Reply on Ticket #${ticket.id}</h2>
    <p><strong>From:</strong> ${customerName}</p>
    <p><strong>Subject:</strong> ${ticket.subject}</p>
    <p><strong>Reply:</strong></p>
    <p>${message.replace(/\n/g, "<br>")}</p>
    <p><a href="${process.env.NEXT_PUBLIC_APP_URL || "https://signaltradingbots.com"}/admin/tickets">View in Admin Panel</a></p>
  `;

  await sendTicketEmail({
    to: companyEmail,
    subject: `Reply on Ticket #${ticket.id} - ${ticket.subject}`,
    html: companyHtml,
  });

  return NextResponse.json({
    success: true,
    reply,
  });
}

