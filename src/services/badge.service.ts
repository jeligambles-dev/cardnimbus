import { db } from "@/lib/db";
import { BadgeVisibility, DisputeStatus, Prisma } from "@prisma/client";

// ─── Helpers ─────────────────────────────────────────────────────────────────

function median(values: number[]): number {
  if (values.length === 0) return Infinity;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 !== 0
    ? sorted[mid]
    : (sorted[mid - 1] + sorted[mid]) / 2;
}

// ─── Read ─────────────────────────────────────────────────────────────────────

export async function getUserBadges(userId: string) {
  return db.userBadge.findMany({
    where: {
      userId,
      isRevoked: false,
      badge: { visibility: BadgeVisibility.PUBLIC, isActive: true },
    },
    include: { badge: true },
    orderBy: { badge: { displayPriority: "asc" } },
  });
}

export async function getTopBadgesForDisplay(userId: string, limit = 2) {
  return db.userBadge.findMany({
    where: {
      userId,
      isRevoked: false,
      badge: { visibility: BadgeVisibility.PUBLIC, isActive: true },
    },
    include: { badge: true },
    orderBy: { badge: { displayPriority: "asc" } },
    take: limit,
  });
}

// ─── Award / Revoke ───────────────────────────────────────────────────────────

export async function awardBadge(
  userId: string,
  badgeSlug: string,
  context?: Prisma.InputJsonValue
) {
  const badge = await db.badge.findUnique({ where: { slug: badgeSlug } });
  if (!badge) throw new Error(`Badge not found: ${badgeSlug}`);

  const existing = await db.userBadge.findUnique({
    where: { userId_badgeId: { userId, badgeId: badge.id } },
  });

  if (existing) {
    if (existing.isRevoked) {
      // Re-award a previously revoked badge
      const updated = await db.userBadge.update({
        where: { id: existing.id },
        data: {
          isRevoked: false,
          revokedAt: null,
          revokedReason: null,
          awardedAt: new Date(),
          awardedContext: context
            ? (context as Prisma.InputJsonValue)
            : Prisma.JsonNull,
          lastEvaluatedAt: new Date(),
        },
        include: { badge: true },
      });
      console.log(`[badge] Re-awarded ${badgeSlug} to user ${userId}`);
      return updated;
    }
    // Already active — just update evaluation timestamp
    return db.userBadge.update({
      where: { id: existing.id },
      data: { lastEvaluatedAt: new Date() },
      include: { badge: true },
    });
  }

  const record = await db.userBadge.create({
    data: {
      userId,
      badgeId: badge.id,
      awardedContext: context
        ? (context as Prisma.InputJsonValue)
        : Prisma.JsonNull,
      lastEvaluatedAt: new Date(),
    },
    include: { badge: true },
  });
  console.log(`[badge] Awarded ${badgeSlug} to user ${userId}`);
  return record;
}

export async function revokeBadge(
  userId: string,
  badgeSlug: string,
  reason: string
) {
  const badge = await db.badge.findUnique({ where: { slug: badgeSlug } });
  if (!badge) throw new Error(`Badge not found: ${badgeSlug}`);

  const existing = await db.userBadge.findUnique({
    where: { userId_badgeId: { userId, badgeId: badge.id } },
  });

  if (!existing || existing.isRevoked) return null;

  const updated = await db.userBadge.update({
    where: { id: existing.id },
    data: {
      isRevoked: true,
      revokedAt: new Date(),
      revokedReason: reason,
      lastEvaluatedAt: new Date(),
    },
  });
  console.log(`[badge] Revoked ${badgeSlug} from user ${userId}: ${reason}`);
  return updated;
}

// ─── Individual Criteria Checks ───────────────────────────────────────────────

async function checkFastShipper(userId: string): Promise<boolean> {
  // Find the seller profile for this user
  const sellerProfile = await db.sellerProfile.findUnique({ where: { userId } });
  if (!sellerProfile) return false;

  // Get last 20 orders that were shipped for this seller
  const orders = await db.order.findMany({
    where: {
      items: { some: { sellerId: sellerProfile.id } },
      status: { in: ["SHIPPED", "DELIVERED"] },
    },
    include: { shipments: { where: { shippedAt: { not: null } } } },
    orderBy: { createdAt: "desc" },
    take: 20,
  });

  if (orders.length < 5) return false;

  const shipTimes: number[] = [];
  for (const order of orders) {
    const shipment = order.shipments[0];
    if (shipment?.shippedAt) {
      const diffHours =
        (shipment.shippedAt.getTime() - order.createdAt.getTime()) / 3_600_000;
      shipTimes.push(diffHours);
    }
  }

  if (shipTimes.length < 5) return false;
  return median(shipTimes) < 24;
}

async function checkTopRated(userId: string): Promise<boolean> {
  const sellerProfile = await db.sellerProfile.findUnique({ where: { userId } });
  if (!sellerProfile) return false;
  return (
    sellerProfile.rating !== null &&
    sellerProfile.rating >= 4.8 &&
    sellerProfile.ratingCount >= 20
  );
}

