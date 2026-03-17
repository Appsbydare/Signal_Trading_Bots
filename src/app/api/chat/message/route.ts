import { NextRequest, NextResponse } from "next/server";

import { getCurrentCustomer } from "@/lib/auth-server";
import { sanitizeForLlm, checkRateLimit, getClientIp } from "@/lib/rate-limit";
import {
  appendMessage,
  findBestFaqMatch,
  getActiveAgents,
  getConversationById,
  getRecentMessages,
} from "@/lib/chat-db";
import {
  processWithAI,
  isAiAgentEnabled,
  shouldFallbackToOldSystem,
  logAiInteraction,
} from "@/lib/ai-agent";

function jsonError(status: number, message: string) {
  return NextResponse.json({ success: false, message }, { status });
}

export async function POST(request: NextRequest) {
  let body: { conversationId?: number; message?: string } = {};

  try {
    body = await request.json();
  } catch {
    return jsonError(400, "Invalid JSON body");
  }

  const conversationId = body.conversationId;
  const text = sanitizeForLlm((body.message || "").trim());

  if (!conversationId || !text) {
    return jsonError(400, "conversationId and message are required");
  }

  // Rate limit: 20 messages per minute per IP, tighter 60/hour per authenticated customer
  const customer = await getCurrentCustomer();
  const rateLimitKey = customer
    ? `chat-msg:customer:${customer.id}`
    : `chat-msg:ip:${getClientIp(request)}`;
  const rateLimit = customer
    ? { limit: 60, windowSeconds: 3600 }
    : { limit: 20, windowSeconds: 60 };

  if (!checkRateLimit(rateLimitKey, rateLimit)) {
    return jsonError(429, "Too many messages. Please slow down.");
  }

  const conversation = await getConversationById(conversationId);

  if (!conversation) {
    return jsonError(404, "Conversation not found");
  }

  // Simple guard to avoid cross-account access.
  if (customer && conversation.customer_id && customer.id !== conversation.customer_id) {
    return jsonError(403, "Conversation does not belong to this customer");
  }

  // Store customer message
  await appendMessage({
    conversationId,
    senderType: "customer",
    content: text,
  });

  // Select an active agent
  const agents = await getActiveAgents();
  const agent =
    agents.length > 0 ? agents[Math.floor(Math.random() * agents.length)] : null;

  // ... inside POST
  let replyText: string;
  let isFromLlm = false;
  const aiEnabled = isAiAgentEnabled();
  let aiMetadata: any = undefined; // Placeholder for metadata

  // Try AI agent first if enabled
  if (aiEnabled) {
    try {
      const startTime = Date.now();

      // Get recent conversation history for context
      const recentMessages = await getRecentMessages(conversationId, 5);

      // Process with AI agent
      const aiResponse = await processWithAI({
        userMessage: text,
        conversationHistory: recentMessages,
        agentName: agent?.name,
      });

      if (aiResponse.success) {
        replyText = aiResponse.response;
        isFromLlm = true;

        // Capture metadata
        aiMetadata = {
          phase: aiResponse.phase,
          usedFaqCategories: aiResponse.usedFaqCategories,
          tokensUsed: aiResponse.tokensUsed,
          responseTime: Date.now() - startTime
        };

        // Log AI interaction for monitoring
        await logAiInteraction({
          conversationId,
          userMessage: text,
          agentResponse: aiResponse,
          responseTime: aiMetadata.responseTime,
        });
      } else {
        // AI failed, fall back to old system if enabled
        throw new Error(aiResponse.error || "AI agent failed");
      }
    } catch (error) {
      // ... existing catch logic
      console.error("AI agent error, falling back to old system:", error);

      // Fallback to old FAQ matching system
      if (shouldFallbackToOldSystem()) {
        const normalized = text.toLowerCase();
        const greetingPhrases = [
          "hi",
          "hello",
          "hey",
          "good morning",
          "good afternoon",
          "good evening",
        ];
        const isGreeting = greetingPhrases.some(
          (g) => normalized === g || normalized.startsWith(`${g} `),
        );

        if (isGreeting) {
          replyText =
            "Nice to meet you. How can I help with SignalTradingBots today? You can ask about installation, licensing, strategies, or troubleshooting.";
        } else {
          const faq = await findBestFaqMatch(text);
          if (faq) {
            replyText = faq.answer;
          } else {
            replyText =
              "Thanks for your question. I don't have an exact predefined answer for this yet, " +
              "but your feedback is important. Please provide as much detail as possible so our team can help.";
          }
        }
      } else {
        // No fallback, return error message
        replyText =
          "I'm having trouble processing your request right now. Please try again or contact our support team for immediate assistance.";
      }
    }
  } else {
    // ... existing else logic
    // AI disabled, use old system
    const normalized = text.toLowerCase();
    const greetingPhrases = [
      "hi",
      "hello",
      "hey",
      "good morning",
      "good afternoon",
      "good evening",
    ];
    const isGreeting = greetingPhrases.some(
      (g) => normalized === g || normalized.startsWith(`${g} `),
    );

    if (isGreeting) {
      replyText =
        "Nice to meet you. How can I help with SignalTradingBots today? You can ask about installation, licensing, strategies, or troubleshooting.";
    } else {
      const faq = await findBestFaqMatch(text);
      if (faq) {
        replyText = faq.answer;
      } else {
        replyText =
          "Thanks for your question. I don't have an exact predefined answer for this yet, " +
          "but your feedback is important. Please provide as much detail as possible so our team can help.";
      }
    }
  }

  // Don't add agent name prefix if AI already included it
  const decoratedReply =
    !isFromLlm && agent != null ? `Hi, I'm ${agent.name}. ${replyText}` : replyText;

  const agentMessage = await appendMessage({
    conversationId,
    senderType: "agent",
    senderAgentId: agent?.id ?? null,
    content: decoratedReply,
    isFromLlm,
  });

  const messages = await getRecentMessages(conversationId, 50);

  return NextResponse.json(
    {
      success: true,
      conversation: {
        id: conversation.id,
        status: conversation.status,
      },
      lastAgentMessage: agentMessage,
      messages,
      aiMetadata,
    },
    { status: 200 },
  );
}


