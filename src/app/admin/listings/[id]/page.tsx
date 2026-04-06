import Link from 'next/link'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import { requireAdmin } from '@/lib/auth-guard'
import { db } from '@/lib/db'
import { Badge } from '@/components/ui/badge'
import { formatCurrency } from '@/lib/utils'
import { ListingModerationStatus } from '@prisma/client'
import { ListingAdminActions } from './actions'

export const metadata = {
  title: 'Listing Detail — Admin',
}

type BadgeVariant = 'default' | 'success' | 'warning' | 'danger' | 'nimbus'

const STATUS_MAP: Record<string, { variant: BadgeVariant; label: string }> = {
  DRAFT:          { variant: 'default',  label: 'Draft' },
  PENDING_REVIEW: { variant: 'warning',  label: 'Pending Review' },
  APPROVED:       { variant: 'success',  label: 'Approved' },
  REJECTED:       { variant: 'danger',   label: 'Rejected' },
  SUSPENDED:      { variant: 'danger',   label: 'Suspended' },
  ACTIVE:         { variant: 'success',  label: 'Active' },
  SOLD:           { variant: 'default',  label: 'Sold' },
  INACTIVE:       { variant: 'default',  label: 'Inactive' },
  RESERVED:       { variant: 'warning',  label: 'Reserved' },
  EXPIRED:        { variant: 'danger',   label: 'Expired' },
}

interface Props {
  params: Promise<{ id: string }>
}

