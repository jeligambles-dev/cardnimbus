import { notFound } from 'next/navigation'
import Image from 'next/image'
import type { Metadata } from 'next'
import { getPublicSellerProfile } from '@/services/seller.service'
import { getSellerListings } from '@/services/listing.service'
import { getUserBadges } from '@/services/badge.service'
import { ListingCard } from '@/components/marketplace/listing-card'
import { Badge } from '@/components/ui/badge'
import { BadgeGrid } from '@/components/badges/badge-grid'

interface SellerPageProps {
  params: Promise<{ username: string }>
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
            className={`w-5 h-5 ${i < stars ? 'text-amber-400' : 'text-surface-border'}`}
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.953a1 1 0 00.95.69h4.162c.969 0 1.371 1.24.588 1.81l-3.37 2.448a1 1 0 00-.364 1.118l1.286 3.953c.3.921-.755 1.688-1.54 1.118l-3.37-2.448a1 1 0 00-1.175 0l-3.37 2.448c-.784.57-1.838-.197-1.539-1.118l1.286-3.953a1 1 0 00-.364-1.118L2.062 9.38c-.783-.57-.38-1.81.588-1.81h4.162a1 1 0 00.95-.69l1.287-3.953z" />
          </svg>
        ))}
      </span>
      <span className="text-text-secondary">
        {rating.toFixed(1)} <span className="text-text-muted">({count} review{count !== 1 ? 's' : ''})</span>
      </span>
    </div>
  )
}

export async function generateMetadata({ params }: SellerPageProps): Promise<Metadata> {
  const { username } = await params
  try {
    const profile = await getPublicSellerProfile(username)
    const name = (profile.user as { name: string | null }).name ?? 'Seller'
    return {
      title: `${name}'s Store — Card Nimbus`,
      description: profile.bio ?? `Browse listings from ${name} on Card Nimbus Marketplace.`,
    }
  } catch {
    return { title: 'Seller Not Found — Card Nimbus' }
  }
}

export default async function SellerProfilePage({ params }: SellerPageProps) {
  const { username } = await params

  let profile
  try {
    profile = await getPublicSellerProfile(username)
  } catch {
    notFound()
  }

  const sellerUser = profile.user as { name: string | null; avatar: string | null; createdAt: Date }
  const activeListingsCount = (profile._count as { listings: number }).listings

  // Fetch active listings and badges
  const [{ items: listings }, userBadges] = await Promise.all([
    getSellerListings(profile.id, 1, 20),
    getUserBadges(profile.userId),
  ])
  const activeListings = listings.filter(
    (l) => l.moderationStatus === 'APPROVED' && l.saleStatus === 'ACTIVE'
  )

  // Map to badge grid shape
  const badgeEntries = userBadges.map((ub) => ({
    id: ub.id,
    awardedAt: ub.awardedAt,
    badge: ub.badge,
  }))

  const memberSince = new Date(sellerUser.createdAt).toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  })

  return (
    <main className="min-h-screen bg-surface">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Seller Profile Header */}
        <div className="rounded-2xl border border-surface-border bg-surface-raised p-8 mb-10">
          <div className="flex flex-col sm:flex-row items-start gap-6">
            {/* Avatar */}
            <div className="relative w-20 h-20 rounded-full overflow-hidden bg-surface-overlay border-2 border-nimbus-700 flex-shrink-0">
              {sellerUser.avatar ? (
                <Image
                  src={sellerUser.avatar}
                  alt={sellerUser.name ?? 'Seller'}
                  fill
                  className="object-cover"
                  sizes="80px"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-2xl font-bold text-nimbus-400">
                  {(sellerUser.name ?? 'S').charAt(0).toUpperCase()}
                </div>
              )}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 flex-wrap mb-2">
                <h1 className="text-2xl font-bold text-text-primary">
                  {sellerUser.name ?? 'Anonymous Seller'}
                </h1>
                {profile.tier && (
                  <Badge variant="nimbus" size="sm">
                    {profile.tier.name}
                  </Badge>
                )}
              </div>

              <div className="mb-3">
                <StarRating rating={profile.rating} count={profile.ratingCount} />
              </div>

              <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-text-secondary mb-4">
                <span>
                  <span className="font-semibold text-text-primary">{profile.totalSales}</span> total sales
                </span>
                <span>
                  <span className="font-semibold text-text-primary">{activeListingsCount}</span> active listings
                </span>
                <span>Member since <span className="font-medium text-text-primary">{memberSince}</span></span>
                {profile.responseTime && (
                  <span>
                    Avg. response:{' '}
                    <span className="font-medium text-text-primary">
                      {profile.responseTime < 60
                        ? `${profile.responseTime}m`
                        : `${Math.round(profile.responseTime / 60)}h`}
                    </span>
                  </span>
                )}
              </div>

              {profile.bio && (
                <p className="text-text-secondary text-sm leading-relaxed max-w-2xl">
                  {profile.bio}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Badges */}
        {badgeEntries.length > 0 && (
          <div className="mb-10">
            <h2 className="text-xl font-bold text-text-primary mb-6">Badges</h2>
            <BadgeGrid userBadges={badgeEntries} />
          </div>
        )}

        {/* Active Listings */}
        <div>
          <h2 className="text-xl font-bold text-text-primary mb-6">
            Active Listings
            {activeListings.length > 0 && (
              <span className="ml-2 text-sm font-normal text-text-muted">
                ({activeListings.length})
              </span>
            )}
          </h2>

          {activeListings.length === 0 ? (
            <div className="text-center py-20 rounded-2xl border border-surface-border bg-surface-raised">
              <p className="text-text-muted">No active listings at the moment.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {activeListings.map((listing, i) => (
                <ListingCard key={listing.id} listing={listing} index={i} />
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  )
}
