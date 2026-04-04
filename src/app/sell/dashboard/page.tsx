import Link from 'next/link'
import { requireAuth } from '@/lib/auth-guard'
import { getSellerProfile } from '@/services/seller.service'
import { getSellerListings } from '@/services/listing.service'
import { getPayoutSummary } from '@/services/payout.service'
import { getUserBadges } from '@/services/badge.service'
import { db } from '@/lib/db'
import { formatCurrency } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { BadgeGrid } from '@/components/badges/badge-grid'
import { BadgeProgress } from '@/components/badges/badge-progress'
import { BadgeVisibility } from '@prisma/client'

export const metadata = {
  title: 'Seller Dashboard — Card Nimbus',
}

// ─── Types ─────────────────────────────────────────────────────────────────────

interface CommissionTierShape {
  id: string
  name: string
  minSales: number
  rate: number
}

interface SellerProfileShape {
  totalSales: number
  rating: number | null
  ratingCount: number
  tier: CommissionTierShape | null
}

// ─── Tier helpers ──────────────────────────────────────────────────────────────

const TIER_COLORS: Record<string, { badge: string; bar: string; text: string }> = {
  STANDARD: {
    badge: 'bg-surface-overlay text-text-secondary border-surface-border',
    bar: 'bg-text-muted',
    text: 'text-text-secondary',
  },
  SILVER: {
    badge: 'bg-slate-800 text-slate-300 border-slate-600',
    bar: 'bg-slate-400',
    text: 'text-slate-300',
  },
  GOLD: {
    badge: 'bg-amber-950 text-amber-300 border-amber-700',
    bar: 'bg-amber-400',
    text: 'text-amber-300',
  },
}

function getTierColors(tierName?: string | null) {
  if (!tierName) return TIER_COLORS.STANDARD
  const key = tierName.toUpperCase()
  return TIER_COLORS[key] ?? TIER_COLORS.STANDARD
}

// ─── Tier Progress Card ────────────────────────────────────────────────────────

interface TierProgressCardProps {
  profile: SellerProfileShape
  allTiers: CommissionTierShape[]
  nextTier: CommissionTierShape | null
  progressPct: number
}

