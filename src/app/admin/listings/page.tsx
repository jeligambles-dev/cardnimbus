import Link from 'next/link'
import { requireAdmin } from '@/lib/auth-guard'
import { db } from '@/lib/db'
import { Badge } from '@/components/ui/badge'
import { formatCurrency } from '@/lib/utils'
import { ListingModerationStatus, ProductCategory } from '@prisma/client'

export const metadata = {
  title: 'Listing Moderation — Admin',
}

type BadgeVariant = 'default' | 'success' | 'warning' | 'danger' | 'nimbus'

function moderationBadge(status: ListingModerationStatus) {
  const map: Record<ListingModerationStatus, { variant: BadgeVariant; label: string }> = {
    DRAFT:          { variant: 'default',  label: 'Draft' },
    PENDING_REVIEW: { variant: 'warning',  label: 'Pending Review' },
    APPROVED:       { variant: 'success',  label: 'Approved' },
    REJECTED:       { variant: 'danger',   label: 'Rejected' },
    SUSPENDED:      { variant: 'danger',   label: 'Suspended' },
  }
  const entry = map[status] ?? { variant: 'default' as BadgeVariant, label: status }
  return <Badge variant={entry.variant}>{entry.label}</Badge>
}

const MODERATION_OPTIONS: Array<{ value: string; label: string }> = [
  { value: '',               label: 'All' },
  { value: 'PENDING_REVIEW', label: 'Pending Review' },
  { value: 'APPROVED',       label: 'Approved' },
  { value: 'REJECTED',       label: 'Rejected' },
  { value: 'SUSPENDED',      label: 'Suspended' },
  { value: 'DRAFT',          label: 'Draft' },
]

interface AdminListingsPageProps {
  searchParams: Promise<{ moderationStatus?: string; page?: string }>
}

const LIMIT = 25

export default async function AdminListingsPage({ searchParams }: AdminListingsPageProps) {
  await requireAdmin()
  const { moderationStatus: statusParam, page: pageParam } = await searchParams
  const page = Math.max(1, parseInt(pageParam ?? '1', 10) || 1)

  const moderationFilter = Object.values(ListingModerationStatus).includes(
    statusParam as ListingModerationStatus
  )
    ? (statusParam as ListingModerationStatus)
    : undefined

  const where = moderationFilter ? { moderationStatus: moderationFilter } : {}
  const skip = (page - 1) * LIMIT

  const [listings, total] = await Promise.all([
    db.listing.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip,
      take: LIMIT,
      include: {
        seller: {
          include: {
            user: { select: { id: true, name: true, email: true } },
          },
        },
      },
    }),
    db.listing.count({ where }),
  ])

  const totalPages = Math.ceil(total / LIMIT)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-text-primary">Listing Moderation</h1>
        <p className="mt-1 text-sm text-text-secondary">{total} listing{total !== 1 ? 's' : ''}</p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        {MODERATION_OPTIONS.map(({ value, label }) => {
          const isActive = (value === '' && !statusParam) || statusParam === value
          const href = value ? `?moderationStatus=${value}` : '?'
          return (
            <Link
              key={value}
              href={href}
              className={[
                'rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors',
                isActive
                  ? 'border-nimbus-600 bg-nimbus-500/10 text-nimbus-400'
                  : 'border-surface-border bg-surface-overlay text-text-secondary hover:text-text-primary',
              ].join(' ')}
            >
              {label}
            </Link>
          )
        })}
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-surface-border bg-surface-raised">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-surface-border bg-surface-overlay">
              <th className="px-4 py-3 text-left font-medium text-text-secondary">Title</th>
              <th className="px-4 py-3 text-left font-medium text-text-secondary">Seller</th>
              <th className="px-4 py-3 text-left font-medium text-text-secondary">Category</th>
              <th className="px-4 py-3 text-left font-medium text-text-secondary">Price</th>
              <th className="px-4 py-3 text-left font-medium text-text-secondary">Status</th>
              <th className="px-4 py-3 text-left font-medium text-text-secondary">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-surface-border">
            {listings.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-text-muted">
                  No listings found.
                </td>
              </tr>
            ) : (
              listings.map((listing) => (
                <tr key={listing.id} className="hover:bg-surface-overlay transition-colors">
                  <td className="px-4 py-3 max-w-xs">
                    <Link
                      href={`/admin/listings/${listing.id}`}
                      className="font-medium text-text-primary hover:text-nimbus-400 line-clamp-2"
                    >
                      {listing.title}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-text-secondary">
                    <div>{listing.seller.user.name ?? '—'}</div>
                    <div className="text-xs text-text-muted">{listing.seller.user.email}</div>
                  </td>
                  <td className="px-4 py-3 text-text-secondary capitalize">
                    {listing.category.toLowerCase().replace(/_/g, ' ')}
                  </td>
                  <td className="px-4 py-3 text-text-secondary">
                    {formatCurrency(listing.price)}
                  </td>
                  <td className="px-4 py-3">
                    {moderationBadge(listing.moderationStatus)}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      {listing.moderationStatus === ListingModerationStatus.PENDING_REVIEW && (
                        <>
                          <form action={`/api/admin/listings/${listing.id}/approve`} method="POST">
                            <button
                              type="submit"
                              className="rounded-lg border border-emerald-800 bg-emerald-950 px-3 py-1 text-xs font-medium text-emerald-400 hover:bg-emerald-900 transition-colors"
                            >
                              Approve
                            </button>
                          </form>
                          <form action={`/api/admin/listings/${listing.id}/reject`} method="POST">
                            <button
                              type="submit"
                              className="rounded-lg border border-red-800 bg-red-950 px-3 py-1 text-xs font-medium text-red-400 hover:bg-red-900 transition-colors"
                            >
                              Reject
                            </button>
                          </form>
                        </>
                      )}
                      <Link
                        href={`/admin/listings/${listing.id}`}
                        className="rounded-lg border border-surface-border bg-surface-overlay px-3 py-1 text-xs font-medium text-text-secondary hover:text-text-primary transition-colors"
                      >
                        View
                      </Link>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          {page > 1 && (
            <Link
              href={`?${statusParam ? `moderationStatus=${statusParam}&` : ''}page=${page - 1}`}
              className="rounded-lg border border-surface-border bg-surface-overlay px-3 py-1.5 text-sm text-text-secondary hover:text-text-primary"
            >
              Previous
            </Link>
          )}
          <span className="text-sm text-text-muted">Page {page} of {totalPages}</span>
          {page < totalPages && (
            <Link
              href={`?${statusParam ? `moderationStatus=${statusParam}&` : ''}page=${page + 1}`}
              className="rounded-lg border border-surface-border bg-surface-overlay px-3 py-1.5 text-sm text-text-secondary hover:text-text-primary"
            >
              Next
            </Link>
          )}
        </div>
      )}
    </div>
  )
}
