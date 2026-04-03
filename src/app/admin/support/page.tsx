"use client";

import { useState, useEffect, useCallback } from "react";
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
}

interface CannedResponse {
  id: string;
  shortcut: string;
  title: string;
  content: string;
  category: string | null;
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
  return <Badge variant={entry.variant}>{entry.label}</Badge>;
}

function statusBadge(status: SupportConversationStatus) {
  const map: Record<SupportConversationStatus, { variant: BadgeVariant; label: string }> = {
    OPEN: { variant: "nimbus", label: "Open" },
    WAITING_ON_AGENT: { variant: "warning", label: "Waiting (Agent)" },
    WAITING_ON_CUSTOMER: { variant: "default", label: "Waiting (Customer)" },
    RESOLVED: { variant: "success", label: "Resolved" },
    CLOSED: { variant: "default", label: "Closed" },
  };
  const entry = map[status] ?? { variant: "default" as BadgeVariant, label: status };
  return <Badge variant={entry.variant}>{entry.label}</Badge>;
}

function waitTime(startedAt: string) {
  const ms = Date.now() - new Date(startedAt).getTime();
  const mins = Math.floor(ms / 60_000);
  if (mins < 60) return `${mins}m`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ${mins % 60}m`;
  return `${Math.floor(hrs / 24)}d`;
}

// ─── Conversation Panel ───────────────────────────────────────────────────────

function ConversationPanel({
  conversation,
  onAction,
  cannedResponses,
}: {
  conversation: SupportConversation;
  onAction: () => void;
  cannedResponses: CannedResponse[];
}) {
  const [messages, setMessages] = useState<SupportMessage[]>(conversation.messages ?? []);
  const [reply, setReply] = useState("");
  const [noteContent, setNoteContent] = useState("");
  const [sending, setSending] = useState(false);
  const [tab, setTab] = useState<"chat" | "notes">("chat");
  const [showCanned, setShowCanned] = useState(false);

  const sendReply = async () => {
    if (!reply.trim()) return;
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

  const addNote = async () => {
    if (!noteContent.trim()) return;
    setSending(true);
    try {
      await fetch(`/api/admin/support/${conversation.id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: noteContent }),
      });
      setNoteContent("");
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

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-surface-border px-4 py-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-semibold text-text-primary">
              {conversation.subject ?? "Support Request"}
            </span>
            {priorityBadge(conversation.priority)}
            {statusBadge(conversation.status)}
          </div>
          <p className="mt-0.5 text-xs text-text-muted">
            Started {waitTime(conversation.startedAt)} ago
            {conversation.userId ? ` · User ${conversation.userId.slice(0, 8)}…` : " · Anonymous"}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" size="sm" onClick={() => setShowCanned(!showCanned)}>
            Canned
          </Button>
          {conversation.status !== "RESOLVED" && conversation.status !== "CLOSED" && (
            <Button variant="primary" size="sm" onClick={resolve}>
              Resolve
            </Button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-surface-border">
        {(["chat", "notes"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={[
              "px-4 py-2 text-sm font-medium capitalize transition-colors",
              tab === t
                ? "border-b-2 border-nimbus-500 text-nimbus-400"
                : "text-text-secondary hover:text-text-primary",
            ].join(" ")}
          >
            {t === "notes" ? "Internal Notes" : "Chat"}
          </button>
        ))}
      </div>

      {/* Messages / Notes */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {tab === "chat" &&
          messages.map((msg) => (
            <div
              key={msg.id}
              className={[
                "max-w-[80%] rounded-xl px-3 py-2 text-sm",
                msg.senderType === SupportSenderType.CUSTOMER
                  ? "ml-auto bg-nimbus-600 text-white"
                  : msg.senderType === SupportSenderType.AGENT
                  ? "bg-surface-raised text-text-primary"
                  : "mx-auto bg-surface-overlay text-text-muted text-center text-xs",
              ].join(" ")}
            >
              {msg.content}
            </div>
          ))}
        {tab === "chat" && messages.length === 0 && (
          <p className="text-center text-sm text-text-muted">No messages yet.</p>
        )}
        {tab === "notes" && (
          <p className="text-center text-sm text-text-muted">Internal notes visible here.</p>
        )}
      </div>

      {/* Canned sidebar */}
      {showCanned && (
        <div className="border-t border-surface-border p-3 space-y-1 max-h-40 overflow-y-auto bg-surface-overlay">
          <p className="text-xs font-medium text-text-muted mb-1">Canned Responses</p>
          {cannedResponses.map((cr) => (
            <button
              key={cr.id}
              onClick={() => { setReply(cr.content); setShowCanned(false); }}
              className="block w-full text-left rounded px-2 py-1 text-xs text-text-secondary hover:bg-surface-raised"
            >
              <span className="font-mono text-nimbus-400">/{cr.shortcut}</span>{" "}
              {cr.title}
            </button>
          ))}
          {cannedResponses.length === 0 && (
            <p className="text-xs text-text-muted">No canned responses.</p>
          )}
        </div>
      )}

      {/* Input */}
      <div className="border-t border-surface-border p-3">
        {tab === "chat" ? (
          <div className="flex gap-2">
            <Input
              value={reply}
              onChange={(e) => setReply(e.target.value)}
              placeholder="Type a reply…"
              onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && sendReply()}
              className="flex-1"
            />
            <Button variant="primary" size="sm" onClick={sendReply} disabled={sending}>
              Send
            </Button>
          </div>
        ) : (
          <div className="flex gap-2">
            <Input
              value={noteContent}
              onChange={(e) => setNoteContent(e.target.value)}
              placeholder="Add internal note…"
              className="flex-1"
            />
            <Button variant="secondary" size="sm" onClick={addNote} disabled={sending}>
              Add Note
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AdminSupportPage() {
  const [conversations, setConversations] = useState<SupportConversation[]>([]);
  const [selected, setSelected] = useState<SupportConversation | null>(null);
  const [cannedResponses, setCannedResponses] = useState<CannedResponse[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchQueue = useCallback(async () => {
    const res = await fetch("/api/admin/support");
    if (res.ok) {
      const data = await res.json();
      setConversations(data.conversations ?? []);
      if (data.conversations?.length && !selected) {
        setSelected(data.conversations[0]);
      }
    }
    setLoading(false);
  }, [selected]);

  useEffect(() => {
    fetchQueue();
    fetch("/api/support?canned=1")
      .then(() => {})
      .catch(() => {});
    // Also load canned responses
    fetch("/api/admin/support?canned=1")
      .then(() => {})
      .catch(() => {});
  }, []);

  useEffect(() => {
    // Load canned responses from a dedicated endpoint or just set empty
    setCannedResponses([]);
  }, []);

  const handleAction = useCallback(() => {
    fetchQueue();
  }, [fetchQueue]);

  return (
    <div className="flex h-[calc(100vh-4rem)] overflow-hidden">
      {/* Queue sidebar */}
      <div className="w-80 shrink-0 border-r border-surface-border flex flex-col">
        <div className="px-4 py-3 border-b border-surface-border">
          <h1 className="text-lg font-bold text-text-primary">Support Queue</h1>
          <p className="text-xs text-text-muted mt-0.5">{conversations.length} open</p>
        </div>

        <div className="flex-1 overflow-y-auto">
          {loading && (
            <p className="px-4 py-6 text-sm text-text-muted">Loading…</p>
          )}
          {!loading && conversations.length === 0 && (
            <p className="px-4 py-6 text-sm text-text-muted text-center">Queue is empty.</p>
          )}
          {conversations.map((conv) => (
            <button
              key={conv.id}
              onClick={() => setSelected(conv)}
              className={[
                "w-full text-left px-4 py-3 border-b border-surface-border transition-colors",
                selected?.id === conv.id
                  ? "bg-nimbus-500/10"
                  : "hover:bg-surface-overlay",
              ].join(" ")}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium text-text-primary truncate max-w-[160px]">
                  {conv.subject ?? "Support Request"}
                </span>
                {priorityBadge(conv.priority)}
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-text-muted">
                  {conv.userId ? `User ${conv.userId.slice(0, 6)}…` : "Visitor"}
                </span>
                <span className="text-xs text-text-muted">{waitTime(conv.startedAt)}</span>
              </div>
              {conv.assignedAgentId && (
                <p className="text-xs text-text-muted mt-0.5">
                  Agent: {conv.assignedAgentId.slice(0, 8)}…
                </p>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Conversation panel */}
      <div className="flex-1 min-w-0">
        {selected ? (
          <ConversationPanel
            key={selected.id}
            conversation={selected}
            onAction={handleAction}
            cannedResponses={cannedResponses}
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <p className="text-text-muted">Select a conversation to view it.</p>
          </div>
        )}
      </div>
    </div>
  );
}
