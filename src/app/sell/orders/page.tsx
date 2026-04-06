import { requireAuth } from '@/lib/auth-guard'
import { getOrCreateSellerProfile } from '@/services/seller.service'
import { BackHeader } from '@/components/ui/back-header'
import { db } from '@/lib/db'
import { formatCurrency } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { notFound } from 'next/navigation'

export const metadata = {
  title: 'Seller Orders — Card Nimbus',
}

interface OrdersPageProps {
  searchParams: Promise<{ page?: string }>
}

function orderStatusVariant(status: string): 'success' | 'warning' | 'danger' | 'default' {
  if (status === 'DELIVERED') return 'success'
  if (status === 'SHIPPED' || status === 'PROCESSING') return 'warning'
  if (status === 'CANCELLED' || status === 'REFUNDED') return 'danger'
  if (status === 'PAID') return 'nimbus' as 'default'
  return 'default'
}

export default async function SellerOrdersPage({ searchParams }: OrdersPageProps) {
  const session = await requireAuth()
  const userId = (session.user as { id: string }).id

  let profile
  try {
    profile = await getOrCreateSellerProfile(userId)
  } catch {
    notFound()
  }

  const params = await searchParams
  const page = Math.max(1, parseInt(params.page ?? '1', 10) || 1)
  const limit = 20
  const skip = (page - 1) * limit

  // Orders where any item belongs to this seller
  const [orders, total] = await Promise.all([
    db.order.findMany({
      where: {
        items: { some: { sellerId: profile.id } },
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
      include: {
        buyer: { select: { id: true, name: true, email: true, avatar: true } },
        items: {
          where: { sellerId: profile.id },
          include: { listing: { select: { id: true, title: true, images: true } } },
        },
        shipments: { orderBy: { createdAt: 'desc' }, take: 1 },
      },
    }),
    db.order.count({
      where: { items: { some: { sellerId: profile.id } } },
    }),
  ])

  const totalPages = Math.ceil(total / limit)

  return (
    <main className="min-h-screen bg-surface">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <BackHeader title="Sales & Payouts" crumbs={[{ label: "Marketplace Account", href: "/marketplace/account" }]} />
        {/* Header */}
        <div className="mb-8">
          <h1 className="hidden text-2xl font-bold text-text-primary">Seller Orders</h1>
          <p className="text-sm text-text-muted mt-1">
            Incoming orders to fulfill.
          </p>
        </div>

        {orders.length === 0 ? (
          <Card className="p-12 text-center">
            <p className="text-text-muted">No orders yet.</p>
          </Card>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => {
              const buyer = order.buyer as { id: string; name: string | null; email: string }
              const sellerItems = order.items
              const sellerTotal = sellerItems.reduce(
                (sum, item) => sum + item.priceAtPurchase * item.quantity,
                0
              )
              const latestShipment = order.shipments[0] ?? null

              return (
                <Card key={order.id} className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <div className="flex items-center gap-3 flex-wrap">
                        <h2 className="text-sm font-bold text-text-primary">
                          Order #{order.orderNumber}
                        </h2>
                        <Badge
                          variant={orderStatusVariant(order.status as string)}
                          size="sm"
                        >
                          {order.status as string}
                        </Badge>
                      </div>
                      <p className="text-xs text-text-muted mt-1">
                        {new Date(order.createdAt).toLocaleDateString('en-US', {
                          dateStyle: 'medium',
                        })}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-nimbus-600">
                        {formatCurrency(sellerTotal)}
                      </p>
                      <p className="text-xs text-text-muted">
                        {sellerItems.length} item{sellerItems.length !== 1 ? 's' : ''}
                      </p>
                    </div>
                  </div>

                  {/* Buyer Info */}
                  <div className="flex items-center gap-2 mb-4 pb-4 border-b border-surface-border">
                    <div className="w-8 h-8 rounded-full bg-nimbus-100 border border-nimbus-400 flex items-center justify-center text-xs font-bold text-nimbus-600">
                      {(buyer.name ?? buyer.email).charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm text-text-primary">{buyer.name ?? 'Anonymous'}</p>
                      <p className="text-xs text-text-muted">{buyer.email}</p>
                    </div>
                  </div>

                  {/* Items */}
                  <div className="space-y-2 mb-4">
                    {sellerItems.map((item) => (
                      <div key={item.id} className="flex items-center justify-between text-sm">
                        <span className="text-text-secondary truncate max-w-xs">
                          {item.titleSnapshot}
                          {item.conditionSnapshot && (
                            <Badge variant="default" size="sm" className="ml-2">
                              {item.conditionSnapshot}
                            </Badge>
                          )}
                        </span>
                        <span className="text-text-primary font-medium ml-4 flex-shrink-0">
                          {item.quantity} × {formatCurrency(item.priceAtPurchase)}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Shipping Status */}
                  {latestShipment && (
                    <div className="text-xs text-text-muted mb-3">
                      Tracking:{' '}
                      {latestShipment.trackingNumber ? (
                        <span className="text-nimbus-600 font-mono">{latestShipment.trackingNumber}</span>
                      ) : (
                        'Not yet assigned'
                      )}
                    </div>
                  )}

                  {/* Action */}
                  {(order.status === 'PAID' || order.status === 'PROCESSING') && (
                    <form
                      action={`/api/orders/${order.id}/ship`}
                      method="POST"
                    >
                      <button
                        type="submit"
                        className="inline-flex items-center px-4 py-2 rounded-xl bg-nimbus-500 text-white text-sm font-semibold hover:bg-nimbus-600 transition-colors"
                      >
                        Mark as Shipped
                      </button>
                    </form>
                  )}
                </Card>
              )
            })}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-8 flex justify-center items-center gap-3">
            {page > 1 && (
              <a
                href={`/sell/orders?page=${page - 1}`}
                className="px-4 py-2 text-sm rounded-xl bg-surface-overlay border border-surface-border text-text-primary hover:bg-surface-border transition-colors"
              >
                Previous
              </a>
            )}
            <span className="text-sm text-text-secondary">
              Page {page} of {totalPages}
            </span>
            {page < totalPages && (
              <a
                href={`/sell/orders?page=${page + 1}`}
                className="px-4 py-2 text-sm rounded-xl bg-surface-overlay border border-surface-border text-text-primary hover:bg-surface-border transition-colors"
              >
                Next
              </a>
            )}
          </div>
        )}
      </div>
    </main>
  )
}
