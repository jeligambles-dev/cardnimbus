import type { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { errorResponse, UnauthorizedError } from "@/lib/errors";
import { getUserBadges } from "@/services/badge.service";
import { db } from "@/lib/db";
import { BadgeVisibility } from "@prisma/client";

/**
 * GET /api/account/badges
 *
 * Returns the authenticated user's badges (all visibility levels)
 * plus progress toward the next unearned auto-awarded badge.
 */
export async function GET(_req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) throw new UnauthorizedError();

    const userId = (session.user as { id: string }).id;

    // All non-revoked badges (both PUBLIC and INTERNAL for own account)
    const userBadges = await db.userBadge.findMany({
      where: { userId, isRevoked: false, badge: { isActive: true } },
      include: { badge: true },
      orderBy: { badge: { displayPriority: "asc" } },
    });

    const earnedBadgeSlugs = new Set(userBadges.map((ub) => ub.badge.slug));

    // Compute progress toward next unearned auto-awarded public badges
    const sellerProfile = await db.sellerProfile.findUnique({
      where: { userId },
      select: { totalSales: true, rating: true, ratingCount: true },
    });

    const progressItems: Array<{
      badgeSlug: string;
      badgeName: string;
      badgeIcon: string | null;
      label: string;
      current: number;
      target: number;
    }> = [];

    if (sellerProfile) {
      const milestones = [
        { slug: "first-sale", name: "First Sale", target: 1 },
        { slug: "10-sales", name: "10 Sales", target: 10 },
        { slug: "50-sales", name: "50 Sales", target: 50 },
        { slug: "100-sales", name: "100 Sales", target: 100 },
        { slug: "500-sales", name: "500 Sales", target: 500 },
      ];

      for (const m of milestones) {
        if (!earnedBadgeSlugs.has(m.slug)) {
          const badge = await db.badge.findUnique({
            where: { slug: m.slug },
            select: { icon: true, name: true, visibility: true, isActive: true },
          });
          if (badge?.isActive && badge.visibility === BadgeVisibility.PUBLIC) {
            progressItems.push({
              badgeSlug: m.slug,
              badgeName: badge.name,
              badgeIcon: badge.icon ?? null,
              label: `${badge.name}: ${sellerProfile.totalSales} / ${m.target} sales`,
              current: sellerProfile.totalSales,
              target: m.target,
            });
            break; // only next unearned milestone
          }
        }
      }

      // Top Rated progress
      if (!earnedBadgeSlugs.has("top-rated")) {
        const badge = await db.badge.findUnique({
          where: { slug: "top-rated" },
          select: { icon: true, name: true, visibility: true, isActive: true },
        });
        if (badge?.isActive && badge.visibility === BadgeVisibility.PUBLIC) {
          progressItems.push({
            badgeSlug: "top-rated",
            badgeName: badge.name,
            badgeIcon: badge.icon ?? null,
            label: `Top Rated: ${sellerProfile.ratingCount} / 20 reviews needed`,
            current: sellerProfile.ratingCount,
            target: 20,
          });
        }
      }
    }

    // First Purchase progress
    if (!earnedBadgeSlugs.has("first-purchase")) {
      const badge = await db.badge.findUnique({
        where: { slug: "first-purchase" },
        select: { icon: true, name: true, visibility: true, isActive: true },
      });
      if (badge?.isActive && badge.visibility === BadgeVisibility.PUBLIC) {
        const purchaseCount = await db.order.count({
          where: {
            buyerId: userId,
            status: { in: ["DELIVERED", "PAID", "SHIPPED"] },
          },
        });
        progressItems.push({
          badgeSlug: "first-purchase",
          badgeName: badge.name,
          badgeIcon: badge.icon ?? null,
          label: `First Purchase: ${purchaseCount} / 1 orders`,
          current: purchaseCount,
          target: 1,
        });
      }
    }

    return Response.json({
      badges: userBadges.map((ub) => ({
        id: ub.id,
        awardedAt: ub.awardedAt,
        lastEvaluatedAt: ub.lastEvaluatedAt,
        badge: {
          id: ub.badge.id,
          name: ub.badge.name,
          slug: ub.badge.slug,
          description: ub.badge.description,
          icon: ub.badge.icon,
          category: ub.badge.category,
          badgeMode: ub.badge.badgeMode,
          displayPriority: ub.badge.displayPriority,
          visibility: ub.badge.visibility,
        },
      })),
      progress: progressItems,
    });
  } catch (error) {
    return errorResponse(error);
  }
}
