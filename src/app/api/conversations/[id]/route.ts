import { type NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { errorResponse, UnauthorizedError, ForbiddenError, NotFoundError } from "@/lib/errors";
import { db } from "@/lib/db";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) throw new UnauthorizedError();

    const { id } = await params;

    const conversation = await db.conversation.findUnique({
      where: { id },
      include: {
        listing: {
          select: { id: true, title: true, images: true, price: true },
        },
        buyer: {
          select: { id: true, name: true, avatar: true },
        },
        seller: {
          select: { id: true, name: true, avatar: true },
        },
      },
    });

    if (!conversation) {
      throw new NotFoundError("Conversation");
    }

    const userId = session.user.id!;
    if (conversation.buyerId !== userId && conversation.sellerId !== userId) {
      throw new ForbiddenError("You are not a participant in this conversation");
    }

    return Response.json(conversation);
  } catch (error) {
    return errorResponse(error);
  }
}
