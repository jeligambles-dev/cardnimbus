import Link from 'next/link'
import { requireAuth } from '@/lib/auth-guard'
import { getUserDisputes } from '@/services/dispute.service'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { formatCurrency } from '@/lib/utils'
import { DisputeStatus } from '@prisma/client'

export const metadata = {
  title: 'My Disputes — Card Nimbus',
}

type BadgeVariant = 'default' | 'success' | 'warning' | 'danger' | 'nimbus'

function disputeStatusBadge(status: DisputeStatus) {
  const map: Record<DisputeStatus, { variant: BadgeVariant; label: string }> = {
    OPEN:             { variant: 'warning',  label: 'Open' },
    UNDER_REVIEW:     { variant: 'nimbus',   label: 'Under Review' },
    RESOLVED_BUYER:   { variant: 'success',  label: 'Resolved (Buyer)' },
    RESOLVED_SELLER:  { variant: 'default',  label: 'Resolved (Seller)' },
    ESCALATED:        { variant: 'danger',   label: 'Escalated' },
  }
  const entry = map[status] ?? { variant: 'default' as BadgeVariant, label: status }
  return <Badge variant={entry.variant}>{entry.label}</Badge>
}

interface DisputesPageProps {
  searchParams: Promise<{ page?: string }>
}

const LIMIT = 10

export default async function AccountDisputesPage({ searchParams }: DisputesPageProps) {
  const session = await requireAuth()
  const { page: pageParam } = await searchParams
  const page = Math.max(1, parseInt(pageParam ?? '1', 10) || 1)

  const { disputes, total, totalPages } = await getUserDisputes(session.user.id, page, LIMIT)

  return (
    <main className="min-h-screen bg-surface">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-text-primary tracking-tight">My Disputes</h1>
          <p className="mt-1 text-sm text-text-secondary">{total} dispute{total !== 1 ? 's' : ''} filed</p>
        </div>

        {disputes.length === 0 ? (
          <Card className="p-12 text-center">
            <p className="text-text-muted text-sm">No disputes filed.</p>
            <Link href="/account/orders" className="mt-4 inline-block text-nimbus-600 text-sm hover:underline">
              View your orders
            </Link>
          </Card>
        ) : (
          <div className="space-y-3">
            {disputes.map((dispute) => (
              <Link key={dispute.id} href={`/account/disputes/${dispute.id}`}>
                <Card hover className="p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-semibold text-text-primary">
                          Order #{dispute.order.orderNumber}
                        </span>
                        {disputeStatusBadge(dispute.status)}
                      </div>
                      <p className="mt-1.5 text-sm text-text-secondary line-clamp-2">
                        {dispute.reason}
                      </p>
                      <div className="mt-2 flex items-center gap-4 text-xs text-text-muted">
                        <span>Filed {new Date(dispute.createdAt).toLocaleDateString()}</span>
                        <span>Order total: {formatCurrency(dispute.order.totalAmount)}</span>
                      </div>
                    </div>
                    <svg className="h-4 w-4 shrink-0 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-6 flex items-center justify-center gap-2">
            {page > 1 && (
              <Link
                href={`?page=${page - 1}`}
                className="rounded-lg border border-surface-border bg-surface-overlay px-3 py-1.5 text-sm text-text-secondary hover:text-text-primary"
              >
                Previous
              </Link>
            )}
            <span className="text-sm text-text-muted">
              Page {page} of {totalPages}
            </span>
            {page < totalPages && (
              <Link
                href={`?page=${page + 1}`}
                className="rounded-lg border border-surface-border bg-surface-overlay px-3 py-1.5 text-sm text-text-secondary hover:text-text-primary"
              >
                Next
              </Link>
            )}
          </div>
        )}
      </div>
    </main>
  )
}
