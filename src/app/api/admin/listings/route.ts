import { type NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { errorResponse, UnauthorizedError } from "@/lib/errors";
import { db } from "@/lib/db";
import {
  CardCondition,
  ListingModerationStatus,
  ListingSaleStatus,
  ProductCategory,
} from "@prisma/client";

async function requireAdmin() {
  const session = await auth();
  if (!session?.user) throw new UnauthorizedError();
  if ((session.user as any).role !== "ADMIN")
    throw new UnauthorizedError("Forbidden");
  return session.user as { id: string };
}

export async function GET(request: NextRequest) {
  try {
    await requireAdmin();

    const { searchParams } = request.nextUrl;
    const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10));
    const limit = Math.min(
      100,
      Math.max(1, parseInt(searchParams.get("limit") ?? "20", 10))
    );

    const moderationParam = searchParams.get("moderationStatus");
    const saleParam = searchParams.get("saleStatus");
    const categoryParam = searchParams.get("category");
    const conditionParam = searchParams.get("condition");
    const sellerId = searchParams.get("sellerId") ?? undefined;

    const moderationStatus =
      moderationParam && moderationParam in ListingModerationStatus
        ? (moderationParam as ListingModerationStatus)
        : undefined;
    const saleStatus =
      saleParam && saleParam in ListingSaleStatus
        ? (saleParam as ListingSaleStatus)
        : undefined;
    const category =
      categoryParam && categoryParam in ProductCategory
        ? (categoryParam as ProductCategory)
        : undefined;
    const condition =
      conditionParam && conditionParam in CardCondition
        ? (conditionParam as CardCondition)
        : undefined;

    const where = {
      ...(moderationStatus && { moderationStatus }),
      ...(saleStatus && { saleStatus }),
      ...(category && { category }),
      ...(condition && { condition }),
      ...(sellerId && { sellerId }),
    };

    const [items, total] = await Promise.all([
      db.listing.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: { seller: { include: { user: true } }, card: true },
      }),
      db.listing.count({ where }),
    ]);

    return Response.json({
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    return errorResponse(error);
  }
}
