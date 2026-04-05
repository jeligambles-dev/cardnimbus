import { db } from "@/lib/db";
import { ReviewType, OrderStatus } from "@prisma/client";
import { NotFoundError, ValidationError, ForbiddenError } from "@/lib/errors";

export async function createReview(
  orderId: string,
  reviewerId: string,
  revieweeId: string,
  rating: number,
  comment: string | undefined,
  type: ReviewType
) {
  // Validate rating
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    throw new ValidationError("Rating must be an integer between 1 and 5");
  }

  // Validate order exists and is DELIVERED
  const order = await db.order.findUnique({
    where: { id: orderId },
    include: {
      items: { select: { sellerId: true } },
    },
  });

  if (!order) throw new NotFoundError("Order");
  if (order.status !== OrderStatus.DELIVERED) {
    throw new ValidationError("Reviews can only be submitted for delivered orders");
  }

  // Determine seller id from order items
  const sellerIds = [...new Set(order.items.map((i) => i.sellerId).filter(Boolean))] as string[];

  const isBuyer = order.buyerId === reviewerId;
  const isSeller = sellerIds.includes(reviewerId);

  if (!isBuyer && !isSeller) {
    throw new ForbiddenError("Reviewer is not a participant in this order");
  }

  // Validate type matches reviewer role
  if (type === ReviewType.BUYER_TO_SELLER && !isBuyer) {
    throw new ForbiddenError("Only the buyer can leave a BUYER_TO_SELLER review");
  }
  if (type === ReviewType.SELLER_TO_BUYER && !isSeller) {
    throw new ForbiddenError("Only the seller can leave a SELLER_TO_BUYER review");
  }

  // Check unique constraint (orderId + type) — handled by DB but give friendly error
  const existing = await db.review.findUnique({
    where: { orderId_type: { orderId, type } },
  });
  if (existing) {
    throw new ValidationError("A review of this type already exists for this order");
  }

  const review = await db.review.create({
    data: {
      orderId,
      reviewerId,
      revieweeId,
      rating,
      comment,
      type,
    },
  });

  if (type === ReviewType.BUYER_TO_SELLER) {
    await updateSellerRating(revieweeId);
  }

  return review;
}

export async function getReviewsForUser(
  userId: string,
  page: number = 1,
  limit: number = 20
) {
  const skip = (page - 1) * limit;

  const [reviews, total] = await Promise.all([
    db.review.findMany({
      where: { revieweeId: userId, isVisible: true },
      include: {
        reviewer: { select: { id: true, name: true, avatar: true } },
        order: {
          include: {
            items: {
              select: {
                titleSnapshot: true,
                imageSnapshot: true,
                conditionSnapshot: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
    db.review.count({
      where: { revieweeId: userId, isVisible: true },
    }),
  ]);

  return {
    reviews,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}

export async function getReviewsByUser(
  userId: string,
  page: number = 1,
  limit: number = 20
) {
  const skip = (page - 1) * limit;

  const [reviews, total] = await Promise.all([
    db.review.findMany({
      where: { reviewerId: userId },
      include: {
        reviewee: { select: { id: true, name: true, avatar: true } },
        order: { select: { id: true, orderNumber: true } },
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
    db.review.count({
      where: { reviewerId: userId },
    }),
  ]);

  return {
    reviews,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}

export async function updateSellerRating(userId: string) {
  const sellerProfile = await db.sellerProfile.findUnique({
    where: { userId },
  });

  if (!sellerProfile) return;

  const result = await db.review.aggregate({
    where: {
      revieweeId: userId,
      type: ReviewType.BUYER_TO_SELLER,
      isVisible: true,
    },
    _avg: { rating: true },
    _count: { rating: true },
  });

  const rating = result._avg.rating ?? null;
  const ratingCount = result._count.rating;

  await db.sellerProfile.update({
    where: { userId },
    data: { rating, ratingCount },
  });
}
