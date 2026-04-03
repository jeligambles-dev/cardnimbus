import { db } from "@/lib/db";
import { CouponType } from "@prisma/client";

interface ValidateCouponResult {
  valid: boolean;
  discount: number;
  error?: string;
  couponId?: string;
}

export async function validateCoupon(
  code: string,
  userId: string,
  orderTotal: number
): Promise<ValidateCouponResult> {
  const coupon = await db.coupon.findUnique({
    where: { code },
    include: {
      redemptions: {
        where: { userId },
      },
    },
  });

  if (!coupon || !coupon.isActive) {
    return { valid: false, discount: 0, error: "Coupon not found or inactive" };
  }

  const now = new Date();

  if (now < coupon.startsAt) {
    return { valid: false, discount: 0, error: "Coupon is not yet valid" };
  }

  if (coupon.endsAt && now > coupon.endsAt) {
    return { valid: false, discount: 0, error: "Coupon has expired" };
  }

  if (coupon.usageLimit !== null && coupon.usageCount >= coupon.usageLimit) {
    return { valid: false, discount: 0, error: "Coupon usage limit reached" };
  }

  if (coupon.minOrder !== null && orderTotal < coupon.minOrder) {
    return {
      valid: false,
      discount: 0,
      error: `Minimum order amount of ${coupon.minOrder} required`,
    };
  }

  if (coupon.redemptions.length > 0) {
    return {
      valid: false,
      discount: 0,
      error: "Coupon already redeemed by this user",
    };
  }

  let discount: number;
  if (coupon.type === CouponType.PERCENTAGE) {
    discount = orderTotal * (coupon.value / 100);
  } else {
    discount = Math.min(coupon.value, orderTotal);
  }

  discount = Math.round(discount * 100) / 100;

  return { valid: true, discount, couponId: coupon.id };
}

export async function redeemCoupon(
  couponId: string,
  userId: string,
  orderId?: string
): Promise<void> {
  await db.$transaction([
    db.couponRedemption.create({
      data: { couponId, userId, orderId },
    }),
    db.coupon.update({
      where: { id: couponId },
      data: { usageCount: { increment: 1 } },
    }),
  ]);
}

export async function createSignupCoupon(userId: string) {
  const randomHex = Array.from(crypto.getRandomValues(new Uint8Array(4)))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("")
    .toUpperCase();

  const code = `WELCOME-${randomHex}`;

  const startsAt = new Date();
  const endsAt = new Date();
  endsAt.setDate(endsAt.getDate() + 30);

  return db.coupon.create({
    data: {
      code,
      type: CouponType.PERCENTAGE,
      value: 5,
      usageLimit: 1,
      startsAt,
      endsAt,
      isActive: true,
    },
  });
}
