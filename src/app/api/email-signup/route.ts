import { db } from "@/lib/db";
import { CouponType } from "@prisma/client";
import { errorResponse, ValidationError } from "@/lib/errors";

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (!email || typeof email !== "string") {
      throw new ValidationError("Email is required");
    }

    const normalizedEmail = email.toLowerCase().trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(normalizedEmail)) {
      throw new ValidationError("Please enter a valid email address");
    }

    // Check if this email has already claimed the discount
    const existing = await db.emailSubscription.findUnique({
      where: { email: normalizedEmail },
    });

    if (existing) {
      return Response.json({
        alreadyRegistered: true,
        message: "This email has already claimed the welcome discount.",
      });
    }

    // Also check if this email is a registered user who already has a signup coupon
    const user = await db.user.findUnique({ where: { email: normalizedEmail } });
    if (user) {
      return Response.json({
        alreadyRegistered: true,
        message: "You already have an account — sign in to see your offers.",
      });
    }

    // Generate a unique coupon code
    const randomHex = Array.from(crypto.getRandomValues(new Uint8Array(4)))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("")
      .toUpperCase();
    const code = `WELCOME-${randomHex}`;

    const startsAt = new Date();
    const endsAt = new Date();
    endsAt.setDate(endsAt.getDate() + 30);

    // Create coupon + record email signup in a transaction
    await db.$transaction([
      db.coupon.create({
        data: {
          code,
          type: CouponType.PERCENTAGE,
          value: 5,
          usageLimit: 1,
          startsAt,
          endsAt,
          isActive: true,
        },
      }),
      db.emailSubscription.create({
        data: {
          email: normalizedEmail,
          couponCode: code,
          source: "popup",
        },
      }),
    ]);

    return Response.json({
      success: true,
      couponCode: code,
      message: "5% off your first purchase!",
    });
  } catch (error) {
    return errorResponse(error);
  }
}
