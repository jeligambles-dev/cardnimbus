import { db } from "@/lib/db";
import { NotFoundError, ForbiddenError, ValidationError } from "@/lib/errors";
import {
  SupportConversationStatus,
  SupportPriority,
  SupportSenderType,
  SupportMessageType,
} from "@prisma/client";

// ─── Routing helpers ──────────────────────────────────────────────────────────

function routePriority(sourceType?: string): {
  priority: SupportPriority;
  priorityReason?: string;
} {
  if (!sourceType) return { priority: SupportPriority.NORMAL };

  const lower = sourceType.toLowerCase();

  if (lower === "checkout") {
    return { priority: SupportPriority.HIGH, priorityReason: "Checkout support" };
  }
  if (lower === "marketplace_dispute" || lower === "dispute") {
    return {
      priority: SupportPriority.HIGH,
      priorityReason: "Marketplace dispute",
    };
  }

  return { priority: SupportPriority.NORMAL };
}

// ─── Conversation CRUD ───────────────────────────────────────────────────────

export async function createSupportConversation(input: {
  userId?: string;
  visitorId?: string;
  sourcePageUrl?: string;
  sourceType?: string;
  subject?: string;
}) {
  const { priority, priorityReason } = routePriority(input.sourceType);

  return db.supportConversation.create({
    data: {
      userId: input.userId,
      visitorId: input.visitorId,
      sourcePageUrl: input.sourcePageUrl,
      sourceType: input.sourceType,
      subject: input.subject,
      priority,
      priorityReason,
      status: SupportConversationStatus.OPEN,
    },
  });
}

export async function getSupportConversation(id: string) {
  const conversation = await db.supportConversation.findUnique({
    where: { id },
    include: {
      messages: {
        orderBy: { createdAt: "asc" },
        take: 50,
      },
      internalNotes: {
        orderBy: { createdAt: "asc" },
      },
      transfers: {
        orderBy: { createdAt: "asc" },
      },
    },
  });

  if (!conversation) {
    throw new NotFoundError("Support conversation");
  }

  return conversation;
}

export async function getUserSupportConversations(userId: string) {
  return db.supportConversation.findMany({
    where: { userId },
    include: {
      messages: {
        orderBy: { createdAt: "desc" },
        take: 1,
      },
    },
    orderBy: { startedAt: "desc" },
  });
}

// ─── Agent queue ─────────────────────────────────────────────────────────────

