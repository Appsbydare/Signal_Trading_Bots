import "server-only";

import { getSupabaseClient } from "./supabase-storage";

export interface TicketRow {
  id: number;
  conversation_id: number | null;
  customer_id: number | null;
  email: string | null;
  subject: string;
  description: string | null;
  status: string;
  priority: string | null;
  created_at: string;
  updated_at: string;
}

export interface TicketEventRow {
  id: number;
  ticket_id: number;
  actor_type: string;
  actor_id: number | null;
  note: string;
  created_at: string;
}

export interface TicketReplyRow {
  id: number;
  ticket_id: number;
  author_type: string;
  author_id: number | null;
  author_name: string | null;
  message: string;
  created_at: string;
}

export async function createTicket(params: {
  conversationId: number | null;
  customerId: number | null;
  email: string | null;
  subject: string;
  description?: string | null;
}): Promise<TicketRow> {
  const client = getSupabaseClient();
  const { data, error} = await client
    .from("tickets")
    .insert({
      conversation_id: params.conversationId,
      customer_id: params.customerId,
      email: params.email,
      subject: params.subject,
      description: params.description ?? null,
    })
    .select("*")
    .maybeSingle<TicketRow>();

  if (error) {
    throw error;
  }
  if (!data) {
    throw new Error("Failed to create ticket");
  }

  return data;
}

export async function addTicketEvent(params: {
  ticketId: number;
  actorType: string;
  actorId?: number | null;
  note: string;
}): Promise<TicketEventRow> {
  const client = getSupabaseClient();
  const { data, error } = await client
    .from("ticket_events")
    .insert({
      ticket_id: params.ticketId,
      actor_type: params.actorType,
      actor_id: params.actorId ?? null,
      note: params.note,
    })
    .select("*")
    .maybeSingle<TicketEventRow>();

  if (error) {
    throw error;
  }
  if (!data) {
    throw new Error("Failed to create ticket event");
  }

  return data;
}

export async function listTicketsForCustomer(
  customerId: number,
): Promise<TicketRow[]> {
  const client = getSupabaseClient();
  const { data, error } = await client
    .from("tickets")
    .select("*")
    .eq("customer_id", customerId)
    .order("created_at", { ascending: false })
    .returns<TicketRow[]>();

  if (error) {
    throw error;
  }

  return data ?? [];
}

export async function listTickets(status?: string): Promise<TicketRow[]> {
  const client = getSupabaseClient();
  let query = client.from("tickets").select("*").order("created_at", {
    ascending: false,
  });

  if (status) {
    query = query.eq("status", status);
  }

  const { data, error } = await query.returns<TicketRow[]>();

  if (error) {
    throw error;
  }

  return data ?? [];
}

export async function updateTicket(params: {
  id: number;
  status?: string;
}): Promise<TicketRow> {
  const client = getSupabaseClient();
  const update: Partial<TicketRow> = {};
  if (params.status) {
    update.status = params.status;
  }

  const { data, error } = await client
    .from("tickets")
    .update(update)
    .eq("id", params.id)
    .select("*")
    .maybeSingle<TicketRow>();

  if (error) {
    throw error;
  }
  if (!data) {
    throw new Error("Failed to update ticket");
  }

  return data;
}

export async function getTicketById(ticketId: number): Promise<TicketRow | null> {
  const client = getSupabaseClient();
  const { data, error } = await client
    .from("tickets")
    .select("*")
    .eq("id", ticketId)
    .maybeSingle<TicketRow>();

  if (error) {
    throw error;
  }

  return data;
}

export async function addTicketReply(params: {
  ticketId: number;
  authorType: string;
  authorId?: number | null;
  authorName?: string | null;
  message: string;
}): Promise<TicketReplyRow> {
  const client = getSupabaseClient();
  const { data, error } = await client
    .from("ticket_replies")
    .insert({
      ticket_id: params.ticketId,
      author_type: params.authorType,
      author_id: params.authorId ?? null,
      author_name: params.authorName ?? null,
      message: params.message,
    })
    .select("*")
    .maybeSingle<TicketReplyRow>();

  if (error) {
    throw error;
  }
  if (!data) {
    throw new Error("Failed to add ticket reply");
  }

  return data;
}

export async function listTicketReplies(ticketId: number): Promise<TicketReplyRow[]> {
  const client = getSupabaseClient();
  const { data, error } = await client
    .from("ticket_replies")
    .select("*")
    .eq("ticket_id", ticketId)
    .order("created_at", { ascending: true })
    .returns<TicketReplyRow[]>();

  if (error) {
    throw error;
  }

  return data ?? [];
}



