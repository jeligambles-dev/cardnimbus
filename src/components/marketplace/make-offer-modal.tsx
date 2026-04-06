'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Modal } from '@/components/ui/modal'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { formatCurrency } from '@/lib/utils'

interface MakeOfferModalProps {
  open: boolean
  onClose: () => void
  listingId: string
  listingTitle: string
  listingPrice: number
}

type Result = { type: 'success' | 'error'; amount: number; message: string } | null

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
  const [result, setResult] = useState<Result>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const numAmount = parseFloat(amount)
    if (!numAmount || numAmount <= 0) return

    setLoading(true)
    try {
      const res = await fetch(`/api/listings/${listingId}/offers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: numAmount, message: message || undefined }),
      })
      const data = await res.json()

      if (!res.ok) {
        setResult({
          type: 'error',
          amount: numAmount,
          message: data.error ?? 'Failed to place offer',
        })
      } else {
        setResult({
          type: 'success',
          amount: numAmount,
          message: 'Offer placed! The seller will respond shortly.',
        })
        setAmount('')
        setMessage('')
      }

      // Auto-close after 3 seconds
      setTimeout(() => {
        setResult(null)
        if (res.ok) onClose()
      }, 3000)
    } catch {
      setResult({
        type: 'error',
        amount: numAmount,
        message: 'Network error. Please try again.',
      })
      setTimeout(() => setResult(null), 3000)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal open={open} onClose={() => { setResult(null); onClose() }} title="Make an Offer">
      <AnimatePresence mode="wait">
        {result ? (
          <motion.div
            key="result"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="py-6 text-center"
          >
            <div
              className={`mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full ${
                result.type === 'success'
                  ? 'bg-emerald-100 text-emerald-600'
                  : 'bg-red-100 text-red-600'
              }`}
            >
              {result.type === 'success' ? (
                <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              )}
            </div>
            <p className={`text-lg font-bold ${result.type === 'success' ? 'text-emerald-700' : 'text-red-700'}`}>
              {result.type === 'success' ? 'Offer Placed!' : 'Offer Failed'}
            </p>
            <p className="text-3xl font-black text-text-primary mt-2">
              {formatCurrency(result.amount)}
            </p>
            <p className="text-sm text-text-muted mt-2">{result.message}</p>
            {/* Countdown bar */}
            <div className="mt-4 mx-auto w-32 h-1 rounded-full bg-surface-border overflow-hidden">
              <motion.div
                initial={{ width: '100%' }}
                animate={{ width: '0%' }}
                transition={{ duration: 3, ease: 'linear' }}
                className={result.type === 'success' ? 'h-full bg-emerald-500' : 'h-full bg-red-500'}
              />
            </div>
          </motion.div>
        ) : (
          <motion.form
            key="form"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onSubmit={handleSubmit}
            className="space-y-4"
          >
            <div>
              <p className="text-sm text-text-secondary line-clamp-1 mb-3">
                {listingTitle}
              </p>
              <p className="text-xs text-text-muted">
                Listed at <span className="font-semibold text-nimbus-600">{formatCurrency(listingPrice)}</span>
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
              <Button type="button" variant="secondary" onClick={onClose} className="flex-1">
                Cancel
              </Button>
              <Button type="submit" variant="primary" loading={loading} className="flex-1">
                Submit Offer
              </Button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>
    </Modal>
  )
}
