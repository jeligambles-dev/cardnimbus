import { type NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { errorResponse, ValidationError } from "@/lib/errors";
import {
  createSupportConversation,
  getUserSupportConversations,
} from "@/services/support.service";

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    const body = await request.json();

    const { visitorId, sourcePageUrl, sourceType, subject } = body;

    // Must have either an authenticated user or a visitorId
    if (!session?.user?.id && !visitorId) {
      throw new ValidationError("visitorId is required for anonymous conversations");
    }

    const conversation = await createSupportConversation({
      userId: session?.user?.id,
      visitorId,
      sourcePageUrl,
      sourceType,
      subject,
    });

    return Response.json(conversation, { status: 201 });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const conversations = await getUserSupportConversations(session.user.id);
    return Response.json({ conversations });
  } catch (error) {
    return errorResponse(error);
  }
}
