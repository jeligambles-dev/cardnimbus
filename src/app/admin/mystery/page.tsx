import { db } from '@/lib/db'
import { requireAdmin } from '@/lib/auth-guard'
import { formatCurrency } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import { MysteryCollectionStatus } from '@prisma/client'

type BadgeVariant = 'default' | 'success' | 'warning' | 'danger' | 'nimbus'

function statusVariant(status: MysteryCollectionStatus): BadgeVariant {
  switch (status) {
    case 'ACTIVE':
      return 'success'
    case 'LOW_STOCK':
      return 'warning'
    case 'SOLD_OUT':
      return 'danger'
    case 'DRAFT':
    case 'ARCHIVED':
    default:
      return 'default'
  }
}

export default async function AdminMysteryPage() {
  await requireAdmin()

  const collections = await db.mysteryCollection.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      versions: {
        orderBy: { version: 'desc' },
        take: 1,
        select: {
          id: true,
          version: true,
          status: true,
          stockRemaining: true,
        },
      },
    },
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Mystery Collections</h1>
          <p className="mt-1 text-sm text-text-secondary">
            {collections.length} collection(s) total
          </p>
        </div>
        <Link
          href="/admin/mystery/new"
          className="inline-flex items-center gap-2 rounded-xl bg-nimbus-500 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-nimbus-500/25 transition-colors hover:bg-nimbus-600"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          New Collection
        </Link>
      </div>

      <div className="overflow-hidden rounded-xl border border-surface-border bg-surface-raised">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-surface-border bg-surface-overlay">
              <th className="px-4 py-3 text-left font-medium text-text-secondary">Name</th>
              <th className="px-4 py-3 text-left font-medium text-text-secondary">Tier</th>
              <th className="px-4 py-3 text-left font-medium text-text-secondary">Price</th>
              <th className="px-4 py-3 text-left font-medium text-text-secondary">Status</th>
              <th className="px-4 py-3 text-left font-medium text-text-secondary">Version</th>
              <th className="px-4 py-3 text-left font-medium text-text-secondary">Stock Remaining</th>
              <th className="px-4 py-3 text-left font-medium text-text-secondary">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-surface-border">
            {collections.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-text-muted">
                  No collections yet.
                </td>
              </tr>
            ) : (
              collections.map((col) => {
                const latestVersion = col.versions[0] ?? null
                return (
                  <tr key={col.id} className="transition-colors hover:bg-surface-overlay/50">
                    <td className="px-4 py-3 font-medium text-text-primary">{col.name}</td>
                    <td className="px-4 py-3 text-text-secondary">{col.tier}</td>
                    <td className="px-4 py-3 text-text-secondary">
                      {formatCurrency(col.price)}
                    </td>
                    <td className="px-4 py-3">
                      {latestVersion ? (
                        <Badge variant={statusVariant(latestVersion.status)}>
                          {latestVersion.status}
                        </Badge>
                      ) : (
                        <Badge variant="default">No version</Badge>
                      )}
                    </td>
                    <td className="px-4 py-3 text-text-secondary">
                      {latestVersion ? `v${latestVersion.version}` : '—'}
                    </td>
                    <td className="px-4 py-3 text-text-secondary">
                      {latestVersion != null ? (
                        <span
                          className={
                            latestVersion.stockRemaining === 0
                              ? 'text-red-400'
                              : latestVersion.stockRemaining <= 10
                                ? 'text-amber-400'
                                : 'text-text-primary'
                          }
                        >
                          {latestVersion.stockRemaining}
                        </span>
                      ) : (
                        '—'
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <Link
                        href={`/admin/mystery/${col.id}`}
                        className="rounded-lg border border-surface-border bg-surface-overlay px-2.5 py-1 text-xs font-medium text-text-secondary transition-colors hover:bg-surface-border hover:text-text-primary"
                      >
                        Manage
                      </Link>
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
