import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import type { Metadata } from 'next'
import { getListingById } from '@/services/listing.service'
import { formatCurrency } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { DealBadge } from '@/components/deals/deal-badge'
import { ListingDetailActions } from '@/components/marketplace/listing-detail-actions'
import { ListingSuggestions } from '@/components/marketplace/listing-suggestions'
import { SellerRecentSales } from '@/components/marketplace/seller-recent-sales'
import type { DealScoreBand } from '@/services/deal-score.service'

interface ListingPageProps {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: ListingPageProps): Promise<Metadata> {
  const { id } = await params
  try {
    const listing = await getListingById(id)
    return {
      title: `${listing.title} — Card Nimbus Marketplace`,
      description: listing.description ?? `Buy ${listing.title} on Card Nimbus Marketplace.`,
      openGraph: {
        title: listing.title,
        description: listing.description ?? `Buy ${listing.title} on Card Nimbus Marketplace.`,
        images: listing.images[0] ? [{ url: listing.images[0] }] : [],
      },
    }
  } catch {
    return { title: 'Listing Not Found — Card Nimbus' }
  }
}

function StarRating({ rating, count }: { rating: number | null; count: number }) {
  if (rating === null) return <span className="text-sm text-text-muted">No ratings yet</span>
  const stars = Math.round(rating)
  return (
    <div className="flex items-center gap-1.5">
      <span className="flex items-center gap-0.5">
        {Array.from({ length: 5 }).map((_, i) => (
          <svg
            key={i}
            className={`w-4 h-4 ${i < stars ? 'text-amber-400' : 'text-surface-border'}`}
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.953a1 1 0 00.95.69h4.162c.969 0 1.371 1.24.588 1.81l-3.37 2.448a1 1 0 00-.364 1.118l1.286 3.953c.3.921-.755 1.688-1.54 1.118l-3.37-2.448a1 1 0 00-1.175 0l-3.37 2.448c-.784.57-1.838-.197-1.539-1.118l1.286-3.953a1 1 0 00-.364-1.118L2.062 9.38c-.783-.57-.38-1.81.588-1.81h4.162a1 1 0 00.95-.69l1.287-3.953z" />
          </svg>
        ))}
      </span>
      <span className="text-sm text-text-secondary">
        {rating.toFixed(1)} ({count} review{count !== 1 ? 's' : ''})
      </span>
    </div>
  )
}

