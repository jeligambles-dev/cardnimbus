import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { errorResponse, NotFoundError, UnauthorizedError } from "@/lib/errors";
import { sendPasswordReset } from "@/lib/email";
import crypto from "crypto";

async function requireAdmin() {
  const session = await auth();
  if (!session?.user) throw new UnauthorizedError();
  if ((session.user as { role?: string }).role !== "ADMIN") {
    throw new UnauthorizedError("Forbidden");
  }
  return session;
}

function baseUrl(): string {
  return (
    process.env.NEXT_PUBLIC_APP_URL ??
    process.env.NEXTAUTH_URL ??
    "http://localhost:3000"
  );
}

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
    const { id } = await params;

    const user = await db.user.findUnique({
      where: { id },
      select: { id: true, email: true, name: true },
    });
    if (!user) throw new NotFoundError("User");

    // Invalidate any existing unused tokens for this user
    await db.passwordResetToken.updateMany({
      where: { userId: user.id, usedAt: null },
      data: { usedAt: new Date() },
    });

    // Generate secure token (opaque; stored as-is for lookup)
    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await db.passwordResetToken.create({
      data: { userId: user.id, token, expiresAt },
    });

    const resetUrl = `${baseUrl()}/reset-password?token=${token}`;

    await sendPasswordReset(user.email, { resetUrl }).catch((err) => {
      console.error("[admin reset-password] sendPasswordReset failed:", err);
    });

    return Response.json({ success: true, email: user.email });
  } catch (error) {
    return errorResponse(error);
  }
}
