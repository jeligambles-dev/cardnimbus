import { getDeals } from '@/services/deal-score.service'
import { DealCard } from '@/components/deals/deal-card'

export const metadata = {
  title: 'Best Deals — Card Nimbus',
  description: 'Browse cards priced significantly below TCGPlayer market value.',
}

export const revalidate = 300 // 5-minute cache

export default async function DealsPage() {
  const { deals, total } = await getDeals(1, 60)

  return (
    <main className="min-h-screen bg-surface">
      {/* Header */}
      <section className="border-b border-surface-border bg-surface-raised">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <span className="text-2xl">🔥</span>
              <h1 className="text-2xl font-extrabold text-text-primary sm:text-3xl">Best Deals</h1>
            </div>
            <p className="text-text-secondary">
              Cards priced below TCGPlayer market value — sorted by biggest savings.
              {total > 0 && <span className="ml-1 text-text-muted">{total} deals available</span>}
            </p>
          </div>
        </div>
      </section>

      {/* Legend */}
      <div className="border-b border-surface-border bg-surface-overlay/50">
        <div className="mx-auto max-w-7xl px-4 py-3 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center gap-4 text-xs text-text-secondary">
            <span className="font-medium text-text-primary">Deal Tiers:</span>
            <span className="inline-flex items-center gap-1">
              <span className="rounded-full bg-red-950 border border-red-800 px-2 py-0.5 text-red-400 font-medium">🔥 FIRE</span>
              <span>30%+ below market</span>
            </span>
            <span className="inline-flex items-center gap-1">
              <span className="rounded-full bg-nimbus-50 border border-nimbus-300 px-2 py-0.5 text-nimbus-600 font-medium">🔥 GREAT</span>
              <span>20–30% below</span>
            </span>
            <span className="inline-flex items-center gap-1">
              <span className="rounded-full bg-emerald-950 border border-emerald-800 px-2 py-0.5 text-emerald-400 font-medium">🔥 GOOD</span>
              <span>10–20% below</span>
            </span>
          </div>
        </div>
      </div>

      {/* Grid */}
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {deals.length === 0 ? (
          <div className="flex flex-col items-center gap-4 py-24 text-center">
            <span className="text-5xl">🔍</span>
            <div>
              <p className="text-lg font-semibold text-text-primary">No deals right now</p>
              <p className="mt-1 text-sm text-text-secondary">
                Check back soon — deals update as prices change.
              </p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 md:gap-5">
            {deals.map((deal) => (
              <DealCard key={deal.id} deal={deal} />
            ))}
          </div>
        )}
      </div>
    </main>
  )
}
