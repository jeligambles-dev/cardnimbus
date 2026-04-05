import { db } from "@/lib/db";

export async function followSeller(userId: string, sellerProfileId: string) {
  try {
    return await db.sellerFollow.create({
      data: { followerId: userId, sellerProfileId },
    });
  } catch {
    return null;
  }
}

export async function unfollowSeller(userId: string, sellerProfileId: string) {
  await db.sellerFollow.deleteMany({
    where: { followerId: userId, sellerProfileId },
  });
}

export async function isFollowing(userId: string, sellerProfileId: string) {
  const follow = await db.sellerFollow.findFirst({
    where: { followerId: userId, sellerProfileId },
  });
  return !!follow;
}

export async function getFollowerCount(sellerProfileId: string) {
  return db.sellerFollow.count({ where: { sellerProfileId } });
}

export async function getUserFollowedSellers(userId: string, page = 1, limit = 20) {
  const [follows, total] = await Promise.all([
    db.sellerFollow.findMany({
      where: { followerId: userId },
      include: {
        sellerProfile: {
          include: {
            user: { select: { id: true, name: true, avatar: true } },
            _count: { select: { listings: { where: { moderationStatus: "APPROVED", saleStatus: "ACTIVE" } } } },
          },
        },
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    db.sellerFollow.count({ where: { followerId: userId } }),
  ]);
  return { follows, total };
}
