import Link from 'next/link'
import { notFound } from 'next/navigation'
import { requireAuth } from '@/lib/auth-guard'
import { getSubmissionById } from '@/services/submission.service'
import { Badge } from '@/components/ui/badge'
import { BackHeader } from '@/components/ui/back-header'
import { formatCurrency } from '@/lib/utils'
import { SubmissionStatus } from '@prisma/client'
import { OfferActions } from './offer-actions'

export const metadata = {
  title: 'Submission Detail — Card Nimbus',
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

const EVENT_LABELS: Record<string, string> = {
  SUBMITTED: 'Submission received',
  CLAIMED: 'Review started',
  OFFER_SENT: 'Offer sent',
  OFFER_ACCEPTED: 'Offer accepted',
  OFFER_REJECTED: 'Offer declined',
  OFFER_COUNTERED: 'Counter offer sent',
  REJECTED: 'Submission rejected',
  'STATUS_UPDATED:SHIPPING': 'Waiting for your shipment',
  'STATUS_UPDATED:RECEIVED': 'Cards received',
  'STATUS_UPDATED:COMPLETED': 'Payment sent',
}

interface Props {
  params: Promise<{ id: string }>
}

export default async function SubmissionDetailPage({ params }: Props) {
  const { id } = await params
  const session = await requireAuth()

  let submission
  try {
    submission = await getSubmissionById(id)
  } catch {
    notFound()
  }

  // Users can only see their own submissions
  if (submission.userId !== session.user.id) notFound()

  const { status, card, images, events, offeredPrice, estimatedCondition, createdAt } = submission
  const cfg = STATUS_CONFIG[status]
  const title = card?.name ?? 'Unlisted Card'

  return (
    <main className="min-h-screen bg-surface">
      <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
        <BackHeader title={title} crumbs={[{ label: "Account", href: "/account" }, { label: "My Submissions", href: "/sell-your-cards/submissions" }]} />

        {/* Breadcrumb — desktop */}
        <nav className="mb-6 hidden md:flex items-center gap-2 text-sm text-text-secondary">
          <Link href="/sell-your-cards/submissions" className="hover:text-text-primary transition-colors">My Submissions</Link>
          <span>/</span>
          <span className="truncate text-text-primary">{title}</span>
        </nav>

        {/* Header */}
        <div className="mb-8 flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-text-primary">{title}</h1>
            {card && <p className="mt-0.5 text-sm text-text-secondary">{card.setName}</p>}
            <p className="mt-1 text-xs text-text-muted">
              Condition: {estimatedCondition} · Submitted {new Date(createdAt).toLocaleDateString()}
            </p>
          </div>
          <Badge variant={cfg.variant} size="md">{cfg.label}</Badge>
        </div>

        {/* Offer actions */}
        {status === SubmissionStatus.OFFER_SENT && offeredPrice != null && (
          <div className="mb-8">
            <OfferActions submissionId={id} offeredPrice={offeredPrice} />
          </div>
        )}

        {/* Accepted — link to shipping instructions */}
        {status === SubmissionStatus.ACCEPTED && (
          <div className="mb-8 flex items-center justify-between rounded-xl border border-emerald-700/40 bg-emerald-950/30 px-5 py-4">
            <div>
              <p className="font-semibold text-emerald-400">Offer Accepted!</p>
              <p className="text-sm text-text-secondary">
                {submission.finalAcceptedPrice != null && (
                  <>Final price: <strong className="text-text-primary">{formatCurrency(submission.finalAcceptedPrice)}</strong> · </>
                )}
                Please ship your cards to us.
              </p>
            </div>
            <Link
              href={`/sell-your-cards/submissions/${id}/shipping`}
              className="shrink-0 rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-emerald-500"
            >
              Shipping Info →
            </Link>
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Image gallery */}
          <div>
            <h2 className="mb-3 font-semibold text-text-primary">Photos</h2>
            {images.length === 0 ? (
              <p className="text-sm text-text-muted">No photos uploaded.</p>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                {images.map((url, i) => (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    key={i}
                    src={url}
                    alt={`Photo ${i + 1}`}
                    className="aspect-square w-full rounded-lg border border-surface-border object-cover"
                  />
                ))}
              </div>
            )}
          </div>

          {/* Status timeline */}
          <div>
            <h2 className="mb-3 font-semibold text-text-primary">Timeline</h2>
            <ol className="relative border-l border-surface-border pl-5 space-y-5">
              {events.map((event) => {
                const label = EVENT_LABELS[event.type] ?? event.type
                return (
                  <li key={event.id} className="relative">
                    <span className="absolute -left-[21px] flex h-3 w-3 items-center justify-center rounded-full border border-nimbus-500 bg-surface ring-4 ring-surface" />
                    <p className="text-sm font-medium text-text-primary">{label}</p>
                    <p className="text-xs text-text-muted">
                      {new Date(event.createdAt).toLocaleString()}
                    </p>
                    {event.payload && typeof event.payload === 'object' && 'offeredPrice' in (event.payload as object) && (
                      <p className="mt-0.5 text-xs text-nimbus-600">
                        Offer: {formatCurrency((event.payload as { offeredPrice: number }).offeredPrice)}
                      </p>
                    )}
                  </li>
                )
              })}
            </ol>
          </div>
        </div>

        {/* Card pricing info */}
        {card && (card.tcgPriceNM || card.tcgPriceLP) && (
          <div className="mt-8 rounded-xl border border-surface-border bg-surface-raised p-5">
            <h2 className="mb-3 font-semibold text-text-primary">TCGPlayer Market Prices</h2>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {[
                { label: 'NM', price: card.tcgPriceNM },
                { label: 'LP', price: card.tcgPriceLP },
                { label: 'MP', price: card.tcgPriceMP },
                { label: 'HP', price: card.tcgPriceHP },
              ].map(({ label, price }) =>
                price != null ? (
                  <div key={label} className="rounded-lg bg-surface-overlay p-3 text-center">
                    <p className="text-xs text-text-muted">{label}</p>
                    <p className="mt-0.5 font-semibold text-text-primary">{formatCurrency(price)}</p>
                  </div>
                ) : null
              )}
            </div>
          </div>
        )}
      </div>
    </main>
  )
}
