import "server-only";

import { getSupabaseClient } from "./supabase-storage";

export type SenderType = "customer" | "agent" | "admin" | "system";

export interface AgentRow {
  id: number;
  name: string;
  avatar_url: string | null;
  description: string | null;
  prompt_style: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface FaqRow {
  id: number;
  question: string;
  answer: string;
  category: string | null;
  tags: string[] | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ConversationRow {
  id: number;
  customer_id: number | null;
  visitor_email: string | null;
  status: string;
  created_at: string;
  last_activity_at: string;
}

export interface MessageRow {
  id: number;
  conversation_id: number;
  sender_type: SenderType;
  sender_agent_id: number | null;
  content: string;
  is_from_llm: boolean;
  created_at: string;
}

export async function getActiveAgents(): Promise<AgentRow[]> {
  const client = getSupabaseClient();
  const { data, error } = await client
    .from("agents")
    .select("*")
    .eq("is_active", true)
    .order("id", { ascending: true })
    .returns<AgentRow[]>();

  if (error) {
    throw error;
  }

  return data ?? [];
}

export async function createConversation(params: {
  customerId: number | null;
  visitorEmail: string | null;
}): Promise<ConversationRow> {
  const client = getSupabaseClient();
  const { data, error } = await client
    .from("conversations")
    .insert({
      customer_id: params.customerId,
      visitor_email: params.visitorEmail,
    })
    .select("*")
    .maybeSingle<ConversationRow>();

  if (error) {
    throw error;
  }
  if (!data) {
    throw new Error("Failed to create conversation");
  }

  return data;
}

export async function getOpenConversationForCustomer(
  customerId: number,
): Promise<ConversationRow | null> {
  const client = getSupabaseClient();
  const { data, error } = await client
    .from("conversations")
    .select("*")
    .eq("customer_id", customerId)
    .eq("status", "open")
    .order("last_activity_at", { ascending: false })
    .limit(1)
    .maybeSingle<ConversationRow>();

  if (error) {
    throw error;
  }

  return data ?? null;
}

export async function getOpenConversationForEmail(
  email: string,
): Promise<ConversationRow | null> {
  const client = getSupabaseClient();
  const { data, error } = await client
    .from("conversations")
    .select("*")
    .eq("visitor_email", email)
    .eq("status", "open")
    .order("last_activity_at", { ascending: false })
    .limit(1)
    .maybeSingle<ConversationRow>();

  if (error) {
    throw error;
  }

  return data ?? null;
}

export async function getConversationById(
  id: number,
): Promise<ConversationRow | null> {
  const client = getSupabaseClient();
  const { data, error } = await client
    .from("conversations")
    .select("*")
    .eq("id", id)
    .maybeSingle<ConversationRow>();

  if (error) {
    throw error;
  }

  return data ?? null;
}

export async function appendMessage(params: {
  conversationId: number;
  senderType: SenderType;
  content: string;
  senderAgentId?: number | null;
  isFromLlm?: boolean;
}): Promise<MessageRow> {
  const client = getSupabaseClient();
  const { data, error } = await client
    .from("messages")
    .insert({
      conversation_id: params.conversationId,
      sender_type: params.senderType,
      sender_agent_id: params.senderAgentId ?? null,
      content: params.content,
      is_from_llm: params.isFromLlm ?? false,
    })
    .select("*")
    .maybeSingle<MessageRow>();

  if (error) {
    throw error;
  }
  if (!data) {
    throw new Error("Failed to insert message");
  }

  // Update last_activity_at for the conversation
  await client
    .from("conversations")
    .update({ last_activity_at: new Date().toISOString() })
    .eq("id", params.conversationId);

  return data;
}

export async function getRecentMessages(
  conversationId: number,
  limit = 50,
): Promise<MessageRow[]> {
  const client = getSupabaseClient();
  const { data, error } = await client
    .from("messages")
    .select("*")
    .eq("conversation_id", conversationId)
    .order("created_at", { ascending: true })
    .limit(limit)
    .returns<MessageRow[]>();

  if (error) {
    throw error;
  }

  return data ?? [];
}

export async function findBestFaqMatch(
  question: string,
): Promise<FaqRow | null> {
  const client = getSupabaseClient();

  // Very simple text search: look for question term in FAQ question first, then answer.
  const { data, error } = await client
    .from("faqs")
    .select("*")
    .eq("is_active", true)
    .ilike("question", `%${question}%`)
    .order("id", { ascending: true })
    .limit(1)
    .returns<FaqRow[]>();

  if (error) {
    throw error;
  }

  if (data && data.length > 0) {
    return data[0];
  }

  const { data: data2, error: error2 } = await client
    .from("faqs")
    .select("*")
    .eq("is_active", true)
    .ilike("answer", `%${question}%`)
    .order("id", { ascending: true })
    .limit(1)
    .returns<FaqRow[]>();

  if (error2) {
    throw error2;
  }

  if (data2 && data2.length > 0) {
    return data2[0];
  }

  return null;
}


