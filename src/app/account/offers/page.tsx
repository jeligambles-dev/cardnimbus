import Link from 'next/link'
import { requireAuth } from '@/lib/auth-guard'
import { getOffersByBuyer } from '@/services/offer.service'
import { Badge } from '@/components/ui/badge'
import { BackHeader } from '@/components/ui/back-header'
import { formatCurrency } from '@/lib/utils'
import { OfferStatus } from '@prisma/client'

export const metadata = {
  title: 'My Offers — Card Nimbus',
}

type BadgeVariant = 'default' | 'success' | 'warning' | 'danger' | 'nimbus'

const STATUS_MAP: Record<OfferStatus, { variant: BadgeVariant; label: string }> = {
  PENDING:   { variant: 'warning',  label: 'Pending' },
  ACCEPTED:  { variant: 'success',  label: 'Accepted' },
  REJECTED:  { variant: 'danger',   label: 'Rejected' },
  COUNTERED: { variant: 'nimbus',   label: 'Countered' },
  EXPIRED:   { variant: 'default',  label: 'Expired' },
}

interface OffersPageProps {
  searchParams: Promise<{ page?: string }>
}

export default async function MyOffersPage({ searchParams }: OffersPageProps) {
  const session = await requireAuth()
  const params = await searchParams
  const page = Math.max(1, parseInt(params.page ?? '1', 10) || 1)

  const { offers, total, totalPages } = await getOffersByBuyer(session.user.id, page, 20)

  return (
    <main className="min-h-screen bg-surface">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <BackHeader title="My Offers" href="/marketplace/account" />

        <div className="hidden md:block mb-8">
          <h1 className="text-2xl font-bold text-text-primary">My Offers</h1>
          <p className="text-sm text-text-muted mt-1">
            {total} offer{total !== 1 ? 's' : ''} you&apos;ve made on marketplace listings
          </p>
        </div>

        {offers.length === 0 ? (
          <div className="rounded-2xl border border-surface-border bg-surface-raised py-16 text-center">
            <p className="text-lg font-semibold text-text-primary mb-2">No offers yet</p>
            <p className="text-sm text-text-muted mb-4">
              When you make an offer on a listing, it will appear here.
            </p>
            <Link
              href="/marketplace?view=all"
              className="inline-flex rounded-xl bg-nimbus-500 px-5 py-2 text-sm font-semibold text-white hover:bg-nimbus-600 transition-colors"
            >
              Browse Marketplace
            </Link>
          </div>
        ) : (
          <ul className="space-y-3">
            {offers.map((offer) => {
              const cfg = STATUS_MAP[offer.status]
              const listing = offer.listing as { id: string; title: string; price: number; images: string[] }
              const thumb = listing.images?.[0]
              const needsAction = offer.status === 'COUNTERED'

              return (
                <li key={offer.id}>
                  <Link
                    href={`/marketplace/${listing.id}`}
                    className="flex items-center gap-4 rounded-xl border border-surface-border bg-surface-raised p-4 transition-all hover:border-nimbus-500/40 hover:shadow-lg hover:shadow-nimbus-500/5"
                  >
                    {/* Thumbnail */}
                    <div className="h-14 w-14 shrink-0 overflow-hidden rounded-lg border border-surface-border bg-white">
                      {thumb ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={thumb} alt={listing.title} className="h-full w-full object-contain p-1" />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-text-muted text-xs font-bold">CN</div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="truncate font-semibold text-text-primary">{listing.title}</p>
                      <p className="text-xs text-text-muted mt-0.5">
                        Listed at {formatCurrency(listing.price)} · {new Date(offer.createdAt).toLocaleDateString()}
                      </p>
                      {offer.message && (
                        <p className="text-xs text-text-secondary mt-1 truncate">
                          &quot;{offer.message}&quot;
                        </p>
                      )}
                    </div>

                    <div className="flex flex-col items-end gap-1.5 shrink-0">
                      <Badge variant={cfg.variant}>{cfg.label}</Badge>
                      <span className="text-sm font-bold text-nimbus-600">
                        {formatCurrency(offer.amount)}
                      </span>
                      {needsAction && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-amber-600">
                          <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse" />
                          Review counter
                        </span>
                      )}
                    </div>
                  </Link>
                </li>
              )
            })}
          </ul>
        )}

        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-6 text-sm">
            <p className="text-text-muted">Page {page} of {totalPages}</p>
            <div className="flex gap-2">
              {page > 1 && (
                <Link href={`/account/offers?page=${page - 1}`} className="rounded-lg border border-surface-border bg-white px-3 py-1.5 hover:bg-surface-overlay">
                  Previous
                </Link>
              )}
              {page < totalPages && (
                <Link href={`/account/offers?page=${page + 1}`} className="rounded-lg border border-surface-border bg-white px-3 py-1.5 hover:bg-surface-overlay">
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