export default async function ListingPage({ params }: ListingPageProps) {
  const { id } = await params

  let listing
  try {
    listing = await getListingById(id)
  } catch {
    notFound()
  }

  if (
    listing.moderationStatus !== 'APPROVED' ||
    listing.saleStatus === 'SOLD' ||
    listing.saleStatus === 'INACTIVE'
  ) {
    notFound()
  }

  const seller = listing.seller
  const sellerUser = seller.user as { name: string | null; avatar: string | null; createdAt: Date }
  const card = listing.card as {
    tcgPriceNM?: number | null
    tcgPriceLP?: number | null
    tcgPriceMP?: number | null
    tcgPriceHP?: number | null
    tcgPriceMarket?: number | null
    setName?: string
    name?: string
  } | null

  const hasTcgPrices =
    card &&
    (card.tcgPriceNM || card.tcgPriceLP || card.tcgPriceMP || card.tcgPriceHP || card.tcgPriceMarket)

  return (
    <main className="min-h-screen bg-surface">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-text-muted mb-8">
          <Link href="/marketplace" className="hover:text-nimbus-600 transition-colors">
            Marketplace
          </Link>
          <span>/</span>
          <span className="text-text-secondary truncate max-w-xs">{listing.title}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Left: Images + Description */}
          <div className="lg:col-span-2 flex flex-col gap-8">
            {/* Image Gallery */}
            <div className="flex flex-col gap-3">
              {/* Main image */}
              <div className="relative aspect-square bg-surface-overlay rounded-2xl overflow-hidden border border-surface-border">
                {listing.images[0] ? (
                  <Image
                    src={listing.images[0]}
                    alt={listing.title}
                    fill
                    className="object-contain"
                    priority
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-6xl font-bold text-nimbus-500/20">CN</span>
                  </div>
                )}
              </div>

              {/* Thumbnails */}
              {listing.images.length > 1 && (
                <div className="flex gap-2 overflow-x-auto pb-1">
                  {listing.images.map((img, i) => (
                    <div
                      key={i}
                      className="relative w-16 h-16 flex-shrink-0 rounded-lg overflow-hidden border border-surface-border"
                    >
                      <Image
                        src={img}
                        alt={`${listing.title} ${i + 1}`}
                        fill
                        className="object-cover"
                        sizes="64px"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Description */}
            {listing.description && (
              <div>
                <h2 className="text-lg font-semibold text-text-primary mb-3">Description</h2>
                <p className="text-text-secondary text-sm leading-relaxed whitespace-pre-wrap">
                  {listing.description}
                </p>
              </div>
            )}

            {/* TCGPlayer Price Comparison */}
            {hasTcgPrices && (
              <div>
                <h2 className="text-lg font-semibold text-text-primary mb-3">TCGPlayer Price Comparison</h2>
                <div className="rounded-xl border border-surface-border bg-surface-raised p-4">
                  <p className="text-xs text-text-muted mb-3 uppercase tracking-wide">Market Prices</p>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {card!.tcgPriceNM && (
                      <div className="text-center">
                        <p className="text-xs text-text-muted">NM</p>
                        <p className="text-sm font-semibold text-text-primary">{formatCurrency(card!.tcgPriceNM)}</p>
                      </div>
                    )}
                    {card!.tcgPriceLP && (
                      <div className="text-center">
                        <p className="text-xs text-text-muted">LP</p>
                        <p className="text-sm font-semibold text-text-primary">{formatCurrency(card!.tcgPriceLP)}</p>
                      </div>
                    )}
                    {card!.tcgPriceMP && (
                      <div className="text-center">
                        <p className="text-xs text-text-muted">MP</p>
                        <p className="text-sm font-semibold text-text-primary">{formatCurrency(card!.tcgPriceMP)}</p>
                      </div>
                    )}
                    {card!.tcgPriceHP && (
                      <div className="text-center">
                        <p className="text-xs text-text-muted">HP</p>
                        <p className="text-sm font-semibold text-text-primary">{formatCurrency(card!.tcgPriceHP)}</p>
                      </div>
                    )}
                    {card!.tcgPriceMarket && (
                      <div className="text-center">
                        <p className="text-xs text-text-muted">Market</p>
                        <p className="text-sm font-semibold text-nimbus-600">{formatCurrency(card!.tcgPriceMarket)}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right: Listing Info + Seller Sidebar */}
          <div className="flex flex-col gap-6">
            {/* Listing Details */}
            <div className="rounded-2xl border border-surface-border bg-surface-raised p-6">
              {/* Badges */}
              <div className="flex items-center gap-2 flex-wrap mb-4">
                <Badge variant="default" size="md">
                  {(listing.category as string).replace(/_/g, ' ')}
                </Badge>
                {listing.condition && (
                  <Badge variant="success" size="md">
                    {listing.condition as string}
                  </Badge>
                )}
                {listing.dealScoreBand && listing.dealScore !== null && (
                  <DealBadge
                    dealScoreBand={listing.dealScoreBand as DealScoreBand}
                    dealScore={listing.dealScore}
                  />
                )}
              </div>

              {/* Title */}
              <h1 className="text-2xl font-bold text-text-primary leading-tight mb-3">
                {listing.title}
              </h1>

              {/* Price */}
              <div className="text-3xl font-extrabold text-nimbus-600 mb-2">
                {formatCurrency(listing.price)}
              </div>
              {listing.suggestedPrice && (
                <p className="text-xs text-text-muted">
                  Market price: {formatCurrency(listing.suggestedPrice)}
                </p>
              )}

              {/* Actions */}
              <ListingDetailActions
                listingId={listing.id}
                listingTitle={listing.title}
                listingPrice={listing.price}
                sellerId={seller.id}
                sellerUserId={seller.userId}
              />
            </div>

            {/* Seller Info */}
            <div className="rounded-2xl border border-surface-border bg-surface-raised p-6">
              <h2 className="text-sm font-semibold text-text-muted uppercase tracking-wide mb-4">
                Seller
              </h2>
              <div className="flex items-center gap-3 mb-4">
                <div className="relative w-12 h-12 rounded-full overflow-hidden bg-surface-overlay border border-surface-border flex-shrink-0">
                  {sellerUser.avatar ? (
                    <Image
                      src={sellerUser.avatar}
                      alt={sellerUser.name ?? 'Seller'}
                      fill
                      className="object-cover"
                      sizes="48px"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-lg font-bold text-nimbus-600">
                      {(sellerUser.name ?? 'S').charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>
                <div>
                  <p className="font-semibold text-text-primary">{sellerUser.name ?? 'Anonymous'}</p>
                  {(seller as unknown as { tier?: { name: string } | null }).tier && (
                    <Badge variant="nimbus" size="sm" className="mt-1">
                      {(seller as unknown as { tier: { name: string } }).tier.name}
                    </Badge>
                  )}
                </div>
              </div>

              <div className="space-y-2 mb-4">
                <StarRating rating={seller.rating} count={seller.ratingCount} />
                <div className="flex items-center justify-between text-sm">
                  <span className="text-text-muted">Total sales</span>
                  <span className="text-text-primary font-medium">{seller.totalSales}</span>
                </div>
                {seller.responseTime && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-text-muted">Avg. response</span>
                    <span className="text-text-primary font-medium">
                      {seller.responseTime < 60
                        ? `${seller.responseTime}m`
                        : `${Math.round(seller.responseTime / 60)}h`}
                    </span>
                  </div>
                )}
                <div className="flex items-center justify-between text-sm">
                  <span className="text-text-muted">Verification</span>
                  <Badge
                    variant={
                      (sellerUser as unknown as { verificationLevel?: string }).verificationLevel === 'VERIFIED'
                        ? 'success'
                        : 'default'
                    }
                    size="sm"
                  >
                    {(sellerUser as unknown as { verificationLevel?: string }).verificationLevel ?? 'UNVERIFIED'}
                  </Badge>
                </div>
              </div>

              <Link
                href={`/seller/${seller.id}`}
                className="block w-full text-center py-2 px-4 rounded-xl border border-surface-border text-sm text-text-secondary hover:text-text-primary hover:border-nimbus-500/50 transition-colors"
              >
                View Profile
              </Link>
            </div>

            {/* Seller's recent sales + reviews */}
            <SellerRecentSales sellerProfileId={seller.id} />
          </div>
        </div>
      </div>

      {/* Suggestions: You may also like, More from seller, Recently viewed */}
      <ListingSuggestions
        listingId={listing.id}
        sellerName={sellerUser.name ?? 'this seller'}
      />
    </main>
  )
}
