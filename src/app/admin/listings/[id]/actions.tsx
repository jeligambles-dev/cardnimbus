'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { ListingModerationStatus } from '@prisma/client'

interface Props {
  listingId: string
  moderationStatus: ListingModerationStatus
}

export function ListingAdminActions({ listingId, moderationStatus }: Props) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [loading, setLoading] = useState<string | null>(null)
  const [note, setNote] = useState('')
  const [showNote, setShowNote] = useState(false)

  async function doAction(action: 'approve' | 'reject' | 'suspend') {
    setLoading(action)
    try {
      const res = await fetch(`/api/admin/listings/${listingId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, reason: note.trim() || undefined }),
      })
      if (res.ok) {
        setNote('')
        setShowNote(false)
        startTransition(() => router.refresh())
      } else {
        const data = await res.json().catch(() => ({}))
        alert(`Failed: ${data.error ?? 'Unknown error'}`)
      }
    } finally {
      setLoading(null)
    }
  }

  const isProcessing = !!loading || pending
  const canApprove = moderationStatus === 'PENDING_REVIEW' || moderationStatus === 'REJECTED' || moderationStatus === 'SUSPENDED'
  const canReject = moderationStatus === 'PENDING_REVIEW' || moderationStatus === 'APPROVED'
  const canSuspend = moderationStatus === 'APPROVED'

  if (!canApprove && !canReject && !canSuspend) return null

  return (
    <div className="rounded-xl border border-surface-border bg-surface-raised p-4 space-y-3">
      <p className="text-xs font-bold text-text-muted uppercase tracking-wider">Moderation Actions</p>

      {showNote && (
        <div className="flex flex-col gap-1.5">
          <label className="text-sm text-text-secondary">Note (optional)</label>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Add a reason or note..."
            rows={2}
            className="w-full rounded-lg border border-surface-border bg-white px-3 py-2 text-sm text-text-primary outline-none resize-none focus:border-nimbus-500 focus:ring-2 focus:ring-nimbus-500/20"
          />
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        {canApprove && (
          <Button
            size="sm"
            onClick={() => { if (!showNote) setShowNote(true); else doAction('approve') }}
            disabled={isProcessing}
            className="bg-emerald-600 hover:bg-emerald-500 text-white"
          >
            {loading === 'approve' ? 'Approving…' : '✅ Approve'}
          </Button>
        )}
        {canReject && (
          <Button
            variant="danger"
            size="sm"
            onClick={() => { if (!showNote) setShowNote(true); else doAction('reject') }}
            disabled={isProcessing}
          >
            {loading === 'reject' ? 'Rejecting…' : '❌ Reject'}
          </Button>
        )}
        {canSuspend && (
          <Button
            variant="secondary"
            size="sm"
            onClick={() => { if (!showNote) setShowNote(true); else doAction('suspend') }}
            disabled={isProcessing}
          >
            {loading === 'suspend' ? 'Suspending…' : '🚫 Suspend'}
          </Button>
        )}
        {showNote && (
          <Button variant="ghost" size="sm" onClick={() => setShowNote(false)} disabled={isProcessing}>
            Cancel
          </Button>
        )}
      </div>
    </div>
  )
}
