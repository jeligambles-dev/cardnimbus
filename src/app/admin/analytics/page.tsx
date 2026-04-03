import { db } from '@/lib/db'
import { requireAdmin } from '@/lib/auth-guard'
import { formatCurrency } from '@/lib/utils'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export const metadata = {
  title: 'Analytics — Admin',
}

const PAID_STATUSES = ['PAID', 'PROCESSING', 'SHIPPED', 'DELIVERED'] as const

async function getAnalyticsData() {
  const now = new Date()
  const startOfDay = new Date(now)
  startOfDay.setHours(0, 0, 0, 0)
  const startOfWeek = new Date(now)
  startOfWeek.setDate(now.getDate() - now.getDay())
  startOfWeek.setHours(0, 0, 0, 0)
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)

  const [
    revenueToday,
    revenueWeek,
    revenueMonth,
    revenueAllTime,
    storeRevenue,
    marketplaceRevenue,
    commissionAgg,
    topSellersByGMV,
    trendingQueries,
    zeroResultQueries,
    notificationStats,
    openConversations,
    satisfactionAgg,
  ] = await Promise.all([
    db.order.aggregate({
      _sum: { totalAmount: true },
      where: { status: { in: [...PAID_STATUSES] }, createdAt: { gte: startOfDay } },
    }),
    db.order.aggregate({
      _sum: { totalAmount: true },
      where: { status: { in: [...PAID_STATUSES] }, createdAt: { gte: startOfWeek } },
    }),
    db.order.aggregate({
      _sum: { totalAmount: true },
      where: { status: { in: [...PAID_STATUSES] }, createdAt: { gte: startOfMonth } },
    }),
    db.order.aggregate({
      _sum: { totalAmount: true },
      where: { status: { in: [...PAID_STATUSES] } },
    }),
    db.order.aggregate({
      _sum: { totalAmount: true },
      where: { status: { in: [...PAID_STATUSES] }, type: 'STORE' },
    }),
    db.order.aggregate({
      _sum: { totalAmount: true },
      where: { status: { in: [...PAID_STATUSES] }, type: 'MARKETPLACE' },
    }),
    db.order.aggregate({
      _sum: { commission: true },
      where: { status: { in: [...PAID_STATUSES] } },
    }),
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
    db.searchAnalytics.groupBy({
      by: ['normalizedQuery'],
      _count: { id: true },
      where: { createdAt: { gte: thirtyDaysAgo }, resultCount: { gt: 0 } },
      orderBy: { _count: { id: 'desc' } },
      take: 10,
    }),
    db.searchAnalytics.groupBy({
      by: ['normalizedQuery'],
      _count: { id: true },
      where: { resultCount: 0, createdAt: { gte: thirtyDaysAgo } },
      orderBy: { _count: { id: 'desc' } },
      take: 10,
    }),
    db.notificationDelivery.groupBy({
      by: ['status'],
      _count: { id: true },
    }),
    db.supportConversation.count({
      where: { status: { in: ['OPEN', 'WAITING_ON_AGENT', 'WAITING_ON_CUSTOMER'] } },
    }),
    db.supportConversation.aggregate({
      _avg: { satisfactionRating: true },
      where: { satisfactionRating: { not: null } },
    }),
  ])

  // Enrich top sellers
  const sellerIds = topSellersByGMV.map((s) => s.sellerId).filter(Boolean) as string[]
  const profiles = sellerIds.length
    ? await db.sellerProfile.findMany({
        where: { id: { in: sellerIds } },
        include: { user: { select: { name: true } } },
      })
    : []
  const profileMap = new Map(profiles.map((p) => [p.id, p]))

  const enrichedTopSellers = topSellersByGMV.map((s, i) => {
    const p = s.sellerId ? profileMap.get(s.sellerId) : null
    return {
      rank: i + 1,
      name: p?.user?.name ?? 'Unknown',
      gmv: s._sum.priceAtPurchase ?? 0,
    }
  })

  return {
    revenue: {
      today: revenueToday._sum.totalAmount ?? 0,
      week: revenueWeek._sum.totalAmount ?? 0,
      month: revenueMonth._sum.totalAmount ?? 0,
      allTime: revenueAllTime._sum.totalAmount ?? 0,
      store: storeRevenue._sum.totalAmount ?? 0,
      marketplace: marketplaceRevenue._sum.totalAmount ?? 0,
    },
    gmv: {
      totalVolume: marketplaceRevenue._sum.totalAmount ?? 0,
      commissionEarned: commissionAgg._sum.commission ?? 0,
      topSellers: enrichedTopSellers,
    },
    search: {
      trending: trendingQueries.map((q) => ({ query: q.normalizedQuery, count: q._count.id })),
      zeroResults: zeroResultQueries.map((q) => ({ query: q.normalizedQuery, count: q._count.id })),
    },
    notifications: notificationStats.map((s) => ({ status: s.status, count: s._count.id })),
    support: {
      openConversations,
      avgSatisfaction: satisfactionAgg._avg.satisfactionRating,
    },
  }
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-base font-bold text-text-primary uppercase tracking-widest mb-4">
      {children}
    </h2>
  )
}

function StatCard({ label, value, sub, accent }: { label: string; value: string; sub?: string; accent?: string }) {
  return (
    <Card className="p-5">
      <p className="text-xs text-text-muted uppercase tracking-wide mb-1">{label}</p>
      <p className={`text-2xl font-black ${accent ?? 'text-text-primary'}`}>{value}</p>
      {sub && <p className="text-xs text-text-secondary mt-1">{sub}</p>}
    </Card>
  )
}

const DELIVERY_STATUS_COLORS: Record<string, string> = {
  PENDING: 'text-text-muted',
  SENT: 'text-blue-400',
  DELIVERED: 'text-emerald-400',
  OPENED: 'text-nimbus-400',
  CLICKED: 'text-purple-400',
  FAILED: 'text-red-400',
}

