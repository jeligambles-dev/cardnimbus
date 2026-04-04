import { db } from '@/lib/db'
import { requireAdmin } from '@/lib/auth-guard'
import { notFound } from 'next/navigation'
import { formatCurrency } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { MysteryCollectionStatus } from '@prisma/client'
import Link from 'next/link'
import { NewVersionForm } from './new-version-form'
import { ActivateVersionButton } from './activate-version-button'

type BadgeVariant = 'default' | 'success' | 'warning' | 'danger' | 'nimbus'

function statusVariant(status: MysteryCollectionStatus): BadgeVariant {
  switch (status) {
    case 'ACTIVE':
      return 'success'
    case 'LOW_STOCK':
      return 'warning'
    case 'SOLD_OUT':
      return 'danger'
    default:
      return 'default'
  }
}

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function AdminMysteryDetailPage({ params }: PageProps) {
  await requireAdmin()

  const { id } = await params

  const collection = await db.mysteryCollection.findUnique({
    where: { id },
    include: {
      versions: {
        orderBy: { version: 'desc' },
        include: {
          poolItems: {
            orderBy: [{ tierName: 'asc' }, { weight: 'desc' }],
          },
        },
      },
    },
  })

  if (!collection) notFound()

  const currentVersion = collection.versions.find(
    (v) => v.id === collection.currentVersionId
  ) ?? collection.versions[0] ?? null

  const pullRates = currentVersion
    ? (currentVersion.pullRates as Array<{ tierName: string; chance: number }>)
    : []

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3">
            <Link
              href="/admin/mystery"
              className="text-sm text-text-muted hover:text-nimbus-600"
            >
              ← Back
            </Link>
            <h1 className="text-2xl font-bold text-text-primary">{collection.name}</h1>
            <Badge variant={collection.isActive ? 'success' : 'default'}>
              {collection.isActive ? 'Active' : 'Inactive'}
            </Badge>
          </div>
          <p className="mt-1 text-sm text-text-secondary">
            Tier: <span className="text-text-primary">{collection.tier}</span> &bull; Price:{' '}
            <span className="text-text-primary">{formatCurrency(collection.price)}</span>
          </p>
        </div>
      </div>

      {/* Current Version Info */}
      {currentVersion && (
        <div className="rounded-xl border border-surface-border bg-surface-raised p-5">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <h2 className="text-lg font-semibold text-text-primary">
                Current Version: v{currentVersion.version}
              </h2>
              <Badge variant={statusVariant(currentVersion.status)}>
                {currentVersion.status}
              </Badge>
            </div>
            <div className="flex items-center gap-3">
              <p className="text-sm text-text-secondary">
                Stock:{' '}
                <span
                  className={
                    currentVersion.stockRemaining === 0
                      ? 'font-medium text-red-400'
                      : currentVersion.stockRemaining <= 10
                        ? 'font-medium text-amber-400'
                        : 'font-medium text-text-primary'
                  }
                >
                  {currentVersion.stockRemaining}
                </span>
              </p>
              <p className="text-sm text-text-secondary">
                Min Value:{' '}
                <span className="font-medium text-text-primary">
                  {formatCurrency(currentVersion.guaranteedMinValue)}
                </span>
              </p>
            </div>
          </div>

          {/* Pull Rates */}
          {pullRates.length > 0 && (
            <div className="mb-4">
              <h3 className="mb-2 text-sm font-medium text-text-secondary">Pull Rates</h3>
              <div className="flex flex-wrap gap-2">
                {pullRates.map((rate) => (
                  <div
                    key={rate.tierName}
                    className="rounded-lg border border-surface-border bg-surface-overlay px-3 py-1.5 text-sm"
                  >
                    <span className="font-medium text-text-primary">{rate.tierName}</span>
                    <span className="ml-2 text-nimbus-600">
                      {(rate.chance * 100).toFixed(1)}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Pool Items Table */}
          {currentVersion.poolItems.length > 0 && (
            <div>
              <h3 className="mb-2 text-sm font-medium text-text-secondary">Pool Items</h3>
              <div className="overflow-hidden rounded-lg border border-surface-border">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-surface-border bg-surface-overlay">
                      <th className="px-3 py-2 text-left font-medium text-text-secondary">Tier</th>
                      <th className="px-3 py-2 text-left font-medium text-text-secondary">Item ID</th>
                      <th className="px-3 py-2 text-left font-medium text-text-secondary">Weight</th>
                      <th className="px-3 py-2 text-left font-medium text-text-secondary">Quantity</th>
                      <th className="px-3 py-2 text-left font-medium text-text-secondary">Locked Value</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-surface-border">
                    {currentVersion.poolItems.map((item) => (
                      <tr key={item.id} className="hover:bg-surface-overlay/50">
                        <td className="px-3 py-2">
                          <Badge variant="nimbus" size="sm">{item.tierName}</Badge>
                        </td>
                        <td className="px-3 py-2 font-mono text-xs text-text-muted">
                          {item.productId ?? item.cardId ?? '—'}
                        </td>
                        <td className="px-3 py-2 text-text-secondary">{item.weight}</td>
                        <td className="px-3 py-2">
                          <span
                            className={
                              item.quantity === 0
                                ? 'text-red-400'
                                : item.quantity <= 5
                                  ? 'text-amber-400'
                                  : 'text-text-primary'
                            }
                          >
                            {item.quantity}
                          </span>
                        </td>
                        <td className="px-3 py-2 text-text-secondary">
                          {formatCurrency(item.lockedValue)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Activate button for draft versions */}
          {currentVersion.status === 'DRAFT' && (
            <div className="mt-4">
              <ActivateVersionButton versionId={currentVersion.id} />
            </div>
          )}
        </div>
      )}

      {/* All Versions */}
      {collection.versions.length > 1 && (
        <div className="rounded-xl border border-surface-border bg-surface-raised p-5">
          <h2 className="mb-4 text-lg font-semibold text-text-primary">All Versions</h2>
          <div className="space-y-2">
            {collection.versions.map((v) => (
              <div
                key={v.id}
                className="flex items-center justify-between rounded-lg border border-surface-border bg-surface-overlay px-4 py-3"
              >
                <div className="flex items-center gap-3">
                  <span className="font-medium text-text-primary">v{v.version}</span>
                  <Badge variant={statusVariant(v.status)}>{v.status}</Badge>
                  {v.id === collection.currentVersionId && (
                    <Badge variant="nimbus">Current</Badge>
                  )}
                </div>
                <div className="flex items-center gap-4 text-sm text-text-secondary">
                  <span>Stock: {v.stockRemaining}</span>
                  <span>Items: {v.poolItems.length}</span>
                  {v.status === 'DRAFT' && (
                    <ActivateVersionButton versionId={v.id} />
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Create New Version Form */}
      <div className="rounded-xl border border-surface-border bg-surface-raised p-5">
        <h2 className="mb-4 text-lg font-semibold text-text-primary">Create New Version</h2>
        <NewVersionForm collectionId={collection.id} />
      </div>
    </div>
  )
}
