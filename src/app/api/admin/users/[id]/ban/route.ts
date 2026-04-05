import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { errorResponse, NotFoundError, UnauthorizedError, ValidationError } from "@/lib/errors";

async function requireAdmin() {
  const session = await auth();
  if (!session?.user) throw new UnauthorizedError();
  if ((session.user as { role?: string }).role !== "ADMIN") {
    throw new UnauthorizedError("Forbidden");
  }
  return session;
}

// Ban
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAdmin();
    const { id } = await params;

    if (id === session.user!.id) {
      throw new ValidationError("You cannot ban yourself");
    }

    const body = await request.json().catch(() => ({}));
    const reason = typeof body.reason === "string" ? body.reason.trim() : null;

    const user = await db.user.findUnique({
      where: { id },
      select: { id: true, role: true },
    });
    if (!user) throw new NotFoundError("User");
    if (user.role === "ADMIN") {
      throw new ValidationError("Cannot ban an admin");
    }

    await db.$transaction([
      db.user.update({
        where: { id },
        data: { bannedAt: new Date(), banReason: reason },
      }),
      // Revoke all active sessions so they're logged out immediately
      db.session.deleteMany({ where: { userId: id } }),
    ]);

    return Response.json({ success: true });
  } catch (error) {
    return errorResponse(error);
  }
}

// Unban
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
    const { id } = await params;

    await db.user.update({
      where: { id },
      data: { bannedAt: null, banReason: null },
    });

    return Response.json({ success: true });
  } catch (error) {
    return errorResponse(error);
  }
}