async function checkQuickResponder(userId: string): Promise<boolean> {
  // Get last 30 conversations where user is seller
  const conversations = await db.conversation.findMany({
    where: { sellerId: userId },
    include: {
      messages: {
        orderBy: { createdAt: "asc" },
        take: 5,
      },
    },
    orderBy: { createdAt: "desc" },
    take: 30,
  });

  if (conversations.length < 5) return false;

  const responseTimes: number[] = [];
  for (const conv of conversations) {
    const messages = conv.messages;
    const firstBuyerMsg = messages.find((m) => m.senderId !== userId);
    const firstSellerMsg = messages.find(
      (m) => m.senderId === userId && firstBuyerMsg && m.createdAt > firstBuyerMsg.createdAt
    );
    if (firstBuyerMsg && firstSellerMsg) {
      const diffHours =
        (firstSellerMsg.createdAt.getTime() - firstBuyerMsg.createdAt.getTime()) /
        3_600_000;
      responseTimes.push(diffHours);
    }
  }

  if (responseTimes.length < 5) return false;
  return median(responseTimes) < 1;
}

async function checkReliableBuyer(userId: string): Promise<boolean> {
  // Check 0 disputes where user is "seller-side loser" (resolved for buyer)
  const sellerProfile = await db.sellerProfile.findUnique({ where: { userId } });
  if (!sellerProfile) return false;

  const lostDisputes = await db.dispute.count({
    where: {
      order: { items: { some: { sellerId: sellerProfile.id } } },
      status: DisputeStatus.RESOLVED_BUYER,
    },
  });

  if (lostDisputes > 0) return false;

  // 10+ completed purchases
  const completedPurchases = await db.order.count({
    where: { buyerId: userId, status: "DELIVERED" },
  });

  return completedPurchases >= 10;
}

async function checkMilestone(
  userId: string,
  slug: string
): Promise<boolean> {
  const sellerProfile = await db.sellerProfile.findUnique({ where: { userId } });

  switch (slug) {
    case "first-sale":
      return (sellerProfile?.totalSales ?? 0) >= 1;
    case "10-sales":
      return (sellerProfile?.totalSales ?? 0) >= 10;
    case "50-sales":
      return (sellerProfile?.totalSales ?? 0) >= 50;
    case "100-sales":
      return (sellerProfile?.totalSales ?? 0) >= 100;
    case "500-sales":
      return (sellerProfile?.totalSales ?? 0) >= 500;
    case "first-purchase": {
      const purchaseCount = await db.order.count({
        where: { buyerId: userId, status: { in: ["DELIVERED", "PAID", "SHIPPED"] } },
      });
      return purchaseCount >= 1;
    }
    case "raffle-winner": {
      const wins = await db.raffle.count({ where: { winnerId: userId } });
      return wins >= 1;
    }
    case "lucky-pull": {
      // Mystery ultra-rare pulls — tierRolled === "ULTRA_RARE" or similar
      const ultraRarePulls = await db.mysteryPull.count({
        where: {
          userId,
          tierRolled: { in: ["ULTRA_RARE", "ultra_rare", "ultra-rare"] },
        },
      });
      return ultraRarePulls >= 1;
    }
    default:
      return false;
  }
}

// ─── Main Evaluation ──────────────────────────────────────────────────────────

const DYNAMIC_BADGE_CHECKS: Array<{
  slug: string;
  check: (userId: string) => Promise<boolean>;
}> = [
  { slug: "fast-shipper", check: checkFastShipper },
  { slug: "top-rated", check: checkTopRated },
  { slug: "quick-responder", check: checkQuickResponder },
  { slug: "reliable-buyer", check: checkReliableBuyer },
];

const PERMANENT_MILESTONE_SLUGS = [
  "first-sale",
  "10-sales",
  "50-sales",
  "100-sales",
  "500-sales",
  "first-purchase",
  "raffle-winner",
  "lucky-pull",
];

export async function evaluateBadgesForUser(userId: string) {
  const autoAwardedBadges = await db.badge.findMany({
    where: { isAutoAwarded: true, isActive: true },
  });

  const badgeMap = new Map(autoAwardedBadges.map((b) => [b.slug, b]));

  // Evaluate DYNAMIC badges
  for (const { slug, check } of DYNAMIC_BADGE_CHECKS) {
    const badge = badgeMap.get(slug);
    if (!badge) continue;

    try {
      const met = await check(userId);
      if (met) {
        await awardBadge(userId, slug);
      } else {
        // DYNAMIC: revoke if criteria no longer met
        await revokeBadge(userId, slug, "Criteria no longer met");
      }
    } catch (err) {
      console.error(`[badge] Error evaluating ${slug} for ${userId}:`, err);
    }
  }

  // Evaluate PERMANENT milestone badges (award once, never revoke)
  for (const slug of PERMANENT_MILESTONE_SLUGS) {
    const badge = badgeMap.get(slug);
    if (!badge) continue;

    try {
      const existing = await db.userBadge.findUnique({
        where: { userId_badgeId: { userId, badgeId: badge.id } },
      });

      // Skip if already awarded (PERMANENT: never re-evaluate after awarding)
      if (existing && !existing.isRevoked) {
        await db.userBadge.update({
          where: { id: existing.id },
          data: { lastEvaluatedAt: new Date() },
        });
        continue;
      }

      const met = await checkMilestone(userId, slug);
      if (met) {
        await awardBadge(userId, slug);
      } else if (existing) {
        await db.userBadge.update({
          where: { id: existing.id },
          data: { lastEvaluatedAt: new Date() },
        });
      }
    } catch (err) {
      console.error(`[badge] Error evaluating milestone ${slug} for ${userId}:`, err);
    }
  }
}

export async function evaluateAllDynamicBadges() {
  // Get all active sellers
  const sellers = await db.sellerProfile.findMany({
    where: { user: { role: "SELLER" } },
    select: { userId: true },
  });

  for (const { userId } of sellers) {
    try {
      await evaluateBadgesForUser(userId);
    } catch (err) {
      console.error(`[badge] Error evaluating badges for user ${userId}:`, err);
    }
  }
}
