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
import { FollowButton } from '@/components/marketplace/follow-button'
import { PriceTrend } from '@/components/marketplace/price-trend'
import { ProductDetails } from '@/components/marketplace/product-details'
import { ShippingInfo } from '@/components/marketplace/shipping-info'
import { BackHeader } from '@/components/ui/back-header'
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
  const sellerUser = seller.user as { name: string | null; avatar: string | null; createdAt: Date; country: string | null }
  const card = listing.card as {
    tcgPriceNM?: number | null
    tcgPriceLP?: number | null
    tcgPriceMP?: number | null
    tcgPriceHP?: number | null
    tcgPriceMarket?: number | null
    setName?: string
    name?: string
    cardNumber?: string
    rarity?: string | null
    language?: string | null
    printing?: string | null
  } | null

  const slabInfo = listing as unknown as { grade?: number | null; gradingCompany?: string | null }
  const isSlab = listing.category === 'SLAB'
  const detailRows = [
    { label: 'Category', value: (listing.category as string).replace(/_/g, ' ') },
    isSlab
      ? { label: 'Grading', value: slabInfo.gradingCompany && slabInfo.grade ? `${slabInfo.gradingCompany} ${slabInfo.grade.toFixed(1)}` : null }
      : { label: 'Condition', value: listing.condition ? (listing.condition as string) : null },
    { label: 'Set', value: card?.setName ?? null },
    { label: 'Card Number', value: card?.cardNumber ?? null },
    { label: 'Rarity', value: card?.rarity ?? null },
    { label: 'Language', value: card?.language ?? null },
    { label: 'Printing', value: card?.printing ?? null },
  ]

  return (
    <main className="min-h-screen bg-surface">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Mobile back header */}
        <BackHeader title={listing.title} crumbs={[{ label: "Marketplace", href: "/marketplace" }]} />

        {/* Desktop breadcrumb */}
        <nav className="hidden items-center gap-2 text-sm text-text-muted mb-6">
          <Link href="/marketplace" className="hover:text-nimbus-600 transition-colors">
            Marketplace
          </Link>
          <span>/</span>
          <span className="text-text-secondary truncate max-w-xs">{listing.title}</span>
        </nav>

        {/* Hero: images + buy box */}
        <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_1fr] gap-10 mb-10">
          {/* Images */}
          <div className="flex flex-col gap-3">
            <div className="relative aspect-square bg-white rounded-2xl overflow-hidden border border-surface-border">
              {listing.images[0] ? (
                <Image
                  src={listing.images[0]}
                  alt={listing.title}
                  fill
                  className="object-contain p-8"
                  priority
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-6xl font-bold text-nimbus-500/20">CN</span>
                </div>
              )}
            </div>

            {listing.images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-1">
                {listing.images.map((img, i) => (
                  <div
                    key={i}
                    className="relative w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden border border-surface-border bg-white"
                  >
                    <Image
                      src={img}
                      alt={`${listing.title} ${i + 1}`}
                      fill
                      className="object-contain p-2"
                      sizes="80px"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Buy box */}
          <div className="flex flex-col gap-5">
            <div>
              {/* Badges */}
              <div className="flex items-center gap-2 flex-wrap mb-3">
                <Badge variant="default" size="md">
                  {(listing.category as string).replace(/_/g, ' ')}
                </Badge>
                {listing.category === 'SLAB' && (listing as unknown as { gradingCompany?: string | null; grade?: number | null }).gradingCompany && (
                  <Badge variant="nimbus" size="md">
                    {(listing as unknown as { gradingCompany: string }).gradingCompany}{' '}
                    {(listing as unknown as { grade: number }).grade?.toFixed(1)}
                  </Badge>
                )}
                {listing.condition && listing.category !== 'SLAB' && (
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

              <h1 className="text-3xl font-black text-gold-600 leading-tight mb-1">
                {listing.title}
              </h1>
              {card?.setName && (
                <p className="text-sm text-text-muted">{card.setName}</p>
              )}

              {/* Grading panel — slabs only */}
              {isSlab && slabInfo.gradingCompany && slabInfo.grade != null && (
                <div className="mt-3 flex items-center gap-3 rounded-xl border-2 border-nimbus-500 bg-gradient-to-r from-nimbus-50 via-white to-white p-3">
                  <div className="flex h-14 w-14 shrink-0 flex-col items-center justify-center rounded-lg bg-nimbus-500 text-white">
                    <span className="text-[10px] font-black uppercase tracking-wider leading-none">
                      {slabInfo.gradingCompany}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-text-muted">
                      Grade
                    </p>
                    <p className="text-3xl font-black leading-none text-nimbus-600">
                      {slabInfo.grade.toFixed(1)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-text-muted">
                      Certified
                    </p>
                    <p className="text-sm font-bold text-text-primary">
                      {slabInfo.gradingCompany} Graded
                    </p>
                  </div>
                </div>
              )}
            </div>

            <div className="rounded-2xl border-2 border-nimbus-500 bg-white p-6 shadow-[0_4px_0_0_rgba(255,0,0,0.12)]">
              <p className="text-xs font-bold uppercase tracking-wider text-text-muted mb-1">
                Last Sale Price
              </p>
              <div className="text-4xl font-extrabold text-nimbus-600 mb-1">
                {formatCurrency(listing.price)}
              </div>
              {listing.suggestedPrice && (
                <p className="text-xs text-text-muted mb-4">
                  Market price: {formatCurrency(listing.suggestedPrice)}
                </p>
              )}

              <ListingDetailActions
                listingId={listing.id}
                listingTitle={listing.title}
                listingPrice={listing.price}
                sellerId={seller.id}
                sellerUserId={seller.userId}
              />
            </div>

            {/* Seller */}
            <div className="rounded-2xl border border-surface-border bg-white p-5">
              <p className="text-xs font-bold uppercase tracking-wider text-text-muted mb-3">
                Seller
              </p>
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
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-text-primary truncate">
                    {sellerUser.name ?? 'Anonymous'}
                  </p>
                  <StarRating rating={seller.rating} count={seller.ratingCount} />
                </div>
                {(seller as unknown as { tier?: { name: string } | null }).tier && (
                  <Badge variant="nimbus" size="sm">
                    {(seller as unknown as { tier: { name: string } }).tier.name}
                  </Badge>
                )}
              </div>

              <div className="grid grid-cols-2 gap-2 mb-4 text-sm">
                <div>
                  <p className="text-xs text-text-muted">Total sales</p>
                  <p className="font-semibold text-text-primary">{seller.totalSales}</p>
                </div>
                {seller.responseTime !== null && seller.responseTime !== undefined && (
                  <div>
                    <p className="text-xs text-text-muted">Avg. response</p>
                    <p className="font-semibold text-text-primary">
                      {seller.responseTime < 60
                        ? `${seller.responseTime}m`
                        : `${Math.round(seller.responseTime / 60)}h`}
                    </p>
                  </div>
                )}
              </div>

              <div className="flex gap-2">
                <div className="flex-1">
                  <FollowButton sellerProfileId={seller.id} />
                </div>
                <Link
                  href={`/seller/${seller.id}`}
                  className="flex-1 text-center py-2 px-4 rounded-xl border border-surface-border text-sm text-text-secondary hover:text-text-primary hover:border-nimbus-500/50 transition-colors"
                >
                  View Profile
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Price History — full width dark panel */}
        <div className="mb-10">
          <PriceTrend
            listingId={listing.id}
            currentPrice={listing.price}
            retailPrice={listing.suggestedPrice ?? card?.tcgPriceMarket ?? null}
          />
        </div>

        {/* Product Details — full width dark panel */}
        <div className="mb-10">
          <ProductDetails rows={detailRows} description={listing.description} />
        </div>

        {/* Shipping */}
        <div className="mb-10">
          <ShippingInfo
            shipsToCountries={(listing as unknown as { shipsToCountries: string[] }).shipsToCountries ?? []}
            sellerCountry={sellerUser.country}
          />
        </div>

        {/* TCGPlayer price comparison */}
        {card &&
          (card.tcgPriceNM || card.tcgPriceLP || card.tcgPriceMP || card.tcgPriceHP || card.tcgPriceMarket) && (
            <div className="mb-10 rounded-2xl border-2 border-nimbus-500 bg-white p-6 shadow-[0_4px_0_0_rgba(255,0,0,0.12)]">
              <h2 className="text-lg font-bold text-text-primary mb-1">TCGPlayer Price Comparison</h2>
              <p className="text-xs text-text-muted mb-4 uppercase tracking-wide">Market Prices by Condition</p>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
                {card.tcgPriceNM && (
                  <div>
                    <p className="text-xs text-text-muted">NM</p>
                    <p className="text-base font-bold text-text-primary">{formatCurrency(card.tcgPriceNM)}</p>
                  </div>
                )}
                {card.tcgPriceLP && (
                  <div>
                    <p className="text-xs text-text-muted">LP</p>
                    <p className="text-base font-bold text-text-primary">{formatCurrency(card.tcgPriceLP)}</p>
                  </div>
                )}
                {card.tcgPriceMP && (
                  <div>
                    <p className="text-xs text-text-muted">MP</p>
                    <p className="text-base font-bold text-text-primary">{formatCurrency(card.tcgPriceMP)}</p>
                  </div>
                )}
                {card.tcgPriceHP && (
                  <div>
                    <p className="text-xs text-text-muted">HP</p>
                    <p className="text-base font-bold text-text-primary">{formatCurrency(card.tcgPriceHP)}</p>
                  </div>
                )}
                {card.tcgPriceMarket && (
                  <div>
                    <p className="text-xs text-text-muted">Market</p>
                    <p className="text-base font-bold text-nimbus-600">{formatCurrency(card.tcgPriceMarket)}</p>
                  </div>
                )}
              </div>
            </div>
          )}

        {/* Seller recent sales + reviews */}
        <div className="mb-10">
          <SellerRecentSales sellerProfileId={seller.id} />
        </div>
      </div>

      {/* Related products — horizontal scroll */}
      <ListingSuggestions
        listingId={listing.id}
        sellerName={sellerUser.name ?? 'this seller'}
      />
    </main>
  )
}
