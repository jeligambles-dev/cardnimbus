'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { SafeImage } from '@/components/safe-image'
import { BadgeIcon } from '@/components/badges/badge-icon'
import { DealBadge } from '@/components/deals/deal-badge'
import { LikeButton } from '@/components/marketplace/like-button'
import { BuyNowButton } from '@/components/marketplace/buy-now-button'
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
    grade?: number | null
    gradingCompany?: string | null
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
  const mainImage = listing.images[0] ?? '/card-default.jpg'
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
            'relative bg-white rounded-2xl overflow-hidden',
            'border-[3px] border-nimbus-500',
            'shadow-[0_4px_0_0_rgba(255,0,0,0.15)]',
            'transition-all duration-200',
            'group-hover:shadow-[0_8px_20px_-4px_rgba(255,0,0,0.35)]',
            'group-hover:-translate-y-1',
            'group-hover:border-nimbus-600',
            'p-2.5 flex flex-col gap-2',
          ].join(' ')}
        >
          {/* HEADER — Title + Price (like Pokemon card name + HP) */}
          <div className="flex items-start justify-between gap-2 px-1 pt-0.5">
            <h3 className="text-[13px] font-black text-gold-600 leading-tight line-clamp-2 flex-1 min-h-[2rem]">
              {listing.title}
            </h3>
            <div className="flex items-baseline gap-0.5 shrink-0">
              <span className="text-nimbus-600 font-black text-lg leading-none">
                {formatCurrency(listing.price)}
              </span>
            </div>
          </div>

          {/* GRADING PANEL — only for slabs */}
          {listing.category === 'SLAB' && listing.gradingCompany && listing.grade != null && (
            <div className="flex items-center gap-2 mx-1 rounded-lg border-2 border-nimbus-500 bg-gradient-to-r from-nimbus-50 to-white px-2 py-1.5">
              <span className="flex h-6 items-center rounded bg-nimbus-500 px-1.5 text-[10px] font-black uppercase tracking-wider text-white">
                {listing.gradingCompany}
              </span>
              <span className="flex h-6 items-center text-[15px] font-black leading-none text-nimbus-600">
                {listing.grade.toFixed(1)}
              </span>
              <span className="ml-auto text-[9px] font-bold uppercase tracking-wider text-text-muted">
                Grade
              </span>
            </div>
          )}

          {/* IMAGE FRAME — Pokemon card 5:7 aspect ratio (2.5" × 3.5") */}
          <div className="relative aspect-[5/7] bg-gradient-to-br from-nimbus-500 via-nimbus-500 to-nimbus-600 overflow-hidden rounded-lg shadow-inner">
            <SafeImage
              src={mainImage}
              alt={listing.title}
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              className="object-cover transition-transform duration-300 group-hover:scale-110"
            />

            {/* Deal badge */}
            {listing.dealScoreBand && listing.dealScore !== null && (
              <div className="absolute top-1.5 left-1.5 z-10">
                <DealBadge
                  dealScoreBand={listing.dealScoreBand as DealScoreBand}
                  dealScore={listing.dealScore}
                />
              </div>
            )}

            {/* Like button */}
            <div className="absolute top-1.5 right-1.5 z-10">
              <LikeButton listingId={listing.id} size="sm" />
            </div>
          </div>

          {/* INFO STRIP — category + condition + seller (like card type/stats) */}
          <div className="flex items-center justify-between gap-2 px-1 py-1 border-y border-black">
            <div className="flex items-center gap-1.5 min-w-0">
              <span className="rounded bg-nimbus-100 px-1.5 py-0.5 text-[9px] font-black uppercase tracking-wider text-nimbus-700 shrink-0">
                {listing.category.replace(/_/g, ' ')}
              </span>
              {listing.category === 'SLAB' && listing.gradingCompany && listing.grade != null ? (
                <span className="rounded bg-nimbus-500 px-1.5 py-0.5 text-[9px] font-black uppercase tracking-wider text-white shrink-0">
                  {listing.gradingCompany} {listing.grade.toFixed(1)}
                </span>
              ) : listing.condition && (
                <span className="rounded bg-surface-overlay px-1.5 py-0.5 text-[9px] font-black uppercase tracking-wider text-text-secondary shrink-0">
                  {listing.condition}
                </span>
              )}
            </div>
            <StarRating rating={listing.seller.rating} />
          </div>

          {/* SELLER STRIP */}
          <div className="flex items-center justify-between gap-2 px-1 pb-1 border-b border-black">
            <span className="text-[11px] text-text-secondary truncate font-semibold">
              {sellerName}
            </span>
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

          {/* Buy now button at the bottom */}
          <BuyNowButton listingId={listing.id} size="sm" />
        </div>
      </Link>
    </motion.div>
  )
}
