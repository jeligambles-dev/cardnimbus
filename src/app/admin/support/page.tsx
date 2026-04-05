"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  SupportConversationStatus,
  SupportPriority,
  SupportSenderType,
} from "@prisma/client";

// ─── Types ────────────────────────────────────────────────────────────────────

interface SupportMessage {
  id: string;
  content: string;
  senderType: SupportSenderType;
  createdAt: string;
  senderId: string | null;
}

interface ConversationUser {
  id: string;
  name: string | null;
  email: string;
  avatar: string | null;
}

interface SupportConversation {
  id: string;
  userId: string | null;
  visitorId: string | null;
  assignedAgentId: string | null;
  status: SupportConversationStatus;
  priority: SupportPriority;
  subject: string | null;
  startedAt: string;
  lastMessageAt: string | null;
  messages: SupportMessage[];
  user: ConversationUser | null;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

type BadgeVariant = "default" | "success" | "warning" | "danger" | "nimbus";

function priorityBadge(priority: SupportPriority) {
  const map: Record<SupportPriority, { variant: BadgeVariant; label: string }> = {
    LOW: { variant: "default", label: "Low" },
    NORMAL: { variant: "default", label: "Normal" },
    HIGH: { variant: "warning", label: "High" },
    URGENT: { variant: "danger", label: "Urgent" },
  };
  const entry = map[priority] ?? { variant: "default" as BadgeVariant, label: priority };
  return <Badge variant={entry.variant} size="sm">{entry.label}</Badge>;
}

function statusBadge(status: SupportConversationStatus) {
  const map: Record<SupportConversationStatus, { variant: BadgeVariant; label: string }> = {
    OPEN: { variant: "nimbus", label: "Open" },
    WAITING_ON_AGENT: { variant: "warning", label: "Waiting" },
    WAITING_ON_CUSTOMER: { variant: "default", label: "Replied" },
    RESOLVED: { variant: "success", label: "Resolved" },
    CLOSED: { variant: "default", label: "Closed" },
  };
  const entry = map[status] ?? { variant: "default" as BadgeVariant, label: status };
  return <Badge variant={entry.variant} size="sm">{entry.label}</Badge>;
}

function waitTime(startedAt: string) {
  const ms = Date.now() - new Date(startedAt).getTime();
  const mins = Math.floor(ms / 60_000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h`;
  return `${Math.floor(hrs / 24)}d`;
}

function formatTime(iso: string) {
  const d = new Date(iso);
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function customerLabel(conv: { user: ConversationUser | null; userId: string | null; visitorId: string | null }) {
  if (conv.user) return conv.user.name ?? conv.user.email;
  if (conv.userId) return `User ${conv.userId.slice(0, 8)}`;
  if (conv.visitorId) return `Visitor ${conv.visitorId.slice(-6)}`;
  return "Anonymous";
}

// ─── Conversation Panel ───────────────────────────────────────────────────────

function ConversationPanel({
  conversation,
  onAction,
}: {
  conversation: SupportConversation;
  onAction: () => void;
}) {
  const [messages, setMessages] = useState<SupportMessage[]>(conversation.messages ?? []);
  const [reply, setReply] = useState("");
  const [sending, setSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Load full message history for this conversation
  const fetchMessages = useCallback(async () => {
    try {
      const res = await fetch(`/api/support/${conversation.id}/messages?limit=100`);
      if (res.ok) {
        const data = await res.json();
        setMessages(data.messages ?? []);
      }
    } catch {
      // ignore
    }
  }, [conversation.id]);

  // Initial load + poll every 4s for new customer messages
  useEffect(() => {
    fetchMessages();
    const interval = setInterval(fetchMessages, 4000);
    return () => clearInterval(interval);
  }, [fetchMessages]);

  // Auto-scroll to bottom when messages update
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const sendReply = async () => {
    if (!reply.trim() || sending) return;
    setSending(true);
    try {
      const res = await fetch(`/api/support/${conversation.id}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: reply }),
      });
      if (res.ok) {
        const msg = await res.json();
        setMessages((prev) => [...prev, msg]);
        setReply("");
        onAction();
      }
    } finally {
      setSending(false);
    }
  };

  const resolve = async () => {
    await fetch(`/api/admin/support/${conversation.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "resolve" }),
    });
    onAction();
  };

  const label = customerLabel(conversation);
  const initial = label.charAt(0).toUpperCase();

  return (
    <div className="flex h-full flex-col bg-white">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-surface-border px-5 py-3 bg-white">
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-nimbus-500 text-white font-bold text-sm shrink-0">
            {conversation.user?.avatar ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={conversation.user.avatar}
                alt={label}
                className="h-10 w-10 rounded-full object-cover"
              />
            ) : (
              initial
            )}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 min-w-0">
              <span className="font-semibold text-text-primary truncate">{label}</span>
              {priorityBadge(conversation.priority)}
              {statusBadge(conversation.status)}
            </div>
            <p className="text-xs text-text-muted truncate">
              {conversation.subject ?? "Support Request"} · Started {waitTime(conversation.startedAt)} ago
              {conversation.user?.email && ` · ${conversation.user.email}`}
            </p>
          </div>
        </div>
        <div className="flex gap-2 shrink-0">
          {conversation.status !== "RESOLVED" && conversation.status !== "CLOSED" && (
            <Button variant="primary" size="sm" onClick={resolve}>
              Resolve
            </Button>
          )}
        </div>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-5 space-y-3 bg-surface-overlay">
        {messages.length === 0 ? (
          <p className="text-center text-sm text-text-muted py-8">No messages yet.</p>
        ) : (
          messages.map((msg) => {
            const fromAgent = msg.senderType === SupportSenderType.AGENT;
            const system = msg.senderType === SupportSenderType.SYSTEM || msg.senderType === SupportSenderType.BOT;
            if (system) {
              return (
                <div key={msg.id} className="text-center">
                  <span className="inline-block rounded-full bg-white border border-surface-border px-3 py-1 text-[11px] text-text-muted">
                    {msg.content}
                  </span>
                </div>
              );
            }
            return (
              <div key={msg.id} className={`flex ${fromAgent ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[75%] rounded-2xl px-4 py-2.5 text-sm shadow-sm ${
                    fromAgent
                      ? "bg-nimbus-500 text-white rounded-br-md"
                      : "bg-white text-text-primary border border-surface-border rounded-bl-md"
                  }`}
                >
                  <p className="whitespace-pre-wrap break-words">{msg.content}</p>
                  <p
                    className={`text-[10px] mt-1 ${
                      fromAgent ? "text-white/70" : "text-text-muted"
                    }`}
                  >
                    {formatTime(msg.createdAt)}
                  </p>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Input */}
      <div className="border-t border-surface-border p-3 bg-white">
        <div className="flex gap-2">
          <Input
            value={reply}
            onChange={(e) => setReply(e.target.value)}
            placeholder="Type your reply…"
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                sendReply();
              }
            }}
            className="flex-1"
          />
          <Button variant="primary" size="sm" onClick={sendReply} disabled={sending || !reply.trim()}>
            {sending ? "Sending…" : "Send"}
          </Button>
        </div>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AdminSupportPage() {
  const [conversations, setConversations] = useState<SupportConversation[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchQueue = useCallback(async () => {
    const res = await fetch("/api/admin/support");
    if (res.ok) {
      const data = await res.json();
      setConversations(data.conversations ?? []);
      setSelectedId((current) => {
        if (current) return current;
        return data.conversations?.[0]?.id ?? null;
      });
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchQueue();
    const interval = setInterval(fetchQueue, 6000);
    return () => clearInterval(interval);
  }, [fetchQueue]);

  const selected = conversations.find((c) => c.id === selectedId) ?? null;

  return (
    <div className="flex h-[calc(100vh-4rem)] overflow-hidden">
      {/* Queue sidebar */}
      <div className="w-80 shrink-0 border-r border-surface-border flex flex-col bg-white">
        <div className="px-4 py-3 border-b border-surface-border">
          <h1 className="text-lg font-bold text-text-primary">Support Queue</h1>
          <p className="text-xs text-text-muted mt-0.5">
            {conversations.length} active conversation{conversations.length !== 1 ? "s" : ""}
          </p>
        </div>

        <div className="flex-1 overflow-y-auto">
          {loading && <p className="px-4 py-6 text-sm text-text-muted">Loading…</p>}
          {!loading && conversations.length === 0 && (
            <p className="px-4 py-6 text-sm text-text-muted text-center">Queue is empty.</p>
          )}
          {conversations.map((conv) => {
            const label = customerLabel(conv);
            const initial = label.charAt(0).toUpperCase();
            const lastMsg = conv.messages[0];
            const isSelected = selectedId === conv.id;
            const needsReply = conv.status === "WAITING_ON_AGENT" || conv.status === "OPEN";

            return (
              <button
                key={conv.id}
                onClick={() => setSelectedId(conv.id)}
                className={`w-full text-left px-4 py-3 border-b border-surface-border transition-colors ${
                  isSelected ? "bg-nimbus-50" : "hover:bg-surface-overlay"
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-nimbus-500 text-white font-bold text-xs shrink-0">
                    {conv.user?.avatar ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={conv.user.avatar} alt={label} className="h-9 w-9 rounded-full object-cover" />
                    ) : (
                      initial
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-sm font-semibold text-text-primary truncate">{label}</span>
                      <span className="text-[10px] text-text-muted shrink-0">
                        {conv.lastMessageAt ? waitTime(conv.lastMessageAt) : waitTime(conv.startedAt)}
                      </span>
                    </div>
                    <p className="text-xs text-text-muted truncate mt-0.5">
                      {lastMsg?.content ?? conv.subject ?? "Support Request"}
                    </p>
                    <div className="flex items-center gap-1.5 mt-1.5">
                      {priorityBadge(conv.priority)}
                      {needsReply && (
                        <span className="inline-flex h-2 w-2 rounded-full bg-red-500" title="Needs reply" />
                      )}
                    </div>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Conversation panel */}
      <div className="flex-1 min-w-0">
        {selected ? (
          <ConversationPanel
            key={selected.id}
            conversation={selected}
            onAction={fetchQueue}
          />
        ) : (
          <div className="flex h-full items-center justify-center bg-surface-overlay">
            <p className="text-text-muted">Select a conversation to view it.</p>
          </div>
        )}
      </div>
    </div>
  );
}