export default async function AdminAnalyticsPage() {
  await requireAdmin()
  const data = await getAnalyticsData()

  const allTime = data.revenue.allTime
  const storePct = allTime > 0 ? ((data.revenue.store / allTime) * 100).toFixed(0) : '0'
  const marketPct = allTime > 0 ? ((data.revenue.marketplace / allTime) * 100).toFixed(0) : '0'

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-2xl font-bold text-text-primary">Analytics</h1>
        <p className="mt-1 text-sm text-text-secondary">Platform-wide performance overview</p>
      </div>

      {/* Revenue */}
      <section>
        <SectionTitle>Revenue</SectionTitle>
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 mb-4">
          <StatCard label="Today" value={formatCurrency(data.revenue.today)} accent="text-nimbus-400" />
          <StatCard label="This Week" value={formatCurrency(data.revenue.week)} />
          <StatCard label="This Month" value={formatCurrency(data.revenue.month)} />
          <StatCard label="All-Time" value={formatCurrency(data.revenue.allTime)} />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <StatCard
            label="Store Revenue"
            value={formatCurrency(data.revenue.store)}
            sub={`${storePct}% of all-time`}
            accent="text-blue-400"
          />
          <StatCard
            label="Marketplace Revenue"
            value={formatCurrency(data.revenue.marketplace)}
            sub={`${marketPct}% of all-time`}
            accent="text-emerald-400"
          />
        </div>
      </section>

      {/* GMV */}
      <section>
        <SectionTitle>Marketplace GMV</SectionTitle>
        <div className="grid grid-cols-2 gap-4 mb-6">
          <StatCard
            label="Total Volume"
            value={formatCurrency(data.gmv.totalVolume)}
            accent="text-nimbus-400"
          />
          <StatCard
            label="Commission Earned"
            value={formatCurrency(data.gmv.commissionEarned)}
            accent="text-emerald-400"
          />
        </div>

        <Card className="p-5">
          <p className="text-xs font-bold uppercase tracking-widest text-text-muted mb-4">
            Top 5 Sellers by GMV
          </p>
          {data.gmv.topSellers.length === 0 ? (
            <p className="text-sm text-text-muted">No marketplace orders yet.</p>
          ) : (
            <div className="space-y-2">
              {data.gmv.topSellers.map((s) => (
                <div key={s.rank} className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="text-xs font-bold text-text-muted w-5 text-right shrink-0">
                      #{s.rank}
                    </span>
                    <span className="text-sm text-text-primary truncate">{s.name}</span>
                  </div>
                  <span className="text-sm font-bold text-nimbus-400 shrink-0">
                    {formatCurrency(s.gmv)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </Card>
      </section>

      {/* Search Analytics */}
      <section>
        <SectionTitle>Search Analytics (Last 30 Days)</SectionTitle>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="p-5">
            <p className="text-xs font-bold uppercase tracking-widest text-text-muted mb-4">
              Trending Queries
            </p>
            {data.search.trending.length === 0 ? (
              <p className="text-sm text-text-muted">No search data.</p>
            ) : (
              <ol className="space-y-2">
                {data.search.trending.map((q, i) => (
                  <li key={q.query} className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-xs text-text-muted w-4 shrink-0">{i + 1}.</span>
                      <span className="text-sm text-text-primary truncate">{q.query || '(empty)'}</span>
                    </div>
                    <Badge variant="nimbus" size="sm">{q.count.toLocaleString()}</Badge>
                  </li>
                ))}
              </ol>
            )}
          </Card>

          <Card className="p-5">
            <p className="text-xs font-bold uppercase tracking-widest text-text-muted mb-4">
              Zero-Result Queries
            </p>
            {data.search.zeroResults.length === 0 ? (
              <p className="text-sm text-text-muted">No zero-result queries.</p>
            ) : (
              <ol className="space-y-2">
                {data.search.zeroResults.map((q, i) => (
                  <li key={q.query} className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-xs text-text-muted w-4 shrink-0">{i + 1}.</span>
                      <span className="text-sm text-text-primary truncate">{q.query || '(empty)'}</span>
                    </div>
                    <Badge variant="danger" size="sm">{q.count.toLocaleString()}</Badge>
                  </li>
                ))}
              </ol>
            )}
          </Card>
        </div>
      </section>

      {/* Notification Delivery */}
      <section>
        <SectionTitle>Notification Delivery</SectionTitle>
        <Card className="p-5">
          {data.notifications.length === 0 ? (
            <p className="text-sm text-text-muted">No delivery data.</p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
              {data.notifications.map((n) => (
                <div key={n.status} className="text-center">
                  <p className={`text-2xl font-black ${DELIVERY_STATUS_COLORS[n.status] ?? 'text-text-primary'}`}>
                    {n.count.toLocaleString()}
                  </p>
                  <p className="text-xs text-text-muted mt-0.5">{n.status}</p>
                </div>
              ))}
            </div>
          )}
        </Card>
      </section>

      {/* Support */}
      <section>
        <SectionTitle>Support Metrics</SectionTitle>
        <div className="grid grid-cols-2 gap-4">
          <StatCard
            label="Open Conversations"
            value={data.support.openConversations.toLocaleString()}
            accent={data.support.openConversations > 0 ? 'text-amber-400' : 'text-text-primary'}
          />
          <StatCard
            label="Avg. Satisfaction"
            value={
              data.support.avgSatisfaction != null
                ? `${data.support.avgSatisfaction.toFixed(1)} / 5`
                : 'N/A'
            }
            accent="text-emerald-400"
          />
        </div>
      </section>
    </div>
  )
}
