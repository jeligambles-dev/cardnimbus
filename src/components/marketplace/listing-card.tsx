'use client'

import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { Badge } from '@/components/ui/badge'
import { BadgeIcon } from '@/components/badges/badge-icon'
import { DealBadge } from '@/components/deals/deal-badge'
import { LikeButton } from '@/components/marketplace/like-button'
import { formatCurrency } from '@/lib/utils'
import type { DealScoreBand } from '@/services/deal-score.service'
import type { BadgeCategory } from '@prisma/client'

interface SellerBadge {
  name: string
  icon?: string | null
  category: BadgeCategory
}

interface ListingCardProps {
  listing: {
    id: string
    title: string
    price: number
    condition: string | null
    category: string
    images: string[]
    dealScore: number | null
    dealScoreBand: string | null
    seller: {
      rating: number | null
      user: {
        name: string | null
        avatar: string | null
      }
    }
  }
  index?: number
  sellerBadges?: SellerBadge[]
}

function StarRating({ rating }: { rating: number | null }) {
  if (rating === null) return <span className="text-xs text-text-muted">No ratings yet</span>
  const stars = Math.round(rating)
  return (
    <span className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <svg
          key={i}
          className={`w-3 h-3 ${i < stars ? 'text-amber-400' : 'text-text-muted'}`}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.953a1 1 0 00.95.69h4.162c.969 0 1.371 1.24.588 1.81l-3.37 2.448a1 1 0 00-.364 1.118l1.286 3.953c.3.921-.755 1.688-1.54 1.118l-3.37-2.448a1 1 0 00-1.175 0l-3.37 2.448c-.784.57-1.838-.197-1.539-1.118l1.286-3.953a1 1 0 00-.364-1.118L2.062 9.38c-.783-.57-.38-1.81.588-1.81h4.162a1 1 0 00.95-.69l1.287-3.953z" />
        </svg>
      ))}
      <span className="ml-1 text-xs text-text-secondary">{rating.toFixed(1)}</span>
    </span>
  )
}

export function ListingCard({ listing, index = 0, sellerBadges }: ListingCardProps) {
  const mainImage = listing.images[0] ?? null
  const sellerName = listing.seller.user.name ?? 'Seller'

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.06 }}
    >
      <Link href={`/marketplace/${listing.id}`} className="group block">
        <div
          className={[
            'relative bg-surface-raised border rounded-2xl overflow-hidden',
            'transition-all duration-300',
            'border-surface-border',
            'group-hover:border-nimbus-600/60 group-hover:shadow-xl group-hover:shadow-nimbus-500/10',
            'group-hover:-translate-y-1',
          ].join(' ')}
        >
          {/* Image */}
          <div className="relative aspect-[3/4] bg-surface-overlay overflow-hidden">
            {mainImage ? (
              <Image
                src={mainImage}
                alt={listing.title}
                fill
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                className="object-cover transition-transform duration-300 group-hover:scale-110"
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-3xl font-bold text-nimbus-500/40 select-none tracking-tight">
                  CN
                </span>
              </div>
            )}

            {/* Deal badge */}
            {listing.dealScoreBand && listing.dealScore !== null && (
              <div className="absolute top-2 left-2">
                <DealBadge
                  dealScoreBand={listing.dealScoreBand as DealScoreBand}
                  dealScore={listing.dealScore}
                />
              </div>
            )}

            {/* Like button overlay */}
            <div className="absolute top-2 right-2">
              <LikeButton listingId={listing.id} size="sm" />
            </div>
          </div>

          {/* Body */}
          <div className="p-3 flex flex-col gap-2">
            {/* Badges */}
            <div className="flex items-center gap-1.5 flex-wrap">
              <Badge variant="default" size="sm">
                {listing.category.replace(/_/g, ' ')}
              </Badge>
              {listing.condition && (
                <Badge variant="success" size="sm">
                  {listing.condition}
                </Badge>
              )}
            </div>

            {/* Title */}
            <p className="text-sm font-semibold text-text-primary leading-snug line-clamp-2">
              {listing.title}
            </p>

            {/* Price */}
            <div className="flex items-baseline gap-2 mt-auto">
              <span className="text-nimbus-600 font-bold text-base">
                {formatCurrency(listing.price)}
              </span>
            </div>

            {/* Seller */}
            <div className="flex items-center justify-between pt-1 border-t border-surface-border">
              <div className="flex items-center gap-1 min-w-0">
                <span className="text-xs text-text-muted truncate max-w-[80px]">{sellerName}</span>
                {sellerBadges && sellerBadges.length > 0 && (
                  <div className="flex items-center gap-0.5 shrink-0">
                    {sellerBadges.slice(0, 2).map((b) => (
                      <BadgeIcon
                        key={b.name}
                        name={b.name}
                        icon={b.icon}
                        category={b.category}
                        size="small"
                      />
                    ))}
                  </div>
                )}
              </div>
              <StarRating rating={listing.seller.rating} />
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  )
}
