"use client";

import { useEffect, useState } from "react";

interface Ticket {
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

interface Reply {
  id: number;
  author_type: string;
  author_name: string | null;
  message: string;
  created_at: string;
}

export default function TicketsAdminPage() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [replies, setReplies] = useState<Reply[]>([]);
  const [statusFilter, setStatusFilter] = useState<"all" | "pending" | "sorted">("pending");
  const [loading, setLoading] = useState(false);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [sending, setSending] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [replyMessage, setReplyMessage] = useState("");
  const [newStatus, setNewStatus] = useState<"pending" | "sorted">("pending");
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(
    null,
  );
  const [lastReplyCount, setLastReplyCount] = useState(0);

  const selected = tickets.find((t) => t.id === selectedId) ?? null;

  useEffect(() => {
    void loadTickets();
  }, [statusFilter]);

  useEffect(() => {
    if (selectedId) {
      // Reset reply count when switching tickets
      setLastReplyCount(0);
      setReplies([]);
      void loadTicketDetails();
    }
  }, [selectedId]);

  // Auto-refresh ticket details every 10 seconds (reduced frequency)
  useEffect(() => {
    if (!selectedId) return;

    const interval = setInterval(() => {
      void loadTicketDetails(false); // Don't show loading spinner on auto-refresh
    }, 10000); // Refresh every 10 seconds (was 5)

    return () => clearInterval(interval);
  }, [selectedId]);

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

  async function loadTicketDetails(showLoading = true) {
    if (!selectedId) return;
    if (showLoading) {
      setLoadingDetails(true);
    }
    
    // Clear previous errors when loading
    if (showLoading) {
      setMessage(null);
    }
    
    try {
      const res = await fetch(`/api/admin/tickets/${selectedId}`);
      
      // Check if response is ok
      if (!res.ok) {
        if (res.status === 404) {
          // Ticket was deleted, remove from list
          setTickets((prev) => prev.filter((t) => t.id !== selectedId));
          setSelectedId(null);
          setMessage({ type: "error", text: "Ticket not found (may have been deleted)" });
          return;
        }
        throw new Error(`HTTP ${res.status}`);
      }
      
      const data = await res.json();
      
      if (data.success) {
        const newReplies = data.replies || [];
        
        // Only update if reply count changed
        if (newReplies.length !== lastReplyCount) {
          setReplies(newReplies);
          setNewStatus(data.ticket?.status || "pending");
          setLastReplyCount(newReplies.length);
        }
      } else {
        // Only show error if it's a user-initiated load (not auto-refresh)
        if (showLoading) {
          setMessage({ type: "error", text: data.message || "Failed to load ticket details" });
        }
      }
    } catch (err: any) {
      // Only show error if it's a user-initiated load (not auto-refresh)
      if (showLoading) {
        console.error("Failed to load ticket details:", err);
        setMessage({ type: "error", text: "Failed to load ticket details. Please try again." });
      }
    } finally {
      if (showLoading) {
        setLoadingDetails(false);
      }
    }
  }

