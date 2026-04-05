import { auth } from "@/lib/auth";
import { likeListing, unlikeListing, isLiked, getLikeCount } from "@/services/listing-like.service";
import { errorResponse, UnauthorizedError } from "@/lib/errors";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await auth();
    const [count, liked] = await Promise.all([
      getLikeCount(id),
      session?.user ? isLiked(session.user.id, id) : Promise.resolve(false),
    ]);
    return Response.json({ count, liked });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) throw new UnauthorizedError();
    const { id } = await params;
    await likeListing(session.user.id, id);
    return Response.json({ liked: true });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) throw new UnauthorizedError();
    const { id } = await params;
    await unlikeListing(session.user.id, id);
    return Response.json({ liked: false });
  } catch (error) {
    return errorResponse(error);
  }
}
