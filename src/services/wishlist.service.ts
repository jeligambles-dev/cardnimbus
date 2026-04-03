import { db } from "@/lib/db";
import { NotFoundError, UnauthorizedError } from "@/lib/errors";

export async function addToWishlist(
  userId: string,
  productId?: string,
  cardId?: string
) {
  let priceAtAdd: number | undefined;

  if (productId) {
    const product = await db.product.findUnique({ where: { id: productId } });
    if (product) priceAtAdd = product.price;
  } else if (cardId) {
    const card = await db.card.findUnique({ where: { id: cardId } });
    if (card) priceAtAdd = card.tcgPriceMarket ?? card.tcgPriceNM ?? undefined;
  }

  return db.wishlist.create({
    data: {
      userId,
      productId,
      cardId,
      priceAtAdd,
    },
    include: {
      product: { include: { card: true } },
      card: true,
    },
  });
}

export async function removeFromWishlist(userId: string, wishlistId: string) {
  const item = await db.wishlist.findUnique({ where: { id: wishlistId } });
  if (!item) throw new NotFoundError("Wishlist item");
  if (item.userId !== userId)
    throw new UnauthorizedError("You do not own this wishlist item");

  return db.wishlist.delete({ where: { id: wishlistId } });
}

export async function getUserWishlist(
  userId: string,
  page = 1,
  limit = 20
) {
  const skip = (page - 1) * limit;
  const [items, total] = await Promise.all([
    db.wishlist.findMany({
      where: { userId },
      include: {
        product: { include: { card: true } },
        card: true,
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
    db.wishlist.count({ where: { userId } }),
  ]);

  return {
    items,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}

export async function isInWishlist(
  userId: string,
  productId?: string,
  cardId?: string
): Promise<boolean> {
  if (!productId && !cardId) return false;

  const item = await db.wishlist.findFirst({
    where: {
      userId,
      ...(productId ? { productId } : {}),
      ...(cardId ? { cardId } : {}),
    },
  });

  return item !== null;
}

export async function getWishlistAlerts(userId: string) {
  const items = await db.wishlist.findMany({
    where: { userId, alertOnDrop: true },
    include: {
      product: { include: { card: true } },
      card: true,
    },
  });

  return items.filter((item) => {
    if (item.priceAtAdd === null || item.priceAtAdd === undefined) return false;

    let currentPrice: number | null = null;

    if (item.product) {
      currentPrice = item.product.price;
    } else if (item.card) {
      currentPrice =
        item.card.tcgPriceMarket ?? item.card.tcgPriceNM ?? null;
    }

    if (currentPrice === null) return false;

    const dropPercent =
      ((item.priceAtAdd - currentPrice) / item.priceAtAdd) * 100;
    return dropPercent >= 10;
  });
}
