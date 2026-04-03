import { type NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { errorResponse, UnauthorizedError, ValidationError } from "@/lib/errors";
import {
  addToWishlist,
  getUserWishlist,
  removeFromWishlist,
} from "@/services/wishlist.service";

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) throw new UnauthorizedError();

    const searchParams = request.nextUrl.searchParams;
    const page = searchParams.has("page")
      ? parseInt(searchParams.get("page")!, 10)
      : 1;
    const limit = searchParams.has("limit")
      ? parseInt(searchParams.get("limit")!, 10)
      : 20;

    const result = await getUserWishlist(session.user.id, page, limit);
    return Response.json(result);
  } catch (error) {
    return errorResponse(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) throw new UnauthorizedError();

    const body = await request.json();
    const { productId, cardId } = body as {
      productId?: string;
      cardId?: string;
    };

    if (!productId && !cardId) {
      throw new ValidationError("Either productId or cardId is required");
    }

    const item = await addToWishlist(session.user.id, productId, cardId);
    return Response.json(item, { status: 201 });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) throw new UnauthorizedError();

    const id = request.nextUrl.searchParams.get("id");
    if (!id) throw new ValidationError("id query parameter is required");

    await removeFromWishlist(session.user.id, id);
    return new Response(null, { status: 204 });
  } catch (error) {
    return errorResponse(error);
  }
}
