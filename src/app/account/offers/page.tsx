import Link from 'next/link'
import { requireAuth } from '@/lib/auth-guard'
import { getOffersByBuyer } from '@/services/offer.service'
import { BackHeader } from '@/components/ui/back-header'
import { OffersList } from './offers-list'

export const metadata = {
  title: 'My Offers — Card Nimbus',
}

interface OffersPageProps {
  searchParams: Promise<{ page?: string }>
}

export default async function MyOffersPage({ searchParams }: OffersPageProps) {
  const session = await requireAuth()
  const params = await searchParams
  const page = Math.max(1, parseInt(params.page ?? '1', 10) || 1)

  const { offers, total, totalPages } = await getOffersByBuyer(session.user.id, page, 20)

  // Serialize for client
  const serialized = offers.map((o) => ({
    id: o.id,
    amount: o.amount,
    status: o.status,
    message: o.message,
    createdAt: o.createdAt.toISOString(),
    listing: o.listing as { id: string; title: string; price: number; images: string[] },
  }))

  return (
    <main className="min-h-screen bg-surface">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <BackHeader title="My Offers" crumbs={[{ label: "Marketplace Account", href: "/marketplace/account" }]} />

        <div className="hidden mb-8">
          <h1 className="text-2xl font-bold text-text-primary">My Offers</h1>
          <p className="text-sm text-text-muted mt-1">
            {total} offer{total !== 1 ? 's' : ''} you&apos;ve made on marketplace listings
          </p>
        </div>

        {serialized.length === 0 ? (
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
          <OffersList offers={serialized} />
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
