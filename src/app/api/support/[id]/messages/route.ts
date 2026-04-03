import { type NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import {
  errorResponse,
  NotFoundError,
  ForbiddenError,
  ValidationError,
} from "@/lib/errors";
import { sendSupportMessage } from "@/services/support.service";
import { SupportSenderType, SupportMessageType } from "@prisma/client";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    const { id } = await params;

    const conversation = await db.supportConversation.findUnique({
      where: { id },
    });

    if (!conversation) {
      throw new NotFoundError("Support conversation");
    }

    const isAdmin = session?.user && (session.user as any).role === "ADMIN";
    const isOwner = session?.user?.id && conversation.userId === session.user.id;

    if (!isAdmin && !isOwner) {
      throw new ForbiddenError("Access denied");
    }

    const { searchParams } = request.nextUrl;
    const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") ?? "50", 10)));
    const skip = (page - 1) * limit;

    const [messages, total] = await Promise.all([
      db.supportMessage.findMany({
        where: { conversationId: id },
        orderBy: { createdAt: "asc" },
        skip,
        take: limit,
      }),
      db.supportMessage.count({ where: { conversationId: id } }),
    ]);

    return Response.json({
      messages,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    const { id } = await params;

    const conversation = await db.supportConversation.findUnique({
      where: { id },
    });

    if (!conversation) {
      throw new NotFoundError("Support conversation");
    }

    const isAdmin = session?.user && (session.user as any).role === "ADMIN";
    const isOwner = session?.user?.id && conversation.userId === session.user.id;

    const body = await request.json();
    const { content, messageType, visitorId } = body;

    if (!content) {
      throw new ValidationError("content is required");
    }

    // Determine sender type
    let senderType: SupportSenderType;
    let senderId: string | null = null;

    if (isAdmin) {
      senderType = SupportSenderType.AGENT;
      senderId = session!.user!.id!;
    } else if (isOwner) {
      senderType = SupportSenderType.CUSTOMER;
      senderId = session!.user!.id!;
    } else if (visitorId && conversation.visitorId === visitorId) {
      // Anonymous visitor
      senderType = SupportSenderType.CUSTOMER;
      senderId = null;
    } else {
      throw new ForbiddenError("Access denied");
    }

    const msgType: SupportMessageType =
      messageType in SupportMessageType
        ? (messageType as SupportMessageType)
        : SupportMessageType.TEXT;

    const message = await sendSupportMessage(id, senderId, senderType, content, msgType);
    return Response.json(message, { status: 201 });
  } catch (error) {
    return errorResponse(error);
  }
}
