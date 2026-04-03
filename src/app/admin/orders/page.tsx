import { db } from '@/lib/db'
import { formatCurrency } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { OrderStatus } from '@prisma/client'

type BadgeVariant = 'default' | 'success' | 'warning' | 'danger' | 'nimbus'

function getStatusVariant(status: OrderStatus): BadgeVariant {
  switch (status) {
    case 'PAID':
    case 'DELIVERED':
      return 'success'
    case 'PROCESSING':
    case 'SHIPPED':
      return 'nimbus'
    case 'PENDING':
      return 'warning'
    case 'CANCELLED':
    case 'REFUNDED':
    case 'RETURNED':
      return 'danger'
    default:
      return 'default'
  }
}

export default async function AdminOrdersPage() {
  const orders = await db.order.findMany({
    orderBy: { createdAt: 'desc' },
    take: 100,
    include: {
      buyer: { select: { name: true, email: true } },
    },
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-text-primary">Orders</h1>
        <p className="mt-1 text-sm text-text-secondary">{orders.length} recent orders</p>
      </div>

      <div className="overflow-hidden rounded-xl border border-surface-border bg-surface-raised">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-surface-border bg-surface-overlay">
              <th className="px-4 py-3 text-left font-medium text-text-secondary">Order #</th>
              <th className="px-4 py-3 text-left font-medium text-text-secondary">Customer</th>
              <th className="px-4 py-3 text-left font-medium text-text-secondary">Total</th>
              <th className="px-4 py-3 text-left font-medium text-text-secondary">Status</th>
              <th className="px-4 py-3 text-left font-medium text-text-secondary">Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-surface-border">
            {orders.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-text-muted">
                  No orders yet.
                </td>
              </tr>
            ) : (
              orders.map((order) => (
                <tr key={order.id} className="transition-colors hover:bg-surface-overlay/50">
                  <td className="px-4 py-3 font-mono text-xs text-nimbus-400">
                    {order.orderNumber}
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-medium text-text-primary">{order.buyer.name ?? '—'}</p>
                    <p className="text-xs text-text-muted">{order.buyer.email}</p>
                  </td>
                  <td className="px-4 py-3 text-text-primary">
                    {formatCurrency(order.totalAmount)}
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={getStatusVariant(order.status)}>
                      {order.status}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-text-secondary">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
