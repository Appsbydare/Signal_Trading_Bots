"use client";

import { useEffect, useRef, useState } from "react";

interface ChatMessage {
  id: number;
  sender_type: "customer" | "agent" | "admin" | "system";
  sender_agent_id: number | null;
  content: string;
  created_at: string;
}

interface ConversationPayload {
  id: number;
  status: string;
}

interface StartResponse {
  success: boolean;
  conversation: ConversationPayload;
  messages: ChatMessage[];
}

interface MessageResponse extends StartResponse {
  lastAgentMessage?: ChatMessage;
}

const STORAGE_KEY = "stb_chat_conversation_id";

export default function VirtualSupportChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [conversationId, setConversationId] = useState<number | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [initialising, setInitialising] = useState(false);
  const [ticketInfo, setTicketInfo] = useState<{ id: number; subject: string } | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    async function ensureConversation() {
      if (conversationId !== null) return;

      setInitialising(true);
      try {
        const storedId = window.localStorage.getItem(STORAGE_KEY);
        const body: { conversationId?: number } = {};
        if (storedId) {
          const asNumber = Number(storedId);
          if (!Number.isNaN(asNumber)) {
            body.conversationId = asNumber;
          }
        }

        const res = await fetch("/api/chat/start", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
        const data = (await res.json()) as StartResponse;
        if (!data.success) {
          return;
        }

        setConversationId(data.conversation.id);
        window.localStorage.setItem(
          STORAGE_KEY,
          String(data.conversation.id),
        );
        setMessages(data.messages ?? []);
      } finally {
        setInitialising(false);
      }
    }

    void ensureConversation();
  }, [isOpen, conversationId]);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen]);

  async function handleSend() {
    const text = input.trim();
    if (!text || !conversationId || loading) return;

    setLoading(true);
    setInput("");

    // Optimistic append of the customer message
    const optimisticMessage: ChatMessage = {
      id: Date.now(),
      sender_type: "customer",
      sender_agent_id: null,
      content: text,
      created_at: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, optimisticMessage]);

    try {
      const res = await fetch("/api/chat/message", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          conversationId,
          message: text,
        }),
      });
      const data = (await res.json()) as MessageResponse;
      if (!data.success) {
        return;
      }

      setMessages(data.messages ?? []);
    } finally {
      setLoading(false);
    }
  }

  async function handleEscalate() {
    if (!conversationId || loading) return;

    setLoading(true);
    try {
      const res = await fetch("/api/chat/escalate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ conversationId }),
      });
      const data = await res.json();
      if (data && data.success && data.ticket) {
        setTicketInfo({ id: data.ticket.id, subject: data.ticket.subject });

        const systemMessage: ChatMessage = {
          id: Date.now(),
          sender_type: "system",
          sender_agent_id: null,
          content: `We've created support ticket #${data.ticket.id} for this conversation. You will receive updates by email if one is on file.`,
          created_at: new Date().toISOString(),
        };
        setMessages((prev) => [...prev, systemMessage]);
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      {/* Toggle button */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="fixed bottom-4 right-4 z-40 rounded-full bg-[#5e17eb] px-5 py-3 text-sm font-semibold text-white shadow-lg transition hover:bg-[#4512c2]"
      >
        {isOpen ? "Close chat" : "Need help?"}
      </button>

      {/* Chat panel */}
      {isOpen && (
        <div className="fixed bottom-20 right-4 z-40 flex h-96 w-80 flex-col overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-xl">
          <div className="flex items-center justify-between border-b border-zinc-200 bg-zinc-900 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-white">
            <span>Support chat (virtual agents)</span>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="text-zinc-300 hover:text-white"
            >
              ✕
            </button>
          </div>

          <div className="flex-1 space-y-2 overflow-y-auto bg-zinc-50 px-3 py-2 text-xs text-zinc-800">
            {initialising && (
              <div className="rounded-md bg-white px-3 py-2 text-zinc-500">
                Starting conversation…
              </div>
            )}
            {!initialising &&
              messages.map((m) => (
                <div
                  key={m.id}
                  className={
                    m.sender_type === "customer"
                      ? "ml-auto max-w-[80%] rounded-lg bg-[#5e17eb] px-3 py-2 text-[0.7rem] text-white"
                      : "mr-auto max-w-[80%] rounded-lg bg-white px-3 py-2 text-[0.7rem] text-zinc-900"
                  }
                >
                  {m.content}
                </div>
              ))}
            <div ref={messagesEndRef} />
          </div>

          <div className="border-t border-zinc-200 bg-white px-3 py-2 space-y-1">
            {ticketInfo && (
              <div className="rounded-md bg-emerald-50 px-2 py-1 text-[0.7rem] text-emerald-700">
                Ticket #{ticketInfo.id} created – you can also track it from your customer portal.
              </div>
            )}
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    void handleSend();
                  }
                }}
                placeholder="Ask a question…"
                className="flex-1 rounded-md border border-zinc-300 px-2 py-1 text-xs focus:border-[#5e17eb] focus:outline-none focus:ring-1 focus:ring-[#5e17eb]"
                disabled={loading || initialising}
              />
              <button
                type="button"
                onClick={() => void handleSend()}
                disabled={loading || initialising || !input.trim()}
                className="rounded-md bg-[#5e17eb] px-3 py-1 text-xs font-semibold text-white transition disabled:opacity-50 hover:bg-[#4512c2]"
              >
                Send
              </button>
            </div>
            <button
              type="button"
              onClick={() => void handleEscalate()}
              disabled={loading || !conversationId}
              className="mt-1 text-[0.7rem] text-[#5e17eb] underline-offset-2 hover:underline disabled:text-zinc-400"
            >
              Escalate to a human support ticket
            </button>
          </div>
        </div>
      )}
    </>
  );
}