export default async function AdminListingDetailPage({ params }: Props) {
  await requireAdmin()
  const { id } = await params

  const listing = await db.listing.findUnique({
    where: { id },
    include: {
      seller: {
        include: {
          user: { select: { id: true, name: true, email: true, avatar: true, bannedAt: true } },
        },
      },
      card: true,
      _count: { select: { likes: true, offers: true } },
    },
  })

  if (!listing) notFound()

  const modCfg = STATUS_MAP[listing.moderationStatus] ?? { variant: 'default' as BadgeVariant, label: listing.moderationStatus }
  const saleCfg = STATUS_MAP[listing.saleStatus] ?? { variant: 'default' as BadgeVariant, label: listing.saleStatus }
  const sellerUser = listing.seller.user
  const isSlab = listing.category === 'SLAB'

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <Link
            href="/admin/listings"
            className="inline-flex items-center gap-1 text-sm text-text-muted hover:text-text-primary transition-colors mb-2"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            Back to listings
          </Link>
          <h1 className="text-2xl font-bold text-text-primary">{listing.title}</h1>
          <p className="mt-1 text-sm text-text-muted">
            ID: {listing.id} · Created {new Date(listing.createdAt).toLocaleDateString()}
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Badge variant={modCfg.variant} size="md">{modCfg.label}</Badge>
          <Badge variant={saleCfg.variant} size="md">{saleCfg.label}</Badge>
        </div>
      </div>

      {/* Admin actions */}
      <ListingAdminActions
        listingId={listing.id}
        moderationStatus={listing.moderationStatus}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Images */}
        <div className="lg:col-span-1">
          <h2 className="text-sm font-bold text-text-muted uppercase tracking-wider mb-3">Photos</h2>
          {listing.images.length === 0 ? (
            <p className="text-sm text-text-muted">No photos</p>
          ) : (
            <div className="grid grid-cols-2 gap-2">
              {listing.images.map((img, i) => (
                <div key={i} className="relative aspect-square rounded-lg overflow-hidden border border-surface-border bg-white">
                  <Image src={img} alt={`Photo ${i + 1}`} fill className="object-contain p-2" sizes="200px" />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Details */}
        <div className="lg:col-span-1 space-y-5">
          <h2 className="text-sm font-bold text-text-muted uppercase tracking-wider">Details</h2>

          <dl className="space-y-3 text-sm">
            <div className="grid grid-cols-[100px_1fr] gap-2">
              <dt className="text-text-muted">Price</dt>
              <dd className="font-bold text-nimbus-600 text-lg">{formatCurrency(listing.price)}</dd>
            </div>
            {listing.suggestedPrice && (
              <div className="grid grid-cols-[100px_1fr] gap-2">
                <dt className="text-text-muted">Market Price</dt>
                <dd className="text-text-primary">{formatCurrency(listing.suggestedPrice)}</dd>
              </div>
            )}
            <div className="grid grid-cols-[100px_1fr] gap-2">
              <dt className="text-text-muted">Category</dt>
              <dd className="text-text-primary capitalize">{listing.category.toLowerCase().replace(/_/g, ' ')}</dd>
            </div>
            {isSlab && listing.gradingCompany && listing.grade != null && (
              <div className="grid grid-cols-[100px_1fr] gap-2">
                <dt className="text-text-muted">Grading</dt>
                <dd>
                  <Badge variant="nimbus" size="md">{listing.gradingCompany} {listing.grade.toFixed(1)}</Badge>
                </dd>
              </div>
            )}
            {!isSlab && listing.condition && (
              <div className="grid grid-cols-[100px_1fr] gap-2">
                <dt className="text-text-muted">Condition</dt>
                <dd className="text-text-primary">{listing.condition}</dd>
              </div>
            )}
            <div className="grid grid-cols-[100px_1fr] gap-2">
              <dt className="text-text-muted">Views</dt>
              <dd className="text-text-primary">{listing.viewCount.toLocaleString()}</dd>
            </div>
            <div className="grid grid-cols-[100px_1fr] gap-2">
              <dt className="text-text-muted">Likes</dt>
              <dd className="text-text-primary">{listing._count.likes}</dd>
            </div>
            <div className="grid grid-cols-[100px_1fr] gap-2">
              <dt className="text-text-muted">Offers</dt>
              <dd className="text-text-primary">{listing._count.offers}</dd>
            </div>
            {listing.dealScore != null && (
              <div className="grid grid-cols-[100px_1fr] gap-2">
                <dt className="text-text-muted">Deal Score</dt>
                <dd className="text-text-primary">{listing.dealScore.toFixed(1)} ({listing.dealScoreBand})</dd>
              </div>
            )}
            {listing.shipsToCountries.length > 0 && (
              <div className="grid grid-cols-[100px_1fr] gap-2">
                <dt className="text-text-muted">Ships to</dt>
                <dd className="text-text-primary">{listing.shipsToCountries.length} countries</dd>
              </div>
            )}
          </dl>

          {listing.description && (
            <div>
              <h3 className="text-sm font-bold text-text-muted uppercase tracking-wider mb-2">Description</h3>
              <p className="text-sm text-text-secondary whitespace-pre-wrap">{listing.description}</p>
            </div>
          )}

          {listing.moderationNote && (
            <div className="rounded-lg border border-amber-300 bg-amber-50 p-3">
              <p className="text-xs font-bold text-amber-800 uppercase tracking-wider mb-1">Admin Note</p>
              <p className="text-sm text-amber-900">{listing.moderationNote}</p>
            </div>
          )}
        </div>

        {/* Seller */}
        <div className="lg:col-span-1">
          <h2 className="text-sm font-bold text-text-muted uppercase tracking-wider mb-3">Seller</h2>
          <div className="rounded-xl border border-surface-border bg-surface-raised p-4 space-y-3">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-nimbus-500 text-white font-bold text-xs flex items-center justify-center overflow-hidden shrink-0">
                {sellerUser.avatar ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={sellerUser.avatar} alt="" className="h-full w-full object-cover" />
                ) : (
                  (sellerUser.name ?? sellerUser.email).charAt(0).toUpperCase()
                )}
              </div>
              <div className="min-w-0">
                <p className="font-semibold text-text-primary truncate">{sellerUser.name ?? '—'}</p>
                <p className="text-xs text-text-muted truncate">{sellerUser.email}</p>
              </div>
            </div>
            {sellerUser.bannedAt && (
              <div className="rounded-lg bg-red-50 border border-red-300 px-3 py-2">
                <p className="text-xs font-bold text-red-700">USER BANNED</p>
              </div>
            )}
            <div className="text-sm space-y-1">
              <div className="flex justify-between">
                <span className="text-text-muted">Rating</span>
                <span className="text-text-primary">{listing.seller.rating?.toFixed(1) ?? '—'} ({listing.seller.ratingCount} reviews)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-muted">Total Sales</span>
                <span className="text-text-primary">{listing.seller.totalSales}</span>
              </div>
            </div>
            <Link
              href={`/admin/users?q=${encodeURIComponent(sellerUser.email)}`}
              className="block text-center text-xs font-bold text-nimbus-600 hover:text-nimbus-700 transition-colors"
            >
              View in Users →
            </Link>
          </div>

          {/* Card info */}
          {listing.card && (
            <div className="mt-4">
              <h2 className="text-sm font-bold text-text-muted uppercase tracking-wider mb-3">Linked Card</h2>
              <div className="rounded-xl border border-surface-border bg-surface-raised p-4 text-sm space-y-1">
                <p className="font-semibold text-text-primary">{listing.card.name}</p>
                <p className="text-text-muted">{listing.card.setName} · #{listing.card.cardNumber}</p>
                {listing.card.rarity && <p className="text-text-muted">Rarity: {listing.card.rarity}</p>}
                {listing.card.tcgPriceMarket && (
                  <p className="text-nimbus-600 font-semibold">TCG Market: {formatCurrency(listing.card.tcgPriceMarket)}</p>
                )}
              </div>
            </div>
          )}

          {/* Public link */}
          <div className="mt-4">
            <Link
              href={`/marketplace/${listing.id}`}
              target="_blank"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-nimbus-600 hover:text-nimbus-700 transition-colors"
            >
              View on Marketplace
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
