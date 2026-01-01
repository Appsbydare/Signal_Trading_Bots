/**
 * Type definitions for AI Agent system
 */

export interface FAQ {
  id: number;
  question: string;
  answer: string;
  category: string | null;
  tags: string[] | null;
  is_active: boolean;
}

export interface ChatMessage {
  id: number;
  conversation_id?: number;
  sender_type: "customer" | "agent" | "admin" | "system";
  sender_agent_id?: number | null;
  content: string;
  is_from_llm?: boolean;
  created_at: string;
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

export interface GeminiGenerationConfig {
  model?: string;
  maxTokens?: number;
  temperature?: number;
}

export interface GeminiResponse {
  text: string;
  tokensUsed?: {
    input: number;
    output: number;
  };
}

export interface AiInteractionLog {
  conversationId: number;
  userMessage: string;
  agentResponse: AgentResponse;
  responseTime: number;
}
