"use client";

import { useEffect, useState } from "react";

interface Ticket {
  id: number;
  conversation_id: number | null;
  customer_id: number | null;
  email: string | null;
  subject: string;
  status: string;
  priority: string | null;
  created_at: string;
  updated_at: string;
}

export default function TicketsAdminPage() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [statusFilter, setStatusFilter] = useState<"all" | "pending" | "sorted">("pending");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [note, setNote] = useState("");
  const [newStatus, setNewStatus] = useState<"pending" | "sorted">("sorted");
  const [notifyCustomer, setNotifyCustomer] = useState(true);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(
    null,
  );

  const selected = tickets.find((t) => t.id === selectedId) ?? null;

  useEffect(() => {
    void loadTickets();
  }, [statusFilter]);

  async function loadTickets() {
    setLoading(true);
    try {
      const url = new URL("/api/admin/tickets", window.location.origin);
      if (statusFilter !== "all") {
        url.searchParams.set("status", statusFilter);
      }
      const res = await fetch(url.toString());
      const data = await res.json();
      if (data.success) {
        setTickets(data.tickets ?? []);
        if (data.tickets?.length && !selectedId) {
          setSelectedId(data.tickets[0].id);
        }
      } else {
        setMessage({ type: "error", text: data.message || "Failed to load tickets" });
      }
    } catch {
      setMessage({ type: "error", text: "Failed to load tickets" });
    } finally {
      setLoading(false);
    }
  }

  async function handleUpdate() {
    if (!selected) return;
    setSaving(true);
    setMessage(null);
    try {
      const res = await fetch("/api/admin/tickets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: selected.id,
          status: newStatus,
          note: note || undefined,
          notifyCustomer,
          email: selected.email ?? undefined,
        }),
      });
      const data = await res.json();
      if (data.success && data.ticket) {
        setTickets((prev) =>
          prev.map((t) => (t.id === data.ticket.id ? data.ticket : t)),
        );
        setMessage({ type: "success", text: "Ticket updated" });
        setNote("");
      } else {
        setMessage({ type: "error", text: data.message || "Failed to update ticket" });
      }
    } catch {
      setMessage({ type: "error", text: "Failed to update ticket" });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-white">Support Tickets</h1>
            <p className="mt-1 text-sm text-zinc-400">
              View escalated conversations from the virtual agents and reply or mark them as sorted.
            </p>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <span className="text-zinc-400">Filter:</span>
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value as any);
                setSelectedId(null);
              }}
              className="rounded-md border border-zinc-700 bg-zinc-800 px-2 py-1 text-sm text-white focus:border-[#5e17eb] focus:outline-none focus:ring-1 focus:ring-[#5e17eb]"
            >
              <option value="pending">Pending</option>
              <option value="sorted">Sorted</option>
              <option value="all">All</option>
            </select>
          </div>
        </div>
      </div>

      {message && (
        <div
          className={`rounded-md p-3 text-sm ${
            message.type === "success"
              ? "bg-emerald-500/10 border border-emerald-500/30 text-emerald-300"
              : "bg-red-500/10 border border-red-500/30 text-red-300"
          }`}
        >
          {message.text}
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-[2fr,3fr]">
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-3 shadow-sm">
          <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-zinc-500">
            Tickets
          </div>
          <div className="max-h-[480px] overflow-y-auto text-xs">
            {loading && tickets.length === 0 && (
              <div className="rounded-md bg-zinc-800/50 p-3 text-zinc-400">Loading…</div>
            )}
            <table className="min-w-full divide-y divide-zinc-800">
              <thead className="bg-zinc-800/50">
                <tr>
                  <th className="px-2 py-1 text-left font-semibold text-zinc-500">#</th>
                  <th className="px-2 py-1 text-left font-semibold text-zinc-500">Subject</th>
                  <th className="px-2 py-1 text-left font-semibold text-zinc-500">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800">
                {tickets.map((t) => (
                  <tr
                    key={t.id}
                    className={
                      t.id === selectedId ? "bg-[#5e17eb]/20 cursor-pointer" : "cursor-pointer hover:bg-zinc-800/30"
                    }
                    onClick={() => setSelectedId(t.id)}
                  >
                    <td className="px-2 py-1 text-zinc-300">#{t.id}</td>
                    <td className="px-2 py-1 text-zinc-300">{t.subject}</td>
                    <td className="px-2 py-1 text-zinc-300 capitalize">{t.status}</td>
                  </tr>
                ))}
                {!loading && tickets.length === 0 && (
                  <tr>
                    <td colSpan={3} className="px-2 py-2 text-zinc-500">
                      No tickets in this view.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4 shadow-sm">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-white">Details & reply</h2>
            {selected && (
              <span className="text-xs text-zinc-400">
                Ticket #{selected.id} · {selected.email || "no email"}
              </span>
            )}
          </div>
          {selected ? (
            <div className="space-y-3 text-sm">
              <div>
                <div className="text-xs font-medium text-zinc-300">Subject</div>
                <div className="text-xs text-white">{selected.subject}</div>
              </div>
              <div className="grid gap-3 md:grid-cols-2">
                <div>
                  <label className="mb-1 block text-xs font-medium text-zinc-300">
                    New status
                  </label>
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value as any)}
                    className="w-full rounded-md border border-zinc-700 bg-zinc-800 px-2 py-1 text-xs text-white focus:border-[#5e17eb] focus:outline-none focus:ring-1 focus:ring-[#5e17eb]"
                  >
                    <option value="pending">Pending</option>
                    <option value="sorted">Sorted</option>
                  </select>
                </div>
                <div className="flex items-center gap-2 pt-5 text-xs text-zinc-300">
                  <input
                    type="checkbox"
                    checked={notifyCustomer}
                    onChange={(e) => setNotifyCustomer(e.target.checked)}
                  />
                  <span>Send reply by email (if email available)</span>
                </div>
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-zinc-300">
                  Reply / internal note
                </label>
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  className="min-h-[120px] w-full rounded-md border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-white placeholder:text-zinc-500 focus:border-[#5e17eb] focus:outline-none focus:ring-1 focus:ring-[#5e17eb]"
                  placeholder="Write a reply to the customer or an internal note about the investigation."
                />
              </div>
              <button
                type="button"
                onClick={() => void handleUpdate()}
                disabled={saving}
                className="rounded-md bg-[#5e17eb] px-4 py-2 text-sm font-medium text-white hover:bg-[#4512c2] disabled:opacity-50"
              >
                {saving ? "Updating…" : "Update ticket"}
              </button>
            </div>
          ) : (
            <p className="text-xs text-zinc-500">Select a ticket on the left to view details.</p>
          )}
        </div>
      </div>
    </div>
  );
}


