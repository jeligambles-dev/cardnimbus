import { db } from '@/lib/db'

export interface TopSeller {
  rank: number
  sellerId: string
  userId: string
  name: string | null
  avatar: string | null
  totalSales: number
  rating: number | null
  ratingCount: number
}

export interface TopRated {
  rank: number
  sellerId: string
  userId: string
  name: string | null
  avatar: string | null
  rating: number
  ratingCount: number
  totalSales: number
}

export interface BestPull {
  rank: number
  pullId: string
  userId: string
  name: string | null
  avatar: string | null
  revealedItemName: string
  revealedItemImage: string | null
  revealedItemValue: number
  pulledAt: Date
}

export interface RaffleWinner {
  rank: number
  raffleId: string
  title: string
  prizeValue: number
  winnerId: string
  winnerName: string | null
  winnerAvatar: string | null
  drawnAt: Date | null
}

export async function getTopSellers(limit = 10): Promise<TopSeller[]> {
  const sellers = await db.sellerProfile.findMany({
    where: { totalSales: { gt: 0 } },
    orderBy: { totalSales: 'desc' },
    take: limit,
    include: {
      user: { select: { id: true, name: true, avatar: true } },
    },
  })

  return sellers.map((s, i) => ({
    rank: i + 1,
    sellerId: s.id,
    userId: s.userId,
    name: s.user.name,
    avatar: s.user.avatar,
    totalSales: s.totalSales,
    rating: s.rating,
    ratingCount: s.ratingCount,
  }))
}

export async function getTopRated(limit = 10): Promise<TopRated[]> {
  const sellers = await db.sellerProfile.findMany({
    where: { ratingCount: { gte: 10 }, rating: { not: null } },
    orderBy: { rating: 'desc' },
    take: limit,
    include: {
      user: { select: { id: true, name: true, avatar: true } },
    },
  })

  return sellers.map((s, i) => ({
    rank: i + 1,
    sellerId: s.id,
    userId: s.userId,
    name: s.user.name,
    avatar: s.user.avatar,
    rating: s.rating!,
    ratingCount: s.ratingCount,
    totalSales: s.totalSales,
  }))
}

export async function getBestPulls(limit = 10): Promise<BestPull[]> {
  const pulls = await db.mysteryPull.findMany({
    orderBy: { revealedItemValue: 'desc' },
    take: limit,
    include: {
      user: { select: { id: true, name: true, avatar: true } },
    },
  })

  return pulls.map((p, i) => ({
    rank: i + 1,
    pullId: p.id,
    userId: p.userId,
    name: p.user.name,
    avatar: p.user.avatar,
    revealedItemName: p.revealedItemName,
    revealedItemImage: p.revealedItemImage,
    revealedItemValue: p.revealedItemValue,
    pulledAt: p.pulledAt,
  }))
}

export async function getRaffleWinners(limit = 10): Promise<RaffleWinner[]> {
  const raffles = await db.raffle.findMany({
    where: { status: 'COMPLETED', winnerId: { not: null } },
    orderBy: { drawnAt: 'desc' },
    take: limit,
    include: {
      winner: { select: { id: true, name: true, avatar: true } },
    },
  })

  return raffles.map((r, i) => ({
    rank: i + 1,
    raffleId: r.id,
    title: r.title,
    prizeValue: r.prizeValue,
    winnerId: r.winnerId!,
    winnerName: r.winner?.name ?? null,
    winnerAvatar: r.winner?.avatar ?? null,
    drawnAt: r.drawnAt,
  }))
}
