import Link from 'next/link'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import { requireAuth } from '@/lib/auth-guard'
import { getDisputeById } from '@/services/dispute.service'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { formatCurrency } from '@/lib/utils'
import { DisputeStatus } from '@prisma/client'

type BadgeVariant = 'default' | 'success' | 'warning' | 'danger' | 'nimbus'

function disputeStatusBadge(status: DisputeStatus) {
  const map: Record<DisputeStatus, { variant: BadgeVariant; label: string }> = {
    OPEN:             { variant: 'warning',  label: 'Open' },
    UNDER_REVIEW:     { variant: 'nimbus',   label: 'Under Review' },
    RESOLVED_BUYER:   { variant: 'success',  label: 'Resolved in Your Favor' },
    RESOLVED_SELLER:  { variant: 'default',  label: 'Resolved for Seller' },
    ESCALATED:        { variant: 'danger',   label: 'Escalated' },
  }
  const entry = map[status] ?? { variant: 'default' as BadgeVariant, label: status }
  return <Badge variant={entry.variant} size="md">{entry.label}</Badge>
}

const STATUS_TIMELINE: DisputeStatus[] = [
  DisputeStatus.OPEN,
  DisputeStatus.UNDER_REVIEW,
  DisputeStatus.ESCALATED,
]

interface DisputeDetailPageProps {
  params: Promise<{ id: string }>
}

