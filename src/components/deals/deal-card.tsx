import Link from 'next/link'
import { DealBadge } from './deal-badge'
import { formatCurrency } from '@/lib/utils'
import type { DealProduct } from '@/services/deal-score.service'

interface DealCardProps {
  deal: DealProduct
}

export function DealCard({ deal }: DealCardProps) {
  const thumb = deal.images[0]

  return (
    <Link
      href={`/shop/${deal.slug}`}
      className="group flex flex-col overflow-hidden rounded-xl border border-surface-border bg-surface-raised transition-all duration-200 hover:border-nimbus-500/40 hover:shadow-lg hover:shadow-nimbus-500/10 hover:-translate-y-0.5"
    >
      {/* Image */}
      <div className="relative aspect-[3/4] w-full overflow-hidden bg-surface-overlay">
        {thumb ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={thumb}
            alt={deal.name}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-text-muted">
            <svg className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.25}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
            </svg>
          </div>
        )}
        {/* Deal badge overlaid */}
        {deal.dealScoreBand && (
          <div className="absolute left-2 top-2">
            <DealBadge dealScoreBand={deal.dealScoreBand} dealScore={deal.dealScore} />
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex flex-1 flex-col gap-2 p-3">
        <p className="line-clamp-2 text-sm font-semibold text-text-primary leading-snug">{deal.name}</p>
        {deal.condition && (
          <p className="text-xs text-text-muted">{deal.condition}</p>
        )}
        <div className="mt-auto">
          <div className="flex items-baseline gap-2">
            <span className="text-base font-bold text-text-primary">{formatCurrency(deal.price)}</span>
            {deal.marketPrice > deal.price && (
              <span className="text-xs text-text-muted line-through">{formatCurrency(deal.marketPrice)}</span>
            )}
          </div>
          {deal.marketPrice > deal.price && (
            <p className="text-xs font-medium text-emerald-400">
              Save {formatCurrency(deal.marketPrice - deal.price)}
            </p>
          )}
        </div>
      </div>
    </Link>
  )
}