function TierProgressCard({ profile, allTiers: _allTiers, nextTier, progressPct }: TierProgressCardProps) {
  const tierName = profile.tier?.name ?? 'STANDARD'
  const colors = getTierColors(tierName)
  const currentRate = profile.tier?.rate ?? 0.1

  return (
    <Card className="p-6 mb-8">
      {/* Header row */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <span
            className={`inline-flex items-center px-3 py-1 rounded-full border text-xs font-bold tracking-wide uppercase ${colors.badge}`}
          >
            {tierName}
          </span>
          <span className={`text-sm font-semibold ${colors.text}`}>
            {(currentRate * 100).toFixed(0)}% commission rate
          </span>
        </div>
        {nextTier && (
          <span className="text-xs text-text-muted">
            {profile.totalSales} / {nextTier.minSales} sales
          </span>
        )}
      </div>

      {/* Progress bar */}
      {nextTier ? (
        <>
          <div className="w-full h-3 bg-surface-overlay rounded-full overflow-hidden mb-2">
            <div
              className={`h-full rounded-full transition-all duration-700 ${colors.bar}`}
              style={{ width: `${progressPct}%` }}
            />
          </div>
          <div className="flex items-center justify-between">
            <p className="text-xs text-text-muted">
              <span className="font-semibold text-text-secondary">
                {nextTier.minSales - profile.totalSales}
              </span>{' '}
              more sales to reach{' '}
              <span className={`font-semibold ${getTierColors(nextTier.name).text}`}>
                {nextTier.name}
              </span>
            </p>
            <span className="text-xs font-bold text-text-muted">{progressPct}%</span>
          </div>

          {/* Next tier benefit preview */}
          <div className={`mt-4 rounded-xl border px-4 py-3 ${getTierColors(nextTier.name).badge} border-opacity-40`}>
            <p className="text-xs font-bold uppercase tracking-widest mb-1 opacity-70">
              {nextTier.name} tier unlocks
            </p>
            <p className="text-xs">
              Commission drops to{' '}
              <span className="font-bold">{(nextTier.rate * 100).toFixed(0)}%</span>
              {' '}(saving you {((currentRate - nextTier.rate) * 100).toFixed(0)} percentage points per sale)
            </p>
          </div>
        </>
      ) : (
        <div className="flex items-center gap-2 mt-1">
          <div className={`h-3 w-full rounded-full ${colors.bar}`} />
          <span className="text-xs font-bold text-text-muted whitespace-nowrap ml-2">Max tier</span>
        </div>
      )}
    </Card>
  )
}

// ─── Stat Card ─────────────────────────────────────────────────────────────────

interface StatCardProps {
  label: string
  value: string
  sub?: string
}

function StatCard({ label, value, sub }: StatCardProps) {
  return (
    <Card className="p-6">
      <p className="text-xs text-text-muted uppercase tracking-wide mb-1">{label}</p>
      <p className="text-2xl font-bold text-text-primary">{value}</p>
      {sub && <p className="text-xs text-text-secondary mt-1">{sub}</p>}
    </Card>
  )
}

export default async function SellerDashboardPage() {
  const session = await requireAuth()
  const userId = (session.user as { id: string }).id

  let profile
  try {
    profile = await getSellerProfile(userId)
  } catch {
    return (
      <main className="min-h-screen bg-surface">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <h1 className="text-2xl font-bold text-text-primary mb-4">No Seller Profile</h1>
          <p className="text-text-secondary mb-6">
            You need to create a seller profile before accessing the dashboard.
          </p>
          <Link
            href="/sell-your-cards"
            className="inline-flex items-center px-6 py-3 rounded-xl bg-nimbus-500 text-white font-semibold hover:bg-nimbus-600 transition-colors"
          >
            Get Started
          </Link>
        </div>
      </main>
    )
  }

  const [payoutSummary, listingsData, userBadges] = await Promise.all([
    getPayoutSummary(profile.id),
    getSellerListings(profile.id, 1, 5),
    getUserBadges(userId),
  ])

  // Badge progress — next unearned milestone
  const earnedSlugs = new Set(userBadges.map((ub) => ub.badge.slug))
  const milestoneProgress = await (async () => {
    const milestones = [
      { slug: 'first-sale', target: 1 },
      { slug: '10-sales', target: 10 },
      { slug: '50-sales', target: 50 },
      { slug: '100-sales', target: 100 },
      { slug: '500-sales', target: 500 },
    ]
    const items = []
    for (const m of milestones) {
      if (earnedSlugs.has(m.slug)) continue
      const badge = await db.badge.findUnique({
        where: { slug: m.slug },
        select: { name: true, icon: true, visibility: true, isActive: true },
      })
      if (!badge?.isActive || badge.visibility !== BadgeVisibility.PUBLIC) continue
      items.push({
        badgeSlug: m.slug,
        badgeName: badge.name,
        badgeIcon: badge.icon ?? null,
        label: `${badge.name}: ${profile.totalSales} / ${m.target} sales`,
        current: profile.totalSales,
        target: m.target,
      })
      break // only show the next unearned milestone
    }
    return items
  })()

  // Get all tiers to calculate next tier progress
  const allTiers = await db.commissionTier.findMany({ orderBy: { minSales: 'asc' } })
  const currentTierIndex = allTiers.findIndex((t) => t.id === profile.tierId)
  const nextTier = allTiers[currentTierIndex + 1] ?? null

  const progressPct =
    nextTier && profile.tier
      ? Math.min(
          100,
          Math.round(
            ((profile.totalSales - profile.tier.minSales) /
              (nextTier.minSales - profile.tier.minSales)) *
              100
          )
        )
      : 100

  return (
    <main className="min-h-screen bg-surface">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-text-primary">Seller Dashboard</h1>
            <p className="text-sm text-text-muted mt-1">Manage your listings, orders, and payouts.</p>
          </div>
          <Link
            href="/sell"
            className="px-4 py-2 rounded-xl bg-nimbus-500 text-white text-sm font-semibold hover:bg-nimbus-600 transition-colors"
          >
            + New Listing
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard
            label="Total Sales"
            value={String(profile.totalSales)}
          />
          <StatCard
            label="Total Earned"
            value={formatCurrency(payoutSummary.totalEarned)}
            sub={`${formatCurrency(payoutSummary.pendingPayouts)} pending`}
          />
          <StatCard
            label="Avg. Rating"
            value={profile.rating !== null ? `${profile.rating.toFixed(1)} / 5` : 'N/A'}
            sub={`${profile.ratingCount} review${profile.ratingCount !== 1 ? 's' : ''}`}
          />
          <StatCard
            label="Current Tier"
            value={profile.tier?.name ?? 'Standard'}
            sub={
              nextTier
                ? `${profile.totalSales} / ${nextTier.minSales} sales to ${nextTier.name}`
                : 'Top tier reached'
            }
          />
        </div>

        {/* Tier Progression */}
        <TierProgressCard
          profile={profile}
          allTiers={allTiers}
          nextTier={nextTier}
          progressPct={progressPct}
        />

        {/* Badge Progress */}
        {milestoneProgress.length > 0 && (
          <div className="mb-8">
            <h2 className="text-base font-semibold text-text-primary mb-3">Badge Progress</h2>
            <BadgeProgress progress={milestoneProgress} />
          </div>
        )}

        {/* My Badges */}
        {userBadges.length > 0 && (
          <div className="mb-8">
            <h2 className="text-base font-semibold text-text-primary mb-3">My Badges</h2>
            <BadgeGrid userBadges={userBadges.map((ub) => ({ id: ub.id, awardedAt: ub.awardedAt, badge: ub.badge }))} />
          </div>
        )}

        {/* Quick Nav */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Listings', href: '/sell/listings', icon: '📋' },
            { label: 'Orders', href: '/sell/orders', icon: '📦' },
            { label: 'Payouts', href: '/sell/payouts', icon: '💰' },
            { label: 'Reviews', href: '/sell/reviews', icon: '⭐' },
          ].map((item) => (
            <Link key={item.href} href={item.href}>
              <Card hover className="p-4 text-center">
                <div className="text-2xl mb-2">{item.icon}</div>
                <p className="text-sm font-medium text-text-primary">{item.label}</p>
              </Card>
            </Link>
          ))}
        </div>

        {/* Recent Listings */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-text-primary">Recent Listings</h2>
            <Link href="/sell/listings" className="text-xs text-nimbus-600 hover:text-nimbus-700 transition-colors">
              View all
            </Link>
          </div>
          {listingsData.items.length === 0 ? (
            <p className="text-sm text-text-muted text-center py-6">
              No listings yet.{' '}
              <Link href="/sell" className="text-nimbus-600 hover:underline">
                Create your first listing
              </Link>
            </p>
          ) : (
            <div className="space-y-3">
              {listingsData.items.map((listing) => (
                <div
                  key={listing.id}
                  className="flex items-center justify-between py-3 border-b border-surface-border last:border-0"
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-text-primary truncate">{listing.title}</p>
                    <p className="text-xs text-text-muted">
                      {new Date(listing.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 ml-4">
                    <Badge
                      variant={
                        listing.moderationStatus === 'APPROVED'
                          ? 'success'
                          : listing.moderationStatus === 'REJECTED'
                          ? 'danger'
                          : 'warning'
                      }
                      size="sm"
                    >
                      {listing.moderationStatus}
                    </Badge>
                    <span className="text-sm font-semibold text-nimbus-600">
                      ${listing.price.toFixed(2)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </main>
  )
}
