import { NextRequest, NextResponse } from "next/server";

import { getCurrentCustomer } from "@/lib/auth-server";
import { getConversationById } from "@/lib/chat-db";
import { getCustomerById } from "@/lib/auth-users";
import { addTicketEvent, createTicket, listTicketsForCustomer } from "@/lib/tickets-db";
import { sendTicketEmail } from "@/lib/email";

function jsonError(status: number, message: string) {
  return NextResponse.json({ success: false, message }, { status });
}

export async function POST(request: NextRequest) {
  let body: { conversationId?: number; subject?: string; description?: string } = {};

  try {
    body = await request.json();
  } catch {
    return jsonError(400, "Invalid JSON body");
  }

  const conversationId = body.conversationId;
  const subject =
    (body.subject && body.subject.trim()) ||
    "Support request from virtual agent chat";
  const description = body.description?.trim() || null;

  if (!conversationId) {
    return jsonError(400, "conversationId is required");
  }

  if (!description) {
    return jsonError(400, "Please describe your issue");
  }

  // Only logged-in customers can create tickets
  const customer = await getCurrentCustomer();
  
  if (!customer) {
    return jsonError(401, "Please log in to create a support ticket");
  }

  const conversation = await getConversationById(conversationId);

  if (!conversation) {
    return jsonError(404, "Conversation not found");
  }

  if (
    conversation.customer_id &&
    customer.id !== conversation.customer_id
  ) {
    return jsonError(403, "Conversation does not belong to this customer");
  }

  const customerId = customer.id;
  const email = customer.email;
  
  // Fetch customer details for name
  const customerDetails = await getCustomerById(customerId);
  const customerName = customerDetails?.name ?? null;

  const ticket = await createTicket({
    conversationId: conversation.id,
    customerId,
    email,
    subject,
    description,
  });

  // Get all tickets for this customer to calculate user-specific ticket number
  const allTickets = await listTicketsForCustomer(customerId);
  // Tickets are sorted by created_at DESC (newest first)
  // So we need to reverse the index: oldest ticket = #1, newest = #N
  const ticketIndex = allTickets.findIndex(t => t.id === ticket.id);
  const ticketNumber = allTickets.length - ticketIndex;

  await addTicketEvent({
    ticketId: ticket.id,
    actorType: "system",
    note: "Ticket created from virtual agent chat",
  });

  // Send notification to company email
  const companyEmail = process.env.COMPANY_SUPPORT_EMAIL || "support@signaltradingbots.com";
  const companyHtml = `
    <h2>New Support Ticket #${ticket.id}</h2>
    <p><strong>From:</strong> ${customerName || email || "Guest"} ${email ? `(${email})` : ""}</p>
    <p><strong>Subject:</strong> ${subject}</p>
    <p><strong>Description:</strong></p>
    <p>${description.replace(/\n/g, "<br>")}</p>
    <p><a href="${process.env.NEXT_PUBLIC_APP_URL || "https://signaltradingbots.com"}/admin/tickets">View in Admin Panel</a></p>
  `;
  
  await sendTicketEmail({
    to: companyEmail,
    subject: `New Support Ticket #${ticket.id} - ${subject}`,
    html: companyHtml,
  });

  // Send confirmation to customer
  const customerHtml = `
    <p>Your support ticket has been created successfully.</p>
    <p><strong>Ticket #${ticket.id}</strong></p>
    <p><strong>Subject:</strong> ${subject}</p>
    <p>Our team will review your request and respond as soon as possible.</p>
    <p><a href="${process.env.NEXT_PUBLIC_APP_URL || "https://signaltradingbots.com"}/portal/tickets/${ticket.id}">View Ticket</a></p>
  `;
  await sendTicketEmail({
    to: email,
    subject: `Support Ticket #${ticket.id} Created - ${subject}`,
    html: customerHtml,
  });

  return NextResponse.json(
    {
      success: true,
      ticket: {
        id: ticket.id,
        subject: ticket.subject,
        status: ticket.status,
        number: ticketNumber,
      },
      redirectUrl: `/portal/tickets/${ticket.id}`,
    },
    { status: 200 },
  );
}


