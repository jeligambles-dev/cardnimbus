import { db } from "@/lib/db";

/**
 * Get the top N most-viewed active listings.
 * Fallback ranking: viewCount desc, then createdAt desc.
 */
export async function getTrendingListings(limit = 3) {
  return db.listing.findMany({
    where: {
      moderationStatus: "APPROVED",
      saleStatus: "ACTIVE",
    },
    include: {
      seller: {
        include: {
          user: { select: { name: true, avatar: true } },
        },
      },
      _count: { select: { likes: true } },
    },
    orderBy: [
      { viewCount: "desc" },
      { createdAt: "desc" },
    ],
    take: limit,
  });
}
