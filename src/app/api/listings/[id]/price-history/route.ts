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
      select: { cardId: true, title: true, category: true },
    });
    if (!listing) throw new NotFoundError("Listing");

    // Match sold items on:
    // - exact titleSnapshot match, OR
    // - same cardId (for SINGLEs with linked card), OR
    // - matching listing.title + category (fuzzy, case-insensitive) for sealed products
    const orConditions: Array<Record<string, unknown>> = [
      { titleSnapshot: { equals: listing.title, mode: "insensitive" } },
      {
        listing: {
          title: { equals: listing.title, mode: "insensitive" },
          category: listing.category,
        },
      },
    ];

    if (listing.cardId) {
      orConditions.push({ listing: { cardId: listing.cardId } });
    }

    const items = await db.orderItem.findMany({
      where: {
        order: {
          status: { in: ["DELIVERED", "PAID", "SHIPPED", "PROCESSING"] },
          type: "MARKETPLACE",
        },
        OR: orConditions,
      },
      select: {
        priceAtPurchase: true,
        order: {
          select: { createdAt: true, updatedAt: true },
        },
      },
      orderBy: { order: { updatedAt: "asc" } },
      take: 60,
    });

    const points = items.map((i) => ({
      price: i.priceAtPurchase,
      date: i.order.updatedAt,
    }));

    if (points.length === 0) {
      return Response.json({ points: [], summary: null });
    }

    const prices = points.map((p) => p.price);
    const summary = {
      count: points.length,
      avg: Math.round((prices.reduce((s, p) => s + p, 0) / prices.length) * 100) / 100,
      min: Math.min(...prices),
      max: Math.max(...prices),
      latest: prices[prices.length - 1],
    };

    return Response.json({ points, summary });
  } catch (error) {
    return errorResponse(error);
  }
}
