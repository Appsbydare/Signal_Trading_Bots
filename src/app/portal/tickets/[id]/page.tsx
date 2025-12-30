"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

interface Ticket {
  id: number;
  subject: string;
  description: string | null;
  status: string;
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

export default function TicketDetailPage() {
  const params = useParams();
  const router = useRouter();
  const ticketId = params.id as string;

  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [replies, setReplies] = useState<Reply[]>([]);
  const [ticketNumber, setTicketNumber] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [replyMessage, setReplyMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [closing, setClosing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastReplyCount, setLastReplyCount] = useState(0);

  useEffect(() => {
    loadTicket();
  }, [ticketId]);

  // Auto-refresh ticket every 10 seconds (reduced frequency)
  useEffect(() => {
    const interval = setInterval(() => {
      // Only refresh if not currently sending a reply
      if (!sending && !closing) {
        loadTicket(false); // Don't show loading spinner on auto-refresh
      }
    }, 10000); // Refresh every 10 seconds (was 5)

    return () => clearInterval(interval);
  }, [ticketId, sending, closing]);

  async function loadTicket(showLoading = true) {
    if (showLoading) {
      setLoading(true);
    }
    setError(null);
    try {
      console.log('Loading ticket:', ticketId);
      const res = await fetch(`/api/portal/tickets/${ticketId}`);
      const data = await res.json();
      console.log('Ticket response:', data);

      if (!res.ok || !data.success) {
        const errorMsg = data.message || `Failed to load ticket (${res.status})`;
        console.error('Ticket load error:', errorMsg);
        setError(errorMsg);
        setLoading(false);
        return;
      }

      const newReplies = data.replies || [];

      // Only update if reply count changed
      if (newReplies.length !== lastReplyCount) {
        setTicket(data.ticket);
        setReplies(newReplies);
        setTicketNumber(data.ticketNumber || 0);
        setLastReplyCount(newReplies.length);
      } else if (!ticket) {
        // First load - always set the data
        setTicket(data.ticket);
        setReplies(newReplies);
        setTicketNumber(data.ticketNumber || 0);
        setLastReplyCount(newReplies.length);
      }
    } catch (err) {
      console.error('Ticket load exception:', err);
      setError("Failed to load ticket. Please try again.");
    } finally {
      if (showLoading) {
        setLoading(false);
      }
    }
  }

  async function handleSendReply() {
    if (!replyMessage.trim() || sending) return;

    setSending(true);
    setError(null);
    try {
      const res = await fetch(`/api/portal/tickets/${ticketId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: replyMessage.trim() }),
      });

      const data = await res.json();

      if (!data.success) {
        setError(data.message || "Failed to send reply");
        return;
      }

      setReplies([...replies, data.reply]);
      setReplyMessage("");
    } catch (err) {
      setError("Failed to send reply");
    } finally {
      setSending(false);
    }
  }

  async function handleCloseTicket() {
    if (closing) return;

    if (!confirm("Are you sure you want to close this ticket? This will mark it as resolved.")) {
      return;
    }

    setClosing(true);
    setError(null);
    try {
      const res = await fetch(`/api/portal/tickets/${ticketId}/close`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      const data = await res.json();

      if (!data.success) {
        setError(data.message || "Failed to close ticket");
        return;
      }

      // Reload the ticket to show updated status
      await loadTicket();
    } catch (err) {
      setError("Failed to close ticket");
    } finally {
      setClosing(false);
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-center">
          <svg className="mx-auto h-8 w-8 animate-spin text-[#5e17eb]" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="mt-2 text-sm text-zinc-400">Loading ticket...</p>
        </div>
      </div>
    );
  }

  if (error && !ticket) {
    return (
      <div className="space-y-6">
        <Link
          href="/portal/tickets"
          className="inline-flex items-center gap-2 text-sm text-zinc-400 transition hover:text-white"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Tickets
        </Link>
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-6 text-center">
          <p className="text-red-300">{error}</p>
        </div>
      </div>
    );
  }

  if (!ticket) return null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Link
          href="/portal/tickets"
          className="inline-flex items-center gap-2 text-sm text-zinc-400 transition hover:text-white"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Tickets
        </Link>
      </div>

      {/* Ticket Info */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-zinc-400">
                Ticket #{ticketNumber || '...'}
              </span>
              <span
                className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${ticket.status === "pending"
                    ? "bg-amber-500/20 text-amber-300"
                    : ticket.status === "sorted"
                      ? "bg-emerald-500/20 text-emerald-300"
                      : "bg-zinc-700 text-zinc-300"
                  }`}
              >
                {ticket.status === "pending" ? "Pending" : ticket.status === "sorted" ? "Resolved" : ticket.status}
              </span>
            </div>
            <h1 className="mt-2 text-2xl font-semibold text-white">{ticket.subject}</h1>
            {ticket.description && (
              <p className="mt-3 whitespace-pre-wrap text-zinc-300">{ticket.description}</p>
            )}
            <p className="mt-4 text-xs text-zinc-500">
              Created {new Date(ticket.created_at).toLocaleDateString()} at{" "}
              {new Date(ticket.created_at).toLocaleTimeString()}
            </p>
          </div>
        </div>
      </div>

      {/* Replies */}
      {replies.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-white">Conversation</h2>
          {replies.map((reply) => (
            <div
              key={reply.id}
              className={`rounded-xl border p-4 ${reply.author_type === "customer"
                  ? "border-blue-500/30 bg-blue-500/10"
                  : "border-zinc-800 bg-zinc-900/50"
                }`}
            >
              <div className="flex items-center gap-2 text-sm">
                <span className="font-medium text-white">
                  {reply.author_name || (reply.author_type === "customer" ? "You" : "Support Team")}
                </span>
                <span className="text-zinc-500">•</span>
                <span className="text-zinc-500">
                  {new Date(reply.created_at).toLocaleDateString()} at{" "}
                  {new Date(reply.created_at).toLocaleTimeString()}
                </span>
              </div>
              <p className="mt-2 whitespace-pre-wrap text-zinc-300">{reply.message}</p>
            </div>
          ))}
        </div>
      )}

      {/* Reply Form */}
      {ticket.status === "pending" && (
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
          <h2 className="text-lg font-semibold text-white">Add Reply</h2>
          <p className="mt-1 text-sm text-zinc-400">
            Send a message to our support team
          </p>
          {error && (
            <div className="mt-4 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300">
              {error}
            </div>
          )}
          <textarea
            value={replyMessage}
            onChange={(e) => setReplyMessage(e.target.value)}
            placeholder="Type your message..."
            className="mt-4 min-h-[120px] w-full rounded-xl border border-zinc-700 bg-zinc-800 px-4 py-3 text-white placeholder:text-zinc-500 focus:border-[#5e17eb] focus:outline-none focus:ring-2 focus:ring-[#5e17eb]/20"
            disabled={sending}
          />
          <div className="mt-4 flex items-center gap-3">
            <button
              onClick={handleSendReply}
              disabled={sending || !replyMessage.trim()}
              className="rounded-xl bg-gradient-to-br from-[#5e17eb] to-[#4512c2] px-6 py-2.5 text-sm font-medium text-white transition-all hover:scale-105 disabled:opacity-50 disabled:hover:scale-100"
            >
              {sending ? "Sending..." : "Send Reply"}
            </button>
            <button
              onClick={handleCloseTicket}
              disabled={closing}
              className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-6 py-2.5 text-sm font-medium text-emerald-300 transition-all hover:bg-emerald-500/20 disabled:opacity-50"
            >
              {closing ? "Closing..." : "Close Ticket"}
            </button>
          </div>
        </div>
      )}

      {ticket.status === "sorted" && (
        <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-center">
          <p className="text-sm text-emerald-300">
            ✓ This ticket has been resolved. If you need further assistance, please create a new ticket.
          </p>
        </div>
      )}
    </div>
  );
}

