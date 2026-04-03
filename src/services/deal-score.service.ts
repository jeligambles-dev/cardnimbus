import { CardCondition } from "@prisma/client";
import { db } from "@/lib/db";

export type DealScoreBand = "FIRE" | "GREAT" | "GOOD" | null;

export interface DealScoreResult {
  dealScore: number;
  dealScoreBand: DealScoreBand;
  marketPrice: number;
  condition: CardCondition | null;
}

const STALE_THRESHOLD_DAYS = 7;

export function getConditionPrice(
  card: {
    tcgPriceNM?: number | null;
    tcgPriceLP?: number | null;
    tcgPriceMP?: number | null;
    tcgPriceHP?: number | null;
  },
  condition: CardCondition | null | undefined
): number | null {
  switch (condition) {
    case CardCondition.NM:
      return card.tcgPriceNM ?? null;
    case CardCondition.LP:
      return card.tcgPriceLP ?? null;
    case CardCondition.MP:
      return card.tcgPriceMP ?? null;
    case CardCondition.HP:
      return card.tcgPriceHP ?? null;
    default:
      return card.tcgPriceNM ?? null;
  }
}

export function calculateDealScore(
  listingPrice: number,
  marketPrice: number,
  staleThresholdDays = STALE_THRESHOLD_DAYS,
  priceUpdatedAt?: Date | null
): DealScoreResult {
  const condition = null as CardCondition | null;

  // No score if market price is invalid
  if (!marketPrice || marketPrice <= 0) {
    return { dealScore: 0, dealScoreBand: null, marketPrice, condition };
  }

  // Suppress badge for stale prices
  if (priceUpdatedAt) {
    const daysSinceUpdate =
      (Date.now() - new Date(priceUpdatedAt).getTime()) /
      (1000 * 60 * 60 * 24);
    if (daysSinceUpdate > staleThresholdDays) {
      return { dealScore: 0, dealScoreBand: null, marketPrice, condition };
    }
  }

  // Clamp raw score to 0 if listing is above market
  const rawScore = ((marketPrice - listingPrice) / marketPrice) * 100;
  const dealScore = Math.max(0, rawScore);

  let dealScoreBand: DealScoreBand = null;
  if (dealScore >= 30) dealScoreBand = "FIRE";
  else if (dealScore >= 20) dealScoreBand = "GREAT";
  else if (dealScore >= 10) dealScoreBand = "GOOD";

  return { dealScore, dealScoreBand, marketPrice, condition };
}

export interface DealProduct {
  id: string;
  name: string;
  slug: string;
  price: number;
  condition: CardCondition | null;
  images: string[];
  card: {
    id: string;
    name: string;
    setName: string;
    tcgPriceNM: number | null;
    tcgPriceLP: number | null;
    tcgPriceMP: number | null;
    tcgPriceHP: number | null;
    tcgPriceMarket: number | null;
    tcgPriceUpdatedAt: Date | null;
  } | null;
  dealScore: number;
  dealScoreBand: DealScoreBand;
  marketPrice: number;
}

export async function getDeals(page = 1, limit = 20) {
  const products = await db.product.findMany({
    where: { isActive: true, cardId: { not: null } },
    include: {
      card: {
        select: {
          id: true,
          name: true,
          setName: true,
          tcgPriceNM: true,
          tcgPriceLP: true,
          tcgPriceMP: true,
          tcgPriceHP: true,
          tcgPriceMarket: true,
          tcgPriceUpdatedAt: true,
        },
      },
    },
  });

  const scored: DealProduct[] = [];

  for (const product of products) {
    if (!product.card) continue;

    const conditionPrice = getConditionPrice(product.card, product.condition);
    const marketPrice =
      conditionPrice ?? product.card.tcgPriceMarket ?? null;

    if (marketPrice === null) continue;

    const { dealScore, dealScoreBand } = calculateDealScore(
      product.price,
      marketPrice,
      STALE_THRESHOLD_DAYS,
      product.card.tcgPriceUpdatedAt
    );

    if (dealScoreBand === null) continue;

    scored.push({
      id: product.id,
      name: product.name,
      slug: product.slug,
      price: product.price,
      condition: product.condition,
      images: product.images,
      card: product.card,
      dealScore,
      dealScoreBand,
      marketPrice,
    });
  }

  // Sort by dealScore descending
  scored.sort((a, b) => b.dealScore - a.dealScore);

  const total = scored.length;
  const skip = (page - 1) * limit;
  const items = scored.slice(skip, skip + limit);

  return {
    deals: items,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}
