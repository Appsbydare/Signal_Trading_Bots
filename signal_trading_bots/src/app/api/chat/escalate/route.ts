import { NextRequest, NextResponse } from "next/server";

import { getCurrentCustomer } from "@/lib/auth-server";
import { getConversationById } from "@/lib/chat-db";
import { getCustomerById } from "@/lib/auth-users";
import { addTicketEvent, createTicket } from "@/lib/tickets-db";
import { sendTicketEmail } from "@/lib/email";

function jsonError(status: number, message: string) {
  return NextResponse.json({ success: false, message }, { status });
}

export async function POST(request: NextRequest) {
  let body: { conversationId?: number; subject?: string } = {};

  try {
    body = await request.json();
  } catch {
    return jsonError(400, "Invalid JSON body");
  }

  const conversationId = body.conversationId;
  const subject =
    (body.subject && body.subject.trim()) ||
    "Support request from virtual agent chat";

  if (!conversationId) {
    return jsonError(400, "conversationId is required");
  }

  const customer = await getCurrentCustomer();
  const conversation = await getConversationById(conversationId);

  if (!conversation) {
    return jsonError(404, "Conversation not found");
  }

  if (
    customer &&
    conversation.customer_id &&
    customer.id !== conversation.customer_id
  ) {
    return jsonError(403, "Conversation does not belong to this customer");
  }

  let email: string | null = conversation.visitor_email ?? null;

  if (!email && conversation.customer_id) {
    const c = await getCustomerById(conversation.customer_id);
    email = c?.email ?? null;
  }

  const ticket = await createTicket({
    conversationId: conversation.id,
    customerId: conversation.customer_id,
    email,
    subject,
  });

  await addTicketEvent({
    ticketId: ticket.id,
    actorType: "system",
    note: "Ticket created from virtual agent chat",
  });

  if (email) {
    const html = `<p>Your support ticket has been created.</p><p><strong>Ticket #${ticket.id}</strong></p><p>Subject: ${subject}</p>`;
    await sendTicketEmail({
      to: email,
      subject: `Your SignalTradingBots support ticket #${ticket.id}`,
      html,
    });
  }

  return NextResponse.json(
    {
      success: true,
      ticket: {
        id: ticket.id,
        subject: ticket.subject,
        status: ticket.status,
      },
    },
    { status: 200 },
  );
}


