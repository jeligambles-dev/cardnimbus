import { type NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { errorResponse, UnauthorizedError, ValidationError } from "@/lib/errors";
import { getUserConversations, getOrCreateConversation } from "@/services/messaging.service";
import { db } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) throw new UnauthorizedError();

    const { searchParams } = request.nextUrl;
    const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") ?? "20", 10)));

    const result = await getUserConversations(session.user.id!, page, limit);
    return Response.json(result);
  } catch (error) {
    return errorResponse(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) throw new UnauthorizedError();

    const body = await request.json();
    const { listingId } = body;

    if (!listingId) {
      throw new ValidationError("listingId is required");
    }

    const listing = await db.listing.findUnique({
      where: { id: listingId },
      include: { seller: true },
    });

    if (!listing) {
      throw new ValidationError("Listing not found");
    }

    const sellerId = listing.seller.userId;

    const conversation = await getOrCreateConversation(
      listingId,
      session.user.id!,
      sellerId
    );

    return Response.json(conversation, { status: 200 });
  } catch (error) {
    return errorResponse(error);
  }
}
