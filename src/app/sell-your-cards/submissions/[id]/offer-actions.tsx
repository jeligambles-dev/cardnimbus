'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { toast } from '@/components/ui/toast'
import { formatCurrency } from '@/lib/utils'

interface OfferActionsProps {
  submissionId: string
  offeredPrice: number
}

export function OfferActions({ submissionId, offeredPrice }: OfferActionsProps) {
  const router = useRouter()
  const [loading, setLoading] = useState<'accept' | 'reject' | 'counter' | null>(null)
  const [counterValue, setCounterValue] = useState('')
  const [showCounter, setShowCounter] = useState(false)

  const respond = async (action: 'accept' | 'reject' | 'counter') => {
    if (action === 'counter' && !showCounter) {
      setShowCounter(true)
      return
    }

    setLoading(action)
    try {
      const body: Record<string, unknown> = { action }
      if (action === 'counter') {
        const v = parseFloat(counterValue)
        if (!v || v <= 0) { toast('Please enter a valid counter price.', 'error'); setLoading(null); return }
        body.counterPrice = v
      }

      const res = await fetch(`/api/submissions/${submissionId}/respond`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error ?? 'Action failed')
      }

      const messages = {
        accept: 'Offer accepted! Ship your cards using the instructions below.',
        reject: 'Offer declined.',
        counter: 'Counter offer sent!',
      }
      toast(messages[action], 'success')
      router.refresh()
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Action failed', 'error')
    } finally {
      setLoading(null)
    }
  }

  return (
    <div className="rounded-xl border border-nimbus-500/30 bg-nimbus-500/5 p-5 space-y-4">
      <div>
        <p className="text-sm font-medium text-text-secondary">Offer received</p>
        <p className="text-3xl font-extrabold text-nimbus-400">{formatCurrency(offeredPrice)}</p>
      </div>

      {showCounter ? (
        <div className="space-y-3">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-text-secondary">Your counter offer ($)</label>
            <input
              type="number"
              min="0.01"
              step="0.01"
              placeholder="0.00"
              value={counterValue}
              onChange={(e) => setCounterValue(e.target.value)}
              className="w-full rounded-xl border border-surface-border bg-surface-raised px-3 py-2 text-sm text-text-primary outline-none transition-colors focus:border-nimbus-500 focus:ring-2 focus:ring-nimbus-500/20"
            />
          </div>
          <div className="flex gap-2">
            <Button onClick={() => respond('counter')} loading={loading === 'counter'} size="sm">
              Send Counter
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setShowCounter(false)}>Cancel</Button>
          </div>
        </div>
      ) : (
        <div className="flex flex-wrap gap-2">
          <Button onClick={() => respond('accept')} loading={loading === 'accept'} size="sm">
            Accept Offer
          </Button>
          <Button variant="secondary" onClick={() => respond('counter')} size="sm">
            Counter Offer
          </Button>
          <Button variant="danger" onClick={() => respond('reject')} loading={loading === 'reject'} size="sm">
            Decline
          </Button>
        </div>
      )}
    </div>
  )
}
