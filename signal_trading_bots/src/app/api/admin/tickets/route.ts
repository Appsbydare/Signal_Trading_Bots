import { NextRequest, NextResponse } from "next/server";

import { addTicketEvent, listTickets, updateTicket } from "@/lib/tickets-db";
import { sendTicketEmail } from "@/lib/email";

function jsonError(status: number, message: string) {
  return NextResponse.json({ success: false, message }, { status });
}

export async function GET(request: NextRequest) {
  const status = request.nextUrl.searchParams.get("status") || undefined;

  try {
    const tickets = await listTickets(status ?? undefined);
    return NextResponse.json({ success: true, tickets });
  } catch (error) {
    console.error("Failed to load tickets", error);
    return jsonError(500, "Failed to load tickets");
  }
}

export async function POST(request: NextRequest) {
  let body: {
    id?: number;
    status?: string;
    note?: string;
    notifyCustomer?: boolean;
    email?: string;
  } = {};

  try {
    body = await request.json();
  } catch {
    return jsonError(400, "Invalid JSON body");
  }

  if (!body.id) {
    return jsonError(400, "id is required");
  }

  try {
    const updated = await updateTicket({
      id: body.id,
      status: body.status,
    });

    if (body.note) {
      await addTicketEvent({
        ticketId: updated.id,
        actorType: "admin",
        note: body.note,
      });

      if (body.notifyCustomer && (body.email || updated.email)) {
        const to = body.email || updated.email!;
        const html = `<p>There is an update on your support ticket <strong>#${updated.id}</strong>.</p><p>${body.note}</p>`;
        await sendTicketEmail({
          to,
          subject: `Update on your SignalTradingBots ticket #${updated.id}`,
          html,
        });
      }
    }

    return NextResponse.json({ success: true, ticket: updated });
  } catch (error) {
    console.error("Failed to update ticket", error);
    return jsonError(500, "Failed to update ticket");
  }
}


