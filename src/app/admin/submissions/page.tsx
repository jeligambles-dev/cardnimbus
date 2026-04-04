import Link from 'next/link'
import { requireAdmin } from '@/lib/auth-guard'
import { getAdminSubmissions } from '@/services/submission.service'
import { Badge } from '@/components/ui/badge'
import { SubmissionStatus } from '@prisma/client'

export const metadata = {
  title: 'Submissions — Admin | Card Nimbus',
}

const STATUS_CONFIG: Record<
  SubmissionStatus,
  { variant: 'default' | 'success' | 'warning' | 'danger' | 'nimbus'; label: string }
> = {
  SUBMITTED:    { variant: 'default',  label: 'Submitted' },
  UNDER_REVIEW: { variant: 'nimbus',   label: 'Under Review' },
  OFFER_SENT:   { variant: 'warning',  label: 'Offer Sent' },
  ACCEPTED:     { variant: 'success',  label: 'Accepted' },
  REJECTED:     { variant: 'danger',   label: 'Rejected' },
  SHIPPING:     { variant: 'nimbus',   label: 'Shipping' },
  RECEIVED:     { variant: 'nimbus',   label: 'Received' },
  COMPLETED:    { variant: 'success',  label: 'Completed' },
}

const ALL_STATUSES = Object.keys(SubmissionStatus) as SubmissionStatus[]

function timeAgo(date: Date): string {
  const secs = Math.floor((Date.now() - new Date(date).getTime()) / 1000)
  if (secs < 60) return `${secs}s ago`
  const mins = Math.floor(secs / 60)
  if (mins < 60) return `${mins}m ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  return `${days}d ago`
}

interface Props {
  searchParams: Promise<{ status?: string; page?: string }>
}

export default async function AdminSubmissionsPage({ searchParams }: Props) {
  await requireAdmin()

  const { status: statusParam, page: pageParam } = await searchParams
  const statusFilter = ALL_STATUSES.includes(statusParam as SubmissionStatus)
    ? (statusParam as SubmissionStatus)
    : undefined
  const page = Math.max(1, parseInt(pageParam ?? '1', 10) || 1)

  const { submissions, total } = await getAdminSubmissions(
    { status: statusFilter },
    page,
    50
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Submissions</h1>
          <p className="mt-1 text-sm text-text-secondary">{total} total</p>
        </div>
      </div>

      {/* Status filter */}
      <div className="flex flex-wrap gap-2">
        <Link
          href="/admin/submissions"
          className={[
            'rounded-lg border px-3 py-1 text-sm font-medium transition-colors',
            !statusFilter
              ? 'border-nimbus-500/50 bg-nimbus-500/10 text-nimbus-600'
              : 'border-surface-border text-text-secondary hover:border-nimbus-500/30 hover:text-text-primary',
          ].join(' ')}
        >
          All
        </Link>
        {ALL_STATUSES.map((s) => {
          const cfg = STATUS_CONFIG[s]
          return (
            <Link
              key={s}
              href={`/admin/submissions?status=${s}`}
              className={[
                'rounded-lg border px-3 py-1 text-sm font-medium transition-colors',
                statusFilter === s
                  ? 'border-nimbus-500/50 bg-nimbus-500/10 text-nimbus-600'
                  : 'border-surface-border text-text-secondary hover:border-nimbus-500/30 hover:text-text-primary',
              ].join(' ')}
            >
              {cfg.label}
            </Link>
          )
        })}
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-surface-border bg-surface-raised">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-surface-border bg-surface-overlay">
              <th className="px-4 py-3 text-left font-medium text-text-secondary">Card</th>
              <th className="px-4 py-3 text-left font-medium text-text-secondary">Customer</th>
              <th className="px-4 py-3 text-left font-medium text-text-secondary">Condition</th>
              <th className="px-4 py-3 text-left font-medium text-text-secondary">Status</th>
              <th className="px-4 py-3 text-left font-medium text-text-secondary">Assigned</th>
              <th className="px-4 py-3 text-left font-medium text-text-secondary">Age</th>
              <th className="px-4 py-3 text-right font-medium text-text-secondary">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-surface-border">
            {submissions.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-10 text-center text-text-muted">
                  No submissions found.
                </td>
              </tr>
            ) : (
              submissions.map((sub) => {
                const cfg = STATUS_CONFIG[sub.status]
                const cardName = sub.card?.name ?? 'Unlisted Card'
                const thumb = sub.images[0]
                const customerName = (sub.user as { name?: string | null; email?: string | null })?.name
                  ?? (sub.user as { email?: string | null })?.email
                  ?? 'Unknown'
                const assignedId = sub.assignedAdminId
                const isUnclaimed = sub.status === SubmissionStatus.SUBMITTED && !assignedId

                return (
                  <tr key={sub.id} className="transition-colors hover:bg-surface-overlay/50">
                    {/* Card */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        {thumb && (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={thumb}
                            alt={cardName}
                            className="h-8 w-8 rounded-md border border-surface-border object-cover"
                          />
                        )}
                        <span className="max-w-[160px] truncate font-medium text-text-primary">
                          {cardName}
                        </span>
                      </div>
                    </td>

                    {/* Customer */}
                    <td className="px-4 py-3 text-text-secondary">
                      <span className="max-w-[120px] truncate block">{customerName}</span>
                    </td>

                    {/* Condition */}
                    <td className="px-4 py-3 text-text-secondary">{sub.estimatedCondition}</td>

                    {/* Status */}
                    <td className="px-4 py-3">
                      <Badge variant={cfg.variant}>{cfg.label}</Badge>
                    </td>

                    {/* Assigned */}
                    <td className="px-4 py-3 text-text-secondary">
                      {assignedId ? (
                        <span className="text-xs text-text-muted font-mono">{assignedId.slice(0, 8)}</span>
                      ) : (
                        <span className="text-xs text-text-muted italic">Unassigned</span>
                      )}
                    </td>

                    {/* Age */}
                    <td className="px-4 py-3 text-text-muted text-xs">{timeAgo(sub.createdAt)}</td>

                    {/* Actions */}
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {isUnclaimed && (
                          <form action={`/api/submissions/${sub.id}/claim`} method="POST">
                            <button
                              type="submit"
                              className="rounded-lg border border-nimbus-500/40 bg-nimbus-500/10 px-2.5 py-1 text-xs font-medium text-nimbus-600 transition-colors hover:bg-nimbus-500/20"
                            >
                              Claim
                            </button>
                          </form>
                        )}
                        <Link
                          href={`/admin/submissions/${sub.id}`}
                          className="rounded-lg border border-surface-border px-2.5 py-1 text-xs font-medium text-text-secondary transition-colors hover:border-nimbus-500/30 hover:text-text-primary"
                        >
                          View
                        </Link>
                      </div>
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
