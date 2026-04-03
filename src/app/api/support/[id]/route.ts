import { type NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import {
  errorResponse,
  NotFoundError,
  ForbiddenError,
} from "@/lib/errors";
import { getSupportConversation } from "@/services/support.service";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    const { id } = await params;

    const conversation = await getSupportConversation(id);

    const isAdmin = session?.user && (session.user as any).role === "ADMIN";
    const isOwner = session?.user?.id && conversation.userId === session.user.id;
    // Visitors access their own conversation via visitorId (passed as header or query)
    // For simplicity we allow read if authenticated owner or admin
    if (!isAdmin && !isOwner) {
      throw new ForbiddenError("Access denied");
    }

    return Response.json(conversation);
  } catch (error) {
    return errorResponse(error);
  }
}
