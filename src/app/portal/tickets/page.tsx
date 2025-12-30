import { redirect } from "next/navigation";

import { getCurrentCustomer } from "@/lib/auth-server";
import { listTicketsForCustomer } from "@/lib/tickets-db";
import Link from "next/link";

export default async function TicketsPage() {
  const customer = await getCurrentCustomer();

  if (!customer) {
    redirect("/auth/login?redirect=/portal/tickets");
  }

  const tickets = await listTicketsForCustomer(customer.id);

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
        <h1 className="text-2xl font-semibold tracking-tight text-white">Support Tickets</h1>
        <p className="mt-1 text-sm text-zinc-400">
          View and manage your support requests
        </p>
      </div>

      {tickets.length === 0 ? (
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-12 text-center">
          <svg className="mx-auto h-12 w-12 text-zinc-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
          </svg>
          <h3 className="mt-4 text-lg font-medium text-white">No support tickets</h3>
          <p className="mt-2 text-sm text-zinc-400">
            You haven't created any support tickets yet.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {tickets.map((ticket, index) => (
            <Link
              key={ticket.id}
              href={`/portal/tickets/${ticket.id}`}
              className="block rounded-xl border border-zinc-800 bg-zinc-900/50 p-4 transition-all hover:border-zinc-700 hover:bg-zinc-900"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium text-zinc-400">
                      Ticket #{tickets.length - index}
                    </span>
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        ticket.status === "pending"
                          ? "bg-amber-500/20 text-amber-300"
                          : ticket.status === "sorted"
                          ? "bg-emerald-500/20 text-emerald-300"
                          : "bg-zinc-700 text-zinc-300"
                      }`}
                    >
                      {ticket.status === "pending" ? "Pending" : ticket.status === "sorted" ? "Resolved" : ticket.status}
                    </span>
                  </div>
                  <h3 className="mt-2 font-medium text-white">{ticket.subject}</h3>
                  {ticket.description && (
                    <p className="mt-1 line-clamp-2 text-sm text-zinc-400">
                      {ticket.description}
                    </p>
                  )}
                  <p className="mt-2 text-xs text-zinc-500">
                    Created {new Date(ticket.created_at).toLocaleDateString()} at{" "}
                    {new Date(ticket.created_at).toLocaleTimeString()}
                  </p>
                </div>
                <svg className="h-5 w-5 flex-shrink-0 text-zinc-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

