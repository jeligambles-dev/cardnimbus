import { db } from "@/lib/db";
import { Prisma } from "@prisma/client";

export interface TrackSearchParams {
  userId?: string;
  query: string;
  filters?: Record<string, unknown>;
  resultCount: number;
  sessionId?: string;
}

export async function trackSearch(params: TrackSearchParams) {
  const { userId, query, filters, resultCount, sessionId } = params;

  return db.searchAnalytics.create({
    data: {
      userId: userId ?? null,
      query,
      normalizedQuery: query.toLowerCase().trim(),
      filtersJson: filters ? (filters as Prisma.InputJsonValue) : Prisma.JsonNull,
      resultCount,
      sessionId: sessionId ?? null,
    },
  });
}

export async function trackClick(
  analyticsId: string,
  entityId: string,
  entityType: string
) {
  return db.searchAnalytics.update({
    where: { id: analyticsId },
    data: {
      clickedEntityId: entityId,
      clickedEntityType: entityType,
    },
  });
}

export async function getTrendingSearches(
  hours = 24,
  limit = 10
): Promise<{ normalizedQuery: string; count: number }[]> {
  const since = new Date(Date.now() - hours * 60 * 60 * 1000);

  const results = await db.searchAnalytics.groupBy({
    by: ["normalizedQuery"],
    where: {
      resultCount: { gt: 0 },
      createdAt: { gte: since },
    },
    _count: { normalizedQuery: true },
    orderBy: { _count: { normalizedQuery: "desc" } },
    take: limit,
  });

  return results.map((r) => ({
    normalizedQuery: r.normalizedQuery,
    count: r._count.normalizedQuery,
  }));
}

export async function getZeroResultQueries(
  hours = 168,
  limit = 20
): Promise<{ normalizedQuery: string; count: number }[]> {
  const since = new Date(Date.now() - hours * 60 * 60 * 1000);

  const results = await db.searchAnalytics.groupBy({
    by: ["normalizedQuery"],
    where: {
      resultCount: 0,
      createdAt: { gte: since },
    },
    _count: { normalizedQuery: true },
    orderBy: { _count: { normalizedQuery: "desc" } },
    take: limit,
  });

  return results.map((r) => ({
    normalizedQuery: r.normalizedQuery,
    count: r._count.normalizedQuery,
  }));
}
