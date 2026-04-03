import Link from 'next/link'
import { requireAuth } from '@/lib/auth-guard'
import { getSellerProfile } from '@/services/seller.service'
import { getSellerListings } from '@/services/listing.service'
import { getPayoutSummary } from '@/services/payout.service'
import { db } from '@/lib/db'
import { formatCurrency } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'

export const metadata = {
  title: 'Seller Dashboard — Card Nimbus',
}

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

  const [payoutSummary, listingsData] = await Promise.all([
    getPayoutSummary(profile.id),
    getSellerListings(profile.id, 1, 5),
  ])

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

        {/* Tier Progress */}
        {nextTier && (
          <Card className="p-6 mb-8">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-medium text-text-primary">
                Progress to <span className="text-nimbus-400">{nextTier.name}</span>
              </p>
              <span className="text-sm text-text-muted">{progressPct}%</span>
            </div>
            <div className="w-full h-2 bg-surface-overlay rounded-full overflow-hidden">
              <div
                className="h-full bg-nimbus-500 rounded-full transition-all duration-500"
                style={{ width: `${progressPct}%` }}
              />
            </div>
            <p className="text-xs text-text-muted mt-2">
              {nextTier.minSales - profile.totalSales} more sales to reach {nextTier.name} (
              {(nextTier.rate * 100).toFixed(0)}% commission rate)
            </p>
          </Card>
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
            <Link href="/sell/listings" className="text-xs text-nimbus-400 hover:text-nimbus-300 transition-colors">
              View all
            </Link>
          </div>
          {listingsData.items.length === 0 ? (
            <p className="text-sm text-text-muted text-center py-6">
              No listings yet.{' '}
              <Link href="/sell" className="text-nimbus-400 hover:underline">
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
                    <span className="text-sm font-semibold text-nimbus-400">
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
