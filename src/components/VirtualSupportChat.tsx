"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

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

// Format message with basic markdown-like formatting
function formatMessage(content: string): string {
  let formatted = content;

  // Convert markdown headers (### then ##)
  formatted = formatted.replace(/^###\s+(.+)$/gm, '<h3 class="font-bold text-base mt-3 mb-2">$1</h3>');
  formatted = formatted.replace(/^##\s+(.+)$/gm, '<h2 class="font-bold text-lg mt-4 mb-2">$1</h2>');

  // Convert inline code `text` to <code> (before bold to avoid conflicts)
  formatted = formatted.replace(/`([^`]+)`/g, '<code class="bg-zinc-800 px-1.5 py-0.5 rounded text-sm font-mono">$1</code>');

  // Convert domain-only URLs BEFORE bold conversion (e.g., signaltradingbots.com/portal)
  // This ensures URLs are converted to links even when inside bold text
  formatted = formatted.replace(/(?<![a-zA-Z0-9_@])((?:www\.)?[a-zA-Z0-9][a-zA-Z0-9-]*[a-zA-Z0-9]\.(?:com|net|org|io|dev|ai|app|co|uk|us|info|biz)(?:\/[^\s<"'>*]*)?)(?![a-zA-Z0-9])/g, (match) => {
    // Skip if it's part of an email address
    if (match.includes('@')) return match;
    return `<a href="https://${match}" target="_blank" rel="noopener noreferrer" class="text-blue-500 hover:text-blue-600 underline">${match}</a>`;
  });

  // Convert **bold** to <strong>
  formatted = formatted.replace(/\*\*(.+?)\*\*/g, '<strong class="font-semibold">$1</strong>');

  // Convert markdown links [text](url)
  formatted = formatted.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-blue-500 hover:text-blue-600 underline">$1</a>');

  // Convert plain URLs (must come after markdown links and domain-only URLs)
  // Skip URLs that are already inside anchor tags
  formatted = formatted.replace(/(?<!href="|">|>)(https?:\/\/[^\s<]+)(?!<\/a>)/g, (match, url, offset, string) => {
    // Check if we're already inside an anchor tag
    const before = string.substring(0, offset);
    const lastOpenTag = before.lastIndexOf('<a');
    const lastCloseTag = before.lastIndexOf('</a>');
    if (lastOpenTag > lastCloseTag) return match; // Already inside an anchor tag
    return `<a href="${url}" target="_blank" rel="noopener noreferrer" class="text-blue-500 hover:text-blue-600 underline">${url}</a>`;
  });

  // Convert numbered lists (1. 2. 3.) - must not be part of a header
  formatted = formatted.replace(/^(\d+)\.\s+(.+)$/gm, (match, num, text) => {
    // Skip if this looks like it was already processed as a header
    if (text.includes('<h')) return match;
    return `<div class="ml-2 mb-1.5"><span class="font-semibold">${num}.</span> ${text}</div>`;
  });

  // Convert bullet points (- or •)
  formatted = formatted.replace(/^[-•]\s+(.+)$/gm, '<div class="ml-2 mb-1.5 flex gap-2"><span class="text-zinc-400">•</span><span class="flex-1">$1</span></div>');

  // Convert double line breaks to spacing
  formatted = formatted.replace(/\n\n/g, '<div class="h-3"></div>');

  // Convert single line breaks to <br>
  formatted = formatted.replace(/\n/g, '<br />');

  return formatted;
}

// Define the welcome message
const WELCOME_MESSAGE: ChatMessage = {
  id: 0,
  sender_type: "agent",
  sender_agent_id: 1, // Mock ID for Alex
  content: "Hi! I'm Alex. 👋\n\nHow can I help you today? Ask me about our trading bots, signal automation, or setting up your account.",
  created_at: new Date().toISOString(),
};

interface SearchStep {
  id: string;
  text: string;
  status: 'pending' | 'running' | 'completed';
}

const KEYWORDS_MAP: Record<string, string[]> = {
  "setup": ["Installation Guide", "Configuration Steps"],
  "install": ["Installation Guide", "System Requirements"],
  "mt5": ["MetaTrader 5 Connector", "EA Settings"],
  "metatrader": ["MetaTrader 5 Connector", "EA Settings"],
  "telegram": ["Telegram API", "Channel Mapping"],
  "payment": ["Subscription Plans", "Payment Methods"],
  "signal": ["Signal Formatting", "Trade Execution"],
  "bot": ["Bot Architecture", "Performance Tuning"],
  "error": ["Troubleshooting", "Error Codes"],
  "account": ["User Profile", "Security Settings"],
};

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
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);
  const [searchSteps, setSearchSteps] = useState<SearchStep[]>([]);

  // Resize state with localStorage persistence
  const [chatWidth, setChatWidth] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('stb_chat_width');
      return saved ? parseInt(saved, 10) : 400;
    }
    return 400;
  });
  const [chatHeight, setChatHeight] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('stb_chat_height');
      return saved ? parseInt(saved, 10) : 550;
    }
    return 550;
  });
  const [isResizing, setIsResizing] = useState(false);
  const [resizeDirection, setResizeDirection] = useState<'left' | 'top' | 'corner' | null>(null);
  const [isDocked, setIsDocked] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('stb_chat_docked');
      return saved === 'true';
    }
    return false;
  });

  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const isCreatingNewChatRef = useRef(false);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const chatContainerRef = useRef<HTMLDivElement | null>(null);

  // Function to start a new conversation
  async function startNewChat() {
    // Set flag to prevent useEffect from interfering
    isCreatingNewChatRef.current = true;

    // Clear local storage first
    window.localStorage.removeItem(STORAGE_KEY);

    // Reset all state
    setTicketInfo(null);
    setShowEscalateForm(false);
    setIssueDescription("");
    setInput("");
    setMessages([]);
    setConversationId(null);
    setInitialising(true);

    try {
      // Create a brand new conversation (don't check localStorage)
      const res = await fetch("/api/chat/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}), // Empty body = force new conversation
      });
      const data = (await res.json()) as StartResponse;

      if (data.success) {
        setConversationId(data.conversation.id);
        window.localStorage.setItem(
          STORAGE_KEY,
          String(data.conversation.id),
        );

        const fetchedMessages = data.messages ?? [];
        if (fetchedMessages.length === 0) {
          setMessages([WELCOME_MESSAGE]);
        } else {
          setMessages(fetchedMessages);
        }
      }
    } catch (error) {
      console.error("Failed to start new conversation:", error);
    } finally {
      setInitialising(false);
      // Reset flag after a short delay to ensure state updates complete
      setTimeout(() => {
        isCreatingNewChatRef.current = false;
      }, 100);
    }
  }

  // Resize handlers
  const startResize = (direction: 'left' | 'top' | 'corner', e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);
    setResizeDirection(direction);
  };

  useEffect(() => {
    if (!isResizing) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (!chatContainerRef.current) return;

      const rect = chatContainerRef.current.getBoundingClientRect();

      if (resizeDirection === 'left' || resizeDirection === 'corner') {
        const newWidth = window.innerWidth - e.clientX - 24; // 24px for right margin
        setChatWidth(Math.max(320, Math.min(800, newWidth)));
      }

      if (resizeDirection === 'top' || resizeDirection === 'corner') {
        const newHeight = window.innerHeight - e.clientY - 24; // 24px for bottom margin
        setChatHeight(Math.max(400, Math.min(800, newHeight)));
      }
    };

    const handleMouseUp = () => {
      setIsResizing(false);
      setResizeDirection(null);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing, resizeDirection]);

  // Persist chat preferences to localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('stb_chat_width', chatWidth.toString());
      localStorage.setItem('stb_chat_height', chatHeight.toString());
      localStorage.setItem('stb_chat_docked', isDocked.toString());
    }
  }, [chatWidth, chatHeight, isDocked]);

  // Toggle dock mode
  const toggleDock = () => {
    setIsDocked(!isDocked);
    // Reset size when docking
    if (!isDocked) {
      setChatWidth(450);
      setChatHeight(window.innerHeight);
    } else {
      setChatWidth(400);
      setChatHeight(550);
    }
  };

  // Keyboard shortcuts: Ctrl+K to open, Esc to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl+K or Cmd+K to open chat
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen(true);
      }
      // Esc to close chat
      if (e.key === 'Escape' && isOpen) {
        e.preventDefault();
        setIsOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

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
      // Don't interfere if startNewChat() is running
      if (isCreatingNewChatRef.current) return;
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

        const fetchedMessages = data.messages ?? [];
        if (fetchedMessages.length === 0) {
          setMessages([WELCOME_MESSAGE]);
        } else {
          setMessages(fetchedMessages);
        }
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
  }, [messages, isOpen, searchSteps]);

  // Dynamic Search Simulation
  const simulateSearch = (query: string) => {
    // 1. Identify keywords
    const lowerQuery = query.toLowerCase();
    const foundKeywords = Object.keys(KEYWORDS_MAP).filter(k => lowerQuery.includes(k));

    // 2. Generate relevant steps
    const steps: SearchStep[] = [
      { id: 'init', text: "Analyzing request intent...", status: 'running' }
    ];

    if (foundKeywords.length > 0) {
      steps.push({
        id: 'keywords',
        text: `Identified topics: ${foundKeywords.map(k => k.charAt(0).toUpperCase() + k.slice(1)).join(", ")}`,
        status: 'pending'
      });

      const relevantDocs = new Set<string>();
      foundKeywords.forEach(k => KEYWORDS_MAP[k].forEach(doc => relevantDocs.add(doc)));
      const docsArr = Array.from(relevantDocs).slice(0, 2);

      if (docsArr.length > 0) {
        steps.push({
          id: 'search',
          text: `Searching KB for "${docsArr.join('", "')}"...`,
          status: 'pending'
        });
      }
    } else {
      steps.push({ id: 'search-gen', text: "Scanning knowledge base...", status: 'pending' });
    }

    steps.push({ id: 'synthesize', text: "Synthesizing response...", status: 'pending' });

    setSearchSteps(steps);

    // 3. Execute step progression
    let currentStepIndex = 0;

    const runNextStep = () => {
      setSearchSteps(prev => prev.map((step, idx) => {
        if (idx === currentStepIndex) return { ...step, status: 'completed' };
        if (idx === currentStepIndex + 1) return { ...step, status: 'running' };
        return step;
      }));

      currentStepIndex++;

      if (currentStepIndex < steps.length) {
        // Randomize delay between 600ms and 1000ms for realism
        const delay = 600 + Math.random() * 400;
        searchTimeoutRef.current = setTimeout(runNextStep, delay);
      }
    };

    searchTimeoutRef.current = setTimeout(runNextStep, 800);
  };

  async function handleSend() {
    const text = input.trim();
    if (!text || !conversationId || loading) return;

    // Clear previous search state
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    setSearchSteps([]);

    setLoading(true);
    setInput("");

    // Optimistic append
    const optimisticMessage: ChatMessage = {
      id: Date.now(),
      sender_type: "customer",
      sender_agent_id: null,
      content: text,
      created_at: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, optimisticMessage]);

    setIsTyping(true);

    // Start simulation (placeholder until we get response)
    // 1. Identify keywords
    const lowerQuery = text.toLowerCase();
    const foundKeywords = Object.keys(KEYWORDS_MAP).filter(k => lowerQuery.includes(k));

    // Initial steps
    const initialSteps: SearchStep[] = [
      { id: 'init', text: "Analyzing request intent...", status: 'running' }
    ];
    setSearchSteps(initialSteps);

    // Start a timer to advance the "Analyzing" step if response is slow
    const analysisTimer = setTimeout(() => {
      setSearchSteps([
        { id: 'init', text: "Analyzing request intent...", status: 'completed' },
        { id: 'scan', text: "Scanning knowledge base...", status: 'running' }
      ]);
    }, 1500);

    try {
      const res = await fetch("/api/chat/message", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          conversationId,
          message: text,
        }),
      });
      const data = (await res.json()) as MessageResponse & { aiMetadata?: any };

      clearTimeout(analysisTimer); // Stop the slow-response timer

      if (!data.success) {
        return;
      }

      // --- LOGIC FOR AI METADATA ANIMATION ---
      const metadata = data.aiMetadata;
      let systemMessageToAdd: ChatMessage | null = null;

      if (metadata && metadata.phase === 'faq-enhanced' && metadata.usedFaqCategories?.length > 0) {
        const categories = metadata.usedFaqCategories.join(", ");

        setSearchSteps([
          { id: 'init', text: "Analyzed request intent", status: 'completed' },
          { id: 'scan', text: "Scanned knowledge base", status: 'completed' },
          { id: 'read', text: `Read: ${categories}`, status: 'completed' },
          { id: 'synth', text: "Synthesizing response...", status: 'running' }
        ]);

        // Wait a moment so user sees the "Read" step
        await new Promise(resolve => setTimeout(resolve, 800));

        setSearchSteps(prev => prev.map(s => s.id === 'synth' ? { ...s, status: 'completed' } : s));

        // Create transient system message with clickable category links
        const categoryLinks = categories.split(', ').map((cat: string) => {
          // URL-encode the category name for the FAQ page filter
          const encodedCategory = encodeURIComponent(cat.trim());
          return `[${cat}](/faq?category=${encodedCategory})`;
        }).join(', ');

        systemMessageToAdd = {
          id: Date.now(), // Transient ID
          sender_type: "system",
          sender_agent_id: null,
          content: `🔍 Read documentation: ${categoryLinks}`,
          created_at: new Date().toISOString(),
        };

      } else if (metadata && metadata.phase === 'greeting') {
        setSearchSteps([]);
        setIsTyping(false);
      } else {
        setSearchSteps([
          { id: 'init', text: "Analyzed request", status: 'completed' },
          { id: 'synth', text: "Synthesizing response...", status: 'running' }
        ]);
        await new Promise(resolve => setTimeout(resolve, 600));
      }

      const newMessages = data.messages ?? [];

      // Preserve welcome message if it exists in the current view locally
      setMessages((prev) => {
        let mergedMessages = [...newMessages];

        // 1. Handle Welcome Message Persistence
        const hasWelcome = prev.length > 0 && prev[0].id === WELCOME_MESSAGE.id;
        if (hasWelcome && (mergedMessages.length === 0 || mergedMessages[0].id !== WELCOME_MESSAGE.id)) {
          mergedMessages = [WELCOME_MESSAGE, ...mergedMessages];
        }

        // 2. Inject Transient System Message (if applicable)
        // We want to insert it BEFORE the last agent message (which is the answer)
        if (systemMessageToAdd) {
          const lastAgentIndex = mergedMessages.findLastIndex(m => m.sender_type === 'agent');
          if (lastAgentIndex !== -1) {
            // Insert before the agent's reply
            mergedMessages.splice(lastAgentIndex, 0, systemMessageToAdd);
          } else {
            // Fallback: append if no agent message found (unlikely)
            mergedMessages.push(systemMessageToAdd);
          }
        }

        // 3. Current Search Steps Persistence (Optional: if we want previous "Read" messages to stay?)
        // The user said "keep the read... leuikt that". 
        // This logic adds it for the *current* turn. 
        // If the user sends another message, this transient message might be lost because we fetch fresh `data.messages`.
        // To truly persist it across reloads, we'd need to save it to DB or local storage. 
        // For now, this satisfies "after message comes". 

        return mergedMessages;
      });

      // Set unread badge if chat is closed
      if (!isOpen) {
        setHasUnread(true);
      }
    } finally {
      if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
      setSearchSteps([]); // Clear steps when done
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
      <AnimatePresence>
        {!isOpen && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{
              type: "spring",
              stiffness: 300,
              damping: 25,
              mass: 0.8,
            }}
            className="fixed bottom-6 right-6 z-50"
          >
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
          </motion.div>
        )}
      </AnimatePresence>

      {/* Chat panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            ref={chatContainerRef}
            initial={{
              scale: 0,
              opacity: 0,
            }}
            animate={{
              scale: 1,
              opacity: 1,
            }}
            exit={{
              scale: 0,
              opacity: 0,
            }}
            transition={{
              type: "spring",
              stiffness: 300,
              damping: 25,
              mass: 0.8,
            }}
            className={`fixed z-50 flex flex-col overflow-hidden border border-zinc-800 bg-zinc-950 shadow-2xl ${isDocked
                ? "top-0 right-0 bottom-0 rounded-l-2xl origin-right"
                : "bottom-6 right-6 rounded-2xl origin-bottom-right"
              }`}
            style={{
              width: `${chatWidth}px`,
              height: isDocked ? "100vh" : `${chatHeight}px`,
            }}
          >
            {/* Resize handles - hide when docked */}
            {!isDocked && (
              <>
                {/* Left edge resize handle */}
                <div
                  className="absolute left-0 top-0 bottom-0 w-1 cursor-ew-resize hover:bg-[#5e17eb]/50 transition-colors group"
                  onMouseDown={(e) => startResize("left", e)}
                >
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-12 bg-[#5e17eb]/30 group-hover:bg-[#5e17eb] transition-colors rounded-r" />
                </div>

                {/* Top edge resize handle */}
                <div
                  className="absolute top-0 left-0 right-0 h-1 cursor-ns-resize hover:bg-[#5e17eb]/50 transition-colors group"
                  onMouseDown={(e) => startResize("top", e)}
                >
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 h-1 w-12 bg-[#5e17eb]/30 group-hover:bg-[#5e17eb] transition-colors rounded-b" />
                </div>

                {/* Corner resize handle */}
                <div
                  className="absolute top-0 left-0 w-4 h-4 cursor-nwse-resize hover:bg-[#5e17eb]/50 transition-colors group"
                  onMouseDown={(e) => startResize("corner", e)}
                >
                  <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-[#5e17eb]/30 group-hover:border-[#5e17eb] transition-colors rounded-tl" />
                </div>
              </>
            )}

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
                  <p className="text-[10px] text-zinc-600 mt-0.5">
                    <kbd className="px-1 py-0.5 bg-zinc-800 rounded text-zinc-400">Ctrl+K</kbd> to open ·
                    <kbd className="px-1 py-0.5 bg-zinc-800 rounded text-zinc-400">Esc</kbd> to close
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {/* Dock/Undock button */}
                <button
                  type="button"
                  onClick={toggleDock}
                  className="rounded-lg p-1.5 text-zinc-400 transition-all duration-200 hover:bg-zinc-800 hover:text-white group"
                  aria-label={isDocked ? "Undock chat" : "Dock chat as side panel"}
                  title={isDocked ? "Float chat" : "Dock to side"}
                >
                  {isDocked ? (
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                    </svg>
                  ) : (
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
                    </svg>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => void startNewChat()}
                  className="rounded-lg p-1.5 text-zinc-400 transition-all duration-200 hover:bg-zinc-800 hover:text-white group"
                  aria-label="Start new chat"
                  title="Start new conversation"
                >
                  <svg className="h-5 w-5 transition-transform group-hover:rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                </button>
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
                    className={`flex gap-2 ${m.sender_type === "customer" ? "ml-auto flex-row-reverse" : "mr-auto"
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
                      className={`flex max-w-[85%] flex-col ${m.sender_type === "customer" ? "items-end" : "items-start"
                        }`}
                    >
                      <div
                        className={
                          m.sender_type === "customer"
                            ? "rounded-2xl rounded-tr-sm bg-gradient-to-br from-[#5e17eb] to-[#4512c2] px-4 py-3 text-sm leading-relaxed text-white shadow-lg"
                            : m.sender_type === "system"
                              ? "rounded-xl bg-blue-500/10 border border-blue-500/30 px-4 py-3 text-sm leading-relaxed text-blue-300"
                              : "rounded-2xl rounded-tl-sm bg-zinc-900 border border-zinc-800 px-4 py-3 text-sm leading-relaxed text-zinc-100 shadow-lg"
                        }
                      >
                        <div
                          className="whitespace-pre-wrap break-words"
                          dangerouslySetInnerHTML={{
                            __html: formatMessage(m.content),
                          }}
                        />
                      </div>
                      <span className="mt-1 px-2 text-xs text-zinc-600">
                        {new Date(m.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </span>
                    </div>
                  </div>
                ))}

              {/* Search/Thinking List Indicator */}
              {isTyping && searchSteps.length > 0 && (
                <div className="flex gap-2 animate-fadeIn max-w-[85%]">
                  <div className="flex-shrink-0">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-[#5e17eb] to-[#4512c2] shadow-lg">
                      <svg className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </div>
                  </div>
                  <div className="flex flex-col gap-1.5 rounded-2xl rounded-tl-sm bg-zinc-900 border border-zinc-800 px-4 py-3 shadow-lg w-full">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="relative flex h-2.5 w-2.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#5e17eb] opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#5e17eb]"></span>
                      </span>
                      <span className="text-xs font-bold text-zinc-300">Processing Query</span>
                    </div>

                    <div className="space-y-1.5 pl-1">
                      {searchSteps.map((step) => (
                        <div key={step.id} className="flex items-start gap-2 text-xs">
                          <div className="mt-0.5">
                            {step.status === "completed" ? (
                              <svg className="h-3 w-3 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                              </svg>
                            ) : step.status === "running" ? (
                              <svg className="h-3 w-3 text-[#5e17eb] animate-spin" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                            ) : (
                              <div className="h-3 w-3 rounded-full border border-zinc-700"></div>
                            )}
                          </div>
                          <span
                            className={`${step.status === "completed"
                                ? "text-zinc-500"
                                : step.status === "running"
                                  ? "text-zinc-200 font-medium"
                                  : "text-zinc-600"
                              } transition-colors duration-300`}
                          >
                            {step.text}
                          </span>
                        </div>
                      ))}
                    </div>
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
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}


