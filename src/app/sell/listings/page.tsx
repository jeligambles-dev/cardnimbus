import Link from 'next/link'
import { requireAuth } from '@/lib/auth-guard'
import { getSellerProfile } from '@/services/seller.service'
import { getSellerListings } from '@/services/listing.service'
import { formatCurrency } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { notFound } from 'next/navigation'

export const metadata = {
  title: 'My Listings — Card Nimbus',
}

interface ListingsPageProps {
  searchParams: Promise<{ page?: string }>
}

function moderationBadgeVariant(status: string): 'success' | 'warning' | 'danger' | 'default' {
  if (status === 'APPROVED') return 'success'
  if (status === 'REJECTED' || status === 'SUSPENDED') return 'danger'
  if (status === 'PENDING_REVIEW') return 'warning'
  return 'default'
}

function saleBadgeVariant(status: string): 'success' | 'warning' | 'danger' | 'default' {
  if (status === 'ACTIVE') return 'success'
  if (status === 'SOLD') return 'default'
  if (status === 'RESERVED') return 'warning'
  if (status === 'EXPIRED') return 'danger'
  return 'default'
}

export default async function SellerListingsPage({ searchParams }: ListingsPageProps) {
  const session = await requireAuth()
  const userId = (session.user as { id: string }).id

  let profile
  try {
    profile = await getSellerProfile(userId)
  } catch {
    notFound()
  }

  const params = await searchParams
  const page = Math.max(1, parseInt(params.page ?? '1', 10) || 1)

  const { items: listings, total, totalPages } = await getSellerListings(profile.id, page, 20)

  return (
    <main className="min-h-screen bg-surface">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-text-primary">My Listings</h1>
            <p className="text-sm text-text-muted mt-1">
              {total} listing{total !== 1 ? 's' : ''} total
            </p>
          </div>
          <Link
            href="/sell"
            className="px-4 py-2 rounded-xl bg-nimbus-500 text-white text-sm font-semibold hover:bg-nimbus-600 transition-colors"
          >
            + New Listing
          </Link>
        </div>

        {listings.length === 0 ? (
          <Card className="p-12 text-center">
            <p className="text-text-muted mb-4">You haven&apos;t created any listings yet.</p>
            <Link
              href="/sell"
              className="inline-flex items-center px-6 py-3 rounded-xl bg-nimbus-500 text-white font-semibold hover:bg-nimbus-600 transition-colors text-sm"
            >
              Create Your First Listing
            </Link>
          </Card>
        ) : (
          <Card>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-surface-border">
                    <th className="text-left px-6 py-4 text-xs font-semibold text-text-muted uppercase tracking-wide">
                      Listing
                    </th>
                    <th className="text-left px-4 py-4 text-xs font-semibold text-text-muted uppercase tracking-wide hidden sm:table-cell">
                      Category
                    </th>
                    <th className="text-left px-4 py-4 text-xs font-semibold text-text-muted uppercase tracking-wide">
                      Price
                    </th>
                    <th className="text-left px-4 py-4 text-xs font-semibold text-text-muted uppercase tracking-wide hidden md:table-cell">
                      Moderation
                    </th>
                    <th className="text-left px-4 py-4 text-xs font-semibold text-text-muted uppercase tracking-wide">
                      Status
                    </th>
                    <th className="text-left px-4 py-4 text-xs font-semibold text-text-muted uppercase tracking-wide hidden lg:table-cell">
                      Views
                    </th>
                    <th className="px-4 py-4" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-border">
                  {listings.map((listing) => (
                    <tr key={listing.id} className="hover:bg-surface-overlay/30 transition-colors">
                      <td className="px-6 py-4">
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-text-primary truncate max-w-xs">
                            {listing.title}
                          </p>
                          <p className="text-xs text-text-muted">
                            {new Date(listing.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </td>
                      <td className="px-4 py-4 hidden sm:table-cell">
                        <span className="text-sm text-text-secondary">
                          {(listing.category as string).replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <span className="text-sm font-semibold text-nimbus-400">
                          {formatCurrency(listing.price)}
                        </span>
                      </td>
                      <td className="px-4 py-4 hidden md:table-cell">
                        <Badge
                          variant={moderationBadgeVariant(listing.moderationStatus as string)}
                          size="sm"
                        >
                          {(listing.moderationStatus as string).replace(/_/g, ' ')}
                        </Badge>
                      </td>
                      <td className="px-4 py-4">
                        <Badge
                          variant={saleBadgeVariant(listing.saleStatus as string)}
                          size="sm"
                        >
                          {listing.saleStatus as string}
                        </Badge>
                      </td>
                      <td className="px-4 py-4 hidden lg:table-cell">
                        <span className="text-sm text-text-muted">{listing.viewCount}</span>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2">
                          <Link
                            href={`/marketplace/${listing.id}`}
                            className="text-xs text-nimbus-400 hover:text-nimbus-300 transition-colors"
                          >
                            View
                          </Link>
                          {listing.moderationStatus === 'DRAFT' && (
                            <button className="text-xs text-text-muted hover:text-text-primary transition-colors">
                              Submit
                            </button>
                          )}
                          {listing.saleStatus === 'SOLD' && (
                            <button className="text-xs text-text-muted hover:text-text-primary transition-colors">
                              Relist
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-8 flex justify-center items-center gap-3">
            {page > 1 && (
              <a
                href={`/sell/listings?page=${page - 1}`}
                className="px-4 py-2 text-sm rounded-xl bg-surface-overlay border border-surface-border text-text-primary hover:bg-surface-border transition-colors"
              >
                Previous
              </a>
            )}
            <span className="text-sm text-text-secondary">
              Page {page} of {totalPages}
            </span>
            {page < totalPages && (
              <a
                href={`/sell/listings?page=${page + 1}`}
                className="px-4 py-2 text-sm rounded-xl bg-surface-overlay border border-surface-border text-text-primary hover:bg-surface-border transition-colors"
              >
                Next
              </a>
            )}
          </div>
        )}
      </div>
    </main>
  )
}
