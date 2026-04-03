import { db } from '@/lib/db'
import { formatCurrency } from '@/lib/utils'
import { Card } from '@/components/ui/card'

async function getDashboardStats() {
  const [totalOrders, revenueAgg, activeProducts, lowStockItems] =
    await Promise.all([
      db.order.count(),
      db.order.aggregate({
        _sum: { totalAmount: true },
        where: { status: { in: ['PAID', 'PROCESSING', 'SHIPPED', 'DELIVERED'] } },
      }),
      db.product.count({ where: { isActive: true } }),
      db.product.count({ where: { stock: { lte: 5 }, isActive: true } }),
    ])

  return {
    totalOrders,
    revenue: revenueAgg._sum.totalAmount ?? 0,
    activeProducts,
    lowStockItems,
  }
}

const STAT_ICONS = {
  orders: (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
    </svg>
  ),
  revenue: (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  products: (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
    </svg>
  ),
  lowStock: (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
    </svg>
  ),
}

export default async function AdminDashboard() {
  const stats = await getDashboardStats()

  const statCards = [
    {
      label: 'Total Orders',
      value: stats.totalOrders.toLocaleString(),
      icon: STAT_ICONS.orders,
      iconBg: 'bg-nimbus-500/10 text-nimbus-400',
    },
    {
      label: 'Revenue',
      value: formatCurrency(stats.revenue),
      icon: STAT_ICONS.revenue,
      iconBg: 'bg-emerald-500/10 text-emerald-400',
    },
    {
      label: 'Active Products',
      value: stats.activeProducts.toLocaleString(),
      icon: STAT_ICONS.products,
      iconBg: 'bg-blue-500/10 text-blue-400',
    },
    {
      label: 'Low Stock Items',
      value: stats.lowStockItems.toLocaleString(),
      icon: STAT_ICONS.lowStock,
      iconBg: stats.lowStockItems > 0 ? 'bg-amber-500/10 text-amber-400' : 'bg-surface-overlay text-text-muted',
    },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-text-primary">Dashboard</h1>
        <p className="mt-1 text-sm text-text-secondary">Overview of your store</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {statCards.map((stat) => (
          <Card key={stat.label} className="p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm text-text-secondary">{stat.label}</p>
                <p className="mt-1.5 text-2xl font-bold text-text-primary">{stat.value}</p>
              </div>
              <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${stat.iconBg}`}>
                {stat.icon}
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
