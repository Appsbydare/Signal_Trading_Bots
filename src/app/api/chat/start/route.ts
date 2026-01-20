import { NextRequest, NextResponse } from "next/server";

import { getCurrentCustomer } from "@/lib/auth-server";
import {
  ConversationRow,
  createConversation,
  getConversationById,
  getOpenConversationForCustomer,
  getOpenConversationForEmail,
  getRecentMessages,
} from "@/lib/chat-db";

function jsonError(status: number, message: string) {
  return NextResponse.json({ success: false, message }, { status });
}

export async function POST(request: NextRequest) {
  let body: { conversationId?: number; email?: string } = {};
  try {
    body = await request.json();
  } catch {
    // ignore, all fields optional
  }

  const customer = await getCurrentCustomer();
  const email = body.email?.trim() || null;
  let conversation: ConversationRow | null = null;

  // 1) If client passes an existing conversation id, try to load it.
  if (body.conversationId) {
    conversation = await getConversationById(body.conversationId);

    if (!conversation) {
      return jsonError(404, "Conversation not found");
    }

    // Basic ownership guard: if customer is logged in, ensure it matches.
    if (customer && conversation.customer_id && conversation.customer_id !== customer.id) {
      return jsonError(403, "Conversation does not belong to this customer");
    }
  } else {
    // 2) Try to reuse an open conversation for this customer or email.
    if (customer) {
      conversation = await getOpenConversationForCustomer(customer.id);
    } else if (email) {
      conversation = await getOpenConversationForEmail(email);
    }

    // 3) If none exists, create a new conversation.
    if (!conversation) {
      conversation = await createConversation({
        customerId: customer ? customer.id : null,
        visitorEmail: email,
      });
    }
  }

  const messages = await getRecentMessages(conversation.id, 50);

  return NextResponse.json(
    {
      success: true,
      conversation: {
        id: conversation.id,
        status: conversation.status,
      },
      messages,
    },
    { status: 200 },
  );
}


