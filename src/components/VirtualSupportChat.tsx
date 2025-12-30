"use client";

import { useEffect, useRef, useState } from "react";

// Add custom animations
const styles = `
  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @keyframes slideIn {
    from {
      opacity: 0;
      transform: scale(0.95);
    }
    to {
      opacity: 1;
      transform: scale(1);
    }
  }

  .animate-fadeIn {
    animation: fadeIn 0.3s ease-out forwards;
  }

  .animate-slideIn {
    animation: slideIn 0.2s ease-out forwards;
  }
`;

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
  const [isTyping, setIsTyping] = useState(false);
  const [hasUnread, setHasUnread] = useState(false);
  const [ticketInfo, setTicketInfo] = useState<{ id: number; subject: string } | null>(null);
  const [showEscalateForm, setShowEscalateForm] = useState(false);
  const [issueDescription, setIssueDescription] = useState("");
  const [guestEmail, setGuestEmail] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    // Clear unread badge when opening chat
    setHasUnread(false);

    // Check if user is logged in
    async function checkAuth() {
      try {
        const res = await fetch("/api/auth/customer/me");
        setIsLoggedIn(res.ok);
      } catch {
        setIsLoggedIn(false);
      }
    }

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

    void checkAuth();
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

    // Show typing indicator
    setIsTyping(true);

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

      // Small delay to show typing indicator
      await new Promise(resolve => setTimeout(resolve, 500));
      setMessages(data.messages ?? []);
      
      // Set unread badge if chat is closed
      if (!isOpen) {
        setHasUnread(true);
      }
    } finally {
      setIsTyping(false);
      setLoading(false);
    }
  }

  async function handleEscalate() {
    if (!conversationId || loading) return;

    // If not logged in, show the login prompt form
    if (isLoggedIn === false) {
      setShowEscalateForm(true);
      return;
    }

    if (!issueDescription.trim()) {
      setShowEscalateForm(true);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/chat/escalate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          conversationId,
          description: issueDescription.trim(),
        }),
      });
      const data = await res.json();
      
      if (!data.success) {
        const systemMessage: ChatMessage = {
          id: Date.now(),
          sender_type: "system",
          sender_agent_id: null,
          content: `❌ ${data.message || "Failed to create ticket"}`,
          created_at: new Date().toISOString(),
        };
        setMessages((prev) => [...prev, systemMessage]);
        setShowEscalateForm(false);
        return;
      }
      
      if (data && data.ticket) {
        setTicketInfo({ id: data.ticket.id, subject: data.ticket.subject });
        setShowEscalateForm(false);
        setIssueDescription("");

        const ticketNum = data.ticket.number || data.ticket.id;
        const systemMessage: ChatMessage = {
          id: Date.now(),
          sender_type: "system",
          sender_agent_id: null,
          content: `✓ Support ticket #${ticketNum} created successfully! You can view and track it in your Customer Portal.`,
          created_at: new Date().toISOString(),
        };
        setMessages((prev) => [...prev, systemMessage]);

        // Redirect to portal
        if (data.redirectUrl) {
          setTimeout(() => {
            window.location.href = data.redirectUrl;
          }, 2000);
        }
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <style>{styles}</style>
      {/* Toggle button - only show when chat is closed */}
       {!isOpen && (
         <div className="fixed bottom-6 right-6 z-50">
           <button
             type="button"
             onClick={() => setIsOpen(true)}
             className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-[#5e17eb] to-[#4512c2] text-white shadow-2xl transition-all duration-300 hover:scale-110 hover:shadow-[#5e17eb]/50 active:scale-95"
             aria-label="Open support chat"
           >
             <svg className="h-6 w-6 transition-transform duration-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
             </svg>
           </button>
           {/* Notification badge - only show when there are unread messages */}
           {hasUnread && (
             <div className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white shadow-lg">
               <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75"></span>
               <span className="relative">!</span>
             </div>
           )}
         </div>
       )}

      {/* Chat panel */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 z-50 flex h-[550px] w-[400px] flex-col overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-950 shadow-2xl animate-slideIn">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-zinc-800 bg-gradient-to-r from-zinc-900 to-zinc-900/80 px-5 py-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-[#5e17eb] to-[#4512c2]">
                <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-white">Support Chat</h3>
                <p className="text-xs text-zinc-400">Virtual Agents</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="rounded-lg p-1.5 text-zinc-400 transition-all duration-200 hover:bg-zinc-800 hover:text-white hover:rotate-90"
              aria-label="Close chat"
            >
              <svg className="h-5 w-5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Messages area */}
          <div className="flex-1 space-y-4 overflow-y-auto bg-zinc-950 px-4 py-4">
            {initialising && (
              <div className="flex items-center gap-2 rounded-xl bg-zinc-900/50 px-4 py-3 text-sm text-zinc-400">
                <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Starting conversation…
              </div>
            )}
            {!initialising &&
              messages.map((m, index) => (
                <div
                  key={m.id}
                  className={`flex gap-2 ${
                    m.sender_type === "customer" ? "ml-auto flex-row-reverse" : "mr-auto"
                  } animate-fadeIn`}
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  {/* Profile Icon */}
                  <div className="flex-shrink-0">
                    {m.sender_type === "customer" ? (
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg">
                        <svg className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      </div>
                    ) : m.sender_type === "system" ? (
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-500/20 border border-blue-500/30">
                        <svg className="h-4 w-4 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                    ) : (
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-[#5e17eb] to-[#4512c2] shadow-lg">
                        <svg className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                      </div>
                    )}
                  </div>

                  {/* Message Content */}
                  <div
                    className={`flex max-w-[75%] flex-col ${
                      m.sender_type === "customer" ? "items-end" : "items-start"
                    }`}
                  >
                    <div
                      className={
                        m.sender_type === "customer"
                          ? "rounded-2xl rounded-tr-sm bg-gradient-to-br from-[#5e17eb] to-[#4512c2] px-4 py-2.5 text-sm text-white shadow-lg"
                          : m.sender_type === "system"
                          ? "rounded-xl bg-blue-500/10 border border-blue-500/30 px-4 py-2.5 text-sm text-blue-300"
                          : "rounded-2xl rounded-tl-sm bg-zinc-900 border border-zinc-800 px-4 py-2.5 text-sm text-zinc-100 shadow-lg"
                      }
                    >
                      {m.content}
                    </div>
                    <span className="mt-1 px-2 text-xs text-zinc-600">
                      {new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              ))}
            
            {/* Typing Indicator */}
            {isTyping && (
              <div className="flex gap-2 animate-fadeIn">
                <div className="flex-shrink-0">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-[#5e17eb] to-[#4512c2] shadow-lg">
                    <svg className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                </div>
                <div className="flex items-center gap-1 rounded-2xl rounded-tl-sm bg-zinc-900 border border-zinc-800 px-4 py-3 shadow-lg">
                  <span className="h-2 w-2 animate-bounce rounded-full bg-zinc-500" style={{ animationDelay: '0ms' }}></span>
                  <span className="h-2 w-2 animate-bounce rounded-full bg-zinc-500" style={{ animationDelay: '150ms' }}></span>
                  <span className="h-2 w-2 animate-bounce rounded-full bg-zinc-500" style={{ animationDelay: '300ms' }}></span>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Input area */}
          <div className="border-t border-zinc-800 bg-zinc-900/50 px-4 py-4">
            {ticketInfo && (
              <div className="mb-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30 px-3 py-2 text-xs text-emerald-300">
                ✓ Ticket #{ticketInfo.id} created – track it in your customer portal
              </div>
            )}
            
            {/* Escalate Form */}
            {showEscalateForm && !ticketInfo ? (
              <div className="space-y-3 animate-fadeIn">
                {isLoggedIn === false ? (
                  <>
                    <div className="rounded-lg bg-blue-500/10 border border-blue-500/30 px-4 py-3 text-sm">
                      <div className="flex items-start gap-3">
                        <svg className="h-5 w-5 flex-shrink-0 text-blue-400 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <div>
                          <p className="font-medium text-blue-300">Login Required for Support Tickets</p>
                          <p className="mt-1 text-xs text-blue-200/80">
                            To create a support ticket and track your request, please log in to your account. 
                            This allows you to view ticket status, receive updates, and reply to our support team.
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <a
                        href="/auth/login?redirect=/portal/tickets"
                        className="flex-1 rounded-xl bg-gradient-to-br from-[#5e17eb] to-[#4512c2] px-4 py-2.5 text-center text-sm font-medium text-white transition-all hover:scale-105"
                      >
                        Log In to Continue
                      </a>
                      <button
                        type="button"
                        onClick={() => {
                          setShowEscalateForm(false);
                          setIssueDescription("");
                        }}
                        className="rounded-xl border border-zinc-700 bg-zinc-800/50 px-4 py-2.5 text-sm text-white transition-all hover:bg-zinc-700"
                      >
                        Cancel
                      </button>
                    </div>
                    <p className="text-center text-xs text-zinc-500">
                      Don't have an account?{" "}
                      <a href="/auth/signup" className="text-[#5e17eb] hover:underline">
                        Sign up here
                      </a>
                    </p>
                  </>
                ) : (
                  <>
                    <div className="rounded-lg bg-amber-500/10 border border-amber-500/30 px-3 py-2 text-xs text-amber-300">
                      <strong>Create Support Ticket</strong>
                      <p className="mt-1">
                        Please describe your issue in detail so our team can assist you better.
                      </p>
                    </div>
                    
                    <textarea
                      value={issueDescription}
                      onChange={(e) => setIssueDescription(e.target.value)}
                      placeholder="Describe your issue in detail..."
                      className="w-full min-h-[100px] rounded-xl border border-zinc-700 bg-zinc-800 px-4 py-2.5 text-sm text-white placeholder:text-zinc-500 focus:border-[#5e17eb] focus:outline-none focus:ring-2 focus:ring-[#5e17eb]/20"
                      disabled={loading}
                    />
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => void handleEscalate()}
                        disabled={loading || !issueDescription.trim()}
                        className="flex-1 rounded-xl bg-gradient-to-br from-[#5e17eb] to-[#4512c2] px-4 py-2.5 text-sm font-medium text-white transition-all hover:scale-105 disabled:opacity-50 disabled:hover:scale-100"
                      >
                        {loading ? "Creating..." : "Create Ticket"}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setShowEscalateForm(false);
                          setIssueDescription("");
                        }}
                        disabled={loading}
                        className="rounded-xl border border-zinc-700 bg-zinc-800/50 px-4 py-2.5 text-sm text-white transition-all hover:bg-zinc-700 disabled:opacity-50"
                      >
                        Cancel
                      </button>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <>
                <div className="flex items-end gap-2">
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        void handleSend();
                      }
                    }}
                    placeholder="Type your message..."
                    className="flex-1 rounded-xl border border-zinc-700 bg-zinc-800 px-4 py-2.5 text-sm text-white placeholder:text-zinc-500 focus:border-[#5e17eb] focus:outline-none focus:ring-2 focus:ring-[#5e17eb]/20"
                    disabled={loading || initialising}
                  />
                  <button
                    type="button"
                    onClick={() => void handleSend()}
                    disabled={loading || initialising || !input.trim()}
                    className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#5e17eb] to-[#4512c2] text-white transition-all duration-200 hover:scale-110 hover:shadow-lg hover:shadow-[#5e17eb]/50 active:scale-95 disabled:opacity-50 disabled:hover:scale-100 disabled:hover:shadow-none"
                    aria-label="Send message"
                  >
                    {loading ? (
                      <svg className="h-5 w-5 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    ) : (
                      <svg className="h-5 w-5 transition-transform group-hover:translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                      </svg>
                    )}
                  </button>
                </div>
                {!ticketInfo && (
                  <button
                    type="button"
                    onClick={() => void handleEscalate()}
                    disabled={loading || !conversationId}
                    className="mt-3 flex items-center gap-1.5 text-xs text-zinc-400 transition-all duration-200 hover:gap-2 hover:text-[#5e17eb] disabled:text-zinc-600"
                  >
                    <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    Escalate to a human support ticket
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}


