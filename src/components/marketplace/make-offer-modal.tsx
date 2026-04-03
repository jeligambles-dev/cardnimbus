'use client'

import { useState } from 'react'
import { Modal } from '@/components/ui/modal'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { toast } from '@/components/ui/toast'
import { formatCurrency } from '@/lib/utils'

interface MakeOfferModalProps {
  open: boolean
  onClose: () => void
  listingId: string
  listingTitle: string
  listingPrice: number
}

export function MakeOfferModal({
  open,
  onClose,
  listingId,
  listingTitle,
  listingPrice,
}: MakeOfferModalProps) {
  const [amount, setAmount] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const numAmount = parseFloat(amount)
    if (!numAmount || numAmount <= 0) {
      toast('Please enter a valid offer amount', 'error')
      return
    }

    setLoading(true)
    try {
      const res = await fetch(`/api/listings/${listingId}/offers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: numAmount, message: message || undefined }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Failed to submit offer')
      toast('Offer submitted! The seller will respond shortly.', 'success')
      setAmount('')
      setMessage('')
      onClose()
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Failed to submit offer', 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="Make an Offer">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <p className="text-sm text-text-secondary line-clamp-1 mb-3">
            {listingTitle}
          </p>
          <p className="text-xs text-text-muted">
            Listed at <span className="font-semibold text-nimbus-400">{formatCurrency(listingPrice)}</span>
          </p>
        </div>

        <Input
          label="Your Offer Amount ($)"
          type="number"
          step="0.01"
          min="0.01"
          placeholder="e.g. 45.00"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          required
        />

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-text-secondary">
            Message (optional)
          </label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Add a note to your offer..."
            rows={3}
            className="w-full bg-surface-raised border border-surface-border rounded-xl px-3 py-2 text-sm text-text-primary placeholder-text-muted focus:border-nimbus-500 focus:ring-2 focus:ring-nimbus-500/20 outline-none resize-none"
          />
        </div>

        <div className="flex gap-3 pt-2">
          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            loading={loading}
            className="flex-1"
          >
            Submit Offer
          </Button>
        </div>
      </form>
    </Modal>
  )
}
