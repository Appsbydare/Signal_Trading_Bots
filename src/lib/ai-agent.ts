import { generateResponse } from "./gemini-client";
import {
  getAllCategories,
  getFaqsByCategories,
  formatFaqsForContext,
} from "./faq-loader";
import {
  buildSystemPromptPhase1,
  buildSystemPromptPhase2,
  buildGreetingResponse,
  buildFallbackResponse,
  extractCategories,
  formatConversationHistory,
  isGreeting,
} from "./ai-prompts";

export interface ChatMessage {
  id?: number;
  sender_type: "customer" | "agent" | "admin" | "system";
  content: string;
  created_at?: string;
}

export interface AgentContext {
  userMessage: string;
  conversationHistory?: ChatMessage[];
  agentName?: string;
}

export interface AgentResponse {
  response: string;
  usedFaqCategories: string[];
  tokensUsed?: {
    input: number;
    output: number;
  };
  phase: "greeting" | "direct" | "faq-enhanced";
  success: boolean;
  error?: string;
}

// Simple in-memory cache for categories (reduce API calls)
let categoriesCache: string[] | null = null;
let cacheTimestamp: number = 0;
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

async function getCachedCategories(): Promise<string[]> {
  const now = Date.now();
  if (categoriesCache && now - cacheTimestamp < CACHE_TTL) {
    return categoriesCache;
  }
  
  categoriesCache = await getAllCategories();
  cacheTimestamp = now;
  return categoriesCache;
}

/**
 * Main AI agent processor - handles two-pass system
 */
export async function processWithAI(context: AgentContext): Promise<AgentResponse> {
  const { userMessage, conversationHistory, agentName } = context;

  try {
    // Special handling for greetings
    if (isGreeting(userMessage)) {
      return {
        response: buildGreetingResponse(agentName),
        usedFaqCategories: [],
        phase: "greeting",
        success: true,
      };
    }

    // PHASE 1: Category Detection
    const categories = await getCachedCategories();
    const phase1Prompt = buildSystemPromptPhase1(categories).replace(
      "{userQuestion}",
      userMessage,
    );

    const phase1Result = await generateResponse(phase1Prompt, {
      temperature: 0.7,
      maxTokens: 512,
    });

    const phase1Response = phase1Result.text.trim();

    // Check if AI wants FAQ data
    const requestedCategories = extractCategories(phase1Response);

    // If no categories requested, return direct answer (Phase 1 complete)
    if (!requestedCategories) {
      return {
        response: phase1Response,
        usedFaqCategories: [],
        tokensUsed: phase1Result.tokensUsed,
        phase: "direct",
        success: true,
      };
    }

    // PHASE 2: Load FAQs and generate context-enhanced response
    const faqs = await getFaqsByCategories(requestedCategories);

    if (faqs.length === 0) {
      // No FAQs found, use Phase 1 response or fallback
      return {
        response:
          phase1Response.includes("NEED_FAQ_CATEGORIES")
            ? "I understand your question, but I don't have specific documentation for that topic yet. Could you provide more details, or would you like me to connect you with our support team?"
            : phase1Response,
        usedFaqCategories: requestedCategories,
        tokensUsed: phase1Result.tokensUsed,
        phase: "direct",
        success: true,
      };
    }

    const faqContext = formatFaqsForContext(faqs);
    const historyContext = conversationHistory
      ? formatConversationHistory(conversationHistory.slice(-5)) // Last 5 messages
      : undefined;

    const phase2Prompt = buildSystemPromptPhase2(
      userMessage,
      faqContext,
      historyContext,
    );

    const phase2Result = await generateResponse(phase2Prompt, {
      temperature: 0.7,
      maxTokens: 1024,
    });

    // Combine token usage from both phases
    const totalTokens = {
      input:
        (phase1Result.tokensUsed?.input || 0) + (phase2Result.tokensUsed?.input || 0),
      output:
        (phase1Result.tokensUsed?.output || 0) + (phase2Result.tokensUsed?.output || 0),
    };

    return {
      response: phase2Result.text.trim(),
      usedFaqCategories: requestedCategories,
      tokensUsed: totalTokens,
      phase: "faq-enhanced",
      success: true,
    };
  } catch (error) {
    console.error("Error in AI agent processing:", error);

    return {
      response: buildFallbackResponse(),
      usedFaqCategories: [],
      phase: "direct",
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Check if AI agent is enabled and configured
 */
export function isAiAgentEnabled(): boolean {
  // Check if feature flag is enabled (defaults to true)
  const featureEnabled = process.env.AI_AGENT_ENABLED !== "false";

  // Check if Gemini API key is configured
  const apiConfigured = !!process.env.GOOGLE_GEMINI_API_KEY;

  return featureEnabled && apiConfigured;
}

/**
 * Should fallback to old FAQ matching system?
 */
export function shouldFallbackToOldSystem(): boolean {
  return process.env.AI_AGENT_FALLBACK_TO_OLD === "true";
}

/**
 * Log AI interaction for monitoring and debugging
 */
export async function logAiInteraction(data: {
  conversationId: number;
  userMessage: string;
  agentResponse: AgentResponse;
  responseTime: number;
}): Promise<void> {
  try {
    // Log to console in development
    if (process.env.NODE_ENV === "development") {
      console.log("AI Interaction:", {
        conversationId: data.conversationId,
        phase: data.agentResponse.phase,
        categoriesUsed: data.agentResponse.usedFaqCategories,
        tokensUsed: data.agentResponse.tokensUsed,
        responseTime: `${data.responseTime}ms`,
        success: data.agentResponse.success,
      });
    }

    // TODO: Store in database for analytics
    // await supabase.from('ai_interaction_logs').insert({
    //   conversation_id: data.conversationId,
    //   user_message: data.userMessage,
    //   agent_response: data.agentResponse.response,
    //   categories_used: data.agentResponse.usedFaqCategories,
    //   tokens_used: data.agentResponse.tokensUsed,
    //   phase: data.agentResponse.phase,
    //   response_time: data.responseTime,
    //   success: data.agentResponse.success,
    //   error: data.agentResponse.error,
    // });
  } catch (error) {
    console.error("Error logging AI interaction:", error);
    // Don't throw - logging shouldn't break the main flow
  }
}
