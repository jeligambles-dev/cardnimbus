import { auth } from "@/lib/auth";
import { followSeller, unfollowSeller, isFollowing, getFollowerCount } from "@/services/follow.service";
import { errorResponse, UnauthorizedError } from "@/lib/errors";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await auth();
    const [count, following] = await Promise.all([
      getFollowerCount(id),
      session?.user ? isFollowing(session.user.id, id) : Promise.resolve(false),
    ]);
    return Response.json({ count, following });
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
    await followSeller(session.user.id, id);
    return Response.json({ following: true });
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
    await unfollowSeller(session.user.id, id);
    return Response.json({ following: false });
  } catch (error) {
    return errorResponse(error);
  }
}