  async function handleSendReply() {
    if (!selected || !replyMessage.trim() || sending) return;
    setSending(true);
    setMessage(null);
    try {
      const res = await fetch(`/api/admin/tickets/${selected.id}/reply`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: replyMessage.trim(),
        }),
      });
      const data = await res.json();
      if (data.success) {
        setReplies([...replies, data.reply]);
        setReplyMessage("");
        setMessage({ type: "success", text: "Reply sent successfully" });
      } else {
        setMessage({ type: "error", text: data.message || "Failed to send reply" });
      }
    } catch {
      setMessage({ type: "error", text: "Failed to send reply" });
    } finally {
      setSending(false);
    }
  }

  async function handleUpdateStatus() {
    if (!selected) return;
    setSending(true);
    setMessage(null);
    try {
      const res = await fetch(`/api/admin/tickets/${selected.id}/status`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: newStatus,
        }),
      });
      const data = await res.json();
      if (data.success && data.ticket) {
        setTickets((prev) =>
          prev.map((t) => (t.id === data.ticket.id ? data.ticket : t)),
        );
        setMessage({ type: "success", text: "Status updated" });
      } else {
        setMessage({ type: "error", text: data.message || "Failed to update status" });
      }
    } catch {
      setMessage({ type: "error", text: "Failed to update status" });
    } finally {
      setSending(false);
    }
  }

  async function handleDeleteTicket() {
    if (!selected) return;
    
    if (!confirm(`⚠️ Are you sure you want to DELETE ticket #${selected.id}? This action CANNOT be undone and will permanently remove all ticket data and replies.`)) {
      return;
    }

    setDeleting(true);
    setMessage(null);
    try {
      const res = await fetch(`/api/admin/tickets/${selected.id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
      });
      const data = await res.json();
      if (data.success) {
        setTickets((prev) => prev.filter((t) => t.id !== selected.id));
        setSelectedId(tickets.length > 1 ? tickets[0].id : null);
        setMessage({ type: "success", text: "Ticket deleted permanently" });
      } else {
        setMessage({ type: "error", text: data.message || "Failed to delete ticket" });
      }
    } catch {
      setMessage({ type: "error", text: "Failed to delete ticket" });
    } finally {
      setDeleting(false);
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
          {selected ? (
            <div className="flex h-full flex-col space-y-4">
              {/* Ticket Header */}
              <div className="border-b border-zinc-800 pb-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <h2 className="text-lg font-semibold text-white">{selected.subject}</h2>
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          selected.status === "pending"
                            ? "bg-amber-500/20 text-amber-300"
                            : "bg-emerald-500/20 text-emerald-300"
                        }`}
                      >
                        {selected.status === "pending" ? "Pending" : "Resolved"}
                      </span>
                    </div>
                    {selected.description && (
                      <p className="mt-2 text-sm text-zinc-400">{selected.description}</p>
                    )}
                    <div className="mt-2 flex items-center gap-4 text-xs text-zinc-500">
                      <span>Ticket #{selected.id}</span>
                      <span>•</span>
                      <span>{selected.email || "No email"}</span>
                      <span>•</span>
                      <span>{new Date(selected.created_at).toLocaleString()}</span>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-2">
                      <select
                        value={newStatus}
                        onChange={(e) => setNewStatus(e.target.value as any)}
                        className="rounded-md border border-zinc-700 bg-zinc-800 px-3 py-1.5 text-sm text-white focus:border-[#5e17eb] focus:outline-none"
                      >
                        <option value="pending">Pending</option>
                        <option value="sorted">Resolved</option>
                      </select>
                      <button
                        onClick={handleUpdateStatus}
                        disabled={sending || newStatus === selected.status}
                        className="rounded-md bg-zinc-800 px-3 py-1.5 text-sm text-white hover:bg-zinc-700 disabled:opacity-50"
                      >
                        Update
                      </button>
                    </div>
                    <button
                      onClick={handleDeleteTicket}
                      disabled={deleting}
                      className="rounded-md border border-red-500/30 bg-red-500/10 px-3 py-1.5 text-sm text-red-300 hover:bg-red-500/20 disabled:opacity-50"
                    >
                      {deleting ? "Deleting..." : "Delete Ticket"}
                    </button>
                  </div>
                </div>
              </div>

              {/* Conversation */}
              <div className="flex-1 space-y-4 overflow-y-auto" style={{ maxHeight: "400px" }}>
                {loadingDetails ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="text-sm text-zinc-400">Loading conversation...</div>
                  </div>
                ) : replies.length === 0 ? (
                  <div className="rounded-lg bg-zinc-800/50 p-4 text-center text-sm text-zinc-400">
                    No replies yet. Be the first to respond!
                  </div>
                ) : (
                  replies.map((reply) => (
                    <div
                      key={reply.id}
                      className={`rounded-lg border p-4 ${
                        reply.author_type === "customer"
                          ? "border-blue-500/30 bg-blue-500/10"
                          : reply.author_type === "admin"
                          ? "border-purple-500/30 bg-purple-500/10"
                          : "border-zinc-800 bg-zinc-900/50"
                      }`}
                    >
                      <div className="flex items-center gap-2 text-sm">
                        <span className="font-medium text-white">
                          {reply.author_name ||
                            (reply.author_type === "customer"
                              ? "Customer"
                              : reply.author_type === "admin"
                              ? "Support Team"
                              : "System")}
                        </span>
                        <span className="text-zinc-500">•</span>
                        <span className="text-zinc-500">
                          {new Date(reply.created_at).toLocaleString()}
                        </span>
                      </div>
                      <p className="mt-2 whitespace-pre-wrap text-sm text-zinc-300">
                        {reply.message}
                      </p>
                    </div>
                  ))
                )}
              </div>

              {/* Reply Form */}
              {selected.status === "pending" && (
                <div className="border-t border-zinc-800 pt-4">
                  <label className="mb-2 block text-sm font-medium text-white">
                    Send Reply to Customer
                  </label>
                  <textarea
                    value={replyMessage}
                    onChange={(e) => setReplyMessage(e.target.value)}
                    placeholder="Type your message to the customer..."
                    className="min-h-[100px] w-full rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-3 text-sm text-white placeholder:text-zinc-500 focus:border-[#5e17eb] focus:outline-none focus:ring-2 focus:ring-[#5e17eb]/20"
                    disabled={sending}
                  />
                  <div className="mt-3 flex items-center justify-between">
                    <p className="text-xs text-zinc-500">
                      {selected.email
                        ? `Reply will be sent to ${selected.email}`
                        : "No email available for this ticket"}
                    </p>
                    <button
                      onClick={handleSendReply}
                      disabled={sending || !replyMessage.trim() || !selected.email}
                      className="rounded-lg bg-gradient-to-br from-[#5e17eb] to-[#4512c2] px-6 py-2 text-sm font-medium text-white transition-all hover:scale-105 disabled:opacity-50 disabled:hover:scale-100"
                    >
                      {sending ? "Sending..." : "Send Reply"}
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex h-full items-center justify-center">
              <p className="text-sm text-zinc-500">Select a ticket to view details and conversation</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}


