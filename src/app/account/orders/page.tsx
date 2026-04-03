import Link from 'next/link'
import { requireAuth } from '@/lib/auth-guard'
import { getUserOrders } from '@/services/order.service'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { formatCurrency } from '@/lib/utils'
import { OrderStatus } from '@prisma/client'

export const metadata = {
  title: 'Orders — Card Nimbus',
}

interface OrdersPageProps {
  searchParams: Promise<{ page?: string }>
}

function orderStatusBadge(status: OrderStatus) {
  const map: Record<OrderStatus, { variant: 'default' | 'success' | 'warning' | 'danger' | 'nimbus'; label: string }> = {
    PENDING:    { variant: 'warning',  label: 'Pending' },
    PAID:       { variant: 'nimbus',   label: 'Paid' },
    PROCESSING: { variant: 'nimbus',   label: 'Processing' },
    SHIPPED:    { variant: 'default',  label: 'Shipped' },
    DELIVERED:  { variant: 'success',  label: 'Delivered' },
    RETURNED:   { variant: 'warning',  label: 'Returned' },
    REFUNDED:   { variant: 'warning',  label: 'Refunded' },
    CANCELLED:  { variant: 'danger',   label: 'Cancelled' },
  }
  const entry = map[status] ?? { variant: 'default', label: status }
  return <Badge variant={entry.variant}>{entry.label}</Badge>
}

const LIMIT = 10

export default async function AccountOrdersPage({ searchParams }: OrdersPageProps) {
  const session = await requireAuth()
  const { page: pageParam } = await searchParams
  const page = Math.max(1, parseInt(pageParam ?? '1', 10) || 1)

  const { orders, total, totalPages } = await getUserOrders(session.user.id, page, LIMIT)

  return (
    <main className="min-h-screen bg-surface">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex items-center gap-3 mb-8">
          <Link
            href="/account"
            className="text-text-secondary hover:text-text-primary transition-colors text-sm"
          >
            Account
          </Link>
          <span className="text-surface-border">/</span>
          <h1 className="text-3xl font-bold text-text-primary tracking-tight">Orders</h1>
        </div>

        {orders.length === 0 ? (
          <Card className="p-12 text-center">
            <div className="text-5xl mb-4">📦</div>
            <p className="text-text-primary font-semibold text-lg mb-2">No orders yet</p>
            <p className="text-text-secondary text-sm">
              When you place an order, it will appear here.
            </p>
          </Card>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <Link key={order.id} href={`/account/orders/${order.id}`}>
                <Card hover className="p-5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-bold text-text-primary font-mono tracking-wide">
                          {order.orderNumber}
                        </span>
                        {orderStatusBadge(order.status)}
                      </div>
                      <p className="text-text-secondary text-sm">
                        {order.items.length} item{order.items.length !== 1 ? 's' : ''} &middot;{' '}
                        {new Date(order.createdAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-nimbus-400 font-bold text-lg">
                        {formatCurrency(order.totalAmount)}
                      </p>
                      <p className="text-text-muted text-xs">View details →</p>
                    </div>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-8 flex items-center justify-between text-sm text-text-secondary">
            <span>
              {total} order{total !== 1 ? 's' : ''} total
            </span>
            <div className="flex gap-2">
              {page > 1 && (
                <Link
                  href={`/account/orders?page=${page - 1}`}
                  className="px-3 py-1.5 rounded-lg bg-surface-overlay border border-surface-border hover:border-nimbus-500 text-text-primary transition-colors"
                >
                  Previous
                </Link>
              )}
              <span className="px-3 py-1.5 text-text-muted">
                Page {page} of {totalPages}
              </span>
              {page < totalPages && (
                <Link
                  href={`/account/orders?page=${page + 1}`}
                  className="px-3 py-1.5 rounded-lg bg-surface-overlay border border-surface-border hover:border-nimbus-500 text-text-primary transition-colors"
                >
                  Next
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </main>
  )
}
