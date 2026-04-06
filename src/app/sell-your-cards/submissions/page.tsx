import Link from 'next/link'
import { requireAuth } from '@/lib/auth-guard'
import { getUserSubmissions } from '@/services/submission.service'
import { Badge } from '@/components/ui/badge'
import { BackHeader } from '@/components/ui/back-header'
import { formatCurrency } from '@/lib/utils'
import { SubmissionStatus } from '@prisma/client'

export const metadata = {
  title: 'My Submissions — Card Nimbus',
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

export default async function MySubmissionsPage() {
  const session = await requireAuth()
  const { submissions } = await getUserSubmissions(session.user.id, 1, 50)

  return (
    <main className="min-h-screen bg-surface">
      <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
        <BackHeader title="Sell Cards to Us" crumbs={[{ label: "Account", href: "/account" }]} />

        {/* Breadcrumb — desktop */}
        <nav className="mb-6 hidden md:flex items-center gap-2 text-sm text-text-secondary">
          <Link href="/account" className="hover:text-text-primary transition-colors">Account</Link>
          <span>/</span>
          <Link href="/sell-your-cards" className="hover:text-text-primary transition-colors">Sell Your Cards</Link>
          <span>/</span>
          <span className="text-text-primary">My Submissions</span>
        </nav>

        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-text-primary">My Submissions</h1>
            <p className="mt-1 text-sm text-text-secondary">{submissions.length} total</p>
          </div>
          <Link
            href="/sell-your-cards/submit"
            className="rounded-xl bg-nimbus-500 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-nimbus-500/25 transition-colors hover:bg-nimbus-600"
          >
            + New Submission
          </Link>
        </div>

        {submissions.length === 0 ? (
          <div className="flex flex-col items-center gap-4 rounded-2xl border border-surface-border bg-surface-raised py-16 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-surface-overlay text-text-muted">
              <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
              </svg>
            </div>
            <div>
              <p className="font-semibold text-text-primary">No submissions yet</p>
              <p className="mt-1 text-sm text-text-secondary">Submit your first card to get started.</p>
            </div>
            <Link
              href="/sell-your-cards/submit"
              className="rounded-xl bg-nimbus-500 px-5 py-2 text-sm font-semibold text-white shadow-lg shadow-nimbus-500/25 transition-colors hover:bg-nimbus-600"
            >
              Submit a Card
            </Link>
          </div>
        ) : (
          <ul className="space-y-3">
            {submissions.map((sub) => {
              const cfg = STATUS_CONFIG[sub.status]
              const title = sub.card?.name ?? 'Unlisted Card'
              const thumb = sub.images[0]

              return (
                <li key={sub.id}>
                  <Link
                    href={`/sell-your-cards/submissions/${sub.id}`}
                    className="flex items-center gap-4 rounded-xl border border-surface-border bg-surface-raised p-4 transition-all hover:border-nimbus-500/40 hover:shadow-lg hover:shadow-nimbus-500/5"
                  >
                    {/* Thumbnail */}
                    <div className="h-14 w-14 shrink-0 overflow-hidden rounded-lg border border-surface-border bg-surface-overlay">
                      {thumb ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={thumb} alt={title} className="h-full w-full object-cover" />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-text-muted">
                          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                          </svg>
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="truncate font-semibold text-text-primary">{title}</p>
                      <p className="mt-0.5 text-xs text-text-muted">
                        {sub.estimatedCondition} · {new Date(sub.createdAt).toLocaleDateString()}
                      </p>
                    </div>

                    <div className="flex flex-col items-end gap-1.5 shrink-0">
                      <Badge variant={cfg.variant}>{cfg.label}</Badge>
                      {sub.offeredPrice != null && (
                        <span className="text-sm font-bold text-nimbus-600">
                          Offer: {formatCurrency(sub.offeredPrice)}
                        </span>
                      )}
                      {sub.counterOfferPrice != null && (
                        <span className="text-xs font-semibold text-amber-600">
                          Counter: {formatCurrency(sub.counterOfferPrice)}
                        </span>
                      )}
                      {sub.finalAcceptedPrice != null && (
                        <span className="text-xs font-bold text-emerald-600">
                          Final: {formatCurrency(sub.finalAcceptedPrice)}
                        </span>
                      )}
                      {sub.status === 'OFFER_SENT' && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-amber-600">
                          <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse" />
                          Action needed
                        </span>
                      )}
                    </div>
                  </Link>
                </li>
              )
            })}
          </ul>
        )}
      </div>
    </main>
  )
}
