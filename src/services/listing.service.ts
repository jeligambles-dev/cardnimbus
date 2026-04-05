import { db } from "@/lib/db";
import {
  CardCondition,
  ListingModerationStatus,
  ListingSaleStatus,
  ProductCategory,
} from "@prisma/client";
import { NotFoundError, ForbiddenError, ValidationError } from "@/lib/errors";
import {
  calculateDealScore,
  getConditionPrice,
} from "@/services/deal-score.service";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface CreateListingInput {
  cardId?: string;
  title: string;
  description?: string;
  images?: string[];
  price: number;
  condition?: CardCondition;
  category: ProductCategory;
  shipsToCountries?: string[];
  grade?: number;
  gradingCompany?: string;
}

export interface UpdateListingInput {
  title?: string;
  description?: string;
  images?: string[];
  price?: number;
  condition?: CardCondition;
  category?: ProductCategory;
}

export interface ListingFilters {
  category?: ProductCategory;
  condition?: CardCondition;
  minPrice?: number;
  maxPrice?: number;
  sellerId?: string;
  minGrade?: number;
  gradingCompany?: string;
}

// ─── Create ───────────────────────────────────────────────────────────────────

export async function createListing(
  sellerId: string,
  input: CreateListingInput
) {
  let suggestedPrice: number | undefined;
  let dealScore: number | undefined;
  let dealScoreBand: string | undefined;

  if (input.cardId) {
    const card = await db.card.findUnique({ where: { id: input.cardId } });
    if (!card) throw new NotFoundError("Card");

    const conditionPrice = getConditionPrice(card, input.condition ?? null);
    const marketPrice = conditionPrice ?? card.tcgPriceMarket ?? null;

    if (marketPrice !== null) {
      suggestedPrice = marketPrice;
      const result = calculateDealScore(
        input.price,
        marketPrice,
        7,
        card.tcgPriceUpdatedAt
      );
      dealScore = result.dealScore;
      dealScoreBand = result.dealScoreBand ?? undefined;
    }
  }

  return db.listing.create({
    data: {
      sellerId,
      cardId: input.cardId,
      title: input.title,
      description: input.description,
      images: input.images ?? [],
      price: input.price,
      suggestedPrice,
      dealScore,
      dealScoreBand,
      condition: input.condition,
      category: input.category,
      grade: input.grade,
      gradingCompany: input.gradingCompany,
      shipsToCountries: input.shipsToCountries ?? [],
      moderationStatus: ListingModerationStatus.DRAFT,
      saleStatus: ListingSaleStatus.INACTIVE,
    },
    include: { seller: { include: { user: true } }, card: true },
  });
}

// ─── Read ─────────────────────────────────────────────────────────────────────

export async function getListingById(id: string) {
  const listing = await db.listing.findUnique({
    where: { id },
    include: { seller: { include: { user: true } }, card: true },
  });
  if (!listing) throw new NotFoundError("Listing");

  // Increment view count (fire-and-forget)
  db.listing.update({ where: { id }, data: { viewCount: { increment: 1 } } }).catch(() => {});

  return listing;
}

export async function getListings(
  filters: ListingFilters,
  page = 1,
  limit = 20
) {
  const where = {
    moderationStatus: ListingModerationStatus.APPROVED,
    saleStatus: ListingSaleStatus.ACTIVE,
    ...(filters.category && { category: filters.category }),
    ...(filters.condition && { condition: filters.condition }),
    ...(filters.sellerId && { sellerId: filters.sellerId }),
    ...(filters.minGrade !== undefined && { grade: { gte: filters.minGrade } }),
    ...(filters.gradingCompany && { gradingCompany: filters.gradingCompany }),
    ...(filters.minPrice !== undefined || filters.maxPrice !== undefined
      ? {
          price: {
            ...(filters.minPrice !== undefined && { gte: filters.minPrice }),
            ...(filters.maxPrice !== undefined && { lte: filters.maxPrice }),
          },
        }
      : {}),
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

  return {
    items,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}

export async function getSellerListings(
  sellerId: string,
  page = 1,
  limit = 20
) {
  const where = { sellerId };

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

  return {
    items,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}

// ─── Update ───────────────────────────────────────────────────────────────────

export async function updateListing(
  id: string,
  sellerId: string,
  data: UpdateListingInput
) {
  const listing = await db.listing.findUnique({ where: { id } });
  if (!listing) throw new NotFoundError("Listing");
  if (listing.sellerId !== sellerId) throw new ForbiddenError();

  return db.listing.update({
    where: { id },
    data: {
      ...(data.title !== undefined && { title: data.title }),
      ...(data.description !== undefined && { description: data.description }),
      ...(data.images !== undefined && { images: data.images }),
      ...(data.price !== undefined && { price: data.price }),
      ...(data.condition !== undefined && { condition: data.condition }),
      ...(data.category !== undefined && { category: data.category }),
    },
    include: { seller: { include: { user: true } }, card: true },
  });
}

// ─── Moderation transitions ───────────────────────────────────────────────────

export async function submitForReview(id: string, sellerId: string) {
  const listing = await db.listing.findUnique({ where: { id } });
  if (!listing) throw new NotFoundError("Listing");
  if (listing.sellerId !== sellerId) throw new ForbiddenError();
  if (listing.moderationStatus !== ListingModerationStatus.DRAFT) {
    throw new ValidationError("Only DRAFT listings can be submitted for review");
  }

  return db.listing.update({
    where: { id },
    data: { moderationStatus: ListingModerationStatus.PENDING_REVIEW },
    include: { seller: { include: { user: true } }, card: true },
  });
}

export async function approveListing(id: string, _adminId: string) {
  const listing = await db.listing.findUnique({ where: { id } });
  if (!listing) throw new NotFoundError("Listing");
  if (listing.moderationStatus !== ListingModerationStatus.PENDING_REVIEW) {
    throw new ValidationError("Only PENDING_REVIEW listings can be approved");
  }

  return db.listing.update({
    where: { id },
    data: {
      moderationStatus: ListingModerationStatus.APPROVED,
      saleStatus: ListingSaleStatus.ACTIVE,
      moderationNote: null,
    },
    include: { seller: { include: { user: true } }, card: true },
  });
}

export async function rejectListing(
  id: string,
  _adminId: string,
  reason: string
) {
  const listing = await db.listing.findUnique({ where: { id } });
  if (!listing) throw new NotFoundError("Listing");
  if (listing.moderationStatus !== ListingModerationStatus.PENDING_REVIEW) {
    throw new ValidationError("Only PENDING_REVIEW listings can be rejected");
  }

  return db.listing.update({
    where: { id },
    data: {
      moderationStatus: ListingModerationStatus.REJECTED,
      moderationNote: reason,
    },
    include: { seller: { include: { user: true } }, card: true },
  });
}

export async function suspendListing(
  id: string,
  _adminId: string,
  reason: string
) {
  const listing = await db.listing.findUnique({ where: { id } });
  if (!listing) throw new NotFoundError("Listing");

  return db.listing.update({
    where: { id },
    data: {
      moderationStatus: ListingModerationStatus.SUSPENDED,
      moderationNote: reason,
    },
    include: { seller: { include: { user: true } }, card: true },
  });
}

export async function markSold(id: string) {
  const listing = await db.listing.findUnique({ where: { id } });
  if (!listing) throw new NotFoundError("Listing");

  return db.listing.update({
    where: { id },
    data: { saleStatus: ListingSaleStatus.SOLD },
    include: { seller: { include: { user: true } }, card: true },
  });
}
