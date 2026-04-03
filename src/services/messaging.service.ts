import { db } from "@/lib/db";
import { NotFoundError, ForbiddenError, ValidationError } from "@/lib/errors";

export async function getOrCreateConversation(
  listingId: string,
  buyerId: string,
  sellerId: string
) {
  if (buyerId === sellerId) {
    throw new ValidationError("Buyer and seller cannot be the same user");
  }

  const existing = await db.conversation.findUnique({
    where: {
      listingId_buyerId_sellerId: {
        listingId,
        buyerId,
        sellerId,
      },
    },
  });

  if (existing) {
    return existing;
  }

  return db.conversation.create({
    data: {
      listingId,
      buyerId,
      sellerId,
      lastMessageAt: new Date(),
    },
  });
}

export async function getUserConversations(
  userId: string,
  page: number = 1,
  limit: number = 20
) {
  const skip = (page - 1) * limit;

  const [conversations, total] = await Promise.all([
    db.conversation.findMany({
      where: {
        OR: [{ buyerId: userId }, { sellerId: userId }],
      },
      include: {
        listing: {
          select: { id: true, title: true, images: true },
        },
        buyer: {
          select: { id: true, name: true, avatar: true },
        },
        seller: {
          select: { id: true, name: true, avatar: true },
        },
        messages: {
          orderBy: { createdAt: "desc" },
          take: 1,
          select: {
            id: true,
            content: true,
            senderId: true,
            isRead: true,
            createdAt: true,
          },
        },
      },
      orderBy: { lastMessageAt: "desc" },
      skip,
      take: limit,
    }),
    db.conversation.count({
      where: {
        OR: [{ buyerId: userId }, { sellerId: userId }],
      },
    }),
  ]);

  // Compute unread count per conversation
  const conversationIds = conversations.map((c) => c.id);
  const unreadCounts = await db.message.groupBy({
    by: ["conversationId"],
    where: {
      conversationId: { in: conversationIds },
      isRead: false,
      senderId: { not: userId },
    },
    _count: { id: true },
  });

  const unreadMap = new Map(
    unreadCounts.map((u) => [u.conversationId, u._count.id])
  );

  const result = conversations.map((conv) => ({
    ...conv,
    lastMessage: conv.messages[0] ?? null,
    messages: undefined,
    unreadCount: unreadMap.get(conv.id) ?? 0,
    otherParty: conv.buyerId === userId ? conv.seller : conv.buyer,
  }));

  return {
    conversations: result,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}

export async function getConversationMessages(
  conversationId: string,
  userId: string,
  page: number = 1,
  limit: number = 50
) {
  const conversation = await db.conversation.findUnique({
    where: { id: conversationId },
  });

  if (!conversation) {
    throw new NotFoundError("Conversation");
  }

  if (conversation.buyerId !== userId && conversation.sellerId !== userId) {
    throw new ForbiddenError("You are not a participant in this conversation");
  }

  const skip = (page - 1) * limit;

  const [messages, total] = await Promise.all([
    db.message.findMany({
      where: { conversationId },
      include: {
        sender: {
          select: { id: true, name: true, avatar: true },
        },
      },
      orderBy: { createdAt: "asc" },
      skip,
      take: limit,
    }),
    db.message.count({ where: { conversationId } }),
  ]);

  return {
    messages,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}

export async function sendMessage(
  conversationId: string,
  senderId: string,
  content: string
) {
  const conversation = await db.conversation.findUnique({
    where: { id: conversationId },
  });

  if (!conversation) {
    throw new NotFoundError("Conversation");
  }

  if (conversation.buyerId !== senderId && conversation.sellerId !== senderId) {
    throw new ForbiddenError("You are not a participant in this conversation");
  }

  if (!content || content.trim().length === 0) {
    throw new ValidationError("Message content cannot be empty");
  }

  const [message] = await db.$transaction([
    db.message.create({
      data: {
        conversationId,
        senderId,
        content: content.trim(),
      },
      include: {
        sender: {
          select: { id: true, name: true, avatar: true },
        },
      },
    }),
    db.conversation.update({
      where: { id: conversationId },
      data: { lastMessageAt: new Date() },
    }),
  ]);

  return message;
}

export async function markMessagesRead(conversationId: string, userId: string) {
  const conversation = await db.conversation.findUnique({
    where: { id: conversationId },
  });

  if (!conversation) {
    throw new NotFoundError("Conversation");
  }

  if (conversation.buyerId !== userId && conversation.sellerId !== userId) {
    throw new ForbiddenError("You are not a participant in this conversation");
  }

  const result = await db.message.updateMany({
    where: {
      conversationId,
      senderId: { not: userId },
      isRead: false,
    },
    data: { isRead: true },
  });

  return { updated: result.count };
}

export async function getUnreadMessageCount(userId: string) {
  const count = await db.message.count({
    where: {
      conversation: {
        OR: [{ buyerId: userId }, { sellerId: userId }],
      },
      senderId: { not: userId },
      isRead: false,
    },
  });

  return { unreadCount: count };
}
