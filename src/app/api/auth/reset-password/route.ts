import { type NextRequest } from "next/server";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { errorResponse, ValidationError } from "@/lib/errors";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { token, password } = body ?? {};

    if (!token || typeof token !== "string") {
      throw new ValidationError("Token is required");
    }
    if (!password || typeof password !== "string" || password.length < 7) {
      throw new ValidationError("Password must be at least 7 characters");
    }
    if (!/\d/.test(password)) {
      throw new ValidationError("Password must include a number");
    }
    if (!/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password)) {
      throw new ValidationError("Password must include a special character");
    }

    const record = await db.passwordResetToken.findUnique({
      where: { token },
    });

    if (!record) {
      throw new ValidationError("Invalid or expired reset link");
    }
    if (record.usedAt) {
      throw new ValidationError("This reset link has already been used");
    }
    if (record.expiresAt < new Date()) {
      throw new ValidationError("This reset link has expired");
    }

    const passwordHash = await bcrypt.hash(password, 12);

    await db.$transaction([
      db.user.update({
        where: { id: record.userId },
        data: { passwordHash },
      }),
      db.passwordResetToken.update({
        where: { id: record.id },
        data: { usedAt: new Date() },
      }),
    ]);

    return Response.json({ success: true });
  } catch (error) {
    return errorResponse(error);
  }
}
