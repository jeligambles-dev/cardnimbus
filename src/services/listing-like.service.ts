import { db } from "@/lib/db";

export async function likeListing(userId: string, listingId: string) {
  try {
    return await db.listingLike.create({
      data: { userId, listingId },
    });
  } catch {
    return null;
  }
}

export async function unlikeListing(userId: string, listingId: string) {
  await db.listingLike.deleteMany({ where: { userId, listingId } });
}

export async function isLiked(userId: string, listingId: string) {
  const like = await db.listingLike.findFirst({
    where: { userId, listingId },
  });
  return !!like;
}

export async function getLikeCount(listingId: string) {
  return db.listingLike.count({ where: { listingId } });
}

export async function getUserLikedListings(userId: string, page = 1, limit = 24) {
  const [likes, total] = await Promise.all([
    db.listingLike.findMany({
      where: { userId },
      include: {
        listing: {
          include: {
            seller: {
              include: { user: { select: { name: true, avatar: true } } },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    db.listingLike.count({ where: { userId } }),
  ]);
  return { likes, total };
}
