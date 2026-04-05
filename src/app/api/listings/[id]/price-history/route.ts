import { db } from "@/lib/db";
import { errorResponse, NotFoundError } from "@/lib/errors";

interface Point {
  price: number;
  date: Date;
  source: "sale" | "listing" | "market";
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const listing = await db.listing.findUnique({
      where: { id },
      select: { id: true, cardId: true, title: true, category: true, price: true, updatedAt: true },
    });
    if (!listing) throw new NotFoundError("Listing");

    const points: Point[] = [];

    // 1. Past marketplace sales matching by title snapshot / cardId / title+category
    const titleMatch = {
      equals: listing.title,
      mode: "insensitive" as const,
    };
    const soldItems = await db.orderItem.findMany({
      where: {
        order: {
          status: { in: ["DELIVERED", "PAID", "SHIPPED", "PROCESSING"] },
          type: "MARKETPLACE",
        },
        OR: [
          { titleSnapshot: titleMatch },
          {
            listing: {
              title: titleMatch,
              category: listing.category,
            },
          },
          ...(listing.cardId
            ? [{ listing: { cardId: listing.cardId } }]
            : []),
        ],
      },
      select: {
        priceAtPurchase: true,
        order: { select: { updatedAt: true } },
      },
      orderBy: { order: { updatedAt: "asc" } },
      take: 120,
    });

    for (const item of soldItems) {
      points.push({
        price: item.priceAtPurchase,
        date: item.order.updatedAt,
        source: "sale",
      });
    }

    // 2. Similar listings (active or sold) matching title+category OR cardId — snapshot of market
    const similar = await db.listing.findMany({
      where: {
        id: { not: listing.id },
        category: listing.category,
        moderationStatus: "APPROVED",
        OR: [
          { title: titleMatch },
          ...(listing.cardId ? [{ cardId: listing.cardId }] : []),
        ],
      },
      select: { price: true, createdAt: true, updatedAt: true, saleStatus: true },
      orderBy: { updatedAt: "asc" },
      take: 120,
    });

    for (const l of similar) {
      // Only include if not already represented by a sold orderItem above
      points.push({
        price: l.price,
        date: l.saleStatus === "SOLD" ? l.updatedAt : l.createdAt,
        source: "listing",
      });
    }

    // 3. Card market price history (TCGPlayer) — for cards with cardId
    if (listing.cardId) {
      const marketHistory = await db.cardPriceHistory.findMany({
        where: { cardId: listing.cardId },
        select: { marketPrice: true, nmPrice: true, fetchedAt: true },
        orderBy: { fetchedAt: "asc" },
        take: 120,
      });

      for (const h of marketHistory) {
        const price = h.marketPrice ?? h.nmPrice;
        if (price !== null && price !== undefined) {
          points.push({
            price,
            date: h.fetchedAt,
            source: "market",
          });
        }
      }
    }

    // 4. Always include the current listing as the latest reference point
    points.push({
      price: listing.price,
      date: listing.updatedAt,
      source: "listing",
    });

    // Dedupe identical (date, price) pairs and sort chronologically
    const seen = new Set<string>();
    const deduped = points
      .filter((p) => {
        const key = `${p.date.getTime()}|${p.price.toFixed(2)}`;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      })
      .sort((a, b) => a.date.getTime() - b.date.getTime());

    if (deduped.length === 0) {
      return Response.json({ points: [], summary: null });
    }

    const prices = deduped.map((p) => p.price);
    const summary = {
      count: deduped.length,
      avg: Math.round((prices.reduce((s, p) => s + p, 0) / prices.length) * 100) / 100,
      min: Math.min(...prices),
      max: Math.max(...prices),
      latest: prices[prices.length - 1],
    };

    return Response.json({
      points: deduped.map((p) => ({ price: p.price, date: p.date, source: p.source })),
      summary,
    });
  } catch (error) {
    return errorResponse(error);
  }
}
