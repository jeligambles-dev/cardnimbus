'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { formatCurrency } from '@/lib/utils'
import type { OfferStatus } from '@prisma/client'

type BadgeVariant = 'default' | 'success' | 'warning' | 'danger' | 'nimbus'

const STATUS_MAP: Record<string, { variant: BadgeVariant; label: string }> = {
  PENDING:   { variant: 'warning',  label: 'Pending' },
  ACCEPTED:  { variant: 'success',  label: 'Accepted' },
  REJECTED:  { variant: 'danger',   label: 'Rejected' },
  COUNTERED: { variant: 'nimbus',   label: 'Countered' },
  EXPIRED:   { variant: 'default',  label: 'Expired' },
  CANCELLED: { variant: 'default',  label: 'Cancelled' },
}

interface Offer {
  id: string
  amount: number
  status: OfferStatus
  message: string | null
  createdAt: string
  listing: { id: string; title: string; price: number; images: string[] }
}

export function OffersList({ offers: initial }: { offers: Offer[] }) {
  const router = useRouter()
  const [offers, setOffers] = useState(initial)
  const [cancelling, setCancelling] = useState<string | null>(null)
  const [confirmCancel, setConfirmCancel] = useState<Offer | null>(null)

  async function handleCancel(offerId: string) {
    setConfirmCancel(null)
    setCancelling(offerId)
    try {
      const res = await fetch(`/api/offers/${offerId}/cancel`, { method: 'POST' })
      if (res.ok) {
        setOffers((prev) =>
          prev.map((o) => (o.id === offerId ? { ...o, status: 'CANCELLED' as OfferStatus } : o))
        )
        router.refresh()
      } else {
        const data = await res.json().catch(() => ({}))
        alert(data.error ?? 'Failed to cancel')
      }
    } finally {
      setCancelling(null)
    }
  }

  return (
    <>
    <ul className="space-y-3">
      {offers.map((offer) => {
        const cfg = STATUS_MAP[offer.status] ?? { variant: 'default' as BadgeVariant, label: offer.status }
        const listing = offer.listing
        const thumb = listing.images?.[0]
        const canCancel = offer.status === 'PENDING'
        const needsAction = offer.status === 'COUNTERED'

        return (
          <li key={offer.id} className="rounded-xl border border-surface-border bg-surface-raised p-4 transition-all hover:border-nimbus-500/40 hover:shadow-lg hover:shadow-nimbus-500/5">
            <Link href={`/marketplace/${listing.id}`} className="flex items-center gap-4">
              <div className="h-14 w-14 shrink-0 overflow-hidden rounded-lg border border-surface-border bg-white">
                {thumb ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={thumb} alt={listing.title} className="h-full w-full object-contain p-1" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-text-muted text-xs font-bold">CN</div>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <p className="truncate font-semibold text-text-primary">{listing.title}</p>
                <p className="text-xs text-text-muted mt-0.5">
                  Listed at {formatCurrency(listing.price)} · {new Date(offer.createdAt).toLocaleDateString()}
                </p>
              </div>

              <div className="flex flex-col items-end gap-1.5 shrink-0">
                <Badge variant={cfg.variant}>{cfg.label}</Badge>
                <span className="text-sm font-bold text-nimbus-600">
                  {formatCurrency(offer.amount)}
                </span>
                {needsAction && (
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-amber-600">
                    <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse" />
                    Review counter
                  </span>
                )}
              </div>
            </Link>

            {canCancel && (
              <div className="mt-3 pt-3 border-t border-surface-border flex justify-end">
                <button
                  type="button"
                  onClick={() => setConfirmCancel(offer)}
                  disabled={cancelling === offer.id}
                  className="text-xs font-bold text-red-600 hover:text-red-700 disabled:opacity-50 transition-colors"
                >
                  {cancelling === offer.id ? 'Cancelling…' : '✕ Cancel Offer'}
                </button>
              </div>
            )}
          </li>
        )
      })}
    </ul>

    {/* Cancel confirmation popup */}
    <AnimatePresence>
      {confirmCancel && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
          onClick={() => setConfirmCancel(null)}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-sm rounded-2xl border border-surface-border bg-white p-6 shadow-2xl text-center"
          >
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-red-100 text-red-600">
              <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-text-primary mb-1">Cancel this offer?</h3>
            <p className="text-sm text-text-muted mb-2">
              Your offer of <span className="font-bold text-nimbus-600">{formatCurrency(confirmCancel.amount)}</span> on
            </p>
            <p className="text-sm font-semibold text-text-primary truncate mb-5">
              &quot;{confirmCancel.listing.title}&quot;
            </p>
            <div className="flex gap-3">
              <Button
                variant="secondary"
                size="lg"
                className="flex-1"
                onClick={() => setConfirmCancel(null)}
              >
                Keep Offer
              </Button>
              <Button
                variant="danger"
                size="lg"
                className="flex-1"
                onClick={() => handleCancel(confirmCancel.id)}
                loading={cancelling === confirmCancel.id}
              >
                Cancel Offer
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
    </>
  )
}
