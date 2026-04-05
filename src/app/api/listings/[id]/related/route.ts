import { db } from "@/lib/db";
import { errorResponse, NotFoundError } from "@/lib/errors";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const listing = await db.listing.findUnique({
      where: { id },
      select: { id: true, sellerId: true, category: true, condition: true, price: true },
    });
    if (!listing) throw new NotFoundError("Listing");

    // More from this seller
    const fromSeller = await db.listing.findMany({
      where: {
        sellerId: listing.sellerId,
        id: { not: listing.id },
        moderationStatus: "APPROVED",
        saleStatus: "ACTIVE",
      },
      include: {
        seller: { include: { user: { select: { name: true, avatar: true } } } },
      },
      orderBy: { createdAt: "desc" },
      take: 6,
    });

    // You may also like — same category, different seller, similar price range
    const priceLow = listing.price * 0.5;
    const priceHigh = listing.price * 2;
    const similar = await db.listing.findMany({
      where: {
        id: { not: listing.id },
        sellerId: { not: listing.sellerId },
        category: listing.category,
        moderationStatus: "APPROVED",
        saleStatus: "ACTIVE",
        price: { gte: priceLow, lte: priceHigh },
      },
      include: {
        seller: { include: { user: { select: { name: true, avatar: true } } } },
      },
      orderBy: { createdAt: "desc" },
      take: 6,
    });

    return Response.json({ fromSeller, similar });
  } catch (error) {
    return errorResponse(error);
  }
}