export async function getOpenQueue(page: number = 1, limit: number = 20) {
  const skip = (page - 1) * limit;

  // Priority ordering: URGENT > HIGH > NORMAL > LOW
  const priorityOrder: Record<SupportPriority, number> = {
    URGENT: 0,
    HIGH: 1,
    NORMAL: 2,
    LOW: 3,
  };

  const [conversations, total] = await Promise.all([
    db.supportConversation.findMany({
      where: {
        status: {
          in: [
            SupportConversationStatus.OPEN,
            SupportConversationStatus.WAITING_ON_AGENT,
            SupportConversationStatus.WAITING_ON_CUSTOMER,
          ],
        },
      },
      include: {
        messages: {
          orderBy: { createdAt: "desc" },
          take: 1,
        },
      },
      orderBy: [{ lastMessageAt: "desc" }, { startedAt: "asc" }],
      skip,
      take: limit,
    }),
    db.supportConversation.count({
      where: {
        status: {
          in: [
            SupportConversationStatus.OPEN,
            SupportConversationStatus.WAITING_ON_AGENT,
            SupportConversationStatus.WAITING_ON_CUSTOMER,
          ],
        },
      },
    }),
  ]);

  // Fetch user info for conversations that have a userId
  const userIds = conversations.map((c) => c.userId).filter((id): id is string => !!id);
  const users =
    userIds.length > 0
      ? await db.user.findMany({
          where: { id: { in: userIds } },
          select: { id: true, name: true, email: true, avatar: true },
        })
      : [];
  const userMap = new Map(users.map((u) => [u.id, u]));

  const enriched = conversations.map((conv) => ({
    ...conv,
    user: conv.userId ? userMap.get(conv.userId) ?? null : null,
  }));

  // Sort by priority desc, then startedAt asc in-process (Prisma lacks multi-key with enum sort)
  const sorted = enriched.sort((a, b) => {
    const pa = priorityOrder[a.priority] ?? 99;
    const pb = priorityOrder[b.priority] ?? 99;
    if (pa !== pb) return pa - pb;
    return a.startedAt.getTime() - b.startedAt.getTime();
  });

  return {
    conversations: sorted,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}

// ─── Assignment ───────────────────────────────────────────────────────────────

export async function assignAgent(conversationId: string, agentId: string) {
  const conversation = await db.supportConversation.findUnique({
    where: { id: conversationId },
  });

  if (!conversation) {
    throw new NotFoundError("Support conversation");
  }

  return db.supportConversation.update({
    where: { id: conversationId },
    data: { assignedAgentId: agentId },
  });
}

// ─── Messaging ────────────────────────────────────────────────────────────────

export async function sendSupportMessage(
  conversationId: string,
  senderId: string | null,
  senderType: SupportSenderType,
  content: string,
  messageType: SupportMessageType = SupportMessageType.TEXT
) {
  const conversation = await db.supportConversation.findUnique({
    where: { id: conversationId },
  });

  if (!conversation) {
    throw new NotFoundError("Support conversation");
  }

  if (!content || content.trim().length === 0) {
    throw new ValidationError("Message content cannot be empty");
  }

  const now = new Date();

  let statusUpdate: SupportConversationStatus;
  const timestampUpdate: Record<string, Date> = { lastMessageAt: now };

  if (senderType === SupportSenderType.CUSTOMER) {
    statusUpdate = SupportConversationStatus.WAITING_ON_AGENT;
    timestampUpdate.lastCustomerMessageAt = now;
  } else if (senderType === SupportSenderType.AGENT) {
    statusUpdate = SupportConversationStatus.WAITING_ON_CUSTOMER;
    timestampUpdate.lastAgentMessageAt = now;
  } else {
    statusUpdate = conversation.status;
  }

  const [message] = await db.$transaction([
    db.supportMessage.create({
      data: {
        conversationId,
        senderId,
        senderType,
        messageType,
        content: content.trim(),
      },
    }),
    db.supportConversation.update({
      where: { id: conversationId },
      data: {
        status: statusUpdate,
        ...timestampUpdate,
      },
    }),
  ]);

  return message;
}

// ─── Internal notes ───────────────────────────────────────────────────────────

export async function addInternalNote(
  conversationId: string,
  agentId: string,
  content: string
) {
  const conversation = await db.supportConversation.findUnique({
    where: { id: conversationId },
  });

  if (!conversation) {
    throw new NotFoundError("Support conversation");
  }

  if (!content || content.trim().length === 0) {
    throw new ValidationError("Note content cannot be empty");
  }

  return db.supportInternalNote.create({
    data: {
      conversationId,
      agentId,
      content: content.trim(),
    },
  });
}

// ─── Transfers ────────────────────────────────────────────────────────────────

export async function transferConversation(
  conversationId: string,
  fromAgentId: string,
  toAgentId: string,
  reason?: string
) {
  const conversation = await db.supportConversation.findUnique({
    where: { id: conversationId },
  });

  if (!conversation) {
    throw new NotFoundError("Support conversation");
  }

  if (conversation.assignedAgentId && conversation.assignedAgentId !== fromAgentId) {
    throw new ForbiddenError("You are not the assigned agent for this conversation");
  }

  const [transferLog] = await db.$transaction([
    db.supportTransferLog.create({
      data: {
        conversationId,
        fromAgentId,
        toAgentId,
        reason,
      },
    }),
    db.supportConversation.update({
      where: { id: conversationId },
      data: { assignedAgentId: toAgentId },
    }),
  ]);

  return transferLog;
}

// ─── Resolution / Closing ─────────────────────────────────────────────────────

export async function resolveConversation(
  conversationId: string,
  agentId: string,
  closedReason?: string
) {
  const conversation = await db.supportConversation.findUnique({
    where: { id: conversationId },
  });

  if (!conversation) {
    throw new NotFoundError("Support conversation");
  }

  return db.supportConversation.update({
    where: { id: conversationId },
    data: {
      status: SupportConversationStatus.RESOLVED,
      resolvedAt: new Date(),
      closedReason,
    },
  });
}

export async function closeConversation(conversationId: string) {
  const conversation = await db.supportConversation.findUnique({
    where: { id: conversationId },
  });

  if (!conversation) {
    throw new NotFoundError("Support conversation");
  }

  return db.supportConversation.update({
    where: { id: conversationId },
    data: { status: SupportConversationStatus.CLOSED },
  });
}

// ─── Canned responses ─────────────────────────────────────────────────────────

export async function getCannedResponses(category?: string) {
  return db.cannedResponse.findMany({
    where: category ? { category } : undefined,
    orderBy: { title: "asc" },
  });
}

export async function createCannedResponse(input: {
  shortcut: string;
  title: string;
  content: string;
  category?: string;
  createdBy?: string;
}) {
  return db.cannedResponse.create({
    data: input,
  });
}

// ─── Analytics ────────────────────────────────────────────────────────────────

export async function getSupportAnalytics() {
  const statusCounts = await db.supportConversation.groupBy({
    by: ["status"],
    _count: { id: true },
  });

  const countByStatus = Object.fromEntries(
    statusCounts.map((s) => [s.status, s._count.id])
  ) as Partial<Record<SupportConversationStatus, number>>;

  // Avg time to first response: from startedAt to first agent message
  // We fetch all conversations that have at least one agent message
  const conversationsWithAgentReply = await db.supportConversation.findMany({
    where: {
      lastAgentMessageAt: { not: null },
    },
    select: {
      startedAt: true,
      messages: {
        where: { senderType: SupportSenderType.AGENT },
        orderBy: { createdAt: "asc" },
        take: 1,
        select: { createdAt: true },
      },
    },
    take: 1000, // cap for performance
  });

  let avgFirstResponseMs: number | null = null;

  const diffs = conversationsWithAgentReply
    .map((c) => {
      const firstAgentMsg = c.messages[0];
      if (!firstAgentMsg) return null;
      return firstAgentMsg.createdAt.getTime() - c.startedAt.getTime();
    })
    .filter((d): d is number => d !== null && d >= 0);

  if (diffs.length > 0) {
    avgFirstResponseMs = diffs.reduce((a, b) => a + b, 0) / diffs.length;
  }

  return {
    countByStatus,
    avgFirstResponseMs,
    avgFirstResponseMinutes:
      avgFirstResponseMs !== null ? avgFirstResponseMs / 60_000 : null,
    totalConversations: statusCounts.reduce((s, c) => s + c._count.id, 0),
  };
}
