import { db } from "@/lib/db";
import { errorResponse } from "@/lib/errors";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Find the seller profile and its user
    const sellerProfile = await db.sellerProfile.findUnique({
      where: { id },
      select: { userId: true },
    });
    if (!sellerProfile) {
      return Response.json({ sales: [] });
    }

    // Get the seller's most recent delivered order items with reviews
    const items = await db.orderItem.findMany({
      where: {
        sellerId: sellerProfile.userId,
        order: { status: "DELIVERED" },
      },
      include: {
        order: {
          include: {
            reviews: {
              where: { type: "BUYER_TO_SELLER", isVisible: true },
              include: {
                reviewer: { select: { name: true, avatar: true } },
              },
            },
          },
        },
      },
      orderBy: { order: { updatedAt: "desc" } },
      take: 6,
    });

    const sales = items.map((item) => {
      const review = item.order.reviews[0];
      return {
        id: item.id,
        title: item.titleSnapshot,
        image: item.imageSnapshot,
        condition: item.conditionSnapshot,
        price: item.priceAtPurchase,
        soldAt: item.order.updatedAt,
        review: review
          ? {
              rating: review.rating,
              comment: review.comment,
              createdAt: review.createdAt,
              reviewer: review.reviewer,
            }
          : null,
      };
    });

    return Response.json({ sales });
  } catch (error) {
    return errorResponse(error);
  }
}
