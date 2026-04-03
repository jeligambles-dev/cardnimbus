"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { SupportSenderType } from "@prisma/client";
import { ChatBubble } from "./chat-bubble";

// ─── Types ────────────────────────────────────────────────────────────────────

interface SupportMessage {
  id: string;
  content: string;
  senderType: SupportSenderType;
  createdAt: string;
}

interface Conversation {
  id: string;
  userId: string | null;
  visitorId: string | null;
}

// ─── Quick-reply options ──────────────────────────────────────────────────────

const QUICK_REPLIES = [
  { label: "Where's my order?", sourceType: "order_tracking" },
  { label: "Raffle help", sourceType: "raffle" },
  { label: "Sell cards", sourceType: "sell_cards" },
  { label: "Return / Refund", sourceType: "return_refund" },
] as const;

// ─── Visitor ID ───────────────────────────────────────────────────────────────

function getOrCreateVisitorId(): string {
  const key = "cn_visitor_id";
  let id = typeof window !== "undefined" ? localStorage.getItem(key) : null;
  if (!id) {
    id = `v_${Math.random().toString(36).slice(2)}_${Date.now()}`;
    if (typeof window !== "undefined") localStorage.setItem(key, id);
  }
  return id;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [minimized, setMinimized] = useState(false);
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<SupportMessage[]>([]);
  const [input, setInput] = useState("");
  const [email, setEmail] = useState("");
  const [sending, setSending] = useState(false);
  const [unread, setUnread] = useState(0);
  const [offlineMode, setOfflineMode] = useState(false);
  const [leaveMessageSent, setLeaveMessageSent] = useState(false);
  const [visitorId] = useState(() =>
    typeof window !== "undefined" ? getOrCreateVisitorId() : ""
  );

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (open) scrollToBottom();
  }, [messages, open]);

  // Poll for new messages when conversation is open
  const fetchMessages = useCallback(async () => {
    if (!conversation) return;
    try {
      const res = await fetch(`/api/support/${conversation.id}/messages?limit=50`);
      if (res.ok) {
        const data = await res.json();
        const fetched: SupportMessage[] = data.messages ?? [];
        if (fetched.length > messages.length) {
          const newCount = fetched.filter(
            (m) => m.senderType !== SupportSenderType.CUSTOMER
          ).length;
          setMessages(fetched);
          if (!open || minimized) {
            setUnread((u) => u + Math.max(0, newCount - unread));
          }
        }
      }
    } catch {
      // ignore
    }
  }, [conversation, messages.length, open, minimized, unread]);

  useEffect(() => {
    if (!conversation) return;
    const interval = setInterval(fetchMessages, 5000);
    return () => clearInterval(interval);
  }, [conversation, fetchMessages]);

  const createConversation = async (sourceType: string, subject?: string) => {
    const res = await fetch("/api/support", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        visitorId,
        sourceType,
        subject: subject ?? sourceType,
        sourcePageUrl: typeof window !== "undefined" ? window.location.href : undefined,
      }),
    });
    if (!res.ok) return null;
    const conv: Conversation = await res.json();
    return conv;
  };

  const handleQuickReply = async (label: string, sourceType: string) => {
    setSending(true);
    try {
      const conv = await createConversation(sourceType, label);
      if (!conv) return;
      setConversation(conv);

      // Send first message
      const res = await fetch(`/api/support/${conv.id}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: label, visitorId }),
      });
      if (res.ok) {
        const msg: SupportMessage = await res.json();
        setMessages([msg]);
      }
    } finally {
      setSending(false);
    }
  };

  const sendMessage = async () => {
    if (!input.trim()) return;

    let conv = conversation;

    setSending(true);
    try {
      if (!conv) {
        const newConv = await createConversation("general");
        if (!newConv) return;
        setConversation(newConv);
        conv = newConv;
      }

      const res = await fetch(`/api/support/${conv.id}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: input.trim(), visitorId }),
      });

      if (res.ok) {
        const msg: SupportMessage = await res.json();
        setMessages((prev) => [...prev, msg]);
        setInput("");
      }
    } finally {
      setSending(false);
    }
  };

  const handleOpen = () => {
    setOpen(true);
    setMinimized(false);
    setUnread(0);
  };

  const handleMinimize = () => {
    setMinimized(true);
    setOpen(false);
  };

  const handleLeaveMessage = async () => {
    if (!email.trim() || !input.trim()) return;
    setSending(true);
    try {
      const conv = await createConversation("offline", `Email: ${email}`);
      if (!conv) return;
      await fetch(`/api/support/${conv.id}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: `Email: ${email}\n\n${input.trim()}`, visitorId }),
      });
      setLeaveMessageSent(true);
    } finally {
      setSending(false);
    }
  };

  return (
    <>
      {/* Floating button */}
      <div className="fixed bottom-6 right-6 z-50">
        {!open && (
          <button
            onClick={handleOpen}
            className="relative flex h-14 w-14 items-center justify-center rounded-full bg-nimbus-600 text-white shadow-lg hover:bg-nimbus-500 transition-colors"
            aria-label="Open support chat"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
            {unread > 0 && (
              <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white">
                {unread > 9 ? "9+" : unread}
              </span>
            )}
          </button>
        )}

        {/* Chat panel */}
        {open && (
          <div className="flex flex-col w-[360px] rounded-2xl border border-surface-border bg-surface shadow-2xl overflow-hidden" style={{ height: "520px" }}>
            {/* Header */}
            <div className="flex items-center justify-between bg-nimbus-700 px-4 py-3">
              <div>
                <p className="font-semibold text-white text-sm">Card Nimbus Support</p>
                <p className="text-xs text-nimbus-200">
                  {offlineMode ? "Leave us a message" : "We typically reply within minutes"}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleMinimize}
                  className="text-nimbus-200 hover:text-white transition-colors"
                  aria-label="Minimize"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="5" y1="12" x2="19" y2="12" />
                  </svg>
                </button>
                <button
                  onClick={() => setOpen(false)}
                  className="text-nimbus-200 hover:text-white transition-colors"
                  aria-label="Close"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto px-3 py-3">
              {offlineMode ? (
                // Offline mode
                leaveMessageSent ? (
                  <div className="flex flex-col items-center justify-center h-full gap-3 text-center">
                    <div className="h-12 w-12 rounded-full bg-emerald-900 flex items-center justify-center">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-emerald-400">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    </div>
                    <p className="font-medium text-text-primary">Message sent!</p>
                    <p className="text-sm text-text-secondary">We'll get back to you at {email}.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <p className="text-sm text-text-secondary">
                      Our team is currently offline. Leave your email and message and we'll respond soon.
                    </p>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Your email address"
                      className="w-full rounded-lg border border-surface-border bg-surface-overlay px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-nimbus-500"
                    />
                    <textarea
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      placeholder="Your message…"
                      rows={4}
                      className="w-full rounded-lg border border-surface-border bg-surface-overlay px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-nimbus-500 resize-none"
                    />
                    <button
                      onClick={handleLeaveMessage}
                      disabled={sending || !email.trim() || !input.trim()}
                      className="w-full rounded-lg bg-nimbus-600 py-2 text-sm font-medium text-white hover:bg-nimbus-500 disabled:opacity-50 transition-colors"
                    >
                      {sending ? "Sending…" : "Send Message"}
                    </button>
                  </div>
                )
              ) : messages.length === 0 ? (
                // Greeting + quick replies
                <div className="space-y-4">
                  <div className="rounded-xl bg-surface-raised px-4 py-3">
                    <p className="text-sm font-medium text-text-primary mb-1">Hi there! 👋</p>
                    <p className="text-sm text-text-secondary">
                      How can we help you today? Choose a topic below or type your question.
                    </p>
                  </div>
                  <div className="space-y-2">
                    {QUICK_REPLIES.map((qr) => (
                      <button
                        key={qr.sourceType}
                        onClick={() => handleQuickReply(qr.label, qr.sourceType)}
                        disabled={sending}
                        className="w-full rounded-lg border border-surface-border bg-surface-overlay px-3 py-2.5 text-left text-sm text-text-primary hover:bg-surface-raised hover:border-nimbus-600 transition-colors disabled:opacity-50"
                      >
                        {qr.label}
                      </button>
                    ))}
                  </div>
                  <button
                    onClick={() => setOfflineMode(true)}
                    className="w-full text-center text-xs text-text-muted hover:text-text-secondary transition-colors"
                  >
                    Leave a message instead
                  </button>
                </div>
              ) : (
                // Conversation
                <div className="space-y-1">
                  {messages.map((msg) => (
                    <ChatBubble
                      key={msg.id}
                      content={msg.content}
                      senderType={msg.senderType}
                      createdAt={msg.createdAt}
                    />
                  ))}
                  <div ref={messagesEndRef} />
                </div>
              )}
            </div>

            {/* Input */}
            {!offlineMode && messages.length > 0 && (
              <div className="border-t border-surface-border px-3 py-2">
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && sendMessage()}
                    placeholder="Type a message…"
                    className="flex-1 rounded-lg border border-surface-border bg-surface-overlay px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-nimbus-500"
                  />
                  <button
                    onClick={sendMessage}
                    disabled={sending || !input.trim()}
                    className="flex h-9 w-9 items-center justify-center rounded-lg bg-nimbus-600 text-white hover:bg-nimbus-500 disabled:opacity-50 transition-colors"
                    aria-label="Send"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="22" y1="2" x2="11" y2="13" />
                      <polygon points="22 2 15 22 11 13 2 9 22 2" />
                    </svg>
                  </button>
                </div>
              </div>
            )}

            {/* Start new from greeting */}
            {!offlineMode && messages.length === 0 && (
              <div className="border-t border-surface-border px-3 py-2">
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && sendMessage()}
                    placeholder="Or type your question…"
                    className="flex-1 rounded-lg border border-surface-border bg-surface-overlay px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-nimbus-500"
                  />
                  <button
                    onClick={sendMessage}
                    disabled={sending || !input.trim()}
                    className="flex h-9 w-9 items-center justify-center rounded-lg bg-nimbus-600 text-white hover:bg-nimbus-500 disabled:opacity-50 transition-colors"
                    aria-label="Send"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="22" y1="2" x2="11" y2="13" />
                      <polygon points="22 2 15 22 11 13 2 9 22 2" />
                    </svg>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
}
