import Link from 'next/link'
import { requireAuth } from '@/lib/auth-guard'
import { getOffersBySeller } from '@/services/offer.service'
import { Badge } from '@/components/ui/badge'
import { BackHeader } from '@/components/ui/back-header'
import { formatCurrency } from '@/lib/utils'
import { OfferStatus } from '@prisma/client'

export const metadata = {
  title: 'Incoming Offers — Card Nimbus',
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

export default async function SellerOffersPage({ searchParams }: OffersPageProps) {
  const session = await requireAuth()
  const params = await searchParams
  const page = Math.max(1, parseInt(params.page ?? '1', 10) || 1)

  const { offers, total, totalPages } = await getOffersBySeller(session.user.id, page, 20)

  return (
    <main className="min-h-screen bg-surface">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <BackHeader title="Incoming Offers" href="/sell/listings" />

        <div className="hidden md:block mb-8">
          <h1 className="text-2xl font-bold text-text-primary">Incoming Offers</h1>
          <p className="text-sm text-text-muted mt-1">
            {total} offer{total !== 1 ? 's' : ''} on your listings
          </p>
        </div>

        {offers.length === 0 ? (
          <div className="rounded-2xl border border-surface-border bg-surface-raised py-16 text-center">
            <p className="text-lg font-semibold text-text-primary mb-2">No offers yet</p>
            <p className="text-sm text-text-muted">
              When a buyer makes an offer on one of your listings, it will appear here.
            </p>
          </div>
        ) : (
          <ul className="space-y-3">
            {offers.map((offer) => {
              const cfg = STATUS_MAP[offer.status]
              const listing = offer.listing as { id: string; title: string; price: number; images: string[] }
              const buyer = offer.buyer as { id: string; name: string | null; email: string; avatar: string | null }
              const thumb = listing.images?.[0]
              const needsAction = offer.status === 'PENDING'

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
                      <div className="flex items-center gap-2 mt-0.5">
                        {buyer.avatar ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={buyer.avatar} alt="" className="h-4 w-4 rounded-full object-cover" />
                        ) : (
                          <div className="h-4 w-4 rounded-full bg-nimbus-500 text-white flex items-center justify-center text-[8px] font-bold">
                            {(buyer.name ?? buyer.email).charAt(0).toUpperCase()}
                          </div>
                        )}
                        <p className="text-xs text-text-muted truncate">
                          {buyer.name ?? buyer.email} · {new Date(offer.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      {offer.message && (
                        <p className="text-xs text-text-secondary mt-1 truncate">
                          &quot;{offer.message}&quot;
                        </p>
                      )}
                    </div>

                    <div className="flex flex-col items-end gap-1.5 shrink-0">
                      <Badge variant={cfg.variant}>{cfg.label}</Badge>
                      <div className="text-right">
                        <p className="text-xs text-text-muted">Offer</p>
                        <p className="text-sm font-bold text-nimbus-600">{formatCurrency(offer.amount)}</p>
                      </div>
                      <p className="text-[10px] text-text-muted">
                        Listed: {formatCurrency(listing.price)}
                      </p>
                      {needsAction && (
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

        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-6 text-sm">
            <p className="text-text-muted">Page {page} of {totalPages}</p>
            <div className="flex gap-2">
              {page > 1 && (
                <Link href={`/sell/offers?page=${page - 1}`} className="rounded-lg border border-surface-border bg-white px-3 py-1.5 hover:bg-surface-overlay">
                  Previous
                </Link>
              )}
              {page < totalPages && (
                <Link href={`/sell/offers?page=${page + 1}`} className="rounded-lg border border-surface-border bg-white px-3 py-1.5 hover:bg-surface-overlay">
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
