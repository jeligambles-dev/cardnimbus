import { type NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { errorResponse, UnauthorizedError, ValidationError } from "@/lib/errors";
import { getConversationMessages, sendMessage } from "@/services/messaging.service";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) throw new UnauthorizedError();

    const { id: conversationId } = await params;
    const { searchParams } = request.nextUrl;
    const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") ?? "50", 10)));

    const result = await getConversationMessages(
      conversationId,
      session.user.id!,
      page,
      limit
    );

    return Response.json(result);
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
    if (!session?.user) throw new UnauthorizedError();

    const { id: conversationId } = await params;
    const body = await request.json();
    const { content } = body;

    if (!content || typeof content !== "string") {
      throw new ValidationError("content is required");
    }

    const message = await sendMessage(conversationId, session.user.id!, content);
    return Response.json(message, { status: 201 });
  } catch (error) {
    return errorResponse(error);
  }
}
