import type { NextRequest } from "next/server";
import { errorResponse, NotFoundError } from "@/lib/errors";
import { getUserBadges } from "@/services/badge.service";
import { db } from "@/lib/db";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params;

    const user = await db.user.findUnique({
      where: { id: userId },
      select: { id: true },
    });
    if (!user) throw new NotFoundError("User");

    const badges = await getUserBadges(userId);

    return Response.json({
      badges: badges.map((ub) => ({
        id: ub.id,
        awardedAt: ub.awardedAt,
        badge: {
          id: ub.badge.id,
          name: ub.badge.name,
          slug: ub.badge.slug,
          description: ub.badge.description,
          icon: ub.badge.icon,
          category: ub.badge.category,
          badgeMode: ub.badge.badgeMode,
          displayPriority: ub.badge.displayPriority,
        },
      })),
    });
  } catch (error) {
    return errorResponse(error);
  }
}