export default async function DisputeDetailPage({ params }: DisputeDetailPageProps) {
  const session = await requireAuth()
  const { id } = await params

  let dispute
  try {
    dispute = await getDisputeById(id)
  } catch {
    notFound()
  }

  // Only the filer can view their own dispute (or admins, handled separately)
  if (dispute.filedBy !== session.user.id) {
    notFound()
  }

  const isOpen = dispute.status === DisputeStatus.OPEN || dispute.status === DisputeStatus.UNDER_REVIEW

  return (
    <main className="min-h-screen bg-surface">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Back */}
        <Link
          href="/account/disputes"
          className="mb-6 inline-flex items-center gap-1.5 text-sm text-text-secondary hover:text-text-primary"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          Back to disputes
        </Link>

        {/* Header */}
        <div className="mb-8 flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-text-primary tracking-tight">Dispute Details</h1>
            <p className="mt-1 text-sm text-text-secondary">
              Filed {new Date(dispute.createdAt).toLocaleDateString(undefined, {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </p>
          </div>
          {disputeStatusBadge(dispute.status)}
        </div>

        <div className="space-y-5">
          {/* Order Summary */}
          <Card className="p-5">
            <h2 className="mb-3 text-sm font-semibold text-text-primary">Order Summary</h2>
            <dl className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <dt className="text-text-muted">Order #</dt>
                <dd className="font-medium text-text-primary">{dispute.order.orderNumber}</dd>
              </div>
              <div>
                <dt className="text-text-muted">Order Total</dt>
                <dd className="font-medium text-text-primary">{formatCurrency(dispute.order.totalAmount)}</dd>
              </div>
              <div>
                <dt className="text-text-muted">Order Status</dt>
                <dd className="font-medium text-text-primary capitalize">{dispute.order.status.toLowerCase()}</dd>
              </div>
            </dl>
            <div className="mt-3 pt-3 border-t border-surface-border">
              <Link
                href={`/account/orders/${dispute.order.id}`}
                className="text-xs text-nimbus-600 hover:underline"
              >
                View full order details →
              </Link>
            </div>
          </Card>

          {/* Reason */}
          <Card className="p-5">
            <h2 className="mb-3 text-sm font-semibold text-text-primary">Reason for Dispute</h2>
            <p className="text-sm text-text-secondary whitespace-pre-wrap">{dispute.reason}</p>
          </Card>

          {/* Evidence */}
          {dispute.evidence.length > 0 && (
            <Card className="p-5">
              <h2 className="mb-3 text-sm font-semibold text-text-primary">
                Evidence ({dispute.evidence.length} file{dispute.evidence.length !== 1 ? 's' : ''})
              </h2>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {dispute.evidence.map((url, i) => (
                  <a
                    key={i}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group relative aspect-square overflow-hidden rounded-lg border border-surface-border bg-surface-overlay hover:border-nimbus-500/50"
                  >
                    <Image
                      src={url}
                      alt={`Evidence ${i + 1}`}
                      fill
                      className="object-cover transition-transform group-hover:scale-105"
                    />
                  </a>
                ))}
              </div>
            </Card>
          )}

          {/* Status Timeline */}
          <Card className="p-5">
            <h2 className="mb-4 text-sm font-semibold text-text-primary">Status Timeline</h2>
            <ol className="relative border-l border-surface-border space-y-4 pl-5">
              {STATUS_TIMELINE.map((step) => {
                const isCompleted =
                  step === DisputeStatus.OPEN ||
                  (step === DisputeStatus.UNDER_REVIEW &&
                    (dispute.status === DisputeStatus.UNDER_REVIEW ||
                      dispute.status === DisputeStatus.ESCALATED ||
                      dispute.status === DisputeStatus.RESOLVED_BUYER ||
                      dispute.status === DisputeStatus.RESOLVED_SELLER)) ||
                  (step === DisputeStatus.ESCALATED && dispute.status === DisputeStatus.ESCALATED)
                const isCurrent = step === dispute.status

                return (
                  <li key={step} className="relative">
                    <span
                      className={[
                        'absolute -left-[22px] top-0.5 flex h-4 w-4 items-center justify-center rounded-full border',
                        isCompleted
                          ? 'border-nimbus-600 bg-nimbus-500'
                          : 'border-surface-border bg-surface-overlay',
                      ].join(' ')}
                    >
                      {isCompleted && (
                        <svg className="h-2.5 w-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </span>
                    <p className={[
                      'text-sm font-medium',
                      isCurrent ? 'text-nimbus-600' : isCompleted ? 'text-text-primary' : 'text-text-muted',
                    ].join(' ')}>
                      {step.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
                    </p>
                  </li>
                )
              })}

              {/* Resolved states */}
              {(dispute.status === DisputeStatus.RESOLVED_BUYER ||
                dispute.status === DisputeStatus.RESOLVED_SELLER) && (
                <li className="relative">
                  <span className="absolute -left-[22px] top-0.5 flex h-4 w-4 items-center justify-center rounded-full border border-nimbus-600 bg-nimbus-500">
                    <svg className="h-2.5 w-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </span>
                  <p className="text-sm font-medium text-nimbus-600">
                    {dispute.status === DisputeStatus.RESOLVED_BUYER
                      ? 'Resolved — Refund Issued'
                      : 'Resolved — Seller Decision'}
                  </p>
                  {dispute.resolvedAt && (
                    <p className="text-xs text-text-muted mt-0.5">
                      {new Date(dispute.resolvedAt).toLocaleDateString()}
                    </p>
                  )}
                </li>
              )}
            </ol>
          </Card>

          {/* Admin Notes */}
          {dispute.adminNotes && (
            <Card className="p-5 border-nimbus-300 bg-nimbus-50/30">
              <h2 className="mb-2 text-sm font-semibold text-nimbus-600">Note from Support</h2>
              <p className="text-sm text-text-secondary whitespace-pre-wrap">{dispute.adminNotes}</p>
            </Card>
          )}

          {/* Upload additional evidence CTA */}
          {isOpen && (
            <Card className="p-5 border-dashed">
              <h2 className="mb-1 text-sm font-semibold text-text-primary">Add More Evidence</h2>
              <p className="text-sm text-text-muted mb-3">
                Upload additional screenshots or photos to support your case.
              </p>
              <Link
                href={`/account/disputes/${dispute.id}/evidence`}
                className="inline-flex items-center gap-2 rounded-xl border border-surface-border bg-surface-overlay px-4 py-2 text-sm font-medium text-text-primary hover:border-nimbus-500/50 hover:text-nimbus-600 transition-colors"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                </svg>
                Upload Evidence
              </Link>
            </Card>
          )}
        </div>
      </div>
    </main>
  )
}
