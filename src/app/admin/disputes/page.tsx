import Link from 'next/link'
import { requireAdmin } from '@/lib/auth-guard'
import { getAdminDisputes } from '@/services/dispute.service'
import { Badge } from '@/components/ui/badge'
import { formatCurrency } from '@/lib/utils'
import { DisputeStatus } from '@prisma/client'

export const metadata = {
  title: 'Dispute Queue — Admin',
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

const STATUS_OPTIONS: Array<{ value: string; label: string }> = [
  { value: '',               label: 'All Statuses' },
  { value: 'OPEN',           label: 'Open' },
  { value: 'UNDER_REVIEW',   label: 'Under Review' },
  { value: 'ESCALATED',      label: 'Escalated' },
  { value: 'RESOLVED_BUYER', label: 'Resolved (Buyer)' },
  { value: 'RESOLVED_SELLER',label: 'Resolved (Seller)' },
]

interface AdminDisputesPageProps {
  searchParams: Promise<{ status?: string; page?: string }>
}

const LIMIT = 25

export default async function AdminDisputesPage({ searchParams }: AdminDisputesPageProps) {
  await requireAdmin()
  const { status: statusParam, page: pageParam } = await searchParams
  const page = Math.max(1, parseInt(pageParam ?? '1', 10) || 1)

  const statusFilter = Object.values(DisputeStatus).includes(statusParam as DisputeStatus)
    ? (statusParam as DisputeStatus)
    : undefined

  const { disputes, total, totalPages } = await getAdminDisputes(
    statusFilter ? { status: statusFilter } : {},
    page,
    LIMIT
  )

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-text-primary">Dispute Queue</h1>
        <p className="mt-1 text-sm text-text-secondary">{total} dispute{total !== 1 ? 's' : ''}</p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        {STATUS_OPTIONS.map(({ value, label }) => {
          const isActive = (value === '' && !statusParam) || statusParam === value
          const href = value ? `?status=${value}` : '?'
          return (
            <Link
              key={value}
              href={href}
              className={[
                'rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors',
                isActive
                  ? 'border-nimbus-600 bg-nimbus-500/10 text-nimbus-600'
                  : 'border-surface-border bg-surface-overlay text-text-secondary hover:text-text-primary',
              ].join(' ')}
            >
              {label}
            </Link>
          )
        })}
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-surface-border bg-surface-raised">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-surface-border bg-surface-overlay">
              <th className="px-4 py-3 text-left font-medium text-text-secondary">Order</th>
              <th className="px-4 py-3 text-left font-medium text-text-secondary">Buyer</th>
              <th className="px-4 py-3 text-left font-medium text-text-secondary">Reason</th>
              <th className="px-4 py-3 text-left font-medium text-text-secondary">Status</th>
              <th className="px-4 py-3 text-left font-medium text-text-secondary">Filed</th>
              <th className="px-4 py-3 text-left font-medium text-text-secondary">Total</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-surface-border">
            {disputes.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-text-muted">
                  No disputes found.
                </td>
              </tr>
            ) : (
              disputes.map((dispute) => (
                <tr key={dispute.id} className="hover:bg-surface-overlay transition-colors">
                  <td className="px-4 py-3">
                    <Link
                      href={`/admin/disputes/${dispute.id}`}
                      className="font-medium text-nimbus-600 hover:underline"
                    >
                      #{dispute.order.orderNumber}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-text-secondary">
                    <div>{dispute.filer.name ?? '—'}</div>
                    <div className="text-xs text-text-muted">{dispute.filer.email}</div>
                  </td>
                  <td className="px-4 py-3 max-w-xs">
                    <p className="truncate text-text-secondary">{dispute.reason}</p>
                  </td>
                  <td className="px-4 py-3">
                    {disputeStatusBadge(dispute.status)}
                  </td>
                  <td className="px-4 py-3 text-text-muted whitespace-nowrap">
                    {new Date(dispute.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3 text-text-secondary">
                    {formatCurrency(dispute.order.totalAmount)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          {page > 1 && (
            <Link
              href={`?${statusParam ? `status=${statusParam}&` : ''}page=${page - 1}`}
              className="rounded-lg border border-surface-border bg-surface-overlay px-3 py-1.5 text-sm text-text-secondary hover:text-text-primary"
            >
              Previous
            </Link>
          )}
          <span className="text-sm text-text-muted">Page {page} of {totalPages}</span>
          {page < totalPages && (
            <Link
              href={`?${statusParam ? `status=${statusParam}&` : ''}page=${page + 1}`}
              className="rounded-lg border border-surface-border bg-surface-overlay px-3 py-1.5 text-sm text-text-secondary hover:text-text-primary"
            >
              Next
            </Link>
          )}
        </div>
      )}
    </div>
  )
}
