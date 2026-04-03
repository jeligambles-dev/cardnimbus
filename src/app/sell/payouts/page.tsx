import { requireAuth } from '@/lib/auth-guard'
import { getSellerProfile } from '@/services/seller.service'
import { getSellerPayouts, getPayoutSummary } from '@/services/payout.service'
import { formatCurrency } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { notFound } from 'next/navigation'

export const metadata = {
  title: 'Payouts — Card Nimbus',
}

interface PayoutsPageProps {
  searchParams: Promise<{ page?: string }>
}

function payoutStatusVariant(status: string): 'success' | 'warning' | 'danger' | 'default' {
  if (status === 'COMPLETED') return 'success'
  if (status === 'PROCESSING') return 'warning'
  if (status === 'FAILED') return 'danger'
  return 'default'
}

export default async function SellerPayoutsPage({ searchParams }: PayoutsPageProps) {
  const session = await requireAuth()
  const userId = (session.user as { id: string }).id

  let profile
  try {
    profile = await getSellerProfile(userId)
  } catch {
    notFound()
  }

  const params = await searchParams
  const page = Math.max(1, parseInt(params.page ?? '1', 10) || 1)

  const [{ payouts, total, totalPages }, summary] = await Promise.all([
    getSellerPayouts(profile.id, page, 20),
    getPayoutSummary(profile.id),
  ])

  // Get commission rate from tier
  const commissionRate = profile.tier?.rate ?? 0.1

  return (
    <main className="min-h-screen bg-surface">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-text-primary">Payouts</h1>
          <p className="text-sm text-text-muted mt-1">
            Your payout history and earnings summary.
          </p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <Card className="p-6">
            <p className="text-xs text-text-muted uppercase tracking-wide mb-1">Total Earned</p>
            <p className="text-2xl font-bold text-nimbus-400">{formatCurrency(summary.totalEarned)}</p>
            <p className="text-xs text-text-muted mt-1">after fees</p>
          </Card>
          <Card className="p-6">
            <p className="text-xs text-text-muted uppercase tracking-wide mb-1">Pending</p>
            <p className="text-2xl font-bold text-text-primary">{formatCurrency(summary.pendingPayouts)}</p>
            <p className="text-xs text-text-muted mt-1">awaiting processing</p>
          </Card>
          <Card className="p-6">
            <p className="text-xs text-text-muted uppercase tracking-wide mb-1">Commission Rate</p>
            <p className="text-2xl font-bold text-text-primary">
              {(commissionRate * 100).toFixed(0)}%
            </p>
            <p className="text-xs text-text-muted mt-1">
              {profile.tier?.name ?? 'Standard'} tier
            </p>
          </Card>
        </div>

        {/* Payout Table */}
        {payouts.length === 0 ? (
          <Card className="p-12 text-center">
            <p className="text-text-muted">No payouts yet.</p>
          </Card>
        ) : (
          <Card>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-surface-border">
                    <th className="text-left px-6 py-4 text-xs font-semibold text-text-muted uppercase tracking-wide">
                      Date
                    </th>
                    <th className="text-left px-4 py-4 text-xs font-semibold text-text-muted uppercase tracking-wide hidden sm:table-cell">
                      Order
                    </th>
                    <th className="text-right px-4 py-4 text-xs font-semibold text-text-muted uppercase tracking-wide">
                      Gross
                    </th>
                    <th className="text-right px-4 py-4 text-xs font-semibold text-text-muted uppercase tracking-wide hidden md:table-cell">
                      Fee
                    </th>
                    <th className="text-right px-4 py-4 text-xs font-semibold text-text-muted uppercase tracking-wide">
                      Net
                    </th>
                    <th className="text-center px-4 py-4 text-xs font-semibold text-text-muted uppercase tracking-wide">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-border">
                  {payouts.map((payout) => {
                    const feePercent =
                      payout.grossAmount > 0
                        ? ((payout.fee / payout.grossAmount) * 100).toFixed(0)
                        : '0'

                    return (
                      <tr key={payout.id} className="hover:bg-surface-overlay/30 transition-colors">
                        <td className="px-6 py-4">
                          <span className="text-sm text-text-secondary">
                            {new Date(payout.createdAt).toLocaleDateString('en-US', {
                              dateStyle: 'medium',
                            })}
                          </span>
                        </td>
                        <td className="px-4 py-4 hidden sm:table-cell">
                          <span className="text-sm text-text-muted font-mono text-xs">
                            {payout.orderId ? `...${payout.orderId.slice(-8)}` : '—'}
                          </span>
                        </td>
                        <td className="px-4 py-4 text-right">
                          <span className="text-sm text-text-primary">
                            {formatCurrency(payout.grossAmount)}
                          </span>
                        </td>
                        <td className="px-4 py-4 text-right hidden md:table-cell">
                          <span className="text-sm text-text-muted">
                            {formatCurrency(payout.fee)}{' '}
                            <span className="text-xs">({feePercent}%)</span>
                          </span>
                        </td>
                        <td className="px-4 py-4 text-right">
                          <span className="text-sm font-semibold text-nimbus-400">
                            {formatCurrency(payout.netAmount)}
                          </span>
                        </td>
                        <td className="px-4 py-4 text-center">
                          <Badge
                            variant={payoutStatusVariant(payout.status as string)}
                            size="sm"
                          >
                            {payout.status as string}
                          </Badge>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </Card>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-8 flex justify-center items-center gap-3">
            {page > 1 && (
              <a
                href={`/sell/payouts?page=${page - 1}`}
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
                href={`/sell/payouts?page=${page + 1}`}
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
