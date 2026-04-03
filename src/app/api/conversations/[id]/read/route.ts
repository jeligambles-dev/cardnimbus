import { type NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { errorResponse, UnauthorizedError } from "@/lib/errors";
import { markMessagesRead } from "@/services/messaging.service";

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) throw new UnauthorizedError();

    const { id: conversationId } = await params;

    const result = await markMessagesRead(conversationId, session.user.id!);
    return Response.json(result);
  } catch (error) {
    return errorResponse(error);
  }
}
