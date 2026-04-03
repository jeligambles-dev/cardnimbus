import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { errorResponse, ForbiddenError, UnauthorizedError } from '@/lib/errors'

async function requireAdmin() {
  const session = await auth()
  if (!session?.user) throw new UnauthorizedError()
  if ((session.user as { role?: string }).role !== 'ADMIN') throw new ForbiddenError()
  return session
}

export async function GET() {
  try {
    await requireAdmin()

    const now = new Date()
    const startOfDay = new Date(now)
    startOfDay.setHours(0, 0, 0, 0)
    const startOfWeek = new Date(now)
    startOfWeek.setDate(now.getDate() - now.getDay())
    startOfWeek.setHours(0, 0, 0, 0)
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)

    const PAID_STATUSES = ['PAID', 'PROCESSING', 'SHIPPED', 'DELIVERED'] as const

    const [
      revenueToday,
      revenueWeek,
      revenueMonth,
      revenueAllTime,
      storeRevenueAllTime,
      marketplaceRevenueAllTime,
      topSellersByGMV,
      trendingQueries,
      zeroResultQueries,
      notificationStats,
      openConversations,
      satisfactionAgg,
    ] = await Promise.all([
      // Revenue today
      db.order.aggregate({
        _sum: { totalAmount: true },
        where: { status: { in: [...PAID_STATUSES] }, createdAt: { gte: startOfDay } },
      }),
      // Revenue this week
      db.order.aggregate({
        _sum: { totalAmount: true },
        where: { status: { in: [...PAID_STATUSES] }, createdAt: { gte: startOfWeek } },
      }),
      // Revenue this month
      db.order.aggregate({
        _sum: { totalAmount: true },
        where: { status: { in: [...PAID_STATUSES] }, createdAt: { gte: startOfMonth } },
      }),
      // All-time revenue
      db.order.aggregate({
        _sum: { totalAmount: true },
        where: { status: { in: [...PAID_STATUSES] } },
      }),
      // Store revenue all-time
      db.order.aggregate({
        _sum: { totalAmount: true },
        where: { status: { in: [...PAID_STATUSES] }, type: 'STORE' },
      }),
      // Marketplace revenue all-time
      db.order.aggregate({
        _sum: { totalAmount: true },
        where: { status: { in: [...PAID_STATUSES] }, type: 'MARKETPLACE' },
      }),
      // Top 5 sellers by GMV (sum of their order items)
      db.orderItem.groupBy({
        by: ['sellerId'],
        _sum: { priceAtPurchase: true },
        where: {
          sellerId: { not: null },
          order: { status: { in: [...PAID_STATUSES] } },
        },
        orderBy: { _sum: { priceAtPurchase: 'desc' } },
        take: 5,
      }),
      // Top 10 trending queries (last 30 days)
      db.searchAnalytics.groupBy({
        by: ['normalizedQuery'],
        _count: { id: true },
        where: {
          createdAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
          resultCount: { gt: 0 },
        },
        orderBy: { _count: { id: 'desc' } },
        take: 10,
      }),
      // Top 10 zero-result queries
      db.searchAnalytics.groupBy({
        by: ['normalizedQuery'],
        _count: { id: true },
        where: {
          resultCount: 0,
          createdAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
        },
        orderBy: { _count: { id: 'desc' } },
        take: 10,
      }),
      // Notification delivery stats by status
      db.notificationDelivery.groupBy({
        by: ['status'],
        _count: { id: true },
      }),
      // Open support conversations
      db.supportConversation.count({
        where: { status: { in: ['OPEN', 'WAITING_ON_AGENT', 'WAITING_ON_CUSTOMER'] } },
      }),
      // Avg satisfaction rating
      db.supportConversation.aggregate({
        _avg: { satisfactionRating: true },
        where: { satisfactionRating: { not: null } },
      }),
    ])

    // Commission earned (sum of all order commissions)
    const commissionAgg = await db.order.aggregate({
      _sum: { commission: true },
      where: { status: { in: [...PAID_STATUSES] } },
    })

    // Enrich top sellers with user info
    const sellerIds = topSellersByGMV.map((s) => s.sellerId).filter(Boolean) as string[]
    const sellerProfiles = sellerIds.length
      ? await db.sellerProfile.findMany({
          where: { id: { in: sellerIds } },
          include: { user: { select: { name: true, avatar: true } } },
        })
      : []

    const sellerMap = new Map(sellerProfiles.map((p) => [p.id, p]))

    const topSellers = topSellersByGMV.map((s, i) => {
      const profile = s.sellerId ? sellerMap.get(s.sellerId) : null
      return {
        rank: i + 1,
        sellerId: s.sellerId,
        name: profile?.user?.name ?? null,
        avatar: profile?.user?.avatar ?? null,
        gmv: s._sum.priceAtPurchase ?? 0,
      }
    })

    return Response.json({
      revenue: {
        today: revenueToday._sum.totalAmount ?? 0,
        week: revenueWeek._sum.totalAmount ?? 0,
        month: revenueMonth._sum.totalAmount ?? 0,
        allTime: revenueAllTime._sum.totalAmount ?? 0,
        storeAllTime: storeRevenueAllTime._sum.totalAmount ?? 0,
        marketplaceAllTime: marketplaceRevenueAllTime._sum.totalAmount ?? 0,
      },
      gmv: {
        totalVolume: marketplaceRevenueAllTime._sum.totalAmount ?? 0,
        commissionEarned: commissionAgg._sum.commission ?? 0,
        topSellers,
      },
      search: {
        trending: trendingQueries.map((q) => ({
          query: q.normalizedQuery,
          count: q._count.id,
        })),
        zeroResults: zeroResultQueries.map((q) => ({
          query: q.normalizedQuery,
          count: q._count.id,
        })),
      },
      notifications: notificationStats.map((s) => ({
        status: s.status,
        count: s._count.id,
      })),
      support: {
        openConversations,
        avgSatisfaction: satisfactionAgg._avg.satisfactionRating ?? null,
      },
    })
  } catch (error) {
    return errorResponse(error)
  }
}
