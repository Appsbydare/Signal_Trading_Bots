import { NextRequest, NextResponse } from "next/server";

import { getCurrentAdmin } from "@/lib/auth-server";
import { getTicketById, listTicketReplies } from "@/lib/tickets-db";
import { getSupabaseClient } from "@/lib/supabase-storage";

function jsonError(status: number, message: string) {
  return NextResponse.json({ success: false, message }, { status });
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await getCurrentAdmin();

  if (!admin) {
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

  try {
    const replies = await listTicketReplies(ticketId);

    return NextResponse.json({
      success: true,
      ticket,
      replies,
    });
  } catch (error: any) {
    console.error("Failed to load ticket replies:", error);
    return jsonError(500, "Failed to load ticket replies");
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await getCurrentAdmin();

  if (!admin) {
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

  const supabase = getSupabaseClient();

  // Delete ticket replies first (foreign key constraint)
  const { error: repliesError } = await supabase
    .from("ticket_replies")
    .delete()
    .eq("ticket_id", ticketId);

  if (repliesError) {
    console.error("Failed to delete ticket replies:", repliesError);
    return jsonError(500, "Failed to delete ticket replies");
  }

  // Delete ticket events
  const { error: eventsError } = await supabase
    .from("ticket_events")
    .delete()
    .eq("ticket_id", ticketId);

  if (eventsError) {
    console.error("Failed to delete ticket events:", eventsError);
    return jsonError(500, "Failed to delete ticket events");
  }

  // Delete the ticket
  const { error: ticketError } = await supabase
    .from("tickets")
    .delete()
    .eq("id", ticketId);

  if (ticketError) {
    console.error("Failed to delete ticket:", ticketError);
    return jsonError(500, "Failed to delete ticket");
  }

  return NextResponse.json({
    success: true,
    message: "Ticket deleted permanently",
  });
}

