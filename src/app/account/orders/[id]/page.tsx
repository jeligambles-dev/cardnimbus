import Link from 'next/link'
import { notFound } from 'next/navigation'
import { requireAuth } from '@/lib/auth-guard'
import { getOrderById } from '@/services/order.service'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { formatCurrency } from '@/lib/utils'
import { OrderStatus } from '@prisma/client'

interface OrderDetailPageProps {
  params: Promise<{ id: string }>
}

function orderStatusBadge(status: OrderStatus) {
  const map: Record<OrderStatus, { variant: 'default' | 'success' | 'warning' | 'danger' | 'nimbus'; label: string }> = {
    PENDING:    { variant: 'warning', label: 'Pending' },
    PAID:       { variant: 'nimbus',  label: 'Paid' },
    PROCESSING: { variant: 'nimbus',  label: 'Processing' },
    SHIPPED:    { variant: 'default', label: 'Shipped' },
    DELIVERED:  { variant: 'success', label: 'Delivered' },
    RETURNED:   { variant: 'warning', label: 'Returned' },
    REFUNDED:   { variant: 'warning', label: 'Refunded' },
    CANCELLED:  { variant: 'danger',  label: 'Cancelled' },
  }
  const entry = map[status] ?? { variant: 'default', label: status }
  return <Badge variant={entry.variant} size="md">{entry.label}</Badge>
}

export default async function OrderDetailPage({ params }: OrderDetailPageProps) {
  const session = await requireAuth()
  const { id } = await params

  let order
  try {
    order = await getOrderById(id)
  } catch {
    notFound()
  }

  // Ensure the order belongs to the current user
  if (order.buyerId !== session.user.id && (session.user as { role?: string }).role !== 'ADMIN') {
    notFound()
  }

  const payment = order.payments[0]
  const shipment = order.shipments[0]

  return (
    <main className="min-h-screen bg-surface">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Breadcrumb */}
        <div className="flex items-center gap-3 mb-8 text-sm text-text-secondary">
          <Link href="/account" className="hover:text-text-primary transition-colors">
            Account
          </Link>
          <span className="text-surface-border">/</span>
          <Link href="/account/orders" className="hover:text-text-primary transition-colors">
            Orders
          </Link>
          <span className="text-surface-border">/</span>
          <span className="text-text-primary font-mono">{order.orderNumber}</span>
        </div>

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-text-primary tracking-tight font-mono">
              {order.orderNumber}
            </h1>
            <p className="text-text-secondary text-sm mt-1">
              Placed on{' '}
              {new Date(order.createdAt).toLocaleDateString('en-US', {
                month: 'long',
                day: 'numeric',
                year: 'numeric',
              })}
            </p>
          </div>
          {orderStatusBadge(order.status)}
        </div>

        <div className="space-y-6">
          {/* Items */}
          <Card className="p-6">
            <h2 className="text-lg font-bold text-text-primary mb-4">Items</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-surface-border text-text-secondary text-left">
                    <th className="pb-3 font-medium">Product</th>
                    <th className="pb-3 font-medium text-right">Qty</th>
                    <th className="pb-3 font-medium text-right">Unit Price</th>
                    <th className="pb-3 font-medium text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-border">
                  {order.items.map((item) => (
                    <tr key={item.id}>
                      <td className="py-3 text-text-primary">
                        {item.titleSnapshot}
                      </td>
                      <td className="py-3 text-right text-text-secondary">{item.quantity}</td>
                      <td className="py-3 text-right text-text-secondary">
                        {formatCurrency(item.priceAtPurchase)}
                      </td>
                      <td className="py-3 text-right font-semibold text-text-primary">
                        {formatCurrency(item.priceAtPurchase * item.quantity)}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="border-t border-surface-border">
                  {order.shippingCost > 0 && (
                    <tr>
                      <td colSpan={3} className="pt-3 text-right text-text-secondary">
                        Shipping
                      </td>
                      <td className="pt-3 text-right text-text-secondary">
                        {formatCurrency(order.shippingCost)}
                      </td>
                    </tr>
                  )}
                  {order.discountAmount > 0 && (
                    <tr>
                      <td colSpan={3} className="pt-1 text-right text-emerald-400">
                        Discount
                      </td>
                      <td className="pt-1 text-right text-emerald-400">
                        −{formatCurrency(order.discountAmount)}
                      </td>
                    </tr>
                  )}
                  <tr>
                    <td colSpan={3} className="pt-2 text-right font-bold text-text-primary">
                      Total
                    </td>
                    <td className="pt-2 text-right font-bold text-nimbus-600 text-base">
                      {formatCurrency(order.totalAmount)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </Card>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Shipping Address */}
            {order.shippingAddress && (
              <Card className="p-6">
                <h2 className="text-lg font-bold text-text-primary mb-3">Shipping Address</h2>
                <address className="text-text-secondary text-sm not-italic space-y-0.5">
                  <p className="text-text-primary font-medium">
                    {order.shippingAddress.fullName}
                  </p>
                  <p>{order.shippingAddress.line1}</p>
                  {order.shippingAddress.line2 && <p>{order.shippingAddress.line2}</p>}
                  <p>
                    {order.shippingAddress.city}, {order.shippingAddress.state}{' '}
                    {order.shippingAddress.postalCode}
                  </p>
                  <p>{order.shippingAddress.country}</p>
                </address>
              </Card>
            )}

            {/* Payment Info */}
            {payment && (
              <Card className="p-6">
                <h2 className="text-lg font-bold text-text-primary mb-3">Payment</h2>
                <dl className="text-sm space-y-2">
                  <div className="flex justify-between">
                    <dt className="text-text-secondary">Provider</dt>
                    <dd className="text-text-primary capitalize">{payment.provider.toLowerCase()}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-text-secondary">Status</dt>
                    <dd className="text-text-primary capitalize">{payment.status.toLowerCase()}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-text-secondary">Amount</dt>
                    <dd className="text-text-primary font-medium">{formatCurrency(payment.amount)}</dd>
                  </div>
                </dl>
              </Card>
            )}
          </div>

          {/* Shipment Tracking */}
          {shipment && (
            <Card className="p-6">
              <h2 className="text-lg font-bold text-text-primary mb-3">Shipment Tracking</h2>
              <dl className="text-sm space-y-2">
                {shipment.carrier && (
                  <div className="flex justify-between">
                    <dt className="text-text-secondary">Carrier</dt>
                    <dd className="text-text-primary">{shipment.carrier}</dd>
                  </div>
                )}
                {shipment.trackingNumber && (
                  <div className="flex justify-between">
                    <dt className="text-text-secondary">Tracking Number</dt>
                    <dd className="font-mono text-nimbus-600">{shipment.trackingNumber}</dd>
                  </div>
                )}
                {shipment.deliveredAt && (
                  <div className="flex justify-between">
                    <dt className="text-text-secondary">Delivered At</dt>
                    <dd className="text-text-primary">
                      {new Date(shipment.deliveredAt).toLocaleDateString('en-US', {
                        month: 'long',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </dd>
                  </div>
                )}
                <div className="flex justify-between">
                  <dt className="text-text-secondary">Status</dt>
                  <dd className="text-text-primary capitalize">{shipment.status.toLowerCase()}</dd>
                </div>
              </dl>
            </Card>
          )}
        </div>
      </div>
    </main>
  )
}
